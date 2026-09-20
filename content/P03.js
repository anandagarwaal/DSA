COURSE.topic({
  id: 'P03',
  intro: `Two pointers moving the <em>same</em> direction: a fast <strong>reader</strong> that looks at every element, and a slow <strong>writer</strong> that marks where the next kept element goes. It's the standard way to filter, dedup or partition an array in place with O(1) extra space. Everything rests on one invariant (F07), which is what makes these solutions easy to get right rather than fiddly.`,
  kps: [
    {
      title: 'The invariant: a[0..w) is the finished output',
      teach: `
<figure class="fig"><svg viewBox="0 0 340 80" width="340" role="img" aria-label="read write regions">
<g transform="translate(10,12)" font-size="11" text-anchor="middle">
<rect x="0" y="0" width="120" height="30" style="fill:var(--good);opacity:.25;stroke:var(--good)"/>
<rect x="120" y="0" width="80" height="30" style="fill:var(--kbd);stroke:var(--rule)"/>
<rect x="200" y="0" width="120" height="30" style="fill:#fff;stroke:var(--rule)"/>
<text x="60" y="19">kept output</text><text x="160" y="19">garbage</text><text x="260" y="19">unread</text>
<text x="120" y="48" style="fill:var(--accent)">w</text><text x="200" y="48" style="fill:var(--accent)">r</text></g>
<text x="170" y="76" text-anchor="middle" font-size="10" style="fill:var(--soft)">w ≤ r always, so writing a[w] never destroys an unread element</text></svg></figure>
<div class="ex">
<div class="sub">The template</div>
<pre><code>int w = 0;                              // invariant: a[0..w) = kept elements of a[0..r), in order
for (int r = 0; r &lt; a.length; r++) {
    if (keep(a[r])) a[w++] = a[r];
}
return w;                               // new length</code></pre>
<div class="sub">Why it's safe</div>
<p>w only advances when r does, so <strong>w ≤ r</strong> at all times. Writing to a[w] overwrites either a[r] itself or a slot in the "garbage" zone, which was already read and either kept (copied left) or discarded. Nothing unread is ever lost.</p>
<div class="sub">Maintenance</div>
<p>If a[r] is kept, it's appended at w and w grows by one, so the kept prefix now covers a[0..r+1). If not kept, nothing changes, which is also correct for a[0..r+1).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why can <code>a[w++] = a[r]</code> never overwrite an element that hasn't been read yet?`, opts: ['w ≤ r always holds', 'w starts at the array end', 'Java copies the array first', 'It can, but only rarely'], a: 0, why: 'w increments only alongside r, so it never passes r. Slots before r have already been read.' },
        { type: 'num', q: `Remove all 2s from [0, 1, 2, 2, 3, 0, 4, 2] in place. Returned length w?`, a: 5, why: 'Kept: 0, 1, 3, 0, 4 → a[0..5).' },
        { type: 'free', q: `State the invariant of the read/write template and prove maintenance for both cases (keep and discard).`, model: `<p>Invariant: at the top of iteration r, a[0..w) holds exactly the kept elements of a[0..r), in original order. Keep case: a[r] is copied to a[w] and w increments, so a[0..w) now also ends with a[r]: the kept elements of a[0..r+1), in order. Discard case: nothing changes, and a[r] shouldn't appear, so a[0..w) is still correct for a[0..r+1).</p>`, rubric: ['Invariant ties a[0..w) to the kept elements of the processed a[0..r)', 'Keep case: append at w, w++, invariant extends to r+1', 'Discard case: unchanged, still correct for r+1'] },
        { type: 'mcq', q: `The relative order of kept elements after the loop is…`, opts: ['Preserved, same as in the input', 'Reversed from the input order', 'Sorted in increasing order', 'Arbitrary, it depends on the data'], a: 0, why: 'Kept elements are appended in the order the reader meets them: a stable filter.' }
      ]
    },
    {
      title: 'Dedup, remove, move zeros: choose the keep rule',
      teach: `
<p>Every problem in this family is the same loop. <strong>Only the keep condition changes</strong>, and it's usually phrased against the <em>output</em>, not the input.</p>
<div class="ex">
<div class="sub">Remove duplicates from sorted (keep one of each)</div>
<p>keep if <code>w == 0 || a[r] != a[w − 1]</code>: compare with the last <em>kept</em> value.</p>
<div class="sub">Keep at most two of each (sorted)</div>
<p>keep if <code>w &lt; 2 || a[r] != a[w − 2]</code>. If a[r] equals the element two back in the output, there are already two copies.</p>
<div class="sub">Move zeros to the end</div>
<p>keep non-zeros (template), then fill a[w..n) with 0. Or swap a[r] with a[w] to avoid the second pass.</p>
</div>
<p>Why compare against the output (a[w−1]) rather than the input neighbour (a[r−1])? Because a[r−1] may have been overwritten. And because the rule "no more than k copies <em>in the output</em>" is literally a statement about the output.</p>`,
      qs: [
        { type: 'num', q: `Sorted [0, 0, 1, 1, 1, 2, 2, 3, 3, 4], keep one of each. New length?`, a: 5, why: '0, 1, 2, 3, 4.' },
        { type: 'num', q: `Sorted [0, 0, 1, 1, 1, 1, 2, 3, 3], keep at most two of each. New length?`, a: 7, why: '0, 0, 1, 1, 2, 3, 3.' },
        { type: 'free', q: `For "at most two of each" in a sorted array, why is <code>a[r] != a[w − 2]</code> the right test? Why not compare with a[r − 2]?`, model: `<p>The condition is about the output: a[r] may be added unless the output already ends with two copies of it. Since the array is sorted, the output's last two are equal to a[r] exactly when a[w−2] == a[r]. a[r−2] is an input position that may already have been overwritten by earlier writes, so it no longer reflects the input, and besides, the rule is about what's been kept, not what was read.</p>`, rubric: ['The rule concerns copies already in the output', 'Sorted order means the last two kept values equal a[r] iff a[w−2] == a[r]', 'a[r−2] may be overwritten / describes input, not output'] },
        { type: 'mcq', q: `Move zeros with the swap version (<code>swap(a[r], a[w]); w++</code> when a[r] != 0). What is true of a[w..r) during the loop?`, opts: ['It contains only zeros', 'It holds only non-zeros', 'It is sorted increasingly', 'It is unchanged input'], a: 0, why: 'Invariant: a[0..w) are the non-zeros in order and a[w..r) are the zeros read so far. Each swap moves a zero to the end of that block.' }
      ]
    },
    {
      title: 'Merging two sorted sequences',
      teach: `
<p>Two readers, one per sorted input; one writer. Repeatedly take the smaller front. That's the merge step of merge sort (F12) and the shape of many "combine sorted lists" problems.</p>
<div class="ex">
<div class="sub">Merge Sorted Array (into nums1, which has room at the end)</div>
<p>Writing from the front would overwrite nums1 elements not yet read. <strong>Write from the back</strong> instead, placing the largest remaining element:</p>
<pre><code>int i = m - 1, j = n - 1, w = m + n - 1;
while (j &gt;= 0) {
    if (i &gt;= 0 &amp;&amp; nums1[i] &gt; nums2[j]) nums1[w--] = nums1[i--];
    else                               nums1[w--] = nums2[j--];
}</code></pre>
<div class="sub">Why writing from the back is safe</div>
<p>Invariant: w = i + j + 1 (the slots after w hold the largest m+n−1−w elements). Since j ≥ 0 inside the loop, w ≥ i + 1 &gt; i. The writer is always strictly ahead of the nums1 reader, so it never overwrites an unread nums1 value.</p>
<div class="sub">Why the loop runs while j ≥ 0</div>
<p>Once nums2 is exhausted, the remaining nums1 elements are already in their final places.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why merge nums2 into nums1 from the back rather than the front?`, opts: ['The front writes would clobber unread nums1', 'Backwards merging is always faster', 'nums2 must be read in reverse order', 'It keeps the merge stable'], a: 0, why: 'Free space is at the back. From the front, the writer would overtake nums1\'s reader.' },
        { type: 'free', q: `Prove that in back-to-front merge the writer w never overwrites an unread element of nums1.`, model: `<p>The number of elements placed so far is (m−1−i) + (n−1−j), and w = m+n−1 − placed = i + j + 1. While the loop runs, j ≥ 0, so w ≥ i + 1 &gt; i. Unread nums1 elements are at indices ≤ i, so the write to w always lands strictly past them.</p>`, rubric: ['Expresses w in terms of i and j (w = i + j + 1)', 'Uses j ≥ 0 inside the loop to get w &gt; i', 'Concludes writes land past all unread nums1 elements'] },
        { type: 'num', q: `Merging two sorted lists of lengths 4 and 6: maximum number of comparisons?`, a: 9, why: 'Each comparison places one element until one list empties: at most m + n − 1 = 9.' },
        { type: 'mcq', q: `Merging k sorted lists by repeatedly merging pairs left to right (list1+list2, then +list3, …), total n elements. Cost?`, opts: ['O(n·k): early elements recopied k times', 'O(n log k) like a balanced merge', 'O(n): each merge is linear', 'O(k²) regardless of n'], a: 0, why: 'The growing merged list is recopied each round. A heap or pairwise tournament gives O(n log k) (P10).' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Sort Colors: sort an array of 0s, 1s and 2s in one pass, in place. Use three pointers lo, mid, hi and state the invariant on the four regions.`, model: `<p>Invariant: a[0..lo) are 0s, a[lo..mid) are 1s, a[mid..hi] unread, a(hi..n) are 2s. Look at a[mid]: if 0, swap with a[lo], lo++, mid++ (the swapped-in value is a 1 or it's the same cell); if 1, mid++; if 2, swap with a[hi], hi−− (don't advance mid: the swapped-in value is unread). Stop when mid &gt; hi. Each step shrinks the unread region, so O(n).</p>`, rubric: ['States the four-region invariant (0s, 1s, unread, 2s)', 'Correct action for each of 0, 1, 2, including not advancing mid after swapping with hi', 'Termination/complexity: the unread region shrinks each step'] },
    { type: 'mcq', q: `Dutch-flag partition on [2, 0, 2, 1, 1, 0] produces…`, opts: ['[0, 0, 1, 1, 2, 2]', '[0, 1, 2, 0, 1, 2]', '[2, 2, 1, 1, 0, 0]', '[0, 0, 2, 1, 1, 2]'], a: 0, why: 'The three regions grow until the unread region vanishes.' },
    { type: 'num', q: `Remove all 3s from [3, 2, 2, 3]. Returned length?`, a: 2, why: 'Kept 2, 2.' },
    { type: 'mcq', q: `Which of these is NOT solvable with the single read/write pointer template?`, opts: ['Reverse the array in place', 'Remove every negative number', 'Keep at most 3 of each (sorted)', 'Compact out all null entries'], a: 0, why: 'Reversal needs converging pointers (swap ends). The others are stable filters.' },
    { type: 'free', q: `Why does the read/write template need O(1) extra space while "build a new list of kept elements" needs O(n)? And when is the new list the better choice anyway?`, model: `<p>The template reuses the input array: the kept prefix grows in the slots the reader has already passed (w ≤ r), so no extra storage is needed. Building a new list allocates up to n slots. The new list is better when the input must not be modified (callers still need it), or when the output shape differs from the input (e.g. a different type), so it's a mutation-vs-memory trade-off.</p>`, rubric: ['In-place works because written slots are already read (w ≤ r)', 'A new list costs O(n) extra', 'Names when a new list is preferable (input must stay intact, etc.)'] }
  ],
  practice: [
    { name: 'Remove Duplicates from Sorted Array', lc: 'LeetCode 26', prompt: `<p>Remove duplicates in place; return the new length.</p>`, hint: `<p>Compare the reader with the last element of the <em>output</em>.</p>`,
      solution: `<pre><code>public int removeDuplicates(int[] a) {
    int w = 0;
    for (int r = 0; r &lt; a.length; r++)
        if (w == 0 || a[r] != a[w - 1]) a[w++] = a[r];
    return w;
}</code></pre><p class="cx">O(n) · O(1). Invariant: a[0..w) is the deduped prefix of a[0..r).</p>` },
    { name: 'Move Zeroes', lc: 'LeetCode 283', prompt: `<p>Move all zeros to the end, keeping non-zero order.</p>`, hint: `<p>Swap each non-zero into position w.</p>`,
      solution: `<pre><code>public void moveZeroes(int[] a) {
    int w = 0;
    for (int r = 0; r &lt; a.length; r++) {
        if (a[r] != 0) { int t = a[w]; a[w] = a[r]; a[r] = t; w++; }
    }
}</code></pre><p class="cx">O(n). a[0..w) = non-zeros in order; a[w..r) = zeros.</p>` },
    { name: 'Merge Sorted Array', lc: 'LeetCode 88', prompt: `<p>Merge nums2 (length n) into nums1 (length m + n, first m valid).</p>`, hint: `<p>Where is the free space? Write the largest remaining element there.</p>`,
      solution: `<pre><code>public void merge(int[] nums1, int m, int[] nums2, int n) {
    int i = m - 1, j = n - 1, w = m + n - 1;
    while (j &gt;= 0) {
        if (i &gt;= 0 &amp;&amp; nums1[i] &gt; nums2[j]) nums1[w--] = nums1[i--];
        else nums1[w--] = nums2[j--];
    }
}</code></pre><p class="cx">O(m + n) · O(1). w = i + j + 1 &gt; i while j ≥ 0.</p>` },
    { name: 'Sort Colors', lc: 'LeetCode 75', prompt: `<p>Sort 0s, 1s, 2s in one pass, in place.</p>`, hint: `<p>Four regions: 0s, 1s, unread, 2s. After swapping with hi, don't advance mid.</p>`,
      solution: `<pre><code>public void sortColors(int[] a) {
    int lo = 0, mid = 0, hi = a.length - 1;
    while (mid &lt;= hi) {
        if (a[mid] == 0) { int t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
        else if (a[mid] == 1) mid++;
        else { int t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }
    }
}</code></pre><p class="cx">O(n) · O(1). The unread region [mid, hi] shrinks every step.</p>` }
  ]
});
