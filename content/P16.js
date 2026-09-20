COURSE.topic({
  id: 'P16',
  intro: `In placement you had no working model of DP at all, so this topic starts from scratch and is the longest in the course. The one-line summary: <strong>DP is recursion (F08) where the same subproblem appears many times, so you compute each one once</strong>. The hard part isn't the code, it's naming the state precisely and writing a recurrence you can <em>prove</em>. Get those right and the code is mechanical.`,
  kps: [
    {
      title: 'Overlapping subproblems: look for repeats in the recursion tree',
      teach: `
<p>Naive Fibonacci: <code>fib(n) = fib(n−1) + fib(n−2)</code>. Draw the recursion tree (F05) for fib(5) and you'll see <code>fib(2)</code> three times, <code>fib(3)</code> twice. Each repeat recomputes an identical subtree.</p>
<div class="ex">
<div class="sub">The numbers</div>
<p>fib(10) naively makes <strong>177 calls</strong> for 11 distinct values. fib(50) would make about 2.5 × 10¹⁰. With each distinct value computed once, fib(50) takes 51 steps.</p>
<div class="sub">The two conditions for DP</div>
<p>(1) <strong>Overlapping subproblems</strong>: the same subproblem recurs (otherwise plain recursion/divide-and-conquer is fine, e.g. merge sort never repeats a subproblem). (2) <strong>Optimal substructure</strong>: the answer is built from the answers of smaller subproblems.</p>
<div class="sub">The picture</div>
<p>Memoization collapses the exponential <em>tree</em> into a small <em>DAG</em>: identical nodes merge, and the edges are "which smaller problems do I need?".</p>
</div>
<p>So the trigger question when you see exponential recursion: <strong>"are the arguments repeating?"</strong> If yes, cache. If not, DP won't help.</p>`,
      qs: [
        { type: 'num', q: `Naive fib(10) with base cases fib(0) = 0, fib(1) = 1: how many calls in total?`, a: 177, why: 'calls(n) = 1 + calls(n−1) + calls(n−2): 1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177.' },
        { type: 'mcq', q: `Why is merge sort NOT a dynamic programming problem?`, opts: ['Its subproblems never repeat', 'It has no base case', 'It is already O(n log n)', 'It does not use recursion'], a: 0, why: 'Each half is a distinct slice; nothing is recomputed, so there is nothing to cache.' },
        { type: 'free', q: `Explain how memoization turns an exponential recursion tree into a polynomial computation, in terms of nodes.`, model: `<p>The tree has exponentially many nodes, but only polynomially many <em>distinct</em> argument values. With a cache, the first visit to a value computes it and every later visit is an O(1) lookup, so the work equals the number of distinct states (plus the edges between them) rather than the number of tree nodes. The tree collapses into a DAG whose node count is the number of states.</p>`, rubric: ['Exponentially many tree nodes but few distinct argument values', 'Each distinct state is computed once; repeats become O(1) lookups', 'Work becomes states × transitions (the DAG), not tree size'] },
        { type: 'mcq', q: `Which problem has overlapping subproblems?`, opts: ['Count paths in a grid moving right/down', 'Binary search in a sorted array', 'Find the max of an array', 'Reverse a linked list'], a: 0, why: 'Cell (i, j) is reached from both (i−1, j) and (i, j−1), so its subtree recurs many times.' }
      ]
    },
    {
      title: 'State definition: say in words exactly what dp[i] means',
      teach: `
<p>This is where most DP attempts fail. <strong>Write a sentence, not a formula.</strong> If you can't finish the sentence, you don't have a state yet.</p>
<div class="ex">
<div class="sub">Good state sentences</div>
<p>House Robber: "dp[i] = the maximum money obtainable from the first i houses." Coin Change: "dp[a] = the fewest coins that make exactly amount a, or ∞ if impossible." LIS: "dp[i] = the length of the longest increasing subsequence <em>ending exactly at</em> index i."</p>
<div class="sub">Why "ending exactly at i" matters</div>
<p>If LIS's state were "the longest subsequence within the first i elements", you couldn't extend it: you wouldn't know the last value, so you couldn't tell whether the next element may follow. <strong>The state must carry everything the next decision depends on.</strong></p>
<div class="sub">Test your state</div>
<p>Ask: "given only the state, can I make the next decision?" If you need extra information (the last value, how many items are used, whether the previous was taken), that information <em>is</em> part of the state, which may mean a second dimension.</p>
<div class="sub">Consequence</div>
<p>The final answer isn't always dp[n]. For LIS it's max over all dp[i], because the best subsequence can end anywhere.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `LIS state "dp[i] = LIS ending exactly at i". Why not "LIS among the first i elements"?`, opts: ['Extending needs the last element\'s value', 'It would use too much memory', 'The answer would be dp[n] then', 'Subsequences must be contiguous'], a: 0, why: 'To decide whether element i+1 can extend a subsequence, you must know what it would follow.' },
        { type: 'mcq', q: `With the state "LIS ending exactly at i", the final answer is…`, opts: ['The maximum of dp[0..n−1]', 'dp[n − 1] by definition', 'The sum of all dp values', 'dp[0], the first element'], a: 0, why: 'The best subsequence may end at any index.' },
        { type: 'free', q: `"Best Time to Buy and Sell Stock with Cooldown": after selling you must skip a day. Why does a one-dimensional dp[i] fail, and what state fixes it?`, model: `<p>dp[i] = "max profit using the first i days" isn't enough: the decision on day i depends on whether you currently <em>hold</em> a share and whether you sold yesterday (cooldown). Those facts aren't recoverable from the profit alone. Fix: add a dimension for the situation, e.g. dp[i][held], dp[i][sold], dp[i][rest], or equivalently three running values. The state must carry everything the next decision depends on.</p>`, rubric: ['A profit-only state cannot tell whether you hold a share / are in cooldown', 'The next decision depends on that, so it belongs in the state', 'Adds a second dimension (holding / sold / rest)'] },
        { type: 'mcq', q: `Partition Equal Subset Sum. Which state definition works?`, opts: ['dp[i][s] = can the first i items make sum s?', 'dp[i] = the maximum sum from the first i', 'dp[s] = number of items summing to s', 'dp[i] = whether item i is included'], a: 0, why: 'Feasibility per (prefix, target sum) is what the recurrence needs; the others lose information.' }
      ]
    },
    {
      title: 'The recurrence: enumerate the last decision, then prove it',
      teach: `
<p>With a state, get the recurrence by asking: <strong>"what was the last choice made, and what does each option leave behind?"</strong> Cover every option, and each option must reduce to a <em>smaller</em> state.</p>
<div class="ex">
<div class="sub">House Robber</div>
<p>State: dp[i] = max money from the first i houses. Last decision about house i: rob it or skip it.</p>
<p>Rob it → can't have robbed i−1 → dp[i−2] + a[i]. Skip it → dp[i−1]. So <strong>dp[i] = max(dp[i−1], dp[i−2] + a[i])</strong>, with dp[0] = 0, dp[1] = a[0].</p>
<div class="sub">The proof (induction, F08)</div>
<p>Assume dp[j] is correct for all j &lt; i. Any valid plan for the first i houses either uses house i or not. If not, it's a valid plan for i−1 houses, worth at most dp[i−1]. If it does, it can't use house i−1, so the rest is a valid plan for the first i−2 houses, worth at most dp[i−2]; total ≤ dp[i−2] + a[i]. The max of the two cases is achievable, so dp[i] is correct.</p>
<div class="sub">The shape of every DP proof</div>
<p>(1) Every valid solution falls into one of the enumerated cases. (2) In each case, the leftover part is a valid solution of a smaller subproblem, bounded by that dp value. (3) Each case's bound is achievable. Therefore the max/min over cases is exact.</p>
</div>`,
      qs: [
        { type: 'num', q: `House Robber on [2, 7, 9, 3, 1]. Maximum?`, a: 12, why: 'Rob houses 0, 2, 4: 2 + 9 + 1 = 12.' },
        { type: 'num', q: `House Robber on [1, 2, 3, 1]. Maximum?`, a: 4, why: '1 + 3.' },
        { type: 'free', q: `Write the Coin Change recurrence by "last decision" and prove it covers every possibility.`, model: `<p>State: dp[a] = fewest coins making exactly a (∞ if impossible). Last decision: which coin c was used last. If a solution for a exists, it uses some coin c ≤ a as its last coin, and removing it leaves an exact solution for a − c, using dp[a − c] coins at best. So dp[a] = 1 + min over c of dp[a − c], with dp[0] = 0. Every solution is covered because every non-empty solution has some last coin, and each case is achievable by taking an optimal solution for a − c and adding c.</p>`, rubric: ['State: fewest coins for exact amount a, with dp[0] = 0', 'Enumerates the last coin used: dp[a] = 1 + min over c of dp[a − c]', 'Argues every solution has some last coin (cases are exhaustive) and each case is achievable'] },
        { type: 'mcq', q: `A recurrence where one option leaves a subproblem of the SAME size would…`, opts: ['Recurse forever / be ill-founded', 'Simply be slower to compute', 'Still work with memoization', 'Only fail for negative inputs'], a: 0, why: 'Every option must strictly shrink the state, or there is no base case to reach (F08\'s measure).' }
      ]
    },
    {
      title: 'Memoization vs tabulation, and fill order',
      teach: `
<div class="ex">
<div class="sub">Top-down (memoized recursion)</div>
<p>Write the recurrence directly; cache results in a map or array. Only the states you actually need are computed. Risk: recursion depth (F05) on large inputs.</p>
<pre><code>int go(int i) {
    if (i &lt;= 0) return 0;
    if (memo[i] != -1) return memo[i];
    return memo[i] = Math.max(go(i - 1), go(i - 2) + a[i - 1]);
}</code></pre>
<div class="sub">Bottom-up (tabulation)</div>
<p>Fill an array in an order where every dependency is already computed. No recursion, so no stack limit, and usually a smaller constant factor.</p>
<pre><code>int[] dp = new int[n + 1];
dp[1] = a[0];
for (int i = 2; i &lt;= n; i++) dp[i] = Math.max(dp[i - 1], dp[i - 2] + a[i - 1]);</code></pre>
<div class="sub">Fill order = the recurrence's arrows</div>
<p>dp[i] depends on i−1 and i−2, so increasing i works. In 2D, dp[i][j] depending on dp[i−1][j] and dp[i][j−1] means row by row, left to right. <strong>Get this wrong and you read zeros.</strong> The safe check: before computing a cell, are all the cells it reads already final?</p>
<div class="sub">Space optimisation</div>
<p>If dp[i] only reads the last two entries, keep two variables: O(1) space. If a 2D dp only reads the previous row, keep one row: O(width).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `dp[i][j] depends on dp[i−1][j], dp[i][j−1] and dp[i−1][j−1]. Valid fill order?`, opts: ['Rows top to bottom, left to right', 'Rows bottom to top, right to left', 'Columns right to left, any rows', 'Any order once dp is zeroed'], a: 0, why: 'All three dependencies are above or to the left, so they are already final in that order.' },
        { type: 'mcq', q: `Main risk of top-down memoization in Java for n = 10⁶ states?`, opts: ['StackOverflowError from deep recursion', 'The cache uses too much memory', 'It computes unreachable states', 'Results become non-deterministic'], a: 0, why: 'Depth can reach n (F05). Tabulation avoids it.' },
        { type: 'free', q: `When is top-down better than bottom-up? Give two situations.`, model: `<p>(1) When only a small fraction of the state space is reachable: recursion computes just those, while tabulation fills everything (e.g. coin amounts reachable only in big jumps). (2) When the fill order is awkward to work out, as with complex multi-dimensional dependencies or states indexed by sets/strings: recursion follows dependencies automatically and a HashMap can key arbitrary states. Bottom-up wins when the state space is dense, memory layout matters, or recursion depth would overflow.</p>`, rubric: ['Sparse/reachable-only state spaces favour top-down', 'Complex or awkward fill orders favour top-down (dependencies resolve themselves)', 'Notes bottom-up\'s advantages: dense spaces, no stack depth'] },
        { type: 'num', q: `House Robber space-optimised to two running variables. How many array slots does the dp table need?`, a: 0, why: 'None: dp[i] reads only the previous two values, so two ints suffice.' }
      ]
    },
    {
      title: 'Complexity = number of states × work per state',
      teach: `
<div class="ex">
<div class="sub">The formula</div>
<p>Count the distinct states (the size of your dp table), and multiply by the work done to compute one state (usually the number of options in the recurrence).</p>
<div class="sub">Examples</div>
<p>House Robber: n states × O(1) = <strong>O(n)</strong>. Coin Change: amount states × k coins = <strong>O(amount · k)</strong>. LCS: n·m states × O(1) = <strong>O(n·m)</strong>. LIS (the DP version): n states × O(n) scan = <strong>O(n²)</strong>; the patience/binary-search version is O(n log n).</p>
<div class="sub">Pseudo-polynomial</div>
<p>Coin Change is O(amount · k), which looks polynomial but the input is the <em>number</em> amount, written in log(amount) digits. So it's exponential in the input <em>size</em>. That's why subset-sum style DP is called pseudo-polynomial and why it's fine for amount ≤ 10⁴ but not 10¹⁸.</p>
<div class="sub">Space</div>
<p>Table size, unless you can drop finished rows.</p>
</div>`,
      qs: [
        { type: 'num', q: `Coin Change with 5 coin types and amount 10,000. Roughly how many basic operations (states × options), in thousands?`, a: 50, tol: 5, why: '10,000 states × 5 options = 50,000.' },
        { type: 'mcq', q: `LCS of two strings of length 1000 each. Time and space (no optimisation)?`, opts: ['O(10⁶) time, O(10⁶) space', 'O(10³) time, O(10³) space', 'O(10⁹) time, O(10⁶) space', 'O(10⁶) time, O(10³) space'], a: 0, why: '1000 × 1000 states, O(1) each. Space drops to O(10³) if you keep only the previous row.' },
        { type: 'num', q: `Coin Change [1, 2, 5], amount 11. Fewest coins?`, a: 3, why: '5 + 5 + 1.' },
        { type: 'free', q: `Why is a knapsack DP of O(n · W) not a polynomial-time algorithm in the strict sense?`, model: `<p>W is a numeric value in the input, not the input's size. Writing W takes only about log₂ W bits, so a table of size W is exponential in the number of input bits. Doubling the number of digits of W squares the work. That's "pseudo-polynomial": fast when W is small (10⁴–10⁶), useless when W is 10¹⁸.</p>`, rubric: ['W is a value; the input size is its number of digits/bits', 'O(nW) is exponential in log W, the true input size', 'Practical when W is small, infeasible for huge W'] },
        { type: 'mcq', q: `A DP has states (i, j, k) with i, j ≤ 100 and k ≤ 10, and each state tries 3 options. Total work?`, opts: ['About 3 × 10⁵', 'About 10⁶', 'About 3 × 10³', 'About 10¹⁰'], a: 0, why: '100 × 100 × 10 = 10⁵ states × 3 = 3 × 10⁵.' }
      ]
    },
    {
      title: 'DP vs greedy: when a local choice is wrong',
      teach: `
<p>Greedy takes the best-looking option now and never reconsiders. DP tries every option and keeps the best overall. Greedy is faster but <strong>needs a proof</strong> (P17); when the proof fails, you need DP.</p>
<div class="ex">
<div class="sub">The classic counterexample: coins [1, 3, 4], amount 6</div>
<p>Greedy (largest first): 4, then 1, then 1 = <strong>3 coins</strong>. Optimal: 3 + 3 = <strong>2 coins</strong>. Taking the biggest coin first destroys the better pairing. So Coin Change needs DP for arbitrary coin sets. (For some coin systems, like [1, 5, 10, 25], greedy happens to be optimal, and that's a theorem about those coins, not about greed.)</p>
<div class="sub">How to test a greedy idea in an interview</div>
<p>Try to break it in 30 seconds with a small input. If you can't, state the exchange argument (P17) explicitly. If you can't do either, use DP and say why.</p>
<div class="sub">The underlying difference</div>
<p>Greedy assumes the locally best choice belongs to some optimal solution. DP assumes only that an optimal solution is built from optimal solutions of subproblems, which is far weaker and much more often true.</p>
</div>`,
      qs: [
        { type: 'num', q: `Coins [1, 3, 4], amount 6. How many coins does the greedy "largest first" use?`, a: 3, why: '4 + 1 + 1. The optimum is 3 + 3 = 2 coins.' },
        { type: 'num', q: `Coins [1, 3, 4], amount 6. Optimal number of coins?`, a: 2, why: '3 + 3.' },
        { type: 'free', q: `Explain the difference between greedy's assumption and DP's assumption, and why DP's is easier to satisfy.`, model: `<p>Greedy assumes an <em>exchange property</em>: the locally best choice is part of some optimal solution, so you never need to revisit it. DP assumes only <em>optimal substructure</em>: an optimal solution is composed of optimal solutions to smaller subproblems, while still trying every option at each step. DP's assumption is weaker because it doesn't claim to know which option is right, so it holds for many problems where no greedy rule works (coin change with arbitrary coins, knapsack), at the cost of exploring all options.</p>`, rubric: ['Greedy: the local choice belongs to an optimal solution (exchange property)', 'DP: only optimal substructure, trying all options', 'DP\'s condition is weaker, so it applies more broadly, but costs more time'] },
        { type: 'mcq', q: `Which problem is solved correctly by a greedy rule?`, opts: ['Most non-overlapping intervals, by end time', 'Coin change with an arbitrary coin set', '0/1 knapsack by value-to-weight ratio', 'Longest increasing subsequence length'], a: 0, why: 'Interval scheduling has a valid exchange argument (P17). The others have known counterexamples.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Unique Paths II": count paths from top-left to bottom-right of an m × n grid moving right/down, where some cells are blocked. Give the state, recurrence, base cases, fill order and complexity.`, model: `<p>State: dp[i][j] = number of paths from the start to cell (i, j). Recurrence by last move: you arrived from above or from the left, so dp[i][j] = dp[i−1][j] + dp[i][j−1], and dp[i][j] = 0 if the cell is blocked. Base: dp[0][0] = 1 if unblocked. Fill order: rows top to bottom, left to right (both dependencies are above/left). Complexity O(m·n) time, O(n) space keeping one row.</p>`, rubric: ['State: number of paths to (i, j)', 'Recurrence from the last move (from above or left); blocked cells are 0', 'Base case and a fill order matching the dependencies', 'O(m·n) time'] },
    { type: 'num', q: `Longest common subsequence of "abcde" and "ace"?`, a: 3, why: '"ace".' },
    { type: 'num', q: `Length of the longest increasing subsequence of [10, 9, 2, 5, 3, 7, 101, 18]?`, a: 4, why: '[2, 3, 7, 101] or [2, 5, 7, 18].' },
    { type: 'mcq', q: `Can [1, 5, 11, 5] be split into two subsets of equal sum?`, opts: ['Yes: {11} and {1, 5, 5}', 'No: the total is odd', 'Yes: {1, 11} and {5, 5}', 'No: 11 is too large'], a: 0, why: 'Total 22, half 11. Subset-sum DP on target 11.' },
    { type: 'free', q: `A candidate says "I\'ll use DP" and writes dp[i] = the answer for the first i items, then can\'t write the recurrence. What diagnostic question would you ask, and why does it usually reveal the fix?`, model: `<p>Ask: "to decide what to do with item i+1, what do you need to know besides dp[i]?" The answer is usually something the state omits: whether item i was taken, the remaining capacity, the last value chosen, the count used so far. Whatever is named must become part of the state, typically a second dimension. This works because a recurrence can only be written when the state carries everything the next decision depends on.</p>`, rubric: ['Asks what else the next decision depends on', 'That missing information must be added to the state (extra dimension)', 'Explains why: a recurrence needs a state sufficient for the next decision'] }
  ],
  practice: [
    { name: 'House Robber', lc: 'LeetCode 198', prompt: `<p>Maximum sum with no two adjacent elements.</p>`, hint: `<p>Last decision: rob house i or skip it.</p>`,
      solution: `<pre><code>public int rob(int[] a) {
    int prev2 = 0, prev1 = 0;                 // dp[i-2], dp[i-1]
    for (int x : a) {
        int cur = Math.max(prev1, prev2 + x);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}</code></pre><p class="cx">O(n) time, O(1) space.</p>` },
    { name: 'Coin Change', lc: 'LeetCode 322', prompt: `<p>Fewest coins making exactly amount, or −1.</p>`, hint: `<p>Last decision: which coin was used last.</p>`,
      solution: `<pre><code>public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);              // "infinity"
    dp[0] = 0;
    for (int a = 1; a &lt;= amount; a++)
        for (int c : coins)
            if (c &lt;= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] &gt; amount ? -1 : dp[amount];
}</code></pre><p class="cx">O(amount · k). Greedy fails, e.g. coins [1,3,4] with amount 6.</p>` },
    { name: 'Longest Common Subsequence', lc: 'LeetCode 1143', prompt: `<p>Length of the longest common subsequence of two strings.</p>`, hint: `<p>Compare the last characters: equal, or drop one side.</p>`,
      solution: `<pre><code>public int longestCommonSubsequence(String s, String t) {
    int n = s.length(), m = t.length();
    int[][] dp = new int[n + 1][m + 1];       // dp[i][j]: LCS of first i and first j chars
    for (int i = 1; i &lt;= n; i++)
        for (int j = 1; j &lt;= m; j++)
            dp[i][j] = (s.charAt(i - 1) == t.charAt(j - 1))
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[n][m];
}</code></pre><p class="cx">O(n·m) time, O(n·m) space (O(m) with one row).</p>` },
    { name: 'Longest Increasing Subsequence', lc: 'LeetCode 300', prompt: `<p>Length of the longest strictly increasing subsequence.</p>`, hint: `<p>dp[i] = LIS ending exactly at i; answer = max over i.</p>`,
      solution: `<pre><code>public int lengthOfLIS(int[] a) {
    int n = a.length, best = 0;
    int[] dp = new int[n];
    for (int i = 0; i &lt; n; i++) {
        dp[i] = 1;
        for (int j = 0; j &lt; i; j++)
            if (a[j] &lt; a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        best = Math.max(best, dp[i]);
    }
    return best;
}</code></pre><p class="cx">O(n²). The O(n log n) version keeps the smallest tail per length and binary-searches it.</p>` },
    { name: 'Partition Equal Subset Sum', lc: 'LeetCode 416', prompt: `<p>Can the array be split into two subsets with equal sums?</p>`, hint: `<p>Subset-sum for target = total / 2; iterate sums downward for 0/1 use.</p>`,
      solution: `<pre><code>public boolean canPartition(int[] a) {
    int total = 0;
    for (int x : a) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];   // dp[s]: sum s is reachable
    dp[0] = true;
    for (int x : a)
        for (int s = target; s &gt;= x; s--)     // downward: each item used at most once
            dp[s] |= dp[s - x];
    return dp[target];
}</code></pre><p class="cx">O(n · total) pseudo-polynomial. The downward loop is what makes it 0/1 rather than unbounded.</p>` }
  ]
});
