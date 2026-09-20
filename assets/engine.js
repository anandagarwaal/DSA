/* DSA course engine: renders lessons, reviews and section quizzes from content/*.js.
 *
 * Content files call COURSE.topic({...}) with:
 *   id, intro (html), kps: [{title, teach (html), qs: [question]}], quiz: [question],
 *   practice: [{name, lc, prompt, hint, solution}]   (optional, coding problems)
 * Question shapes:
 *   {type:'mcq',   q, opts:[...], a:index, why}
 *   {type:'multi', q, opts:[...], a:[indices], why}
 *   {type:'num',   q, a:number, tol?, why}
 *   {type:'free',  q, model (html), rubric:[...]}      self-graded against the rubric
 *
 * Pages declare <body data-page="lesson|review|section|home" data-root="../" data-topic="F01">.
 * Progress is shared with chat sessions through tools/serve.py -> progress.json.
 * Opened as file:// the pages still teach and quiz; they just can't record results.
 */
(function () {
  'use strict';
  var C = window.COURSE = window.COURSE || {};
  C.topics = C.topics || {};
  C.topic = function (t) { C.topics[t.id] = t; };

  var body = document.body;
  var ROOT = body.dataset.root || '';
  var G = C.graph;
  var STATE = null; // /api/state response, or null when offline

  /* ---------- small utilities ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      var v = attrs[k];
      if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('dsa:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('dsa:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  function today() { return new Date().toISOString().slice(0, 10); }
  function lessonHref(id) { return ROOT + G.topics[id].href; }
  function status(id) { return STATE && STATE.progress[id] ? STATE.progress[id].status : null; }
  function badge(id) {
    var s = status(id);
    if (!s) return null;
    var label = { mastered: 'mastered', learning: 'learning', remediate: 'remediate', unverified: 'unverified', not_started: 'not started' }[s] || s;
    return el('span', { 'class': 'badge st-' + s, text: label });
  }
  function topicLink(id) {
    return el('a', { href: lessonHref(id), text: id + ' ' + G.topics[id].title });
  }

  function api(path, payload) {
    if (location.protocol === 'file:') return Promise.resolve(null);
    var opt = payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : {};
    return fetch(path.replace(/^\//, '/'), opt).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function record(topic, kind, result, note) {
    return api('/api/record', { topic: topic, kind: kind, result: result, note: note }).then(function (r) {
      if (r && STATE) STATE.progress[topic] = r.state;
      return r;
    });
  }
  function loadState() { return api('/api/state').then(function (s) { STATE = s; return s; }); }

  function loadTopic(id) {
    if (C.topics[id]) return Promise.resolve(C.topics[id]);
    return new Promise(function (res) {
      var s = el('script', { src: ROOT + 'content/' + id + '.js' });
      s.onload = function () { res(C.topics[id] || null); };
      s.onerror = function () { res(null); };
      document.head.appendChild(s);
    });
  }
  function loadTopics(ids) { return Promise.all(ids.map(loadTopic)); }

  /* All questions of a topic, tagged with a stable key. */
  function pool(t, which) {
    var out = [];
    if (which !== 'kps') (t.quiz || []).forEach(function (q, i) { out.push({ q: q, key: t.id + ':quiz:' + i, topic: t.id }); });
    if (which !== 'quiz') (t.kps || []).forEach(function (kp, k) {
      (kp.qs || []).forEach(function (q, i) { out.push({ q: q, key: t.id + ':' + k + ':' + i, topic: t.id }); });
    });
    return out;
  }
  /* Least-recently-seen first, random among ties, so reviews rotate through the bank. */
  function pickFresh(items, n) {
    var seen = store.get('seen', {});
    return shuffle(items).sort(function (a, b) { return (seen[a.key] || '').localeCompare(seen[b.key] || ''); }).slice(0, n);
  }
  function markSeen(key) { var s = store.get('seen', {}); s[key] = today(); store.set('seen', s); }

  /* ---------- question widgets ---------- */
  function feedback(box, ok, html, label) {
    box.appendChild(el('div', { 'class': 'fb ' + (ok ? 'show-good' : 'show-bad') }, [
      el('strong', { text: label || (ok ? 'Correct. ' : 'Not quite. ') }),
      el('span', { html: html || '' })
    ]));
  }

  function renderQuestion(item, done) {
    var q = item.q, box = el('div', { 'class': 'qbox' });
    box.appendChild(el('div', { 'class': 'q', html: q.q }));
    var answered = false;
    function finish(ok, why, label) {
      if (answered) return; answered = true;
      markSeen(item.key);
      feedback(box, ok, why, label);
      done(ok, box);
    }

    if (q.type === 'mcq' || q.type === 'multi') {
      var multi = q.type === 'multi', want = multi ? q.a.slice().sort().join(',') : null;
      var order = shuffle(q.opts.map(function (_, i) { return i; }));
      var btns = order.map(function (i) {
        var b = el('button', { 'class': 'opt', html: q.opts[i] });
        b.dataset.i = i;
        b.onclick = function () {
          if (answered) return;
          if (multi) { b.classList.toggle('picked'); return; }
          reveal([i]);
        };
        box.appendChild(b);
        return b;
      });
      function reveal(picked) {
        var ok = multi ? picked.slice().sort().join(',') === want : picked[0] === q.a;
        btns.forEach(function (b) {
          var i = +b.dataset.i, right = multi ? q.a.indexOf(i) >= 0 : i === q.a;
          if (right) b.classList.add('correct');
          if (picked.indexOf(i) >= 0 && !right) b.classList.add('wrong');
          b.disabled = true;
        });
        finish(ok, q.why);
      }
      if (multi) {
        box.appendChild(el('p', { 'class': 'note', text: 'Select every option that applies, then submit.' }));
        box.appendChild(el('button', { 'class': 'btn', text: 'Submit', onclick: function () {
          if (answered) return;
          reveal(btns.filter(function (b) { return b.classList.contains('picked'); }).map(function (b) { return +b.dataset.i; }));
        } }));
      }
    } else if (q.type === 'num') {
      var inp = el('input', { type: 'text', 'class': 'numin', placeholder: 'your answer', inputmode: 'decimal' });
      var go = el('button', { 'class': 'btn', text: 'Check' });
      function check() {
        if (answered) return;
        var raw = inp.value.trim().replace(/,/g, '').replace(/\s/g, '');
        if (!raw) return;
        var expr = raw.replace(/\^/g, '**'), v = NaN;
        if (/^[0-9.e+\-*\/()]+$/.test(expr)) { try { v = Number(Function('"use strict";return (' + expr + ')')()); } catch (e) { v = NaN; } }
        var ok = isFinite(v) && Math.abs(v - q.a) <= (q.tol || 0) + 1e-9;
        inp.disabled = true; go.disabled = true;
        finish(ok, 'Answer: <strong>' + q.a + '</strong>. ' + (q.why || ''));
      }
      go.onclick = check;
      inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
      box.appendChild(el('div', { 'class': 'row' }, [inp, go]));
    } else if (q.type === 'free') {
      var ta = el('textarea', { rows: 5, placeholder: 'Write your answer in full before looking. A sketch in words is fine; "because it is faster" is not.' });
      var commit = el('button', { 'class': 'btn', text: 'Commit, then compare', disabled: true });
      ta.oninput = function () { commit.disabled = ta.value.trim().length < 25; };
      box.appendChild(ta);
      box.appendChild(commit);
      commit.onclick = function () {
        ta.readOnly = true; commit.disabled = true;
        var checks = q.rubric.map(function (r) {
          var cb = el('input', { type: 'checkbox' });
          return { cb: cb, row: el('label', { 'class': 'rub' }, [cb, el('span', { html: r })]) };
        });
        var grade = el('button', { 'class': 'btn', text: 'Grade my answer' });
        var copy = el('button', { 'class': 'btn ghost', text: 'Copy for Claude to check' });
        copy.onclick = function () {
          var txt = 'Please grade my answer strictly.\nQuestion: ' + tmp(q.q) + '\nMy answer: ' + ta.value;
          try { navigator.clipboard.writeText(txt); copy.textContent = 'Copied'; } catch (e) { copy.textContent = 'Copy failed'; }
        };
        box.appendChild(el('div', { 'class': 'model' }, [
          el('div', { 'class': 'label', text: 'Model answer' }), el('div', { html: q.model }),
          el('div', { 'class': 'label', text: 'Tick only what YOUR answer said, in substance. Recognising it now does not count.' })
        ].concat(checks.map(function (c) { return c.row; })).concat([el('div', { 'class': 'row' }, [grade, copy])])));
        grade.onclick = function () {
          grade.disabled = true;
          checks.forEach(function (c) { c.cb.disabled = true; });
          var ok = checks.every(function (c) { return c.cb.checked; });
          finish(ok, ok ? 'Your argument has every required piece.' :
            'Missing pieces count as a miss: an argument with a gap is not a proof. Rewrite it in full in your head before moving on.');
        };
      };
    }
    return box;
  }
  function tmp(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* Serve items one at a time.
   * mode 'mastery': stop once `need` correct (pass) or misses > maxMiss (fail).
   * mode 'all': ask everything; pass iff misses <= maxMiss. */
  function runPool(host, items, opt) {
    var i = 0, right = 0, miss = 0, results = [];
    var meter = el('div', { 'class': 'meter' });
    host.appendChild(meter);
    var stage = el('div');
    host.appendChild(stage);
    function upd() {
      meter.textContent = opt.mode === 'mastery'
        ? 'Correct ' + right + ' of ' + opt.need + ' needed · misses ' + miss + ' of ' + opt.maxMiss + ' allowed'
        : 'Question ' + Math.min(i + 1, items.length) + ' of ' + items.length + ' · misses so far ' + miss;
    }
    function end() {
      var pass = opt.mode === 'mastery' ? right >= opt.need && miss <= opt.maxMiss : miss <= opt.maxMiss;
      stage.innerHTML = '';
      meter.remove();
      opt.onDone(pass, results);
    }
    function next() {
      if (opt.mode === 'mastery' && (right >= opt.need || miss > opt.maxMiss)) return end();
      if (i >= items.length) return end();
      upd();
      stage.innerHTML = '';
      var item = items[i++];
      stage.appendChild(renderQuestion(item, function (ok, box) {
        results.push({ item: item, ok: ok });
        if (ok) right++; else miss++;
        upd();
        var last = (opt.mode === 'mastery' && (right >= opt.need || miss > opt.maxMiss)) || i >= items.length;
        box.appendChild(el('button', { 'class': 'btn next', text: last ? 'Finish' : 'Next question', onclick: next }));
      }));
      if (opt.scroll !== false) stage.scrollIntoView({ block: 'nearest' });
    }
    next();
  }

  /* ---------- lesson page ---------- */
  function lessonPage() {
    var id = body.dataset.topic, t = C.topics[id], g = G.topics[id];
    var app = document.getElementById('app');
    var st = store.get('lesson:' + id, { kp: 0, quiz: null });
    function save() { store.set('lesson:' + id, st); }

    app.appendChild(el('nav', { 'class': 'topnav' }, [
      el('a', { 'class': 'home', href: ROOT + 'index.html', text: 'Course home' }),
      el('a', { href: ROOT + 'review.html', text: 'Review' })
    ]));
    app.appendChild(el('p', { 'class': 'eyebrow', text: id + ' · ' + G.modules[g.module] }));
    var h1 = el('h1', { text: g.title });
    app.appendChild(h1);
    app.appendChild(el('div', { 'class': 'lede', html: t.intro }));
    var b = badge(id); if (b) h1.appendChild(b);
    if (!STATE) app.appendChild(el('div', { 'class': 'offline', html: 'Not recording progress. Start the course with <code>python3 tools/serve.py</code> and open <code>http://localhost:8000</code> to save results and get spaced reviews.' }));

    if (g.prereqs.length) {
      var pre = el('div', { 'class': 'prereqs' }, [el('strong', { text: 'Builds on: ' })]);
      g.prereqs.forEach(function (p, i) {
        if (i) pre.appendChild(document.createTextNode(' · '));
        pre.appendChild(topicLink(p));
        var pb = badge(p); if (pb) pre.appendChild(pb);
      });
      var unmet = g.prereqs.filter(function (p) { return STATE && status(p) !== 'mastered'; });
      if (unmet.length) pre.appendChild(el('p', { 'class': 'warn', html: 'Not yet mastered: <strong>' + unmet.join(', ') +
        '</strong>. Mastery learning says finish those first. This lesson will lean on them.' }));
      app.appendChild(pre);
    }

    // Placement: only for topics not yet in the review cycle.
    var s = status(id);
    if (!st.quiz && s !== 'mastered' && s !== 'remediate' && t.quiz && t.quiz.length) {
      var place = el('details', { 'class': 'place' }, [el('summary', { text: 'Think you already know this? Take the placement quiz' })]);
      var ph = el('div');
      place.appendChild(el('p', { html: 'Every question in the end-of-topic quiz, closed book. At most one miss to place out. A proof with a gap counts as a miss. Fail and it simply means: take the lesson.' }));
      place.appendChild(el('button', { 'class': 'btn', text: 'Start placement', onclick: function (e) {
        e.target.remove();
        runPool(ph, pool(t, 'quiz'), { mode: 'all', maxMiss: 1, onDone: function (pass, res) {
          var note = 'placement quiz in lesson page: ' + res.filter(function (r) { return r.ok; }).length + '/' + res.length;
          record(id, 'diagnose', pass ? 'pass' : 'fail', note);
          if (pass) { st.kp = t.kps.length; st.quiz = 'pass'; save(); }
          ph.appendChild(el('div', { 'class': pass ? 'good-box' : 'bad-box', html: pass
            ? 'Placed out. ' + id + ' is now in your spaced-review cycle. The steps below stay open for reference.'
            : 'Not placed. Work through the steps below.' }));
          if (pass) renderSteps();
        } });
      } }));
      place.appendChild(ph);
      app.appendChild(place);
    }

    // Warm-up on key prerequisites: never assume them.
    var warm = el('div');
    app.appendChild(warm);
    if (g.key_prereqs.length && st.kp === 0) {
      loadTopics(g.key_prereqs).then(function (ts) {
        var items = [];
        ts.forEach(function (pt) { if (pt) items = items.concat(pickFresh(pool(pt, 'quiz'), 1)); });
        if (!items.length) return;
        warm.appendChild(el('h2', { text: 'Warm-up: prerequisite check' }));
        warm.appendChild(el('p', { html: 'One question on each key prerequisite (' + g.key_prereqs.join(', ') + '). This lesson uses them directly.' }));
        var wh = el('div', { 'class': 'quiz' });
        warm.appendChild(wh);
        wh.appendChild(el('button', { 'class': 'btn', text: 'Start warm-up', onclick: function (e) {
          e.target.remove();
          runPool(wh, items, { mode: 'all', maxMiss: 99, scroll: false, onDone: function (pass, res) {
            var missed = res.filter(function (r) { return !r.ok; }).map(function (r) { return r.item.topic; });
            wh.appendChild(el('div', { 'class': missed.length ? 'bad-box' : 'good-box', html: missed.length
              ? 'You missed a prerequisite: <strong>' + missed.join(', ') + '</strong>. Revisit it first (links above). This lesson builds on it.'
              : 'Prerequisites solid. On to step 1.' }));
          } });
        } }));
      });
    }

    var stepsHost = el('div');
    app.appendChild(stepsHost);
    var quizHost = el('div');
    app.appendChild(quizHost);

    function renderSteps() {
      stepsHost.innerHTML = '';
      t.kps.forEach(function (kp, k) {
        var done = k < st.kp, active = k === st.kp;
        var sec = el('section', { 'class': 'kp ' + (done ? 'done' : active ? 'active' : 'locked') });
        sec.appendChild(el('h2', { html: '<span class="stepno">Step ' + (k + 1) + ' of ' + t.kps.length + '</span> ' + kp.title }));
        if (!done && !active) { sec.appendChild(el('p', { 'class': 'note', text: 'Locked until the previous step is mastered.' })); stepsHost.appendChild(sec); return; }
        var teach = el('div', { 'class': 'teach', html: kp.teach });
        if (done) {
          var det = el('details', {}, [el('summary', { text: 'Mastered: reopen the explanation' }), teach]);
          sec.appendChild(det);
        } else {
          sec.appendChild(teach);
          var qh = el('div', { 'class': 'quiz' });
          sec.appendChild(qh);
          var need = Math.min(3, kp.qs.length), items = kp.qs.map(function (q, i) { return { q: q, key: id + ':' + k + ':' + i, topic: id }; });
          if (store.get('retry:' + id + ':' + k)) items = shuffle(items);
          qh.appendChild(el('p', { html: '<strong>Your turn.</strong> ' + need + ' correct to move on; a second miss sends you back to the prerequisites.' }));
          qh.appendChild(el('button', { 'class': 'btn', text: 'Start questions', onclick: function (e) {
            e.target.remove();
            runPool(qh, items, { mode: 'mastery', need: need, maxMiss: 1, onDone: function (pass) {
              if (pass) { st.kp = k + 1; save(); store.set('retry:' + id + ':' + k, false); renderSteps(); renderQuiz(); return; }
              store.set('retry:' + id + ':' + k, true);
              var links = el('p');
              g.key_prereqs.forEach(function (p, i) { if (i) links.appendChild(document.createTextNode(' · ')); links.appendChild(topicLink(p)); });
              qh.appendChild(el('div', { 'class': 'bad-box' }, [
                el('p', { html: '<strong>Two misses on this step: stop here.</strong> Pushing on now builds on a crack. ' +
                  'Reread the explanation above slowly, redo the worked example on paper without looking, and review the key prerequisites:' }),
                g.key_prereqs.length ? links : el('p', { text: '(this step has no earlier topic behind it; the gap is inside the explanation above)' }),
                el('p', { text: 'Best of all: come back tomorrow. A rest and a fresh look usually clear it.' }),
                el('button', { 'class': 'btn', text: 'Retry this step (new question order)', onclick: renderSteps })
              ]));
            } });
          } }));
        }
        stepsHost.appendChild(sec);
      });
    }

    function renderQuiz() {
      quizHost.innerHTML = '';
      var sec = el('section', { 'class': 'kp ' + (st.kp >= t.kps.length ? 'active' : 'locked') });
      sec.appendChild(el('h2', { text: 'End-of-topic quiz' }));
      quizHost.appendChild(sec);
      if (st.kp < t.kps.length) { sec.appendChild(el('p', { 'class': 'note', text: 'Unlocks after every step is mastered.' })); return; }
      if (st.quiz === 'pass') {
        sec.appendChild(el('div', { 'class': 'good-box', html: 'Passed. ' + id + ' is in your spaced-review cycle. <a href="' + ROOT + 'review.html">Reviews</a> will bring it back just before you would forget it.' }));
      } else {
        sec.appendChild(el('p', { html: '<strong>Closed book.</strong> Every step, mixed and unlabelled, including shapes you have not seen. The explanations above are collapsed. Don\'t open them. At most one miss to pass.' }));
        var qh = el('div', { 'class': 'quiz' });
        sec.appendChild(qh);
        qh.appendChild(el('button', { 'class': 'btn', text: 'Start the quiz', onclick: function (e) {
          e.target.remove();
          stepsHost.querySelectorAll('details').forEach(function (d) { d.open = false; });
          runPool(qh, shuffle(pool(t, 'quiz')), { mode: 'all', maxMiss: 1, onDone: function (pass, res) {
            var wrong = res.filter(function (r) { return !r.ok; });
            record(id, 'learn', pass ? 'pass' : 'fail', 'end-of-topic quiz ' + (res.length - wrong.length) + '/' + res.length);
            st.quiz = pass ? 'pass' : null; save();
            qh.appendChild(el('div', { 'class': pass ? 'good-box' : 'bad-box', html: pass
              ? 'Topic mastered. First review is scheduled; it will come back in ' + (STATE ? 'a day or so' : 'your next review') + '.'
              : 'Two or more misses. Reopen the steps those questions came from, then retake the quiz tomorrow; the question order will change.' }));
            if (!pass) qh.appendChild(el('button', { 'class': 'btn', text: 'Retake now anyway', onclick: renderQuiz }));
          } });
        } }));
      }
      if (t.practice && t.practice.length) renderPractice(sec);
      var unlocks = Object.keys(G.topics).filter(function (x) { return G.topics[x].prereqs.indexOf(id) >= 0; });
      if (unlocks.length) {
        var p = el('p', { 'class': 'note' }, ['Unlocks next: ']);
        unlocks.forEach(function (u, i) { if (i) p.appendChild(document.createTextNode(' · ')); p.appendChild(topicLink(u)); });
        sec.appendChild(p);
      }
    }

    function renderPractice(sec) {
      sec.appendChild(el('h2', { text: 'Code it: practice problems' }));
      sec.appendChild(el('p', { html: 'Do these in an editor or on LeetCode, in Java. <strong>Before coding</strong>, say out loud: the pattern, the invariant, why it is correct, and the complexity. Then code, then dry-run one example.' }));
      t.practice.forEach(function (pr) {
        sec.appendChild(el('h3', { html: pr.name + (pr.lc ? ' <span class="lc">' + pr.lc + '</span>' : '') }));
        sec.appendChild(el('div', { html: pr.prompt }));
        if (pr.hint) sec.appendChild(el('details', {}, [el('summary', { text: 'Hint (only after 10 minutes stuck)' }), el('div', { html: pr.hint })]));
        if (pr.solution) sec.appendChild(el('details', {}, [el('summary', { text: 'Solution and why it works' }), el('div', { html: pr.solution })]));
      });
    }

    renderSteps();
    renderQuiz();
    app.appendChild(el('p', { 'class': 'note reset' }, [el('a', { href: '#', text: 'Reset this lesson\'s local step progress', onclick: function (e) {
      e.preventDefault(); store.set('lesson:' + id, { kp: 0, quiz: null }); location.reload();
    } })]));
  }

  /* ---------- review page: spaced, interleaved, closed book ---------- */
  function reviewPage() {
    var app = document.getElementById('app');
    app.appendChild(el('nav', { 'class': 'topnav' }, [el('a', { 'class': 'home', href: ROOT + 'index.html', text: 'Course home' }), el('span')]));
    app.appendChild(el('p', { 'class': 'eyebrow', text: 'Spaced review' }));
    app.appendChild(el('h1', { text: 'Review' }));
    if (!STATE) {
      app.appendChild(el('div', { 'class': 'offline', html: 'The review schedule needs the local server: run <code>python3 tools/serve.py</code> and open <code>http://localhost:8000/review.html</code>. Below you can still build an unrecorded mixed practice set.' }));
      return mixedPractice(app, Object.keys(G.topics));
    }
    var due = STATE.due;
    if (!due.length) {
      app.appendChild(el('p', { 'class': 'lede', text: 'Nothing is due today. Reviewing early earns less credit; the schedule is working. Learn something new instead.' }));
      var mastered = Object.keys(G.topics).filter(function (x) { return status(x) === 'mastered'; });
      if (mastered.length) mixedPractice(app, mastered);
      return;
    }
    app.appendChild(el('p', { 'class': 'lede', html: due.length + ' topic' + (due.length > 1 ? 's' : '') + ' due. Questions are mixed across topics on purpose: spotting <em>which</em> idea applies is half the test. Closed book, no lesson tabs open.' }));
    var ul = el('ul');
    due.forEach(function (d) {
      ul.appendChild(el('li', { html: '<strong>' + d.id + '</strong> ' + d.title + (d.remediate ? ' <span class="badge st-remediate">remediate</span>' : '') +
        (d.covers.length ? ' <span class="note">(also covers ' + d.covers.join(', ') + ')</span>' : '') }));
    });
    app.appendChild(ul);
    var host = el('div', { 'class': 'quiz' });
    app.appendChild(host);
    var loading = el('p', { 'class': 'note', text: 'Loading questions…' });
    host.appendChild(loading);
    loadTopics(due.map(function (d) { return d.id; })).then(function (ts) {
      loading.remove();
      var items = [];
      due.forEach(function (d, i) {
        if (!ts[i]) return;
        var n = d.remediate || d.speed < 1 ? 3 : 2;
        items = items.concat(pickFresh(pool(ts[i]), n));
      });
      host.appendChild(el('button', { 'class': 'btn', text: 'Start review (' + items.length + ' questions)', onclick: function (e) {
        e.target.remove();
        runPool(host, shuffle(items), { mode: 'all', maxMiss: 999, onDone: function (_, res) {
          var by = {};
          res.forEach(function (r) { (by[r.item.topic] = by[r.item.topic] || []).push(r.ok); });
          var list = el('ul');
          var chain = Promise.resolve();
          Object.keys(by).forEach(function (tid) {
            var ok = by[tid].every(Boolean), n = by[tid].filter(Boolean).length;
            chain = chain.then(function () { return record(tid, 'review', ok ? 'pass' : 'fail', 'review page ' + n + '/' + by[tid].length); });
            list.appendChild(el('li', { html: '<strong>' + tid + '</strong> ' + n + '/' + by[tid].length + ' · ' + (ok
              ? 'pass: the interval grows'
              : 'fail: the interval shrinks and its key prerequisites come due. <a href="' + lessonHref(tid) + '">Reopen the lesson</a>') }));
          });
          host.appendChild(el('div', { 'class': 'good-box' }, [el('strong', { text: 'Review recorded.' }), list]));
          chain.then(loadState);
        } });
      } }));
    });
  }

  function mixedPractice(app, ids) {
    app.appendChild(el('h2', { text: 'Mixed practice (not recorded)' }));
    var form = el('div', { 'class': 'pick' });
    ids.forEach(function (x) {
      form.appendChild(el('label', {}, [el('input', { type: 'checkbox', value: x }), ' ' + x + ' ' + G.topics[x].title]));
    });
    app.appendChild(form);
    var host = el('div', { 'class': 'quiz' });
    app.appendChild(el('button', { 'class': 'btn', text: 'Build a mixed set (2 per topic)', onclick: function () {
      var pick = Array.prototype.map.call(form.querySelectorAll('input:checked'), function (c) { return c.value; });
      if (!pick.length) return;
      host.innerHTML = '';
      loadTopics(pick).then(function (ts) {
        var items = [];
        ts.forEach(function (t) { if (t) items = items.concat(pickFresh(pool(t), 2)); });
        runPool(host, shuffle(items), { mode: 'all', maxMiss: 999, onDone: function (_, res) {
          host.appendChild(el('div', { 'class': 'good-box', text: res.filter(function (r) { return r.ok; }).length + ' / ' + res.length + ' correct.' }));
        } });
      });
    } }));
    app.appendChild(host);
  }

  /* ---------- section (module) quiz ---------- */
  function sectionPage() {
    var m = new URLSearchParams(location.search).get('m');
    var app = document.getElementById('app');
    app.appendChild(el('nav', { 'class': 'topnav' }, [el('a', { 'class': 'home', href: ROOT + 'index.html', text: 'Course home' }), el('span')]));
    if (!G.modules[m]) { app.appendChild(el('p', { text: 'Unknown section.' })); return; }
    app.appendChild(el('p', { 'class': 'eyebrow', text: 'Section quiz · ' + m }));
    app.appendChild(el('h1', { text: G.modules[m] }));
    var order = Object.keys(G.modules), mine = Object.keys(G.topics).filter(function (x) { return G.topics[x].module === m; });
    var earlier = Object.keys(G.topics).filter(function (x) {
      return order.indexOf(G.topics[x].module) < order.indexOf(m) && (!STATE || status(x) === 'mastered');
    });
    var extra = shuffle(earlier).slice(0, 3);
    app.appendChild(el('p', { 'class': 'lede', html: 'Everything in this section, cumulative and mixed: two questions per topic (' + mine.join(', ') +
      ')' + (extra.length ? ', plus one each from earlier sections (' + extra.join(', ') + ')' : '') + '. Closed book. Each topic passes only with no misses.' }));
    var host = el('div', { 'class': 'quiz' });
    app.appendChild(host);
    var sloading = el('p', { 'class': 'note', text: 'Loading questions…' });
    host.appendChild(sloading);
    loadTopics(mine.concat(extra)).then(function (ts) {
      sloading.remove();
      var items = [];
      ts.forEach(function (t, i) { if (t) items = items.concat(pickFresh(pool(t), i < mine.length ? 2 : 1)); });
      host.appendChild(el('button', { 'class': 'btn', text: 'Start (' + items.length + ' questions)', onclick: function (e) {
        e.target.remove();
        runPool(host, shuffle(items), { mode: 'all', maxMiss: 999, onDone: function (_, res) {
          var by = {};
          res.forEach(function (r) { (by[r.item.topic] = by[r.item.topic] || []).push(r.ok); });
          var list = el('ul'), chain = Promise.resolve();
          Object.keys(by).forEach(function (tid) {
            var ok = by[tid].every(Boolean);
            if (status(tid) === 'mastered' || status(tid) === 'remediate')
              chain = chain.then(function () { return record(tid, 'review', ok ? 'pass' : 'fail', 'section quiz ' + m); });
            list.appendChild(el('li', { html: '<strong>' + tid + '</strong> ' + (ok ? 'solid' : 'missed. <a href="' + lessonHref(tid) + '">revisit</a>') }));
          });
          host.appendChild(el('div', { 'class': 'good-box' }, [el('strong', { text: 'Section quiz done.' }), list]));
        } });
      } }));
    });
  }

  /* ---------- home dashboard ---------- */
  function homePage() {
    var dash = document.getElementById('dash'), mods = document.getElementById('modules');
    if (!STATE) {
      dash.appendChild(el('div', { 'class': 'offline', html: '<strong>Start here:</strong> run <code>python3 tools/serve.py</code> in the course folder and open <code>http://localhost:8000</code>. ' +
        'That records your results and schedules your reviews. Without it, lessons work but nothing is saved.' }));
    } else {
      var box = el('div', { 'class': 'panel' });
      box.appendChild(el('h3', { text: 'Today, in this order' }));
      var ol = el('ol');
      ol.appendChild(el('li', { html: STATE.due.length
        ? '<a href="review.html"><strong>Review ' + STATE.due.length + ' due topic' + (STATE.due.length > 1 ? 's' : '') + '</strong></a> (' + STATE.due.map(function (d) { return d.id; }).join(', ') + ')'
        : 'No reviews due.' }));
      if (STATE.diagnose.length) {
        var li = el('li', { html: '<strong>Placement:</strong> take the placement quiz at the top of: ' });
        STATE.diagnose.forEach(function (x, i) { if (i) li.appendChild(document.createTextNode(' · ')); li.appendChild(topicLink(x)); });
        ol.appendChild(li);
      }
      if (STATE.ready.length) {
        var li2 = el('li', { html: '<strong>Learn</strong> (your frontier): ' });
        STATE.ready.forEach(function (x, i) { if (i) li2.appendChild(document.createTextNode(' · ')); li2.appendChild(topicLink(x)); });
        ol.appendChild(li2);
      }
      box.appendChild(ol);
      if (STATE.unverifiedAbove) box.appendChild(el('p', { 'class': 'note', text: STATE.unverifiedAbove + ' more unverified topics unlock for placement as the ones below them are mastered.' }));
      dash.appendChild(box);
    }
    Object.keys(G.modules).forEach(function (m) {
      var ids = Object.keys(G.topics).filter(function (x) { return G.topics[x].module === m; });
      var div = el('div', { 'class': 'module' }, [el('h3', { text: m + ' · ' + G.modules[m] })]);
      var ul = el('ul', { 'class': 'steps' });
      ids.forEach(function (x) {
        var li = el('li', {}, [el('span', { 'class': 'steplabel', text: x }), el('a', { href: lessonHref(x), text: G.topics[x].title })]);
        var b = badge(x); if (b) li.appendChild(b);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      var allDone = STATE && ids.every(function (x) { return status(x) === 'mastered'; });
      div.appendChild(el('p', { 'class': 'note' }, [el('a', { href: 'section.html?m=' + m, text: 'Section quiz' }),
        document.createTextNode(allDone ? ': all topics mastered, take it now' : ': cumulative; best once every topic above is mastered')]));
      mods.appendChild(div);
    });
  }

  window.addEventListener('load', function () {
    loadState().then(function () {
      var page = body.dataset.page;
      if (page === 'lesson') lessonPage();
      else if (page === 'review') reviewPage();
      else if (page === 'section') sectionPage();
      else if (page === 'home') homePage();
    });
  });
})();
