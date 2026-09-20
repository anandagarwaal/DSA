COURSE.topic({
  id: 'P05',
  intro: `Binary search is easy to describe and famously easy to get wrong: off-by-ones, infinite loops, the wrong boundary. The fix isn't memorising templates. It's knowing the <strong>invariant</strong> (F07) that says where the answer can still be, and choosing updates that keep it true while strictly shrinking the range. This topic builds on F13 (monotone predicates) and F02 (why it's log n).`,
  kps: [
    {
      title: 'The invariant: the answer is always inside [lo, hi]',
      teach: `
<p>Classic search for target in a sorted array:</p>
<pre><code>int lo = 0, hi = a.length - 1;           // invariant: if target exists, it is in a[lo..hi]
while (lo &lt;= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] &lt; target) lo = mid + 1;   // a[lo..mid] are all &lt; target: erase them
    else                 hi = mid - 1;   // a[mid..hi] are all &gt; target: erase them
}
return -1;                               // range empty: target absent</code></pre>
<div class="ex">
<div class="sub">Maintenance</div>
<p>If a[mid] &lt; target, sortedness gives a[lo..mid] ≤ a[mid] &lt; target, so none of them is the target. Moving lo to mid + 1 keeps "target ∈ a[lo..hi] if present". The other case is symmetric.</p>
<div class="sub">Termination</div>
<p>Each iteration removes mid itself plus one side, so hi − lo strictly decreases. When lo &gt; hi the range is empty, and by the invariant the target isn't there.</p>
<div class="sub">Overflow</div>
<p><code>(lo + hi) / 2</code> can overflow int when both are near 2³¹. <code>lo + (hi − lo) / 2</code> can't. Interviewers notice.</p>
</div>`,
      qs: [
        { type: 'num', q: `Worst-case number of loop iterations for this search on n = 1000 elements?`, a: 10, why: 'Each iteration at least halves the range: ⌈log₂ 1001⌉ = 10.' },
        { type: 'mcq', q: `Why <code>lo = mid + 1</code> rather than <code>lo = mid</code> when a[mid] &lt; target?`, opts: ['mid is known wrong; keeping it can loop', 'mid + 1 is faster to compute', 'lo = mid breaks sortedness', 'It only matters for duplicates'], a: 0, why: 'mid is proven not to be the target, so exclude it. Keeping it may leave the range unchanged: an infinite loop.' },
        { type: 'free', q: `Prove that when the loop ends with lo &gt; hi, the target isn't in the array.`, model: `<p>Invariant: if target is present, it's in a[lo..hi]. It holds initially (the whole array) and each update only discards positions proven not to hold target (by sortedness relative to a[mid], and mid itself ≠ target). When lo &gt; hi, a[lo..hi] is empty, so the invariant says target can't be present.</p>`, rubric: ['States the invariant (target in a[lo..hi] if present)', 'Updates only discard provably-wrong positions (sortedness + mid ≠ target)', 'Empty range at the end plus invariant gives target absent'] },
        { type: 'mcq', q: `lo = 2,000,000,000 and hi = 2,100,000,000 (int). <code>(lo + hi) / 2</code> gives…`, opts: ['A negative number from overflow', 'The correct midpoint, exactly', 'A compile-time error', 'A value rounded up by one'], a: 0, why: 'The sum exceeds 2³¹ − 1 ≈ 2.147 × 10⁹ and wraps negative. Use lo + (hi − lo) / 2.' }
      ]
    },
    {
      title: 'lo &lt; hi vs lo &lt;= hi, and avoiding infinite loops',
      teach: `
<p>Two templates. <strong>Pick one and know why it works.</strong></p>
<div class="ex">
<div class="sub">Template A: search for an exact value</div>
<p><code>while (lo &lt;= hi)</code>, range [lo, hi] inclusive, <code>lo = mid + 1</code> / <code>hi = mid − 1</code>. Ends with an empty range.</p>
<div class="sub">Template B: find a boundary (first true of a monotone predicate, F13)</div>
<pre><code>int lo = 0, hi = n;                      // answer in [lo, hi]; hi = n means "none true"
while (lo &lt; hi) {
    int mid = lo + (hi - lo) / 2;        // rounds DOWN, so mid &lt; hi
    if (ok(mid)) hi = mid;               // mid might be the first true: keep it
    else         lo = mid + 1;           // mid is false: discard it
}
return lo;                               // lo == hi: the boundary</code></pre>
<div class="sub">Why this can't loop forever</div>
<p>mid rounds down, so lo ≤ mid &lt; hi. Then <code>hi = mid</code> strictly shrinks the range, and so does <code>lo = mid + 1</code>. If you write <code>lo = mid</code> in the false branch, a two-element range [4, 5] gives mid = 4 and lo = 4 again: stuck (F07).</p>
<div class="sub">Rule of thumb</div>
<p>If a branch keeps mid (<code>hi = mid</code>), the other must exclude it (<code>lo = mid + 1</code>) and mid must round toward the kept side's opposite. Rounding down pairs with hi = mid.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `A <em>last-true</em> search uses <code>if (ok(mid)) lo = mid; else hi = mid − 1;</code> with mid rounding down. On range [4, 5] where ok(4) is true…`, opts: ['It loops forever with lo = 4', 'It returns 4 immediately', 'It returns 5 by mistake', 'It throws an index error'], a: 0, why: 'mid = 4, ok is true, lo = mid = 4: no change. With lo = mid you must round mid up.' },
        { type: 'num', q: `Template B on ok(x) = (x ≥ 7) over lo = 0, hi = 10. Returned value?`, a: 7, why: 'The first x where ok is true.' },
        { type: 'free', q: `In template B, why is <code>hi = mid</code> (not mid − 1) correct when ok(mid) is true?`, model: `<p>We're looking for the first true. ok(mid) true means mid is a candidate for the first true: it might be it (if mid − 1 is false). Setting hi = mid − 1 could discard the answer. Everything right of mid is true but can't be first, so hi = mid keeps exactly the positions that can still be the answer.</p>`, rubric: ['mid itself could be the first true', 'mid − 1 would risk discarding the answer', 'Positions right of mid are true but not first, so hi = mid is exact'] },
        { type: 'mcq', q: `Template B starts with hi = n (one past the end). What does returning n mean?`, opts: ['No index satisfies the predicate', 'The last element is the answer', 'The array is already empty', 'The search failed to converge'], a: 0, why: 'n acts as the "none true" sentinel: the predicate is false everywhere.' }
      ]
    },
    {
      title: 'Lower bound, upper bound: first true in disguise',
      teach: `
<p>With duplicates, "find the target" is ambiguous. Ask for a boundary instead:</p>
<div class="ex">
<div class="sub">lower bound: first index with a[i] ≥ t</div>
<p>Predicate ok(i) = a[i] ≥ t, monotone on sorted input. Template B.</p>
<div class="sub">upper bound: first index with a[i] &gt; t</div>
<p>ok(i) = a[i] &gt; t.</p>
<div class="sub">Worked example: a = [1, 2, 2, 2, 5, 7], t = 2</div>
<p>lower bound = 1, upper bound = 4. Count of 2s = 4 − 1 = <strong>3</strong>. First occurrence = lower bound (if a[lb] == t); last occurrence = upper bound − 1.</p>
<div class="sub">Insertion point</div>
<p>Lower bound of a value not present is where it would be inserted to keep the array sorted: t = 3 gives 4; t = 8 gives 6 (= n).</p>
</div>
<p>Every "first/last position", "count of x", "closest element" and "insertion index" problem is one of these two searches. That's one template, not five.</p>`,
      qs: [
        { type: 'num', q: `a = [1, 2, 2, 2, 5, 7]. Lower bound (first index with a[i] ≥ 3)?`, a: 4, why: 'a[4] = 5 is the first value ≥ 3.' },
        { type: 'num', q: `Same array. How many elements are ≤ 2? (use upper bound of 2)`, a: 4, why: 'Upper bound of 2 = first index with a[i] &gt; 2 = 4, so indices 0..3 are ≤ 2.' },
        { type: 'mcq', q: `First and Last Position of target in a sorted array with duplicates. Minimum number of binary searches?`, opts: ['Two: lower and upper bound', 'One, then scan outward', 'Three, one per region', 'n, one per duplicate'], a: 0, why: 'Scanning outward is O(k) for k copies, O(n) worst case. Two boundary searches are O(log n).' },
        { type: 'free', q: `Express "last index where a[i] ≤ t" as a first-true search, and explain why it's correct.`, model: `<p>Find the first index where a[i] &gt; t (upper bound), then subtract 1. On a sorted array, "a[i] ≤ t" is true for a prefix and "a[i] &gt; t" for the rest; they share the same boundary. The last index of the ≤ block sits immediately before the first index of the &gt; block. If the upper bound is 0, no element is ≤ t.</p>`, rubric: ['Uses upper bound (first a[i] &gt; t) minus 1', 'Justifies with the shared boundary of complementary predicates', 'Handles the empty case (result −1 when upper bound is 0)'] }
      ]
    },
    {
      title: 'Rotated sorted array: which half is sorted?',
      teach: `
<p>[4, 5, 6, 7, 0, 1, 2] is a sorted array rotated. It isn't sorted, so plain binary search's proof fails. But <strong>at least one half around any mid is sorted</strong>, and that's enough.</p>
<div class="ex">
<div class="sub">Subgoal 1: find the sorted half</div>
<p>If a[lo] ≤ a[mid], the left half a[lo..mid] is sorted (the rotation point isn't inside it). Otherwise the right half a[mid..hi] is sorted.</p>
<div class="sub">Subgoal 2: is the target inside the sorted half's range?</div>
<p>A sorted half lets you test membership by its endpoints: target ∈ [a[lo], a[mid]) means go left, else go right. The other half is unknown, but it's "everything else".</p>
<div class="sub">Subgoal 3: still an erasure proof</div>
<p>Each step discards a half that provably can't contain the target: the sorted half by its range, or the unsorted half because the target is in the sorted one.</p>
<div class="sub">Find the minimum</div>
<p>Compare a[mid] with a[hi]: if a[mid] &gt; a[hi], the drop (the minimum) is right of mid, so lo = mid + 1. Otherwise it's at mid or left of it, so hi = mid. That's template B.</p>
</div>`,
      qs: [
        { type: 'num', q: `Index of the minimum in [4, 5, 6, 7, 0, 1, 2]?`, a: 4, why: 'The value 0 sits where the rotation happened.' },
        { type: 'mcq', q: `In [4, 5, 6, 7, 0, 1, 2] with lo = 0, hi = 6: mid = 3 (value 7). Which half is guaranteed sorted?`, opts: ['Left: a[lo] = 4 ≤ a[mid] = 7', 'Right: a[mid] = 7 ≤ a[hi] = 2', 'Both halves are sorted here', 'Neither half is sorted'], a: 0, why: 'a[lo] ≤ a[mid] means no drop inside the left half.' },
        { type: 'free', q: `Find-minimum compares a[mid] with a[hi] and uses hi = mid (not mid − 1) in one branch. Explain both choices.`, model: `<p>a[hi] tells you which side of the drop mid is on: if a[mid] &gt; a[hi], mid is in the left (higher) run, so the minimum is strictly right of mid (lo = mid + 1). Otherwise mid is in the right (lower) run, so the minimum is at mid or to its left, and mid itself might be the minimum, so hi = mid keeps it. It's template B's "first index where a[i] ≤ a[hi]".</p>`, rubric: ['a[mid] vs a[hi] reveals which run mid is in', 'a[mid] &gt; a[hi]: minimum strictly right, lo = mid + 1', 'Else mid could be the minimum, so hi = mid (not mid − 1)'] },
        { type: 'mcq', q: `Why compare a[mid] with a[hi] rather than a[lo] when finding the minimum?`, opts: ['a[lo] cannot tell unrotated from rotated', 'a[hi] is always the maximum value', 'It avoids integer overflow in mid', 'a[lo] may be out of bounds'], a: 0, why: 'In an unrotated array a[lo] ≤ a[mid] and the min is at lo; in a rotated one a[lo] ≤ a[mid] means the min is to the right. Same comparison, different answers. a[hi] distinguishes them.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Find a peak element (strictly greater than its neighbours) in an array where a[−1] = a[n] = −∞, in O(log n)." There's no sortedness. What makes binary search valid here?`, model: `<p>Compare a[mid] with a[mid+1]. If a[mid] &lt; a[mid+1], walking right from mid rises, and since a[n] = −∞ the values must come down eventually, so a peak exists in (mid, n): lo = mid + 1. Otherwise a[mid] &gt; a[mid+1], and by the same argument a peak exists in [lo, mid]: hi = mid. The invariant "a peak exists in [lo, hi]" is kept while the range halves. It's elimination with a guarantee, not sortedness.</p>`, rubric: ['Compares a[mid] with its neighbour to pick a direction', 'Argues a peak must exist on the rising side (because of the −∞ boundary)', 'Invariant: a peak lies in [lo, hi]; the range halves each step'] },
    { type: 'num', q: `Search for 0 in the rotated array [4, 5, 6, 7, 0, 1, 2]. Returned index?`, a: 4, why: 'a[4] = 0.' },
    { type: 'mcq', q: `A binary search on n = 10⁹ sorted values takes at most about how many iterations?`, opts: ['30', '1,000', '31,623', '10⁹ / 2'], a: 0, why: 'log₂ 10⁹ ≈ 30.' },
    { type: 'mcq', q: `Searching a sorted m × n matrix (each row starts after the previous row ends). Best approach?`, opts: ['Binary search indices 0..mn−1 as one array', 'Binary search each row separately', 'Staircase search from the top-right', 'Scan rows until value exceeds target'], a: 0, why: 'The rows concatenate into one sorted array; index k maps to (k / n, k % n). O(log mn).' },
    { type: 'free', q: `A colleague's binary search sometimes hangs. It uses <code>while (lo &lt; hi) { mid = (lo+hi)/2; if (ok(mid)) hi = mid - 1; else lo = mid; }</code>. Diagnose it with the termination argument and fix it.`, model: `<p>With mid rounding down, when hi = lo + 1, mid = lo; if ok(mid) is false, lo = mid = lo: the range doesn't shrink, so it loops forever. The measure hi − lo must strictly decrease. Also hi = mid − 1 can discard the first true. Fix: <code>if (ok(mid)) hi = mid; else lo = mid + 1;</code> (template B): both branches then strictly shrink the range and keep the answer.</p>`, rubric: ['Identifies the stuck case: hi = lo + 1, mid = lo, lo = mid does not move', 'Uses the strictly-decreasing-measure argument', 'Fixes to hi = mid / lo = mid + 1 (and notes mid − 1 could drop the answer)'] }
  ],
  practice: [
    { name: 'Binary Search', lc: 'LeetCode 704', prompt: `<p>Return the index of target in a sorted array, or −1.</p>`, hint: `<p>Invariant: if present, target ∈ a[lo..hi].</p>`,
      solution: `<pre><code>public int search(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo &lt;= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] &lt; target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}</code></pre><p class="cx">O(log n).</p>` },
    { name: 'Find First and Last Position', lc: 'LeetCode 34', prompt: `<p>Start and end index of target in a sorted array with duplicates, or [−1, −1].</p>`, hint: `<p>Two first-true searches: a[i] ≥ t and a[i] &gt; t.</p>`,
      solution: `<pre><code>public int[] searchRange(int[] a, int t) {
    int lb = firstTrue(a, t, false), ub = firstTrue(a, t, true);
    return lb &lt; ub ? new int[]{lb, ub - 1} : new int[]{-1, -1};
}
// strict=false: first i with a[i] &gt;= t; strict=true: first i with a[i] &gt; t
private int firstTrue(int[] a, int t, boolean strict) {
    int lo = 0, hi = a.length;
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        boolean ok = strict ? a[mid] &gt; t : a[mid] &gt;= t;
        if (ok) hi = mid; else lo = mid + 1;
    }
    return lo;
}</code></pre><p class="cx">O(log n). The count of t is ub − lb.</p>` },
    { name: 'Search in Rotated Sorted Array', lc: 'LeetCode 33', prompt: `<p>Distinct values, rotated sorted array; index of target or −1, in O(log n).</p>`, hint: `<p>One half around mid is sorted. Is target inside that half's range?</p>`,
      solution: `<pre><code>public int search(int[] a, int t) {
    int lo = 0, hi = a.length - 1;
    while (lo &lt;= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[lo] &lt;= a[mid]) {                       // left half sorted
            if (a[lo] &lt;= t &amp;&amp; t &lt; a[mid]) hi = mid - 1; else lo = mid + 1;
        } else {                                     // right half sorted
            if (a[mid] &lt; t &amp;&amp; t &lt;= a[hi]) lo = mid + 1; else hi = mid - 1;
        }
    }
    return -1;
}</code></pre><p class="cx">O(log n). Each step discards a half proven not to contain t.</p>` },
    { name: 'Find Minimum in Rotated Sorted Array', lc: 'LeetCode 153', prompt: `<p>Distinct values; return the minimum in O(log n).</p>`, hint: `<p>Compare a[mid] with a[hi].</p>`,
      solution: `<pre><code>public int findMin(int[] a) {
    int lo = 0, hi = a.length - 1;
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] &gt; a[hi]) lo = mid + 1;   // drop is right of mid
        else hi = mid;                      // mid may be the minimum
    }
    return a[lo];
}</code></pre><p class="cx">O(log n). Template B on "a[i] ≤ a[hi]".</p>` }
  ]
});
