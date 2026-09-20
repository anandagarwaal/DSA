COURSE.topic({
  id: 'F08',
  intro: `Every recursive solution and every DP recurrence is correct for exactly one reason: <strong>induction</strong>. If you can run an induction argument, you can trust a recursive call without tracing it, and that's what makes recursion (trees, backtracking, DP) feel easy instead of magic.`,
  kps: [
    {
      title: 'Base case + inductive step covers every n',
      teach: `
<p>To prove a claim P(n) for all n ≥ 0:</p>
<ol><li><strong>Base case:</strong> prove P(0).</li><li><strong>Inductive step:</strong> prove that <em>if</em> P(k) is true, then P(k+1) is true.</li></ol>
<p><strong>The picture: dominoes.</strong> The base case knocks over the first domino. The step guarantees every domino knocks over the next one. So all of them fall, with no domino left standing.</p>
<div class="ex">
<div class="sub">Worked example: 1 + 2 + … + n = n(n+1)/2</div>
<p><strong>Base:</strong> n = 1: left side 1, right side 1·2/2 = 1. ✓</p>
<p><strong>Step:</strong> assume 1 + … + k = k(k+1)/2. Then 1 + … + k + (k+1) = k(k+1)/2 + (k+1) = (k+1)(k/2 + 1) = (k+1)(k+2)/2. That's the formula for n = k+1. ✓</p>
<div class="sub">What the step is really doing</div>
<p>It never re-proves the whole sum. It <strong>uses</strong> the claim for k as a building block and only handles the one new piece, (k+1). Hold on to that idea: recursion works exactly the same way.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `You proved the inductive step (P(k) ⟹ P(k+1)) but forgot the base case. What have you shown?`, opts: ['Nothing yet; the chain has no start', 'P(n) is true for every n already', 'P(n) is true for every n ≥ 1', 'P(n) is false for some value n'], a: 0, why: 'Dominoes that knock each other over prove nothing if the first never falls. E.g. "n = n + 1" has a valid step and is always false.' },
        { type: 'free', q: `Prove by induction that 1 + 2 + 4 + … + 2ⁿ = 2ⁿ⁺¹ − 1 for all n ≥ 0.`, model: `<p>Base n = 0: left 1, right 2¹ − 1 = 1. ✓ Step: assume 1 + … + 2ᵏ = 2ᵏ⁺¹ − 1. Add 2ᵏ⁺¹: total = 2ᵏ⁺¹ − 1 + 2ᵏ⁺¹ = 2·2ᵏ⁺¹ − 1 = 2ᵏ⁺² − 1, which is the claim for k+1. ✓</p>`, rubric: ['Checks the base case explicitly', 'Assumes the claim for k and adds only the new term 2ᵏ⁺¹', 'Simplifies to 2ᵏ⁺² − 1, the claim for k+1'] },
        { type: 'mcq', q: `In the inductive step for a sum, what should you do?`, opts: ['Use the claim for k, add the new term', 'Recompute the whole sum from scratch', 'Plug in several values of n to check', 'Prove the claim for k directly first'], a: 0, why: 'The whole point: the assumption for k handles everything except the one new piece.' },
        { type: 'mcq', q: `"All horses are the same colour": base n = 1 is fine; the step removes one horse from a group of k+1 and uses overlapping groups of k. Where does it break?`, opts: ['The step fails going from 1 to 2', 'The base case is actually false', 'Induction cannot be used for sets', 'The step fails only for large k'], a: 0, why: 'With k+1 = 2 horses, the two groups of size 1 do not overlap, so the "same colour" link is missing. One broken domino-link breaks everything after it.' }
      ]
    },
    {
      title: 'Strong induction: assume all smaller cases',
      teach: `
<p>Sometimes P(k+1) needs more than P(k). It might need P(k/2), or P(k−1) <em>and</em> P(k−2). <strong>Strong induction</strong> lets you assume P holds for <em>every</em> value smaller than the one you're proving.</p>
<div class="ex">
<div class="sub">Worked example: every n ≥ 2 is a product of primes</div>
<p>Take n. If n is prime, done. Otherwise n = a·b with 2 ≤ a, b &lt; n. Both a and b are <em>smaller</em> than n, so by the strong hypothesis each is a product of primes, and so is their product. ✓</p>
<div class="sub">Why this matches recursion</div>
<p>A recursive function calls itself on <em>any</em> smaller input: n/2, n−1, a subtree. Strong induction is the proof shape that fits: "assume the function is correct on all smaller inputs, show it's correct on this one."</p>
<div class="sub">The catch</div>
<p>You still need base cases for every input the recursion can bottom out at. With Fibonacci-style F(n) = F(n−1) + F(n−2), that's <strong>two</strong> bases: F(0) and F(1).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `A recurrence T(n) uses T(n−1) and T(n−2). How many base cases does an induction proof need?`, opts: ['Two, such as n = 0 and n = 1', 'One, just the case n = 0', 'None, once the step is proven', 'As many cases as n itself'], a: 0, why: 'The step for n = 1 would need T(−1), which does not exist. Both 0 and 1 must be proven directly.' },
        { type: 'mcq', q: `Merge sort's correctness proof on an array of size n assumes correctness on…`, opts: ['Every smaller size, strong induction', 'Size n − 1 only, ordinary induction', 'Size n itself, which is circular', 'Size 1 only, the base case'], a: 0, why: 'It recurses on halves of size ⌈n/2⌉ and ⌊n/2⌋, which are smaller, but not n−1.' },
        { type: 'free', q: `Prove that every amount of postage ≥ 12 cents can be made from 4- and 5-cent stamps. (Hint: strong induction with four base cases.)`, model: `<p>Bases: 12 = 4+4+4, 13 = 4+4+5, 14 = 4+5+5, 15 = 5+5+5. Step: for n ≥ 16, n − 4 ≥ 12 and is smaller than n, so by strong induction n − 4 can be made; add one 4-cent stamp to make n. The four bases are needed because the step jumps back by 4.</p>`, rubric: ['Covers four consecutive base cases 12–15', 'Step: reduce n to n − 4 (smaller, still ≥ 12) and add a 4-cent stamp', 'Explains why four bases are needed (the step reaches back by 4)'] },
        { type: 'mcq', q: `Why is strong induction the natural proof for "a recursive function on a binary tree is correct"?`, opts: ['Subtrees are smaller but not by exactly one', 'Trees always have exactly n − 1 nodes', 'Recursion only calls on size n − 1', 'Ordinary induction cannot be used'], a: 0, why: 'A subtree can have any size smaller than the whole tree, so you need the hypothesis for all smaller sizes.' }
      ]
    },
    {
      title: 'The recursive leap of faith',
      teach: `
<p>Here's how to <em>write</em> and <em>trust</em> a recursive function without tracing every call:</p>
<ol><li>State precisely what <code>f(x)</code> returns (the <strong>contract</strong>).</li>
<li>Handle the base case(s) directly.</li>
<li>For bigger x, <strong>assume f works on smaller inputs</strong> (strong induction), and only check that your <em>combine</em> step is right.</li></ol>
<div class="ex">
<div class="sub">Worked example: height of a binary tree</div>
<pre><code>// contract: returns the number of nodes on the longest root-to-leaf path (0 for null)
int height(Node t) {
    if (t == null) return 0;                               // base
    return 1 + Math.max(height(t.left), height(t.right));   // combine
}</code></pre>
<div class="sub">The proof, in one breath</div>
<p>Trust that <code>height(t.left)</code> and <code>height(t.right)</code> are right (they're smaller trees). The longest path from t goes through t (1 node) and then down whichever child has the longer path. So 1 + max(…) is right. Done. <strong>No tracing.</strong></p>
</div>
<p>Most recursion bugs come from not stating the contract, so the combine step quietly means something different from what the recursive call returns.</p>`,
      qs: [
        { type: 'mcq', q: `When checking <code>return 1 + Math.max(height(l), height(r))</code>, what should you assume?`, opts: ['The calls on subtrees return correct heights', 'Nothing; trace each call down to the leaves', 'The tree is balanced, so recursion is safe', 'The call stack will not overflow here'], a: 0, why: 'The leap of faith is exactly the inductive hypothesis: the calls on smaller inputs are correct.' },
        { type: 'free', q: `Write the contract and one-sentence combine argument for: <code>int count(Node t) { if (t == null) return 0; return 1 + count(t.left) + count(t.right); }</code>`, model: `<p>Contract: count(t) returns the number of nodes in the subtree rooted at t (0 for empty). Combine: every node in t's subtree is either t itself or in exactly one of its two subtrees, and the recursive calls count those correctly (smaller trees), so 1 + left + right counts each node exactly once.</p>`, rubric: ['States the contract precisely (number of nodes in the subtree rooted at t)', 'Combine argument: t plus the disjoint left and right subtrees, each counted correctly by the hypothesis'] },
        { type: 'mcq', q: `A function's contract is "returns the sum of the subtree", but the combine step is <code>return t.val + sum(t.left)</code>. What's wrong?`, opts: ['It ignores the right subtree', 'The base case is missing', 'The leap of faith is invalid', 'It double-counts the root'], a: 0, why: 'Checking the combine step against the contract: every node must be in exactly one part. The right subtree\'s nodes are in none.' },
        { type: 'free', q: `Why is it valid to "assume the recursive call works" when you haven't finished writing the function yet? Isn't that circular?`, model: `<p>It's not circular because the call is on a strictly <em>smaller</em> input. That's strong induction: the base case proves the smallest inputs, and the combine step proves each size from smaller sizes. Circularity would be assuming the answer for the same input you're computing (e.g. f(n) calling f(n)), which the base case never rescues.</p>`, rubric: ['The assumption is only ever about strictly smaller inputs', 'Together with the base case this is (strong) induction, so no circularity', 'Notes it WOULD be circular if the call were on the same or larger input'] }
      ]
    },
    {
      title: 'Find the missing or wrong base case',
      teach: `
<p>A recursion with a correct combine step can still fail if <strong>some input can recurse forever, or reaches an input the base case doesn't handle</strong>.</p>
<div class="ex">
<div class="sub">Worked example: power function</div>
<pre><code>long pow(long x, int n) {
    if (n == 1) return x;                      // base
    long h = pow(x, n / 2);
    return (n % 2 == 0) ? h * h : h * h * x;
}</code></pre>
<div class="sub">Check every path to the bottom</div>
<p>n = 1 hits the base. n = 3 → 1 ✓. n = 2 → 1 ✓. But <strong>n = 0</strong> → pow(x, 0) → pow(x, 0) → … forever: 0/2 = 0 never reaches 1.</p>
<div class="sub">The fix and the rule</div>
<p>Use <code>if (n == 0) return 1;</code>. Now every n ≥ 0 shrinks toward 0 (n/2 &lt; n for n ≥ 1) and ends there. <strong>Rule: the base case must catch every value the shrinking step can land on, and the step must strictly shrink every non-base input.</strong></p>
</div>`,
      qs: [
        { type: 'mcq', q: `<code>int f(int n) { if (n == 0) return 0; return f(n - 2) + 1; }</code>. Which inputs fail?`, opts: ['All odd n: they skip past 0', 'Only negative values of n', 'All even n: they skip past 1', 'None; it always terminates'], a: 0, why: 'Odd n goes 5, 3, 1, −1, −3, … and never hits 0. The base must catch every landing value (add n ≤ 0 or n == 1).' },
        { type: 'mcq', q: `A tree recursion's base case is <code>if (t.left == null &amp;&amp; t.right == null) return t.val;</code>. What input crashes it?`, opts: ['A node with exactly one child', 'A perfectly balanced tree', 'A single-node tree', 'A tree of negative values'], a: 0, why: 'For a node with only a right child, the function recurses on the null left child and dereferences null. The base must also handle t == null.' },
        { type: 'free', q: `Explain why <code>if (n == 1) return x;</code> fails for pow(x, 0) using the "shrinking measure" idea from F07.`, model: `<p>The recursion's measure is n, and each call goes to n/2. For n ≥ 1, n/2 &lt; n, so it shrinks. But for n = 0, n/2 = 0: the measure does not decrease, and 0 is never caught by a base case of n == 1. So pow(x, 0) calls itself with the same argument forever.</p>`, rubric: ['Identifies n as the measure and n → n/2 as the step', 'Notes n/2 = n when n = 0, so no progress', 'The base case (n == 1) does not catch 0, so it recurses forever'] },
        { type: 'num', q: `With the fixed base <code>n == 0 → 1</code>, how many calls does pow(x, 16) make in total (including the first)?`, a: 6, why: 'n = 16, 8, 4, 2, 1, 0: six calls, about log₂ n + 2.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `Prove by induction that a binary tree with n nodes has exactly n − 1 edges (n ≥ 1).`, model: `<p>Induction on n. Base n = 1: a single node, 0 edges. ✓ Step: take a tree with k + 1 ≥ 2 nodes. It has a leaf (a node with no children), which is attached by exactly one edge to its parent. Remove the leaf and that edge: what remains is a tree with k nodes, which by hypothesis has k − 1 edges. Put the leaf back: k − 1 + 1 = k = (k + 1) − 1 edges. ✓ (Direct view: every node except the root has exactly one edge up to its parent.)</p>`, rubric: ['Base case of one node with 0 edges', 'Step reduces to a smaller tree (e.g. remove a leaf and its one edge) and applies the hypothesis', 'Adds back the removed edge to get exactly n − 1'] },
    { type: 'mcq', q: `Fibonacci: <code>fib(n) = fib(n-1) + fib(n-2)</code> with only <code>if (n == 0) return 0;</code>. What happens for fib(1)?`, opts: ['It calls fib(−1) and never stops', 'It correctly returns the value 1', 'It returns 0, a wrong but finite value', 'It throws immediately on entry'], a: 0, why: 'fib(1) → fib(0) + fib(−1), and −1 → −2 → … never hits 0. Two-step recursions need two base cases.' },
    { type: 'mcq', q: `Which statement is the inductive hypothesis when proving a recursive <code>isBalanced(t)</code>?`, opts: ['isBalanced is right for every smaller subtree', 'isBalanced is right for this tree t', 'Every tree has a height of at most log n', 'isBalanced is right for a single node'], a: 0, why: 'Assume it for strictly smaller inputs, never for the input you are proving.' },
    { type: 'free', q: `A DP defines dp[i] = best answer for the prefix of length i, and computes dp[i] from dp[i−1] and dp[i−2]. What exactly must you check to be sure dp[n] is right? Phrase it as an induction.`, model: `<p>Base: dp[0] and dp[1] must be set correctly by direct reasoning. Step: assuming dp[j] is the true best answer for every j &lt; i, the recurrence for dp[i] must consider every possible last decision and combine it correctly with the (correct) smaller answers. Then by strong induction every dp[i], including dp[n], is right. You must also fill in increasing i, so smaller values exist when needed.</p>`, rubric: ['Base cases dp[0], dp[1] verified directly', 'Step: assuming correct dp for smaller indices, the recurrence covers all last choices', 'Mentions fill order: smaller indices computed before larger'] },
    { type: 'mcq', q: `Recursive <code>sum(a, i)</code> returns a[i] + sum(a, i+1), base <code>i == a.length → 0</code>. What's the measure that shrinks?`, opts: ['a.length − i', 'i', 'a[i]', 'the sum so far'], a: 0, why: 'Transfer: i grows, so the shrinking quantity is the remaining length, a.length − i, which hits 0 at the base.' }
  ]
});
