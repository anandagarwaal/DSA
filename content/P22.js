COURSE.topic({
  id: 'P22',
  intro: `"How far apart are these two nodes?" asked a million times on a fixed tree. Walking up from both nodes is O(n) per query. <strong>Binary lifting</strong> precomputes ancestors at distances 1, 2, 4, 8, … so any climb takes O(log n) jumps, because every number is a sum of distinct powers of two (F02). The same table answers k-th ancestor, lowest common ancestor and path distance.`,
  kps: [
    {
      title: 'Jump pointers: up[k][v] is the 2^k-th ancestor',
      teach: `
<p>Store, for each node v and each power k, the ancestor 2ᵏ levels above it.</p>
<div class="ex">
<div class="sub">The recurrence</div>
<p>A jump of 2ᵏ is two jumps of 2ᵏ⁻¹: <code>up[k][v] = up[k−1][ up[k−1][v] ]</code>. Base: <code>up[0][v] = parent(v)</code>, with −1 (or the root) for missing ancestors.</p>
<pre><code>int LOG = 1;
while ((1 &lt;&lt; LOG) &lt; n) LOG++;
int[][] up = new int[LOG + 1][n];
Arrays.fill(up[0], -1);
// up[0][v] = parent, filled by a DFS/BFS from the root
for (int k = 1; k &lt;= LOG; k++)
    for (int v = 0; v &lt; n; v++)
        up[k][v] = (up[k-1][v] &lt; 0) ? -1 : up[k-1][ up[k-1][v] ];</code></pre>
<div class="sub">Worked example</div>
<p>Tree: 0 is the root with children 1 and 2; 1 has children 3 and 4; 2 has child 5; 3 has child 6. Then up[0] = [−, 0, 0, 1, 1, 2, 3] and up[1][6] = up[0][up[0][6]] = up[0][3] = <strong>1</strong>: node 6's grandparent.</p>
<div class="sub">Cost</div>
<p>Build O(n log n) time and memory; each query O(log n). For n = 10⁵, LOG = 17, so the table is about 1.7 × 10⁶ ints: fine.</p>
</div>`,
      qs: [
        { type: 'num', q: `Tree: parent(1)=0, parent(2)=0, parent(3)=1, parent(4)=1, parent(5)=2, parent(6)=3. What is up[1][6] (the ancestor 2 levels above node 6)?`, a: 1, why: 'up[0][6] = 3, and up[0][3] = 1.' },
        { type: 'mcq', q: `Why is <code>up[k][v] = up[k−1][up[k−1][v]]</code> correct?`, opts: ['2ᵏ = 2ᵏ⁻¹ + 2ᵏ⁻¹: two half jumps', 'Because the tree is kept balanced', 'It memoises the parent array', 'Because ancestors are sorted'] , a: 0, why: 'Climbing 2ᵏ⁻¹ twice lands exactly 2ᵏ levels up.' },
        { type: 'num', q: `n = 10⁵ nodes. How many levels (LOG) does the jump table need?`, a: 17, why: '2¹⁷ = 131072 ≥ 10⁵, so powers 0..17.' },
        { type: 'free', q: `Why does this table make a climb of ANY height k cost only O(log n) jumps?`, model: `<p>Write k in binary: it is a sum of distinct powers of two, at most log₂ k of them. For each set bit b, jump up[b] from the current node; each jump is a table lookup, O(1). Because the jumps compose (a jump of 2^a then 2^b lands 2^a + 2^b levels up), the total climb equals k exactly, in as many steps as k has set bits: O(log n).</p>`, rubric: ['k in binary is a sum of distinct powers of two', 'One O(1) table lookup per set bit', 'Jumps compose, so the total is exactly k, in ≤ log n steps'] }
      ]
    },
    {
      title: 'The k-th ancestor from the binary expansion',
      teach: `
<pre><code>int kthAncestor(int v, int k) {
    for (int b = 0; v != -1 &amp;&amp; k &gt; 0; b++, k &gt;&gt;= 1)
        if ((k &amp; 1) == 1) v = up[b][v];
    return v;                     // -1 if it climbed past the root
}</code></pre>
<div class="ex">
<div class="sub">Worked example</div>
<p>k = 13 = 1101₂ = 8 + 4 + 1. So jump 1, then 4, then 8: three lookups instead of thirteen steps.</p>
<div class="sub">The picture</div>
<p>A ladder where you may only take steps of 1, 2, 4, 8, …, each usable once. Binary says every height is reachable, and greedily taking the largest fitting step is exactly the binary expansion.</p>
<div class="sub">Edge cases that matter</div>
<p>If the climb passes the root, return −1 (or a sentinel). Checking <code>depth[v] &lt; k</code> up front is cleaner than discovering it mid-climb.</p>
</div>`,
      qs: [
        { type: 'num', q: `Using jump pointers, how many table lookups does a climb of exactly 13 levels take?`, a: 3, why: '13 = 8 + 4 + 1: three set bits.' },
        { type: 'num', q: `Tree from before (6 → 3 → 1 → 0). What is the 2nd ancestor of node 6?`, a: 1, why: '6 → 3 → 1.' },
        { type: 'mcq', q: `A climb of k = 16 levels costs how many lookups?`, opts: ['1, since 16 is one power of two', '16, one lookup per level climbed', '4, which is log₂ of 16', '5, the bits of 16 plus one'], a: 0, why: 'Powers of two are the cheapest climbs: a single table entry.' },
        { type: 'free', q: `What should kthAncestor return when k exceeds the node's depth, and how would you detect that cleanly?`, model: `<p>There is no such ancestor, so return a sentinel (−1, or null). The clean check is to precompute depth[] during the initial DFS and test <code>depth[v] &lt; k</code> before climbing: an O(1) guard with an unambiguous meaning. Relying on the climb hitting −1 mid-way also works but every jump must then test for −1, which is easy to get wrong.</p>`, rubric: ['Return a sentinel (−1/null): no such ancestor exists', 'Guard with depth[v] &lt; k, computed in the initial DFS', 'Notes the alternative (checking −1 during the climb) is more error-prone'] }
      ]
    },
    {
      title: 'LCA: level up, then jump while the ancestors differ',
      teach: `
<pre><code>int lca(int u, int v) {
    if (depth[u] &lt; depth[v]) { int t = u; u = v; v = t; }   // u is the deeper one
    u = kthAncestor(u, depth[u] - depth[v]);                // 1. equalise depth
    if (u == v) return u;                                   // one was the other's ancestor
    for (int k = LOG; k &gt;= 0; k--)                          // 2. climb together while different
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
    return up[0][u];                                        // 3. the parent is the LCA
}</code></pre>
<div class="ex">
<div class="sub">Why climb only while the ancestors DIFFER</div>
<p>If up[k][u] == up[k][v], that ancestor is common but might be far above the lowest one, so jumping there could overshoot. If they differ, the LCA is still strictly higher, so the jump is safe. Going from the largest power downwards lands u and v exactly one step below the LCA, and the answer is their parent.</p>
<div class="sub">Worked example</div>
<p>Same tree. lca(6, 4): depths 3 and 2, so lift 6 to depth 2 (node 3). 3 ≠ 4; the largest safe jumps bring both to 3 and 4 with differing parents, so the answer is parent = <strong>1</strong>. And lca(6, 5) = <strong>0</strong>.</p>
<div class="sub">Distance</div>
<p><code>dist(u, v) = depth[u] + depth[v] − 2·depth[lca(u, v)]</code>: go up from each to the meeting point. dist(6, 5) = 3 + 2 − 0 = <strong>5</strong>.</p>
</div>`,
      qs: [
        { type: 'num', q: `Tree: 0 root; children 1, 2; 1 has 3, 4; 2 has 5; 3 has 6. What is lca(6, 4)?`, a: 1, why: 'Both sit under node 1; 6 → 3 → 1 and 4 → 1.' },
        { type: 'num', q: `Same tree. What is dist(6, 5)?`, a: 5, why: 'depth 3 + depth 2 − 2 × depth(lca = 0) = 5: the path 6-3-1-0-2-5.' },
        { type: 'free', q: `Explain why the LCA loop jumps only when <code>up[k][u] != up[k][v]</code>, rather than when they are equal.`, model: `<p>Equal ancestors mean the jump reaches a <em>common</em> ancestor, but possibly one above the lowest one, so taking it could overshoot and lose the answer. Differing ancestors prove the LCA is strictly higher than that jump, so moving both nodes up 2ᵏ is safe. Scanning k from the largest power down makes each safe jump as large as possible, ending with u and v exactly one level below the LCA, whose parent is then the answer.</p>`, rubric: ['Equal at 2ᵏ means that ancestor may be above the LCA: overshoot risk', 'Different at 2ᵏ proves the LCA is higher, so the jump is safe', 'Descending powers land one below the LCA; return the parent'] },
        { type: 'mcq', q: `u is an ancestor of v. What happens in the algorithm?`, opts: ['Depths equalise, u == v, return early', 'The loop runs and returns the root', 'It returns −1 to signal this case', 'It loops forever once depths match'], a: 0, why: 'Lifting the deeper node lands exactly on the other, which is the LCA.' }
      ]
    },
    {
      title: 'What else the table answers',
      teach: `
<div class="ex">
<div class="sub">Path queries by prefix trick</div>
<p>Precompute <code>rootDist[v]</code> (sum of edge weights from the root). Then the weighted path length is <code>rootDist[u] + rootDist[v] − 2·rootDist[lca]</code>: the prefix-sum subtraction of P18, applied to a tree.</p>
<div class="sub">Max edge on a path</div>
<p>Store a second table <code>maxEdge[k][v]</code> = heaviest edge on the 2ᵏ climb, built with the same recurrence using max instead of composition. Query the same way, taking the max of the jumps you make. Useful for "is this edge in the MST?" style questions (P26).</p>
<div class="sub">Company Queries (CSES)</div>
<p>"Who is the k-th boss of employee x?" is k-th ancestor; "who is the lowest common boss of x and y?" is LCA. Both are direct.</p>
<div class="sub">When NOT to use it</div>
<p>One query: a single O(n) DFS is simpler. A changing tree: binary lifting assumes fixed parents. Very deep but narrow trees are fine, since cost depends on log n, not shape.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Weighted path length between u and v, given rootDist[] and the LCA?`, opts: ['rootDist[u] + rootDist[v] − 2·rootDist[lca]', 'rootDist[u] + rootDist[v] − rootDist[lca]', 'rootDist[u] − rootDist[v]', '|rootDist[u] − rootDist[v]| + 1'], a: 0, why: 'The shared root-to-LCA stretch is counted in both terms, so subtract it twice.' },
        { type: 'mcq', q: `One LCA query on a tree of 10⁵ nodes. Binary lifting is…`, opts: ['Overkill: a single DFS answers it', 'The only correct approach here', 'Faster than one DFS would be', 'Required once n is this large'], a: 0, why: 'Build cost O(n log n) only pays off across many queries.' },
        { type: 'mcq', q: `The tree changes (edges are added and removed between queries). Binary lifting…`, opts: ['Breaks: it assumes fixed parents', 'Still works, with no changes', 'Breaks only for edge deletions', 'Works if the root stays fixed'], a: 0, why: 'Any structural change invalidates the precomputed ancestors; that case needs link-cut trees or offline processing.' },
        { type: 'free', q: `q = 10⁵ distance queries on a fixed tree of n = 10⁵ nodes. Compare per-query BFS with binary lifting, with numbers.`, model: `<p>Per-query BFS/DFS: O(n) each, so 10⁵ × 10⁵ = 10¹⁰ operations, far too slow. Binary lifting: O(n log n) ≈ 1.7 × 10⁶ to build the table (plus one DFS for depths), then O(log n) ≈ 17 per query, so about 1.7 × 10⁶ for all queries: roughly 3.4 × 10⁶ operations overall. Memory is O(n log n) ints, a few megabytes.</p>`, rubric: ['Per-query traversal is O(nq) = 10¹⁰: infeasible', 'Binary lifting: O(n log n) build ≈ 1.7 × 10⁶, O(log n) ≈ 17 per query', 'Notes the O(n log n) memory cost'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Tree: 0 root; children 1, 2; 1 has 3, 4; 2 has 5; 3 has 6. What is lca(3, 4)?`, a: 1, why: 'Both are children of 1.' },
    { type: 'free', q: `<strong>Transfer.</strong> Given a rooted tree and many queries "is u an ancestor of v?", give an O(1)-per-query method (after preprocessing) that doesn't need binary lifting.`, model: `<p>Run one DFS recording an entry and exit time for each node (an Euler tour). u is an ancestor of v exactly when tin[u] ≤ tin[v] and tout[v] ≤ tout[u], i.e. v's interval nests inside u's. Preprocessing is O(n) and each query is two comparisons, O(1). Binary lifting would answer it via lca(u, v) == u in O(log n), which is more work than needed.</p>`, rubric: ['DFS entry/exit times (Euler tour), O(n) preprocessing', 'Ancestor test = interval containment: tin[u] ≤ tin[v] and tout[v] ≤ tout[u]', 'O(1) per query, cheaper than the O(log n) LCA route'] },
    { type: 'num', q: `How many lookups does a climb of 7 levels take with jump pointers?`, a: 3, why: '7 = 4 + 2 + 1: three set bits, the worst case for numbers under 8.' },
    { type: 'mcq', q: `Building the table costs O(n log n). Where does the log come from?`, opts: ['One row per power of two up to n', 'Sorting the nodes by depth', 'A binary search per node', 'Balancing the tree first'], a: 0, why: 'LOG ≈ log₂ n rows, each filled in O(n).' },
    { type: 'free', q: `Explain the LCA algorithm to someone who knows binary search but not trees, using the "sum of powers of two" idea.`, model: `<p>Both nodes are at some depth in the tree. First make them level: lift the deeper one by the difference, which is a climb of a known height, done as a sum of powers of two. Now they are at the same depth, and their paths upward merge at some point. To find it without stepping one level at a time, try the biggest jump first: if jumping 2ᵏ from both still lands on <em>different</em> nodes, the merge point is higher, so take the jump; if it lands on the same node, that jump is too big, so skip it. Working down the powers, the total climb assembles the exact distance below the merge point, leaving both one step short; their common parent is the answer.</p>`, rubric: ['Step 1: equalise depths with a climb built from powers of two', 'Step 2: take a jump only when the two land on different nodes (otherwise it overshoots)', 'Descending powers assemble the exact height, ending one below the LCA'] }
  ],
  practice: [
    { name: 'Kth Ancestor of a Tree Node', lc: 'LeetCode 1483 · CSES Company Queries I', prompt: `<p>Many queries: the k-th ancestor of a node, or −1.</p>`, hint: `<p>Build up[k][v], then use the set bits of k.</p>`,
      solution: `<pre><code>class TreeAncestor {
    private final int LOG;
    private final int[][] up;
    public TreeAncestor(int n, int[] parent) {
        int log = 1;
        while ((1 &lt;&lt; log) &lt; n) log++;
        LOG = log;
        up = new int[LOG + 1][n];
        up[0] = parent.clone();                       // parent[root] = -1
        for (int k = 1; k &lt;= LOG; k++)
            for (int v = 0; v &lt; n; v++)
                up[k][v] = (up[k-1][v] &lt; 0) ? -1 : up[k-1][up[k-1][v]];
    }
    public int getKthAncestor(int v, int k) {
        for (int b = 0; v != -1 &amp;&amp; k &gt; 0; b++, k &gt;&gt;= 1)
            if ((k &amp; 1) == 1) v = up[b][v];
        return v;
    }
}</code></pre><p class="cx">O(n log n) build, O(log n) per query.</p>` },
    { name: 'LCA and path distance', lc: 'CSES Distance Queries', prompt: `<p>Answer many "distance between u and v" queries on a fixed tree.</p>`, hint: `<p>Equalise depths, jump while ancestors differ, then use depths.</p>`,
      solution: `<pre><code>class LCA {
    private final int LOG;
    private final int[][] up;
    private final int[] depth;
    public LCA(List&lt;List&lt;Integer&gt;&gt; adj, int root) {
        int n = adj.size(), log = 1;
        while ((1 &lt;&lt; log) &lt; n) log++;
        LOG = log;
        up = new int[LOG + 1][n];
        depth = new int[n];
        Arrays.fill(up[0], -1);
        Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();       // iterative DFS: no stack overflow
        boolean[] seen = new boolean[n];
        st.push(root); seen[root] = true;
        while (!st.isEmpty()) {
            int u = st.pop();
            for (int v : adj.get(u))
                if (!seen[v]) { seen[v] = true; up[0][v] = u; depth[v] = depth[u] + 1; st.push(v); }
        }
        for (int k = 1; k &lt;= LOG; k++)
            for (int v = 0; v &lt; n; v++)
                up[k][v] = (up[k-1][v] &lt; 0) ? -1 : up[k-1][up[k-1][v]];
    }
    public int lca(int u, int v) {
        if (depth[u] &lt; depth[v]) { int t = u; u = v; v = t; }
        int diff = depth[u] - depth[v];
        for (int b = 0; diff &gt; 0; b++, diff &gt;&gt;= 1)
            if ((diff &amp; 1) == 1) u = up[b][u];
        if (u == v) return u;
        for (int k = LOG; k &gt;= 0; k--)
            if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }
        return up[0][u];
    }
    public int dist(int u, int v) { return depth[u] + depth[v] - 2 * depth[lca(u, v)]; }
}</code></pre><p class="cx">O(n log n) build, O(log n) per query.</p>` }
  ]
});
