COURSE.topic({
  id: 'P20',
  intro: `Prefix sums (P18) die the moment the array changes: one edit invalidates every later prefix. A <strong>Fenwick tree</strong> (binary indexed tree) keeps both operations cheap, O(log n) for a point update and O(log n) for a prefix query, in an array of n+1 longs and about ten lines of code. The whole structure hangs on one bit trick: <code>i &amp; -i</code>.`,
  kps: [
    {
      title: 'The problem prefix sums cannot solve',
      teach: `
<div class="ex">
<div class="sub">The two extremes</div>
<table><tr><th>structure</th><th>point update</th><th>prefix query</th></tr>
<tr><td>plain array</td><td>O(1)</td><td>O(n) (scan)</td></tr>
<tr><td>prefix sums (P18)</td><td>O(n) (rebuild)</td><td>O(1)</td></tr>
<tr><td>Fenwick tree</td><td>O(log n)</td><td>O(log n)</td></tr></table>
<div class="sub">When you need the middle option</div>
<p>Interleaved updates and queries: "add 5 to position 3, then what is the sum of 0..7?", running rank/count queries, counting inversions while scanning, and any CSES "Dynamic Range Sum Queries" style problem.</p>
<div class="sub">The idea in one line</div>
<p>Store <strong>partial sums of blocks</strong>, not individual elements, and choose the blocks so that every prefix is the sum of O(log n) of them and every element belongs to O(log n) of them.</p>
</div>
<p>Range sum from a prefix structure: <code>sum(l..r) = prefix(r+1) − prefix(l)</code>, the same fence-post subtraction as P18.</p>`,
      qs: [
        { type: 'mcq', q: `10⁵ operations mixing point updates and prefix-sum queries. Plain prefix sums cost…`, opts: ['O(n) per update: about 10¹⁰ total', 'O(1) per update after a rebuild', 'O(log n) per update', 'The same as a Fenwick tree'], a: 0, why: 'Each update forces a rebuild of every later prefix.' },
        { type: 'mcq', q: `Why not just keep the raw array and sum on demand?`, opts: ['Queries become O(n) each', 'Updates become O(n) each', 'It cannot store negative values', 'It needs O(n log n) memory'], a: 0, why: 'Cheap updates, expensive queries: the mirror image of the prefix-sum problem.' },
        { type: 'free', q: `Why does one point update destroy a prefix-sum array, and what does a Fenwick tree do differently?`, model: `<p>P[i] is the total of everything before i, so changing a[j] changes every P[i] with i &gt; j: O(n) entries to repair. A Fenwick tree instead stores sums of carefully chosen blocks, each covering a power-of-two-sized range. Changing a[j] touches only the blocks that contain j, and each index belongs to at most log n blocks, so an update is O(log n). Prefixes are then reassembled from O(log n) blocks rather than read from a single cell.</p>`, rubric: ['A point change invalidates all later prefixes: O(n) repair', 'Fenwick stores block sums, and j belongs to only O(log n) blocks', 'Queries reassemble a prefix from O(log n) blocks'] },
        { type: 'mcq', q: `A Fenwick tree gives prefix sums. How do you get the sum of a[l..r]?`, opts: ['prefix(r+1) − prefix(l)', 'prefix(r) − prefix(l)', 'prefix(r) + prefix(l)', 'It cannot do range sums'], a: 0, why: 'Same fence-post subtraction as a static prefix array.' }
      ]
    },
    {
      title: 'What index i covers: the lowest set bit',
      teach: `
<p>Fenwick trees are <strong>1-indexed</strong>. Node i stores the sum of the <code>i &amp; -i</code> elements ending at i, where <code>i &amp; -i</code> isolates the lowest set bit.</p>
<div class="ex">
<div class="sub">Reading i &amp; -i</div>
<p>In two's complement, <code>-i</code> is <code>~i + 1</code>, which flips every bit above the lowest set bit and leaves it standing. So 6 = 110₂ gives 6 &amp; −6 = 2: node 6 covers 2 elements (positions 5 and 6). Node 8 = 1000₂ covers 8 (positions 1..8). Odd nodes cover 1.</p>
<div class="sub">Worked example: a = [3, 1, 4, 1, 5, 9, 2, 6]</div>
<pre><code>index : 1  2  3  4  5  6  7  8
tree  : 3  4  4  9  5 14  2 31
         ^  ^     ^     ^     ^
         |  |     |     |     +-- positions 1..8 (31 = whole array)
         |  |     |     +-------- positions 5..6 (5 + 9)
         |  |     +-------------- positions 1..4 (3 + 1 + 4 + 1)
         |  +-------------------- positions 1..2 (3 + 1)
         +----------------------- position 1</code></pre>
<div class="sub">The picture</div>
<p>Blocks of power-of-two lengths stacked so that any prefix is a disjoint union of a few of them, exactly like writing a number in binary: prefix 6 = block of 4 (1..4) + block of 2 (5..6).</p>
</div>`,
      qs: [
        { type: 'num', q: `What is 12 &amp; −12?`, a: 4, why: '12 = 1100₂; the lowest set bit is 4, so node 12 covers 4 elements (9..12).' },
        { type: 'num', q: `a = [3, 1, 4, 1, 5, 9, 2, 6] (1-indexed). What value does Fenwick node 6 store?`, a: 14, why: 'Node 6 covers 6 &amp; −6 = 2 elements, positions 5..6: 5 + 9 = 14.' },
        { type: 'mcq', q: `Which node stores the sum of the entire 8-element array?`, opts: ['Node 8', 'Node 1', 'Node 7', 'Node 4'], a: 0, why: '8 = 1000₂ covers 8 elements, positions 1..8.' },
        { type: 'free', q: `Explain why every prefix 1..k can be written as a disjoint union of O(log n) Fenwick blocks.`, model: `<p>Removing the lowest set bit of k (k −= k &amp; −k) takes you from k to the end of the block just before k's block, and each such step clears one set bit. A number below n has at most log₂ n set bits, so at most log₂ n steps reach 0. The blocks visited are disjoint (each covers the stretch immediately before the next), and together they tile 1..k exactly, just like the binary expansion of k tiles k.</p>`, rubric: ['Each step clears the lowest set bit, moving to the previous block', 'A number has at most log n set bits, so O(log n) blocks', 'Blocks are disjoint and tile the prefix exactly (binary expansion)'] }
      ]
    },
    {
      title: 'Update walks up, query walks down',
      teach: `
<pre><code>private final long[] t;        // 1-indexed, size n + 1

void update(int i, long delta) {          // i is 1-based
    for (; i &lt; t.length; i += i &amp; -i) t[i] += delta;
}
long prefix(int i) {                       // sum of positions 1..i
    long s = 0;
    for (; i &gt; 0; i -= i &amp; -i) s += t[i];
    return s;
}</code></pre>
<div class="ex">
<div class="sub">Query walks down: strip the lowest set bit</div>
<p>prefix(6): 6 = 110₂ → take t[6] (positions 5..6), then 6 − 2 = 4 → take t[4] (positions 1..4), then 4 − 4 = 0, stop. <strong>Two</strong> nodes, total 14 + 9 = 23, which is 3+1+4+1+5+9 ✓.</p>
<div class="sub">Update walks up: add the lowest set bit</div>
<p>update(5, δ): 5 → 6 → 8 → stop (past n). Those are exactly the blocks containing position 5.</p>
<div class="sub">Why the two loops are inverses</div>
<p>Going down removes set bits, so it visits O(log n) disjoint blocks that tile the prefix. Going up jumps to the next larger block that <em>contains</em> i, so it visits every block whose range covers i. Both terminate in O(log n) steps.</p>
<div class="sub">Building</div>
<p>n calls to update is O(n log n); there is also an O(n) build (add each t[i] into its parent i + (i &amp; −i)), worth mentioning but rarely needed.</p>
</div>`,
      qs: [
        { type: 'num', q: `How many tree nodes does <code>prefix(6)</code> read?`, a: 2, why: '6 → 4 → 0: nodes 6 and 4.' },
        { type: 'num', q: `n = 8. Which nodes does <code>update(5, δ)</code> touch? Give how many.`, a: 3, why: 'Nodes 5, 6, 8: the blocks containing position 5.' },
        { type: 'num', q: `a = [3, 1, 4, 1, 5, 9, 2, 6]. What does prefix(6) return?`, a: 23, why: 't[6] + t[4] = 14 + 9 = 23.' },
        { type: 'free', q: `Explain why <code>i += i &amp; -i</code> visits exactly the blocks that contain position i.`, model: `<p>Node i covers the (i &amp; −i) positions ending at i, so it contains position i. The next block containing i must be larger and end later; adding the lowest set bit produces the smallest index whose block starts at or before i's block and extends past it, i.e. the immediate parent in the implicit tree. Repeating reaches successively larger enclosing blocks until the index exceeds n. Each step clears at least one low bit and moves to a strictly larger power-of-two block, so there are at most log n steps.</p>`, rubric: ['Node i itself covers position i', 'Adding the lowest set bit gives the next enclosing block (the parent)', 'Blocks grow, so at most log n steps until past n'] }
      ]
    },
    {
      title: 'Counting inversions with a BIT over values',
      teach: `
<p>The classic non-obvious use: a Fenwick tree over <em>values</em>, not positions, counting how many elements you have already seen.</p>
<div class="ex">
<div class="sub">Inversions</div>
<p>An inversion is a pair i &lt; j with a[i] &gt; a[j]. Scan left to right; when you reach a[j], the inversions ending at j are the already-seen values that are <strong>greater</strong> than a[j]:</p>
<pre><code>// values compressed to 1..m
long inversions = 0;
for (int j = 0; j &lt; n; j++) {
    inversions += seenSoFar - bit.prefix(a[j]);   // seen values &gt; a[j]
    bit.update(a[j], 1);
    seenSoFar++;
}</code></pre>
<div class="sub">Why a BIT and not a sorted list</div>
<p>You need "how many seen values are ≤ x" while inserting: exactly prefix-count with updates. O(n log n) overall.</p>
<div class="sub">Coordinate compression</div>
<p>Values may be up to 10⁹ but there are only n of them. Sort the distinct values, map each to its rank, and index the BIT by rank. That's the same density argument as array-vs-hash-map (F11).</p>
<div class="sub">Worked example</div>
<p>[3, 1, 4, 1, 5] has <strong>3</strong> inversions: (3,1), (3,1), (4,1).</p>
</div>`,
      qs: [
        { type: 'num', q: `How many inversions does [3, 1, 4, 1, 5] have?`, a: 3, why: '(3,1), (3,1) with the second 1, and (4,1).' },
        { type: 'num', q: `How many inversions does [5, 4, 3, 2, 1] have?`, a: 10, why: 'Every pair is inverted: C(5,2) = 10, the maximum possible.' },
        { type: 'mcq', q: `Why compress values before indexing a BIT by value?`, opts: ['Values up to 10⁹ need a 10⁹-slot array', 'Compression makes the array sorted', 'BITs cannot store large numbers', 'It reduces the query to O(1)'], a: 0, why: 'Only n distinct values matter, so ranks 1..n suffice: the sparse-vs-dense criterion from F11.' },
        { type: 'free', q: `Merge sort also counts inversions in O(n log n). Compare it with the BIT method: what does each need, and when would you choose each?`, model: `<p>Merge sort counts inversions while merging (each element taken from the right half is inverted with everything left in the left half), needs no compression, uses O(n) extra space, and is self-contained. The BIT method needs coordinate compression and an O(n) structure but is easier to extend: swap the query and you get "count values in a range seen so far", running rank, or k-th smallest, and it handles online/streaming updates where merge sort would have to re-run. Choose merge sort for a one-off count, the BIT when queries continue as data arrives.</p>`, rubric: ['Merge sort: counts during the merge, no compression needed, one-off', 'BIT: needs compression, but supports ongoing/rank queries and streaming updates', 'Both O(n log n); pick by whether queries continue'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Fenwick tree with n = 16. How many nodes does <code>prefix(15)</code> read?`, a: 4, why: '15 = 1111₂ has four set bits: nodes 15, 14, 12, 8.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Count of Smaller Numbers After Self": for each i, how many j &gt; i have a[j] &lt; a[i]. Give a BIT solution and its complexity.`, model: `<p>Compress the values to ranks 1..m. Scan from <em>right to left</em>, keeping a BIT of the values seen so far (i.e. to the right of i). For each i, the answer is prefix(rank(a[i]) − 1): the count of already-seen values strictly smaller. Then update(rank(a[i]), 1). O(n log n) time, O(n) space. Scanning right to left is what makes "already seen" mean "to the right".</p>`, rubric: ['Coordinate-compress the values', 'Scan right to left so the BIT holds elements to the right', 'Answer = prefix(rank − 1), then update; O(n log n)'] },
    { type: 'mcq', q: `A Fenwick tree stores sums. Which operation is it NOT suited to?`, opts: ['Range minimum with updates', 'Prefix sums with updates', 'Range sums with updates', 'Counting values ≤ x'], a: 0, why: 'Minimum has no inverse, so prefix(r) − prefix(l) is meaningless. Use a segment tree (P21).' },
    { type: 'num', q: `a = [3, 1, 4, 1, 5, 9, 2, 6] with a Fenwick tree. After <code>update(3, +10)</code>, what does prefix(4) return?`, a: 19, why: 'Original prefix(4) = 3 + 1 + 4 + 1 = 9; adding 10 at position 3 gives 19.' },
    { type: 'free', q: `Why is a Fenwick tree O(log n) for both operations, while a plain array and a prefix array are each O(1) for one and O(n) for the other?`, model: `<p>A plain array stores the finest possible pieces (single elements): updates touch one cell, but a prefix needs n of them. A prefix array stores the coarsest pieces (all prefixes): a query reads one cell, but an update invalidates n of them. A Fenwick tree stores intermediate blocks of power-of-two lengths, so a prefix is covered by only log n blocks and any element lies in only log n blocks. It's a deliberate trade at the midpoint of the two extremes.</p>`, rubric: ['Array = finest granularity: cheap update, expensive query', 'Prefix array = coarsest: cheap query, expensive update', 'Fenwick = power-of-two blocks: both bounded by log n, the midpoint trade'] }
  ],
  practice: [
    { name: 'Range Sum Query - Mutable', lc: 'LeetCode 307 · CSES Dynamic Range Sum Queries', prompt: `<p>Support update(index, val) and sumRange(l, r).</p>`, hint: `<p>Store deltas: update the BIT by (new − old), and keep the raw array to know the old value.</p>`,
      solution: `<pre><code>class NumArray {
    private final int[] a;
    private final long[] t;          // 1-indexed Fenwick tree
    public NumArray(int[] nums) {
        a = nums.clone();
        t = new long[nums.length + 1];
        for (int i = 0; i &lt; nums.length; i++) add(i + 1, nums[i]);
    }
    private void add(int i, long delta) { for (; i &lt; t.length; i += i &amp; -i) t[i] += delta; }
    private long prefix(int i) { long s = 0; for (; i &gt; 0; i -= i &amp; -i) s += t[i]; return s; }
    public void update(int index, int val) {
        add(index + 1, val - a[index]);
        a[index] = val;
    }
    public int sumRange(int l, int r) { return (int) (prefix(r + 1) - prefix(l)); }
}</code></pre><p class="cx">O(log n) per operation, O(n) space.</p>` },
    { name: 'Count of Smaller Numbers After Self', lc: 'LeetCode 315', prompt: `<p>For each i, count the j &gt; i with nums[j] &lt; nums[i].</p>`, hint: `<p>Compress values; scan right to left; query prefix(rank − 1).</p>`,
      solution: `<pre><code>public List&lt;Integer&gt; countSmaller(int[] nums) {
    int n = nums.length;
    int[] sorted = nums.clone();
    Arrays.sort(sorted);
    long[] t = new long[n + 2];
    Integer[] res = new Integer[n];
    for (int i = n - 1; i &gt;= 0; i--) {
        int rank = lowerBound(sorted, nums[i]) + 1;        // 1-based rank
        int count = 0;
        for (int j = rank - 1; j &gt; 0; j -= j &amp; -j) count += t[j];
        res[i] = count;
        for (int j = rank; j &lt; t.length; j += j &amp; -j) t[j]++;
    }
    return Arrays.asList(res);
}
private int lowerBound(int[] s, int x) {
    int lo = 0, hi = s.length;
    while (lo &lt; hi) { int mid = lo + (hi - lo) / 2; if (s[mid] &lt; x) lo = mid + 1; else hi = mid; }
    return lo;
}</code></pre><p class="cx">O(n log n). Duplicates share a rank, and prefix(rank − 1) counts strictly smaller values.</p>` },
    { name: 'Count inversions', lc: 'CSES-style', prompt: `<p>Count pairs i &lt; j with a[i] &gt; a[j].</p>`, hint: `<p>Scan left to right; inversions ending at j = (seen so far) − (seen values ≤ a[j]).</p>`,
      solution: `<pre><code>public long countInversions(int[] a) {
    int n = a.length;
    int[] sorted = a.clone();
    Arrays.sort(sorted);
    long[] t = new long[n + 2];
    long inv = 0;
    for (int j = 0; j &lt; n; j++) {
        int rank = lowerBound(sorted, a[j]) + 1;
        long seenLeq = 0;
        for (int i = rank; i &gt; 0; i -= i &amp; -i) seenLeq += t[i];
        inv += j - seenLeq;                       // seen so far (j) minus those &lt;= a[j]
        for (int i = rank; i &lt; t.length; i += i &amp; -i) t[i]++;
    }
    return inv;
}
private int lowerBound(int[] s, int x) {
    int lo = 0, hi = s.length;
    while (lo &lt; hi) { int mid = lo + (hi - lo) / 2; if (s[mid] &lt; x) lo = mid + 1; else hi = mid; }
    return lo;
}</code></pre><p class="cx">O(n log n). Equal values are not inversions, which is why the query counts ≤ a[j].</p>` }
  ]
});
