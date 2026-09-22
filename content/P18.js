COURSE.topic({
  id: 'P18',
  intro: `A prefix sum is the simplest precomputation in the toolkit: spend O(n) once so that <em>any</em> range sum afterwards costs one subtraction. Its mirror image, the difference array, makes <em>range updates</em> O(1). Both appear constantly in CSES and in interviews, and both are the foundation for the range structures that follow (P20, P21).`,
  kps: [
    {
      title: 'One subtraction per range sum',
      teach: `
<p>Define <code>P[0] = 0</code> and <code>P[i] = a[0] + … + a[i−1]</code>: <strong>P[i] is the sum of everything before index i</strong>.</p>
<figure class="fig"><svg viewBox="0 0 350 110" width="350" role="img" aria-label="fence posts between array cells">
<g transform="translate(15,20)" font-size="11" text-anchor="middle">
<g style="fill:var(--code-bg);stroke:var(--ink)">
<rect x="0" y="10" width="40" height="28"/><rect x="40" y="10" width="40" height="28"/><rect x="80" y="10" width="40" height="28"/><rect x="120" y="10" width="40" height="28"/><rect x="160" y="10" width="40" height="28"/><rect x="200" y="10" width="40" height="28"/></g>
<g style="fill:var(--ink)"><text x="20" y="29">3</text><text x="60" y="29">1</text><text x="100" y="29">4</text><text x="140" y="29">1</text><text x="180" y="29">5</text><text x="220" y="29">9</text></g>
<g style="fill:var(--accent)" font-size="10"><text x="0" y="6">P0=0</text><text x="40" y="6">3</text><text x="80" y="6">4</text><text x="120" y="6">8</text><text x="160" y="6">9</text><text x="200" y="6">14</text><text x="240" y="6">23</text></g>
<g style="stroke:var(--accent);stroke-width:2"><line x1="80" y1="8" x2="80" y2="44"/><line x1="240" y1="8" x2="240" y2="44"/></g>
<text x="160" y="60" style="fill:var(--accent)" font-size="11">a[2..5] = P[6] − P[2] = 23 − 4 = 19</text></g></svg>
<figcaption>The P values are fence posts <em>between</em> cells. A range is the gap between two posts.</figcaption></figure>
<div class="ex">
<div class="sub">The code</div>
<pre><code>long[] P = new long[n + 1];
for (int i = 0; i &lt; n; i++) P[i + 1] = P[i] + a[i];
// sum of a[l..r] inclusive:
long s = P[r + 1] - P[l];</code></pre>
<div class="sub">Why the extra slot?</div>
<p>P has n + 1 entries, one per gap including both ends. That's what removes the special case for ranges starting at 0.</p>
<div class="sub">Cost</div>
<p>O(n) build, O(1) per query, O(n) extra space. Use <code>long</code>: 10⁵ values of 10⁹ overflow int.</p>
</div>
<p>Beyond sums: prefix XOR answers range-XOR queries the same way (XOR is its own inverse, so use ^ instead of −). Prefix counts answer "how many elements ≤ x in a[l..r]" when values are bounded.</p>`,
      qs: [
        { type: 'num', q: `a = [3, 1, 4, 1, 5, 9, 2, 6]. Using P[i] = sum of the first i elements, what is P[6] − P[2] (i.e. the sum of a[2..5])?`, a: 19, why: '4 + 1 + 5 + 9 = 19. P = [0, 3, 4, 8, 9, 14, 23, 25, 31].' },
        { type: 'mcq', q: `Why is the prefix array given n + 1 entries rather than n?`, opts: ['So ranges starting at 0 need no special case', 'To leave room for future appends', 'Because P[0] stores the array length', 'To keep the array a power of two'], a: 0, why: 'P[l] means "everything before l", which needs a slot for l = 0. Then P[r+1] − P[l] works for every range.' },
        { type: 'free', q: `q range-sum queries on a fixed array of n numbers. Compare recomputing each range directly with prefix sums, giving both complexities and when the precomputation pays off.`, model: `<p>Direct: each query scans its range, O(n) worst case, so O(qn) overall with O(1) extra space. Prefix sums: O(n) once, then O(1) per query, so O(n + q) time and O(n) extra space. The precomputation pays off as soon as q is more than a constant, and it's the only option when q is large (e.g. 10⁵ queries on 10⁵ elements: 10¹⁰ vs 2 × 10⁵). It stops being valid if the array changes between queries: then you need a Fenwick tree (P20).</p>`, rubric: ['Direct is O(qn); prefix is O(n + q) time and O(n) space', 'Worth it once q grows beyond a constant (with numbers)', 'Notes the assumption: the array must not change between queries'] },
        { type: 'mcq', q: `Range XOR queries instead of sums. The prefix trick…`, opts: ['Works: XOR undoes itself, use ^', 'Fails: XOR has no inverse', 'Works only for positive values', 'Needs a segment tree instead'], a: 0, why: 'X[r+1] ^ X[l] cancels the shared prefix exactly as subtraction does.' }
      ]
    },
    {
      title: '2D prefix sums: inclusion-exclusion on a rectangle',
      teach: `
<p>For a matrix, <code>S[i][j]</code> = sum of the rectangle from (0, 0) to (i−1, j−1). Build it with one pass:</p>
<pre><code>S[i + 1][j + 1] = M[i][j] + S[i][j + 1] + S[i + 1][j] - S[i][j];</code></pre>
<div class="ex">
<div class="sub">Why subtract S[i][j]?</div>
<p>The rectangle above and the rectangle to the left overlap in the corner region, so adding both counts it twice. Subtracting it once fixes the double count: that's <strong>inclusion-exclusion</strong>.</p>
<div class="sub">Querying a rectangle (r1, c1) to (r2, c2)</div>
<pre><code>sum = S[r2+1][c2+1] - S[r1][c2+1] - S[r2+1][c1] + S[r1][c1];</code></pre>
<p>Take the big rectangle, cut off the strip above and the strip to the left, then add back the corner you removed twice.</p>
<div class="sub">Worked example</div>
<p>M = [[1,2,3],[4,5,6],[7,8,9]]. The rectangle (1,1)–(2,2) is 5 + 6 + 8 + 9 = <strong>28</strong>, and the formula gives S[3][3] − S[1][3] − S[3][1] + S[1][1] = 45 − 6 − 12 + 1 = 28.</p>
</div>
<p>Cost: O(RC) build, O(1) per query. This is the standard answer to "many queries asking for the sum of a submatrix".</p>`,
      qs: [
        { type: 'num', q: `M = [[1,2,3],[4,5,6],[7,8,9]]. Sum of the submatrix from (1,1) to (2,2)?`, a: 28, why: '5 + 6 + 8 + 9 = 28.' },
        { type: 'mcq', q: `In the 2D query formula, why is the corner term added back?`, opts: ['Both subtracted strips include it', 'It corrects for integer rounding', 'It handles negative numbers', 'It is only needed at the edges'], a: 0, why: 'The strip above and the strip to the left overlap exactly in that corner rectangle, so it is removed twice and must be restored once.' },
        { type: 'free', q: `Explain the build formula <code>S[i+1][j+1] = M[i][j] + S[i][j+1] + S[i+1][j] − S[i][j]</code> geometrically.`, model: `<p>The rectangle ending at (i, j) is the union of the rectangle one row shorter (S[i][j+1]) and the one one column narrower (S[i+1][j]), plus the new cell M[i][j]. Those two rectangles overlap in the block S[i][j], which would otherwise be counted twice, so subtract it once. It's the two-set inclusion-exclusion rule applied to areas.</p>`, rubric: ['Combines the rectangle above and the rectangle to the left, plus the new cell', 'They overlap in the S[i][j] block, counted twice', 'Subtract the overlap once (inclusion-exclusion)'] },
        { type: 'mcq', q: `R = C = 1000 and 10⁵ submatrix-sum queries. Cost with 2D prefix sums?`, opts: ['About 10⁶ build, then O(1) per query', 'About 10⁵ × 10⁶ total work', 'O(log RC) per query after sorting', 'Not feasible; use a segment tree'], a: 0, why: '10⁶ cells to build; each query is four array reads.' }
      ]
    },
    {
      title: 'Difference arrays: O(1) range updates',
      teach: `
<p>The mirror image. Many <em>range updates</em>, then read the final array once. Instead of touching every element of every range, record only the <strong>changes</strong>.</p>
<div class="ex">
<div class="sub">The rule</div>
<p>To add v to a[l..r]: <code>d[l] += v</code> and <code>d[r + 1] −= v</code>. After all updates, the running (prefix) sum of d is the final array.</p>
<div class="sub">Why it works</div>
<p>The running sum of d at index i adds every v whose range started at or before i and subtracts every v whose range already ended. So index i receives exactly the updates whose range covers it.</p>
<div class="sub">Worked example (n = 6, start all zero)</div>
<p>Updates: +2 on [1,3], +3 on [2,5], −1 on [0,1]. Running sum gives <strong>[−1, 1, 5, 5, 3, 3]</strong>.</p>
<div class="sub">Cost</div>
<p>O(1) per update, O(n) to materialise at the end. Versus O(length) per update naively. The catch: <strong>you can't read a correct value mid-stream</strong>, only after the final pass. If you need reads interleaved with updates, use a Fenwick tree (P20).</p>
</div>
<p>Classic uses: "k flights booked between seats l and r", counting overlapping intervals, and 2D difference arrays for rectangle updates (same trick with four corner marks).</p>`,
      qs: [
        { type: 'num', q: `n = 6, all zeros. Apply +2 on [1,3], +3 on [2,5], −1 on [0,1]. What is the final value at index 2?`, a: 5, why: 'It is covered by +2 and +3: 5. The full array is [−1, 1, 5, 5, 3, 3].' },
        { type: 'mcq', q: `To add v to a[l..r] in a difference array you write…`, opts: ['d[l] += v and d[r+1] −= v', 'd[l] += v and d[r] −= v', 'd[l] −= v and d[r+1] += v', 'd[l] += v only'], a: 0, why: 'The subtraction goes one past the end, because index r must still receive the update.' },
        { type: 'free', q: `You are given m range-increment updates on an array of size n, and only need the final array. Compare the naive approach with a difference array, and say when the difference array is NOT usable.`, model: `<p>Naive: each update writes every element of its range, O(n) each, so O(mn) worst case. Difference array: O(1) per update plus one O(n) prefix pass at the end, so O(m + n). It's not usable when you must read correct values <em>between</em> updates, since values are only valid after the final prefix pass; that case needs a Fenwick tree or segment tree for O(log n) updates and queries.</p>`, rubric: ['Naive O(mn) vs difference array O(m + n)', 'Explains the final prefix pass materialises the array', 'Limitation: no correct reads between updates (use BIT/segment tree)'] },
        { type: 'mcq', q: `Why does the subtraction go at index r + 1 rather than r?`, opts: ['Index r must still get the update', 'To avoid a negative index', 'Because arrays are 0-based', 'To keep d the same length as a'], a: 0, why: 'The running sum includes d[r], so cancelling at r would cut the update one element short.' }
      ]
    },
    {
      title: 'Choosing: prefix sums, sliding window, or a hash map',
      teach: `
<div class="ex">
<div class="sub">Prefix sums</div>
<p>Static array, many range queries, or any problem where a subarray sum should become a <em>difference of two numbers</em>. Works with negatives.</p>
<div class="sub">Sliding window (P04)</div>
<p>One pass, looking for the best/shortest/longest subarray under a monotone condition. Requires non-negative values for sum conditions, and uses O(1) space.</p>
<div class="sub">Prefix sums + hash map (P01)</div>
<p>Counting or finding subarrays with an <em>exact</em> property: sum = k, sum divisible by k, equal counts of two symbols. The map turns "find a previous prefix with this value" into O(1).</p>
<div class="sub">Worked discrimination</div>
<p>"Longest subarray with sum ≤ k, all values positive" → window. "Count subarrays with sum = k, values may be negative" → prefix + map. "Sum of a[l..r] for 10⁵ given pairs" → prefix array. "Subarray sums with updates in between" → Fenwick (P20).</p>
</div>
<p>One more prefix trick worth knowing: <strong>prefix sum modulo k</strong>. Two prefixes with the same remainder bound a subarray whose sum is divisible by k, which is CSES "Subarray Divisibility" and a common interview twist.</p>`,
      qs: [
        { type: 'mcq', q: `"Count subarrays whose sum is divisible by k." Best tool?`, opts: ['Prefix sums mod k in a count map', 'Sliding window over the array', 'Sort the array, then two pointers', 'Binary search on the answer'], a: 0, why: 'Equal remainders mark the ends of a divisible subarray; count pairs per remainder.' },
        { type: 'mcq', q: `"Maximum sum of any subarray of length exactly k, values can be negative." Best tool?`, opts: ['Fixed-size sliding window', 'Prefix sums with a hash map', 'Difference array updates', 'Dijkstra on the index graph'], a: 0, why: 'Fixed length: slide, adding the entering and removing the leaving element. Negatives are fine because the length is fixed.' },
        { type: 'free', q: `Explain why "count subarrays with sum exactly k" needs prefix sums + a map when values can be negative, but "longest subarray with sum ≤ k" can use a window when values are positive.`, model: `<p>With negatives, growing a window can lower the sum, so no pointer move is provably safe (P04): there's no monotonicity to exploit. Prefix sums sidestep that: for each end r, the valid starts are exactly the prefixes equal to P[r+1] − k, which a map counts in O(1) regardless of sign. With strictly positive values the window sum increases as the window grows and decreases as it shrinks, which is the monotonicity that makes shrinking safe, so O(1) space suffices.</p>`, rubric: ['Negatives break the monotonicity the window needs', 'Prefix + map answers per end index via a complement lookup, sign-independent', 'Positive values restore monotonicity, so the window is valid and uses O(1) space'] },
        { type: 'mcq', q: `Array changes between queries (point updates), and you need range sums throughout. Prefix sums…`, opts: ['Cost O(n) to rebuild per update', 'Still work in O(1) per query', 'Work if updates are at the end', 'Work with a difference array'], a: 0, why: 'One changed element invalidates every later prefix. That is what Fenwick trees (P20) fix.' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `a = [3, 1, 4, 1, 5, 9, 2, 6]. Sum of a[3..7]?`, a: 23, why: '1 + 5 + 9 + 2 + 6 = 23, or P[8] − P[3] = 31 − 8.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Given an n × n grid of 0/1, count submatrices that are entirely 1s of size exactly k × k." Use prefix sums and give the complexity.`, model: `<p>Build a 2D prefix sum S of the 0/1 grid in O(n²). For every top-left corner (i, j) with i + k ≤ n and j + k ≤ n, query the k × k rectangle in O(1); it is all ones exactly when the sum equals k². Count those. Total O(n²) time and O(n²) space, versus O(n²k²) if each square were scanned directly.</p>`, rubric: ['2D prefix sum built in O(n²)', 'Each k × k square tested in O(1); all-ones iff sum = k²', 'O(n²) overall vs O(n²k²) naive'] },
    { type: 'num', q: `Flight bookings: n = 5 seats, all zero. Apply +10 on [0,2], +20 on [1,3], +25 on [2,4]. Final value at seat 2?`, a: 55, why: 'All three ranges cover seat 2: 10 + 20 + 25.' },
    { type: 'mcq', q: `Prefix sums over 10⁵ values each up to 10⁹, stored in <code>int[]</code>. What happens?`, opts: ['Overflow: the total reaches 10¹⁴', 'Nothing; int holds 10¹⁴ fine', 'Only negative inputs overflow', 'Java promotes the array to long'], a: 0, why: 'int caps near 2.1 × 10⁹. Use long for prefix arrays.' },
    { type: 'free', q: `Why is a difference array the "inverse" of a prefix sum? Describe the two operations each supports and how they mirror each other.`, model: `<p>A prefix sum turns an array into its running totals, so a range <em>read</em> becomes one subtraction, but a range <em>write</em> still costs O(length). A difference array stores the changes between neighbours, so a range <em>write</em> becomes two point edits, but reading a value requires the running sum. Each converts one expensive operation into a cheap one, and taking the prefix sum of a difference array returns the original: the two transforms undo each other.</p>`, rubric: ['Prefix sum: cheap range reads, expensive range writes', 'Difference array: cheap range writes, reads need the prefix pass', 'They are inverse transforms (prefix of difference = original)'] }
  ],
  practice: [
    { name: 'Range Sum Query - Immutable', lc: 'LeetCode 303 · CSES Static Range Sum Queries', prompt: `<p>Answer many sumRange(l, r) queries on a fixed array.</p>`, hint: `<p>Precompute P once in the constructor.</p>`,
      solution: `<pre><code>class NumArray {
    private final long[] P;
    public NumArray(int[] a) {
        P = new long[a.length + 1];
        for (int i = 0; i &lt; a.length; i++) P[i + 1] = P[i] + a[i];
    }
    public int sumRange(int l, int r) { return (int) (P[r + 1] - P[l]); }
}</code></pre><p class="cx">O(n) build, O(1) per query.</p>` },
    { name: 'Range Sum Query 2D - Immutable', lc: 'LeetCode 304 · CSES Forest Queries', prompt: `<p>Many submatrix-sum queries on a fixed matrix.</p>`, hint: `<p>Inclusion-exclusion, both when building and when querying.</p>`,
      solution: `<pre><code>class NumMatrix {
    private final long[][] S;
    public NumMatrix(int[][] m) {
        int R = m.length, C = m[0].length;
        S = new long[R + 1][C + 1];
        for (int i = 0; i &lt; R; i++)
            for (int j = 0; j &lt; C; j++)
                S[i + 1][j + 1] = m[i][j] + S[i][j + 1] + S[i + 1][j] - S[i][j];
    }
    public int sumRegion(int r1, int c1, int r2, int c2) {
        return (int) (S[r2 + 1][c2 + 1] - S[r1][c2 + 1] - S[r2 + 1][c1] + S[r1][c1]);
    }
}</code></pre><p class="cx">O(RC) build, O(1) per query.</p>` },
    { name: 'Corporate Flight Bookings', lc: 'LeetCode 1109', prompt: `<p>Bookings [first, last, seats]; return the total seats booked per flight.</p>`, hint: `<p>Two point edits per booking, then one prefix pass.</p>`,
      solution: `<pre><code>public int[] corpFlightBookings(int[][] bookings, int n) {
    int[] d = new int[n + 1];
    for (int[] b : bookings) {
        d[b[0] - 1] += b[2];
        d[b[1]] -= b[2];              // one past the end (b[1] is 1-based inclusive)
    }
    int[] res = new int[n];
    int run = 0;
    for (int i = 0; i &lt; n; i++) { run += d[i]; res[i] = run; }
    return res;
}</code></pre><p class="cx">O(m + n) instead of O(mn).</p>` },
    { name: 'Subarray Sums Divisible by K', lc: 'LeetCode 974 · CSES Subarray Divisibility', prompt: `<p>Count subarrays whose sum is divisible by k (values may be negative).</p>`, hint: `<p>Two prefixes with the same remainder bound a divisible subarray. Watch Java's negative modulo.</p>`,
      solution: `<pre><code>public int subarraysDivByK(int[] a, int k) {
    int[] count = new int[k];
    count[0] = 1;                       // the empty prefix
    int sum = 0, res = 0;
    for (int x : a) {
        sum = ((sum + x) % k + k) % k;  // Java % can be negative
        res += count[sum]++;
    }
    return res;
}</code></pre><p class="cx">O(n + k). Each earlier prefix with the same remainder gives one valid subarray.</p>` }
  ]
});
