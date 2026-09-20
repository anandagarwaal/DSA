COURSE.topic({
  id: 'F15',
  intro: `Graph problems in interviews are often in disguise: course prerequisites, word ladders, islands in a grid, network delays. Before BFS or Dijkstra you need to be able to (1) see that a problem <em>is</em> a graph, (2) pick a representation, and (3) know why a traversal is O(V + E) and not O(V × E).`,
  kps: [
    {
      title: 'Vertices and edges: directed, undirected, weighted',
      teach: `
<p>A graph is a set of <strong>vertices</strong> (things) and <strong>edges</strong> (relationships between pairs of things).</p>
<div class="ex">
<div class="sub">Undirected</div>
<p>Friendship: if A is friends with B, then B is friends with A. One edge, usable both ways.</p>
<div class="sub">Directed</div>
<p>"Course A is a prerequisite of B": A → B, and not the other way. Following edges only forward matters for things like cycle detection and topological order (P13).</p>
<div class="sub">Weighted</div>
<p>Road lengths, latencies, costs. Shortest path now means smallest total weight, not fewest edges (Dijkstra, P14).</p>
<div class="sub">Spotting a graph in disguise</div>
<p>Ask: "what are the things, and what connects two things?" Word ladder: words are vertices, and an edge joins words that differ by one letter. Grid: cells are vertices, and edges join adjacent open cells. States of a puzzle: vertices are configurations, and edges are legal moves.</p>
</div>
<p>An undirected graph with V vertices has at most V(V−1)/2 edges (every pair: F14's C(V, 2)). <strong>Sparse</strong> means E is about V; <strong>dense</strong> means E is about V².</p>`,
      qs: [
        { type: 'mcq', q: `"numCourses, and pairs [a, b] meaning you must take b before a." The natural model is…`, opts: ['A directed graph b → a', 'An undirected graph on courses', 'A weighted graph on course pairs', 'A tree rooted at course zero'], a: 0, why: 'Prerequisite is one-way: b must come before a.' },
        { type: 'num', q: `Maximum number of edges in an undirected graph with 10 vertices (no self-loops or duplicates)?`, a: 45, why: 'C(10, 2) = 45, one per pair.' },
        { type: 'free', q: `"Word ladder": transform "hit" into "cog" changing one letter at a time, using only words from a dictionary. Model this as a graph: what are the vertices and edges, and what are you looking for?`, model: `<p>Vertices: dictionary words (plus the start word). Edges: undirected, between two words that differ in exactly one position. The question asks for the shortest path (fewest edges) from "hit" to "cog", which is BFS on an unweighted graph.</p>`, rubric: ['Vertices are words', 'Edges join words differing by exactly one letter (undirected, unweighted)', 'Goal: shortest path in number of edges (BFS)'] },
        { type: 'mcq', q: `Network delays with times on each connection; find how long a signal takes to reach all nodes. Graph type?`, opts: ['Directed and weighted', 'Undirected, unweighted', 'Directed, unweighted', 'A tree with no weights'], a: 0, why: 'Connections have a direction and a cost (time), so shortest weighted paths: Dijkstra.' }
      ]
    },
    {
      title: 'Adjacency list vs adjacency matrix',
      teach: `
<div class="ex">
<div class="sub">Adjacency matrix</div>
<p><code>boolean[V][V] adj</code>, where adj[u][v] says whether the edge exists. Space <strong>O(V²)</strong>. "Is there an edge u–v?" in O(1). But listing u's neighbours takes O(V), even if u has 2 neighbours.</p>
<div class="sub">Adjacency list</div>
<p><code>List&lt;List&lt;Integer&gt;&gt; adj</code>, where adj.get(u) lists u's neighbours. Space <strong>O(V + E)</strong>. Listing u's neighbours takes O(deg(u)). Edge lookup takes O(deg(u)).</p>
<div class="sub">Which one?</div>
<p>Interview graphs are almost always <strong>sparse</strong>: V = 10⁵ and E = 2 × 10⁵. A matrix would need 10¹⁰ cells (≈ 10 GB). So use an adjacency list by default, and a matrix only when V is small (≤ a few thousand) or the graph is dense.</p>
</div>
<pre><code>List&lt;List&lt;Integer&gt;&gt; adj = new ArrayList&lt;&gt;();
for (int i = 0; i &lt; n; i++) adj.add(new ArrayList&lt;&gt;());
for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); } // undirected: both directions</code></pre>`,
      qs: [
        { type: 'mcq', q: `V = 10⁵ vertices, E = 3 × 10⁵ edges. Representation?`, opts: ['Adjacency list, O(V + E) space', 'Adjacency matrix, O(1) edge checks', 'Edge list scanned per query', 'Either is fine at this size'], a: 0, why: 'A matrix needs V² = 10¹⁰ cells, far too much memory.' },
        { type: 'num', q: `An undirected graph has 7 edges. How many total entries across all adjacency lists?`, a: 14, why: 'Each undirected edge appears in both endpoints\' lists: 2E = 14.' },
        { type: 'free', q: `When would you choose an adjacency matrix over a list? Give the criteria and the trade-off.`, model: `<p>When the graph is dense (E close to V²) or V is small (a few thousand at most), and especially when you need O(1) "is there an edge u–v?" checks (e.g. Floyd–Warshall). The matrix costs O(V²) memory and O(V) per neighbour scan regardless of degree; the list costs O(V + E) memory and O(deg) scans but O(deg) edge lookups.</p>`, rubric: ['Criteria: dense graph or small V, or frequent edge-existence queries', 'Matrix: O(V²) space, O(1) edge check, O(V) neighbour scan', 'List: O(V + E) space, O(deg) neighbour scan'] },
        { type: 'mcq', q: `A BFS over an adjacency <em>matrix</em> with V vertices costs…`, opts: ['O(V²)', 'O(V + E)', 'O(E log V)', 'O(V)'], a: 0, why: 'Each dequeued vertex scans its whole row of V entries to find neighbours: V × V.' }
      ]
    },
    {
      title: 'Why a traversal is O(V + E)',
      teach: `
<p>BFS/DFS with a visited set: each vertex is processed once, and when processed, we loop over its neighbours.</p>
<div class="ex">
<div class="sub">The tempting wrong analysis</div>
<p>"V vertices, each with up to E neighbours → O(V × E)." A true bound, but wildly loose.</p>
<div class="sub">Count per edge, not per vertex</div>
<p>The inner loop over u's neighbours runs deg(u) times. Summed over all vertices: Σ deg(u) = <strong>2E</strong> for undirected graphs, since each edge is counted once from each end (E for directed).</p>
<div class="sub">Total</div>
<p>V (processing each vertex) + 2E (scanning each edge from both ends) = <strong>O(V + E)</strong>.</p>
</div>
<p>This is the same "count the total, not the worst per-iteration" move as amortized analysis (F04): a high-degree vertex does a lot of work, but only because other vertices have fewer edges.</p>
<p>Why V + E and not just E? A graph can have isolated vertices with no edges, and each still costs O(1) to consider.</p>`,
      qs: [
        { type: 'mcq', q: `BFS on an adjacency list: V = 1000, E = 5000. Work is proportional to…`, opts: ['6000', '5,000,000', '1000', '25,000,000'], a: 0, why: 'V + E (up to a constant for undirected graphs).' },
        { type: 'num', q: `Undirected graph, degrees of its vertices: 3, 2, 2, 1, 2. How many edges?`, a: 5, why: 'Sum of degrees = 10 = 2E, so E = 5.' },
        { type: 'free', q: `Explain why BFS is O(V + E) rather than O(V · E), using the sum of degrees.`, model: `<p>Each vertex is dequeued once (visited set), costing O(V) in total. When vertex u is dequeued we scan its adjacency list: deg(u) work. Summing over all vertices, Σ deg(u) = 2E, since every edge is seen once from each endpoint. So the total neighbour-scanning is O(E), not V × E, and overall O(V + E).</p>`, rubric: ['Each vertex processed once, O(V) total', 'Per-vertex scan costs deg(u); the sum over all vertices is 2E', 'Concludes O(V + E); V·E ignores that degrees sum to 2E'] },
        { type: 'mcq', q: `Why must BFS/DFS on a general graph keep a visited set, when tree traversal doesn't?`, opts: ['Graphs can have cycles or several paths', 'Graphs have far more vertices than trees', 'Visited sets make the traversal sorted', 'Trees are always too small to matter'], a: 0, why: 'Without it, a cycle loops forever, and multiple paths reprocess vertices, breaking the O(V + E) bound.' }
      ]
    },
    {
      title: 'Grids are implicit graphs',
      teach: `
<p>A 2D grid (islands, mazes, rotting oranges) is a graph you never build explicitly.</p>
<div class="ex">
<div class="sub">Vertices and edges</div>
<p>Each cell (r, c) is a vertex. Edges go to the 4 neighbours (r±1, c) and (r, c±1) that are in bounds and passable.</p>
<div class="sub">Neighbours on the fly</div>
<pre><code>int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr &lt; 0 || nr &gt;= R || nc &lt; 0 || nc &gt;= C || grid[nr][nc] == '0') continue;
    // (nr, nc) is a neighbour
}</code></pre>
<div class="sub">Size</div>
<p>V = R × C cells; each has at most 4 edges, so E ≤ 4V. Traversal is O(V + E) = <strong>O(R × C)</strong>.</p>
<div class="sub">Visited</div>
<p>Use a <code>boolean[R][C]</code>, or overwrite the grid cell (e.g. '1' → '0') if you may mutate the input. Say which one you're doing, since mutating input is a trade-off worth mentioning.</p>
</div>`,
      qs: [
        { type: 'num', q: `A 300 × 400 grid, 4-directional moves. Upper bound on the number of directed neighbour checks in a full traversal (4 per cell)?`, a: 480000, why: '300 × 400 = 120,000 cells × 4 directions = 480,000, which is O(R·C).' },
        { type: 'mcq', q: `Counting islands in an R × C grid with flood fill. Complexity?`, opts: ['O(R · C)', 'O((R · C)²)', 'O(R + C)', 'O(R · C · log(R · C))'], a: 0, why: 'Each cell is visited at most once overall; each visit checks 4 neighbours.' },
        { type: 'free', q: `Why doesn't the island-counting loop (for every cell, if land and unvisited, flood-fill) cost O((R·C)²), even though it can start a flood fill from many cells?`, model: `<p>A flood fill marks every cell it reaches as visited, and later flood fills skip visited cells. So each cell is expanded by at most one flood fill in the whole run. Summed over all flood fills the work is O(R·C) (plus the outer scan, O(R·C)), not "number of starts × size of grid". This is the amortized "each element is processed once" argument.</p>`, rubric: ['Visited marking means each cell is expanded at most once over all flood fills', 'Total work summed across fills is O(R·C)', 'Names the counting-total (amortized) argument rather than per-fill worst case'] },
        { type: 'mcq', q: `8-directional movement (including diagonals) instead of 4. Complexity changes to…`, opts: ['Still O(R · C)', 'O(R · C · log 8)', 'O((R · C)²)', 'O((R + C)²)'], a: 0, why: 'At most 8 edges per cell: still a constant per vertex.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Given an n × n board and a knight at (r1, c1), find the minimum number of moves to reach (r2, c2)." Model it as a graph and give the algorithm and complexity.`, model: `<p>Vertices: the n² squares. Edges: the (up to 8) knight moves from each square that stay on the board, undirected and unweighted. Minimum moves = shortest path in edges, so BFS from (r1, c1), generating neighbours on the fly. V = n², E ≤ 8n², so O(n²).</p>`, rubric: ['Vertices = squares, edges = legal knight moves (implicit)', 'Unweighted shortest path, so BFS', 'Complexity O(V + E) = O(n²)'] },
    { type: 'num', q: `A directed graph with V = 6 and adjacency lists of sizes 2, 0, 3, 1, 1, 0. How many edges?`, a: 7, why: 'Directed: each edge appears once, in its source\'s list. 2 + 0 + 3 + 1 + 1 + 0 = 7.' },
    { type: 'mcq', q: `V = 2000, and you need millions of "is u connected directly to v?" queries. Good representation?`, opts: ['Adjacency matrix, O(1) per check', 'Adjacency list, scan per query', 'Plain edge list, scan per query', 'Recompute BFS for every query'], a: 0, why: '2000² = 4 × 10⁶ booleans is affordable; each query becomes O(1).' },
    { type: 'mcq', q: `DFS without a visited set on the undirected graph 1–2, 2–3, 3–1 starting at 1 will…`, opts: ['Loop forever around the cycle', 'Visit each vertex exactly once', 'Visit only vertex 1 and stop', 'Fail with a compile-time error'], a: 0, why: '1 → 2 → 3 → 1 → 2 → …: cycles need a visited set. Even 1 → 2 → 1 repeats on an undirected edge.' },
    { type: 'free', q: `Why does the adjacency-list representation make BFS O(V + E), while the matrix makes it O(V²), even for the same sparse graph?`, model: `<p>With a list, scanning u's neighbours costs deg(u), and degrees sum to 2E, so neighbour scanning totals O(E). With a matrix, scanning u's neighbours means reading its whole row of V entries whether or not they're edges, so each of the V vertices costs V: O(V²). For a sparse graph (E ≈ V) that's the difference between linear and quadratic.</p>`, rubric: ['List: per-vertex scan is deg(u), summing to O(E)', 'Matrix: per-vertex scan is always V, totalling O(V²)', 'Notes the gap matters for sparse graphs (E ≪ V²)'] }
  ]
});
