COURSE.topic({
  id: 'P09',
  intro: `Almost every tree problem is solved the same way: decide <strong>what the function returns for a subtree</strong>, trust the recursive calls (F08's leap of faith), and combine. BFS covers the rest, when the problem is about <em>levels</em>. This topic rests on F05 (the call stack), F16 (tree anatomy) and F08 (induction), and it's where "understand, don't memorise" pays off most.`,
  kps: [
    {
      title: 'Recursive DFS: define what the function returns',
      teach: `
<p>Before writing any code, finish this sentence: <strong>"f(node) returns ___ for the subtree rooted at node."</strong></p>
<div class="ex">
<div class="sub">Worked example: diameter (longest path between any two nodes, in edges)</div>
<p>First attempt: "f returns the diameter of the subtree." Combining fails: the diameter through a node needs the children's <em>depths</em>, not their diameters.</p>
<p>Fix: f returns the <strong>height</strong> (nodes on the longest downward path), and a separate variable collects the best diameter seen:</p>
<pre><code>int best = 0;
int height(TreeNode t) {
    if (t == null) return 0;
    int L = height(t.left), R = height(t.right);   // leap of faith: correct heights
    best = Math.max(best, L + R);                   // longest path THROUGH t, in edges
    return 1 + Math.max(L, R);                      // what the parent needs
}</code></pre>
<div class="sub">The pattern</div>
<p>What the parent needs (returned) and what the global answer needs (recorded) are often <strong>different quantities</strong>. Separating them is the key move in diameter, max path sum and many others.</p>
<div class="sub">Cost</div>
<p>Each node visited once: O(n) time, O(height) stack (F05).</p>
</div>`,
      qs: [
        { type: 'num', q: `Diameter (in edges) of the tree [1, 2, 3, 4, 5] (level order: 1 has children 2, 3; 2 has children 4, 5)?`, a: 3, why: 'Path 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3): 3 edges.' },
        { type: 'mcq', q: `Why can't "return the diameter of the subtree" be combined directly at the parent?`, opts: ['A path through the parent needs depths', 'Diameters cannot be added together', 'Recursion cannot return an int value', 'The parent does not know its children'], a: 0, why: 'The best path through a node joins the deepest path on each side, which is a height, not a diameter.' },
        { type: 'free', q: `For Binary Tree Maximum Path Sum (any path, values may be negative), state exactly what the recursive function returns and what it records globally, and why they differ.`, model: `<p>Returns: the maximum sum of a path that starts at this node and goes <em>down one side</em> (node + max(0, best child gain)), because that's the only kind of path a parent can extend. Records: the best path that bends through this node, node + max(0, left gain) + max(0, right gain). A bent path can't be extended upward (it would branch), so it's a candidate answer but not a return value. Negative gains are clipped to 0 (just don't take that side).</p>`, rubric: ['Return value: best downward path starting at the node (one side only)', 'Global record: best path through the node using both sides', 'Explains why a bent path cannot be returned upward; clips negative gains to 0'] },
        { type: 'num', q: `Max path sum for [−10, 9, 20, null, null, 15, 7]?`, a: 42, why: '15 → 20 → 7 = 42.' }
      ]
    },
    {
      title: 'Top-down (pass state down) vs bottom-up (return info up)',
      teach: `
<div class="ex">
<div class="sub">Bottom-up: children report, parent combines</div>
<p>Height, diameter, "is balanced", subtree sums. The answer at a node depends on answers <em>below</em> it. Info flows up through return values.</p>
<div class="sub">Top-down: parent passes context to children</div>
<p>"Root-to-leaf path sums to target?", "depth of each node", "valid BST range". The answer at a node depends on what's <em>above</em> it. Info flows down through parameters.</p>
<pre><code>boolean hasPathSum(TreeNode t, int remaining) {
    if (t == null) return false;
    remaining -= t.val;                                   // context updated on the way down
    if (t.left == null &amp;&amp; t.right == null) return remaining == 0;
    return hasPathSum(t.left, remaining) || hasPathSum(t.right, remaining);
}</code></pre>
<div class="sub">How to choose</div>
<p>Ask: "to decide something at node x, do I need information from x's ancestors (top-down) or from its descendants (bottom-up)?" Some problems need both: a parameter going down and a return value coming up.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"Is the tree height-balanced?" Natural direction?`, opts: ['Bottom-up: children report heights', 'Top-down: pass the depth downward', 'BFS level by level only', 'Either, with the same cost'], a: 0, why: 'Balance at a node depends on its subtrees\' heights. Returning height (or −1 for unbalanced) gives O(n); calling height() from every node top-down is O(n²).' },
        { type: 'mcq', q: `"Count root-to-leaf paths whose sum equals target." Natural direction?`, opts: ['Top-down: pass the running sum', 'Bottom-up: return subtree sums', 'BFS with a level-sum array', 'Sort the node values first'], a: 0, why: 'The sum so far comes from ancestors: pass it down as a parameter.' },
        { type: 'num', q: `Tree [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], target 22. How many root-to-leaf paths sum to 22?`, a: 1, why: '5 → 4 → 11 → 2.' },
        { type: 'free', q: `"Is balanced" can be written as: for each node, compute height(left) and height(right) with a helper and compare. What's the complexity, and how does a bottom-up version fix it?`, model: `<p>Calling a separate height() at every node recomputes subtree heights repeatedly: O(n²) on a skewed tree (each node's height call walks its whole subtree). Bottom-up: one recursive function returns the height if the subtree is balanced and −1 if not; each node combines its children's results in O(1). Every node is visited once: O(n).</p>`, rubric: ['Naive version recomputes heights: O(n²) worst case', 'Bottom-up returns height or a sentinel for unbalanced', 'Single pass, O(n)'] }
      ]
    },
    {
      title: 'BFS by levels with a queue',
      teach: `
<p>When the question mentions <strong>levels</strong> ("level order", "right side view", "minimum depth", "zigzag"), use a queue. It visits nodes in order of depth.</p>
<pre><code>Deque&lt;TreeNode&gt; q = new ArrayDeque&lt;&gt;();
if (root != null) q.offer(root);
while (!q.isEmpty()) {
    int size = q.size();                  // freeze: exactly this level's nodes
    List&lt;Integer&gt; level = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; size; i++) {
        TreeNode t = q.poll();
        level.add(t.val);
        if (t.left != null)  q.offer(t.left);
        if (t.right != null) q.offer(t.right);
    }
    res.add(level);
}</code></pre>
<div class="ex">
<div class="sub">Why snapshot q.size()?</div>
<p>Invariant: at the top of the while loop, the queue holds exactly one full level. Children added during the for-loop belong to the next level. Reading the size first separates the two.</p>
<div class="sub">Space</div>
<p>O(width). The widest level of a complete tree is about n/2 nodes (F02: leaves are half the tree), versus O(height) for DFS.</p>
<div class="sub">Minimum depth</div>
<p>BFS can stop at the first leaf it meets, which is the shallowest one. DFS has to explore everything.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Level order of [3, 9, 20, null, null, 15, 7]?`, opts: ['[[3], [9, 20], [15, 7]]', '[[3], [9], [20, 15, 7]]', '[[3, 9, 20], [15, 7]]', '[[3], [20, 9], [7, 15]]'], a: 0, why: 'Root, then its children, then grandchildren.' },
        { type: 'mcq', q: `Right Side View (the last node of each level). Simplest change to the BFS above?`, opts: ['Record the node when i == size − 1', 'Push the right child before the left', 'Use a stack instead of the queue', 'Record only the first node polled'], a: 0, why: 'The last node polled in each level is the rightmost.' },
        { type: 'free', q: `Why is BFS a better fit than DFS for "minimum depth of a tree" on a huge, deep tree with a shallow leaf?`, model: `<p>BFS visits nodes in increasing depth, so the first leaf it reaches is at minimum depth: it can stop immediately, having visited only the levels above that leaf. DFS might dive down a very deep branch first and must explore the whole tree to be sure no shallower leaf exists (and uses deep recursion). BFS's work is bounded by the size of the shallow levels.</p>`, rubric: ['BFS explores in order of depth, so the first leaf found is the shallowest', 'It can stop early', 'DFS may explore deep branches and must check everything'] },
        { type: 'mcq', q: `Extra space of BFS on a perfect binary tree with n nodes?`, opts: ['O(n): the last level is about n/2', 'O(log n): one node per level', 'O(1): the queue is reused', 'O(n log n) for all levels'], a: 0, why: 'The queue holds a whole level at once; the bottom level of a perfect tree has (n+1)/2 nodes.' }
      ]
    },
    {
      title: 'BST problems: use the ordering, validate with bounds',
      teach: `
<p>F16: in a BST every key in the left subtree is smaller and every key in the right is larger. That's the <em>whole</em> subtree, not just the children.</p>
<div class="ex">
<div class="sub">Validate BST: pass the allowed range down (top-down)</div>
<pre><code>boolean valid(TreeNode t, long lo, long hi) {           // all keys must be in (lo, hi)
    if (t == null) return true;
    if (t.val &lt;= lo || t.val &gt;= hi) return false;
    return valid(t.left, lo, t.val) &amp;&amp; valid(t.right, t.val, hi);
}
// call: valid(root, Long.MIN_VALUE, Long.MAX_VALUE)</code></pre>
<div class="sub">Why a range</div>
<p>Going left tightens the upper bound to the current value, and going right tightens the lower bound. So each node is checked against <em>all</em> its ancestors at once, in O(1). <code>long</code> bounds avoid a collision with Integer.MIN/MAX values.</p>
<div class="sub">Alternative: in-order is sorted</div>
<p>A tree is a BST iff its in-order traversal is strictly increasing. Keep the previous value and compare.</p>
<div class="sub">Using the order to skip</div>
<p>LCA in a BST: if both targets are smaller than t, go left; if both are larger, go right; otherwise t splits them, so t is the LCA. O(height), with no need to search both sides.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Is [10, 5, 15, null, null, 6, 20] a valid BST?`, opts: ['No: 6 is in 10\'s right subtree', 'Yes: every parent-child pair is fine', 'No: 20 is too large for the root', 'Yes: in-order traversal is sorted'], a: 0, why: 'In-order is 5, 10, 6, 15, 20, not sorted. 6 violates its ancestor 10.' },
        { type: 'mcq', q: `Why use <code>long</code> bounds in the range validation?`, opts: ['A node may equal Integer.MAX_VALUE', 'long comparisons are faster', 'Java needs long for recursion', 'Tree values are stored as long'], a: 0, why: 'With int bounds, a node holding Integer.MAX_VALUE would fail "val &lt; hi" even when valid.' },
        { type: 'free', q: `Explain why passing (lo, hi) down checks each node against <em>all</em> its ancestors, not just its parent.`, model: `<p>Every time the path turns left at an ancestor a, the upper bound becomes a.val (all later nodes must be smaller than a). Every right turn sets the lower bound. The tightest upper bound so far is the most recent left-turn ancestor, and it is ≤ every earlier left-turn ancestor on this path (or the constraint would already have failed). So one interval (lo, hi) summarises all ancestor constraints, and checking it is equivalent to checking every ancestor.</p>`, rubric: ['Left turns set the upper bound; right turns set the lower bound', 'The interval is the intersection of all ancestor constraints', 'So one O(1) check covers all ancestors'] },
        { type: 'mcq', q: `LCA in a BST with p = 2, q = 8 and root 6. Answer?`, opts: ['6: p and q are on opposite sides', '2: p is an ancestor of q', '8: q is deeper than p', 'Must search both subtrees'], a: 0, why: '2 &lt; 6 &lt; 8, so the root splits them.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Count nodes whose value equals the sum of all values in their subtree below them (descendants only)." Define the return value, what's recorded, and the complexity.`, model: `<p>f(t) returns the sum of all values in t's subtree (including t). At node t: L = f(left), R = f(right); if t.val == L + R, increment the count; return t.val + L + R. Bottom-up, each node visited once: O(n) time, O(height) stack. The return value (subtree sum) differs from what's recorded (the count).</p>`, rubric: ['Returns the subtree sum', 'Compares t.val with the children\'s sums and records the count separately', 'O(n) single pass'] },
    { type: 'num', q: `Maximum depth (nodes on the longest root-to-leaf path) of [3, 9, 20, null, null, 15, 7]?`, a: 3, why: '3 → 20 → 15.' },
    { type: 'mcq', q: `"Zigzag level order" is best done with…`, opts: ['Level BFS, reversing alternate levels', 'Recursive DFS with a global list only', 'A monotonic stack over the values', 'Sorting the nodes by depth'], a: 0, why: 'It is level order with a presentation twist.' },
    { type: 'mcq', q: `Lowest common ancestor in a general binary tree (not a BST). Standard bottom-up return value?`, opts: ['p, q, the LCA, or null for the subtree', 'The depth of the subtree root', 'The in-order list of the subtree', 'A boolean for "contains p"'], a: 0, why: 'If both sides return non-null, the current node is the LCA; otherwise pass up whichever is non-null.' },
    { type: 'free', q: `Why is every tree DFS in this topic O(n) time, regardless of the tree's shape? And what does shape change?`, model: `<p>Each node is entered once and does O(1) work plus its recursive calls; the calls follow edges, and a tree has n − 1 edges (F16), so the total is O(n). Shape only changes the recursion depth: O(log n) stack when balanced, O(n) when skewed (with stack-overflow risk in Java).</p>`, rubric: ['Each node visited once with O(1) own work, so O(n)', 'Edges n − 1 bound the calls', 'Shape affects stack depth (log n vs n), not time'] }
  ],
  practice: [
    { name: 'Maximum Depth of Binary Tree', lc: 'LeetCode 104', prompt: `<p>Number of nodes on the longest root-to-leaf path.</p>`, hint: `<p>What should f return for null?</p>`,
      solution: `<pre><code>public int maxDepth(TreeNode t) {
    return t == null ? 0 : 1 + Math.max(maxDepth(t.left), maxDepth(t.right));
}</code></pre><p class="cx">O(n) · O(height).</p>` },
    { name: 'Binary Tree Level Order Traversal', lc: 'LeetCode 102', prompt: `<p>Values level by level.</p>`, hint: `<p>Snapshot the queue size at the start of each level.</p>`,
      solution: `<pre><code>public List&lt;List&lt;Integer&gt;&gt; levelOrder(TreeNode root) {
    List&lt;List&lt;Integer&gt;&gt; res = new ArrayList&lt;&gt;();
    Deque&lt;TreeNode&gt; q = new ArrayDeque&lt;&gt;();
    if (root != null) q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();
        List&lt;Integer&gt; level = new ArrayList&lt;&gt;();
        for (int i = 0; i &lt; size; i++) {
            TreeNode t = q.poll();
            level.add(t.val);
            if (t.left != null) q.offer(t.left);
            if (t.right != null) q.offer(t.right);
        }
        res.add(level);
    }
    return res;
}</code></pre><p class="cx">O(n) · O(width).</p>` },
    { name: 'Binary Tree Maximum Path Sum', lc: 'LeetCode 124', prompt: `<p>Maximum sum of any path (values may be negative).</p>`, hint: `<p>Return the best one-sided gain; record the best two-sided path.</p>`,
      solution: `<pre><code>private int best = Integer.MIN_VALUE;
public int maxPathSum(TreeNode root) { gain(root); return best; }
private int gain(TreeNode t) {
    if (t == null) return 0;
    int L = Math.max(0, gain(t.left)), R = Math.max(0, gain(t.right));
    best = Math.max(best, t.val + L + R);      // path bending through t
    return t.val + Math.max(L, R);             // path the parent can extend
}</code></pre><p class="cx">O(n). Returned and recorded quantities differ.</p>` },
    { name: 'Validate Binary Search Tree', lc: 'LeetCode 98', prompt: `<p>Is the tree a valid BST (strict)?</p>`, hint: `<p>Pass down the open interval every key must lie in.</p>`,
      solution: `<pre><code>public boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
private boolean valid(TreeNode t, long lo, long hi) {
    if (t == null) return true;
    if (t.val &lt;= lo || t.val &gt;= hi) return false;
    return valid(t.left, lo, t.val) &amp;&amp; valid(t.right, t.val, hi);
}</code></pre><p class="cx">O(n). One interval summarises all ancestor constraints.</p>` },
    { name: 'Lowest Common Ancestor of a Binary Tree', lc: 'LeetCode 236', prompt: `<p>LCA of p and q in a general binary tree.</p>`, hint: `<p>Return p/q/LCA/null for each subtree.</p>`,
      solution: `<pre><code>public TreeNode lowestCommonAncestor(TreeNode t, TreeNode p, TreeNode q) {
    if (t == null || t == p || t == q) return t;
    TreeNode L = lowestCommonAncestor(t.left, p, q);
    TreeNode R = lowestCommonAncestor(t.right, p, q);
    if (L != null &amp;&amp; R != null) return t;      // p and q on different sides
    return L != null ? L : R;
}</code></pre><p class="cx">O(n) · O(height).</p>` }
  ]
});
