COURSE.topic({
  id: 'P28',
  intro: `"Return the answer modulo 10⁹ + 7" appears in a large fraction of counting problems, and it's not decoration: it's there because the true answer would be astronomically large. Working under a modulus needs three things: knowing where Java overflows, computing powers in O(log n) (the same halving idea as F02), and doing <em>division</em>, which needs modular inverses. With those, nCr mod p becomes routine.`,
  kps: [
    {
      title: 'Why mod 10⁹+7, and where Java overflows',
      teach: `
<div class="ex">
<div class="sub">Why a modulus at all</div>
<p>Counting answers explode: the number of paths in a 20 × 20 grid is C(40,20) ≈ 1.4 × 10¹¹, and most counting problems are far worse. Rather than force BigInteger, problems ask for the remainder, which keeps every intermediate value under 10⁹.</p>
<div class="sub">Why that particular number</div>
<p>10⁹ + 7 is <strong>prime</strong> (so every non-zero value has an inverse, needed for division) and just under 2³⁰, so a product of two residues fits in a <code>long</code>: (10⁹)² = 10¹⁸ &lt; 9.2 × 10¹⁸ = Long.MAX_VALUE.</p>
<div class="sub">Where Java bites</div>
<pre><code>int a = 1_000_000_006, b = 1_000_000_006;
int bad  = a * b % MOD;                 // int overflow BEFORE the mod: garbage
long ok  = (long) a * b % MOD;          // cast one operand first: correct</code></pre>
<p>The rules that survive: <code>(a + b) % m</code>, <code>(a − b + m) % m</code> (Java's % can return negative), <code>((long) a * b) % m</code>.</p>
<div class="sub">What does NOT survive</div>
<p>Division. <code>(a / b) % m</code> is meaningless in modular arithmetic; you need b's inverse (two steps ahead).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In Java, <code>int a = 1000000006, b = 1000000006; int c = a * b % 1000000007;</code> gives…`, opts: ['Garbage: int overflows before the %', 'The correct residue, 1', 'A compile error on the cast', 'Always zero, by coincidence'], a: 0, why: 'The product is ~10¹⁸, far past int. Cast to long first.' },
        { type: 'mcq', q: `Why is a prime modulus convenient?`, opts: ['Every non-zero value has an inverse', 'Primes make addition faster', 'It avoids all overflow', 'It keeps results positive'], a: 0, why: 'Fermat\'s little theorem then gives inverses by exponentiation, so division works.' },
        { type: 'num', q: `Compute (2¹⁰) mod (10⁹ + 7).`, a: 1024, why: 'Small values are unchanged by the modulus.' },
        { type: 'free', q: `Why does <code>(a − b) % m</code> need care in Java, and what is the fix?`, model: `<p>Java's % keeps the sign of the dividend, so if a &lt; b the result is negative, which is not a valid residue in 0..m−1 and breaks later comparisons or array indexing. The fix is <code>((a − b) % m + m) % m</code>: add one modulus to lift it into range, then reduce again in case it was already non-negative.</p>`, rubric: ['Java % can return a negative value when a &lt; b', 'Negative residues break indexing/comparisons', 'Fix: ((a − b) % m + m) % m'] }
      ]
    },
    {
      title: 'Fast exponentiation by repeated squaring',
      teach: `
<p>Computing aⁿ by multiplying n times is O(n): hopeless for n = 10¹⁸. Square instead.</p>
<pre><code>long power(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    while (exp &gt; 0) {
        if ((exp &amp; 1) == 1) result = result * base % mod;   // this bit is set
        base = base * base % mod;                           // square for the next bit
        exp &gt;&gt;= 1;
    }
    return result;
}</code></pre>
<div class="ex">
<div class="sub">Why it works: the binary expansion</div>
<p>a¹³ = a⁸ · a⁴ · a¹, because 13 = 1101₂. The loop walks the bits, squaring the base to move from a^(2ᵏ) to a^(2ᵏ⁺¹) and multiplying into the result whenever a bit is set. That's the F02 halving picture and P22's binary lifting in another costume.</p>
<div class="sub">Cost</div>
<p>O(log n) multiplications: about 60 for n = 10¹⁸.</p>
<div class="sub">Where it shows up</div>
<p>Modular inverses (next step), counting problems with huge exponents, matrix exponentiation (P33), and "k-th power of a graph's adjacency matrix" path counting.</p>
</div>`,
      qs: [
        { type: 'num', q: `How many multiplications does repeated squaring need for an exponent of about 10¹⁸? (log₂ 10¹⁸, nearest whole)`, a: 60, tol: 2, why: 'log₂ 10¹⁸ ≈ 59.8, so about 60 squarings plus up to 60 multiplies.' },
        { type: 'num', q: `Compute 3⁴⁵ mod (10⁹ + 7).`, a: 644897553, why: 'Repeated squaring: 45 = 101101₂.' },
        { type: 'mcq', q: `Which powers does a¹³ decompose into?`, opts: ['a⁸ · a⁴ · a¹', 'a⁶ · a⁵ · a²', 'a¹⁰ · a³', 'a⁷ · a⁶'], a: 0, why: '13 = 1101₂ = 8 + 4 + 1.' },
        { type: 'free', q: `Explain why repeated squaring is the same idea as binary lifting (P22).`, model: `<p>Both precompute or walk through "jumps" of size 2ᵏ and assemble an arbitrary amount from the binary expansion. Binary lifting stores the 2ᵏ-th ancestor and climbs by the set bits of k; repeated squaring holds a^(2ᵏ) in a variable and multiplies it in for each set bit of the exponent. In both cases the step from 2ᵏ to 2ᵏ⁺¹ is "apply the thing to itself" (ancestor of the ancestor, or base × base), so any target is reached in O(log n) steps.</p>`, rubric: ['Both assemble an arbitrary amount from powers of two (binary expansion)', 'Both build the next power by applying the structure to itself', 'Both are O(log n) as a result'] }
      ]
    },
    {
      title: 'Modular inverse and division',
      teach: `
<p>Dividing by b under a modulus means multiplying by b's <strong>inverse</strong>: the value b⁻¹ with b · b⁻¹ ≡ 1 (mod m).</p>
<div class="ex">
<div class="sub">Fermat's little theorem (m prime, b not a multiple of m)</div>
<p>b^(m−1) ≡ 1 (mod m), so b · b^(m−2) ≡ 1: the inverse is <strong>b^(m−2) mod m</strong>, computed with fast exponentiation in O(log m).</p>
<pre><code>long inverse(long b, long mod) { return power(b, mod - 2, mod); }   // mod must be prime
long divide(long a, long b, long mod) { return a % mod * inverse(b, mod) % mod; }</code></pre>
<div class="sub">Worked example</div>
<p>The inverse of 3 mod 10⁹+7 is <strong>333333336</strong>, and 3 × 333333336 = 10⁹ + 8 ≡ 1 ✓. So "divide by 3" becomes "multiply by 333333336".</p>
<div class="sub">When Fermat does not apply</div>
<p>If the modulus is not prime, use the extended Euclidean algorithm; an inverse exists exactly when gcd(b, m) = 1. And nothing can invert a b that is a multiple of m.</p>
<div class="sub">The trap</div>
<p>Reducing a numerator and denominator separately then dividing the residues is <em>wrong</em>: 10/5 = 2, but (10 mod 7) / (5 mod 7) = 3/5 is not 2 in ordinary arithmetic. Only multiplication by an inverse is valid.</p>
</div>`,
      qs: [
        { type: 'num', q: `What is the modular inverse of 3 modulo 10⁹ + 7?`, a: 333333336, why: '3 × 333333336 = 1000000008 ≡ 1 (mod 10⁹+7). It equals (m+1)/3.' },
        { type: 'mcq', q: `With a prime modulus m, the inverse of b is…`, opts: ['b^(m−2) mod m', 'b^(m−1) mod m', 'm − b', '1 / b rounded down'], a: 0, why: 'From Fermat: b^(m−1) ≡ 1, so b^(m−2) is the inverse.' },
        { type: 'mcq', q: `The modulus is 12 (not prime) and you need the inverse of 4. What happens?`, opts: ['No inverse exists: gcd(4, 12) ≠ 1', 'Use Fermat with 12 − 2', 'The inverse is 3, since 12/4', 'Every value has an inverse mod 12'], a: 0, why: 'An inverse exists only when gcd(b, m) = 1. Here 4 shares the factor 4 with 12.' },
        { type: 'free', q: `Why can't you compute (a / b) mod m by reducing a and b separately and dividing? Give a concrete failure.`, model: `<p>Because division is not defined on residues: the residue of a quotient is not the quotient of the residues. Example with m = 7: a = 10, b = 5, a/b = 2, so the answer should be 2. But a mod 7 = 3 and b mod 7 = 5, and 3/5 is not an integer at all, let alone 2. The valid operation is multiplication by the inverse: 10 · 5⁻¹ mod 7 = 3 · 3 = 9 ≡ 2 ✓ (since 5 · 3 = 15 ≡ 1 mod 7).</p>`, rubric: ['Residues do not support division directly', 'Gives a concrete counterexample with numbers', 'Shows the correct route: multiply by the modular inverse'] }
      ]
    },
    {
      title: 'nCr mod p with factorials and inverse factorials',
      teach: `
<p>C(n, r) = n! / (r! (n−r)!) needs division, so precompute factorials <em>and</em> their inverses once.</p>
<pre><code>long[] fact = new long[N], invFact = new long[N];
fact[0] = 1;
for (int i = 1; i &lt; N; i++) fact[i] = fact[i-1] * i % MOD;
invFact[N-1] = power(fact[N-1], MOD - 2, MOD);          // one exponentiation
for (int i = N - 1; i &gt; 0; i--) invFact[i-1] = invFact[i] * i % MOD;   // walk back down

long nCr(int n, int r) {
    if (r &lt; 0 || r &gt; n) return 0;
    return fact[n] * invFact[r] % MOD * invFact[n-r] % MOD;
}</code></pre>
<div class="ex">
<div class="sub">The backwards trick</div>
<p>invFact[i−1] = invFact[i] · i, because 1/(i−1)! = (1/i!) · i. So one O(log m) exponentiation suffices for the whole table instead of N of them: O(N + log m) total.</p>
<div class="sub">Worked examples</div>
<p>C(10, 3) = <strong>120</strong>; C(20, 10) = <strong>184756</strong>; C(30, 15) mod 10⁹+7 = <strong>155117520</strong> (the true value, 155117520, is already below the modulus).</p>
<div class="sub">Where it shows up</div>
<p>Lattice paths in a grid (C(R+C, R)), "count arrangements with k of something", inclusion-exclusion counting, and most CSES Mathematics counting problems.</p>
</div>`,
      qs: [
        { type: 'num', q: `C(10, 3)?`, a: 120, why: '10 · 9 · 8 / 6.' },
        { type: 'num', q: `C(20, 10)?`, a: 184756, why: 'The central binomial coefficient for n = 20.' },
        { type: 'mcq', q: `Why compute the inverse factorial table backwards from invFact[N−1]?`, opts: ['One exponentiation covers the table', 'Forwards direction would overflow', 'Backwards avoids taking any modulus', 'It keeps the table values sorted'], a: 0, why: 'invFact[i−1] = invFact[i] · i, so after one O(log m) inversion the rest is O(N) multiplications.' },
        { type: 'free', q: `A 5 × 8 grid, moving only right or down from corner to corner. How many paths, and why is this a binomial coefficient?`, model: `<p>Every path is a sequence of moves: 4 downs and 7 rights for a 5 × 8 grid of cells (a 5-row, 8-column grid has 4 + 7 = 11 moves). Choosing which of the 11 moves are downs determines the path completely, so the count is C(11, 4) = 330. It's a binomial because the path is exactly a choice of positions for one kind of move among the total (F14).</p>`, rubric: ['A path is a sequence of R−1 downs and C−1 rights', 'Choosing the positions of one move type determines the path', 'Count = C(total moves, downs); computes 330 for 5 × 8'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Compute 2⁶² mod (10⁹ + 7) using repeated squaring... how many loop iterations does the exponent 2⁶² require?`, a: 63, tol: 1, why: '2⁶² has 63 bits, so the loop runs 63 times (only the top bit is set).' },
    { type: 'free', q: `<strong>Transfer.</strong> "Count paths in a 3 × 3 grid from top-left to bottom-right, moving right or down, mod 10⁹+7" can be done with DP or with nCr. Give both and compare.`, model: `<p>DP: dp[i][j] = dp[i−1][j] + dp[i][j−1] mod M, filled row by row: O(RC) time and O(C) space, and it extends to blocked cells. Formula: the path is 2 downs and 2 rights, so C(4, 2) = 6 paths, computed with factorials and inverse factorials in O(R + C) after precomputation, but only valid when the grid is unobstructed. Both give 6 here; DP is more general, the formula is faster and needed when R + C is huge.</p>`, rubric: ['DP recurrence with mod, O(RC)', 'Binomial C(R+C−2, R−1) = 6 via factorials + inverse factorials', 'Trade-off: DP handles obstacles; the formula scales to huge grids'] },
    { type: 'mcq', q: `<code>result = result * base % mod</code> with all values declared <code>int</code> and mod ≈ 10⁹. Correct?`, opts: ['No: the product overflows int', 'Yes: the mod keeps it small', 'Yes, if result stays under mod', 'Only for even values of mod'], a: 0, why: 'The multiplication happens before the %, and two ~10⁹ ints overflow. Use long.' },
    { type: 'num', q: `Inverse of 2 modulo 10⁹ + 7? (it equals (m + 1) / 2)`, a: 500000004, why: '2 × 500000004 = 10⁹ + 8 ≡ 1.' },
    { type: 'free', q: `Explain to a junior why "answer mod 10⁹+7" does not mean "compute the answer, then take the remainder".`, model: `<p>The true answer may have thousands of digits, so it cannot be computed first in a fixed-width type. Instead you keep every intermediate value reduced: addition and multiplication are compatible with the modulus ((a·b) mod m = ((a mod m)·(b mod m)) mod m), so reducing as you go gives the same final residue. The one operation that does not carry over is division, which must be replaced by multiplication with a modular inverse.</p>`, rubric: ['The true value is too large to compute in fixed-width types', 'Add/multiply commute with taking the remainder, so reduce at every step', 'Division is the exception: use modular inverses'] }
  ],
  practice: [
    { name: 'Fast power and modular inverse', lc: 'CSES Exponentiation', prompt: `<p>Compute a^b mod 10⁹+7 for b up to 10¹⁸, and the inverse of a value.</p>`, hint: `<p>Walk the bits of the exponent; the inverse is a^(m−2).</p>`,
      solution: `<pre><code>public static final long MOD = 1_000_000_007L;
public static long power(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    if (base &lt; 0) base += mod;
    while (exp &gt; 0) {
        if ((exp &amp; 1) == 1) result = result * base % mod;
        base = base * base % mod;
        exp &gt;&gt;= 1;
    }
    return result;
}
public static long inverse(long b) { return power(b, MOD - 2, MOD); }</code></pre><p class="cx">O(log exp) multiplications, all in long.</p>` },
    { name: 'nCr mod p with precomputed factorials', lc: 'CSES Binomial Coefficients', prompt: `<p>Answer many C(n, r) mod 10⁹+7 queries with n up to 10⁶.</p>`, hint: `<p>One exponentiation for the largest inverse factorial, then walk downwards.</p>`,
      solution: `<pre><code>class Binomials {
    private static final long MOD = 1_000_000_007L;
    private final long[] fact, invFact;
    public Binomials(int maxN) {
        fact = new long[maxN + 1];
        invFact = new long[maxN + 1];
        fact[0] = 1;
        for (int i = 1; i &lt;= maxN; i++) fact[i] = fact[i - 1] * i % MOD;
        invFact[maxN] = power(fact[maxN], MOD - 2);
        for (int i = maxN; i &gt; 0; i--) invFact[i - 1] = invFact[i] * i % MOD;
    }
    private static long power(long b, long e) {
        long r = 1; b %= MOD;
        while (e &gt; 0) { if ((e &amp; 1) == 1) r = r * b % MOD; b = b * b % MOD; e &gt;&gt;= 1; }
        return r;
    }
    public long nCr(int n, int r) {
        if (r &lt; 0 || r &gt; n) return 0;
        return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
    }
}</code></pre><p class="cx">O(maxN + log MOD) preprocessing, O(1) per query.</p>` },
    { name: 'Unique Paths (mod)', lc: 'LeetCode 62 · CSES Grid Paths', prompt: `<p>Paths across an m × n grid moving right/down, modulo 10⁹+7.</p>`, hint: `<p>Either DP or C(m+n−2, m−1).</p>`,
      solution: `<pre><code>public int uniquePaths(int m, int n) {
    final long MOD = 1_000_000_007L;
    long[] row = new long[n];
    Arrays.fill(row, 1);
    for (int i = 1; i &lt; m; i++)
        for (int j = 1; j &lt; n; j++)
            row[j] = (row[j] + row[j - 1]) % MOD;     // one row of the DP table
    return (int) row[n - 1];
}</code></pre><p class="cx">O(mn) time, O(n) space. The closed form C(m+n−2, m−1) is O(m+n) with factorials.</p>` }
  ]
});
