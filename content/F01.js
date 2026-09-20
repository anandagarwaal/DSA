COURSE.topic({
  id: 'F01',
  intro: `Big-O is not a formula to memorise. It is a claim about <em>shape</em>: how the work grows when the input grows. Every complexity argument later in the course (amortized cost, the log in binary search, why a sliding window is linear) is built on this one idea.`,
  kps: [
    {
      title: 'Count the work as a function of n',
      teach: `
<p>Before any notation: <strong>count how many times the innermost line runs</strong>, as a formula in <code>n</code>.</p>
<div class="ex">
<div class="sub">Worked example: three loops</div>
<pre><code>// A: one loop
for (int i = 0; i &lt; n; i++) count++;            // runs n times

// B: two loops, one after the other
for (int i = 0; i &lt; n; i++) count++;
for (int j = 0; j &lt; n; j++) count++;            // n + n = 2n

// C: nested
for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; n; j++) count++;        // n rows of n = n * n</code></pre>
<div class="sub">Subgoal 1: how often does the outer loop run?</div>
<p>In C the outer loop runs <code>n</code> times.</p>
<div class="sub">Subgoal 2: how often does the inner loop run per outer iteration?</div>
<p><code>n</code> times, and that doesn't depend on <code>i</code>.</p>
<div class="sub">Subgoal 3: combine</div>
<p><strong>One after the other → add. Nested → multiply.</strong> So B is <code>2n</code>, C is <code>n²</code>.</p>
</div>
<p><strong>The picture.</strong> A nested loop fills a grid: every (i, j) cell is one unit of work. If the inner bound depends on <code>i</code> (e.g. <code>j &lt; i</code>), you are filling a <em>staircase</em> instead of the whole square, roughly half of it.</p>
<figure class="fig"><svg viewBox="0 0 320 130" width="320" role="img" aria-label="square grid vs staircase">
<g transform="translate(10,10)" style="fill:none;stroke:var(--ink)">
<path d="M0 0 H110 V110 H0 Z" style="fill:var(--code-bg)"/>
<path d="M180 110 V0 H194 V14 H208 V28 H222 V42 H236 V56 H250 V70 H264 V84 H278 V98 H290 V110 Z" style="fill:var(--code-bg)"/>
</g>
<text x="65" y="128" text-anchor="middle" font-size="11" style="fill:var(--soft)">j &lt; n: n² cells</text>
<text x="245" y="128" text-anchor="middle" font-size="11" style="fill:var(--soft)">j &lt; i: about n²/2 cells</text>
</svg><figcaption>A nested loop fills an area; the inner bound decides the shape of that area.</figcaption></figure>
<p>A loop that <em>doubles</em> its variable (<code>i *= 2</code>) is different: it doesn't walk n steps, it takes as many steps as you can double 1 before passing n. That's about log₂ n steps (topic F02).</p>`,
      qs: [
        { type: 'num', q: `How many times does <code>count++</code> run when <code>n = 10</code>?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; n; j++) count++;</code></pre>`, a: 100, why: 'Nested: 10 outer iterations, each with 10 inner, so 10 × 10 cells of the grid.' },
        { type: 'num', q: `How many times does <code>count++</code> run when <code>n = 10</code>?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = i + 1; j &lt; n; j++) count++;</code></pre>`, a: 45, why: 'Row i contributes n−1−i cells: 9 + 8 + … + 0 = 45. The staircase: the 10 × 10 square minus the diagonal (10), halved: (100 − 10)/2 = 45. Still grows like n².' },
        { type: 'mcq', q: `How many times does the body run, as a function of n?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; 5; j++) work();</code></pre>`, opts: ['5n, so it grows like n', 'n², since the loops are nested', 'n + 5, add the two bounds', '5ⁿ, one power per nested loop'], a: 0, why: 'Nesting multiplies the <em>bounds</em>: n × 5. The inner bound is a constant, so the grid is n by 5, a thin strip, not a square. Nesting alone does not make a loop quadratic.' },
        { type: 'free', q: `Explain, using the grid picture, why two loops of n <em>in sequence</em> cost 2n but two loops of n <em>nested</em> cost n². What does each unit of work correspond to in each case?`, model: `<p>In sequence, the first loop does n units and <em>finishes</em>, then the second does n more: two separate rows of n cells, 2n in total. Nested, the inner loop re-runs completely <em>for every</em> outer iteration, so each (i, j) pair is a unit of work: an n-by-n grid, n² cells.</p>`, rubric: ['Sequential: the loops do not repeat each other, so their counts add (n + n)', 'Nested: the inner loop runs in full once per outer iteration, so counts multiply', 'Names the unit: in the nested case each unit of work is one (i, j) pair / grid cell'] },
        { type: 'mcq', q: `Which loop runs about log₂ n times?`, opts: ['<code>for (i = 1; i &lt; n; i *= 2)</code>', '<code>for (i = 0; i &lt; n; i += 2)</code>', '<code>for (i = n; i &gt; 0; i -= 2)</code>', '<code>for (i = 0; i * i &lt; n; i++)</code>'], a: 0, why: 'Doubling reaches n after log₂ n steps. Stepping by 2 still takes n/2 steps, which is linear. i·i &lt; n takes √n steps.' }
      ]
    },
    {
      title: 'Drop constants and lower-order terms, and know why',
      teach: `
<p>Suppose you counted <code>f(n) = 3n² + 100n + 5000</code>. Big-O says <strong>O(n²)</strong>. That isn't laziness. Look at who does the work as n grows:</p>
<table><tr><th>n</th><th>3n²</th><th>100n</th><th>5000</th><th>share of 3n²</th></tr>
<tr><td>10</td><td>300</td><td>1,000</td><td>5,000</td><td>5%</td></tr>
<tr><td>1,000</td><td>3,000,000</td><td>100,000</td><td>5,000</td><td>97%</td></tr>
<tr><td>1,000,000</td><td>3×10¹²</td><td>10⁸</td><td>5,000</td><td>99.997%</td></tr></table>
<div class="sub">Why lower-order terms go</div>
<p>For large n, the fastest-growing term is essentially the whole cost. Interviews ask about large n.</p>
<div class="sub">Why constant factors go</div>
<p>The "3" depends on the machine, the language and the compiler. It's not a property of the algorithm. Growth <em>class</em> is. And a better class wins eventually, <em>whatever the constants</em>:</p>
<figure class="fig"><svg viewBox="0 0 360 230" width="360" role="img" aria-label="100n vs n squared crossing at n = 100">
<g transform="translate(40,10)">
<line x1="0" y1="200" x2="300" y2="200" style="stroke:var(--soft)"/><line x1="0" y1="0" x2="0" y2="200" style="stroke:var(--soft)"/>
<polyline points="0,200 300,100" style="fill:none;stroke:var(--good);stroke-width:2.5"/>
<polyline points="0,200 37.5,196.9 75,187.5 112.5,171.9 150,150 187.5,121.9 225,87.5 262.5,46.9 300,0" style="fill:none;stroke:var(--accent);stroke-width:2.5"/>
<circle cx="150" cy="150" r="4" style="fill:var(--ink)"/>
<text x="155" y="168" font-size="11" style="fill:var(--ink)">cross at n = 100</text>
<text x="235" y="95" font-size="12" style="fill:var(--good)">100n</text>
<text x="250" y="20" font-size="12" style="fill:var(--accent)">n²</text>
<text x="150" y="218" text-anchor="middle" font-size="11" style="fill:var(--soft)">n (0 to 200)</text>
</g></svg><figcaption>n² starts below 100n but crosses at n = 100 and never comes back. That's all "O(n) beats O(n²)" means.</figcaption></figure>
<p><strong>But</strong>: between two algorithms in the <em>same</em> class, or at small n, constants are exactly what decide it. Big-O is a statement about the long run, not a stopwatch.</p>`,
      qs: [
        { type: 'mcq', q: `Simplify <code>5n² + 1000n + 7</code> to Big-O.`, opts: ['O(n²)', 'O(1000n)', 'O(5n²)', 'O(n³)'], a: 0, why: 'Keep the fastest-growing term and drop its constant. 1000n is lower order: it is overtaken once n &gt; 200.' },
        { type: 'num', q: `Algorithm A does 100n operations; B does n². Past what value of n is A always faster?`, a: 100, why: 'They are equal when 100n = n², i.e. n = 100. Below that B is faster; above it A wins, forever.' },
        { type: 'free', q: `A takes 100n steps, B takes n². At n = 50, B is faster. Does that contradict "A is O(n), B is O(n²), so A is better"? Explain.`, model: `<p>No contradiction. At n = 50: A = 5,000 and B = 2,500, so B is faster. Big-O describes growth as n increases. The curves cross at n = 100, and beyond it A is faster for every larger n. "Better class" means "wins for all large enough n", not "wins at every n".</p>`, rubric: ['Computes or states that B is faster below the crossover (5,000 vs 2,500 at n = 50)', 'Identifies the crossover at n = 100, beyond which A always wins', 'States Big-O is a claim about large-n growth, not about every n'] },
        { type: 'mcq', q: `Which is <em>not</em> equivalent to the others in Big-O?`, opts: ['O(n log n + n)', 'O(3n log n)', 'O(n log n + 500)', 'O(n log n · log n)'], a: 3, why: 'n log n · log n = n (log n)² is a strictly faster-growing class. The others all simplify to O(n log n).' },
        { type: 'num', q: `For <code>3n² + 100n</code> at n = 1,000, what percentage of the total comes from the 3n² term? (round to a whole number)`, a: 97, tol: 1, why: '3,000,000 / 3,100,000 ≈ 96.8%. Already at n = 1000 the lower-order term is noise.' }
      ]
    },
    {
      title: 'Rank the growth classes and estimate real running time',
      teach: `
<p>The classes you'll meet, slowest-growing first: <strong>1 &lt; log n &lt; √n &lt; n &lt; n log n &lt; n² &lt; n³ &lt; 2ⁿ &lt; n!</strong></p>
<div class="sub">Rule of thumb for time</div>
<p>A Java solution does roughly <strong>10⁸ simple operations per second</strong>, give or take a factor of a few. Online judges give ~1–2 s. So your budget is about <strong>10⁸</strong> ops.</p>
<div class="ex">
<div class="sub">Worked example: n = 10⁵</div>
<table><tr><th>class</th><th>ops at n = 10⁵</th><th>verdict</th></tr>
<tr><td>log n</td><td>≈ 17</td><td>instant</td></tr>
<tr><td>n</td><td>10⁵</td><td>instant</td></tr>
<tr><td>n log n</td><td>≈ 1.7 × 10⁶</td><td>fine</td></tr>
<tr><td>n²</td><td>10¹⁰</td><td>≈ 100 s → too slow</td></tr>
<tr><td>2ⁿ</td><td>more than atoms in the universe</td><td>never</td></tr></table>
<p>How to get log₂ 10⁵ quickly: 2¹⁰ ≈ 10³, so 10⁵ ≈ 2^16.6, about 17.</p>
</div>
<div class="sub">The picture: what doubling n does</div>
<p>Double n and n work doubles; n² work <strong>quadruples</strong> (a square with doubled side holds four of the old squares); log n work goes up by just <strong>1</strong> (one more halving); 2ⁿ work <em>squares</em>.</p>`,
      qs: [
        { type: 'mcq', q: `Which list is ordered from slowest-growing to fastest-growing?`, opts: ['log n, √n, n log n, n², 2ⁿ', '√n, log n, n log n, 2ⁿ, n²', 'log n, n log n, √n, n², 2ⁿ', 'log n, √n, n², n log n, 2ⁿ'], a: 0, why: 'Any power of n (even √n) beats any power of log n; n log n sits between n and n²; any exponential beats any polynomial.' },
        { type: 'num', q: `About how many seconds would an n² algorithm take at n = 10⁵, at 10⁸ operations per second?`, a: 100, tol: 20, why: '(10⁵)² = 10¹⁰ ops ÷ 10⁸ ops/s = 100 s. This is why n = 10⁵ rules out O(n²).' },
        { type: 'num', q: `Roughly what is log₂ of 1,000,000? (nearest whole number)`, a: 20, tol: 1, why: '2¹⁰ ≈ 10³, so 2²⁰ ≈ 10⁶. A binary search over a million items needs about 20 steps.' },
        { type: 'free', q: `An O(n²) job takes 1 minute at n = 10,000. Predict the time at n = 20,000, and explain it with a picture, not just algebra.`, model: `<p>About <strong>4 minutes</strong>. The work is the area of an n-by-n square. Doubling the side gives a square that holds four copies of the original: (2n)² = 4n².</p>`, rubric: ['Predicts about 4 minutes (a factor of 4, not 2)', 'Explains geometrically: doubled side of a square gives 4 copies of the original area'] },
        { type: 'mcq', q: `An O(log n) algorithm takes 20 steps at n = 10⁶. About how many at n = 10¹²?`, opts: ['40 steps', '20 million steps', '400 steps', '10⁶ steps'], a: 0, why: 'Squaring n only doubles log n: log₂ 10¹² ≈ 40. Logarithmic algorithms barely notice input growth.' }
      ]
    },
    {
      title: 'Time vs extra space',
      teach: `
<p><strong>Extra (auxiliary) space</strong> counts the memory your algorithm allocates <em>beyond</em> the input. The input is given. You didn't create it. Unless stated, the output you're required to return isn't counted either.</p>
<div class="ex">
<div class="sub">Worked example: three ways to spot a duplicate in int[] a</div>
<table><tr><th>approach</th><th>time</th><th>extra space</th></tr>
<tr><td>compare every pair</td><td>O(n²)</td><td>O(1): two indices</td></tr>
<tr><td>HashSet of values seen so far</td><td>O(n)</td><td>O(n): the set can hold every element</td></tr>
<tr><td>sort in place, compare neighbours</td><td>O(n log n)</td><td>O(1) with heapsort (Java's primitive sort uses O(log n) stack)</td></tr></table>
<div class="sub">The lesson</div>
<p>You often <strong>pay memory to buy time</strong>. Saying that trade-off out loud, unprompted, is a Staff-level signal.</p>
</div>
<p>Things that <em>do</em> count: data structures you build, copies of the input, and the <strong>recursion call stack</strong> (depth d costs O(d) space, topic F05). A fixed number of int variables is O(1), however many there are, as long as that number doesn't depend on n.</p>`,
      qs: [
        { type: 'mcq', q: `Reversing an array in place by swapping a[i] and a[n−1−i] for i &lt; n/2. Extra space?`, opts: ['O(1)', 'O(n)', 'O(n/2)', 'O(log n)'], a: 0, why: 'Only an index and a temp variable, a fixed amount regardless of n. The array itself is input.' },
        { type: 'multi', q: `Which of these count toward <em>extra</em> space?`, opts: ['A HashMap you build from the input', 'The input array you were given', 'The recursion call stack', 'A copy of the input you sort'], a: [0, 2, 3], why: 'Anything you allocate counts, including stack frames. The given input does not.' },
        { type: 'free', q: `Detecting a duplicate: HashSet gives O(n) time, sorting gives O(n log n). Why might an interviewer still want the sorting approach? Name the trade-off precisely.`, model: `<p>The HashSet solution uses O(n) extra memory; sorting in place uses O(1) (or O(log n)) extra. So it's a <strong>time vs space trade-off</strong>: the hash set spends memory to save a log factor of time. If memory is constrained, or the input may be modified, sorting wins. (Sorting also destroys the original order, which may matter.)</p>`, rubric: ['States the HashSet costs O(n) extra space while in-place sorting costs O(1)/O(log n)', 'Frames it as a trade: memory spent to save time (a log factor)', 'Names when sorting is preferable (memory limits / input may be mutated)'] },
        { type: 'mcq', q: `A function creates 26 counters, one per lowercase letter, then scans a string of length n. Extra space?`, opts: ['O(1)', 'O(n)', 'O(26n)', 'O(log n)'], a: 0, why: '26 is fixed: it does not grow with n. Bounded key ranges give O(1) space (this matters again in F11, hash tables vs arrays).' },
        { type: 'mcq', q: `Recursive function f(n) calls f(n−1) once and does O(1) other work. Extra space?`, opts: ['O(n), for n frames on the stack', 'O(1), no data structures', 'O(log n), for the call depth', 'O(n²), for the calls times frames'], a: 0, why: 'At the deepest point n calls are alive at once, each holding a stack frame. The call stack counts.' }
      ]
    },
    {
      title: 'Read the constraints: they tell you the target complexity',
      teach: `
<p>Combine the 10⁸ budget with the input bound and you can work out the intended complexity <strong>before designing anything</strong>:</p>
<table><tr><th>n up to</th><th>affordable</th><th>typical technique</th></tr>
<tr><td>10–12</td><td>O(n!)</td><td>permutations</td></tr>
<tr><td>20–25</td><td>O(2ⁿ)</td><td>subsets / bitmask</td></tr>
<tr><td>≈ 500</td><td>O(n³)</td><td>triple loop, interval DP</td></tr>
<tr><td>≈ 5,000</td><td>O(n²)</td><td>pairs, 2D DP</td></tr>
<tr><td>10⁵ – 10⁶</td><td>O(n log n) or O(n)</td><td>sorting, heaps, hashing, two pointers</td></tr>
<tr><td>10⁹ and up</td><td>O(log n) or O(1)</td><td>binary search, math</td></tr></table>
<div class="ex">
<div class="sub">Worked example</div>
<p>"Given up to 2 × 10⁵ integers…": n² = 4 × 10¹⁰, far over budget. So the answer is O(n log n) or better. That rules out every pair-comparison idea and points at sorting, hashing or a linear scan.</p>
<p>How the table's rows are derived: n² ≤ 10⁸ gives n ≤ 10⁴; n³ ≤ 10⁸ gives n ≈ 460; 2ⁿ ≤ 10⁸ gives n ≈ 26.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Constraint: 1 ≤ n ≤ 10⁵. Which target should you aim for?`, opts: ['O(n log n) or better', 'O(n²) is comfortably fine', 'O(2ⁿ) with good pruning', 'O(n³) with small constants'], a: 0, why: 'n² = 10¹⁰ is about 100 s. Only O(n log n)/O(n) fit the ~10⁸ budget.' },
        { type: 'mcq', q: `Constraint: n ≤ 20. What does this most strongly suggest?`, opts: ['Exponential search over subsets is intended', 'A linear scan is the only way through', 'Binary search on the answer range', 'Hashing to get constant-time lookups'], a: 0, why: '2²⁰ ≈ 10⁶. A tiny bound like this is a hint that exponential (subsets/backtracking/bitmask) is acceptable.' },
        { type: 'num', q: `Largest n (to the nearest thousand) for which an n² algorithm stays within 10⁸ operations?`, a: 10000, tol: 500, why: 'n² ≤ 10⁸ gives n ≤ 10⁴.' },
        { type: 'free', q: `A problem says n can be as large as 10⁹ (e.g. "find the integer square root of n"). What does that single constraint tell you, and why?`, model: `<p>Even <em>reading</em> or looping over 1..n is 10⁹ operations, about 10 s, so O(n) is too slow. You need <strong>O(log n)</strong> (e.g. binary search over the answer range) or O(1) math. The constraint rules out any approach that touches every value.</p>`, rubric: ['Notes that O(n) = 10⁹ ops exceeds the ~10⁸ budget', 'Concludes the target is O(log n) or O(1)', 'Connects it to a technique (binary search over the value range, or math)'] },
        { type: 'mcq', q: `n ≤ 500. Which is the most plausible intended complexity?`, opts: ['O(n³)', 'O(n!)', 'O(2ⁿ)', 'O(log n)'], a: 0, why: '500³ ≈ 1.25 × 10⁸, right at the budget. Bounds around a few hundred usually signal a cubic DP or triple loop.' }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `How many times does <code>work()</code> run when n = 1024?<pre><code>for (int i = 1; i &lt;= n; i *= 2)
    for (int j = 0; j &lt; n; j++) work();</code></pre>`, a: 11264, why: 'Outer: i = 1, 2, 4, …, 1024, which is 11 values (log₂ 1024 + 1). Inner: 1024 each. 11 × 1024 = 11,264, so O(n log n).' },
    { type: 'mcq', q: `Complexity of this loop?<pre><code>for (int i = 0; i &lt; n; i++)
    for (int j = 0; j &lt; i * i; j++) work();</code></pre>`, opts: ['O(n³)', 'O(n²)', 'O(n² log n)', 'O(n⁴)'], a: 0, why: 'Row i does i² work: 0² + 1² + … + (n−1)² ≈ n³/3. Nested loops multiply bounds; here the inner bound is itself quadratic.' },
    { type: 'free', q: `A colleague says: "My O(n) solution does 50n operations, yours does 2·n·log₂n. Mine is always faster." Evaluate the claim with numbers.`, model: `<p>Wrong as stated. 50n &lt; 2n log₂ n only when log₂ n &gt; 25, i.e. n &gt; 2²⁵ ≈ 3.3 × 10⁷. For every realistic input up to 10⁶ (log₂ n ≈ 20, so 40n), the n log n solution does <em>fewer</em> operations. Big-O says the O(n) one wins eventually. Constants decide which wins at the sizes you actually run.</p>`, rubric: ['Sets up the comparison 50n vs 2n·log₂n and finds the crossover (log₂ n = 25, n ≈ 3 × 10⁷)', 'Concludes the n log n solution is faster for practical n (e.g. n = 10⁶)', 'States that Big-O is asymptotic and constants matter at real sizes'] },
    { type: 'mcq', q: `Constraint: n ≤ 5,000. Which approach is acceptable?`, opts: ['An O(n²) double loop over pairs', 'An O(n³) triple loop over triples', 'An O(2ⁿ) search over all subsets', 'An O(n!) search over permutations'], a: 0, why: '5000² = 2.5 × 10⁷, within budget. 5000³ = 1.25 × 10¹¹ is not.' },
    { type: 'num', q: `Estimate the running time, in milliseconds, of an n log₂ n algorithm at n = 10⁶, assuming 10⁸ ops/s.`, a: 200, tol: 60, why: '10⁶ × 20 = 2 × 10⁷ ops ÷ 10⁸ ops/s = 0.2 s = 200 ms.' },
    { type: 'free', q: `Explain to a junior engineer, <em>without</em> using the words "Big-O" or "asymptotic", why we ignore the 3 in 3n² but not the square.`, model: `<p>The 3 depends on the machine and the implementation: a faster computer or tighter code changes it, and it only scales the time by a fixed amount. The square describes how the work <em>reacts to growth</em>: double the input and the work quadruples, on any machine. Once the input is large, a quantity that grows faster always overtakes one that grows slower, however the fixed multipliers compare.</p>`, rubric: ['The constant is a fixed multiplier set by machine/implementation, not the algorithm', 'The exponent describes how work scales when the input grows (e.g. doubling n quadruples n²)', 'Faster growth eventually overtakes any constant-factor advantage'] }
  ]
});
