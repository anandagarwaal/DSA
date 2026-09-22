COURSE.topic({
  id: 'P34',
  intro: `Backtracking over 2ⁿ subsets dies around n = 25 (F14). <strong>Meet in the middle</strong> buys you roughly double that: split the items into two halves, enumerate each half separately (2^(n/2) each), and combine the two lists with sorting or hashing. It's the square root of the search space, paid for with memory and a combine step, and the deciding question is always whether the halves <em>can</em> be combined cheaply.`,
  kps: [
    {
      title: 'Split the items and enumerate each half',
      teach: `
<p>Splitting turns one exponential into two much smaller ones: 2⁴⁰ ≈ 10¹² is impossible, but 2 × 2²⁰ ≈ 2 × 10⁶ is nothing.</p>
<div class="ex">
<div class="sub">The arithmetic</div>
<table><tr><th>n</th><th>2ⁿ</th><th>2^(n/2)</th></tr>
<tr><td>20</td><td>10⁶</td><td>1024</td></tr>
<tr><td>40</td><td>1.1 × 10¹²</td><td>1.05 × 10⁶</td></tr>
<tr><td>50</td><td>10¹⁵</td><td>3.4 × 10⁷</td></tr></table>
<div class="sub">The shape</div>
<p>Enumerate every subset sum of the first half into a list A, and of the second half into a list B. Any full subset is one entry of A plus one entry of B, so the question becomes: <strong>for each a in A, which b in B complete it?</strong></p>
<div class="sub">The signal</div>
<p><strong>n ≤ 40–45</strong> with a subset-style question. That's the constraint that says "2ⁿ is too big, but its square root is fine": compare F14's table, where n ≤ 20 means plain subsets.</p>
</div>`,
      qs: [
        { type: 'num', q: `n = 40 items split in half. How many subsets does each half have, in millions?`, a: 1.05, tol: 0.05, why: '2²⁰ = 1,048,576 per half, versus 2⁴⁰ ≈ 1.1 × 10¹² for the whole.' },
        { type: 'mcq', q: `A constraint of n ≤ 40 on a subset-sum-style problem suggests…`, opts: ['Meet in the middle', 'Plain bitmask DP over 2ⁿ', 'Greedy by largest value', 'Binary search on the answer'], a: 0, why: '2⁴⁰ is far too big, but 2²⁰ per half is small (F14, F01).' },
        { type: 'num', q: `n = 50. How many subsets per half, in millions?`, a: 33.6, tol: 1, why: '2²⁵ = 33,554,432: the practical upper limit, mostly because of memory.' },
        { type: 'free', q: `Why does splitting help so dramatically, when 2^(n/2) + 2^(n/2) still sounds exponential?`, model: `<p>It is still exponential, but in half the exponent: 2^(n/2) = √(2ⁿ). Halving the exponent square-roots the count, so 10¹² becomes 10⁶. The combine step must then stay near-linear in those list sizes (sorting or hashing), otherwise the saving is lost. It does not make exponential problems polynomial: it roughly doubles the n you can handle.</p>`, rubric: ['2^(n/2) is the square root of 2ⁿ, so the count shrinks dramatically', 'The combine step must be near-linear in the half sizes', 'Still exponential: it roughly doubles the feasible n'] }
      ]
    },
    {
      title: 'Combining the halves',
      teach: `
<div class="ex">
<div class="sub">Exact target: use a hash map</div>
<p>Count subsets summing to T: build a frequency map of the first half's sums, then for each sum b in the second half add <code>count[T − b]</code>. O(2^(n/2)) expected.</p>
<pre><code>Map&lt;Long, Integer&gt; count = new HashMap&lt;&gt;();
for (long a : firstHalfSums) count.merge(a, 1, Integer::sum);
long total = 0;
for (long b : secondHalfSums) total += count.getOrDefault(target - b, 0);</code></pre>
<div class="sub">At most / closest: sort and binary search</div>
<p>"Largest sum ≤ T": sort the second half's sums, then for each a binary search the largest b ≤ T − a. O(2^(n/2) · n/2) for the sort and searches. Two pointers also work once both halves are sorted.</p>
<div class="sub">The pattern to notice</div>
<p>This is Two Sum (P01) on the two halves: <strong>for each element of one list, look up the complement in the other</strong>. That's why the combine is cheap for "equals" and "at most", and expensive for conditions that don't reduce to a per-element lookup.</p>
<div class="sub">4Sum II</div>
<p>Four arrays, count quadruples summing to zero: hash all A+B pairs, then look up −(C+D). n⁴ becomes 2n². The same split-and-lookup idea with pairs instead of halves.</p>
</div>`,
      qs: [
        { type: 'num', q: `4Sum II with A = [1,2], B = [−2,−1], C = [−1,2], D = [0,2]. How many quadruples sum to zero?`, a: 2, why: '(1,−2,−1,2) and (2,−1,−1,0).' },
        { type: 'mcq', q: `Which combine step fits "count subsets with sum exactly T"?`, opts: ['Hash map of one half, look up T − b', 'Sort both halves, then merge them', 'Binary search T in the first half', 'Two pointers over the same list'], a: 0, why: 'Exact equality is a complement lookup: P01 applied to the two halves.' },
        { type: 'mcq', q: `"Largest subset sum not exceeding T" needs…`, opts: ['Sorting one half, then binary search', 'A hash map of exact sums', 'A monotonic deque of sums', 'A segment tree of prefix sums'], a: 0, why: 'You need the best value ≤ a bound, which is an ordered query rather than an equality lookup.' },
        { type: 'free', q: `Why is meet in the middle essentially "Two Sum on the two halves"?`, model: `<p>Every full subset splits uniquely into its part from the first half and its part from the second, so a full sum is a[i] + b[j] with a from one list and b from the other. The task is then: for each b, which a completes it to the target? That is exactly Two Sum's complement lookup (P01), so the same tools apply: a hash map for equality, or sorting plus binary search (or two pointers) for inequalities.</p>`, rubric: ['A full subset splits uniquely into one part per half', 'So a full sum is a + b across the two lists', 'Reduces to complement lookup: hash map for equality, sorted search for inequalities'] }
      ]
    },
    {
      title: 'What it costs: time, and the memory ceiling',
      teach: `
<div class="ex">
<div class="sub">Cost</div>
<p>Time O(2^(n/2) · log(2^(n/2))) = O(2^(n/2) · n) with sorting, or O(2^(n/2)) expected with hashing. <strong>Memory is the real limit</strong>: storing 2²⁵ longs is 268 MB, so n ≈ 45–50 is the practical ceiling.</p>
<div class="sub">The classic uses</div>
<p>Subset sum / count subsets with a given sum for n = 40 (CSES "Meet in the Middle"), "closest subset sum to T" (LeetCode 1755), 4Sum II (LeetCode 454), and knapsack when the capacity is too large for the usual O(n·W) table (P16's pseudo-polynomial limit).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `What usually limits meet in the middle first?`, opts: ['Memory for the 2^(n/2) sums', 'CPU time for the enumeration', 'The sort comparison count', 'Recursion depth in the halves'], a: 0, why: '2²⁵ longs is about 268 MB; time is usually acceptable well past that point.' },
        { type: 'num', q: `Memory for 2²⁵ subset sums stored as 8-byte longs, in MB?`, a: 268, tol: 10, why: '33.5 × 10⁶ × 8 bytes ≈ 268 MB: usually the binding constraint.' },
        { type: 'mcq', q: `Combining with sorting rather than hashing costs…`, opts: ['O(2^(n/2) · n): the sort dominates', 'O(2^(n/2)): the same as hashing', 'O(2ⁿ): no saving at all', 'O(n log n), independent of the halves'], a: 0, why: 'Sorting 2^(n/2) values costs 2^(n/2) · log(2^(n/2)) = 2^(n/2) · n/2, and each binary search adds another n/2.' },
        { type: 'free', q: `Knapsack with n = 40 items and capacity W = 10⁹. Why does the usual DP fail, and how does meet in the middle rescue it?`, model: `<p>The standard knapsack DP is O(n·W), which is pseudo-polynomial (P16): with W = 10⁹ that is 4 × 10¹⁰ cells, impossible in time and memory. Meet in the middle ignores W entirely: enumerate all 2²⁰ (weight, value) pairs for each half, sort the second half by weight and keep a running prefix maximum of value so that "best value with weight ≤ x" is a binary search. Then for each first-half pair, binary search the remaining capacity in the second. About 10⁶ log 10⁶ ≈ 2 × 10⁷ operations, with memory the main cost.</p>`, rubric: ['O(n·W) is pseudo-polynomial and fails for W = 10⁹', 'Enumerate (weight, value) for each half: 2²⁰ each', 'Sort one half by weight with prefix maxima, then binary search per entry of the other'] }
      ]
    },
    {
      title: 'When the halves cannot be combined cheaply',
      teach: `
<div class="ex">
<div class="sub">The requirement</div>
<p>The two halves must interact <strong>only through a small summary</strong>: a sum, a count, a bitmask of used resources. The combine step then asks one lookup per entry ("which b completes this a?"), which hashing or binary search answers quickly.</p>
<div class="sub">When that fails</div>
<p>If validity depends on how the halves <em>interleave</em>, there is nothing to look up. Examples: "best order to schedule n jobs" (a schedule alternates between halves, so a half has no single summary), problems where an item's cost depends on which items from the other half were chosen earlier, or graph problems where edges connect the halves arbitrarily. Then the combine collapses back to comparing 2^(n/2) × 2^(n/2) = 2ⁿ pairs and nothing is saved.</p>
<div class="sub">Compared with bitmask DP (P24)</div>
<p>Bitmask DP handles only n ≤ 20–22 but supports rich transitions and orderings, because the state carries the whole set. Meet in the middle reaches n ≈ 40 but only when a half collapses to one number. Different trade: <strong>state richness versus n</strong>.</p>
<div class="sub">The question to ask</div>
<p>"If I fix the first half's choices, can I describe everything the second half needs to know in one value?" If yes, split. If no, look for a DP instead.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Which problem does NOT fit meet in the middle?`, opts: ['Best order to schedule n = 40 jobs', 'Count subsets with sum T, n = 40', 'Closest subset sum to T, n = 40', 'Subset with maximum value ≤ W'], a: 0, why: 'Ordering couples the halves: a schedule interleaves them, so neither half reduces to a single summary value.' },
        { type: 'mcq', q: `Meet in the middle needs the halves to interact through…`, opts: ['One small summary value per half', 'A shared sorted order of items', 'At most one common element', 'An equal number of items each'], a: 0, why: 'The combine step is a per-entry lookup, which only exists if a half can be described by one value (a sum, a count, a mask).' },
        { type: 'mcq', q: `n = 22 with rich ordering constraints between items. Better tool?`, opts: ['Bitmask DP over subsets', 'Meet in the middle halves', 'Greedy by item value', 'Plain prefix sums'], a: 0, why: 'The state must carry which items are used <em>and</em> support order-dependent transitions, which is P24 territory; 2²² is affordable.' },
        { type: 'free', q: `Give the one-sentence test for whether meet in the middle applies, and apply it to "count subsets summing to T" and to "find the best order of n tasks".`, model: `<p>Test: if I fix the first half's choices, can everything the second half needs to know be summarised in one value? Subset sum: yes, the first half contributes only its total, so the second half only needs T minus that total, and a hash lookup finishes it. Best order of tasks: no, because an optimal schedule interleaves tasks from both halves and the cost depends on that interleaving, so no single number describes the first half's effect; the combine would have to compare all 2^(n/2) × 2^(n/2) pairs, which is back to 2ⁿ.</p>`, rubric: ['States the test: can a half be summarised in one value for the other?', 'Subset sum: yes, only the total matters, so a lookup works', 'Ordering: no, halves interleave, so the combine degenerates to 2ⁿ'] }
      ]
    },
  ],
  quiz: [
    { type: 'num', q: `How many subsets of [1, 2, 3, 4, 5] sum to exactly 5?`, a: 3, why: '{5}, {1,4} and {2,3}.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Closest Subsequence Sum" (LeetCode 1755): n ≤ 40, find the subset sum closest to a goal. Give the full approach and complexity.`, model: `<p>Split into halves of about 20 items and enumerate all subset sums of each: two lists of up to 2²⁰ values. Sort the second list. For each sum a in the first list, the ideal partner is goal − a, so binary search that value in the sorted second list and check the neighbours on both sides (the closest value may be just below or just above). Track the minimum |a + b − goal|. Time O(2^(n/2) · n), memory O(2^(n/2)). It works because any subset splits uniquely across the halves, so every candidate sum is considered exactly once.</p>`, rubric: ['Enumerate all subset sums of each half (2^(n/2) each)', 'Sort one half; binary search goal − a and check both neighbours', 'O(2^(n/2) · n) time, O(2^(n/2)) memory; every subset covered exactly once'] },
    { type: 'mcq', q: `n = 30 subset-sum problem. Meet in the middle gives about…`, opts: ['2 × 2¹⁵ ≈ 65,000 sums', '2³⁰ ≈ 10⁹ sums', '30² = 900 sums', '2 × 30 = 60 sums'], a: 0, why: '2¹⁵ = 32,768 per half. (At n = 30, plain 2ⁿ enumeration is already borderline at 10⁹.)' },
    { type: 'mcq', q: `Why sort one half rather than both when answering "closest to T"?`, opts: ['One sorted list makes each lookup O(log n)', 'Sorting both would change the answer', 'The first half is always smaller', 'Sorting both is impossible in place'], a: 0, why: 'You iterate the other half linearly, so only the searched list needs order. (Sorting both enables a two-pointer sweep instead, which is also fine.)' },
    { type: 'free', q: `Discriminate: bitmask DP (P24), meet in the middle (P34) and plain backtracking (P11). What n and what problem shape picks each?`, model: `<p>Backtracking: when the output itself is exponential (list every subset/permutation) or strong pruning makes the search tractable; the output-size bound (F14) means nothing better exists for listing. Bitmask DP: n ≤ 20–22, where orders collapse onto sets and transitions are rich (assignment, TSP, sessions); cost O(2ⁿ·n) or O(2ⁿ·n²). Meet in the middle: n ≤ 40–45, where the two halves interact only through one summary value (a sum), so lists can be combined by hashing or binary search; cost O(2^(n/2)·n) with memory the binding limit.</p>`, rubric: ['Backtracking for exponential output or heavy pruning', 'Bitmask DP for n ≤ ~20 with rich transitions over subsets', 'Meet in the middle for n ≤ ~40 when halves combine through one value'] }
  ],
  practice: [
    { name: 'Count subsets with a given sum (n ≤ 40)', lc: 'CSES Meet in the Middle', prompt: `<p>Count subsets of up to 40 numbers whose sum equals x.</p>`, hint: `<p>Enumerate each half's sums; hash one, look up the complement from the other.</p>`,
      solution: `<pre><code>public long countSubsetsWithSum(long[] a, long target) {
    int n = a.length, half = n / 2;
    long[] first = subsetSums(a, 0, half);
    long[] second = subsetSums(a, half, n);
    Map&lt;Long, Integer&gt; count = new HashMap&lt;&gt;();
    for (long s : first) count.merge(s, 1, Integer::sum);
    long total = 0;
    for (long s : second) total += count.getOrDefault(target - s, 0);
    return total;
}
private long[] subsetSums(long[] a, int from, int to) {
    int m = to - from;
    long[] sums = new long[1 &lt;&lt; m];
    for (int mask = 1; mask &lt; (1 &lt;&lt; m); mask++) {
        int low = Integer.numberOfTrailingZeros(mask);        // cheapest bit to remove
        sums[mask] = sums[mask &amp; (mask - 1)] + a[from + low];  // reuse the smaller mask
    }
    return sums;
}</code></pre><p class="cx">O(2^(n/2)) expected. Building each sum from mask &amp; (mask−1) avoids re-adding the whole subset (P24).</p>` },
    { name: 'Closest Subsequence Sum', lc: 'LeetCode 1755', prompt: `<p>n ≤ 40. Minimise |subset sum − goal|.</p>`, hint: `<p>Sort one half; binary search goal − a and check both neighbours.</p>`,
      solution: `<pre><code>public int minAbsDifference(int[] nums, int goal) {
    int n = nums.length, half = n / 2;
    long[] first = subsetSums(nums, 0, half);
    long[] second = subsetSums(nums, half, n);
    Arrays.sort(second);
    long best = Long.MAX_VALUE;
    for (long a : first) {
        long want = goal - a;
        int i = lowerBound(second, want);
        if (i &lt; second.length) best = Math.min(best, Math.abs(a + second[i] - goal));
        if (i &gt; 0)             best = Math.min(best, Math.abs(a + second[i - 1] - goal));
    }
    return (int) best;
}
private long[] subsetSums(int[] a, int from, int to) {
    int m = to - from;
    long[] sums = new long[1 &lt;&lt; m];
    for (int mask = 1; mask &lt; (1 &lt;&lt; m); mask++) {
        int low = Integer.numberOfTrailingZeros(mask);
        sums[mask] = sums[mask &amp; (mask - 1)] + a[from + low];
    }
    return sums;
}
private int lowerBound(long[] s, long x) {
    int lo = 0, hi = s.length;
    while (lo &lt; hi) { int mid = lo + (hi - lo) / 2; if (s[mid] &lt; x) lo = mid + 1; else hi = mid; }
    return lo;
}</code></pre><p class="cx">O(2^(n/2) · n). Checking both neighbours is what makes "closest" correct.</p>` },
    { name: '4Sum II', lc: 'LeetCode 454', prompt: `<p>Four arrays; count quadruples (i, j, k, l) with A[i]+B[j]+C[k]+D[l] = 0.</p>`, hint: `<p>Hash all A+B sums, then look up −(C+D).</p>`,
      solution: `<pre><code>public int fourSumCount(int[] A, int[] B, int[] C, int[] D) {
    Map&lt;Integer, Integer&gt; sums = new HashMap&lt;&gt;();
    for (int a : A)
        for (int b : B) sums.merge(a + b, 1, Integer::sum);
    int total = 0;
    for (int c : C)
        for (int d : D) total += sums.getOrDefault(-(c + d), 0);
    return total;
}</code></pre><p class="cx">O(n²) instead of O(n⁴): the same split-and-look-up idea, with pairs as the halves.</p>` }
  ]
});
