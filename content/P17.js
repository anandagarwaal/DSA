COURSE.topic({
  id: 'P17',
  intro: `Interval problems almost always start with a sort, and <strong>which key you sort by decides the algorithm</strong>: by start to merge overlaps, by end to schedule the most meetings. Greedy algorithms like these are short, fast, and wrong surprisingly often, so this topic is really about the <em>exchange argument</em>: the proof that taking the locally best option costs you nothing. That proof is what separates "I remember the rule" from "I can defend it" (P16 covered what to do when no such proof exists).`,
  kps: [
    {
      title: 'Sort by start to merge; sort by end to schedule',
      teach: `
<div class="ex">
<div class="sub">Merge overlapping intervals: sort by START</div>
<pre><code>Arrays.sort(iv, (a, b) -&gt; Integer.compare(a[0], b[0]));
List&lt;int[]&gt; out = new ArrayList&lt;&gt;();
for (int[] cur : iv) {
    int[] last = out.isEmpty() ? null : out.get(out.size() - 1);
    if (last != null &amp;&amp; cur[0] &lt;= last[1]) last[1] = Math.max(last[1], cur[1]);  // overlap
    else out.add(new int[]{cur[0], cur[1]});
}</code></pre>
<p>Sorting by start means anything that could overlap the current group starts next, so one pass suffices. Note <code>Math.max</code>: the new interval may be entirely inside the last one.</p>
<div class="sub">Maximum non-overlapping intervals: sort by END</div>
<p>Take the interval that finishes earliest, skip everything that clashes with it, repeat. Earliest end leaves the most room for what follows.</p>
<div class="sub">Why the keys differ</div>
<p>Merging cares about <em>adjacency in time</em>: the next candidate to touch a group is the next one to start. Scheduling cares about <em>how much room is left</em>: that's decided by the end.</p>
</div>`,
      qs: [
        { type: 'num', q: `Merging [[1,3],[2,6],[8,10],[15,18]]: how many intervals remain?`, a: 3, why: '[1,6], [8,10], [15,18].' },
        { type: 'mcq', q: `Why <code>last[1] = Math.max(last[1], cur[1])</code> rather than <code>= cur[1]</code>?`, opts: ['cur may lie entirely inside last', 'Ends are not sorted by the key', 'It avoids integer overflow', 'cur[1] could be negative'], a: 0, why: 'e.g. [1, 10] then [2, 3]: overwriting would shrink the merged interval to end at 3.' },
        { type: 'mcq', q: `"Maximum number of meetings in one room." Sort by…`, opts: ['End time, earliest first', 'Start time, earliest first', 'Duration, shortest first', 'Start time, latest first'], a: 0, why: 'Earliest finishing leaves the most remaining time (proof in the next step).' },
        { type: 'free', q: `Why does merging need the intervals sorted by start? What breaks if they aren't sorted at all?`, model: `<p>Sorting by start guarantees that when you process an interval, every interval that could extend the current group has either already been processed or starts later; nothing earlier can appear afterwards. Unsorted, an interval arriving late could overlap a group you already closed, so a single pass would emit overlapping outputs; you'd need to re-scan or merge repeatedly.</p>`, rubric: ['Sorting by start means all potential overlaps arrive contiguously', 'One pass suffices because no earlier-starting interval can appear later', 'Unsorted input would leave overlapping groups in the output'] }
      ]
    },
    {
      title: 'The exchange argument',
      teach: `
<p>The standard proof for a greedy rule: <strong>take any optimal solution, swap its first choice for the greedy choice, and show it's no worse.</strong> Repeating the swap turns some optimal solution into the greedy one, so greedy is optimal too.</p>
<div class="ex">
<div class="sub">Interval scheduling, in full</div>
<p>Greedy picks g, the interval with the earliest end. Let OPT be any optimal set, ordered by end time, with first interval f.</p>
<p>If f = g, done. Otherwise end(g) ≤ end(f) (g ends earliest of all). Replace f with g in OPT: the rest of OPT starts after end(f) ≥ end(g), so nothing clashes with g, and the size is unchanged. So OPT′ = OPT − f + g is also optimal and begins with the greedy choice.</p>
<p>Now recurse on the intervals starting after end(g). By induction, greedy's remaining choices are optimal for that subproblem, so greedy's total is optimal.</p>
<div class="sub">The template</div>
<p>(1) Assume an optimal solution differing from greedy at the first choice. (2) Swap in the greedy choice. (3) Show the swap keeps it valid and no worse. (4) Induct on the rest.</p>
</div>
<p>If step 3 fails, the greedy rule is wrong, and the failure usually hands you the counterexample directly.</p>`,
      qs: [
        { type: 'free', q: `Give the exchange argument for "earliest end time" interval scheduling, in your own words.`, model: `<p>Let g be the interval ending earliest and OPT an optimal set sorted by end time, with first element f. Since g ends no later than f, swapping f for g leaves every other interval in OPT still compatible (they all start after end(f) ≥ end(g)), and the count is the same, so the swapped set is still optimal. Hence there's an optimal solution containing the greedy choice. Remove all intervals clashing with g and repeat the argument on the rest; by induction greedy is optimal overall.</p>`, rubric: ['Takes an optimal solution whose first choice f differs from greedy g', 'Swaps f for g: valid because end(g) ≤ end(f), and the count is unchanged', 'Induct on the remaining subproblem'] },
        { type: 'mcq', q: `The exchange argument shows that…`, opts: ['Some optimal solution starts with the greedy choice', 'The greedy solution is the only optimal one', 'Every optimal solution equals the greedy one', 'Greedy is optimal for all interval problems'], a: 0, why: 'It proves the greedy choice is safe, not that it is unique.' },
        { type: 'mcq', q: `Your exchange step fails: swapping in the greedy choice can make the rest infeasible. What follows?`, opts: ['The greedy rule is probably wrong', 'You need to sort differently first', 'The problem has no solution', 'Use recursion instead of a loop'], a: 0, why: 'The failed swap usually produces a concrete counterexample. Try DP instead (P16).' },
        { type: 'num', q: `Intervals [[1,2],[2,3],[3,4],[1,3]]. Minimum number to remove so none overlap?`, a: 1, why: 'Keep [1,2], [2,3], [3,4] (touching endpoints don\'t overlap): remove [1,3].' }
      ]
    },
    {
      title: 'Sweep line and meeting rooms',
      teach: `
<p>"How many rooms are needed?" is really "what's the maximum number of meetings happening at once?"</p>
<div class="ex">
<div class="sub">Heap version</div>
<p>Sort by start. Keep a min-heap of <strong>end times of the meetings currently in progress</strong>. For each meeting: if the earliest end ≤ its start, that room is free (poll it). Push this meeting's end. The answer is the maximum heap size, which is just the final size if you only poll one per meeting.</p>
<pre><code>Arrays.sort(iv, (a, b) -&gt; Integer.compare(a[0], b[0]));
PriorityQueue&lt;Integer&gt; endings = new PriorityQueue&lt;&gt;();
for (int[] m : iv) {
    if (!endings.isEmpty() &amp;&amp; endings.peek() &lt;= m[0]) endings.poll();  // reuse a room
    endings.offer(m[1]);
}
return endings.size();</code></pre>
<div class="sub">Sweep-line version (often simpler)</div>
<p>Make events: +1 at each start, −1 at each end. Sort events by time, with <strong>ends before starts</strong> at equal times (a meeting ending at 10 frees the room for one starting at 10). Sweep, tracking a running count; the answer is its maximum.</p>
<div class="sub">The picture</div>
<p>Draw the intervals as horizontal bars and sweep a vertical line left to right. The answer is the most bars the line ever crosses at once.</p>
</div>`,
      qs: [
        { type: 'num', q: `Meetings [[0,30],[5,10],[15,20]]. Minimum rooms?`, a: 2, why: '[0,30] overlaps both others, but [5,10] and [15,20] don\'t overlap each other.' },
        { type: 'num', q: `Meetings [[1,5],[2,6],[3,7]]. Minimum rooms?`, a: 3, why: 'All three overlap at time 3–5.' },
        { type: 'mcq', q: `In the sweep, two events share a time: one meeting ends, another starts. Process which first?`, opts: ['The end, so the room is reused', 'The start, to reserve a room', 'Either; the count is the same', 'Sort them by meeting length'], a: 0, why: 'Processing the start first counts an extra concurrent meeting and overstates the rooms needed.' },
        { type: 'free', q: `Why does the maximum number of simultaneously active intervals equal the minimum number of rooms needed?`, model: `<p>Lower bound: if k meetings overlap at some instant, they all need different rooms at that instant, so at least k rooms are required. Upper bound: the greedy sweep/heap never opens a new room unless every existing one is busy at that moment, so the number of rooms it opens equals the maximum concurrency. Both bounds match, so the maximum overlap is exactly the answer.</p>`, rubric: ['Lower bound: k simultaneous meetings need k rooms', 'Upper bound: the algorithm opens a room only when all are busy', 'The two bounds coincide, so max overlap is exact'] }
      ]
    },
    {
      title: 'Counterexamples for the wrong sort key',
      teach: `
<p>The way to be sure of a greedy rule is to break the alternatives.</p>
<div class="ex">
<div class="sub">Maximum non-overlapping intervals, sorted by START</div>
<p>[[1, 10], [2, 3], [4, 5]]: earliest start takes [1, 10], which clashes with both others, giving <strong>1</strong>. Earliest end takes [2, 3] then [4, 5]: <strong>2</strong>. One long early interval poisons the start-based rule.</p>
<div class="sub">Sorted by SHORTEST duration</div>
<p>[[1, 5], [4, 6], [5, 9]]: the shortest is [4, 6], which clashes with both others, giving <strong>1</strong>. Earliest end takes [1, 5] then [5, 9]: <strong>2</strong>. A short interval can straddle the boundary between two others.</p>
<div class="sub">Why "earliest end" survives</div>
<p>It's the only key that directly maximises the remaining free time, which is exactly what the exchange argument needs.</p>
</div>
<p>Practise this: for any greedy rule you invent, spend 30 seconds trying to break it with 3 intervals. If you can't and you can write the exchange argument, you're safe.</p>`,
      qs: [
        { type: 'num', q: `Intervals [[1,10],[2,3],[4,5]]: how many does "earliest start" greedy select?`, a: 1, why: 'It takes [1,10], which overlaps everything else.' },
        { type: 'num', q: `Same intervals: how many does "earliest end" select?`, a: 2, why: '[2,3] then [4,5].' },
        { type: 'free', q: `Construct a counterexample showing "shortest interval first" is not optimal, and explain the structural reason it fails.`, model: `<p>[[1, 5], [4, 6], [5, 9]]: the shortest is [4, 6], and picking it clashes with both [1, 5] and [5, 9], giving 1. Picking by earliest end gives [1, 5] and [5, 9]: 2. The structural reason: a short interval can sit across the junction between two longer compatible ones, so it blocks two intervals while contributing one. Duration says nothing about how much of the timeline is consumed <em>going forward</em>, which is what matters.</p>`, rubric: ['Gives a concrete counterexample with its counts', 'Shows earliest-end does better on the same input', 'Explains the structural reason: a short interval can straddle two compatible ones'] },
        { type: 'mcq', q: `Minimum arrows to burst balloons (intervals): the greedy is…`, opts: ['Shoot at the earliest end, repeat', 'Shoot at the earliest start, repeat', 'Shoot at the widest balloon\'s middle', 'Shoot at the shortest interval\'s end'], a: 0, why: 'Same structure as interval scheduling: an arrow at the earliest end bursts every balloon containing that point and leaves the most room.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Insert Interval": given sorted non-overlapping intervals and a new interval, insert and merge in O(n). Describe the three phases and why one pass is enough.`, model: `<p>Phase 1: copy every interval ending before the new one starts (no overlap). Phase 2: while the current interval starts before or at the new one's end, absorb it by taking min of starts and max of ends; after the loop, append the merged interval. Phase 3: copy the rest unchanged. One pass works because the input is already sorted and non-overlapping, so the intervals overlapping the new one form a contiguous block. O(n).</p>`, rubric: ['Three phases: before, merging block, after', 'Merging takes min start and max end across the overlapping block', 'One pass works because overlapping intervals form a contiguous block in sorted input'] },
    { type: 'num', q: `Merging [[1,4],[4,5]]: how many intervals remain?`, a: 1, why: 'Touching counts as overlapping for merging: [1,5].' },
    { type: 'mcq', q: `Jump Game (can you reach the last index?). The greedy is…`, opts: ['Track the furthest index reachable so far', 'Always jump the maximum each time', 'Sort the jump lengths first', 'Try every jump with backtracking'], a: 0, why: 'Sweep left to right keeping maxReach; fail if i &gt; maxReach. "Always jump maximum" can overshoot a better launchpad.' },
    { type: 'num', q: `Meetings [[7,10],[2,4]]. Minimum rooms?`, a: 1, why: 'They don\'t overlap.' },
    { type: 'free', q: `Discriminate: you face an optimisation problem and think of a greedy rule. What two things do you try before committing, and what do you do if both fail?`, model: `<p>(1) Try to break it: spend half a minute constructing small counterexamples (3 items is usually enough). (2) Try to prove it with an exchange argument: swap an optimal solution's first choice for the greedy one and check nothing is lost. If you can't break it and can't prove it, don't commit; fall back to DP (P16), which needs only optimal substructure, and say so explicitly: "I can't justify the greedy choice here, so I'll use DP."</p>`, rubric: ['Attempt a small counterexample', 'Attempt the exchange argument', 'If both fail, use DP and say why'] }
  ],
  practice: [
    { name: 'Merge Intervals', lc: 'LeetCode 56', prompt: `<p>Merge all overlapping intervals.</p>`, hint: `<p>Sort by start; extend the last group with max of ends.</p>`,
      solution: `<pre><code>public int[][] merge(int[][] iv) {
    Arrays.sort(iv, (a, b) -&gt; Integer.compare(a[0], b[0]));
    List&lt;int[]&gt; out = new ArrayList&lt;&gt;();
    for (int[] cur : iv) {
        if (!out.isEmpty() &amp;&amp; cur[0] &lt;= out.get(out.size() - 1)[1]) {
            int[] last = out.get(out.size() - 1);
            last[1] = Math.max(last[1], cur[1]);
        } else {
            out.add(new int[]{cur[0], cur[1]});
        }
    }
    return out.toArray(new int[0][]);
}</code></pre><p class="cx">O(n log n) for the sort, O(n) for the pass.</p>` },
    { name: 'Non-overlapping Intervals', lc: 'LeetCode 435', prompt: `<p>Minimum number of intervals to remove so the rest don't overlap.</p>`, hint: `<p>Keep as many as possible: earliest end first.</p>`,
      solution: `<pre><code>public int eraseOverlapIntervals(int[][] iv) {
    Arrays.sort(iv, (a, b) -&gt; Integer.compare(a[1], b[1]));
    int kept = 0, end = Integer.MIN_VALUE;
    for (int[] cur : iv) {
        if (cur[0] &gt;= end) { kept++; end = cur[1]; }
    }
    return iv.length - kept;
}</code></pre><p class="cx">O(n log n). Justified by the exchange argument.</p>` },
    { name: 'Meeting Rooms II', lc: 'LeetCode 253', prompt: `<p>Minimum meeting rooms required.</p>`, hint: `<p>Min-heap of end times, or a sweep of +1/−1 events.</p>`,
      solution: `<pre><code>public int minMeetingRooms(int[][] iv) {
    Arrays.sort(iv, (a, b) -&gt; Integer.compare(a[0], b[0]));
    PriorityQueue&lt;Integer&gt; endings = new PriorityQueue&lt;&gt;();
    for (int[] m : iv) {
        if (!endings.isEmpty() &amp;&amp; endings.peek() &lt;= m[0]) endings.poll();
        endings.offer(m[1]);
    }
    return endings.size();
}</code></pre><p class="cx">O(n log n). The heap size is the current concurrency.</p>` },
    { name: 'Insert Interval', lc: 'LeetCode 57', prompt: `<p>Insert a new interval into sorted, non-overlapping intervals and merge.</p>`, hint: `<p>Three phases: before, overlapping block, after.</p>`,
      solution: `<pre><code>public int[][] insert(int[][] iv, int[] add) {
    List&lt;int[]&gt; out = new ArrayList&lt;&gt;();
    int i = 0, n = iv.length;
    while (i &lt; n &amp;&amp; iv[i][1] &lt; add[0]) out.add(iv[i++]);          // entirely before
    int s = add[0], e = add[1];
    while (i &lt; n &amp;&amp; iv[i][0] &lt;= e) {                              // overlapping block
        s = Math.min(s, iv[i][0]);
        e = Math.max(e, iv[i][1]);
        i++;
    }
    out.add(new int[]{s, e});
    while (i &lt; n) out.add(iv[i++]);                               // entirely after
    return out.toArray(new int[0][]);
}</code></pre><p class="cx">O(n), no sort needed: the input is already sorted.</p>` }
  ]
});
