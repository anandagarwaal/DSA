COURSE.topic({
  id: 'F13',
  intro: `This is the one foundation you already had in placement: binary search on an answer works because of <strong>monotonicity</strong>. This lesson makes it precise, so you can <em>find</em> the hidden yes/no question in a word problem and prove it's monotone, not just recognise it when someone labels it for you.`,
  kps: [
    {
      title: 'A monotone predicate flips once',
      teach: `
<p>A <strong>predicate</strong> is a yes/no question about a candidate x: <code>ok(x)</code>. It's <strong>monotone</strong> over an ordered range if, once it becomes true, it stays true:</p>
<figure class="fig"><svg viewBox="0 0 340 70" width="340" role="img" aria-label="F F F F T T T row">
<g transform="translate(10,10)" font-size="13" text-anchor="middle">
<rect x="0" y="0" width="40" height="30" style="fill:#fff;stroke:var(--rule)"/><text x="20" y="20">F</text>
<rect x="40" y="0" width="40" height="30" style="fill:#fff;stroke:var(--rule)"/><text x="60" y="20">F</text>
<rect x="80" y="0" width="40" height="30" style="fill:#fff;stroke:var(--rule)"/><text x="100" y="20">F</text>
<rect x="120" y="0" width="40" height="30" style="fill:#fff;stroke:var(--rule)"/><text x="140" y="20">F</text>
<rect x="160" y="0" width="40" height="30" style="fill:var(--good);opacity:.3;stroke:var(--good)"/><text x="180" y="20">T</text>
<rect x="200" y="0" width="40" height="30" style="fill:var(--good);opacity:.3;stroke:var(--good)"/><text x="220" y="20">T</text>
<rect x="240" y="0" width="40" height="30" style="fill:var(--good);opacity:.3;stroke:var(--good)"/><text x="260" y="20">T</text>
<rect x="280" y="0" width="40" height="30" style="fill:var(--good);opacity:.3;stroke:var(--good)"/><text x="300" y="20">T</text>
<line x1="160" y1="-4" x2="160" y2="40" style="stroke:var(--accent);stroke-width:2.5"/>
<text x="160" y="54" style="fill:var(--accent)" font-size="11">the boundary = the answer</text></g></svg></figure>
<div class="ex">
<div class="sub">Why checking one cell tells you so much</div>
<p>Check ok(x). If it's T, every cell to the right is also T, so the boundary is at x or to its left. If it's F, every cell to the left is F, so the boundary is to the right. <strong>One check erases half the range</strong>, the F09 idea on a line instead of a grid.</p>
<div class="sub">Examples</div>
<p>"a[x] ≥ 7" on a sorted array: monotone. "x² ≥ n" for x ≥ 0: monotone. "a[x] is even": <em>not</em> monotone, since it can flip back and forth.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Which predicate is monotone over x = 0, 1, 2, …?`, opts: ['x · x ≥ 50', 'x is a prime number', 'x mod 3 == 0', 'x is a perfect square'], a: 0, why: 'Once x² ≥ 50 (x ≥ 8), it stays true for larger x. The others switch back and forth.' },
        { type: 'mcq', q: `ok(12) is true for a monotone (F…FT…T) predicate. What do you now know?`, opts: ['The boundary is at 12 or to its left', 'The boundary is strictly right of 12', 'ok(11) is definitely also true', 'Nothing until you check ok(13)'], a: 0, why: 'All x ≥ 12 are true. The first true is 12 or smaller; ok(11) could be either.' },
        { type: 'free', q: `Explain why one evaluation of a monotone predicate at the middle of [lo, hi] lets you discard half the range, in terms of which cells you never need to check.`, model: `<p>If ok(mid) is true, monotonicity says every x &gt; mid is also true, so none of them can be the <em>first</em> true (mid already is true and is smaller): discard (mid, hi]. If ok(mid) is false, every x &lt; mid is also false, so the first true must be to the right: discard [lo, mid]. Either way half the cells are ruled out without being checked.</p>`, rubric: ['Case true: everything right of mid is true, so the first true is at or left of mid', 'Case false: everything left of mid is false, so the answer is right of mid', 'Concludes half the range is eliminated without checking it'] },
        { type: 'num', q: `ok(x) = "x² ≥ 200", x over 0..100. What is the first x where it's true?`, a: 15, why: '14² = 196 &lt; 200, 15² = 225 ≥ 200.' }
      ]
    },
    {
      title: 'Find the monotone predicate hidden in a word problem',
      teach: `
<p>"Minimise the maximum…", "smallest speed such that…", "least capacity to finish within D days": these problems don't mention binary search. The trick is to <strong>stop asking for the optimum and ask a yes/no question instead</strong>.</p>
<div class="ex">
<div class="sub">Worked example: Koko eats bananas</div>
<p>Piles of bananas; Koko eats at speed k per hour (one pile at a time, at most one pile per hour); she must finish in h hours. Find the <em>minimum</em> k.</p>
<div class="sub">Subgoal 1: turn the optimum into a question</div>
<p>ok(k) = "at speed k, can she finish within h hours?"</p>
<div class="sub">Subgoal 2: prove it's monotone</div>
<p>If she can finish at speed k, then at any faster speed k' &gt; k each pile takes no more hours (⌈p/k'⌉ ≤ ⌈p/k⌉), so she still finishes. <strong>True at k ⇒ true for all larger k.</strong></p>
<div class="sub">Subgoal 3: the answer is the boundary</div>
<p>Minimum k = the first true. Binary search it over k in [1, max pile], checking each candidate in O(n).</p>
</div>
<p>The monotonicity proof is always the same shape: <strong>"if x works, a more generous x' also works, because…"</strong>.</p>`,
      qs: [
        { type: 'mcq', q: `"Ship packages in order within D days; find the least ship capacity." The predicate is…`, opts: ['Can capacity c ship everything in ≤ D days?', 'Does capacity c ship in exactly D days?', 'Is c at least the heaviest package?', 'Is c exactly the total weight / D?'], a: 0, why: '"Within D days" is monotone in c: more capacity never needs more days. "Exactly D" is not monotone.' },
        { type: 'free', q: `Prove that "can ship all packages within D days using capacity c" is monotone in c.`, model: `<p>Suppose capacity c works: there is a way to split the packages (in order) into ≤ D days, each day's load ≤ c. With capacity c' &gt; c, the <em>same</em> split is still valid, since every day's load ≤ c &lt; c'. So c' also works within D days. True at c ⇒ true for all larger c.</p>`, rubric: ['Starts from a valid plan at capacity c', 'Shows the same plan remains valid at any larger capacity', 'Concludes: true at c implies true for all c\' &gt; c (monotone)'] },
        { type: 'num', q: `Koko: piles [3, 6, 7, 11], h = 8. Hours needed at speed k = 4? (sum of ⌈p/4⌉)`, a: 8, why: '⌈3/4⌉ + ⌈6/4⌉ + ⌈7/4⌉ + ⌈11/4⌉ = 1 + 2 + 2 + 3 = 8 ≤ 8, so k = 4 works.' },
        { type: 'num', q: `Same piles [3, 6, 7, 11], h = 8. What's the minimum k? (check k = 3)`, a: 4, why: 'k = 3: 1 + 2 + 3 + 4 = 10 &gt; 8, fails. k = 4 works (8 hours). So the boundary is 4.' },
        { type: 'mcq', q: `What makes a problem a candidate for "binary search on the answer"?`, opts: ['A yes/no check that is monotone in x', 'The input array arrives already sorted', 'The answer is always a whole number', 'n is small enough for brute force'], a: 0, why: 'Sortedness of the input is irrelevant here. The requirement is a monotone predicate over the answer range, plus a cheap check.' }
      ]
    },
    {
      title: 'When the predicate is not monotone, binary search lies',
      teach: `
<p>Binary search on a non-monotone predicate doesn't crash. It returns a <strong>confident wrong answer</strong>, which is worse.</p>
<div class="ex">
<div class="sub">Worked example: "exactly D days"</div>
<p>Weights [5, 5, 5, 5]. Days needed as capacity grows: c = 5 → 4 days, c = 10 → 2 days, c = 15 → 2 days, c = 20 → 1 day. The predicate "needs <em>exactly</em> 2 days" is F at 5, T at 10 and 15, and F again at 20. That's F T T F, <strong>not monotone</strong>.</p>
<div class="sub">What binary search does</div>
<p>Checking the middle and seeing F, it can't tell whether the T region is to the left or right, so it throws away the half that holds the answer.</p>
<div class="sub">The fix</div>
<p>Rephrase to a monotone question: "within D days" (≤ D). Because "fewer days" is always acceptable, the predicate becomes F…FT…T.</p>
</div>
<p>Before any binary search on an answer, <strong>write the one-line monotonicity argument</strong>. If you can't, don't binary search.</p>`,
      qs: [
        { type: 'mcq', q: `Which of these predicates over capacity c is monotone?`, opts: ['Ship within ≤ D days at capacity c', 'Ship in exactly D days at capacity c', 'Ship in an even number of days', 'The last day carries exactly c'], a: 0, why: 'Only "≤ D days" is preserved when c grows. The others can flip back.' },
        { type: 'free', q: `Give a concrete predicate and a range where binary search for "the first true" returns a wrong answer. Show the values.`, model: `<p>ok(x) = "x mod 4 == 3" over x = 1..8: F F T F F F T F. First-true binary search: mid = 4 → F, so lo = 5; mid = 6 → F, lo = 7; mid = 7 → T, hi = 7. It returns 7, but the first true is 3. Seeing F at 4, it assumed everything left of 4 was F too, which only monotonicity would guarantee.</p>`, rubric: ['Gives a non-monotone predicate with its value row (it flips more than once)', 'Traces binary search to show it discards the half holding the first true', 'States the returned answer is wrong'] },
        { type: 'mcq', q: `A sorted array is <em>rotated</em>: [4, 5, 6, 7, 0, 1, 2]. Is "a[x] ≥ 4" monotone over indices?`, opts: ['No: T T T T F F F runs the wrong way', 'Yes, because the array is sorted', 'Yes, it flips exactly one time', 'No, it flips back and forth often'], a: 0, why: 'It flips once, but from T to F. "a[x] &lt; 4" is F F F F T T T, which is monotone and finds the rotation point.' },
        { type: 'mcq', q: `You can't prove monotonicity for your check. Best next step?`, opts: ['Find another formulation or approach', 'Binary search anyway and test it', 'Use a ternary search instead', 'Add one to mid to avoid the bug'], a: 0, why: 'Tests may pass by luck. Without monotonicity there is no correctness argument.' }
      ]
    },
    {
      title: 'First true vs last false',
      teach: `
<p>Every boundary can be described two ways: the <strong>first T</strong> or the <strong>last F</strong>, and they sit next to each other. "Maximise" problems usually want the last true of a T…TF…F predicate, which is the same thing mirrored.</p>
<div class="ex">
<div class="sub">Worked example: integer square root of n = 30</div>
<p>Want the largest x with x² ≤ 30. Predicate p(x) = "x² ≤ 30": T T T T T T F F … for x = 0..7 (5² = 25 ≤ 30, 6² = 36 &gt; 30). The answer is the <strong>last true</strong>, x = 5.</p>
<p>Equivalently, q(x) = "x² &gt; 30" is F F F F F F T T; the first true is 6, and the answer is <strong>first true − 1</strong> = 5.</p>
<div class="sub">Pick one template and translate</div>
<p>Most off-by-one bugs come from mixing the two views. Decide up front: "I will find the first x where q(x) is true." Then convert whatever the problem asks into that.</p>
</div>`,
      qs: [
        { type: 'num', q: `Largest x with x² ≤ 50?`, a: 7, why: '7² = 49 ≤ 50, 8² = 64 &gt; 50. Last true of "x² ≤ 50".' },
        { type: 'mcq', q: `"Find the maximum k such that f(k) ≤ budget" (f increasing). As a first-true search, you look for…`, opts: ['First k with f(k) &gt; budget, then minus 1', 'First k with f(k) ≤ budget, and stop', 'Last k with f(k) &gt; budget, plus 1', 'Any k where f(k) equals budget'], a: 0, why: 'f(k) ≤ budget is T…TF…F. Its last T is just before the first T of the complement.' },
        { type: 'num', q: `Sorted a = [1, 3, 3, 3, 8]. First index where a[i] ≥ 3?`, a: 1, why: 'F T T T T: first true at index 1. This is "lower bound".' },
        { type: 'num', q: `Same array. Last index where a[i] ≤ 3?`, a: 3, why: 'T T T T F: last true at 3. Or: first index with a[i] &gt; 3 is 4, minus 1.' },
        { type: 'free', q: `Explain why "last index with a[i] ≤ t" and "first index with a[i] &gt; t" are always adjacent (differ by exactly 1).`, model: `<p>On a sorted array, "a[i] ≤ t" is a T…TF…F predicate and "a[i] &gt; t" is exactly its negation, F…FT…T. They split the indices at the same boundary: everything left of it satisfies the first, everything right satisfies the second. So the last index of the T-block of one is immediately followed by the first index of the other.</p>`, rubric: ['The two predicates are negations of each other', 'Both split the sorted array at the same single boundary', 'So the last true of one and the first true of the other are neighbours'] }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Split an array of non-negative numbers into at most m contiguous parts, minimising the largest part's sum." Write the predicate, prove it's monotone, and give the search range.`, model: `<p>ok(S) = "can the array be split into ≤ m contiguous parts, each with sum ≤ S?" Monotone: a split valid for S is also valid for any S' &gt; S (every part's sum ≤ S &lt; S'). Range: S from max(a) (no part can be below the largest element) to sum(a) (one part). Answer = first S where ok is true. Check greedily in O(n).</p>`, rubric: ['Predicate phrased as a yes/no feasibility question with "≤ m" parts and max sum ≤ S', 'Monotonicity proof: the same split stays valid when S grows', 'Correct range: from max element to total sum'] },
    { type: 'mcq', q: `ok(mid) is false in a first-true search on [lo, hi]. Correct update?`, opts: ['lo = mid + 1', 'hi = mid − 1', 'hi = mid', 'lo = mid'], a: 0, why: 'All of [lo, mid] are false, so the first true is at mid + 1 or later. (lo = mid can loop forever, F07.)' },
    { type: 'num', q: `Koko: piles [30, 11, 23, 4, 20], h = 6. Minimum speed?`, a: 23, why: 'k = 23: 2 + 1 + 1 + 1 + 1 = 6 ✓. k = 22: 2 + 1 + 2 + 1 + 1 = 7 ✗. So 23.' },
    { type: 'mcq', q: `Which is <em>not</em> a valid reason binary search on the answer is fast here?`, opts: ['The input array is sorted', 'The predicate is monotone', 'The check runs in O(n)', 'The range has size about 10⁹'], a: 0, why: 'The input need not be sorted at all. Speed = log(range) × cost of check, given monotonicity.' },
    { type: 'num', q: `A range of 10⁹ candidate answers and an O(n) check with n = 10⁵. About how many operations? (in millions)`, a: 3, tol: 0.5, why: 'log₂ 10⁹ ≈ 30 checks × 10⁵ = 3 × 10⁶.' }
  ]
});
