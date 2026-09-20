# Placement probe: states the rule, can't produce the argument

Probe run 2026-09-17 against the old course (which listed all 36 lessons as done).

| Area | Result | Evidence |
|---|---|---|
| Hash table internals (F11) | partial | Had bounded vs unbounded key range; missed boxing, cache locality, and the sparsity criterion for array-vs-map |
| Amortized analysis (F04) | weak | "Once we have doubled, the next N additions are O(1)": restates the claim, no cost accounting, no engagement with why +k growth fails |
| Two-pointer correctness (F09) | weak | "The only way to decrease the sum is to move hi down": the move, not the proof that the discarded pairs can't be the answer |
| Binary search on answer (F13) | solid | Explained monotonicity correctly |
| DP vs greedy (P16) | none | |

**Implications for teaching:**
- The gap is justification, not procedure. Never accept a restatement of a claim as an
  explanation. Ask "what goes wrong if you did the opposite? Prove it."
- Foundations (amortized cost, the elimination argument, invariants) come before the
  pattern curriculum resumes, because the patterns' correctness rests on them.
- These results are seeded into `progress.json` (dated 2026-09-17). Everything else is
  `unverified` and gets placed by the diagnostic before any teaching.
