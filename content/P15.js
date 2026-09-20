COURSE.topic({
  id: 'P15',
  intro: `Union-find (disjoint set union) answers one question as groups <em>merge over time</em>: <strong>"are these two things in the same group?"</strong> BFS/DFS can answer it too, but only by recomputing components from scratch after every change. Union-find maintains them incrementally in near-constant amortized time, which is why it's the tool for connectivity queries, cycle detection in undirected graphs and Kruskal's MST.`,
  kps: [
    {
      title: 'Parent pointers: a forest of groups',
      teach: `
<p>Each element points to a parent; following parents leads to the group's <strong>root</strong>, which represents the group. Two elements are in the same group exactly when they have the same root.</p>
<pre><code>int[] parent = new int[n];
for (int i = 0; i &lt; n; i++) parent[i] = i;      // everyone starts alone

int find(int x) {
    while (parent[x] != x) x = parent[x];        // walk to the root
    return x;
}
boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;                  // already together
    parent[rb] = ra;                             // hang one root under the other
    return true;
}</code></pre>
<div class="ex">
<div class="sub">What the trees mean</div>
<p>Nothing except grouping. The tree shape isn't the graph's shape: it's just bookkeeping about who was merged with whom.</p>
<div class="sub">Counting components</div>
<p>Start a counter at n and decrement it on every successful union. Union returning false means "already connected", which is exactly the cycle test in an undirected graph.</p>
<div class="sub">The danger without optimisations</div>
<p>Merging blindly can build a chain of n nodes, making find O(n). Two fixes come next.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Two elements are in the same set exactly when…`, opts: ['find returns the same root', 'they have the same parent', 'they were created together', 'their values are equal'], a: 0, why: 'The root identifies the set; parents differ within one set.' },
        { type: 'mcq', q: `<code>union(a, b)</code> returns false. In an undirected graph being built edge by edge, this means…`, opts: ['This edge closes a cycle', 'The edge is a self-loop', 'The graph is disconnected', 'One vertex does not exist'], a: 0, why: 'a and b were already connected, so adding the edge creates a second path between them: a cycle.' },
        { type: 'num', q: `Start with 6 singletons; perform union(0,1), union(2,3), union(1,3), union(4,5). How many components remain?`, a: 2, why: 'All four unions succeed, so the count drops from 6 to 2: the sets are {0,1,2,3} and {4,5}.' },
        { type: 'free', q: `Why can't you answer "are a and b connected?" by comparing <code>parent[a]</code> with <code>parent[b]</code>?`, model: `<p>A set is a tree that can be several levels deep, so two elements of the same set usually have different parents; only the <em>root</em> is shared. Comparing parents would say "not connected" for elements deeper in the same tree. You must follow parents all the way up (find) and compare roots.</p>`, rubric: ['Sets are trees of depth &gt; 1, so parents differ inside one set', 'Only the root is common to the whole set', 'So compare find(a) with find(b)'] }
      ]
    },
    {
      title: 'Path compression and union by rank',
      teach: `
<div class="ex">
<div class="sub">Union by rank (or size): attach the smaller tree under the bigger</div>
<p>Keep an approximate height (rank). Hanging the shorter tree under the taller one never increases the height unless both are equal. This alone keeps trees at height ≤ log₂ n: to reach height h you need at least 2ʰ elements.</p>
<div class="sub">Path compression: flatten on the way up</div>
<pre><code>int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];   // point to grandparent: halves the path
        x = parent[x];
    }
    return x;
}</code></pre>
<p>Every find shortens the path it walked, so repeated queries on the same set get cheaper and cheaper.</p>
<div class="sub">Together: α(n), inverse Ackermann</div>
<p>With both, m operations cost O(m · α(n)) amortized, where α(n) ≤ 4 for any n you'll ever see (α of the number of atoms in the universe is still under 5). Treat it as "effectively constant", but say <em>amortized near-constant</em>, not O(1).</p>
</div>
<p>Either optimisation alone is already good (log n); together they're near-constant. Interviewers usually accept path compression + union by size.</p>`,
      qs: [
        { type: 'mcq', q: `With union by rank alone, the maximum tree height for n elements is about…`, opts: ['log₂ n', 'n', '√n', 'n / 2'], a: 0, why: 'A tree of height h needs ≥ 2ʰ elements, so h ≤ log₂ n. For n = 10⁵ that is at most 16.' },
        { type: 'mcq', q: `What does path compression do during <code>find</code>?`, opts: ['Re-points nodes nearer the root', 'Sorts the elements by rank', 'Merges two different sets', 'Deletes nodes from the tree'], a: 0, why: 'Nodes on the walked path are re-attached closer to (or directly at) the root, so later finds are shorter.' },
        { type: 'free', q: `Why is union-find's complexity described as <em>amortized</em> near-constant rather than worst-case O(1)?`, model: `<p>A single find can still be expensive: the first traversal of a long path costs its length. But that traversal compresses the path, so the cost is prepaid for later operations (F04's banker's argument). Averaged over any sequence of m operations, the total is O(m · α(n)), with α(n) ≤ 4 in practice. No individual operation is guaranteed O(1).</p>`, rubric: ['One find can be long; compression makes later ones cheap', 'Amortized over a sequence: O(m · α(n))', 'States that no single operation is guaranteed constant'] },
        { type: 'mcq', q: `Which pair of optimisations is the standard interview answer?`, opts: ['Path compression + union by size/rank', 'Sorting the input before unions', 'Recursion + a hash map of parents', 'Binary search over the parents'], a: 0, why: 'They are the two that produce the α(n) bound.' }
      ]
    },
    {
      title: 'When union-find beats BFS/DFS',
      teach: `
<div class="ex">
<div class="sub">Use union-find when…</div>
<p>(1) Edges <strong>arrive over time</strong> and you must answer connectivity as you go ("after each edge, how many components?"). (2) You only need "same group?", not paths or distances. (3) You're building an MST with Kruskal: sort edges, add one if it joins two different components.</p>
<div class="sub">Use BFS/DFS when…</div>
<p>You need distances or actual paths (union-find knows nothing about them), the graph is static and you just want components once (a single O(V + E) sweep is simpler), or you need traversal order (topological sort, P13).</p>
<div class="sub">The cost comparison</div>
<p>q connectivity queries on a changing graph: union-find is O((V + q) α); recomputing components with BFS after each change is O(q · (V + E)).</p>
<div class="sub">The directed-graph caveat</div>
<p>Union-find models <em>undirected</em> connectivity only. It can't express "u reaches v but not back", so it's useless for cycle detection in directed graphs (use DFS colours, P13).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Edges are added one at a time; after each, report the number of connected components. Best tool?`, opts: ['Union-find with a component counter', 'BFS re-run after each edge', 'Dijkstra from every vertex', 'Topological sort each time'], a: 0, why: 'Each edge is one union: O(α) per update instead of O(V + E).' },
        { type: 'mcq', q: `Why can\'t union-find detect cycles in a <em>directed</em> graph?`, opts: ['It ignores edge direction entirely', 'It only works on trees', 'It cannot store more than n edges', 'Its find operation is too slow'], a: 0, why: 'Merging sets loses direction; u → v and v → u look identical.' },
        { type: 'free', q: `Kruskal's MST sorts edges by weight and adds an edge if it joins two different components. Why is union-find the right structure, and what does a rejected edge mean?`, model: `<p>Kruskal repeatedly asks "would this edge connect two currently separate groups?", which is exactly find(a) == find(b), and then merges them: union. That's O(E log E) for the sort plus O(E α) for the unions. A rejected edge means both endpoints are already connected by cheaper edges, so adding it would create a cycle and can't improve the tree.</p>`, rubric: ['Kruskal needs same-component queries plus merging: exactly find/union', 'Cost: sort dominates, O(E log E)', 'A rejected edge would close a cycle (endpoints already connected by cheaper edges)'] },
        { type: 'mcq', q: `You need the shortest path between two cities in a road network. Union-find can…`, opts: ['Only say whether a route exists', 'Give the shortest distance', 'List the path taken', 'Rank routes by length'], a: 0, why: 'It stores grouping, not structure or distance: use BFS/Dijkstra for those.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Satisfiability of equality equations": strings like "a==b" and "b!=c". Decide if all can hold at once. Give the algorithm and why the order of processing matters.`, model: `<p>Two passes. First process every "==" equation with union, building the groups forced to be equal. Then check each "!=": if its two variables have the same root, the constraints contradict, so return false. Order matters because a "!=" must be tested against <em>all</em> equalities, including ones appearing later in the list; testing it early could miss a union that happens afterwards.</p>`, rubric: ['Pass 1: union all equalities', 'Pass 2: reject if any inequality has both sides in one set', 'Order matters: all unions must be done before checking inequalities'] },
    { type: 'mcq', q: `Redundant Connection: edges [[1,2],[1,3],[2,3]]. Which edge is redundant?`, opts: ['[2, 3]', '[1, 2]', '[1, 3]', 'None of them'], a: 0, why: 'Processing in order, 1-2 and 1-3 merge fine; 2-3 finds both already connected, so it closes the cycle.' },
    { type: 'num', q: `n = 8 singletons, then 5 successful unions. How many components?`, a: 3, why: 'Each successful union reduces the count by exactly one: 8 − 5.' },
    { type: 'mcq', q: `Equations ["a==b", "b!=a"]. Satisfiable?`, opts: ['No: a and b are in one set', 'Yes: the order differs', 'Yes: != is ignored', 'Only if a and b differ'], a: 0, why: 'The union forces them equal, and the inequality then finds equal roots.' },
    { type: 'free', q: `Explain why a successful union always reduces the component count by exactly one, and why that makes the counter trustworthy.`, model: `<p>A union succeeds only when find(a) ≠ find(b), i.e. a and b are in two distinct groups. Merging them replaces those two groups with one, so the total drops by exactly one. If the roots are equal, no merge happens and the count is unchanged. Since every change to the structure goes through union, decrementing on success keeps the counter exactly equal to the number of groups.</p>`, rubric: ['Success means two distinct sets merge into one: count − 1', 'Failure means no structural change, so no decrement', 'All changes pass through union, so the counter stays exact'] }
  ],
  practice: [
    { name: 'Redundant Connection', lc: 'LeetCode 684', prompt: `<p>A tree plus one extra edge. Return the edge that can be removed (the last one that closes a cycle).</p>`, hint: `<p>The first union that fails is the answer.</p>`,
      solution: `<pre><code>public int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    int[] parent = new int[n + 1], rank = new int[n + 1];
    for (int i = 0; i &lt;= n; i++) parent[i] = i;
    for (int[] e : edges) {
        int ra = find(parent, e[0]), rb = find(parent, e[1]);
        if (ra == rb) return e;                       // closes a cycle
        if (rank[ra] &lt; rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
    }
    return new int[0];
}
private int find(int[] parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}</code></pre><p class="cx">O(E α(V)).</p>` },
    { name: 'Number of Provinces (union-find)', lc: 'LeetCode 547', prompt: `<p>Count connected components from an adjacency matrix, using union-find.</p>`, hint: `<p>Start the counter at n and decrement on each successful union.</p>`,
      solution: `<pre><code>public int findCircleNum(int[][] M) {
    int n = M.length, components = n;
    int[] parent = new int[n];
    for (int i = 0; i &lt; n; i++) parent[i] = i;
    for (int i = 0; i &lt; n; i++)
        for (int j = i + 1; j &lt; n; j++)
            if (M[i][j] == 1) {
                int ri = find(parent, i), rj = find(parent, j);
                if (ri != rj) { parent[rj] = ri; components--; }
            }
    return components;
}
private int find(int[] parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}</code></pre><p class="cx">O(n² α(n)): the matrix scan dominates.</p>` },
    { name: 'Satisfiability of Equality Equations', lc: 'LeetCode 990', prompt: `<p>Equations like "a==b", "b!=c". Can all hold?</p>`, hint: `<p>Union all equalities first, then test the inequalities.</p>`,
      solution: `<pre><code>public boolean equationsPossible(String[] equations) {
    int[] parent = new int[26];
    for (int i = 0; i &lt; 26; i++) parent[i] = i;
    for (String e : equations)
        if (e.charAt(1) == '=') {
            int ra = find(parent, e.charAt(0) - 'a'), rb = find(parent, e.charAt(3) - 'a');
            parent[rb] = ra;
        }
    for (String e : equations)
        if (e.charAt(1) == '!' &amp;&amp; find(parent, e.charAt(0) - 'a') == find(parent, e.charAt(3) - 'a'))
            return false;
    return true;
}
private int find(int[] parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}</code></pre><p class="cx">O(n α(26)). Two passes: equalities before inequalities.</p>` }
  ]
});
