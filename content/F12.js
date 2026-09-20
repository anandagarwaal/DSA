COURSE.topic({
  id: 'F12',
  intro: `"Sort it first" is the opening move of two pointers, intervals, greedy and many binary searches. So you need to know exactly what sorting costs, <em>why</em> n log n is the best any comparison sort can do (a genuine proof, and a classic Staff-level question), how counting sort escapes it, and what sorting destroys.`,
  kps: [
    {
      title: 'Merge sort: split, recurse, merge',
      teach: `
<div class="ex">
<div class="sub">Subgoal 1: split</div>
<p>Cut the array in half.</p>
<div class="sub">Subgoal 2: recurse (leap of faith, F08)</div>
<p>Sort each half recursively. Assume it works: halves are smaller.</p>
<div class="sub">Subgoal 3: merge two sorted halves</div>
<p>Two pointers, one at the front of each half. Repeatedly take the smaller front element. Each step places one element for good, so merging costs O(n).</p>
<pre><code>left  = [2, 5, 9]     right = [1, 6, 7]
take 1 (right), 2 (left), 5 (left), 6 (right), 7 (right), 9 (left)
→ [1, 2, 5, 6, 7, 9]   6 elements, 6 steps</code></pre>
<div class="sub">Cost</div>
<p>T(n) = 2T(n/2) + O(n) = <strong>O(n log n)</strong> (F06: n work on each of log n levels). Space: O(n) for the merge buffer.</p>
</div>
<p>Why the merge step is correct: invariant (F07) "the output so far holds the smallest k elements of both halves, in order". The smallest remaining element overall must be at the front of one half, since each half is sorted, so taking the smaller front preserves it.</p>`,
      qs: [
        { type: 'num', q: `Merging [1, 4, 8, 10] and [2, 3, 9]: how many comparisons, at most?`, a: 6, why: 'Each comparison places one element, until one side runs out. At most n − 1 = 6 comparisons for 7 elements.' },
        { type: 'mcq', q: `Why does merge sort need O(n) extra space while heapsort doesn't?`, opts: ['Merging needs a buffer for the output', 'Recursion depth reaches n frames', 'It copies the input log n times over', 'It stores every comparison it makes'], a: 0, why: 'You can\'t merge two sorted halves in place (simply) without overwriting elements you still need.' },
        { type: 'free', q: `Prove the merge step is correct: why is the smaller of the two front elements the smallest remaining element overall?`, model: `<p>Each half is sorted, so its front element is the smallest remaining element <em>in that half</em>. The overall smallest remaining element is in one of the two halves, so it's the smallest of that half and therefore at its front. Taking the smaller of the two fronts takes the overall minimum, so the output stays sorted and contains the smallest elements so far.</p>`, rubric: ['Each half\'s front is its minimum (because the half is sorted)', 'The global minimum lies in one half, so it is one of the two fronts', 'Taking the smaller front preserves the invariant (output = smallest elements, sorted)'] },
        { type: 'mcq', q: `Java's Arrays.sort on an int[] (dual-pivot quicksort) vs on Integer[] (TimSort). Why different algorithms?`, opts: ['Objects need a stable sort', 'Primitives cannot be merge-sorted', 'Quicksort cannot sort objects', 'TimSort is too slow for ints'], a: 0, why: 'Stability (equal elements keep their order) matters for objects sorted by one key; it is meaningless for plain ints, so the faster unstable sort is used.' }
      ]
    },
    {
      title: 'Why no comparison sort beats n log n',
      teach: `
<p>This is a proof about <em>every possible</em> algorithm, which is unusual and powerful.</p>
<div class="ex">
<div class="sub">Subgoal 1: model any comparison sort as a decision tree</div>
<p>A comparison sort learns about the input only by asking "is a[i] &lt; a[j]?". Draw every possible run as a binary tree: each internal node is a comparison, and its two branches are the yes/no answers. Each leaf is a finished run that has settled one specific ordering.</p>
<div class="sub">Subgoal 2: count the leaves it needs</div>
<p>n distinct elements can arrive in <strong>n!</strong> orders, and each needs a <em>different</em> rearrangement to sort it. So the tree needs at least n! leaves.</p>
<div class="sub">Subgoal 3: height from leaves (F02)</div>
<p>A binary tree of height h has at most 2ʰ leaves. So 2ʰ ≥ n!, i.e. h ≥ log₂(n!). The height is the worst-case number of comparisons.</p>
<div class="sub">Subgoal 4: log₂(n!) ≈ n log n</div>
<p>n! has n/2 factors that are each ≥ n/2, so n! ≥ (n/2)^(n/2), and log₂(n!) ≥ (n/2)·log₂(n/2) = Ω(n log n).</p>
</div>
<p><strong>Conclusion:</strong> every comparison sort needs Ω(n log n) comparisons in the worst case. Merge sort is optimal. To go faster you must stop <em>comparing</em>.</p>`,
      qs: [
        { type: 'num', q: `Minimum worst-case number of comparisons to sort 4 distinct elements? (⌈log₂ 4!⌉)`, a: 5, why: '4! = 24 orderings; 2⁴ = 16 &lt; 24 ≤ 32 = 2⁵, so at least 5 comparisons.' },
        { type: 'num', q: `Same bound for 3 elements?`, a: 3, why: '3! = 6; 2² = 4 &lt; 6 ≤ 8 = 2³.' },
        { type: 'free', q: `Explain the decision-tree lower bound for comparison sorting in 3–4 sentences.`, model: `<p>Any comparison sort's behaviour on all inputs can be drawn as a binary tree of yes/no comparisons, with a leaf for each outcome. Since the n! input orderings each need a different rearrangement, the tree needs at least n! leaves. A binary tree with n! leaves has height at least log₂(n!), which is Θ(n log n). The height is the worst-case number of comparisons, so no comparison sort does better than Ω(n log n).</p>`, rubric: ['Any comparison sort is a binary decision tree of comparisons', 'It needs at least n! leaves (one per input ordering)', 'Height ≥ log₂(n!) = Θ(n log n) is the worst-case comparison count'] },
        { type: 'mcq', q: `Someone claims an O(n) comparison-based sort for arbitrary distinct integers. Your response?`, opts: ['Impossible: log₂(n!) comparisons needed', 'Plausible, if it has small constants', 'Possible, if it uses a hash map', 'Possible only for small values of n'], a: 0, why: 'The decision-tree bound applies to any algorithm that learns only through comparisons.' }
      ]
    },
    {
      title: 'Counting sort: escaping the bound by not comparing',
      teach: `
<p>The lower bound only covers <em>comparison</em> sorts. If keys are small integers, you can use them as <strong>array indices</strong>.</p>
<div class="ex">
<div class="sub">Worked example: sort grades 0..100 for n = 10⁶ students</div>
<pre><code>int[] count = new int[101];
for (int g : grades) count[g]++;              // O(n)
int k = 0;
for (int g = 0; g &lt;= 100; g++)                // O(range)
    while (count[g]-- &gt; 0) grades[k++] = g;</code></pre>
<p>Cost <strong>O(n + R)</strong>, where R is the key range. Here that's 10⁶ + 101: linear.</p>
<div class="sub">Why it doesn't contradict the bound</div>
<p><code>count[g]++</code> isn't a yes/no comparison. It jumps straight to slot g, gaining log R bits of information in one step. The decision-tree argument doesn't apply.</p>
<div class="sub">When it fails</div>
<p>When R is huge (values up to 10⁹), you'd need a 10⁹-slot array. It's the same density criterion as array-vs-HashMap in F11.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Sort 10⁷ ages (0..150). Fastest approach?`, opts: ['Counting sort, O(n + 151)', 'Merge sort, O(n log n)', 'Quicksort, expected n log n', 'Insertion sort, adaptive'], a: 0, why: 'Tiny key range: an array of 151 counters, linear time.' },
        { type: 'mcq', q: `Why can't counting sort be used for arbitrary 64-bit longs?`, opts: ['The count array would need 2⁶⁴ slots', 'Longs cannot be used as array indices', 'It would violate the n log n bound', 'Counting sort is unstable for longs'], a: 0, why: 'Cost O(n + R): with R = 2⁶⁴ the range term is impossible.' },
        { type: 'free', q: `Counting sort runs in O(n) on small ranges. Why doesn't that contradict the Ω(n log n) lower bound?`, model: `<p>The lower bound only applies to algorithms that learn about the input purely through pairwise comparisons (binary yes/no answers). Counting sort never compares elements; it uses each value directly as an array index, which extracts far more than one bit per step. Outside the comparison model, the decision-tree argument says nothing.</p>`, rubric: ['The bound applies only to comparison-based algorithms', 'Counting sort indexes by value rather than comparing', 'So the decision-tree argument does not apply'] },
        { type: 'num', q: `Counting sort on n = 1000 values in range 0..999999. Roughly how many basic steps? (n + R)`, a: 1001000, tol: 1000, why: '1000 + 10⁶: the range term dominates, and here merge sort (≈ 10⁴ steps) would be far faster.' }
      ]
    },
    {
      title: 'What sorting destroys',
      teach: `
<p>Sorting reorders elements, which throws away <strong>original positions</strong>. That's often exactly the information a problem asks for.</p>
<div class="ex">
<div class="sub">Worked example: Two Sum returning indices</div>
<p>Unsorted array; return the <em>indices</em> of the pair. Sort + two pointers finds the <em>values</em>, but their original indices are gone. Options:</p>
<p>(a) <strong>Hash map</strong> value → index, one pass, O(n) time and O(n) space. The standard answer.</p>
<p>(b) <strong>Sort index pairs</strong>: sort <code>int[][] {value, originalIndex}</code> by value, then two pointers, then report the stored indices. O(n log n) time, O(n) space.</p>
<div class="sub">Other things sorting destroys</div>
<p>Order-dependent answers ("the first duplicate", "contiguous subarray"). A subarray must be contiguous <em>in the original order</em>, so sorting a subarray problem usually breaks it.</p>
<div class="sub">The check</div>
<p>Before sorting, ask: <strong>does the answer depend on the original order or positions?</strong> If yes, either don't sort, or carry the positions along.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"Maximum sum contiguous subarray." Can you sort first?`, opts: ['No: contiguity is about original order', 'Yes: sort and take the positives', 'Yes: sorting preserves the sums', 'Only if the values are all positive'], a: 0, why: 'Sorting changes which elements are adjacent, so the answer changes.' },
        { type: 'mcq', q: `"Do any two elements sum to target? Return true/false." Sort + two pointers is…`, opts: ['Fine: no positions are needed', 'Wrong: sorting loses the indices', 'Wrong: two pointers needs hashing', 'Fine only if values are distinct'], a: 0, why: 'A yes/no answer does not depend on positions.' },
        { type: 'free', q: `You need the original indices of a pair summing to target, but want O(1) extra space besides the output. Is sort + two pointers possible? Explain the trade-off.`, model: `<p>No. Sorting in place destroys the original positions, and every way of remembering them costs O(n) extra: (value, index) pairs, a copy of the array, or a hash map. The realistic options are a hash map (O(n) time, O(n) space) or sorting index pairs (O(n log n) time, O(n) space). Returning positions means storing positions: that space cost is inherent.</p>`, rubric: ['In-place sorting loses the original indices', 'Carrying indices (pairs) or a hash map costs O(n) space', 'Concludes indices can\'t be recovered in O(1) extra space; names the realistic options'] },
        { type: 'mcq', q: `Sorting an array of (value, index) pairs by value, then two pointers, gives what complexity for index-returning two-sum?`, opts: ['O(n log n) time, O(n) space', 'O(n) time, O(1) space', 'O(n log n) time, O(1) space', 'O(n²) time, O(n) space'], a: 0, why: 'The sort dominates; the pairs array is O(n) extra.' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Lower bound on worst-case comparisons to sort 10 distinct elements: ⌈log₂ 10!⌉?`, a: 22, why: '10! = 3,628,800; 2²¹ ≈ 2.1M &lt; 10! &lt; 2²² ≈ 4.2M.' },
    { type: 'free', q: `<strong>Transfer.</strong> Prove that finding the <em>maximum</em> of n elements needs at least n − 1 comparisons, but that this is not a sorting-style log(n!) bound. What's the different argument?`, model: `<p>Each comparison has one "loser" that is then known not to be the maximum. To be sure of the maximum, every other element (n − 1 of them) must have lost at least one comparison, and one comparison produces only one loser, so at least n − 1 comparisons are needed. This is an adversary/elimination argument, not a decision-tree leaf count; the leaf count (n possible answers → log n) would give a much weaker bound here.</p>`, rubric: ['Each non-maximum element must lose at least one comparison', 'Each comparison creates at most one new loser, so ≥ n − 1 comparisons', 'Notes this differs from the decision-tree count (which gives only log n here)'] },
    { type: 'mcq', q: `Which problem can be solved in O(n) despite involving sorted order?`, opts: ['Sort 10⁶ digits from 0 to 9', 'Sort 10⁶ arbitrary doubles', 'Sort 10⁶ strings by comparing', 'Sort 10⁶ distinct longs'], a: 0, why: 'Counting sort with 10 buckets. The others need comparison sorting (or radix tricks with large constants).' },
    { type: 'mcq', q: `3Sum sorts first (O(n log n)) then runs an O(n²) scan. Is sorting a bottleneck?`, opts: ['No: n log n is dominated by n²', 'Yes: sorting is the slowest step', 'Yes: it must happen n times', 'No: sorting is free in Java'], a: 0, why: 'Total O(n log n + n²) = O(n²).' },
    { type: 'num', q: `How many merge levels (depth of the recursion) for merge sort on 10⁶ elements? (nearest whole)`, a: 20, tol: 1, why: 'log₂ 10⁶ ≈ 20 levels, each doing about 10⁶ work: about 2 × 10⁷ in total.' }
  ]
});
