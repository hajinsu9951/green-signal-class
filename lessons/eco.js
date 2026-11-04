/* 그린 시그널 수업실 — 생태계 노선 v3 (e12: 1~2차시 초등, e34: 3~4차시 중고등) · 교사 지도안·워크북·PPT 반영 */
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
  const pf = U.el('div',{class:'fb info',hidden:true,role:'status'});
  /* v3: 지도 내용을 같은 화면의 write 칸(활동지 4번)으로 옮겨 학습지에 기록되게 한다 */
  function mapText(){
    const lines = [];
    Z.forEach((zn,z)=>{ const it = data[z]||[]; if(it.length) lines.push(zn+': '+it.map(x=>SY[x.y].s+' '+x.n).join(', ')); });
    return lines.length ? lines.join('\n') : '(아직 표시한 것이 없어요)';
  }
  host.append(pal, name, grid, sum,
    U.el('div',{class:'row'},
      o.target ? U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{ pushToWrite(st, o.target, mapText()); pf.hidden=false; pf.textContent='아래 활동지 4번 칸에 옮겼어요. 마지막 화면 학습지에 함께 기록돼요.'; }},'학습지에 옮기기') : null,
      U.el('button',{type:'button',class:'btn sm',onclick:()=>{ data={}; st.set(key,data); draw(); }},'지도 비우기')),
    pf,
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
   v3 공통: 교사 제작 자료 출처 표기
   ========================================================= */
const S12 = 'slides/e12/', S34 = 'slides/e34/', M12 = 'media/e12/', M34 = 'media/e34/';
const PPT = '교사 제작 PPT 수록 자료';
const GEN = '그린 시그널 생성 일러스트(실제 사진 아님)';

/* =========================================================
   1~2차시 (초등) — v3: 공식 흐름
   우리 학교 화단 속 숨은 친구 찾기 → 생태계란? → 우리 동네 생태계 지도 만들기 → 멸종위기종 지키기
   지도안 시간: 도입 5′ · 활동1 25′ · 활동2 20′ · 활동3 20′ · 정리 10′ = 80′
   ========================================================= */
GS.lesson({
  id:'e12', theme:'eco', order:1,
  period:'1~2차시', periods:2, level:'초등', minutes:80,
  title:'내 주변에서 시작하는 생태계 탐구',
  question:'우리 주변의 생태계를 지키기 위해 우리가 할 수 있는 일은 무엇일까요?',
  goals:[
    '생태계의 구성 요소를 알 수 있다.',
    '우리 주변의 생태계 지도를 만들 수 있다.',
    '멸종위기종을 지키기 위한 보전 카드를 제작할 수 있다.'
  ],
  standards:[
    '[4과14-01] 생태계의 구성 요소를 조사하여 생물 요소와 비생물 요소로 분류할 수 있다.',
    '[4과14-03] 인간 활동이 생태계에 미치는 영향을 조사하고, 생태계 보전을 위해 우리가 할 수 있는 일을 토의하여 실천할 수 있다.',
    '※ 사회 연계: 지도 읽기 단원(지도의 약속 기호로 우리 고장 나타내기) — 활동2 ‘우리 동네 생태계 지도’의 약속 기호와 연계'
  ],
  prep:[
    '준비물: PPT, 학생 워크북, 색연필, 디지털 기기, 패들렛, 캔바 템플릿, 칭찬 스티커, 털실(생명의 거미줄 놀이)',
    '교육대상·공간: 초등 20~25명 / 교실, 학교 화단',
    '☆교육자료: 활동지(워크북 1쪽 — 활동1, 2쪽 — 활동2, 3쪽 — 활동3·정리)',
    '★도입: 태블릿, 캔바·패들렛 링크 / ★활동1: 털실 / ★활동2: 색연필, (선택) 지도 앱 화면 / ★활동3: 디지털 기기, 패들렛, 캔바 템플릿 / ★정리: 보전 카드, 칭찬 스티커',
    '수업 전: 캔바 학급 계정과 모둠 템플릿 링크, 패들렛 전시 보드를 미리 준비한다.',
    '수업 전: 학교 화단이나 등굣길 사진을 직접 촬영해 PPT에 넣는다.',
    '학생 사전 과제: 등굣길에서 본 생물을 사진이나 메모로 기록해 온다.',
    '안전 지도: 화단에서는 벌이나 벌레를 건드리지 않고, 모르는 식물은 만지거나 꺾지 않으며, 관찰 뒤에는 손을 씻는다(활동2에서 화단을 직접 관찰하기 전에 다시 한번 상기).',
    '안전 지도: 패들렛과 캔바에 얼굴 사진, 실명 등 개인정보를 올리지 않는다.',
    '만 13세 미만 학생은 교사가 개설한 Canva for Education 학급 계정으로 참여한다.'
  ],
  history:[
    {src:M12+'s02-04.jpg', title:'우리 학교 화단', fact:'생각 열기 사진이에요. 나무 상자 화단 속에서 식물, 흙, 그리고 숨어 있는 작은 생물을 찾아보세요.', credit:PPT+'(슬라이드 2) · 원 출처 표기 없음. 선생님이 직접 찍은 학교 화단 사진으로 바꾸면 더 좋아요(지도안 유의점).'},
    {src:M12+'s15-14.jpg', title:'멸종위기 야생생물이란?', fact:'살 곳이 사라지거나 환경이 오염되어 수가 크게 줄어 머지않아 사라질 위험이 있는 야생생물이에요. Ⅰ급과 Ⅱ급으로 나뉘어요.', credit:PPT+'(슬라이드 15)'},
    {src:'img/e12-more-otter.jpg', title:'하천에 사는 수달', fact:'지도안 예상 답: 하천이 오염되고 개발되면서 수달이 살 곳과 먹이가 줄었어요.', credit:GEN+' · 내용: 교사 지도안 활동3 예상 답'}
  ],
  steps:[
    /* ---------- 도입 5′ ---------- */
    { id:'open', phase:'도입', minutes:5, move:'관찰',
      title:'우리 학교 화단 속 숨은 친구 찾기',
      purpose:'늘 지나치던 학교 화단에도 여러 친구가 함께 살고 있어요. 무엇이 있는지 찾아보면 오늘 배울 ‘생태계’가 우리 바로 옆에 있다는 것을 알 수 있어요.',
      how:['오늘의 안전 약속(화단 관찰·디지털 기기)을 함께 읽어요.','화단 사진에서 찾은 것(나무, 꽃, 까치, 개미, 흙 …)을 말해요.','화단 친구 둘이 서로 어떤 영향을 주는지 쓰고, 이렇게 이어진 곳의 이름을 골라요.'],
      outcome:'화단의 친구들이 서로 영향을 주고받는 곳을 ‘생태계’라고 부른다는 것을 알아요.',
      prompt:'우리 학교 화단에서 무엇을 찾을 수 있나요?',
      visual:{src:M12+'s02-04.jpg', alt:'잔디밭 위 나무 상자 화단에 흙과 여러 식물이 자라는 사진', cap:PPT+'(슬라이드 2 · 생각 열기)'},
      layout:'split',
      teacher:{
        ask:['우리 학교 화단에서 무엇을 찾을 수 있나요?','우리 학교 화단에 있는 것들은 서로 어떤 영향을 줄까요?','이들이 서로 연결되어 영향을 주고받는 곳을 무엇이라고 부를까요?'],
        answer:['나무, 꽃, 까치가 있습니다. / 개미, 돌, 흙, 물웅덩이가 보입니다.','나무는 흙과 물이 있어야 자라고, 까치는 나무에서 먹이와 쉴 곳을 얻습니다.','생태계입니다. / 자연입니다.'],
        tip:['안전교육(5′ 안): 화단 관찰 약속과 디지털 기기 사용 약속을 함께 읽고 확인한다.','학교 화단이나 등굣길 사진을 교사가 직접 촬영하여 사용하면 학생들이 ‘우리 주변’의 생태계를 친근하게 느낄 수 있다.','학습 문제: 생태계의 구성 요소를 알고, 우리 동네 생태계 지도와 멸종위기종 보전 카드를 만들어 봅시다. (활동1 생태계란? / 활동2 우리 동네 생태계 지도 만들기 / 활동3 멸종위기종 지키기)'],
        link:'‘생태계’라는 이름을 붙였으니, 이제 생태계가 무엇으로 이루어져 있는지 하나씩 나눠 봐요.'},
      blocks:[
        {t:'callout', tone:'warn', title:'오늘의 안전 약속', text:'화단에서는 벌이나 벌레를 건드리지 않아요. 모르는 식물은 만지거나 꺾지 않아요. 관찰한 뒤에는 손을 씻어요.<br>패들렛과 캔바에는 얼굴 사진, 실명 같은 개인정보를 올리지 않아요.'},
        {t:'slides', from:2, to:4, title:'생각 열기 · 오늘의 활동'},
        {t:'write', id:'e12-open-link', ws:'생각 열기', kind:'Q1', q:'화단에 있는 친구들은 서로 어떤 영향을 줄까요? 두 친구를 골라 써 봐요.', rows:2,
          placeholder:'예: ___은(는) ___에게 ___을(를) 줘요.',
          example:'나무는 흙과 물이 있어야 자라고, 까치는 나무에서 먹이와 쉴 곳을 얻어요.'},
        {t:'choice', id:'e12-open-name', ws:'생각 열기', kind:'Q2', q:'이들이 서로 연결되어 영향을 주고받는 곳을 무엇이라고 부를까요?',
          options:['생태계','놀이터','교실','운동장'], answer:0,
          hints:['살아 있는 것과 살아 있지 않은 것이 함께 어울린 곳을 떠올려 보세요.','오늘 배울 세 글자 낱말이에요. "생"으로 시작해요.'],
          explain:'생물과 생물이 아닌 것들이 함께 어울려 서로 영향을 주고받는 곳을 <b>생태계</b>라고 해요.'}
      ]},

    /* ---------- 활동1 25′ (8+7+10) ---------- */
    { id:'bio', phase:'전개 · 활동1', minutes:8, move:'분석',
      title:'생태계란? ① 생물 요소와 비생물 요소',
      purpose:'화단에서 찾은 것 가운데 무엇이 살아 있고 무엇이 살아 있지 않은지 나눠 보면, 생태계가 어떤 것들로 이루어졌는지 알 수 있어요.',
      how:['낱말 카드 9장(햇빛, 참새, 물, 민들레, 흙, 버섯, 공기, 개미, 돌)을 생물 요소와 비생물 요소 칸으로 옮겨요(활동지 1번).','확인하기를 눌러 보고, 틀리면 힌트를 읽고 다시 옮겨요.','걸어 다니지 않는 버섯이 생물인지 아닌지 고르고 까닭을 써요.'],
      outcome:'생태계는 살아 있는 생물 요소와 살아 있지 않은 비생물 요소로 이루어져 있다는 것을 알아요. 그럼 생물 요소들은 양분을 어떻게 얻을까요?',
      prompt:'살아 있는 것과 살아 있지 않은 것으로 나누어 볼까요?',
      visual:{src:'img/e12-living.jpg', alt:'햇빛, 물웅덩이, 흙과 돌 사이에 민들레, 버섯, 개미, 참새가 있는 화단 그림', cap:GEN+' · 화단 속 생물 요소와 비생물 요소'},
      teacher:{
        ask:['햇빛, 참새, 물, 민들레, 흙, 버섯, 공기, 개미, 돌을 생물 요소와 비생물 요소로 나누어 봅시다.'],
        answer:['참새, 민들레, 버섯, 개미는 생물 요소이고 햇빛, 물, 흙, 공기, 돌은 비생물 요소입니다.'],
        tip:['활동1(25′): 활동지 1·2·3번(워크북 1쪽). 정답은 PPT 슬라이드 6으로 함께 확인한다.'],
        link:'생물 요소 네 가지(참새, 민들레, 버섯, 개미)는 양분을 얻는 방법이 서로 달라요. 다음 장면에서 나눠 봐요.'},
      blocks:[
        {t:'slides', from:5, to:6, title:'활동지 1번 · 정답 확인'},
        {t:'sort', id:'e12-sort-bio', ws:'활동지 1', q:'다음 낱말을 생물 요소와 비생물 요소로 나누어 봐요.',
          bins:['생물 요소 (살아 있는 것)','비생물 요소 (살아 있지 않은 것)'],
          items:[
            {text:'햇빛',bin:1},{text:'참새',bin:0},{text:'물',bin:1},{text:'민들레',bin:0},{text:'흙',bin:1},
            {text:'버섯',bin:0},{text:'공기',bin:1},{text:'개미',bin:0},{text:'돌',bin:1}
          ],
          explain:'생물 요소는 참새, 민들레, 버섯, 개미예요. 비생물 요소는 햇빛, 물, 흙, 공기, 돌이에요.'},
        {t:'choice', id:'e12-bio-mush', ws:'활동지 1', kind:'더 생각하기', q:'버섯은 걸어 다니지 않아요. 그래도 생물 요소일까요?',
          options:['생물 요소예요. 자라고, 양분을 얻어요.','비생물 요소예요. 움직이지 않으니까요.'], answer:0,
          hints:['민들레도 걸어 다니지 않지만 생물 요소였어요.','살아 있는 것은 자라고 양분이 필요해요. 버섯은 어떤가요?'],
          why:true,
          explain:'살아 있는지는 움직임이 아니라 <b>자라고 양분을 얻는지</b>로 판단해요.'}
      ]},

    { id:'food', phase:'전개 · 활동1', minutes:7, move:'설명',
      title:'생태계란? ② 생물은 양분을 어떻게 얻을까요?',
      purpose:'생물 요소도 양분을 얻는 방법이 서로 달라요. 방법에 따라 나누면 생물들이 먹고 먹히며 어떻게 이어져 있는지 보여요.',
      how:['활동지 2번 1)~3)의 문장을 읽고 생산자·소비자·분해자 가운데 알맞은 말을 골라요(활동지에는 O 표시).','숲에서 분해자가 모두 사라지면 어떻게 될지 골라요.'],
      outcome:'생산자는 햇빛으로 스스로 양분을 만들고, 소비자는 다른 생물을 먹고, 분해자는 죽은 생물을 분해해 흙으로 돌려보낸다는 것을 알아요.',
      prompt:'생물은 양분을 어떻게 얻을까요?',
      visual:{src:S12+'s07.jpg', alt:'잎, 참새, 버섯 그림 아래 양분을 얻는 방법 설명과 빈 괄호 세 개', cap:PPT+'(슬라이드 7 · 활동지 2번)'},
      layout:'split',
      teacher:{
        ask:['민들레처럼 햇빛을 이용해 스스로 양분을 만드는 생물을 무엇이라고 할까요?','버섯과 곰팡이는 생태계에서 어떤 일을 할까요?'],
        answer:['생산자입니다.','죽은 생물이나 배설물을 분해하여 양분을 얻는 분해자입니다.'],
        tip:['버섯·곰팡이 외에 눈에 보이지 않는 세균도 분해자임을 알려 준다.','활동2 지도에서 분해자를 찾을 수 있는 단서(낙엽 더미, 썩은 나무, 버섯)를 함께 안내한다.'],
        link:'생산자·소비자·분해자와 햇빛·물·흙이 실제로 어떻게 이어져 있는지 털실로 직접 이어 봐요.'},
      blocks:[
        {t:'slides', from:7, to:8, title:'활동지 2번 · 정답 확인'},
        {t:'choice', id:'e12-food-1', ws:'활동지 2', kind:'2-1)', q:'민들레, 소나무처럼 햇빛을 이용해 스스로 양분을 만드는 생물은?',
          options:['생산자','소비자','분해자'], answer:0,
          hints:['‘스스로 만든다’는 말에 밑줄을 그어 보세요. 만드는 쪽일까요, 먹는 쪽일까요?'],
          explain:'<b>생산자</b>: 햇빛을 이용해 스스로 양분을 만들어요.'},
        {t:'choice', id:'e12-food-2', ws:'활동지 2', kind:'2-2)', q:'참새, 고양이처럼 다른 생물을 먹어서 양분을 얻는 생물은?',
          options:['생산자','소비자','분해자'], answer:1,
          hints:['다른 생물을 먹어서 양분을 ‘써 버리는’ 쪽이에요.'],
          explain:'<b>소비자</b>: 다른 생물을 먹어 양분을 얻어요.'},
        {t:'choice', id:'e12-food-3', ws:'활동지 2', kind:'2-3)', q:'버섯, 곰팡이처럼 죽은 생물이나 배설물을 분해하여 양분을 얻는 생물은?',
          options:['생산자','소비자','분해자'], answer:2,
          hints:['‘분해’라는 낱말이 이름에 들어 있어요.'],
          explain:'<b>분해자</b>: 죽은 생물이나 배설물을 분해해 양분을 얻어요. 눈에 보이지 않는 세균도 분해자예요.'},
        {t:'choice', id:'e12-food-dec', ws:'활동지 2', kind:'더 생각하기', q:'숲에서 버섯과 곰팡이(분해자)가 모두 사라지면 어떻게 될까요?',
          options:['죽은 생물과 낙엽이 그대로 쌓이고, 흙으로 돌아가는 양분이 줄어요.','아무 변화가 없어요. 분해자는 아무에게도 필요 없으니까요.','소비자만 조금 배고파져요.'], answer:0,
          hints:['분해자는 무엇을 분해해 양분을 얻는지 2-3)을 다시 보세요.','죽은 생물을 치우는 친구가 없으면 숲 바닥은 어떻게 될까요?'],
          why:true,
          explain:'분해자는 죽은 생물을 분해해 흙으로 돌려보내요. 그래서 생산자가 다시 자랄 수 있어요. 화단의 낙엽 더미, 썩은 나무, 버섯 근처에서 분해자를 찾을 수 있어요.'}
      ]},

    { id:'web', phase:'전개 · 활동1', minutes:10, move:'예측',
      title:'생태계란? ③ 생명의 거미줄 놀이',
      purpose:'생물 요소와 비생물 요소가 정말 서로 영향을 주고받는지 털실로 이어 보고, 한 친구가 줄을 놓으면 어떻게 되는지 몸으로 느껴 봐요.',
      how:['생물 요소나 비생물 요소 중 내 역할 한 가지를 정해요(예: 개미).','관계있는 친구에게 털실을 건네며 “나는 너에게 ○○을 줘!”라고 말해요.','거미줄이 완성되면 가장 처음 시작한 친구가 줄을 놓고, 줄이 흔들릴 때 어떤 느낌이 드는지 이야기해요. 화면에서도 해 본 뒤 활동지 2-4)와 3번을 채워요.'],
      outcome:'생태계란 어떤 장소에서 생물 요소와 비생물 요소가 서로 영향을 주고받으며 연결되어 있는 것임을 내 말로 정리해요.',
      prompt:'생명의 거미줄에서 한 친구가 줄을 놓으면 어떻게 될까요?',
      visual:{src:M12+'s09-11.jpg', alt:'햇빛, 물, 흙, 공기, 버섯, 참새, 개미, 민들레가 빨간 줄로 서로 이어진 거미줄 그림', cap:PPT+'(슬라이드 9 · 생명의 거미줄 놀이)'},
      teacher:{
        ask:['‘생명의 거미줄 놀이’를 통해 생태계 구성 요소들의 연결 관계를 몸으로 체험해 봅시다.','친구가 줄을 놓았을 때 어떤 느낌이 들었나요?'],
        answer:[],
        tip:['★털실. 생물·비생물 요소가 서로 영향을 주고받는다는 점을 거미줄 놀이에서 줄이 흔들리는 경험과 연결하도록 돕는다.','놀이 규칙(슬라이드 9): ① 역할 정하기 ② 관계있는 친구에게 털실을 건네며 “나는 너에게 ○○을 줘!” ③ 거미줄이 완성되면 가장 처음 시작한 친구가 줄을 놓기 ④ 줄이 흔들릴 때 어떤 느낌이 드는지 이야기하기.'],
        link:'생태계가 서로 이어져 있다는 것을 알았으니, 우리 동네에서는 어디에 생물이 많이 모여 사는지 지도로 그려 봐요.'},
      blocks:[
        {t:'slides', from:9, to:11, title:'생명의 거미줄 놀이 · 활동지 3번'},
        {t:'predict', id:'e12-web-pred', ws:'활동지 2', q:'놀이 전에 예측해요. 한 친구가 줄을 놓으면 어떻게 될까요?',
          options:['아무 일도 없어요. 다른 친구들은 그대로예요.','그 친구와 줄로 이어진 친구들이 흔들려요.','모든 친구가 한꺼번에 사라져요.'],
          reveal:[
            {t:'widget', name:'eco-web', opts:{key:'e12-web2',
              nodes:['햇빛','물','흙','민들레','개미','참새','버섯','공기'],
              example:[{a:0,b:3,g:'빛'},{a:1,b:3,g:'물'},{a:2,b:3,g:'자랄 곳'},{a:4,b:5,g:'먹이'},{a:6,b:2,g:'양분'}],
              exampleMsg:'예시 줄을 이었어요. 햇빛·물·흙이 있어야 민들레가 자라요. 참새는 개미를 먹고, 버섯은 죽은 생물을 분해해 흙에 양분을 돌려줘요.'}}
          ],
          compare:'내 예측과 실제로 해 본 결과는 어떻게 같고 달랐나요?'},
        {t:'write', id:'e12-web-feel', ws:'활동지 2', kind:'2-4)', q:'‘생명의 거미줄 놀이’에서 내가 맡은 역할과, 친구가 줄을 놓았을 때 내가 느낀 점을 써 봐요.', rows:2,
          placeholder:'내가 맡은 역할: \n친구가 줄을 놓았을 때 내가 느낀 점: '},
        {t:'blanks', id:'e12-def', ws:'활동지 3', q:'생태계의 의미를 완성해요.',
          text:'생태계: 어떤 장소에서 [[생물]] 요소와 [[비생물]] 요소가 서로 [[영향]]을 주고받으며 연결되어 있는 것',
          hints:['활동지 1번에서 낱말 카드를 나눈 두 칸의 이름이에요.','생각 열기 질문 “서로 어떤 ○○을 줄까요?”를 떠올려 보세요.'],
          explain:'생물 요소와 비생물 요소가 서로 <b>영향</b>을 주고받으며 연결되어 있는 것이 생태계예요.'}
      ]},

    /* ---------- 활동2 20′ ---------- */
    { id:'map', phase:'전개 · 활동2', minutes:20, move:'관찰',
      title:'우리 동네 생태계 지도 만들기',
      purpose:'등굣길과 학교 주변에서 본 것을 약속 기호로 지도에 표시하면, 우리 동네 어디에 생물이 모여 살고 어디에는 거의 없는지 한눈에 보여요.',
      how:['등굣길과 학교 주변에서 본 생물 요소와 비생물 요소를 모둠에서 이야기해요.','학교를 가운데 두고 약속 기호 ▲생산자(초록) ●소비자(빨강) ■분해자(갈색) ★비생물 요소(파랑)와 이름을 표시한 뒤 <b>학습지에 옮기기</b>를 눌러요(활동지 4번).','완성한 지도를 보고 생물이 가장 많이 모인 곳과 거의 없는 곳, 그 까닭을 써요(활동지 5번).'],
      outcome:'흙·물·나무가 많은 곳에 생물이 모이고, 시멘트로 덮인 곳에는 생물이 살기 어렵다는 것을 알아요. 살 곳이 사라진 생물은 어떻게 될까요?',
      prompt:'우리 동네에서 생물이 가장 많이 모여 사는 곳은 어디일까요?',
      visual:{src:'img/e12-walk.jpg', alt:'학교 둘레의 뒷산, 화단, 하천, 도로를 작은 아이들이 걸으며 살펴보는 그림', cap:GEN+' · 등굣길과 학교 주변을 떠올려요'},
      teacher:{
        ask:['등굣길이나 학교 주변에서 어떤 생물을 보았나요?','지도에서 생물이 가장 많이 모여 있는 곳은 어디인가요? 그 까닭은 무엇일까요?','생물이 거의 표시되지 않은 곳은 어디인가요?'],
        answer:['학교 화단에서 개미와 민들레를 보았습니다. / 놀이터 나무에서 까치를 보았습니다. / 하천에서 오리와 물고기를 보았습니다.','학교 뒷산입니다. 나무, 흙, 물이 많아서 먹이와 살 곳이 풍부하기 때문입니다.','큰 도로와 주차장입니다. 흙과 풀이 없고 시멘트로 덮여 있어 생물이 살기 어렵습니다.'],
        tip:['☆활동지(워크북 2쪽), ★색연필, (선택) 지도 앱 화면.','사전 과제로 등굣길 관찰(사진 찍기, 메모하기)을 제시하면 지도를 더 풍부하게 만들 수 있다. 여건이 되면 10분 정도 학교 화단을 직접 관찰한 뒤 지도를 그리게 한다.','학교 화단을 직접 관찰할 때는 벌이나 벌레를 건드리지 않고, 모르는 식물은 만지거나 꺾지 않으며, 관찰 뒤에는 손을 씻도록 안전 수칙을 먼저 안내한다.','사회 연계: 지도 읽기 단원의 약속 기호.'],
        link:'생물이 거의 없던 곳처럼 살 곳이 사라지면 생물은 위험에 놓여요. 우리나라에는 그런 생물이 얼마나 있을까요?'},
      blocks:[
        {t:'slides', from:12, to:14, title:'약속 기호 · 예시 지도 · 활동지 5번'},
        {t:'predict', id:'e12-map-pred', ws:'활동지 4', q:'지도를 그리기 전에 예측해요. 생물이 가장 많이 모여 있을 곳은?',
          options:['화단·공원','학교 뒷산','하천','도로·주차장'],
          reveal:[
            {t:'visual', src:M12+'s13-12.jpg', alt:'학교 뒷산, 화단, 주차장, 큰 도로, 하천에 약속 기호가 표시된 예시 지도', cap:PPT+'(슬라이드 13 · [예시] 우리 동네 생태계 지도)'},
            {t:'widget', name:'eco-map', opts:{key:'e12-map', target:'e12-map-rec', zones:['화단','놀이터','학교 뒷산','등굣길','공원','하천','도로·주차장','그 밖의 곳']}}
          ],
          compare:'내 지도에서 예측이 맞았나요? 예시 지도와 무엇이 같고 달랐나요?'},
        {t:'write', id:'e12-map-rec', ws:'활동지 4', q:'우리 동네 생태계 지도에 표시한 것 (위 지도에서 <b>학습지에 옮기기</b>를 누르면 채워져요. 종이 활동지에 그렸다면 장소별로 적어요.)', rows:4,
          placeholder:'예) 화단: ▲ 민들레, ● 개미\n하천: ● 오리, ★ 물'},
        {t:'write', id:'e12-map-q1', ws:'활동지 5', kind:'5-1)', q:'생물이 가장 많이 모여 있는 곳은 어디인가요? 그 까닭은 무엇일까요?', rows:2,
          placeholder:'생물이 가장 많은 곳은 ___예요. ___이(가) 많아서 ___ 때문이에요.',
          example:'학교 뒷산이에요. 나무, 흙, 물이 많아서 먹이와 살 곳이 풍부하기 때문이에요.'},
        {t:'write', id:'e12-map-q2', ws:'활동지 5', kind:'5-2)', q:'생물이 거의 없는 곳은 어디인가요? 왜 그곳에는 생물이 적을까요?', rows:2,
          placeholder:'생물이 거의 없는 곳은 ___예요. ___ 때문이에요.',
          example:'큰 도로와 주차장이에요. 흙과 풀이 없고 시멘트로 덮여 있어 생물이 살기 어렵기 때문이에요.'}
      ]},

    /* ---------- 활동3 20′ (8+12) ---------- */
    { id:'endg', phase:'전개 · 활동3', minutes:8, move:'예측',
      title:'멸종위기종 지키기 ① 우리나라 멸종위기 야생생물은 몇 종일까요?',
      purpose:'살 곳을 잃어 사라질 위험에 놓인 생물이 우리나라에 얼마나 있는지 숫자로 확인해요.',
      how:['멸종위기 야생생물의 뜻과 Ⅰ급·Ⅱ급의 차이를 읽어요.','2022년에 어떻게 달라졌을지 먼저 예측한 뒤 그래프를 열어요.','그래프에서 2022년 수와 늘어난 수를 읽고(활동지 6번), 늘어났다는 것이 무엇을 뜻하는지 골라요.'],
      outcome:'멸종위기 야생생물 수가 5년 사이 어떻게 달라졌는지 숫자로 말하고, 그 뜻을 설명할 수 있어요.',
      prompt:'2017년 267종이던 멸종위기 야생생물은 2022년에 어떻게 되었을까요?',
      visual:{src:M12+'s15-14.jpg', alt:'멸종위기 야생생물의 뜻과 Ⅰ급(수가 아주 많이 줄어 지금 멸종위기에 처한 생물)·Ⅱ급(보호하지 않으면 멸종위기에 처할 수 있는 생물) 설명', cap:PPT+'(슬라이드 15 · 멸종위기 야생생물이란?)'},
      teacher:{
        ask:['2017년과 2022년의 멸종위기 야생생물 수를 비교해 볼까요?','멸종위기종이 늘어났다는 것은 무엇을 뜻할까요?'],
        answer:['267종에서 282종으로 15종 늘어났습니다.','살 곳과 먹이를 잃어 사라질 위험에 처한 생물이 많아졌다는 뜻입니다. / 조사를 통해 새로 위기가 확인된 생물이 늘었다는 뜻이기도 합니다.'],
        tip:['우리나라 멸종위기 야생생물 지정 현황 데이터를 제시하고 활동지 6번 문제를 해결한다(워크북 3쪽). 자료 출처: 환경부, 멸종위기 야생생물 목록 개정(2022. 12.)','멸종위기의 원인은 서식지 파괴와 오염 외에도 남획, 기후변화, 외래종 등 여러 가지가 있음을 함께 다룬다.'],
        link:'숫자 뒤에는 한 종 한 종의 생물이 있어요. 이제 한 종을 골라 직접 조사해요.'},
      blocks:[
        {t:'slides', from:15, to:18, title:'멸종위기 야생생물 · 활동지 6번'},
        {t:'predict', id:'e12-endg-pred', ws:'활동지 6', q:'먼저 예측해요. 2022년 멸종위기 야생생물 수는 2017년(267종)과 비교해 어떻게 되었을까요?',
          options:['줄었을 거예요.','그대로일 거예요.','늘었을 거예요.'],
          reveal:[
            {t:'chart', kind:'bar', title:'멸종위기 야생생물 수의 변화', x:['2017년','2022년'],
              series:[{name:'멸종위기 야생생물',values:[267,282],color:'--th'}], unit:'종', min:0, max:300, height:220, labels:true,
              src:'환경부, 멸종위기 야생생물 목록 개정(2022. 12.)'},
            {t:'chart', kind:'bar', title:'2022년 등급별 멸종위기 야생생물', x:['Ⅰ급','Ⅱ급'],
              series:[{name:'2022년',values:[68,214],color:'--climate'}], unit:'종', min:0, max:300, height:220, labels:true,
              src:'환경부, 멸종위기 야생생물 목록 개정(2022. 12.)'},
            {t:'blanks', id:'e12-endg-num', ws:'활동지 6', kind:'6-1)·2)', tol:0,
              text:'1) 2022년 우리나라의 멸종위기 야생생물은 모두 [[282]]종이에요.<br>2) 2017년보다 [[15]]종 늘어났어요.',
              hints:['2022년 막대 위의 숫자를 읽어요. Ⅰ급과 Ⅱ급을 더해도 같아요.','282에서 267을 빼 보세요.'],
              explain:'267종에서 282종으로 15종 늘어났어요. (Ⅰ급 68종 + Ⅱ급 214종 = 282종)'},
            {t:'choice', id:'e12-endg-mean', ws:'활동지 6', kind:'더 생각하기', q:'멸종위기종이 늘어났다는 것은 무엇을 뜻할까요? 알맞은 것을 모두 골라요.',
              options:['살 곳과 먹이를 잃어 사라질 위험에 처한 생물이 많아졌다는 뜻이에요.','조사를 통해 새로 위기가 확인된 생물이 늘었다는 뜻이기도 해요.','우리나라 생물들이 더 건강해졌다는 뜻이에요.','이제 야생생물을 지키지 않아도 된다는 뜻이에요.'], answer:[0,1],
              hints:['멸종위기 야생생물의 뜻을 위 그림에서 다시 읽어 보세요.','정답은 두 개예요. 생물이 실제로 줄어든 것과, 사람이 새로 알아낸 것을 함께 생각해 보세요.'],
              why:true,
              explain:'사라질 위험에 처한 생물이 많아졌다는 뜻이고, 조사로 새로 위기가 확인된 생물이 늘었다는 뜻이기도 해요. 위기의 원인에는 서식지 파괴와 오염 말고도 남획, 기후변화, 외래종 등이 있어요.'}
          ],
          compare:'내 예측과 그래프는 어떻게 같고 달랐나요?'}
      ]},

    { id:'card', phase:'전개 · 활동3', minutes:12, move:'실천',
      title:'멸종위기종 지키기 ② 국립생태원 조사와 보전 카드 만들기',
      purpose:'숫자 뒤에 있는 생물 한 종을 직접 골라, 왜 위기에 처했고 우리가 어떻게 지킬 수 있는지 조사해 카드로 알려요.',
      how:['국립생태원 누리집에서 ‘보전’ → 멸종위기종을 검색하고, 우리 지역에 사는(또는 관심 있는) 멸종위기종 1가지를 골라요.','활동지 7번 조사표(이름, 등급, 사는 곳, 생태계 속 역할, 위기에 처한 까닭, 우리가 지킬 방법)를 채우고 학급 패들렛에 공유해요.','캔바 템플릿에서 파일 → 사본 만들기를 한 뒤 모둠 보전 카드(앞면: 사진·이름·등급·사는 곳 / 뒷면: 위기에 처한 까닭·우리가 지킬 방법·응원 한마디)를 만들어 선생님께 제출해요.'],
      outcome:'내가 고른 멸종위기종이 위기에 처한 까닭과 지키는 방법을 설명할 수 있어요.',
      prompt:'내가 고른 멸종위기종은 왜 위기에 처했고, 우리는 어떻게 지킬 수 있을까요?',
      visual:{src:M12+'s19-17.jpg', alt:'국립생태원 누리집 조사 활동 방법 4단계와 국립생태원 QR 코드, 학급 패들렛 QR 자리', cap:PPT+'(슬라이드 19 · 활동지 7번)'},
      teacher:{
        ask:['여러분이 조사한 멸종위기종은 무엇이며, 왜 위기에 처하게 되었나요?'],
        answer:['맹꽁이입니다. 알을 낳는 물웅덩이와 습지가 도로와 건물로 사라졌기 때문입니다.','수달입니다. 하천이 오염되고 개발되면서 살 곳과 먹이가 줄었기 때문입니다.'],
        tip:['★디지털 기기, 패들렛, 캔바 템플릿 / ☆활동지(워크북 3쪽).','카드 제작 시 소외되는 학생이 없도록 자료 조사, 사진 고르기, 문구 쓰기, 꾸미기 등 역할을 분담하여 진행한다.','만 13세 미만 학생은 교사가 개설한 Canva for Education 학급 계정으로 참여하도록 한다.','슬라이드 19의 학급 패들렛 QR 자리는 교사가 수정해 넣는다.'],
        link:'완성한 카드를 전시해 서로의 멸종위기종을 알려 줘요.'},
      blocks:[
        {t:'slides', from:19, to:20, title:'국립생태원 조사 · 보전 카드 만들기'},
        {t:'tool', url:'https://www.nie.re.kr', title:'국립생태원 누리집', text:'‘보전’ 메뉴에서 멸종위기종을 검색해요. (PPT·워크북의 국립생태원 QR과 같은 곳)'},
        {t:'tool', url:'https://canva.link/u7zjpiju10seda4', title:'멸종위기종 보전 카드 캔바 템플릿', text:'파일 → 사본 만들기 후 모둠 카드를 만들어요. 선생님이 만든 학급 계정으로 들어가요.'},
        {t:'widget', name:'eco-card', opts:{key:'e12-cardw', target:'e12-research'}},
        {t:'write', id:'e12-research', ws:'활동지 7', q:'멸종위기종 조사표 (위 카드에서 <b>조사표 칸에 옮기기</b>를 누르면 채워져요.)', rows:7,
          placeholder:'이름:\n등급(Ⅰ급/Ⅱ급):\n사는 곳:\n생태계 속 역할(생산자/소비자/분해자):\n위기에 처한 까닭:\n우리가 지킬 방법:\n응원 한마디:'},
        {t:'visual', src:M12+'s20-18.jpg', alt:'보전 카드 앞면(사진, 이름, 등급, 사는 곳)과 뒷면(위기에 처한 까닭, 우리가 지킬 방법, 응원 한마디) 구성과 캔바 활동 방법', cap:PPT+'(슬라이드 20 · 보전 카드 구성)'}
      ]},

    /* ---------- 정리 10′ ---------- */
    { id:'wrap', phase:'정리', minutes:10, move:'성찰',
      title:'멸종위기종 보전 카드 전시회와 정리',
      purpose:'다른 모둠 카드를 둘러보면 우리 주변에도 지켜야 할 생물이 많다는 것을 알게 되고, 오늘 배운 생태계·지도·멸종위기종을 한 줄로 이을 수 있어요.',
      how:['모둠 보전 카드를 교실 벽과 패들렛에 전시하고, 갤러리 워크(교실을 돌며 친구 작품을 감상하기)로 둘러보며 응원 댓글(스티커)을 남겨요.','다른 모둠 카드 중 가장 기억에 남는 멸종위기종과 그 까닭을 써요.','오늘 새롭게 알게 된 점을 쓰고 출구 카드를 채워요.'],
      outcome:'생태계의 요소들은 서로 이어져 있어서, 한 생물을 지키는 일이 우리 동네 생태계를 지키는 일과 이어진다는 것을 정리해요.',
      prompt:'우리 주변의 생태계를 지키기 위해 우리가 할 수 있는 일은 무엇일까요?',
      visual:{src:'img/e12-more-frog.jpg', alt:'도로와 아파트가 가까이 있는 습지 물웅덩이 가에 앉은 둥근 두꺼비 모양의 동물 그림', cap:GEN+' · 물웅덩이와 습지가 줄어든 곳의 맹꽁이(지도안 예상 답)'},
      teacher:{
        ask:['다른 모둠의 카드 중 가장 기억에 남는 멸종위기종은 무엇인가요?','오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?'],
        answer:['수달 카드가 기억에 남습니다. 서울의 한강에도 수달이 산다는 것이 놀라웠습니다.','생태계는 생물 요소와 비생물 요소가 서로 연결되어 있다는 것을 알았습니다. / 우리 동네에도 멸종위기종이 산다는 것을 알게 되었습니다.'],
        tip:['★보전 카드, 칭찬 스티커 / ☆활동지(워크북 3쪽).','전시회를 학교 복도나 학년 게시판으로 넓혀 다른 학생들에게 알리면 배운 것을 삶 속에서 실천하는 경험으로 이어질 수 있다.']},
      blocks:[
        {t:'write', id:'e12-wrap-best', ws:'정리', q:'다른 모둠의 카드 중 가장 기억에 남는 멸종위기종은 무엇인가요? 그 까닭도 써요.', rows:2,
          example:'수달 카드가 기억에 남아요. 하천이 오염되고 개발되면서 살 곳과 먹이가 줄었다는 것을 알게 되었어요.'},
        {t:'write', id:'e12-wrap-new', ws:'정리', q:'오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?', rows:2,
          example:'생태계는 생물 요소와 비생물 요소가 서로 연결되어 있다는 것을 알았어요. 우리 동네에도 멸종위기종이 산다는 것을 알게 되었어요.'},
        {t:'reflect', id:'e12-exit', ws:'정리', items:['우리 주변 생태계를 지키기 위해 내가 할 수 있는 일 한 가지','아직 궁금한 것 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/e12-more-leaf.jpg', tag:'관찰', title:'낙엽 밑 분해자 찾기', text:'화단 낙엽 더미, 썩은 나무 둘레에서 버섯·곰팡이 같은 분해자를 찾아 지도에 ■로 더해요.'},
          {img:'img/e12-more-frog.jpg', tag:'멸종위기종', title:'맹꽁이는 왜 위기일까?', text:'지도안 예상 답: 알을 낳는 물웅덩이와 습지가 도로와 건물로 사라졌어요.'},
          {img:'img/e12-more-otter.jpg', tag:'멸종위기종', title:'수달이 사는 하천', text:'지도안 예상 답: 하천이 오염되고 개발되면서 살 곳과 먹이가 줄었어요.'},
          {img:S12+'s19.jpg', tag:'조사', title:'국립생태원 누리집 더 둘러보기', text:'‘보전’ 메뉴에서 우리 지역 멸종위기종을 하나 더 찾아봐요.', url:'https://www.nie.re.kr'}
        ]}
      ]}
  ]
});

/* =========================================================
   3~4차시 (중고등) — v3: 공식 흐름
   간식 포장지 원재료 살펴보기 → 과거-현재, 플랜테이션 탐구 → 쿤밍-몬트리올 GBF 분석과 생태계 회복 정책 제안
   지도안 시간: 도입 10′ · 활동1 중 35′(고 40′) · 활동2 중 35′(고 40′) · 정리 10′ — 장면 시간은 중학교 90분 기준
   ========================================================= */
GS.lesson({
  id:'e34', theme:'eco', order:2,
  period:'3~4차시', periods:2, level:'중고등', minutes:'90~100',
  title:'생태계 파괴의 구조적 원인과 회복',
  question:'생태계 회복을 위해 우리는 어떤 약속을 해야 할까요?',
  goals:[
    '제국주의 시기 플랜테이션 관련 자료를 분석하여 생태계 파괴의 구조적 원인을 설명할 수 있다.',
    '쿤밍-몬트리올 글로벌 생물다양성 프레임워크(GBF)의 실천 목표를 근거로 생태계 회복을 위한 정책을 제안할 수 있다.'
  ],
  standards:[
    '[9역05-02] 서양의 산업화와 제국주의 정책을 이해하고, 사회와 생태환경에 미친 영향을 분석한다.',
    '[9역13-04] 지속가능한 사회를 위한 과제를 역사적 맥락에서 탐구하고, 과제 해결에 참여하는 자세를 갖는다.',
    '[9과02-05] 생물다양성 보전의 필요성을 이해하고, 생물다양성 유지를 위한 방안을 조사하고 실천할 수 있다.',
    '[12세사02-03] 세계적 상품 교역이 가져온 사회적⋅경제적 변화를 이해한다.',
    '[12세사03-03] 제1⋅2차 산업 혁명이 가져온 사회, 경제, 생태환경의 변화를 분석한다.',
    '[12세사04-03] 현대 세계의 과제를 해결하기 위해 인류가 기울여온 노력을 탐구한다.'
  ],
  prep:[
    '준비물: PPT, 학생 워크북, 디지털 기기, 과자·초콜릿·커피믹스 포장지, GBF 실천 목표 QR 코드, 활동 체크리스트, 패들렛',
    '교육대상·시간: 중·고등 20~25명 / 중학교 90분, 고등학교 100분(도입 10′, 활동1 중 35′·고 40′, 활동2 중 35′·고 40′, 정리 10′). 고등학교 교육과정을 기준으로 개발했으며, 재구성하여 중학교에서 활용할 수 있다.',
    '☆교육자료: 활동지(워크북 1~3쪽), 활동 체크리스트, 패들렛',
    '수업 전: 모둠원이 사례1~4를 하나씩 맡을 수 있도록 4인 1모둠으로 편성한다.',
    '수업 전: 원재료 표시가 보이는 과자·초콜릿·커피믹스 포장지를 준비하고, GBF 실천 목표 QR 코드가 제대로 연결되는지 미리 확인한다.',
    '학생 사전 과제: 집에 있는 과자·초콜릿 포장지의 원재료 표시를 살펴 온다.',
    '안전 지도: QR 코드는 교사가 제공한 것만 스캔하고, 수업과 관련 없는 사이트에 접속하지 않는다.',
    '안전 지도: 패들렛 게시물과 사진에 얼굴, 실명, 학번 등 개인정보가 드러나지 않게 한다(정책 제안서 사진을 올리기 전에 다시 상기).'
  ],
  history:[
    {src:'img/e34-v3-barbados.jpg', title:'사례1 설탕 섬, 바베이도스 (17세기 · 카리브해)', fact:'1640년대부터 영국 정착민이 사탕수수를 심었고, 수십 년 만에 섬을 덮고 있던 숲 대부분이 사라졌어요. 비가 오면 겉흙이 쓸려 내려갔어요.', credit:'그림: 리처드 라이곤(Richard Ligon)의 1657년 바베이도스 지도(후대 복제본, 레이던대학 도서관 KITLV 1407468) · CC BY 4.0 · Wikimedia Commons · 내용: 교사 제작 워크북 2쪽 사례1, PPT 슬라이드 13', url:'https://commons.wikimedia.org/wiki/File:The_earliest_printed_map_of_Barbados_by_Richard_Ligon,_1657,_KITLV_1407468.tiff'},
    {src:'img/e34-more-tea.jpg', title:'사례2 녹슨 잎, 실론의 커피 (19세기 · 스리랑카)', fact:'1869년 커피녹병이 발견되어 같은 품종을 따라 빠르게 번졌고, 1880년대 커피 산업이 무너지자 차 농장으로 바뀌었어요. ‘실론티’의 출발점이에요.', credit:GEN+' · 내용: 교사 제작 워크북 2쪽 사례2, PPT 슬라이드 14'},
    {src:'img/e34-more-orangutan.jpg', title:'사례4 오늘: 팜유 농장과 오랑우탄 (20세기~오늘)', fact:'독립 후 많은 고무 농장이 기름야자로 바뀌고 열대림이 새로 개간되었어요. 오늘날 말레이시아와 인도네시아가 세계 팜유의 대부분을 생산하며, 오랑우탄의 서식지는 크게 줄었어요.', credit:GEN+' · 내용: 교사 제작 워크북 2쪽 사례4, PPT 슬라이드 16'}
  ],
  steps:[
    /* ---------- 도입 10′ ---------- */
    { id:'snack', phase:'도입', minutes:10, move:'예측',
      title:'간식 포장지 원재료 살펴보기',
      purpose:'매일 먹는 간식의 원재료가 어느 나라에서 왔는지 따라가 보면, 그 나라들의 공통점에서 오늘 탐구할 질문이 생겨요.',
      how:['디지털 기기 안전 약속을 확인해요.','초콜릿(카카오·설탕), 과자·라면(팜유), 커피믹스(커피·설탕), 자동차 타이어(천연고무)의 원재료를 확인하고, 생산국들의 공통점을 먼저 예측해 적어요.','제품 카드를 눌러 주요 생산국을 확인한 뒤, 그 나라를 과거에 지배했던 나라를 짝지어요.'],
      outcome:'주요 생산국은 대체로 열대 지역의 과거 유럽 식민지였다는 것을 확인해요. 그렇다면 식민지의 땅에서는 어떤 농업이 이루어졌을까요?',
      prompt:'우리 간식 속 재료는 어디서 왔을까? 왜 하필 이 나라들일까?',
      visual:{src:S34+'s03.jpg', alt:'초콜릿(카카오·설탕), 과자·라면(팜유), 커피믹스(커피·설탕), 자동차 타이어(천연고무) 아이콘', cap:PPT+'(슬라이드 3 · 생각 열기)'},
      layout:'split',
      teacher:{
        ask:['(포장지를 가리키며) 팜유, 카카오, 설탕, 커피는 어느 나라에서 왔을까요?','이 나라들은 역사적으로 어떤 공통점이 있었을까요? (제국주의 시기로 한정)'],
        answer:['인도네시아, 말레이시아 같은 열대 나라에서 왔어요.','대부분 더운 나라에서 생산돼요.','대부분 유럽 국가의 식민지였어요.'],
        tip:['안전교육: QR 코드는 교사가 제공한 것만 스캔하고, 수업과 관련 없는 사이트에 접속하지 않도록 안내한다. 패들렛 게시물과 사진에 얼굴, 실명, 학번 등 개인정보가 드러나지 않도록 안내한다.','브라질의 경우, 독립 이후 커피 재배가 늘어났음을 같이 전달한다.','식민 지배를 받지 않은 태국 등의 사례가 있음을 같이 전달한다.','정리 멘트: 오늘날 우리가 먹는 재료의 생산 구조가 제국주의와 식민 지배의 역사와 관련 있음을 알 수 있습니다.','학습 문제: 플랜테이션이 생태계와 사회에 남긴 영향을 탐구하고, 오늘날의 생물다양성 위기와 어떻게 이어지는지 알아봅시다. (활동1 과거-현재, 플랜테이션 탐구 / 활동2 쿤밍-몬트리올 GBF 분석과 생태계 회복 정책 제안)'],
        link:'식민지였던 열대 지역에서 이 작물들을 길러 낸 방식, 플랜테이션을 살펴봐요.'},
      blocks:[
        {t:'callout', tone:'warn', title:'디지털 기기 안전 약속', text:'QR 코드는 선생님이 준 것만 스캔하고, 수업과 관련 없는 사이트에는 들어가지 않아요.<br>패들렛 게시물과 사진에 얼굴, 실명, 학번이 드러나지 않게 해요.'},
        {t:'slides', from:3, to:5, title:'생각 열기 · 원재료와 생산국'},
        {t:'predict', id:'e34-snack-pred', ws:'생각 열기', q:'먼저 예측해요. 이 원재료의 주요 생산국들에는 어떤 공통점이 있을까요? 기후 말고도 떠오르는 것이 있나요?',
          placeholder:'예: 대부분 ___ 지역에 있고, 과거에 ___ 했을 것 같다.',
          reveal:[
            {t:'widget', name:'eco-trace', opts:{key:'e34-trace', products:[
              {name:'초콜릿', items:[{m:'카카오',c:'코트디부아르, 가나'},{m:'설탕 (원료 작물: 사탕수수)',c:'브라질, 인도'}]},
              {name:'과자·라면', items:[{m:'팜유',c:'인도네시아, 말레이시아'}]},
              {name:'커피믹스', items:[{m:'커피',c:'브라질, 베트남'},{m:'설탕 (원료 작물: 사탕수수)',c:'브라질, 인도'}]},
              {name:'자동차 타이어', items:[{m:'천연고무',c:'인도네시아, 태국'}]}
            ]}},
            {t:'widget', name:'eco-match', opts:{key:'e34-match', q:'기후만으로 설명될까요? 주요 생산국을 과거에 지배했던 나라를 골라 보세요.',
              options:['네덜란드, 영국','프랑스, 영국','포르투갈, 영국','포르투갈, 프랑스','네덜란드 / 없음(태국)'],
              rows:[
                {m:'팜유',c:'인도네시아, 말레이시아',a:0},
                {m:'카카오',c:'코트디부아르, 가나',a:1},
                {m:'사탕수수',c:'브라질, 인도',a:2},
                {m:'커피',c:'브라질, 베트남',a:3},
                {m:'천연고무',c:'인도네시아 / 태국',a:4}
              ],
              explain:'주요 생산국은 대체로 열대 지역의 <b>과거 유럽 국가 식민지</b>였어요. 예외도 있어요. 태국은 식민 지배를 받지 않았고, 브라질은 독립 이후에 커피 재배가 늘었어요.'}}
          ],
          compare:'열대 기후만으로 설명될까요? 짝짓기 결과를 보고 내 예측을 고쳐 써 보세요.'}
      ]},

    /* ---------- 활동1 중 35′ (7+8+12+8) ---------- */
    { id:'plant', phase:'전개 · 활동1', minutes:7, move:'설명',
      title:'과거-현재, 플랜테이션 탐구 ① 플랜테이션, 숲을 바꾼 농장',
      purpose:'유럽의 공장과 식민지의 숲이 어떻게 이어졌는지 알려면, 먼저 ‘플랜테이션’이 어떤 농업인지 정확히 알아야 해요.',
      how:['산업혁명 이후 유럽 공업국에 무엇이 많이 필요해졌는지 골라요.','읽기 자료를 읽고 빈칸과 Q1 플랜테이션의 세 요소를 채워요(활동1-1).','사례 문장 네 개를 세 요소로 나누며 뜻을 확인해요.'],
      outcome:'플랜테이션을 이루는 세 요소를 내 말로 설명할 수 있어요. 그럼 숲이 이런 농장으로 바뀌면 생태계는 어떻게 될까요?',
      prompt:'산업혁명과 제국주의는 식민지의 땅을 어떻게 바꾸었을까요?',
      visual:{src:S34+'s06.jpg', alt:'산업혁명과 제국주의 시기 식민지 농업에 관한 읽기 자료와 빈칸', cap:PPT+'(슬라이드 6 · 활동지 1번 읽기 자료)'},
      teacher:{
        ask:['산업혁명 이후 유럽 공업국에는 어떤 물자가 많이 필요해졌나요?'],
        answer:['공장 원료인 면화와 고무가 필요했어요.','노동자가 먹을 설탕과 커피도 필요했어요.'],
        tip:['활동1: 중 35′ / 고 40′, ★PPT, ☆활동지(워크북), 패들렛.','플랜테이션이 산업혁명과 제국주의 시기를 거친 이후 원료·식량 수요 증가와 제국주의 경쟁으로 더욱 확대된 흐름을 파악하게 한다.','플랜테이션의 세 요소(단일 경작, 외부 노동력 동원, 본국 수출 구조)를 활동지에 정리한다.'],
        link:'단일 경작이 생태계에 어떤 변화를 남기는지 모형으로 실험해요.'},
      blocks:[
        {t:'slides', from:6, to:8, title:'읽기 자료 · Q1 플랜테이션의 세 요소'},
        {t:'choice', id:'e34-plant-need', ws:'활동1-1', kind:'발문', q:'산업혁명 이후 유럽 공업국(열강)에 많이 필요해진 것을 모두 골라요.',
          options:['면화·고무 같은 공장의 원료','설탕·커피 같은 노동자의 식량','본국의 완성품을 수출할 시장','석탄을 대신할 태양광 발전소'], answer:[0,1,2],
          hints:['읽기 자료의 ‘산업혁명 이후 …’ 문장과 ‘또한, …’ 문장에 답이 세 가지 있어요.','마지막 보기는 산업혁명 시기에 있었던 것일까요?'],
          explain:'공장의 원료와 노동자의 식량(설탕, 커피 등)이 대량으로 필요해졌고, 완성품을 팔 시장도 필요했어요. 그래서 대외 팽창 정책(제국주의 정책)을 추진했어요.'},
        {t:'blanks', id:'e34-plant-q1', ws:'활동1-1', kind:'빈칸 · Q1', q:'읽기 자료를 읽고 빈칸을 채워요.',
          text:'…점령한 식민지의 땅에 한 가지 수출 작물만 대규모로 기르는 ( [[플랜테이션]] ) 농업을 확대했다.<br>Q1. 플랜테이션의 세 요소<br>① 한 작물만 기르는 ( [[단일 경작|단일경작]] )<br>② 노예·계약 노동자 등 외부 ( [[노동력]] ) 동원<br>③ 생산물을 본국으로 보내는 ( [[본국 수출|수출|본국수출]] ) 구조',
          hints:['첫 칸은 영어에서 온 다섯 글자 낱말이에요.','① ○○ 경작 ② 사람이 일하는 힘 ③ 물건을 나라 밖으로 파는 것'],
          explain:'플랜테이션의 세 요소는 <b>단일 경작 · 외부 노동력 동원 · 본국 수출 구조</b>예요.'},
        {t:'sort', id:'e34-q1-sort', ws:'활동1-1', kind:'확인하기', q:'워크북 사례 글의 문장을 세 요소로 나눠 보세요. 이 문장은 어느 요소를 보여 주나요?',
          bins:['단일 경작','외부 노동력 동원','본국 수출 구조'],
          items:[
            {text:'실론의 산비탈은 끝없는 커피나무 줄로 바뀌었다',bin:0},
            {text:'사탕수수를 베고 끓이는 고된 일에 아프리카에서 끌려온 수많은 노예가 동원되었다',bin:1},
            {text:'영국령 말라야 고무 농장에서 인도 남부에서 온 계약 노동자들이 일했다',bin:1},
            {text:'자와의 생산물은 정해진 값에 식민 정부로 넘겨졌고 유럽에서 팔렸다',bin:2}
          ],
          explain:'세 요소는 사례마다 드러나는 모습이 달라요. 노동력은 바베이도스처럼 바다 건너 끌려온 사람일 수도, 자와처럼 강제로 동원된 현지 농민일 수도 있어요. 다음 장면에서 단일 경작이 생태계에 무엇을 남기는지 실험해요.'}
      ]},

    { id:'forest', phase:'전개 · 활동1', minutes:8, move:'예측',
      title:'과거-현재, 플랜테이션 탐구 ② 열대림이 단일 경작 농장이 되면? (Q2)',
      purpose:'숲이 한 작물 농장으로 바뀔 때 생물·흙·병에 무슨 일이 생기는지 모형으로 확인해야 Q2에 근거를 들어 답할 수 있어요.',
      how:['읽기 자료(열대우림이 베어지고 단일 작물만 끝없이 심어졌다)를 읽어요.','병이 어디까지 퍼질지 먼저 예측하고, 슬라이더를 열대림에서 단일 경작으로 옮겨 병을 퍼뜨려 비교해요.','사례2 실론 질문에 답한 뒤, Q2를 주장·근거·이유로 써요.'],
      outcome:'단일 경작이 생물·흙·병에 어떤 변화를 남기는지 근거를 들어 설명할 수 있어요. 이제 실제 네 지역에서 무슨 일이 있었는지 확인해요.',
      prompt:'제국주의 열강의 플랜테이션 농업으로 생태계에는 어떤 변화가 생길까요?',
      visual:{src:'img/e34-forest-farm.jpg', alt:'왼쪽은 여러 층의 열대림, 오른쪽은 같은 나무가 줄지어 끝없이 심어진 농장', cap:GEN+' · 열대림과 단일 경작 농장'},
      teacher:{
        ask:['자료를 통해 볼 수 있는 생태계 변화는 무엇인가요?'],
        answer:['(사례1) 섬의 숲 대부분이 사라지고 흙이 쓸려 내려갔어요.','(사례2) 같은 품종만 심어 커피녹병이 빠르게 번졌어요.'],
        tip:['PPT 슬라이드 11: 열대림(수많은 동식물이 층을 이루어 산다 / 뿌리와 낙엽이 흙을 붙잡고 덮는다 / 병이 생겨도 일부 종에만 퍼진다)과 단일 경작 농장(한 종, 대개 한 품종만 남는다 / 맨흙이 드러나 비에 쓸려 간다 / 같은 품종을 타고 병이 한꺼번에 번진다)을 비교한다.','병 퍼뜨리기 모형은 실제 수치가 아닌 생각 실험임을 알려 준다.'],
        link:'모형에서 본 변화가 실제 역사에서는 어떻게 나타났는지 네 사례를 나눠 맡아 분석해요.'},
      blocks:[
        {t:'slides', from:9, to:11, title:'읽기 자료 · Q2 열대림과 단일 경작 농장'},
        {t:'p', text:'“열대우림이 우거졌던 동남아시아와 라틴아메리카의 수많은 산림이 베어져 나갔다. 그 자리에는 원주민들이 대대로 기르던 다양한 작물 대신, 오직 유럽 시장에 내다 팔 ‘천연고무 나무’와 ‘커피나무’, ‘사탕수수’ 등 단일 작물만이 끝없이 심어졌다.” <span class="src">— 워크북 활동1-1 읽기 자료</span>'},
        {t:'predict', id:'e34-mono-pred', ws:'활동1-1', q:'먼저 예측해요. 같은 품종만 빽빽한 단일 경작 농장에 병이 생기면?',
          options:['열대림보다 덜 퍼진다','열대림과 비슷하게 퍼진다','열대림보다 훨씬 넓게 퍼진다'],
          reveal:[
            {t:'widget', name:'eco-mono', opts:{key:'e34-mono', rows:[
              ['생물','수많은 동식물이 층을 이루어 산다','한 종, 대개 한 품종만 남는다'],
              ['흙','뿌리와 낙엽이 흙을 붙잡고 덮는다','맨흙이 드러나 비에 쓸려 간다'],
              ['병','병이 생겨도 일부 종에만 퍼진다','같은 품종을 타고 병이 한꺼번에 번진다']
            ]}},
            {t:'choice', id:'e34-ceylon', ws:'활동1-1', kind:'사례2 질문', q:'사례2 실론: 1869년 커피녹병이 발견되고 1880년대 커피 산업이 무너졌어요. 커피 농장이 무너진 이유는 병균일까, 단일 경작이라는 선택일까?',
              options:['병균','단일 경작이라는 선택'], answer:1,
              hints:['모형에서 병은 어떤 나무에게만 옮았나요?','같은 병균이 열대림에 왔다면 같은 속도로 번졌을까요?'],
              why:true,
              explain:'병균은 계기였어요. 같은 품종의 나무가 빽빽이 붙어 있었기 때문에 병이 농장에서 농장으로 빠르게 번졌어요(워크북 사례2).'}
          ],
          compare:'내 예측과 모형 결과는 어떻게 같고 달랐나요?'},
        {t:'cer', id:'e34-q2', ws:'활동1-1', kind:'Q2', q:'Q2. 제국주의 열강의 ‘플랜테이션 농업’으로 인해 생태계에는 어떤 변화가 생길까요? 위 글을 참고하고 생물·흙·병 중 두 가지 이상을 근거로 써요.',
          starters:{c:'플랜테이션 농업은 생태계를 ___하게 만든다.', e:'읽기 자료와 모형에서 ___했고, ___했다.', r:'이것은 한 품종만 남으면 ___ 때문이다.'},
          example:'플랜테이션은 생태계를 단순하고 약하게 만든다. 열대림에는 수많은 동식물이 층을 이루어 살지만 농장에는 한 품종만 남고, 맨흙이 비에 쓸려 가며, 모형에서 병이 같은 품종을 타고 대부분의 나무로 번졌다. 다양성이 사라지면 흙과 병을 막아 주던 연결이 끊기기 때문이다.'}
      ]},

    { id:'cases', phase:'전개 · 활동1', minutes:12, move:'분석',
      title:'과거-현재, 플랜테이션 탐구 ③ 사례를 통해 알아보는 플랜테이션',
      purpose:'네 지역의 플랜테이션을 같은 다섯 기준으로 분석해야 서로 비교하고 공통 원인을 찾을 수 있어요.',
      how:['모둠원 4명이 사례1~4를 하나씩 맡아요.','맡은 사례 글을 읽고 분석표 다섯 칸(무엇을 길렀나, 누가 결정했나, 생태계 변화, 사회 변화, 오늘의 흔적)을 채워요.','모둠원에게 내 사례를 설명하고, 친구들의 사례도 분석표에 옮겨 적어요.'],
      outcome:'네 사례의 다섯 기준이 한 표에 모여, 공통점을 찾을 준비가 돼요.',
      prompt:'설탕·커피·고무·팜유 농장은 누가 결정했고, 무엇을 남겼을까요?',
      visual:{src:S34+'s12.jpg', alt:'분석 기준: 무엇을 길렀나, 누가 결정했나, 생태계 변화, 사회 변화, 오늘의 흔적', cap:PPT+'(슬라이드 12 · 활동지 2번 분석 기준)'},
      teacher:{
        ask:['자료를 통해 볼 수 있는 생태계 변화는 무엇인가요?','위와 같은 변화로 발생한 사회적 문제는 무엇인가요?'],
        answer:['(사례1) 섬의 숲 대부분이 사라지고 흙이 쓸려 내려갔어요.','(사례2) 같은 품종만 심어 커피녹병이 빠르게 번졌어요.','(사례1) 아프리카인 노예 노동이 크게 늘었어요.','(사례3) 식량 작물이 줄어 기근이 일어났어요.'],
        tip:['모둠원이 사례1~4를 하나씩 맡아 분석한 후 모둠원들에게 공유한다(워크북 2쪽 사례 글).','‘누가 결정했나’에 본국 정부, 농장주 등 결정 주체를 명확히 쓰도록 지도한다.','노예무역과 강제 노동은 피해자의 존엄을 해치지 않는 언어로 다룬다.'],
        link:'네 사례를 다 채웠으면 나란히 놓고 공통점과 계속되는 이유를 찾아요.'},
      blocks:[
        {t:'slides', from:12, to:16, title:'분석 기준 · 사례1~4'},
        {t:'history', items:[
          {src:'img/e34-v3-barbados.jpg', title:'사례1 바베이도스', fact:'17세기 · 카리브해 · 사탕수수 · 1657년 지도', credit:'그림: 리처드 라이곤(Richard Ligon)의 1657년 바베이도스 지도(후대 복제본, 레이던대학 도서관 KITLV 1407468) · CC BY 4.0 · Wikimedia Commons'},
          {src:'img/e34-more-tea.jpg', title:'사례2 실론', fact:'19세기 · 스리랑카 · 커피 → 차', credit:GEN},
          {src:'img/e34-v3-java.jpg', title:'사례3 자와', fact:'19세기 · 인도네시아 · 사탕수수, 커피, 인디고 · 1870년대 그림', credit:'그림: 아브라함 살름(Abraham Salm), 「자와 테갈 근처의 케망글렌 설탕 공장」(1870~1875년경), 암스테르담 국립미술관 · CC0 · Wikimedia Commons'},
          {src:'img/e34-more-orangutan.jpg', title:'사례4 말레이반도·보르네오', fact:'20세기~오늘 · 고무 → 기름야자', credit:GEN}
        ]},
        {t:'cards', title:'플랜테이션 다양한 사례 (워크북 2쪽)', items:[
          {tag:'사례1 · 17세기 카리브해', title:'설탕 섬, 바베이도스', text:'1640년대, 카리브해의 작은 섬 바베이도스에 정착한 영국인들은 사탕수수를 심기 시작했다. 설탕은 유럽에서 비싸게 팔렸고, 농장주들은 숲을 불태우고 베어 밭을 넓혔다. 수십 년 만에 섬을 덮고 있던 숲 대부분이 사라졌다. 비가 오면 겉흙이 쓸려 내려갔고, 땔감과 식량은 다른 섬과 북아메리카에서 들여와야 했다. 사탕수수를 베고 끓이는 고된 일에는 아프리카에서 끌려온 수많은 노예가 동원되었다.<br><b>생각해 보기</b> 설탕의 이익과 숲·사람의 비용은 각각 누구에게 돌아갔을까?'},
          {tag:'사례2 · 19세기 스리랑카', title:'녹슨 잎, 실론의 커피', text:'영국은 1830년대부터 실론(지금의 스리랑카) 고지대의 숲을 베어 커피 농장을 만들었다. 섬의 산비탈은 끝없는 커피나무 줄로 바뀌었다. 그런데 1869년, 잎에 녹 같은 반점이 생기는 ‘커피녹병’이 발견되었다. 같은 품종의 나무가 빽빽이 붙어 있었기 때문에 병은 농장에서 농장으로 빠르게 번졌고, 1880년대 실론의 커피 산업은 무너졌다. 농장주들은 커피 대신 차나무를 심었다. 오늘날 ‘실론티’의 출발점이다.<br><b>생각해 보기</b> 커피 농장이 무너진 이유는 병균일까, 단일 경작이라는 선택일까?'},
          {tag:'사례3 · 19세기 인도네시아', title:'강요된 작물, 자와의 강제재배제도', text:'1830년, 네덜란드 식민 정부는 자와 섬 농민들에게 땅과 노동의 일부를 사탕수수, 커피, 인디고(염료) 같은 수출 작물 재배에 쓰도록 강요했다. 생산물은 정해진 값에 식민 정부로 넘겨졌고 유럽에서 팔려 네덜란드 재정을 크게 채웠다. 그러나 벼농사에 쓸 땅과 일손이 줄어들자 1840년대 여러 지역에서 큰 기근이 일어나 많은 사람이 목숨을 잃었다.<br><b>생각해 보기</b> 수출 작물을 기르는 땅이 늘면 식량을 기르는 땅은 어떻게 될까?'},
          {tag:'사례4 · 20세기~오늘', title:'고무에서 팜유로, 말레이반도와 보르네오', text:'20세기 초 자동차가 늘어나자 타이어용 고무 수요가 폭발했다. 영국령 말라야에는 브라질에서 들여온 고무나무 농장이 끝없이 늘었고, 인도 남부에서 온 계약 노동자들이 일했다. 독립 이후 20세기 후반, 많은 농장이 더 수익이 높은 기름야자로 바뀌었고 보르네오·수마트라의 열대림도 새로 개간되었다. 오늘날 말레이시아와 인도네시아는 세계 팜유의 대부분을 생산하며, 이 숲에 사는 오랑우탄의 서식지는 크게 줄었다.<br><b>생각해 보기</b> 식민 지배가 끝났는데도 농장이 더 늘어난 이유는 무엇일까?'}
        ], src:'교사 제작 워크북 2쪽 · PPT 슬라이드 13~16'},
        {t:'timer', minutes:10, label:'사례 분석·공유 시간'},
        {t:'write', id:'e34-case1', ws:'활동1-2', kind:'분석표 · 사례1', q:'사례1 바베이도스 (담당자 이름도 적어요)', rows:6,
          placeholder:'담당자:\n무엇을 길렀나:\n누가 결정했나:\n생태계 변화(숲, 생물, 흙):\n사회 변화(사람, 노동, 식량):\n오늘의 흔적:',
          example:'무엇을: 사탕수수 / 누가: 영국인 정착민 농장주 / 생태계: 숲을 불태우고 베어 섬의 숲 대부분이 사라지고, 비가 오면 겉흙이 쓸려 내려감 / 사회: 아프리카에서 끌려온 수많은 노예 동원, 땔감·식량을 다른 섬과 북아메리카에서 들여옴 / 오늘의 흔적: 모둠에서 토의해 적어요.'},
        {t:'write', id:'e34-case2', ws:'활동1-2', kind:'분석표 · 사례2', q:'사례2 실론 (담당자 이름도 적어요)', rows:6,
          placeholder:'담당자:\n무엇을 길렀나:\n누가 결정했나:\n생태계 변화(숲, 생물, 흙):\n사회 변화(사람, 노동, 식량):\n오늘의 흔적:'},
        {t:'write', id:'e34-case3', ws:'활동1-2', kind:'분석표 · 사례3', q:'사례3 자와 (담당자 이름도 적어요)', rows:6,
          placeholder:'담당자:\n무엇을 길렀나:\n누가 결정했나:\n생태계 변화(숲, 생물, 흙):\n사회 변화(사람, 노동, 식량):\n오늘의 흔적:'},
        {t:'write', id:'e34-case4', ws:'활동1-2', kind:'분석표 · 사례4', q:'사례4 말레이반도·보르네오 (담당자 이름도 적어요)', rows:6,
          placeholder:'담당자:\n무엇을 길렀나:\n누가 결정했나:\n생태계 변화(숲, 생물, 흙):\n사회 변화(사람, 노동, 식량):\n오늘의 흔적:'}
      ]},

    { id:'struct', phase:'전개 · 활동1', minutes:8, move:'판단',
      title:'과거-현재, 플랜테이션 탐구 ④ 생각 더하기 (Q3·Q4·Q5)',
      purpose:'네 사례를 겹쳐 보면 한 사람의 잘못이 아니라 계속 같은 결과를 만드는 ‘구조’가 보여요. 그 구조를 내 말로 정의해요.',
      how:['분석표의 무엇을 길렀나·누가 결정했나·생태계 변화 칸을 비교해 Q3 공통점을 써요.','Q4 식민지가 독립한 뒤에도 플랜테이션이 계속된 이유를 먼저 쓰고, 원인과 결과의 고리를 순서대로 이어 확인해요.','Q5 ‘생태계 파괴의 구조적 원인이란 (   )이다.’를 완성해요.'],
      outcome:'생태계 파괴의 구조적 원인을 정의하고, 그 구조가 오늘 우리의 소비와도 이어진다는 것을 알아요. 이 구조를 바꾸려면 어떤 약속이 필요할까요?',
      prompt:'식민지가 독립한 뒤에도 플랜테이션이 계속되거나 오히려 늘어난 이유는 무엇일까요?',
      visual:{src:'img/e34-chain.jpg', alt:'열대 농장에서 시작된 긴 컨베이어 벨트가 바다를 건너 도시의 가게 선반까지 이어진 그림', cap:GEN+' · 농장에서 우리 장바구니까지'},
      teacher:{
        ask:['4가지 사례의 공통점은 무엇인가요?','식민지가 독립한 뒤에도 플랜테이션이 사라지지 않은 이유는 무엇일까요?'],
        answer:['유럽 본국이 결정하고 숲을 베어 한 작물만 길렀어요.','수출로 돈을 버는 구조가 그대로 남았어요.','다른 나라 사람들이 그 상품을 계속 사기 때문이에요.'],
        tip:['네 사례를 비교하여 플랜테이션의 구조적 원인을 정리한다.','인과 사슬에 비약이 있으면 ‘그 사이에 무슨 일이 있었을까요?’라고 되묻는다.','‘생태계 파괴의 구조적 원인이란 ___이다.’를 작성하며 활동1을 마무리한다.'],
        link:'다음 활동에서는 세계가 합의한 GBF 실천 목표를 근거로 이 구조를 바꿀 정책을 제안해요. Q5의 답을 활동2를 시작할 때 다시 나눠요.'},
      blocks:[
        {t:'slides', from:17, to:19, title:'생각 더하기 Q3·Q4·Q5'},
        {t:'write', id:'e34-q3', ws:'활동1-2', kind:'Q3', q:'Q3. 4가지 사례의 공통점을 적어 봐요. (무엇을 길렀나 · 누가 결정했나 · 생태계 변화 칸을 비교해 보세요.)', rows:2,
          placeholder:'공통점: ',
          example:'현지 사람이 아니라 유럽 본국 정부와 농장주가 결정했고, 숲을 베어 한 가지 수출 작물만 길렀으며, 숲과 흙이 사라지거나 병이 번졌어요.'},
        {t:'predict', id:'e34-q4', ws:'활동1-2', kind:'Q4', q:'Q4. 식민지가 독립한 후에도 플랜테이션이 계속되거나 오히려 늘어난 이유는 무엇일까요? (사례4와 우리가 사는 물건(과자, 타이어)을 떠올려 보세요.) 내 생각을 먼저 적은 뒤 원인과 결과의 고리를 이어 확인해요.',
          placeholder:'독립 후에도 계속된 까닭은 ___ 때문이다.',
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
        {t:'write', id:'e34-q5', ws:'활동1-2', kind:'Q5', q:'Q5. 생태계 파괴의 ‘구조적’ 원인이란 (   )이다.<br><span class="src">※ 구조적 원인: 한 사람의 잘못이 아니라, 제도·경제·소비가 맞물려 계속 같은 결과를 만드는 원인</span>', rows:2,
          placeholder:'생태계 파괴의 ‘구조적’ 원인이란 ___이다.',
          example:'생태계 파괴의 구조적 원인이란 수출 작물을 원하는 시장과 그것을 계속 사는 소비가 맞물려, 독립 뒤에도 숲을 한 작물 농장으로 바꾸게 만드는 구조이다.'}
      ]},

    /* ---------- 활동2 중 35′ (10+25) ---------- */
    { id:'gbf', phase:'전개 · 활동2', minutes:10, move:'분석',
      title:'쿤밍-몬트리올 GBF 분석 ① 실천 목표 1가지 고르기',
      purpose:'생태계를 되살리려고 세계가 함께 정한 약속(GBF)을 알아야, 우리 정책에 믿을 만한 근거를 댈 수 있어요.',
      how:['지난 활동 Q5의 답을 모둠에서 나눠요.','GBF가 언제, 어디서, 무엇을 정했는지 읽어요.','선생님이 준 QR(아래 링크)로 GBF 2030 실천 목표를 살펴보고, 모둠 토의 후 가장 주목한 목표 1가지의 번호와 이유를 써요(활동2-1 Q1).'],
      outcome:'우리 모둠이 근거로 쓸 GBF 실천 목표 1가지와 그 목표가 필요한 이유를 정해요. 이제 이 목표로 어떤 사례의 문제를 해결할지 골라요.',
      prompt:'GBF 2030 실천 목표 중 우리 모둠이 가장 주목한 목표는 무엇인가요?',
      visual:{src:S34+'s20.jpg', alt:'쿤밍-몬트리올 GBF 숫자 카드: 2022.12 COP15에서 채택, 196 생물다양성협약 당사국, 2050 비전 자연과 조화로운 삶, 23 2030년까지의 실천 목표', cap:PPT+'(슬라이드 20)'},
      teacher:{
        ask:['QR 코드를 스캔하여 GBF 2030 실천 목표를 살펴보고, 모둠 토의 후 가장 주목한 목표 1가지를 선택해 봅시다.'],
        answer:['3번 목표요. 남은 숲을 보호구역으로 지켜야 오랑우탄 같은 생물이 살 수 있어요.','15번 목표요. 기업이 숲을 파괴한 원료를 쓰는지 알아야 소비자가 고를 수 있어요.'],
        tip:['활동2: 중 35′ / 고 40′, ★PPT, 디지털 기기, GBF QR 코드 / ☆활동지(워크북), 활동 체크리스트, 패들렛.','1차시 Q5의 답을 공유하며 지난 시간 내용을 상기한다.','쿤밍-몬트리올 GBF의 채택 배경과 23개 실천 목표의 구성을 파악한다. 23개 목표를 암기하기보다 어느 묶음에서 찾을지 감을 잡도록 지도한다.','의장국 중국(쿤밍)과 개최지 캐나다(몬트리올)의 이름이 함께 붙었다(슬라이드 20).'],
        link:'고른 목표와 잘 맞는 사례를 골라, 그 사례의 ‘오늘의 흔적’을 해결하는 정책을 써요.'},
      blocks:[
        {t:'slides', from:20, to:22, title:'쿤밍-몬트리올 GBF · 실천 목표 QR'},
        {t:'stats', items:[
          {num:'2022.12', label:'COP15에서 채택 (캐나다 몬트리올)'},
          {num:'196', label:'생물다양성협약 당사국'},
          {num:'2050', label:'비전: 자연과 조화로운 삶'},
          {num:'23', label:'2030년까지의 실천 목표'}
        ], src:PPT+'(슬라이드 20)'},
        {t:'p', text:'2022년 12월, 캐나다 몬트리올에서 열린 생물다양성협약 제15차 당사국총회(COP15)에서 세계 여러 나라는 ‘쿤밍-몬트리올 글로벌 생물다양성 프레임워크(GBF)’에 합의했습니다. 2050년까지 ‘자연과 조화로운 삶’을 이루기 위해, 2030년까지 함께 실천할 23개의 실천 목표를 정했습니다. <span class="src">— 워크북 활동2-1</span>'},
        {t:'tool', url:'https://m.site.naver.com/2cD0u', title:'GBF 2030 실천 목표 (선생님 QR 링크)', text:'PPT 슬라이드 22·워크북 3쪽의 QR과 같은 링크예요. 23개 목표를 훑어보고 모둠 토의로 1가지를 골라요.'},
        {t:'write', id:'e34-gbf-no', ws:'활동2-1', kind:'Q1', q:'Q1. 우리 모둠이 선택한 GBF 실천 목표 번호: (   )번', rows:1, placeholder:'예: 15'},
        {t:'write', id:'e34-gbf-why', ws:'활동2-1', kind:'Q1', q:'이 목표를 선택한 이유 / 이 목표가 필요한 이유', rows:3,
          example:'15번 목표: 기업이 숲을 파괴한 원료를 쓰는지 알아야 소비자가 고를 수 있어요. (지도안 예시) / 3번 목표: 남은 숲을 보호구역으로 지켜야 오랑우탄 같은 생물이 살 수 있어요.'}
      ]},

    { id:'policy', phase:'전개 · 활동2', minutes:25, move:'실천',
      title:'생태계 회복 정책 제안 ② 함께 그려보는 우리의 미래',
      purpose:'1차시 사례의 ‘오늘의 흔적’을 GBF 목표를 근거로 해결하는 정책으로 바꿔야, 다짐이 아니라 실제로 실행할 수 있는 제안이 돼요.',
      how:['Q1에서 고른 목표와 잘 맞는 사례 1가지를 고르고, 분석표의 ‘오늘의 흔적’을 옮겨 적어요(Q2).','정책의 이름, 제안 대상, 정책 내용(누가, 언제까지, 무엇을), 예상 반론과 대응을 채워요. 정책 내용은 문장 틀을 따라요.','활동 체크리스트 세 가지로 제안서를 점검한 뒤 <b>제안서 칸에 옮기기</b>를 눌러요.'],
      outcome:'실행 주체와 방법, 근거가 담긴 우리 모둠의 정책 제안서를 완성해요. 다른 모둠과 나누며 더 다듬어요.',
      prompt:'우리 모둠은 어떤 사례의 흔적을, 누가 언제까지 무엇을 해서 줄일까요?',
      visual:{src:S34+'s26.jpg', alt:'정책 내용 문장 틀: (누가)은/는 (언제)까지 (무엇을) 해야 한다. 이는 GBF (  )번 목표를 실천하는 것이며, (오늘의 흔적)을/를 줄일 것이다.', cap:PPT+'(슬라이드 26 · 정책 내용 문장 틀)'},
      teacher:{
        ask:['우리 모둠이 선택한 사례의 ‘오늘의 흔적’을 분석표에서 옮겨 적어 봅시다.','정책 내용에 누가, 언제까지, 무엇을 해야 하는지 담겨 있나요?','이 정책을 반대할 사람은 누구이고, 어떻게 보완할 수 있을까요?'],
        answer:['(사례4) 팜유 농장이 늘어 열대림과 오랑우탄 서식지가 줄었어요.','국내 식품 기업은 2030년까지 팜유 원료가 열대림을 파괴하지 않았는지 공개해야 해요.','원가가 오르는 기업과 원산지 소농이 반대할 수 있으니 인증 비용을 지원해요.'],
        tip:['1차시 4가지 사례 중 모둠별로 1가지를 선택하여 해결할 문제를 정한다(슬라이드 24: Q1에서 고른 목표와 잘 맞는 사례로 선택하기).','Q1의 실천 목표를 근거로 Q2의 문제를 해결하는 정책 제안서(정책의 이름, 제안 대상, 정책 내용, 예상 반론과 대응)를 작성한다.','제안서가 다짐이나 구호에 머무르지 않도록 실행 주체와 방법을 구체화하도록 지도한다.','활동 체크리스트로 제안서를 점검하도록 한다.'],
        link:'완성한 제안서를 패들렛에 올리고, 근거를 든 칭찬과 보완 질문을 주고받아요.'},
      blocks:[
        {t:'slides', from:23, to:26, title:'해결할 문제 정하기 · 정책 제안서 쓰기'},
        {t:'write', id:'e34-pick', ws:'활동2-2', kind:'Q2', q:'Q2. 우리 모둠이 선택한 사례는 무엇인가요? (사례1 바베이도스 / 사례2 실론 / 사례3 자와 / 사례4 말레이반도·보르네오 중 Q1에서 고른 목표와 잘 맞는 사례)', rows:1,
          placeholder:'사례: '},
        {t:'write', id:'e34-trace', ws:'활동2-2', kind:'Q2', q:'1차시 분석표에서 그 사례의 ‘오늘의 흔적’(우리가 해결할 문제)을 옮겨 적어요.', rows:2,
          example:'(사례4) 팜유 농장이 늘어 열대림과 오랑우탄 서식지가 줄었어요.'},
        {t:'timer', minutes:20, label:'모둠 정책 제안서 작성 시간'},
        {t:'widget', name:'eco-policy', opts:{key:'e34-pol', target:'e34-policy',
          checklist:['1차시 사례의 내용이 근거로 들어갔는가?','다짐이나 구호가 아니라 실행하는 사람과 방법이 있는가?','원산지 주민이나 노동자의 입장을 생각했는가?'],
          example:'<b>정책 내용</b> 국내 식품 기업은 2030년까지 팜유 원료가 열대림을 파괴하지 않았는지 공개해야 한다. (15번 목표)<br><b>예상 반론과 대응</b> 원가가 오르는 기업과 원산지 소농이 반대할 수 있으니 인증 비용을 지원한다.'}},
        {t:'write', id:'e34-policy', ws:'활동2-2', kind:'정책 제안서', q:'우리 모둠 정책 제안서 (위에서 <b>제안서 칸에 옮기기</b>를 누르면 채워져요.)', rows:6,
          placeholder:'정책의 이름:\n제안 대상(정부 / 기업 / 학교 / 지역 사회):\n정책 내용(누가, 언제까지, 무엇을 해야 하는가):\n예상 반론과 대응(반대할 사람은 누구이고 어떻게 보완할 수 있는가):\n활동 체크리스트 점검:'}
      ]},

    /* ---------- 정리 10′ ---------- */
    { id:'wrap', phase:'정리', minutes:10, move:'성찰',
      title:'정리 — 제안서 공유와 생각 더하기',
      purpose:'다른 모둠 제안서를 근거로 칭찬하고 질문하면 우리 제안서의 빈 곳이 보이고, 오늘 배운 것이 내 소비와 어떻게 이어지는지 돌아볼 수 있어요.',
      how:['완성한 정책 제안서를 사진으로 찍어 학급 패들렛에 올려요(얼굴, 실명, 학번은 가려요).','다른 모둠 제안서를 감상하고 근거 칭찬 1개 + 보완 질문 1개 댓글을 남겨요(비난은 하지 않아요).','Q3 초콜릿, 커피, 타이어를 보는 나의 눈이 어떻게 달라졌는지 한 문장으로 쓰고, 새롭게 알게 된 점을 정리해요.'],
      outcome:'간식 속 원재료가 식민지 시대 플랜테이션과 이어져 있고, 그 구조를 바꾸는 약속이 생태계 회복의 출발점이라는 것을 내 말로 말할 수 있어요.',
      prompt:'초콜릿, 커피, 타이어를 보는 나의 눈은 어떻게 달라졌나요?',
      visual:{src:S34+'s27.jpg', alt:'공유 활동: 정책 제안서 사진 학급 패들렛 게시, 다른 모둠 제안서 감상, 근거를 포함한 칭찬과 보완할 부분 혹은 질문 댓글', cap:PPT+'(슬라이드 27 · 공유 활동)'},
      teacher:{
        ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?'],
        answer:['우리가 먹는 간식 재료가 식민지 시대 플랜테이션과 연결되어 있음을 알게 되었습니다.','단일 경작이 숲과 생물다양성을 파괴하고 병해에 약하게 만든다는 것을 알게 되었습니다.'],
        tip:['★PPT / ☆패들렛. 완성한 정책 제안서를 사진으로 찍어 패들렛에 게시하고, 다른 모둠의 제안서를 감상하며 ‘근거 칭찬 1개 + 보완 질문 1개’ 댓글로 느낀 점을 공유한다.','댓글은 근거를 들어 쓰도록 하고 비난성 표현은 피하도록 지도한다.','정책 제안서 사진을 패들렛에 올리기 전에 개인정보 보호 약속을 다시 한번 상기시킨다.']},
      blocks:[
        {t:'slides', from:27, to:28, title:'공유 활동 · 생각 더하기'},
        {t:'write', id:'e34-wrap-fb', ws:'정리', kind:'피드백', q:'다른 모둠에 남긴 댓글: 근거를 포함한 칭찬 1개 + 보완할 부분 또는 질문 1개 (비난은 하지 않아요)', rows:2,
          placeholder:'칭찬(근거): \n보완 질문: '},
        {t:'write', id:'e34-q3-eye', ws:'활동2-2', kind:'Q3', q:'Q3. 초콜릿, 커피, 타이어를 보는 나의 눈은 어떻게 달라졌나요? 한 문장으로 적어 봐요.', rows:2},
        {t:'write', id:'e34-wrap-new', ws:'정리', q:'오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?', rows:2,
          example:'우리가 먹는 간식 재료가 식민지 시대 플랜테이션과 연결되어 있음을 알게 되었어요. 단일 경작이 숲과 생물다양성을 파괴하고 병해에 약하게 만든다는 것을 알게 되었어요.'},
        {t:'reflect', id:'e34-exit', ws:'정리', items:['생태계 회복을 위해 내가 지킬 약속 한 가지','아직 궁금한 것 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/e34-more-label.jpg', tag:'실천', title:'원재료 표시 읽기', text:'집에 있는 과자 세 봉지에서 팜유·카카오·설탕을 찾아 생산국을 추적해요.'},
          {img:'img/e34-more-orangutan.jpg', tag:'오늘의 흔적', title:'보르네오의 숲과 오랑우탄', text:'사례4의 지금: 팜유 농장이 늘며 줄어든 서식지를 더 조사해요.'},
          {img:'img/e34-more-tea.jpg', tag:'역사', title:'실론티는 어떻게 시작됐을까', text:'커피녹병 뒤 차 농장으로 바뀐 실론. 무엇이 달라지고 무엇이 그대로였을지 조사해요.'},
          {img:'img/e34-more-gbf.jpg', tag:'확장', title:'다른 실천 목표로 하나 더', text:'GBF 23개 목표 중 다른 하나를 골라 우리 학교·지역의 정책을 써 봐요.'}
        ]}
      ]}
  ]
});

})();
