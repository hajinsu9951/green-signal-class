/* 그린 시그널 수업실 — 생태계 노선 v2 (e12: 1~2차시 초등, e34: 3~4차시 중고등) */
(function(){

/* ---------- 공통 도우미 ---------- */
function jo(w, a, b){
  w = String(w||'').trim();
  const c = w.slice(-1).charCodeAt(0);
  if(c>=0xAC00 && c<=0xD7A3) return w + (((c-0xAC00)%28) ? a : b);
  return w + a + '(' + b + ')';
}
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
/* 위젯에서 만든 글을 같은 화면의 write 칸으로 옮긴다(제출 화면에 모이도록) */
function pushToWrite(st, id, text){
  st.set(id, text);
  const ta = document.getElementById(id);
  if(ta){ ta.value = text; ta.dispatchEvent(new Event('input')); }
}
function ahead(U, k, q){ return U.el('div',{class:'ah'}, U.el('span',{class:'k'},k), U.el('span',{class:'q',html:q})); }
function shuffleSeed(arr, seed){
  const a = arr.slice(); let s = seed||7;
  for(let i=a.length-1;i>0;i--){ s=(s*9301+49297)%233280; const j=Math.floor(s/233280*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
const reduceMotion = () => { try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

(function css(){
  if(typeof document==='undefined' || document.getElementById('eco-css')) return;
  const s = document.createElement('style'); s.id = 'eco-css';
  s.textContent = `
.eco-svg{display:block;width:100%;height:auto;max-width:460px;margin:0 auto;touch-action:manipulation}
.eco-svg .nd{cursor:pointer}
.eco-svg .nd:focus{outline:none}.eco-svg .nd:focus circle{stroke-width:5}
@keyframes eco-shake{0%,100%{transform:translate(0,0)}25%{transform:translate(3px,-2px)}75%{transform:translate(-3px,2px)}}
.eco-shake{animation:eco-shake .28s ease-in-out 5}
@media (prefers-reduced-motion:reduce){.eco-shake{animation:none}}
.eco-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.eco-list li{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--bg);font-size:.93rem}
.eco-list li.cut{border-color:var(--bad);background:var(--bad-soft);color:var(--bad)}
.eco-x{border:0;background:none;cursor:pointer;color:var(--muted);font-size:1.1rem;line-height:1;padding:2px 6px}
.eco-map{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.eco-zone{border:1px solid var(--line);border-radius:10px;padding:6px;min-height:96px;background:var(--bg);cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:4px;align-items:flex-start;min-width:0}
.eco-zone.armed{border-color:var(--th);box-shadow:0 0 0 2px var(--th-soft)}
.eco-zone .zt{font-weight:700;font-size:.85rem}
.eco-school{background:var(--th-soft);border:2px solid var(--th);border-radius:10px;display:grid;place-items:center;font-family:var(--f-display);font-size:1.15rem;color:var(--th);min-height:96px;text-align:center}
.eco-stamp{display:inline-flex;gap:3px;align-items:center;font-size:.8rem;line-height:1.3;border:1px solid var(--line);border-radius:999px;padding:1px 7px;background:var(--surface);cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eco-sym{font-weight:700}
.eco-pal{display:flex;gap:6px;flex-wrap:wrap}
.eco-pal button{border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:.9rem}
.eco-pal button.sel{border-color:var(--th);background:var(--th-soft);font-weight:700}
.eco-flip{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.eco-fc{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--bg);min-height:120px;display:flex;flex-direction:column;gap:8px;text-align:left}
.eco-fc.open{background:var(--th-soft);border-color:var(--th)}
.eco-fc .fr{font-weight:700;line-height:1.5}
.eco-fc .big{font-family:var(--f-display);font-size:2rem;color:var(--th);line-height:1.1}
.eco-fc button.flipb{align-self:flex-start}
.eco-faces{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.eco-face{border:2px solid var(--th);border-radius:14px;padding:14px;background:var(--surface);display:flex;flex-direction:column;gap:6px;min-height:200px}
.eco-face .side{font-size:.72rem;font-weight:700;color:var(--th);letter-spacing:.06em}
.eco-face .nm{font-family:var(--f-display);font-size:1.7rem;line-height:1.2}
.eco-face .ph{border:1px dashed var(--line);border-radius:8px;min-height:64px;display:grid;place-items:center;color:var(--muted);font-size:.82rem;text-align:center;padding:6px}
.eco-face dl{margin:0;display:flex;flex-direction:column;gap:4px}
.eco-face dt{font-size:.78rem;font-weight:700;color:var(--muted)}
.eco-face dd{margin:0;font-size:.93rem;line-height:1.5;white-space:pre-wrap}
.eco-badge{display:inline-block;border-radius:4px;padding:1px 8px;background:var(--th);color:var(--go-ink);font-size:.8rem;font-weight:700}
.eco-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.eco-form label{display:flex;flex-direction:column;gap:4px;font-size:.88rem;font-weight:700}
.eco-form label.wide{grid-column:1/-1}
.eco-sel{font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px;max-width:100%}
.eco-sel.right{border-color:var(--ok);background:var(--ok-soft)}.eco-sel.wrong{border-color:var(--bad);background:var(--bad-soft)}
.eco-chain{display:flex;flex-direction:column;gap:6px}
.eco-slot{border:2px dashed var(--line);border-radius:10px;padding:8px 12px;min-height:44px;display:flex;align-items:center;gap:10px;cursor:pointer;background:var(--bg);text-align:left;width:100%}
.eco-slot.fill{border-style:solid;border-color:var(--th);background:var(--surface)}
.eco-slot.right{border-color:var(--ok);background:var(--ok-soft)}.eco-slot.wrong{border-color:var(--bad);background:var(--bad-soft)}
.eco-slot .no{flex:0 0 26px;height:26px;border-radius:50%;background:var(--th);color:var(--go-ink);display:grid;place-items:center;font-weight:700;font-size:.82rem}
.eco-arrow{text-align:center;color:var(--muted);line-height:1;font-size:.9rem}
.eco-hint{font-size:.85rem;color:var(--bad)}
.eco-grid{display:grid;gap:3px;max-width:460px}
.eco-grid i{display:block;aspect-ratio:1;border-radius:50%}
.eco-cmp{width:100%;border-collapse:collapse;font-size:.92rem}
.eco-cmp th,.eco-cmp td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.eco-cmp td.on{background:var(--th-soft);font-weight:700}
.eco-cmp td.off{color:var(--muted)}
.eco-prev{border-left:4px solid var(--th);background:var(--sunk);border-radius:6px;padding:12px 14px;line-height:1.7}
.eco-prev b{background:var(--th-soft);border-radius:3px;padding:0 4px}
.eco-check{display:flex;flex-direction:column;gap:6px}
.eco-check label{display:flex;gap:8px;align-items:flex-start;font-size:.93rem;cursor:pointer}
.eco-check input{margin-top:5px;accent-color:var(--th)}
.eco-chain-out{display:flex;flex-direction:column;gap:6px}
`;
  document.head.append(s);
})();

/* =========================================================
   위젯
   ========================================================= */

/* 카드 뒤집기: cards:[{front, back, big?, choices?, answer?}] */
GS.widget('eco-flip', function(host, o, st, U){
  const key = o.key || 'eco-flip';
  const saved = st.get(key) || {};
  host.append(ahead(U, o.kind||'카드 뒤집기', o.q||'카드를 눌러 뒷면을 확인해요.'));
  const wrap = U.el('div',{class:'eco-flip'});
  o.cards.forEach((c,i)=>{
    const card = U.el('div',{class:'eco-fc'});
    function paint(){
      card.innerHTML = '';
      const s = saved[i];
      const opened = s!=null;
      card.classList.toggle('open', opened);
      if(c.big) card.append(U.el('div',{class:'big',html:c.big}));
      card.append(U.el('div',{class:'fr',html:c.front}));
      if(c.choices){
        const row = U.el('div',{class:'row'});
        c.choices.forEach((ch,ci)=>row.append(U.el('button',{type:'button',class:'btn sm'+(s===ci?' pri':''),onclick:()=>{ saved[i]=ci; st.set(key,saved); paint(); }}, ch)));
        card.append(row);
        if(opened){
          const ok = s===c.answer;
          card.append(U.el('div',{class:'fb '+(ok?'ok':'bad'),html:(ok?'맞아요! ':'정답은 <b>'+c.choices[c.answer]+'</b>예요. ')+c.back}));
        }
      } else {
        if(opened) card.append(U.el('div',{class:'fb info',html:c.back}));
        card.append(U.el('button',{type:'button',class:'btn sm flipb',onclick:()=>{ if(opened) delete saved[i]; else saved[i]=1; st.set(key,saved); paint(); }}, opened?'다시 덮기':'뒤집기'));
      }
    }
    paint(); wrap.append(card);
  });
  host.append(wrap);
});

/* 디지털 생명의 거미줄 */
GS.widget('eco-web', function(host, o, st, U){
  const N = o.nodes, key = o.key||'eco-web';
  let links = st.get(key) || [];
  let pick = null, mode = 'link', removed = null;
  const cx=200, cy=185, R=135;
  const pos = N.map((n,i)=>{ const a = -Math.PI/2 + i*2*Math.PI/N.length; return [cx+R*Math.cos(a), cy+R*Math.sin(a)]; });
  host.append(ahead(U, '거미줄 놀이', '두 친구를 차례로 눌러 줄을 이어요. 줄을 다 이었으면 <b>한 친구 빼기</b>를 눌러 보세요.'));
  const gift = U.el('input',{class:'w',placeholder:'무엇을 줄까요? (예: 먹이와 쉴 곳)','aria-label':'건네줄 것'});
  const modeRow = U.el('div',{class:'row'});
  const bLink = U.el('button',{type:'button',class:'btn sm pri',onclick:()=>setMode('link')},'줄 잇기');
  const bCut = U.el('button',{type:'button',class:'btn sm',onclick:()=>setMode('cut')},'한 친구 빼기');
  const bEx = U.el('button',{type:'button',class:'btn sm',onclick:()=>{
    (o.example||[]).forEach(e=>{ if(!links.some(l=>l.a===e.a&&l.b===e.b)) links.push(e); });
    st.set(key,links); removed=null; draw(); say(o.exampleMsg || '예시 줄을 이었어요. 이제 다른 친구들 사이에도 줄을 이어 보세요.');
  }},'예시 줄 보기');
  const bClear = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ links=[]; st.set(key,links); removed=null; pick=null; draw(); say('줄을 모두 치웠어요.'); }},'모두 지우기');
  modeRow.append(bLink, bCut, bEx, bClear);
  const svgBox = U.el('div',{});
  const msg = U.el('div',{class:'fb info',role:'status'});
  const list = U.el('ul',{class:'eco-list'});
  host.append(modeRow, gift, svgBox, msg, list);

  function say(t, tone){ msg.className = 'fb '+(tone||'info'); msg.innerHTML = t; }
  function setMode(m){ mode=m; pick=null; removed=null; bLink.classList.toggle('pri',m==='link'); bCut.classList.toggle('pri',m==='cut'); gift.hidden = m!=='link'; draw();
    say(m==='link' ? '줄을 건넬 친구를 먼저 누르세요.' : '줄을 놓을 친구를 한 명 누르세요. 그 친구와 이어진 줄이 어떻게 되는지 보세요.'); }
  function edge(a,b){ const [x1,y1]=pos[a],[x2,y2]=pos[b]; const dx=x2-x1, dy=y2-y1, d=Math.hypot(dx,dy)||1, r=30; return [x1+dx/d*r, y1+dy/d*r, x2-dx/d*(r+6), y2-dy/d*(r+6)]; }
  function draw(){
    let s = '<defs><marker id="eco-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--muted)"/></marker>'
      + '<marker id="eco-arb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--bad)"/></marker></defs>';
    const hit = new Set();
    links.forEach(l=>{
      const [x1,y1,x2,y2] = edge(l.a,l.b);
      const cut = removed!=null && (l.a===removed || l.b===removed);
      if(cut){ hit.add(l.a); hit.add(l.b); }
      s += `<line class="${cut?'eco-shake':''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(${cut?'--bad':'--muted'})" stroke-width="${cut?3:2.5}" ${cut?'stroke-dasharray="6 5"':''} marker-end="url(#${cut?'eco-arb':'eco-ar'})"/>`;
    });
    N.forEach((n,i)=>{
      const [x,y] = pos[i];
      const off = removed===i, sel = pick===i, shaky = removed!=null && !off && hit.has(i);
      s += `<g class="nd ${shaky?'eco-shake':''}" data-i="${i}" tabindex="0" role="button" aria-label="${n}" opacity="${off?0.3:1}">`
        + `<circle cx="${x}" cy="${y}" r="30" fill="var(${sel?'--th-soft':'--surface'})" stroke="var(${shaky?'--bad':'--th'})" stroke-width="${sel?5:3}"/>`
        + `<text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${n}</text></g>`;
    });
    svgBox.innerHTML = `<svg class="eco-svg" viewBox="0 0 400 370" role="img" aria-label="생명의 거미줄">${s}</svg>`;
    svgBox.querySelectorAll('.nd').forEach(g=>{
      const i = +g.getAttribute('data-i');
      g.addEventListener('click',()=>tap(i));
      g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); tap(i); } });
    });
    list.innerHTML = '';
    if(!links.length) list.append(U.el('li',{}, '아직 이어진 줄이 없어요.'));
    links.forEach((l,k)=>{
      const cut = removed!=null && (l.a===removed || l.b===removed);
      list.append(U.el('li',{class:cut?'cut':''}, U.el('span',{html:'<b>'+esc(N[l.a])+'</b> → '+esc(N[l.b])+': "나는 너에게 '+esc(jo(l.g||'도움','을','를'))+' 줘!"'}),
        U.el('button',{type:'button',class:'eco-x','aria-label':'이 줄 지우기',onclick:()=>{ links.splice(k,1); st.set(key,links); draw(); }},'×')));
    });
  }
  function tap(i){
    if(mode==='cut'){
      removed = removed===i ? null : i; draw();
      if(removed==null){ say('줄을 다시 잡았어요. 다른 친구도 빼 볼까요?'); return; }
      const cut = links.filter(l=>l.a===i||l.b===i);
      const who = [...new Set(cut.map(l=>l.a===i?l.b:l.a))].map(k=>N[k]);
      if(!cut.length) say(jo(N[i],'과','와')+' 이어진 줄이 없어요. 먼저 줄을 더 이어 보세요.');
      else say('<b>'+esc(jo(N[i],'이','가'))+'</b> 줄을 놓자 줄 <b>'+cut.length+'개</b>가 흔들리며 끊어졌어요. 영향을 받은 친구: <b>'+who.map(esc).join(', ')+'</b>. 한 친구가 빠지면 이어진 친구들도 흔들려요. (한 번 더 누르면 다시 잡아요)', 'bad');
      return;
    }
    if(pick==null){ pick=i; draw(); say('<b>'+esc(jo(N[i],'을','를'))+'</b> 골랐어요. 이제 받을 친구를 누르세요.'); return; }
    if(pick===i){ pick=null; draw(); say('선택을 취소했어요.'); return; }
    const g = gift.value.trim() || '도움';
    const ex = links.find(l=>l.a===pick&&l.b===i);
    if(ex) ex.g = g; else links.push({a:pick,b:i,g});
    st.set(key,links);
    const a = pick; pick=null; draw();
    say('<b>'+esc(N[a])+'</b>: "'+esc(jo(N[i],'아','야'))+', 나는 너에게 '+esc(jo(g,'을','를'))+' 줘!" 줄을 이었어요.', 'ok');
  }
  gift.hidden = false;
  draw(); say('줄을 건넬 친구를 먼저 누르세요. 위 칸에 건네줄 것을 적으면 줄에 함께 붙어요.');
});

/* 우리 동네 생태계 지도 스탬프 */
GS.widget('eco-map', function(host, o, st, U){
  const key = o.key||'eco-map';
  const SY = [
    {s:'▲',n:'생산자',c:'--carbon',cn:'초록'},
    {s:'●',n:'소비자',c:'--bad',cn:'빨강'},
    {s:'■',n:'분해자',c:'--climate',cn:'갈색'},
    {s:'★',n:'비생물 요소',c:'--eco',cn:'파랑'}
  ];
  const Z = o.zones; // 8개, 가운데는 학교
  let data = st.get(key) || {}; // zoneIndex: [{y,name}]
  let sym = 0;
  host.append(ahead(U, '지도 만들기', '기호를 고르고 이름을 쓴 다음, 그 생물이나 물질을 본 곳을 누르세요.'));
  const pal = U.el('div',{class:'eco-pal'});
  const pbtn = SY.map((y,i)=>{ const b=U.el('button',{type:'button',onclick:()=>{ sym=i; paintPal(); }, html:`<span class="eco-sym" style="color:var(${y.c})">${y.s}</span> ${y.n}`}); pal.append(b); return b; });
  function paintPal(){ pbtn.forEach((b,i)=>{ b.classList.toggle('sel',i===sym); b.setAttribute('aria-pressed',String(i===sym)); }); }
  const name = U.el('input',{class:'w',placeholder:'이름 (예: 민들레, 개미, 까치, 물웅덩이)','aria-label':'이름'});
  const grid = U.el('div',{class:'eco-map'});
  const sum = U.el('div',{class:'fb info',role:'status'});
  host.append(pal, name, grid, sum,
    U.el('div',{class:'row'}, U.el('button',{type:'button',class:'btn sm',onclick:()=>{ data={}; st.set(key,data); draw(); }},'지도 비우기')),
    U.el('p',{class:'cap'},'붙인 스탬프를 누르면 지워져요. 색은 활동지 약속(초록·빨강·갈색·파랑)과 비슷하게 보여요.'));
  function draw(){
    grid.innerHTML = '';
    let zi = 0;
    for(let cell=0; cell<9; cell++){
      if(cell===4){ grid.append(U.el('div',{class:'eco-school'},'우리 학교')); continue; }
      const z = zi++;
      const items = data[z] || [];
      const box = U.el('button',{type:'button',class:'eco-zone','aria-label':Z[z]+'에 스탬프 붙이기',onclick:()=>{
        const nm = name.value.trim();
        if(!nm){ sum.className='fb bad'; sum.textContent='먼저 이름을 적어 주세요.'; name.focus(); return; }
        (data[z]=data[z]||[]).push({y:sym,n:nm}); st.set(key,data); name.value=''; draw();
      }}, U.el('span',{class:'zt'},Z[z]));
      items.forEach((it,k)=>{
        const y = SY[it.y];
        box.append(U.el('span',{class:'eco-stamp',title:'눌러서 지우기',onclick:e=>{ e.stopPropagation(); data[z].splice(k,1); st.set(key,data); draw(); },
          html:`<span class="eco-sym" style="color:var(${y.c})">${y.s}</span>${esc(it.n)}`}));
      });
      grid.append(box);
    }
    // 집계
    const tot = [0,0,0,0]; const live = Z.map((_,z)=>{ let n=0; (data[z]||[]).forEach(it=>{ tot[it.y]++; if(it.y<3) n++; }); return n; });
    const all = tot.reduce((a,b)=>a+b,0);
    if(!all){ sum.className='fb info'; sum.textContent='아직 붙인 스탬프가 없어요.'; return; }
    const mx = Math.max(...live), mn = Math.min(...live);
    const most = Z.filter((_,z)=>live[z]===mx), least = Z.filter((_,z)=>live[z]===mn);
    sum.className='fb info';
    sum.innerHTML = SY.map((y,i)=>`<span class="eco-sym" style="color:var(${y.c})">${y.s}</span> ${y.n} ${tot[i]}개`).join(' · ')
      + '<br>생물(▲●■)이 가장 많은 곳: <b>'+most.join(', ')+'</b> ('+mx+'개)'
      + (mx!==mn ? '<br>생물이 가장 적은 곳: <b>'+least.join(', ')+'</b> ('+mn+'개)' : '');
  }
  paintPal(); draw();
});

/* 멸종위기종 보전 카드 만들기 */
GS.widget('eco-card', function(host, o, st, U){
  const key = o.key||'eco-card';
  const d = st.get(key) || {};
  host.append(ahead(U, '보전 카드', '조사한 내용을 칸에 쓰면 카드 앞면과 뒷면이 바로 만들어져요.'));
  const F = [
    ['name','이름','예: 맹꽁이'],
    ['home','사는 곳',''],
    ['why','위기에 처한 까닭',''],
    ['how','우리가 지킬 방법',''],
    ['cheer','응원 한마디','']
  ];
  const form = U.el('div',{class:'eco-form'});
  const inputs = {};
  function field(k,label,ph,wide,area){
    const inp = U.el(area?'textarea':'input',{class:'w',rows:area?'2':null,placeholder:ph||'',oninput:e=>{ d[k]=e.target.value; st.set(key,d); prev(); }});
    inp.value = d[k]||''; inputs[k]=inp;
    form.append(U.el('label',{class:wide?'wide':''}, label, inp));
  }
  field('name','이름','예: 맹꽁이');
  const grade = U.el('div',{class:'row'});
  const gb = ['Ⅰ급','Ⅱ급'].map(g=>{ const b=U.el('button',{type:'button',class:'btn sm',onclick:()=>{ d.grade=g; st.set(key,d); paintSel(); prev(); }}, g); grade.append(b); return b; });
  form.append(U.el('label',{}, '등급', grade));
  field('home','사는 곳','');
  const role = U.el('div',{class:'row'});
  const rb = ['생산자','소비자','분해자'].map(g=>{ const b=U.el('button',{type:'button',class:'btn sm',onclick:()=>{ d.role=g; st.set(key,d); paintSel(); prev(); }}, g); role.append(b); return b; });
  form.append(U.el('label',{}, '생태계 속 역할', role));
  field('why','위기에 처한 까닭','',true,true);
  field('how','우리가 지킬 방법','',true,true);
  field('cheer','응원 한마디','',true);
  function paintSel(){ gb.forEach(b=>b.classList.toggle('pri',b.textContent===d.grade)); rb.forEach(b=>b.classList.toggle('pri',b.textContent===d.role)); }
  const faces = U.el('div',{class:'eco-faces'});
  function v(k){ return d[k] ? esc(d[k]) : '<span style="color:var(--muted)">(아직 비어 있어요)</span>'; }
  function prev(){
    faces.innerHTML = '';
    faces.append(
      U.el('div',{class:'eco-face'}, U.el('span',{class:'side'},'앞면'),
        U.el('div',{class:'ph'},'사진 자리: 선생님이 알려 준 캔바 템플릿에 붙여요'),
        U.el('div',{class:'nm',html:d.name?esc(d.name):'이름'}),
        U.el('div',{html:(d.grade?'<span class="eco-badge">'+d.grade+'</span> ':'')+(d.role?'<span class="eco-badge">'+d.role+'</span>':'')}),
        U.el('dl',{}, U.el('dt',{},'사는 곳'), U.el('dd',{html:v('home')}))),
      U.el('div',{class:'eco-face'}, U.el('span',{class:'side'},'뒷면'),
        U.el('dl',{}, U.el('dt',{},'위기 까닭'), U.el('dd',{html:v('why')}), U.el('dt',{},'지키는 방법'), U.el('dd',{html:v('how')}), U.el('dt',{},'응원 한마디'), U.el('dd',{html:v('cheer')}))));
  }
  const f = U.el('div',{class:'fb info',hidden:true});
  host.append(form, faces, U.el('div',{class:'row'}, U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
    const t = ['이름: '+(d.name||''),'등급: '+(d.grade||''),'사는 곳: '+(d.home||''),'생태계 속 역할: '+(d.role||''),'위기에 처한 까닭: '+(d.why||''),'우리가 지킬 방법: '+(d.how||''),'응원 한마디: '+(d.cheer||'')].join('\n');
    pushToWrite(st, o.target, t); f.hidden=false; f.textContent='아래 조사표 칸에 옮겼어요. 마지막 화면에서 함께 제출돼요.';
  }},'조사표 칸에 옮기기')), f);
  paintSel(); prev();
});

/* 간식 원재료 추적 */
GS.widget('eco-trace', function(host, o, st, U){
  const key = o.key||'eco-trace';
  const seen = st.get(key) || [];
  host.append(ahead(U, '원재료 추적', '제품 카드를 눌러 원재료와 주요 생산국을 따라가 보세요.'));
  const row = U.el('div',{class:'row'});
  const out = U.el('div',{});
  const note = U.el('div',{class:'fb info',role:'status'});
  const btns = o.products.map((p,i)=>{ const b=U.el('button',{type:'button',class:'btn sm',onclick:()=>show(i)}, p.name); row.append(b); return b; });
  host.append(row, out, note);
  function show(i){
    if(!seen.includes(i)){ seen.push(i); st.set(key,seen); }
    btns.forEach((b,k)=>b.classList.toggle('pri',k===i));
    const p = o.products[i];
    out.innerHTML = '';
    const tb = U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{},'제품'), U.el('th',{},'원재료'), U.el('th',{},'주요 생산국'))),
      U.el('tbody',{}, p.items.map((it,k)=>U.el('tr',{}, U.el('td',{html:k===0?'<b>'+p.name+'</b>':''}), U.el('td',{html:it.m}), U.el('td',{html:'<b>'+it.c+'</b>'})))));
    out.append(U.el('div',{class:'tbl'}, tb));
    note.innerHTML = seen.length>=o.products.length
      ? '네 가지 제품을 모두 따라가 봤어요. 생산국들은 지구의 어느 지역에 모여 있나요? 왜 하필 이 나라들일까요?'
      : '살펴본 제품 '+seen.length+' / '+o.products.length+'. 다른 제품도 눌러 보세요.';
  }
  note.textContent = '제품 카드를 하나 눌러 보세요.';
});

/* 원재료–생산국–과거 지배국 짝짓기 */
GS.widget('eco-match', function(host, o, st, U){
  const key = o.key||'eco-match';
  const saved = st.get(key) || {};
  host.append(ahead(U, '짝짓기', o.q));
  const sels = [];
  const tb = U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{},'원재료'), U.el('th',{},'주요 생산국'), U.el('th',{},'과거 지배국'))),
    U.el('tbody',{}, o.rows.map((r,i)=>{
      const s = U.el('select',{class:'eco-sel','aria-label':r.m+' 과거 지배국',onchange:e=>{ saved[i]=e.target.value; st.set(key,saved); s.classList.remove('right','wrong'); }},
        U.el('option',{value:''},'고르세요'), o.options.map((op,k)=>U.el('option',{value:String(k)},op)));
      if(saved[i]!=null) s.value = saved[i];
      sels.push(s);
      return U.el('tr',{}, U.el('th',{html:r.m}), U.el('td',{html:r.c}), U.el('td',{}, s));
    })));
  const f = U.el('div',{class:'fb',hidden:true,role:'status'});
  host.append(U.el('div',{class:'tbl'}, tb), U.el('div',{class:'row'},
    U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
      let n=0; sels.forEach((s,i)=>{ const ok = s.value===String(o.rows[i].a); s.classList.toggle('right',ok); s.classList.toggle('wrong',!ok); if(ok) n++; });
      f.hidden=false; const all=n===sels.length; f.className='fb '+(all?'ok':'bad'); f.innerHTML = all ? '모두 맞았어요. '+o.explain : sels.length+'개 중 '+n+'개 맞았어요. 빨간 칸을 다시 골라 보세요.';
    }},'확인하기'),
    U.el('button',{type:'button',class:'btn sm',onclick:()=>{ sels.forEach((s,i)=>{ s.value=String(o.rows[i].a); saved[i]=s.value; s.classList.add('right'); s.classList.remove('wrong'); }); st.set(key,saved); f.hidden=false; f.className='fb info'; f.innerHTML='정답을 채웠어요. '+o.explain; }},'정답 보기')), f);
});

/* 열대림 ↔ 단일 경작 슬라이더 + 병 퍼뜨리기 모형 */
GS.widget('eco-mono', function(host, o, st, U){
  const key = o.key||'eco-mono';
  const S = st.get(key) || {v:0, res:{}};
  const COLS=12, ROWS=7, NC=COLS*ROWS;
  const KINDS = [6,4,2,1];
  const FILL = ['--th','--climate','--carbon','--muted','--ink','--th-soft'];
  host.append(ahead(U, '모형 실험', '슬라이더를 <b>열대림</b>에서 <b>단일 경작</b> 쪽으로 옮겨 보세요. 그다음 병을 퍼뜨려 비교해요.'));
  const rng = U.el('input',{type:'range',min:'0',max:'3',step:'1',value:String(S.v),'aria-label':'열대림에서 단일 경작까지'});
  const val = U.el('span',{class:'num',style:'min-width:6.5em;text-align:right'});
  host.append(U.el('div',{class:'slider'}, U.el('span',{},'열대림'), rng, val));
  const cmp = U.el('table',{class:'eco-cmp'});
  host.append(U.el('div',{class:'tbl'}, cmp));
  const grid = U.el('div',{class:'eco-grid',style:`grid-template-columns:repeat(${COLS},minmax(0,1fr))`,'aria-hidden':'true'});
  const cells = []; for(let i=0;i<NC;i++){ const c=U.el('i',{}); cells.push(c); grid.append(c); }
  const info = U.el('div',{class:'fb info',role:'status'});
  const run = U.el('button',{type:'button',class:'btn sm pri',onclick:spread},'병 퍼뜨리기');
  host.append(U.el('p',{class:'cap'},'동그라미 하나가 나무 한 그루예요. 색이 같으면 같은 품종이에요. 이 병은 같은 품종에게만 옮아요. (실제 수치가 아닌 생각 실험 모형이에요.)'),
    grid, U.el('div',{class:'row'}, run, U.el('button',{type:'button',class:'btn sm',onclick:()=>{ stop(); paintGrid(); info.textContent='나무를 다시 심었어요.'; }},'다시 심기')), info);
  let species = [], sick = new Set(), timer = null;
  function layout(){
    const k = KINDS[S.v]; let s = 11;
    species = [];
    for(let i=0;i<NC;i++){ s=(s*9301+49297)%233280; species.push(Math.floor(s/233280*k)); }
  }
  function paintGrid(){
    cells.forEach((c,i)=>{ const ill = sick.has(i); c.style.background = ill ? 'var(--bad)' : `var(${FILL[species[i]]})`; c.style.opacity = ill?'1':'.85'; c.style.outline = species[i]===5 && !ill ? '1px solid var(--line)' : ''; });
  }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } sick = new Set(); }
  function nb(i){ const r=Math.floor(i/COLS), c=i%COLS, out=[]; if(r>0)out.push(i-COLS); if(r<ROWS-1)out.push(i+COLS); if(c>0)out.push(i-1); if(c<COLS-1)out.push(i+1); return out; }
  function spread(){
    stop(); const start = 3*COLS+6; sick.add(start);
    const tick = () => {
      const add = [];
      sick.forEach(i=>nb(i).forEach(j=>{ if(!sick.has(j) && species[j]===species[start]) add.push(j); }));
      add.forEach(j=>sick.add(j));
      paintGrid();
      const pct = Math.round(sick.size/NC*100);
      info.innerHTML = '병에 걸린 나무: <b>'+sick.size+' / '+NC+'그루 ('+pct+'%)</b>';
      if(!add.length){
        if(timer){ clearInterval(timer); timer=null; }
        S.res[S.v] = pct; st.set(key,S);
        const r = S.res;
        info.innerHTML += '<br>병이 더 퍼지지 않아요. '+(r[0]!=null&&r[3]!=null ? '열대림 '+r[0]+'% vs 단일 경작 '+r[3]+'%. 어느 쪽이 병에 더 약한가요?' : '이번에는 슬라이더를 반대쪽 끝으로 옮겨 다시 퍼뜨려 보세요.');
        return false;
      }
      return true;
    };
    if(reduceMotion()){ while(tick()); return; }
    tick(); timer = setInterval(()=>{ if(!host.isConnected){ clearInterval(timer); return; } tick(); }, 160);
  }
  function paintCmp(){
    const v = S.v;
    val.textContent = v===0 ? '열대림' : v===3 ? '단일 경작' : '바뀌는 중 '+v+'/3';
    cmp.innerHTML = '';
    cmp.append(U.el('thead',{}, U.el('tr',{}, U.el('th',{},''), U.el('th',{},'열대림'), U.el('th',{},'단일 경작 농장'))));
    cmp.append(U.el('tbody',{}, o.rows.map((r,i)=>{ const mono = v>i; return U.el('tr',{}, U.el('th',{},r[0]), U.el('td',{class:mono?'off':'on'},r[1]), U.el('td',{class:mono?'on':'off'},r[2])); })));
  }
  rng.addEventListener('input',()=>{ S.v = +rng.value; st.set(key,S); stop(); layout(); paintCmp(); paintGrid(); info.textContent='품종 수: '+KINDS[S.v]+'가지. 병을 퍼뜨려 보세요.'; });
  layout(); paintCmp(); paintGrid(); info.textContent='품종 수: '+KINDS[S.v]+'가지. 병을 퍼뜨려 보세요.';
});

/* 순서 맞추기(연표·인과 사슬 공용): items:[{text, rank, tag?}] */
GS.widget('eco-order', function(host, o, st, U){
  const key = o.key||'eco-order';
  const items = o.items;
  const S = st.get(key) || {seq:[]};
  let showTag = false;
  const order = shuffleSeed(items.map((_,i)=>i), o.seed||5);
  host.append(ahead(U, o.kind||'순서 맞추기', o.q));
  const pool = U.el('div',{class:'pool','aria-label':'아직 놓지 않은 카드'});
  const chain = U.el('div',{class:'eco-chain'});
  const f = U.el('div',{class:'fb',hidden:true,role:'status'});
  const sorted = items.map(x=>x.rank).sort((a,b)=>a-b);
  host.append(U.el('p',{class:'src'}, '아래 카드를 누르면 빈 칸에 차례로 들어가요. 칸을 누르면 카드가 다시 빠져요.'), pool, chain,
    U.el('div',{class:'row'},
      U.el('button',{type:'button',class:'btn sm pri',onclick:check},'확인하기'),
      o.tagLabel ? U.el('button',{type:'button',class:'btn sm',onclick:()=>{ showTag=!showTag; draw(); }}, o.tagLabel) : null,
      U.el('button',{type:'button',class:'btn sm',onclick:()=>{ S.seq=[]; st.set(key,S); f.hidden=true; draw(); }},'처음부터')), f);
  function label(i){ const it=items[i]; return it.text + (showTag&&it.tag?' <span class="eco-badge">'+it.tag+'</span>':''); }
  function draw(res){
    pool.innerHTML=''; chain.innerHTML='';
    order.filter(i=>!S.seq.includes(i)).forEach(i=>pool.append(U.el('button',{type:'button',class:'chip',html:label(i),onclick:()=>{ S.seq.push(i); st.set(key,S); f.hidden=true; draw(); }})));
    for(let k=0;k<items.length;k++){
      const i = S.seq[k];
      if(k>0) chain.append(U.el('div',{class:'eco-arrow','aria-hidden':'true'},'↓'));
      const cls = 'eco-slot'+(i!=null?' fill':'')+(res&&res[k]===true?' right':'')+(res&&res[k]===false?' wrong':'');
      const slot = U.el('button',{type:'button',class:cls,onclick:()=>{ if(i==null) return; S.seq.splice(k,1); st.set(key,S); f.hidden=true; draw(); }},
        U.el('span',{class:'no'},String(k+1)), U.el('span',{html:i!=null?label(i):'<span style="color:var(--muted)">빈 칸</span>'}));
      chain.append(slot);
      if(res && res[k]!==true && o.gapHint) chain.append(U.el('div',{class:'eco-hint',html:o.gapHint}));
    }
  }
  function check(){
    const res = []; let n=0;
    for(let k=0;k<items.length;k++){ const i=S.seq[k]; const ok = i!=null && items[i].rank===sorted[k]; res.push(i==null?null:ok); if(ok) n++; }
    draw(res); f.hidden=false;
    const all = n===items.length;
    f.className = 'fb '+(all?'ok':'bad');
    f.innerHTML = all ? '모두 알맞게 이었어요. '+(o.explain||'') : (S.seq.length<items.length ? '아직 빈 칸이 있어요. ' : '')+items.length+'칸 중 '+n+'칸이 알맞아요.'+(o.gapHint?'':' 빨간 칸을 빼서 다시 놓아 보세요.');
  }
  draw();
});

/* 정책 제안서 생성기 */
GS.widget('eco-policy', function(host, o, st, U){
  const key = o.key||'eco-policy';
  const d = st.get(key) || {chk:[]};
  d.chk = d.chk || [];
  host.append(ahead(U, '정책 제안서', '칸을 채우면 정책 내용 문장이 바로 만들어져요.'));
  const form = U.el('div',{class:'eco-form'});
  function field(k,label,ph,wide,area){
    const inp = U.el(area?'textarea':'input',{class:'w',rows:area?'2':null,placeholder:ph||'',oninput:e=>{ d[k]=e.target.value; st.set(key,d); prev(); }});
    inp.value = d[k]||'';
    form.append(U.el('label',{class:wide?'wide':''}, label, inp));
  }
  field('title','정책의 이름','한눈에 알 수 있는 이름',true);
  const tg = U.el('div',{class:'row'});
  const tb = ['정부','기업','학교','지역 사회'].map(t=>{ const b=U.el('button',{type:'button',class:'btn sm',onclick:()=>{ d.target=t; st.set(key,d); paint(); prev(); }}, t); tg.append(b); return b; });
  form.append(U.el('label',{class:'wide'}, '제안 대상', tg));
  field('who','누가','예: 국내 식품 기업');
  field('when','언제까지','예: 2030년');
  field('what','무엇을 해야 하나','',true);
  field('gbf','GBF 목표 번호','QR에서 고른 번호');
  field('trace','줄일 오늘의 흔적','Q2에 쓴 오늘의 흔적');
  field('counter','예상 반론과 대응','반대할 사람은 누구이고 어떻게 보완할까요?',true,true);
  function paint(){ tb.forEach(b=>b.classList.toggle('pri',b.textContent===d.target)); }
  const pv = U.el('div',{class:'eco-prev','aria-live':'polite'});
  const b = (v,ph)=>'<b>'+(v?esc(v):ph)+'</b>';
  function sentence(plain){
    if(plain) return jo(d.who||'(누가)','은','는')+' '+(d.when||'(언제)')+'까지 '+(d.what||'(무엇을)')+' 해야 한다. 이는 GBF '+(d.gbf||'( )')+'번 목표를 실천하는 것이며, '+jo(d.trace||'(오늘의 흔적)','을','를')+' 줄일 것이다.';
    const who = d.who ? jo(d.who,'은','는') : '( 누가 )은/는';
    const tr = d.trace ? jo(d.trace,'을','를') : '( 오늘의 흔적 )을/를';
    return '<b>'+esc(who)+'</b> '+b(d.when,'( 언제 )')+'까지 '+b(d.what,'( 무엇을 )')+' 해야 한다. 이는 GBF '+b(d.gbf,'(  )')+'번 목표를 실천하는 것이며, <b>'+esc(tr)+'</b> 줄일 것이다.';
  }
  function prev(){
    pv.innerHTML = '<div class="cap" style="margin:0 0 4px">미리보기</div>'
      + '<div style="font-family:var(--f-display);font-size:1.3rem">'+(d.title?esc(d.title):'(정책의 이름)')+'</div>'
      + '<div class="cap" style="margin:0 0 6px">제안 대상: '+(d.target||'(고르세요)')+'</div>'
      + '<div>'+sentence(false)+'</div>'
      + (d.counter ? '<div style="margin-top:6px"><span class="cap">예상 반론과 대응</span><br>'+esc(d.counter)+'</div>' : '');
  }
  const chk = U.el('div',{class:'eco-check'});
  o.checklist.forEach((c,i)=>{
    const cb = U.el('input',{type:'checkbox',onchange:e=>{ d.chk[i]=e.target.checked; st.set(key,d); }});
    cb.checked = !!d.chk[i];
    chk.append(U.el('label',{}, cb, U.el('span',{html:c})));
  });
  const ex = U.el('div',{class:'fb info',hidden:true,html:o.example});
  const f = U.el('div',{class:'fb info',hidden:true});
  host.append(form, pv, U.el('div',{class:'cap',style:'font-weight:700;color:var(--ink)'},'스스로 점검해요'), chk,
    U.el('div',{class:'row'},
      U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
        const t = ['정책의 이름: '+(d.title||''),'제안 대상: '+(d.target||''),'정책 내용: '+sentence(true),'예상 반론과 대응: '+(d.counter||''),'점검: '+o.checklist.map((c,i)=>(d.chk[i]?'[v] ':'[ ] ')+c.replace(/<[^>]+>/g,'')).join(' / ')].join('\n');
        pushToWrite(st, o.target, t); f.hidden=false; f.textContent='아래 제안서 칸에 옮겼어요. 마지막 화면에서 함께 제출돼요.';
      }},'제안서 칸에 옮기기'),
      U.el('button',{type:'button',class:'btn sm',onclick:()=>{ ex.hidden=!ex.hidden; }},'예시 보기')), ex, f);
  paint(); prev();
});

/* =========================================================
   1~2차시 (초등) — v2: 장면 7개
   ========================================================= */
const S12 = 'slides/e12/', S34 = 'slides/e34/';
GS.lesson({
  id:'e12', theme:'eco', order:1,
  period:'1~2차시', periods:2, level:'초등', minutes:80,
  title:'내 주변에서 시작하는 생태계 탐구',
  question:'우리 주변의 생태계를 지키기 위해 우리가 할 수 있는 일은 무엇일까요?',
  goals:[
    '생태계를 이루는 것들(구성 요소)을 알 수 있어요.',
    '우리 주변의 생태계 지도를 만들 수 있어요.',
    '멸종위기종을 지키기 위한 보전 카드를 만들 수 있어요.'
  ],
  steps:[
    { id:'open', phase:'도입', minutes:8, move:'관찰',
      title:'화단에서 무엇을 찾을 수 있나요?',
      prompt:'화단 친구들은 서로 어떤 영향을 주고받을까요?',
      lead:'사진 속에서 나무, 꽃, 까치, 개미, 흙을 찾아보세요.',
      visual:{src:S12+'s02.jpg', alt:'학교 화단 사진과 나무·꽃·까치·개미·흙 낱말 카드', cap:'생각 열기'},
      layout:'split',
      blocks:[
        {t:'write', id:'e12-open-link', kind:'Q1', q:'화단 친구 둘을 골라, 서로 어떤 영향을 주는지 써 봐요.', rows:2,
          placeholder:'예: ___은(는) ___에게 ___을(를) 줘요.',
          example:'나무는 흙과 물이 있어야 자라고, 까치는 나무에서 먹이와 쉴 곳을 얻어요.'},
        {t:'choice', id:'e12-open-name', kind:'Q2', q:'이들이 서로 연결되어 영향을 주고받는 곳을 무엇이라고 부를까요?',
          options:['생태계','놀이터','교실','운동장'], answer:0,
          hints:['살아 있는 것과 살아 있지 않은 것이 함께 어울린 곳을 떠올려 보세요.','오늘 배울 세 글자 낱말이에요. "생"으로 시작해요.'],
          why:'왜 그렇게 골랐나요? 화단에서 찾은 것을 넣어 한 문장으로 써 보세요.',
          explain:'생물과 생물이 아닌 것들이 함께 어울려 서로 주고받는 곳을 <b>생태계</b>라고 해요.'}
      ]},

    { id:'bio', phase:'활동 1', minutes:8, move:'분석',
      title:'살아 있는 것? 살아 있지 않은 것?',
      prompt:'무엇을 기준으로 나눌 수 있을까요?',
      lead:'<b>생물 요소</b>는 살아 있는 것, <b>비생물 요소</b>는 살아 있지 않은 것이에요.',
      visual:{src:'img/e12-living.jpg', alt:'햇빛, 물웅덩이, 흙과 돌 사이에 민들레, 버섯, 개미, 참새가 있는 화단 그림', cap:'화단 속 생물 요소와 비생물 요소'},
      blocks:[
        {t:'sort', id:'e12-sort-bio', kind:'활동지 1', q:'낱말 카드를 생물 요소와 비생물 요소로 나누어 봐요.',
          bins:['생물 요소','비생물 요소'],
          items:[
            {text:'햇빛',bin:1},{text:'참새',bin:0},{text:'물',bin:1},{text:'민들레',bin:0},{text:'흙',bin:1},
            {text:'버섯',bin:0},{text:'공기',bin:1},{text:'개미',bin:0},{text:'돌',bin:1}
          ],
          explain:'생물 요소는 참새, 민들레, 버섯, 개미예요. 비생물 요소는 햇빛, 물, 흙, 공기, 돌이에요.'},
        {t:'choice', id:'e12-bio-mush', q:'버섯은 걸어 다니지 않아요. 그래도 생물 요소일까요?',
          options:['생물 요소예요. 자라고, 양분을 얻어요.','비생물 요소예요. 움직이지 않으니까요.'], answer:0,
          hints:['민들레도 걸어 다니지 않지만 생물 요소였어요.','살아 있는 것은 자라고 양분이 필요해요. 버섯은 어떤가요?'],
          why:true,
          explain:'살아 있는지는 움직임이 아니라 <b>자라고 양분을 얻는지</b>로 판단해요.'}
      ]},

    { id:'food', phase:'활동 1', minutes:10, move:'설명',
      title:'생물은 양분을 어떻게 얻을까요?',
      prompt:'분해자가 사라지면 숲은 어떻게 될까요?',
      lead:'먼저 카드를 뒤집어 생산자·소비자·분해자를 알아봐요.',
      visual:{src:S12+'s07.jpg', alt:'잎, 참새, 버섯 그림과 양분을 얻는 방법 설명 카드', cap:'활동지 2번'},
      layout:'split',
      blocks:[
        {t:'widget', name:'eco-flip', opts:{key:'e12-flip', kind:'활동지 2', q:'설명을 읽고 알맞은 이름을 골라요.', cards:[
          {front:'2-1) 민들레, 소나무처럼 햇빛으로 <b>스스로 양분을 만드는</b> 생물은?', choices:['생산자','소비자','분해자'], answer:0,
            back:'<b>생산자</b>: 햇빛으로 스스로 양분을 만들어요.'},
          {front:'2-2) 참새, 고양이처럼 <b>다른 생물을 먹어</b> 양분을 얻는 생물은?', choices:['생산자','소비자','분해자'], answer:1,
            back:'<b>소비자</b>: 다른 생물을 먹어 양분을 얻어요.'},
          {front:'2-3) 버섯, 곰팡이처럼 <b>죽은 생물을 분해해</b> 양분을 얻는 생물은?', choices:['생산자','소비자','분해자'], answer:2,
            back:'<b>분해자</b>: 죽은 생물을 분해해 양분을 얻어요.'}
        ]}},
        {t:'choice', id:'e12-food-dec', q:'숲에서 버섯과 곰팡이(분해자)가 모두 사라지면 어떻게 될까요?',
          options:['죽은 생물과 낙엽이 그대로 쌓이고, 흙으로 돌아가는 양분이 줄어요.','아무 변화가 없어요. 분해자는 아무에게도 필요 없으니까요.','소비자만 조금 배고파져요.'], answer:0,
          hints:['분해자는 무엇을 먹고 사는지 위 카드를 다시 보세요.','죽은 생물을 치우는 친구가 없으면 숲 바닥은 어떻게 될까요?'],
          why:true,
          explain:'분해자는 죽은 생물을 분해해 흙으로 돌려보내요. 그래서 생산자가 다시 자랄 수 있어요.'}
      ]},

    { id:'web', phase:'활동 1', minutes:14, move:'예측',
      title:'한 친구가 사라지면?',
      prompt:'생명의 거미줄에서 한 친구가 줄을 놓으면 어떻게 될까요?',
      lead:'교실에서 털실 놀이를 한 뒤, 화면에서도 줄을 잇고 한 친구를 빼 보세요.',
      visual:{src:S12+'s09.jpg', alt:'생명의 거미줄 놀이 규칙과 햇빛·공기·물·흙·민들레·개미·참새·버섯을 잇는 줄 그림', cap:'활동지 2번 · 생명의 거미줄 놀이'},
      blocks:[
        {t:'predict', id:'e12-web-pred', q:'한 친구가 줄을 놓으면 어떻게 될지 먼저 골라 보세요.',
          options:['아무 일도 없어요. 다른 친구들은 그대로예요.','그 친구와 줄로 이어진 친구들이 흔들려요.','모든 친구가 한꺼번에 사라져요.'],
          reveal:[
            {t:'widget', name:'eco-web', opts:{key:'e12-web2',
              nodes:['햇빛','물','흙','민들레','개미','참새','버섯','공기'],
              example:[{a:0,b:3,g:'빛'},{a:1,b:3,g:'물'},{a:2,b:3,g:'자랄 곳'},{a:4,b:5,g:'먹이'},{a:6,b:2,g:'양분'}],
              exampleMsg:'예시 줄을 이었어요. 햇빛·물·흙이 있어야 민들레가 자라요. 참새는 개미를 먹고, 버섯은 죽은 생물을 분해해 흙에 양분을 돌려줘요.'}},
            {t:'write', id:'e12-web-feel', kind:'활동지 2-4', q:'내가 맡은 역할과, 친구가 줄을 놓았을 때 느낀 점을 써 봐요.', rows:2,
              placeholder:'내 역할: \n느낀 점: '}
          ],
          compare:'내 예측과 실제로 해 본 결과는 어떻게 같고 달랐나요?'},
        {t:'blanks', id:'e12-def', kind:'활동지 3', q:'거미줄 놀이를 떠올리며 생태계의 뜻을 완성해요.',
          text:'생태계: 어떤 장소에서 [[생물]] 요소와 [[비생물]] 요소가 서로 [[영향]]을 주고받으며 연결되어 있는 것',
          hints:['앞에서 낱말 카드를 나눈 두 칸의 이름이에요.','도입 질문 "서로 어떤 ○○을 줄까요?"를 떠올려 보세요.'],
          explain:'생물 요소와 비생물 요소가 서로 <b>영향</b>을 주고받으며 연결되어 있는 것이 생태계예요.'}
      ]},

    { id:'map', phase:'활동 2', minutes:15, move:'관찰',
      title:'우리 동네 생태계 지도',
      prompt:'우리 동네에서 생물이 가장 많이 사는 곳은 어디일까요?',
      lead:'약속 기호 ▲생산자 ●소비자 ■분해자 ★비생물 요소로 내가 본 것을 표시해요.',
      visual:{src:'img/e12-walk.jpg', alt:'학교 둘레의 뒷산, 화단, 하천, 도로를 작은 아이들이 걸으며 살펴보는 그림', cap:'등굣길과 학교 주변을 떠올려요'},
      blocks:[
        {t:'predict', id:'e12-map-pred', q:'지도를 그리기 전에 예측해요. 생물이 가장 많이 모여 있을 곳은?',
          options:['화단·공원','학교 뒷산','하천','도로·주차장'],
          reveal:[
            {t:'visual', src:S12+'s13.jpg', alt:'학교 뒷산, 화단, 주차장, 큰 도로, 하천에 약속 기호가 표시된 예시 지도', cap:'[예시] 우리 동네 생태계 지도'},
            {t:'widget', name:'eco-map', opts:{key:'e12-map', zones:['화단','놀이터','학교 뒷산','등굣길','공원','하천','도로·주차장','그 밖의 곳']}}
          ],
          compare:'내 지도에서 예측이 맞았나요? 예시 지도와 무엇이 같고 달랐나요?'},
        {t:'cer', id:'e12-map-cer', kind:'활동지 5 · Q1·Q2', q:'생물이 가장 많은 곳과 거의 없는 곳은 어디이고, 왜 그럴까요?',
          starters:{c:'생물이 가장 많은 곳은 ___이고, 거의 없는 곳은 ___예요.', e:'내 지도에서 ___에는 기호가 ___개, ___에는 ___개 있었어요.', r:'___에는 흙·물·풀이 (있어서 / 없어서) 생물이 살기 (좋기 / 어렵기) 때문이에요.'},
          example:'학교 뒷산에 생물이 가장 많아요. 나무, 흙, 물이 많아 먹이와 살 곳이 풍부하기 때문이에요. 큰 도로와 주차장에는 거의 없어요. 흙과 풀이 없고 시멘트로 덮여 있어 생물이 살기 어려워요.'}
      ]},

    { id:'endg', phase:'활동 3', minutes:10, move:'예측',
      title:'멸종위기 야생생물은 몇 종일까요?',
      prompt:'2017년 267종이던 멸종위기 야생생물은 2022년에 어떻게 되었을까요?',
      lead:'살 곳이 사라지거나 환경이 오염되어 수가 크게 줄어, 사라질 위험이 있는 야생생물이에요. Ⅰ급과 Ⅱ급으로 나뉘어요.',
      visual:{src:S12+'s15.jpg', alt:'멸종위기 야생생물의 뜻과 Ⅰ급·Ⅱ급 설명', cap:'멸종위기 야생생물이란?'},
      blocks:[
        {t:'predict', id:'e12-endg-pred', q:'먼저 예측해요. 2022년 멸종위기 야생생물 수는?',
          options:['줄었을 거예요.','그대로일 거예요.','늘었을 거예요.'],
          reveal:[
            {t:'chart', kind:'bar', title:'멸종위기 야생생물 수의 변화', x:['2017년','2022년'],
              series:[{name:'멸종위기 야생생물',values:[267,282],color:'--th'}], unit:'종', min:0, max:300, height:220,
              src:'환경부, 멸종위기 야생생물 목록 개정(2022. 12.)'},
            {t:'chart', kind:'bar', title:'2022년 등급별 멸종위기 야생생물', x:['Ⅰ급','Ⅱ급'],
              series:[{name:'2022년',values:[68,214],color:'--climate'}], unit:'종', min:0, max:300, height:220,
              src:'환경부, 멸종위기 야생생물 목록 개정(2022. 12.)'},
            {t:'blanks', id:'e12-endg-num', kind:'활동지 6', tol:0,
              text:'2022년 멸종위기 야생생물은 모두 [[282]]종이고, 2017년보다 [[15]]종 늘어났어요.',
              hints:['2022년 막대 위의 숫자를 읽어요.','282에서 267을 빼 보세요.'],
              explain:'267종에서 282종으로 15종 늘어났어요.'},
            {t:'choice', id:'e12-endg-mean', q:'멸종위기종이 늘어났다는 것은 무엇을 뜻할까요?',
              options:['살 곳과 먹이를 잃어 사라질 위험에 처한 생물이 많아졌다는 뜻이에요.','우리나라 생물들이 더 건강해졌다는 뜻이에요.','이제 야생생물을 지키지 않아도 된다는 뜻이에요.'], answer:0,
              hints:['멸종위기 야생생물의 뜻을 위 그림에서 다시 읽어 보세요.','지도에서 생물이 거의 없던 곳을 떠올려 보세요. 왜 적었나요?'],
              why:true,
              explain:'사라질 위험에 처한 생물이 더 많아졌다는 뜻이에요. 살 곳이 사라지거나 환경이 오염된 곳이 늘었다는 신호예요.'}
          ]}
      ]},

    { id:'card', phase:'정리', minutes:15, move:'실천',
      title:'멸종위기종 보전 카드',
      prompt:'내가 고른 멸종위기종을 지키려면 우리는 무엇을 할 수 있을까요?',
      lead:'국립생태원 누리집(선생님 QR)에서 1종을 골라 조사하고, 모둠 카드를 만들어 전시해요.',
      visual:{src:S12+'s20.jpg', alt:'멸종위기종 보전 카드 앞면·뒷면 구성과 활동 방법', cap:'활동지 7번 · 보전 카드'},
      blocks:[
        {t:'widget', name:'eco-card', opts:{key:'e12-cardw', target:'e12-research'}},
        {t:'write', id:'e12-research', kind:'활동지 7', q:'멸종위기종 조사표 (위 카드에서 <b>조사표 칸에 옮기기</b>를 누르면 채워져요.)', rows:6,
          placeholder:'이름:\n등급(Ⅰ급/Ⅱ급):\n사는 곳:\n생태계 속 역할(생산자/소비자/분해자):\n위기에 처한 까닭:\n우리가 지킬 방법:'},
        {t:'reflect', id:'e12-exit', items:['오늘 가장 중요한 생각 한 가지','다른 모둠 카드 중 기억에 남는 멸종위기종과 그 까닭']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/e12-more-leaf.jpg', tag:'관찰', title:'낙엽 밑 분해자 찾기', text:'화단 낙엽을 살짝 들춰 버섯·곰팡이 같은 친구를 찾고, 지도에 ■로 더해요.'},
          {img:'img/e12-more-frog.jpg', tag:'멸종위기종', title:'맹꽁이는 왜 위기일까?', text:'알을 낳는 물웅덩이와 습지가 도로와 건물로 사라졌어요.'},
          {img:'img/e12-more-otter.jpg', tag:'멸종위기종', title:'수달이 사는 하천', text:'하천이 오염되고 개발되면서 살 곳과 먹이가 줄었어요.'},
          {img:S12+'s19.jpg', tag:'조사', title:'국립생태원 누리집 더 둘러보기', text:'\'보전\' 메뉴에서 우리 지역 멸종위기종을 하나 더 찾아봐요. (선생님 QR)'}
        ]}
      ]}
  ]
});

/* =========================================================
   3~4차시 (중고등) — v2: 장면 7개
   ========================================================= */
GS.lesson({
  id:'e34', theme:'eco', order:2,
  period:'3~4차시', periods:2, level:'중고등', minutes:'90~140',
  title:'생태계 파괴의 구조적 원인과 회복',
  question:'생태계 회복을 위해 우리는 어떤 약속을 해야할까요?',
  goals:[
    '제국주의 시기 플랜테이션 관련 자료를 분석하여 생태계 파괴의 구조적 원인을 설명할 수 있다.',
    '쿤밍-몬트리올 글로벌 생물다양성 프레임워크(GBF)의 실천목표를 근거로 생태계 회복을 위한 정책을 제안할 수 있다.'
  ],
  steps:[
    { id:'snack', phase:'도입', minutes:10, move:'예측',
      title:'우리 간식 속 재료는 어디서 왔을까?',
      prompt:'이 재료들이 자란 나라들에는 어떤 공통점이 있을까요?',
      lead:'포장지의 원재료 표시를 떠올려 보세요. 시간은 중학교(90분) 기준이에요.',
      visual:{src:S34+'s03.jpg', alt:'초콜릿(카카오·설탕), 과자·라면(팜유), 커피믹스(커피·설탕), 자동차 타이어(천연고무) 아이콘', cap:'생각 열기'},
      layout:'split',
      blocks:[
        {t:'predict', id:'e34-snack-pred', q:'먼저 예측해요. 생산국들의 공통점은? 기후 말고도 떠오르는 것이 있나요?',
          placeholder:'예: 대부분 ___ 지역에 있고, ___ 했을 것 같다.',
          reveal:[
            {t:'widget', name:'eco-trace', opts:{key:'e34-trace', products:[
              {name:'초콜릿', items:[{m:'카카오',c:'코트디부아르, 가나'},{m:'설탕 (원료 작물: 사탕수수)',c:'브라질, 인도'}]},
              {name:'과자·라면', items:[{m:'팜유',c:'인도네시아, 말레이시아'}]},
              {name:'커피믹스', items:[{m:'커피',c:'베트남'},{m:'설탕 (원료 작물: 사탕수수)',c:'브라질, 인도'}]},
              {name:'자동차 타이어', items:[{m:'천연고무',c:'인도네시아, 태국'}]}
            ]}},
            {t:'widget', name:'eco-match', opts:{key:'e34-match', q:'기후만으로 설명될까요? 주요 생산국을 과거에 지배했던 나라를 골라 보세요.',
              options:['네덜란드, 영국','프랑스, 영국','포르투갈, 영국','프랑스','네덜란드 / 없음(태국)'],
              rows:[
                {m:'팜유',c:'인도네시아, 말레이시아',a:0},
                {m:'카카오',c:'코트디부아르, 가나',a:1},
                {m:'사탕수수',c:'브라질, 인도',a:2},
                {m:'커피',c:'베트남',a:3},
                {m:'천연고무',c:'인도네시아 / 태국',a:4}
              ],
              explain:'주요 생산국은 대체로 열대 지역의 <b>과거 유럽 국가 식민지</b>였어요. 예외도 있어요. 태국은 식민 지배를 받지 않았고, 브라질은 독립 이후에 커피 재배가 늘었어요.'}}
          ],
          compare:'열대 기후만으로 설명될까요? 짝짓기 결과를 보고 내 예측을 고쳐 써 보세요.'}
      ]},

    { id:'plant', phase:'활동 1', minutes:10, move:'설명',
      title:'플랜테이션, 숲을 바꾼 농장',
      prompt:'산업혁명과 제국주의는 식민지의 땅을 어떻게 바꾸었을까요?',
      lead:'유럽 열강은 공장 원료와 노동자의 식량(설탕, 커피 등)을 얻으려고 식민지 땅에 한 가지 수출 작물만 대규모로 길렀어요.',
      visual:{src:S34+'s06.jpg', alt:'산업혁명과 제국주의 시기 식민지 농업에 관한 읽기 자료와 빈칸', cap:'활동지 1번 · 읽기 자료'},
      blocks:[
        {t:'blanks', id:'e34-plant-q1', kind:'활동지 1 · Q1', q:'읽기 자료를 읽고 빈칸을 채워요.',
          text:'한 가지 수출 작물만 대규모로 기르는 [[플랜테이션]] 농업<br>Q1. 플랜테이션의 세 요소: ① 넓은 땅에 한 작물, 대개 한 품종만 기르는 [[단일 경작|단일경작]] ② 노예·계약 노동자 등 외부 [[노동력]] 동원 ③ 생산물을 본국으로 보내는 [[본국 수출|수출|본국수출]] 구조',
          hints:['첫 칸은 영어에서 온 여섯 글자 낱말이에요. 뒤 세 칸은 각 설명의 핵심을 한 낱말로 줄여요.','① ○○ 경작 ② 사람이 일하는 힘 ③ 물건을 나라 밖으로 파는 것'],
          explain:'플랜테이션의 세 요소는 <b>단일 경작 · 외부 노동력 동원 · 본국 수출 구조</b>예요.'},
        {t:'sort', id:'e34-q1-sort', q:'사례 카드를 세 요소로 나눠 보세요. 한 사례가 어느 요소를 보여 주나요?',
          bins:['단일 경작','외부 노동력 동원','본국 수출 구조'],
          items:[
            {text:'실론의 산비탈이 끝없는 커피나무 줄로 바뀌었다',bin:0},
            {text:'바베이도스 사탕수수밭에 아프리카에서 끌려온 노예가 동원되었다',bin:1},
            {text:'말라야 고무 농장에서 인도 남부 출신 계약 노동자가 일했다',bin:1},
            {text:'자와의 생산물은 정해진 값에 식민 정부로 넘겨져 유럽에서 팔렸다',bin:2}
          ],
          explain:'네 사례 모두 세 요소가 함께 나타나요. 다음 장면에서 단일 경작이 생태계에 무엇을 남기는지 실험해요.'}
      ]},

    { id:'forest', phase:'활동 1', minutes:12, move:'예측',
      title:'열대림이 단일 경작 농장이 되면?',
      prompt:'같은 품종만 빽빽한 농장에 병이 생기면 어떻게 될까요?',
      lead:'열대림에는 수많은 동식물이 층을 이루어 살았어요. 그 자리에 고무·커피·사탕수수만 끝없이 심어졌어요.',
      visual:{src:'img/e34-forest-farm.jpg', alt:'왼쪽은 여러 층의 열대림, 오른쪽은 같은 나무가 줄지어 끝없이 심어진 농장', cap:'열대림과 단일 경작 농장'},
      blocks:[
        {t:'predict', id:'e34-mono-pred', q:'먼저 예측해요. 단일 경작 농장에서 병은?',
          options:['열대림보다 덜 퍼진다','열대림과 비슷하게 퍼진다','열대림보다 훨씬 넓게 퍼진다'],
          reveal:[
            {t:'widget', name:'eco-mono', opts:{key:'e34-mono', rows:[
              ['생물','수많은 동식물이 층을 이루어 산다','한 종, 대개 한 품종만 남는다'],
              ['흙','뿌리와 낙엽이 흙을 붙잡고 덮는다','맨흙이 드러나 비에 쓸려 간다'],
              ['병','병이 생겨도 일부 종에만 퍼진다','같은 품종을 타고 병이 한꺼번에 번진다']
            ]}},
            {t:'choice', id:'e34-ceylon', q:'사례2 실론: 1869년 커피녹병이 발견되고 1880년대 커피 산업이 무너졌어요. 무너진 더 근본적인 이유는?',
              options:['병균','단일 경작이라는 선택'], answer:1,
              hints:['모형에서 병은 어떤 나무에게만 옮았나요?','같은 병균이 열대림에 왔다면 같은 속도로 번졌을까요?'],
              why:true,
              explain:'병균은 계기였어요. 같은 품종을 빽빽이 심은 <b>단일 경작</b>이 병을 농장에서 농장으로 번지게 했어요.'}
          ]},
        {t:'cer', id:'e34-q2', kind:'활동지 1 · Q2', q:'플랜테이션 농업으로 생태계에는 어떤 변화가 생길까요? 생물·흙·병 중 두 가지 이상을 근거로 써요.',
          starters:{c:'플랜테이션 농업은 생태계를 ___하게 만든다.', e:'모형과 자료에서 ___했고, ___했다.', r:'이것은 한 품종만 남으면 ___ 때문이다.'},
          example:'플랜테이션은 생태계를 단순하고 약하게 만든다. 열대림에는 수많은 동식물이 층을 이루어 살지만 농장에는 한 품종만 남고, 맨흙이 비에 쓸려 가며, 모형에서 병이 같은 품종을 타고 대부분의 나무로 번졌다. 다양성이 사라지면 흙과 병을 막아 주던 연결이 끊기기 때문이다.'}
      ]},

    { id:'cases', phase:'활동 1', minutes:15, move:'분석',
      title:'네 사례를 나눠 맡아 분석하기',
      prompt:'설탕·커피·고무·팜유 농장은 누가 결정했고, 무엇을 남겼을까요?',
      lead:'모둠원이 사례를 하나씩 맡아 분석한 뒤, 서로 알려 줘요.',
      visual:{src:S34+'s12.jpg', alt:'분석 기준: 무엇을 길렀나, 누가 결정했나, 생태계 변화, 사회 변화, 오늘의 흔적', cap:'활동지 2번 · 분석 기준'},
      blocks:[
        {t:'gallery', title:'사례 카드 (눌러서 크게 보기)', items:[
          {src:S34+'s13.jpg', cap:'사례1 설탕 섬, 바베이도스 (17세기 · 카리브해)'},
          {src:S34+'s14.jpg', cap:'사례2 녹슨 잎, 실론의 커피 (19세기 · 스리랑카)'},
          {src:S34+'s15.jpg', cap:'사례3 강요된 작물, 자와의 강제재배제도 (19세기 · 인도네시아)'},
          {src:S34+'s16.jpg', cap:'사례4 고무에서 팜유로, 말레이반도와 보르네오 (20세기~오늘)'}
        ]},
        {t:'timer', minutes:10, label:'사례 분석·나누기'},
        {t:'write', id:'e34-case', kind:'활동지 2 · 분석표', q:'내가 맡은 사례를 다섯 기준으로 분석해요. <b>누가 결정했나</b>에는 본국 정부, 농장주처럼 주체를 분명히 써요.', rows:6,
          placeholder:'맡은 사례:\n무엇을 길렀나:\n누가 결정했나:\n생태계 변화:\n사회 변화:\n오늘의 흔적:',
          example:'(사례1 일부) 무엇을: 사탕수수 / 누가: 영국 정착민 농장주 / 생태계: 섬의 숲 대부분이 사라지고 흙이 쓸려 감 / 사회: 아프리카에서 끌려온 노예 노동, 땔감·식량 수입 의존'},
        {t:'write', id:'e34-q3', kind:'Q3', q:'모둠원에게 들은 사례까지 비교해, 네 사례의 공통점을 적어 봐요. (무엇을 길렀나 · 누가 결정했나 · 생태계 변화)', rows:3,
          example:'현지 사람이 아니라 유럽 본국과 농장주가 결정했고, 숲을 베어 한 가지 수출 작물만 길렀으며, 숲과 흙이 사라지거나 병이 번졌어요.'}
      ]},

    { id:'struct', phase:'활동 1', minutes:10, move:'판단',
      title:'왜 독립 후에도 계속될까?',
      prompt:'식민지가 독립한 뒤에도 플랜테이션이 계속되거나 오히려 늘어난 이유는 무엇일까요?',
      lead:'사례4와 우리가 사는 과자·타이어를 떠올려 보세요.',
      visual:{src:'img/e34-chain.jpg', alt:'열대 농장에서 시작된 긴 컨베이어 벨트가 바다를 건너 도시의 가게 선반까지 이어진 그림', cap:'농장에서 우리 장바구니까지'},
      blocks:[
        {t:'predict', id:'e34-q4', kind:'예측하기 · Q4', q:'Q4. 내 생각을 먼저 적어요. 그다음 원인과 결과의 고리를 이어 확인해요.',
          placeholder:'독립 후에도 계속된 까닭은 ___ 때문일 것이다.',
          reveal:[
            {t:'widget', name:'eco-order', opts:{key:'e34-chain', kind:'인과 사슬', seed:9,
              q:'원인과 결과의 고리를 순서대로 이어 보세요.',
              gapHint:'그 사이에 무슨 일이 있었을까요?',
              items:[
                {text:'산업혁명: 공장 원료·노동자 식량 수요', rank:1},
                {text:'제국주의: 식민 지배', rank:2},
                {text:'플랜테이션: 단일 경작·외부 노동력·본국 수출', rank:3},
                {text:'숲 파괴·흙 유실·병해·기근', rank:4},
                {text:'독립 후에도 수출 구조·소비 지속', rank:5}
              ],
              explain:'<b>구조적 원인</b>: 한 사람의 잘못이 아니라, 제도·경제·소비가 맞물려 계속 같은 결과를 만드는 원인이에요.'}}
          ],
          compare:'내 Q4 답에 빠져 있던 고리는 무엇인가요?'},
        {t:'cer', id:'e34-q5', kind:'Q5 · 주장·근거·이유', q:'Q5. 생태계 파괴의 \'구조적\' 원인이란 무엇일까요? 사례를 근거로 내 말로 정의해 보세요.',
          starters:{c:'생태계 파괴의 \'구조적\' 원인이란 ___이다.', e:'사례 __에서 ___했고, 독립 후에도 ___.', r:'이것은 ___와 ___가 맞물려 같은 결과가 이어진다는 뜻이므로…'},
          example:'구조적 원인이란 수출 작물을 원하는 시장과 그것을 계속 사는 소비가 맞물려 숲을 농장으로 바꾸게 만드는 구조이다. 사례4에서 독립 후에도 고무 농장은 기름야자로 바뀌고 열대림이 새로 개간되었다. 누구 한 사람의 잘못이 아니라 제도·경제·소비가 함께 움직이기 때문에 같은 결과가 반복된다.'}
      ]},

    { id:'policy', phase:'활동 2', minutes:23, move:'실천',
      title:'실천목표를 근거로 정책 제안서 쓰기',
      prompt:'우리 모둠은 어떤 사례의 흔적을, 누가 언제까지 무엇을 해서 줄일까요?',
      lead:'2022년 12월 COP15에서 196개 당사국이 GBF에 합의하고 2030년까지 23개 실천목표를 정했어요. QR은 선생님이 준 것만 스캔해요.',
      visual:{src:S34+'s22.jpg', alt:'GBF 2030 실천 목표로 연결되는 QR 코드', cap:'GBF 2030 실천 목표 (QR 코드 스캔)'},
      blocks:[
        {t:'timer', minutes:20, label:'모둠 정책 제안 시간'},
        {t:'write', id:'e34-gbf', kind:'활동지 2 · Q1·Q2', q:'모둠이 가장 주목한 실천목표와 고른 이유, 그 목표와 맞는 사례와 \'오늘의 흔적\'(해결할 문제)을 적어요.', rows:4,
          placeholder:'목표 번호와 고른 이유:\n맞는 사례(1 바베이도스 / 2 실론 / 3 자와 / 4 말레이반도·보르네오):\n오늘의 흔적:',
          example:'15번 목표: 기업이 숲을 파괴한 원료를 쓰는지 알아야 소비자가 고를 수 있어요. / 사례4 / 팜유 농장이 늘어 열대림과 오랑우탄 서식지가 줄었어요.'},
        {t:'widget', name:'eco-policy', opts:{key:'e34-pol', target:'e34-policy',
          checklist:['1차시 사례의 내용이 근거로 들어갔는가?','다짐이나 구호가 아니라 실행하는 사람과 방법이 있는가?','원산지 주민이나 노동자의 입장을 생각했는가?'],
          example:'<b>정책 내용</b> 국내 식품 기업은 2030년까지 팜유 원료가 열대림을 파괴하지 않았는지 공개해야 한다. (15번 목표)<br><b>예상 반론과 대응</b> 원가가 오르는 기업과 원산지 소농이 반대할 수 있으니 인증 비용을 지원해요.'}},
        {t:'write', id:'e34-policy', kind:'정책 제안서', q:'우리 모둠 정책 제안서 (위에서 <b>제안서 칸에 옮기기</b>를 누르면 채워져요.)', rows:6,
          placeholder:'정책의 이름:\n제안 대상:\n정책 내용:\n예상 반론과 대응:'}
      ]},

    { id:'wrap', phase:'정리', minutes:10, move:'성찰',
      title:'공유하고 돌아보기',
      prompt:'초콜릿, 커피, 타이어를 보는 나의 눈은 어떻게 달라졌나요?',
      lead:'제안서 사진을 패들렛에 올리고(얼굴·실명·학번은 가려요), 다른 모둠에 댓글을 남겨요.',
      visual:{src:S34+'s27.jpg', alt:'정책 제안서 패들렛 게시, 감상, 근거 있는 칭찬과 보완 질문 댓글 안내', cap:'공유 활동'},
      blocks:[
        {t:'write', id:'e34-wrap-fb', kind:'피드백', q:'다른 모둠에 남긴 댓글: 근거를 포함한 칭찬 1개 + 보완할 부분 또는 질문 1개 (비난은 하지 않아요)', rows:2},
        {t:'reflect', id:'e34-exit', items:['초콜릿·커피·타이어를 보는 나의 눈은 어떻게 달라졌나요?','아직 궁금한 것 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/e34-more-label.jpg', tag:'실천', title:'원재료 표시 읽기', text:'집에 있는 과자 세 봉지에서 팜유·카카오·설탕을 찾아 생산국을 추적해요.'},
          {img:'img/e34-more-orangutan.jpg', tag:'오늘의 흔적', title:'보르네오의 숲과 오랑우탄', text:'사례4의 지금: 팜유 농장이 늘며 줄어든 서식지를 더 조사해요.'},
          {img:'img/e34-more-tea.jpg', tag:'역사', title:'실론티는 어떻게 시작됐을까', text:'커피녹병 뒤 차 농장으로 바뀐 실론. 무엇이 달라지고 무엇이 그대로였을지 조사해요.'},
          {img:'img/e34-more-gbf.jpg', tag:'확장', title:'다른 실천목표로 하나 더', text:'GBF 23개 목표 중 다른 하나를 골라 우리 학교·지역의 정책을 써 봐요.'}
        ]}
      ]}
  ]
});

})();
