COURSE.topic({
  id: 'F16',
  intro: `Trees are behind heaps, BSTs, recursion trees, union-find and DP. Before any traversal algorithm, you need the anatomy: how height relates to n, why <em>shape</em> decides whether operations are O(log n) or O(n), how a heap fits a tree into a plain array, and what the BST ordering lets you skip.`,
  kps: [
    {
      title: 'Nodes, edges, depth, height',
      teach: `
<div class="ex">
<div class="sub">Vocabulary, precisely</div>
<p><strong>Depth</strong> of a node = edges from the root down to it (root has depth 0). <strong>Height</strong> of a tree = the largest depth of any node, i.e. edges on the longest root-to-leaf path. (Some problems count <em>nodes</em> on that path instead, one more. Always check which.) A <strong>leaf</strong> has no children.</p>
<div class="sub">Edges = n − 1, always</div>
<p>Every node except the root has exactly one edge going up to its parent. The root has none. So a tree with n nodes has exactly <strong>n − 1 edges</strong>, whatever its shape.</p>
<div class="sub">Why that matters</div>
<p>A traversal that touches each node and each edge a constant number of times is O(n + (n−1)) = <strong>O(n)</strong>. That's why every DFS/BFS on a tree is linear.</p>
</div>`,
      qs: [
        { type: 'num', q: `A tree has 50 nodes. How many edges?`, a: 49, why: 'Every node but the root has exactly one parent edge.' },
        { type: 'mcq', q: `A single node, no children. Its height (counting edges)?`, opts: ['0', '1', '−1', 'undefined'], a: 0, why: 'The longest root-to-leaf path has no edges. (Some conventions give an empty tree height −1 so that height = 1 + max(children) works.)' },
        { type: 'free', q: `Explain, without induction, why every tree with n nodes has n − 1 edges.`, model: `<p>Match each edge with the child end of it. Every edge connects a node to its parent, and every node except the root has exactly one parent. So edges and non-root nodes are in one-to-one correspondence: there are n − 1 of them.</p>`, rubric: ['Each edge links a node to its unique parent', 'Every non-root node has exactly one parent edge; the root has none', 'So edges ↔ non-root nodes: n − 1'] },
        { type: 'mcq', q: `A DFS over a binary tree visits each node once and follows each edge twice (down and back). Complexity?`, opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(height)'], a: 0, why: 'n visits + 2(n − 1) edge traversals = O(n).' }
      ]
    },
    {
      title: 'Shape decides everything: balanced (log n) vs skewed (n)',
      teach: `
<figure class="fig"><svg viewBox="0 0 340 170" width="340" role="img" aria-label="balanced tree vs vine">
<g style="stroke:var(--soft)"><line x1="80" y1="20" x2="45" y2="60"/><line x1="80" y1="20" x2="115" y2="60"/><line x1="45" y1="60" x2="25" y2="100"/><line x1="45" y1="60" x2="65" y2="100"/><line x1="115" y1="60" x2="95" y2="100"/><line x1="115" y1="60" x2="135" y2="100"/>
<line x1="220" y1="15" x2="240" y2="35"/><line x1="240" y1="35" x2="260" y2="55"/><line x1="260" y1="55" x2="280" y2="75"/><line x1="280" y1="75" x2="300" y2="95"/><line x1="300" y1="95" x2="320" y2="115"/><line x1="320" y1="115" x2="335" y2="135"/></g>
<g style="fill:var(--accent)"><circle cx="80" cy="20" r="7"/><circle cx="45" cy="60" r="7"/><circle cx="115" cy="60" r="7"/><circle cx="25" cy="100" r="7"/><circle cx="65" cy="100" r="7"/><circle cx="95" cy="100" r="7"/><circle cx="135" cy="100" r="7"/>
<circle cx="220" cy="15" r="7"/><circle cx="240" cy="35" r="7"/><circle cx="260" cy="55" r="7"/><circle cx="280" cy="75" r="7"/><circle cx="300" cy="95" r="7"/><circle cx="320" cy="115" r="7"/><circle cx="335" cy="135" r="7"/></g>
<g font-size="11" text-anchor="middle" style="fill:var(--soft)"><text x="80" y="135">7 nodes, height 2</text><text x="270" y="162">7 nodes, height 6</text></g></svg>
<figcaption>Same n, different shape. Any operation that walks root-to-leaf pays the height.</figcaption></figure>
<div class="ex">
<div class="sub">Balanced</div>
<p>Levels fill up, each doubling (F02), so height ≈ log₂ n. For n = 10⁶, height ≈ 20.</p>
<div class="sub">Skewed (a "vine")</div>
<p>Every node has one child: it's a linked list, height n − 1. For n = 10⁶, height ≈ 10⁶.</p>
<div class="sub">How a BST becomes a vine</div>
<p>Insert 1, 2, 3, …, n in sorted order into a plain BST: each new key is larger than everything so far and goes to the far right. <strong>Sorted input is the worst case for an unbalanced BST.</strong> That's why TreeMap uses a self-balancing red-black tree.</p>
<div class="sub">The recursion-stack connection</div>
<p>Recursive DFS uses O(height) stack space (F05): O(log n) on balanced trees, but O(n) on a vine, and 10⁵ deep can overflow Java's stack.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Keys 1..1000 are inserted in increasing order into a plain (non-balancing) BST. Height?`, opts: ['999, a vine', 'About 10', 'About 500', 'About 32'], a: 0, why: 'Each key becomes the right child of the previous one.' },
        { type: 'num', q: `Minimum possible height (edges) of a binary tree with 1000 nodes?`, a: 9, why: 'Height 9 holds up to 2¹⁰ − 1 = 1023 nodes; height 8 holds only 511.' },
        { type: 'free', q: `"BST search is O(log n)." Correct this statement precisely.`, model: `<p>BST search is O(h), where h is the height. It's O(log n) only when the tree is balanced (h ≈ log n); a skewed BST (e.g. from sorted inserts) has h ≈ n, making search O(n). Self-balancing trees (red-black, AVL) guarantee h = O(log n), so for them the statement holds.</p>`, rubric: ['States the true bound is O(height)', 'Skewed trees (e.g. sorted insertion) make height ~n, so O(n)', 'Balanced/self-balancing trees guarantee O(log n)'] },
        { type: 'mcq', q: `Recursive DFS on a tree with 10⁵ nodes crashes with StackOverflowError. Most likely shape?`, opts: ['Skewed, with depth near 10⁵', 'Perfectly balanced, depth 17', 'A full binary tree of depth 5', 'A star, one root with leaves'], a: 0, why: 'Stack depth = tree height. Only a tall, skewed tree reaches the ~10⁴–10⁵ frames that overflow Java\'s default stack.' }
      ]
    },
    {
      title: 'A complete tree fits in an array',
      teach: `
<p>A <strong>complete</strong> binary tree fills every level left to right with no gaps. That lets you store it in an array with no pointers at all: this is how heaps are implemented.</p>
<div class="ex">
<div class="sub">The index rule (0-based)</div>
<p>Node at index i: left child <strong>2i + 1</strong>, right child <strong>2i + 2</strong>, parent <strong>(i − 1) / 2</strong> (integer division).</p>
<div class="sub">Worked example</div>
<pre><code>index:  0   1   2   3   4   5   6
value: [9,  7,  8,  3,  5,  6,  1]
        9 is root; children of 9 (i=0): i=1 (7), i=2 (8)
        children of 7 (i=1): i=3 (3), i=4 (5)
        parent of i=5 (6): (5−1)/2 = 2 → 8</code></pre>
<div class="sub">Why it works</div>
<p>Level k occupies indices 2ᵏ − 1 … 2ᵏ⁺¹ − 2, laid end to end. Since there are no gaps, the position of a node's children is pure arithmetic, the same trick as array indexing in F10.</p>
</div>`,
      qs: [
        { type: 'num', q: `0-based heap array. Index of the left child of index 6?`, a: 13, why: '2 × 6 + 1 = 13.' },
        { type: 'num', q: `0-based heap array. Index of the parent of index 10?`, a: 4, why: '(10 − 1) / 2 = 4 (integer division).' },
        { type: 'mcq', q: `Why can't an arbitrary (non-complete) binary tree use this array layout efficiently?`, opts: ['Gaps waste slots; a vine needs 2ⁿ', 'Arrays cannot store object refs', 'The index formulas give fractions', 'It works, just with slower math'], a: 0, why: 'Missing nodes leave holes. A vine of n nodes would need indices up to about 2ⁿ.' },
        { type: 'free', q: `Explain why the left child of index i is at 2i + 1, using the level-by-level layout.`, model: `<p>Nodes are laid out level by level, left to right. Before node i's children come all nodes after i on its own level plus all children of nodes before i. Each of the i nodes before i has 2 children, placed before i's children. Counting: the first child slot overall is index 1 (root's left child), and i nodes before i contribute 2i children, so i's left child lands at 1 + 2i.</p>`, rubric: ['Uses the level-order, gap-free layout', 'Each of the i earlier nodes contributes two children placed before i\'s children', 'So the left child index is 2i + 1'] }
      ]
    },
    {
      title: 'The BST ordering and what it lets you skip',
      teach: `
<p><strong>BST property:</strong> for every node, <em>all</em> keys in its left subtree are smaller and <em>all</em> keys in its right subtree are larger. Not just the children: the entire subtrees.</p>
<div class="ex">
<div class="sub">What one comparison buys</div>
<p>Searching for 42 at a node holding 50: every key in the right subtree is &gt; 50 &gt; 42, so the <strong>entire right subtree is erased</strong> in one comparison. This is F09's elimination again, on a tree.</p>
<div class="sub">In-order traversal is sorted</div>
<p>Visiting left subtree, node, right subtree yields keys in increasing order. That's a direct consequence of the property, and it's the basis of "kth smallest" and "validate BST".</p>
<div class="sub">The classic mistake</div>
<p>Checking only <code>left.val &lt; node.val &lt; right.val</code> at each node is <em>not</em> enough:</p>
<pre><code>      10
     /  \\
    5    15
        /
       6        ← 6 &lt; 15 locally OK, but 6 is in 10's RIGHT subtree: invalid</code></pre>
<p>The fix is to pass down the allowed range (low, high) (P09).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Searching a BST for 42, the current node is 30. What can be skipped?`, opts: ['The whole left subtree of 30', 'Only the left child of 30', 'The whole right subtree of 30', 'Nothing; both sides may hold it'], a: 0, why: 'Everything in 30\'s left subtree is &lt; 30 &lt; 42.' },
        { type: 'mcq', q: `In-order traversal of a valid BST gives keys in…`, opts: ['Increasing order', 'Level order', 'Insertion order', 'Decreasing order'], a: 0, why: 'Left (smaller) → node → right (larger), recursively.' },
        { type: 'free', q: `Why is checking <code>left.val &lt; node.val &lt; right.val</code> at every node insufficient to validate a BST? Give a counterexample and state what's actually required.`, model: `<p>The property is about entire subtrees, not just children. Counterexample: root 10, right child 15, and 15's left child 6. Each parent-child pair looks fine locally, but 6 sits in 10's right subtree and is less than 10. What's required: every node's key must lie in the open interval set by all its ancestors (e.g. for 6: 10 &lt; key &lt; 15).</p>`, rubric: ['Property applies to all descendants, not just children', 'Gives a valid counterexample (a deep node violating an ancestor bound)', 'States the real requirement: each key within the range set by its ancestors'] },
        { type: 'num', q: `A BST contains 1..15 perfectly balanced. How many comparisons at most to find any key?`, a: 4, why: '15 nodes, height 3 (edges) → at most 4 nodes on the path, so 4 comparisons.' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `A complete binary tree stored 0-based in an array of size 20. How many of its nodes are leaves? (A node i is a leaf if 2i + 1 ≥ 20.)`, a: 10, why: 'Leaves are i ≥ 10 (2·10 + 1 = 21 ≥ 20), i.e. indices 10..19: 10 leaves. About half, as F02 predicted.' },
    { type: 'free', q: `Explain why inserting keys in random order into a plain BST usually gives height O(log n), but sorted order gives O(n). Use the "first key becomes root" idea.`, model: `<p>The first key becomes the root and splits all later keys into left (smaller) and right (larger). With random order the root is typically near the middle, so each side gets a constant fraction of the keys, recursively: depth grows like log n. With sorted order every new key is larger than all previous ones, so each split is maximally lopsided (0 left, everything right), and the tree degenerates into a vine of height n − 1.</p>`, rubric: ['The first-inserted key becomes the root and partitions the rest', 'Random order: splits are usually balanced-ish, so height ~log n', 'Sorted order: every split is maximally uneven, so height ~n'] },
    { type: 'mcq', q: `Which operation's complexity depends on the tree's <em>height</em>, not n?`, opts: ['BST search for one key', 'Counting all of the nodes', 'In-order traversal of all', 'Summing every node value'], a: 0, why: 'Search walks one root-to-leaf path. The others visit every node: O(n) regardless of shape.' },
    { type: 'num', q: `Heap stored in an array (0-based). Starting at index 22, how many parent-steps reach the root (index 0)?`, a: 4, why: '22 → 10 → 4 → 1 → 0: 4 steps. Depth of index i is ⌊log₂(i + 1)⌋ = ⌊log₂ 23⌋ = 4.' },
    { type: 'mcq', q: `A tree with n nodes has a node with 3 children in the left part and is otherwise binary. Total edges?`, opts: ['n − 1', 'n', 'n + 1', 'Depends on the shape'], a: 0, why: 'Transfer: n − 1 holds for every tree, however many children a node has, because each non-root node has exactly one parent edge.' }
  ]
});
