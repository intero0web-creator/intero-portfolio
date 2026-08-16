/* ============ «Абзац» — интерактив лендинга ============ */

/* =========================================================================
   НАСТРОЙКИ — заполняются при внедрении.
   Пусто: аналитика не грузится, форма работает в демо-режиме.
   ========================================================================= */
var CFG = {
  YM_ID: '', GA_ID: '',
  LEAD_URL: '',            // POST JSON на ваш обработчик/CRM
  TG_TOKEN: '', TG_CHAT: '',
  DEADLINE: '2026-09-01T00:00:00'   // до какой даты идёт набор со скидкой
};

/* ---------- аналитика ---------- */
(function () {
  if (CFG.YM_ID) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);})
    (window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(CFG.YM_ID,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  if (CFG.GA_ID) {
    var s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+CFG.GA_ID;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date()); gtag('config',CFG.GA_ID);
  }
})();
function goal(n){ if(CFG.YM_ID&&window.ym) ym(CFG.YM_ID,'reachGoal',n); if(CFG.GA_ID&&window.gtag) gtag('event',n); }

/* ---------- тост ---------- */
function toast(msg){
  var t=document.createElement('div'); t.className='toast'; t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('on'); });
  setTimeout(function(){ t.classList.remove('on'); setTimeout(function(){ t.remove(); },400); },3600);
}

/* ---------- мобильное меню ---------- */
(function(){
  var b=document.getElementById('burger'), m=document.getElementById('mnav');
  if(!b||!m) return;
  b.addEventListener('click',function(){ m.classList.toggle('on'); });
  m.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ m.classList.remove('on'); }); });
})();

/* ============ ТАЙМЕР ОБРАТНОГО ОТСЧЁТА ============
   Реальный отсчёт до даты из CFG.DEADLINE. Если дата прошла —
   автоматически берём следующий понедельник, чтобы демо не «протухло». */
(function(){
  var D=document.getElementById('t-d'), H=document.getElementById('t-h'),
      M=document.getElementById('t-m'), S=document.getElementById('t-s'),
      DL=document.getElementById('t-dl');
  if(!D) return;

  var end=new Date(CFG.DEADLINE).getTime();
  if(!end || end<Date.now()){
    var n=new Date(); n.setHours(0,0,0,0);
    n.setDate(n.getDate()+((8-n.getDay())%7||7));   // ближайший понедельник
    end=n.getTime();
  }
  function pad(v){ return v<10?'0'+v:''+v; }
  function word(d){
    var a=d%10, b=d%100;
    if(a===1&&b!==11) return 'день';
    if(a>=2&&a<=4&&(b<10||b>=20)) return 'дня';
    return 'дней';
  }
  function tick(){
    var left=end-Date.now();
    if(left<=0){ D.textContent=H.textContent=M.textContent=S.textContent='00'; return; }
    var sec=Math.floor(left/1000), d=Math.floor(sec/86400),
        h=Math.floor(sec%86400/3600), m=Math.floor(sec%3600/60), s=sec%60;
    D.textContent=pad(d); H.textContent=pad(h); M.textContent=pad(m); S.textContent=pad(s);
    DL.textContent=word(d);
  }
  tick(); setInterval(tick,1000);
})();

/* ============ ПРОГРАММА: АККОРДЕОН + ПРОГРЕСС-БАР ============
   Полоса заполняется по числу модулей, которые пользователь раскрыл
   хотя бы раз. Эффект визуальный — реального прогресса обучения нет. */
(function(){
  var wrap=document.getElementById('mods');
  if(!wrap) return;
  var mods=[].slice.call(wrap.querySelectorAll('.mod')),
      fill=document.getElementById('progFill'),
      txt=document.getElementById('progTxt'),
      pct=document.getElementById('progPct'),
      seen={};

  function updateProgress(){
    var n=Object.keys(seen).length, p=Math.round(n/mods.length*100);
    fill.style.width=p+'%';
    txt.textContent=n+' из '+mods.length;
    pct.textContent=p+'%';
  }

  mods.forEach(function(mod,i){
    var head=mod.querySelector('.mod__h'), body=mod.querySelector('.mod__b');
    head.setAttribute('role','button');
    head.setAttribute('tabindex','0');

    function toggle(){
      var open=mod.classList.toggle('on');
      body.style.maxHeight = open ? (body.scrollHeight+'px') : '0px';
      if(open && !seen[i]){ seen[i]=1; updateProgress(); }
    }
    head.addEventListener('click',toggle);
    head.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
    });
  });

  // пересчёт высоты при смене ширины окна (текст переносится иначе)
  window.addEventListener('resize',function(){
    mods.forEach(function(m){
      if(m.classList.contains('on')){
        var b=m.querySelector('.mod__b');
        b.style.maxHeight=b.scrollHeight+'px';
      }
    });
  });

  updateProgress();
})();

/* ============ КАРУСЕЛЬ ОТЗЫВОВ ============ */
(function(){
  var tr=document.getElementById('revTr'); if(!tr) return;
  var n=tr.children.length, i=0, dots=document.getElementById('revDots');
  for(var k=0;k<n;k++){ var d=document.createElement('i'); d.dataset.i=k; dots.appendChild(d); }
  function go(x){
    i=(x+n)%n;
    tr.style.transform='translateX('+(-i*100)+'%)';
    dots.querySelectorAll('i').forEach(function(d,j){ d.classList.toggle('on',j===i); });
  }
  document.getElementById('revPrev').addEventListener('click',function(){ go(i-1); });
  document.getElementById('revNext').addEventListener('click',function(){ go(i+1); });
  dots.addEventListener('click',function(e){ if(e.target.dataset.i) go(+e.target.dataset.i); });
  var timer=setInterval(function(){ go(i+1); },7000);
  tr.parentElement.addEventListener('mouseenter',function(){ clearInterval(timer); });
  go(0);
})();

/* ============ ТАРИФЫ → ФОРМА ============ */
(function(){
  var sel=document.getElementById('t');
  document.querySelectorAll('[data-tarif]').forEach(function(b){
    b.addEventListener('click',function(){
      if(sel) sel.value=b.dataset.tarif;
      toast('Выбран тариф «'+b.dataset.tarif+'» — осталось оставить контакты');
      document.getElementById('form').scrollIntoView({behavior:'smooth'});
      setTimeout(function(){ document.getElementById('n').focus(); },600);
      goal('tarif_'+b.dataset.tarif);
    });
  });
})();

/* ============ ФОРМА ЗАПИСИ ============ */
(function(){
  var f=document.getElementById('lead'); if(!f) return;
  var ok=document.getElementById('ok');

  function bad(id,on){
    document.getElementById(id).classList.toggle('bad',on);
    document.getElementById('e-'+id).classList.toggle('on',on);
    return !on;
  }

  /* отправка: LEAD_URL → POST JSON, либо Telegram, либо демо-режим */
  function send(d){
    if(CFG.LEAD_URL){
      return fetch(CFG.LEAD_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); });
    }
    if(CFG.TG_TOKEN&&CFG.TG_CHAT){
      var text='📝 Заявка на курс «Абзац»\n\nИмя: '+d.name+'\nКонтакт: '+d.contact+
        '\nТариф: '+d.tarif+'\nВопрос: '+(d.question||'—');
      return fetch('https://api.telegram.org/bot'+CFG.TG_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:CFG.TG_CHAT,text:text})
      }).then(function(r){ if(!r.ok) throw new Error(r.status); });
    }
    return Promise.resolve();
  }

  f.addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('n').value.trim(),
        c=document.getElementById('c').value.trim(),
        t=document.getElementById('t').value,
        q=document.getElementById('q').value.trim();

    // контакт: либо телефон +7 (11 цифр), либо email
    var digits=c.replace(/\D/g,'');
    var isPhone=digits.length===11&&/^[78]/.test(digits);
    var isMail=/^[^\s@]+@[^\s@]+\.[a-zа-я]{2,}$/i.test(c);

    var okN=bad('n',n.length<2);
    var okC=bad('c',!(isPhone||isMail));
    if(!(okN&&okC)) return;

    var btn=f.querySelector('button[type=submit]'), label=btn.textContent;
    btn.disabled=true; btn.textContent='Отправляем…';

    send({name:n,contact:c,tarif:t,question:q,page:location.href})
      .then(function(){
        f.querySelectorAll('input,select,button').forEach(function(el){ el.disabled=true; });
        ok.classList.add('on');
        ok.scrollIntoView({behavior:'smooth',block:'center'});
        toast('✓ Заявка отправлена — ответим в течение рабочего дня');
        goal('lead_form');
      })
      .catch(function(){
        btn.disabled=false; btn.textContent=label;
        toast('Не удалось отправить. Напишите нам: hello@abzats.ru');
      });
  });

  ['n','c'].forEach(function(id){
    document.getElementById(id).addEventListener('input',function(){
      this.classList.remove('bad');
      document.getElementById('e-'+id).classList.remove('on');
    });
  });
})();

/* ============ STICKY CTA ============ */
(function(){
  var bar=document.querySelector('.scta'), hero=document.querySelector('.hero');
  if(!bar||!hero||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(e){ bar.classList.toggle('on',!e[0].isIntersecting); },{threshold:0}).observe(hero);
})();

/* ============ ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ============
   .js-anim вешаем только если анимацию реально можно отработать —
   иначе контент виден сразу и страница не «пустеет».            */
(function(){
  var els=document.querySelectorAll('.rv');
  if((window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-anim');

  var io=new IntersectionObserver(function(en){
    en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el,k){ el.style.transitionDelay=(k%3*80)+'ms'; io.observe(el); });

  setTimeout(function(){
    document.querySelectorAll('.rv:not(.on)').forEach(function(el){
      if(el.getBoundingClientRect().top < innerHeight*1.5) el.classList.add('on');
    });
  },4000);
})();
