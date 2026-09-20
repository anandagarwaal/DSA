COURSE.topic({
  id: 'F05',
  intro: `F08 gave you the <em>logic</em> of recursion (induction). This topic is the <em>machinery</em>: what the computer actually does when a function calls itself. That's what decides recursion's space cost, why deep recursion crashes in Java, and how to draw the <strong>recursion tree</strong>, the picture behind recurrences (F06), backtracking and DP.`,
  kps: [
    {
      title: 'Each call gets a stack frame',
      teach: `
<p>When a function is called, the runtime pushes a <strong>frame</strong> onto the call stack. The frame holds that call's parameters, its local variables, and where to return to. When the call returns, its frame is popped.</p>
<div class="ex">
<div class="sub">Worked example: factorial(3)</div>
<pre><code>int fact(int n) { if (n &lt;= 1) return 1; return n * fact(n - 1); }</code></pre>
<pre><code>push fact(3)   stack: [fact(3)]
push fact(2)   stack: [fact(3), fact(2)]          fact(3) is paused, waiting
push fact(1)   stack: [fact(3), fact(2), fact(1)]
fact(1) returns 1       → pop
fact(2) returns 2*1 = 2 → pop
fact(3) returns 3*2 = 6 → pop</code></pre>
<div class="sub">The key insight</div>
<p>Each frame has its <strong>own copy</strong> of n. fact(3)'s n = 3 isn't overwritten by fact(2)'s n = 2. That's why recursion "remembers" where it was: the paused frames are the memory.</p>
</div>`,
      qs: [
        { type: 'num', q: `During fact(5), what is the maximum number of fact frames on the stack at once?`, a: 5, why: 'fact(5) → fact(4) → … → fact(1): five frames before the first return.' },
        { type: 'mcq', q: `While fact(1) runs inside fact(3), what is fact(3) doing?`, opts: ['Paused, holding its n = 3', 'Finished and already popped', 'Running in parallel with it', 'Waiting with n overwritten'], a: 0, why: 'Its frame is still on the stack with its own n, waiting for fact(2) to return.' },
        { type: 'free', q: `Why doesn't the recursive call fact(n − 1) overwrite the caller's variable n?`, model: `<p>Each call gets its own stack frame with its own storage for parameters and locals. fact(n − 1) writes its n into its <em>new</em> frame; the caller's frame, with its own n, sits underneath, untouched and paused until the callee returns.</p>`, rubric: ['Each call has its own frame with its own copies of parameters/locals', 'The caller\'s frame is preserved (paused) underneath until the callee returns'] },
        { type: 'mcq', q: `What happens to a frame when its call returns?`, opts: ['It is popped and its locals are gone', 'It stays until the program exits', 'It is moved to the heap for reuse', 'It is merged into the caller frame'], a: 0, why: 'Frames are LIFO: the most recent call finishes first and its storage is released.' }
      ]
    },
    {
      title: 'Space is the maximum depth, not the number of calls',
      teach: `
<p>Recursion's <strong>extra space = the deepest the stack ever gets</strong> × frame size. Not the total number of calls, because frames are reused after popping.</p>
<div class="ex">
<div class="sub">Worked example: naive Fibonacci</div>
<pre><code>int fib(int n) { if (n &lt; 2) return n; return fib(n - 1) + fib(n - 2); }</code></pre>
<p>fib(5) makes <strong>15 calls</strong> in total, but the stack is never deeper than <strong>5 frames</strong> (fib(5) → fib(4) → fib(3) → fib(2) → fib(1)). When fib(4)'s subtree finishes, all its frames are popped before fib(3) (the second child of fib(5)) starts.</p>
<div class="sub">So</div>
<p>Time ∝ total calls (exponential for naive fib). Space ∝ max depth (O(n) for fib). <strong>They are different questions with different answers.</strong></p>
<div class="sub">Tree recursion</div>
<p>DFS on a tree uses O(height) stack: O(log n) balanced, O(n) skewed (F16).</p>
</div>`,
      qs: [
        { type: 'num', q: `Naive fib(6) makes how many calls in total? (fib(0), fib(1) are base cases.)`, a: 25, why: 'calls(n) = 1 + calls(n−1) + calls(n−2): 1, 1, 3, 5, 9, 15, 25.' },
        { type: 'num', q: `Naive fib(6): maximum stack depth in frames?`, a: 6, why: 'The leftmost path fib(6) → fib(5) → … → fib(1) holds 6 frames at once.' },
        { type: 'mcq', q: `Recursive DFS on a balanced binary tree with 10⁶ nodes. Extra space?`, opts: ['O(log n), about 20 frames', 'O(n), a million frames', 'O(1), recursion is free', 'O(n log n) for all calls'], a: 0, why: 'Depth = height ≈ log₂ 10⁶ ≈ 20.' },
        { type: 'free', q: `Explain, with fib, why recursion's time and space can differ exponentially.`, model: `<p>Time counts every call ever made; space counts only the frames alive at the same moment. Naive fib(n) makes about φⁿ calls (each call spawns two), so time is exponential. But calls are made depth-first: a subtree fully finishes and pops its frames before the sibling starts, so at most n frames (one root-to-leaf path) are alive at once. Space is O(n).</p>`, rubric: ['Time = total calls, which is exponential for naive fib', 'Space = frames alive at once = the current path from root', 'Depth-first order means subtrees finish (pop) before siblings start, so depth is only n'] }
      ]
    },
    {
      title: 'Draw the recursion tree',
      teach: `
<p>The single most useful picture for recursion: <strong>one node per call, children = the calls it makes</strong>.</p>
<figure class="fig"><svg viewBox="0 0 340 170" width="340" role="img" aria-label="recursion tree for fib 4">
<g style="stroke:var(--soft)"><line x1="170" y1="18" x2="95" y2="58"/><line x1="170" y1="18" x2="255" y2="58"/><line x1="95" y1="58" x2="50" y2="98"/><line x1="95" y1="58" x2="140" y2="98"/><line x1="255" y1="58" x2="225" y2="98"/><line x1="255" y1="58" x2="285" y2="98"/><line x1="50" y1="98" x2="25" y2="138"/><line x1="50" y1="98" x2="75" y2="138"/></g>
<g font-size="11" text-anchor="middle">
<rect x="145" y="6" width="50" height="22" rx="4" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="170" y="21">fib(4)</text>
<rect x="70" y="46" width="50" height="22" rx="4" style="fill:var(--code-bg);stroke:var(--accent)"/><text x="95" y="61">fib(3)</text>
<rect x="230" y="46" width="50" height="22" rx="4" style="fill:#fde8e8;stroke:var(--bad)"/><text x="255" y="61">fib(2)</text>
<rect x="25" y="86" width="50" height="22" rx="4" style="fill:#fde8e8;stroke:var(--bad)"/><text x="50" y="101">fib(2)</text>
<rect x="115" y="86" width="50" height="22" rx="4" style="fill:#fff;stroke:var(--rule)"/><text x="140" y="101">fib(1)</text>
<rect x="200" y="86" width="50" height="22" rx="4" style="fill:#fff;stroke:var(--rule)"/><text x="225" y="101">fib(1)</text>
<rect x="260" y="86" width="50" height="22" rx="4" style="fill:#fff;stroke:var(--rule)"/><text x="285" y="101">fib(0)</text>
<rect x="0" y="126" width="50" height="22" rx="4" style="fill:#fff;stroke:var(--rule)"/><text x="25" y="141">fib(1)</text>
<rect x="50" y="126" width="50" height="22" rx="4" style="fill:#fff;stroke:var(--rule)"/><text x="75" y="141">fib(0)</text></g>
<text x="230" y="150" font-size="10" style="fill:var(--bad)">fib(2) computed twice</text></svg></figure>
<div class="ex">
<div class="sub">What the tree tells you</div>
<p><strong>Total calls</strong> = number of nodes (the time). <strong>Max stack depth</strong> = height (the space). <strong>Repeated subtrees</strong> (fib(2) twice here, and exponentially many repeats for larger n) show wasted work, and those repeats are exactly what memoization/DP removes (P16).</p>
<div class="sub">Execution order</div>
<p>The program walks this tree depth-first, left child first. The live stack is always the path from the root to the node currently running.</p>
</div>`,
      qs: [
        { type: 'num', q: `In the recursion tree of fib(5), how many times does fib(2) appear?`, a: 3, why: 'fib(5) → fib(4), fib(3); fib(4) → fib(3), fib(2); each fib(3) contains one fib(2): 1 + 2 = 3.' },
        { type: 'mcq', q: `In a recursion tree, the stack at any moment corresponds to…`, opts: ['The path from root to the running node', 'All the nodes on the current level', 'Every node visited so far in the run', 'The leaves of the tree reached so far'], a: 0, why: 'Depth-first execution: ancestors are paused frames, the current node is on top.' },
        { type: 'free', q: `Draw (in words) the recursion tree for a function that calls itself twice on n/2 until n = 1, starting at n = 8. How many calls in total, and what is the maximum stack depth?`, model: `<p>Level 0: one call on 8. Level 1: two calls on 4. Level 2: four calls on 2. Level 3: eight calls on 1 (base). Total calls = 1 + 2 + 4 + 8 = 15 (= 2n − 1). Max depth = number of levels = 4 frames (log₂ 8 + 1).</p>`, rubric: ['Levels double: 1, 2, 4, 8 calls on sizes 8, 4, 2, 1', 'Total 15 calls (geometric sum)', 'Max depth 4 frames = levels = log₂ n + 1'] },
        { type: 'mcq', q: `What visual clue in a recursion tree suggests memoization will help?`, opts: ['The same call appears in many places', 'The tree is perfectly balanced', 'The tree has a very large height', 'Every node has exactly two children'], a: 0, why: 'Repeated identical subtrees are repeated identical work, so compute once and cache.' }
      ]
    },
    {
      title: 'Stack overflow and converting to iteration',
      teach: `
<p>Java's default thread stack is small (often 512 KB–1 MB), enough for roughly <strong>10⁴–10⁵ frames</strong> depending on frame size. Recursing deeper throws <code>StackOverflowError</code>.</p>
<div class="ex">
<div class="sub">When it bites</div>
<p>DFS on a skewed tree or a long linked list of 10⁵ nodes; recursive flood fill on a 1000 × 1000 grid that's all land (the path can be 10⁶ deep); memoized DP recursion over n = 10⁵.</p>
<div class="sub">Fix 1: an explicit stack</div>
<p>Replace the call stack with a <code>Deque</code> on the heap, which is limited only by memory:</p>
<pre><code>Deque&lt;int[]&gt; st = new ArrayDeque&lt;&gt;();
st.push(new int[]{r0, c0});
while (!st.isEmpty()) {
    int[] cur = st.pop();
    // process cur, push unvisited neighbours
}</code></pre>
<div class="sub">Fix 2: BFS or bottom-up DP</div>
<p>BFS uses a queue instead of depth. Bottom-up DP fills a table in order with no recursion.</p>
<div class="sub">Interview move</div>
<p>Write the recursive version (clearer), then say: "for 10⁵ depth in Java I'd convert this to an explicit stack to avoid StackOverflowError." That's a Staff-level remark.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Recursive flood fill on a 1000 × 1000 all-land grid in Java will most likely…`, opts: ['Overflow the stack (depth up to 10⁶)', 'Run fine, since depth is only 1000', 'Run fine, since depth is log(10⁶)', 'Fail with an OutOfMemoryError'], a: 0, why: 'A snake-shaped DFS path can be as long as the number of cells, far past Java\'s default stack.' },
        { type: 'free', q: `Why does replacing recursion with an explicit Deque avoid StackOverflowError, even though it stores similar data?`, model: `<p>The call stack is a small, fixed-size region per thread (≈ 1 MB), and each frame also carries overhead (return address, saved state). An explicit ArrayDeque lives on the heap, which is far larger and grows as needed, and stores only the data you choose (e.g. an int pair). Same information, but kept in a place with room for it.</p>`, rubric: ['The call stack has a small fixed size per thread', 'An explicit deque lives on the (much larger, growable) heap', 'It stores only the needed state, not whole frames'] },
        { type: 'mcq', q: `Which tends to be the <em>safest</em> implementation for a DP over n = 10⁶ states in Java?`, opts: ['Bottom-up tabulation, no recursion', 'Top-down memoized recursion', 'Recursion with a larger -Xss flag', 'Naive recursion without memo'], a: 0, why: 'No recursion, so no depth limit. (-Xss works locally but isn\'t available on most judges or in interviews.)' },
        { type: 'mcq', q: `Recursive DFS on a <em>balanced</em> tree of 10⁶ nodes in Java. Stack risk?`, opts: ['None: the depth is only about 20', 'High: there are 10⁶ calls in total', 'High: every call allocates memory', 'Medium: it depends on the node value'], a: 0, why: 'Stack usage is max depth (≈ log₂ n), not total calls.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `A recursive function sum(node) on a linked list of 10⁵ nodes throws StackOverflowError in Java. Explain precisely why, and give a fix.`, model: `<p>sum(node) calls sum(node.next) before returning, so every node adds a frame and none can pop until the end is reached: the depth equals the list length, 10⁵ frames, which exceeds Java's default stack (≈ 10⁴–10⁵ frames). Fix: iterate with a loop (<code>for (Node p = head; p != null; p = p.next) total += p.val;</code>), which uses O(1) stack.</p>`, rubric: ['Depth equals list length because each call waits on the next', '10⁵ frames exceeds Java\'s default stack capacity', 'Fix: iterative loop (or explicit stack), O(1) stack space'] },
    { type: 'num', q: `A function makes 3 recursive calls on n − 1, base case at n = 0. Total calls for n = 3?`, a: 40, why: 'Level sizes 1, 3, 9, 27: total 40 calls. Depth is only 4 frames.' },
    { type: 'num', q: `For the same function, maximum stack depth (frames) for n = 3?`, a: 4, why: 'n = 3, 2, 1, 0 along one path: 4 frames.' },
    { type: 'mcq', q: `Merge sort on n elements: recursion depth and total calls?`, opts: ['Depth about log n, calls about 2n', 'Depth about n, calls about n log n', 'Depth about log n, calls about n²', 'Depth about 1, calls about n'], a: 0, why: 'Halving gives log n levels; the tree has about 2n − 1 nodes (n leaves).' },
    { type: 'mcq', q: `Why is "time = number of nodes in the recursion tree × work per node" only true if…`, opts: ['Each call does the same work outside its calls', 'The recursion tree is perfectly balanced', 'Every call makes exactly two further calls', 'The function has no local variables'], a: 0, why: 'Transfer: if work per call varies (e.g. merge does work proportional to size), you must sum per level instead, which is F06.' }
  ]
});
