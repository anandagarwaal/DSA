// Shared quiz engine. A page defines a global QUESTIONS array, then includes this script.
// Each question: { q, options:[{t,ok}], good, bad }. Options are shuffled deterministically
// (seeded by SEED + index) so the correct answer isn't always in the same slot, with no
// reliance on Math.random.
(function () {
  var root = document.getElementById('quiz');
  if (!root || typeof QUESTIONS === 'undefined') return;
  var SEED = (typeof QUIZ_SEED !== 'undefined') ? QUIZ_SEED : 5;

  QUESTIONS.forEach(function (item, qi) {
    var wrap = document.createElement('div');
    if (qi > 0) wrap.style.marginTop = '1.4rem';
    var q = document.createElement('p'); q.className = 'q'; q.textContent = item.q;
    wrap.appendChild(q);

    var opts = item.options.map(function (o, i) { return Object.assign({}, o, { i: i }); })
      .sort(function (a, b) {
        return ((qi + SEED) * (a.i + 3)) % 7 - ((qi + SEED) * (b.i + 3)) % 7;
      });

    var fb = document.createElement('div'); fb.className = 'fb';
    var answered = false;

    opts.forEach(function (o) {
      var btn = document.createElement('button');
      btn.className = 'opt'; btn.textContent = o.t;
      btn.onclick = function () {
        if (answered) return; answered = true;
        wrap.querySelectorAll('.opt').forEach(function (b) {
          var matched = item.options.find(function (x) { return x.t === b.textContent; });
          if (matched && matched.ok) b.classList.add('correct');
        });
        if (!o.ok) btn.classList.add('wrong');
        fb.textContent = o.ok ? item.good : item.bad;
        fb.classList.add(o.ok ? 'show-good' : 'show-bad');
      };
      wrap.appendChild(btn);
    });

    wrap.appendChild(fb);
    root.appendChild(wrap);
  });
})();
