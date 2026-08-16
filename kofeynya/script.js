/* ============ «Тёплый уголок» — интерактив ============ */

/* =========================================================================
   НАСТРОЙКИ — заполняются при внедрении.
   Пока пусто: аналитика не грузится, бронь работает в демо-режиме.
   ========================================================================= */
var CFG = {
  YM_ID: '',        // ID Яндекс.Метрики
  GA_ID: '',        // ID Google Analytics 4
  LEAD_URL: '',     // адрес обработчика броней (POST JSON)
  TG_TOKEN: '',     // токен Telegram-бота
  TG_CHAT: ''       // id чата для уведомлений
};

/* ---------- аналитика (только при заполненном ID) ---------- */
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

/* ============ ПАРАЛЛАКС В ХИРО ============
   Фон смещается медленнее контента. Отключается при
   prefers-reduced-motion и когда хиро ушёл из вида.            */
(function(){
  var bg=document.getElementById('heroBg'), hero=document.querySelector('.hero');
  if(!bg||!hero) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var visible=true, ticking=false;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ visible=e[0].isIntersecting; },{threshold:0}).observe(hero);
  }
  function move(){
    ticking=false;
    if(!visible) return;
    bg.style.transform='translate3d(0,'+(window.pageYOffset*0.35)+'px,0)';
  }
  window.addEventListener('scroll',function(){
    if(!ticking){ ticking=true; requestAnimationFrame(move); }
  },{passive:true});
  move();
})();

/* ============ МЕНЮ: ТАБЫ С ПЛАВНОЙ СМЕНОЙ ============ */
(function(){
  var grid=document.getElementById('menuGrid'), tabs=document.getElementById('tabs');
  if(!grid||!tabs) return;

  /* img — ключевые слова для тематического фото (латиницей, через запятую).
     Картинки берём с loremflickr: подбирает снимок по этим словам.
     lock фиксирует конкретное фото, чтобы оно не менялось при каждой загрузке. */
  var DATA={
    coffee:[
      {img:'espresso,coffee',n:'Эспрессо',d:'Двойной, на зерне нашей обжарки. Плотный, с оттенком тёмного шоколада.',p:'190 ₽'},
      {img:'cappuccino,coffee',n:'Капучино',d:'Классические 250 мл. Молоко взбиваем до плотной бархатной пены.',p:'290 ₽'},
      {img:'caramel,latte',n:'Раф на солёной карамели',d:'Наш самый заказываемый напиток. Сливочный, с лёгкой солёной ноткой.',p:'380 ₽'},
      {img:'pourover,coffee',n:'Фильтр V60',d:'Ручное заваривание, зерно недели. Раскрывается ягодной кислинкой.',p:'320 ₽'},
      {img:'flatwhite,coffee',n:'Флэт уайт',d:'Двойной эспрессо и немного молока. Для тех, кто любит покрепче.',p:'310 ₽'},
      {img:'icedcoffee,latte',n:'Айс-латте',d:'Со льдом и холодным молоком. Летом уходит быстрее всего.',p:'340 ₽'}
    ],
    author:[
      {img:'orange,coffee',n:'Бумбл',d:'Апельсиновый фреш, эспрессо и лёд. Бодрит лучше всего, что мы пробовали.',p:'390 ₽'},
      {img:'lavender,latte',n:'Лавандовый латте',d:'Домашний лавандовый сироп, который варим сами. Пахнет летним полем.',p:'400 ₽'},
      {img:'hotchocolate,cocoa',n:'Какао на тёмном шоколаде',d:'Плавим настоящий шоколад 70%, добавляем щепотку морской соли.',p:'360 ₽'},
      {img:'matcha,latte',n:'Матча с фисташкой',d:'Церемониальная матча, фисташковая паста и молоко на выбор.',p:'420 ₽'},
      {img:'seabuckthorn,drink',n:'Облепиха с розмарином',d:'Горячий напиток на зиму: облепиха, мёд и веточка розмарина.',p:'350 ₽'},
      {img:'coldbrew,coffee',n:'Колд брю',d:'Настаиваем 16 часов на холодной воде. Мягкий, без горечи.',p:'330 ₽'}
    ],
    breakfast:[
      {img:'cheese,pancakes',n:'Сырники со сметаной',d:'Четыре штуки, из деревенского творога. Подаём с домашним джемом.',p:'450 ₽'},
      {img:'avocado,toast',n:'Авокадо-тост',d:'Хлеб на закваске, авокадо, яйцо пашот, семечки и хлопья чили.',p:'520 ₽'},
      {img:'oatmeal,pear',n:'Овсяная каша с грушей',d:'На молоке или воде. С карамелизованной грушей и грецким орехом.',p:'380 ₽'},
      {img:'scrambledeggs,salmon',n:'Скрэмбл с лососем',d:'Три яйца, слабосолёный лосось, микрозелень, тост на закваске.',p:'590 ₽'},
      {img:'pancakes,berries',n:'Панкейки с ягодами',d:'Стопка из трёх штук, сезонные ягоды и кленовый сироп.',p:'480 ₽'},
      {img:'shakshuka,eggs',n:'Шакшука',d:'Яйца в томатном соусе с болгарским перцем, подаём в сковороде.',p:'540 ₽'}
    ],
    dessert:[
      {img:'cheesecake,dessert',n:'Чизкейк Нью-Йорк',d:'Классический, на песочной основе. Печём каждое утро.',p:'390 ₽'},
      {img:'layercake,cream',n:'Наполеон',d:'Двенадцать слоёв и заварной крем. По рецепту бабушки нашего шеф-кондитера.',p:'420 ₽'},
      {img:'honeycake,cake',n:'Медовик',d:'Тонкие коржи, сметанный крем, ночь на пропитку. Не приторный.',p:'400 ₽'},
      {img:'lemontart,meringue',n:'Тарт с лимонным курдом',d:'Хрустящая основа, кислый курд и обожжённая меренга сверху.',p:'430 ₽'},
      {img:'brownie,chocolate',n:'Брауни с фундуком',d:'Плотный, влажный внутри. Подаём тёплым с шариком мороженого.',p:'380 ₽'},
      {img:'croissant,bakery',n:'Круассан',d:'Слоёный, на французском масле. Есть пустой, с миндалём и с шоколадом.',p:'250 ₽'}
    ],
    tea:[
      {img:'oolong,tea',n:'Улун Те Гуань Инь',d:'Заваривается в чайнике на 500 мл, выдерживает пять проливов.',p:'450 ₽'},
      {img:'seabuckthorn,tea',n:'Облепиховый чай',d:'Свежая облепиха, апельсин, мёд и имбирь. Спасает в мороз.',p:'390 ₽'},
      {img:'mint,tea',n:'Марокканская мята',d:'Зелёный чай с большим пучком свежей мяты и тростниковым сахаром.',p:'370 ₽'},
      {img:'puerh,tea',n:'Пуэр',d:'Выдержанный шу пуэр, глубокий и землистый. Хорошо после плотного обеда.',p:'480 ₽'},
      {img:'herbal,tea',n:'Иван-чай с чабрецом',d:'Ферментированный, собран в Вологодской области.',p:'340 ₽'},
      {img:'berry,drink',n:'Ягодный морс',d:'Домашний, из брусники и клюквы. Подаём горячим или холодным.',p:'290 ₽'}
    ]
  };

  var lock=0;   // сквозной номер, чтобы у каждой позиции было своё фото
  function render(cat){
    var items=DATA[cat]||[];
    grid.innerHTML=items.map(function(i,k){
      var src='https://loremflickr.com/560/380/'+i.img+'?lock='+(lock+k+1);
      return '<article class="dish">'+
        '<img src="'+src+'" alt="'+i.n+'" loading="lazy">'+
        '<div class="dish__b"><div class="dish__t"><h3>'+i.n+'</h3><span class="dish__p">'+i.p+'</span></div>'+
        '<p>'+i.d+'</p></div></article>';
    }).join('');
  }
  // у каждой категории свой диапазон lock, иначе фото повторялись бы
  var CATS=['coffee','author','breakfast','dessert','tea'];

  tabs.addEventListener('click',function(e){
    var b=e.target.closest('.tab'); if(!b) return;
    tabs.querySelectorAll('.tab').forEach(function(x){ x.classList.toggle('on',x===b); });
    grid.classList.add('fade');                    // плавное затухание
    setTimeout(function(){
      lock=CATS.indexOf(b.dataset.cat)*10;
      render(b.dataset.cat);
      grid.classList.remove('fade');
    },260);
  });

  lock=0; render('coffee');
})();

/* ============ ЛАЙТБОКС ГАЛЕРЕИ ============ */
(function(){
  var gal=document.getElementById('gal'), lb=document.getElementById('lb');
  if(!gal||!lb) return;
  var img=document.getElementById('lbImg'), cap=document.getElementById('lbCap'),
      shots=[].slice.call(gal.querySelectorAll('img')), i=0;

  function open(k){
    i=(k+shots.length)%shots.length;
    var s=shots[i];
    img.src=s.src.replace('/500/500','/1400/1000');
    img.alt=s.alt;
    cap.textContent=s.alt+' · '+(i+1)+' из '+shots.length;
    lb.classList.add('on');
    document.body.style.overflow='hidden';
  }
  function close(){ lb.classList.remove('on'); document.body.style.overflow=''; }

  gal.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(b) open(+b.dataset.i);
  });
  document.getElementById('lbX').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',function(e){ e.stopPropagation(); open(i-1); });
  document.getElementById('lbNext').addEventListener('click',function(e){ e.stopPropagation(); open(i+1); });
  lb.addEventListener('click',function(e){ if(e.target===lb) close(); });   // клик вне фото
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('on')) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') open(i-1);
    if(e.key==='ArrowRight') open(i+1);
  });
})();

/* ============ ФОРМА БРОНИРОВАНИЯ ============ */
(function(){
  var f=document.getElementById('book-form'); if(!f) return;
  var ok=document.getElementById('ok'), dateEl=document.getElementById('d');

  // минимальная дата — сегодня, по умолчанию тоже сегодня
  var today=new Date(); today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  var iso=today.toISOString().slice(0,10);
  dateEl.min=iso; dateEl.value=iso;

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
      var text='☕ Бронь столика — Тёплый уголок\n\nИмя: '+d.name+'\nТелефон: '+d.phone+
        '\nДата: '+d.date+' в '+d.time+'\nГостей: '+d.guests+'\nПожелания: '+(d.comment||'—');
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
        p=document.getElementById('p').value.trim(),
        d=dateEl.value, t=document.getElementById('t').value,
        g=document.getElementById('g').value, c=document.getElementById('c').value.trim();

    var digits=p.replace(/\D/g,'');
    var okN=bad('n',n.length<2);
    var okP=bad('p',!(digits.length===11&&/^[78]/.test(digits)));
    var okD=bad('d',!d||d<iso);
    var okT=bad('t',!t||t<'08:00'||t>'23:00');
    if(!(okN&&okP&&okD&&okT)) return;

    var btn=f.querySelector('button[type=submit]'), label=btn.textContent;
    btn.disabled=true; btn.textContent='Отправляем…';

    send({name:n,phone:p,date:d,time:t,guests:g,comment:c})
      .then(function(){
        f.querySelectorAll('input,select,button').forEach(function(el){ el.disabled=true; });
        ok.classList.add('on');
        ok.scrollIntoView({behavior:'smooth',block:'center'});
        toast('✓ Бронь принята — перезвоним в течение 30 минут');
        goal('booking');
      })
      .catch(function(){
        btn.disabled=false; btn.textContent=label;
        toast('Не удалось отправить. Позвоните нам: +7 (495) 987-65-43');
      });
  });

  ['n','p','d','t'].forEach(function(id){
    document.getElementById(id).addEventListener('input',function(){
      this.classList.remove('bad');
      document.getElementById('e-'+id).classList.remove('on');
    });
  });
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

/* ============ ЗАГЛУШКА ДОСТАВКИ ============ */
(function(){
  var a=document.getElementById('deliveryLink'); if(!a) return;
  a.addEventListener('click',function(e){
    e.preventDefault();
    toast('Доставка запускается осенью. Пока привозим только по соседним домам — спросите на месте');
  });
})();

/* ============ STICKY CTA ============ */
(function(){
  var bar=document.querySelector('.scta'), hero=document.querySelector('.hero');
  if(!bar||!hero||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(e){ bar.classList.toggle('on',!e[0].isIntersecting); },{threshold:0}).observe(hero);
})();

/* ============ ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ ============
   Класс .js-anim вешаем только если анимацию можно отработать —
   иначе контент виден сразу и страница не «пустеет».            */
(function(){
  var els=document.querySelectorAll('.rv');
  if((window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-anim');

  var io=new IntersectionObserver(function(en){
    en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el,k){ el.style.transitionDelay=(k%3*90)+'ms'; io.observe(el); });

  // страховка на случай нестандартного скролл-контейнера
  setTimeout(function(){
    document.querySelectorAll('.rv:not(.on)').forEach(function(el){
      if(el.getBoundingClientRect().top < innerHeight*1.5) el.classList.add('on');
    });
  },4000);
})();
