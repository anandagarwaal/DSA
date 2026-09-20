COURSE.topic({
  id: 'P12',
  intro: `Graph traversal is tree traversal (P09) plus one thing: a graph can reach the same vertex by several routes, or loop back on itself, so you need a <strong>visited set</strong>. With that, DFS explores reachability and components, and BFS gives <em>shortest paths</em> in unweighted graphs. That shortest-path property has a real proof, "layers", and it's the reason BFS rather than DFS is the answer for "minimum number of steps".`,
  kps: [
    {
      title: 'The visited set: why trees don\'t need one and graphs do',
      teach: `
<p>In a tree there's exactly one path between any two nodes, so a traversal from the root never meets a node twice. A graph may have <strong>cycles</strong> and <strong>multiple paths</strong>.</p>
<div class="ex">
<div class="sub">Without visited</div>
<p>Cycle 1–2–3–1: DFS from 1 goes to 2, 3, 1, 2, … forever. Even without a cycle, in a diamond (1→2, 1→3, 2→4, 3→4) node 4 and everything below it is processed twice. Stack enough diamonds and the work becomes exponential.</p>
<div class="sub">Mark when discovered, not when processed</div>
<pre><code>boolean[] seen = new boolean[n];
Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();
st.push(src); seen[src] = true;              // mark on push
while (!st.isEmpty()) {
    int u = st.pop();
    for (int v : adj.get(u))
        if (!seen[v]) { seen[v] = true; st.push(v); }
}</code></pre>
<p>Marking on push guarantees each vertex enters the stack/queue <strong>once</strong>, which is what gives O(V + E) (F15). Marking on pop lets a vertex be pushed many times before it's processed.</p>
<div class="sub">Connected components</div>
<p>Loop over all vertices; each unseen one starts a new traversal. The number of starts is the number of components. Still O(V + E) in total, since each vertex is seen once overall.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why mark a vertex as seen when it is <em>pushed</em> rather than when it is popped?`, opts: ['Each vertex then enters at most once', 'Popping order becomes sorted', 'It saves one boolean array', 'It is required for recursion'], a: 0, why: 'Marking on pop lets several neighbours push the same vertex before any of them is processed.' },
        { type: 'num', q: `Number of provinces (connected components) for adjacency matrix [[1,1,0],[1,1,0],[0,0,1]]?`, a: 2, why: '{0, 1} and {2}.' },
        { type: 'free', q: `Explain why counting components with "for each unseen vertex, start a traversal" is O(V + E) and not O(V · (V + E)).`, model: `<p>The seen array is shared across all the traversals. A vertex is marked once, by whichever traversal reaches it first, and is never expanded again. So summed over all starts, each vertex is expanded once and each edge scanned a constant number of times: O(V + E) in total, plus O(V) for the outer loop. It's the same "count the total" argument as flood fill (F15) and amortized analysis (F04).</p>`, rubric: ['The seen array is shared across traversals', 'Each vertex is expanded once over the whole run', 'Total O(V + E) by counting totals, not per-start cost'] },
        { type: 'mcq', q: `Directed graph: can DFS from one start vertex find all vertices?`, opts: ['Only those reachable along directed edges', 'Yes, always, for any directed graph', 'Only if the graph has no cycles', 'Only if it starts at vertex 0'], a: 0, why: 'Edges are one-way; vertices with no path from the start are never discovered.' }
      ]
    },
    {
      title: 'BFS gives shortest paths in unweighted graphs: the layer proof',
      teach: `
<pre><code>int[] dist = new int[n]; Arrays.fill(dist, -1);
Deque&lt;Integer&gt; q = new ArrayDeque&lt;&gt;();
dist[s] = 0; q.offer(s);
while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : adj.get(u))
        if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }
}</code></pre>
<div class="ex">
<div class="sub">The picture: ripples</div>
<p>Drop a stone at s. Layer 0 is {s}, layer 1 is s's neighbours, layer 2 is their new neighbours, and so on. BFS processes the whole of layer d before any vertex of layer d + 1.</p>
<div class="sub">Why dist[v] is the true shortest distance</div>
<p>Claim: the queue always holds vertices of at most two consecutive layers, in order (d, …, d, d+1, …). When v is first discovered from u (layer d), v gets d + 1. Could v have a shorter path, of length ≤ d? Then its predecessor on that path would sit in a layer ≤ d − 1, would have been processed earlier, and would have discovered v first. Contradiction. So the first discovery is via a shortest path.</p>
<div class="sub">Why DFS can't do this</div>
<p>DFS may first reach v along a long detour and mark it seen, so the short path is never tried. DFS answers "reachable?", not "how far?".</p>
</div>`,
      qs: [
        { type: 'num', q: `Undirected edges 0–1, 0–2, 1–3, 2–3, 2–4, 3–5, 4–5. BFS distance from 0 to 5?`, a: 3, why: 'e.g. 0 → 2 → 4 → 5 or 0 → 1 → 3 → 5.' },
        { type: 'free', q: `Prove that when BFS first discovers vertex v with dist[v] = d + 1, there's no path from s to v shorter than d + 1.`, model: `<p>Suppose a shorter path exists, of length k ≤ d. Its second-to-last vertex w has true distance ≤ k − 1 ≤ d − 1. BFS processes vertices in non-decreasing distance order (the queue holds layer d before layer d + 1), so w was dequeued before u (which is at distance d). When w was dequeued it scanned its neighbours, including v, and would have set dist[v] ≤ k, before u did. Contradiction: v was first discovered from u. So d + 1 is the shortest.</p>`, rubric: ['Assumes a shorter path and takes its predecessor w of v', 'BFS dequeues in non-decreasing distance order, so w before u', 'Then w would have discovered v first: contradiction'] },
        { type: 'mcq', q: `Shortest path in a graph where every edge has weight 1 or 2. Is plain BFS correct?`, opts: ['No: layers no longer mean distance', 'Yes: small weights do not matter', 'Yes, if you visit weight-1 first', 'No: BFS cannot handle any cycles'], a: 0, why: 'BFS minimises the number of edges, not total weight. A 3-edge path of weight 1 + 1 + 1 = 3 beats a 2-edge path of weight 2 + 2 = 4, but BFS reaches the target first via the 2-edge path. Use Dijkstra (P14), or split each weight-2 edge into two weight-1 edges.' },
        { type: 'mcq', q: `Word Ladder asks for the fewest transformations. Why BFS rather than DFS?`, opts: ['Fewest steps = unweighted shortest path', 'DFS cannot handle string vertices', 'BFS uses less memory than DFS', 'DFS would never terminate at all'], a: 0, why: 'The first time BFS reaches the target word is along a shortest transformation sequence.' }
      ]
    },
    {
      title: 'Grids: flood fill and counting islands',
      teach: `
<p>F15: a grid is an implicit graph. Counting islands = counting connected components of land cells.</p>
<pre><code>int islands = 0;
for (int r = 0; r &lt; R; r++)
    for (int c = 0; c &lt; C; c++)
        if (g[r][c] == '1') { islands++; sink(g, r, c); }   // new component

void sink(char[][] g, int r, int c) {
    if (r &lt; 0 || c &lt; 0 || r &gt;= g.length || c &gt;= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';                                   // mark visited by mutating
    sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
}</code></pre>
<div class="ex">
<div class="sub">Invariant of the outer loop</div>
<p>Every land cell in a component that has already been counted has been sunk. So when the scan meets a '1', it must belong to a <em>new</em> component.</p>
<div class="sub">Cost</div>
<p>O(R · C): each cell is sunk at most once, and each sink checks 4 neighbours.</p>
<div class="sub">The stack risk (F05)</div>
<p>Recursive sink on a 1000 × 1000 all-land grid can recurse 10⁶ deep, which is a StackOverflowError in Java. Say so, and use an explicit stack or BFS for large grids.</p>
</div>`,
      qs: [
        { type: 'num', q: `Grid rows "11000", "11000", "00100", "00011". Number of islands?`, a: 3, why: 'Top-left 2×2 block, the middle cell, and the bottom-right pair.' },
        { type: 'num', q: `Grid rows "101", "010", "101" (4-directional). Number of islands?`, a: 5, why: 'Diagonal neighbours do not connect, so each 1 is its own island.' },
        { type: 'free', q: `Why is it correct to increment the island count exactly when the scan finds an unsunk '1'? State the invariant.`, model: `<p>Invariant: after processing cells in scan order up to the current one, every land cell belonging to an already-counted island has been sunk (flood fill sinks the entire component). So an unsunk '1' can't belong to any counted island: it's the first cell seen of a new component. We count it and sink that whole component, which restores the invariant.</p>`, rubric: ['Invariant: all cells of counted islands are sunk', 'So an unsunk land cell belongs to a new island', 'Sinking the whole component maintains the invariant'] },
        { type: 'mcq', q: `The interviewer says the input grid must not be modified. Change?`, opts: ['Use a separate boolean[R][C] seen', 'Count cells instead of islands', 'Sort the grid rows first', 'Use BFS; it does not need marks'], a: 0, why: 'Visited marking is still needed; it just moves to a separate array (O(R·C) extra space).' }
      ]
    },
    {
      title: 'Multi-source BFS',
      teach: `
<p>Rotting Oranges: every rotten orange rots its 4 neighbours each minute. How many minutes until all are rotten?</p>
<div class="ex">
<div class="sub">The idea</div>
<p>Put <strong>all</strong> rotten oranges in the queue at time 0, then BFS once. That's equivalent to adding a virtual super-source connected to every rotten orange: layer d = oranges at distance d from the <em>nearest</em> rotten one.</p>
<div class="sub">Why not BFS from each rotten orange separately?</div>
<p>k sources × O(RC) each = O(k · RC). Multi-source is O(RC) once, and it directly computes the minimum over sources, which is exactly the rotting time.</p>
<div class="sub">The answer</div>
<p>The number of the last layer reached, or −1 if some fresh orange is never reached. Count fresh oranges up front and decrement as they rot.</p>
</div>
<p>Same pattern: "distance from each cell to the nearest 0", "walls and gates", "nearest exit". <strong>Many starts, one BFS.</strong></p>`,
      qs: [
        { type: 'num', q: `Rotting oranges grid [[2,1,1],[1,1,0],[0,1,1]]. Minutes until no fresh orange remains?`, a: 4, why: 'The bottom-right orange is 4 steps from the only rotten one.' },
        { type: 'num', q: `Grid [[2,1,1],[0,1,1],[1,0,1]]. Answer (−1 if impossible)?`, a: -1, why: 'The orange at bottom-left is isolated by empty cells and never rots.' },
        { type: 'free', q: `Explain why starting BFS with all rotten oranges in the queue gives each fresh orange its correct rotting time (distance to the <em>nearest</em> rotten orange).`, model: `<p>It's BFS from a virtual source s* with an edge of length 0 to every initially rotten orange. BFS's layer property gives each cell its shortest distance from s*, which is the minimum over all real sources of the distance to that source. Rot spreads simultaneously from every rotten orange, so a fresh orange rots exactly when the nearest source reaches it: the same minimum.</p>`, rubric: ['Equivalent to BFS from a virtual super-source joined to all rotten oranges', 'BFS gives the shortest distance from that source = min over real sources', 'Simultaneous spreading means rotting time = distance to the nearest source'] },
        { type: 'num', q: `Grid [[2,1,1,1,2]] (one row, rotten at both ends). Minutes needed?`, a: 2, why: 'Rot meets in the middle: the centre cell is 2 from each end.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "01 Matrix: for each cell, distance to the nearest 0." Why is a single multi-source BFS correct and O(RC), while BFS from each 1-cell is too slow?`, model: `<p>Seed the queue with every 0-cell at distance 0 and BFS outward. The layer property gives every cell its distance to the nearest seed, which is the nearest 0. Each cell is enqueued once: O(RC). BFS from each 1-cell separately would cost O(RC) per cell, O((RC)²) overall, and would recompute overlapping searches.</p>`, rubric: ['Seeds all 0s at distance 0 (multi-source)', 'The layer property gives the nearest-0 distance', 'O(RC) vs O((RC)²) for per-cell BFS'] },
    { type: 'mcq', q: `Clone Graph (deep copy of a connected undirected graph). What does the visited map store?`, opts: ['original node → its clone', 'node → its BFS distance', 'node → a boolean flag', 'clone → original node'], a: 0, why: 'It doubles as the visited set and lets you wire edges to already-created clones, including around cycles.' },
    { type: 'mcq', q: `"Is there a path from s to t?" in a huge graph where you only need yes/no. BFS or DFS?`, opts: ['Either works; both O(V + E)', 'Only BFS gives a correct answer', 'Only DFS gives a correct answer', 'Neither; it needs Dijkstra'], a: 0, why: 'Reachability needs no distances. Pick by memory profile (DFS stack depth vs BFS frontier width).' },
    { type: 'num', q: `Edges 0–1, 0–2, 1–3, 2–3, 2–4, 3–5, 4–5. How many vertices are exactly at distance 2 from vertex 0?`, a: 2, why: 'Vertices 3 and 4.' },
    { type: 'free', q: `Discriminate: BFS vs DFS. Give one problem type where each is clearly better and the deciding feature.`, model: `<p>BFS: fewest steps / shortest path in an unweighted graph (word ladder, knight moves, minimum depth). The deciding feature is that layers equal distances, and BFS can stop at the first hit. DFS: explore/enumerate structure, where only reachability or complete exploration matters: connected components, cycle detection, topological order via post-order (P13), backtracking. DFS is natural recursively and its memory is O(depth).</p>`, rubric: ['BFS for unweighted shortest paths (layers = distance)', 'DFS for full exploration / components / post-order structure', 'Names the deciding feature (distance vs structure) and a memory note'] }
  ],
  practice: [
    { name: 'Number of Islands', lc: 'LeetCode 200', prompt: `<p>Count connected groups of '1' (4-directional).</p>`, hint: `<p>Each unsunk '1' starts a new island; sink the whole component.</p>`,
      solution: `<pre><code>public int numIslands(char[][] g) {
    int n = 0;
    for (int r = 0; r &lt; g.length; r++)
        for (int c = 0; c &lt; g[0].length; c++)
            if (g[r][c] == '1') { n++; sink(g, r, c); }
    return n;
}
private void sink(char[][] g, int r, int c) {
    Deque&lt;int[]&gt; st = new ArrayDeque&lt;&gt;();
    st.push(new int[]{r, c}); g[r][c] = '0';
    int[][] D = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!st.isEmpty()) {
        int[] p = st.pop();
        for (int[] d : D) {
            int x = p[0] + d[0], y = p[1] + d[1];
            if (x &gt;= 0 &amp;&amp; y &gt;= 0 &amp;&amp; x &lt; g.length &amp;&amp; y &lt; g[0].length &amp;&amp; g[x][y] == '1') {
                g[x][y] = '0'; st.push(new int[]{x, y});
            }
        }
    }
}</code></pre><p class="cx">O(R·C). An explicit stack avoids recursion depth issues.</p>` },
    { name: 'Rotting Oranges', lc: 'LeetCode 994', prompt: `<p>Minutes until no fresh orange remains, or −1.</p>`, hint: `<p>All rotten oranges start in the queue at time 0.</p>`,
      solution: `<pre><code>public int orangesRotting(int[][] g) {
    int R = g.length, C = g[0].length, fresh = 0, minutes = 0;
    Deque&lt;int[]&gt; q = new ArrayDeque&lt;&gt;();
    for (int r = 0; r &lt; R; r++)
        for (int c = 0; c &lt; C; c++)
            if (g[r][c] == 2) q.offer(new int[]{r, c}); else if (g[r][c] == 1) fresh++;
    int[][] D = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!q.isEmpty() &amp;&amp; fresh &gt; 0) {
        minutes++;
        for (int k = q.size(); k &gt; 0; k--) {
            int[] p = q.poll();
            for (int[] d : D) {
                int x = p[0] + d[0], y = p[1] + d[1];
                if (x &gt;= 0 &amp;&amp; y &gt;= 0 &amp;&amp; x &lt; R &amp;&amp; y &lt; C &amp;&amp; g[x][y] == 1) {
                    g[x][y] = 2; fresh--; q.offer(new int[]{x, y});
                }
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}</code></pre><p class="cx">O(R·C). One minute = one BFS layer.</p>` },
    { name: 'Number of Provinces', lc: 'LeetCode 547', prompt: `<p>Count connected components given an adjacency matrix.</p>`, hint: `<p>Each unseen city starts a DFS.</p>`,
      solution: `<pre><code>public int findCircleNum(int[][] M) {
    int n = M.length, count = 0;
    boolean[] seen = new boolean[n];
    for (int i = 0; i &lt; n; i++) {
        if (seen[i]) continue;
        count++;
        Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();
        st.push(i); seen[i] = true;
        while (!st.isEmpty()) {
            int u = st.pop();
            for (int v = 0; v &lt; n; v++)
                if (M[u][v] == 1 &amp;&amp; !seen[v]) { seen[v] = true; st.push(v); }
        }
    }
    return count;
}</code></pre><p class="cx">O(n²): adjacency matrix scan (F15).</p>` }
  ]
});
