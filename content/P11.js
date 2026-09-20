COURSE.topic({
  id: 'P11',
  intro: `Backtracking is a depth-first walk over the <strong>decision tree</strong> of F14: each level makes one choice, each leaf is a complete candidate. The code is always the same three moves: <em>choose, explore, un-choose</em>. The skill is (1) drawing the right decision tree, (2) cutting dead branches early (pruning), and (3) reading the complexity off the tree's size (F06, F14).`,
  kps: [
    {
      title: 'Choose, explore, un-choose',
      teach: `
<pre><code>void backtrack(State s, List&lt;Integer&gt; path) {
    if (isComplete(s)) { result.add(new ArrayList&lt;&gt;(path)); return; }   // copy!
    for (Choice c : choices(s)) {
        path.add(c);            // choose
        backtrack(next(s, c), path);  // explore the subtree under this choice
        path.remove(path.size() - 1); // un-choose: restore state for the next sibling
    }
}</code></pre>
<div class="ex">
<div class="sub">Why un-choose?</div>
<p>One shared <code>path</code> list is reused across the whole search. Invariant: <strong>on entry to backtrack, path holds exactly the choices on the route from the root to this node</strong>. Undoing after each child restores that invariant for the next sibling.</p>
<div class="sub">Why copy at the leaf?</div>
<p><code>result.add(path)</code> would store a reference to the same list, which is later mutated and emptied. Every stored answer would end up identical (empty). <code>new ArrayList&lt;&gt;(path)</code> snapshots it.</p>
<div class="sub">Cost of the copy</div>
<p>O(length of path) per leaf. That's where the extra factor n in O(n · 2ⁿ) comes from.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `A backtracking solution stores <code>result.add(path)</code> without copying. The output is…`, opts: ['Many references to one emptied list', 'Correct, just slower to build', 'A ConcurrentModificationException', 'Only the first valid answer'], a: 0, why: 'Every entry points to the same list, which ends up empty after all un-choose steps.' },
        { type: 'free', q: `State the invariant that "un-choose" maintains, and explain what goes wrong for the second sibling if you forget it.`, model: `<p>Invariant: when backtrack is entered at a node, path contains exactly the choices along the route from the root to that node. After exploring child c1, path still has c1 appended. If you don't remove it, the second sibling c2 is explored with path = [..., c1, c2], a route that doesn't exist. Answers get extra, wrong elements and the tree is effectively corrupted.</p>`, rubric: ['Invariant: path = choices from root to the current node', 'Without un-choose, the previous sibling\'s choice leaks into the next', 'Results contain extra/wrong elements'] },
        { type: 'mcq', q: `Instead of a shared list with un-choose, you pass a <em>new copy</em> of path to each call. Consequence?`, opts: ['Correct but more copying and memory', 'Wrong answers for every input', 'It becomes a BFS traversal', 'Faster, since nothing is undone'], a: 0, why: 'Copies never need undoing, but each call pays O(n) to copy. Shared + undo is the standard efficient form.' },
        { type: 'num', q: `Generating all subsets of 3 elements with the include/exclude recursion: total calls (nodes in the decision tree)?`, a: 15, why: '1 + 2 + 4 + 8 = 15 nodes; the 8 leaves are the subsets.' }
      ]
    },
    {
      title: 'Subsets, permutations, combinations as decision trees',
      teach: `
<p>Draw the tree first. The code follows from it.</p>
<div class="ex">
<div class="sub">Subsets: one level per element, 2 branches (in / out)</div>
<p>2ⁿ leaves. Or the loop form: each node is a subset, and its children add a <em>later</em> element (index j &gt; last). Every node is an answer: 2ⁿ nodes.</p>
<div class="sub">Permutations: one level per position, branching n, n−1, …</div>
<p>n! leaves. Track a <code>used[]</code> array; at each level try every unused element.</p>
<pre><code>for (int i = 0; i &lt; n; i++) {
    if (used[i]) continue;
    used[i] = true; path.add(a[i]);
    backtrack(path);
    path.remove(path.size() - 1); used[i] = false;
}</code></pre>
<div class="sub">Combinations (choose k), combination sum</div>
<p>Like subsets but only go forward (start index), so {1, 2} and {2, 1} aren't both generated. For combination sum where elements can be reused, recurse with the <em>same</em> start index j rather than j + 1.</p>
<div class="sub">Duplicates in the input</div>
<p>Sort, then at each level skip a[j] if it equals a[j−1] <em>at the same level</em> (j &gt; start). Equal siblings would produce identical subtrees.</p>
</div>`,
      qs: [
        { type: 'num', q: `Permutations of 3 distinct elements: total recursive calls including the root?`, a: 16, why: '1 + 3 + 6 + 6: root, 3 first choices, 6 two-element prefixes, 6 complete permutations.' },
        { type: 'mcq', q: `Combination Sum (reuse allowed): after choosing candidates[j], recurse with start index…`, opts: ['j, so it may be reused', 'j + 1, move past it', '0, restart the scan', 'j − 1, allow the smaller'], a: 0, why: 'Staying at j allows reuse; never going back below j avoids duplicate orderings like [2, 3] vs [3, 2].' },
        { type: 'num', q: `Subsets II of [1, 2, 2] (no duplicate subsets). How many?`, a: 6, why: '[], [1], [1,2], [1,2,2], [2], [2,2].' },
        { type: 'free', q: `In Subsets II, why skip a[j] when j &gt; start and a[j] == a[j−1], but NOT when j == start?`, model: `<p>At one level of the tree, siblings are the different choices for the next element. Two equal siblings would root identical subtrees, so choosing the second equal value at the same level only duplicates results. But when j == start, a[j] is the first option at this level: using it may be legitimately choosing a second copy after an equal value was chosen at the level above (e.g. [2, 2]). So the skip applies only among siblings (j &gt; start).</p>`, rubric: ['Equal siblings at the same level produce identical subtrees', 'j == start is the first choice at this level, so it can be a second copy chosen deeper (e.g. [2,2])', 'So skip only when j &gt; start'] }
      ]
    },
    {
      title: 'Pruning: cut a branch as soon as it cannot succeed',
      teach: `
<p>The raw decision tree is huge. <strong>Pruning</strong> means detecting early that no leaf under the current node can be valid, and returning immediately. That erases the whole subtree (F09's idea on a tree).</p>
<div class="ex">
<div class="sub">Combination Sum: sort, then break</div>
<pre><code>Arrays.sort(c);
for (int j = start; j &lt; c.length; j++) {
    if (c[j] &gt; remaining) break;     // this and every later candidate is too big
    path.add(c[j]); go(j, remaining - c[j], path); path.remove(path.size() - 1);
}</code></pre>
<p><code>break</code> (not continue) is valid <em>because of sorting</em>: all later candidates are even larger.</p>
<div class="sub">N-Queens: check constraints while placing</div>
<p>Place one queen per row. Before recursing, check column and both diagonals (r − c and r + c identify a diagonal) in O(1) with boolean arrays. An invalid partial board is abandoned immediately, so the search never builds full boards to test them afterwards.</p>
<div class="sub">What pruning does to the complexity</div>
<p>The worst-case bound (e.g. n!) often stays the same on paper, but the <em>actual</em> tree explored shrinks enormously. 8-Queens without pruning has 8⁸ ≈ 16.7 million placements; with row/column/diagonal pruning, only about 2,000 nodes are visited to find all 92 solutions.</p>
</div>`,
      qs: [
        { type: 'num', q: `Combination Sum: candidates [2, 3, 6, 7], target 7. Number of distinct combinations?`, a: 2, why: '[2, 2, 3] and [7].' },
        { type: 'mcq', q: `Why can Combination Sum <code>break</code> instead of <code>continue</code> when c[j] &gt; remaining?`, opts: ['The candidates are sorted ascending', 'break is faster than continue', 'Only one candidate can be too big', 'Java loops require break here'], a: 0, why: 'Sortedness means every later candidate also exceeds remaining: the whole rest of the level is dead.' },
        { type: 'num', q: `Number of solutions to 8-Queens?`, a: 92, why: 'A classic count; pruning finds them visiting a tiny fraction of the 8⁸ raw placements.' },
        { type: 'free', q: `In N-Queens, why do r − c and r + c identify the two diagonals, and how does that make the constraint check O(1)?`, model: `<p>Along a "\\" diagonal, stepping down a row also steps right a column, so r − c stays constant. Along a "/" diagonal, r increases as c decreases, so r + c stays constant. Each diagonal therefore has a unique id. Keep boolean arrays cols[c], diag1[r − c + n], diag2[r + c]; placing a queen checks and sets three entries, which is O(1) instead of scanning the board.</p>`, rubric: ['r − c is constant along one diagonal direction, r + c along the other', 'Boolean arrays indexed by those ids (offset r − c)', 'Check and update in O(1) per placement'] }
      ]
    },
    {
      title: 'Complexity from the size of the decision tree',
      teach: `
<p>Backtracking time = <strong>(number of nodes in the tree) × (work per node)</strong>, plus the cost of copying answers at the leaves. Read it off the tree, as in F06.</p>
<div class="ex">
<div class="sub">Subsets</div>
<p>2ⁿ leaves (answers), each copied in O(n): <strong>O(n · 2ⁿ)</strong>. That matches the output-size lower bound (F14), so it's optimal.</p>
<div class="sub">Permutations</div>
<p>n! leaves × O(n) copy, and internal nodes add at most a constant factor more: <strong>O(n · n!)</strong>.</p>
<div class="sub">Word Search (grid R × C, word length L)</div>
<p>Start from each of RC cells; each step has at most 3 new directions (you can't go back where you came from): <strong>O(RC · 3ᴸ)</strong>. Pruning (mismatched letter) cuts most branches at once.</p>
<div class="sub">Space</div>
<p>O(depth) for the recursion and path (n for subsets and permutations, L for word search), plus the output.</p>
</div>
<p>When n ≈ 20 and the tree is 2ⁿ, fine. When n = 40, no pruning will save you: look for DP or meet-in-the-middle (F14's constraint table).</p>`,
      qs: [
        { type: 'mcq', q: `"Return all subsets" of n = 20 elements: realistic cost?`, opts: ['About 2 × 10⁷: feasible', 'About 10¹⁸: infeasible', 'About 400: trivial', 'About 20!: infeasible'], a: 0, why: 'n · 2ⁿ ≈ 20 × 10⁶.' },
        { type: 'mcq', q: `Word Search on an R × C grid, word length L. Complexity bound?`, opts: ['O(R · C · 3ᴸ)', 'O(R · C · L)', 'O((R · C)ᴸ)', 'O(4 · R · C)'], a: 0, why: 'RC start cells; each step branches to at most 3 unvisited neighbours.' },
        { type: 'free', q: `Why can't any backtracking algorithm that returns all permutations beat O(n · n!), however clever its pruning?`, model: `<p>The output itself has n! permutations of length n, so just writing it takes Ω(n · n!) (F14's output-size bound). Pruning removes subtrees that produce no answers, but when every leaf is an answer there's nothing to prune. The bound is set by the output, not the search.</p>`, rubric: ['Output size is n! permutations × length n', 'Writing output is a lower bound: Ω(n · n!)', 'Pruning only removes non-answer subtrees; here every leaf is an answer'] },
        { type: 'num', q: `Extra space (excluding output) for generating permutations of n = 10 elements: maximum recursion depth?`, a: 10, why: 'One level per position: depth n (plus the used[] array and path of size n).' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Generate all valid combinations of n pairs of parentheses." Describe the decision tree, the pruning rules, and why no invalid string is ever built.`, model: `<p>Each level appends '(' or ')'. Track open and close counts. Prune: add '(' only if open &lt; n; add ')' only if close &lt; open. Any prefix built this way never has more ')' than '(' and never more than n of either, so every complete string (length 2n) is balanced, and no branch is ever explored past the point of invalidity. Leaves are exactly the valid strings (the Catalan number of them).</p>`, rubric: ['Two choices per level: open or close', 'Pruning rules: open &lt; n, close &lt; open', 'Invariant: every prefix is a valid prefix, so leaves are all valid'] },
    { type: 'num', q: `Combination Sum with candidates [2, 3, 5] and target 8: number of combinations?`, a: 3, why: '[2,2,2,2], [2,3,3], [3,5].' },
    { type: 'mcq', q: `Palindrome Partitioning: at each position you choose where the next piece ends. Pruning rule?`, opts: ['Only recurse if the piece is a palindrome', 'Only recurse on pieces of length one', 'Stop once any piece has length two', 'Sort the string before partitioning'], a: 0, why: 'A non-palindromic piece can never be part of a valid partition: cut that branch immediately.' },
    { type: 'num', q: `N-Queens for n = 4: number of solutions?`, a: 2, why: 'Two mirror-image boards.' },
    { type: 'free', q: `Discriminate: "count the subsets summing to target" vs "list the subsets summing to target". Which calls for backtracking and which for DP, and why?`, model: `<p>Listing needs every answer written out, so the output can be exponential: backtracking (with pruning) is appropriate and can't be beaten asymptotically. Counting outputs one number, so there's no output-size bound. The count depends only on (index, remaining target), so overlapping subproblems can be merged: DP in O(n · target) (P16). Backtracking for counting would needlessly enumerate an exponential tree.</p>`, rubric: ['Listing: output may be exponential, so backtracking is appropriate', 'Counting: a single number, with state (index, remaining) repeating', 'DP gives O(n · target) for counting'] }
  ],
  practice: [
    { name: 'Subsets', lc: 'LeetCode 78', prompt: `<p>All subsets of distinct integers.</p>`, hint: `<p>Every node of the loop-style tree is an answer.</p>`,
      solution: `<pre><code>public List&lt;List&lt;Integer&gt;&gt; subsets(int[] a) {
    List&lt;List&lt;Integer&gt;&gt; res = new ArrayList&lt;&gt;();
    go(a, 0, new ArrayList&lt;&gt;(), res);
    return res;
}
private void go(int[] a, int start, List&lt;Integer&gt; path, List&lt;List&lt;Integer&gt;&gt; res) {
    res.add(new ArrayList&lt;&gt;(path));
    for (int j = start; j &lt; a.length; j++) {
        path.add(a[j]);
        go(a, j + 1, path, res);
        path.remove(path.size() - 1);
    }
}</code></pre><p class="cx">O(n · 2ⁿ).</p>` },
    { name: 'Permutations', lc: 'LeetCode 46', prompt: `<p>All permutations of distinct integers.</p>`, hint: `<p>used[] marks what's already on the path.</p>`,
      solution: `<pre><code>public List&lt;List&lt;Integer&gt;&gt; permute(int[] a) {
    List&lt;List&lt;Integer&gt;&gt; res = new ArrayList&lt;&gt;();
    go(a, new boolean[a.length], new ArrayList&lt;&gt;(), res);
    return res;
}
private void go(int[] a, boolean[] used, List&lt;Integer&gt; path, List&lt;List&lt;Integer&gt;&gt; res) {
    if (path.size() == a.length) { res.add(new ArrayList&lt;&gt;(path)); return; }
    for (int i = 0; i &lt; a.length; i++) {
        if (used[i]) continue;
        used[i] = true; path.add(a[i]);
        go(a, used, path, res);
        path.remove(path.size() - 1); used[i] = false;
    }
}</code></pre><p class="cx">O(n · n!).</p>` },
    { name: 'Combination Sum', lc: 'LeetCode 39', prompt: `<p>Combinations (reuse allowed) summing to target.</p>`, hint: `<p>Sort; recurse with the same start; break when a candidate exceeds what remains.</p>`,
      solution: `<pre><code>public List&lt;List&lt;Integer&gt;&gt; combinationSum(int[] c, int target) {
    Arrays.sort(c);
    List&lt;List&lt;Integer&gt;&gt; res = new ArrayList&lt;&gt;();
    go(c, 0, target, new ArrayList&lt;&gt;(), res);
    return res;
}
private void go(int[] c, int start, int rem, List&lt;Integer&gt; path, List&lt;List&lt;Integer&gt;&gt; res) {
    if (rem == 0) { res.add(new ArrayList&lt;&gt;(path)); return; }
    for (int j = start; j &lt; c.length &amp;&amp; c[j] &lt;= rem; j++) {
        path.add(c[j]);
        go(c, j, rem - c[j], path, res);
        path.remove(path.size() - 1);
    }
}</code></pre><p class="cx">The loop condition c[j] ≤ rem is the sorted-break pruning.</p>` },
    { name: 'Word Search', lc: 'LeetCode 79', prompt: `<p>Does the word exist in the grid via adjacent cells (no reuse)?</p>`, hint: `<p>Mark the cell visited on the way down; restore it on the way up.</p>`,
      solution: `<pre><code>public boolean exist(char[][] b, String w) {
    for (int r = 0; r &lt; b.length; r++)
        for (int c = 0; c &lt; b[0].length; c++)
            if (dfs(b, w, 0, r, c)) return true;
    return false;
}
private boolean dfs(char[][] b, String w, int i, int r, int c) {
    if (i == w.length()) return true;
    if (r &lt; 0 || c &lt; 0 || r &gt;= b.length || c &gt;= b[0].length || b[r][c] != w.charAt(i)) return false;
    char saved = b[r][c];
    b[r][c] = '#';                                          // choose (mark visited)
    boolean found = dfs(b, w, i + 1, r + 1, c) || dfs(b, w, i + 1, r - 1, c)
                 || dfs(b, w, i + 1, r, c + 1) || dfs(b, w, i + 1, r, c - 1);
    b[r][c] = saved;                                        // un-choose
    return found;
}</code></pre><p class="cx">O(R · C · 3ᴸ). A mismatched letter prunes immediately.</p>` }
  ]
});
