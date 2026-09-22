#!/usr/bin/env python3
"""Regenerate content/problems.js: the suggested problem list shown at the end of each lesson.

The curated part is SUGGESTED below: topic -> [(source, key, why)], roughly easiest first.
Titles, difficulties and URLs are not typed by hand; they are resolved at build time from

  https://leetcode.com/api/problems/all/   (slug -> title, number, difficulty, paid_only)
  https://cses.fi/problemset/              (task id -> title)

so a wrong slug or task id is a build error rather than a dead link in a lesson. Premium
LeetCode problems are rejected too: a locked problem is not a suggestion.

    python3 tools/build_problems.py         # fetches, validates, writes content/problems.js

These are problems to *solve*, with no solution attached. The worked ones with solutions
live in each content/<ID>.js under `practice`.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (course build script)"

# (source, key, why): source is 'lc' (LeetCode slug) or 'cses' (task id).
SUGGESTED = {
    # ---------- Foundations ----------
    "F01": [
        ("lc", "contains-duplicate", "Same answer two ways; time both at n = 100000 and watch the growth rate decide."),
        ("cses", "1621", "n up to 2e5: the constraint rules out the n^2 scan before you write a line."),
        ("lc", "maximum-subarray", "The O(n^2) version is obvious and too slow. Ask what the growth rate buys you."),
    ],
    "F02": [
        ("lc", "sqrtx", "Halving the search space: how many halvings before one candidate is left?"),
        ("lc", "powx-n", "Halving the exponent. Count the multiplications, then check it is log n."),
        ("cses", "1095", "The same halving, with a modulus and n up to 1e9."),
    ],
    "F03": [
        ("lc", "missing-number", "Gauss's n(n+1)/2 in one line instead of a scan."),
        ("cses", "1083", "The same sum, with n up to 2e5 and a 64-bit answer."),
        ("cses", "1618", "A geometric series in disguise: n/5 + n/25 + n/125 + ... Why does it terminate quickly?"),
    ],
    "F14": [
        ("cses", "1617", "2^n mod m: counting strings without listing them."),
        ("cses", "1072", "Count the placements, then subtract the attacking ones. Pure counting."),
        ("lc", "unique-paths", "A binomial coefficient wearing a grid costume."),
        ("cses", "1079", "nCk mod p for huge n: counting plus modular arithmetic."),
    ],
    "F07": [
        ("lc", "sort-colors", "Dutch flag: write down what the three regions mean before you write the loop."),
        ("lc", "move-zeroes", "State the invariant for the write pointer, then prove the loop keeps it."),
        ("cses", "1094", "A one-line greedy. The invariant is why it is optimal, not the code."),
    ],
    "F08": [
        ("cses", "2165", "Hanoi: the recursion is three lines; the proof is the point."),
        ("cses", "2205", "Gray code: build n from n-1 and say why the property survives."),
        ("lc", "merge-two-sorted-lists", "Write it recursively and justify it by induction on the total length."),
    ],
    "F09": [
        ("lc", "search-a-2d-matrix-ii", "Start at a corner: every step deletes a whole row or column. Prove nothing lost."),
        ("lc", "two-sum-ii-input-array-is-sorted", "Each move discards a row of the pair table. Which row, and why is it safe?"),
        ("lc", "find-peak-element", "Half the array is eliminated with no sortedness at all. Why is that legal?"),
    ],
    "F13": [
        ("lc", "first-bad-version", "The cleanest monotone predicate there is: false...false true...true."),
        ("lc", "koko-eating-bananas", "Name the predicate, prove it is monotone, then binary search it."),
        ("cses", "1620", "Same shape, bigger numbers: is t time enough to make k products?"),
    ],
    "F10": [
        ("lc", "copy-list-with-random-pointer", "References versus copies. Drawing the arrows is the whole problem."),
        ("lc", "rotate-image", "In-place index arithmetic on one contiguous block."),
        ("lc", "set-matrix-zeroes", "The O(1)-space version forces you to think about what the memory actually holds."),
    ],
    "F04": [
        ("lc", "min-stack", "O(1) amortised per operation. Account for the worst single push."),
        ("lc", "implement-queue-using-stacks", "Each element moves between stacks at most once: the classic amortised argument."),
        ("lc", "daily-temperatures", "Every index is pushed once and popped once, so the nested loop is still O(n)."),
    ],
    "F11": [
        ("lc", "design-hashmap", "Build the table yourself: buckets, collisions, resizing."),
        ("lc", "group-anagrams", "Hashing a derived key, and why the key must be canonical."),
        ("lc", "longest-consecutive-sequence", "O(n) only if you can argue each element is visited a constant number of times."),
    ],
    "F16": [
        ("lc", "maximum-depth-of-binary-tree", "Height by definition, in three lines."),
        ("lc", "balanced-binary-tree", "Height and balance in one pass; the anatomy vocabulary pays off here."),
        ("lc", "count-complete-tree-nodes", "Uses the shape of a complete tree to beat O(n). Draw it first."),
    ],
    "F15": [
        ("lc", "find-if-path-exists-in-graph", "Build the adjacency list from an edge list, then walk it."),
        ("cses", "1666", "n, m up to 1e5: the representation decides whether you pass."),
        ("lc", "clone-graph", "You cannot copy a graph without being clear on what a node and an edge are."),
    ],
    "F05": [
        ("lc", "binary-tree-inorder-traversal", "Write it recursively, then iteratively with your own stack. Same frames, visible."),
        ("cses", "1622", "Generating strings: the call stack is the partial answer."),
        ("lc", "reverse-linked-list", "Do the recursive version and say what each frame holds."),
    ],
    "F06": [
        ("lc", "sort-an-array", "Write merge sort, draw the recursion tree, count the levels and the work per level."),
        ("lc", "kth-largest-element-in-an-array", "Quickselect: T(n) = T(n/2) + n averages to O(n). Why not n log n?"),
        ("lc", "search-in-rotated-sorted-array", "T(n) = T(n/2) + O(1). Name the recurrence before you code."),
    ],
    "F12": [
        ("cses", "1074", "Sorting makes the answer obvious: the median. Prove it."),
        ("cses", "1090", "Sort, then two pointers. The sort is the expensive part and it dominates."),
        ("lc", "largest-number", "A custom comparator, and the proof that it is a valid ordering."),
    ],
    # ---------- Patterns ----------
    "P01": [
        ("cses", "1640", "Two values summing to x. The map version is one pass."),
        ("lc", "subarray-sum-equals-k", "Prefix sum counts in a map: the step most people cannot re-derive."),
        ("cses", "1661", "The same counting trick, n up to 2e5."),
        ("lc", "longest-consecutive-sequence", "A set turns an O(n log n) sort into O(n)."),
        ("cses", "2216", "Positions in a map, then one scan."),
    ],
    "P02": [
        ("cses", "1084", "Sort both sides, then walk them together."),
        ("lc", "3sum", "Fix one, converge on the rest. The duplicate handling is where people lose it."),
        ("cses", "1641", "Three values: the same converging pair inside a loop."),
        ("lc", "container-with-most-water", "The move rule needs a proof, not a feeling."),
        ("lc", "trapping-rain-water", "Two pointers with an invariant about the taller wall."),
    ],
    "P03": [
        ("lc", "remove-duplicates-from-sorted-array", "Read and write pointer; state what is left of write."),
        ("lc", "linked-list-cycle-ii", "Fast and slow, then the entry point. Derive the meeting distance."),
        ("lc", "reorder-list", "Find the middle, reverse, merge: three same-direction passes."),
        ("cses", "1094", "One pass carrying a running maximum."),
    ],
    "P04": [
        ("lc", "longest-substring-without-repeating-characters", "The window shrinks only from the left. Why is that enough?"),
        ("lc", "minimum-size-subarray-sum", "Positive numbers make the window monotone; note where that is used."),
        ("cses", "1141", "Longest distinct-value window, n up to 2e5."),
        ("lc", "permutation-in-string", "Fixed-width window with a count array."),
        ("lc", "minimum-window-substring", "The hard one: counts, a match counter, and a careful shrink."),
        ("cses", "3222", "Distinct values in every window of length k."),
    ],
    "P05": [
        ("lc", "binary-search", "Pick one template and never change it again."),
        ("lc", "find-first-and-last-position-of-element-in-sorted-array", "Lower and upper bound as the same loop with one comparison changed."),
        ("lc", "search-in-rotated-sorted-array", "Which half is sorted? That is the whole problem."),
        ("lc", "find-minimum-in-rotated-sorted-array", "Compare with the right end, not the left. Work out why."),
        ("lc", "median-of-two-sorted-arrays", "Binary search on the partition, not on the value."),
    ],
    "P06": [
        ("lc", "koko-eating-bananas", "The template: predicate, monotone, smallest true."),
        ("lc", "capacity-to-ship-packages-within-d-days", "Same shape; the bounds are the interesting part."),
        ("cses", "1085", "Array division: minimise the largest piece."),
        ("cses", "1620", "Factory machines: the answer space is time, not an index."),
        ("lc", "split-array-largest-sum", "Recognise it as the same problem in different clothes."),
        ("lc", "minimum-number-of-days-to-make-m-bouquets", "Predicate on days, greedy check inside."),
    ],
    "P07": [
        ("lc", "valid-parentheses", "The stack as a memory of what is still open."),
        ("lc", "daily-temperatures", "Next greater element. Say what the stack holds at all times."),
        ("cses", "1645", "Nearest smaller values, n up to 2e5."),
        ("lc", "evaluate-reverse-polish-notation", "A stack machine, and why RPN needs no brackets."),
        ("lc", "largest-rectangle-in-histogram", "The hard one: each bar's span comes from the pops."),
        ("lc", "sum-of-subarray-minimums", "Counting the subarrays each element wins, via the same stack."),
    ],
    "P08": [
        ("lc", "reverse-linked-list", "Three pointers. Draw them before coding."),
        ("lc", "remove-nth-node-from-end-of-list", "The dummy head exists so the first node is not special."),
        ("lc", "add-two-numbers", "Carry handling and the final node."),
        ("lc", "copy-list-with-random-pointer", "Interleave-and-split, or a map. Both are worth writing."),
        ("lc", "lru-cache", "Doubly linked list plus map. Standard interview build."),
    ],
    "P09": [
        ("lc", "binary-tree-level-order-traversal", "BFS with an explicit level boundary."),
        ("lc", "validate-binary-search-tree", "Carry bounds down, not a parent comparison."),
        ("cses", "1674", "Subtree sizes: DFS returning a value up."),
        ("lc", "lowest-common-ancestor-of-a-binary-tree", "The post-order argument: what does a non-null return mean?"),
        ("lc", "binary-tree-maximum-path-sum", "Return one thing, record another. Name both."),
        ("lc", "serialize-and-deserialize-binary-tree", "Traversal order plus null markers determines the tree."),
    ],
    "P10": [
        ("lc", "last-stone-weight", "A heap where the array would be O(n^2)."),
        ("lc", "k-closest-points-to-origin", "Size-k heap: why keep the *largest* at the top?"),
        ("lc", "top-k-frequent-elements", "Count, then heap or bucket. Compare the two costs."),
        ("cses", "1164", "Room allocation: a heap of end times."),
        ("lc", "find-median-from-data-stream", "Two heaps and the balance invariant."),
        ("cses", "1076", "Sliding window median: the same two heaps, with removals."),
    ],
    "P11": [
        ("cses", "1070", "Permutations: the plainest backtracking skeleton."),
        ("lc", "subsets", "Include/exclude, and the 2^n count."),
        ("lc", "combination-sum", "Where the loop starts is what stops duplicates."),
        ("cses", "1623", "Apple division: 2^n split, n <= 20."),
        ("lc", "word-search", "Grid backtracking with mark and unmark."),
        ("cses", "1624", "Eight queens with pruning. Count the nodes you avoided."),
        ("lc", "palindrome-partitioning", "Backtracking plus a palindrome check you can precompute."),
    ],
    "P12": [
        ("cses", "1192", "Counting rooms: flood fill on a grid."),
        ("lc", "number-of-islands", "The same flood fill, interview phrasing."),
        ("cses", "1193", "Labyrinth: BFS plus reconstructing the path."),
        ("lc", "rotting-oranges", "Multi-source BFS: seed the queue with every source."),
        ("cses", "1668", "Bipartite check by two-colouring."),
        ("lc", "word-ladder", "BFS over an implicit graph you never build."),
        ("cses", "1667", "Message route: shortest path plus parent pointers."),
    ],
    "P13": [
        ("lc", "course-schedule", "Cycle detection as a failed topological order."),
        ("cses", "1679", "Course schedule, CSES version: print an order or report a cycle."),
        ("lc", "course-schedule-ii", "Kahn's algorithm with in-degrees."),
        ("cses", "1680", "Longest flight route: DP along the topological order."),
        ("cses", "1681", "Game routes: counting paths in a DAG."),
        ("lc", "all-ancestors-of-a-node-in-a-directed-acyclic-graph", "Propagating sets along the order."),
    ],
    "P14": [
        ("cses", "1671", "Shortest routes I: plain Dijkstra with a heap."),
        ("lc", "network-delay-time", "Same algorithm, interview phrasing."),
        ("lc", "path-with-minimum-effort", "Dijkstra where the edge cost is a maximum, not a sum."),
        ("cses", "1195", "Flight discount: two-layer state graph."),
        ("lc", "swim-in-rising-water", "Minimise the largest edge on a path."),
        ("cses", "1196", "k shortest routes: the priority queue relaxed."),
    ],
    "P15": [
        ("lc", "number-of-provinces", "Union-find where DFS would also do. Write both."),
        ("cses", "1676", "Road construction: components and the largest one, online."),
        ("lc", "redundant-connection", "The first edge that closes a cycle."),
        ("lc", "accounts-merge", "Union-find over strings; the mapping is half the work."),
        ("lc", "satisfiability-of-equality-equations", "Process the equalities first. Why that order?"),
        ("lc", "most-stones-removed-with-same-row-or-column", "Modelling: what exactly is a node here?"),
    ],
    "P16": [
        ("lc", "climbing-stairs", "The smallest recurrence there is. Say the state out loud."),
        ("cses", "1633", "Dice combinations: counting, ordered."),
        ("lc", "coin-change", "Minimising; note where the loop order stops double counting."),
        ("cses", "1635", "Coin combinations I and II: ordered versus unordered, same table."),
        ("lc", "house-robber", "Two states per index, or one with a rolling pair."),
        ("cses", "1158", "Book shop: 0/1 knapsack in disguise."),
        ("lc", "longest-increasing-subsequence", "Write O(n^2), then the patience/binary-search version."),
        ("lc", "edit-distance", "Two-dimensional state; draw the three arrows into a cell."),
        ("lc", "partition-equal-subset-sum", "Subset sum as a boolean table, then as a bitset."),
    ],
    "P17": [
        ("cses", "1629", "Movie festival: sort by end time, and prove the exchange argument."),
        ("lc", "merge-intervals", "Sort by start, then one sweep."),
        ("lc", "insert-interval", "No sort needed; three phases."),
        ("lc", "non-overlapping-intervals", "Same greedy as the movie festival, complement phrasing."),
        ("cses", "1619", "Restaurant customers: the +1/-1 sweep."),
        ("lc", "minimum-number-of-arrows-to-burst-balloons", "Greedy on the end point again."),
        ("cses", "1630", "Tasks and deadlines: an exchange argument that is not about intervals."),
    ],
    "P18": [
        ("cses", "1646", "Static range sums: the definition of a prefix array."),
        ("lc", "find-pivot-index", "Prefix and suffix in one pass."),
        ("cses", "1660", "Subarray sums I: positive values, so a window also works. Do both."),
        ("lc", "subarray-sums-divisible-by-k", "Prefix sums modulo k, counted in a map. Mind the negatives."),
        ("cses", "1662", "The same, CSES sizing."),
        ("lc", "corporate-flight-bookings", "A difference array: the point of the whole topic."),
        ("cses", "1652", "Forest queries: 2D prefix sums, inclusion-exclusion."),
        ("lc", "range-sum-query-2d-immutable", "The same rectangle formula, interview phrasing."),
    ],
    "P19": [
        ("cses", "3221", "Sliding window minimum: the deque, bare."),
        ("lc", "sliding-window-maximum", "Same thing. Say what the deque holds and why it is sorted."),
        ("lc", "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", "Two deques, max and min, inside one window."),
        ("lc", "jump-game-vi", "DP where the transition is a window maximum."),
        ("lc", "shortest-subarray-with-sum-at-least-k", "Negatives break the window; the deque over prefix sums saves it."),
        ("lc", "constrained-subsequence-sum", "The same trick, one level more abstract."),
    ],
    "P20": [
        ("cses", "1648", "Dynamic range sums: point update, prefix query. The BIT's home problem."),
        ("lc", "range-sum-query-mutable", "Same, interview phrasing. A segment tree also works; compare the code."),
        ("cses", "1651", "Range update, point query: the difference-array BIT."),
        ("lc", "count-of-smaller-numbers-after-self", "Counting inversions with a BIT over values."),
        ("cses", "2169", "Nested ranges count: sort, then count with a BIT."),
        ("lc", "reverse-pairs", "Inversions with a twist in the comparison."),
        ("cses", "1144", "Salary queries: values are huge, so compress them first."),
    ],
    "P21": [
        ("cses", "1649", "Dynamic range minimum: point update, range query."),
        ("cses", "1190", "Subarray sum queries: a node stores four numbers, not one. Derive the merge."),
        ("cses", "1651", "Range update queries, the segment tree way."),
        ("cses", "1735", "Range updates and sums: two lazy tags that must compose. The real test."),
        ("lc", "my-calendar-iii", "Lazy or coordinate-compressed counting."),
        ("cses", "1736", "Polynomial queries: an arithmetic progression as a lazy tag."),
        ("lc", "falling-squares", "Range assign and range max; think about what the tag means."),
    ],
    "P22": [
        ("cses", "1687", "Company queries I: the jump table, nothing else."),
        ("lc", "kth-ancestor-of-a-tree-node", "The same table, interview phrasing."),
        ("cses", "1688", "Company queries II: the LCA itself."),
        ("cses", "1135", "Distance queries: depth plus LCA."),
        ("cses", "1750", "Planets queries I: binary lifting on a functional graph."),
        ("cses", "1136", "Counting paths: LCA plus a difference array on the tree."),
    ],
    "P23": [
        ("cses", "1674", "Subordinates: the simplest upward DP."),
        ("lc", "diameter-of-binary-tree", "Return one value, record another."),
        ("cses", "1131", "Tree diameter on a general tree: two DFS, or one DP."),
        ("lc", "house-robber-iii", "Two states per node."),
        ("cses", "1130", "Tree matching: include/exclude the edge to the parent."),
        ("cses", "1132", "Tree distances I: the rerooting warm-up."),
        ("cses", "1133", "Tree distances II: full rerooting. Derive the parent's contribution."),
        ("lc", "sum-of-distances-in-tree", "The same rerooting, interview phrasing."),
    ],
    "P24": [
        ("lc", "subsets", "Iterate subsets as integers first; everything else builds on that."),
        ("cses", "1653", "Elevator rides: classic dp[mask] with two fields."),
        ("lc", "partition-to-k-equal-sum-subsets", "Bitmask over used items, with memo."),
        ("cses", "1690", "Hamiltonian flights: dp[mask][last], the TSP shape."),
        ("lc", "shortest-path-visiting-all-nodes", "TSP as BFS over (mask, node)."),
        ("cses", "2181", "Counting tilings: broken-profile DP, the next level up."),
        ("lc", "number-of-ways-to-wear-different-hats-to-each-other", "Choose which side to put in the mask. That choice is the problem."),
    ],
    "P25": [
        ("cses", "1097", "Removal game: two players, one interval, one table."),
        ("lc", "longest-palindromic-subsequence", "Interval DP by length; watch the fill order."),
        ("lc", "minimum-cost-to-cut-a-stick", "Add the endpoints, then it is textbook."),
        ("lc", "burst-balloons", "Choose the *last* balloon in the interval, not the first. Say why."),
        ("lc", "stone-game-vii", "Margin form: one table instead of two."),
        ("cses", "1080", "Empty string: interval DP with counting."),
        ("lc", "strange-printer", "Harder merge rule; derive it on paper first."),
    ],
    "P26": [
        ("cses", "1675", "Road reparation: Kruskal, straight."),
        ("lc", "min-cost-to-connect-all-points", "Dense graph, so Prim without a heap is competitive. Compare."),
        ("lc", "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", "Forces you to actually use the cut and cycle properties."),
        ("cses", "1676", "Road construction: union-find incrementally, no MST needed. Know the difference."),
    ],
    "P27": [
        ("cses", "1673", "High score: Bellman-Ford with a reachable positive cycle."),
        ("lc", "cheapest-flights-within-k-stops", "Bellman-Ford limited to k+1 rounds. Why must you copy the array?"),
        ("cses", "1197", "Cycle finding: detect a negative cycle and print it."),
        ("cses", "1672", "Shortest routes II: Floyd-Warshall, n <= 500."),
        ("lc", "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", "Floyd-Warshall, interview phrasing."),
        ("cses", "1202", "Investigation: shortest path with four quantities at once."),
    ],
    "P28": [
        ("cses", "1095", "Fast exponentiation, mod 1e9+7."),
        ("lc", "powx-n", "The same, without the modulus and with negative exponents."),
        ("lc", "count-good-numbers", "Huge exponent: the answer is one fast power."),
        ("cses", "1079", "Binomial coefficients: factorials plus Fermat's inverse."),
        ("cses", "1716", "Distributing apples: stars and bars, mod p."),
        ("cses", "2064", "Bracket sequences I: Catalan numbers, mod p."),
        ("cses", "1712", "Exponentiation II: a^(b^c), which needs Fermat on the exponent. Careful."),
    ],
    "P29": [
        ("lc", "count-primes", "The sieve, and why it is n log log n."),
        ("cses", "1081", "Common divisors: count multiples, do not factor pairs."),
        ("cses", "1713", "Counting divisors: 1e5 queries, so precompute."),
        ("lc", "number-of-common-factors", "Small, but forces the gcd relationship."),
        ("cses", "1082", "Sum of divisors up to 1e12: group by quotient."),
        ("lc", "distinct-prime-factors-of-product-of-array", "Smallest-prime-factor table in use."),
        ("cses", "2185", "Prime multiples: inclusion-exclusion over primes."),
    ],
    "P30": [
        ("cses", "1753", "String matching: hashing is the two-line solution."),
        ("lc", "repeated-substring-pattern", "Do it with hashing, then with the KMP failure function."),
        ("cses", "1732", "Finding borders: every prefix that is also a suffix."),
        ("cses", "2106", "Repeating substring: binary search on length plus a hash set."),
        ("lc", "longest-duplicate-substring", "The same binary search, interview phrasing. Mind collisions."),
        ("cses", "2105", "Distinct substrings: counting with hashes."),
        ("lc", "distinct-echo-substrings", "Hashes plus a small observation about halves."),
    ],
    "P31": [
        ("lc", "find-the-index-of-the-first-occurrence-in-a-string", "Write KMP, not indexOf. Then trace the failure function by hand."),
        ("cses", "1753", "String matching with KMP or Z, all occurrences."),
        ("lc", "longest-happy-prefix", "The failure function's last value, and nothing else."),
        ("cses", "1732", "Finding borders: follow the failure chain."),
        ("cses", "1733", "Finding periods: n - border, and why that is a period."),
        ("lc", "shortest-palindrome", "KMP on s + '#' + reverse(s). Say why the separator matters."),
        ("lc", "sum-of-scores-of-built-strings", "The Z-array, straight up."),
    ],
    "P32": [
        ("lc", "implement-trie-prefix-tree", "Build it from an array of children, not a map, and know the cost."),
        ("lc", "replace-words", "Shortest matching prefix: walk until a word end."),
        ("lc", "design-add-and-search-words-data-structure", "Wildcards turn the walk into a small DFS."),
        ("lc", "word-search-ii", "Trie plus grid backtracking; prune dead branches."),
        ("lc", "maximum-xor-of-two-numbers-in-an-array", "The bit trie: greedy from the top bit."),
        ("cses", "1655", "Maximum XOR subarray: prefix XORs into the same bit trie."),
        ("lc", "count-pairs-with-xor-in-a-range", "Counting on a bit trie, which is a real step up."),
    ],
    "P33": [
        ("lc", "fibonacci-number", "Write the 2x2 matrix version even though n is tiny. It is the template."),
        ("cses", "1722", "Fibonacci for n up to 1e18. Now the matrix is the only way."),
        ("cses", "1096", "Throwing dice: a k-term recurrence as a k x k matrix."),
        ("cses", "1723", "Graph paths I: the adjacency matrix to the k-th power counts walks."),
        ("lc", "knight-dialer", "Same idea; the naive DP passes, so do it both ways and compare."),
        ("lc", "student-attendance-record-ii", "Small state machine, huge n: build the transition matrix."),
        ("cses", "1724", "Graph paths II: min-plus matrix product. Same skeleton, different semiring."),
    ],
    "P34": [
        ("cses", "1623", "Apple division: 2^20 by brute force, and the halved version as practice."),
        ("lc", "4sum-ii", "Two halves, one map. The cleanest meet in the middle there is."),
        ("cses", "1628", "Meet in the middle: n <= 40, the canonical problem."),
        ("lc", "closest-subsequence-sum", "Sort one half and binary search it from the other."),
        ("lc", "partition-array-into-two-arrays-to-minimize-sum-difference", "The hard version: split by popcount before searching."),
    ],
}

TOPIC_ORDER_NOTE = "// Generated by tools/build_problems.py. Edit SUGGESTED there, not here.\n"


def fetch(url):
    """curl, not urllib: this machine's Python has no CA bundle installed."""
    r = subprocess.run(["curl", "-sSf", "--max-time", "60", "-A", UA, url],
                       capture_output=True)
    if r.returncode:
        raise SystemExit(f"fetch failed for {url}: {r.stderr.decode().strip()}")
    return r.stdout.decode("utf-8", "replace")


def leetcode_index():
    data = json.loads(fetch("https://leetcode.com/api/problems/all/"))
    lvl = {1: "Easy", 2: "Medium", 3: "Hard"}
    out = {}
    for p in data["stat_status_pairs"]:
        s = p["stat"]
        out[s["question__title_slug"]] = {
            "name": f"{s['frontend_question_id']}. {s['question__title']}",
            "diff": lvl[p["difficulty"]["level"]],
            "paid": p["paid_only"],
        }
    return out


def cses_index():
    html = fetch("https://cses.fi/problemset/")
    out = {}
    for sec, body in re.findall(r"<h2>(.*?)</h2>(.*?)(?=<h2>|\Z)", html, re.S):
        for tid, name in re.findall(r'href="/problemset/task/(\d+)"[^>]*>(.*?)</a>', body):
            out[tid] = {"name": name.strip(), "diff": sec.strip()}
    return out


def main():
    graph = json.loads((ROOT / "knowledge-graph.json").read_text())
    known = {t["id"] for t in graph["topics"]}
    errors = []
    for tid in SUGGESTED:
        if tid not in known:
            errors.append(f"{tid}: not a topic in knowledge-graph.json")
    for tid in sorted(known):
        if tid not in SUGGESTED:
            errors.append(f"{tid}: no suggested problems")

    lc, cs = leetcode_index(), cses_index()
    out = {}
    for tid, items in SUGGESTED.items():
        rows = []
        for src, key, why in items:
            if src == "lc":
                p = lc.get(key)
                if not p:
                    errors.append(f"{tid}: unknown LeetCode slug {key!r}")
                    continue
                if p["paid"]:
                    errors.append(f"{tid}: {key} is LeetCode premium; pick a free problem")
                    continue
                rows.append({"name": p["name"], "src": "LeetCode", "diff": p["diff"],
                             "url": f"https://leetcode.com/problems/{key}/", "why": why})
            elif src == "cses":
                p = cs.get(key)
                if not p:
                    errors.append(f"{tid}: unknown CSES task id {key!r}")
                    continue
                rows.append({"name": p["name"], "src": "CSES", "diff": p["diff"],
                             "url": f"https://cses.fi/problemset/task/{key}", "why": why})
            else:
                errors.append(f"{tid}: unknown source {src!r}")
        out[tid] = rows

    if errors:
        for e in errors:
            print("ERROR " + e, file=sys.stderr)
        return 1

    order = [t["id"] for t in graph["topics"]]
    ordered = {tid: out[tid] for tid in order}
    (ROOT / "content" / "problems.js").write_text(
        TOPIC_ORDER_NOTE +
        "window.COURSE = window.COURSE || {};\nCOURSE.problems = " +
        json.dumps(ordered, indent=1, ensure_ascii=False) + ";\n")
    n = sum(len(v) for v in ordered.values())
    print(f"wrote content/problems.js: {n} problems across {len(ordered)} topics")
    return 0


if __name__ == "__main__":
    sys.exit(main())
