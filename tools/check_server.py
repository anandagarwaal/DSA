#!/usr/bin/env python3
"""Smoke-test tools/serve.py against a throwaway copy of the course.

    python3 tools/check_server.py

Checks that pages and the API respond, that missing files give a clean 404 (a browser
asks for /favicon.ico on every page), that bad API input gives 400, and that the server
logs no tracebacks. Never touches the real progress.json.
"""
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = 8791


def get(path):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{PORT}{path}", timeout=5) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def post(path, payload):
    req = urllib.request.Request(f"http://127.0.0.1:{PORT}{path}", method="POST",
                                 data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def main():
    tmp = Path(tempfile.mkdtemp(prefix="dsa-server-"))
    work = tmp / "course"
    shutil.copytree(ROOT, work, ignore=shutil.ignore_patterns(".git"))
    log = open(tmp / "server.log", "w+")
    proc = subprocess.Popen([sys.executable, "tools/serve.py", "--port", str(PORT)],
                            cwd=work, stdout=log, stderr=subprocess.STDOUT)
    failures = []
    try:
        for _ in range(50):
            time.sleep(0.1)
            try:
                if get("/index.html")[0] == 200:
                    break
            except Exception:
                continue
        else:
            failures.append("server never came up")

        graph = json.loads((work / "knowledge-graph.json").read_text())
        first = graph["topics"][0]["id"]
        checks = [
            ("/index.html", 200), ("/review.html", 200), ("/section.html?m=F1", 200),
            ("/content/graph.js", 200), (f"/content/{first}.js", 200),
            ("/assets/engine.js", 200), ("/api/state", 200),
            ("/favicon.ico", 404), ("/nope/missing.js", 404),
        ]
        for path, want in checks:
            got = get(path)[0]
            if got != want:
                failures.append(f"GET {path}: expected {want}, got {got}")

        state = json.loads(get("/api/state")[1])
        for key in ("today", "progress", "due", "ready", "diagnose"):
            if key not in state:
                failures.append(f"/api/state missing '{key}'")

        for payload, want in [({"topic": "NOPE", "kind": "learn", "result": "pass"}, 400),
                              ({"topic": first, "kind": "bogus", "result": "pass"}, 400),
                              ({"topic": first, "kind": "review", "result": "maybe"}, 400),
                              ({"topic": first, "kind": "diagnose", "result": "pass"}, 200)]:
            code, _ = post("/api/record", payload)
            if code != want:
                failures.append(f"POST /api/record {payload}: expected {want}, got {code}")

        after = json.loads(get("/api/state")[1])
        if after["progress"][first]["status"] != "mastered":
            failures.append("a recorded diagnose pass was not persisted")
    finally:
        proc.terminate()
        proc.wait(timeout=5)
        log.flush()
        log.seek(0)
        output = log.read()
        log.close()

    if "Traceback" in output:
        failures.append("server logged a traceback:\n" + output[:1500])
    shutil.rmtree(tmp, ignore_errors=True)

    if failures:
        print("\n".join("FAIL " + f for f in failures))
        sys.exit(1)
    print("server ok: pages, api, 404s and bad input all behave; no tracebacks")


if __name__ == "__main__":
    main()
