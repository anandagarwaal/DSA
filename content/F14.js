COURSE.topic({
  id: 'F14',
  intro: `Backtracking, bitmask search and many DP state counts are just counting problems in disguise. If you can count how many subsets, orderings or selections exist, you know the size of the search and whether it can possibly fit in time. The counts come from one picture: a <strong>tree of decisions</strong>.`,
  kps: [
    {
      title: '2ⁿ subsets: each element is in or out',
      teach: `
<p>How many subsets does {a, b, c} have? Don't list them. <strong>Make one decision per element.</strong></p>
<figure class="fig"><svg viewBox="0 0 340 150" width="340" role="img" aria-label="binary decision tree for subsets of a b c">
<g style="stroke:var(--soft)"><line x1="170" y1="15" x2="90" y2="50"/><line x1="170" y1="15" x2="250" y2="50"/>
<line x1="90" y1="50" x2="50" y2="85"/><line x1="90" y1="50" x2="130" y2="85"/><line x1="250" y1="50" x2="210" y2="85"/><line x1="250" y1="50" x2="290" y2="85"/>
<line x1="50" y1="85" x2="30" y2="120"/><line x1="50" y1="85" x2="70" y2="120"/><line x1="130" y1="85" x2="110" y2="120"/><line x1="130" y1="85" x2="150" y2="120"/><line x1="210" y1="85" x2="190" y2="120"/><line x1="210" y1="85" x2="230" y2="120"/><line x1="290" y1="85" x2="270" y2="120"/><line x1="290" y1="85" x2="310" y2="120"/></g>
<g font-size="10" style="fill:var(--ink)" text-anchor="middle"><text x="120" y="32">a in</text><text x="220" y="32">a out</text><text x="170" y="70" style="fill:var(--soft)">b in / out</text><text x="170" y="104" style="fill:var(--soft)">c in / out</text>
<text x="30" y="138">abc</text><text x="70" y="138">ab</text><text x="110" y="138">ac</text><text x="150" y="138">a</text><text x="190" y="138">bc</text><text x="230" y="138">b</text><text x="270" y="138">c</text><text x="310" y="138">{}</text></g>
</svg><figcaption>3 binary decisions → 2 × 2 × 2 = 8 leaves = 8 subsets.</figcaption></figure>
<div class="ex">
<div class="sub">Subgoal 1: one level per element</div>
<p>Each level of the tree decides one element: in or out.</p>
<div class="sub">Subgoal 2: multiply the branching</div>
<p>Two choices at each of n levels: 2 × 2 × … × 2 = <strong>2ⁿ</strong> leaves, and every leaf is a different subset.</p>
<div class="sub">Subgoal 3: the bitmask view</div>
<p>Write "in" as 1 and "out" as 0: every subset of n elements is an n-bit number from 0 to 2ⁿ − 1. That's why <code>for (int mask = 0; mask &lt; (1 &lt;&lt; n); mask++)</code> enumerates all subsets.</p>
</div>`,
      qs: [
        { type: 'num', q: `How many subsets does a 10-element set have (including the empty set)?`, a: 1024, why: '2¹⁰ = 1024: ten in/out decisions.' },
        { type: 'num', q: `How many <em>non-empty</em> subsets does a 5-element set have?`, a: 31, why: '2⁵ = 32 subsets, minus the empty one.' },
        { type: 'mcq', q: `Which bitmask represents the subset {a, c} of (a, b, c), with a as bit 0?`, opts: ['0b101 = 5', '0b011 = 3', '0b110 = 6', '0b010 = 2'], a: 0, why: 'Bit 0 (a) = 1, bit 1 (b) = 0, bit 2 (c) = 1: 101₂ = 5.' },
        { type: 'free', q: `Adding one element to a set doubles its number of subsets. Explain why using the decision tree.`, model: `<p>The new element adds one more level of decisions at the bottom of the tree. Every existing leaf (old subset) splits into two: one with the new element in, one with it out. So each old subset produces exactly two new subsets, and the count doubles.</p>`, rubric: ['The new element is one extra in/out decision (one more tree level)', 'Every existing subset splits into two (with and without it), so the count doubles'] }
      ]
    },
    {
      title: 'Orderings (n!) and selections (n choose k)',
      teach: `
<p><strong>Orderings.</strong> Arrange n distinct items in a row. The first slot has n choices, the next has n − 1 (one item used), then n − 2, … So there are n × (n−1) × … × 1 = <strong>n!</strong> orderings. The decision tree's branching <em>shrinks</em> by one each level.</p>
<div class="ex">
<div class="sub">Worked example: choose 2 from {a, b, c, d}</div>
<p>Ordered picks: 4 choices, then 3, so 12 ordered pairs (ab, ba, ac, ca, …).</p>
<p>But as a <em>set</em>, {a, b} is the same whether picked as ab or ba. Every unordered pair appears exactly 2! = 2 times among the ordered picks.</p>
<p>So unordered selections = 12 / 2 = <strong>6</strong>. In general:</p>
<p style="text-align:center"><strong>C(n, k) = n × (n−1) × … × (n−k+1) / k!</strong></p>
<div class="sub">Why divide by k!</div>
<p>Each chosen group of k items was counted once for each of its k! internal orderings.</p>
</div>
<p>Handy values: C(n, 2) = n(n−1)/2, the pairs, which is the F03 staircase again. And C(n, k) = C(n, n−k): choosing what to keep is the same as choosing what to leave out.</p>`,
      qs: [
        { type: 'num', q: `How many orderings of 5 distinct items?`, a: 120, why: '5 × 4 × 3 × 2 × 1 = 120.' },
        { type: 'num', q: `How many ways to choose 3 people out of 6 for a committee (order irrelevant)?`, a: 20, why: '6 × 5 × 4 = 120 ordered picks; each committee is counted 3! = 6 times; 120 / 6 = 20.' },
        { type: 'mcq', q: `Why does C(n, 2) equal the number of iterations of <code>for i: for j &gt; i</code>?`, opts: ['Both count unordered pairs once', 'Both of them are equal to n squared', 'Both count ordered pairs twice', 'It is a coincidence of formulas'], a: 0, why: 'j &gt; i picks each unordered pair {i, j} exactly once: n(n−1)/2.' },
        { type: 'free', q: `Explain why C(10, 3) = C(10, 7) without computing either.`, model: `<p>Choosing which 3 items to take is the same act as choosing which 7 items to leave behind: every 3-subset corresponds to exactly one 7-subset (its complement), and vice versa. A one-to-one pairing means the two counts are equal.</p>`, rubric: ['Each choice of 3 to keep determines exactly one choice of 7 to leave out (complement)', 'This one-to-one correspondence makes the counts equal'] },
        { type: 'num', q: `How many ordered pairs (i, j) with i ≠ j from 8 items?`, a: 56, why: '8 × 7 = 56 ordered; half of that (28) are unordered.' }
      ]
    },
    {
      title: 'The output size is a lower bound on time',
      teach: `
<p>If a problem asks you to <em>return</em> all subsets, no algorithm can be faster than the time to <strong>write the output</strong>.</p>
<div class="ex">
<div class="sub">Worked example: all subsets of n items</div>
<p>2ⁿ subsets, with an average size of n/2 elements each. Just writing them all down takes about n · 2ⁿ⁻¹ operations. So "return all subsets" is <strong>Ω(n · 2ⁿ)</strong>, and a backtracking solution running in O(n · 2ⁿ) is optimal. You can't be clever enough to beat it.</p>
<div class="sub">All permutations</div>
<p>n! permutations, each of length n: <strong>Ω(n · n!)</strong>.</p>
<div class="sub">Why this matters in an interview</div>
<p>When asked "can you do better?", the output-size argument lets you <em>prove</em> no, instead of shrugging. But notice the trap: if the question only asks to <em>count</em> subsets with some property, the output is one number, and this bound disappears. That's often a hint that DP can do far better than enumerating.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"Return all permutations of n distinct numbers." Best possible time?`, opts: ['Ω(n · n!)', 'Ω(n²)', 'Ω(2ⁿ)', 'Ω(n log n)'], a: 0, why: 'There are n! permutations of length n to write out.' },
        { type: 'mcq', q: `"Count the subsets of an array that sum to target" (values small). Does the output-size bound force exponential time?`, opts: ['No, the output is a single number', 'Yes, there are 2ⁿ subsets to consider', 'Yes, counting is as hard as listing', 'Only when the target is quite large'], a: 0, why: 'Counting outputs one number, so no Ω(2ⁿ) output bound exists. A subset-sum DP runs in O(n · target).' },
        { type: 'num', q: `Total number of elements written when listing every subset of a 4-element set (sum of subset sizes)?`, a: 32, why: 'Each element is in exactly half the 16 subsets: 4 × 8 = 32 = n · 2ⁿ⁻¹.' },
        { type: 'free', q: `An interviewer asks: "Your generate-all-subsets solution is O(n · 2ⁿ). Can you make it polynomial?" Answer with a proof, not a guess.`, model: `<p>No. The required output contains 2ⁿ subsets with n·2ⁿ⁻¹ elements in total, and any algorithm must at least write its output. So every correct algorithm takes Ω(n · 2ⁿ) time, and O(n · 2ⁿ) is optimal. Only a different problem (e.g. counting instead of listing) could be polynomial.</p>`, rubric: ['Counts the output: 2ⁿ subsets, about n·2ⁿ⁻¹ elements in total', 'Argues any algorithm must write its output, so Ω(n·2ⁿ) is a lower bound', 'Concludes the current solution is optimal; no polynomial algorithm exists for listing'] }
      ]
    },
    {
      title: 'Is exponential feasible here?',
      teach: `
<p>Combine the counts with the 10⁸ ops budget (F01):</p>
<table><tr><th>n</th><th>2ⁿ</th><th>n!</th></tr>
<tr><td>10</td><td>1,024</td><td>3.6 × 10⁶: fine</td></tr>
<tr><td>12</td><td>4,096</td><td>4.8 × 10⁸: borderline</td></tr>
<tr><td>20</td><td>10⁶: fine</td><td>2.4 × 10¹⁸: never</td></tr>
<tr><td>30</td><td>10⁹: too slow</td><td>no</td></tr>
<tr><td>40</td><td>10¹²: never</td><td>no</td></tr></table>
<div class="ex">
<div class="sub">Worked example</div>
<p>"n ≤ 15, find the best ordering of tasks": 15! ≈ 1.3 × 10¹² is too many. But 2¹⁵ × 15 ≈ 5 × 10⁵ is tiny. That's the signal for a <strong>bitmask DP over subsets</strong> (state = which tasks are done) instead of trying every ordering.</p>
<div class="sub">The lesson</div>
<p>n! and 2ⁿ look similar ("exponential"), but n! is vastly larger. Replacing "which order" with "which set" is a classic way to drop from n! to 2ⁿ.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `n ≤ 20. Enumerating all subsets is…`, opts: ['Feasible, about a million', 'Infeasible, about 10¹⁸', 'Feasible, only a thousand', 'Infeasible, about 10¹²'], a: 0, why: '2²⁰ ≈ 10⁶.' },
        { type: 'mcq', q: `n ≤ 20. Enumerating all orderings is…`, opts: ['Infeasible, about 2.4 × 10¹⁸', 'Feasible, about a million', 'Feasible, about 10⁸ at most', 'Infeasible, about 10¹⁰⁰'], a: 0, why: '20! ≈ 2.4 × 10¹⁸, which would take centuries.' },
        { type: 'num', q: `About how many times larger is 10! than 2¹⁰? (nearest thousand)`, a: 3544, tol: 60, why: '3,628,800 / 1024 ≈ 3544. Factorials outrun powers of 2 fast.' },
        { type: 'free', q: `Why can "which set of tasks is done" be a much smaller search space than "which order were they done in"? When is it enough to track only the set?`, model: `<p>There are 2ⁿ sets but n! orders, and n! is far larger (20! ≈ 10¹⁸ vs 2²⁰ ≈ 10⁶), since many orders lead to the same set. Tracking only the set works when the future depends only on <em>which</em> tasks are done (plus maybe the last one), not on the order they were done in. Then all orders reaching the same set can be merged.</p>`, rubric: ['Compares the counts: 2ⁿ sets vs n! orders; many orders collapse onto one set', 'States the condition: the remaining problem must depend only on which tasks are done, not their order'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `A lock has 4 dials, each with digits 0–9. How many combinations?`, a: 10000, why: '4 independent decisions of 10 options: 10⁴.' },
    { type: 'num', q: `How many ways to pick a team of 2 from 10 people?`, a: 45, why: '10 × 9 / 2! = 45.' },
    { type: 'mcq', q: `A backtracking search tries every ordering of n = 11 items and does O(n) work per ordering. Roughly how many operations?`, opts: ['About 4 × 10⁸', 'About 2 × 10⁴', 'About 10¹²', 'About 10⁶'], a: 0, why: '11! ≈ 4 × 10⁷, times 11 ≈ 4.4 × 10⁸, which is borderline.' },
    { type: 'free', q: `Explain why the number of subsets of size exactly k is n!/(k!(n−k)!), using "orderings" as the starting point.`, model: `<p>Line up all n items in one of n! orders and take the first k as the chosen subset. Each subset appears many times: its k chosen items can be in any of k! orders at the front, and the n−k unchosen items in any of (n−k)! orders at the back. So each subset is counted k!(n−k)! times, and the number of distinct subsets is n!/(k!(n−k)!).</p>`, rubric: ['Starts from the n! orderings, taking the first k as the chosen set', 'Each subset is overcounted by the k! orders of the chosen part and (n−k)! of the rest', 'Divides n! by k!(n−k)!'] },
    { type: 'mcq', q: `"Return every way to split the string into palindromic pieces." A string of n equal letters has how many splits?`, opts: ['2ⁿ⁻¹', 'n!', 'n²', 'C(n, 2)'], a: 0, why: 'Transfer: between each of the n−1 adjacent pairs you cut or don\'t, 2ⁿ⁻¹ ways, and every piece of equal letters is a palindrome. So output-size bounds make this exponential.' },
    { type: 'num', q: `How many subsets of {1..6} contain the element 1?`, a: 32, why: 'Fix 1 as "in"; the other 5 elements are free: 2⁵ = 32 (exactly half of 64).' }
  ]
});
