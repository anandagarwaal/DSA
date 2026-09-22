COURSE.topic({
  id: 'P19',
  intro: `"Maximum of every window of size k" looks like a job for a heap, and a heap <em>almost</em> works: the problem is removing the element that just slid out of the window. The fix is a <strong>monotonic deque</strong>, the monotonic stack (P07) with the ability to drop from the front as well. It's the standard O(n) answer, and its correctness is the same dominance argument you already know.`,
  kps: [
    {
      title: 'Why a heap is not enough',
      teach: `
<p>Sliding window maximum: for each window of size k, report its largest value.</p>
<div class="ex">
<div class="sub">The heap attempt</div>
<p>Push each entering element, report the top… but when the window slides, the element that left may be anywhere inside the heap. <code>PriorityQueue.remove(Object)</code> is <strong>O(n)</strong> (it scans), so the total becomes O(nk) in the worst case.</p>
<div class="sub">The lazy-deletion patch</div>
<p>Store (value, index) and pop the top while its index is outside the window. That works and is O(n log n): each element is pushed and popped once, with log n per operation. Perfectly acceptable in an interview, and worth saying out loud.</p>
<div class="sub">What the deque adds</div>
<p>O(n) with O(k) memory and no comparisons beyond the ones that discard dominated elements. The insight: most elements in the window can <em>never</em> be the maximum again, so they need not be stored at all.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why is a plain max-heap awkward for sliding window maximum?`, opts: ['Removing the element that left is O(n)', 'Heaps cannot store duplicates', 'A heap cannot report its maximum', 'Heaps need the data sorted first'], a: 0, why: 'The departing element is not at the top, and arbitrary removal scans the heap.' },
        { type: 'mcq', q: `The lazy-deletion heap version (pop while the top is out of window) costs…`, opts: ['O(n log n) time, O(n) space', 'O(n) time, O(k) space', 'O(nk) time, O(k) space', 'O(n log k) worst case only'], a: 0, why: 'Each element enters and leaves the heap once; the heap can hold every element before stale ones are popped.' },
        { type: 'free', q: `In a window, which elements can you throw away permanently, and why?`, model: `<p>Any element that has a <em>later</em> element in the window at least as large. The later element stays in the window at least as long and is never smaller, so for every current and future window containing the earlier one, the later one is also present and dominates it. Such an element can never be the maximum again, so it need not be stored.</p>`, rubric: ['Elements with a later element that is ≥ them', 'The later element outlives it and is never smaller (dominance)', 'So it can never be the answer for this or any future window'] },
        { type: 'mcq', q: `Window size k = 1. What does the answer become?`, opts: ['The array itself', 'The global maximum', 'The array reversed', 'Undefined for k = 1'], a: 0, why: 'A useful edge case to check any implementation against.' }
      ]
    },
    {
      title: 'The deque invariant',
      teach: `
<p>Keep a deque of <strong>indices</strong> with two invariants:</p>
<ol><li>Every index is inside the current window.</li>
<li>Their values are <strong>non-increasing</strong> from front to back.</li></ol>
<p>So the front is always the maximum of the window.</p>
<pre><code>Deque&lt;Integer&gt; dq = new ArrayDeque&lt;&gt;();     // indices, values non-increasing
int[] res = new int[n - k + 1];
for (int i = 0; i &lt; n; i++) {
    while (!dq.isEmpty() &amp;&amp; a[dq.peekLast()] &lt;= a[i]) dq.pollLast();   // drop dominated
    dq.offerLast(i);
    if (dq.peekFirst() &lt;= i - k) dq.pollFirst();                       // drop expired
    if (i &gt;= k - 1) res[i - k + 1] = a[dq.peekFirst()];
}</code></pre>
<div class="ex">
<div class="sub">Trace: a = [1, 3, −1, −3, 5, 3, 6, 7], k = 3</div>
<p>i=0: [0]. i=1: 3 ≥ 1 so pop 0, deque [1]. i=2: [1,2] → window max 3. i=3: [1,2,3] → front 1 still in window → 3. i=4: 5 pops all → [4] → 5. i=5: [4,5] → 5. i=6: 6 pops all → [6] → 6. i=7: [7] → 7.</p>
<p>Output: <strong>[3, 3, 5, 5, 6, 7]</strong>.</p>
<div class="sub">Order of the two drops</div>
<p>Push first, then expire the front: if the new element emptied the deque, the expiry check has nothing to do. Either order works as long as you expire before reading the front.</p>
</div>`,
      qs: [
        { type: 'num', q: `a = [1, 3, −1, −3, 5, 3, 6, 7], k = 3. What is the third window's maximum (window a[2..4])?`, a: 5, why: 'The windows give [3, 3, 5, 5, 6, 7]; the third is 5.' },
        { type: 'mcq', q: `The deque stores indices rather than values because…`, opts: ['Expiry needs to compare positions', 'Values may be duplicated', 'Indices compress better', 'Java deques hold only ints'], a: 0, why: 'You must know when the front has slid out of the window, which is a question about its index.' },
        { type: 'free', q: `State both deque invariants and prove the front is the window maximum.`, model: `<p>Invariants: (1) every stored index lies in the current window; (2) values are non-increasing from front to back. From (2) the front holds the largest value among stored indices; from (1) all of them are in the window. Nothing valuable was discarded: an element is only removed from the back when a later element with a value ≥ it arrives (so it can never be the maximum of any window that still contains it), or from the front when it leaves the window. Hence the front is the maximum of the whole window.</p>`, rubric: ['States both invariants (in-window, non-increasing)', 'Front is the largest stored, and all stored are in window', 'Discarded elements were dominated by a later, larger-or-equal element, so nothing is lost'] },
        { type: 'mcq', q: `Using <code>&lt;</code> instead of <code>&lt;=</code> when popping from the back (keeping equal values)…`, opts: ['Still correct, with a slightly larger deque', 'Breaks the maximum for duplicates', 'Makes the deque increasing', 'Causes an infinite loop'], a: 0, why: 'Equal values are harmless duplicates; the front value is unchanged. Keeping them can even help for "minimum window with duplicates" variants.' }
      ]
    },
    {
      title: 'Why the back-pops lose nothing',
      teach: `
<p>This is the step to be able to defend, and it's the P07 dominance argument with an extra observation about <em>time</em>.</p>
<div class="ex">
<div class="sub">The claim</div>
<p>If index j &lt; i and a[j] ≤ a[i], then j can be discarded forever.</p>
<div class="sub">The proof</div>
<p>Any future window containing j also contains i: windows are contiguous and i &gt; j, so a window that still holds j has not yet passed i. In each such window a[i] ≥ a[j], so j is never the unique maximum, and reporting a[i] is always at least as good. Nothing that depends on j is lost.</p>
<div class="sub">The picture</div>
<p>Bars in a window, scanned left to right: a new tall bar hides every shorter bar behind it. The deque holds exactly the bars still visible from the right: a descending staircase.</p>
<div class="sub">The mirror version</div>
<p>For sliding window <em>minimum</em>, flip the comparison: pop while the back is ≥ the new element, keeping values non-decreasing. Same proof with the inequality reversed.</p>
</div>`,
      qs: [
        { type: 'free', q: `Prove that discarding index j when a later index i has a[j] ≤ a[i] never changes any future window maximum.`, model: `<p>Windows are contiguous blocks moving right. If a future window contains j, it must also contain i, because i &gt; j and the window has not yet slid past j, so it spans j..(its end) ⊇ {i}. In that window a[i] ≥ a[j], so the maximum is unaffected by removing j: whatever j could contribute, i contributes at least as much. Therefore the discard is safe for every future window.</p>`, rubric: ['Any future window containing j also contains i (contiguity, i &gt; j)', 'There a[i] ≥ a[j], so j is never needed for the maximum', 'Conclusion: discarding j cannot change any future answer'] },
        { type: 'mcq', q: `For sliding window <em>minimum</em>, the deque values are…`, opts: ['Non-decreasing front to back', 'Non-increasing front to back', 'Sorted by index, not value', 'In no particular order'], a: 0, why: 'Pop while the back is ≥ the newcomer; the front is then the smallest.' },
        { type: 'mcq', q: `Which element does the deque's front hold just after processing index i?`, opts: ['The maximum of the current window', 'The most recently added index', 'The oldest index in the array', 'The second largest value'], a: 0, why: 'Invariant (2) plus expiry of out-of-window indices.' },
        { type: 'num', q: `a = [9, 8, 7, 6], k = 2. What is the last window's maximum?`, a: 7, why: 'Windows: [9,8] → 9, [8,7] → 8, [7,6] → 7. A decreasing array never triggers back-pops, so the deque holds both indices each time.' }
      ]
    },
    {
      title: 'O(n) by the enters-once, leaves-once argument',
      teach: `
<div class="ex">
<div class="sub">The count</div>
<p>Each index is <code>offerLast</code>ed exactly once. It can be removed at most once, either from the back (dominated) or from the front (expired). So across the entire run there are ≤ n pushes and ≤ n pops, plus n failed while-checks: <strong>O(n)</strong> total (F04).</p>
<div class="sub">Space</div>
<p>O(k): the deque only ever holds indices from the current window.</p>
<div class="sub">Compared with the alternatives</div>
<table><tr><th>approach</th><th>time</th><th>space</th></tr>
<tr><td>recompute each window</td><td>O(n·k)</td><td>O(1)</td></tr>
<tr><td>heap with lazy deletion</td><td>O(n log n)</td><td>O(n)</td></tr>
<tr><td>monotonic deque</td><td>O(n)</td><td>O(k)</td></tr></table>
<div class="sub">Where else this shape appears</div>
<p>Shortest subarray with sum ≥ k <em>with negatives</em> (monotonic deque over prefix sums), "jump game" DP where each state takes the max over a window of previous states, and CSES's sliding-window family.</p>
</div>`,
      qs: [
        { type: 'num', q: `n = 10⁶ elements, k = 1000. How many deque pushes happen in total (in millions)?`, a: 1, tol: 0.01, why: 'Exactly n = 10⁶: each index is pushed once, whatever k is.' },
        { type: 'mcq', q: `Deque space usage for n = 10⁶, k = 1000?`, opts: ['O(k): at most 1000 indices', 'O(n): every index is kept', 'O(log n) amortized', 'O(n − k) in the worst case'], a: 0, why: 'Only in-window indices are stored.' },
        { type: 'free', q: `A reviewer says the inner while-loop makes this O(nk). Rebut it and give the correct bound with the argument.`, model: `<p>Count total operations, not per-iteration cost. Each index is pushed exactly once and can be popped at most once (from the back when dominated, or from the front when it expires), so pops across the entire run total at most n. Adding the n failed while-condition checks, the work is ≤ 3n = O(n). A single iteration may pop many indices, but only ones earlier iterations pushed: the work was prepaid (F04).</p>`, rubric: ['Counts pushes and pops over the whole run, not per iteration', 'Each index pushed once, popped at most once, so ≤ n pops', 'Concludes O(n), noting a heavy iteration is prepaid'] },
        { type: 'mcq', q: `DP where dp[i] = a[i] + max(dp[i−k..i−1]). Best technique?`, opts: ['Monotonic deque over the dp values', 'Recompute the max each step', 'A max-heap of all dp values', 'Binary search over dp'], a: 0, why: 'It is a sliding-window maximum over the previous k states: O(n) instead of O(nk).' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `a = [1, 3, −1, −3, 5, 3, 6, 7], k = 3. How many windows are there in total?`, a: 6, why: 'n − k + 1 = 8 − 3 + 1.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Longest subarray where max − min ≤ limit." Design an O(n) solution and say what each structure holds.`, model: `<p>Slide a variable window with <em>two</em> monotonic deques: one non-increasing (window maximum at its front) and one non-decreasing (window minimum at its front). Extend the right end, pushing into both. While maxFront − minFront &gt; limit, advance the left end, popping either front whose index falls out of the window. Record the best length. Each index enters and leaves each deque once, so O(n) time, O(n) space.</p>`, rubric: ['Two deques: one for the window max, one for the window min', 'Shrink from the left while max − min exceeds the limit, expiring fronts', 'O(n) by the enters-once/leaves-once argument'] },
    { type: 'mcq', q: `The deque's front index equals i − k after processing index i. What must happen?`, opts: ['Pop it: it has left the window', 'Keep it: it is still valid', 'Restart the deque from empty', 'Swap it with the back'], a: 0, why: 'The window covering i is [i−k+1, i], so index i−k is one too old.' },
    { type: 'mcq', q: `Which problem does NOT reduce to a monotonic deque?`, opts: ['Count distinct values in each window', 'Maximum of each window of size k', 'Minimum of each window of size k', 'Max of dp over the last k states'], a: 0, why: 'Distinct counts are not decided by an extreme value, so dominance does not apply. Use a count map (P04).' },
    { type: 'free', q: `Discriminate: monotonic stack (P07) vs monotonic deque. What does the deque add, and what problem shape signals it?`, model: `<p>Both keep a structure sorted by value and discard dominated elements. A stack only ever removes from the same end it adds to, which fits "nearest greater/smaller element" questions where an element stays relevant until something dominates it. A deque also removes from the <em>front</em>, which is needed when relevance additionally expires with time: a fixed or shrinking window. The signal is a window of size k, or a left pointer that moves forward.</p>`, rubric: ['Both discard dominated elements to stay sorted', 'Deque adds front removal for expiry (a sliding window)', 'Signal: relevance expires by position/time, not only by domination'] }
  ],
  practice: [
    { name: 'Sliding Window Maximum', lc: 'LeetCode 239 · CSES Sliding Window Minimum', prompt: `<p>Maximum of each window of size k, in O(n).</p>`, hint: `<p>Deque of indices; drop dominated from the back, expired from the front.</p>`,
      solution: `<pre><code>public int[] maxSlidingWindow(int[] a, int k) {
    int n = a.length;
    int[] res = new int[n - k + 1];
    Deque&lt;Integer&gt; dq = new ArrayDeque&lt;&gt;();      // indices, values non-increasing
    for (int i = 0; i &lt; n; i++) {
        while (!dq.isEmpty() &amp;&amp; a[dq.peekLast()] &lt;= a[i]) dq.pollLast();
        dq.offerLast(i);
        if (dq.peekFirst() &lt;= i - k) dq.pollFirst();
        if (i &gt;= k - 1) res[i - k + 1] = a[dq.peekFirst()];
    }
    return res;
}</code></pre><p class="cx">O(n) time, O(k) space.</p>` },
    { name: 'Longest Continuous Subarray With Absolute Diff ≤ Limit', lc: 'LeetCode 1438', prompt: `<p>Longest subarray whose max − min ≤ limit.</p>`, hint: `<p>One deque for the max, one for the min; shrink while the spread is too large.</p>`,
      solution: `<pre><code>public int longestSubarray(int[] a, int limit) {
    Deque&lt;Integer&gt; max = new ArrayDeque&lt;&gt;(), min = new ArrayDeque&lt;&gt;();
    int lo = 0, best = 0;
    for (int hi = 0; hi &lt; a.length; hi++) {
        while (!max.isEmpty() &amp;&amp; a[max.peekLast()] &lt;= a[hi]) max.pollLast();
        while (!min.isEmpty() &amp;&amp; a[min.peekLast()] &gt;= a[hi]) min.pollLast();
        max.offerLast(hi); min.offerLast(hi);
        while (a[max.peekFirst()] - a[min.peekFirst()] &gt; limit) {
            if (max.peekFirst() == lo) max.pollFirst();
            if (min.peekFirst() == lo) min.pollFirst();
            lo++;
        }
        best = Math.max(best, hi - lo + 1);
    }
    return best;
}</code></pre><p class="cx">O(n): each index enters and leaves each deque once.</p>` },
    { name: 'Shortest Subarray with Sum at Least K', lc: 'LeetCode 862', prompt: `<p>Shortest subarray with sum ≥ k, where values may be <em>negative</em> (a sliding window fails, P04).</p>`, hint: `<p>Work on prefix sums; keep a deque of candidate start prefixes that is increasing.</p>`,
      solution: `<pre><code>public int shortestSubarray(int[] a, int k) {
    int n = a.length;
    long[] P = new long[n + 1];
    for (int i = 0; i &lt; n; i++) P[i + 1] = P[i] + a[i];
    Deque&lt;Integer&gt; dq = new ArrayDeque&lt;&gt;();      // prefix indices, P increasing
    int best = Integer.MAX_VALUE;
    for (int i = 0; i &lt;= n; i++) {
        while (!dq.isEmpty() &amp;&amp; P[i] - P[dq.peekFirst()] &gt;= k)
            best = Math.min(best, i - dq.pollFirst());   // this start can never be better later
        while (!dq.isEmpty() &amp;&amp; P[dq.peekLast()] &gt;= P[i]) dq.pollLast();  // dominated start
        dq.offerLast(i);
    }
    return best == Integer.MAX_VALUE ? -1 : best;
}</code></pre><p class="cx">O(n). A later prefix that is no larger dominates an earlier one: it is closer and at least as small.</p>` }
  ]
});
