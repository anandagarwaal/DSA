#!/usr/bin/env node
// Validate content/*.js against knowledge-graph.json. Usage: node tools/check_content.js [ID ...]
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const graph = JSON.parse(fs.readFileSync(path.join(ROOT, 'knowledge-graph.json'), 'utf8'));
const want = process.argv.slice(2);
let errors = 0, warnings = 0, totals = { kps: 0, qs: 0 };
const err = (id, m) => { errors++; console.log(`ERROR ${id}: ${m}`); };
const warn = (id, m) => { warnings++; console.log(`warn  ${id}: ${m}`); };

function checkHtml(id, where, html) {
  if (typeof html !== 'string' || !html.trim()) return err(id, `${where}: empty`);
  for (const tag of ['pre', 'code', 'p', 'div', 'svg', 'table', 'ul', 'ol', 'figure', 'strong', 'em']) {
    const open = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const close = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (open !== close) err(id, `${where}: <${tag}> opened ${open}, closed ${close}`);
  }
  if (/[^\\]<(?![a-zA-Z\/!])/.test(html.replace(/<=|<-/g, ''))) warn(id, `${where}: bare '<' - use &lt;`);
}

function checkQ(id, where, q) {
  totals.qs++;
  const blob = JSON.stringify(q);
  if (/\b(wait|recount|hmm|oops|actually,? no)\b/i.test(blob)) err(id, `${where}: drafting leftover (wait/recount/hmm) in text`);
  checkHtml(id, where + '.q', q.q);
  if (q.type === 'mcq' || q.type === 'multi') {
    if (!Array.isArray(q.opts) || q.opts.length < 3) return err(id, `${where}: needs >= 3 opts`);
    const idx = q.type === 'mcq' ? [q.a] : q.a;
    if (!Array.isArray(idx) || !idx.length || idx.some(i => !Number.isInteger(i) || i < 0 || i >= q.opts.length)) err(id, `${where}: bad answer index`);
    if (q.type === 'multi' && q.a.length === q.opts.length) warn(id, `${where}: every option correct`);
    const lens = q.opts.map(o => o.replace(/<[^>]+>/g, '').length);
    if (Math.max(...lens) > 2.2 * Math.min(...lens) && Math.max(...lens) > 25) warn(id, `${where}: option lengths vary a lot (${lens.join('/')}) - a formatting tell`);
    if (q.type === 'mcq') { const L = lens[q.a]; if (L === Math.max(...lens) && lens.filter(x => x === L).length === 1 && L > 1.4 * lens.filter((_, i) => i !== q.a).reduce((a, b) => Math.max(a, b), 0)) warn(id, `${where}: correct option is clearly the longest`); }
    if (!q.why) err(id, `${where}: missing why`);
  } else if (q.type === 'num') {
    if (typeof q.a !== 'number' || !isFinite(q.a)) err(id, `${where}: num answer must be a number`);
    if (!q.why) err(id, `${where}: missing why`);
  } else if (q.type === 'free') {
    checkHtml(id, where + '.model', q.model);
    if (!Array.isArray(q.rubric) || q.rubric.length < 2) err(id, `${where}: free needs >= 2 rubric points`);
  } else err(id, `${where}: unknown type ${q.type}`);
}

for (const t of graph.topics) {
  if (want.length && !want.includes(t.id)) continue;
  const file = path.join(ROOT, 'content', t.id + '.js');
  if (!fs.existsSync(file)) { warn(t.id, 'no content file yet'); continue; }
  const ctx = { window: {}, COURSE: null };
  ctx.window.COURSE = ctx.COURSE = { topics: {}, topic(x) { this.topics[x.id] = x; } };
  try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); }
  catch (e) { err(t.id, 'does not run: ' + e.message); continue; }
  const c = ctx.COURSE.topics[t.id];
  if (!c) { err(t.id, 'did not call COURSE.topic with this id'); continue; }
  checkHtml(t.id, 'intro', c.intro);
  const LEFTOVER = /\b(wait|recount|hmm|oops|actually,? no)\b/i;
  [c.intro].concat((c.kps || []).map(k => k.teach), (c.practice || []).map(p => p.solution + p.hint)).forEach((h, i) => { if (LEFTOVER.test(h || '')) err(t.id, `teaching text ${i}: drafting leftover`); });
  if (!Array.isArray(c.kps) || c.kps.length !== t.kps.length) err(t.id, `has ${c.kps && c.kps.length} kps, graph lists ${t.kps.length}`);
  (c.kps || []).forEach((kp, k) => {
    totals.kps++;
    if (!kp.title) err(t.id, `kp${k}: no title`);
    checkHtml(t.id, `kp${k}.teach`, kp.teach);
    if (!Array.isArray(kp.qs) || kp.qs.length < 4) err(t.id, `kp${k}: needs >= 4 questions (3 to pass + 1 spare)`);
    (kp.qs || []).forEach((q, i) => checkQ(t.id, `kp${k}.q${i}`, q));
    const types = new Set((kp.qs || []).map(q => q.type));
    if (types.size < 2) warn(t.id, `kp${k}: only ${[...types]} questions - mix types`);
  });
  if (!Array.isArray(c.quiz) || c.quiz.length < 5) err(t.id, 'quiz needs >= 5 questions');
  (c.quiz || []).forEach((q, i) => checkQ(t.id, `quiz${i}`, q));
  if (!(c.quiz || []).some(q => q.type === 'free')) warn(t.id, 'quiz has no free-response (justification) question');
  (c.practice || []).forEach((p, i) => { ['name', 'prompt', 'solution'].forEach(f => { if (!p[f]) err(t.id, `practice${i}: missing ${f}`); }); });
}
console.log(`\n${errors} errors, ${warnings} warnings · ${totals.kps} knowledge points · ${totals.qs} questions`);
process.exit(errors ? 1 : 0);
