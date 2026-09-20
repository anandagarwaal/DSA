COURSE.topic({
  id: 'P02',
  intro: `Converging two pointers is F09's elimination grid turned into code: <code>lo</code> at the left, <code>hi</code> at the right, and every step erases a whole row or column of candidates that <em>provably</em> can't be the answer. This topic is where your placement answer ("move hi to decrease the sum") becomes a proof you can say out loud, and then carry over to 3Sum, water containers and palindromes.`,
  kps: [
    {
      title: 'Sorted two-sum, with the proof',
      teach: `
<pre><code>int lo = 0, hi = a.length - 1;
while (lo &lt; hi) {
    int s = a[lo] + a[hi];
    if (s == target) return new int[]{lo, hi};
    if (s &lt; target) lo++;      // erase row lo
    else            hi--;      // erase column hi
}</code></pre>
<div class="ex">
<div class="sub">Subgoal 1: the invariant (F07)</div>
<p>Any valid pair lies inside [lo, hi]: rows ≥ lo, columns ≤ hi of the pair grid (F09).</p>
<div class="sub">Subgoal 2: sum too small → lo++ is safe</div>
<p>Every pair still using a[lo] is (lo, j) with j ≤ hi, so a[j] ≤ a[hi] and a[lo] + a[j] ≤ s &lt; target. No partner of a[lo] works. Row lo can go.</p>
<div class="sub">Subgoal 3: sum too big → hi−− is safe</div>
<p>Every pair (i, hi) with i ≥ lo has a[i] ≥ a[lo], so its sum ≥ s &gt; target. Column hi can go.</p>
<div class="sub">Subgoal 4: cost</div>
<p>hi − lo drops by 1 each step: at most n − 1 steps. O(n) time, O(1) space.</p>
</div>
<p><strong>When to prefer this over hashing (P01):</strong> the input is already sorted, or O(1) extra space is required. Hashing needs O(n) space but works unsorted. Say that trade-off unprompted.</p>`,
      qs: [
        { type: 'free', q: `a is sorted and a[lo] + a[hi] &lt; target. Prove that no valid pair uses a[lo]. (This is the placement question.)`, model: `<p>All remaining candidate partners of a[lo] are a[j] with lo &lt; j ≤ hi (columns past hi were already erased). The array is sorted, so a[j] ≤ a[hi], hence a[lo] + a[j] ≤ a[lo] + a[hi] &lt; target. Every pair using a[lo] is too small, so none equals target: discarding lo loses nothing.</p>`, rubric: ['Identifies the remaining partners of a[lo] as j in (lo, hi]', 'Uses sortedness: a[j] ≤ a[hi]', 'Concludes every such sum is below target, so lo can be discarded'] },
        { type: 'num', q: `a = [1, 2, 4, 7, 11, 15], target 15. How many sums are computed, including the successful one?`, a: 4, why: '1+15 = 16 too big → hi−−. 1+11 = 12 too small → lo++. 2+11 = 13 too small → lo++. 4+11 = 15 found. Four sums.' },
        { type: 'mcq', q: `The input is unsorted and you must return the original indices. Best choice?`, opts: ['Hash map of value to index', 'Sort, then two pointers', 'Two pointers with no sort', 'Binary search per element'], a: 0, why: 'Sorting would destroy the indices (F12), and two pointers needs sorted input.' },
        { type: 'mcq', q: `What guarantees the loop <code>while (lo &lt; hi)</code> terminates?`, opts: ['hi − lo strictly drops each step', 'The target always exists in a', 'The array has no duplicates', 'lo and hi move together'], a: 0, why: 'Every iteration moves exactly one pointer inward by one (F07 measure).' }
      ]
    },
    {
      title: '3Sum: fix one index, converge on the rest, dedup safely',
      teach: `
<p>Find all unique triplets summing to 0. The search space is triples, O(n³) brute force. <strong>Reduce to a problem you've solved:</strong> fix the smallest element a[i]; the other two must sum to −a[i] in the sorted suffix, which is sorted two-sum.</p>
<pre><code>Arrays.sort(a);
for (int i = 0; i &lt; n - 2; i++) {
    if (i &gt; 0 &amp;&amp; a[i] == a[i - 1]) continue;          // (1) skip duplicate pivot
    int lo = i + 1, hi = n - 1;
    while (lo &lt; hi) {
        int s = a[i] + a[lo] + a[hi];
        if (s &lt; 0) lo++;
        else if (s &gt; 0) hi--;
        else {
            res.add(List.of(a[i], a[lo], a[hi]));
            while (lo &lt; hi &amp;&amp; a[lo] == a[lo + 1]) lo++;   // (2) skip duplicate lo
            while (lo &lt; hi &amp;&amp; a[hi] == a[hi - 1]) hi--;   //     and duplicate hi
            lo++; hi--;
        }
    }
}</code></pre>
<div class="ex">
<div class="sub">Why the skips don't lose answers</div>
<p>(1) If a[i] == a[i−1], every triplet with pivot a[i] was already found with pivot a[i−1], since the i−1 suffix contains the i suffix. (2) After finding (a[i], x, y), any other lo with value x needs the same partner y. Same triplet, so skip.</p>
<div class="sub">Why lo++ AND hi−− together after a match?</div>
<p>With a[i] fixed, a new lo value &gt; x needs a partner &lt; y. Keeping hi can't work, so both move.</p>
<div class="sub">Cost</div>
<p>n pivots × O(n) scan = <strong>O(n²)</strong>. The O(n log n) sort is dominated.</p>
</div>`,
      qs: [
        { type: 'num', q: `How many unique zero-sum triplets in [−1, 0, 1, 2, −1, −4]?`, a: 2, why: '[−1, −1, 2] and [−1, 0, 1].' },
        { type: 'num', q: `How many unique zero-sum triplets in [−2, −2, 0, 0, 2, 2]?`, a: 1, why: 'Only [−2, 0, 2], though it can be formed 8 ways. That is why dedup matters.' },
        { type: 'free', q: `Prove that skipping pivot i when a[i] == a[i−1] never loses a triplet.`, model: `<p>Any triplet found with pivot index i uses two partners from indices &gt; i. Those indices are also &gt; i−1, and a[i−1] = a[i], so the same values form a triplet with pivot i−1, which was already processed and found it. Pivot i can only produce duplicates.</p>`, rubric: ['A triplet with pivot i uses partners from the suffix after i', 'That suffix is contained in the suffix after i−1, and a[i−1] = a[i]', 'So pivot i−1 already produced every such triplet; only duplicates are skipped'] },
        { type: 'mcq', q: `Why does 3Sum sort first?`, opts: ['Two pointers and dedup both need order', 'Sorting makes it O(n log n) overall', 'Hash maps cannot hold triplets', 'The output must be printed sorted'], a: 0, why: 'Sorted order powers the elimination proof and puts duplicates next to each other.' },
        { type: 'mcq', q: `3Sum complexity?`, opts: ['O(n²) time, O(1) extra', 'O(n log n) time, O(n) extra', 'O(n³) time, O(1) extra', 'O(n²) time, O(n²) extra'], a: 0, why: 'n pivots × linear scan; sorting in place (output not counted).' }
      ]
    },
    {
      title: 'Container With Most Water: move the shorter line',
      teach: `
<p>Area(lo, hi) = (hi − lo) × min(h[lo], h[hi]). Start at the widest pair and move inward.</p>
<div class="ex">
<div class="sub">The rule</div>
<p>Move the pointer at the <strong>shorter</strong> line.</p>
<div class="sub">The proof (erase a row, F09)</div>
<p>Say h[lo] ≤ h[hi]. Any other container using lo is (lo, j) with j &lt; hi: narrower, and its height min(h[lo], h[j]) ≤ h[lo]. Both factors are no bigger and the width is strictly smaller, so every such area &lt; the current one. <strong>Line lo is used up</strong>: its best container is the one we just measured.</p>
<div class="sub">Why not the taller line?</div>
<p>Pairs (i, hi) with a new i can have min(h[i], h[hi]) &gt; h[lo], so a taller container might be narrower yet larger. One measurement doesn't bound that column.</p>
<div class="sub">Worked trace: h = [1, 8, 6, 2, 5, 4, 8, 3, 7]</div>
<p>(0, 8): 8 × 1 = 8, move lo. (1, 8): 7 × 7 = <strong>49</strong>, move hi (7 &lt; 8). … No later pair beats 49.</p>
</div>`,
      qs: [
        { type: 'num', q: `Max area for h = [4, 3, 2, 1, 4]?`, a: 16, why: 'The two 4s at distance 4: 4 × 4 = 16.' },
        { type: 'num', q: `Max area for h = [2, 3, 4, 5, 18, 17, 6]?`, a: 17, why: '18 and 17 are adjacent: 1 × 17 = 17, which beats e.g. (2,6) at 4 × 4 = 16 and (0,6) at 6 × 2 = 12.' },
        { type: 'free', q: `Prove that when h[lo] ≤ h[hi], no container using line lo with some j &lt; hi beats area(lo, hi).`, model: `<p>For lo &lt; j &lt; hi: width j − lo &lt; hi − lo, and height min(h[lo], h[j]) ≤ h[lo] = min(h[lo], h[hi]). So area(lo, j) ≤ (j − lo)·h[lo] &lt; (hi − lo)·h[lo] = area(lo, hi). Line lo has no better partner left, so it can be discarded.</p>`, rubric: ['Width strictly smaller for every j &lt; hi', 'Height capped by h[lo], which is already the current min', 'Concludes every such area is smaller; lo is safe to discard'] },
        { type: 'mcq', q: `h[lo] == h[hi]. Which pointer should move?`, opts: ['Either; both lines are used up', 'Only lo, by convention', 'Only hi, by convention', 'Neither; stop the search'], a: 0, why: 'The proof applies to both: each line is capped at the shared height, and any narrower partner loses. Moving either is safe.' }
      ]
    },
    {
      title: 'Palindrome scans and the two-sided squeeze',
      teach: `
<p>A palindrome check compares mirror positions: s[lo] with s[hi], moving inward. No sortedness is needed. The invariant does the work.</p>
<div class="ex">
<div class="sub">Invariant</div>
<p>"Every pair outside [lo, hi] matched." When lo ≥ hi, all mirror pairs matched, so it's a palindrome. The first mismatch proves it isn't.</p>
<div class="sub">Valid Palindrome (skip non-alphanumerics)</div>
<pre><code>int lo = 0, hi = s.length() - 1;
while (lo &lt; hi) {
    while (lo &lt; hi &amp;&amp; !Character.isLetterOrDigit(s.charAt(lo))) lo++;
    while (lo &lt; hi &amp;&amp; !Character.isLetterOrDigit(s.charAt(hi))) hi--;
    if (Character.toLowerCase(s.charAt(lo)) != Character.toLowerCase(s.charAt(hi))) return false;
    lo++; hi--;
}
return true;</code></pre>
<div class="sub">The inner guards</div>
<p>The <code>lo &lt; hi</code> inside the skip loops stops a string of only symbols from walking off the end. O(n) total: each pointer only moves inward (F04's "each index moves once").</p>
<div class="sub">Trapping Rain Water: the same squeeze with a proof</div>
<p>Water above i = min(maxLeft, maxRight) − h[i]. Keep leftMax and rightMax. If leftMax &lt; rightMax, the water at lo is decided: its true right wall is at least rightMax &gt; leftMax, so the min is leftMax. Settle lo and move it. Symmetric otherwise.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"race a car" (letters/digits only, ignore case). Palindrome?`, opts: ['No: "raceacar" mismatches', 'Yes: it reads the same', 'Yes, after ignoring spaces', 'Cannot tell without sorting'], a: 0, why: 'raceacar: r=r, a=a, c=c, e vs a mismatch.' },
        { type: 'num', q: `Trapping rain water: h = [0,1,0,2,1,0,1,3,2,1,2,1]. Units trapped?`, a: 6, why: 'Water above each index is min(maxLeft, maxRight) − h[i], summing to 6.' },
        { type: 'num', q: `Trapping rain water: h = [4, 2, 0, 3, 2, 5]. Units trapped?`, a: 9, why: 'Bounded by 4 on the left and 5 on the right: 2 + 4 + 1 + 2 = 9.' },
        { type: 'free', q: `In the two-pointer trapping-rain-water solution, why is it safe to settle position lo when leftMax &lt; rightMax, even though we haven't seen every bar to its right?`, model: `<p>The water at lo is min(true max to its left, true max to its right) − h[lo]. We know the left max exactly (leftMax). The true right max is at least rightMax (a bar we've already seen on the right), and rightMax &gt; leftMax. So the min is leftMax whatever the unseen bars are. The water at lo is fully determined.</p>`, rubric: ['Water = min(left max, right max) − height', 'Right max is at least rightMax, which already exceeds leftMax', 'So the min is leftMax regardless of unseen bars: lo is settled'] }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Sorted array, target t: return the pair whose sum is <em>closest</em> to t. Give the algorithm and prove each pointer move is safe.`, model: `<p>lo = 0, hi = n−1, and track the best |sum − t|. If sum &lt; t: every pair (lo, j) with j &lt; hi has a sum ≤ this one, so it's further below t. None of them is closer than the current pair, so lo++ is safe. If sum &gt; t: symmetrically, every (i, hi) with i &gt; lo is even larger, so hi−−. If sum == t, return it. O(n).</p>`, rubric: ['Same converging scan, tracking the best difference', 'sum &lt; t: the rest of row lo is even smaller, so no closer, so lo++', 'sum &gt; t: the rest of column hi is even larger, so hi−−'] },
    { type: 'mcq', q: `Which problem is <em>not</em> a converging two-pointer problem?`, opts: ['Two Sum on unsorted input, return indices', 'Valid palindrome with punctuation', 'Container With Most Water', 'Pair sum in a sorted array'], a: 0, why: 'Unsorted input with indices needed calls for hashing (P01).' },
    { type: 'num', q: `4Sum by fixing two indices then two pointers: what is the exponent k in O(nᵏ)?`, a: 3, why: 'n² pairs of fixed indices × O(n) scan = O(n³).' },
    { type: 'mcq', q: `In Container With Most Water you always move the <em>taller</em> line instead. On h = [1, 8, 6, 2, 5, 4, 8, 3, 7] what happens?`, opts: ['It misses the optimum 49', 'It still finds 49, just later', 'It loops forever between lines', 'It finds a value larger than 49'], a: 0, why: 'At (0, 8) it drops index 8 (height 7), erasing the optimal pair (1, 8).' },
    { type: 'free', q: `Explain why 3Sum is O(n²) and not O(n³), in terms of the search space.`, model: `<p>The search space is all triples, about n³/6. Fixing the pivot splits it into n slices, each a pair grid over the suffix. In each slice, converging pointers erase a whole row or column per step (sorted suffix), so each slice costs O(n) instead of O(n²). n slices × O(n) = O(n²).</p>`, rubric: ['Triple space split into n pair grids (one per pivot)', 'Each pair grid is searched in O(n) by row/column elimination', 'Total n × n = O(n²)'] }
  ],
  practice: [
    { name: 'Two Sum II (sorted)', lc: 'LeetCode 167', prompt: `<p>1-indexed positions of two numbers in a sorted array summing to target, O(1) extra space.</p>`, hint: `<p>Start at the corner of the pair grid where one comparison tells you which way to go.</p>`,
      solution: `<pre><code>public int[] twoSum(int[] numbers, int target) {
    int lo = 0, hi = numbers.length - 1;
    while (lo &lt; hi) {
        int s = numbers[lo] + numbers[hi];
        if (s == target) return new int[]{lo + 1, hi + 1};
        if (s &lt; target) lo++; else hi--;
    }
    return new int[]{-1, -1};
}</code></pre><p class="cx">O(n) · O(1). Each step erases a row or column of the pair grid.</p>` },
    { name: '3Sum', lc: 'LeetCode 15', prompt: `<p>All unique triplets summing to zero.</p>`, hint: `<p>Sort. Fix a[i], then sorted two-sum on the suffix for −a[i]. Skip equal pivots and equal partners after a match.</p>`,
      solution: `<pre><code>public List&lt;List&lt;Integer&gt;&gt; threeSum(int[] a) {
    Arrays.sort(a);
    List&lt;List&lt;Integer&gt;&gt; res = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; a.length - 2; i++) {
        if (i &gt; 0 &amp;&amp; a[i] == a[i - 1]) continue;
        int lo = i + 1, hi = a.length - 1;
        while (lo &lt; hi) {
            int s = a[i] + a[lo] + a[hi];
            if (s &lt; 0) lo++;
            else if (s &gt; 0) hi--;
            else {
                res.add(Arrays.asList(a[i], a[lo], a[hi]));
                while (lo &lt; hi &amp;&amp; a[lo] == a[lo + 1]) lo++;
                while (lo &lt; hi &amp;&amp; a[hi] == a[hi - 1]) hi--;
                lo++; hi--;
            }
        }
    }
    return res;
}</code></pre><p class="cx">O(n²) · O(1) extra beyond output.</p>` },
    { name: 'Container With Most Water', lc: 'LeetCode 11', prompt: `<p>Maximise (j − i) · min(h[i], h[j]).</p>`, hint: `<p>Which line's row can be erased after one measurement?</p>`,
      solution: `<pre><code>public int maxArea(int[] h) {
    int lo = 0, hi = h.length - 1, best = 0;
    while (lo &lt; hi) {
        best = Math.max(best, (hi - lo) * Math.min(h[lo], h[hi]));
        if (h[lo] &lt; h[hi]) lo++; else hi--;
    }
    return best;
}</code></pre><p class="cx">O(n). The shorter line has no better partner left.</p>` },
    { name: 'Trapping Rain Water', lc: 'LeetCode 42', prompt: `<p>Total water trapped between bars of heights h.</p>`, hint: `<p>Water at i = min(maxLeft, maxRight) − h[i]. Which side's water is already determined?</p>`,
      solution: `<pre><code>public int trap(int[] h) {
    int lo = 0, hi = h.length - 1, lmax = 0, rmax = 0, water = 0;
    while (lo &lt; hi) {
        lmax = Math.max(lmax, h[lo]);
        rmax = Math.max(rmax, h[hi]);
        if (lmax &lt; rmax) water += lmax - h[lo++];   // lo's right wall is at least rmax
        else             water += rmax - h[hi--];   // hi's left wall is at least lmax
    }
    return water;
}</code></pre><p class="cx">O(n) · O(1). Settle the side whose limiting wall is already known.</p>` }
  ]
});
