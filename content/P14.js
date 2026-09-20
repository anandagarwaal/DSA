COURSE.topic({
  id: 'P14',
  intro: `BFS finds shortest paths when every edge costs 1 (P12). With <strong>weights</strong>, "fewest edges" and "cheapest" come apart, and you need Dijkstra: repeatedly settle the closest unsettled vertex. It's a greedy algorithm, so it needs a proof, and that proof depends on a condition you must state out loud: <strong>no negative edges</strong>.`,
  kps: [
    {
      title: 'Settle the closest: the greedy step and why it is safe',
      teach: `
<p>Keep a tentative distance <code>dist[]</code> for every vertex. Repeatedly take the unsettled vertex with the smallest tentative distance, <strong>settle</strong> it (its distance is now final), and relax its outgoing edges.</p>
<div class="ex">
<div class="sub">The picture: a growing ball</div>
<p>Settled vertices form a ball around the source. Each step adds the nearest vertex just outside it, so vertices are settled in non-decreasing distance order, exactly like BFS's layers but with weights.</p>
<div class="sub">Why settling u is safe (the exchange argument)</div>
<p>Let u be the unsettled vertex with the smallest tentative distance d. Any path from s to u must leave the settled ball at some point, using an edge from a settled vertex x to an unsettled vertex y. That path's length is at least dist[y] ≥ d (since d is the smallest tentative value), and edges are <strong>non-negative</strong>, so the remainder of the path from y to u adds nothing negative. So no path to u can be shorter than d. Hence dist[u] = d is final.</p>
<div class="sub">Where non-negativity is used</div>
<p>Exactly once, in "the remainder adds nothing negative". With a negative edge the rest of the path could <em>reduce</em> the total, so a longer-looking route might be cheaper.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Dijkstra settles vertices in which order?`, opts: ['Non-decreasing final distance', 'Increasing vertex index', 'Decreasing edge weight', 'Insertion order into the graph'], a: 0, why: 'Each step takes the smallest tentative distance, which is then final: the "ball" grows outward.' },
        { type: 'free', q: `Prove that when Dijkstra settles the unsettled vertex u with smallest tentative distance d, no shorter path to u exists (assume non-negative weights).`, model: `<p>Any s→u path must cross from the settled set to the unsettled set at some edge x→y, with x settled. Since x is settled, dist[x] is final, and relaxing x already gave dist[y] ≤ dist[x] + w(x,y), so the path's cost up to y is ≥ dist[y]. And dist[y] ≥ d because u has the smallest tentative distance among unsettled vertices. The rest of the path from y to u has non-negative total weight, so the whole path costs ≥ d. Therefore d is optimal for u.</p>`, rubric: ['Any path must cross from settled to unsettled at some edge x→y', 'Cost to y is at least dist[y] ≥ d (u has the minimum tentative distance)', 'Non-negative remaining weights, so the full path costs ≥ d'] },
        { type: 'mcq', q: `Which fact does the safety proof rely on?`, opts: ['Edge weights are never negative', 'The graph is undirected', 'All weights are distinct', 'The graph is connected'], a: 0, why: 'Everything else is optional; non-negativity is what makes "the remainder can only add cost" true.' },
        { type: 'num', q: `Edges (0→1, 4), (0→2, 1), (2→1, 2), (1→3, 1), (2→3, 5). Shortest distance from 0 to 3?`, a: 4, why: '0 → 2 (1) → 1 (3) → 3 (4), which beats 0 → 2 → 3 = 6 and 0 → 1 → 3 = 5.' }
      ]
    },
    {
      title: 'Implementation: a priority queue with lazy deletion',
      teach: `
<pre><code>long[] dist = new long[n];
Arrays.fill(dist, Long.MAX_VALUE);
dist[s] = 0;
PriorityQueue&lt;long[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Long.compare(a[0], b[0]));
pq.offer(new long[]{0, s});
while (!pq.isEmpty()) {
    long[] top = pq.poll();
    long d = top[0]; int u = (int) top[1];
    if (d &gt; dist[u]) continue;                 // stale entry: skip it
    for (int[] e : adj.get(u)) {               // e = {to, weight}
        long nd = d + e[1];
        if (nd &lt; dist[e[0]]) { dist[e[0]] = nd; pq.offer(new long[]{nd, e[0]}); }
    }
}</code></pre>
<div class="ex">
<div class="sub">Why "lazy deletion"?</div>
<p>Java's PriorityQueue can't cheaply update a key, so instead of decreasing a vertex's priority we <strong>push a new entry</strong> and ignore outdated ones. The guard <code>d &gt; dist[u]</code> skips any entry that a better path has already superseded.</p>
<div class="sub">Cost</div>
<p>At most one push per successful relaxation, so ≤ E entries: <strong>O(E log E)</strong> = O(E log V). Space O(V + E).</p>
<div class="sub">Two traps</div>
<p>(1) Use <code>long</code> for distances: summed weights overflow int easily. (2) Without the stale check, a vertex is re-expanded once per queue entry, which is slower but still correct.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `What does the guard <code>if (d &gt; dist[u]) continue;</code> do?`, opts: ['Skips outdated queue entries', 'Detects negative edge weights', 'Stops when the target is reached', 'Prevents the queue from growing'], a: 0, why: 'A better distance for u was recorded after this entry was pushed, so this copy is stale.' },
        { type: 'mcq', q: `Dijkstra with a binary heap on a graph with V = 10⁵, E = 3 × 10⁵. Complexity?`, opts: ['O(E log V) ≈ 5 × 10⁶', 'O(V²) = 10¹⁰', 'O(V · E) = 3 × 10¹⁰', 'O(E) = 3 × 10⁵'], a: 0, why: 'Each edge can push one heap entry: E log V.' },
        { type: 'free', q: `Why can the priority queue hold more than V entries, and why is that not a correctness problem?`, model: `<p>Each successful relaxation pushes a new entry rather than updating an existing one, so a vertex can appear several times with different tentative distances, up to E entries overall. It's still correct because entries are popped in increasing distance order: the first pop of a vertex carries its final distance, and every later (stale) entry is skipped by the <code>d &gt; dist[u]</code> guard. The extra entries only cost a log factor in time and O(E) space.</p>`, rubric: ['Relaxations push duplicates instead of decreasing keys (up to E entries)', 'The first pop of a vertex has the smallest/final distance', 'Stale entries are skipped by the guard, so correctness holds'] },
        { type: 'mcq', q: `Why use <code>long</code> for distances when weights fit in int?`, opts: ['Path sums can exceed int range', 'PriorityQueue requires long keys', 'It makes comparisons faster', 'Negative weights need long'], a: 0, why: '10⁵ edges × 10⁴ weight = 10⁹, and sentinels like MAX_VALUE plus a weight overflow immediately.' }
      ]
    },
    {
      title: 'Negative edges: the counterexample',
      teach: `
<p>The greedy proof needed non-negative weights. Here's what breaks without them.</p>
<div class="ex">
<div class="sub">The graph</div>
<pre><code>0 → 1  weight 2
0 → 2  weight 5
2 → 1  weight −4
1 → 3  weight 1</code></pre>
<div class="sub">What Dijkstra does</div>
<p>It settles 1 at distance 2 (the smallest tentative value), then 3 at 3, then 2 at 5. Final: dist[1] = 2, dist[3] = 3.</p>
<div class="sub">The truth</div>
<p>0 → 2 → 1 costs 5 − 4 = <strong>1</strong>, and 0 → 2 → 1 → 3 costs <strong>2</strong>. Dijkstra's answers for 1 and 3 are both wrong, because it settled vertex 1 before discovering that a <em>longer</em> prefix could be followed by a negative edge.</p>
<div class="sub">What to use instead</div>
<p><strong>Bellman–Ford</strong>: relax all E edges V − 1 times, O(V · E). It also detects negative cycles (a V-th pass that still improves something). With negative cycles, "shortest path" is undefined: you can loop forever to get cheaper.</p>
</div>`,
      qs: [
        { type: 'num', q: `In the graph above (0→1 = 2, 0→2 = 5, 2→1 = −4, 1→3 = 1), what is the TRUE shortest distance from 0 to 3?`, a: 2, why: '0 → 2 → 1 → 3 = 5 − 4 + 1 = 2. Dijkstra reports 3.' },
        { type: 'free', q: `Explain precisely which step of Dijkstra's correctness proof fails when an edge is negative, using this graph.`, model: `<p>The proof says: a path leaving the settled ball costs at least the crossing vertex's tentative distance, "and the rest of the path adds nothing negative". Here the rest (2 → 1, weight −4) <em>subtracts</em>. So settling vertex 1 at 2 isn't justified: the path through 2, which looked more expensive at the crossing point (5 &gt; 2), becomes cheaper afterwards. Once a vertex is settled with a wrong value, everything downstream inherits the error (vertex 3).</p>`, rubric: ['Names the failing step: the remainder of the path can be negative', 'Shows the more expensive prefix (via 2) becomes cheaper later', 'Notes wrong settled values propagate downstream'] },
        { type: 'mcq', q: `Graph with negative weights but no negative cycle. Correct algorithm?`, opts: ['Bellman–Ford, O(V · E)', 'Dijkstra with a bigger heap', 'BFS on the edge list', 'Dijkstra after negating weights'], a: 0, why: 'V − 1 rounds of relaxing every edge. Adding a constant to make weights non-negative does not work either: it penalises paths with more edges.' },
        { type: 'mcq', q: `Why is "shortest path" undefined when a negative cycle is reachable?`, opts: ['Looping the cycle lowers cost forever', 'The graph becomes disconnected', 'Distances stop being integers', 'Dijkstra loops forever on it'], a: 0, why: 'Each extra lap reduces the total, so no minimum exists.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Path With Minimum Effort": a grid of heights; a path's effort is the <em>maximum</em> absolute height difference between consecutive cells; minimise it. Adapt Dijkstra and say what changes.`, model: `<p>Treat cells as vertices and adjacent moves as edges of weight |height difference|. Keep dist[cell] = the minimum possible <em>maximum</em> step to reach it, and relax with <code>max(d, |Δh|)</code> instead of <code>d + w</code>. Pop the smallest such value and settle. The proof still holds: max is non-decreasing along a path, just like a sum of non-negative weights, so a settled cell can't be improved later. O(RC log RC).</p>`, rubric: ['Cells as vertices, |height difference| as edge weight', 'Relaxation uses max(d, w) rather than d + w', 'Safety still holds because max never decreases along a path'] },
    { type: 'num', q: `Network delay: n = 4 nodes, times (u, v, w) = (2,1,1), (2,3,1), (3,4,1), source k = 2. Time for all nodes to receive the signal?`, a: 2, why: 'Distances: node 1 = 1, node 3 = 1, node 4 = 2. The answer is the maximum, 2.' },
    { type: 'mcq', q: `All edge weights are equal to 7. Cheapest algorithm for single-source shortest paths?`, opts: ['BFS, then multiply by 7', 'Dijkstra with a binary heap', 'Bellman–Ford over all edges', 'Floyd–Warshall on the matrix'], a: 0, why: 'Equal weights make it an unweighted problem: O(V + E) beats O(E log V).' },
    { type: 'mcq', q: `Minimum effort grid [[1,2,2],[3,8,2],[5,3,5]]. Answer?`, opts: ['2', '1', '3', '5'], a: 0, why: 'Go down the left column and along the bottom: 1 → 3 → 5 → 3 → 5, whose steps are 2, 2, 2, 2, so the effort is 2. No route avoids a step of 2.' },
    { type: 'free', q: `Discriminate: BFS, Dijkstra, Bellman–Ford. Give the deciding feature and the cost of each.`, model: `<p>BFS: all edges effectively equal weight (or unweighted). O(V + E). Dijkstra: non-negative weights; greedy settling is provably safe. O(E log V). Bellman–Ford: any weights including negatives (no negative cycle), since it relaxes every edge V − 1 times instead of trusting a greedy order, and it detects negative cycles. O(V · E). The deciding feature is the weight structure, not the graph's size.</p>`, rubric: ['BFS for unweighted/uniform weights, O(V + E)', 'Dijkstra for non-negative weights, O(E log V)', 'Bellman–Ford for negative weights / cycle detection, O(V·E)'] }
  ],
  practice: [
    { name: 'Network Delay Time', lc: 'LeetCode 743', prompt: `<p>Signal from node k; return the time for all n nodes to receive it, or −1.</p>`, hint: `<p>Single-source shortest paths, then take the maximum.</p>`,
      solution: `<pre><code>public int networkDelayTime(int[][] times, int n, int k) {
    List&lt;List&lt;int[]&gt;&gt; adj = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt;= n; i++) adj.add(new ArrayList&lt;&gt;());
    for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
    long[] dist = new long[n + 1];
    Arrays.fill(dist, Long.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue&lt;long[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Long.compare(a[0], b[0]));
    pq.offer(new long[]{0, k});
    while (!pq.isEmpty()) {
        long[] top = pq.poll();
        int u = (int) top[1];
        if (top[0] &gt; dist[u]) continue;
        for (int[] e : adj.get(u)) {
            long nd = top[0] + e[1];
            if (nd &lt; dist[e[0]]) { dist[e[0]] = nd; pq.offer(new long[]{nd, e[0]}); }
        }
    }
    long worst = 0;
    for (int i = 1; i &lt;= n; i++) {
        if (dist[i] == Long.MAX_VALUE) return -1;
        worst = Math.max(worst, dist[i]);
    }
    return (int) worst;
}</code></pre><p class="cx">O(E log V).</p>` },
    { name: 'Path With Minimum Effort', lc: 'LeetCode 1631', prompt: `<p>Minimise the largest absolute height difference along a path from top-left to bottom-right.</p>`, hint: `<p>Same algorithm; relax with max instead of sum.</p>`,
      solution: `<pre><code>public int minimumEffortPath(int[][] h) {
    int R = h.length, C = h[0].length;
    int[][] best = new int[R][C];
    for (int[] row : best) Arrays.fill(row, Integer.MAX_VALUE);
    best[0][0] = 0;
    PriorityQueue&lt;int[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, 0, 0});
    int[][] D = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int e = cur[0], r = cur[1], c = cur[2];
        if (e &gt; best[r][c]) continue;
        if (r == R - 1 &amp;&amp; c == C - 1) return e;
        for (int[] d : D) {
            int x = r + d[0], y = c + d[1];
            if (x &lt; 0 || y &lt; 0 || x &gt;= R || y &gt;= C) continue;
            int ne = Math.max(e, Math.abs(h[x][y] - h[r][c]));
            if (ne &lt; best[x][y]) { best[x][y] = ne; pq.offer(new int[]{ne, x, y}); }
        }
    }
    return 0;
}</code></pre><p class="cx">O(RC log RC). Settling is safe because max never decreases along a path.</p>` }
  ]
});
