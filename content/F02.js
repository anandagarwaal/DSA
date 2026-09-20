COURSE.topic({
  id: 'F02',
  intro: `Logarithms show up everywhere in DSA: binary search, balanced trees, heaps, merge sort. The one idea that explains all of them: <strong>log₂ n counts how many times you can halve n before you hit 1</strong>. If you can see the halving, you can see the log.`,
  kps: [
    {
      title: 'log₂ n is the number of halvings',
      teach: `
<p>Forget the calculator definition for a moment. Ask: <em>starting from n, how many times can I cut it in half until only 1 is left?</em></p>
<div class="ex">
<div class="sub">Worked example: n = 32</div>
<p>32 → 16 → 8 → 4 → 2 → 1. That is <strong>5</strong> halvings, and 2⁵ = 32. So log₂ 32 = 5.</p>
<div class="sub">Running it backwards</div>
<p>Halving 5 times from 32 is the same as doubling 5 times from 1. So log₂ n is the answer to "2 to <em>what</em> gives n?", and the two definitions agree.</p>
<div class="sub">When n is not a power of 2</div>
<p>n = 100: 100 → 50 → 25 → 12 → 6 → 3 → 1 takes about 6–7 halvings. log₂ 100 ≈ 6.64. In complexity work we only care about this to within ±1.</p>
</div>
<figure class="fig"><svg viewBox="0 0 340 120" width="340" role="img" aria-label="interval halving">
<g style="stroke:var(--accent);stroke-width:6;stroke-linecap:butt">
<line x1="10" y1="15" x2="330" y2="15"/><line x1="10" y1="40" x2="170" y2="40"/><line x1="10" y1="65" x2="90" y2="65"/><line x1="10" y1="90" x2="50" y2="90"/><line x1="10" y1="112" x2="30" y2="112"/></g>
<g font-size="11" style="fill:var(--soft)"><text x="335" y="19" text-anchor="end" dy="-8">32</text><text x="175" y="44">16</text><text x="95" y="69">8</text><text x="55" y="94">4</text><text x="35" y="116">2 … 1</text></g>
</svg><figcaption>Each step keeps half. The number of steps, not the length, is log₂ n.</figcaption></figure>
<p>Anchor facts worth knowing cold: <strong>2¹⁰ = 1024 ≈ 10³</strong>, so log₂ 10³ ≈ 10, log₂ 10⁶ ≈ 20, log₂ 10⁹ ≈ 30.</p>`,
      qs: [
        { type: 'num', q: `How many halvings take 1024 down to 1?`, a: 10, why: '1024 = 2¹⁰: 1024 → 512 → … → 1 is 10 halvings.' },
        { type: 'num', q: `Estimate log₂(10⁹) to the nearest whole number.`, a: 30, tol: 1, why: '10⁹ = (10³)³ ≈ (2¹⁰)³ = 2³⁰.' },
        { type: 'mcq', q: `You double n from 1,000,000 to 2,000,000. What happens to log₂ n?`, opts: ['It increases by exactly 1', 'It doubles, from 20 to 40', 'It increases by about 20', 'It stays exactly the same'], a: 0, why: 'One more item-doubling means one more halving needed to get back down: log₂(2n) = log₂ n + 1.' },
        { type: 'free', q: `Without using the word "exponent", explain why a guessing game "higher/lower" on numbers 1..1,000,000 needs at most about 20 guesses.`, model: `<p>Each well-chosen guess (the middle) eliminates half of the remaining candidates. Starting from 10⁶ candidates, the count goes 10⁶ → 5·10⁵ → … and reaches 1 after about 20 halvings, because 2²⁰ ≈ 10⁶. So about 20 guesses always suffice.</p>`, rubric: ['Each guess halves the remaining range of candidates', 'Counts halvings: about 20 halvings take 10⁶ to 1 (since 2²⁰ ≈ 10⁶)'] },
        { type: 'mcq', q: `Which is closest to log₂ 5000?`, opts: ['12', '50', '2500', '8'], a: 0, why: '2¹² = 4096 and 2¹³ = 8192, so log₂ 5000 is between 12 and 13.' }
      ]
    },
    {
      title: 'Why the base does not matter in Big-O',
      teach: `
<p>Halving (log₂), cutting into thirds (log₃), or tenths (log₁₀): do they give different complexity classes? <strong>No.</strong></p>
<div class="ex">
<div class="sub">Worked example: n = 10⁶</div>
<p>log₂ 10⁶ ≈ 20, log₁₀ 10⁶ = 6. The ratio is 20/6 ≈ 3.32, and it's <em>the same ratio for every n</em>: log₂ n = log₂ 10 · log₁₀ n ≈ 3.32 · log₁₀ n.</p>
<div class="sub">Why that ratio is constant</div>
<p>Each tenth-cut is worth about 3.32 halvings, because cutting into tenths shrinks faster by a fixed amount. So any two bases differ by a constant factor, and Big-O drops constant factors (F01). So we just write <strong>O(log n)</strong>.</p>
</div>
<p><strong>Careful:</strong> the base of a log doesn't matter, but the base of an <em>exponential</em> does. 2ⁿ and 3ⁿ are different classes: 3ⁿ / 2ⁿ = 1.5ⁿ, which is not a constant.</p>`,
      qs: [
        { type: 'mcq', q: `Is O(log₂ n) the same class as O(log₁₀ n)?`, opts: ['Yes, they differ by a constant factor', 'No, log₂ n grows much faster', 'No, log₁₀ n grows much faster', 'Only when n is a power of ten'], a: 0, why: 'log₂ n ≈ 3.32 · log₁₀ n for every n. A constant factor, which Big-O ignores.' },
        { type: 'mcq', q: `Is O(2ⁿ) the same class as O(3ⁿ)?`, opts: ['No, their ratio 1.5ⁿ grows without bound', 'Yes, bases never matter in Big-O', 'Yes, both of them are exponential', 'Only if n is small like n under 20'], a: 0, why: 'The ratio between them grows with n, so it is not a constant factor. Contrast logs, where the ratio is fixed.' },
        { type: 'num', q: `An algorithm splits its input into 10 equal parts and recurses on one of them. About how many levels until size 1, for n = 10⁶?`, a: 6, why: 'Cutting by 10 each time: log₁₀ 10⁶ = 6 levels. Still O(log n). The base only changes the constant.' },
        { type: 'free', q: `Explain why log₂ n / log₁₀ n is the same number for every n, using the idea of "halvings vs tenth-cuts".`, model: `<p>One tenth-cut (dividing by 10) shrinks the input as much as log₂ 10 ≈ 3.32 halvings, since 2^3.32 ≈ 10. So however many tenth-cuts n needs, it needs 3.32 times as many halvings. The ratio depends only on the two bases, never on n.</p>`, rubric: ['One division by 10 equals a fixed number (≈ 3.32) of halvings', 'So the halving count is always that fixed multiple of the tenth-cut count, independent of n'] }
      ]
    },
    {
      title: 'A balanced binary tree has height log₂ n',
      teach: `
<p>This is the picture that makes logs visible in data structures.</p>
<figure class="fig"><svg viewBox="0 0 320 150" width="320" role="img" aria-label="complete binary tree with levels 1,2,4,8">
<g style="stroke:var(--soft)">
<line x1="160" y1="15" x2="80" y2="50"/><line x1="160" y1="15" x2="240" y2="50"/>
<line x1="80" y1="50" x2="40" y2="85"/><line x1="80" y1="50" x2="120" y2="85"/><line x1="240" y1="50" x2="200" y2="85"/><line x1="240" y1="50" x2="280" y2="85"/>
<line x1="40" y1="85" x2="20" y2="120"/><line x1="40" y1="85" x2="60" y2="120"/><line x1="120" y1="85" x2="100" y2="120"/><line x1="120" y1="85" x2="140" y2="120"/><line x1="200" y1="85" x2="180" y2="120"/><line x1="200" y1="85" x2="220" y2="120"/><line x1="280" y1="85" x2="260" y2="120"/><line x1="280" y1="85" x2="300" y2="120"/></g>
<g style="fill:var(--accent)"><circle cx="160" cy="15" r="6"/><circle cx="80" cy="50" r="6"/><circle cx="240" cy="50" r="6"/><circle cx="40" cy="85" r="6"/><circle cx="120" cy="85" r="6"/><circle cx="200" cy="85" r="6"/><circle cx="280" cy="85" r="6"/>
<circle cx="20" cy="120" r="6"/><circle cx="60" cy="120" r="6"/><circle cx="100" cy="120" r="6"/><circle cx="140" cy="120" r="6"/><circle cx="180" cy="120" r="6"/><circle cx="220" cy="120" r="6"/><circle cx="260" cy="120" r="6"/><circle cx="300" cy="120" r="6"/></g>
<g font-size="10" style="fill:var(--soft)"><text x="2" y="19">1</text><text x="2" y="54">2</text><text x="2" y="89">4</text><text x="2" y="146">8 leaves</text></g>
</svg><figcaption>Each level doubles. 8 leaves need only 3 edges from root to leaf: log₂ 8 = 3.</figcaption></figure>
<div class="ex">
<div class="sub">Subgoal 1: count per level</div>
<p>Level 0 has 1 node, level 1 has 2, level k has 2ᵏ.</p>
<div class="sub">Subgoal 2: invert</div>
<p>To hold n leaves, the bottom level k needs 2ᵏ ≥ n, so k ≈ log₂ n.</p>
<div class="sub">Subgoal 3: read it top-down</div>
<p>Walking from root to leaf, each step down discards half the remaining leaves. That's the halving picture again. So <strong>root-to-leaf paths are log n long</strong>. That's why heap push/pop and balanced-BST lookup cost O(log n).</p>
</div>
<p>Bonus fact, used later: the total node count 1 + 2 + … + 2ᵏ = 2ᵏ⁺¹ − 1, <em>just under twice the leaves</em>. Almost half of all nodes are leaves (F03).</p>`,
      qs: [
        { type: 'num', q: `A perfect binary tree has 1024 leaves. How many edges on a root-to-leaf path?`, a: 10, why: '2¹⁰ = 1024 leaves means 10 levels below the root.' },
        { type: 'num', q: `A perfect binary tree has 1024 leaves. How many nodes in total?`, a: 2047, why: '1 + 2 + … + 1024 = 2 · 1024 − 1 = 2047. The leaves are about half of everything.' },
        { type: 'mcq', q: `Why is a heap insert O(log n) and not O(n)?`, opts: ['It only moves along one root-leaf path', 'It touches each of the n nodes once', 'It sorts the whole array every time', 'It hashes the key to a slot directly'], a: 0, why: 'Sift-up swaps with the parent repeatedly: at most one step per level, and a complete tree has log n levels.' },
        { type: 'free', q: `Explain, using a tree picture, why doubling the number of leaves adds just one level.`, model: `<p>Take two copies of a tree with n leaves and hang both under one new root. The new tree has 2n leaves and is exactly one level taller. Equivalently, the bottom level doubles each time you go one level deeper, so doubling the leaf count needs just one more level.</p>`, rubric: ['Each level holds twice as many nodes as the one above', 'So 2n leaves need exactly one more level than n leaves (two copies under a new root)'] },
        { type: 'mcq', q: `In a perfect binary tree, roughly what fraction of nodes are leaves?`, opts: ['About one half', 'About one quarter', 'About log n over n', 'Nearly all of them'], a: 0, why: 'The last level (2ᵏ) is one more than all previous levels together (2ᵏ − 1). So leaves are just over half.' }
      ]
    },
    {
      title: 'Spot the log in code',
      teach: `
<p>A log factor appears exactly when <strong>a quantity shrinks (or grows) by a constant factor each step</strong>.</p>
<div class="ex">
<div class="sub">Worked example: four loops</div>
<pre><code>for (int i = n; i &gt; 1; i /= 2) ...        // halving:   log n
for (int i = 1; i &lt; n; i *= 3) ...        // tripling:  log n  (base 3, same class)
while (lo &lt; hi) { mid = ...; lo = mid+1 or hi = mid; }  // range halves: log n
for (int i = n; i &gt; 0; i -= 2) ...        // subtracting a constant: n/2, LINEAR</code></pre>
<div class="sub">The test</div>
<p>Ask: "is each step <em>multiplying</em> the remaining size by a constant less than 1?" Multiplying means log; subtracting means linear.</p>
<div class="sub">Composing</div>
<p>A log loop <em>inside</em> an n loop gives n log n, e.g. n heap operations or sorting. A log loop <em>after</em> an n loop is n + log n = O(n).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Complexity of <code>for (int i = n; i &gt; 0; i /= 2) for (int j = 0; j &lt; 100; j++) work();</code>`, opts: ['O(log n)', 'O(n log n)', 'O(100 n)', 'O(n)'], a: 0, why: 'Outer loop halves (log n iterations); inner is a constant 100. Total 100 log n = O(log n).' },
        { type: 'mcq', q: `Complexity of <code>int x = n; while (x &gt; 0) x = x - 10;</code>`, opts: ['O(n)', 'O(log n)', 'O(1)', 'O(√n)'], a: 0, why: 'Subtracting a constant takes n/10 steps, which is linear. Only multiplicative shrinking gives a log.' },
        { type: 'mcq', q: `n items are each inserted into a balanced BST (log n per insert). Total?`, opts: ['O(n log n)', 'O(log n)', 'O(n + log n)', 'O(n²)'], a: 0, why: 'n repetitions of an O(log n) operation: n · log n.' },
        { type: 'num', q: `How many iterations for <code>for (int i = 1; i &lt; 1000; i *= 10)</code>?`, a: 3, why: 'i = 1, 10, 100, then 1000 stops the loop: 3 iterations. log₁₀ 1000 = 3.' },
        { type: 'free', q: `A loop runs <code>while (x &gt; 1) x = x * 2 / 3;</code> starting at x = n. Is it O(log n)? Justify with the rule, not by running it.`, model: `<p>Yes. Each step multiplies x by 2/3, a constant factor less than 1. So after k steps x = n·(2/3)ᵏ, which drops to 1 when k = log_{3/2} n. A log with a different base is still O(log n).</p>`, rubric: ['Identifies that each step multiplies the size by a constant factor below 1 (2/3)', 'Concludes steps = log base 1.5 of n, and the base does not matter: O(log n)'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `How many times does <code>work()</code> run for n = 64?<pre><code>for (int i = n; i &gt;= 1; i /= 2) work();</code></pre>`, a: 7, why: 'i = 64, 32, 16, 8, 4, 2, 1: 7 values (log₂ 64 + 1).' },
    { type: 'mcq', q: `A sorted array grows from 1 million to 1 billion elements. Worst-case binary search steps go from about 20 to about…`, opts: ['30', '20,000', '1,000', '40'], a: 0, why: 'log₂ 10⁹ ≈ 30. The input grew 1000×; the search grew by 10 steps.' },
    { type: 'free', q: `A friend says "log₃ n is faster than log₂ n, so ternary search beats binary search asymptotically." Respond precisely.`, model: `<p>Both are O(log n): log₂ n = log₂ 3 · log₃ n ≈ 1.58 · log₃ n, a constant ratio, so they are the same class. In practice ternary search does 2 comparisons per step, so 2 log₃ n ≈ 1.26 log₂ n comparisons: slightly <em>more</em> than binary. Fewer levels, but more work per level.</p>`, rubric: ['The two differ by a constant factor (≈ 1.58), so same Big-O class', 'Counts work per step: ternary does more comparisons per level, which cancels the fewer levels'] },
    { type: 'mcq', q: `Which loop is <em>not</em> O(log n)?`, opts: ['<code>for (i = n; i &gt; 1; i -= 1)</code>', '<code>for (i = 1; i &lt; n; i *= 2)</code>', '<code>for (i = n; i &gt; 1; i /= 3)</code>', '<code>for (i = 1; i &lt; n; i += i)</code>'], a: 0, why: 'Subtracting 1 each step is linear. The other three multiply or divide by a constant (i += i is doubling).' },
    { type: 'num', q: `A perfect binary tree has height 5 (5 edges root-to-leaf). How many nodes does it have?`, a: 63, why: 'Levels hold 1, 2, 4, 8, 16, 32 nodes: 2⁶ − 1 = 63.' },
    { type: 'free', q: `Explain why a balanced BST lookup is O(log n) using the halving picture, not the phrase "the tree has height log n".`, model: `<p>At each node, comparing with the key tells you which subtree the key must be in, and the other subtree is discarded. In a balanced tree each subtree holds about half the remaining nodes, so every comparison halves the candidates. From n candidates you reach one after about log₂ n halvings, so about log₂ n comparisons.</p>`, rubric: ['Each comparison discards one subtree entirely (the key cannot be there)', 'Balanced means that discards about half the remaining nodes', 'Halving n down to 1 takes log₂ n steps'] }
  ]
});
