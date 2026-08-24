// Кромка — клиентский скрипт: подстановка контактов, навигация, форма, интерактивный нож.
(function () {
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function reducedMotion(){return matchMedia('(prefers-reduced-motion: reduce)').matches}

  // ─── подстановка контактов из CFG ──────────────
  function applyConfig(){
    var C=window.CFG||{};
    $$('[data-cfg]').forEach(function(el){
      var key=el.getAttribute('data-cfg');
      var val=C[key];
      var optional=el.closest('[data-cfg-optional]');
      if(val==null||val===''){
        if(optional) optional.style.display='none';
        else el.style.display='none';
        return;
      }
      if(!el.hasAttribute('data-cfg-text-keep')) el.textContent=val;
      var t=el.getAttribute('data-cfg-href');
      if(t==='mailto') el.setAttribute('href','mailto:'+val);
      else if(t==='tel') el.setAttribute('href','tel:'+(C.phoneRaw||val).replace(/[^\d+]/g,''));
      else if(t==='tg')  el.setAttribute('href',C.telegramUrl||('https://t.me/'+String(val).replace('@','')));
    });
    var isDemo=C.DEMO && !C.LEAD_URL && !(C.TG_TOKEN && C.TG_CHAT);
    $$('[data-cfg-demo]').forEach(function(el){el.style.display=isDemo?'':'none'});
  }

  // ─── навигация: scrolled-стиль + мобильное меню + активная секция ──
  function initNav(){
    var nav=$('#nav');
    var toggle=$('#navToggle');
    if(!nav) return;

    if(toggle){
      toggle.addEventListener('click',function(){
        var open=nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded',open?'true':'false');
      });
      // Закрывать меню при клике по ссылке
      $$('.nav-links a',nav).forEach(function(a){
        a.addEventListener('click',function(){
          nav.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded','false');
        });
      });
    }

    // Подсветка активного пункта меню — собрать секции ДО первого вызова onScroll
    var navLinks=$$('.nav-links a[data-nav]',nav);
    var sections=navLinks.map(function(a){
      var id=a.getAttribute('href').replace('#','');
      return {el:document.getElementById(id),link:a};
    }).filter(function(s){return s.el});

    function highlightActive(){
      var scrollY=window.scrollY+120;
      var active=null;
      sections.forEach(function(s){
        if(s.el.offsetTop<=scrollY) active=s;
      });
      navLinks.forEach(function(a){a.classList.remove('active')});
      if(active) active.link.classList.add('active');
    }

    var onScroll=function(){
      nav.classList.toggle('scrolled',window.scrollY>60);
      highlightActive();
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
  }

  // ─── ФОНОВЫЕ ЧАСТИЦЫ ХИРО: искры + металлическая пыль ─────
  function initHeroParticles(){
    var layer=$('#heroParticles');
    if(!layer||reducedMotion()) return;

    var frag=document.createDocumentFragment();

    // Искры — крупнее, ярче, летят от нижнего левого угла (где воображаемый камень)
    for(var i=0;i<10;i++){
      var s=document.createElement('span');
      s.className='bg-spark';
      var startX=5+Math.random()*55;      // % — сосредоточены слева, где на десктопе нож
      var dur=(5+Math.random()*5).toFixed(2);
      var delay=(Math.random()*9).toFixed(2);
      var drift=(Math.random()*40-20).toFixed(0);
      var size=(1.5+Math.random()*2).toFixed(1);
      s.style.left=startX+'%';
      s.style.setProperty('--dur',dur+'s');
      s.style.setProperty('--delay',delay+'s');
      s.style.setProperty('--drift',drift+'px');
      s.style.width=size+'px';
      s.style.height=size+'px';
      frag.appendChild(s);
    }

    // Металлическая пыль — мелкая, медленная, серо-стальная, по всему хиро
    for(var j=0;j<14;j++){
      var d=document.createElement('span');
      d.className='bg-dust';
      var dx=(Math.random()*100).toFixed(1);
      var dy=(Math.random()*100).toFixed(1);
      var ddur=(10+Math.random()*14).toFixed(2);
      var ddelay=(Math.random()*14).toFixed(2);
      var dsize=(0.8+Math.random()*1.4).toFixed(1);
      var dopac=(0.15+Math.random()*0.35).toFixed(2);
      d.style.left=dx+'%';
      d.style.top=dy+'%';
      d.style.setProperty('--dur',ddur+'s');
      d.style.setProperty('--delay',ddelay+'s');
      d.style.width=dsize+'px';
      d.style.height=dsize+'px';
      d.style.setProperty('--opac',dopac);
      frag.appendChild(d);
    }

    layer.appendChild(frag);
  }

  // ─── ИНТЕРАКТИВНЫЙ НОЖ: клик — точило вылетает в сторону курсора ───
  function initKnife(){
    var scene=$('#knifeScene');
    var wrap=$('#knifeWrap');
    var svg=$('.knife-svg',scene);
    var shine=$('#bladeShineRect');
    var whetstone=$('#whetstone');
    var sparkLayer=$('#sparkLayer');
    if(!scene||!wrap||!svg||!whetstone) return;

    var isTouch=matchMedia('(hover: none)').matches;
    var rm=reducedMotion();

    // Опорные точки верхней и нижней грани лезвия (viewBox 400×300, форма из HTML) —
    // нужны, чтобы точило прилетало точно на кромку, а не мимо неё.
    var TOP=[{x:40,y:150},{x:95,y:125},{x:150,y:110},{x:204,y:104},{x:258,y:108}];
    var BOTTOM=[{x:40,y:150},{x:88,y:167},{x:140,y:176},{x:197,y:177},{x:258,y:169}];
    var BLADE_X_MIN=40,BLADE_X_MAX=258;
    var ORIGIN_X=150,ORIGIN_Y=248; // точка, откуда точило стартует каждый раз (снизу-под лезвием)

    function interpY(anchors,x){
      x=clamp(x,anchors[0].x,anchors[anchors.length-1].x);
      for(var i=0;i<anchors.length-1;i++){
        var a=anchors[i],b=anchors[i+1];
        if(x>=a.x&&x<=b.x){
          var t=(x-a.x)/(b.x-a.x);
          return a.y+(b.y-a.y)*t;
        }
      }
      return anchors[anchors.length-1].y;
    }
    function bladeMidY(x){
      return (interpY(TOP,x)+interpY(BOTTOM,x))/2;
    }

    // Плавный 3D-тилт сцены и блик, скользящий за мышью — оставляем как декоративный слой
    if(!isTouch && !rm){
      scene.addEventListener('mousemove',function(e){
        var sceneRect=scene.getBoundingClientRect();
        var x=(e.clientX-sceneRect.left)/sceneRect.width;
        var y=(e.clientY-sceneRect.top)/sceneRect.height;
        var rx=clamp((0.5-y)*16,-12,12);
        var ry=clamp((x-0.5)*22,-18,18);
        scene.classList.add('tilting');
        wrap.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg) translateZ(0)';

        if(shine){
          var svgRect=svg.getBoundingClientRect();
          var lx=(e.clientX-svgRect.left)*(400/svgRect.width);
          shine.setAttribute('x',clamp(lx-90,-60,320));
        }
      });
      scene.addEventListener('mouseleave',function(){
        scene.classList.remove('tilting');
        wrap.style.transform='';
      });
    }

    var flying=false;
    var FLY_MS=420,HOLD_MS=260,FADE_MS=220;

    function flyStoneTo(tx,ty,onArrive){
      whetstone.style.transition='none';
      whetstone.style.opacity='0';
      whetstone.style.transform='translate('+ORIGIN_X+'px,'+ORIGIN_Y+'px) rotate(-22deg) scale(0.85)';
      // форсируем перерасчёт стилей, чтобы следующий переход точно анимировался
      void whetstone.getBoundingClientRect();

      requestAnimationFrame(function(){
        whetstone.style.transition='transform '+FLY_MS+'ms cubic-bezier(0.16,1,0.3,1), opacity 140ms ease';
        whetstone.style.opacity='1';
        whetstone.style.transform='translate('+tx+'px,'+ty+'px) rotate(0deg) scale(1)';
      });

      setTimeout(function(){
        if(onArrive) onArrive();
        setTimeout(function(){
          whetstone.style.transition='opacity '+FADE_MS+'ms ease';
          whetstone.style.opacity='0';
        },HOLD_MS);
      },FLY_MS);
    }

    function sharpenAt(e){
      if(flying||rm) {
        if(rm){ playSharpenSound(); spawnSparks(e.clientX,e.clientY,10,0); }
        return;
      }
      flying=true;
      scene.classList.add('sharpening');

      var svgRect=svg.getBoundingClientRect();
      var scaleX=400/svgRect.width,scaleY=300/svgRect.height;
      var lx=(e.clientX-svgRect.left)*scaleX;
      var ly=(e.clientY-svgRect.top)*scaleY;
      var tx=clamp(lx,BLADE_X_MIN,BLADE_X_MAX);
      var midY=bladeMidY(tx);
      var ty=clamp(ly,midY-18,midY+18);

      playSharpenSound();

      flyStoneTo(tx,ty,function(){
        spawnSparks(e.clientX,e.clientY,14,0);
        spawnSparks(e.clientX+10,e.clientY-6,9,60);
      });

      setTimeout(function(){
        scene.classList.remove('sharpening');
        flying=false;
      },FLY_MS+HOLD_MS+FADE_MS+40);
    }

    scene.addEventListener('click',sharpenAt);

    // Клавиатурная поддержка — целим в центр лезвия
    scene.setAttribute('tabindex','0');
    scene.setAttribute('role','button');
    scene.setAttribute('aria-label','Кликните по ножу — точило вылетит к месту клика');
    scene.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        var rect=svg.getBoundingClientRect();
        sharpenAt({clientX:rect.left+rect.width*0.5,clientY:rect.top+rect.height*0.45});
      }
    });

    function spawnSparks(clientX,clientY,count,delay){
      if(rm) return;
      setTimeout(function(){
        var sceneRect=scene.getBoundingClientRect();
        for(var i=0;i<count;i++){
          var s=document.createElement('span');
          s.className='spark-fx';
          s.style.left=(clientX-sceneRect.left)+'px';
          s.style.top=(clientY-sceneRect.top)+'px';
          var angle=(Math.random()*140-20)*(Math.PI/180); // -20°..120° — вправо-вверх
          var dist=50+Math.random()*140;
          var dx=Math.cos(angle)*dist;
          var dy=-Math.abs(Math.sin(angle)*dist)-Math.random()*30;
          var dur=0.6+Math.random()*0.5;
          s.style.setProperty('--dx',dx+'px');
          s.style.setProperty('--dy',dy+'px');
          s.style.setProperty('--dur',dur+'s');
          sparkLayer.appendChild(s);
          setTimeout(function(el){el.remove()},dur*1000+50,s);
        }
      },delay);
    }
  }

  // Короткий звук заточки — Web Audio, без внешних файлов
  var AC=null;
  function getAC(){
    if(AC) return AC;
    try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
    return AC;
  }
  function playSharpenSound(){
    if(reducedMotion()) return;
    var ctx=getAC();if(!ctx) return;
    try{
      var now=ctx.currentTime,dur=0.5;
      // Белый шум через ScriptProcessor-подобный BufferSource
      var bl=Math.ceil(ctx.sampleRate*dur);
      var buf=ctx.createBuffer(1,bl,ctx.sampleRate);
      var d=buf.getChannelData(0);
      for(var i=0;i<bl;i++) d[i]=(Math.random()*2-1)*(1-i/bl);
      var src=ctx.createBufferSource();src.buffer=buf;
      var fi=ctx.createBiquadFilter();fi.type='bandpass';fi.Q.value=2.8;
      fi.frequency.setValueAtTime(2400,now);
      fi.frequency.exponentialRampToValueAtTime(800,now+dur);
      var g=ctx.createGain();
      g.gain.setValueAtTime(0.0001,now);
      g.gain.exponentialRampToValueAtTime(0.14,now+0.03);
      g.gain.exponentialRampToValueAtTime(0.0001,now+dur);
      src.connect(fi).connect(g).connect(ctx.destination);
      src.start(now);src.stop(now+dur);
    }catch(e){}
  }

  // ─── Форма (с поддержкой прикреплённых фото) ───────────────
  function collectTextFields(form){
    var data={};
    Array.prototype.slice.call(form.elements).forEach(function(el){
      if(!el.name||el.type==='file'||el.type==='submit'||el.type==='button') return;
      if(el.type==='checkbox'){ if(el.checked) data[el.name]=el.value||'да'; return; }
      data[el.name]=String(el.value).trim();
    });
    return data;
  }

  function collectFiles(form){
    var input=form.querySelector('input[type=file]');
    return (input&&input.files)?Array.prototype.slice.call(input.files):[];
  }

  // Отправляет фото в Telegram отдельными запросами: sendPhoto для одного файла,
  // sendMediaGroup — для нескольких (партиями по 10, как требует Bot API).
  function sendTelegramPhotos(C,files,onDone,onErr){
    var base='https://api.telegram.org/bot'+C.TG_TOKEN+'/';
    var chunks=[];
    for(var i=0;i<files.length;i+=10) chunks.push(files.slice(i,i+10));

    function sendChunk(idx){
      if(idx>=chunks.length){onDone();return}
      var chunk=chunks[idx];
      var fd=new FormData();
      fd.append('chat_id',C.TG_CHAT);

      if(chunk.length===1){
        fd.append('photo',chunk[0],chunk[0].name);
        fetch(base+'sendPhoto',{method:'POST',body:fd})
          .then(function(r){r.ok?sendChunk(idx+1):onErr('фото, код '+r.status)})
          .catch(function(){onErr('сеть при отправке фото')});
      } else {
        var media=chunk.map(function(f,i){return{type:'photo',media:'attach://p'+i}});
        fd.append('media',JSON.stringify(media));
        chunk.forEach(function(f,i){fd.append('p'+i,f,f.name)});
        fetch(base+'sendMediaGroup',{method:'POST',body:fd})
          .then(function(r){r.ok?sendChunk(idx+1):onErr('группа фото, код '+r.status)})
          .catch(function(){onErr('сеть при отправке фото')});
      }
    }
    sendChunk(0);
  }

  function submitForm(form){
    var C=window.CFG||{};
    var data=collectTextFields(form);
    var files=collectFiles(form);

    var msg=form.querySelector('.form-msg')||(function(){var m=document.createElement('div');m.className='form-msg';form.appendChild(m);return m})();
    var btn=form.querySelector('button[type=submit]');
    if(btn && !btn.dataset.textInitial) btn.dataset.textInitial=btn.textContent;
    function setState(state,text){
      msg.className='form-msg '+(state||'');msg.textContent=text||'';
      if(btn){btn.disabled=state==='loading';btn.textContent=state==='loading'?'Отправляем…':btn.dataset.textInitial}
    }
    setState('loading','Отправляем…');

    var source=form.getAttribute('data-source')||'Заявка с сайта';
    var brand=C.brand||'Кромка';
    var text='🔪 '+source+' — '+brand;
    Object.keys(data).forEach(function(k){text+='\n'+k+': '+data[k]});
    if(files.length) text+='\nФото: '+files.length+' шт. ('+files.map(function(f){return f.name}).join(', ')+')';

    function ok(demo,note){
      form.reset();
      setState('ok',note||(demo?'Заявка принята. (Демо-режим — реального сообщения не ушло.)':'Спасибо! Отвечу в течение дня — обычно в первой половине.'));
    }
    function fail(reason){
      setState('err','Не отправилось: '+(reason||'сеть')+'. Позвоните напрямую — '+(C.phone||'по контактам'));
    }

    if(C.LEAD_URL){
      // Formspree и подобные сервисы понимают multipart/form-data с файлами «из коробки» —
      // берём реальную FormData прямо из <form>, без ручной JSON-сборки.
      var fd=new FormData(form);
      fd.append('_subject',source+' — '+brand);
      fetch(C.LEAD_URL,{method:'POST',headers:{'Accept':'application/json'},body:fd})
        .then(function(r){r.ok?ok(false):fail('код '+r.status)})
        .catch(function(){fail('сеть')});

    } else if(C.TG_TOKEN && C.TG_CHAT){
      // Сначала текст заявки одним сообщением…
      fetch('https://api.telegram.org/bot'+C.TG_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:C.TG_CHAT,text:text,disable_web_page_preview:true})
      }).then(function(r){
        if(!r.ok){fail('Telegram '+r.status);return}
        if(!files.length){ok(false);return}
        // …затем фото отдельным(и) запросом(ами).
        sendTelegramPhotos(C,files,function(){ok(false)},function(reason){
          ok(false,'Заявка отправлена, но фото не загрузились ('+reason+'). Пришлите их отдельно в Telegram.');
        });
      }).catch(function(){fail('сеть')});

    } else if(C.DEMO){
      console.info('[Кромка · демо-отправка]',{
        source:source,
        data:data,
        files:files.map(function(f){return f.name+' ('+Math.round(f.size/1024)+' КБ)'})
      });
      setTimeout(function(){ok(true)},600);
    } else {
      fail('канал не настроен');
    }
  }

  function initForms(){
    $$('form[data-form]').forEach(function(form){
      form.addEventListener('submit',function(e){
        e.preventDefault();
        if(!form.checkValidity()){form.reportValidity();return}
        submitForm(form);
      });
    });
  }

  ready(function(){
    // Каждый модуль изолирован — если один упадёт, остальные всё равно запустятся.
    [applyConfig,initNav,initKnife,initHeroParticles,initForms].forEach(function(fn){
      try{fn()}catch(e){console.error('[Кромка] ошибка в '+fn.name+':',e)}
    });
  });
})();
