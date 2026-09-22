COURSE.topic({
  id: 'P32',
  intro: `A hash set answers "is this exact word present?" A <strong>trie</strong> answers "is any word here a prefix of this?", "how many words start with this?", "which stored number maximises the XOR with this one?" It stores a set of sequences as a tree where <em>shared prefixes share a path</em>, so the branching happens exactly where the words differ.`,
  kps: [
    {
      title: 'A node is a branch, not a stored key',
      teach: `
<p>The key point that trips people up: <strong>no node stores a word</strong>. A word is the path from the root, and a boolean marks where a word ends.</p>
<pre><code>class TrieNode {
    TrieNode[] next = new TrieNode[26];    // one slot per next character
    boolean isWord;                        // a word ends here
}</code></pre>
<figure class="fig"><svg viewBox="0 0 330 140" width="330" role="img" aria-label="trie storing car, cat, cap, do">
<g font-size="11" text-anchor="middle">
<g style="stroke:var(--soft)"><line x1="120" y1="18" x2="80" y2="45"/><line x1="120" y1="18" x2="250" y2="45"/>
<line x1="80" y1="45" x2="80" y2="72"/><line x1="80" y1="72" x2="40" y2="105"/><line x1="80" y1="72" x2="80" y2="105"/><line x1="80" y1="72" x2="120" y2="105"/>
<line x1="250" y1="45" x2="250" y2="105"/></g>
<g style="fill:var(--accent)"><circle cx="120" cy="18" r="9"/><circle cx="80" cy="45" r="9"/><circle cx="80" cy="72" r="9"/><circle cx="250" cy="45" r="9"/></g>
<g style="fill:var(--good)"><circle cx="40" cy="105" r="9"/><circle cx="80" cy="105" r="9"/><circle cx="120" cy="105" r="9"/><circle cx="250" cy="105" r="9"/></g>
<g style="fill:#fff"><text x="80" y="49">c</text><text x="80" y="76">a</text><text x="40" y="109">r</text><text x="80" y="109">t</text><text x="120" y="109">p</text><text x="250" y="49">d</text><text x="250" y="109">o</text></g>
<text x="165" y="132" style="fill:var(--soft)" font-size="10">car, cat, cap share "ca"; green = end of a word</text></g></svg></figure>
<div class="ex">
<div class="sub">Insert and search</div>
<p>Walk one node per character, creating missing children on insert. Both cost <strong>O(L)</strong> for a word of length L, independent of how many words are stored.</p>
<div class="sub">Three different questions</div>
<p><code>search("cat")</code>: walk and check <code>isWord</code>. <code>startsWith("ca")</code>: walk and check the node exists. <code>countWordsWithPrefix</code>: store a counter in each node, incremented on insert.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Where is the word "cat" stored in a trie?`, opts: ['Along the path c → a → t, flagged', 'In the leaf node, as a string', 'In a word list kept at the root', 'In a hash set beside the trie'], a: 0, why: 'The path is the word; a boolean marks a valid ending.' },
        { type: 'mcq', q: `Trie holding "car", "cat", "cap". How many nodes below the root?`, opts: ['5: c, a, r, t, p', '9: three words of three', '3: one per word', '26: one per letter'], a: 0, why: 'The shared prefix "ca" is stored once, then three branches.' },
        { type: 'num', q: `Searching for a word of length 12 in a trie holding 10⁶ words. How many node steps?`, a: 12, why: 'One per character: the number of stored words is irrelevant.' },
        { type: 'free', q: `Why does <code>search("cat")</code> need the isWord flag when the path already exists?`, model: `<p>The path can exist because a <em>longer</em> word was inserted: after inserting only "cats", the path c → a → t exists although "cat" was never stored. Without a flag the search would wrongly report a match. isWord distinguishes "this is a stored word" from "this is merely a prefix of one", which is exactly the difference between search and startsWith.</p>`, rubric: ['The path may exist only because a longer word was inserted', 'Gives the concrete case ("cats" makes the "cat" path exist)', 'The flag separates a stored word from a mere prefix'] }
      ]
    },
    {
      title: 'Costs: where a trie wins and loses',
      teach: `
<div class="ex">
<div class="sub">Versus a hash set</div>
<table><tr><th>operation</th><th>hash set</th><th>trie</th></tr>
<tr><td>exact lookup</td><td>O(L) to hash, O(1) expected</td><td>O(L)</td></tr>
<tr><td>prefix query</td><td>O(n · L): scan everything</td><td>O(L)</td></tr>
<tr><td>list words with a prefix</td><td>O(n · L)</td><td>O(L + output)</td></tr>
<tr><td>memory</td><td>the strings themselves</td><td>a node per distinct prefix</td></tr></table>
<div class="sub">The memory cost</div>
<p>An array-of-26 per node is 26 references ≈ 104–208 bytes <em>per node</em>, whatever the fan-out actually used. For sparse tries (long words, few shared prefixes), a <code>HashMap&lt;Character, Node&gt;</code> per node is smaller but slower; picking between them is a real trade-off worth mentioning.</p>
<div class="sub">When a trie wins</div>
<p>Prefix questions (autocomplete, "does any word start with this?"), many queries against one fixed dictionary, and word searches on a grid where a whole branch can be pruned the moment a prefix has no words.</p>
<div class="sub">When it loses</div>
<p>Exact-membership only, with no prefix structure: a hash set is simpler and lighter. Very long strings with no shared prefixes waste a node per character.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `n words in a hash set. "How many start with this prefix?" costs…`, opts: ['O(n · L): every word must be checked', 'O(1) expected, like a lookup', 'O(L) with the right hash', 'O(log n) if the set is sorted'], a: 0, why: 'Hashing destroys prefix structure: there is no way to enumerate by prefix without scanning.' },
        { type: 'mcq', q: `Memory concern with array-of-26 trie nodes?`, opts: ['26 references per node, mostly unused', 'Nodes cannot be garbage collected', 'Every node stores the full word', 'Java caps arrays at 26 elements'], a: 0, why: 'For sparse data a HashMap per node trades speed for space.' },
        { type: 'num', q: `Inserting "abcdef" into an empty trie. How many nodes are created?`, a: 6, why: 'One per character; no prefix is shared yet.' },
        { type: 'free', q: `Word Search II (find which of many words appear in a grid). Why does a trie beat running the single-word search once per word?`, model: `<p>Per-word search re-explores the grid for every word: O(W · R · C · 3^L). With a trie of all the words, one DFS from each cell walks the grid and the trie together, and the moment the current path is not a prefix of any word the branch is abandoned. Words with shared prefixes are explored once rather than repeatedly, and the pruning is immediate rather than after a full failed search. The cost becomes roughly O(R · C · 3^L) once, plus the trie build.</p>`, rubric: ['Per-word search repeats the grid exploration W times', 'One DFS carries the whole dictionary via the trie; shared prefixes explored once', 'Missing prefix prunes the branch immediately'] }
      ]
    },
    {
      title: 'Bit trie: maximum XOR pair',
      teach: `
<p>Numbers are sequences too: read a 32-bit int as a string of bits, most significant first, and the trie has fan-out 2.</p>
<div class="ex">
<div class="sub">The greedy</div>
<p>XOR is maximised bit by bit from the top: to beat everything else, you want the highest bit to differ. So walk the trie taking the <strong>opposite</strong> bit when that child exists, and the same bit otherwise.</p>
<pre><code>int maxXor(int x) {                       // best XOR of x with anything inserted
    TrieNode node = root;
    int best = 0;
    for (int b = 31; b &gt;= 0; b--) {
        int bit = (x &gt;&gt; b) &amp; 1;
        int want = bit ^ 1;               // prefer the opposite bit
        if (node.next[want] != null) { best |= 1 &lt;&lt; b; node = node.next[want]; }
        else node = node.next[bit];
    }
    return best;
}</code></pre>
<div class="sub">Why greedy is right here</div>
<p>A single higher bit outweighs every lower bit combined (F03's geometric series: 2ᵏ &gt; 2ᵏ⁻¹ + … + 1). So securing the highest possible bit can never be regretted, whatever it costs below: an exchange argument (P17).</p>
<div class="sub">Worked example</div>
<p>[3, 10, 5, 25, 2, 8]: the best pair is 5 ^ 25 = <strong>28</strong>. Brute force is O(n²); the trie gives O(32n).</p>
</div>`,
      qs: [
        { type: 'num', q: `Maximum XOR of any two numbers in [3, 10, 5, 25, 2, 8]?`, a: 28, why: '5 ^ 25 = 28.' },
        { type: 'mcq', q: `Why walk to the opposite bit when possible?`, opts: ['A high bit beats all lower bits together', 'It keeps the trie automatically balanced', 'Opposite bits are always inserted first', 'XOR needs differing bits to work at all'], a: 0, why: '2ᵏ &gt; 2ᵏ⁻¹ + … + 1 (F03), so the highest achievable bit dominates the outcome.' },
        { type: 'num', q: `How many trie levels does a bit trie over 32-bit ints have?`, a: 32, why: 'One per bit, so every query is 32 steps: O(1) in practice.' },
        { type: 'free', q: `Prove the greedy bit choice is optimal for maximum XOR.`, model: `<p>Process bits from the most significant. Suppose at bit position k the opposite child exists, so a result with bit k set is achievable. Any candidate that does not set bit k is at most 2ᵏ − 1 in its remaining value, while setting it guarantees at least 2ᵏ; since 2ᵏ &gt; 2ᵏ⁻¹ + … + 1, the choice cannot be beaten by anything the lower bits do. So taking the opposite child whenever it exists is safe at every level: the exchange argument of P17, applied bit by bit.</p>`, rubric: ['Consider bits from the most significant downward', 'Setting bit k beats every combination of lower bits (2ᵏ &gt; sum below)', 'So the greedy choice is safe at each level'] }
      ]
    },
    {
      title: 'Variants worth recognising',
      teach: `
<div class="ex">
<div class="sub">Counts in nodes</div>
<p>Store <code>passCount</code> (words through this node) and <code>endCount</code> (words ending here). That supports "how many words have this prefix?", deletion (decrement on the way down), and "count numbers in the set that XOR with x to at least k".</p>
<div class="sub">Compressed (radix) tries</div>
<p>Chains with no branching collapse into one edge holding a whole substring. Saves memory for sparse dictionaries; the algorithms are the same with an extra substring comparison per edge.</p>
<div class="sub">Where the interview usually goes</div>
<p>Implement Trie (LeetCode 208), Word Search II (212), Maximum XOR of Two Numbers (421), Replace Words (648), Design Search Autocomplete. All are the same structure with a different question hanging off the nodes.</p>
<div class="sub">The discrimination</div>
<p>Prefix queries over a fixed dictionary → trie. One pattern in one text → KMP (P31). Arbitrary substring comparisons → hashing (P30). Exact membership only → hash set (F11).</p>
</div>`,
      qs: [
        { type: 'mcq', q: `"How many stored words start with 'app'?" needs…`, opts: ['A pass-count in each node', 'A full DFS of the subtree', 'The isWord flag alone', 'A separate hash map'], a: 0, why: 'Incremented on insert, it answers in O(L) with no subtree walk.' },
        { type: 'mcq', q: `Replace Words: replace each word by the shortest stored root that prefixes it. The trie walk should…`, opts: ['Stop at the first isWord node', 'Always walk to the deepest node', 'Collect every matching root', 'Restart from the root each letter'], a: 0, why: 'The first flag on the path is the shortest root; continuing would find longer ones.' },
        { type: 'num', q: `Trie storing "app", "apple", "apply". How many nodes have isWord set?`, a: 3, why: 'One per stored word, even though they share the "app" path.' },
        { type: 'free', q: `Why is a trie a natural fit for autocomplete, and what would you store in each node to make it fast?`, model: `<p>Typing is prefix extension, which is exactly walking one edge per character, so the candidate set after each keystroke is the subtree below the current node: O(1) work per keystroke to move, and no rescanning of the dictionary. To make suggestions fast, store in each node the top k completions (or their scores/frequencies) so a query returns them immediately instead of walking the subtree; a pass-count also gives "how many matches" instantly. The trade is extra memory and more work at insert time.</p>`, rubric: ['Each keystroke moves one edge; candidates are the current subtree', 'Cache top-k completions (or counts/frequencies) per node for instant answers', 'Trade-off: more memory / insert work'] }
      ]
    }
  ],
  quiz: [
    { type: 'num', q: `Trie holding "car", "cat", "cap", "do". Total nodes below the root?`, a: 7, why: 'c, a, r, t, p (5) plus d, o (2).' },
    { type: 'free', q: `<strong>Transfer.</strong> "Count pairs (i, j) whose XOR is less than a limit", n up to 10⁵. Sketch a bit-trie approach.`, model: `<p>Insert numbers into a bit trie one at a time; before inserting a[i], query how many already-inserted values XOR with it to less than the limit. Walk the bits from the top: at bit b, if the limit's bit is 1, then choosing a child whose XOR bit is 0 makes the result strictly smaller from here on, so add that entire subtree's count (stored per node) and continue down the other child; if the limit's bit is 0, only the child with XOR bit 0 can still stay below, so follow it. That's O(32) per query, O(32n) overall, versus O(n²) brute force.</p>`, rubric: ['Bit trie with a count in each node', 'At each bit, compare against the limit\'s bit to add a whole subtree or descend', 'O(32n) instead of O(n²)'] },
    { type: 'mcq', q: `A trie of n words each of length L. Worst-case node count?`, opts: ['O(n · L), if no prefixes are shared', 'O(n), regardless of word length', 'O(L), regardless of word count', 'O(26ᴸ) in every possible case'], a: 0, why: 'With no shared prefixes every character gets its own node; sharing is what saves space.' },
    { type: 'num', q: `Maximum XOR pair in [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]?`, a: 127, why: 'The trie greedy finds 36 ^ 91 = 127, the maximum possible for 7-bit values.' },
    { type: 'free', q: `Compare a trie with a hash set on: exact lookup, prefix queries and memory. When would you still pick the hash set?`, model: `<p>Exact lookup: both are O(L) in practice (hashing reads the whole key anyway), with the hash set usually faster by a constant. Prefix queries: the trie is O(L) while the hash set must scan all n words, which is the decisive difference. Memory: the trie pays a node per distinct prefix (an array of 26 references each, unless you use maps), so it can be far larger than storing the strings; shared prefixes are what recover the cost. Pick the hash set when only exact membership matters, or when the dictionary is large and prefixes are barely shared.</p>`, rubric: ['Exact lookup comparable; hash set usually a smaller constant', 'Prefix queries: trie O(L) vs hash set O(n·L): the deciding factor', 'Trie memory per node; choose the hash set for exact-only or unshared prefixes'] }
  ],
  practice: [
    { name: 'Implement Trie', lc: 'LeetCode 208', prompt: `<p>Support insert, search and startsWith.</p>`, hint: `<p>search checks isWord; startsWith only checks the node exists.</p>`,
      solution: `<pre><code>class Trie {
    private static class Node {
        Node[] next = new Node[26];
        boolean isWord;
    }
    private final Node root = new Node();

    public void insert(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.next[i] == null) cur.next[i] = new Node();
            cur = cur.next[i];
        }
        cur.isWord = true;
    }
    public boolean search(String word) {
        Node n = walk(word);
        return n != null &amp;&amp; n.isWord;
    }
    public boolean startsWith(String prefix) { return walk(prefix) != null; }

    private Node walk(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.next[c - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}</code></pre><p class="cx">O(L) per operation; memory O(total distinct prefixes).</p>` },
    { name: 'Maximum XOR of Two Numbers in an Array', lc: 'LeetCode 421', prompt: `<p>Maximum a[i] ^ a[j] over all pairs, in better than O(n²).</p>`, hint: `<p>Bit trie, most significant bit first; prefer the opposite bit.</p>`,
      solution: `<pre><code>public int findMaximumXOR(int[] nums) {
    Node root = new Node();
    for (int x : nums) insert(root, x);
    int best = 0;
    for (int x : nums) best = Math.max(best, query(root, x));
    return best;
}
private static class Node { Node[] next = new Node[2]; }

private void insert(Node root, int x) {
    Node cur = root;
    for (int b = 31; b &gt;= 0; b--) {
        int bit = (x &gt;&gt;&gt; b) &amp; 1;
        if (cur.next[bit] == null) cur.next[bit] = new Node();
        cur = cur.next[bit];
    }
}
private int query(Node root, int x) {
    Node cur = root;
    int best = 0;
    for (int b = 31; b &gt;= 0; b--) {
        int bit = (x &gt;&gt;&gt; b) &amp; 1, want = bit ^ 1;
        if (cur.next[want] != null) { best |= 1 &lt;&lt; b; cur = cur.next[want]; }
        else cur = cur.next[bit];
    }
    return best;
}</code></pre><p class="cx">O(32n) time and O(32n) nodes.</p>` },
    { name: 'Word Search II', lc: 'LeetCode 212', prompt: `<p>Find which of the given words appear in the grid (adjacent cells, no reuse).</p>`, hint: `<p>Walk the grid and the trie together; abandon a branch when the prefix has no words.</p>`,
      solution: `<pre><code>public List&lt;String&gt; findWords(char[][] board, String[] words) {
    Node root = new Node();
    for (String w : words) {                       // build the dictionary trie
        Node cur = root;
        for (char c : w.toCharArray()) {
            int i = c - 'a';
            if (cur.next[i] == null) cur.next[i] = new Node();
            cur = cur.next[i];
        }
        cur.word = w;
    }
    List&lt;String&gt; res = new ArrayList&lt;&gt;();
    for (int r = 0; r &lt; board.length; r++)
        for (int c = 0; c &lt; board[0].length; c++)
            dfs(board, r, c, root, res);
    return res;
}
private static class Node { Node[] next = new Node[26]; String word; }

private void dfs(char[][] b, int r, int c, Node node, List&lt;String&gt; res) {
    if (r &lt; 0 || c &lt; 0 || r &gt;= b.length || c &gt;= b[0].length) return;
    char ch = b[r][c];
    if (ch == '#') return;
    Node nxt = node.next[ch - 'a'];
    if (nxt == null) return;                        // no word has this prefix: prune
    if (nxt.word != null) { res.add(nxt.word); nxt.word = null; }   // found, avoid duplicates
    b[r][c] = '#';                                  // choose
    dfs(b, r + 1, c, nxt, res); dfs(b, r - 1, c, nxt, res);
    dfs(b, r, c + 1, nxt, res); dfs(b, r, c - 1, nxt, res);
    b[r][c] = ch;                                   // un-choose (P11)
}</code></pre><p class="cx">One grid walk carries the whole dictionary; missing prefixes prune immediately.</p>` }
  ]
});
