#!/usr/bin/env python3
"""Spaced-repetition scheduler for the DSA course (Math Academy-style, simplified).

State lives in two files at the repo root:
  knowledge-graph.json  static: topics, prerequisites, key prerequisites, encompassings
  progress.json         dynamic: per-topic status, repetitions, learning speed, due date

Commands (all accept --date YYYY-MM-DD to override "today"):
  due        reviews due now, compressed: a due topic that encompasses other due
             topics is listed once and covers them
  frontier   topics ready to learn (every prerequisite mastered) + topics awaiting diagnosis
  status     every topic with status, reps, speed, next due
  learn ID          topic passed its lesson + end-of-topic quiz -> first repetition
  review ID pass|fail [--note TEXT]   record an explicit review / quiz result
  diagnose ID pass|fail [--note TEXT] record a placement-probe result

Model (see CLAUDE.md for the teaching rules that use it):
  * Interval after r repetitions = INTERVALS[r] days (expanding schedule).
  * A pass adds `speed` repetitions, scaled down if the review came early
    (an early repetition does not count for full credit).
  * A fail moves the topic back 2 repetitions, slows its speed, and makes its
    key prerequisites due today (targeted remediation).
  * FIRe: a pass on topic T trickles fractional credit down to topics T encompasses,
    multiplied by the edge weight, recursively. Topics with speed < 1 get NO implicit
    credit - they must be reviewed explicitly.
"""
import argparse
import json
import math
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH = ROOT / "knowledge-graph.json"
PROGRESS = ROOT / "progress.json"

INTERVALS = [1, 3, 7, 14, 30, 60, 120, 240]  # days until next review after r reps
MIN_SPEED, MAX_SPEED = 0.5, 2.0
MIN_TRICKLE = 0.1  # stop propagating implicit credit below this weight


def load():
    graph = json.loads(GRAPH.read_text())
    progress = json.loads(PROGRESS.read_text())
    topics = {t["id"]: t for t in graph["topics"]}
    for tid in topics:
        progress["topics"].setdefault(tid, {"status": "not_started"})
    return graph, topics, progress


def save(progress):
    PROGRESS.write_text(json.dumps(progress, indent=2, sort_keys=False) + "\n")


def interval(reps):
    return INTERVALS[min(max(int(math.floor(reps)), 0), len(INTERVALS) - 1)]


def d(s):
    return date.fromisoformat(s)


def schedule(p, today):
    p["last"] = today.isoformat()
    p["next"] = (today + timedelta(days=interval(p["reps"]))).isoformat()


def timeliness(p, today):
    """Fraction of the current interval that has elapsed, capped at 1."""
    if not p.get("last"):
        return 1.0
    elapsed = (today - d(p["last"])).days
    return min(1.0, elapsed / interval(p["reps"]))


def log(p, today, kind, result, note=None):
    entry = {"date": today.isoformat(), "kind": kind, "result": result}
    if note:
        entry["note"] = note
    p.setdefault("history", []).append(entry)


def trickle(topics, progress, tid, weight, today, seen):
    for child, w in topics[tid].get("encompasses", {}).items():
        cw = weight * w
        cp = progress["topics"][child]
        if cw < MIN_TRICKLE or child in seen or cp.get("status") != "mastered":
            continue
        seen.add(child)
        if cp["speed"] < 1.0:
            continue  # struggling topic: explicit reviews only
        credit = cw * timeliness(cp, today)
        if credit > 0:
            cp["reps"] = round(cp["reps"] + credit, 3)
            schedule(cp, today)
            log(cp, today, "implicit", f"+{credit:.2f}", f"via {tid}")
        trickle(topics, progress, child, cw, today, seen)


def record(topics, progress, tid, passed, today, kind, note):
    p = progress["topics"][tid]
    if passed:
        if p.get("status") == "mastered" and kind == "review":
            credit = p["speed"] * timeliness(p, today)
            p["speed"] = round(min(MAX_SPEED, p["speed"] * 1.1), 3)
        elif p.get("status") == "remediate":
            credit = p["speed"]  # recovered after remediation: keep the reduced reps
        else:  # first mastery (lesson or diagnostic pass)
            p.setdefault("speed", 1.0)
            credit = p["speed"]
            p["reps"] = 0
        p["reps"] = round(p["reps"] + credit, 3)
        p["status"] = "mastered"
        p["fails_in_row"] = 0
        schedule(p, today)
        log(p, today, kind, "pass", note)
        trickle(topics, progress, tid, 1.0, today, {tid})
    else:
        p["status"] = "remediate" if p.get("status") == "mastered" else "learning"
        p["speed"] = round(max(MIN_SPEED, p.get("speed", 1.0) * 0.8), 3)
        p["reps"] = max(0, p.get("reps", 0) - 2)
        p["fails_in_row"] = p.get("fails_in_row", 0) + 1
        p["last"] = today.isoformat()
        p["next"] = today.isoformat()
        log(p, today, kind, "fail", note)
        for kp in topics[tid].get("key_prereqs", []):
            kpp = progress["topics"][kp]
            if kpp.get("status") == "mastered":
                kpp["next"] = today.isoformat()
                log(kpp, today, "remedial-flag", "due", f"key prereq of failed {tid}")


def due_items(topics, progress, today):
    """Due reviews, most overdue first, compressed via encompassings."""
    due = [tid for tid, p in progress["topics"].items()
           if p.get("status") in ("mastered", "remediate") and p.get("next") and d(p["next"]) <= today]
    covered = {}
    for tid in due:
        tp = progress["topics"][tid]
        if tp["status"] != "mastered" or tp.get("speed", 1) < 1:
            continue  # a struggling topic cannot stand in for anything; it only covers itself
        for child in _descendants(topics, tid):
            if child in due and child != tid and progress["topics"][child].get("speed", 1) >= 1:
                covered.setdefault(tid, []).append(child)
    knocked = {c for cs in covered.values() for c in cs}
    order = sorted((t for t in due if t not in knocked), key=lambda t: progress["topics"][t]["next"])
    return [{"id": t, "title": topics[t]["title"], "due": progress["topics"][t]["next"],
             "speed": progress["topics"][t]["speed"],
             "remediate": progress["topics"][t]["status"] == "remediate",
             "covers": covered.get(t, [])} for t in order]


def frontier_items(graph, progress):
    """(suggested next topics, worth placing out of, count of other unverified topics).

    Advice about order, not a gate. Since 2026-09-22 no lesson is locked, so every
    topic that is not yet mastered can be opened and read today; the ones whose
    prerequisites are all mastered simply come first in the list. The old version
    returned only topics with every prerequisite mastered, which on a fresh course
    (everything "unverified") was empty -- the dashboard then had nothing to offer
    but placement quizzes, and the course looked like a test with no teaching.
    """
    st = {t["id"]: progress["topics"][t["id"]].get("status") for t in graph["topics"]}

    def unlocked(t):
        return all(st[p] == "mastered" for p in t.get("prereqs", []))

    todo = [t for t in graph["topics"] if st[t["id"]] != "mastered"]
    ready = [t["id"] for t in todo if unlocked(t)] + [t["id"] for t in todo if not unlocked(t)]
    # Placement is only worth offering where the course already believes he knows it.
    probe = [t["id"] for t in graph["topics"] if st[t["id"]] == "unverified" and unlocked(t)]
    unverified = [t["id"] for t in graph["topics"] if st[t["id"]] == "unverified"]
    return ready, probe, len(unverified) - len(probe)


def cmd_due(graph, topics, progress, today):
    items = due_items(topics, progress, today)
    if not items:
        print("No reviews due.")
        return
    print(f"Reviews due on {today} (most overdue first):")
    for it in items:
        extra = f"  [also covers {', '.join(it['covers'])}]" if it["covers"] else ""
        tag = " REMEDIATE" if it["remediate"] else ""
        print(f"  {it['id']:4} {it['title']}  (due {it['due']}, speed {it['speed']}){tag}{extra}")


def _descendants(topics, tid, seen=None):
    seen = seen if seen is not None else set()
    for child, w in topics[tid].get("encompasses", {}).items():
        if w >= 0.5 and child not in seen:
            seen.add(child)
            _descendants(topics, child, seen)
    return seen


def cmd_frontier(graph, topics, progress, today):
    ready, probe, above = frontier_items(graph, progress)
    print("Learn next (prerequisites mastered first; nothing is locked):")
    for tid in ready[:8]:
        print(f"  {tid:4} {topics[tid]['title']}  [{progress['topics'][tid]['status']}]")
    if len(ready) > 8:
        print(f"  ...{len(ready) - 8} more topics not yet mastered.")
    if probe:
        print("\nWorth a placement quiz first (marked known, never verified):")
        for tid in probe:
            print(f"  {tid:4} {topics[tid]['title']}")
        if above:
            print(f"  ...{above} more unverified topics sit above these.")


def cmd_status(graph, topics, progress, today):
    for m in graph["modules"]:
        print(f"\n{m['id']} {m['title']}")
        for t in graph["topics"]:
            if t["module"] != m["id"]:
                continue
            p = progress["topics"][t["id"]]
            print(f"  {t['id']:4} {p.get('status',''):11} reps={p.get('reps','-'):<6} "
                  f"speed={p.get('speed','-'):<5} next={p.get('next','-'):10}  {t['title']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["due", "frontier", "status", "learn", "review", "diagnose"])
    ap.add_argument("topic", nargs="?")
    ap.add_argument("result", nargs="?", choices=["pass", "fail"])
    ap.add_argument("--date", default=None)
    ap.add_argument("--note", default=None)
    a = ap.parse_args()
    today = d(a.date) if a.date else date.today()
    graph, topics, progress = load()

    if a.cmd in ("due", "frontier", "status"):
        {"due": cmd_due, "frontier": cmd_frontier, "status": cmd_status}[a.cmd](graph, topics, progress, today)
        return
    if a.topic not in topics:
        sys.exit(f"unknown topic {a.topic!r}")
    if a.cmd == "learn":
        record(topics, progress, a.topic, True, today, "lesson", a.note)
    else:
        if not a.result:
            sys.exit("need pass|fail")
        record(topics, progress, a.topic, a.result == "pass", today, a.cmd, a.note)
    save(progress)
    p = progress["topics"][a.topic]
    print(f"{a.topic}: {p['status']}, reps={p['reps']}, speed={p['speed']}, next={p['next']}")
    if a.result == "fail":
        kps = topics[a.topic].get("key_prereqs", [])
        if kps:
            print(f"Remediate key prerequisites before re-attempting: {', '.join(kps)}")


if __name__ == "__main__":
    main()
