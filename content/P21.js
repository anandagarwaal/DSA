COURSE.topic({
  id: 'P21',
  intro: `A Fenwick tree (P20) is small and fast but only handles operations with an inverse, so prefix subtraction works. <strong>Range minimum</strong> has no inverse, and neither does "range assign". A segment tree handles any <em>associative</em> combine, plus range updates via lazy propagation. It's the heaviest structure in this course and the one most often over-applied, so the last step is about when <em>not</em> to reach for it.`,
  kps: [
    {
      title: 'A tree over ranges',
      teach: `
<p>Each node owns an interval and stores the answer for it. The root owns [0, n−1]; a node owning [l, r] with l &lt; r has children owning [l, mid] and [mid+1, r]. Leaves own single elements.</p>
<figure class="fig"><svg viewBox="0 0 350 150" width="350" role="img" aria-label="segment tree over 8 elements">
<g font-size="9" text-anchor="middle">
<g style="stroke:var(--soft)"><line x1="175" y1="22" x2="90" y2="52"/><line x1="175" y1="22" x2="260" y2="52"/>
<line x1="90" y1="52" x2="48" y2="82"/><line x1="90" y1="52" x2="132" y2="82"/><line x1="260" y1="52" x2="218" y2="82"/><line x1="260" y1="52" x2="302" y2="82"/>
<line x1="48" y1="82" x2="28" y2="112"/><line x1="48" y1="82" x2="68" y2="112"/><line x1="132" y1="82" x2="112" y2="112"/><line x1="132" y1="82" x2="152" y2="112"/>
<line x1="218" y1="82" x2="198" y2="112"/><line x1="218" y1="82" x2="238" y2="112"/><line x1="302" y1="82" x2="282" y2="112"/><line x1="302" y1="82" x2="322" y2="112"/></g>
<g style="fill:var(--code-bg);stroke:var(--accent)"><rect x="150" y="12" width="50" height="16" rx="3"/><rect x="66" y="42" width="48" height="16" rx="3"/><rect x="236" y="42" width="48" height="16" rx="3"/></g>
<g style="fill:#fff;stroke:var(--rule)"><rect x="26" y="72" width="44" height="16" rx="3"/><rect x="110" y="72" width="44" height="16" rx="3"/><rect x="196" y="72" width="44" height="16" rx="3"/><rect x="280" y="72" width="44" height="16" rx="3"/></g>
<g style="fill:var(--ink)"><text x="175" y="24">[0,7]</text><text x="90" y="54">[0,3]</text><text x="260" y="54">[4,7]</text>
<text x="48" y="84">[0,1]</text><text x="132" y="84">[2,3]</text><text x="218" y="84">[4,5]</text><text x="302" y="84">[6,7]</text>
<text x="28" y="118">[0]</text><text x="68" y="118">[1]</text><text x="112" y="118">[2]</text><text x="152" y="118">[3]</text><text x="198" y="118">[4]</text><text x="238" y="118">[5]</text><text x="282" y="118">[6]</text><text x="322" y="118">[7]</text></g>
<text x="175" y="140" style="fill:var(--soft)">about 2n nodes, height log n</text></g></svg></figure>
<div class="ex">
<div class="sub">Array layout (1-indexed)</div>
<p>Node 1 is the root, node v has children 2v and 2v+1 (F16). Allocate <code>4n</code> to be safe for any n.</p>
<div class="sub">What a node stores</div>
<p>Anything <strong>associative</strong>: sum, min, max, gcd, "number of zeros", even a small struct like (best prefix, best suffix, best subarray). The combine function is the whole design.</p>
<div class="sub">Build</div>
<pre><code>void build(int v, int l, int r) {
    if (l == r) { t[v] = a[l]; return; }
    int mid = (l + r) / 2;
    build(2*v, l, mid);
    build(2*v+1, mid+1, r);
    t[v] = combine(t[2*v], t[2*v+1]);
}</code></pre>
<p>O(n): about 2n nodes, O(1) work each.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Which operation can a Fenwick tree NOT support, forcing a segment tree?`, opts: ['Range minimum with updates', 'Range sum with updates', 'Prefix sum with updates', 'Counting values ≤ x'], a: 0, why: 'Fenwick relies on subtraction to cut a prefix down to a range; min has no inverse.' },
        { type: 'num', q: `How many nodes does a segment tree over n = 8 elements have (leaves plus internal)?`, a: 15, why: '8 leaves + 4 + 2 + 1 = 15, about 2n (F02).' },
        { type: 'mcq', q: `Why allocate 4n rather than 2n for the array layout?`, opts: ['Non-powers of two skip indices', 'Lazy tags need double space', 'Java arrays must be powers of two', 'To allow future insertions'], a: 0, why: 'When n is not a power of two the implicit tree is unbalanced in index space, and the largest index used can approach 4n.' },
        { type: 'free', q: `What property must the stored value and its combine function have, and why? Give one operation that qualifies and one that doesn't.`, model: `<p>The combine must be <strong>associative</strong>: the tree merges children in a fixed nesting, so combine(combine(a,b),c) must equal combine(a,combine(b,c)) for the node values to be independent of how the range was split. Sum, min, max and gcd qualify. "The median of the range" does not: you cannot compute the median of a union from the medians of the halves, so no per-node summary of constant size works.</p>`, rubric: ['Combine must be associative (order of merging must not matter)', 'Gives a valid example (sum/min/max/gcd)', 'Gives a non-example such as median, explaining it cannot be merged from children'] }
      ]
    },
    {
      title: 'Query decomposition: O(log n) canonical nodes',
      teach: `
<pre><code>long query(int v, int nl, int nr, int l, int r) {   // node v owns [nl, nr]; want [l, r]
    if (r &lt; nl || nr &lt; l) return IDENTITY;           // disjoint: contributes nothing
    if (l &lt;= nl &amp;&amp; nr &lt;= r) return t[v];             // fully inside: use the stored answer
    int mid = (nl + nr) / 2;
    return combine(query(2*v, nl, mid, l, r), query(2*v+1, mid+1, nr, l, r));
}</code></pre>
<div class="ex">
<div class="sub">Three cases</div>
<p>Disjoint (return the identity: 0 for sum, +∞ for min), fully covered (return the node), or partial (recurse into both children).</p>
<div class="sub">Worked example, n = 8, query [2, 6]</div>
<p>The range is covered by exactly <strong>three</strong> whole nodes: [2,3], [4,5], [6,6]. Query [1,6] takes four: [1,1], [2,3], [4,5], [6,6].</p>
<div class="sub">Why only O(log n) nodes</div>
<p>At each level, at most <strong>two</strong> nodes are partially covered, one straddling each end of the range. A third partial node at the same level would sit strictly inside the range and therefore be fully covered, not partial. Only partial nodes recurse, so at most 2 per level × log n levels = O(log n) work.</p>
<div class="sub">Point update</div>
<p>Walk to the leaf, then recombine on the way back: one root-to-leaf path, O(log n).</p>
</div>`,
      qs: [
        { type: 'num', q: `Segment tree over n = 8. How many whole nodes cover the query range [2, 6]?`, a: 3, why: '[2,3], [4,5] and [6,6].' },
        { type: 'num', q: `Same tree, query [0, 7]. How many nodes?`, a: 1, why: 'The root already covers it exactly.' },
        { type: 'free', q: `Prove that at most two nodes per level are "partially covered" by a query range, and why that gives O(log n).`, model: `<p>Nodes at one level partition the array into consecutive blocks. A block is partial only if the query range starts or ends strictly inside it. Since the range has exactly two endpoints, at most two blocks per level can be partial; any block strictly between them is entirely inside the range (fully covered) and any block outside is disjoint. Only partial nodes recurse, so the recursion visits at most 2 nodes per level plus their O(1) children, over log n levels: O(log n).</p>`, rubric: ['Nodes at a level partition the array into consecutive blocks', 'Only blocks containing an endpoint of the range can be partial: at most two', 'Only partial nodes recurse, so O(log n) over the levels'] },
        { type: 'mcq', q: `For a range-minimum tree, what should the disjoint case return?`, opts: ['+∞ (the identity for min)', '0, the identity for sum', 'The node value anyway', 'Nothing; skip the branch'], a: 0, why: 'The identity must not change the combine. For min that is +∞ (use Long.MAX_VALUE / Integer.MAX_VALUE carefully).' }
      ]
    },
    {
      title: 'Lazy propagation: postpone range updates',
      teach: `
<p>"Add 5 to every element in [l, r]" touches up to n leaves. Instead, stop at the O(log n) covering nodes, update their stored answer, and leave a <strong>tag</strong> saying "my subtree still owes this update".</p>
<pre><code>void push(int v, int nl, int nr) {          // hand the tag to the children
    if (lazy[v] == 0) return;
    int mid = (nl + nr) / 2;
    apply(2*v, nl, mid, lazy[v]);
    apply(2*v+1, mid+1, nr, lazy[v]);
    lazy[v] = 0;
}
void apply(int v, int nl, int nr, long add) {
    t[v] += add * (nr - nl + 1);            // sum over the node's length
    lazy[v] += add;
}
void update(int v, int nl, int nr, int l, int r, long add) {
    if (r &lt; nl || nr &lt; l) return;
    if (l &lt;= nl &amp;&amp; nr &lt;= r) { apply(v, nl, nr, add); return; }
    push(v, nl, nr);
    int mid = (nl + nr) / 2;
    update(2*v, nl, mid, l, r, add);
    update(2*v+1, mid+1, nr, l, r, add);
    t[v] = t[2*v] + t[2*v+1];
}</code></pre>
<div class="ex">
<div class="sub">The invariant</div>
<p><strong>t[v] is correct for node v's range; lazy[v] is an update already applied to t[v] but not yet to its children.</strong> So you must <code>push</code> before looking at or recursing into children, and recombine afterwards.</p>
<div class="sub">Why multiply by the length</div>
<p>Adding <code>add</code> to every element of a range of length L increases its sum by <code>add × L</code>. For a min-tree the same tag would just add to the minimum, with no length factor: the <em>apply</em> function depends on what you store.</p>
<div class="sub">Cost</div>
<p>O(log n) per range update and per query, since pushes happen only along the same O(log n) paths.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `What exactly does <code>lazy[v]</code> mean?`, opts: ['An update applied to v but not its children', 'An update not yet applied anywhere', 'The number of pending queries', 'The size of v\'s range'], a: 0, why: 'That is why t[v] can be read directly, but any descent must push first.' },
        { type: 'mcq', q: `In a range-add / range-sum tree, applying tag <code>add</code> to a node of length L changes its stored sum by…`, opts: ['add × L', 'add', 'add / L', 'L'], a: 0, why: 'Every one of the L elements increases by add.' },
        { type: 'free', q: `Why must <code>push</code> happen before recursing into children, and what breaks if you forget it?`, model: `<p>The invariant says the children's stored values do <em>not</em> yet include the parent's pending tag. Recursing without pushing reads or updates stale children, so a query returns a value missing the pending update, and a later recombine writes that stale value upward, corrupting the parent too. Pushing first restores the children to a state consistent with their own subtrees before anyone looks at them.</p>`, rubric: ['Children are stale with respect to the parent\'s pending tag', 'Reading/updating them without pushing yields wrong answers', 'Errors propagate upward via recombine'] },
        { type: 'num', q: `Array of 8 zeros in a range-add/range-sum segment tree. After add(+3) on [0,3] and add(+2) on [2,5], what is the sum of [0,7]?`, a: 20, why: '3 × 4 + 2 × 4 = 12 + 8 = 20.' }
      ]
    },
    {
      title: 'When NOT to reach for a segment tree',
      teach: `
<div class="ex">
<div class="sub">The ladder, cheapest first</div>
<table><tr><th>need</th><th>use</th></tr>
<tr><td>static range sums</td><td>prefix sums, P18</td></tr>
<tr><td>range updates, read once at the end</td><td>difference array, P18</td></tr>
<tr><td>point update + prefix/range sum</td><td>Fenwick, P20 (smaller, faster, ~10 lines)</td></tr>
<tr><td>static range min/max, no updates</td><td>sparse table, O(n log n) build, O(1) query</td></tr>
<tr><td>range min/max or gcd <em>with</em> updates</td><td>segment tree</td></tr>
<tr><td>range updates + range queries</td><td>segment tree with lazy</td></tr></table>
<div class="sub">Interview reality</div>
<p>Segment trees are rare at Google/Meta and common in CP. Knowing the ladder, and saying "a BIT is enough here", is worth more than being able to type a lazy segment tree from memory. Reach for the heavy tool only when the lighter ones provably can't do it.</p>
<div class="sub">Cost of getting it wrong</div>
<p>A lazy segment tree is ~60 lines with several places to make an off-by-one; a BIT is ~8 lines. Under interview time pressure, that difference matters.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Static array, 10⁵ range-minimum queries, no updates. Best structure?`, opts: ['Sparse table: O(1) per query', 'Lazy segment tree', 'Fenwick tree over minimums', 'Recompute per query'], a: 0, why: 'No updates means you can precompute overlapping power-of-two blocks and answer each query with two lookups.' },
        { type: 'mcq', q: `Point updates and range sums only. Segment tree or Fenwick?`, opts: ['Fenwick: smaller and simpler', 'Segment tree: strictly more general', 'Neither; use prefix sums', 'Both are O(n) per query'], a: 0, why: 'Same complexity, far less code and a smaller constant.' },
        { type: 'free', q: `An interviewer asks for range sums with point updates and you propose a lazy segment tree. What would a strong candidate say instead, and why?`, model: `<p>Name the ladder and pick the lightest tool that works: point updates plus range sums have an inverse (subtraction), so a Fenwick tree gives the same O(log n) bounds in about eight lines, with less to get wrong and a smaller constant. Mention the segment tree as the fallback if the requirements grow, e.g. range <em>updates</em> (lazy propagation) or an operation without an inverse such as min or gcd. Choosing the simplest sufficient structure, and saying why, is the signal.</p>`, rubric: ['Fenwick suffices because sum has an inverse; same O(log n), far less code', 'Names what would force a segment tree (range updates, min/gcd)', 'Frames it as choosing the lightest sufficient tool'] },
        { type: 'mcq', q: `Range assign ("set every element of [l, r] to x") plus range sum queries. Structure?`, opts: ['Segment tree with lazy assign tags', 'Fenwick tree with a difference array', 'Sparse table, rebuilt per update', 'Plain prefix sums, rebuilt each time'], a: 0, why: 'Assignment is not invertible and affects whole ranges: it needs a lazy tag (and care, since assign tags override pending add tags).' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Segment tree over n = 8, query range [1, 6]. How many whole nodes cover it?`, a: 4, why: '[1,1], [2,3], [4,5], [6,6].' },
    { type: 'free', q: `<strong>Transfer.</strong> Design a segment tree node for "maximum subarray sum within a query range" (values may be negative). What does each node store, and how do you combine two children?`, model: `<p>Each node stores four numbers for its range: total sum, best prefix sum, best suffix sum and best subarray sum. Combine(L, R): total = L.total + R.total; prefix = max(L.prefix, L.total + R.prefix); suffix = max(R.suffix, R.total + L.suffix); best = max(L.best, R.best, L.suffix + R.prefix), the last term covering a subarray that straddles the split. The extra fields are exactly what makes the merge associative, so the tree can answer the query in O(log n).</p>`, rubric: ['Node stores total, best prefix, best suffix, best subarray', 'Combine handles the straddling case with L.suffix + R.prefix', 'Prefix/suffix combine using the other child\'s total; result is associative'] },
    { type: 'mcq', q: `Segment tree query cost on n = 10⁶ elements?`, opts: ['About 20 nodes, 2 per level', 'About 10⁶ nodes, one per leaf', 'About 1000 nodes, √n of them', 'Just 1 node, after building'], a: 0, why: 'At most two partial nodes per level, and log₂ 10⁶ ≈ 20 levels.' },
    { type: 'mcq', q: `Which node value does NOT combine associatively from children?`, opts: ['Median of the range', 'Minimum of the range', 'Sum of the range', 'GCD of the range'], a: 0, why: 'You cannot get the median of a union from the two medians; the others merge with a fixed rule.' },
    { type: 'free', q: `Explain the trade-off ladder: prefix sums → difference array → Fenwick → segment tree → lazy segment tree. What does each step buy, and what does it cost?`, model: `<p>Prefix sums: O(1) range reads, but no updates. Difference arrays: O(1) range writes, but reads only after a final pass. Fenwick: both point update and prefix/range sum in O(log n), at the cost of needing an invertible operation. Segment tree: any associative combine (min, max, gcd, structs) in O(log n), at the cost of ~4n memory and much more code. Lazy propagation: adds range <em>updates</em> in O(log n), at the cost of tags, a push step and more places to get it wrong. Each step buys generality and pays in complexity, so choose the lowest rung that solves the problem.</p>`, rubric: ['Each rung named with what it enables (reads, writes, both, any associative op, range updates)', 'Each rung\'s cost (no updates / delayed reads / needs an inverse / memory and code / tag complexity)', 'Conclusion: pick the lightest sufficient structure'] }
  ],
  practice: [
    { name: 'Range Minimum Query with point updates', lc: 'CSES Dynamic Range Minimum Queries', prompt: `<p>Support update(i, x) and min over [l, r].</p>`, hint: `<p>Identity for min is +∞; recombine on the way back up.</p>`,
      solution: `<pre><code>class MinSegTree {
    private final int n;
    private final int[] t;
    public MinSegTree(int[] a) {
        n = a.length;
        t = new int[4 * n];
        build(1, 0, n - 1, a);
    }
    private void build(int v, int l, int r, int[] a) {
        if (l == r) { t[v] = a[l]; return; }
        int mid = (l + r) / 2;
        build(2*v, l, mid, a);
        build(2*v+1, mid+1, r, a);
        t[v] = Math.min(t[2*v], t[2*v+1]);
    }
    public void update(int i, int x) { update(1, 0, n - 1, i, x); }
    private void update(int v, int l, int r, int i, int x) {
        if (l == r) { t[v] = x; return; }
        int mid = (l + r) / 2;
        if (i &lt;= mid) update(2*v, l, mid, i, x); else update(2*v+1, mid+1, r, i, x);
        t[v] = Math.min(t[2*v], t[2*v+1]);
    }
    public int query(int l, int r) { return query(1, 0, n - 1, l, r); }
    private int query(int v, int nl, int nr, int l, int r) {
        if (r &lt; nl || nr &lt; l) return Integer.MAX_VALUE;     // identity for min
        if (l &lt;= nl &amp;&amp; nr &lt;= r) return t[v];
        int mid = (nl + nr) / 2;
        return Math.min(query(2*v, nl, mid, l, r), query(2*v+1, mid+1, nr, l, r));
    }
}</code></pre><p class="cx">O(n) build, O(log n) per operation.</p>` },
    { name: 'Range add, range sum (lazy)', lc: 'CSES Range Updates and Sums', prompt: `<p>Support "add v to [l, r]" and "sum of [l, r]".</p>`, hint: `<p>apply() scales by the node's length; push() before descending.</p>`,
      solution: `<pre><code>class LazySumTree {
    private final int n;
    private final long[] t, lazy;
    public LazySumTree(int[] a) {
        n = a.length;
        t = new long[4 * n];
        lazy = new long[4 * n];
        build(1, 0, n - 1, a);
    }
    private void build(int v, int l, int r, int[] a) {
        if (l == r) { t[v] = a[l]; return; }
        int mid = (l + r) / 2;
        build(2*v, l, mid, a); build(2*v+1, mid+1, r, a);
        t[v] = t[2*v] + t[2*v+1];
    }
    private void apply(int v, int len, long add) { t[v] += add * len; lazy[v] += add; }
    private void push(int v, int l, int r) {
        if (lazy[v] == 0) return;
        int mid = (l + r) / 2;
        apply(2*v, mid - l + 1, lazy[v]);
        apply(2*v+1, r - mid, lazy[v]);
        lazy[v] = 0;
    }
    public void add(int l, int r, long v) { add(1, 0, n - 1, l, r, v); }
    private void add(int v, int nl, int nr, int l, int r, long val) {
        if (r &lt; nl || nr &lt; l) return;
        if (l &lt;= nl &amp;&amp; nr &lt;= r) { apply(v, nr - nl + 1, val); return; }
        push(v, nl, nr);
        int mid = (nl + nr) / 2;
        add(2*v, nl, mid, l, r, val);
        add(2*v+1, mid+1, nr, l, r, val);
        t[v] = t[2*v] + t[2*v+1];
    }
    public long sum(int l, int r) { return sum(1, 0, n - 1, l, r); }
    private long sum(int v, int nl, int nr, int l, int r) {
        if (r &lt; nl || nr &lt; l) return 0;
        if (l &lt;= nl &amp;&amp; nr &lt;= r) return t[v];
        push(v, nl, nr);
        int mid = (nl + nr) / 2;
        return sum(2*v, nl, mid, l, r) + sum(2*v+1, mid+1, nr, l, r);
    }
}</code></pre><p class="cx">O(log n) per operation. The length factor is what makes an add tag correct for sums.</p>` }
  ]
});
