COURSE.topic({
  id: 'P08',
  intro: `Linked-list problems are rarely hard algorithmically. They're hard because one wrong assignment order orphans half the list. The way through isn't memorising code: <strong>draw boxes and arrows, and rewire one arrow at a time</strong>, checking nothing becomes unreachable. This topic builds on F10 (what a node is) and P03 (same-direction pointers). Floyd's cycle detection is the one place with a genuine proof, and you'll do it.`,
  kps: [
    {
      title: 'The dummy head: one node that removes edge cases',
      teach: `
<p>Deleting or inserting at the head is a special case: there's no "previous" node to rewire. A <strong>dummy</strong> (sentinel) node placed before the head makes every real node have a predecessor.</p>
<div class="ex">
<div class="sub">Worked example: remove all nodes with value v</div>
<pre><code>ListNode dummy = new ListNode(0, head);
ListNode prev = dummy;
while (prev.next != null) {
    if (prev.next.val == v) prev.next = prev.next.next;   // unlink, stay put
    else prev = prev.next;                                // advance only when keeping
}
return dummy.next;                                        // the (possibly new) head</code></pre>
<div class="sub">Why it works</div>
<p>Invariant: every node up to and including prev is final (kept, correctly linked). The head is handled like any other node because dummy stands in as its predecessor.</p>
<div class="sub">Why "stay put" after unlinking?</div>
<p>The new prev.next hasn't been examined yet: it might also need removing (e.g. consecutive v's).</p>
</div>
<p>Rule of thumb: <strong>if the head can change, use a dummy</strong>, and return <code>dummy.next</code>, never the old head.</p>`,
      qs: [
        { type: 'mcq', q: `After removing values with a dummy node, what should you return?`, opts: ['dummy.next', 'head (original)', 'dummy itself', 'prev.next'], a: 0, why: 'The original head may have been removed; dummy.next is always the current first node.' },
        { type: 'mcq', q: `In the removal loop, why not advance prev right after unlinking?`, opts: ['The new prev.next is unexamined', 'prev would become null', 'It would skip the dummy node', 'Java forbids two writes per line'], a: 0, why: 'With 7→7→7, advancing after one unlink would keep the second 7.' },
        { type: 'free', q: `Without a dummy node, what special case appears in "remove all nodes equal to v", and how does the dummy eliminate it?`, model: `<p>Without a dummy, removing the head can't be done by rewiring a predecessor's next, because the head has none. You need a separate loop that advances head while head.val == v, then the general loop. The dummy gives the head a predecessor, so the head is removed exactly like any other node and one loop handles everything. You return dummy.next.</p>`, rubric: ['Head has no predecessor, so it needs a special case', 'Dummy gives every real node a predecessor', 'Single uniform loop; return dummy.next'] },
        { type: 'num', q: `List 7 → 7 → 1 → 7 → 2, remove all 7s. Length of the result?`, a: 2, why: '1 → 2.' }
      ]
    },
    {
      title: 'In-place reversal: three pointers, and the order of assignments',
      teach: `
<pre><code>ListNode prev = null, cur = head;
while (cur != null) {
    ListNode next = cur.next;   // 1. save the rest of the list BEFORE breaking the link
    cur.next = prev;            // 2. reverse this one arrow
    prev = cur;                 // 3. advance prev
    cur = next;                 // 4. advance cur using the saved pointer
}
return prev;                    // new head</code></pre>
<div class="ex">
<div class="sub">The picture</div>
<pre><code>before step:  null ← 1 ← 2    3 → 4 → null
                         prev  cur
after step:   null ← 1 ← 2 ← 3    4 → null
                              prev cur</code></pre>
<div class="sub">Invariant</div>
<p>prev is the head of the already-reversed part; cur is the head of the untouched part. Each iteration moves one node from the second to the first.</p>
<div class="sub">Why the order matters</div>
<p>If you do step 2 before step 1, <code>cur.next</code> now points backwards and the rest of the list (3 → 4 …) is unreachable, lost for good.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `What goes wrong if you write <code>cur.next = prev;</code> before saving <code>next = cur.next</code>?`, opts: ['The rest of the list becomes unreachable', 'The list is reversed twice over', 'prev becomes null permanently', 'Nothing; the order is irrelevant'], a: 0, why: 'The only pointer to the remainder was cur.next, and you just overwrote it.' },
        { type: 'mcq', q: `When the loop ends, which pointer is the new head?`, opts: ['prev', 'cur', 'head', 'next'], a: 0, why: 'cur is null (walked off the end); prev is the last node processed, now first.' },
        { type: 'free', q: `State the loop invariant for iterative reversal and show it gives the right answer at termination.`, model: `<p>Invariant: at the top of each iteration, prev heads a correctly reversed list of all nodes already processed, and cur heads the original, untouched remainder. Each iteration moves the node cur from the remainder to the front of the reversed part. At termination cur == null, so the remainder is empty and prev heads the reversal of the whole list.</p>`, rubric: ['Invariant describes two lists: reversed prefix (prev) and untouched remainder (cur)', 'Each iteration moves one node across', 'At cur == null, prev heads the fully reversed list'] },
        { type: 'mcq', q: `Recursive reversal of a list of 10⁵ nodes in Java is risky because…`, opts: ['Recursion depth 10⁵ can overflow the stack', 'Recursion cannot rewire pointers', 'It is O(n²) time recursively', 'The GC frees nodes mid-recursion'], a: 0, why: 'Depth equals list length (F05). The iterative version uses O(1) space.' }
      ]
    },
    {
      title: 'Floyd\'s cycle detection: why fast catches slow',
      teach: `
<p>slow moves 1 step, fast moves 2. If there's no cycle, fast hits null. If there is one, <strong>they meet</strong>. Why?</p>
<div class="ex">
<div class="sub">Subgoal 1: once both are in the cycle</div>
<p>Look at how far fast is <em>behind</em> slow, measured forward along the cycle from fast to slow. Each step fast gains exactly 1 on slow (2 − 1), so that distance shrinks by 1 per step. It can't jump over 0: it goes k, k−1, …, 1, 0. They meet within one lap.</p>
<div class="sub">Subgoal 2: finding where the cycle starts</div>
<p>Let the tail (head to cycle entry) have length a, and let them meet b steps into the cycle. slow walked a + b; fast walked 2(a + b), which is a + b plus some whole laps: a + b = kL. So <strong>a = kL − b</strong>: walking a steps from the meeting point lands exactly on the entry. Restart one pointer at head, move both 1 step at a time, and they meet at the cycle entry.</p>
<div class="sub">Worked numbers</div>
<p>Tail 3, cycle 5 (nodes 0..7, entry node 3). They meet at node 5 after 5 steps; then 3 more single steps bring both pointers to node 3.</p>
</div>
<p>O(n) time, <strong>O(1) space</strong>. That's the point: a HashSet of visited nodes also works, but costs O(n) memory.</p>`,
      qs: [
        { type: 'free', q: `Prove that once slow and fast are both inside the cycle, they must meet (fast can't skip over slow).`, model: `<p>Measure the distance d that fast must travel forward along the cycle to reach slow (0 ≤ d &lt; L). Each step slow advances 1 and fast advances 2, so d decreases by exactly 1. Decreasing by 1 at a time from d, it must hit 0 after d steps, which means they're on the same node. It can't skip 0 because each change is exactly −1.</p>`, rubric: ['Defines the gap fast must close to reach slow, along the cycle', 'Gap shrinks by exactly 1 per step (relative speed 1)', 'A gap decreasing by 1 must hit 0, so they meet (no skipping)'] },
        { type: 'num', q: `Tail length 3, cycle length 5. How many steps until slow and fast first meet?`, a: 5, why: 'Simulated: they meet at node 5 after 5 steps.' },
        { type: 'mcq', q: `Why does restarting one pointer at head and moving both by 1 find the cycle entry?`, opts: ['a ≡ distance from meeting point to entry', 'Both then move at the same speed forever', 'The head is always on the cycle', 'Slow always meets at the entry'], a: 0, why: 'From a + b = kL, the tail length a equals kL − b: exactly the walk from the meeting point to the entry (plus whole laps).' },
        { type: 'mcq', q: `fast moves 3 steps per turn instead of 2. Is meeting still guaranteed?`, opts: ['No: the gap drops by 2, may skip 0', 'Yes: faster always catches up', 'Yes: it just meets sooner', 'No: fast leaves the cycle'], a: 0, why: 'With relative speed 2, an odd gap in an even-length cycle alternates parity and can jump past 0 forever. Speed 2 (relative 1) is what makes the proof work.' }
      ]
    },
    {
      title: 'Middle and k-th from the end: gaps between pointers',
      teach: `
<p>Two pointers with a <strong>fixed relationship</strong> answer position questions in one pass without knowing the length.</p>
<div class="ex">
<div class="sub">Middle: speed 2 vs speed 1</div>
<pre><code>ListNode slow = head, fast = head;
while (fast != null &amp;&amp; fast.next != null) { slow = slow.next; fast = fast.next.next; }
// slow is the middle (the SECOND middle for even length)</code></pre>
<p>When fast has walked the whole list, slow has walked half of it. For 1→2→3→4→5 slow stops at 3; for 1→…→6 at 4.</p>
<div class="sub">k-th from end: a fixed gap of k</div>
<p>Move fast k steps ahead, then move both until fast reaches the end. The gap stays k, so slow ends k from the end. To <em>remove</em> it, start both at a dummy and stop when fast.next == null, so slow sits just before the target.</p>
</div>
<p>Both are invariants on the relationship between the two pointers: "fast has moved twice as far" or "fast is exactly k ahead".</p>`,
      qs: [
        { type: 'num', q: `List 1 → 2 → 3 → 4 → 5 → 6. With the loop above, what value does slow stop at?`, a: 4, why: 'Index n/2 = 3 (0-based): the second middle, value 4.' },
        { type: 'mcq', q: `To get the FIRST middle for even lengths, change the loop condition to…`, opts: ['fast.next != null &amp;&amp; fast.next.next != null', 'fast != null &amp;&amp; fast.next.next != null', 'slow != null &amp;&amp; fast.next != null', 'fast != null &amp;&amp; slow.next != null'], a: 0, why: 'Stopping one step earlier leaves slow at index (n−1)/2. The second option dereferences fast.next.next even when fast.next is null, so it crashes.' },
        { type: 'free', q: `Remove the n-th node from the end in one pass. Explain why starting both pointers at a dummy and advancing fast n steps first makes slow land on the node <em>before</em> the target.`, model: `<p>Advance fast n steps from dummy, then move both until fast.next == null (fast on the last node). The gap between slow and fast stays n. When fast is the last node, the node n from the end is n − 1 steps before fast, so slow (n steps before fast) is exactly one before it. Then slow.next = slow.next.next unlinks it. Starting at dummy handles removing the head.</p>`, rubric: ['Fixed gap of n between slow and fast', 'Stopping with fast on the last node puts slow just before the target', 'Dummy start handles the case where the head is removed'] },
        { type: 'num', q: `Remove the 2nd node from the end of 1 → 2 → 3 → 4 → 5. Which value is removed?`, a: 4, why: 'From the end: 5 is 1st, 4 is 2nd. Result 1 → 2 → 3 → 5.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Palindrome linked list in O(n) time and O(1) extra space. Combine techniques from this topic and explain each step.`, model: `<p>(1) Find the middle with slow/fast pointers. (2) Reverse the second half in place (three-pointer reversal). (3) Walk from the head and from the reversed half's head together, comparing values. Any mismatch means not a palindrome. (4) Optionally reverse the second half back to restore the list. Each step is O(n) and uses O(1) extra pointers.</p>`, rubric: ['Middle via slow/fast', 'Reverse the second half in place', 'Compare the two halves node by node', 'O(n) time, O(1) space (mentions optional restore)'] },
    { type: 'mcq', q: `Merging two sorted lists with a dummy node: what does the dummy avoid?`, opts: ['Special-casing which list gives the head', 'Needing to compare node values', 'Recursion on long lists', 'Allocating any new nodes'], a: 0, why: 'You append to tail.next from the start; the real head is dummy.next.' },
    { type: 'num', q: `Floyd on a list with tail length 2 and cycle length 4: steps from the meeting point to the cycle entry, moving one pointer from head in lockstep?`, a: 2, why: 'It equals the tail length a = 2 (simulated: meet after 4 steps, then 2 more to the entry).' },
    { type: 'mcq', q: `Detecting a cycle with a HashSet of visited nodes vs Floyd. Trade-off?`, opts: ['Both O(n) time; HashSet O(n) space', 'HashSet is O(n²) time', 'Floyd needs the list length first', 'Floyd fails on very short cycles'], a: 0, why: 'Same time, but Floyd needs only two pointers.' },
    { type: 'free', q: `A candidate reverses a list with <code>while (cur != null) { cur.next = prev; prev = cur; cur = cur.next; }</code>. Trace what happens on 1 → 2 → 3 and fix it.`, model: `<p>First iteration: cur = 1, 1.next = null (prev), prev = 1, cur = 1.next = null. The loop ends after one node and returns 1 alone: 2 → 3 is lost because cur.next was overwritten before being used to advance. Fix: save next first: <code>ListNode next = cur.next; cur.next = prev; prev = cur; cur = next;</code></p>`, rubric: ['Traces that cur.next is overwritten before advancing', 'The loop stops after one node and the rest is lost', 'Fix: save next before rewiring'] }
  ],
  practice: [
    { name: 'Reverse Linked List', lc: 'LeetCode 206', prompt: `<p>Reverse a singly linked list.</p>`, hint: `<p>Save next, rewire, advance both.</p>`,
      solution: `<pre><code>public ListNode reverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}</code></pre><p class="cx">O(n) · O(1).</p>` },
    { name: 'Merge Two Sorted Lists', lc: 'LeetCode 21', prompt: `<p>Merge two sorted lists into one sorted list.</p>`, hint: `<p>Dummy head plus a tail pointer; attach the smaller front each time.</p>`,
      solution: `<pre><code>public ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null &amp;&amp; b != null) {
        if (a.val &lt;= b.val) { tail.next = a; a = a.next; }
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}</code></pre><p class="cx">O(m + n) · O(1). Relinks existing nodes.</p>` },
    { name: 'Linked List Cycle II', lc: 'LeetCode 142', prompt: `<p>Return the node where the cycle begins, or null.</p>`, hint: `<p>Meet with slow/fast; then walk one pointer from head in lockstep.</p>`,
      solution: `<pre><code>public ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null &amp;&amp; fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) {
            ListNode p = head;
            while (p != slow) { p = p.next; slow = slow.next; }
            return p;
        }
    }
    return null;
}</code></pre><p class="cx">O(n) · O(1). Tail length a ≡ meeting-point-to-entry distance (mod L).</p>` },
    { name: 'Remove Nth Node From End', lc: 'LeetCode 19', prompt: `<p>Remove the n-th node from the end in one pass.</p>`, hint: `<p>Dummy start, gap of n, stop when fast.next is null.</p>`,
      solution: `<pre><code>public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head), slow = dummy, fast = dummy;
    for (int i = 0; i &lt; n; i++) fast = fast.next;
    while (fast.next != null) { slow = slow.next; fast = fast.next; }
    slow.next = slow.next.next;
    return dummy.next;
}</code></pre><p class="cx">O(L) · O(1).</p>` }
  ]
});
