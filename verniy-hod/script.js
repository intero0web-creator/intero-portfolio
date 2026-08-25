// Верный ход — клиентский скрипт: подстановка контактов, навигация, форма.
(function () {
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

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

  function initNav(){
    var nav=$('#nav');
    var toggle=$('#navToggle');
    if(!nav) return;

    if(toggle){
      toggle.addEventListener('click',function(){
        var open=nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded',open?'true':'false');
      });
      $$('.nav-links a',nav).forEach(function(a){
        a.addEventListener('click',function(){
          nav.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded','false');
        });
      });
    }

    var navLinks=$$('.nav-links a[data-nav]',nav);
    var sections=navLinks.map(function(a){
      var id=a.getAttribute('href').replace('#','');
      return {el:document.getElementById(id),link:a};
    }).filter(function(s){return s.el});

    function highlightActive(){
      var scrollY=window.scrollY+120;
      var active=null;
      sections.forEach(function(s){if(s.el.offsetTop<=scrollY) active=s});
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

  // Фото — отдельными запросами: sendPhoto для одного файла, sendMediaGroup — для нескольких.
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
    var brand=C.brand||'Верный ход';
    var text='⏱ '+source+' — '+brand;
    Object.keys(data).forEach(function(k){text+='\n'+k+': '+data[k]});
    if(files.length) text+='\nФото: '+files.length+' шт. ('+files.map(function(f){return f.name}).join(', ')+')';

    function ok(demo,note){
      form.reset();
      setState('ok',note||(demo?'Заявка принята. (Демо-режим — реального сообщения не ушло.)':'Спасибо! Отвечу в течение дня.'));
    }
    function fail(reason){
      setState('err','Не отправилось: '+(reason||'сеть')+'. Позвоните напрямую — '+(C.phone||'по контактам'));
    }

    if(C.LEAD_URL){
      // Formspree и подобные сервисы понимают multipart/form-data с файлами «из коробки».
      var fd=new FormData(form);
      fd.append('_subject',source+' — '+brand);
      fetch(C.LEAD_URL,{method:'POST',headers:{'Accept':'application/json'},body:fd})
        .then(function(r){r.ok?ok(false):fail('код '+r.status)})
        .catch(function(){fail('сеть')});

    } else if(C.TG_TOKEN && C.TG_CHAT){
      fetch('https://api.telegram.org/bot'+C.TG_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:C.TG_CHAT,text:text,disable_web_page_preview:true})
      }).then(function(r){
        if(!r.ok){fail('Telegram '+r.status);return}
        if(!files.length){ok(false);return}
        sendTelegramPhotos(C,files,function(){ok(false)},function(reason){
          ok(false,'Заявка отправлена, но фото не загрузились ('+reason+'). Пришлите их отдельно в Telegram.');
        });
      }).catch(function(){fail('сеть')});

    } else if(C.DEMO){
      console.info('[Верный ход · демо-отправка]',{
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
    [applyConfig,initNav,initForms].forEach(function(fn){
      try{fn()}catch(e){console.error('[Верный ход] ошибка в '+fn.name+':',e)}
    });
  });
})();
