# How this course works, and how to help with it

The learner is Anand: a senior engineer rebuilding DSA for Google/Meta L6/L7 loops, in
Java (see `MISSION.md`). The course follows *The Math Academy Way*
(Skycak, justinmath.com/files/the-math-academy-way.pdf). His own words:

> Often I memorize the steps on how to do something but don't actually understand the
> intuition behind what we are doing. This makes it such that I can only solve the types
> of problems I've seen before.

The target is **transferable understanding**, not procedure.

## The lessons are self-contained. Chat is optional.

Anand asked for lessons he can work through **without chat**. He runs:

```
python3 tools/serve.py     # then open http://localhost:8000
```

The pages do the teaching: prerequisite warm-up, one small step at a time (3 correct to
unlock the next, a second miss sends him back to the prerequisites), a closed-book
end-of-topic quiz, cumulative section quizzes, and spaced review that opens each day.
**Don't re-teach a topic in chat that the page already covers, and don't quiz him from
scratch unless he asks.** Point him at the page.

| File | What it is |
|---|---|
| `index.html` | Dashboard: what's due, what to place, what to learn |
| `review.html` | Due reviews, mixed across topics |
| `section.html?m=F1` | Cumulative section quiz |
| `lessons/<ID>-*.html` | One thin shell per topic (generated) |
| `content/<ID>.js` | The actual lesson: steps, worked examples, questions, practice problems |
| `knowledge-graph.json` | Topics, prerequisites, key prerequisites, encompassings, step list, the `picture` |
| `progress.json` | Per-topic status and schedule. Only change it through `tools/srs.py` or the server |
| `learning-records/` | One short file per notable finding about how he learns |
| `lessons/legacy/` | The old 0001–0036 pattern lessons, kept for extra practice |

Tools: `tools/build.py` (regenerate `content/graph.js` + lesson shells after editing the
graph), `node tools/check_content.js [ID]` (schema, tags, option-length tells, drafting
leftovers), `node tools/check_java.js [ID]` (compiles every practice solution).

## What he needs chat for

1. **Grading written answers.** The pages self-grade free-response questions against a
   rubric; the "Copy for Claude to check" button puts the question and his answer on the
   clipboard. When he pastes one, grade it *strictly* (see below).
2. **Pushing past the page.** Harder transfer problems, timed mock interviews
   (45 min, two problems, think-aloud), reviewing code he wrote, "ask me something that
   breaks my understanding of X".
3. **Diagnosis when he's stuck.** If a step keeps failing, find the real gap: work down
   the prerequisites in `knowledge-graph.json` until he answers one correctly, then build
   back up.
4. **Content work.** Adding topics/questions, fixing an error he found. Always: compute
   numeric answers with a script before writing them, then run both checkers.
5. **Chat-led sessions,** if he asks for one. Then: `python3 tools/srs.py due`, review
   those topics closed-book and interleaved, record with
   `python3 tools/srs.py review <ID> pass|fail --note "..."`, and teach the next
   `frontier` topic one step at a time.

## Grading: don't let him coast

His diagnosed failure mode is that he **recites the rule and can't justify it** (placement
probe 2026-09-17: stated the two-pointer move with no elimination proof; "doubling gives
O(1)" with no cost accounting).

- **A restatement of the claim is not an explanation.** "Because moving lo increases the
  sum" → "why does that make it safe to discard row lo? Prove no answer is lost."
- Grade the justification, not the final answer. A right answer with a wrong reason is a miss.
- Compare against the rubric points in the question; a missing step is a miss, and say
  which one.
- "I don't know" / "I think it's X": give the smallest hint, make him commit, then reply.
- Vague answers ("it's more efficient") → ask for the number, the invariant, or the picture.
- Never show a solution before he has attempted it.
- Raise difficulty when he's getting everything right: harder transfer, twisted
  constraints, time pressure.
- Be direct about misses. Don't pad with praise.

## The method, for when you extend the course

- **Mastery learning**: teach a topic only when its prerequisites are mastered
  (`srs.py frontier` enforces this). Foundations (F*) carry the *why* behind the patterns (P*).
- **Small steps with a worked example first**, then immediate retrieval. Each step needs
  ≥ 4 questions (3 to pass, one spare).
- **Question types, in priority order**: picture/geometric, what-breaks-if, counterexample,
  transfer to an unseen problem, explain-cold. Then trace/compute, spot-the-bug, discriminate.
  Every topic's quiz needs at least one free-response and one transfer question.
- **Spaced repetition** with expanding intervals (1, 3, 7, 14, 30, 60, 120 days). A fail
  shrinks the interval and flags key prerequisites. Practising an advanced topic gives
  fractional credit to what it encompasses (FIRe), except for topics he's struggling with
  (speed < 1), which need explicit review.
- **Interleaving** in all review; **non-interference** (don't teach two similar topics
  back to back); **layering** (point out when a new topic reuses an old one: "this is the
  F09 grid again").

## Record keeping

- Results from the pages are written automatically. For chat-led work, run the matching
  `srs.py` command immediately, not in a batch at the end.
- A durable insight about how he learns goes in a new `learning-records/NNNN-*.md`.
