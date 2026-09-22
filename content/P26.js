COURSE.topic({
  id: 'P26',
  intro: `"Connect every node as cheaply as possible": cable a network, link cities with roads, cluster points. The answer is a <strong>minimum spanning tree</strong>, and both standard algorithms are greedy, so both need a proof. That proof is the <strong>cut property</strong>, an exchange argument (P17) that also tells you exactly what an MST does <em>not</em> give you.`,
  kps: [
    {
      title: 'What an MST is, and the cut property',
      teach: `
<p>A spanning tree of a connected graph is a subset of edges that keeps everything connected with no cycles: exactly V − 1 edges (F16). A <strong>minimum</strong> spanning tree minimises the total weight.</p>
<div class="ex">
<div class="sub">The cut property</div>
<p>Take any split of the vertices into two non-empty sides (a <em>cut</em>). The <strong>cheapest edge crossing that cut is in some MST</strong>.</p>
<div class="sub">The proof (exchange argument, P17)</div>
<p>Let e be the cheapest crossing edge and take any spanning tree T without it. Adding e to T creates exactly one cycle, and that cycle must cross the cut a second time, via some other edge f. Swap: T − f + e is still a spanning tree (still connected, still V − 1 edges) and weight(e) ≤ weight(f), so it is no heavier. Hence some minimum spanning tree contains e.</p>
<div class="sub">Why that licenses greed</div>
<p>Every greedy step, Kruskal's "take the cheapest edge joining two components" and Prim's "take the cheapest edge leaving the tree", is exactly a cheapest edge across some cut. So each step is safe, and induction finishes the argument.</p>
<div class="sub">What an MST is not</div>
<p>It does <strong>not</strong> give shortest paths. The MST path between two nodes can be far longer than their shortest path; minimising total weight and minimising each pairwise distance are different goals (that's Dijkstra, P14).</p>
</div>`,
      qs: [
        { type: 'num', q: `Graph: 0–1 = 10, 0–2 = 6, 0–3 = 5, 1–3 = 15, 2–3 = 4. Total weight of the MST?`, a: 19, why: 'Edges 2–3 (4), 0–3 (5) and 0–1 (10): 19.' },
        { type: 'num', q: `A connected graph has 7 vertices. How many edges does any spanning tree have?`, a: 6, why: 'V − 1, whatever the shape (F16).' },
        { type: 'free', q: `State the cut property and prove it with an exchange argument.`, model: `<p>Cut property: for any partition of the vertices into two non-empty sets, the cheapest edge crossing the partition belongs to some MST. Proof: let e be that edge and T any spanning tree not containing it. Adding e to T creates exactly one cycle; since e crosses the cut, the cycle must cross back via another edge f. T − f + e is still connected and has V − 1 edges, so it is a spanning tree, and since e is the cheapest crossing edge, weight(e) ≤ weight(f), so the new tree is no heavier. Hence an MST containing e exists.</p>`, rubric: ['States the property for an arbitrary cut', 'Adding e creates a cycle that must cross the cut again at some f', 'Swapping keeps a spanning tree and does not increase weight'] },
        { type: 'mcq', q: `Does the MST contain the shortest path between every pair of nodes?`, opts: ['No: it minimises total weight only', 'Yes, by the cut property', 'Yes, if weights are distinct', 'Only for unweighted graphs'], a: 0, why: 'Path lengths in the MST can be much worse than shortest paths; different objective (P14).' }
      ]
    },
    {
      title: 'Kruskal: sort edges, union if they join two components',
      teach: `
<pre><code>Arrays.sort(edges, (a, b) -&gt; Integer.compare(a[2], b[2]));   // by weight
DSU dsu = new DSU(n);
long total = 0; int used = 0;
for (int[] e : edges) {
    if (dsu.union(e[0], e[1])) { total += e[2]; used++; }      // joined two components
    if (used == n - 1) break;                                  // tree complete
}</code></pre>
<div class="ex">
<div class="sub">Why the union-find test is exactly the cut test</div>
<p>When the cheapest remaining edge joins two different components, it is the cheapest edge crossing the cut that separates one of those components from the rest (everything cheaper has already been considered and lies inside components). So the cut property says taking it is safe. If the endpoints share a component, the edge would close a cycle (P15) and is discarded.</p>
<div class="sub">Worked example</div>
<p>Edges sorted: 2–3 (4), 0–3 (5), 0–2 (6), 0–1 (10), 1–3 (15). Take 4, take 5, <em>reject</em> 6 (0 and 2 already connected), take 10. Total <strong>19</strong>, with 3 = V − 1 edges.</p>
<div class="sub">Cost</div>
<p>O(E log E) for the sort, plus O(E α(V)) for the unions: the sort dominates.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In Kruskal, what does it mean when <code>union</code> returns false?`, opts: ['The edge would close a cycle', 'The edge weight is negative', 'The graph is disconnected', 'The tree is already complete'], a: 0, why: 'Both endpoints are already connected, so this edge is redundant (P15).' },
        { type: 'num', q: `Same graph (0–1 = 10, 0–2 = 6, 0–3 = 5, 1–3 = 15, 2–3 = 4). How many edges does Kruskal reject?`, a: 2, why: 'It takes 4, 5, 10 and rejects 6 and 15: five edges, three used.' },
        { type: 'free', q: `Why is "cheapest edge joining two different components" always a cheapest edge across some cut?`, model: `<p>Take the cut that separates one of the two components from everything else. Every edge crossing that cut has at least the current edge's weight: cheaper edges were processed earlier and either joined components (so they lie inside one side now) or were rejected as internal. So the current edge is a cheapest crossing edge for that cut, and the cut property makes taking it safe.</p>`, rubric: ['Chooses the cut separating one endpoint\'s component from the rest', 'All cheaper edges were already processed and are internal', 'So this edge is cheapest across that cut; the cut property applies'] },
        { type: 'mcq', q: `Kruskal's complexity on a sparse graph (E ≈ V)?`, opts: ['O(E log E), dominated by the sort', 'O(V²), dominated by the unions', 'O(E α(V)) with no sorting cost', 'O(V log V) regardless of E'], a: 0, why: 'Union-find is nearly constant; sorting the edges is the expensive part.' }
      ]
    },
    {
      title: 'Prim: grow one tree with a heap',
      teach: `
<pre><code>boolean[] inTree = new boolean[n];
PriorityQueue&lt;int[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a[1], b[1]));
pq.offer(new int[]{start, 0});
long total = 0;
while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int u = top[0];
    if (inTree[u]) continue;                 // stale entry (lazy deletion, P14)
    inTree[u] = true;
    total += top[1];
    for (int[] e : adj.get(u))               // e = {to, weight}
        if (!inTree[e[0]]) pq.offer(new int[]{e[0], e[1]});
}</code></pre>
<div class="ex">
<div class="sub">The cut here</div>
<p>The cut is "in the tree" versus "not in the tree". Prim always takes the cheapest edge crossing it, so the cut property applies directly at every step.</p>
<div class="sub">Compared with Dijkstra</div>
<p>Nearly identical code; the difference is what the priority means. Dijkstra keys by <em>distance from the source</em> (cumulative), Prim by <em>edge weight alone</em> (the cost of attaching one node). One line apart, completely different objectives.</p>
<div class="sub">Cost</div>
<p>O(E log V) with a binary heap. On a dense graph an O(V²) array version is better; on sparse graphs, Kruskal and Prim are comparable, so pick by what you already have: an edge list favours Kruskal, an adjacency list favours Prim.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `The one-line difference between Dijkstra and Prim is…`, opts: ['The key: cumulative distance vs edge weight', 'Dijkstra uses a heap, Prim does not', 'Prim needs sorted edges first', 'Dijkstra cannot use adjacency lists'], a: 0, why: 'Prim asks "cheapest way to attach one more node", Dijkstra "cheapest way to reach a node from the source".' },
        { type: 'mcq', q: `Which cut does Prim use at each step?`, opts: ['Tree vertices vs the rest', 'Visited vs unvisited edges', 'Cheap vs expensive edges', 'Left half vs right half'], a: 0, why: 'It grows one component, always taking the cheapest edge leaving it.' },
        { type: 'mcq', q: `Dense graph, V = 2000, E ≈ V². Better MST implementation?`, opts: ['Prim with an O(V²) array scan', 'Kruskal with an edge sort', 'Prim with a binary heap', 'Either: both are O(V log V)'], a: 0, why: 'Sorting 4 × 10⁶ edges (or heap-pushing them) is worse than V² = 4 × 10⁶ simple scans with no heap overhead.' },
        { type: 'free', q: `Both Kruskal and Prim are greedy and both are correct. Explain how the same cut property justifies two different-looking algorithms.`, model: `<p>The cut property does not name a particular cut: it says that for <em>any</em> cut, its cheapest crossing edge is safe. Prim fixes one cut (tree vs rest) and repeatedly takes its cheapest crossing edge. Kruskal instead processes edges in weight order; each accepted edge is cheapest across the cut separating the component it joins, because all cheaper edges are already internal. Different cuts, same safety argument, so induction completes both proofs.</p>`, rubric: ['The property holds for every cut, not one specific cut', 'Prim uses the tree-vs-rest cut each step', 'Kruskal uses the cut around the component being joined; cheaper edges are already internal'] }
      ]
    },
    {
      title: 'Choosing, and what MST does not do',
      teach: `
<div class="ex">
<div class="sub">Pick by input shape</div>
<p>Edge list given, or you need edges sorted anyway → Kruskal (plus union-find, which you may already have). Adjacency list and a dense graph → Prim. Both O(E log V)-ish; neither is "the" right answer.</p>
<div class="sub">Disconnected input</div>
<p>Kruskal naturally produces a minimum spanning <em>forest</em>: after the loop, if fewer than V − 1 edges were used, the graph was disconnected. Prim finds only the component containing its start, so it needs an outer loop over unvisited vertices.</p>
<div class="sub">Common variants</div>
<p><strong>Maximum</strong> spanning tree: sort descending, everything else identical. <strong>Points in the plane</strong> (LeetCode 1584): build all C(n,2) edges with Manhattan distance and run Kruskal, O(n² log n) for n ≤ 1000. <strong>Second-best MST</strong> or "is edge e in some MST?": needs the maximum edge on a tree path, which is binary lifting with a max table (P22).</p>
<div class="sub">The trap worth naming</div>
<p>If asked for "the cheapest way to get from A to B", MST is the wrong tool: use Dijkstra. If asked to "connect everything cheaply", it's the right one. Listen for whether the objective is <em>pairwise</em> or <em>global</em>.</p>
</div>`,
      qs: [
        { type: 'num', q: `Points (0,0), (2,2), (3,10), (5,2), (7,0) with Manhattan distance. Minimum cost to connect all points?`, a: 20, why: 'The MST over the complete distance graph totals 20 (LeetCode 1584).' },
        { type: 'mcq', q: `The graph is disconnected. Kruskal…`, opts: ['Yields a spanning forest; count the edges', 'Throws an error on the first cycle', 'Connects components with infinite edges', 'Gives a wrong answer silently'], a: 0, why: 'It takes every safe edge; fewer than V − 1 used means more than one component.' },
        { type: 'mcq', q: `Maximum spanning tree requires which change?`, opts: ['Sort edges descending', 'Negate then run Dijkstra', 'Use Prim with a max-heap only', 'It is impossible in general'], a: 0, why: 'The cut property mirrors: the most expensive crossing edge is in some maximum spanning tree.' },
        { type: 'free', q: `"Find the minimum cost to connect all cities" vs "find the cheapest route from city A to city B". Which tool for each, and why is using the other one wrong?`, model: `<p>Connect all cities: MST (Kruskal or Prim), because the objective is the total weight of a connected subgraph. Cheapest route A→B: Dijkstra, because the objective is one pairwise distance. Using an MST for routing is wrong because the unique MST path between two nodes can be far longer than their true shortest path; using Dijkstra for connectivity is wrong because a shortest-path tree from one source minimises distances from that source, not the total edge weight.</p>`, rubric: ['MST for global connection cost; Dijkstra for a pairwise route', 'MST paths can be much longer than shortest paths', 'A shortest-path tree does not minimise total weight'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Graph 0–1 = 10, 0–2 = 6, 0–3 = 5, 1–3 = 15, 2–3 = 4. Weight of the heaviest edge in the MST?`, a: 10, why: 'The MST uses 4, 5 and 10.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Connect n cities; each city may instead build its own well at cost w[i]." Reduce this to an MST problem.`, model: `<p>Add a virtual node 0 and an edge 0–i of weight w[i] for every city, alongside the given pipe edges. A spanning tree of this enlarged graph picks, for each connected group of cities, exactly one link to the virtual node, which is that group's well; all other edges are pipes. So the minimum spanning tree of the n + 1 node graph is exactly the cheapest combination of wells and pipes. Run Kruskal on the combined edge list: O(E log E).</p>`, rubric: ['Adds a virtual node with edges of weight w[i] to each city', 'A spanning tree then chooses one well per connected group', 'MST of the enlarged graph is the answer; O(E log E)'] },
    { type: 'mcq', q: `All edge weights are distinct. How many MSTs does the graph have?`, opts: ['Exactly one MST', 'At least two MSTs', 'Exactly V − 1 of them', 'Depends on the start vertex'], a: 0, why: 'With no ties, every cut has a strict cheapest crossing edge, so the exchange argument forces a unique answer. Ties are what create multiple MSTs.' },
    { type: 'num', q: `Prim on a graph with V = 1000 and E = 5000, using a binary heap. Roughly how many heap operations (E log V, in thousands)?`, a: 50, tol: 10, why: '5000 edges × log₂ 1000 ≈ 10 → about 5 × 10⁴.' },
    { type: 'free', q: `Explain why a greedy algorithm is correct for MST but wrong for coin change (P16), in terms of what the exchange argument needs.`, model: `<p>For MST, the exchange argument works: given any optimal tree and the greedy edge e, you can swap e in and some other crossing edge out, staying valid and no heavier. That is exactly what the cut property proves. For coin change with arbitrary coins, no such swap exists: taking the largest coin can force strictly more coins overall (1, 3, 4 with amount 6: greedy 4 + 1 + 1, optimal 3 + 3), and there is no way to exchange the greedy choice into an optimal solution without increasing the count. Greedy needs a provable exchange; where it fails, DP (which tries every option) is the fallback.</p>`, rubric: ['MST: swapping the greedy edge into any optimal tree keeps it valid and no heavier (cut property)', 'Coin change: gives the counterexample where no such exchange exists', 'Concludes greedy needs a valid exchange; otherwise use DP'] }
  ],
  practice: [
    { name: 'Min Cost to Connect All Points', lc: 'LeetCode 1584 · CSES Road Reparation', prompt: `<p>Points in the plane, Manhattan distance; connect all of them as cheaply as possible.</p>`, hint: `<p>Build all pairwise edges, then Kruskal with union-find.</p>`,
      solution: `<pre><code>public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    List&lt;int[]&gt; edges = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; n; i++)
        for (int j = i + 1; j &lt; n; j++) {
            int w = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
            edges.add(new int[]{w, i, j});
        }
    edges.sort((a, b) -&gt; Integer.compare(a[0], b[0]));
    int[] parent = new int[n];
    for (int i = 0; i &lt; n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int[] e : edges) {
        int ra = find(parent, e[1]), rb = find(parent, e[2]);
        if (ra == rb) continue;
        parent[rb] = ra;
        total += e[0];
        if (++used == n - 1) break;
    }
    return total;
}
private int find(int[] parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}</code></pre><p class="cx">O(n² log n) for n ≤ 1000: building the complete graph dominates.</p>` },
    { name: 'Prim with a heap', lc: 'CSES Road Reparation (alternative)', prompt: `<p>MST weight of a connected weighted graph given as an adjacency list, or −1 if disconnected.</p>`, hint: `<p>Grow the tree, skipping stale heap entries.</p>`,
      solution: `<pre><code>public long primMST(int n, List&lt;List&lt;int[]&gt;&gt; adj) {   // adj entries: {to, weight}
    boolean[] inTree = new boolean[n];
    PriorityQueue&lt;int[]&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a[1], b[1]));
    pq.offer(new int[]{0, 0});
    long total = 0;
    int count = 0;
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int u = top[0];
        if (inTree[u]) continue;                 // stale entry
        inTree[u] = true;
        total += top[1];
        count++;
        for (int[] e : adj.get(u))
            if (!inTree[e[0]]) pq.offer(new int[]{e[0], e[1]});
    }
    return count == n ? total : -1;              // fewer visited means disconnected
}</code></pre><p class="cx">O(E log V). The cut is always "in the tree" vs "outside".</p>` }
  ]
});
