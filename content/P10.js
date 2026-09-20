COURSE.topic({
  id: 'P10',
  intro: `A heap answers exactly one question fast: <strong>"what's the smallest (or largest) thing right now?"</strong>, while things are being added and removed. It's a complete binary tree stored in an array (F16) with one ordering rule, so every operation walks a single root-to-leaf path: O(log n) (F02). The skill here is recognising <em>which</em> heap to keep and <em>what</em> it holds, e.g. why the largest K uses a <em>min</em>-heap.`,
  kps: [
    {
      title: 'Heap property and sift up / sift down',
      teach: `
<p><strong>Min-heap property:</strong> every parent ≤ its children. So the root is the minimum. Nothing is said about siblings or left vs right: a heap is only <em>partly</em> sorted, and that's why it's cheap to maintain.</p>
<div class="ex">
<div class="sub">Insert (offer): add at the end, sift up</div>
<p>Put the new value in the next free array slot (keeps the tree complete), then swap it with its parent while it's smaller. Heap [1, 3, 5, 7, 9, 8] + 2: 2 goes to index 6, parent index 2 (5) is bigger, swap; parent index 0 (1) is smaller, stop. Result [1, 3, 2, 7, 9, 8, 5]. One swap.</p>
<div class="sub">Remove min (poll): move last to root, sift down</div>
<p>Take the root, move the last element to the root, then swap it with its <em>smaller</em> child while it's bigger than that child.</p>
<div class="sub">Why O(log n)</div>
<p>Each swap moves one level along one root-to-leaf path, and a complete tree has log₂ n levels (F16).</p>
<div class="sub">Why the smaller child when sifting down?</div>
<p>Promoting the smaller child keeps it ≤ its new sibling. Promoting the larger would put a bigger value above a smaller one.</p>
</div>
<p>Java: <code>PriorityQueue</code> is a min-heap; <code>new PriorityQueue&lt;&gt;(Comparator.reverseOrder())</code> is a max-heap. <code>peek</code> O(1), <code>offer</code>/<code>poll</code> O(log n), <code>remove(Object)</code> O(n).</p>`,
      qs: [
        { type: 'num', q: `Min-heap [1, 3, 5, 7, 9, 8]. Insert 0. How many swaps during sift-up?`, a: 2, why: '0 at index 6 swaps with 5 (index 2), then with 1 (index 0): [0, 3, 1, 7, 9, 8, 5].' },
        { type: 'mcq', q: `In sift-down, why swap with the <em>smaller</em> child?`, opts: ['So the new parent is ≤ both children', 'Because it is always the left child', 'To keep the tree complete', 'To make the heap fully sorted'], a: 0, why: 'The promoted child becomes the parent of its sibling; only the smaller one satisfies parent ≤ child.' },
        { type: 'mcq', q: `Which is true of a min-heap array?`, opts: ['a[0] is the minimum', 'The array is sorted', 'a[n−1] is the maximum', 'Siblings are sorted left ≤ right'], a: 0, why: 'Only the parent ≤ child relation is guaranteed. The maximum is somewhere among the leaves.' },
        { type: 'free', q: `Why is a heap a better fit than a sorted array for a stream where you repeatedly insert and remove the minimum?`, model: `<p>A sorted array gives the minimum in O(1), but each insert must shift elements: O(n). A heap keeps only the partial order parent ≤ child, which is enough to find the minimum at the root; insert and remove each fix one root-to-leaf path in O(log n). Over n operations: O(n log n) for the heap vs O(n²) for the sorted array.</p>`, rubric: ['Sorted array insert costs O(n) (shifting)', 'Heap maintains only a partial order; insert/remove O(log n)', 'Compares totals over n operations'] }
      ]
    },
    {
      title: 'Top-K: why the largest K uses a size-K min-heap',
      teach: `
<p>Find the k-th largest of n numbers. Sorting is O(n log n). Better: keep a <strong>min-heap of size k</strong> holding the k largest seen so far.</p>
<pre><code>PriorityQueue&lt;Integer&gt; heap = new PriorityQueue&lt;&gt;();   // min-heap
for (int x : nums) {
    heap.offer(x);
    if (heap.size() &gt; k) heap.poll();                  // evict the smallest of the k+1
}
return heap.peek();                                    // k-th largest</code></pre>
<div class="ex">
<div class="sub">Why a MIN-heap for the LARGEST k?</div>
<p>The heap is a club of the k best so far. The question for each newcomer is "is it better than the <em>weakest member</em>?" The weakest of the top k is the minimum, so the min-heap puts the bouncer's comparison at the root, O(1) to see and O(log k) to evict.</p>
<div class="sub">Invariant</div>
<p>After processing a prefix, the heap holds exactly its k largest values. Evicting the minimum of k+1 keeps the k largest.</p>
<div class="sub">Cost</div>
<p><strong>O(n log k)</strong> time, O(k) space. When k ≪ n that's much better than sorting, and it works on a stream you can't store.</p>
</div>`,
      qs: [
        { type: 'num', q: `2nd largest of [3, 2, 1, 5, 6, 4]?`, a: 5, why: 'Sorted descending: 6, 5, …' },
        { type: 'mcq', q: `For the k SMALLEST elements of a stream, keep…`, opts: ['A max-heap of size k', 'A min-heap of size k', 'A min-heap of all n items', 'A sorted list of size n'], a: 0, why: 'The bouncer compares against the largest of the current k smallest, so a max-heap.' },
        { type: 'free', q: `Explain the invariant of the size-k min-heap top-K algorithm and why evicting the minimum preserves it.`, model: `<p>Invariant: after processing a prefix, the heap contains exactly the k largest values of that prefix. Adding a new value x gives k+1 candidates, which include the k largest of the longer prefix (any value outside the heap was already beaten by k values). The smallest of those k+1 can't be among the k largest, so polling it leaves exactly the k largest.</p>`, rubric: ['Invariant: heap = k largest of the processed prefix', 'After adding x, the k+1 candidates contain the new top k', 'Removing the minimum of the k+1 leaves exactly the top k'] },
        { type: 'num', q: `n = 10⁶, k = 10. Roughly how many heap-level operations for the size-k heap (n · log₂ k), in millions? (log₂ 10 ≈ 3.3)`, a: 3.3, tol: 0.4, why: '10⁶ × 3.3 ≈ 3.3 × 10⁶, versus about 2 × 10⁷ to sort.' }
      ]
    },
    {
      title: 'Merge K sorted lists',
      teach: `
<p>k sorted lists, n elements in total. The next output element is the smallest among the k current <strong>fronts</strong>, which is a "minimum of a changing set": a heap of size k.</p>
<pre><code>PriorityQueue&lt;ListNode&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a.val, b.val));
for (ListNode l : lists) if (l != null) pq.offer(l);
ListNode dummy = new ListNode(0), tail = dummy;
while (!pq.isEmpty()) {
    ListNode min = pq.poll();
    tail.next = min; tail = min;
    if (min.next != null) pq.offer(min.next);   // its list's next front
}
return dummy.next;</code></pre>
<div class="ex">
<div class="sub">Invariant</div>
<p>The heap holds the current front of every non-exhausted list. The global minimum remaining is one of those fronts, because each list is sorted (the same argument as the two-list merge in F12).</p>
<div class="sub">Cost</div>
<p>Each of the n elements is offered and polled once, at O(log k) each: <strong>O(n log k)</strong>. Merging lists one by one would be O(n·k) (P03).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Merge k sorted lists with a heap: complexity for n total elements?`, opts: ['O(n log k)', 'O(n log n)', 'O(n · k)', 'O(k log n)'], a: 0, why: 'n polls and offers on a heap of size ≤ k.' },
        { type: 'free', q: `Why is it enough for the heap to hold only the front of each list, rather than all n elements?`, model: `<p>Each list is sorted, so its smallest remaining element is its front. The overall smallest remaining element is the smallest of the per-list minimums, which are exactly the fronts. When a front is output, the next element of that list becomes its new front and is added. So the heap always contains every candidate for "next smallest", with size ≤ k.</p>`, rubric: ['Each list\'s minimum remaining is its front (sortedness)', 'The global minimum is the min of the fronts', 'Replacing a used front with its successor keeps all candidates in a size-k heap'] },
        { type: 'mcq', q: `The comparator <code>(a, b) -&gt; a.val - b.val</code> can be wrong. Why?`, opts: ['Subtraction can overflow for extremes', 'Lambdas cannot compare two nodes', 'It sorts in descending order', 'PriorityQueue ignores comparators'], a: 0, why: 'E.g. a.val = 2³¹−1, b.val = −1 overflows. Integer.compare is safe.' },
        { type: 'num', q: `k = 4 lists, n = 1000 elements total. How many poll operations in total?`, a: 1000, why: 'Each element is polled exactly once.' }
      ]
    },
    {
      title: 'Two heaps for a running median',
      teach: `
<p>Numbers arrive one by one; report the median after each. Keep the numbers split into two halves:</p>
<div class="ex">
<div class="sub">The picture</div>
<p>A <strong>max-heap "low"</strong> holds the smaller half (its top is the largest small number). A <strong>min-heap "high"</strong> holds the larger half (its top is the smallest large number). The median sits at the tops, where the halves meet.</p>
<div class="sub">Invariants</div>
<p>(1) every element of low ≤ every element of high; (2) sizes differ by at most 1 (say low may have one extra).</p>
<pre><code>void add(int x) {
    low.offer(x);                          // put it in low…
    high.offer(low.poll());                // …then move low's largest to high: keeps (1)
    if (high.size() &gt; low.size()) low.offer(high.poll());   // rebalance: keeps (2)
}
double median() {
    return low.size() &gt; high.size() ? low.peek() : (low.peek() + high.peek()) / 2.0;
}</code></pre>
<div class="sub">Cost</div>
<p>O(log n) per add, O(1) per median. Sorting after every insert would be O(n) per add at best.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In the two-heap median, the lower half is stored in a…`, opts: ['Max-heap, to expose its largest', 'Min-heap, to expose its smallest', 'Sorted array, for binary search', 'Hash set, for O(1) lookups'], a: 0, why: 'The median needs the largest of the small half: a max-heap top.' },
        { type: 'num', q: `Stream 5, 15, 1, 3. Median after all four?`, a: 4, why: 'Sorted 1, 3, 5, 15: (3 + 5) / 2 = 4.' },
        { type: 'free', q: `Why does <code>add</code> push x into low and immediately move low's maximum to high, instead of comparing x with the tops?`, model: `<p>It handles every case the same way. Let m be the maximum of low ∪ {x}; that's what moves to high. If x stays in low, then x ≤ m = old max of low ≤ every element of high, so order holds. If x is larger than the old low max, then m = x itself moves to high, and everything left in low is ≤ x. Either way every low element ≤ every high element. The rebalance then moves high's minimum to low, which is ≥ all of low and ≤ all remaining high, so order still holds. Two O(log n) moves, no case analysis.</p>`, rubric: ['The element moved to high is the max of low ∪ {x}, so low ≤ high still holds in both cases', 'Rebalancing moves high\'s minimum, which also preserves order', 'Avoids case analysis; each step O(log n)'] },
        { type: 'num', q: `Stream 5, 15, 1. Median after these three?`, a: 5, why: 'Sorted 1, 5, 15: the middle is 5.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "K closest points to the origin" among n points. Give a heap solution, say which heap and why, and the complexity.`, model: `<p>Keep a <em>max</em>-heap of size k keyed by squared distance x² + y² (no square root needed). For each point, offer it; if the size exceeds k, poll the farthest. The heap holds the k closest so far, and the root is the weakest (farthest) member for the next comparison. O(n log k) time, O(k) space.</p>`, rubric: ['Max-heap of size k by distance (the weakest member at the root)', 'Evict when size &gt; k', 'O(n log k); squared distances avoid sqrt'] },
    { type: 'num', q: `4th largest of [3, 2, 3, 1, 2, 4, 5, 5, 6]?`, a: 4, why: 'Descending: 6, 5, 5, 4, … Duplicates count.' },
    { type: 'mcq', q: `Top K frequent elements: count with a HashMap, then…`, opts: ['Size-k min-heap on counts', 'Size-k max-heap on counts', 'Sort all values by value', 'Binary search on the counts'], a: 0, why: 'We want the k LARGEST counts, so evict the smallest count: a min-heap. (Bucket sort by count gives O(n) too.)' },
    { type: 'mcq', q: `Building a heap from an unsorted array of n items by bottom-up heapify costs…`, opts: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], a: 0, why: 'Most nodes are near the bottom and sift down only a little: the sum over levels is a geometric-style series, which is linear. n separate offers cost O(n log n).' },
    { type: 'free', q: `Discriminate: a problem asks for "the k-th largest element" once, on an array you can modify. Compare the size-k heap with quickselect.`, model: `<p>Heap: O(n log k) time, O(k) extra space, works on streams, and its worst case is guaranteed. Quickselect: O(n) average (the halving-series argument, F03) but O(n²) worst case (bad pivots, fixable with random pivots), in place with O(1) extra, and it needs all the data in memory. For a one-off query on an in-memory array, quickselect is faster on average; for streams or when a guaranteed bound matters, use the heap.</p>`, rubric: ['Heap: O(n log k), O(k) space, stream-friendly, guaranteed', 'Quickselect: O(n) average, O(n²) worst, in place, needs all the data', 'Chooses based on streaming / guarantees'] }
  ],
  practice: [
    { name: 'Kth Largest Element in an Array', lc: 'LeetCode 215', prompt: `<p>Return the k-th largest element.</p>`, hint: `<p>Size-k min-heap; evict the smallest.</p>`,
      solution: `<pre><code>public int findKthLargest(int[] nums, int k) {
    PriorityQueue&lt;Integer&gt; heap = new PriorityQueue&lt;&gt;();
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() &gt; k) heap.poll();
    }
    return heap.peek();
}</code></pre><p class="cx">O(n log k) · O(k).</p>` },
    { name: 'Top K Frequent Elements', lc: 'LeetCode 347', prompt: `<p>The k most frequent values.</p>`, hint: `<p>Count, then a size-k min-heap keyed by count.</p>`,
      solution: `<pre><code>public int[] topKFrequent(int[] nums, int k) {
    Map&lt;Integer, Integer&gt; cnt = new HashMap&lt;&gt;();
    for (int x : nums) cnt.merge(x, 1, Integer::sum);
    PriorityQueue&lt;Map.Entry&lt;Integer, Integer&gt;&gt; heap =
        new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a.getValue(), b.getValue()));
    for (Map.Entry&lt;Integer, Integer&gt; e : cnt.entrySet()) {
        heap.offer(e);
        if (heap.size() &gt; k) heap.poll();
    }
    int[] res = new int[k];
    for (int i = k - 1; i &gt;= 0; i--) res[i] = heap.poll().getKey();
    return res;
}</code></pre><p class="cx">O(n + m log k) for m distinct values.</p>` },
    { name: 'Merge k Sorted Lists', lc: 'LeetCode 23', prompt: `<p>Merge k sorted linked lists.</p>`, hint: `<p>Heap of current fronts.</p>`,
      solution: `<pre><code>public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue&lt;ListNode&gt; pq = new PriorityQueue&lt;&gt;((a, b) -&gt; Integer.compare(a.val, b.val));
    for (ListNode l : lists) if (l != null) pq.offer(l);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!pq.isEmpty()) {
        ListNode m = pq.poll();
        tail.next = m; tail = m;
        if (m.next != null) pq.offer(m.next);
    }
    return dummy.next;
}</code></pre><p class="cx">O(n log k).</p>` },
    { name: 'Find Median from Data Stream', lc: 'LeetCode 295', prompt: `<p>Support addNum and findMedian.</p>`, hint: `<p>Max-heap for the low half, min-heap for the high half.</p>`,
      solution: `<pre><code>class MedianFinder {
    private final PriorityQueue&lt;Integer&gt; low = new PriorityQueue&lt;&gt;(Comparator.reverseOrder());
    private final PriorityQueue&lt;Integer&gt; high = new PriorityQueue&lt;&gt;();
    public void addNum(int x) {
        low.offer(x);
        high.offer(low.poll());
        if (high.size() &gt; low.size()) low.offer(high.poll());
    }
    public double findMedian() {
        return low.size() &gt; high.size() ? low.peek() : (low.peek() + (long) high.peek()) / 2.0;
    }
}</code></pre><p class="cx">O(log n) add, O(1) median. The long cast avoids overflow in the sum.</p>` }
  ]
});
