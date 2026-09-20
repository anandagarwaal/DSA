COURSE.topic({
  id: 'F06',
  intro: `"What's the complexity of your recursive solution?" There's one method that answers every case you'll meet, with no Master Theorem memorised: <strong>draw the recursion tree, write the work done at each level, and add up the column</strong>. It combines three things you already know: halving (F02), the two sums (F03) and the recursion tree (F05).`,
  kps: [
    {
      title: 'One call on half: T(n) = T(n/2) + O(1) → log n',
      teach: `
<p>Binary search: do constant work, then recurse on half.</p>
<div class="ex">
<div class="sub">Subgoal 1: draw the tree</div>
<p>It isn't really a tree: each call makes <em>one</em> call. It's a single path: n → n/2 → n/4 → … → 1.</p>
<div class="sub">Subgoal 2: work per level</div>
<p>Each level does O(1) work.</p>
<div class="sub">Subgoal 3: number of levels</div>
<p>Halving n down to 1 takes log₂ n steps (F02).</p>
<div class="sub">Subgoal 4: add the column</div>
<p>log n levels × O(1) = <strong>O(log n)</strong>.</p>
</div>
<p>Variation: T(n) = T(n/2) + O(n), one call on half plus a linear scan. Levels do n, n/2, n/4, …, a <em>halving series</em> (F03), so the total is less than 2n = <strong>O(n)</strong>. The top level dominates.</p>`,
      qs: [
        { type: 'mcq', q: `T(n) = T(n/2) + O(1). Solution?`, opts: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], a: 0, why: 'A single path of log n levels, O(1) each.' },
        { type: 'mcq', q: `T(n) = T(n/2) + O(n). Solution?`, opts: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], a: 0, why: 'Work per level n, n/2, n/4, …: a halving series that sums to less than 2n.' },
        { type: 'num', q: `T(n) = T(n/2) + 1, T(1) = 1. Exact T(1024)?`, a: 11, why: '1024 → 512 → … → 1 is 10 halvings, plus the base: 11.' },
        { type: 'free', q: `Why is T(n) = T(n/2) + n only O(n), even though there are log n levels?`, model: `<p>The work per level shrinks by half each level: n, n/2, n/4, … . That's a geometric (halving) series, dominated by its first term; the whole sum is below 2n. "log n levels × n each" would only be right if every level did n work.</p>`, rubric: ['Work per level halves each level', 'Sum of a halving series is below 2n (top level dominates)', 'Notes log n × n assumes equal levels, which is false here'] }
      ]
    },
    {
      title: 'Two calls on halves plus linear work: T(n) = 2T(n/2) + n → n log n',
      teach: `
<p>Merge sort: split, sort both halves recursively, merge in O(n).</p>
<figure class="fig"><svg viewBox="0 0 340 150" width="340" role="img" aria-label="merge sort recursion tree with level sums">
<g font-size="10" text-anchor="middle">
<rect x="100" y="5" width="120" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="160" y="19">n</text>
<rect x="60" y="40" width="80" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="100" y="54">n/2</text>
<rect x="180" y="40" width="80" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="220" y="54">n/2</text>
<rect x="40" y="75" width="50" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="65" y="89">n/4</text>
<rect x="100" y="75" width="50" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="125" y="89">n/4</text>
<rect x="170" y="75" width="50" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="195" y="89">n/4</text>
<rect x="230" y="75" width="50" height="20" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="255" y="89">n/4</text>
<text x="160" y="118" style="fill:var(--soft)">… log₂ n levels …</text>
<g style="fill:var(--accent)" text-anchor="start"><text x="290" y="19">= n</text><text x="290" y="54">= n</text><text x="290" y="89">= n</text></g>
<text x="160" y="142" style="fill:var(--ink)">total = n per level × log n levels</text></g></svg></figure>
<div class="ex">
<div class="sub">Level sums</div>
<p>Level k has 2ᵏ calls, each on size n/2ᵏ, each doing work proportional to its size: 2ᵏ × n/2ᵏ = <strong>n per level</strong>.</p>
<div class="sub">Levels</div>
<p>Sizes halve until 1: log₂ n levels.</p>
<div class="sub">Column sum</div>
<p>n × log n = <strong>O(n log n)</strong>. Unlike the previous step, the levels are <em>equal</em>, so they multiply.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `T(n) = 2T(n/2) + O(n). Solution?`, opts: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], a: 0, why: 'n work on each of log n levels.' },
        { type: 'num', q: `Merge sort on n = 1024: how many levels of merging (levels where subarray size ≥ 2 is merged)?`, a: 10, why: 'Merges produce sizes 2, 4, …, 1024: log₂ 1024 = 10 levels, each doing about 1024 work.' },
        { type: 'free', q: `Using the recursion tree, show that level k of merge sort does n total work, whatever k is.`, model: `<p>At level k there are 2ᵏ subproblems (each call splits in two), each of size n/2ᵏ (the size halves each level). Each subproblem does merge work proportional to its size. Total at level k: 2ᵏ × n/2ᵏ = n. The doubling count and the halving size cancel exactly.</p>`, rubric: ['Level k has 2ᵏ subproblems', 'Each has size n/2ᵏ with work proportional to size', 'Product is n: count doubling and size halving cancel'] },
        { type: 'mcq', q: `Quicksort with a pivot that always splits 1 : (n−1) (worst case). Recurrence and solution?`, opts: ['T(n) = T(n−1) + n, O(n²)', 'T(n) = 2T(n/2) + n, O(n log n)', 'T(n) = T(n/2) + n, O(n)', 'T(n) = T(n−1) + 1, O(n)'], a: 0, why: 'Work n, n−1, n−2, …: an arithmetic series (staircase), n²/2.' }
      ]
    },
    {
      title: 'Doubling calls on n − 1: T(n) = 2T(n−1) + 1 → 2ⁿ',
      teach: `
<p>Each call spawns two calls on a problem only <em>one</em> smaller: subsets without memo, Towers of Hanoi, naive recursion on "take it or leave it".</p>
<div class="ex">
<div class="sub">Level counts</div>
<p>Level k has 2ᵏ calls. Sizes go n, n−1, n−2, …, so there are <strong>n levels</strong> (not log n: subtracting 1 is slow shrinking).</p>
<div class="sub">Column sum</div>
<p>1 + 2 + 4 + … + 2ⁿ⁻¹ = 2ⁿ − 1 (F03). The <strong>last level dominates</strong>: half of all calls are leaves.</p>
<div class="sub">Result</div>
<p><strong>O(2ⁿ)</strong>. Compare T(n) = 2T(n/2) + 1: here sizes halve, giving only log n levels, and the bottom level has 2^(log n) = n calls, so it's O(n). Same branching, but shrinking by halving vs by 1 is the gap between linear and exponential.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `T(n) = 2T(n−1) + 1. Solution?`, opts: ['O(2ⁿ)', 'O(n²)', 'O(n log n)', 'O(n)'], a: 0, why: 'n levels, doubling each level: 2ⁿ − 1 calls.' },
        { type: 'mcq', q: `T(n) = 2T(n/2) + 1. Solution?`, opts: ['O(n)', 'O(2ⁿ)', 'O(log n)', 'O(n log n)'], a: 0, why: 'log n levels, doubling: the last level has n calls, and the geometric sum is less than 2n.' },
        { type: 'num', q: `Towers of Hanoi with 10 disks: T(n) = 2T(n−1) + 1, T(0) = 0. How many moves?`, a: 1023, why: '2¹⁰ − 1 = 1023.' },
        { type: 'free', q: `Both T(n) = 2T(n−1) + 1 and T(n) = 2T(n/2) + 1 branch in two. Explain with the tree why one is exponential and the other linear.`, model: `<p>Both trees double their number of nodes per level; the difference is the number of levels. Subtracting 1 from n gives n levels, so the bottom level has 2ⁿ nodes: exponential. Halving n gives only log₂ n levels, so the bottom level has 2^(log n) = n nodes. In both cases the geometric sum is dominated by the last level: 2ⁿ vs n.</p>`, rubric: ['Both double node count per level', 'n − 1 shrinking gives n levels, halving gives log n levels', 'The last level dominates: 2ⁿ vs 2^(log n) = n'] }
      ]
    },
    {
      title: 'The general method: work per level × levels, and find the dominant level',
      teach: `
<div class="ex">
<div class="sub">The recipe</div>
<p>(1) How many calls at level k, and what size is each? (2) Work at level k = calls × work per call. (3) How many levels until the size hits the base? (4) Sum the column, and check whether it's growing, shrinking or constant.</p>
<div class="sub">Three outcomes</div>
<table><tr><th>level sums</th><th>total</th><th>example</th></tr>
<tr><td>shrink geometrically</td><td>= the top level</td><td>T(n) = T(n/2) + n → O(n)</td></tr>
<tr><td>equal</td><td>top × levels</td><td>T(n) = 2T(n/2) + n → O(n log n)</td></tr>
<tr><td>grow geometrically</td><td>= the bottom level</td><td>T(n) = 2T(n/2) + 1 → O(n); T(n) = 4T(n/2) + n → O(n²)</td></tr></table>
<div class="sub">Worked example: T(n) = 3T(n/2) + n</div>
<p>Level k: 3ᵏ calls × n/2ᵏ work = n · (3/2)ᵏ, <em>growing</em>. So the bottom level dominates: it has 3^(log₂ n) = n^(log₂ 3) ≈ n^1.585 calls. Total O(n^1.585). (This is Karatsuba multiplication.)</p>
</div>
<p>That's the Master Theorem, derived instead of memorised. If you can draw the tree, you don't need the theorem.</p>`,
      qs: [
        { type: 'mcq', q: `T(n) = 4T(n/2) + n. Level k does 4ᵏ × n/2ᵏ = n · 2ᵏ work. Total?`, opts: ['O(n²)', 'O(n log n)', 'O(n)', 'O(4ⁿ)'], a: 0, why: 'Level sums grow, so the bottom dominates: 4^(log₂ n) = n² leaves.' },
        { type: 'mcq', q: `T(n) = 2T(n/2) + n². Level sums: n², n²/2, n²/4, … Total?`, opts: ['O(n²)', 'O(n² log n)', 'O(n log n)', 'O(n³)'], a: 0, why: 'Shrinking geometrically, so the top level dominates: O(n²).' },
        { type: 'free', q: `Solve T(n) = 2T(n/4) + O(1) with the recursion tree. Show calls per level, number of levels, and the dominant level.`, model: `<p>Level k: 2ᵏ calls, each size n/4ᵏ, O(1) work each → 2ᵏ work. Levels: sizes divide by 4, so log₄ n levels. Sums grow (doubling), so the bottom level dominates: 2^(log₄ n) = n^(log₄ 2) = n^(1/2) = √n. Total O(√n).</p>`, rubric: ['Level k: 2ᵏ calls with O(1) work each', 'log₄ n levels', 'Bottom dominates: 2^(log₄ n) = √n, so O(√n)'] },
        { type: 'num', q: `T(n) = 3T(n/3) + n. Work at each level for n = 81? (all levels equal)`, a: 81, why: 'Level k: 3ᵏ × 81/3ᵏ = 81. Equal levels, and log₃ 81 = 4 of them → O(n log n).' },
        { type: 'mcq', q: `A recursion does T(n) = T(n−1) + n. Which F03 sum is this?`, opts: ['Arithmetic: n + (n−1) + … = O(n²)', 'Geometric: n + n/2 + … = O(n)', 'Equal levels: n × log n', 'Geometric growth: O(2ⁿ)'], a: 0, why: 'Levels do n, n−1, n−2, …: the staircase, n(n+1)/2.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> A divide-and-conquer algorithm splits the input into 2 halves, recurses on both, and spends O(n log n) combining. Solve T(n) = 2T(n/2) + n log n with the tree.`, model: `<p>Level k: 2ᵏ calls of size n/2ᵏ, each doing (n/2ᵏ) log(n/2ᵏ) work, so the level total is n · log(n/2ᵏ) = n(log n − k). Summing over k = 0 … log n: n · (log n + (log n − 1) + … + 1) = n · (log n)(log n + 1)/2 = O(n log² n). The levels shrink only slowly (arithmetically), so they add up like a staircase.</p>`, rubric: ['Level k total = n(log n − k)', 'Sum over log n levels is an arithmetic series in log n', 'Result O(n log² n)'] },
    { type: 'mcq', q: `Binary search implemented recursively, but each call copies the half-array it recurses on (O(n) copy). New complexity?`, opts: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'], a: 0, why: 'T(n) = T(n/2) + n: a halving series, so O(n). The copying destroys the log.' },
    { type: 'num', q: `T(n) = 2T(n/2) + 1, T(1) = 1. Exact T(8)?`, a: 15, why: 'Nodes: 1 + 2 + 4 + 8 = 15, each doing 1 unit. 2n − 1.' },
    { type: 'mcq', q: `Generating all subsets recursively with an O(n) copy at each leaf: T = 2ⁿ leaves × n. Complexity?`, opts: ['O(n · 2ⁿ)', 'O(2ⁿ log n)', 'O(n² · 2)', 'O(n · n!)'], a: 0, why: 'The bottom level dominates: 2ⁿ leaves each doing O(n) copying. It matches the output-size bound (F14).' },
    { type: 'free', q: `Explain in one paragraph how you would find the complexity of <em>any</em> recursive function you write in an interview, without the Master Theorem.`, model: `<p>Draw the recursion tree: work out how many calls each level has and how big each call's input is, then the non-recursive work each call does. Multiply to get the work per level, count the levels until the base case, and sum the column. If the level sums shrink geometrically the top level dominates; if they're equal, multiply by the number of levels; if they grow geometrically the bottom level (the leaves) dominates.</p>`, rubric: ['Calls per level and size per call', 'Work per level = calls × per-call work; count levels to the base', 'Sum, identifying shrinking / equal / growing levels and the dominant one'] }
  ]
});
