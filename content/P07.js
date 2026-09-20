COURSE.topic({
  id: 'P07',
  intro: `A stack is the right shape whenever <strong>the most recent unfinished thing is the one you need next</strong>: matching brackets, undoing, nested structure. The <em>monotonic</em> stack adds an invariant (the stack stays sorted) and turns "for each element, find the next bigger one" from O(n²) into O(n). Its cost argument is F04's "each element pushed once, popped once", and its correctness is an F07 invariant.`,
  kps: [
    {
      title: 'LIFO matching: why a stack is the right shape',
      teach: `
<p>Valid Parentheses: <code>([]{})</code> is valid, <code>([)]</code> isn't. Which opener must the next closer match? <strong>The most recent unmatched opener.</strong> Last in, first out: a stack.</p>
<div class="ex">
<div class="sub">The code</div>
<pre><code>Deque&lt;Character&gt; st = new ArrayDeque&lt;&gt;();
for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') st.push(c);
    else {
        if (st.isEmpty()) return false;                  // closer with nothing open
        char o = st.pop();
        if ((c == ')' &amp;&amp; o != '(') || (c == ']' &amp;&amp; o != '[') || (c == '}' &amp;&amp; o != '{')) return false;
    }
}
return st.isEmpty();                                     // leftover openers are unmatched</code></pre>
<div class="sub">Invariant</div>
<p>The stack holds exactly the openers not yet closed, in order of opening. The top is the innermost one.</p>
<div class="sub">Three failure modes, three checks</div>
<p>Wrong type (<code>([)]</code>), closer with an empty stack (<code>)(</code>), openers left over (<code>((</code>).</p>
</div>
<p>Use <code>ArrayDeque</code>, not the legacy <code>Stack</code> class, which is synchronized and extends Vector. Staff-level interviewers notice this.</p>`,
      qs: [
        { type: 'mcq', q: `Why a stack and not a queue for bracket matching?`, opts: ['A closer matches the most recent opener', 'Queues cannot store characters', 'A stack is faster than a queue', 'Openers must match in input order'], a: 0, why: 'Nesting means the innermost (latest) open bracket closes first: LIFO.' },
        { type: 'multi', q: `Which strings are valid?`, opts: ['([]{})', '([)]', '((', '{[]}()'], a: [0, 3], why: '([)] closes [ with ); (( leaves openers unmatched.' },
        { type: 'num', q: `Maximum stack size while checking <code>(([]){[()]})</code>?`, a: 4, why: 'At "(( [", or at "( { [ (": depth 4.' },
        { type: 'free', q: `State the stack invariant for bracket matching and use it to explain why "stack non-empty at the end" means invalid.`, model: `<p>Invariant: after processing a prefix, the stack holds exactly the openers in that prefix that haven't been closed, in opening order (top = innermost). At the end the prefix is the whole string, so a non-empty stack means some opener was never closed: the string is invalid.</p>`, rubric: ['Invariant: stack = unclosed openers in order, top innermost', 'Applied at the end: leftover entries are openers never closed'] }
      ]
    },
    {
      title: 'Monotonic stack: keep the stack sorted',
      teach: `
<p>Daily Temperatures: for each day, how many days until a warmer one? Brute force scans right from every day: O(n²).</p>
<div class="ex">
<div class="sub">The idea</div>
<p>Keep a stack of <em>days still waiting</em> for a warmer day. Their temperatures <strong>never rise from bottom to top</strong> (non-increasing): if a warmer day were sitting above a colder one, the colder one would already have its answer.</p>
<pre><code>int[] ans = new int[n];
Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();                  // indices, temps non-increasing
for (int i = 0; i &lt; n; i++) {
    while (!st.isEmpty() &amp;&amp; t[st.peek()] &lt; t[i]) {
        int j = st.pop();
        ans[j] = i - j;                                    // i is j's first warmer day
    }
    st.push(i);
}</code></pre>
<div class="sub">Trace: t = [73, 74, 75, 71, 69, 72, 76, 73]</div>
<p>After i = 4 the stack (indices) is [2, 3, 4], temps 75 &gt; 71 &gt; 69. At i = 5 (72): pop 4 (69, answer 1), pop 3 (71, answer 2), stop at 75. Push 5: stack [2, 5].</p>
</div>
<p><strong>The picture:</strong> bars of different heights. A new tall bar "hides" every shorter bar to its left, and those shorter bars are exactly the ones popped.</p>`,
      qs: [
        { type: 'mcq', q: `In Daily Temperatures, the stack (bottom → top) holds temperatures that are…`, opts: ['Non-increasing: never rising', 'Strictly increasing upward', 'Sorted by index only', 'In arbitrary order'], a: 0, why: 'Anything warmer than the top would have popped it, so each entry is no warmer than the one below. Equal temperatures do not pop each other (the test is &lt;), so it is non-increasing rather than strictly decreasing.' },
        { type: 'num', q: `t = [73, 74, 75, 71, 69, 72, 76, 73]. What is the answer for day 2 (75)?`, a: 4, why: 'Day 6 (76) is its first warmer day: 6 − 2 = 4.' },
        { type: 'free', q: `Prove the stack stays non-increasing (bottom to top) throughout Daily Temperatures.`, model: `<p>Initially empty: trivially ordered. Before pushing i, the while loop pops every index whose temperature is &lt; t[i], so the remaining top (if any) has temperature ≥ t[i]. Pushing i on top therefore keeps the order non-increasing from bottom to top. Popping never breaks order. So the invariant holds after every step.</p>`, rubric: ['Base: empty stack', 'Before pushing i, all smaller temps on top are popped, so top ≥ t[i]', 'Pushing i preserves the order; pops never break it'] },
        { type: 'mcq', q: `"Next <em>smaller</em> element to the right" needs a stack that is…`, opts: ['Increasing bottom to top', 'Decreasing bottom to top', 'Always of size one', 'Sorted by value descending'], a: 0, why: 'Pop while the top is larger than the current element; what remains is increasing.' }
      ]
    },
    {
      title: 'What a pop means',
      teach: `
<p>The most useful question about any monotonic stack: <strong>at the moment j is popped by i, what do we know?</strong></p>
<div class="ex">
<div class="sub">For "next greater" (pop while top &lt; current)</div>
<p>When j is popped by i: <strong>i is j's next greater element</strong>. Everything between j and i was ≤ a[j] (otherwise it would have popped j first).</p>
<div class="sub">And the element below j in the stack</div>
<p>The index k just below j is the nearest element to j's <em>left</em> with a[k] ≥ a[j]: everything that stood between them was popped earlier, and only smaller elements get popped. So at the moment of a pop you know <em>both</em> boundaries of j at once.</p>
<div class="sub">Largest Rectangle in Histogram uses exactly this</div>
<p>Keep an increasing stack of bar indices. When bar j is popped by i (h[i] &lt; h[j]), then i is the first shorter bar to the right and the new top k is the first shorter bar to the left. So the widest rectangle of height h[j] spans (k, i): width i − k − 1.</p>
</div>
<pre><code>// heights with a sentinel 0 appended so every bar gets popped
for (int i = 0; i &lt;= n; i++) {
    int cur = (i == n) ? 0 : h[i];
    while (!st.isEmpty() &amp;&amp; h[st.peek()] &gt;= cur) {
        int height = h[st.pop()];
        int left = st.isEmpty() ? -1 : st.peek();
        best = Math.max(best, height * (i - left - 1));
    }
    st.push(i);
}</code></pre>`,
      qs: [
        { type: 'num', q: `Largest rectangle in histogram [2, 1, 5, 6, 2, 3]?`, a: 10, why: 'Bars 5 and 6, height 5, width 2.' },
        { type: 'num', q: `Largest rectangle in histogram [6, 2, 5, 4, 5, 1, 6]?`, a: 12, why: 'Height 4 over bars 5, 4, 5 (width 3) = 12.' },
        { type: 'free', q: `In the histogram algorithm, when bar j is popped at index i, why is (i − left − 1) the widest possible rectangle of height h[j]?`, model: `<p>i popped j because h[i] &lt; h[j] and it's the first such bar to the right (earlier bars would have popped j sooner). The new top, left, is the nearest bar to the left with height &lt; h[j] (increasing-stack invariant: anything between left and j was taller and got popped earlier). A rectangle of height h[j] can extend over exactly the bars strictly between left and i, all of which are ≥ h[j]. Width i − left − 1.</p>`, rubric: ['i is the first bar to the right shorter than h[j]', 'The element below j is the first bar to the left shorter than h[j]', 'All bars strictly between are ≥ h[j], so width = i − left − 1'] },
        { type: 'mcq', q: `Why append a sentinel height 0 at the end?`, opts: ['It forces every remaining bar to be popped', 'It avoids an empty-array exception', 'It makes the stack strictly increasing', 'It doubles the maximum area found'], a: 0, why: 'Bars never popped would never be measured. A final 0 pops everything.' }
      ]
    },
    {
      title: 'O(n) despite the inner while loop',
      teach: `
<p>This is F04 applied: <strong>count pushes and pops per element, not per iteration.</strong></p>
<div class="ex">
<div class="sub">The argument</div>
<p>Each index is pushed exactly once. It can be popped at most once, since after that it's gone. So across the whole run, total pops ≤ total pushes = n. The while-loop condition fails once per outer iteration (n more checks).</p>
<div class="sub">Total</div>
<p>n pushes + ≤ n pops + n failed checks = <strong>O(n)</strong>, even though one iteration can pop almost the whole stack.</p>
<div class="sub">The banker's view</div>
<p>Each push pays 2 coins: one for itself, one saved for its future pop. A long pop burst is prepaid by earlier cheap pushes.</p>
</div>
<p>Space: O(n) worst case, e.g. a strictly decreasing input never pops, so the stack holds everything.</p>`,
      qs: [
        { type: 'num', q: `Daily Temperatures on [73, 74, 75, 71, 69, 72, 76, 73]: total number of pops?`, a: 6, why: 'Days 0–5 each get popped once when their warmer day arrives; days 6 and 7 never do.' },
        { type: 'multi', q: `Which inputs make the next-greater stack (pop while top &lt; current) reach size n?`, opts: ['A strictly decreasing array', 'A strictly increasing array', 'An array of all equal values', 'A random permutation'], a: [0, 2], why: 'Pops need a strictly greater arrival. Decreasing and all-equal inputs never provide one, so nothing is popped.' },
        { type: 'free', q: `A reviewer says your monotonic-stack solution is O(n²) "because of the nested while loop". Rebut precisely.`, model: `<p>The bound comes from counting operations per element, not per iteration. Each index is pushed exactly once and popped at most once over the entire run, so the total number of inner-loop pops is ≤ n. Each outer iteration also does one failed condition check. Total work is ≤ n pushes + n pops + n checks = O(n). One iteration may pop many elements, but only elements earlier iterations pushed.</p>`, rubric: ['Counts total pops across the run, not per iteration', 'Each index pushed once, popped at most once, so pops ≤ n', 'Concludes O(n) overall'] },
        { type: 'mcq', q: `Next Greater Element II (circular array) iterates i over 0..2n−1 using i % n. Complexity?`, opts: ['O(n): still ≤ 2n pushes and pops', 'O(n²): each element seen twice', 'O(n log n): the stack is sorted', 'O(2ⁿ) due to wrapping around'], a: 0, why: 'At most 2n pushes (and pops): linear.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Stock Span: for each day, how many consecutive days up to and including today had price ≤ today's price? Design an O(n) solution and say what a pop means.`, model: `<p>Keep a stack of indices with strictly decreasing prices. For day i, pop while price[top] ≤ price[i]: every popped day is ≤ today and so is everything it had spanned. After popping, the top (if any) is the previous day with a <em>higher</em> price, so span = i − top (or i + 1 if the stack is empty). Push i. A pop means "this day is absorbed into today's span, forever". Each index pushed and popped once: O(n).</p>`, rubric: ['Decreasing stack; pop while price ≤ today', 'After popping, the top is the previous greater price, so span = i − top (or i + 1)', 'O(n) by push/pop counting'] },
    { type: 'num', q: `Next greater element for each of [2, 1, 2, 4, 3] (−1 if none). What is the answer for index 1 (value 1)?`, a: 2, why: 'Index 2 (value 2) is the first greater value to the right.' },
    { type: 'mcq', q: `Min Stack (push, pop, top, getMin all O(1)). The standard trick?`, opts: ['Store (value, min so far) per entry', 'Keep the stack sorted at all times', 'Scan for the min on each getMin call', 'Use a heap alongside the stack'], a: 0, why: 'Each entry remembers the minimum of itself and everything below it, so popping restores the previous minimum for free.' },
    { type: 'mcq', q: `Evaluate Reverse Polish Notation ["2", "1", "+", "3", "*"]. Result?`, opts: ['9', '5', '7', '6'], a: 0, why: '2 + 1 = 3, then 3 × 3 = 9. Operands sit on a stack until their operator arrives.' },
    { type: 'free', q: `Discriminate: when is a <em>monotonic</em> stack needed rather than a plain stack?`, model: `<p>A plain stack fits when you need the most recent unfinished item (matching, undo, parsing nested structure). A monotonic stack fits when each element needs its nearest greater/smaller neighbour: keeping the stack sorted means the elements that can no longer be anyone's answer are discarded as soon as they're dominated, which is what makes it O(n) instead of rescanning.</p>`, rubric: ['Plain stack: most-recent-unfinished (matching, nesting)', 'Monotonic: nearest greater/smaller queries', 'Explains dominated elements are discarded, giving O(n)'] }
  ],
  practice: [
    { name: 'Valid Parentheses', lc: 'LeetCode 20', prompt: `<p>Is the bracket string valid?</p>`, hint: `<p>The top of the stack is the innermost unclosed opener.</p>`,
      solution: `<pre><code>public boolean isValid(String s) {
    Deque&lt;Character&gt; st = new ArrayDeque&lt;&gt;();
    for (char c : s.toCharArray()) {
        if (c == '(') st.push(')');
        else if (c == '[') st.push(']');
        else if (c == '{') st.push('}');
        else if (st.isEmpty() || st.pop() != c) return false;
    }
    return st.isEmpty();
}</code></pre><p class="cx">O(n). Pushing the expected closer simplifies the comparison.</p>` },
    { name: 'Daily Temperatures', lc: 'LeetCode 739', prompt: `<p>Days until a warmer temperature, per day (0 if never).</p>`, hint: `<p>Stack of days still waiting; a pop means the answer is found.</p>`,
      solution: `<pre><code>public int[] dailyTemperatures(int[] t) {
    int n = t.length;
    int[] ans = new int[n];
    Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();
    for (int i = 0; i &lt; n; i++) {
        while (!st.isEmpty() &amp;&amp; t[st.peek()] &lt; t[i]) {
            int j = st.pop();
            ans[j] = i - j;
        }
        st.push(i);
    }
    return ans;
}</code></pre><p class="cx">O(n) · O(n).</p>` },
    { name: 'Largest Rectangle in Histogram', lc: 'LeetCode 84', prompt: `<p>Area of the largest rectangle in the histogram.</p>`, hint: `<p>When a bar is popped, you know its nearest shorter bar on both sides.</p>`,
      solution: `<pre><code>public int largestRectangleArea(int[] h) {
    int n = h.length, best = 0;
    Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;();
    for (int i = 0; i &lt;= n; i++) {
        int cur = (i == n) ? 0 : h[i];
        while (!st.isEmpty() &amp;&amp; h[st.peek()] &gt;= cur) {
            int height = h[st.pop()];
            int left = st.isEmpty() ? -1 : st.peek();
            best = Math.max(best, height * (i - left - 1));
        }
        st.push(i);
    }
    return best;
}</code></pre><p class="cx">O(n). The sentinel 0 at i = n pops everything left.</p>` },
    { name: 'Min Stack', lc: 'LeetCode 155', prompt: `<p>Stack with O(1) getMin.</p>`, hint: `<p>Each entry remembers the min at the time it was pushed.</p>`,
      solution: `<pre><code>class MinStack {
    private final Deque&lt;int[]&gt; st = new ArrayDeque&lt;&gt;();   // {value, min so far}
    public void push(int x) { st.push(new int[]{x, st.isEmpty() ? x : Math.min(x, st.peek()[1])}); }
    public void pop() { st.pop(); }
    public int top() { return st.peek()[0]; }
    public int getMin() { return st.peek()[1]; }
}</code></pre><p class="cx">All O(1). Popping restores the previous minimum automatically.</p>` }
  ]
});
