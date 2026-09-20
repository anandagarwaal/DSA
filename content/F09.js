COURSE.topic({
  id: 'F09',
  intro: `In placement you gave the two-pointer <em>move</em> ("move hi down to decrease the sum") but not the <em>proof</em>. This topic is that proof, and it isn't a two-pointer trick. It's a general way of thinking: <strong>picture every candidate answer as a cell in a grid, then show each step erases a whole row or column that can't contain the answer.</strong> Once you see the grid, the pointer moves stop being rules to remember. They're the only moves that make sense.`,
  kps: [
    {
      title: 'Draw the search space',
      teach: `
<p>Before optimising, ask: <strong>what are all the candidate answers?</strong> For "find two indices i &lt; j with a[i] + a[j] = target", the candidates are all pairs (i, j) with i &lt; j.</p>
<div class="ex">
<div class="sub">Subgoal 1: lay the candidates out</div>
<p>Put i on the rows and j on the columns of an n × n grid. Each cell (i, j) is one candidate pair.</p>
<div class="sub">Subgoal 2: keep only valid cells</div>
<p>i &lt; j keeps the <strong>upper triangle</strong>: n(n−1)/2 cells, the F03 staircase.</p>
<div class="sub">Subgoal 3: brute force = visit every cell</div>
<p>The double loop <code>for i: for j &gt; i</code> visits the whole triangle, which is O(n²). To be faster, you must avoid <em>looking at</em> most cells, and so you need a reason why the cells you skip can't be the answer.</p>
</div>
<p>Other search spaces you'll meet: all subarrays (start, end), which is also a triangle; all triples, a cube; all candidate answer values 1..10⁹, a line (binary search, F13). Naming the space is always step one.</p>`,
      qs: [
        { type: 'num', q: `How many cells are in the pair search space (i &lt; j) for n = 8?`, a: 28, why: 'n(n−1)/2 = 8·7/2 = 28: the strict upper triangle.' },
        { type: 'mcq', q: `The search space for "longest subarray with property P" is best pictured as…`, opts: ['A triangle of (start, end) pairs', 'A line of the n array values', 'A cube of all index triples', 'A tree of all n! orderings'], a: 0, why: 'Every subarray is a pair start ≤ end: the same triangle as pairs, with the diagonal included.' },
        { type: 'free', q: `Why is "name the search space" useful even before you know an efficient algorithm?`, model: `<p>It tells you the brute-force cost (the number of cells) and turns "find a faster algorithm" into a precise question: which cells can be skipped, and why can't they hold the answer? Every speed-up is an argument that some region of the space can be discarded without looking at it.</p>`, rubric: ['Gives the brute-force cost (size of the space)', 'Reframes speed-up as justifying which regions can be skipped without inspection'] },
        { type: 'num', q: `A problem asks for three indices i &lt; j &lt; k. How many candidates for n = 6?`, a: 20, why: 'C(6, 3) = 20. The search space is a "tetrahedron" of the cube, which is O(n³) to brute force.' }
      ]
    },
    {
      title: 'Each step erases a row or a column',
      teach: `
<p>Sorted array a = [1, 3, 4, 6, 8, 11], target 10. Start at the <strong>top-right corner</strong>: lo = 0, hi = 5, the smallest row value with the largest column value.</p>
<figure class="fig"><svg viewBox="0 0 260 264" width="260" role="img" aria-label="pair grid for sorted two-sum">
<text x="63.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">1</text>
<text x="97.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">3</text>
<text x="131.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">4</text>
<text x="165.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">6</text>
<text x="199.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">8</text>
<text x="233.0" y="26" text-anchor="middle" font-size="10" style="fill:var(--soft)">11</text>
<text x="38" y="55.0" text-anchor="end" font-size="10" style="fill:var(--soft)">1</text>
<text x="38" y="89.0" text-anchor="end" font-size="10" style="fill:var(--soft)">3</text>
<text x="38" y="123.0" text-anchor="end" font-size="10" style="fill:var(--soft)">4</text>
<text x="38" y="157.0" text-anchor="end" font-size="10" style="fill:var(--soft)">6</text>
<text x="38" y="191.0" text-anchor="end" font-size="10" style="fill:var(--soft)">8</text>
<text x="38" y="225.0" text-anchor="end" font-size="10" style="fill:var(--soft)">11</text>
<rect x="46" y="34" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="34" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="97.0" y="55.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">4</text>
<rect x="114" y="34" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="131.0" y="55.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">5</text>
<rect x="148" y="34" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="165.0" y="55.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">7</text>
<rect x="182" y="34" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="199.0" y="55.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">9</text>
<rect x="216" y="34" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="233.0" y="55.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">12</text>
<rect x="46" y="68" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="68" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="114" y="68" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="131.0" y="89.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">7</text>
<rect x="148" y="68" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="165.0" y="89.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">9</text>
<rect x="182" y="68" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="199.0" y="89.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">11</text>
<rect x="216" y="68" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="233.0" y="89.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">14</text>
<rect x="46" y="102" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="102" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="114" y="102" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="148" y="102" width="34" height="34" style="fill:var(--good);opacity:.8;stroke:var(--rule)"/>
<text x="165.0" y="123.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">10</text>
<rect x="182" y="102" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="199.0" y="123.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">12</text>
<rect x="216" y="102" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="233.0" y="123.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">15</text>
<rect x="46" y="136" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="136" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="114" y="136" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="148" y="136" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="182" y="136" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="199.0" y="157.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">14</text>
<rect x="216" y="136" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="233.0" y="157.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">17</text>
<rect x="46" y="170" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="170" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="114" y="170" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="148" y="170" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="182" y="170" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="216" y="170" width="34" height="34" style="fill:var(--accent);opacity:.18;stroke:var(--rule)"/>
<text x="233.0" y="191.0" text-anchor="middle" font-size="10" style="fill:var(--ink)">19</text>
<rect x="46" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="80" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="114" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="148" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="182" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<rect x="216" y="204" width="34" height="34" style="fill:var(--kbd);stroke:var(--bg)"/>
<polyline points="233.0,51.0 199.0,51.0 199.0,85.0 165.0,85.0 165.0,119.0" style="fill:none;stroke:var(--accent);stroke-width:2.5"/>
<text x="148.0" y="256" text-anchor="middle" font-size="10" style="fill:var(--soft)">rows: a[lo] · columns: a[hi] · cell = sum · target 10</text>
</svg><figcaption>The walk: (1,11)=12 too big → erase column 11. (1,8)=9 too small → erase row 1. (3,8)=11 too big → erase column 8. (3,6)=9 too small → erase row 3. (4,6)=10 found. Shaded = erased without ever being checked.</figcaption></figure>
<div class="ex">
<div class="sub">Why the corner?</div>
<p>From the top-right, moving <em>down</em> (lo++) always increases the sum and moving <em>left</em> (hi−−) always decreases it. Sortedness makes the grid monotone in both directions, so every comparison gives you a direction.</p>
<div class="sub">Counting the steps</div>
<p>Every step erases one full row or one full column. There are only n rows and n columns, so after at most about 2n steps the grid is empty: <strong>O(n)</strong>, even though the grid has O(n²) cells.</p>
</div>
<p>That's the whole idea: <strong>a comparison at one cell answers the question for an entire row or column.</strong></p>`,
      qs: [
        { type: 'mcq', q: `At cell (lo, hi) the sum is too <strong>small</strong>. What's erased?`, opts: ['Row lo, every pair using a[lo]', 'Column hi, every pair using a[hi]', 'Only the single cell (lo, hi)', 'Everything below and to the left'], a: 0, why: 'a[lo] paired with anything still available (all ≤ a[hi]) is at most this sum, still too small. So a[lo] can never be part of the answer: the whole row goes.' },
        { type: 'num', q: `a = [2, 5, 7, 9, 12], target 16. Starting lo = 0, hi = 4, how many sums are checked, including the one that finds the pair?`, a: 4, why: '(2,12) = 14 too small → erase row 2. (5,12) = 17 too big → erase column 12. (5,9) = 14 too small → erase row 5. (7,9) = 16 found. 4 checks.' },
        { type: 'mcq', q: `Why does starting at the <em>top-left</em> corner (lo = 0, hi = 1) not work?`, opts: ['Both moves increase the sum there', 'The pair there is never valid', 'It only fails when n is odd', 'It needs the array reversed'], a: 0, why: 'From the smallest-sum corner, both moving right and moving down increase the sum, so a "too small" result does not tell you which way to go.' },
        { type: 'free', q: `Explain why the two-pointer scan is O(n) even though it's searching an O(n²)-cell grid.`, model: `<p>Each comparison erases an entire row or column of the grid (the ones proven unable to contain the answer), not just one cell. There are n rows and n columns, so at most about 2n erasures, and hence at most 2n comparisons, before the grid is empty. The cells inside erased rows/columns are never looked at.</p>`, rubric: ['Each step erases a whole row or column, not a single cell', 'Bounded by the number of rows + columns (~2n), so O(n)', 'The erased cells are never individually inspected'] }
      ]
    },
    {
      title: 'Prove each erasure is safe',
      teach: `
<p>The move is easy to remember. What an interviewer wants is the <strong>proof that nothing was lost</strong>. Here it is in full, and it's the answer you didn't give in placement.</p>
<div class="ex">
<div class="sub">Invariant (F07)</div>
<p>"If a valid pair exists, it lies within rows lo.. and columns ..hi" (the remaining rectangle).</p>
<div class="sub">Case: sum too small, a[lo] + a[hi] &lt; target</div>
<p>Every remaining pair in row lo is (lo, j) with j ≤ hi. Sorted means a[j] ≤ a[hi], so a[lo] + a[j] ≤ a[lo] + a[hi] &lt; target. <strong>No cell in row lo can equal target.</strong> Erasing row lo (lo++) keeps the invariant.</p>
<div class="sub">Case: sum too big</div>
<p>Symmetric: every remaining pair in column hi is (i, hi) with i ≥ lo, and a[i] ≥ a[lo], so the sum is ≥ a[lo] + a[hi] &gt; target. Erase column hi (hi−−).</p>
<div class="sub">Termination</div>
<p>hi − lo drops by 1 each step (F07). When lo = hi the rectangle is empty; by the invariant, no pair exists.</p>
</div>
<p>Notice the structure: <strong>the comparison at one cell, plus sortedness, bounds every other cell in that row or column.</strong> That's the justification to reach for whenever you move a pointer.</p>`,
      qs: [
        { type: 'free', q: `Prove it is safe to do hi−− when a[lo] + a[hi] &gt; target in sorted two-sum. Don't just restate the rule; bound every discarded pair.`, model: `<p>Moving hi discards all remaining pairs (i, hi) with lo ≤ i &lt; hi. Because the array is sorted, a[i] ≥ a[lo] for each such i, so a[i] + a[hi] ≥ a[lo] + a[hi] &gt; target. Every discarded pair is too big, so none is the answer, and any solution still lies in the smaller rectangle.</p>`, rubric: ['Identifies exactly which pairs are discarded: (i, hi) for lo ≤ i &lt; hi', 'Uses sortedness: a[i] ≥ a[lo]', 'Concludes every discarded pair sums to more than target, so no answer is lost'] },
        { type: 'mcq', q: `The proof for "sum too small → lo++" uses which fact?`, opts: ['Every a[j] still available is ≤ a[hi]', 'Every a[j] still available is ≥ a[lo]', 'The target lies within the array range', 'The array has no duplicate values'], a: 0, why: 'To bound all pairs (lo, j), you need their other element to be at most a[hi], which is true because columns beyond hi are already gone and the array is sorted.' },
        { type: 'mcq', q: `The array is <em>not</em> sorted. Which part of the proof breaks?`, opts: ['Bounding a row using its one checked cell', 'The termination measure hi − lo', 'Initialising lo and hi to the ends', 'Nothing; two pointers still works'], a: 0, why: 'Without order, a[j] ≤ a[hi] is false in general, so one cell tells you nothing about the rest of its row.' },
        { type: 'free', q: `State the loop invariant of sorted two-sum in terms of the grid, and explain how it gives "no pair exists" when the loop ends without finding one.`, model: `<p>Invariant: any pair summing to target lies in rows ≥ lo and columns ≤ hi (the unerased rectangle). Each step preserves it because the erased row/column provably contains no solution. When lo ≥ hi the rectangle holds no valid pair (i &lt; j), so by the invariant no solution exists anywhere.</p>`, rubric: ['Invariant phrased as: every solution lies in the remaining rectangle', 'Maintained because erased rows/columns provably contain none', 'At termination the rectangle is empty, so there is no solution'] }
      ]
    },
    {
      title: 'Break a wrong move with a counterexample',
      teach: `
<p>The other half of justification: <strong>show that the opposite move is wrong</strong>. If you can't build a counterexample, you don't yet understand why the right move is right.</p>
<div class="ex">
<div class="sub">Worked example: Container With Most Water</div>
<p>Area(lo, hi) = (hi − lo) × min(h[lo], h[hi]). Rule: move the <strong>shorter</strong> line.</p>
<div class="sub">Proof of the rule, as an erasure</div>
<p>Say h[lo] ≤ h[hi]. Every other pair in row lo is (lo, j) with j &lt; hi: its width is <em>smaller</em>, and its height is at most h[lo] (the min can't exceed h[lo]). So every such area is less than the current one. <strong>Row lo is erased safely.</strong></p>
<div class="sub">Counterexample for the wrong move</div>
<p>h = [1, 8, 6, 2, 5, 4, 8, 3, 7]. Start lo = 0 (height 1), hi = 8 (height 7). The best container is (1, 8): width 7 × min(8, 7) = 49. If you wrongly move the <em>taller</em> line (hi−−), you erase column 8, and (1, 8) is gone. You never find 49.</p>
<div class="sub">Why the taller line can't be erased</div>
<p>For the taller line, a narrower pair can be taller <em>overall</em>: moving the short line might find a taller partner. One comparison doesn't bound its column.</p>
</div>`,
      qs: [
        { type: 'free', q: `Prove that in Container With Most Water, when h[lo] ≤ h[hi], no pair (lo, j) with lo &lt; j &lt; hi can beat the current area.`, model: `<p>For such j, the width j − lo is less than hi − lo. The height is min(h[lo], h[j]) ≤ h[lo] = min(h[lo], h[hi]). So area(lo, j) = (j − lo)·min(h[lo], h[j]) &lt; (hi − lo)·h[lo] = area(lo, hi). Every pair using lo is worse, so lo can be discarded.</p>`, rubric: ['Width strictly decreases for every other pair using lo', 'Height is capped by h[lo], which is already the current min', 'Both factors are no larger (width strictly smaller), so the area is smaller: row lo erased'] },
        { type: 'num', q: `h = [1, 8, 6, 2, 5, 4, 8, 3, 7]. What is the maximum area?`, a: 49, why: 'Lines at index 1 (8) and index 8 (7): width 7 × height 7 = 49.' },
        { type: 'mcq', q: `In sorted two-sum, sum too small, you wrongly do hi−−. Which input breaks it?`, opts: ['a = [1, 2, 9], target 11', 'a = [1, 2, 3], target 5', 'a = [2, 4, 6], target 6', 'a = [1, 5, 9], target 10'], a: 0, why: '1 + 9 = 10 &lt; 11; wrongly discarding 9 loses the answer 2 + 9. (The others still happen to work because the answer does not use a[hi].)' },
        { type: 'mcq', q: `Why can't the taller line's column be erased in Container With Most Water?`, opts: ['A narrower pair may have a larger min height', 'The taller line is always in the answer', 'Width does not affect the area formula', 'Moving it keeps the width the same'], a: 0, why: 'For (i, hi) with i &gt; lo, width shrinks but min(h[i], h[hi]) can grow past h[lo], so the area can go up. No bound, no erasure.' }
      ]
    }
  ],
  quiz: [
    { type: 'free', q: `<strong>Transfer.</strong> Sorted array, count pairs (i &lt; j) with a[i] + a[j] &lt; target. Design an O(n) two-pointer method and prove the key step with the grid. (Hint: when a[lo] + a[hi] &lt; target, how many pairs in row lo qualify?)`, model: `<p>lo = 0, hi = n−1. If a[lo] + a[hi] &lt; target, then for every j in (lo, hi], a[lo] + a[j] ≤ a[lo] + a[hi] &lt; target, so <strong>all hi − lo pairs in row lo qualify</strong>: count += hi − lo and erase row lo (lo++). Otherwise a[lo] + a[hi] ≥ target, and every (i, hi) with i ≥ lo has a[i] + a[hi] ≥ target, so column hi contributes nothing: hi−−. Each step erases a row or column, so O(n).</p>`, rubric: ['Case sum &lt; target: the entire row lo qualifies, count += hi − lo, then lo++', 'Case sum ≥ target: the entire column hi fails, hi−−', 'Justifies both cases with sortedness bounds on the whole row/column', 'Concludes O(n) because each step erases a row or column'] },
    { type: 'mcq', q: `Sorted two-sum, a = [−3, 0, 2, 5, 7], target 5. Which pair is checked second?`, opts: ['(0, 7)', '(−3, 5)', '(2, 5)', '(−3, 2)'], a: 0, why: 'First (−3, 7) = 4, too small, so row −3 is erased (lo++). Next is (0, 7) = 7.' },
    { type: 'free', q: `Explain, using the grid, why the sorted-two-sum pointer walk can never "overshoot" the answer, i.e. pass the correct pair without checking it.`, model: `<p>The walk only erases a row or column after proving that no cell in it can sum to target (by bounding the whole line with the current cell and sortedness). The correct pair's row and column can never be proven empty, since that cell equals target. So the correct row is never erased while its column exists, and vice versa. The walk must eventually reach that cell.</p>`, rubric: ['Erasures only happen when the whole row/column is proven not to contain a solution', 'The answer cell makes its own row and column impossible to erase', 'So the walk must reach the answer cell'] },
    { type: 'mcq', q: `A 2D matrix is sorted along every row and down every column. To find a value, which corner should you start from?`, opts: ['Top-right or bottom-left', 'Top-left or bottom-right', 'The middle cell of the grid', 'Any corner works equally'], a: 0, why: 'Transfer of the same grid idea: from top-right, going left decreases and going down increases, so each comparison erases a row or column. O(rows + cols).' },
    { type: 'num', q: `The sorted-matrix search above on a 100 × 100 matrix: at most how many comparisons?`, a: 199, tol: 1, why: 'Each comparison erases one row or one column; 100 + 100 lines, and the last cell is found by the 199th comparison at worst.' }
  ]
});
