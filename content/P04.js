COURSE.topic({
  id: 'P04',
  intro: `A sliding window is a same-direction pointer pair (P03) where the region <em>between</em> the pointers is the thing you care about: a contiguous subarray or substring, kept summarised in a running sum or a hash map (P01). Its O(n) cost comes from F04 ("each index enters once and leaves once"). Its correctness comes from a monotonicity you must check before using it, and negative numbers are the classic way it breaks.`,
  kps: [
    {
      title: 'Fixed window: add the entering element, remove the leaving one',
      teach: `
<p>"Best subarray of length exactly k": recomputing each window's sum is O(nk). Instead <strong>slide</strong>: the next window differs by one element in and one element out.</p>
<div class="ex">
<div class="sub">Worked example: max average of length-k subarray</div>
<pre><code>int sum = 0;
for (int i = 0; i &lt; k; i++) sum += a[i];      // first window
int best = sum;
for (int i = k; i &lt; a.length; i++) {
    sum += a[i] - a[i - k];                    // a[i] enters, a[i-k] leaves
    best = Math.max(best, sum);
}
return (double) best / k;</code></pre>
<div class="sub">Invariant</div>
<p>At the end of iteration i, sum = a[i−k+1] + … + a[i], the window ending at i.</p>
<div class="sub">Cost</div>
<p>O(n) time, O(1) space. The window "state" can be richer than a sum, e.g. a count map of characters in the window (anagram search), updated with +1 for the entering char and −1 for the leaving one.</p>
</div>`,
      qs: [
        { type: 'num', q: `Max average of a length-4 subarray of [1, 12, −5, −6, 50, 3]?`, a: 12.75, tol: 0.001, why: 'Windows sum to 2, 51, 42; best 51 / 4 = 12.75.' },
        { type: 'mcq', q: `Sliding from window [i−k, i−1] to [i−k+1, i], the sum update is…`, opts: ['sum += a[i] − a[i − k]', 'sum += a[i] − a[i − k + 1]', 'sum = sum − a[i] + a[i − k]', 'sum += a[i] then recompute'], a: 0, why: 'a[i] enters; a[i−k] is the element that just fell off the left.' },
        { type: 'free', q: `"Find all anagrams of p in s." Describe the fixed-window state and its O(1) update per slide.`, model: `<p>Window length = |p|. State: a 26-count array of the window's letters (plus a counter of how many letters match p's counts). Slide: increment the count of the entering char, decrement the leaving char, update the match counter for those two letters only. A window is an anagram when all 26 counts match. Each slide is O(1), so O(|s|) total.</p>`, rubric: ['Window length fixed at |p|', 'State: letter counts of the window (vs p\'s counts)', 'Per slide: +1 entering, −1 leaving, O(1) check'] },
        { type: 'mcq', q: `Recomputing each length-k window sum from scratch costs…`, opts: ['O(n · k)', 'O(n)', 'O(n + k)', 'O(k log n)'], a: 0, why: 'About n windows × k additions each. Sliding removes the factor k.' }
      ]
    },
    {
      title: 'Variable window: grow right, shrink left while invalid',
      teach: `
<p>"Longest/shortest subarray satisfying a condition." The window size isn't fixed: <strong>extend right every step, and shrink from the left only as much as needed</strong>.</p>
<div class="ex">
<div class="sub">Worked example: longest substring without repeating characters</div>
<pre><code>int[] cnt = new int[128]; int lo = 0, best = 0;
for (int hi = 0; hi &lt; s.length(); hi++) {
    cnt[s.charAt(hi)]++;
    while (cnt[s.charAt(hi)] &gt; 1) cnt[s.charAt(lo++)]--;   // repair: drop from the left
    best = Math.max(best, hi - lo + 1);
}</code></pre>
<div class="sub">Invariant</div>
<p>After the while loop, s[lo..hi] has no repeats, and it's the <strong>longest valid window ending at hi</strong>.</p>
<div class="sub">Why shrinking from the left is safe (the monotonicity)</div>
<p>The key fact: if s[lo..hi] is invalid, so is <em>every larger</em> window containing it. Invalidity only gets worse as a window grows. So no window starting at the dropped lo could be valid at this or any later hi. <strong>Erasing lo is safe</strong>, F09's elimination on (start, end) pairs.</p>
<div class="sub">Two shapes</div>
<p>Longest-valid: record after repairing. Shortest-valid (e.g. sum ≥ target): while valid, record, then shrink.</p>
</div>`,
      qs: [
        { type: 'num', q: `Longest substring without repeats in "pwwkew"?`, a: 3, why: '"wke". (The window jumps past the first w when the second w enters.)' },
        { type: 'num', q: `Shortest subarray with sum ≥ 7 in [2, 3, 1, 2, 4, 3]?`, a: 2, why: '[4, 3].' },
        { type: 'free', q: `In "longest substring without repeats", why is it safe to permanently drop start positions from the left? State the property you rely on.`, model: `<p>The property: if a window contains a repeat, every window that contains it also contains that repeat. Invalidity is monotone under growth. When s[lo..hi] is invalid, any window starting at lo and ending at hi or later contains s[lo..hi], so it's invalid too. Start position lo can never begin a valid window again, so erasing it loses nothing.</p>`, rubric: ['Names the monotonicity: supersets of an invalid window are invalid', 'Applies it: windows starting at lo and ending at ≥ hi contain the invalid one', 'Concludes lo can be discarded permanently'] },
        { type: 'mcq', q: `"Longest substring with at most k distinct characters." The window becomes invalid when…`, opts: ['More than k distinct chars are in it', 'Any character appears twice', 'Its length exceeds k characters', 'Its count map has k keys exactly'], a: 0, why: 'Validity = distinct count ≤ k. Growing can only raise the distinct count, so it is monotone and a window works.' }
      ]
    },
    {
      title: 'Why it is O(n): each index enters once and leaves once',
      teach: `
<p>The inner <code>while</code> looks like it could make the loop O(n²). It can't.</p>
<div class="ex">
<div class="sub">Count moves, not iterations (F04)</div>
<p><code>hi</code> moves right n times in total. <code>lo</code> only moves right and never passes hi, so it moves right at most n times <strong>in total, across all iterations of the outer loop</strong>.</p>
<div class="sub">Total</div>
<p>≤ n additions to the window + ≤ n removals = O(n) window updates. If each update is O(1) (array or hash map), the whole thing is O(n).</p>
<div class="sub">The picture</div>
<p>A caterpillar crawling along the array: the head and the tail each travel the array once. The head can race ahead and the tail catch up in one burst, but neither ever goes backwards.</p>
</div>
<p>The argument breaks if lo ever moves <em>left</em>, e.g. a "restart from hi" bug that resets lo = hi and rescans. Then work can become quadratic.</p>`,
      qs: [
        { type: 'num', q: `Array of length 1000. Maximum total number of lo++ steps across a whole variable-window run?`, a: 1000, why: 'lo only increases and never exceeds n: at most 1000 moves overall.' },
        { type: 'free', q: `Explain to a junior, without the word "amortized", why the nested while loop in a sliding window doesn't make it quadratic.`, model: `<p>Count how far each pointer travels in total. The right pointer walks the array once. The left pointer only ever moves right, never jumps back, and can't pass the right pointer, so over the whole run it also walks the array at most once. One inner loop iteration might move it a lot, but then later iterations have less left to move. Total pointer moves ≤ 2n, so the work is linear.</p>`, rubric: ['Counts total travel of each pointer rather than per-iteration work', 'Left pointer never moves backwards and never passes the right one', 'Total ≤ 2n moves, so linear'] },
        { type: 'mcq', q: `Which change would break the O(n) bound?`, opts: ['On invalid, reset lo = hi and rescan', 'Using a HashMap instead of int[128]', 'Tracking best with Math.max', 'Shrinking lo inside a while loop'], a: 0, why: 'Moving lo backwards (or rescanning) lets elements enter the window many times.' },
        { type: 'mcq', q: `Window updates cost O(log n) each (e.g. a TreeMap of values in the window). Total?`, opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], a: 0, why: 'Still ≤ 2n updates, each O(log n).' }
      ]
    },
    {
      title: 'When windows fail: negative numbers',
      teach: `
<p>The window relies on <strong>monotonicity</strong>: growing the window moves the condition one way, shrinking moves it the other. For sums, that needs non-negative numbers.</p>
<div class="ex">
<div class="sub">Counterexample: shortest subarray with sum ≥ 5, a = [1, −1, 5]</div>
<p>The window grows to [1, −1, 5] (sum 5, valid, length 3), then shrinks: drop 1 → [−1, 5] = 4, invalid, stop. It reports <strong>3</strong>. But [5] alone has sum 5, length <strong>1</strong>.</p>
<div class="sub">What broke</div>
<p>Dropping 1 made the sum smaller, but then dropping −1 would make it larger again. "Shrinking can only reduce the sum" is false with negatives, so the window stopped shrinking too early. The erasure isn't safe.</p>
<div class="sub">What to use instead</div>
<p>Exact sum = k with negatives: <strong>prefix sums + hash map</strong> (P01). Shortest sum ≥ k with negatives: prefix sums + a monotonic deque (a harder variant).</p>
</div>
<p><strong>Checklist before using a window:</strong> "If a window is invalid (or valid), is every larger (or smaller) window in the same state?" If you can't say yes, don't slide.</p>`,
      qs: [
        { type: 'num', q: `Shortest subarray with sum ≥ 5 in [1, −1, 5]: what is the true answer?`, a: 1, why: '[5]. The naive window reports 3.' },
        { type: 'mcq', q: `"Count subarrays with sum exactly k", values may be negative. Tool?`, opts: ['Prefix sums with a hash map', 'Variable sliding window', 'Fixed window of size k', 'Two pointers from both ends'], a: 0, why: 'No monotonicity with negatives; complement lookup on prefix sums works regardless of sign.' },
        { type: 'free', q: `Give an input with a negative number where the "shortest subarray with sum ≥ target" window finds <em>no</em> answer although one exists, and explain the failure.`, model: `<p>a = [5, −10, 6], target 6. The window: add 5 (5 &lt; 6), add −10 (−5), add 6 (1), never ≥ 6, so it reports none. But [6] alone works. The window keeps the negative prefix because it only shrinks when valid; with negatives, dropping the left part would <em>increase</em> the sum, which the window never tries.</p>`, rubric: ['A valid counterexample input with a negative (e.g. [5, −10, 6], 6)', 'Traces the window missing the answer', 'Explains that dropping negative elements increases the sum, breaking monotonicity'] },
        { type: 'mcq', q: `Which problem is still a valid sliding window even though values vary widely?`, opts: ['Longest run with ≤ k zeros in a 0/1 array', 'Shortest sum ≥ k with negatives', 'Exact sum k with negatives', 'Max product with negative numbers'], a: 0, why: 'The zero count only grows with the window, so it is monotone.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Longest subarray of a 0/1 array with at most k zeros (you may flip k zeros)." Give the window condition, prove shrinking is safe, and give the complexity.`, model: `<p>Window valid iff zerosInWindow ≤ k. Grow hi; if a[hi] is 0, increment zeros; while zeros &gt; k, drop a[lo] (decrementing zeros if it's 0) and lo++. Record hi − lo + 1. Safe: a window with more than k zeros stays invalid if extended, since zeros only increase, so start lo can't begin a valid window ending at ≥ hi. O(n): each pointer moves at most n times.</p>`, rubric: ['Condition: zero count ≤ k', 'Safety via monotonicity: extending cannot reduce the zero count', 'O(n) by total pointer travel'] },
    { type: 'num', q: `Longest substring with at most 1 replacement to make all characters equal: "AABABBA"?`, a: 4, why: 'e.g. "AABA" or "ABBA" style windows of length 4 with one differing char.' },
    { type: 'num', q: `Longest substring without repeats in "abba"?`, a: 2, why: '"ab" or "ba". The window must not move lo backwards when the second a arrives.' },
    { type: 'mcq', q: `"Maximum sum subarray of length exactly k." Which technique?`, opts: ['Fixed-size sliding window', 'Variable window with shrinking', 'Prefix sums with a hash map', 'Binary search on the answer'], a: 0, why: 'Length is fixed: slide with +entering −leaving.' },
    { type: 'free', q: `Discriminate: when do you use a sliding window vs prefix sums + hash map for subarray-sum problems?`, model: `<p>Sliding window when the condition is monotone in the window size, e.g. all values non-negative with "sum ≥ / ≤ target" or "longest/shortest": then shrinking/growing moves the sum predictably and you get O(n) with O(1) space. Prefix sums + a map when values can be negative or the condition is "exactly k" (count of subarrays): no monotonicity is needed, since each end looks up matching starts, at O(n) time but O(n) space.</p>`, rubric: ['Window: requires monotonicity (e.g. non-negative values), O(1) space', 'Prefix+map: works with negatives / exact-sum counting, O(n) space', 'Names the deciding feature (sign of values / monotonicity)'] }
  ],
  practice: [
    { name: 'Longest Substring Without Repeating Characters', lc: 'LeetCode 3', prompt: `<p>Length of the longest substring with all distinct characters.</p>`, hint: `<p>Grow hi; while the char at hi appears twice, shrink lo.</p>`,
      solution: `<pre><code>public int lengthOfLongestSubstring(String s) {
    int[] cnt = new int[128];
    int lo = 0, best = 0;
    for (int hi = 0; hi &lt; s.length(); hi++) {
        char c = s.charAt(hi);
        cnt[c]++;
        while (cnt[c] &gt; 1) cnt[s.charAt(lo++)]--;
        best = Math.max(best, hi - lo + 1);
    }
    return best;
}</code></pre><p class="cx">O(n). Invariant: s[lo..hi] is the longest repeat-free window ending at hi.</p>` },
    { name: 'Minimum Size Subarray Sum', lc: 'LeetCode 209', prompt: `<p>Positive integers. Shortest subarray with sum ≥ target (0 if none).</p>`, hint: `<p>Positives make it monotone. While valid, record and shrink.</p>`,
      solution: `<pre><code>public int minSubArrayLen(int target, int[] a) {
    int lo = 0, sum = 0, best = Integer.MAX_VALUE;
    for (int hi = 0; hi &lt; a.length; hi++) {
        sum += a[hi];
        while (sum &gt;= target) {
            best = Math.min(best, hi - lo + 1);
            sum -= a[lo++];
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}</code></pre><p class="cx">O(n). Correct only because values are positive.</p>` },
    { name: 'Longest Repeating Character Replacement', lc: 'LeetCode 424', prompt: `<p>Replace at most k characters; longest run of one repeated letter.</p>`, hint: `<p>Window valid iff length − (count of its most frequent letter) ≤ k.</p>`,
      solution: `<pre><code>public int characterReplacement(String s, int k) {
    int[] cnt = new int[26];
    int lo = 0, maxf = 0, best = 0;
    for (int hi = 0; hi &lt; s.length(); hi++) {
        maxf = Math.max(maxf, ++cnt[s.charAt(hi) - 'A']);
        while (hi - lo + 1 - maxf &gt; k) cnt[s.charAt(lo++) - 'A']--;
        best = Math.max(best, hi - lo + 1);
    }
    return best;
}</code></pre><p class="cx">O(n). maxf may be stale (too high), which never shrinks the answer below a window already seen, so the result stays correct.</p>` },
    { name: 'Minimum Window Substring', lc: 'LeetCode 76', prompt: `<p>Smallest substring of s containing all characters of t (with multiplicity).</p>`, hint: `<p>Track how many required characters are still missing. While none are missing, record and shrink.</p>`,
      solution: `<pre><code>public String minWindow(String s, String t) {
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int missing = t.length(), lo = 0, bestLo = 0, bestLen = Integer.MAX_VALUE;
    for (int hi = 0; hi &lt; s.length(); hi++) {
        if (need[s.charAt(hi)]-- &gt; 0) missing--;
        while (missing == 0) {
            if (hi - lo + 1 &lt; bestLen) { bestLen = hi - lo + 1; bestLo = lo; }
            if (++need[s.charAt(lo++)] &gt; 0) missing++;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestLo, bestLo + bestLen);
}</code></pre><p class="cx">O(|s| + |t|). need[c] &gt; 0 means c is still required; negative means surplus in the window.</p>` }
  ]
});
