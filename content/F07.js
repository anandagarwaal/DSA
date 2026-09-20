COURSE.topic({
  id: 'F07',
  intro: `This topic goes straight at your diagnosed weakness: knowing <em>what</em> a loop does but not being able to say <em>why it's right</em>. A <strong>loop invariant</strong> is the tool for that why. It's a sentence that stays true every time the loop comes back around. Two pointers, sliding window, binary search, the monotonic stack: every one of their correctness arguments is a loop invariant.`,
  kps: [
    {
      title: 'An invariant is a sentence true before every iteration',
      teach: `
<p>Think of the array as split by the loop index into a <strong>processed</strong> part and an <strong>unprocessed</strong> part. The invariant says what's true about the processed part.</p>
<figure class="fig"><svg viewBox="0 0 340 70" width="340" role="img" aria-label="processed and unprocessed regions">
<g transform="translate(10,10)">
<rect x="0" y="0" width="180" height="30" style="fill:var(--accent);opacity:.25;stroke:var(--accent)"/>
<rect x="180" y="0" width="140" height="30" style="fill:none;stroke:var(--soft)"/>
<line x1="180" y1="-5" x2="180" y2="38" style="stroke:var(--ink);stroke-width:2"/>
<text x="90" y="20" text-anchor="middle" font-size="11" style="fill:var(--ink)">a[0..i): invariant holds</text>
<text x="250" y="20" text-anchor="middle" font-size="11" style="fill:var(--soft)">not yet seen</text>
<text x="180" y="52" text-anchor="middle" font-size="11" style="fill:var(--ink)">i</text></g></svg>
<figcaption>Each iteration moves the boundary right by one; the invariant must survive the move.</figcaption></figure>
<div class="ex">
<div class="sub">Worked example: maximum of an array</div>
<pre><code>int best = a[0];
for (int i = 1; i &lt; n; i++)
    if (a[i] &gt; best) best = a[i];</code></pre>
<p><strong>Invariant:</strong> at the top of each iteration, <code>best</code> is the maximum of <code>a[0..i)</code>, the processed prefix.</p>
<div class="sub">What makes it a good invariant</div>
<p>(1) It mentions the loop variable, so it describes <em>progress</em>. (2) When the loop ends (i = n), it becomes exactly the answer: "best is the max of a[0..n)".</p>
</div>
<p>A bad invariant is either too weak to give the answer at the end ("best is some element of a"), or not actually preserved.</p>`,
      qs: [
        { type: 'mcq', q: `For <code>sum = 0; for (i = 0; i &lt; n; i++) sum += a[i];</code>, which is the useful invariant (at the top of each iteration)?`, opts: ['sum equals a[0] + … + a[i−1]', 'sum is at most the total of a', 'sum is some element of the array', 'sum equals a[0] + … + a[i]'], a: 0, why: 'Before iteration i we have added exactly a[0..i). "…+ a[i]" is off by one: a[i] is added during iteration i.' },
        { type: 'mcq', q: `Why is "best is some element of the array" a poor invariant for the max loop?`, opts: ['At the end it does not give the answer', 'It is not true at initialisation', 'It is not maintained by an iteration', 'It does not mention any variables'], a: 0, why: 'It stays true, but at termination it only says "best is in the array", not "best is the max". An invariant must be strong enough to finish the proof.' },
        { type: 'free', q: `Write the invariant for this loop and say what it means when the loop ends.<pre><code>int count = 0;
for (int i = 0; i &lt; n; i++)
    if (a[i] % 2 == 0) count++;</code></pre>`, model: `<p>Invariant: at the top of iteration i, <code>count</code> = number of even elements in a[0..i). When the loop ends, i = n, so count = number of even elements in the whole array, which is the answer.</p>`, rubric: ['Invariant ties count to the processed prefix a[0..i) (not a[0..i])', 'At termination i = n, so the invariant gives the full answer'] },
        { type: 'mcq', q: `Insertion sort's outer loop invariant is…`, opts: ['a[0..i) holds its original items, sorted', 'a[0..i) holds the i smallest items', 'a[i..n) is already in sorted order', 'a[i] is the largest item seen so far'], a: 0, why: 'Insertion sort sorts the prefix it has seen, not the smallest items overall. (That second one is selection sort\'s invariant.)' }
      ]
    },
    {
      title: 'Prove it: initialisation, maintenance, termination',
      teach: `
<p>An invariant proof has three parts. It's induction over the iterations (F08).</p>
<div class="ex">
<div class="sub">Initialisation: true before the first iteration</div>
<p>Max loop: before i = 1, best = a[0], the max of a[0..1). ✓</p>
<div class="sub">Maintenance: if true before an iteration, true before the next</div>
<p>Assume best = max(a[0..i)). The iteration compares a[i] with best and keeps the larger. The max of a[0..i+1) is either the old max or a[i], and we kept whichever is larger. So best = max(a[0..i+1)). ✓</p>
<div class="sub">Termination: the loop ends and the invariant gives the answer</div>
<p>i reaches n; invariant says best = max(a[0..n)). ✓</p>
</div>
<p><strong>Maintenance is the heart.</strong> It's where you have to explain why the one step you take preserves the property. "The code updates best" isn't maintenance. "The new max is either the old max or the new element, and we keep the larger" is.</p>`,
      qs: [
        { type: 'mcq', q: `Which step of the proof uses the specific logic of the loop body most?`, opts: ['Maintenance', 'Initialisation', 'Termination', 'Choosing a name'], a: 0, why: 'Maintenance shows one iteration preserves the property, and that depends on exactly what the body does.' },
        { type: 'free', q: `Prove maintenance for the prefix-sum loop <code>sum += a[i]</code> with invariant "sum = a[0] + … + a[i−1] at the top of iteration i".`, model: `<p>Assume at the top of iteration i, sum = a[0] + … + a[i−1]. The body adds a[i], so sum = a[0] + … + a[i]. The loop then increments i to i+1, and a[0] + … + a[i] is exactly a[0] + … + a[(i+1)−1]. So the invariant holds at the top of iteration i+1.</p>`, rubric: ['Starts from the assumption that the invariant holds at iteration i', 'Applies exactly what the body does (adds a[i])', 'Re-expresses the result in terms of the new i to show the invariant holds for i+1'] },
        { type: 'mcq', q: `A loop's invariant holds initially and is maintained, but the loop never ends. What have you proven?`, opts: ['Nothing useful about the final answer', 'The loop computes the right answer', 'The loop has a bug in maintenance', 'The invariant must have been wrong'], a: 0, why: 'Partial correctness: IF it ends, the answer is right. You still need termination (next step).' },
        { type: 'mcq', q: `Min-finding loop starts with <code>best = 0</code> instead of <code>a[0]</code>. Which proof part breaks?`, opts: ['Initialisation', 'Maintenance', 'Termination', 'None of them'], a: 0, why: 'Before the loop, best = 0 is not "min of the processed part" (0 may not even be in the array). All-positive input returns 0, which is wrong.' },
        { type: 'free', q: `Why is "maintenance" alone not enough, and why is "initialisation" alone not enough? Answer in 2–3 sentences.`, model: `<p>Maintenance only says "if it was true, it stays true"; if it was never true to begin with (bad initialisation), nothing follows. Initialisation only says it's true at the start; without maintenance it could break after the first step. You need both, like induction's base case and step, plus termination to turn the invariant into the answer.</p>`, rubric: ['Maintenance is conditional: it needs a true starting point', 'Initialisation gives the start but says nothing about later iterations', 'Mentions they work together like base case + inductive step'] }
      ]
    },
    {
      title: 'Use the invariant to find bugs',
      teach: `
<p>When a loop is wrong, try to prove it. <strong>The step where the proof fails is where the bug is.</strong></p>
<div class="ex">
<div class="sub">Worked example: move zeros to the end (buggy)</div>
<pre><code>int w = 0;                         // intended invariant: a[0..w) = the non-zeros of a[0..r), in order
for (int r = 0; r &lt; n; r++)
    if (a[r] != 0) { a[w] = a[r]; }  // BUG
// then fill a[w..n) with zeros</code></pre>
<div class="sub">Check maintenance</div>
<p>If a[r] is non-zero, a[0..w) must grow by one element: a[r] has to be placed at position w <em>and w must advance</em>. The code writes a[w] but never increments w, so the "kept" region never grows. Maintenance fails.</p>
<div class="sub">Fix</div>
<p><code>a[w++] = a[r];</code> Now each non-zero extends the kept prefix by one.</p>
</div>
<p>This is how to debug without running anything: state what should be true, then check each proof step against the code.</p>`,
      qs: [
        { type: 'mcq', q: `The loop <code>for (i = 0; i &lt;= n; i++) sum += a[i];</code> crashes. Which proof step exposes it?`, opts: ['Termination: the last step reads a[n]', 'Initialisation: sum should start at 1', 'Maintenance: sum adds the wrong item', 'None; the proof cannot see crashes'], a: 0, why: 'The loop runs once more with i = n, one past the processed region, so it reads out of bounds.' },
        { type: 'free', q: `This "is sorted?" check has a bug. Find it via the invariant "no inversion among adjacent pairs in a[0..i]".<pre><code>for (int i = 0; i &lt; n; i++)
    if (a[i] &gt; a[i + 1]) return false;
return true;</code></pre>`, model: `<p>Each iteration checks the pair (i, i+1), extending the verified prefix to a[0..i+1]. The last iteration, i = n−1, checks a[n−1] against a[n], which is out of bounds. Termination/maintenance fails at the final step. The loop should run while i &lt; n − 1 (i + 1 &lt; n).</p>`, rubric: ['Identifies that iteration i checks the pair (i, i+1)', 'Finds that i = n−1 accesses a[n], out of bounds', 'Fix: loop while i + 1 &lt; n'] },
        { type: 'mcq', q: `Finding the max, a student writes <code>if (a[i] &gt;= best) best = i;</code>. The invariant "best = max of processed" fails at…`, opts: ['Maintenance: best becomes an index', 'Initialisation: best starts too high', 'Termination: loop ends one too early', 'Nowhere; &gt;= is fine in this case'], a: 0, why: 'After an update, best holds a position, not a value, so the invariant (about values) breaks in maintenance.' },
        { type: 'free', q: `In the move-zeros bug above, what input would reveal the bug, and what would the output look like?`, model: `<p>Any input with at least two non-zeros, e.g. [1, 0, 2]. Every non-zero is written to a[0] because w never advances; w stays 0, so the fill step zeros the whole array: output [0, 0, 0] instead of [1, 2, 0].</p>`, rubric: ['Chooses an input with at least two non-zero elements', 'Correctly traces that every non-zero overwrites a[0] and w stays 0, so the result is all zeros'] }
      ]
    },
    {
      title: 'Termination: find a quantity that must shrink',
      teach: `
<p>For <code>for i in 0..n</code> termination is obvious. For <code>while</code> loops with two pointers or a search range, it isn't. It's a classic source of infinite loops.</p>
<div class="ex">
<div class="sub">The method</div>
<p>Find a whole number that (1) <strong>strictly decreases</strong> every iteration and (2) can't go below some bound. It must hit the bound, so the loop must stop.</p>
<div class="sub">Worked example: converging two pointers</div>
<pre><code>while (lo &lt; hi) { if (...) lo++; else hi--; }</code></pre>
<p>Measure: <code>hi − lo</code>. Each iteration shrinks it by exactly 1, and the loop stops once it reaches 0. So at most n iterations.</p>
<div class="sub">Worked example: a binary search that hangs</div>
<pre><code>while (lo &lt; hi) { int mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }</code></pre>
<p>Measure hi − lo. When hi = lo + 1, mid = lo, and the else-branch sets lo = mid = lo, <strong>no change</strong>. The measure doesn't strictly shrink, so it's an infinite loop. The fix is <code>lo = mid + 1</code>.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `What's a good termination measure for <code>while (lo &lt; hi) { ... lo++ or hi-- ... }</code>?`, opts: ['hi − lo', 'lo + hi', 'the value at lo', 'the loop count'], a: 0, why: 'It is a whole number, drops by 1 every iteration, and the loop stops at 0.' },
        { type: 'num', q: `In the buggy binary search (<code>lo = mid</code>), with lo = 4 and hi = 5 and ok(mid) false, what is lo after the iteration?`, a: 4, why: 'mid = (4+5)/2 = 4; lo = mid = 4, no progress, so it loops forever.' },
        { type: 'free', q: `Prove that Euclid's algorithm <code>while (b != 0) { int t = a % b; a = b; b = t; }</code> (with a, b ≥ 0) terminates.`, model: `<p>Measure: b. Each iteration replaces b by a % b, which is strictly less than b (a remainder is always less than the divisor) and at least 0. So b is a non-negative whole number that strictly decreases every iteration; it must reach 0, and the loop stops.</p>`, rubric: ['Picks b as the measure', 'Shows it strictly decreases: a % b &lt; b', 'Notes it is bounded below by 0 (non-negative integer), so it must reach 0'] },
        { type: 'mcq', q: `A loop does <code>while (x != 1) x = (x % 2 == 0) ? x / 2 : 3 * x + 1;</code>. Can you prove it terminates for every positive x?`, opts: ['No measure is known; it is an open problem', 'Yes: x strictly decreases every step', 'Yes: x is always even after one step', 'No: it provably loops forever for x = 7'], a: 0, why: 'This is the Collatz conjecture. x sometimes grows, so no simple decreasing measure exists. Termination is not automatic!' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `Give the invariant and prove maintenance for this "remove element val in place" loop.<pre><code>int w = 0;
for (int r = 0; r &lt; n; r++)
    if (a[r] != val) a[w++] = a[r];
return w;</code></pre>`, model: `<p>Invariant (top of iteration r): a[0..w) holds exactly the elements of a[0..r) that are ≠ val, in original order. Maintenance: if a[r] == val, nothing changes and a[0..w) is still the kept elements of a[0..r+1). If a[r] ≠ val, it is copied to a[w] and w increments, so a[0..w) now also includes a[r], the kept elements of a[0..r+1) in order. Safe because w ≤ r, so we never overwrite an unread element.</p>`, rubric: ['States the invariant about a[0..w) vs the processed a[0..r)', 'Handles both cases (a[r] == val and a[r] ≠ val) in maintenance', 'Notes w ≤ r, so writing a[w] never destroys unread input'] },
    { type: 'mcq', q: `A loop's invariant is maintained and true at termination, but the loop returns the wrong answer on some inputs. Most likely broken:`, opts: ['Initialisation', 'Maintenance', 'Java arithmetic', 'The loop condition only'], a: 0, why: 'If maintenance and termination hold but the answer is wrong, the invariant was never true to begin with.' },
    { type: 'mcq', q: `Which quantity proves <code>while (i &lt; j) { if (s[i] == s[j]) { i++; j--; } else return false; }</code> terminates?`, opts: ['j − i', 'i + j', 's.length()', 'the value s[i]'], a: 0, why: 'j − i drops by 2 on every iteration that continues; the loop stops once it is ≤ 0.' },
    { type: 'free', q: `Kadane's algorithm: <code>cur = max(a[i], cur + a[i]); best = max(best, cur);</code>. State an invariant for <code>cur</code> (not best) that makes the algorithm correct.`, model: `<p>After processing index i, <code>cur</code> = the maximum sum of a subarray that <em>ends exactly at</em> i. Maintenance: a best subarray ending at i either is just [a[i]] or extends a best subarray ending at i−1, which is cur + a[i]. We take the max of the two. Then best is the max of cur over all end positions, i.e. the best subarray overall.</p>`, rubric: ['Invariant: cur = best sum of a subarray ending exactly at i', 'Maintenance: a subarray ending at i either starts at i or extends one ending at i−1', 'Connects to best: max over all end positions is the global answer'] },
    { type: 'mcq', q: `A while-loop's measure decreases by 1 each iteration, but it is a <code>double</code> starting at 0.5 and the loop runs while it's &gt; 0. Does the argument still prove termination?`, opts: ['Yes, it reaches −0.5 after a step', 'No, doubles can shrink forever', 'No, a measure must be an int', 'Only if the start is an integer'], a: 0, why: 'Transfer: what matters is decreasing by at least a fixed amount toward a bound. Shrinking by 1 from 0.5 crosses 0 in one step. (Shrinking by ever-smaller amounts would not work; that is why integers are the safe default.)' }
  ]
});
