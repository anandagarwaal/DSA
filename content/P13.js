COURSE.topic({
  id: 'P13',
  intro: `A topological order lists the vertices of a directed graph so that every edge points forward: prerequisites before courses, build steps before the things that depend on them. It exists exactly when the graph has <strong>no cycle</strong>, and the algorithm that finds it detects cycles for free. This builds directly on P12's traversals.`,
  kps: [
    {
      title: 'Kahn\'s algorithm: peel off nodes with no incoming edges',
      teach: `
<p>A node with <strong>in-degree 0</strong> depends on nothing, so it can safely go first. Remove it, which lowers its neighbours' in-degrees, and repeat.</p>
<pre><code>int[] indeg = new int[n];
for (int[] e : edges) indeg[e[1]]++;                 // edge e[0] → e[1]
Deque&lt;Integer&gt; q = new ArrayDeque&lt;&gt;();
for (int i = 0; i &lt; n; i++) if (indeg[i] == 0) q.offer(i);
List&lt;Integer&gt; order = new ArrayList&lt;&gt;();
while (!q.isEmpty()) {
    int u = q.poll();
    order.add(u);
    for (int v : adj.get(u))
        if (--indeg[v] == 0) q.offer(v);            // v's last prerequisite just finished
}</code></pre>
<div class="ex">
<div class="sub">Invariant</div>
<p>indeg[v] = number of v's prerequisites not yet output. A vertex enters the queue exactly when that count hits 0, i.e. when everything it depends on is already in the order. So every edge u → v has u output before v.</p>
<div class="sub">The picture</div>
<p>Peel the graph layer by layer from the sources: first everything with no arrows in, then what that frees up, and so on.</p>
<div class="sub">Cost</div>
<p>Each vertex is enqueued once and each edge decrements once: O(V + E).</p>
</div>
<p>Course Schedule: edge [a, b] means "b before a", so the edge goes b → a. <strong>Getting the direction wrong is the most common bug.</strong> Say it out loud.</p>`,
      qs: [
        { type: 'mcq', q: `prerequisites [[1, 0]] in Course Schedule means…`, opts: ['Edge 0 → 1: take 0 before 1', 'Edge 1 → 0: take 1 before 0', 'An undirected edge between them', 'Courses 1 and 0 are the same'], a: 0, why: '[a, b] means b is a prerequisite of a, so b comes first: b → a.' },
        { type: 'mcq', q: `4 courses, prerequisites [[1,0],[2,0],[3,1],[3,2]]. Which is a valid order?`, opts: ['[0, 2, 1, 3]', '[1, 0, 2, 3]', '[0, 3, 1, 2]', '[3, 1, 2, 0]'], a: 0, why: '0 first, then 1 and 2 in either order, then 3.' },
        { type: 'num', q: `Same prerequisites [[1,0],[2,0],[3,1],[3,2]]. How many valid topological orders exist?`, a: 2, why: '[0, 1, 2, 3] and [0, 2, 1, 3].' },
        { type: 'free', q: `Prove that Kahn's algorithm never outputs a vertex before one of its prerequisites.`, model: `<p>Invariant: indeg[v] counts v's prerequisites (incoming edges) whose source hasn't been output yet. It's decremented exactly when such a source is output. v is enqueued only when indeg[v] reaches 0, i.e. after every u with u → v has been output. So in the final order every edge u → v has u before v.</p>`, rubric: ['Invariant: indeg[v] = prerequisites of v not yet output', 'v is enqueued only when that count reaches 0', 'Hence every source u of an edge u → v is output before v'] }
      ]
    },
    {
      title: 'Cycle detection: nodes left over',
      teach: `
<p>If the graph has a cycle, the vertices on it block each other forever: none of them ever reaches in-degree 0.</p>
<div class="ex">
<div class="sub">The test</div>
<p>After Kahn's loop, <strong>if order.size() &lt; n, there's a cycle</strong> and no valid order exists. That's the whole of Course Schedule I: return order.size() == n.</p>
<div class="sub">Why a cycle blocks everything on it</div>
<p>Take a cycle v₁ → v₂ → … → vₖ → v₁. For any vᵢ to be output, its predecessor on the cycle must be output first. Following that backwards around the cycle, the first cycle vertex ever output would need its predecessor output earlier, which is impossible. So none are output.</p>
<div class="sub">What else gets stuck</div>
<p>Anything downstream of a cycle, since it depends on a stuck vertex. So order.size() can be much smaller than n minus the cycle length.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `Course Schedule, 2 courses, prerequisites [[1,0],[0,1]]. Possible to finish?`, opts: ['No: 0 and 1 form a cycle', 'Yes: take 0 then 1', 'Yes: take 1 then 0', 'Only if there are 3 courses'], a: 0, why: 'Each needs the other first; both keep in-degree 1 forever.' },
        { type: 'num', q: `3 courses, prerequisites [[1,0],[2,1],[1,2]]. How many courses does Kahn output before stopping?`, a: 1, why: 'Only course 0 (in-degree 0). Courses 1 and 2 form a cycle and never reach 0.' },
        { type: 'free', q: `Prove that if the graph has a cycle, no vertex on it is ever output by Kahn's algorithm.`, model: `<p>Suppose some cycle vertex is output, and let v be the first cycle vertex output. v's predecessor u on the cycle has an edge u → v, so indeg[v] can reach 0 only after u is output. But u is also on the cycle and wasn't output before v (v was the first). So indeg[v] was still ≥ 1 when v was output: contradiction. Hence no cycle vertex is ever output.</p>`, rubric: ['Considers the first cycle vertex to be output', 'Its cycle predecessor must have been output earlier', 'Contradiction, so no cycle vertex is output'] },
        { type: 'mcq', q: `Kahn outputs 7 of 10 vertices. What can you conclude?`, opts: ['The graph contains at least one cycle', 'Exactly 3 vertices form a cycle', 'Three vertices are isolated', 'The graph is disconnected only'], a: 0, why: 'Leftovers imply a cycle exists, but they may also include vertices merely downstream of it.' }
      ]
    },
    {
      title: 'DFS post-order, reversed',
      teach: `
<p>The second classic method. Run DFS; when a vertex <strong>finishes</strong> (all its descendants explored), append it to a list. Reverse the list.</p>
<pre><code>// state: 0 = unvisited, 1 = on the current path, 2 = finished
void dfs(int u) {
    state[u] = 1;
    for (int v : adj.get(u)) {
        if (state[v] == 1) throw new IllegalStateException("cycle");  // back edge
        if (state[v] == 0) dfs(v);
    }
    state[u] = 2;
    post.add(u);                        // u finishes after everything reachable from it
}
// order = reverse(post)</code></pre>
<div class="ex">
<div class="sub">Why reversed post-order works</div>
<p>For an edge u → v, v finishes <em>before</em> u: either DFS reaches v from u and v completes first, or v was already finished. So in post-order, v precedes u, and reversing puts u before v.</p>
<div class="sub">Why three colours, not a boolean</div>
<p>Meeting a "finished" vertex (2) is harmless: it's a cross or forward edge. Meeting a vertex <em>on the current path</em> (1) means following the edge leads back to an ancestor: a cycle. A plain seen-boolean can't tell the two apart.</p>
</div>`,
      qs: [
        { type: 'mcq', q: `During the DFS, you reach a vertex with state 1 (on the current path). This means…`, opts: ['A back edge: the graph has a cycle', 'A cross edge: perfectly harmless', 'The vertex was never visited', 'The DFS should restart there'], a: 0, why: 'You found a path back to an ancestor still being explored: that closes a cycle.' },
        { type: 'free', q: `Why does a vertex reached with state 2 (finished) NOT indicate a cycle in a directed graph?`, model: `<p>A finished vertex has had its whole reachable subgraph explored and it's not on the current path. An edge to it (u → v with v finished) just joins a branch already known to be acyclic. It can't lead back to u, because if v could reach u, u would have been discovered during v's exploration and finished before v. Only edges to vertices still on the current path (state 1) close a loop.</p>`, rubric: ['A finished vertex is not on the current DFS path', 'Everything reachable from it is already explored and cannot lead back to the current path', 'Only edges to state-1 vertices form cycles'] },
        { type: 'mcq', q: `For an edge u → v in a DAG, which finishes first in DFS?`, opts: ['v finishes before u', 'u finishes before v', 'It depends on vertex numbers', 'They always finish together'], a: 0, why: 'Hence reversed finishing order puts u before v.' },
        { type: 'mcq', q: `Kahn vs DFS topological sort: time complexity?`, opts: ['Both are O(V + E)', 'Kahn O(V²), DFS O(V + E)', 'Kahn O(V + E), DFS O(V²)', 'Both are O(E log V)'], a: 0, why: 'Each processes every vertex and edge a constant number of times.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> "Parallel courses: each semester you may take any number of courses whose prerequisites are done. Minimum number of semesters?" Adapt Kahn's algorithm and justify.`, model: `<p>Run Kahn level by level: the initial in-degree-0 vertices are semester 1; process the whole queue level (snapshot its size, like level-order BFS), decrementing in-degrees; the newly freed vertices form the next semester. The number of levels is the answer (or −1 if not all are output, i.e. a cycle). Each semester takes everything available, and a course can't be taken earlier than one semester after its latest prerequisite, so this greedy layering is optimal: it equals the longest prerequisite chain.</p>`, rubric: ['Process Kahn in levels (snapshot queue size)', 'Number of levels = semesters; −1 if a cycle blocks some courses', 'Justifies optimality via the longest dependency chain'] },
    { type: 'num', q: `5 tasks, dependencies (a before b): 0→2, 1→2, 2→3, 2→4. How many valid orders?`, a: 4, why: '0 and 1 in either order (2 ways), then 2, then 3 and 4 in either order (2 ways): 4.' },
    { type: 'num', q: `4 tasks with no dependencies at all. How many valid topological orders?`, a: 24, why: 'Every permutation: 4! = 24.' },
    { type: 'mcq', q: `The problem asks for the <em>lexicographically smallest</em> valid order. Change to Kahn?`, opts: ['Use a min-heap instead of a queue', 'Sort the edges before starting', 'Run DFS from the smallest vertex', 'Reverse the final order list'], a: 0, why: 'Always emit the smallest available vertex: O((V + E) log V).' },
    { type: 'free', q: `"Alien dictionary": given words sorted in an unknown alphabet, derive the letter order. Where does the graph come from, and when is the input contradictory?`, model: `<p>Compare each adjacent pair of words: the first position where they differ gives an edge (letter in word1 → letter in word2); later positions tell you nothing. Topologically sort the letters. Contradictions: a cycle in that graph (no valid order), or a word followed by its own proper prefix (e.g. "abc" before "ab"), which no alphabet allows.</p>`, rubric: ['Edges come from the first differing letter of adjacent words', 'Topological sort of letters gives the order', 'Invalid if a cycle exists or a longer word precedes its own prefix'] }
  ],
  practice: [
    { name: 'Course Schedule', lc: 'LeetCode 207', prompt: `<p>Can all courses be finished?</p>`, hint: `<p>Kahn's algorithm; compare the count output with n.</p>`,
      solution: `<pre><code>public boolean canFinish(int n, int[][] pre) {
    List&lt;List&lt;Integer&gt;&gt; adj = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; n; i++) adj.add(new ArrayList&lt;&gt;());
    int[] indeg = new int[n];
    for (int[] p : pre) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }   // p[1] before p[0]
    Deque&lt;Integer&gt; q = new ArrayDeque&lt;&gt;();
    for (int i = 0; i &lt; n; i++) if (indeg[i] == 0) q.offer(i);
    int done = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); done++;
        for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return done == n;
}</code></pre><p class="cx">O(V + E). Leftovers mean a cycle.</p>` },
    { name: 'Course Schedule II', lc: 'LeetCode 210', prompt: `<p>Return a valid order, or an empty array if impossible.</p>`, hint: `<p>Same as I, but record the order.</p>`,
      solution: `<pre><code>public int[] findOrder(int n, int[][] pre) {
    List&lt;List&lt;Integer&gt;&gt; adj = new ArrayList&lt;&gt;();
    for (int i = 0; i &lt; n; i++) adj.add(new ArrayList&lt;&gt;());
    int[] indeg = new int[n];
    for (int[] p : pre) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Deque&lt;Integer&gt; q = new ArrayDeque&lt;&gt;();
    for (int i = 0; i &lt; n; i++) if (indeg[i] == 0) q.offer(i);
    int[] order = new int[n]; int k = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); order[k++] = u;
        for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return k == n ? order : new int[0];
}</code></pre><p class="cx">O(V + E).</p>` }
  ]
});
