/* Аналитика */
(function () {
  var C = window.SITE || {};
  if (C.YM_ID) { (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym"); ym(C.YM_ID, "init", { clickmap:true, trackLinks:true }); }
  if (C.GA_ID) { var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + C.GA_ID; document.head.appendChild(s); window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', C.GA_ID); }
})();

/* Config → страница */
(function () {
  var C = window.SITE || {};
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var k = el.getAttribute('data-bind'); if (C[k] != null && C[k] !== '') el.textContent = C[k];
  });
  if (C.phoneRaw) document.querySelectorAll('[data-tel]').forEach(function (el) { el.href = 'tel:' + C.phoneRaw; });
  if (C.email) document.querySelectorAll('[data-mail]').forEach(function (el) { el.href = 'mailto:' + C.email; });
  document.querySelectorAll('[data-social]').forEach(function (el) { var k = el.getAttribute('data-social'); if (C[k]) el.href = C[k]; });
  if (C.name) document.title = C.name + ' — фотограф';
})();

/* Progress-bar */
(function () {
  var bar = document.querySelector('.progress i'); if (!bar) return;
  function upd() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true }); upd();
})();

/* Dot-nav — активация текущего раздела */
(function () {
  var dots = document.querySelectorAll('.dot-nav a'); if (!dots.length) return;
  var sections = Array.from(dots).map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function upd() {
    var y = window.scrollY + window.innerHeight / 3;
    var idx = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) idx = i; });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
  }
  window.addEventListener('scroll', upd, { passive: true }); upd();
})();

/* Reveal on scroll */
(function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
