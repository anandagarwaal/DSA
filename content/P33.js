COURSE.topic({
  id: 'P33',
  intro: `A DP over n states is O(n), which is useless when n = 10¹⁸. If the recurrence is <strong>linear</strong> (each new value is a fixed combination of the previous few), one matrix multiplication advances it one step, so <em>squaring</em> that matrix doubles the number of steps: the whole computation collapses to O(k³ log n) for a k-state recurrence. It's P28's repeated squaring applied to matrices.`,
  kps: [
    {
      title: 'A linear recurrence as a matrix times a state vector',
      teach: `
<p>Fibonacci: F(n) = F(n−1) + F(n−2). Put the last two values in a vector and find the matrix that advances it.</p>
<div class="ex">
<div class="sub">The setup</div>
<pre><code>| F(n)   |   | 1  1 |   | F(n-1) |
|        | = |      | × |        |
| F(n-1) |   | 1  0 |   | F(n-2) |</code></pre>
<p>Row 1 says F(n) = 1·F(n−1) + 1·F(n−2) ✓. Row 2 says F(n−1) = 1·F(n−1) + 0·F(n−2), which just shifts the window down ✓.</p>
<div class="sub">So</div>
<p>Applying the matrix once advances one step, so applying it n times gives Mⁿ, and F(n) is read out of Mⁿ times the initial vector. Fib(10) = <strong>55</strong>, Fib(50) = <strong>12586269025</strong> (already past int), Fib(90) ≈ 2.88 × 10¹⁸, near the limit of long.</p>
<div class="sub">The general shape</div>
<p>For f(n) = c₁f(n−1) + … + c_k f(n−k), the matrix is k × k: the first row holds the coefficients, and the rest is an identity block shifted down one, which carries the older values along.</p>
<div class="sub">The requirement</div>
<p><strong>Linear</strong> with <strong>constant</strong> coefficients. f(n) = f(n−1)² or f(n) = f(n−1) + n (unless you extend the state) do not fit directly.</p>
</div>`,
      qs: [
        { type: 'num', q: `Fibonacci with F(0) = 0, F(1) = 1. What is F(10)?`, a: 55, why: '0,1,1,2,3,5,8,13,21,34,55.' },
        { type: 'mcq', q: `Why does the Fibonacci matrix have the row [1, 0] underneath [1, 1]?`, opts: ['It shifts the window down by one', 'It keeps the matrix invertible', 'It makes the matrix symmetric', 'It stores the base case values'], a: 0, why: 'The state vector holds the last two values, so the lower row must carry F(n−1) down into the next vector.' },
        { type: 'num', q: `A recurrence f(n) = 2f(n−1) + 3f(n−2) − f(n−3). What size is its matrix?`, a: 3, why: 'One dimension per remembered value: a 3 × 3 matrix.' },
        { type: 'free', q: `Why can't f(n) = f(n−1) + n be handled by the plain 1 × 1 matrix [1], and how would you fix it?`, model: `<p>The added term depends on n, so the transition is not constant: a fixed matrix cannot produce a value that changes each step. The fix is to extend the state so that n itself is carried: use the vector (f(n), n, 1) and a 3 × 3 matrix whose rows give f(n) = f(n−1) + n, n = (n−1) + 1, and 1 = 1. Once the extra quantities are inside the state, the transition becomes constant again.</p>`, rubric: ['The n term makes the transition non-constant', 'Extend the state to include n (and a constant 1)', 'Then the matrix is fixed and the method applies'] }
      ]
    },
    {
      title: 'Fast power on matrices',
      teach: `
<pre><code>long[][] multiply(long[][] A, long[][] B, long mod) {
    int k = A.length;
    long[][] C = new long[k][k];
    for (int i = 0; i &lt; k; i++)
        for (int t = 0; t &lt; k; t++) {
            if (A[i][t] == 0) continue;
            for (int j = 0; j &lt; k; j++)
                C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % mod;
        }
    return C;
}
long[][] matrixPower(long[][] M, long n, long mod) {
    int k = M.length;
    long[][] result = identity(k);
    while (n &gt; 0) {
        if ((n &amp; 1) == 1) result = multiply(result, M, mod);
        M = multiply(M, M, mod);
        n &gt;&gt;= 1;
    }
    return result;
}</code></pre>
<div class="ex">
<div class="sub">Why it works</div>
<p>Matrix multiplication is <strong>associative</strong>, so M⁸ = ((M²)²)² and the binary expansion of n applies exactly as in P28. Order matters (matrices don't commute), but the loop keeps the multiplications in a consistent order.</p>
<div class="sub">Cost</div>
<p>Each multiply is O(k³); there are O(log n) of them: <strong>O(k³ log n)</strong>. For Fibonacci (k = 2) and n = 10¹⁸, that's about 8 × 60 = 500 operations.</p>
<div class="sub">The modulus</div>
<p>Values explode, so reduce inside the multiply (P28). Use <code>long</code> and reduce after each product, or sums of k products can overflow.</p>
</div>`,
      qs: [
        { type: 'num', q: `k = 2 matrix, n = 10¹⁸. Roughly how many scalar multiplications? (k³ × log₂ n)`, a: 480, tol: 100, why: '8 per matrix multiply × about 60 multiplies ≈ 500.' },
        { type: 'mcq', q: `Which property of matrix multiplication makes repeated squaring valid?`, opts: ['Associativity', 'Commutativity', 'Invertibility', 'Symmetry'], a: 0, why: 'M⁸ = ((M²)²)² needs only associativity; matrices do not commute in general.' },
        { type: 'num', q: `F(50) with F(0) = 0, F(1) = 1?`, a: 12586269025, why: 'Past int (2.1 × 10⁹), which is why long or a modulus is needed.' },
        { type: 'free', q: `Why must the modulus be applied inside the multiply rather than at the end?`, model: `<p>Without reduction the entries grow like the true values, which for exponents near 10¹⁸ have astronomically many digits and overflow long almost immediately, giving garbage rather than a large-but-correct number. Reducing after each product keeps every entry below the modulus; and since (a·b) mod m is compatible with taking the remainder at each step (P28), the final result is identical to reducing the exact value. Care is still needed: a sum of k products of two ~10⁹ values must be accumulated in long with a reduction, or it too can overflow.</p>`, rubric: ['Entries would overflow long long before the end', 'Modular arithmetic commutes with multiply/add, so reducing early is exact', 'Accumulate in long and reduce to avoid overflow in the inner sum'] }
      ]
    },
    {
      title: 'Counting paths of length k in a graph',
      teach: `
<p>The second classic use, and the one that makes the method feel less like a trick.</p>
<div class="ex">
<div class="sub">The fact</div>
<p>If A is the adjacency matrix, then <strong>(Aᵏ)[i][j] is the number of walks of exactly k edges from i to j</strong>.</p>
<div class="sub">Why</div>
<p>By induction: (A¹)[i][j] counts single edges. A walk of k+1 edges from i to j is a walk of k edges from i to some neighbour t, then the edge t → j, and summing over t is exactly the matrix product (Aᵏ · A)[i][j]. The definition of matrix multiplication <em>is</em> "sum over the intermediate vertex".</p>
<div class="sub">Worked example</div>
<p>Triangle graph on {0,1,2} (every pair connected). Walks of length 2 from 0 back to 0: <strong>2</strong> (via 1 or via 2). Walks of length 3 from 0 to 0: also <strong>2</strong> (0→1→2→0 and 0→2→1→0).</p>
<div class="sub">Why this matters</div>
<p>It turns "count paths of length 10⁹" into O(V³ log k), which no DP over steps could do. CSES "Graph Paths I/II" are exactly this.</p>
</div>`,
      qs: [
        { type: 'num', q: `Triangle graph (0–1, 1–2, 0–2, undirected). How many walks of length 2 go from 0 back to 0?`, a: 2, why: '0→1→0 and 0→2→0.' },
        { type: 'num', q: `Same graph. Walks of length 3 from 0 to 0?`, a: 2, why: '0→1→2→0 and 0→2→1→0.' },
        { type: 'mcq', q: `(A³)[i][j] counts…`, opts: ['Walks of exactly 3 edges from i to j', 'Shortest paths of length ≤ 3', 'Simple paths with 3 distinct nodes', 'Triangles containing both i and j'], a: 0, why: 'Walks may repeat vertices and edges; "simple path" counting is a much harder problem.' },
        { type: 'free', q: `Explain why matrix multiplication counts walks, linking it to the "sum over the intermediate vertex" idea.`, model: `<p>(A·B)[i][j] = Σ_t A[i][t]·B[t][j], i.e. sum over every possible intermediate vertex t of (ways to get from i to t) × (ways from t to j). That is exactly how walks compose: a walk of a+b edges splits uniquely at the vertex reached after a edges. So if Aᵃ counts a-edge walks and Aᵇ counts b-edge walks, their product counts (a+b)-edge walks. Induction from A¹ = A gives the result for every k.</p>`, rubric: ['States (A·B)[i][j] = Σ over intermediate t', 'Walks split uniquely at the intermediate vertex', 'Induction from A¹ gives Aᵏ counting k-edge walks'] }
      ]
    },
    {
      title: 'When it pays, and when it does not',
      teach: `
<div class="ex">
<div class="sub">The signal</div>
<p><strong>Huge n</strong> (10⁹–10¹⁸) with a <strong>small state</strong> (k ≤ about 100, since k³ is the cost per multiply), and a transition that is linear with constant coefficients. "Count the sequences of length 10¹⁸ avoiding some pattern, mod 10⁹+7" is the archetype.</p>
<div class="sub">The cost comparison</div>
<table><tr><th>method</th><th>cost at n = 10¹⁸, k = 2</th></tr>
<tr><td>iterate the recurrence</td><td>10¹⁸ steps: impossible</td></tr>
<tr><td>matrix power</td><td>≈ 500 operations</td></tr></table>
<div class="sub">When it does not pay</div>
<p>n small (just iterate: simpler and faster), k large (k³ dominates: a 200-state recurrence costs 8 × 10⁶ per multiply × 60 = 5 × 10⁸), or the recurrence is not linear (f(n) = f(n−1)² , or coefficients that vary with n in a way you cannot fold into the state).</p>
<div class="sub">Interview reality</div>
<p>Rare at Google/Meta, common in CP. Worth recognising the shape and being able to say "this is a linear recurrence with a tiny state and an astronomically large n, so matrix exponentiation gives O(k³ log n)", even if you don't write all of it.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Which problem is the natural fit for matrix exponentiation?`, opts: ['Count length-10¹⁸ strings with no "aa", mod p', 'Sort 10⁶ integers efficiently', 'Shortest path in a weighted graph', 'Longest common subsequence of two strings'], a: 0, why: 'A linear recurrence (a small state machine over the last character) with an astronomically large n.' },
        { type: 'mcq', q: `n = 1000 with a 2 × 2 recurrence. Best approach?`, opts: ['Just iterate: 1000 steps', 'Matrix exponentiation', 'Memoised recursion', 'Closed-form with floating point'], a: 0, why: 'Matrix power is for huge n; here iteration is simpler, exact and fast. (Floating-point closed forms lose precision.)' },
        { type: 'num', q: `A 100-state linear recurrence with n = 10¹⁸. Operations, as a power of ten (give the exponent)?`, a: 8, tol: 1, why: 'k³ log n = 10⁶ × 60 = 6 × 10⁷, so about 10⁸: borderline but possible.' },
        { type: 'free', q: `"Count binary strings of length n with no two consecutive 1s" has answer F(n+2). Show it is a linear recurrence and say how you would compute it for n = 10¹⁸.`, model: `<p>Let a(n) = strings of length n ending in 0 and b(n) = ending in 1. A 0 may follow anything: a(n) = a(n−1) + b(n−1). A 1 may follow only a 0: b(n) = a(n−1). So the total t(n) = a(n) + b(n) satisfies t(n) = t(n−1) + t(n−2), a Fibonacci recurrence with constant coefficients and a 2-state vector. For n = 10¹⁸, raise the 2 × 2 matrix [[1,1],[1,0]] to the power n modulo 10⁹+7 in O(log n): about 60 matrix multiplies.</p>`, rubric: ['Splits the state by last character and derives the two equations', 'Combines to t(n) = t(n−1) + t(n−2): linear, constant coefficients', 'Matrix power of the 2 × 2 transition mod p, O(log n)'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `F(90) is about 2.88 × 10¹⁸. What is the largest Fibonacci index that still fits in a signed 64-bit long (max ≈ 9.22 × 10¹⁸)?`, a: 92, why: 'F(92) ≈ 7.5 × 10¹⁸ fits; F(93) ≈ 1.2 × 10¹⁹ does not.' },
    { type: 'free', q: `<strong>Transfer.</strong> "A frog jumps 1, 2 or 3 steps; count the ways to climb n = 10¹⁸ stairs, mod 10⁹+7." Give the matrix and the complexity.`, model: `<p>f(n) = f(n−1) + f(n−2) + f(n−3), with f(0) = 1, f(1) = 1, f(2) = 2. State vector (f(n), f(n−1), f(n−2)) and transition matrix [[1,1,1],[1,0,0],[0,1,0]]: the first row applies the recurrence, the other two shift the window. Raise it to the power n−2 modulo 10⁹+7 by repeated squaring: 27 scalar multiplies per matrix multiply × about 60 multiplies ≈ 1600 operations, O(k³ log n).</p>`, rubric: ['States the 3-term recurrence and the base cases', 'Gives the 3 × 3 matrix: coefficients in row 1, shift rows below', 'O(k³ log n) with the modulus applied inside'] },
    { type: 'mcq', q: `Why compute Fibonacci by matrix power rather than the closed-form golden-ratio formula?`, opts: ['Floating point loses precision for large n', 'The closed form is asymptotically slower', 'The closed form only works for even n', 'Matrices use less memory than doubles'], a: 0, why: 'Binet\'s formula needs exact irrational arithmetic; doubles drift well before n = 100, and it cannot be taken mod p directly.' },
    { type: 'num', q: `Adjacency matrix of a triangle graph. How many walks of length 1 from 0 to 1?`, a: 1, why: 'The single edge 0–1: (A¹)[0][1] = 1.' },
    { type: 'free', q: `Explain the connection between matrix exponentiation (P33), binary lifting (P22) and fast power (P28) in one paragraph.`, model: `<p>All three answer "apply this operation n times" in O(log n) by precomputing or accumulating applications of size 2ᵏ and assembling n from its binary expansion. Fast power composes multiplication of numbers; binary lifting composes the parent function on a tree (the 2ᵏ-th ancestor); matrix exponentiation composes a linear transition. The requirement in each case is associativity, so that doubling means "apply the thing to itself", and the pattern generalises to any associative operation you can repeat.</p>`, rubric: ['All assemble n from powers of two (binary expansion), O(log n)', 'Each composes a different associative operation (numbers, ancestors, matrices)', 'Associativity is the shared requirement that makes doubling valid'] }
  ],
  practice: [
    { name: 'Fibonacci mod p for huge n', lc: 'CSES Fibonacci Numbers', prompt: `<p>F(n) mod 10⁹+7 for n up to 10¹⁸.</p>`, hint: `<p>Raise [[1,1],[1,0]] to the power n.</p>`,
      solution: `<pre><code>public static final long MOD = 1_000_000_007L;

public long fib(long n) {
    if (n == 0) return 0;
    long[][] result = matrixPower(new long[][]{{1, 1}, {1, 0}}, n - 1);
    return result[0][0];                     // M^(n-1) [0][0] = F(n)
}
private long[][] matrixPower(long[][] M, long n) {
    int k = M.length;
    long[][] result = new long[k][k];
    for (int i = 0; i &lt; k; i++) result[i][i] = 1;    // identity
    while (n &gt; 0) {
        if ((n &amp; 1) == 1) result = multiply(result, M);
        M = multiply(M, M);
        n &gt;&gt;= 1;
    }
    return result;
}
private long[][] multiply(long[][] A, long[][] B) {
    int k = A.length;
    long[][] C = new long[k][k];
    for (int i = 0; i &lt; k; i++)
        for (int t = 0; t &lt; k; t++) {
            if (A[i][t] == 0) continue;
            for (int j = 0; j &lt; k; j++)
                C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % MOD;
        }
    return C;
}</code></pre><p class="cx">O(k³ log n) = about 500 operations for n = 10¹⁸.</p>` },
    { name: 'Count walks of length k', lc: 'CSES Graph Paths I', prompt: `<p>Number of walks of exactly k edges from node 0 to node n−1, mod 10⁹+7.</p>`, hint: `<p>The k-th power of the adjacency matrix.</p>`,
      solution: `<pre><code>public long countWalks(int[][] adjacency, int from, int to, long k) {
    long[][] A = new long[adjacency.length][adjacency.length];
    for (int i = 0; i &lt; adjacency.length; i++)
        for (int j = 0; j &lt; adjacency.length; j++)
            A[i][j] = adjacency[i][j];
    long[][] Ak = matrixPower(A, k);
    return Ak[from][to];
}
private long[][] matrixPower(long[][] M, long n) {
    int k = M.length;
    long[][] result = new long[k][k];
    for (int i = 0; i &lt; k; i++) result[i][i] = 1;
    while (n &gt; 0) {
        if ((n &amp; 1) == 1) result = multiply(result, M);
        M = multiply(M, M);
        n &gt;&gt;= 1;
    }
    return result;
}
private long[][] multiply(long[][] A, long[][] B) {
    int k = A.length;
    long[][] C = new long[k][k];
    for (int i = 0; i &lt; k; i++)
        for (int t = 0; t &lt; k; t++) {
            if (A[i][t] == 0) continue;
            for (int j = 0; j &lt; k; j++)
                C[i][j] = (C[i][j] + A[i][t] * B[t][j]) % 1_000_000_007L;
        }
    return C;
}</code></pre><p class="cx">O(V³ log k): handles k up to 10¹⁸ for small V.</p>` }
  ]
});
