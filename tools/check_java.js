#!/usr/bin/env node
// Compile every Java practice solution in content/*.js. Usage: node tools/check_java.js [ID ...]
// Each solution's <pre><code> blocks are unescaped and wrapped in a class with java.util.* and
// the usual LeetCode node classes, then compiled with javac.
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const want = process.argv.slice(2);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa-java-'));
const unescape = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const STUBS = `
class ListNode { int val; ListNode next; ListNode() {} ListNode(int v) { val = v; } ListNode(int v, ListNode n) { val = v; next = n; } }
class TreeNode { int val; TreeNode left, right; TreeNode() {} TreeNode(int v) { val = v; } TreeNode(int v, TreeNode l, TreeNode r) { val = v; left = l; right = r; } }
`;
fs.writeFileSync(path.join(dir, 'Stubs.java'), 'import java.util.*;\n' + STUBS);
const files = [path.join(dir, 'Stubs.java')];
for (const f of fs.readdirSync(path.join(ROOT, 'content'))) {
  const id = f.replace('.js', '');
  if (!/^[FP]\d\d$/.test(id) || (want.length && !want.includes(id))) continue;
  const ctx = { window: {} }; ctx.window.COURSE = ctx.COURSE = { topics: {}, topic(x) { this.topics[x.id] = x; } };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'), ctx);
  (ctx.COURSE.topics[id].practice || []).forEach((p, i) => {
    const blocks = [...(p.solution || '').matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(m => unescape(m[1]));
    if (!blocks.length) return;
    const cls = `${id}_${i}`;
    fs.writeFileSync(path.join(dir, cls + '.java'), `import java.util.*;\n// ${p.name}\nclass ${cls} {\n${blocks.join('\n')}\n}\n`);
    files.push(path.join(dir, cls + '.java'));
  });
}
try {
  cp.execFileSync('javac', ['-Xlint:none', '-d', path.join(dir, 'out'), ...files], { stdio: 'pipe' });
  console.log(`compiled ${files.length - 1} solutions OK`);
} catch (e) {
  console.log(String(e.stderr || e.stdout).split('\n').map(l => l.replace(dir + '/', '')).join('\n'));
  process.exit(1);
}
