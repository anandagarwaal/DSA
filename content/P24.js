COURSE.topic({
  id: 'P24',
  intro: `When n ≤ 20 and the problem is about <em>which</em> items are used rather than in what order, the state can be a subset, and a subset is just an integer (F14). Bitmask DP is how "try all n! orders" collapses to "try all 2ⁿ sets", the single most useful exponential-to-slightly-less-exponential trick, and the reason a constraint like n ≤ 20 is a dead giveaway.`,
  kps: [
    {
      title: 'A subset is an integer',
      teach: `
<p>Bit i of the mask means "item i is used". So a subset of 20 items is one int, and an array indexed by mask covers every subset.</p>
<div class="ex">
<div class="sub">The operations, all O(1)</div>
<pre><code>mask | (1 &lt;&lt; i)        // add item i
mask &amp; ~(1 &lt;&lt; i)       // remove item i
(mask &gt;&gt; i) &amp; 1        // is item i in the set?
mask == (1 &lt;&lt; n) - 1   // is every item used?
Integer.bitCount(mask) // how many items (popcount)
mask &amp; (mask - 1)      // clear the lowest set bit
mask &amp; -mask           // isolate the lowest set bit (P20's trick again)</code></pre>
<div class="sub">Iterating</div>
<p>All subsets: <code>for (int mask = 0; mask &lt; (1 &lt;&lt; n); mask++)</code>. The set bits of one mask: <code>for (int m = mask; m &gt; 0; m &amp;= m - 1) { int i = Integer.numberOfTrailingZeros(m); … }</code>.</p>
<div class="sub">The layering</div>
<p>Every transition adds one bit, so masks form a DAG layered by popcount: a mask only ever depends on masks with fewer bits. Iterating masks in increasing numeric order respects that, because removing a bit always makes the number smaller.</p>
</div>`,
      qs: [
        { type: 'num', q: `n = 5 items. Which integer represents the subset {0, 2, 4}?`, a: 21, why: '1 + 4 + 16 = 21 = 10101₂.' },
        { type: 'mcq', q: `What does <code>mask &amp; (mask − 1)</code> do?`, opts: ['Clears the lowest set bit', 'Isolates the lowest set bit', 'Flips every bit of the mask', 'Counts the set bits'], a: 0, why: 'Subtracting 1 flips the lowest set bit and everything below it; the AND keeps the higher bits. Looping on it visits each set bit once.' },
        { type: 'num', q: `n = 20. How many subsets are there, in millions? (2²⁰)`, a: 1.05, tol: 0.05, why: '2²⁰ = 1,048,576 ≈ 10⁶: the reason n ≤ 20 is the signal.' },
        { type: 'free', q: `Why is iterating masks in increasing numeric order a valid DP fill order when every transition adds one bit?`, model: `<p>Adding a bit strictly increases the integer, so a mask's dependencies (the masks it came from, with one fewer bit) are always numerically smaller and therefore already computed. Numeric order is a topological order of the subset DAG, which is layered by popcount. It's the same "dependencies must be final before you compute a cell" rule as any DP fill order (P16).</p>`, rubric: ['Adding a bit increases the integer value', 'So all predecessors are smaller and already computed', 'Numeric order is a valid topological order of the subset lattice'] }
      ]
    },
    {
      title: 'Transitions over subsets',
      teach: `
<div class="ex">
<div class="sub">Worked example: assign n tasks to n workers, minimising cost</div>
<p>State: <code>dp[mask]</code> = the minimum cost to assign the tasks in <code>mask</code> to the first <code>popcount(mask)</code> workers. The next worker is determined by the number of bits already set, which is why no second dimension is needed.</p>
<pre><code>int[] dp = new int[1 &lt;&lt; n];
Arrays.fill(dp, INF);
dp[0] = 0;
for (int mask = 0; mask &lt; (1 &lt;&lt; n); mask++) {
    if (dp[mask] == INF) continue;
    int worker = Integer.bitCount(mask);          // next worker to assign
    if (worker == n) continue;
    for (int task = 0; task &lt; n; task++)
        if ((mask &gt;&gt; task &amp; 1) == 0)
            dp[mask | 1 &lt;&lt; task] = Math.min(dp[mask | 1 &lt;&lt; task], dp[mask] + cost[worker][task]);
}
return dp[(1 &lt;&lt; n) - 1];</code></pre>
<div class="sub">Why popcount replaces a dimension</div>
<p>Workers are filled in a fixed order, so "how many are done" is recoverable from the mask itself. Recognising that a dimension is <em>implied</em> keeps the state space at 2ⁿ instead of 2ⁿ·n.</p>
<div class="sub">Cost</div>
<p>2ⁿ states × n transitions = <strong>O(2ⁿ · n)</strong>. For n = 20 that is about 2 × 10⁷: comfortable.</p>
</div>`,
      qs: [
        { type: 'num', q: `n = 20, and each state tries n transitions. How many operations, in millions? (2²⁰ × 20)`, a: 21, tol: 1, why: '1.05 × 10⁶ × 20 ≈ 2.1 × 10⁷.' },
        { type: 'mcq', q: `In the assignment DP, why is no separate "worker index" dimension needed?`, opts: ['popcount(mask) gives it', 'Workers are interchangeable', 'It is stored in the low bits', 'The cost matrix is symmetric'], a: 0, why: 'Assigning in a fixed worker order means the count of assigned tasks identifies the next worker.' },
        { type: 'mcq', q: `A DP over subsets where each state also needs "the last item used" costs…`, opts: ['O(2ⁿ · n) states, O(2ⁿ · n²) time', 'O(2ⁿ) states, O(2ⁿ) time', 'O(n²) states, O(n³) time', 'O(2ⁿ · n!) states'], a: 0, why: 'The extra dimension multiplies the states by n, and each still tries n transitions: that is the TSP shape.' },
        { type: 'free', q: `Why does tracking "which set of items is done" often replace "in which order they were done", and when does it fail?`, model: `<p>If the remaining cost depends only on <em>which</em> items are left (and perhaps the current position), then all orders reaching the same set are interchangeable and can be merged into one state: n! paths collapse into 2ⁿ states. It fails when the future genuinely depends on more of the history, e.g. costs that depend on the order of several earlier choices or on a running quantity not recoverable from the set; then the extra information must be added to the state, which may make it too large.</p>`, rubric: ['Orders reaching the same set are interchangeable if the future depends only on the set (plus position)', 'n! paths merge into 2ⁿ states', 'Fails when the future depends on more history; that must enter the state'] }
      ]
    },
    {
      title: 'TSP and shortest-path-over-subsets',
      teach: `
<p>The canonical two-dimensional version: <code>dp[mask][u]</code> = the cheapest way to have visited exactly <code>mask</code> and be standing at u.</p>
<pre><code>dp[1 &lt;&lt; start][start] = 0;
for (int mask = 0; mask &lt; (1 &lt;&lt; n); mask++)
    for (int u = 0; u &lt; n; u++) {
        if (dp[mask][u] == INF || (mask &gt;&gt; u &amp; 1) == 0) continue;
        for (int v = 0; v &lt; n; v++)
            if ((mask &gt;&gt; v &amp; 1) == 0)
                dp[mask | 1 &lt;&lt; v][v] = Math.min(dp[mask | 1 &lt;&lt; v][v], dp[mask][u] + d[u][v]);
    }
// tour: min over u of dp[FULL][u] + d[u][start]</code></pre>
<div class="ex">
<div class="sub">Worked example</div>
<p>Four cities with distances 0–1: 10, 0–2: 15, 0–3: 20, 1–2: 35, 1–3: 25, 2–3: 30. The optimal tour costs <strong>80</strong> (0 → 1 → 3 → 2 → 0).</p>
<div class="sub">Cost</div>
<p>2ⁿ·n states × n transitions = <strong>O(2ⁿ · n²)</strong>. n = 15 gives about 7 × 10⁶; n = 20 about 4 × 10⁸, which is borderline.</p>
<div class="sub">The unweighted cousin</div>
<p>"Shortest path visiting every node" (LeetCode 847) is BFS over states (node, mask): every edge costs 1, so BFS layers give the answer directly (P12) without a DP table.</p>
</div>`,
      qs: [
        { type: 'num', q: `Four cities, distances 0–1: 10, 0–2: 15, 0–3: 20, 1–2: 35, 1–3: 25, 2–3: 30. Cost of the optimal tour returning to 0?`, a: 80, why: '0 → 1 → 3 → 2 → 0 = 10 + 25 + 30 + 15 = 80.' },
        { type: 'mcq', q: `Why does TSP need dp[mask][u] rather than just dp[mask]?`, opts: ['The next edge depends on where you stand', 'Masks alone cannot be indexed', 'To avoid revisiting nodes twice', 'To store the distance travelled'], a: 0, why: 'Two routes covering the same set can end at different cities, and the remaining cost depends on that endpoint.' },
        { type: 'num', q: `Graph with 4 nodes where node 0 connects to 1, 2 and 3 (a star). Shortest walk visiting every node (LeetCode 847), starting anywhere?`, a: 4, why: 'e.g. 1 → 0 → 2 → 0 → 3: four edges. Revisiting the hub is allowed.' },
        { type: 'free', q: `Compare brute-force TSP with the bitmask DP for n = 15, with numbers.`, model: `<p>Brute force tries every order: 14! ≈ 8.7 × 10¹⁰ tours (fixing the start), far beyond the ~10⁸ budget. Bitmask DP has 2¹⁵ × 15 ≈ 4.9 × 10⁵ states with 15 transitions each, about 7 × 10⁶ operations: instant. The saving comes from merging all orders that visit the same set and end at the same city into one state, which is exactly the set-not-order collapse.</p>`, rubric: ['Brute force is (n−1)! ≈ 8.7 × 10¹⁰: infeasible', 'DP is 2ⁿ·n² ≈ 7 × 10⁶: fine', 'Saving comes from merging equal (set, endpoint) states'] }
      ]
    },
    {
      title: 'Reading the constraint, and submask enumeration',
      teach: `
<div class="ex">
<div class="sub">The signal</div>
<p><strong>n ≤ 20–24</strong> (sometimes phrased as "at most 20 items/cities/people") almost always means subsets. Compare F14's table: n ≤ 10–12 suggests permutations, n ≤ 20 suggests 2ⁿ, n ≥ 40 means neither.</p>
<div class="sub">Memory</div>
<p>2²⁰ ints is 4 MB; 2²⁰ × 20 ints is 80 MB, which may be too much. Often you can drop a dimension or use <code>short</code>/<code>int</code> carefully. Memory, not time, is usually what kills n = 22.</p>
<div class="sub">Submask enumeration</div>
<p>For "partition the set into groups" you sometimes need every <em>submask</em> of a mask:</p>
<pre><code>for (int sub = mask; sub &gt; 0; sub = (sub - 1) &amp; mask) { /* sub is a non-empty submask */ }</code></pre>
<p>Summed over all masks this is <strong>3ⁿ</strong>, not 4ⁿ: each element is in the submask, in the mask only, or in neither. For n = 15, 3¹⁵ ≈ 1.4 × 10⁷: fine. For n = 20, 3²⁰ ≈ 3.5 × 10⁹: too slow.</p>
<div class="sub">Where it appears</div>
<p>CSES "Elevator Rides" (fit people into the fewest lifts), "Counting Tilings"; interview versions like "minimum sessions to finish tasks" and "partition to k equal-sum subsets".</p>
</div>`,
      qs: [
        { type: 'mcq', q: `A problem says n ≤ 18 and asks for an optimal assignment. First idea?`, opts: ['Bitmask DP over subsets', 'Greedy by smallest cost', 'Binary search on the answer', 'Dijkstra on the cost graph'], a: 0, why: '2¹⁸ ≈ 2.6 × 10⁵ states: the constraint is the signal.' },
        { type: 'num', q: `Summing over all masks, enumerating every submask costs 3ⁿ. For n = 15, how many operations in millions?`, a: 14, tol: 1, why: '3¹⁵ ≈ 1.4 × 10⁷.' },
        { type: 'mcq', q: `Why is submask enumeration 3ⁿ overall rather than 4ⁿ?`, opts: ['Each element: in sub, in mask only, or out', 'Half of the submasks are skipped entirely', 'Because the masks are visited in order', 'Only powers of two are ever visited'] , a: 0, why: 'Counting (mask, submask) pairs: three independent choices per element.' },
        { type: 'free', q: `n = 22 with a dp[mask][last] table of ints. Estimate the memory and say what you would do about it.`, model: `<p>2²² ≈ 4.2 × 10⁶ masks × 22 endpoints × 4 bytes ≈ 370 MB: too much for a typical 256 MB limit. Options: drop the second dimension if the problem allows (use popcount to recover the implied index), store the values as <code>short</code> or <code>byte</code> if the range permits, process masks in popcount layers and discard finished layers, or switch to meet in the middle (P34) if the structure allows splitting the items in half.</p>`, rubric: ['Estimates about 370 MB: over a typical limit', 'Suggests dropping a dimension (popcount) or a smaller value type', 'Mentions layered processing or meet in the middle as alternatives'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `n = 4 items. How many subsets contain item 0?`, a: 8, why: 'Fix bit 0, the other three are free: 2³.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Partition an array of n ≤ 16 numbers into k groups with equal sums." Give a bitmask formulation and the complexity.`, model: `<p>Let target = total / k (reject if not divisible). State: dp[mask] = feasible, plus the running remainder within the group being filled, which is recoverable as sum(mask) mod target if every completed group is exactly target. So define dp[mask] = true if the items in mask can be split into complete groups plus a partial one of size sum(mask) mod target. Transition: from a feasible mask, add any unused item i whose addition does not overflow the current partial group ((sum(mask) mod target) + a[i] ≤ target). Answer dp[FULL]. That's O(2ⁿ · n) with the remainder derived, not stored.</p>`, rubric: ['dp over subsets with the partial-group remainder derived from sum(mask) mod target', 'Transition adds one item if it does not overflow the current group', 'O(2ⁿ · n); reject early if total is not divisible by k'] },
    { type: 'mcq', q: `Which constraint most strongly suggests bitmask DP rather than plain backtracking?`, opts: ['n ≤ 20 and many orders reach the same set', 'n ≤ 20 and every answer must be listed', 'n ≤ 10⁵ with sorted input', 'n ≤ 500 and a 2D grid'], a: 0, why: 'Merging orders into sets is the whole benefit; if you must list every arrangement, the output bound (F14) forces enumeration anyway.' },
    { type: 'num', q: `dp[mask][u] for n = 20: how many table entries, in millions?`, a: 21, tol: 1, why: '2²⁰ × 20 ≈ 2.1 × 10⁷ entries, which is 84 MB as ints: often the real limit.' },
    { type: 'free', q: `Explain to a junior why "which set of tasks is done" can be a DP state but "which order they were done in" usually cannot.`, model: `<p>A DP state must be something you can have <em>few</em> of, while still determining the future. There are only 2ⁿ sets but n! orders, and for most problems the cost of finishing depends on which tasks remain, not on the sequence that got you there, so every order reaching the same set behaves identically from then on. Merging them is what turns n! work into 2ⁿ. Keeping the order as state would mean storing n! distinct situations, which is both unnecessary and far too many.</p>`, rubric: ['A state must be few in number yet determine the future', '2ⁿ sets vs n! orders; orders reaching the same set behave identically onward', 'Merging them is the saving; keeping order would be n! states'] }
  ],
  practice: [
    { name: 'Shortest Path Visiting All Nodes', lc: 'LeetCode 847', prompt: `<p>Undirected connected graph, n ≤ 12. Shortest walk visiting every node, starting anywhere, revisits allowed.</p>`, hint: `<p>State = (node, mask of visited). Unweighted, so BFS layers give the answer.</p>`,
      solution: `<pre><code>public int shortestPathLength(int[][] graph) {
    int n = graph.length, full = (1 &lt;&lt; n) - 1;
    boolean[][] seen = new boolean[n][1 &lt;&lt; n];
    Deque&lt;int[]&gt; q = new ArrayDeque&lt;&gt;();
    for (int i = 0; i &lt; n; i++) { q.offer(new int[]{i, 1 &lt;&lt; i, 0}); seen[i][1 &lt;&lt; i] = true; }
    while (!q.isEmpty()) {
        int[] cur = q.poll();
        int u = cur[0], mask = cur[1], d = cur[2];
        if (mask == full) return d;
        for (int v : graph[u]) {
            int nm = mask | (1 &lt;&lt; v);
            if (!seen[v][nm]) { seen[v][nm] = true; q.offer(new int[]{v, nm, d + 1}); }
        }
    }
    return 0;
}</code></pre><p class="cx">O(2ⁿ · n²) states and edges. BFS works because every edge costs 1.</p>` },
    { name: 'Travelling salesman (held-Karp)', lc: 'classic', prompt: `<p>n ≤ 15 cities with a distance matrix; cheapest tour returning to the start.</p>`, hint: `<p>dp[mask][u]; answer adds the edge back to the start.</p>`,
      solution: `<pre><code>public int tsp(int[][] d) {
    int n = d.length, FULL = 1 &lt;&lt; n, INF = Integer.MAX_VALUE / 4;
    int[][] dp = new int[FULL][n];
    for (int[] row : dp) Arrays.fill(row, INF);
    dp[1][0] = 0;                                     // started at city 0
    for (int mask = 1; mask &lt; FULL; mask++)
        for (int u = 0; u &lt; n; u++) {
            if (dp[mask][u] == INF || (mask &gt;&gt; u &amp; 1) == 0) continue;
            for (int v = 0; v &lt; n; v++) {
                if ((mask &gt;&gt; v &amp; 1) == 1) continue;
                int nm = mask | (1 &lt;&lt; v);
                dp[nm][v] = Math.min(dp[nm][v], dp[mask][u] + d[u][v]);
            }
        }
    int best = INF;
    for (int u = 1; u &lt; n; u++) best = Math.min(best, dp[FULL - 1][u] + d[u][0]);
    return n == 1 ? 0 : best;
}</code></pre><p class="cx">O(2ⁿ · n²) time, O(2ⁿ · n) memory.</p>` },
    { name: 'Minimum Number of Work Sessions to Finish the Tasks', lc: 'LeetCode 1986 · CSES Elevator Rides', prompt: `<p>n ≤ 14 tasks, each with a duration; sessions of length sessionTime. Fewest sessions.</p>`, hint: `<p>State: mask → (sessions used, time left in the current session). Compare lexicographically.</p>`,
      solution: `<pre><code>public int minSessions(int[] tasks, int sessionTime) {
    int n = tasks.length, FULL = 1 &lt;&lt; n;
    int[] sessions = new int[FULL], left = new int[FULL];
    Arrays.fill(sessions, Integer.MAX_VALUE);
    sessions[0] = 1; left[0] = sessionTime;
    for (int mask = 0; mask &lt; FULL; mask++) {
        if (sessions[mask] == Integer.MAX_VALUE) continue;
        for (int i = 0; i &lt; n; i++) {
            if ((mask &gt;&gt; i &amp; 1) == 1) continue;
            int nm = mask | (1 &lt;&lt; i), ns, nl;
            if (tasks[i] &lt;= left[mask]) { ns = sessions[mask]; nl = left[mask] - tasks[i]; }
            else { ns = sessions[mask] + 1; nl = sessionTime - tasks[i]; }
            if (nl &lt; 0) continue;                       // task longer than a session
            if (ns &lt; sessions[nm] || (ns == sessions[nm] &amp;&amp; nl &gt; left[nm])) {
                sessions[nm] = ns; left[nm] = nl;       // fewer sessions, then more room
            }
        }
    }
    return sessions[FULL - 1];
}</code></pre><p class="cx">O(2ⁿ · n). The greedy tie-break (more time left is better) is what keeps one value per mask valid.</p>` }
  ]
});
