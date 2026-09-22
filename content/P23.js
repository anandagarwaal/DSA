COURSE.topic({
  id: 'P23',
  intro: `Tree DP is P09's "decide what the function returns for a subtree" (the leap of faith) plus P16's state discipline. Then <strong>rerooting</strong> answers the harder question: what if every node in turn were the root? Naively that's n separate DFS runs, O(n²). Rerooting does it in two passes, and the trick, "the answer for a child = the parent's answer minus the child's contribution, plus everything else", is the piece worth understanding.`,
  kps: [
    {
      title: 'DP over subtrees: the state is a node plus what its parent needs',
      teach: `
<p>Every tree DP answers one question: <strong>what does my parent need to know about my subtree?</strong> That answer <em>is</em> the state.</p>
<div class="ex">
<div class="sub">Worked example: subtree sizes</div>
<pre><code>int size(int u, int parent) {
    int s = 1;
    for (int v : adj.get(u))
        if (v != parent) s += size(v, u);    // leap of faith (F08)
    return s;
}</code></pre>
<p>The parent needs only a count, so the state is one integer per node. O(n) total: each edge is used once in each direction.</p>
<div class="sub">Why "parent" rather than a visited set</div>
<p>A tree has no cycles, so the only way back is the edge you came from (P12). Passing the parent is enough and costs nothing.</p>
<div class="sub">Designing the state</div>
<p>"Maximum weight independent set on a tree": a node's choice depends on whether its parent was taken, so the state is <strong>dp[u][taken?]</strong>: two numbers per node. That's the same "carry what the next decision needs" rule as P16.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In a recursive tree DP, why pass the parent instead of keeping a visited array?`, opts: ['A tree has no cycles: only one way back', 'Visited arrays use too much memory', 'The parent is needed for the answer', 'Recursion cannot use arrays'], a: 0, why: 'The single edge back to the parent is the only revisit risk in a tree (P12).' },
        { type: 'mcq', q: `"Maximum weight independent set on a tree" (no two chosen nodes adjacent). Minimal state?`, opts: ['dp[u][0/1]: best with u unused/used', 'dp[u]: best in u\'s subtree', 'dp[u][depth]: best by depth', 'dp[u][count]: best by size'], a: 0, why: 'Whether u is taken changes what its children may do, so it must be in the state.' },
        { type: 'num', q: `Tree: 0 has children 1 and 2; 2 has children 3, 4, 5. What is the subtree size of node 2?`, a: 4, why: 'Node 2 plus its three children.' },
        { type: 'free', q: `Why is a tree DP O(n) even though each node loops over its children?`, model: `<p>Summed over all nodes, the child loops run once per edge, and a tree has n − 1 edges (F16). Each node also does O(1) of its own work. So the total is O(n + (n−1)) = O(n). The nesting is not multiplicative: a node with many children simply means other nodes have fewer.</p>`, rubric: ['The child loops total one iteration per edge over the whole run', 'A tree has n − 1 edges', 'So O(n) overall, not O(n × children)'] }
      ]
    },
    {
      title: 'Combining children: diameter and best path',
      teach: `
<p>The recurring pattern from P09: <strong>what you return to the parent and what you record globally are different quantities</strong>.</p>
<div class="ex">
<div class="sub">Tree diameter (longest path, in edges)</div>
<p>A longest path has a highest node on it; at that node it descends into (at most) two different children. So at each node take the two deepest child depths:</p>
<pre><code>int best = 0;
int height(int u, int parent) {
    int top1 = 0, top2 = 0;                   // two deepest child branches
    for (int v : adj.get(u)) {
        if (v == parent) continue;
        int d = height(v, u) + 1;
        if (d &gt; top1) { top2 = top1; top1 = d; }
        else if (d &gt; top2) { top2 = d; }
    }
    best = Math.max(best, top1 + top2);       // path bending at u
    return top1;                              // what the parent can extend
}</code></pre>
<div class="sub">Why "top two"</div>
<p>A path through u uses at most two branches (going down three would revisit u). Taking the two deepest maximises the total, and every path is counted at its highest node, so no path is missed.</p>
<div class="sub">Worked example</div>
<p>0–1, 0–2, 2–3, 2–4, 2–5: the diameter is <strong>3</strong> (e.g. 1 → 0 → 2 → 3). A path graph of 5 nodes has diameter 4.</p>
</div>`,
      qs: [
        { type: 'num', q: `Edges 0–1, 0–2, 2–3, 2–4, 2–5. Tree diameter in edges?`, a: 3, why: '1 → 0 → 2 → 3 uses 3 edges; no longer path exists.' },
        { type: 'num', q: `A path graph 0–1–2–3–4. Diameter in edges?`, a: 4, why: 'End to end.' },
        { type: 'free', q: `Why does taking the two deepest child branches at every node find the diameter, and why is no path missed?`, model: `<p>Any path in a tree has a unique highest node (closest to the root); from there it goes down into at most two distinct child subtrees, since using three would require passing through the node twice. So its length equals (depth into one branch) + (depth into another) at that node, which is maximised by the two deepest branches. Because every path is examined at its own highest node, and every node is visited, no path is overlooked.</p>`, rubric: ['Every path has a unique highest node', 'From there it descends into at most two child branches', 'Taking the two deepest maximises it; every node is checked, so nothing is missed'] },
        { type: 'mcq', q: `What does <code>height</code> return to the parent, versus what is recorded in <code>best</code>?`, opts: ['Returns one branch; records the bent path', 'Returns the diameter; records the height', 'Both are the same quantity here', 'Returns the number of children'], a: 0, why: 'A parent can only extend a single downward branch; a path bending at u cannot be extended upward.' }
      ]
    },
    {
      title: 'Rerooting: every node as the root, in two passes',
      teach: `
<p>Problem: for <em>every</em> node, the sum of distances to all other nodes (CSES "Tree Distances II", LeetCode 834). Running a BFS per node is O(n²).</p>
<div class="ex">
<div class="sub">Pass 1 (up): answers for the fixed root</div>
<p><code>cnt[u]</code> = subtree size, <code>res[0]</code> = Σ distances from the root: <code>res[u] += res[v] + cnt[v]</code> for each child v, since every node in v's subtree is one edge further from u than from v.</p>
<div class="sub">Pass 2 (down): move the root one edge</div>
<p>Moving the root from u to its child v: every node <em>inside</em> v's subtree gets one step closer (cnt[v] of them), and every node <em>outside</em> gets one step further (n − cnt[v] of them):</p>
<pre><code>res[v] = res[u] - cnt[v] + (n - cnt[v]);</code></pre>
<div class="sub">Worked example</div>
<p>Edges 0–1, 0–2, 2–3, 2–4, 2–5 (n = 6). Distances sums: <strong>[8, 12, 6, 10, 10, 10]</strong>. Check node 2: distances 1+2+1+1+1 = 6, the smallest, because it is the most central.</p>
<div class="sub">Cost</div>
<p>Two DFS passes: O(n) total instead of O(n²).</p>
</div>`,
      qs: [
        { type: 'num', q: `Edges 0–1, 0–2, 2–3, 2–4, 2–5 (n = 6). Sum of distances from node 0 to all others?`, a: 8, why: '1 (to 1) + 1 (to 2) + 2 + 2 + 2 = 8.' },
        { type: 'num', q: `Same tree. Sum of distances from node 2?`, a: 6, why: '1 + 2 + 1 + 1 + 1 = 6: node 2 is the most central.' },
        { type: 'free', q: `Derive the rerooting formula <code>res[v] = res[u] − cnt[v] + (n − cnt[v])</code> and say what each term means.`, model: `<p>res[u] is the total distance from u to everything. Move the root across the edge u–v. Every node in v's subtree (cnt[v] of them) is now one edge closer, so subtract cnt[v]. Every other node (n − cnt[v], including u itself) is one edge further, so add n − cnt[v]. Distances within each group are otherwise unchanged, because every path to a node in v's subtree used that edge and every path to a node outside now uses it.</p>`, rubric: ['cnt[v] nodes get one step closer: −cnt[v]', 'The other n − cnt[v] nodes get one step further: +(n − cnt[v])', 'All other path structure is unchanged, so the transfer is exact'] },
        { type: 'mcq', q: `Rerooting turns an O(n²) "run the DP from every root" into…`, opts: ['O(n): two passes over the tree', 'O(n log n) with binary lifting', 'O(n √n) with decomposition', 'Still O(n²), but with a smaller constant'], a: 0, why: 'One pass up for subtree answers, one pass down to transfer each parent answer to its children.' }
      ]
    },
    {
      title: 'Cost and the shapes that trip it up',
      teach: `
<div class="ex">
<div class="sub">The cost rule</div>
<p>Each edge is traversed a constant number of times per pass, so a tree DP is O(n × state size). dp[u][0/1] is O(2n); a DP whose state is "u plus a count up to k" is O(nk), which is where tree-knapsack problems (e.g. "choose k nodes") land.</p>
<div class="sub">Recursion depth</div>
<p>A path-shaped tree gives depth n. At n = 10⁵ recursive DFS overflows Java's stack (F05), so convert to an explicit stack or process nodes in reverse BFS order: children always finish before parents, which is exactly what pass 1 needs.</p>
<div class="sub">The reverse-BFS trick</div>
<pre><code>// order[] = BFS order from the root; iterate it backwards for the "up" pass
for (int i = order.length - 1; i &gt;= 0; i--) { int u = order[i]; /* combine children */ }
// iterate forwards for the "down" (rerooting) pass</code></pre>
<div class="sub">When rerooting does not apply</div>
<p>It needs the parent's answer to be <em>repairable</em> in O(1) from the child's contribution. Sum of distances qualifies. "Maximum distance" does not repair from a single number: you must carry the top two branch values (and which child they came from) so a child can exclude its own.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Tree DP with state dp[u][k] for k up to K. Total cost?`, opts: ['O(n · K)', 'O(n + K)', 'O(n² · K)', 'O(K log n)'], a: 0, why: 'n nodes × K state values, with each edge contributing a constant number of merges per state.' },
        { type: 'mcq', q: `Recursive tree DP on a path-shaped tree with n = 10⁵ in Java…`, opts: ['Risks StackOverflowError at depth 10⁵', 'Is fine: depth is always log n', 'Fails only if values are large', 'Cannot be written recursively'], a: 0, why: 'Depth equals height, which is n for a path (F05/F16).' },
        { type: 'free', q: `Why can "sum of distances" be rerooted with a single number per node, while "maximum distance to any node" cannot?`, model: `<p>Sums decompose additively: the contribution of v's subtree to res[u] is exactly res[v] + cnt[v], so it can be subtracted out and the rest added back in O(1). A maximum is not additive and not invertible: knowing the parent's best branch does not tell you the best branch <em>excluding</em> the child, since the best might have come through that very child. To reroot a max you must carry the top two branch values (and their sources), so a child can fall back to the second when the first came through itself.</p>`, rubric: ['Sums are additive/invertible, so one child\'s contribution can be removed in O(1)', 'A max is not invertible: the parent\'s best may come through this child', 'Fix: keep the top two branch values (and which child), so the child can exclude itself'] },
        { type: 'mcq', q: `A safe iteration order for the "up" pass without recursion?`, opts: ['Reverse BFS order from the root', 'Forward BFS order from the root', 'Increasing node index order', 'Random order with retries'], a: 0, why: 'In reverse BFS order every child is processed before its parent, which is what combining requires.' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Edges 0–1, 0–2, 2–3, 2–4, 2–5. Sum of distances from node 1?`, a: 12, why: '1 (to 0) + 2 (to 2) + 3 + 3 + 3 = 12: leaf nodes are the worst roots.' },
    { type: 'free', q: `<strong>Transfer.</strong> "House Robber III": a binary tree where you cannot rob a node and its child. Give the state, the recurrence and the complexity.`, model: `<p>State: for each node return a pair (robbed, notRobbed) = the best total for its subtree when the node is used / not used. Recurrence: robbed = value(u) + Σ child.notRobbed; notRobbed = Σ max(child.robbed, child.notRobbed). The answer at the root is max of the two. Each node combines its children in O(1), so O(n) time and O(height) stack. It's P16's "carry what the next decision needs" applied to a tree: the parent's choice depends only on whether the child was used.</p>`, rubric: ['State: a pair per node (node used / not used)', 'Recurrence: used = value + children not-used; not-used = Σ max of each child\'s two options', 'O(n) time, O(height) space; answer is the max at the root'] },
    { type: 'mcq', q: `Tree diameter can also be found with two BFS runs (farthest node from any start, then farthest from it). Compared with the DP…`, opts: ['Both O(n); BFS needs a correctness proof', 'The BFS method is O(n log n)', 'The BFS method fails on weighted trees', 'The DP is the only correct method'], a: 0, why: 'Both are linear. The two-BFS method relies on a non-obvious lemma (the farthest node from anywhere is an endpoint of some diameter), which is worth being able to state. It works for non-negative weights too.' },
    { type: 'num', q: `A star: centre 0 with 5 leaves. Sum of distances from the centre?`, a: 5, why: 'Five leaves, each at distance 1.' },
    { type: 'free', q: `Describe the two-pass rerooting template in general: what pass 1 computes, what pass 2 computes, and the condition a problem must satisfy to use it.`, model: `<p>Pass 1 (post-order, children before parents): compute each node's answer restricted to its own subtree, plus any aggregate needed to transfer it (e.g. subtree size). Pass 2 (pre-order, parents before children): for each child v of u, derive v's whole-tree answer from u's whole-tree answer by removing v's subtree contribution and adding the contribution of everything outside it. The condition: the parent's answer must be repairable in O(1) from the child's contribution, i.e. the combine must be invertible or you must carry enough extra information (such as the top two branches) to exclude one child.</p>`, rubric: ['Pass 1 post-order: subtree answers plus transfer aggregates', 'Pass 2 pre-order: parent\'s full answer minus this child\'s part, plus the rest', 'Condition: the contribution must be removable in O(1) (invertible, or carry top-two)'] }
  ],
  practice: [
    { name: 'Sum of Distances in Tree', lc: 'LeetCode 834 · CSES Tree Distances II', prompt: `<p>For every node, the sum of distances to all other nodes, in O(n).</p>`, hint: `<p>Pass 1 for subtree sizes and the root's answer; pass 2 to transfer it down.</p>`,
      solution: `<pre><code>public int[] sumOfDistancesInTree(int n, int[][] edges) {
    List&lt;List&lt;Integer&gt;&gt; adj = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; n; i++) adj.add(new ArrayList&lt;&gt;());
    for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }

    int[] order = new int[n], parent = new int[n], cnt = new int[n], res = new int[n];
    Arrays.fill(parent, -1);
    boolean[] seen = new boolean[n];
    int head = 0, tail = 0;
    order[tail++] = 0; seen[0] = true;
    while (head &lt; tail) {                        // BFS order, no recursion (F05)
        int u = order[head++];
        for (int v : adj.get(u))
            if (!seen[v]) { seen[v] = true; parent[v] = u; order[tail++] = v; }
    }
    Arrays.fill(cnt, 1);
    for (int i = n - 1; i &gt;= 1; i--) {           // pass 1: children before parents
        int v = order[i], u = parent[v];
        cnt[u] += cnt[v];
        res[u] += res[v] + cnt[v];
    }
    for (int i = 1; i &lt; n; i++) {                // pass 2: parents before children
        int v = order[i], u = parent[v];
        res[v] = res[u] - cnt[v] + (n - cnt[v]);
    }
    return res;
}</code></pre><p class="cx">O(n) time and space.</p>` },
    { name: 'Diameter of Binary Tree', lc: 'LeetCode 543 · CSES Tree Diameter', prompt: `<p>Longest path between any two nodes, in edges.</p>`, hint: `<p>Return the deepest branch; record the sum of the two deepest.</p>`,
      solution: `<pre><code>private int best = 0;
public int diameterOfBinaryTree(TreeNode root) { height(root); return best; }
private int height(TreeNode t) {
    if (t == null) return 0;
    int L = height(t.left), R = height(t.right);
    best = Math.max(best, L + R);        // path bending at t, counted in edges
    return 1 + Math.max(L, R);           // what the parent can extend
}</code></pre><p class="cx">O(n). Every path is measured at its highest node.</p>` },
    { name: 'House Robber III', lc: 'LeetCode 337', prompt: `<p>Maximum sum with no two adjacent nodes chosen, on a binary tree.</p>`, hint: `<p>Return a pair: best with this node used, and best without it.</p>`,
      solution: `<pre><code>public int rob(TreeNode root) {
    int[] r = go(root);
    return Math.max(r[0], r[1]);
}
// returns {used, notUsed} for this subtree
private int[] go(TreeNode t) {
    if (t == null) return new int[]{0, 0};
    int[] L = go(t.left), R = go(t.right);
    int used = t.val + L[1] + R[1];
    int notUsed = Math.max(L[0], L[1]) + Math.max(R[0], R[1]);
    return new int[]{used, notUsed};
}</code></pre><p class="cx">O(n) time, O(height) stack. The pair is the state P16 asks for.</p>` }
  ]
});
