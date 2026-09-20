COURSE.topic({
  id: 'P01',
  intro: `The hash map pattern: <strong>remember what you've seen so that each new element is answered by one O(1) lookup instead of a rescan</strong>. It rests on F11 (why lookups are O(1)) and F01 (why trading space for time matters). The skill tested here isn't "use a HashMap". It's deciding <em>what key to store</em> so that the question you need to ask becomes a lookup.`,
  kps: [
    {
      title: 'Trade space for time: remember what you have seen',
      teach: `
<p>Brute force for "does any earlier element relate to this one?" rescans the prefix for every element: the F09 pair grid, all n²/2 cells. A hash structure <strong>summarises the prefix</strong> so the question becomes one lookup.</p>
<div class="ex">
<div class="sub">Worked example: Contains Duplicate</div>
<pre><code>Set&lt;Integer&gt; seen = new HashSet&lt;&gt;();
for (int x : nums) {
    if (!seen.add(x)) return true;   // add returns false if x was already there
}
return false;</code></pre>
<div class="sub">Invariant (F07)</div>
<p>At the top of iteration i, <code>seen</code> = the set of values in nums[0..i). So "is nums[i] a duplicate of something earlier?" is exactly "is nums[i] in seen?"</p>
<div class="sub">Cost</div>
<p>O(n) expected time, O(n) extra space, versus O(n²) time and O(1) space brute force. <strong>Say the trade out loud.</strong></p>
</div>
<p>The picture: walking left to right with a notebook. Every element you pass is written down, so it's one glance away.</p>`,
      qs: [
        { type: 'mcq', q: `Contains Duplicate with a HashSet: time and extra space?`, opts: ['O(n) expected time, O(n) space', 'O(n log n) time, O(1) space', 'O(n²) time, O(1) space', 'O(n) time, O(1) space'], a: 0, why: 'One O(1)-expected lookup per element; the set may hold every element.' },
        { type: 'free', q: `State the invariant of the "seen set" loop and explain how it makes a single lookup equivalent to rescanning the prefix.`, model: `<p>Invariant: before processing index i, seen contains exactly the values of nums[0..i). So "does nums[i] equal some earlier element?" is exactly "is nums[i] ∈ seen?", which is one expected O(1) lookup instead of an O(i) rescan. Adding nums[i] afterwards maintains the invariant for i + 1.</p>`, rubric: ['Invariant: seen = values of the processed prefix', 'So membership in seen answers the question about all earlier elements', 'Maintenance: add nums[i] after checking'] },
        { type: 'mcq', q: `Values are guaranteed in 0..1000. Better structure than HashSet for the seen-set?`, opts: ['A boolean[1001]', 'A TreeSet of values', 'A sorted ArrayList', 'A LinkedList of values'], a: 0, why: 'Dense bounded range: direct indexing, no hashing or boxing (F11).' },
        { type: 'mcq', q: `Memory is tight (O(1) extra) and you may modify the input. Contains Duplicate becomes…`, opts: ['Sort in place, compare neighbours', 'Still HashSet; there is no other way', 'Brute force is the only option', 'Use a bitmask of all int values'], a: 0, why: 'O(n log n) time, O(1)–O(log n) space: duplicates end up adjacent after sorting.' }
      ]
    },
    {
      title: 'Complement lookup: Two Sum in one pass',
      teach: `
<p>Two Sum: find indices i &lt; j with nums[i] + nums[j] = target. For each j, the partner we need is known exactly: <strong>target − nums[j]</strong>, the complement.</p>
<div class="ex">
<div class="sub">Subgoal 1: choose the key</div>
<p>We'll ask "have I seen value v?" and need its index back. So map <strong>value → index</strong>.</p>
<div class="sub">Subgoal 2: look up before inserting</div>
<pre><code>Map&lt;Integer, Integer&gt; idx = new HashMap&lt;&gt;();
for (int j = 0; j &lt; nums.length; j++) {
    Integer i = idx.get(target - nums[j]);
    if (i != null) return new int[]{i, j};
    idx.put(nums[j], j);
}</code></pre>
<div class="sub">Subgoal 3: why one pass is enough</div>
<p>Every valid pair (i, j) with i &lt; j gets checked when the loop reaches j: at that moment i is already in the map. So each pair is examined from its right end, and none is missed. That's the F09 grid again: each j checks its entire column of the grid in one lookup.</p>
<div class="sub">Why look up before put?</div>
<p>If target = 2·nums[j], putting first would let nums[j] pair with <em>itself</em>.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `In one-pass Two Sum, why check the map before inserting nums[j]?`, opts: ['To avoid pairing an element with itself', 'To keep the map sorted by value', 'To save one hash computation', 'To handle negative numbers'], a: 0, why: 'With target = 6 and nums[j] = 3, inserting first would find 3 as its own complement.' },
        { type: 'free', q: `Prove one pass finds a valid pair if one exists: why can't the pair be missed?`, model: `<p>Take any valid pair i &lt; j. When the loop reaches j, index i has already been processed and inserted (value → index), so looking up target − nums[j] = nums[i] finds it (or finds another index with the same value, which is also valid). The pair is detected at its right endpoint. Since every pair has a right endpoint, none is missed.</p>`, rubric: ['Consider any valid pair i &lt; j', 'At step j, nums[i] is already in the map', 'So the complement lookup at j succeeds; every pair is caught at its right endpoint'] },
        { type: 'num', q: `nums = [3, 8, 4, 5, 1], target 9. At which j (0-based) is the pair first found?`, a: 3, why: 'j = 0 (3) needs 6: absent. j = 1 (8) needs 1: absent. j = 2 (4) needs 5: absent (5 comes later). j = 3 (5) needs 4: found at i = 2.' },
        { type: 'mcq', q: `Duplicate values: nums = [3, 3], target 6. Does one-pass Two Sum work?`, opts: ['Yes: j = 1 finds index 0', 'No: the map overwrites the 3', 'No: it finds the same index twice', 'Only if the map allows duplicates'], a: 0, why: 'At j = 1, the map already holds 3 → 0 and returns (0, 1) before any overwrite.' }
      ]
    },
    {
      title: 'Frequency maps and canonical keys',
      teach: `
<p>Two recurring tricks: <strong>count</strong> things, and <strong>group</strong> things by a key that's identical for everything that "belongs together".</p>
<div class="ex">
<div class="sub">Frequency: Valid Anagram</div>
<p>s and t are anagrams iff every letter appears the same number of times. <code>int[26]</code>: +1 for s, −1 for t, then check all zero. O(n), O(1) space (26 is constant).</p>
<div class="sub">Canonical key: Group Anagrams</div>
<p>"eat", "tea" and "ate" must land in the same group. Design a key that's the same for all of them and different for anything else:</p>
<p>(a) the sorted letters: "aet". Cost O(k log k) per word of length k.</p>
<p>(b) the 26 letter counts as a string, e.g. "1#0#0#0#1#…". O(k) per word.</p>
<pre><code>Map&lt;String, List&lt;String&gt;&gt; groups = new HashMap&lt;&gt;();
for (String w : words) {
    char[] c = w.toCharArray(); Arrays.sort(c);
    groups.computeIfAbsent(new String(c), x -&gt; new ArrayList&lt;&gt;()).add(w);
}</code></pre>
<div class="sub">The design question</div>
<p>"What do all members of a group have in common that nothing outside the group has?" That's the key. A good key is a <strong>normal form</strong>.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Group strings that are rotations of each other ("abc", "bca", "cab"). A good canonical key?`, opts: ['The lexicographically smallest rotation', 'The sorted characters of the string', 'The length of the string alone', 'The first character of the string'], a: 0, why: 'Sorted letters would also group "acb" (not a rotation). The smallest rotation is identical exactly for rotations.' },
        { type: 'mcq', q: `Why is "sorted letters" a correct key for anagrams?`, opts: ['Words are anagrams iff sorts match', 'Sorting is faster than counting', 'Hash maps need sorted keys', 'It removes the duplicate words'], a: 0, why: 'Same multiset of letters ⟺ same sorted sequence. Both directions are needed for a correct key.' },
        { type: 'free', q: `A key for grouping must satisfy two properties. Name both and explain what goes wrong if either fails.`, model: `<p>(1) Items that belong together must get the same key; otherwise one true group is split across several keys. (2) Items that don't belong together must get different keys; otherwise unrelated items are merged into one group. Together: key(a) = key(b) ⟺ a and b belong together.</p>`, rubric: ['Same group means same key (else groups split)', 'Different groups mean different keys (else groups wrongly merge)'] },
        { type: 'num', q: `n = 10⁴ words of length k = 100. Roughly how many operations for the count-signature key (26 + k per word), in thousands?`, a: 1260, tol: 30, why: '10⁴ × 126 ≈ 1.26 × 10⁶, versus 10⁴ × 100 × log₂ 100 ≈ 6.6 × 10⁶ for sorting each word.' }
      ]
    },
    {
      title: 'Prefix sums + hash map: subarray sum = k',
      teach: `
<p>Count subarrays with sum exactly k (values may be negative, so sliding window fails, P04). The search space is all (start, end) pairs: the F09 triangle, O(n²).</p>
<div class="ex">
<div class="sub">Subgoal 1: turn a range into a difference</div>
<p>Let P[i] = sum of nums[0..i). Then sum(nums[l..r]) = P[r+1] − P[l]. A subarray sum is a difference of two prefix sums.</p>
<div class="sub">Subgoal 2: turn it into a complement lookup</div>
<p>We need P[r+1] − P[l] = k, i.e. <strong>P[l] = P[r+1] − k</strong>. For each end, the question is "how many earlier prefix sums equal current − k?" That's Two Sum's complement idea, with <em>counts</em>.</p>
<pre><code>Map&lt;Integer, Integer&gt; count = new HashMap&lt;&gt;();
count.put(0, 1);                  // the empty prefix, P[0] = 0
int sum = 0, res = 0;
for (int x : nums) {
    sum += x;
    res += count.getOrDefault(sum - k, 0);
    count.merge(sum, 1, Integer::sum);
}</code></pre>
<div class="sub">Why count.put(0, 1)?</div>
<p>It stands for the empty prefix, so subarrays starting at index 0 are counted: sum − k = 0 means the whole prefix works.</p>
</div>`,
      qs: [
        { type: 'num', q: `nums = [1, 1, 1], k = 2. Number of subarrays with sum 2?`, a: 2, why: '[1,1] at 0–1 and [1,1] at 1–2.' },
        { type: 'num', q: `nums = [3, 4, 7, 2, −3, 1, 4, 2], k = 7. Count?`, a: 4, why: '[3,4], [7], [7,2,−3,1], [1,4,2]. The prefix-sum map finds each as sum − 7 seen before.' },
        { type: 'mcq', q: `Forgetting <code>count.put(0, 1)</code> causes…`, opts: ['Missing subarrays that start at index 0', 'Counting each subarray twice', 'A NullPointerException on start', 'Wrong answers only for k = 0'], a: 0, why: 'A subarray starting at 0 needs P[0] = 0 to be in the map.' },
        { type: 'free', q: `Why does this problem need a hash map of prefix sums instead of a sliding window? Refer to what negative numbers do.`, model: `<p>Sliding window relies on monotonicity: extending the window only increases the sum and shrinking only decreases it, so when the sum is too big you can safely move left. With negative numbers, extending can decrease the sum, so a window that's too big now might become exactly k later. There's no safe erasure (F09). Prefix sums + a map avoid that: each end index looks up all valid starts at once, whatever the signs.</p>`, rubric: ['Sliding window needs the sum to change monotonically as the window grows or shrinks', 'Negative numbers break that, so no safe pointer moves exist', 'The prefix-sum map checks all starts per end via a complement lookup, independent of sign'] },
        { type: 'num', q: `nums = [1, −1, 0], k = 0. Count?`, a: 3, why: '[1, −1], [0], and [1, −1, 0]. Prefix sums 0, 1, 0, 0: pairs of equal prefix sums give 3.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Count pairs (i &lt; j) with nums[i] − nums[j] = k (unsorted). Give the key you store, what you look up, and why it's O(n).`, model: `<p>Scan j left to right with a frequency map of values seen so far. We need nums[i] = nums[j] + k for some earlier i, so add count[nums[j] + k] to the answer, then increment count[nums[j]]. Each element does O(1) expected map work, so O(n) time and O(n) space. Every pair is counted exactly once, at its right endpoint j.</p>`, rubric: ['Stores a frequency map of values seen so far', 'Looks up nums[j] + k (the required earlier value)', 'Counts each pair once at its right endpoint; O(n) expected'] },
    { type: 'mcq', q: `Longest consecutive sequence (unsorted, O(n) required). Which idea makes it O(n)?`, opts: ['Only start counting at x with x−1 absent', 'Sort, then scan for consecutive runs', 'Union-find over all adjacent values', 'A max-heap of the values in order'], a: 0, why: 'Each run is walked once, from its start, so total work O(n). Sorting would be O(n log n).' },
    { type: 'num', q: `Longest consecutive sequence in [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]?`, a: 9, why: '0 through 8.' },
    { type: 'mcq', q: `"Find if any two numbers sum to target" on an array that is already sorted, with O(1) extra space required. Best tool?`, opts: ['Two pointers from both ends', 'HashSet of complements', 'Sort again, then hashing', 'Nested loops over pairs'], a: 0, why: 'Sorted + O(1) space → two pointers (F09, P02). Hashing is the tool for unsorted input when O(n) space is fine.' },
    { type: 'free', q: `Explain why "subarray sum = k" is really Two Sum in disguise.`, model: `<p>A subarray sum is a difference of two prefix sums: P[r+1] − P[l] = k. Treat the prefix sums as the array: we need pairs l &lt; r+1 of prefix values whose difference is k, and for each right end the needed partner is exactly P[r+1] − k. That's the complement lookup of Two Sum (with counts instead of a single index).</p>`, rubric: ['Subarray sum = difference of two prefix sums', 'For each right end, the needed partner is P − k, a complement lookup', 'Maps directly onto Two Sum (pairs in the prefix-sum array)'] }
  ],
  practice: [
    { name: 'Two Sum', lc: 'LeetCode 1', prompt: `<p>Return indices of the two numbers that add up to target. Exactly one solution.</p>`, hint: `<p>For each j, the partner is fully determined. Store value → index; look up before inserting.</p>`,
      solution: `<pre><code>public int[] twoSum(int[] nums, int target) {
    Map&lt;Integer, Integer&gt; idx = new HashMap&lt;&gt;();
    for (int j = 0; j &lt; nums.length; j++) {
        Integer i = idx.get(target - nums[j]);
        if (i != null) return new int[]{i, j};
        idx.put(nums[j], j);
    }
    return new int[0];
}</code></pre><p class="cx">O(n) time · O(n) space. Correct because every pair is detected at its right endpoint.</p>` },
    { name: 'Group Anagrams', lc: 'LeetCode 49', prompt: `<p>Group the strings that are anagrams of each other.</p>`, hint: `<p>Find a canonical key: identical for anagrams, different otherwise.</p>`,
      solution: `<pre><code>public List&lt;List&lt;String&gt;&gt; groupAnagrams(String[] strs) {
    Map&lt;String, List&lt;String&gt;&gt; g = new HashMap&lt;&gt;();
    for (String s : strs) {
        int[] cnt = new int[26];
        for (char c : s.toCharArray()) cnt[c - 'a']++;
        String key = Arrays.toString(cnt);
        g.computeIfAbsent(key, k -&gt; new ArrayList&lt;&gt;()).add(s);
    }
    return new ArrayList&lt;&gt;(g.values());
}</code></pre><p class="cx">O(n·k) time. The count signature is a normal form of the letter multiset.</p>` },
    { name: 'Subarray Sum Equals K', lc: 'LeetCode 560', prompt: `<p>Count contiguous subarrays summing to k. Values may be negative.</p>`, hint: `<p>sum(l..r) = P[r+1] − P[l]. For each prefix, how many earlier prefixes equal current − k?</p>`,
      solution: `<pre><code>public int subarraySum(int[] nums, int k) {
    Map&lt;Integer, Integer&gt; cnt = new HashMap&lt;&gt;();
    cnt.put(0, 1);
    int sum = 0, res = 0;
    for (int x : nums) {
        sum += x;
        res += cnt.getOrDefault(sum - k, 0);
        cnt.merge(sum, 1, Integer::sum);
    }
    return res;
}</code></pre><p class="cx">O(n) time · O(n) space. Sliding window fails because negatives break monotonicity.</p>` },
    { name: 'Longest Consecutive Sequence', lc: 'LeetCode 128', prompt: `<p>Length of the longest run of consecutive integers (in any order), in O(n).</p>`, hint: `<p>Put everything in a set. Only begin counting from x if x − 1 is absent.</p>`,
      solution: `<pre><code>public int longestConsecutive(int[] nums) {
    Set&lt;Integer&gt; s = new HashSet&lt;&gt;();
    for (int x : nums) s.add(x);
    int best = 0;
    for (int x : s) {
        if (s.contains(x - 1)) continue;          // not a run start
        int y = x;
        while (s.contains(y + 1)) y++;
        best = Math.max(best, y - x + 1);
    }
    return best;
}</code></pre><p class="cx">O(n): each number is walked by the inner while at most once, from its run's start (amortized, F04).</p>` }
  ]
});
