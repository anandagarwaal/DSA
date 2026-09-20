COURSE.topic({
  id: 'F03',
  intro: `Two sums explain most of the complexity analysis you'll ever do. The <strong>arithmetic</strong> sum (1 + 2 + … + n) is behind every "inner loop depends on the outer index" quadratic. The <strong>geometric</strong> sum (1 + 2 + 4 + …) is behind amortized array doubling, heap building and recursion trees. Learn them as <em>pictures</em>, and you'll never need to memorise a formula.`,
  kps: [
    {
      title: 'The arithmetic sum is half a square',
      teach: `
<p>1 + 2 + 3 + … + n. Draw each term as a column of that height:</p>
<figure class="fig"><svg viewBox="0 0 300 150" width="300" role="img" aria-label="staircase of columns filling half a square">
<g transform="translate(20,10)">
<rect x="0" y="0" width="240" height="120" style="fill:none;stroke:var(--rule);stroke-dasharray:4 3"/>
<g style="fill:var(--accent);opacity:.85">
<rect x="0" y="105" width="30" height="15"/><rect x="30" y="90" width="30" height="30"/><rect x="60" y="75" width="30" height="45"/><rect x="90" y="60" width="30" height="60"/>
<rect x="120" y="45" width="30" height="75"/><rect x="150" y="30" width="30" height="90"/><rect x="180" y="15" width="30" height="105"/><rect x="210" y="0" width="30" height="120"/></g>
</g><text x="140" y="146" text-anchor="middle" font-size="11" style="fill:var(--soft)">columns 1..8 fill a bit over half of the 8 × 8 box</text>
</svg></figure>
<div class="ex">
<div class="sub">Subgoal 1: the box</div>
<p>The columns sit inside an n × n box (n columns, the tallest is n).</p>
<div class="sub">Subgoal 2: two staircases make a rectangle</div>
<p>Flip a copy of the staircase and fit it on top. The two together make an n × (n+1) rectangle. So one staircase = <strong>n(n+1)/2</strong>.</p>
<div class="sub">Subgoal 3: the Big-O</div>
<p>n(n+1)/2 = n²/2 + n/2, which is <strong>O(n²)</strong>. Half a square is still a square's worth of growth.</p>
</div>
<p>Where it shows up: <code>for i: for j &lt; i</code> (each pair once), insertion sort's worst case, and "compare each element with all earlier ones".</p>`,
      qs: [
        { type: 'num', q: `1 + 2 + … + 100 = ?`, a: 5050, why: '100 · 101 / 2 = 5050. Two staircases make a 100 × 101 rectangle.' },
        { type: 'num', q: `How many times does <code>work()</code> run for n = 20?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; i; j++) work();</code></pre>`, a: 190, why: 'Row i does i units: 0 + 1 + … + 19 = 19 · 20 / 2 = 190.' },
        { type: 'mcq', q: `Why is "for i, for j &lt; i" O(n²) even though it does only about half the work of a full double loop?`, opts: ['Half of n² is still a constant times n²', 'Because j eventually reaches n as well', 'Because the two loops are both nested', 'It is not; it is O(n log n) instead'], a: 0, why: 'n²/2 differs from n² by the constant ½, which Big-O drops (F01).' },
        { type: 'free', q: `Explain, using only the picture, why 1 + 2 + … + n is n(n+1)/2. No algebra.`, model: `<p>Draw the terms as columns of height 1..n: a staircase. Take a second copy, rotate it 180°, and set it on top of the first. The steps interlock into a rectangle n columns wide and n+1 tall. The rectangle has n(n+1) cells and is exactly two staircases, so one staircase has n(n+1)/2.</p>`, rubric: ['Represents the sum as a staircase of columns', 'Two copies (one rotated) interlock into an n by (n+1) rectangle', 'So one staircase is half the rectangle: n(n+1)/2'] },
        { type: 'num', q: `Sum of 1 + 2 + … + 1000, rounded to the nearest thousand?`, a: 500000, tol: 1000, why: '1000 · 1001 / 2 = 500,500, about n²/2.' }
      ]
    },
    {
      title: 'The geometric sum: the last term beats all the rest',
      teach: `
<p>1 + 2 + 4 + 8 + … + 2ᵏ. Each term <strong>doubles</strong>. Draw the columns:</p>
<figure class="fig"><svg viewBox="0 0 300 150" width="300" role="img" aria-label="doubling columns">
<g transform="translate(20,10)" style="fill:var(--accent);opacity:.85">
<rect x="0" y="118" width="40" height="2"/><rect x="45" y="116" width="40" height="4"/><rect x="90" y="112" width="40" height="8"/><rect x="135" y="104" width="40" height="16"/><rect x="180" y="88" width="40" height="32"/><rect x="225" y="56" width="40" height="64"/></g>
<text x="150" y="146" text-anchor="middle" font-size="11" style="fill:var(--soft)">1, 2, 4, 8, 16, 32: the last bar is taller than the others stacked</text>
</svg></figure>
<div class="ex">
<div class="sub">Subgoal 1: stack the earlier terms</div>
<p>1 + 2 + 4 + 8 + 16 = 31, and the next term is 32. It's always one short: 1 + 2 + … + 2ᵏ⁻¹ = 2ᵏ − 1.</p>
<div class="sub">Subgoal 2: why "always one short"</div>
<p>Start at 1 and keep adding the next term: 1 + 1 = 2, 2 + 2 = 4, 4 + 4 = 8, … The running total is always one less than the next term. (Or binary: 11111 + 1 = 100000.)</p>
<div class="sub">Subgoal 3: the rule</div>
<p><strong>1 + 2 + … + 2ᵏ = 2ᵏ⁺¹ − 1 &lt; 2 × (last term).</strong> A doubling sum is dominated by its last term: the whole sum is less than twice it.</p>
</div>
<p>Contrast with the arithmetic sum, where the last term (n) is a tiny fraction of the total (n²/2). <strong>That difference is the entire reason array doubling is O(1) amortized</strong> and growing by a constant is not (F04).</p>`,
      qs: [
        { type: 'num', q: `1 + 2 + 4 + … + 512 = ?`, a: 1023, why: '512 = 2⁹, so the sum is 2¹⁰ − 1 = 1023, just under twice the last term.' },
        { type: 'mcq', q: `In 1 + 2 + 4 + … + 2ᵏ, what fraction of the total is the last term alone?`, opts: ['A bit more than half', 'About one over k', 'About a quarter', 'A vanishing fraction'], a: 0, why: 'Last term 2ᵏ; total 2ᵏ⁺¹ − 1. So the last term is just over half. Compare: the last term of 1 + … + n is only about 2/n of the total.' },
        { type: 'free', q: `Explain why 1 + 2 + 4 + … + 2ᵏ⁻¹ = 2ᵏ − 1 without using a formula: use either the running-total argument or binary.`, model: `<p>Running total: start with 1. Adding the next term (which equals the current total plus 1) always doubles "total + 1": 1+1 = 2, 3+1 = 4, 7+1 = 8. So after reaching 2ᵏ⁻¹ the total is 2ᵏ − 1. Binary: the sum is k ones (111…1), and adding 1 carries to 1000…0 = 2ᵏ, so the sum is 2ᵏ − 1.</p>`, rubric: ['Gives a real mechanism (the running total stays one below the next term, or binary 111…1 + 1 = 1000…0)', 'Concludes the sum of all earlier terms is one less than the next term'] },
        { type: 'num', q: `Sum of 3 + 6 + 12 + 24 + 48 + 96?`, a: 189, why: 'It is 3 × (1 + 2 + … + 32) = 3 × 63 = 189: still under 2 × 96.' },
        { type: 'mcq', q: `Which sum is O(last term)?`, opts: ['1 + 2 + 4 + … + n', '1 + 2 + 3 + … + n', '1 + 1 + 1 + … + 1 (n ones)', 'n + n + n + … (n times)'], a: 0, why: 'Only the geometric sum is bounded by a constant times its last term (&lt; 2n). The arithmetic sum is ~n²/2 with last term n.' }
      ]
    },
    {
      title: 'Halving sums: n + n/2 + n/4 + … &lt; 2n',
      teach: `
<p>Read the geometric sum backwards: <strong>n + n/2 + n/4 + … + 1</strong>. It's the same doubling series, so it's <strong>less than 2n</strong>.</p>
<figure class="fig"><svg viewBox="0 0 320 60" width="320" role="img" aria-label="bar split into halves">
<g transform="translate(10,10)"><rect x="0" y="0" width="150" height="24" style="fill:var(--accent)"/><rect x="150" y="0" width="75" height="24" style="fill:var(--accent);opacity:.75"/><rect x="225" y="0" width="37.5" height="24" style="fill:var(--accent);opacity:.55"/><rect x="262.5" y="0" width="18.75" height="24" style="fill:var(--accent);opacity:.4"/><rect x="281.25" y="0" width="9.4" height="24" style="fill:var(--accent);opacity:.3"/><rect x="0" y="0" width="300" height="24" style="fill:none;stroke:var(--ink)"/></g>
<text x="160" y="52" text-anchor="middle" font-size="11" style="fill:var(--soft)">n, n/2, n/4 … never fill the 2n bar</text></svg></figure>
<div class="ex">
<div class="sub">Worked example: find the median, the fast way</div>
<p>Quickselect (average case) scans n elements, then recurses into about half: n + n/2 + n/4 + … &lt; 2n = <strong>O(n)</strong>, even though it has log n rounds.</p>
<div class="sub">The trap</div>
<p>"log n rounds, each up to n work, so O(n log n)": a true upper bound, but loose. The rounds <em>shrink</em>, so the sum is dominated by the first round.</p>
<div class="sub">Compare</div>
<p>If every round does n work (e.g. merge sort: each level of the recursion tree handles all n elements), then log n rounds really do cost n log n. <strong>Shrinking rounds sum to O(first round); equal rounds multiply.</strong></p>
</div>`,
      qs: [
        { type: 'num', q: `1000 + 500 + 250 + 125 + … (keep halving, forever). What does it approach?`, a: 2000, why: 'n + n/2 + n/4 + … approaches 2n from below.' },
        { type: 'mcq', q: `An algorithm does n work, then n/2, then n/4, … until 1. Tightest bound?`, opts: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], a: 0, why: 'A halving series sums to less than 2n. The first round dominates.' },
        { type: 'mcq', q: `Merge sort does n work at each of log n levels. Why isn't it O(n) like the halving sum?`, opts: ['Its per-level work does not shrink', 'Merging is slower than scanning', 'The recursion tree is not balanced', 'It sorts the whole input twice'], a: 0, why: 'Each level processes all n elements (split into more, smaller pieces), so the levels are equal, not shrinking: n × log n.' },
        { type: 'free', q: `Someone argues quickselect is O(n log n): "log n rounds, each at most n". Explain what's true and what's wrong about that.`, model: `<p>It's a valid <em>upper bound</em> but not tight. The rounds shrink: n, n/2, n/4, … (on average), so the total is a halving series, less than 2n, i.e. O(n). "At most n per round" throws away the fact that later rounds are much cheaper. The total is dominated by the first round.</p>`, rubric: ['Acknowledges n log n is an upper bound, just not tight', 'The per-round work halves, so it is a geometric (halving) series', 'That series is below 2n, so O(n)'] }
      ]
    },
    {
      title: 'Which sum is this loop computing?',
      teach: `
<p>Given a loop, decide which sum describes it, then read off the complexity.</p>
<div class="ex">
<div class="sub">Worked example A: arithmetic</div>
<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = i; j &lt; n; j++) work();   // n + (n-1) + ... + 1 = n(n+1)/2  → O(n²)</code></pre>
<div class="sub">Worked example B: geometric</div>
<pre><code>for (int size = 1; size &lt; n; size *= 2)
    for (int j = 0; j &lt; size; j++) work(); // 1 + 2 + 4 + ... &lt; 2n  → O(n)</code></pre>
<div class="sub">Worked example C: equal rounds</div>
<pre><code>for (int size = 1; size &lt; n; size *= 2)
    for (int j = 0; j &lt; n; j++) work();    // n + n + ... (log n times)  → O(n log n)</code></pre>
<div class="sub">The method</div>
<p>(1) Write the inner count as a function of the outer variable. (2) Is it <em>growing/shrinking by adding</em> (arithmetic), <em>by multiplying</em> (geometric), or <em>constant</em> (rounds × work)? (3) Apply the matching picture.</p>
</div>
<p>B and C look almost identical. The only difference is whether the inner bound is <code>size</code> or <code>n</code>, and it changes the answer by a log factor. Read the bounds, not the shape.</p>`,
      qs: [
        { type: 'mcq', q: `Complexity?<pre><code>for (int size = n; size &gt; 0; size /= 2)
    for (int j = 0; j &lt; size; j++) work();</code></pre>`, opts: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], a: 0, why: 'Inner work n, n/2, n/4, …: a halving series, &lt; 2n.' },
        { type: 'mcq', q: `Complexity?<pre><code>for (int i = 1; i &lt; n; i *= 2)
    for (int j = 0; j &lt; n; j++) work();</code></pre>`, opts: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], a: 0, why: 'log n rounds, each exactly n: equal rounds multiply.' },
        { type: 'num', q: `Exactly how many times does <code>work()</code> run for n = 64?<pre><code>for (int size = 1; size &lt; n; size *= 2)
    for (int j = 0; j &lt; size; j++) work();</code></pre>`, a: 63, why: 'size = 1, 2, 4, 8, 16, 32 (64 stops the loop): 1 + 2 + … + 32 = 63.' },
        { type: 'free', q: `Two loops differ only in the inner bound: <code>j &lt; size</code> vs <code>j &lt; n</code>, with <code>size</code> doubling up to n. Explain why one is O(n) and the other O(n log n), with the bar pictures.`, model: `<p>With <code>j &lt; size</code> the bars are 1, 2, 4, …, n/2: each doubles, so the last bar is bigger than all earlier ones combined and the total is under 2n: O(n). With <code>j &lt; n</code> every one of the log n bars has height n: the bars are equal, so the total is n × log n.</p>`, rubric: ['j &lt; size: doubling bars form a geometric series bounded by ~2n', 'j &lt; n: log n equal bars of height n, total n log n', 'Identifies the inner bound as the only difference that matters'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `How many times does <code>work()</code> run for n = 10?<pre><code>for (int i = 1; i &lt;= n; i++)
    for (int j = 1; j &lt;= i; j++) work();</code></pre>`, a: 55, why: '1 + 2 + … + 10 = 55.' },
    { type: 'mcq', q: `Complexity?<pre><code>for (int k = 1; k &lt; n; k *= 2)
    for (int j = 0; j &lt; k; j++)
        for (int t = 0; t &lt; 3; t++) work();</code></pre>`, opts: ['O(n)', 'O(n log n)', 'O(3ⁿ)', 'O(n²)'], a: 0, why: 'Inner two loops do 3k work; k doubles, so the total is 3 × (1 + 2 + … ) &lt; 6n.' },
    { type: 'free', q: `A dynamic array grows by <em>doubling</em>. Appending n items copies 1 + 2 + 4 + … elements in total. Another grows by <em>+1 each time</em>, copying 1 + 2 + 3 + … Compare the total copy cost of each, using the two pictures.`, model: `<p>Doubling: the copy costs form a geometric series whose last term is at most n; the whole sum is under 2n, so O(n) total, O(1) per append. +1 growth: the copy costs are 1 + 2 + … + n, a staircase filling half an n × n square, so about n²/2 total, O(n) per append. The difference is the shape: doubling bars are dominated by the last one, staircase bars are not.</p>`, rubric: ['Doubling: geometric sum, below 2n, so O(n) total', '+1 growth: arithmetic sum, about n²/2, so O(n²) total', 'Explains the difference: in a doubling series the last term dominates; in a staircase it is a vanishing fraction'] },
    { type: 'num', q: `n + n/2 + n/4 + … + 1 for n = 1024. Exact value?`, a: 2047, why: 'It is 1 + 2 + … + 1024 read backwards: 2 · 1024 − 1.' },
    { type: 'mcq', q: `A recursion does n work at the top, then two calls on n/2 (n total), then four on n/4 (n total)… for log n levels. Total?`, opts: ['O(n log n)', 'O(n)', 'O(log² n)', 'O(n² log n)'], a: 0, why: 'Each level sums to n; there are log n levels, so equal rounds multiply. (F06 formalises this.)' },
    { type: 'mcq', q: `Which is the tightest bound for 1² + 2² + … + n²?`, opts: ['O(n³)', 'O(n²)', 'O(2ⁿ)', 'O(n² log n)'], a: 0, why: 'Transfer: there are n terms, and the top half of them are each at least n²/4, so the sum is at least (n/2)(n²/4) = n³/8, and at most n · n². So Θ(n³).' }
  ]
});
