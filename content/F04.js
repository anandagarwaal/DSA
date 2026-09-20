COURSE.topic({
  id: 'F04',
  intro: `In placement you said "once we have doubled, the next N additions are O(1)". That's the claim restated, not an argument. This topic builds the argument: <strong>add up the total cost of a whole sequence of operations and divide</strong>. You'll prove why doubling works, prove why growing by +1000 fails, and learn the "each element enters and leaves once" argument behind sliding windows and monotonic stacks.`,
  kps: [
    {
      title: 'Amortized cost = total cost ÷ number of operations',
      teach: `
<p>Some operations are usually cheap and occasionally expensive. Worst case per operation paints them all as expensive. <strong>Amortized analysis</strong> asks a better question: over <em>any</em> sequence of n operations, what's the total cost? Divide by n.</p>
<div class="ex">
<div class="sub">Worked example: a counter with occasional resets</div>
<p>An operation normally costs 1, but every 100th operation costs 100 (a cleanup). Over 1000 operations: 990 × 1 + 10 × 100 = 1990. Amortized: 1990 / 1000 ≈ 2 per operation, so <strong>O(1) amortized</strong>, although the worst single operation costs 100.</p>
<div class="sub">What it is NOT</div>
<p>It isn't an average over random inputs ("usually fast"). It's a <strong>guarantee</strong> about every sequence: no input can make n operations cost more than n × (amortized cost). No luck involved.</p>
<div class="sub">What it doesn't promise</div>
<p>Any single operation can still be slow. For a latency-critical path (e.g. one request must not stall), an amortized O(1) structure can still cause a spike.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"ArrayList.add is O(1) amortized" guarantees…`, opts: ['n adds cost O(n) total, for any sequence', 'every single add runs in O(1) time', 'adds are O(1) on random data on average', 'the array never needs to be resized'], a: 0, why: 'Amortized bounds the total over a sequence. Individual adds (the resizing ones) can cost O(n).' },
        { type: 'num', q: `Operations cost 1 each, except every 10th costs 50. Amortized cost per operation over 1000 operations?`, a: 5.9, tol: 0.05, why: '900 × 1 + 100 × 50 = 5900; 5900 / 1000 = 5.9.' },
        { type: 'free', q: `How is "amortized O(1)" different from "average-case O(1)" (like a hash table's expected O(1))?`, model: `<p>Amortized is a worst-case guarantee on the <em>total</em> of any sequence: no input or ordering can make n operations exceed O(n), with no randomness assumed. Average/expected case assumes something about the input or random choices (e.g. a good hash spreading keys); an adversarial input can break it. Amortized can still have slow individual operations; it's the sum that's bounded.</p>`, rubric: ['Amortized: deterministic bound on the total of any sequence of operations', 'Average/expected: depends on input distribution or randomness, and can be beaten by bad inputs', 'Notes individual operations can still be slow under amortized bounds'] },
        { type: 'mcq', q: `A game server must never stall a frame. Why might an amortized O(1) structure worry you?`, opts: ['A single operation can still be slow', 'Its total cost is not truly O(n)', 'Amortized means it is random', 'It uses more memory per item'], a: 0, why: 'Amortized bounds the sum, not each operation. The occasional expensive one (a resize) is a latency spike.' }
      ]
    },
    {
      title: 'Doubling: total copies stay under 2n',
      teach: `
<p>ArrayList: when the backing array is full, allocate one <strong>twice as big</strong> and copy everything over.</p>
<figure class="fig"><svg viewBox="0 0 340 150" width="340" role="img" aria-label="cost per append with spikes at powers of two">
<g transform="translate(24,10)">
<line x1="0" y1="120" x2="306" y2="120" style="stroke:var(--soft)"/>
<g><rect x="0" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="18" y="112" width="16" height="8" style="fill:var(--accent)"/><rect x="36" y="108" width="16" height="12" style="fill:var(--accent)"/><rect x="54" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="72" y="100" width="16" height="20" style="fill:var(--accent)"/><rect x="90" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="108" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="126" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="144" y="84" width="16" height="36" style="fill:var(--accent)"/><rect x="162" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="180" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="198" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="216" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="234" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="252" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="270" y="116" width="16" height="4" style="fill:var(--good)"/><rect x="288" y="52" width="16" height="68" style="fill:var(--accent)"/></g>
<text x="150" y="138" text-anchor="middle" font-size="10" style="fill:var(--soft)">cost of appends 1..17 (1 write + copies): spikes at 2, 3, 5, 9, 17</text></g></svg></figure>
<div class="ex">
<div class="sub">Subgoal 1: where do copies happen?</div>
<p>Starting at capacity 1, resizes copy 1, then 2, then 4, 8, 16, … elements: each time the array fills up.</p>
<div class="sub">Subgoal 2: add them up (F03)</div>
<p>For n appends, the copies are 1 + 2 + 4 + … + (largest power of 2 below n). That's a <strong>geometric series</strong>, and its last term is less than n, so the whole sum is <strong>less than 2n</strong>.</p>
<div class="sub">Subgoal 3: total and divide</div>
<p>Total = n writes + fewer than 2n copies, so less than 3n. Divide by n: <strong>under 3 per append, O(1) amortized.</strong></p>
</div>
<p><strong>Why it works, in one sentence:</strong> each expensive copy is paid for by the equally many cheap appends since the last resize, because doubling makes the gap between resizes grow as fast as the copy cost does.</p>`,
      qs: [
        { type: 'num', q: `Doubling from capacity 1. How many element copies in total for 17 appends?`, a: 31, why: 'Resizes copy 1, 2, 4, 8, 16 elements: 31. Under 2 × 17.' },
        { type: 'num', q: `Doubling from capacity 1. Total copies for 1000 appends?`, a: 1023, why: '1 + 2 + … + 512 = 1023 (the next resize at 1024 is not reached). Under 2n = 2000.' },
        { type: 'free', q: `Prove that n appends to a doubling array cost O(n) total. Use the geometric sum; don't just say "most appends are O(1)".`, model: `<p>Writes: n. Copies: resizes happen at sizes 1, 2, 4, …, 2ᵏ with 2ᵏ &lt; n, copying that many elements each. Total copies = 1 + 2 + … + 2ᵏ = 2ᵏ⁺¹ − 1 &lt; 2 · 2ᵏ &lt; 2n. Total cost &lt; n + 2n = 3n = O(n), so O(1) amortized per append.</p>`, rubric: ['Identifies copy sizes as powers of two up to below n', 'Sums them as a geometric series, bounded by 2n', 'Adds the n writes and divides: O(1) amortized'] },
        { type: 'mcq', q: `The spikes in the per-append cost chart are at appends 2, 3, 5, 9, 17. Why do they get further apart?`, opts: ['Capacity doubles, so gaps double too', 'The array shrinks after each copy', 'Java skips copying on even sizes', 'Copies get cheaper as n grows'], a: 0, why: 'After resizing to capacity 2c, there are c free slots, so c cheap appends before the next spike. Gaps grow exactly as fast as spike heights.' },
        { type: 'mcq', q: `Would tripling instead of doubling still give O(1) amortized?`, opts: ['Yes, any constant factor over 1 works', 'No, only doubling gives a geometric sum', 'No, tripling makes it O(log n)', 'Only if n is a power of three'], a: 0, why: 'Any growth factor r &gt; 1 gives a geometric series of copies, bounded by a constant times n. (The factor trades memory for fewer copies. Java uses 1.5.)' }
      ]
    },
    {
      title: 'Growing by +k fails: prove it',
      teach: `
<p>This is the part you skipped in placement. Suppose instead the array grows by a <strong>fixed amount k</strong> (say +1000) each time it fills.</p>
<div class="ex">
<div class="sub">Subgoal 1: where are the copies?</div>
<p>Resizes happen at sizes k, 2k, 3k, …, and each copies the current size: k, 2k, 3k, … elements.</p>
<div class="sub">Subgoal 2: add them up</div>
<p>For n appends there are about n/k resizes. Copies = k + 2k + … + (n/k)·k = k · (1 + 2 + … + n/k) ≈ k · (n/k)² / 2 = <strong>n² / (2k)</strong>. That's an <em>arithmetic</em> series (F03): a staircase, not a doubling stack.</p>
<div class="sub">Subgoal 3: divide</div>
<p>n²/(2k) ÷ n = n/(2k) per append. <strong>O(n) amortized.</strong> k only divides it by a constant.</p>
</div>
<p><strong>Why the picture differs:</strong> with +k the gap between resizes stays fixed at k, but the copy cost keeps growing. Each spike is paid for by only k cheap appends, while the spikes get taller forever. With doubling the gap grows <em>with</em> the spike.</p>
<p>A bigger k delays the pain but doesn't fix it: at n = 10⁶ and k = 1000, that's about 5 × 10⁸ copies, versus fewer than 2 × 10⁶ with doubling.</p>`,
      qs: [
        { type: 'num', q: `Start capacity 10, grow by +10. Total copies for 100 appends?`, a: 450, why: 'Resizes copy 10, 20, …, 90: sum = 10 × (1 + … + 9) = 450, close to n²/(2k) = 500.' },
        { type: 'free', q: `Prove that growing by a constant k makes append O(n) amortized, and explain in one sentence why a larger k doesn't rescue it.`, model: `<p>Resizes occur at sizes k, 2k, …, up to n, copying k, 2k, 3k, … elements. Total = k(1 + 2 + … + n/k) ≈ k · (n/k)²/2 = n²/(2k). Per append that's n/(2k) = Θ(n). A larger k only divides by a constant; the copy costs still grow linearly while the gap between resizes stays fixed at k, so the total stays quadratic.</p>`, rubric: ['Copy sizes form the arithmetic series k, 2k, 3k, …', 'Sums to about n²/(2k), hence Θ(n) per append', 'Explains why k only changes a constant (fixed gap vs growing copy cost)'] },
        { type: 'num', q: `Start 1000, grow by +1000, n = 10⁶ appends. Total copies, in millions (nearest whole)?`, a: 500, tol: 5, why: '1000 × (1 + … + 999) = 499.5 million ≈ n²/(2k) = 5 × 10⁸. Doubling would copy under 2 million.' },
        { type: 'mcq', q: `Which growth rule gives O(1) amortized appends?`, opts: ['capacity = capacity × 3 / 2', 'capacity = capacity + 4096', 'capacity = capacity + log(n)', 'capacity = capacity + √1000'], a: 0, why: 'Only multiplicative growth gives a geometric copy series. Any additive rule, even a large or slowly growing one, leaves the gaps too small.' }
      ]
    },
    {
      title: 'The banker\'s view: prepay the expensive operation',
      teach: `
<p>Another way to see it, useful when summing is awkward: <strong>charge every cheap operation a little extra, bank it, and spend the savings on the expensive one.</strong> If the bank never goes negative, the charge per operation is an amortized bound.</p>
<div class="ex">
<div class="sub">Worked example: doubling array, charge 3 per append</div>
<p>Each append pays 3 coins: 1 for its own write, 2 into the bank <em>on that element</em>.</p>
<p>After a resize to capacity 2c, the array holds c "old" elements with empty bank accounts. Before the next resize, c new elements are appended, each banking 2 coins: <strong>2c coins</strong>.</p>
<p>The next resize copies all 2c elements, costing 2c coins, exactly what's in the bank. It never goes negative, so the amortized cost is ≤ 3 per append.</p>
<div class="sub">Why the argument is useful</div>
<p>It shows <em>who pays</em>: each new element pays for copying itself and one old element. With +k growth, the k new elements would each need to bank about n/k coins, which is not a constant.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In the charge-3 scheme, what does each append's 2 banked coins pay for at the next resize?`, opts: ['Copying itself and one older element', 'Copying only itself, twice over', 'Allocating the new, bigger array', 'Nothing: they are a safety buffer'], a: 0, why: 'Between resizes, c new elements arrive and 2c elements must be copied: each new one covers itself plus one old one.' },
        { type: 'free', q: `Use the banker's argument to explain why +k growth can't have a constant amortized charge.`, model: `<p>Between two resizes only k new appends happen, so only k elements can bank coins. The next resize copies the whole array, about n elements. So each of those k appends would need to bank about n/k coins, which grows with n. No constant charge keeps the bank non-negative.</p>`, rubric: ['Only k appends happen between resizes', 'The resize costs about n (the current size)', 'So each append must prepay about n/k, not a constant'] },
        { type: 'num', q: `Doubling, charge 3 per append. Capacity just grew from 8 to 16. How many coins are in the bank right before the resize to 32?`, a: 16, why: 'Appends 9..16 (8 of them) each bank 2: 16 coins, exactly enough to copy 16 elements.' },
        { type: 'mcq', q: `The banker's argument is valid only if…`, opts: ['The bank balance never goes negative', 'Every operation costs exactly the charge', 'The expensive operation is the first one', 'Operations arrive in random order'], a: 0, why: 'A non-negative balance means total actual cost ≤ total charged, which is what the amortized bound claims.' }
      ]
    },
    {
      title: '"Each element enters once and leaves once"',
      teach: `
<p>The most common amortized argument in interviews has nothing to do with arrays growing. It shows up whenever a loop contains an inner <code>while</code> that <em>looks</em> quadratic.</p>
<div class="ex">
<div class="sub">Worked example: monotonic stack</div>
<pre><code>for (int i = 0; i &lt; n; i++) {
    while (!st.isEmpty() &amp;&amp; a[st.peek()] &lt; a[i]) st.pop();   // looks like O(n) per i
    st.push(i);
}</code></pre>
<div class="sub">Don't count per iteration; count per element</div>
<p>Each index is <strong>pushed exactly once</strong>. It can be <strong>popped at most once</strong>, since after being popped it's gone. So across the entire loop, total pops ≤ total pushes = n.</p>
<div class="sub">Total</div>
<p>n pushes + at most n pops + n loop checks = O(n). A single iteration can pop many elements, but only elements that earlier iterations pushed. The work was "prepaid" (the banker again).</p>
</div>
<p>The same argument makes the sliding window O(n): <code>right</code> moves forward n times total, and <code>left</code> moves forward at most n times total, <em>whatever the inner loop looks like</em>.</p>`,
      qs: [
        { type: 'mcq', q: `Why is the monotonic-stack loop O(n) and not O(n²)?`, opts: ['Each index is pushed and popped at most once', 'The inner while loop runs at most once', 'The stack never holds more than log n', 'Popping costs nothing in Java'], a: 0, why: 'Count work per element, not per iteration: total pops ≤ total pushes = n.' },
        { type: 'num', q: `A monotonic-stack loop runs over n = 1000 elements. What upper bound does the push/pop argument give on the total number of pops across the whole run?`, a: 1000, why: 'Each of the 1000 indices is pushed exactly once, and an index can only be popped after being pushed, so there are at most 1000 pops in total.' },
        { type: 'free', q: `A sliding-window loop: <code>for right in 0..n-1 { add(a[right]); while (invalid) { remove(a[left]); left++; } }</code>. Prove it's O(n) total, assuming add/remove are O(1).`, model: `<p>right increases n times in total. left only ever increases and never exceeds right, so it increases at most n times in total across the whole loop. Each while-iteration increments left, so the inner loop runs at most n times <em>in total</em>, not per right. Total work: n adds + ≤ n removes = O(n).</p>`, rubric: ['right advances n times in total', 'left only increases and is bounded by n, so the inner loop runs ≤ n times over the entire run', 'Concludes O(n) by counting total pointer moves, not per-iteration cost'] },
        { type: 'mcq', q: `In which loop does the "each element leaves once" argument FAIL to give O(n)?`, opts: ['The window resets left to right+1 and rescans', 'left only moves forward across iterations', 'Each index is pushed once and popped once', 'Each element enters a queue once, leaves once'], a: 0, why: 'If left jumps back (rescanning), elements are processed repeatedly and the bound breaks, e.g. O(n²) for naive restart.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>The placement question, again.</strong> Explain precisely why ArrayList.add is O(1) amortized with doubling, and why it would be O(n) amortized if capacity grew by +1000. Use total cost.`, model: `<p>Doubling: copies happen at sizes 1, 2, 4, …, below n, a geometric series totalling less than 2n; with n writes the total is under 3n, so O(1) per append. +1000: copies happen at 1000, 2000, 3000, …, an arithmetic series totalling about n²/2000; divided by n that's n/2000 per append, O(n). The difference: doubling's gap between resizes grows with the copy cost; a fixed +k gap doesn't.</p>`, rubric: ['Doubling: geometric series of copies, under 2n, O(1) amortized', '+1000: arithmetic series of copies, about n²/2000, O(n) amortized', 'Explains the gap-between-resizes vs copy-cost reasoning'] },
    { type: 'num', q: `Doubling from capacity 1: total copies for 1025 appends?`, a: 2047, why: 'Resizes at 1, 2, …, 1024 copy 1 + 2 + … + 1024 = 2047. Still under 2n = 2050.' },
    { type: 'mcq', q: `A stack supports push, pop, and multipop(k) (pops up to k items, cost = items popped). Worst total cost of n operations starting empty?`, opts: ['O(n)', 'O(n²)', 'O(n log n)', 'O(nk)'], a: 0, why: 'Transfer: each item is pushed once and popped at most once, so all pops, including multipops, total ≤ the number of pushes ≤ n.' },
    { type: 'mcq', q: `An ArrayList also <em>shrinks</em> by half when it becomes half full. Alternating add/remove at the boundary could cause…`, opts: ['A resize on every operation: O(n) each', 'No problem: still O(1) amortized', 'Memory to grow without bound', 'An infinite loop inside add'], a: 0, why: 'Transfer: grow at full, shrink at half-full means one add over the line and one remove back can trigger resize after resize. Real implementations shrink at quarter-full to leave a buffer.' },
    { type: 'free', q: `Why is it valid for one iteration of a loop to do O(n) work while the whole loop is still O(n)? Give the general principle.`, model: `<p>Because the bound is on total work, not per-iteration work. If every unit of expensive work can be charged to a distinct earlier event (e.g. each pop to the one push of that element), and there are only O(n) such events in total, then the total is O(n) however the work clusters. A heavy iteration is paying off work "prepaid" by earlier cheap ones.</p>`, rubric: ['Distinguishes total cost from per-iteration cost', 'Charges each unit of heavy work to a distinct earlier event, bounded by n in total', 'Concludes the sum is O(n) even if one iteration does a lot'] }
  ]
});
