COURSE.topic({
  id: 'P31',
  intro: `Naive substring search restarts the pattern after every mismatch, re-reading text it has already seen: O(nm). KMP's insight is that a mismatch <em>tells you something</em>: the part that matched is a known prefix of the pattern, so you can slide to the next position consistent with it and <strong>never move the text pointer backwards</strong>. The Z-algorithm reaches the same O(n + m) from a different angle and is often easier to remember.`,
  kps: [
    {
      title: 'The failure function: longest proper prefix that is also a suffix',
      teach: `
<p>For each position i of the pattern, <code>f[i]</code> = the length of the longest proper prefix of p[0..i] that is also a suffix of p[0..i]. "Proper" means shorter than the whole thing.</p>
<div class="ex">
<div class="sub">Worked examples</div>
<pre><code>p = a b a b a c a
f = 0 0 1 2 3 0 1
      ^       ^
      |       +-- "ababa": prefix "aba" = suffix "aba", so f = 3
      +---------- "ab": no proper prefix is also a suffix, so f = 0

p = a a b a a a b
f = 0 1 0 1 2 2 3</code></pre>
<div class="sub">What it means</div>
<p>f[i] is how much of the pattern is <em>still matched</em> if the text agreed with p[0..i] and then failed: the suffix that matched is also a prefix, so those characters can be reused instead of re-read.</p>
<div class="sub">Another name</div>
<p>These are the <strong>borders</strong> of the prefix. The shortest period of p[0..i] is (i + 1) − f[i], which is how CSES "Finding Periods" is solved.</p>
</div>`,
      qs: [
        { type: 'num', q: `Pattern "ababaca". What is f[4] (for the prefix "ababa")?`, a: 3, why: '"aba" is both a prefix and a suffix of "ababa".' },
        { type: 'num', q: `Pattern "aabaaab". What is f[6] (the whole string)?`, a: 3, why: '"aab" is a prefix and a suffix of "aabaaab".' },
        { type: 'mcq', q: `Why must the prefix be <em>proper</em> (shorter than the string)?`, opts: ['Otherwise f[i] = i + 1 always, uselessly', 'Because suffixes cannot be full strings', 'To keep f[i] non-negative', 'So the pattern stays unique'], a: 0, why: 'The whole string is trivially both a prefix and a suffix of itself; the useful information is the longest strictly shorter one.' },
        { type: 'free', q: `What does f[i] tell you at the moment of a mismatch, and why does that let you slide the pattern without re-reading text?`, model: `<p>If the text matched p[0..i] and then mismatched, the last f[i] characters of what matched are also the <em>first</em> f[i] characters of the pattern. So after sliding the pattern forward so that its prefix of length f[i] lines up with those characters, everything to the left is already known to match. You resume comparing at pattern index f[i] against the same text position: no text character is read twice.</p>`, rubric: ['The matched suffix of length f[i] is also a prefix of the pattern', 'Sliding so that prefix aligns keeps the already-matched part valid', 'Comparison resumes at pattern index f[i] with the text pointer unmoved'] }
      ]
    },
    {
      title: 'Searching without moving the text pointer backwards',
      teach: `
<pre><code>int[] f = failure(pattern);
int k = 0;                                        // characters of the pattern matched so far
for (int i = 0; i &lt; text.length(); i++) {         // i never decreases
    while (k &gt; 0 &amp;&amp; text.charAt(i) != pattern.charAt(k)) k = f[k - 1];   // fall back
    if (text.charAt(i) == pattern.charAt(k)) k++;
    if (k == pattern.length()) {
        report(i - k + 1);                        // match found
        k = f[k - 1];                             // continue for overlapping matches
    }
}</code></pre>
<div class="ex">
<div class="sub">The invariant (F07)</div>
<p>At the top of each iteration, <strong>k is the length of the longest prefix of the pattern that is a suffix of text[0..i)</strong>. The while-loop restores it after a mismatch by falling back to the next-longest border; the if extends it by one on a match.</p>
<div class="sub">Why it is O(n + m)</div>
<p>k increases by at most 1 per character, so it increases at most n times in total. Each fall-back strictly decreases k, so there are at most n fall-backs overall: the amortized argument of F04, exactly like the monotonic stack.</p>
<div class="sub">Worked example</div>
<p>text "mississippi", pattern "issip": the first match starts at index <strong>4</strong>.</p>
</div>`,
      qs: [
        { type: 'num', q: `Search for "issip" in "mississippi". Index of the first match (0-based)?`, a: 4, why: 'text[4..8] = "issip".' },
        { type: 'mcq', q: `Why is KMP O(n + m) despite the inner while-loop?`, opts: ['k rises ≤ n times, so it falls ≤ n times', 'The while loop runs at most twice', 'Because the pattern is short', 'It uses binary search internally'], a: 0, why: 'Each fall-back strictly decreases k, and k only ever increased n times: total work is linear (F04).' },
        { type: 'mcq', q: `After reporting a match, why set <code>k = f[k − 1]</code> instead of k = 0?`, opts: ['To catch overlapping occurrences', 'To restart the search faster', 'Because k = 0 would loop forever', 'To avoid reading past the end'], a: 0, why: 'Searching "aa" in "aaa" has matches at 0 and 1; resetting to 0 would miss the overlap.' },
        { type: 'free', q: `State KMP's loop invariant and explain how each of the three lines in the loop maintains it.`, model: `<p>Invariant: k is the length of the longest prefix of the pattern that is also a suffix of the text processed so far. The while-loop: on a mismatch, the current k-length candidate cannot be extended, so fall back to f[k−1], the next-longest prefix that is still a suffix; repeating restores the largest valid k. The if: if the characters agree, the matched prefix grows by one, so k++. The match check: when k reaches the full pattern length, a full occurrence ends at i, and falling back to f[k−1] leaves the longest still-valid partial match so that overlaps are found.</p>`, rubric: ['Invariant: k = longest pattern prefix that is a suffix of the processed text', 'Mismatch → fall back through borders until extension is possible', 'Match → k++; full match → report and fall back for overlaps'] }
      ]
    },
    {
      title: 'Building the failure function with the same idea',
      teach: `
<p>The clever part: the failure function is computed by <strong>running KMP of the pattern against itself</strong>.</p>
<pre><code>int[] failure(String p) {
    int[] f = new int[p.length()];
    int k = 0;
    for (int i = 1; i &lt; p.length(); i++) {          // i starts at 1: f[0] = 0 always
        while (k &gt; 0 &amp;&amp; p.charAt(i) != p.charAt(k)) k = f[k - 1];
        if (p.charAt(i) == p.charAt(k)) k++;
        f[i] = k;
    }
    return f;
}</code></pre>
<div class="ex">
<div class="sub">Why it works</div>
<p>A border of p[0..i] is a border of p[0..i−1] extended by one matching character, or a shorter border of that. So try the current border length k; if p[i] ≠ p[k], fall back to the next-shorter border f[k−1] and try again, exactly as in the search.</p>
<div class="sub">Why f[0] = 0</div>
<p>A single character has no proper prefix, so its longest border is 0. That's why the loop starts at i = 1.</p>
<div class="sub">Cost</div>
<p>O(m) by the same amortized argument, so the whole algorithm is O(n + m) with O(m) extra space.</p>
</div>`,
      qs: [
        { type: 'num', q: `Failure function of "aaaa": what is f[3]?`, a: 3, why: 'f = [0, 1, 2, 3]: "aaa" is both a prefix and a suffix of "aaaa".' },
        { type: 'num', q: `Failure function of "abcabcd": what is f[5] (for "abcabc")?`, a: 3, why: 'f = [0,0,0,1,2,3,0]: "abc" is a prefix and a suffix; the final d resets it to 0.' },
        { type: 'mcq', q: `Building the failure function is really…`, opts: ['KMP of the pattern against itself', 'A sort of the pattern prefixes', 'A binary search over lengths', 'A hash of every prefix'], a: 0, why: 'Same loop, with the pattern playing both roles.' },
        { type: 'free', q: `Why is every border of p[0..i] either a border of p[0..i−1] extended by one character, or shorter?`, model: `<p>Let b be a border of p[0..i] of length L ≥ 1. Removing its last character leaves a string of length L−1 that is both a prefix of p and a suffix of p[0..i−1], i.e. a border of p[0..i−1]. So every border of p[0..i] comes from some border of the previous prefix, extended by the matching character p[i]. That is why trying k, then f[k−1], then f[f[k−1]−1] and so on enumerates exactly the candidates in decreasing length, and the first one whose next character matches gives the new longest border.</p>`, rubric: ['Chop the last character off a border of p[0..i]', 'What remains is a border of p[0..i−1]', 'So the candidates are the chain k, f[k−1], … , tried in decreasing order'] }
      ]
    },
    {
      title: 'The Z-array, and what it answers directly',
      teach: `
<p><code>z[i]</code> = the length of the longest substring starting at i that is also a prefix of the whole string. (z[0] is defined as 0 or n, by convention.)</p>
<div class="ex">
<div class="sub">Worked examples</div>
<pre><code>s = a a b x a a b        s = a b a c a b a
z = 0 1 0 0 3 1 0        z = 0 0 1 0 3 0 1
            ^                        ^
            "aab" matches the prefix  "aba" matches the prefix</code></pre>
<div class="sub">Pattern matching with Z</div>
<p>Build <code>pattern + '#' + text</code> (with a separator that appears in neither) and compute z. Every position in the text part with <code>z[i] ≥ m</code> is a match. That's the whole algorithm: one array, one scan.</p>
<div class="sub">Why it is linear</div>
<p>The computation keeps the rightmost segment [l, r] known to match a prefix. Inside it, values can be copied from the corresponding earlier position; only comparisons that <em>extend</em> r do real work, and r only moves right, so the extra comparisons total O(n): the same "each index passes once" argument as the sliding window.</p>
<div class="sub">KMP or Z?</div>
<p>They solve the same problems in the same time. Z is usually quicker to derive under pressure ("prefix match lengths, with a sliding known-matched window"), while KMP's failure function is what you want when the <em>borders themselves</em> are the answer (periods, smallest repeating unit).</p>
</div>`,
      qs: [
        { type: 'num', q: `s = "aabxaab". What is z[4]?`, a: 3, why: 'The substring starting at 4 is "aab", which matches the prefix "aab".' },
        { type: 'num', q: `s = "abacaba". What is z[4]?`, a: 3, why: '"aba" starting at index 4 matches the prefix "aba".' },
        { type: 'mcq', q: `To find a pattern with the Z-algorithm you build…`, opts: ['pattern + separator + text, then z', 'text + pattern, then sort', 'the failure function of the text', 'a hash of every text window'], a: 0, why: 'A separator absent from both prevents matches spanning the join, so z ≥ m marks exactly the occurrences.' },
        { type: 'free', q: `Why does the Z-algorithm's "copy values from inside the known segment" step not break correctness?`, model: `<p>If i lies inside the segment [l, r] known to match the prefix, then s[i..r] equals s[i−l .. r−l], a stretch already analysed near the front of the string. So z[i] starts as min(r − i + 1, z[i − l]): the earlier value is valid as long as it does not run past r, where nothing is yet known. If it would reach r, the algorithm stops copying and compares characters explicitly, extending r. That keeps every copied value justified by an equality already established.</p>`, rubric: ['Inside [l, r] the text repeats an earlier stretch, so z[i−l] applies', 'Cap the copy at r − i + 1 because beyond r nothing is known', 'Explicit comparisons only when extending r, which keeps it linear'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Failure function of "aabaaab": what is f[4] (for "aabaa")?`, a: 2, why: 'f = [0,1,0,1,2,2,3]: "aa" is a prefix and a suffix of "aabaa".' },
    { type: 'free', q: `<strong>Transfer.</strong> "Shortest string you can append to s to make it a palindrome" (LeetCode 214, shortest palindrome by prepending). Show how KMP solves it.`, model: `<p>You need the longest prefix of s that is itself a palindrome; the remaining suffix, reversed, is prepended. Build the combined string s + '#' + reverse(s) and compute the failure function. Its last value is the length of the longest prefix of s that equals a suffix of reverse(s), i.e. the longest palindromic prefix of s. Prepend the reverse of everything after it: O(n) time and space. The separator stops the border from spanning both halves.</p>`, rubric: ['Reduces to the longest palindromic prefix of s', 'Builds s + separator + reverse(s) and reads the final failure value', 'Prepends the reversed remainder; O(n)'] },
    { type: 'mcq', q: `Naive search is O(nm). Which input makes it actually quadratic?`, opts: ['text "aaaa…a", pattern "aaa…ab"', 'text and pattern with no shared letters', 'a random text over a large alphabet', 'a pattern longer than the text'], a: 0, why: 'Every alignment matches m−1 characters before failing on the last one, so the text pointer keeps backing up.' },
    { type: 'num', q: `Searching "aa" in "aaaa": how many (possibly overlapping) matches?`, a: 3, why: 'Starting at 0, 1 and 2. Resetting k to f[k−1] after a match is what finds them all.' },
    { type: 'free', q: `Discriminate: hashing (P30) vs KMP/Z for substring search. Give one reason to prefer each.`, model: `<p>KMP/Z: deterministic and exact, linear time with no modulus, no collision risk and nothing to tune, so it is the safer answer when the input might be adversarial or the interviewer asks for certainty. Hashing: far more flexible, since any two substrings can be compared in O(1), which makes binary-search-on-length problems (longest duplicate, longest common substring) and 2D patterns easy, where a deterministic algorithm would be much longer to write. Roughly: one fixed pattern → KMP; many arbitrary comparisons → hashing.</p>`, rubric: ['KMP/Z: exact, deterministic, no parameters or collision risk', 'Hashing: O(1) arbitrary substring comparisons, enables length searches and 2D', 'Names the deciding shape: one pattern vs many comparisons'] }
  ],
  practice: [
    { name: 'Find the Index of the First Occurrence', lc: 'LeetCode 28 · CSES String Matching', prompt: `<p>Index of the first occurrence of needle in haystack, or −1.</p>`, hint: `<p>Build the failure function, then scan without moving the text pointer back.</p>`,
      solution: `<pre><code>public int strStr(String haystack, String needle) {
    int n = haystack.length(), m = needle.length();
    if (m == 0) return 0;
    int[] f = failure(needle);
    int k = 0;
    for (int i = 0; i &lt; n; i++) {
        while (k &gt; 0 &amp;&amp; haystack.charAt(i) != needle.charAt(k)) k = f[k - 1];
        if (haystack.charAt(i) == needle.charAt(k)) k++;
        if (k == m) return i - m + 1;
    }
    return -1;
}
private int[] failure(String p) {
    int[] f = new int[p.length()];
    int k = 0;
    for (int i = 1; i &lt; p.length(); i++) {
        while (k &gt; 0 &amp;&amp; p.charAt(i) != p.charAt(k)) k = f[k - 1];
        if (p.charAt(i) == p.charAt(k)) k++;
        f[i] = k;
    }
    return f;
}</code></pre><p class="cx">O(n + m) time, O(m) space.</p>` },
    { name: 'Z-algorithm and all occurrences', lc: 'CSES Finding Patterns', prompt: `<p>Compute the Z-array, and use it to list every occurrence of a pattern.</p>`, hint: `<p>Keep the rightmost known-matching segment [l, r].</p>`,
      solution: `<pre><code>public int[] zArray(String s) {
    int n = s.length();
    int[] z = new int[n];
    int l = 0, r = 0;
    for (int i = 1; i &lt; n; i++) {
        if (i &lt; r) z[i] = Math.min(r - i, z[i - l]);      // copy from inside the segment
        while (i + z[i] &lt; n &amp;&amp; s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
        if (i + z[i] &gt; r) { l = i; r = i + z[i]; }        // extend the segment
    }
    return z;
}
public List&lt;Integer&gt; findAll(String text, String pattern) {
    String combined = pattern + '\\u0001' + text;          // separator in neither string
    int[] z = zArray(combined);
    List&lt;Integer&gt; res = new ArrayList&lt;&gt;();
    int m = pattern.length();
    for (int i = m + 1; i &lt; combined.length(); i++)
        if (z[i] &gt;= m) res.add(i - m - 1);
    return res;
}</code></pre><p class="cx">O(n + m). Every index with z ≥ m in the text part is an occurrence.</p>` },
    { name: 'Shortest Palindrome', lc: 'LeetCode 214', prompt: `<p>Prepend the fewest characters to make s a palindrome.</p>`, hint: `<p>Longest palindromic prefix = final failure value of s + '#' + reverse(s).</p>`,
      solution: `<pre><code>public String shortestPalindrome(String s) {
    if (s.isEmpty()) return s;
    String rev = new StringBuilder(s).reverse().toString();
    String combined = s + '\\u0001' + rev;
    int[] f = failure(combined);
    int longestPalPrefix = f[combined.length() - 1];
    return new StringBuilder(s.substring(longestPalPrefix)).reverse() + s;
}
private int[] failure(String p) {
    int[] f = new int[p.length()];
    int k = 0;
    for (int i = 1; i &lt; p.length(); i++) {
        while (k &gt; 0 &amp;&amp; p.charAt(i) != p.charAt(k)) k = f[k - 1];
        if (p.charAt(i) == p.charAt(k)) k++;
        f[i] = k;
    }
    return f;
}</code></pre><p class="cx">O(n). The separator stops borders from spanning both halves.</p>` }
  ]
});
