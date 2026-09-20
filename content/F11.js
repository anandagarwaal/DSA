COURSE.topic({
  id: 'F11',
  intro: `"HashMap is O(1)" is a rule. This topic is the mechanism behind it: buckets, collisions, load factor and resizing. Understanding the mechanism tells you <em>when</em> the rule holds (expected, amortized), when it breaks (adversarial keys, a bad hashCode), and when to skip the map entirely and use an array (placement: you had the bounded/unbounded idea but not the full criterion).`,
  kps: [
    {
      title: 'Key → hash → bucket index',
      teach: `
<p>A hash table is an <strong>array of buckets</strong>. To store a key:</p>
<div class="ex">
<div class="sub">Subgoal 1: hash</div>
<p><code>key.hashCode()</code> turns the key into an int. For Integer it's the value itself; for String it's computed from the characters.</p>
<div class="sub">Subgoal 2: squeeze into the array</div>
<p>index = hash mod (number of buckets). Java keeps the bucket count a power of 2, so it computes <code>hash &amp; (n − 1)</code>, the low bits (after mixing in the high bits).</p>
<div class="sub">Subgoal 3: go straight there</div>
<p>Array indexing is O(1) (F10). So <em>if</em> the bucket holds just a few entries, lookup is O(1). The whole design is about keeping buckets short.</p>
</div>
<p><strong>The contract that makes it work:</strong> if <code>a.equals(b)</code>, then <code>a.hashCode() == b.hashCode()</code>. Otherwise equal keys land in different buckets and <code>get</code> looks in the wrong place. Override <code>equals</code> without <code>hashCode</code> and your map silently "loses" keys.</p>`,
      qs: [
        { type: 'num', q: `16 buckets. Which bucket index does hash 37 map to? (37 mod 16)`, a: 5, why: '37 = 2 × 16 + 5. Equivalently 37 &amp; 15 = 5.' },
        { type: 'mcq', q: `A class overrides equals() but not hashCode(). What happens with map.put(k1, v) then map.get(k2), where k1.equals(k2)?`, opts: ['Probably null: k2 hashes elsewhere', 'Always v: equals is what counts', 'A compile-time error is raised', 'An exception at runtime occurs'], a: 0, why: 'Default hashCode is identity-based, so k2 most likely goes to a different bucket and equals is never even consulted.' },
        { type: 'free', q: `Why must equal keys have equal hash codes, but unequal keys are allowed to share a hash code?`, model: `<p>Lookup goes to the bucket chosen by the hash, then compares with equals only inside that bucket. If equal keys had different hashes, get would search the wrong bucket and never find the stored key. Unequal keys sharing a hash just land in the same bucket, and equals tells them apart there. That costs speed (a longer bucket), not correctness.</p>`, rubric: ['Lookup searches only the bucket chosen by the hash', 'Equal keys with different hashes lead to a wrong bucket, so the key is not found (correctness bug)', 'Unequal keys with the same hash just collide; equals separates them (only a speed cost)'] },
        { type: 'mcq', q: `Why does Java keep the number of buckets a power of 2?`, opts: ['hash mod n becomes a fast bitmask', 'Powers of 2 avoid all collisions', 'Memory is only sold in powers of 2', 'It makes the keys come out sorted'], a: 0, why: 'hash &amp; (n − 1) equals hash mod n when n is a power of 2. That\'s a single AND instead of a division.' }
      ]
    },
    {
      title: 'Collisions, chaining and the load factor',
      teach: `
<p>Different keys can land in the same bucket: a <strong>collision</strong>. Java handles it by <strong>chaining</strong>: each bucket holds a small linked list of entries.</p>
<figure class="fig"><svg viewBox="0 0 320 130" width="320" role="img" aria-label="buckets with chains">
<g transform="translate(10,10)" font-size="10">
<g style="fill:#fff;stroke:var(--ink)"><rect x="0" y="0" width="40" height="20"/><rect x="0" y="20" width="40" height="20"/><rect x="0" y="40" width="40" height="20"/><rect x="0" y="60" width="40" height="20"/><rect x="0" y="80" width="40" height="20"/></g>
<g style="fill:var(--code-bg);stroke:var(--accent)"><rect x="70" y="2" width="50" height="16"/><rect x="140" y="2" width="50" height="16"/><rect x="70" y="42" width="50" height="16"/><rect x="70" y="82" width="50" height="16"/><rect x="140" y="82" width="50" height="16"/><rect x="210" y="82" width="50" height="16"/></g>
<g style="stroke:var(--soft)"><line x1="40" y1="10" x2="70" y2="10"/><line x1="120" y1="10" x2="140" y2="10"/><line x1="40" y1="50" x2="70" y2="50"/><line x1="40" y1="90" x2="70" y2="90"/><line x1="120" y1="90" x2="140" y2="90"/><line x1="190" y1="90" x2="210" y2="90"/></g>
<text x="0" y="118" style="fill:var(--soft)">6 entries / 5 buckets = load factor 1.2</text></g></svg></figure>
<div class="ex">
<div class="sub">Cost of a lookup</div>
<p>Hash (O(1)) + walk the chain in that bucket. So the real cost is O(1 + chain length).</p>
<div class="sub">Load factor α = entries ÷ buckets</div>
<p>With a decent hash, keys spread out, and the <em>expected</em> chain length is about α. Keep α bounded by a constant and lookups stay O(1) expected. Java's default threshold is <strong>α = 0.75</strong>.</p>
<div class="sub">Why not a tiny α?</div>
<p>α = 0.1 means 90% empty buckets: wasted memory. 0.75 is a space/time compromise.</p>
</div>`,
      qs: [
        { type: 'num', q: `200 entries in 256 buckets. Load factor? (two decimals)`, a: 0.78, tol: 0.01, why: '200 / 256 ≈ 0.78, just over Java\'s 0.75 threshold. This table would already have resized.' },
        { type: 'mcq', q: `With a good hash function and load factor α, the expected cost of a lookup is…`, opts: ['O(1 + α)', 'O(log n)', 'O(α²)', 'O(n / α)'], a: 0, why: 'Hash to a bucket, then scan a chain of expected length about α.' },
        { type: 'free', q: `If the number of buckets were fixed at 16 forever, what would happen to lookup cost as n grows? Explain with the load factor.`, model: `<p>The load factor n/16 grows linearly with n, so average chains hold about n/16 entries. Lookup scans a chain, so it becomes O(n/16) = O(n): a linked-list search with a constant speed-up. A hash table only stays O(1) if the bucket count grows with n.</p>`, rubric: ['Load factor n/16 grows with n', 'Chain length, and therefore lookup cost, grows linearly: O(n)', 'Concludes the table must grow to keep α bounded'] },
        { type: 'mcq', q: `Which change most directly shortens average chains?`, opts: ['Increasing the number of buckets', 'Using a TreeMap for each key', 'Storing values as primitive ints', 'Sorting the keys before inserting'], a: 0, why: 'Chain length ≈ entries / buckets. More buckets means a lower α.' }
      ]
    },
    {
      title: 'Resizing keeps α bounded, amortized O(1)',
      teach: `
<p>When α passes the threshold, Java <strong>doubles</strong> the bucket array and <strong>rehashes</strong> every entry into its new bucket.</p>
<div class="ex">
<div class="sub">Worked example: Java defaults</div>
<p>Capacity 16, threshold 0.75 × 16 = 12. Inserting the 13th entry triggers a resize to 32 buckets (new threshold 24), rehashing all 13 entries.</p>
<div class="sub">Isn't a resize O(n)?</div>
<p>Yes, a single resize is O(n). But capacity <em>doubles</em>, so resizes happen at sizes 13, 25, 49, …, and the rehash work is a geometric series, less than about 2n in total. <strong>This is exactly F04's doubling argument.</strong> Inserts are O(1) amortized.</p>
<div class="sub">Putting both guarantees together</div>
<p>HashMap put/get = <strong>O(1) expected</strong> (from hashing spreading keys) and <strong>amortized</strong> (from occasional resizes). "HashMap is O(1)" is shorthand for both.</p>
</div>
<p>Interview tip: if you know n up front, <code>new HashMap&lt;&gt;(capacity)</code> avoids the resizes. Size it to n / 0.75 + 1.</p>`,
      qs: [
        { type: 'num', q: `Java HashMap, default capacity 16 and load factor 0.75. Inserting which entry (1st, 2nd, …) triggers the first resize?`, a: 13, why: 'Threshold = 12; Java resizes when size exceeds it, i.e. on the 13th insert.' },
        { type: 'mcq', q: `Why is HashMap's resize cost O(1) amortized rather than O(n) per insert?`, opts: ['Capacity doubles: copies form a geometric sum', 'Resizing only moves the newest entries', 'Rehashing is free on modern hardware', 'Java resizes on another thread'], a: 0, why: 'Same argument as ArrayList (F04): resize work 1 + 2 + 4 + … stays below a constant times n.' },
        { type: 'free', q: `"HashMap get is O(1)." List the two separate qualifiers hiding in that statement and what each one depends on.`, model: `<p>(1) Expected: short chains depend on the hash function spreading keys evenly. A bad or adversarial hash can pile keys into one bucket. (2) Amortized: occasional O(n) resizes are averaged over the inserts that caused them, which depends on capacity growing geometrically (doubling). For get alone it's the expected qualifier; for put, both apply.</p>`, rubric: ['Expected (probabilistic): relies on a good hash spreading keys', 'Amortized: relies on geometric (doubling) resizing spreading the rehash cost', 'Associates each qualifier with its cause'] },
        { type: 'num', q: `You'll insert 1,000 keys. Smallest initial capacity that avoids any resize, assuming load factor 0.75 (Java rounds up to a power of 2)?`, a: 2048, why: 'Need 1000 ≤ 0.75 × cap, so cap ≥ 1334; the next power of 2 is 2048 (1024 × 0.75 = 768 would be too small).' }
      ]
    },
    {
      title: 'Expected vs worst case: when O(1) breaks',
      teach: `
<p>Expected O(1) assumes keys spread out. If many keys share a bucket, a lookup walks a long chain.</p>
<div class="ex">
<div class="sub">Worst case</div>
<p>All n keys in one bucket: lookup is O(n). Two ways this happens: (1) a <strong>bad hashCode</strong> (e.g. always returning 1, or hashing a point by x only when x is always 0), or (2) an <strong>adversary</strong> who knows the hash function and sends colliding keys (hash-flooding DoS attacks on web servers).</p>
<div class="sub">Java's defence</div>
<p>Since Java 8, a bucket with ≥ 8 entries (in a table of ≥ 64 buckets) is converted into a <strong>red-black tree</strong>, so a bad bucket costs O(log n) instead of O(n), provided keys are Comparable.</p>
<div class="sub">Interview phrasing</div>
<p>"O(1) average, O(n) worst case with pathological collisions, O(log n) worst in Java 8+ with tree bins." That one sentence shows you know what's underneath.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `A Point class's hashCode returns x. All points have x = 0. HashMap lookups become…`, opts: ['O(n) chains (O(log n) if treeified)', 'Still O(1), since equals is fast', 'O(1) after the first resize', 'An error at insertion time'], a: 0, why: 'Every key hashes to the same bucket. Resizing does not help: they still collide.' },
        { type: 'mcq', q: `Why doesn't resizing fix the "all hashCodes equal" problem?`, opts: ['Equal hashes still share a bucket', 'Resizing is capped at 16 buckets', 'Resizing sorts the chain instead', 'It does fix it, after two resizes'], a: 0, why: 'hash &amp; (n − 1) is identical for identical hashes, whatever n is.' },
        { type: 'free', q: `Give the precise complexity statement for HashMap.get in Java 8+, covering average and worst case, and explain the worst case.`, model: `<p>Average/expected O(1) with a good hash and bounded load factor. Worst case: if many keys collide into one bucket, the lookup scans them. Java 8+ turns large buckets (≥ 8 entries, table ≥ 64) into balanced trees, so the worst case is O(log n) when keys are Comparable, and O(n) otherwise.</p>`, rubric: ['States O(1) expected under a good hash', 'Worst case comes from many keys colliding into one bucket', 'Mentions Java 8 treeified bins give O(log n) worst case (O(n) if not Comparable/pre-Java 8)'] },
        { type: 'mcq', q: `Which is a sensible hashCode for a class with fields int a, int b?`, opts: ['return 31 * a + b;', 'return a;', 'return a + b;', 'return 42;'], a: 0, why: '31a + b mixes both fields so distinct pairs rarely collide. "a" ignores b; "a + b" collides (1,2) with (2,1); 42 puts everything in one bucket.' }
      ]
    },
    {
      title: 'When an array beats a hash map',
      teach: `
<p>This is the part of the placement question you missed. The criterion is <strong>density</strong>: are the possible keys a small range that's mostly used?</p>
<div class="ex">
<div class="sub">Use an array when…</div>
<p>Keys are integers (or map directly to integers) in a <strong>bounded, dense</strong> range, like 26 letters, 128 ASCII chars, or values 0..10⁵ with n ≈ 10⁵. Index = key. No hashing, no boxing (F10), contiguous memory, so faster and smaller.</p>
<div class="sub">Use a hash map when…</div>
<p>Keys are <strong>sparse or unbounded</strong>: 10⁵ values spread over −10⁹..10⁹, or strings, or objects. An array would need 2 × 10⁹ slots, almost all empty.</p>
<div class="sub">The decision in one line</div>
<p>Range of possible keys vs number of keys actually used. If the range is small (or not much bigger than n), use an array. If the range is far bigger than n, use a map.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Count occurrences of values in an array of 10⁵ ints, each in 0..1000. Best?`, opts: ['int[1001] indexed by value', 'HashMap from Integer to Integer', 'TreeMap from Integer to Integer', 'Sort, then count equal runs'], a: 0, why: 'Dense, bounded range: 1001 slots, direct indexing, no boxing.' },
        { type: 'mcq', q: `Count occurrences of 10⁵ ints spread over −10⁹..10⁹. Best?`, opts: ['HashMap from Integer to Integer', 'int[2 × 10⁹ + 1] indexed array', 'int[10⁵] indexed by value mod 10⁵', 'A boolean[] of the full range'], a: 0, why: 'Sparse: an array would need about 8 GB for a range of 2 × 10⁹. The mod idea collides keys and gives wrong counts.' },
        { type: 'free', q: `State the decision rule for array vs hash map for counting, and explain what goes wrong on each side of the line.`, model: `<p>Compare the range of possible keys R to the number of keys n. If R is small or comparable to n (dense), use an array indexed by key: faster (no hashing/boxing, contiguous) and smaller. If R ≫ n (sparse), use a hash map. An array of size R would waste memory (mostly empty) and may not even fit. Using a map for a dense small range works, but pays hashing, boxing and memory overhead for nothing.</p>`, rubric: ['Criterion compares key range R to number of keys n (density)', 'Dense/small range: array is faster and smaller (no hashing, boxing; contiguous)', 'Sparse/huge range: array wastes memory or does not fit, so use a map'] },
        { type: 'mcq', q: `Keys are lowercase words; you need counts. Can you use an array?`, opts: ['No: the key space is sparse and huge', 'Yes: index by the first letter only', 'Yes: index each word by its length', 'Yes: index by hashCode() directly'], a: 0, why: 'Words are unbounded strings; any shortcut index merges different words. Use HashMap&lt;String,Integer&gt;.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `An interviewer asks: "Why is HashMap lookup O(1)?" Give the full answer a Staff engineer would give, in 4–5 sentences.`, model: `<p>The key's hashCode picks a bucket in an array, so we jump there in O(1). The bucket holds a chain of entries that collided; with a good hash and the load factor kept below a constant (0.75), the expected chain length is O(1). Keeping α bounded requires doubling the table and rehashing, which is O(n) occasionally but O(1) amortized by the geometric-series argument. Worst case, many colliding keys make a bucket long: O(n), or O(log n) in Java 8+ once a bucket becomes a tree. So it's O(1) expected and amortized, not worst-case.</p>`, rubric: ['Hash → bucket index → O(1) array access', 'Bounded load factor gives expected O(1) chain length', 'Resizing by doubling is amortized O(1)', 'States the worst case (collisions) and Java 8 tree bins'] },
    { type: 'num', q: `A HashMap with 64 buckets. Which bucket does hash 200 go to? (200 &amp; 63)`, a: 8, why: '200 = 3 × 64 + 8.' },
    { type: 'mcq', q: `Two-sum on an unsorted array with values in −10⁹..10⁹. To find complements, use…`, opts: ['A HashMap from value to index', 'An int array indexed by value', 'A boolean array indexed by value', 'A bitmask over the value range'], a: 0, why: 'Sparse, huge range: a map. (Arrays would need about 2 × 10⁹ slots.)' },
    { type: 'mcq', q: `After a HashMap doubles from 16 to 32 buckets, an entry previously in bucket 5 ends up in…`, opts: ['Bucket 5 or bucket 21', 'Bucket 10 or bucket 11', 'Any bucket, chosen at random', 'Always bucket 5 again'], a: 0, why: 'Transfer: the new index uses one more bit of the hash, so it is either the old index or old + 16. (Java exploits this to split chains cheaply.)' },
    { type: 'free', q: `A web service stores request parameters in a HashMap&lt;String,String&gt;. Explain the hash-flooding attack and why Java 8's tree bins limit the damage.`, model: `<p>An attacker who knows String.hashCode can craft many parameter names with the same hash. They all land in one bucket, so each insert/lookup scans a long chain: O(n) per operation and O(n²) for the request, which burns CPU (a DoS). Java 8 converts a bucket with ≥ 8 entries into a balanced tree, so operations in that bucket cost O(log n) and the total becomes about O(n log n), which is no longer catastrophic.</p>`, rubric: ['Attacker crafts keys with identical hashes, so everything lands in one bucket', 'Per-operation cost degrades to O(n), total O(n²): CPU exhaustion', 'Tree bins bound bucket operations to O(log n)'] },
    { type: 'mcq', q: `n ≈ 10⁶ keys that are ints in 0..10⁶. Which is likely fastest for membership tests?`, opts: ['boolean[10⁶ + 1]', 'HashSet&lt;Integer&gt;', 'TreeSet&lt;Integer&gt;', 'A sorted ArrayList'], a: 0, why: 'Dense range (range ≈ n): a direct-indexed array, about 1 MB, no hashing or boxing.' }
  ]
});
