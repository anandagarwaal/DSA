COURSE.topic({
  id: 'F10',
  intro: `In placement you missed boxing and cache locality when comparing hashing to arrays. Big-O treats every memory access as the same, but real machines don't. This topic is the small amount of machine knowledge that explains <em>why</em> an array is O(1) to index, why a linked list isn't, and why <code>HashMap&lt;Integer, Integer&gt;</code> can be several times slower than an <code>int[]</code> at the same Big-O.`,
  kps: [
    {
      title: 'An array is contiguous: address = base + i × size',
      teach: `
<p>An <code>int[]</code> is one unbroken block of memory. Each int takes 4 bytes, one after another.</p>
<figure class="fig"><svg viewBox="0 0 340 80" width="340" role="img" aria-label="contiguous int array">
<g transform="translate(10,14)" font-size="11" text-anchor="middle">
<rect x="0" y="0" width="300" height="30" style="fill:none;stroke:var(--ink)"/>
<line x1="60" y1="0" x2="60" y2="30" style="stroke:var(--ink)"/><line x1="120" y1="0" x2="120" y2="30" style="stroke:var(--ink)"/><line x1="180" y1="0" x2="180" y2="30" style="stroke:var(--ink)"/><line x1="240" y1="0" x2="240" y2="30" style="stroke:var(--ink)"/>
<text x="30" y="20">a[0]</text><text x="90" y="20">a[1]</text><text x="150" y="20">a[2]</text><text x="210" y="20">a[3]</text><text x="270" y="20">a[4]</text>
<text x="0" y="46" style="fill:var(--soft)">1000</text><text x="60" y="46" style="fill:var(--soft)">1004</text><text x="120" y="46" style="fill:var(--soft)">1008</text><text x="180" y="46" style="fill:var(--soft)">1012</text><text x="240" y="46" style="fill:var(--soft)">1016</text></g>
<text x="170" y="76" text-anchor="middle" font-size="11" style="fill:var(--soft)">addresses (bytes): a[i] lives at 1000 + 4·i</text></svg></figure>
<div class="ex">
<div class="sub">Why indexing is O(1)</div>
<p>To find a[i], the machine computes base + 4·i, one multiply and one add, and reads that address. It doesn't matter whether i is 3 or 3 million. <strong>No searching.</strong></p>
<div class="sub">Why inserting in the middle is O(n)</div>
<p>The block has no gaps. To insert at position k, every element from k onwards must shift one slot right to make room. Same for deleting.</p>
<div class="sub">Why the size is fixed</div>
<p>The memory just past the block may belong to something else, so an array can't grow in place. <code>ArrayList</code> grows by allocating a bigger block and copying (F04).</p>
</div>`,
      qs: [
        { type: 'num', q: `An int[] starts at address 2000. At what address is a[25]? (4-byte ints)`, a: 2100, why: '2000 + 4 × 25 = 2100: one multiply and one add, whatever the index.' },
        { type: 'mcq', q: `Why is inserting at index 0 of an ArrayList with n elements O(n)?`, opts: ['All n elements shift one slot right', 'It must first search for index 0', 'It always reallocates the array', 'Java checks every element for null'], a: 0, why: 'Contiguous storage has no gaps; making room at the front moves everything.' },
        { type: 'free', q: `Explain why a[i] is O(1) for an array but "get the i-th node" is O(i) for a linked list. Refer to where the elements live in memory.`, model: `<p>Array elements sit in one contiguous block at equal spacing, so the address of element i is computed directly: base + i × size, which is constant work. Linked-list nodes are scattered anywhere in memory; the only way to find node i is to start at the head and follow i next-pointers, since you can't compute its address.</p>`, rubric: ['Array: contiguous and equal-sized, so the address is computed by arithmetic', 'List: nodes scattered; the address is only discoverable by following pointers one by one'] },
        { type: 'mcq', q: `Removing the <em>last</em> element of an ArrayList costs…`, opts: ['O(1): nothing after it needs to shift', 'O(n): all elements shift to the left', 'O(log n): a binary search is needed', 'O(n): the array must be copied'], a: 0, why: 'Shifting cost = number of elements after the removed position, which is zero here.' }
      ]
    },
    {
      title: 'A linked node is a separate object behind a pointer',
      teach: `
<pre><code>class Node { int val; Node next; }</code></pre>
<p>Each node is its own object, allocated wherever the memory manager finds space. <code>next</code> holds the <em>address</em> of the following node.</p>
<div class="ex">
<div class="sub">What that buys</div>
<p>Inserting after a node you already hold is O(1): create a node and rewire two pointers. Nothing shifts, because nothing is laid out in order.</p>
<div class="sub">What it costs</div>
<p>(1) No indexing: reaching node i means following i pointers. (2) Memory: each node carries an object header (~12–16 bytes in Java) plus the next reference (4–8 bytes), so a list of ints can take 5–6× the memory of an int[].</p>
<div class="sub">The trade in one line</div>
<p><strong>Arrays: fast to find, slow to rearrange. Linked lists: slow to find, fast to rearrange once you're there.</strong></p>
</div>`,
      qs: [
        { type: 'mcq', q: `You hold a reference to node p. Cost to insert a new node right after p?`, opts: ['O(1): rewire two pointers', 'O(n): shift the later nodes', 'O(log n): find the slot first', 'O(n): copy the list over'], a: 0, why: 'newNode.next = p.next; p.next = newNode. No shifting, since order is stored in pointers, not positions.' },
        { type: 'mcq', q: `Why is LinkedList.add(i, x) in Java still O(n) in general?`, opts: ['It must walk to position i first', 'It shifts all later elements right', 'It copies the list into a new array', 'It sorts the list after inserting'], a: 0, why: 'The rewiring is O(1), but finding position i means following up to n/2 pointers.' },
        { type: 'free', q: `A colleague says "linked lists are better for inserts, so use LinkedList for a list we insert into at random positions." Evaluate.`, model: `<p>Misleading. The O(1) insert only applies once you already hold the node. For a random position you must first walk to it, which is O(n), the same as ArrayList's O(n) shift. In practice ArrayList usually wins anyway: shifting is a fast contiguous memory copy, while walking a list chases pointers across memory (cache misses) and uses more memory per element.</p>`, rubric: ['Points out that finding the position is O(n) for a linked list', 'So both are O(n) for random-position inserts', 'Notes the practical edge of arrays (contiguous copy / cache) or the extra memory of nodes'] },
        { type: 'mcq', q: `Which operation is O(1) for a singly linked list but O(n) for an array?`, opts: ['Insert at the front', 'Read the i-th element', 'Read the last element', 'Binary search by value'], a: 0, why: 'New head: newNode.next = head. An array would shift everything.' }
      ]
    },
    {
      title: 'Java boxing: int vs Integer',
      teach: `
<p>Java collections (<code>HashMap</code>, <code>ArrayList</code>, <code>HashSet</code>) can only hold <strong>objects</strong>. A primitive <code>int</code> gets <em>boxed</em> into an <code>Integer</code> object automatically.</p>
<div class="ex">
<div class="sub">What an Integer costs</div>
<p>An <code>int</code> is 4 bytes stored inline. An <code>Integer</code> is a separate heap object (~16 bytes) plus a 4–8 byte reference to it. <code>ArrayList&lt;Integer&gt;</code> of n items is an array of <em>references</em> to scattered Integer objects.</p>
<div class="sub">What a HashMap entry costs</div>
<p>Each <code>HashMap&lt;Integer,Integer&gt;</code> entry is a Node object (hash, key ref, value ref, next ref: ~32 bytes) plus two boxed Integers (~32 bytes), roughly <strong>60–80 bytes to store two ints</strong> (8 bytes of data).</p>
<div class="sub">The == trap</div>
<p><code>Integer a = 1000, b = 1000; a == b</code> is <strong>false</strong>: == compares references, and only −128..127 are cached as shared objects. Use <code>a.equals(b)</code>, or unbox. This bites in <code>map.get(x) == map.get(y)</code>.</p>
</div>
<p>This is why "count letters" should use <code>int[26]</code>, not a HashMap: same Big-O, but no boxing, no hashing, and a few cache lines instead of scattered objects.</p>`,
      qs: [
        { type: 'mcq', q: `<code>Integer a = 500, b = 500;</code> What does <code>a == b</code> evaluate to?`, opts: ['false: two different objects', 'true: the values are equal', 'true: all Integers are cached', 'Compile error: cannot compare'], a: 0, why: 'Only −128..127 are cached. 500 creates two objects; == compares references.' },
        { type: 'mcq', q: `Counting frequencies of lowercase letters in a 10⁶-char string. Best structure?`, opts: ['An int[26] indexed by c − \'a\'', 'A HashMap from Character to Integer', 'A TreeMap from Character to Integer', 'An ArrayList of 26 Integer counts'], a: 0, why: 'Bounded key range (26): an array index replaces hashing and avoids boxing every count update.' },
        { type: 'free', q: `Both int[] counts and HashMap&lt;Integer,Integer&gt; counts are O(1) per update. Why is the array typically several times faster? Give at least two concrete reasons.`, model: `<p>(1) No boxing: each HashMap update unboxes, adds, and boxes a new Integer (allocating objects for values over 127). (2) No hashing: the map computes hashCode, finds a bucket and compares keys; the array just indexes. (3) Memory/cache: the int[] is small and contiguous, while map entries are scattered Node and Integer objects, each access likely a cache miss. (4) Less garbage-collection pressure.</p>`, rubric: ['Boxing/unboxing and object allocation on each update', 'Hashing and bucket lookup vs direct indexing', 'Memory layout: contiguous int[] vs scattered objects (cache misses)'] },
        { type: 'mcq', q: `Roughly how many bytes does one HashMap&lt;Integer,Integer&gt; entry take, versus the 8 bytes of data?`, opts: ['About 60–80 bytes', 'Exactly 8 bytes', 'About 16 bytes', 'About 1 kilobyte'], a: 0, why: 'Node object (~32 B) + two Integer objects (~16 B each) + references: roughly 8–10× the raw data.' }
      ]
    },
    {
      title: 'Cache locality: same Big-O, different speed',
      teach: `
<p>The CPU doesn't fetch one int at a time. It fetches a whole <strong>cache line</strong> (64 bytes = 16 ints) into a small, very fast cache. Reading from cache takes ~1 ns; from main memory, ~100 ns.</p>
<div class="ex">
<div class="sub">Array scan</div>
<p>Reading a[0] pulls in a[0..15] for free. The next 15 reads are cache hits. Scanning is also predictable, so the CPU prefetches the next lines before you ask.</p>
<div class="sub">Linked-list scan</div>
<p>Each node can be anywhere. Each <code>next</code> is likely a miss (~100 ns), and the CPU can't prefetch an address it hasn't read yet.</p>
<div class="sub">Result</div>
<p>Both scans are O(n). The array scan can be <strong>10×+ faster</strong> in practice. Big-O hides this constant. At the Staff level, knowing when the constant matters, and saying so, is a signal.</p>
</div>
<p>The same effect explains why iterating a 2D array row by row (<code>a[i][j]</code> with j inner) beats column by column: rows are contiguous in memory, columns aren't.</p>`,
      qs: [
        { type: 'num', q: `How many 4-byte ints fit in one 64-byte cache line?`, a: 16, why: '64 / 4 = 16. One miss brings in 16 neighbours.' },
        { type: 'mcq', q: `Which loop order over <code>int[][] a</code> (n × n) is faster in Java, and why?`, opts: ['i outer, j inner: rows are contiguous', 'j outer, i inner: columns are contiguous', 'Both are identical since they are O(n²)', 'j outer: Java stores arrays by column'], a: 0, why: 'Each a[i] is its own contiguous int[]. Walking j inside a row reuses cache lines; walking down a column jumps between separate row arrays.' },
        { type: 'free', q: `Explain why scanning a linked list is slower than scanning an array of the same length even though both are O(n).`, model: `<p>Array elements are contiguous, so each cache-line fetch delivers ~16 upcoming ints and the hardware can prefetch ahead: most reads are cache hits. List nodes are scattered, so following each next-pointer usually lands on a new, uncached address (a ~100× slower memory access), and the CPU can't prefetch because it doesn't know the next address until it reads the current node. Big-O counts accesses, not their cost, so it hides this constant factor.</p>`, rubric: ['Array: contiguous, cache lines bring neighbours, prefetching works', 'List: scattered nodes, likely cache miss per node, no prefetch (address unknown in advance)', 'Big-O ignores this constant-factor difference'] },
        { type: 'mcq', q: `A BFS on a graph stored as <code>List&lt;List&lt;Integer&gt;&gt;</code> vs as flat int arrays (CSR). Same Big-O. Which is faster, and why?`, opts: ['Flat arrays: contiguous, no boxing', 'Nested lists: more flexible layout', 'No difference; both are O(V + E)', 'Nested lists: fewer total objects'], a: 0, why: 'Flat arrays avoid boxed Integers and pointer-chasing, so neighbours are read sequentially.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Placement follow-up.</strong> When should you use an array instead of a hash map to count occurrences? Give the criterion and the reasons.`, model: `<p>Use an array when the keys are small integers from a bounded, dense range (e.g. 26 letters, values 0..10⁵): index = key. Reasons: no hashing, no boxing, contiguous memory (cache-friendly), and less memory per key. Use a hash map when keys are sparse or unbounded (e.g. arbitrary ints up to 10⁹, strings), where an array would be huge and mostly empty.</p>`, rubric: ['Criterion: keys are small, bounded and dense (map directly to indices)', 'Reasons: no hashing / no boxing / cache-friendly contiguous memory', 'Counter-case: sparse or unbounded keys need a map (the array would be huge and mostly empty)'] },
    { type: 'mcq', q: `<code>map.get(a) == map.get(b)</code> where both values are 200 (Integer). Result?`, opts: ['false: two different Integer objects', 'true: the values are both 200', 'true: HashMap reuses the value', 'NullPointerException is thrown'], a: 0, why: '200 is outside the −128..127 cache, so the two values are distinct objects and == compares references. Use .equals or unbox.' },
    { type: 'mcq', q: `Which costs O(n) on an ArrayList of size n but O(1) on a linked list, given you hold the node?`, opts: ['Removing that element', 'Reading element i', 'Appending at the end', 'Reading the first element'], a: 0, why: 'Removal from an array shifts later elements; from a list it rewires pointers.' },
    { type: 'num', q: `int[] starting at address 4096; which index is at address 4196?`, a: 25, why: '(4196 − 4096) / 4 = 25.' },
    { type: 'free', q: `Explain why ArrayList&lt;Integer&gt; loses much of an array's cache advantage.`, model: `<p>The backing array stores references, not the ints themselves. The Integer objects live separately on the heap, so reading each value follows a reference to a possibly-distant object: a pointer chase and likely cache miss per element, much like a linked list. An int[] stores the values inline and contiguously.</p>`, rubric: ['ArrayList&lt;Integer&gt; stores references to boxed objects, not values', 'Each access dereferences to a scattered object (pointer chase, cache miss)', 'Contrasts with int[] storing values inline'] }
  ]
});
