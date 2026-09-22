# 0003 · Teaching has to come before testing, visibly

**Date:** 2026-09-22
**Source:** Anand, unprompted, after opening the course: *"Review the course as it looks
like I am giving the quiz without learning about the material/DSA techniques."*

## What happened

The course was structurally test-first, not just test-heavy:

1. Every legacy topic sits at `unverified`. `srs.py frontier_items` only returned topics
   whose prerequisites were all `mastered`, so the "learn next" list was **empty** and the
   only actionable item on the dashboard was *take a placement quiz*.
2. A lesson page opened with the placement quiz, then an auto-running prerequisite
   warm-up, and only then step 1 — with steps 2..n locked and the end-of-topic quiz
   locked behind all of them.

So the honest description of the first ten minutes was: three quizzes, one explanation.
That is a faithful reading of *diagnose before you teach*, and it is still wrong, because
placement is meant to save time on material he already knows, not to be the front door.

## What changed

Gating removed, scoring kept. All steps expanded on arrival; placement and warm-up folded
into skippable `<details>`; a missed step says "not solid yet, reread this" instead of
stopping the lesson; the quiz is always available; the frontier became a suggested order.

## How to apply

- When adding anything to this course, ask what the first screen asks him to *do*. If the
  answer is "answer a question about something he has not been taught here", reorder it.
- Mastery learning is about what you *teach next*, not about what you are *allowed to
  read*. Keep the strictness in the grading, never in the locks.
- He will not report this as a bug ("the gate is wrong"); he reports it as a feeling
  ("this feels like a test"). Take that class of feedback structurally.
