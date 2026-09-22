COURSE.topic({
  id: 'P25',
  intro: `Some problems are about <em>ranges</em>, not prefixes: burst the balloons in the best order, cut the stick in the best order, multiply the matrices with the best parenthesisation. The state is a whole interval <code>dp[i][j]</code>, the recurrence enumerates the <strong>last</strong> operation rather than the first, and the fill order goes by increasing interval length. Recognising "the last thing done" is the move that makes these tractable.`,
  kps: [
    {
      title: 'State over a range',
      teach: `
<p><code>dp[i][j]</code> = the answer for the subarray i..j <em>considered on its own</em>. There are about n²/2 such intervals (F03's triangle).</p>
<div class="ex">
<div class="sub">Worked example: longest palindromic subsequence</div>
<p>dp[i][j] = the length of the longest palindromic subsequence of s[i..j]. If the ends match they can both be used: dp[i][j] = dp[i+1][j−1] + 2. Otherwise drop one end: max(dp[i+1][j], dp[i][j−1]). Base: dp[i][i] = 1.</p>
<p>"bbbab" gives <strong>4</strong> ("bbbb"); "cbbd" gives <strong>2</strong> ("bb").</p>
<div class="sub">Why a range and not a prefix</div>
<p>A prefix state assumes the past is finished and the future untouched. Here operations happen <em>inside</em> a range and split it into two independent ranges, so neither end is special: both boundaries must be in the state.</p>
<div class="sub">The tell</div>
<p>Removing or combining an element changes what its neighbours are (balloons pop and the neighbours become adjacent; matrices merge). That coupling is what forces interval states.</p>
</div>`,
      qs: [
        { type: 'num', q: `Longest palindromic subsequence of "bbbab"?`, a: 4, why: '"bbbb": drop the a.' },
        { type: 'num', q: `Longest palindromic subsequence of "cbbd"?`, a: 2, why: '"bb".' },
        { type: 'num', q: `How many intervals (i ≤ j) does an array of 5 elements have?`, a: 15, why: 'C(5,2) + 5 = 10 + 5 = 15, about n²/2 (F03).' },
        { type: 'free', q: `Why can't "burst balloons" use a prefix state dp[i] = best for the first i balloons?`, model: `<p>Bursting a balloon makes its neighbours adjacent, so the value of a later burst depends on which balloons have already gone on <em>both</em> sides. A prefix state fixes only the left boundary and says nothing about what remains to the right, so the coefficient of a burst is not determined. An interval state dp[i][j] fixes both boundaries, making the subproblem self-contained: everything outside is already decided.</p>`, rubric: ['Bursting changes adjacency, so both sides matter', 'A prefix state leaves the right boundary undetermined', 'An interval fixes both boundaries, making the subproblem independent'] }
      ]
    },
    {
      title: 'The last-operation view',
      teach: `
<p>The key move: instead of asking "which balloon do I burst first?" (which leaves a messy, disconnected remainder), ask <strong>"which one is burst last?"</strong>. The last one has its original neighbours, so the interval splits cleanly in two.</p>
<div class="ex">
<div class="sub">Burst Balloons</div>
<p>Pad with 1s at both ends. dp[l][r] = the best score from bursting everything strictly between l and r. If k is the <em>last</em> burst in that range, its neighbours at that moment are exactly l and r:</p>
<pre><code>dp[l][r] = max over k in (l, r) of  a[l]*a[k]*a[r] + dp[l][k] + dp[k][r];</code></pre>
<p>[3, 1, 5, 8] gives <strong>167</strong>.</p>
<div class="sub">Matrix chain multiplication</div>
<p>dp[i][j] = the cheapest way to multiply matrices i..j. The <em>last</em> multiplication joins the products of i..k and k+1..j, costing d[i]·d[k+1]·d[j+1] extra. Dimensions [10, 20, 30, 40] give <strong>18000</strong>.</p>
<div class="sub">Why "last" rather than "first"</div>
<p>Choosing the last operation guarantees the two sides were solved independently. Choosing the first leaves a remainder that is not a clean interval, so the subproblems overlap and the state no longer describes them.</p>
</div>`,
      qs: [
        { type: 'num', q: `Burst Balloons on [3, 1, 5, 8] (pad with 1s). Maximum coins?`, a: 167, why: 'Burst 1, then 5, then 3, then 8: 3·1·5 + 3·5·8 + 1·3·8 + 1·8·1 = 15 + 120 + 24 + 8 = 167.' },
        { type: 'num', q: `Matrix chain with dimensions [10, 20, 30, 40]. Minimum multiplications?`, a: 18000, why: '(A·B)·C = 10·20·30 + 10·30·40 = 6000 + 12000 = 18000, better than A·(B·C) = 24000 + 8000 = 32000.' },
        { type: 'free', q: `Explain why Burst Balloons enumerates the balloon burst LAST rather than first.`, model: `<p>If k is burst last within (l, r), then when it pops every other balloon inside is already gone, so its neighbours are exactly the boundaries l and r: its contribution is a[l]·a[k]·a[r], a value known from the state alone. The balloons on each side were burst before, entirely within (l, k) and (k, r), which are independent subproblems. Choosing the <em>first</em> burst instead leaves the rest of the range split by a hole whose two sides interact later, so the remainder is not an interval and the state cannot describe it.</p>`, rubric: ['Last burst means its neighbours are the interval boundaries, so its value is known', 'The two sides are independent subintervals', 'First-burst framing leaves interacting pieces that are not intervals'] },
        { type: 'mcq', q: `In matrix chain DP, what does the split point k represent?`, opts: ['The last multiplication joining two halves', 'The first matrix multiplied', 'The largest dimension in the chain', 'The matrix that is skipped'], a: 0, why: 'dp[i][k] and dp[k+1][j] are already-computed products; the split is where the final multiply happens.' }
      ]
    },
    {
      title: 'Fill order: by increasing interval length',
      teach: `
<p>dp[i][j] depends on strictly <em>shorter</em> intervals, so length must increase outward.</p>
<pre><code>for (int len = 2; len &lt;= n; len++)                 // interval length
    for (int i = 0; i + len - 1 &lt; n; i++) {
        int j = i + len - 1;
        for (int k = i; k &lt; j; k++)                 // split / last operation
            dp[i][j] = best(dp[i][j], dp[i][k] + dp[k+1][j] + cost(i, k, j));
    }</code></pre>
<div class="ex">
<div class="sub">The picture</div>
<p>The table is upper-triangular (i ≤ j) and fills by <strong>diagonals</strong>: the main diagonal is the base case (single elements), and each pass moves one diagonal outward, always reading cells strictly below and to the left, which are already final.</p>
<div class="sub">The memoised alternative</div>
<p>Top-down recursion with a memo table needs no fill order at all: the recursion resolves dependencies itself (P16). For interval DP that's often the safer choice under time pressure, as long as the depth stays small (intervals shrink fast, so depth is O(n)).</p>
<div class="sub">Cost</div>
<p>O(n²) states × O(n) splits = <strong>O(n³)</strong>. n = 500 gives 1.25 × 10⁸, right at the limit; n ≤ 100–300 is the comfortable range, which matches the constraint table in F01.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why must interval DP be filled by increasing length?`, opts: ['dp[i][j] reads only shorter intervals', 'Longer intervals are cheaper first', 'To keep the table contiguous', 'Because i must exceed j'], a: 0, why: 'Every dependency (dp[i][k], dp[k+1][j]) is strictly shorter, so those cells must already be final.' },
        { type: 'num', q: `Interval DP with O(n³) work and n = 300. How many operations, in millions?`, a: 27, tol: 2, why: '300³ = 2.7 × 10⁷.' },
        { type: 'mcq', q: `A constraint of n ≤ 500 with a "combine adjacent items" flavour suggests…`, opts: ['An O(n³) interval DP', 'An O(2ⁿ) bitmask DP', 'An O(n log n) greedy', 'An O(n) sliding window'], a: 0, why: 'F01\'s table: a few hundred is the cubic range, and adjacency-combining is the interval-DP signal.' },
        { type: 'free', q: `Why does a top-down memoised interval DP need no explicit fill order, and what is its risk?`, model: `<p>Recursion computes a subproblem the moment it is needed, so dependencies resolve themselves: each call blocks until its shorter subintervals return. The risk is stack depth and repeated-call overhead: depth is fine here (each call shrinks the interval), but a table indexed by two ints needs care to initialise a "not computed" sentinel, and the constant factor is larger than a tight bottom-up triple loop. For very large n the bottom-up version is usually faster.</p>`, rubric: ['Recursion resolves dependencies in the right order automatically', 'Needs a sentinel for "not yet computed"', 'Risks: stack depth / constant-factor overhead vs bottom-up'] }
      ]
    },
    {
      title: 'Cost, and the problems that look like this',
      teach: `
<div class="ex">
<div class="sub">The family</div>
<p><strong>Burst Balloons</strong> (last burst), <strong>Matrix Chain</strong> (last multiply), <strong>Minimum Cost to Cut a Stick</strong> (last cut; a stick of length 7 cut at [1,3,4,5] costs <strong>16</strong>), <strong>Stone Game / Removal Game</strong> (players take from the ends: dp[i][j] = best margin for the player to move), <strong>Longest Palindromic Subsequence</strong>, <strong>CSES Rectangle Cutting</strong> (2D version: cut a rectangle into squares).</p>
<div class="sub">The two-player twist</div>
<p>For games, dp[i][j] is usually the <em>difference</em> (my score minus yours) with optimal play: dp[i][j] = max(a[i] − dp[i+1][j], a[j] − dp[i][j−1]). Storing the margin rather than two scores keeps the state one number, and the sign flip encodes "now it's the opponent's turn".</p>
<div class="sub">When O(n³) is too slow</div>
<p>Some interval DPs admit Knuth's optimisation (the optimal split is monotone), reducing O(n³) to O(n²). That's CP territory, worth knowing exists but not worth memorising for interviews.</p>
</div>`,
      qs: [
        { type: 'num', q: `Minimum Cost to Cut a Stick: length 7, cuts at [1, 3, 4, 5]. Minimum total cost?`, a: 16, why: 'Each cut costs the current piece length; the best order totals 16.' },
        { type: 'mcq', q: `In the two-player "take from either end" game, what does dp[i][j] usually store?`, opts: ['The score margin with optimal play', 'The first player\'s total score', 'Whose turn it currently is', 'The number of moves left'], a: 0, why: 'Storing the difference makes the opponent\'s turn a simple sign flip and keeps the state a single number.' },
        { type: 'mcq', q: `Which of these is NOT interval DP?`, opts: ['Longest increasing subsequence', 'Burst balloons for max coins', 'Matrix chain multiplication', 'Optimal stick cutting order'], a: 0, why: 'LIS has a prefix/ending-at state (P16); nothing about it combines adjacent ranges.' },
        { type: 'free', q: `<em>Stone Game</em>: piles in a row, players alternately take from either end, both play optimally. Give the state and recurrence, and explain the sign flip.`, model: `<p>dp[i][j] = the maximum margin (current player's score minus the opponent's) achievable from piles i..j with the current player to move. Taking the left pile scores a[i] and then leaves the opponent facing i+1..j, where <em>their</em> best margin is dp[i+1][j]; from the current player's viewpoint that is subtracted: a[i] − dp[i+1][j]. Similarly a[j] − dp[i][j−1] for the right pile. dp[i][j] = max of the two; base dp[i][i] = a[i]. The first player wins iff dp[0][n−1] &gt; 0. The subtraction is the change of perspective from one turn to the next.</p>`, rubric: ['State: best margin for the player to move on i..j', 'Recurrence max(a[i] − dp[i+1][j], a[j] − dp[i][j−1]) with base dp[i][i] = a[i]', 'Explains the minus sign as switching whose margin is being measured'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Burst Balloons on [1, 5] (padded with 1s). Maximum coins?`, a: 10, why: 'Burst 1 first: 1·1·5 = 5, then 1·5·1 = 5, total 10. Bursting 5 first gives 5 + 1 = 6.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Minimum score triangulation of a convex polygon": pick a triangulation minimising the sum of the products of each triangle's vertex values. Give the interval state and recurrence.`, model: `<p>Number the vertices 0..n−1 in order. dp[i][j] = the minimum score to triangulate the polygon formed by vertices i..j plus the chord i–j. The edge i–j belongs to exactly one triangle in any triangulation, with a third vertex k strictly between: dp[i][j] = min over k in (i, j) of dp[i][k] + dp[k][j] + v[i]·v[k]·v[j]. Base: dp[i][j] = 0 when j − i &lt; 2. Answer dp[0][n−1], O(n³). It's Burst Balloons with the same "enumerate the piece containing the boundary" move.</p>`, rubric: ['State: min score to triangulate vertices i..j with chord i–j', 'Recurrence over the third vertex k: dp[i][k] + dp[k][j] + v[i]v[k]v[j]', 'Base j − i &lt; 2 gives 0; O(n³)'] },
    { type: 'num', q: `Matrix chain with dimensions [40, 20, 30, 10, 30]. Minimum multiplications?`, a: 26000, why: 'The optimal parenthesisation is ((A(BC))D): 26000, versus 64000+ for naive left-to-right.' },
    { type: 'mcq', q: `Interval DP state count and per-state work?`, opts: ['O(n²) states, O(n) work each', 'O(n) states, O(n²) work each', 'O(2ⁿ) states, O(1) work each', 'O(n³) states, O(1) work each'], a: 0, why: 'One state per interval; each tries every split point.' },
    { type: 'free', q: `Discriminate: prefix DP (P16), interval DP (P25) and bitmask DP (P24). What feature of the problem picks each?`, model: `<p>Prefix DP when decisions are made left to right and the past is summarised by how far you have got (plus a little state): dp[i] or dp[i][small]. Interval DP when an operation happens <em>inside</em> a range and splits it into two independent ranges, so both boundaries matter, typically with adjacency changing as items are removed: dp[i][j], O(n³), n a few hundred. Bitmask DP when order does not matter but <em>which</em> items are used does, with n ≤ ~20: dp[mask]. The signals are respectively a linear scan, a combine-adjacent structure, and a tiny n with subsets.</p>`, rubric: ['Prefix: left-to-right decisions, state = position (+ small extra)', 'Interval: operations inside a range splitting it in two; both ends in the state', 'Bitmask: which subset is used, n ≤ ~20; names the constraint signals'] }
  ],
  practice: [
    { name: 'Burst Balloons', lc: 'LeetCode 312', prompt: `<p>Bursting balloon i scores a[left]·a[i]·a[right] with current neighbours. Maximise the total.</p>`, hint: `<p>Pad with 1s and enumerate the balloon burst <em>last</em> in each open interval.</p>`,
      solution: `<pre><code>public int maxCoins(int[] nums) {
    int n = nums.length;
    int[] a = new int[n + 2];
    a[0] = a[n + 1] = 1;
    System.arraycopy(nums, 0, a, 1, n);
    int[][] dp = new int[n + 2][n + 2];          // dp[l][r]: burst everything strictly inside
    for (int len = 2; len &lt;= n + 1; len++)       // gap between l and r
        for (int l = 0; l + len &lt;= n + 1; l++) {
            int r = l + len;
            for (int k = l + 1; k &lt; r; k++)
                dp[l][r] = Math.max(dp[l][r], a[l] * a[k] * a[r] + dp[l][k] + dp[k][r]);
        }
    return dp[0][n + 1];
}</code></pre><p class="cx">O(n³) time, O(n²) space.</p>` },
    { name: 'Longest Palindromic Subsequence', lc: 'LeetCode 516', prompt: `<p>Length of the longest palindromic subsequence.</p>`, hint: `<p>Matching ends add 2; otherwise drop one end.</p>`,
      solution: `<pre><code>public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = n - 1; i &gt;= 0; i--) {          // i decreasing = intervals grow outward
        dp[i][i] = 1;
        for (int j = i + 1; j &lt; n; j++)
            dp[i][j] = (s.charAt(i) == s.charAt(j))
                ? dp[i + 1][j - 1] + 2
                : Math.max(dp[i + 1][j], dp[i][j - 1]);
    }
    return dp[0][n - 1];
}</code></pre><p class="cx">O(n²). Iterating i downwards is the same "shorter intervals first" order.</p>` },
    { name: 'Minimum Cost to Cut a Stick', lc: 'LeetCode 1547', prompt: `<p>Each cut costs the length of the piece being cut. Minimise the total.</p>`, hint: `<p>Sort the cut positions with 0 and n as sentinels; enumerate the last cut in each range.</p>`,
      solution: `<pre><code>public int minCost(int n, int[] cuts) {
    int m = cuts.length;
    int[] c = new int[m + 2];
    System.arraycopy(cuts, 0, c, 1, m);
    c[0] = 0; c[m + 1] = n;
    Arrays.sort(c);
    int[][] dp = new int[m + 2][m + 2];
    for (int len = 2; len &lt;= m + 1; len++)
        for (int i = 0; i + len &lt;= m + 1; i++) {
            int j = i + len;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i + 1; k &lt; j; k++)
                dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + c[j] - c[i]);
        }
    return dp[0][m + 1];
}</code></pre><p class="cx">O(m³) in the number of cuts, not the stick length.</p>` },
    { name: 'Stone Game (margin form)', lc: 'LeetCode 486 · CSES Removal Game', prompt: `<p>Players alternately take from either end; both play optimally. Does the first player win?</p>`, hint: `<p>Store the margin and flip the sign for the opponent's turn.</p>`,
      solution: `<pre><code>public boolean predictTheWinner(int[] a) {
    int n = a.length;
    int[][] dp = new int[n][n];                 // best margin for the player to move
    for (int i = 0; i &lt; n; i++) dp[i][i] = a[i];
    for (int len = 2; len &lt;= n; len++)
        for (int i = 0; i + len - 1 &lt; n; i++) {
            int j = i + len - 1;
            dp[i][j] = Math.max(a[i] - dp[i + 1][j], a[j] - dp[i][j - 1]);
        }
    return dp[0][n - 1] &gt;= 0;
}</code></pre><p class="cx">O(n²). The subtraction switches whose margin is measured.</p>` }
  ]
});
