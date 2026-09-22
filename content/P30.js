COURSE.topic({
  id: 'P30',
  intro: `Comparing two substrings character by character is O(length). <strong>String hashing</strong> turns each substring into a single number, computed from prefix hashes in O(1), so substring equality becomes an integer comparison. It's prefix sums (P18) with multiplication instead of addition, modular arithmetic (P28) to keep numbers small, and a probability argument for the one risk: collisions.`,
  kps: [
    {
      title: 'Polynomial hashing is a prefix sum in disguise',
      teach: `
<p>Read the string as a number in base B: <code>hash("abc") = a·B² + b·B + c</code>, all mod M.</p>
<pre><code>final long B = 131, M = 1_000_000_007L;
long[] H = new long[n + 1], P = new long[n + 1];
P[0] = 1;
for (int i = 0; i &lt; n; i++) {
    H[i + 1] = (H[i] * B + s.charAt(i)) % M;     // running value
    P[i + 1] = P[i] * B % M;                      // powers of B
}</code></pre>
<div class="ex">
<div class="sub">The analogy</div>
<p>H[i] plays the role of a prefix sum: it summarises everything before position i. The difference is that extending multiplies by B first, so removing a prefix needs the same scaling factor, which is what P[] stores.</p>
<div class="sub">Choosing B and M</div>
<p>B should exceed the alphabet size (131 or 137 for ASCII) and M should be a large prime (10⁹+7, or 2⁶¹−1 for extra safety). Both fixed and public is fine for interviews; for adversarial input, randomise B.</p>
<div class="sub">Why mod at all</div>
<p>Without it the value grows like B^n, thousands of digits. The modulus keeps everything in a long, at the cost of collisions (two steps ahead).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In polynomial hashing, what plays the role that P18's prefix sums play?`, opts: ['H[i], the value of the prefix', 'B, the base of the polynomial', 'M, the modulus applied', 'n, the length of the string'], a: 0, why: 'H[i] summarises the prefix; a substring is recovered by removing a scaled earlier prefix.' },
        { type: 'mcq', q: `Why must B be larger than the alphabet size?`, opts: ['So each position keeps a distinct place value', 'So that B and M are always coprime numbers', 'To stop hash values from going negative', 'Because Java characters are 16 bits wide'], a: 0, why: 'Like a number base: with B ≤ alphabet, two different characters can carry into the same place value, creating easy collisions.' },
        { type: 'num', q: `With B = 131 and characters as ASCII codes, what is the hash of "abc" mod 10⁹+7? (a=97, b=98, c=99)`, a: 1677554, why: '97·131² + 98·131 + 99 = 1,664,617 + 12,838 + 99 = 1,677,554.' },
        { type: 'free', q: `Why does the prefix-hash array need a second array of powers of B, when prefix sums need no such thing?`, model: `<p>With sums, removing a prefix is subtraction and each element contributes the same amount wherever it sits. With polynomial hashing the contribution of a character depends on its position: every extension multiplies the running value by B, so a character i places from the end is scaled by Bⁱ. To subtract an earlier prefix you must first scale it by B^(length of the remainder) so the place values line up. P[] stores those powers so the adjustment is O(1).</p>`, rubric: ['Position matters: each character is scaled by a power of B', 'Removing a prefix requires rescaling it to line up place values', 'P[] gives those powers in O(1)'] }
      ]
    },
    {
      title: 'Substring hash in O(1)',
      teach: `
<pre><code>long subHash(int l, int r) {                     // inclusive
    long v = (H[r + 1] - H[l] * P[r + 1 - l]) % M;
    return v &lt; 0 ? v + M : v;                     // Java % can be negative (P28)
}</code></pre>
<div class="ex">
<div class="sub">Why the scaling</div>
<p>H[r+1] contains the prefix up to l shifted left by (r+1−l) places, so subtract H[l] multiplied by B^(r+1−l). It's exactly P18's <code>P[r+1] − P[l]</code> with the correction that the left part has been shifted.</p>
<div class="sub">Worked example</div>
<p>s = "abcabc". subHash(0,2) and subHash(3,5) both equal <strong>1677554</strong>, the hash of "abc": the two occurrences agree, as they must.</p>
<div class="sub">What it buys</div>
<p>Compare any two substrings in O(1): pattern matching in O(n + m), "longest common prefix of two suffixes", "is this substring a palindrome?" (hash the reverse too), and binary search on answer lengths (e.g. longest repeated substring in O(n log n)).</p>
<div class="sub">The subtraction trap</div>
<p><code>H[l] * P[...]</code> is a product of two values near 10⁹, so it must be computed in <code>long</code> with a <code>% M</code> before subtracting, and the result adjusted if negative.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Why is the substring hash <code>H[r+1] − H[l]·P[r+1−l]</code> rather than just <code>H[r+1] − H[l]</code>?`, opts: ['The prefix sits that many places higher', 'To keep the resulting value positive', 'Because P is the inverse array of H', 'To avoid overflowing a Java long'], a: 0, why: 'Each extension multiplies by B, so the earlier prefix sits (r+1−l) places higher and must be scaled to match.' },
        { type: 'mcq', q: `Two substrings have equal hashes. What can you conclude?`, opts: ['Probably equal; verify if it matters', 'They are certainly equal strings', 'They are certainly different ones', 'Nothing can be concluded at all'], a: 0, why: 'Hash equality is necessary but not sufficient: collisions are possible, just unlikely.' },
        { type: 'num', q: `s = "abcabc". If subHash(0,2) = 1677554, what does subHash(3,5) equal?`, a: 1677554, why: 'The same substring "abc" always hashes to the same value.' },
        { type: 'free', q: `Explain how O(1) substring hashes give an O(n log n) algorithm for "longest substring that appears at least twice".`, model: `<p>Binary search on the answer length L: the predicate "some substring of length L appears twice" is monotone (if length L repeats, so does every shorter length, since a repeat contains repeats). To test a given L, hash every window of length L in O(1) each and put them in a hash set, checking for a duplicate: O(n) per test. Binary searching L over 1..n gives O(n log n). Monotonicity is what licenses the binary search (F13).</p>`, rubric: ['Binary search on the length, with monotonicity justified', 'Each test hashes all windows of that length in O(n) and looks for a duplicate', 'Total O(n log n)'] }
      ]
    },
    {
      title: 'Collisions: the risk you must be able to quantify',
      teach: `
<div class="ex">
<div class="sub">The birthday bound</div>
<p>With a modulus M and k distinct substrings compared, the chance that some pair collides is roughly <strong>k² / (2M)</strong>. With M = 10⁹ and k = 10⁵ that is about 10¹⁰ / (2 × 10⁹) = 5, i.e. a collision is <em>likely</em>. The intuition is the birthday paradox: pairs grow quadratically.</p>
<div class="sub">Fixes</div>
<p>(1) A larger modulus: M = 2⁶¹ − 1 makes the same bound about 10¹⁰ / (4 × 10¹⁸) ≈ 2 × 10⁻⁹. (2) <strong>Double hashing</strong>: two independent (B, M) pairs, so a collision needs both to collide. (3) Verify the match directly when a hit is found, which keeps correctness and only costs time on real hits.</p>
<div class="sub">Adversarial input</div>
<p>Fixed, well-known parameters can be attacked: anti-hash tests exist for codeforces-style judges. Randomising B at runtime removes that (the same reasoning as hash-flooding in F11).</p>
<div class="sub">The honest interview line</div>
<p>"Hashing gives O(1) comparisons with a small false-positive probability; I'd use a 64-bit modulus or double hashing, and verify on match if correctness must be exact."</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Comparing k = 10⁵ substrings with a single modulus M ≈ 10⁹. Collision risk?`, opts: ['High: k²/2M is about 5', 'Negligible: about 10⁻⁹', 'Zero: hashes are unique', 'Only matters if k exceeds M'], a: 0, why: 'The birthday bound counts pairs: k² = 10¹⁰ versus 2M = 2 × 10⁹.' },
        { type: 'mcq', q: `Double hashing means…`, opts: ['Two independent (B, M) pairs must both match', 'Hashing the string twice with the same B', 'Using a hash of the hash value', 'Storing each hash in two buckets'], a: 0, why: 'The collision probability multiplies, so it becomes vanishingly small.' },
        { type: 'num', q: `Birthday bound k²/(2M) with k = 10⁵ and M = 2⁶¹ ≈ 2.3 × 10¹⁸. Risk as a power of ten (give the exponent, e.g. −9)?`, a: -9, tol: 1, why: '10¹⁰ / (4.6 × 10¹⁸) ≈ 2 × 10⁻⁹.' },
        { type: 'free', q: `An interviewer asks "is your hashing solution correct?" How should you answer honestly?`, model: `<p>Say it is correct with high probability, not certainty: equal hashes imply equal strings only up to collisions, whose chance is about k²/(2M) by the birthday bound. Then name the mitigations: a 64-bit modulus, two independent hashes, or verifying the characters on a reported match (which restores exactness, at the cost of time only when a candidate is found). If exactness is required with no probabilistic argument allowed, use KMP or Z (P31), which are deterministic.</p>`, rubric: ['Admits it is probabilistic, quantified by the birthday bound', 'Names mitigations: bigger modulus, double hashing, verify on match', 'Notes KMP/Z as the deterministic alternative'] }
      ]
    },
    {
      title: 'Hashing versus KMP: what each buys',
      teach: `
<div class="ex">
<div class="sub">Hashing</div>
<p><strong>Flexible</strong>: compare any two substrings, in any order, in O(1); combine with binary search; handle 2D grids by hashing rows then columns. <strong>Probabilistic</strong>, needs modular care, and can be attacked with crafted input.</p>
<div class="sub">KMP / Z (P31)</div>
<p><strong>Deterministic and exact</strong>, O(n + m), no modulus, no collisions. But it answers one specific question well (find this pattern, or compute borders) and is clumsy for arbitrary substring comparisons.</p>
<div class="sub">How to choose</div>
<p>One pattern, exact match required → KMP. Many arbitrary substring comparisons, or a binary search over lengths → hashing. Prefix-based queries on a dictionary of words → trie (P32).</p>
<div class="sub">Where hashing shines</div>
<p>"Longest duplicate substring", "count distinct substrings of each length", "do these two documents share a long passage", and 2D pattern search, where writing a deterministic algorithm would take far longer than the interview allows.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `One pattern, one text, exact match required, adversarial input possible. Best tool?`, opts: ['KMP: deterministic O(n + m)', 'Hashing: simpler to write', 'A trie of all suffixes', 'Sorting both strings first'], a: 0, why: 'No collision risk and no parameters to attack.' },
        { type: 'mcq', q: `"Longest substring appearing in both of two strings." Natural approach?`, opts: ['Binary search the length + hashing', 'KMP with the pattern reversed', 'Sort both strings and compare', 'A single sliding window pass'], a: 0, why: 'The predicate "a common substring of length L exists" is monotone, and hashing makes each test O(n).' },
        { type: 'mcq', q: `Which does hashing do that KMP does not?`, opts: ['Compare any substring pair in O(1)', 'Run in linear time altogether', 'Work with no extra memory used', 'Give exact answers with certainty'], a: 0, why: 'KMP is tailored to one pattern; hashing answers any pairwise comparison.' },
        { type: 'free', q: `Discriminate: hashing, KMP and tries. Give the problem shape that picks each.`, model: `<p>Hashing: many arbitrary substring comparisons, or a search over lengths (longest repeat, longest common substring, 2D patterns); O(1) per comparison but probabilistic. KMP/Z: find one pattern in one text, or compute borders/periods of a string; deterministic and linear. Trie: a <em>set of words</em> queried by prefix (autocomplete, word search, or bit tries for maximum XOR); shared prefixes are stored once and lookups cost O(word length). The signals are: pairwise comparisons, single-pattern search, and prefix queries over a dictionary.</p>`, rubric: ['Hashing for arbitrary/many substring comparisons and length searches', 'KMP/Z for single-pattern search and border structure, deterministic', 'Trie for prefix queries over a set of words'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `s = "abcabc" with B = 131, M = 10⁹+7. If subHash(0,2) = 1677554, what is subHash(3,5)?`, a: 1677554, why: 'Identical substrings hash identically.' },
    { type: 'free', q: `<strong>Transfer.</strong> "Longest Duplicate Substring" (LeetCode 1044): find the longest substring appearing at least twice, n up to 3 × 10⁴. Give the full approach and complexity.`, model: `<p>Binary search the length L (monotone: if a duplicate of length L exists, so does one of every shorter length). For a fixed L, roll a polynomial hash over every window of length L, storing hashes in a HashSet; a repeat means a duplicate of that length, and you can verify the characters to rule out a collision. Each test is O(n), so the total is O(n log n). Use a 64-bit modulus or double hashing given n² ≈ 10⁹ pairs.</p>`, rubric: ['Binary search on length, justified by monotonicity', 'Per test: hash all windows into a set, O(n)', 'O(n log n) total; mentions collision handling (big modulus/double hash/verify)'] },
    { type: 'mcq', q: `Why compute the substring hash in <code>long</code> and adjust a negative result?`, opts: ['Products near M² overflow; % can be negative', 'Because B is larger than the alphabet size', 'To keep the array of powers of B small', 'Because every hash value must be even'], a: 0, why: 'Two P28 traps at once: overflow before the modulus, and the sign of %.' },
    { type: 'num', q: `Birthday bound: comparing k = 10⁴ substrings with M = 10⁹+7. Approximate collision probability as a percentage (k²/2M × 100)?`, a: 5, tol: 1, why: '10⁸ / (2 × 10⁹) = 0.05 = 5%: uncomfortably high for a single modulus.' },
    { type: 'free', q: `Explain the analogy "polynomial hashing is prefix sums with multiplication" precisely: what is the same, and what changes?`, model: `<p>Same: both precompute a running summary of every prefix so that a range query becomes an O(1) combination of two stored values, after an O(n) build. What changes: with sums, extending adds a term and each element's contribution is position-independent, so a range is a plain difference. With hashing, extending multiplies the accumulator by B and adds the new character, so an element's contribution depends on how far it sits from the end; removing a prefix therefore needs it rescaled by B^(length of the suffix), which is why a powers array is stored alongside. Everything is reduced mod M to keep values bounded, which introduces collisions that sums never have.</p>`, rubric: ['Both: O(n) build, O(1) range query from two stored prefix values', 'Hashing multiplies by B, so contributions are position-weighted and need a powers array', 'Modulus keeps values bounded but introduces collisions'] }
  ],
  practice: [
    { name: 'Prefix hashing utility', lc: 'CSES String Matching (hashing version)', prompt: `<p>Build prefix hashes and answer substring-hash queries in O(1).</p>`, hint: `<p>Store powers of B alongside the running hashes.</p>`,
      solution: `<pre><code>class StringHash {
    private static final long B = 131, M = 1_000_000_007L;
    private final long[] H, P;
    public StringHash(String s) {
        int n = s.length();
        H = new long[n + 1];
        P = new long[n + 1];
        P[0] = 1;
        for (int i = 0; i &lt; n; i++) {
            H[i + 1] = (H[i] * B + s.charAt(i)) % M;
            P[i + 1] = P[i] * B % M;
        }
    }
    /** hash of s[l..r], inclusive */
    public long sub(int l, int r) {
        long v = (H[r + 1] - H[l] % M * P[r + 1 - l]) % M;
        return v &lt; 0 ? v + M : v;
    }
}</code></pre><p class="cx">O(n) build, O(1) per query.</p>` },
    { name: 'Longest Duplicate Substring', lc: 'LeetCode 1044', prompt: `<p>Longest substring occurring at least twice (may overlap).</p>`, hint: `<p>Binary search the length; hash every window of that length.</p>`,
      solution: `<pre><code>public String longestDupSubstring(String s) {
    int n = s.length();
    long B = 131, M = (1L &lt;&lt; 61) - 1;              // large modulus: fewer collisions
    long[] H = new long[n + 1], P = new long[n + 1];
    P[0] = 1;
    for (int i = 0; i &lt; n; i++) {
        H[i + 1] = mulmod(H[i], B, M) + s.charAt(i);
        if (H[i + 1] &gt;= M) H[i + 1] -= M;
        P[i + 1] = mulmod(P[i], B, M);
    }
    int lo = 1, hi = n - 1, bestStart = -1, bestLen = 0;
    while (lo &lt;= hi) {
        int mid = lo + (hi - lo) / 2;
        int start = findDup(s, mid, H, P, M);
        if (start &gt;= 0) { bestStart = start; bestLen = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return bestStart &lt; 0 ? "" : s.substring(bestStart, bestStart + bestLen);
}
private int findDup(String s, int L, long[] H, long[] P, long M) {
    Map&lt;Long, List&lt;Integer&gt;&gt; seen = new HashMap&lt;&gt;();
    for (int i = 0; i + L &lt;= s.length(); i++) {
        long h = (H[i + L] - mulmod(H[i], P[L], M) % M + M) % M;
        List&lt;Integer&gt; bucket = seen.computeIfAbsent(h, k -&gt; new ArrayList&lt;&gt;());
        for (int j : bucket)                        // verify: rules out collisions
            if (s.regionMatches(j, s, i, L)) return i;
        bucket.add(i);
    }
    return -1;
}
private long mulmod(long a, long b, long m) {       // 61-bit safe multiply
    return java.math.BigInteger.valueOf(a).multiply(java.math.BigInteger.valueOf(b))
            .mod(java.math.BigInteger.valueOf(m)).longValue();
}</code></pre><p class="cx">O(n log n) hash work. Verifying on a hit keeps the answer exact.</p>` }
  ]
});
