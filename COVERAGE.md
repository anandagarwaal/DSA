# Coverage: CSES, CP-31 and USACO Guide

What this course covers of the three external problem sets, and what it deliberately
does not. Scope decision (2026-09-21): **interview-first**. Topics that are CP-only and
essentially never asked at Google/Meta are excluded on purpose, not forgotten.

Course topics: 16 foundations (F01–F16) + 34 patterns (P01–P34).

## CSES problem set (~400 problems, 18 sections)

| CSES section | Covered by | Status |
|---|---|---|
| Introductory Problems | F01–F14, P11 | mostly: ad-hoc/constructive problems have no single topic |
| Sorting and Searching | P02, P03, P04, P05, P06, P17, P19 | full |
| Dynamic Programming | P16, P24, P25, P28 | full |
| Graph Algorithms | P12, P13, P14, P15, P26, P27 | most; **not** max flow, 2-SAT, Euler paths |
| Range Queries | P18, P20, P21 | full for sums/min/max; **not** Mo's algorithm, persistent trees |
| Tree Algorithms | P09, P22, P23 | most; **not** centroid decomposition, HLD, small-to-large |
| Mathematics | P28, P29, P33 | basics; **not** CRT, Möbius, matrices beyond recurrences, game theory (Nim/Grundy) |
| String Algorithms | P30, P31, P32 | hashing/KMP/Z/tries; **not** suffix arrays or automata, Aho–Corasick, Manacher |
| Geometry | — | **excluded** |
| Advanced Techniques | P24, P34 | bitmask DP and meet in the middle only |
| Sliding Window | P04, P19 | full |
| Bitwise Operations | P24, P32 | basics; **not** SOS DP or XOR-basis |
| Counting Problems | P28, F14 | combinatorics basics only |
| Advanced Graph Problems | — | **excluded** (SCC, bridges, MST variants beyond the basics) |
| Interactive / Construction | — | **excluded** (no interview analogue) |
| Additional Problems I / II | mixed | partial by construction |

## CP-31 sheet (31 problems per Codeforces rating, 800–1900)

The sheet is organised by rating, not topic. The techniques it drills at 800–1600 are
covered here: greedy and sorting (P17), two pointers (P02, P03), prefix sums (P18),
binary search on the answer (P06), maps and sets (P01), basic graphs (P12, P13),
standard DP (P16), number theory basics (P28, P29), and bit manipulation (P24).

At 1700–1900 the sheet leans on constructive ad-hoc reasoning, which no topic list
teaches directly: that comes from volume, not from lessons.

The exact problem list needs a logged-in session on tle-eliminators.com, so it is not
reproduced here.

## USACO Guide

- **Bronze**: covered (simulation, complete search, sorting, greedy).
- **Silver**: covered (prefix sums, two pointers, binary search, DFS/BFS, flood fill,
  sorting with custom comparators, basic DP).
- **Gold**: mostly covered (DP variants, trees with binary lifting/LCA, shortest paths,
  MST, union-find, range queries with BIT/segment trees). **Not** covered: Euler tours
  for path queries, topological-sort DP variants beyond the basics.
- **Platinum / Advanced**: **excluded** (segment tree beats, HLD, centroid decomposition,
  convex hull trick, flows, advanced strings).

## Deliberately excluded, and why

Max flow / min cut, bipartite matching, SCC (Tarjan/Kosaraju), bridges and articulation
points, 2-SAT, Euler paths, HLD, centroid decomposition, Mo's algorithm, sqrt
decomposition, persistent structures, suffix arrays/automata, Aho–Corasick, Manacher,
FFT, CRT, Möbius, game theory (Nim/Grundy), computational geometry, DP optimisations
(convex hull trick, divide-and-conquer, Knuth), digit DP.

These are standard in competitive programming and essentially absent from Google/Meta
interview loops. See `MISSION.md`. If the goal changes to competitive programming, this
is the list to work through, and it roughly doubles the size of the course.

## How to use the course with these sets

1. Learn a topic here until its quiz passes.
2. Solve that topic's **Suggested problems**, at the bottom of its lesson page: 3–9
   problems drawn from the two sets above, easiest first, with no solutions attached
   (curated in `tools/build_problems.py`, 264 problems across the 50 topics).
3. Then drill the wider CSES section or CP-31 rating band for volume.
4. Bring anything you cannot solve back here: if the gap is conceptual, the topic's
   prerequisites in `knowledge-graph.json` will point at what to revisit.
