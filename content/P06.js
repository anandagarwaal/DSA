COURSE.topic({
  id: 'P06',
  intro: `This was your strongest placement answer: binary search on an answer works because of monotonicity. This topic turns that into a repeatable method. <strong>Spot</strong> the problem shape, <strong>write</strong> a greedy feasibility check and <strong>prove</strong> it monotone, and <strong>cost</strong> it as log(range) × check. It combines F13 (the predicate) with P05 (the first-true template).`,
  kps: [
    {
      title: 'Spot the shape: "minimise the maximum", "smallest x such that"',
      teach: `
<p>These problems ask for an <em>optimal number</em>, and the input usually isn't sorted. The tell is in the phrasing:</p>
<div class="ex">
<div class="sub">Signals</div>
<p>"<strong>minimum</strong> capacity/speed/time <strong>such that</strong> it can be done", "<strong>minimise the largest</strong> …", "<strong>maximise the smallest</strong> distance", "within D days / h hours".</p>
<div class="sub">The reframe</div>
<p>Stop asking "what is the optimum?" and ask "<strong>given a candidate x, can it be done?</strong>". If that yes/no answer is monotone in x, the optimum is the boundary (F13), which template B (P05) finds.</p>
<div class="sub">Worked example: Capacity to ship within D days</div>
<p>Weights must ship in order; each day's load ≤ capacity c. Find the minimum c for D days. Candidates: c from max(w) (the heaviest package must fit) to sum(w) (everything in one day). Question: "can capacity c do it in ≤ D days?"</p>
</div>
<p><strong>Discriminate:</strong> if the question is about finding a position in sorted data, use P05. If it's about finding the best <em>value</em> and checking a guess is easy but constructing the answer directly is hard, use this.</p>`,
      qs: [
        { type: 'mcq', q: `Which problem is a binary search on the answer?`, opts: ['Min largest subarray sum with m parts', 'First index of 7 in a sorted array', 'Count pairs summing to k, unsorted', 'Longest window with no repeated char'], a: 0, why: '"Minimise the maximum" with an easy check: can we split so that every part is ≤ S?' },
        { type: 'mcq', q: `For "ship within D days", why is the lower end of the search range max(w), not 1?`, opts: ['The heaviest package must fit in one day', 'Capacities below the mean always fail', 'Binary search needs a positive lower end', 'It makes the search a bit faster only'], a: 0, why: 'Any capacity below the heaviest package can never ship it: infeasible whatever D is.' },
        { type: 'num', q: `Weights 1..10 in order, D = 5 days. Minimum capacity?`, a: 15, why: 'Capacity 15: [1..5], [6,7], [8], [9], [10] = 5 days. 14 needs 6 days.' },
        { type: 'free', q: `Explain the reframe from "find the optimum" to "check a candidate", and why checking can be much easier than constructing the answer directly.`, model: `<p>Instead of searching all ways to split/schedule for the best one, fix a candidate value x and ask only whether some valid arrangement meets it. With x fixed, a simple greedy (pack as much as possible each day) decides feasibility in O(n), since there's no optimisation left, just a yes/no. If feasibility is monotone in x, binary search finds the smallest feasible x with only about log(range) checks.</p>`, rubric: ['Reframes as a yes/no feasibility question for a candidate x', 'With x fixed, a greedy check is easy (no optimisation needed)', 'Monotonicity lets binary search find the boundary in log(range) checks'] }
      ]
    },
    {
      title: 'Write the check greedily, and prove it monotone',
      teach: `
<pre><code>boolean canShip(int[] w, int cap, int D) {
    int days = 1, load = 0;
    for (int x : w) {
        if (load + x &gt; cap) { days++; load = 0; }   // start a new day
        load += x;
    }
    return days &lt;= D;
}</code></pre>
<div class="ex">
<div class="sub">Why the greedy check is correct</div>
<p>Packing each day as full as possible never hurts: if some plan ships within D days, the greedy's k-th day always ends at or after that plan's k-th day (by induction), so greedy uses no more days. So "greedy fits in D days" ⟺ "some plan fits".</p>
<div class="sub">Why it's monotone in cap</div>
<p>Any plan valid for capacity c is valid for c' &gt; c (every day's load ≤ c &lt; c'). So feasible at c ⇒ feasible above c: F…FT…T.</p>
<div class="sub">The search</div>
<pre><code>int lo = max(w), hi = sum(w);
while (lo &lt; hi) {
    int mid = lo + (hi - lo) / 2;
    if (canShip(w, mid, D)) hi = mid; else lo = mid + 1;
}
return lo;</code></pre>
</div>`,
      qs: [
        { type: 'num', q: `Weights [3, 2, 2, 4, 1, 4], capacity 5. How many days does the greedy check use?`, a: 4, why: '[3,2], [2], [4,1], [4]: 4 days.' },
        { type: 'num', q: `Weights [3, 2, 2, 4, 1, 4], D = 3. Minimum capacity?`, a: 6, why: '[3,2], [2,4], [1,4] at capacity 6. Capacity 5 needs 4 days.' },
        { type: 'free', q: `Prove "can split array a into ≤ m contiguous parts each with sum ≤ S" is monotone in S.`, model: `<p>Suppose a split into ≤ m parts works for S, so every part's sum is ≤ S. For any S' &gt; S, the same split has every part ≤ S &lt; S', and still ≤ m parts. So it's feasible for S'. Feasibility never turns back to false as S grows: F…FT…T.</p>`, rubric: ['Starts from a valid split at S', 'The same split remains valid at any larger S\'', 'Concludes feasibility is monotone (never true then false)'] },
        { type: 'mcq', q: `Why is it fine for the check to use a greedy even though greedy is often wrong for optimisation (P17)?`, opts: ['With x fixed, greedy provably uses fewest days', 'Greedy is always optimal everywhere', 'Binary search repairs greedy mistakes', 'The check only needs to be approximate'], a: 0, why: 'For a fixed capacity, packing each day fully can be proven optimal (an exchange/induction argument). Correctness of the check must still be argued.' }
      ]
    },
    {
      title: 'Cost: log(range) × cost of the check',
      teach: `
<div class="ex">
<div class="sub">The formula</div>
<p>Binary search over candidates [lo, hi] takes about log₂(hi − lo + 1) checks. Each check scans the input: O(n). Total <strong>O(n · log(range))</strong>.</p>
<div class="sub">Worked example: Koko, n = 10⁴ piles up to 10⁹ bananas</div>
<p>Range 1..10⁹ gives about 30 checks × 10⁴ = 3 × 10⁵ operations. Trying every speed would be 10⁹ × 10⁴: impossible.</p>
<div class="sub">Two consequences</div>
<p>(1) The <strong>size of the values</strong> matters only logarithmically. Huge ranges are fine. (2) Make the check fast, because it runs ~30 times. An O(n log n) check (e.g. sorting inside) multiplies up.</p>
<div class="sub">Watch the overflow</div>
<p>sum(w) can exceed int. Use <code>long</code> for hi, and for running sums inside the check.</p>
</div>`,
      qs: [
        { type: 'num', q: `Answer range 1..10⁶, check O(n) with n = 10⁵. About how many operations, in millions? (log₂ 10⁶ ≈ 20)`, a: 2, tol: 0.3, why: '20 × 10⁵ = 2 × 10⁶.' },
        { type: 'mcq', q: `The check sorts the input each time (O(n log n)). Total with range R?`, opts: ['O(n log n · log R)', 'O(n log n + log R)', 'O(n · log R)', 'O(R · n log n)'], a: 0, why: 'log R checks, each O(n log n). Sort once outside the loop if you can.' },
        { type: 'free', q: `Koko: piles up to 10⁹, n = 10⁴, h ≥ n. Why is trying every speed 1..max infeasible, but binary search fine? Give numbers.`, model: `<p>Trying every speed: up to 10⁹ candidates × 10⁴ per check = 10¹³ operations, hours of CPU. Binary search: monotone check (a faster speed never needs more hours), so about log₂ 10⁹ ≈ 30 checks × 10⁴ = 3 × 10⁵ operations, instant. The value range only costs a log factor.</p>`, rubric: ['Linear scan cost: about 10⁹ × 10⁴', 'Binary search cost: about 30 × 10⁴', 'Relies on monotonicity (faster speed never needs more hours)'] },
        { type: 'mcq', q: `Capacity search where weights can be up to 10⁹ and n = 10⁵. Type for hi = sum(weights)?`, opts: ['long, since the sum can reach 10¹⁴', 'int, since each weight fits in int', 'double, for the division by D', 'short, to save a little memory'], a: 0, why: '10⁵ × 10⁹ = 10¹⁴ overflows int (max ≈ 2.1 × 10⁹).' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Place c cows in stalls at positions x (sorted) to <em>maximise the minimum</em> distance between any two cows." Give the predicate, the direction of monotonicity, the check and the range.`, model: `<p>ok(d) = "can we place c cows with every gap ≥ d?" Monotone the other way: if gap d works, any smaller gap works too (T…TF…F), so the answer is the <em>last</em> true. Check greedily: place a cow in the first stall, then in each next stall at distance ≥ d from the last cow; feasible if we place c cows. O(n) per check. Range d ∈ [1, x[n−1] − x[0]]. Total O(n log range).</p>`, rubric: ['Predicate: can place c cows with min gap ≥ d', 'Monotone decreasing (T…TF…F), so the answer is the last true', 'Greedy placement check, O(n)', 'Range from 1 to max − min position'] },
    { type: 'num', q: `Split [7, 2, 5, 10, 8] into 2 contiguous parts minimising the largest part sum. Answer?`, a: 18, why: '[7, 2, 5] = 14 and [10, 8] = 18.' },
    { type: 'num', q: `Koko: piles [30, 11, 23, 4, 20], h = 5. Minimum speed?`, a: 30, why: 'h = number of piles, so each pile must be finished in one hour: speed = max pile = 30.' },
    { type: 'mcq', q: `Which phrasing does NOT suggest binary search on the answer?`, opts: ['Return all valid splits of the array', 'Minimum time such that all jobs finish', 'Maximise the minimum distance apart', 'Smallest capacity to ship in D days'], a: 0, why: 'Listing all splits asks for enumeration (backtracking), not an optimal value.' },
    { type: 'free', q: `Why does this technique still need a correctness argument for the check, not just a monotonicity argument?`, model: `<p>Monotonicity guarantees binary search finds the boundary of whatever predicate you implement. If the check itself is wrong (e.g. a greedy that sometimes says "no" when a valid plan exists), you'll find the boundary of the wrong predicate and return a wrong answer. So you need both: the check equals true feasibility, and true feasibility is monotone.</p>`, rubric: ['Binary search finds the boundary of the implemented check', 'A wrong check (e.g. flawed greedy) gives a wrong boundary', 'Both correctness of the check and monotonicity are needed'] }
  ],
  practice: [
    { name: 'Koko Eating Bananas', lc: 'LeetCode 875', prompt: `<p>Minimum eating speed to finish all piles within h hours.</p>`, hint: `<p>Hours at speed k = Σ ⌈p / k⌉. Monotone in k.</p>`,
      solution: `<pre><code>public int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 0;
    for (int p : piles) hi = Math.max(hi, p);
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;
        for (int p : piles) hours += (p + mid - 1) / mid;   // ceil(p / mid)
        if (hours &lt;= h) hi = mid; else lo = mid + 1;
    }
    return lo;
}</code></pre><p class="cx">O(n log max). Hours as long: many piles × large counts.</p>` },
    { name: 'Capacity To Ship Packages Within D Days', lc: 'LeetCode 1011', prompt: `<p>Least capacity to ship all packages, in order, within D days.</p>`, hint: `<p>Range [max(w), sum(w)]; greedy day-packing check.</p>`,
      solution: `<pre><code>public int shipWithinDays(int[] w, int D) {
    int lo = 0, hi = 0;
    for (int x : w) { lo = Math.max(lo, x); hi += x; }
    while (lo &lt; hi) {
        int mid = lo + (hi - lo) / 2;
        int days = 1, load = 0;
        for (int x : w) {
            if (load + x &gt; mid) { days++; load = 0; }
            load += x;
        }
        if (days &lt;= D) hi = mid; else lo = mid + 1;
    }
    return lo;
}</code></pre><p class="cx">O(n log Σw).</p>` },
    { name: 'Split Array Largest Sum', lc: 'LeetCode 410', prompt: `<p>Split into k non-empty contiguous parts minimising the largest part sum.</p>`, hint: `<p>Same check as shipping: count parts needed for a max-sum S.</p>`,
      solution: `<pre><code>public int splitArray(int[] a, int k) {
    long lo = 0, hi = 0;
    for (int x : a) { lo = Math.max(lo, x); hi += x; }
    while (lo &lt; hi) {
        long mid = lo + (hi - lo) / 2;
        int parts = 1; long cur = 0;
        for (int x : a) {
            if (cur + x &gt; mid) { parts++; cur = 0; }
            cur += x;
        }
        if (parts &lt;= k) hi = mid; else lo = mid + 1;
    }
    return (int) lo;
}</code></pre><p class="cx">O(n log Σa). ≤ k parts suffices: parts can always be split further to reach exactly k.</p>` }
  ]
});
