COURSE.topic({
  id: 'P27',
  intro: `Dijkstra (P14) breaks on negative edges because its greedy settle-the-closest step stops being safe. <strong>Bellman–Ford</strong> gives that up: it relaxes every edge repeatedly, which is slower but survives negative weights and detects negative cycles. <strong>Floyd–Warshall</strong> answers all pairs at once with three nested loops and a surprisingly clean DP argument. Both are short enough to write from understanding rather than memory.`,
  kps: [
    {
      title: 'Bellman-Ford: relax every edge V−1 times',
      teach: `
<pre><code>long[] dist = new long[n];
Arrays.fill(dist, INF);
dist[src] = 0;
for (int round = 0; round &lt; n - 1; round++) {
    boolean changed = false;
    for (int[] e : edges)                       // e = {u, v, w}
        if (dist[e[0]] != INF &amp;&amp; dist[e[0]] + e[2] &lt; dist[e[1]]) {
            dist[e[1]] = dist[e[0]] + e[2];
            changed = true;
        }
    if (!changed) break;                        // early exit: nothing improved
}</code></pre>
<div class="ex">
<div class="sub">The invariant, by path length</div>
<p>After round k, <strong>dist[v] is correct for every shortest path that uses at most k edges</strong>. Proof sketch (induction): a shortest path with k+1 edges is a shortest path with k edges to the second-to-last vertex, plus one edge; round k+1 relaxes that final edge.</p>
<div class="sub">Why V − 1 rounds suffice</div>
<p>A shortest path never repeats a vertex (repeating would mean a cycle, which with no negative cycle can only add cost), so it has at most V − 1 edges. After V − 1 rounds every shortest path is covered.</p>
<div class="sub">Worked example</div>
<p>Edges 0→1 (4), 0→2 (5), 1→2 (−3), 2→3 (4), 1→3 (6). From 0: dist = [0, 4, 1, 5]. Dijkstra would settle 2 at 5 and miss the cheaper 0→1→2 = 1.</p>
<div class="sub">Cost</div>
<p>O(V · E). For V = 10³ and E = 10⁴ that is 10⁷: fine. It's much slower than Dijkstra's O(E log V), so use it only when weights can be negative.</p>
</div>`,
      qs: [
        { type: 'num', q: `Edges 0→1 (4), 0→2 (5), 1→2 (−3), 2→3 (4), 1→3 (6). Shortest distance from 0 to 3?`, a: 5, why: '0→1→2→3 = 4 − 3 + 4 = 5, beating 0→1→3 = 10 and 0→2→3 = 9.' },
        { type: 'mcq', q: `What is guaranteed after k rounds of Bellman-Ford?`, opts: ['Correct distances for paths of ≤ k edges', 'Correct distances for the k nearest nodes', 'k vertices are permanently settled', 'The k cheapest edges are used'], a: 0, why: 'That is the induction: each round extends the covered paths by one edge.' },
        { type: 'free', q: `Why are V − 1 rounds enough, and why is the "no repeated vertex" fact needed?`, model: `<p>Each round extends correctness to shortest paths with one more edge. If there is no negative cycle, some shortest path is <em>simple</em>: repeating a vertex would mean going round a cycle, whose weight is ≥ 0, so removing it cannot make the path worse. A simple path in a graph of V vertices has at most V − 1 edges, so after V − 1 rounds every shortest path is covered and no further round can improve anything.</p>`, rubric: ['Each round covers paths with one more edge (induction)', 'Without negative cycles a shortest path can be taken simple (cycles add ≥ 0)', 'A simple path has ≤ V − 1 edges, so V − 1 rounds suffice'] },
        { type: 'mcq', q: `A round changes nothing. What follows?`, opts: ['All distances are final: stop early', 'One more round is still required', 'A negative cycle exists', 'The graph is disconnected'], a: 0, why: 'Relaxation is monotone: if nothing improved in a full pass, nothing ever will.' }
      ]
    },
    {
      title: 'Detecting negative cycles',
      teach: `
<p>Run one <strong>extra</strong> round after the V − 1. If any edge still relaxes, some distance is not bounded below: a negative cycle is reachable from the source.</p>
<div class="ex">
<div class="sub">Why it works</div>
<p>Without a negative cycle, all shortest paths are covered after V − 1 rounds, so nothing can improve. If something does improve, the improving path must have V or more edges, hence repeats a vertex, hence contains a cycle, and it only helped because that cycle has negative weight.</p>
<div class="sub">Worked example</div>
<p>0→1 (1), 1→2 (−1), 2→0 (−1): going round the triangle costs −1 every lap, so distances fall forever. The V-th round still improves, flagging it.</p>
<div class="sub">Reporting which vertices are affected</div>
<p>Mark every vertex relaxed in the extra round, then run a BFS/DFS forward from them: everything reachable has an undefined (−∞) distance. This is what CSES "Cycle Finding" and "High Score" ask for.</p>
<div class="sub">The interview phrasing</div>
<p>"Negative weights but no negative cycle → Bellman–Ford. Negative cycle reachable → shortest paths are undefined, and Bellman–Ford is how you detect that."</p>
</div>`,
      qs: [
        { type: 'mcq', q: `After V − 1 rounds, one more round still improves a distance. This means…`, opts: ['A reachable negative cycle exists', 'The source was chosen badly', 'More rounds are simply needed', 'The graph has parallel edges'], a: 0, why: 'An improving path must use ≥ V edges, so it repeats a vertex; the repeat only helps if the cycle is negative.' },
        { type: 'mcq', q: `Graph 0→1 (1), 1→2 (−1), 2→0 (−1). Shortest distance from 0 to 2?`, opts: ['Undefined: a negative cycle', 'Zero, by going around once', 'Minus one, the direct route', 'Two, the shortest hop count'], a: 0, why: 'Each lap of the triangle subtracts 1, so no minimum exists (P14).' },
        { type: 'free', q: `How would you report <em>which</em> vertices have undefined shortest distances, not merely that a negative cycle exists?`, model: `<p>Record every vertex whose distance improved during the extra round: each one lies on or downstream of a negative cycle. Then run a BFS/DFS forward from all of those vertices at once (multi-source, P12); every vertex reached can have its distance driven to −∞ by looping the cycle enough times. Those are exactly the vertices with undefined distances; the rest keep the values Bellman–Ford computed.</p>`, rubric: ['Collect the vertices relaxed in the extra round', 'Multi-source traversal forward from them', 'Everything reachable has distance −∞; others keep their computed values'] },
        { type: 'mcq', q: `Negative edges but the graph is a DAG. Best approach?`, opts: ['Relax edges in topological order: O(V + E)', 'Bellman-Ford, since weights are negative', 'Dijkstra, since a DAG has no cycles', 'Floyd-Warshall for all pairs'], a: 0, why: 'Transfer: with no cycles, one pass in topological order (P13) settles every vertex, negative weights included.' }
      ]
    },
    {
      title: 'Floyd-Warshall: allow one more intermediate vertex at a time',
      teach: `
<pre><code>for (int k = 0; k &lt; n; k++)                       // k is the OUTERMOST loop
    for (int i = 0; i &lt; n; i++)
        for (int j = 0; j &lt; n; j++)
            if (d[i][k] + d[k][j] &lt; d[i][j])
                d[i][j] = d[i][k] + d[k][j];</code></pre>
<div class="ex">
<div class="sub">The DP that explains the loop order</div>
<p>Let D_k[i][j] = the shortest i→j distance using only vertices 0..k−1 as intermediates. Then D_{k+1}[i][j] = min(D_k[i][j], D_k[i][k] + D_k[k][j]): either the path avoids k, or it passes through k exactly once. Sweeping k outermost means each layer is complete before the next begins, so the array can be updated in place.</p>
<div class="sub">Why k must be outermost</div>
<p>With k inside, the "only vertices &lt; k allowed" invariant is violated: you would use paths through vertices not yet processed, mixing layers and producing wrong answers. This is the classic Floyd–Warshall bug.</p>
<div class="sub">Worked example</div>
<p>0→1 (5), 1→2 (3), 2→3 (1), 0→3 (10). Floyd gives d[0][3] = <strong>9</strong> via 0→1→2→3, beating the direct edge.</p>
<div class="sub">Cost and scope</div>
<p>O(V³) time, O(V²) memory: fine to about V = 400–500 (F01). Handles negative edges; a negative <code>d[i][i]</code> afterwards flags a negative cycle through i.</p>
</div>`,
      qs: [
        { type: 'num', q: `Edges 0→1 (5), 1→2 (3), 2→3 (1), 0→3 (10). After Floyd-Warshall, what is d[0][3]?`, a: 9, why: '0→1→2→3 = 5 + 3 + 1 = 9.' },
        { type: 'mcq', q: `Why must k be the outermost loop?`, opts: ['Each k layer must finish before the next', 'To keep the matrix symmetric', 'So i and j stay in cache order', 'Otherwise the matrix is not square'], a: 0, why: 'The DP layer "intermediates allowed so far" must be complete before allowing another vertex.' },
        { type: 'free', q: `State the Floyd-Warshall recurrence with its state definition, and explain why the in-place update is safe.`, model: `<p>State: D_k[i][j] = the shortest i→j path using only vertices 0..k−1 as intermediates. Recurrence: D_{k+1}[i][j] = min(D_k[i][j], D_k[i][k] + D_k[k][j]) — the path either avoids k or passes through it exactly once (visiting it twice would mean a cycle, never helpful without negative cycles). In place is safe because row k and column k do not change during iteration k: any improvement to d[i][k] would need a path through k itself, which would just be d[i][k] again.</p>`, rubric: ['State: shortest path using intermediates 0..k−1', 'Recurrence: avoid k, or go through k exactly once', 'In place is safe because row/column k are unchanged during pass k'] },
        { type: 'mcq', q: `V = 500 vertices. Floyd-Warshall costs about…`, opts: ['1.25 × 10⁸ operations: borderline', '2.5 × 10⁵ operations: instant', '10¹⁰ operations: impossible', '500 × log 500 operations'], a: 0, why: 'V³ = 1.25 × 10⁸, right at the usual budget (F01).' }
      ]
    },
    {
      title: 'Choosing among BFS, Dijkstra, Bellman-Ford and Floyd-Warshall',
      teach: `
<div class="ex">
<div class="sub">The decision table</div>
<table><tr><th>situation</th><th>algorithm</th><th>cost</th></tr>
<tr><td>unweighted / all weights equal</td><td>BFS (P12)</td><td>O(V + E)</td></tr>
<tr><td>non-negative weights, one source</td><td>Dijkstra (P14)</td><td>O(E log V)</td></tr>
<tr><td>negative weights, one source</td><td>Bellman–Ford</td><td>O(V · E)</td></tr>
<tr><td>need negative-cycle detection</td><td>Bellman–Ford</td><td>O(V · E)</td></tr>
<tr><td>all pairs, small V</td><td>Floyd–Warshall</td><td>O(V³)</td></tr>
<tr><td>all pairs, large sparse V</td><td>Dijkstra from each source</td><td>O(V · E log V)</td></tr>
<tr><td>DAG, any weights</td><td>relax in topological order (P13)</td><td>O(V + E)</td></tr>
</table>
<div class="sub">The bounded-hops variant</div>
<p>"Cheapest flight with at most k stops" (LeetCode 787) is Bellman–Ford with exactly k + 1 rounds, because rounds correspond to edges used. Crucially, relax from a <em>snapshot</em> of the previous round's distances, or one round can chain several edges and exceed the hop limit. With [0→1: 100, 1→2: 100, 0→2: 500], k = 1 gives <strong>200</strong> and k = 0 gives <strong>500</strong>.</p>
<div class="sub">The signal to listen for</div>
<p>"Costs can be negative" (a refund, a discount, a gain) rules out Dijkstra. "Distance between every pair" with V in the hundreds means Floyd–Warshall. "At most k edges" means round-limited Bellman–Ford.</p>
</div>`,
      qs: [
        { type: 'num', q: `Flights 0→1 (100), 1→2 (100), 0→2 (500). Cheapest 0→2 with at most 1 stop?`, a: 200, why: 'One stop allows two edges: 0→1→2 = 200.' },
        { type: 'num', q: `Same flights, at most 0 stops?`, a: 500, why: 'Only the direct edge is allowed.' },
        { type: 'mcq', q: `V = 300 and you need every pairwise distance, with some negative edges but no negative cycle. Best choice?`, opts: ['Floyd-Warshall: O(V³) = 2.7 × 10⁷', 'Dijkstra from each vertex', 'BFS from each vertex', 'One Bellman-Ford run'], a: 0, why: 'Dijkstra is invalid with negative weights; V³ here is small, and one Bellman–Ford run only covers a single source.' },
        { type: 'free', q: `In the bounded-hops variant, why must each round relax from a snapshot of the previous round's distances?`, model: `<p>Rounds are meant to count edges: after r rounds a vertex's value should use at most r edges. Relaxing in place lets a value updated earlier in the <em>same</em> round be used again later in that round, chaining two or more edges in one pass, which can produce a cheaper route that exceeds the hop limit. Copying the previous round's array and reading only from it keeps each round to exactly one extra edge.</p>`, rubric: ['Rounds must correspond exactly to the number of edges used', 'In-place updates let one round chain multiple edges', 'Reading from a snapshot enforces one edge per round'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Bellman-Ford on a graph with V = 100 and E = 500. Worst-case number of edge relaxations (V−1 rounds × E)?`, a: 49500, why: '99 × 500 = 49,500, with early exit usually far fewer.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Currency arbitrage": rates r(u,v) multiply along a path; detect whether some cycle multiplies to more than 1. Reduce this to a shortest-path problem.`, model: `<p>Take negative logarithms: set w(u,v) = −log r(u,v). A product of rates greater than 1 around a cycle means the sum of logs is positive, i.e. the sum of the w values is <em>negative</em>. So arbitrage exists exactly when the graph has a negative cycle, which Bellman–Ford detects with the extra round. The log turns multiplication into addition so that a shortest-path algorithm applies.</p>`, rubric: ['Uses w = −log(rate) to turn products into sums', 'Profitable cycle (product &gt; 1) ⟺ negative cycle in w', 'Detect with Bellman-Ford\'s extra round'] },
    { type: 'mcq', q: `Which algorithm can detect that shortest paths are undefined?`, opts: ['Bellman-Ford, via the extra round', 'Dijkstra, when the heap empties', 'BFS, when a layer repeats', 'Floyd-Warshall cannot ever detect it'], a: 0, why: 'Floyd–Warshall can too (a negative d[i][i]), but Dijkstra and BFS cannot: they assume it never happens.' },
    { type: 'num', q: `Floyd-Warshall on V = 200. How many relaxation steps, in millions? (V³)`, a: 8, tol: 0.5, why: '200³ = 8 × 10⁶.' },
    { type: 'free', q: `Dijkstra is O(E log V) and Bellman-Ford is O(V·E). Why is the slower algorithm ever the right answer?`, model: `<p>Because they solve different problems. Dijkstra's speed comes from settling each vertex once, which is only safe when no later edge can lower a settled distance, i.e. with non-negative weights. With a negative edge that assumption fails and Dijkstra returns confidently wrong answers (P14). Bellman–Ford makes no such assumption: it keeps relaxing until nothing improves, which costs V·E but stays correct with negative weights and additionally detects negative cycles. Correctness first, then speed.</p>`, rubric: ['Dijkstra\'s speed rests on the non-negativity assumption (settle once)', 'With negative edges it is silently wrong', 'Bellman-Ford trades speed for correctness plus cycle detection'] }
  ],
  practice: [
    { name: 'Cheapest Flights Within K Stops', lc: 'LeetCode 787', prompt: `<p>Cheapest src→dst price using at most k stops, or −1.</p>`, hint: `<p>k + 1 rounds of Bellman-Ford, relaxing from a snapshot.</p>`,
      solution: `<pre><code>public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    final int INF = Integer.MAX_VALUE / 2;
    int[] dist = new int[n];
    Arrays.fill(dist, INF);
    dist[src] = 0;
    for (int round = 0; round &lt;= k; round++) {          // k stops = k + 1 edges
        int[] next = dist.clone();                       // snapshot: one edge per round
        for (int[] f : flights)
            if (dist[f[0]] + f[2] &lt; next[f[1]]) next[f[1]] = dist[f[0]] + f[2];
        dist = next;
    }
    return dist[dst] &gt;= INF ? -1 : dist[dst];
}</code></pre><p class="cx">O(k · E). The clone is what enforces the hop limit.</p>` },
    { name: 'Bellman-Ford with negative-cycle detection', lc: 'CSES Cycle Finding', prompt: `<p>Single-source shortest paths with negative edges; report if a negative cycle is reachable.</p>`, hint: `<p>V − 1 rounds, then one extra round as the test.</p>`,
      solution: `<pre><code>// returns null if a reachable negative cycle exists
public long[] bellmanFord(int n, int[][] edges, int src) {
    final long INF = Long.MAX_VALUE / 4;
    long[] dist = new long[n];
    Arrays.fill(dist, INF);
    dist[src] = 0;
    for (int round = 0; round &lt; n - 1; round++) {
        boolean changed = false;
        for (int[] e : edges)
            if (dist[e[0]] &lt; INF &amp;&amp; dist[e[0]] + e[2] &lt; dist[e[1]]) {
                dist[e[1]] = dist[e[0]] + e[2];
                changed = true;
            }
        if (!changed) return dist;                  // settled early
    }
    for (int[] e : edges)                            // the extra round
        if (dist[e[0]] &lt; INF &amp;&amp; dist[e[0]] + e[2] &lt; dist[e[1]]) return null;
    return dist;
}</code></pre><p class="cx">O(V · E).</p>` },
    { name: 'Floyd-Warshall all pairs', lc: 'CSES Shortest Routes II', prompt: `<p>All-pairs shortest paths for small V, possibly with negative edges.</p>`, hint: `<p>k outermost; guard against INF + w overflow.</p>`,
      solution: `<pre><code>public long[][] floydWarshall(int n, int[][] edges) {
    final long INF = Long.MAX_VALUE / 4;
    long[][] d = new long[n][n];
    for (long[] row : d) Arrays.fill(row, INF);
    for (int i = 0; i &lt; n; i++) d[i][i] = 0;
    for (int[] e : edges) d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]);
    for (int k = 0; k &lt; n; k++)
        for (int i = 0; i &lt; n; i++) {
            if (d[i][k] &gt;= INF) continue;            // unreachable: skip the row
            for (int j = 0; j &lt; n; j++)
                if (d[i][k] + d[k][j] &lt; d[i][j]) d[i][j] = d[i][k] + d[k][j];
        }
    return d;
}</code></pre><p class="cx">O(V³). A negative d[i][i] afterwards means a negative cycle through i.</p>` }
  ]
});
