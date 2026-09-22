COURSE.topic({
  id: 'P29',
  intro: `Primes, divisors and gcd turn up constantly: "count pairs with gcd 1", "how many divisors", "is this number prime", "simplify the fraction". The whole topic rests on one geometric fact, <strong>divisors come in pairs multiplying to n</strong>, which gives the √n bound, and on the sieve, which trades memory for the ability to answer prime questions in O(1) afterwards.`,
  kps: [
    {
      title: 'Trial division to √n, and why that bound is enough',
      teach: `
<p>To test whether n is prime, or to list its divisors, you never need to look past √n.</p>
<div class="ex">
<div class="sub">The pairing argument</div>
<p>Every divisor d of n has a partner n/d, and d · (n/d) = n. If both were greater than √n their product would exceed n, so <strong>at least one of every pair is ≤ √n</strong>. Scanning up to √n therefore finds every pair; the partners come for free.</p>
<pre><code>boolean isPrime(long n) {
    if (n &lt; 2) return false;
    for (long d = 2; d * d &lt;= n; d++)        // d * d &lt;= n, not d &lt;= Math.sqrt(n)
        if (n % d == 0) return false;
    return true;
}
List&lt;Long&gt; divisors(long n) {
    List&lt;Long&gt; res = new ArrayList&lt;&gt;();
    for (long d = 1; d * d &lt;= n; d++)
        if (n % d == 0) { res.add(d); if (d != n / d) res.add(n / d); }
    return res;                                // unsorted, but complete
}</code></pre>
<div class="sub">Why <code>d * d &lt;= n</code></div>
<p>It avoids floating-point <code>Math.sqrt</code> rounding at the boundary (a perfect square can be missed). Watch overflow: for n near 10¹⁸ use <code>d &lt;= n / d</code> instead.</p>
<div class="sub">Cost</div>
<p>O(√n) per number: 10⁶ steps for n = 10¹². Fine for one number, far too slow for "test every number up to 10⁶", which is what the sieve is for.</p>
</div>`,
      qs: [
        { type: 'num', q: `How many divisors does 36 have?`, a: 9, why: '1, 2, 3, 4, 6, 9, 12, 18, 36. The square root 6 pairs with itself, which is why an odd count means a perfect square.' },
        { type: 'mcq', q: `Why is it enough to check divisors up to √n?`, opts: ['Divisors pair up to n; one is ≤ √n', 'Numbers above √n are always prime', 'Because n has at most √n divisors', 'It only works for odd values of n'], a: 0, why: 'If both members of a pair exceeded √n their product would exceed n.' },
        { type: 'num', q: `Up to what value must trial division go to test n = 10¹²?`, a: 1000000, why: '√10¹² = 10⁶ iterations.' },
        { type: 'free', q: `Why does an odd number of divisors mean n is a perfect square?`, model: `<p>Divisors pair as (d, n/d), and the two members are distinct unless d = n/d, i.e. d² = n. So all divisors come in distinct pairs except when n is a perfect square, where the square root pairs with itself and is counted once. Hence the total count is even for non-squares and odd exactly for perfect squares (e.g. 36 has 9 divisors, with 6 unpaired).</p>`, rubric: ['Divisors pair as (d, n/d)', 'The only self-pair is d = √n, when n is a perfect square', 'So the count is odd exactly for perfect squares'] }
      ]
    },
    {
      title: 'The sieve of Eratosthenes',
      teach: `
<p>To know <em>every</em> prime up to N, cross out multiples instead of testing numbers one by one.</p>
<pre><code>boolean[] composite = new boolean[N + 1];
for (int i = 2; (long) i * i &lt;= N; i++)
    if (!composite[i])
        for (int j = i * i; j &lt;= N; j += i)     // start at i*i, not 2i
            composite[j] = true;</code></pre>
<div class="ex">
<div class="sub">Why start at i·i</div>
<p>Every smaller multiple of i (2i, 3i, …, (i−1)i) has a factor below i and was already crossed out by that smaller prime.</p>
<div class="sub">The cost: n log log n</div>
<p>The inner loop runs N/i times for each prime i, so the total is N · Σ(1/p) over primes p ≤ N, and that sum grows like log log N: about 3 for N = 10⁶. So the sieve is <em>almost</em> linear, and vastly faster than N separate √N tests (10⁶ × 10³ = 10⁹).</p>
<div class="sub">Worked numbers</div>
<p>25 primes below 100; <strong>78,498</strong> primes below 10⁶. Memory: a boolean[10⁶] is 1 MB, a boolean[10⁸] is 100 MB (use a bitset).</p>
</div>`,
      qs: [
        { type: 'num', q: `How many primes are there up to 100?`, a: 25, why: '2, 3, 5, …, 97.' },
        { type: 'mcq', q: `Why does the inner loop start at i·i rather than 2i?`, opts: ['Smaller multiples already have a factor', 'To avoid integer overflow at 2i', 'Because i·i is always a prime', 'To keep the loop count an even one'], a: 0, why: 'They were already crossed out when that smaller prime was processed.' },
        { type: 'mcq', q: `Sieve cost up to N?`, opts: ['O(N log log N)', 'O(N √N)', 'O(N log N)', 'O(N²)'], a: 0, why: 'Σ N/p over primes p ≤ N, and Σ 1/p ≈ log log N.' },
        { type: 'free', q: `Compare sieving up to 10⁶ with running an O(√n) primality test on every number up to 10⁶.`, model: `<p>Per-number testing: each of 10⁶ numbers costs up to √10⁶ = 10³ steps, so about 10⁹ operations: several seconds at best. The sieve crosses out each composite once per distinct prime factor, totalling N log log N ≈ 3 × 10⁶ operations, and leaves a lookup table so later primality questions are O(1). The trade is 1 MB of memory. Testing individual numbers is better only when you need one or two answers, or when n is far larger than any sieve you could store.</p>`, rubric: ['Per-number testing ≈ 10⁹ operations', 'Sieve ≈ N log log N ≈ 3 × 10⁶, plus O(1) lookups afterwards', 'Trade-off: memory; single huge n still needs trial division'] }
      ]
    },
    {
      title: 'Smallest prime factor: factorise in O(log n)',
      teach: `
<p>A small change to the sieve records <em>which</em> prime crossed each number out, which makes repeated factorisation nearly free.</p>
<pre><code>int[] spf = new int[N + 1];                   // smallest prime factor
for (int i = 2; i &lt;= N; i++) {
    if (spf[i] == 0)                           // i is prime
        for (int j = i; j &lt;= N; j += i)
            if (spf[j] == 0) spf[j] = i;       // first prime to reach j is its smallest
}
List&lt;Integer&gt; factorise(int n) {
    List&lt;Integer&gt; f = new ArrayList&lt;&gt;();
    while (n &gt; 1) { f.add(spf[n]); n /= spf[n]; }
    return f;
}</code></pre>
<div class="ex">
<div class="sub">Why factorisation is O(log n)</div>
<p>Each division removes a factor of at least 2, so the value at least halves every step: at most log₂ n steps (F02).</p>
<div class="sub">What it unlocks</div>
<p>Divisor counts and sums from the exponents: if n = p₁^a₁ · p₂^a₂ …, the number of divisors is (a₁+1)(a₂+1)… and their sum is Π (p^(a+1) − 1)/(p − 1). For 36 = 2²·3²: (2+1)(2+1) = <strong>9</strong> divisors summing to <strong>91</strong>.</p>
<div class="sub">The interview version</div>
<p>"Count numbers up to n divisible by 2, 3 or 5" is inclusion-exclusion over prime multiples; "ugly numbers" and "factor into prime powers" both lean on this table.</p>
</div>`,
      qs: [
        { type: 'num', q: `36 = 2² · 3². How many divisors does the exponent formula give?`, a: 9, why: '(2+1)(2+1) = 9.' },
        { type: 'num', q: `Sum of all divisors of 36?`, a: 91, why: '(2³−1)/(2−1) × (3³−1)/(3−1) = 7 × 13 = 91.' },
        { type: 'mcq', q: `Why is factorisation with an spf table O(log n)?`, opts: ['Each division at least halves n', 'The table is sorted by value', 'There are at most log n primes', 'Because spf[n] ≥ √n'], a: 0, why: 'The smallest factor is at least 2, so each step at least halves the remaining value.' },
        { type: 'free', q: `Why does the number of divisors equal Π(aᵢ + 1) over the prime exponents?`, model: `<p>Every divisor is formed by choosing, independently for each prime pᵢ, an exponent from 0 up to aᵢ, giving aᵢ + 1 choices. Distinct choices give distinct divisors by uniqueness of prime factorisation, and every divisor arises this way. Multiplying the independent choice counts (F14) gives Π(aᵢ + 1).</p>`, rubric: ['A divisor = an independent exponent choice per prime, 0..aᵢ', 'Distinct choices give distinct divisors (unique factorisation)', 'Multiply the counts: Π(aᵢ + 1)'] }
      ]
    },
    {
      title: 'gcd by Euclid, and lcm without overflow',
      teach: `
<pre><code>long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
long lcm(long a, long b) { return a / gcd(a, b) * b; }        // divide FIRST</code></pre>
<div class="ex">
<div class="sub">Why Euclid works</div>
<p>Any common divisor of a and b also divides a − b, and hence a mod b; conversely a common divisor of b and a mod b divides a. So gcd(a, b) = gcd(b, a mod b), and the second argument strictly shrinks, so it terminates (that's the F07 exercise).</p>
<div class="sub">Cost</div>
<p>O(log min(a, b)): consecutive remainders shrink at least as fast as Fibonacci numbers grow, so even the worst case is logarithmic.</p>
<div class="sub">The lcm overflow trap</div>
<p><code>a * b / gcd</code> can overflow before the division. <code>a / gcd * b</code> cannot, because a/gcd is exact and the result is the lcm, which fits whenever the answer does.</p>
<div class="sub">Worked examples</div>
<p>gcd(48, 18) = <strong>6</strong>, lcm = 48/6 × 18 = <strong>144</strong>. Coprime means gcd = 1; reducing a fraction means dividing both parts by their gcd.</p>
</div>`,
      qs: [
        { type: 'num', q: `gcd(48, 18)?`, a: 6, why: '48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0.' },
        { type: 'num', q: `lcm(48, 18)?`, a: 144, why: '48 / 6 × 18 = 144.' },
        { type: 'mcq', q: `Why write lcm as <code>a / gcd(a,b) * b</code> rather than <code>a * b / gcd(a,b)</code>?`, opts: ['a * b can overflow before dividing', 'Division is faster than multiplication', 'The gcd may be zero', 'Java evaluates right to left'], a: 0, why: 'a/gcd is exact, so reordering avoids an intermediate that may exceed long.' },
        { type: 'free', q: `Prove that gcd(a, b) = gcd(b, a mod b).`, model: `<p>Write a = qb + r with r = a mod b. Any d dividing both a and b divides a − qb = r, so d is a common divisor of b and r. Conversely any d dividing b and r divides qb + r = a, so it is a common divisor of a and b. The two pairs therefore have exactly the same set of common divisors, hence the same greatest one. Since r &lt; b, the arguments strictly shrink and the recursion terminates (F07).</p>`, rubric: ['Writes a = qb + r and shows a common divisor of (a,b) divides r', 'Shows the converse, so the common-divisor sets are equal', 'Notes r &lt; b gives termination'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `How many primes are there below 10⁶? (nearest thousand)`, a: 78000, tol: 1500, why: '78,498. Roughly N / ln N ≈ 72,000, the prime-number-theorem estimate.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Count pairs (i, j) with gcd(a[i], a[j]) = 1", values up to 10⁵. Sketch an approach better than checking all pairs.`, model: `<p>All pairs is O(n² log V). Instead count by divisor: let cnt[d] = how many values are divisible by d, computed by tallying value frequencies and summing over multiples of d, O(V log V). The number of pairs with gcd divisible by d is C(cnt[d], 2). Then use Möbius/inclusion-exclusion from large d downwards: pairsWithGcdExactly[d] = C(cnt[d],2) − Σ pairsWithGcdExactly[kd] for k ≥ 2. The answer is the entry for d = 1. Total O(V log V).</p>`, rubric: ['Notes all-pairs is O(n²) and too slow', 'Counts values divisible by each d via multiples: O(V log V)', 'Inclusion-exclusion downward from large d to get exactly-1'] },
    { type: 'num', q: `Is 97 prime? Answer with the number of trial divisions needed (d from 2 while d·d ≤ 97).`, a: 8, why: 'd = 2..9, since 10² = 100 &gt; 97. None divides 97, so it is prime.' },
    { type: 'mcq', q: `You need primality tests for 100 different numbers, each up to 10¹². Approach?`, opts: ['Trial division per number: 100 × 10⁶ steps', 'Sieve up to 10¹²: 10¹² booleans', 'Sieve up to 10⁶, then test each number', 'Check divisibility by 2, 3, 5 only'], a: 0, why: '√10¹² = 10⁶ per number, so 10⁸ steps overall: acceptable. Sieving to 10¹² is impossible memory, and for 10⁵+ numbers you would move to Miller–Rabin.' },
    { type: 'free', q: `Explain why the sieve is nearly linear while "test each number by trial division" is not, using where the work goes.`, model: `<p>Trial division repeats work: every number is tested against many candidate divisors that already failed for its neighbours, costing √n each and ignoring everything learned before. The sieve instead does work <em>per composite per distinct prime factor</em>: prime p crosses out N/p numbers, and summing N/p over primes gives N·Σ(1/p) ≈ N log log N, because the reciprocals of primes add up very slowly. Every crossing-out is useful and never repeated for the same (prime, multiple) pair.</p>`, rubric: ['Trial division repeats independent work per number: √n each', 'Sieve does N/p work per prime, summing to N·Σ(1/p)', 'Σ 1/p over primes grows like log log N, so nearly linear'] }
  ],
  practice: [
    { name: 'Count Primes', lc: 'LeetCode 204 · CSES Counting Coprime Pairs (setup)', prompt: `<p>Count primes strictly below n.</p>`, hint: `<p>Sieve; start the inner loop at i·i.</p>`,
      solution: `<pre><code>public int countPrimes(int n) {
    if (n &lt; 3) return 0;
    boolean[] composite = new boolean[n];
    int count = 0;
    for (int i = 2; i &lt; n; i++) {
        if (composite[i]) continue;
        count++;
        if ((long) i * i &lt; n)
            for (int j = i * i; j &lt; n; j += i) composite[j] = true;
    }
    return count;
}</code></pre><p class="cx">O(n log log n) time, O(n) memory.</p>` },
    { name: 'Smallest prime factor table and factorisation', lc: 'CSES Counting Divisors', prompt: `<p>Answer many "factorise x" or "how many divisors" queries for x up to 10⁶.</p>`, hint: `<p>Build spf once; each factorisation is O(log x).</p>`,
      solution: `<pre><code>class Factoriser {
    private final int[] spf;
    public Factoriser(int maxN) {
        spf = new int[maxN + 1];
        for (int i = 2; i &lt;= maxN; i++)
            if (spf[i] == 0)
                for (int j = i; j &lt;= maxN; j += i)
                    if (spf[j] == 0) spf[j] = i;
    }
    public Map&lt;Integer, Integer&gt; factorise(int n) {
        Map&lt;Integer, Integer&gt; f = new LinkedHashMap&lt;&gt;();
        while (n &gt; 1) { int p = spf[n]; f.merge(p, 1, Integer::sum); n /= p; }
        return f;
    }
    public int divisorCount(int n) {
        int total = 1;
        for (int e : factorise(n).values()) total *= (e + 1);
        return total;
    }
}</code></pre><p class="cx">O(maxN log log maxN) build, O(log x) per query.</p>` },
    { name: 'gcd, lcm and fraction reduction', lc: 'CSES-style', prompt: `<p>Reduce a fraction and compute an lcm without overflow.</p>`, hint: `<p>Divide before multiplying.</p>`,
      solution: `<pre><code>public static long gcd(long a, long b) {
    while (b != 0) { long t = a % b; a = b; b = t; }     // iterative: no stack depth
    return Math.abs(a);
}
public static long lcm(long a, long b) {
    if (a == 0 || b == 0) return 0;
    return Math.abs(a) / gcd(a, b) * Math.abs(b);        // divide first
}
public static int[] reduce(int num, int den) {
    int g = (int) gcd(num, den);
    return new int[]{num / g, den / g};
}</code></pre><p class="cx">O(log min(a, b)) per call.</p>` }
  ]
});
