/* 그린 시그널 수업실 — 기후변화 노선 v2 (k12 · k34 · k57)
   기준: 최종 PPT(ppt/k12·k34·k57.md, slides/) > v1 > content_기후변화.md */
(function(){
  /* ---------- 공통 도우미 ---------- */
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => { const n = parseFloat(String(v==null?'':v).replace(',', '.').replace('−','-')); return isNaN(n) ? null : n; };
  const r1 = v => Math.round(v*10)/10;
  function ah(U, k, q){ return U.el('div',{class:'ah'}, U.el('span',{class:'k'},k), q?U.el('span',{class:'q',html:q}):null); }
  /* 위젯이 만든 글을 같은 화면의 write 블록에 넣는다(제출 화면에 모이도록) */
  function syncWrite(st, id, text){
    if(!id) return;
    st.set(id, text);
    const ta = document.getElementById(id);
    if(ta && ta.value !== text) ta.value = text;
  }

  /* ---------- 위젯: 출처 탐정 별표 투표 ---------- */
  GS.widget('climate-star-vote', function(host, o, st, U){
    const max = o.max || 2;
    let sel = st.get(o.key) || [];
    host.append(ah(U, o.kind || '별표 고르기', o.q));
    const list = U.el('div',{class:'opts'});
    const btns = o.items.map((t,i)=>{
      const star = U.el('span',{style:'flex:0 0 1.4em;font-size:1.25rem;line-height:1.2;color:var(--th)'});
      const b = U.el('button',{type:'button',class:'opt',onclick:()=>toggle(i)}, star, U.el('span',{html:(i+1)+'. '+t}));
      list.append(b); return {b, star};
    });
    const info = U.el('p',{class:'src'});
    host.append(list, info);
    function toggle(i){
      if(sel.includes(i)) sel = sel.filter(x=>x!==i);
      else if(sel.length >= max){ const f = U.fb(host); f.className='fb info'; f.textContent='★는 '+max+'개까지만 고를 수 있어요. 다른 별을 먼저 눌러 빼 주세요.'; return; }
      else sel = [...sel, i];
      st.set(o.key, sel); paint();
    }
    function paint(){
      btns.forEach(({b,star},i)=>{ const on = sel.includes(i); b.classList.toggle('sel',on); b.setAttribute('aria-pressed',String(on)); star.textContent = on ? '★' : '☆'; });
      info.textContent = '★ '+sel.length+' / '+max + (sel.length ? ' · 고른 질문: '+sel.slice().sort((a,b)=>a-b).map(i=>(i+1)+'번').join(', ') : '');
      const f = host.querySelector('.fb'); if(f && sel.length < max) f.remove();
    }
    paint();
  });

  /* ---------- 위젯: 사료 카드 뒤집기 + 실록 타임라인 ---------- */
  GS.widget('climate-source-cards', function(host, o, st, U){
    const flipped = st.get(o.key) || {};
    host.append(ah(U, o.kind || '사료 카드', o.q || '카드를 읽고 아래 칸에 먼저 써 본 다음, 카드를 뒤집어 비교해 보세요.'));
    const tl = U.el('div',{style:'display:flex;gap:6px;overflow-x:auto;padding-bottom:4px'});
    o.cards.forEach((c,i)=>{
      const on = o.show.includes(i);
      tl.append(U.el('div',{style:'flex:1 0 96px;border-top:5px solid '+(on?'var(--th)':'var(--line)')+';padding:6px 2px 0;font-size:.8rem;line-height:1.4;color:'+(on?'var(--ink)':'var(--muted)')},
        U.el('b',{text:'카드 '+(i+1)}), U.el('div',{text:c.when})));
    });
    host.append(U.el('p',{class:'src',text:'실록 타임라인 — 진하게 표시된 칸이 이 화면의 카드예요.'}), tl);
    const grid = U.el('div',{class:'cards'});
    o.show.forEach(i=>{
      const c = o.cards[i];
      const body = U.el('div',{});
      const btn = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ flipped[i] = !flipped[i]; st.set(o.key, flipped); paint(); }});
      const card = U.el('div',{class:'card',style:'display:flex;flex-direction:column;gap:10px;justify-content:space-between'}, body, U.el('div',{class:'row'}, btn));
      function paint(){
        body.innerHTML = '';
        card.style.background = flipped[i] ? 'var(--th-soft)' : 'var(--bg)';
        if(!flipped[i]){
          body.append(U.el('div',{class:'tg',text:'사료 카드 '+(i+1)+' · 앞면'}), U.el('h4',{html:c.title}), U.el('p',{class:'src',html:c.date,style:'margin-bottom:6px'}), U.el('p',{html:c.text}));
          if(c.think) body.append(U.el('p',{style:'margin-top:8px;font-weight:700;font-size:.9rem',text:'생각 질문'}), U.el('ul',{class:'goals',style:'font-size:.92rem'}, c.think.map(t=>U.el('li',{html:t}))));
          btn.textContent = '뒤집기 ↻';
        } else {
          body.append(U.el('div',{class:'tg',text:'사료 카드 '+(i+1)+' · 뒷면'}), U.el('h4',{html:c.title}));
          if(c.back) body.append(U.el('p',{html:c.back}));
          else body.append(U.el('p',{html:'<b>기록에 있는 것</b><br>'+c.has}), U.el('p',{style:'margin-top:8px',html:'<b>기록에 없는 것 · 더 필요한 것</b><br>'+c.missing}));
          btn.textContent = '앞면 보기 ↺';
        }
      }
      paint();
      grid.append(card);
    });
    host.append(grid);
    if(o.src) host.append(U.el('p',{class:'cap',html:'출처: '+o.src}));
  });

  /* ---------- 위젯: 태양 고도와 그림자 실험실 ---------- */
  GS.widget('climate-shadow', function(host, o, st, U){
    const s = st.get(o.key) || {a:45, h:30};
    host.append(ah(U, '실험실', '태양의 높이(태양 고도)를 바꾸면 막대 그림자가 어떻게 달라질까요?'));
    const pic = U.el('div',{});
    const aIn = U.el('input',{type:'range',min:'10',max:'80',step:'1','aria-label':'태양 고도'}); aIn.value = String(s.a);
    const aOut = U.el('span',{class:'num'});
    const hIn = U.el('input',{class:'w',type:'number',min:'1',max:'500',inputmode:'decimal','aria-label':'막대 높이(cm)',style:'max-width:7em'}); hIn.value = String(s.h);
    const out = U.el('div',{class:'fb info'});
    host.append(pic,
      U.el('div',{class:'slider'}, U.el('label',{text:'태양 고도'}), aIn, aOut),
      U.el('div',{class:'row'}, U.el('label',{text:'막대 높이'}), hIn, U.el('span',{text:'cm'})),
      out,
      U.el('p',{class:'cap',text:'그림자 길이는 도형의 원리로 어림한 값이에요. 실제 관측에서는 땅의 기울기나 막대를 세운 방법 때문에 조금씩 달라질 수 있어요.'}));
    function draw(){
      const a = +aIn.value, h = Math.max(1, num(hIn.value) || 30);
      s.a = a; s.h = h; st.set(o.key, s);
      aOut.textContent = a+'°';
      const rad = a*Math.PI/180, H = 40, gx = 270, gy = 180;
      const sh = H/Math.tan(rad);
      const sunX = gx + Math.cos(rad)*125, sunY = (gy-H) - Math.sin(rad)*125;
      const e = Math.sin(rad);
      pic.innerHTML = '<svg viewBox="0 0 400 200" style="width:100%;display:block" role="img" aria-label="태양 고도 '+a+'도일 때 막대와 그림자">'
        + '<rect x="0" y="'+gy+'" width="400" height="20" fill="var(--sunk)"/>'
        + '<line x1="'+sunX+'" y1="'+sunY+'" x2="'+(gx-sh)+'" y2="'+gy+'" stroke="var(--th)" stroke-width="1.5" stroke-dasharray="5 4"/>'
        + '<line x1="'+gx+'" y1="'+gy+'" x2="'+(gx-sh)+'" y2="'+gy+'" stroke="var(--muted)" stroke-width="7" stroke-linecap="round"/>'
        + '<line x1="'+gx+'" y1="'+gy+'" x2="'+gx+'" y2="'+(gy-H)+'" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/>'
        + '<circle cx="'+sunX+'" cy="'+sunY+'" r="13" fill="var(--th)"/>'
        + '<text x="'+(gx-sh/2)+'" y="'+(gy+15)+'" font-size="12" text-anchor="middle" fill="var(--ink)">그림자</text>'
        + '<text x="'+(gx+8)+'" y="'+(gy-H/2)+'" font-size="12" fill="var(--ink)">막대</text>'
        + '</svg>';
      out.innerHTML = '태양 고도 <b class="num">'+a+'°</b>, 막대 <b class="num">'+esc(h)+'cm</b>일 때 그림자 길이는 약 <b class="num">'+r1(h/Math.tan(rad))+'cm</b>예요.<br>'
        + '같은 면적이 받는 햇빛 에너지 <span style="display:inline-block;vertical-align:middle;width:130px;height:10px;background:var(--surface);border:1px solid var(--line);border-radius:5px;overflow:hidden"><span style="display:block;height:100%;width:'+Math.round(e*100)+'%;background:var(--th)"></span></span>';
    }
    aIn.addEventListener('input', draw); hIn.addEventListener('input', draw); draw();
  });

  /* ---------- 위젯: 4주 관측 기록 → 꺾은선그래프 ---------- */
  GS.widget('climate-4week', function(host, o, st, U){
    const s = st.get(o.key) || {m:0, rows:[{},{},{},{}]};
    const M = [{name:'기온', unit:'℃'}, {name:'그림자 길이', unit:'cm'}];
    const save = () => st.set(o.key, s);
    host.append(ah(U, o.kind || '관측 기록', '4주 동안 같은 요일·같은 시각에 잰 값을 넣으면 꺾은선그래프가 그려져요.'));
    const mrow = U.el('div',{class:'row'}, U.el('span',{class:'src',text:'세로축:'}));
    const mb = M.map((m,i)=>{ const b = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ s.m = i; save(); paintM(); draw(); }}, m.name+'('+m.unit+')'); mrow.append(b); return b; });
    const valHead = U.el('th',{});
    const tbody = U.el('tbody',{});
    s.rows.forEach((r,i)=>{
      const d = U.el('input',{class:'w',placeholder:'예: 4월 6일','aria-label':(i+1)+'주 관측 날짜',oninput:e=>{ r.d = e.target.value; save(); draw(); }}); d.value = r.d || '';
      const v = U.el('input',{class:'w',inputmode:'decimal','aria-label':(i+1)+'주 관측값',oninput:e=>{ r.v = e.target.value; save(); draw(); }}); v.value = r.v == null ? '' : r.v;
      const c = U.el('input',{type:'checkbox',style:'accent-color:var(--th);width:18px;height:18px',onchange:e=>{ r.x = e.target.checked; v.disabled = r.x; save(); draw(); }});
      c.checked = !!r.x; v.disabled = !!r.x;
      tbody.append(U.el('tr',{}, U.el('th',{text:(i+1)+'주'}), U.el('td',{},d), U.el('td',{},v),
        U.el('td',{}, U.el('label',{style:'display:flex;gap:6px;align-items:center;font-size:.85rem;white-space:nowrap'}, c, '관측 못 함'))));
    });
    const tbl = U.el('div',{class:'tbl'}, U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{text:'회차'}), U.el('th',{text:'관측 날짜'}), valHead, U.el('th',{text:'메모'}))), tbody));
    const chartBox = U.el('div',{class:'chart'});
    const res = U.el('div',{class:'fb info'});
    host.append(mrow, tbl, chartBox, res);
    function paintM(){ mb.forEach((b,i)=>b.classList.toggle('pri', i===s.m)); valHead.textContent = M[s.m].name+'('+M[s.m].unit+')'; }
    function draw(){
      const unit = M[s.m].unit;
      const pts = s.rows.map((r,i)=>({lab: esc(r.d || ((i+1)+'주')), raw: r.d || ((i+1)+'주'), v: r.x ? null : num(r.v)}));
      if(!pts.some(p=>p.v!=null)){ chartBox.innerHTML = '<p class="src" style="padding:10px">값을 넣으면 그래프가 나타나요.</p>'; res.textContent = '두 번 이상 기록하면 가장 크게 변한 구간을 찾아 줘요.'; return; }
      chartBox.innerHTML = U.chart({kind:'line', x:pts.map(p=>p.lab), series:[{name:M[s.m].name, values:pts.map(p=>p.v)}], unit:unit, labels:true, height:240, title:'4주 관측 그래프'});
      let best = null, prev = null;
      pts.forEach(p=>{ if(p.v==null) return; if(prev){ const d = p.v - prev.v; if(!best || Math.abs(d) > Math.abs(best.d)) best = {a:prev.raw, b:p.raw, d}; } prev = p; });
      if(!best){ res.textContent = '한 번 더 기록하면 변화를 비교할 수 있어요.'; return; }
      res.innerHTML = best.d === 0 ? '두 기록의 값이 같아서 변화가 없어요.'
        : '★ 가장 크게 변한 구간: <b>'+esc(best.a)+' → '+esc(best.b)+'</b> · <b class="num">'+r1(Math.abs(best.d))+unit+' '+(best.d>0?'증가':'감소')+'</b>';
    }
    paintM(); draw();
  });

  /* ---------- 위젯: 세 값 비교 막대 ---------- */
  GS.widget('climate-three', function(host, o, st, U){
    const s = st.get(o.key) || {v:{}, why:[]};
    const F = [
      {k:'a', l:'① 우리가 관측한 값', x:'① 우리'},
      {k:'b', l:'② 기상청 관측값(같은 날짜·시각)', x:'② 기상청'},
      {k:'c', l:'기상청 그날 일최고기온', x:'기상청 최고'},
      {k:'d', l:'③ 30년 평년값(그날의 평년 최고기온)', x:'③ 평년 최고'}
    ];
    const WHY = ['장소','그늘','지면','시각','도구'];
    host.append(ah(U, o.kind || '활동지 3', '세 값을 넣어 나란히 비교해 봅시다. (단위: ℃)'));
    const grid = U.el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 14px'});
    F.forEach(f=>{
      const inp = U.el('input',{class:'w',inputmode:'decimal',id:o.key+'-'+f.k,oninput:e=>{ s.v[f.k] = e.target.value; st.set(o.key, s); draw(); }}); inp.value = s.v[f.k] || '';
      grid.append(U.el('div',{}, U.el('label',{for:o.key+'-'+f.k,style:'display:block;font-weight:700;font-size:.9rem;margin-bottom:4px',text:f.l}), inp));
    });
    const chartBox = U.el('div',{class:'chart'});
    const res = U.el('div',{class:'fb info'});
    const chips = U.el('div',{class:'row'});
    WHY.forEach(w=>{
      const b = U.el('button',{type:'button',class:'chip','aria-pressed':'false',onclick:()=>{ s.why = s.why.includes(w) ? s.why.filter(x=>x!==w) : [...s.why, w]; st.set(o.key, s); paintChips(); }}, w);
      chips.append(b);
    });
    host.append(grid, chartBox, res, U.el('p',{style:'font-weight:700;font-size:.92rem',text:'차이가 난 까닭이 될 만한 것을 모두 골라 보세요.'}), chips);
    function paintChips(){ chips.querySelectorAll('.chip').forEach(c=>{ const on = s.why.includes(c.textContent); c.classList.toggle('pick',on); c.setAttribute('aria-pressed',String(on)); }); }
    function draw(){
      const got = F.map(f=>({x:f.x, v:num(s.v[f.k])})).filter(p=>p.v!=null);
      chartBox.innerHTML = got.length ? U.chart({kind:'bar', x:got.map(p=>p.x), series:[{name:'기온', values:got.map(p=>p.v)}], unit:'℃', height:240, title:'세 값 비교'}) : '<p class="src" style="padding:10px">값을 넣으면 막대가 나타나요.</p>';
      const v = k => num(s.v[k]);
      const lines = [];
      if(v('a')!=null && v('b')!=null) lines.push('같은 시각끼리: ① − ② = <b class="num">'+r1(v('a')-v('b'))+'℃</b>');
      if(v('c')!=null && v('d')!=null) lines.push('최고기온끼리: 기상청 그날 최고 − ③ 평년 최고 = <b class="num">'+r1(v('c')-v('d'))+'℃</b>');
      res.innerHTML = lines.length ? lines.join('<br>') : '같은 종류의 기온끼리 짝지어 비교해요. ①은 ②와, 기상청 그날 최고기온은 ③과 비교해요.';
    }
    paintChips(); draw();
  });

  /* ---------- 위젯: 365칸 폭염 달력 ---------- */
  GS.widget('climate-heat-calendar', function(host, o, st, U){
    const S = o.scen;
    let cur = st.get(o.key); if(cur == null) cur = 1;
    host.append(ah(U, '365칸 달력', '1년 365칸 가운데 폭염일(하루 최고기온 33℃ 이상인 날)만큼 칠해 볼까요?'));
    const row = U.el('div',{class:'row'});
    const btns = S.map((sc,i)=>{ const b = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ cur = i; st.set(o.key, cur); draw(); }}, sc.label); row.append(b); return b; });
    const cmpBtn = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ cur = 'cmp'; st.set(o.key, cur); draw(); }}, '두 미래 겹쳐 보기');
    row.append(cmpBtn);
    const big = U.el('div',{style:'line-height:1.35'});
    const pic = U.el('div',{});
    const lg = U.el('div',{class:'row',style:'font-size:.85rem;color:var(--muted)'});
    host.append(row, big, pic, lg, U.el('p',{class:'cap',html:'칸의 위치는 실제 날짜가 아니라 <b>날 수</b>만 나타내요. 소수점 아래는 칸을 일부만 칠했어요.'+(o.src?'<br>출처: '+o.src:'')}));
    const cov = (v,i) => Math.max(0, Math.min(1, v - i));
    function grid(layers){
      let s = '';
      for(let i=0;i<365;i++){
        const x = (i%25)*16, y = Math.floor(i/25)*16;
        s += '<rect x="'+x+'" y="'+y+'" width="14" height="14" rx="2" fill="var(--sunk)"/>';
        layers.forEach(L=>{ const c = cov(L.v, i); if(c>0) s += '<rect x="'+x+'" y="'+y+'" width="'+(14*c)+'" height="14" rx="2" fill="var('+L.col+')"/>'; });
      }
      return '<svg viewBox="0 0 398 238" style="width:100%;display:block;max-width:560px" role="img" aria-label="1년 365칸 폭염일 달력">'+s+'</svg>';
    }
    const sw = (col, t) => U.el('span',{}, U.el('i',{style:'display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var('+col+')'}), t);
    function draw(){
      btns.forEach((b,i)=>b.classList.toggle('pri', i===cur)); cmpBtn.classList.toggle('pri', cur==='cmp');
      lg.innerHTML = '';
      if(cur === 'cmp'){
        const lo = S[o.low], hi = S[o.high], d = r1(hi.days - lo.days);
        big.innerHTML = '<span class="num" style="font-family:var(--f-display);font-size:2.3rem;color:var(--bad)">+'+d+'일</span><br><b>'+lo.label+' '+lo.days+'일</b>과 <b>'+hi.label+' '+hi.days+'일</b>의 차이 (' + hi.days+' − '+lo.days+' = '+d+')';
        pic.innerHTML = grid([{v:hi.days, col:'--bad'}, {v:lo.days, col:'--th'}]);
        lg.append(sw('--th', lo.label+' '+lo.days+'일'), sw('--bad', '고탄소일 때 더 늘어나는 '+d+'일'));
      } else {
        const sc = S[cur];
        big.innerHTML = '<span class="num" style="font-family:var(--f-display);font-size:2.3rem;color:var(--th)">'+sc.days+'일</span> <span class="src">/ 365일 · 1년의 약 '+Math.round(sc.days/365*100)+'%</span><br><b>'+sc.label+'</b> '+(sc.note||'');
        pic.innerHTML = grid([{v:sc.days, col:'--th'}]);
        lg.append(sw('--th','폭염일'), sw('--sunk','폭염이 아닌 날'));
      }
    }
    draw();
  });

  /* ---------- 위젯: 칸 채우기 도우미(작성 → 미리보기 → write 블록에 자동 입력) ---------- */
  GS.widget('climate-form', function(host, o, st, U){
    const v = st.get(o.key) || {};
    host.append(ah(U, o.kind || '작성 도우미', o.q));
    host.append(U.el('p',{class:'src',html:(o.note ? o.note+'<br>' : '')+(o.target ? '칸을 채우면 아래 「내 답」 칸에 글이 자동으로 모여요. 마지막에 아래 칸에서 다듬어도 돼요(위 칸을 다시 고치면 아래 글이 새로 만들어져요).' : '')}));
    const grid = U.el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px 14px'});
    o.fields.forEach(f=>{
      const id = o.key+'-'+f.k;
      const wrap = U.el('div',{style:f.wide?'grid-column:1/-1':null});
      if(f.type !== 'check') wrap.append(U.el('label',{for:id,style:'display:block;font-weight:700;font-size:.9rem;margin-bottom:4px',html:f.label+(f.unit?' <span class="src">('+f.unit+')</span>':'')}));
      if(f.type === 'pick'){
        const r = U.el('div',{class:'row',id:id});
        f.options.forEach(op=>{
          r.append(U.el('button',{type:'button',class:'chip','aria-pressed':'false',onclick:()=>{ v[f.k] = v[f.k]===op ? '' : op; paintPick(r, f); update(); }}, op));
        });
        paintPick(r, f); wrap.append(r);
      } else if(f.type === 'check'){
        const cb = U.el('input',{type:'checkbox',id:id,style:'accent-color:var(--th);width:20px;height:20px;flex:0 0 auto',onchange:e=>{ v[f.k] = e.target.checked; update(); }});
        cb.checked = !!v[f.k];
        wrap.append(U.el('label',{for:id,style:'display:flex;gap:10px;align-items:center;font-weight:700;font-size:.92rem'}, cb, U.el('span',{html:f.label})));
      } else {
        const inp = U.el(f.type==='area'?'textarea':'input',{class:'w',id:id,rows:f.type==='area'?'2':null,inputmode:f.type==='num'?'decimal':null,placeholder:f.ph||'',oninput:e=>{ v[f.k] = e.target.value; update(); }});
        inp.value = v[f.k] || '';
        wrap.append(inp);
      }
      grid.append(wrap);
    });
    function paintPick(r, f){ r.querySelectorAll('.chip').forEach(c=>{ const on = c.textContent===v[f.k]; c.classList.toggle('pick',on); c.setAttribute('aria-pressed',String(on)); }); }
    const prev = o.preview ? U.el('div',{'aria-live':'polite'}) : null;
    const chk = o.check ? U.el('div',{class:'fb info'}) : null;
    host.append(grid);
    if(chk) host.append(chk);
    if(prev) host.append(U.el('p',{style:'font-weight:700;font-size:.9rem;margin-bottom:-4px',text:'미리보기'}), prev);
    function compose(){
      if(o.compose) return o.compose(v);
      return o.fields.map(f=>{
        let val = v[f.k];
        if(f.type==='check') val = val ? '예' : '아니요';
        return f.label.replace(/<[^>]+>/g,'')+': '+(val||'')+(val && f.unit ? ' '+f.unit : '');
      }).join('\n');
    }
    function update(first){
      st.set(o.key, v);
      if(prev) prev.innerHTML = o.preview(v, esc);
      if(chk){ const r = o.check(v); if(!r){ chk.className='fb info'; chk.innerHTML = o.checkHint || ''; chk.hidden = !o.checkHint; } else { chk.hidden = false; chk.className = 'fb '+(r.ok===true?'ok':r.ok===false?'bad':'info'); chk.innerHTML = r.msg; } }
      if(!first) syncWrite(st, o.target, compose());
    }
    update(true);
  });

  /* ---------- 위젯: 사료 읽기 하이라이터 ---------- */
  GS.widget('climate-highlight', function(host, o, st, U){
    const s = st.get(o.key) || {};
    let pen = 0;
    const P = [{bg:'var(--th-soft)', bd:'var(--th)'}, {bg:'var(--sunk)', bd:'var(--eco)'}];
    host.append(ah(U, o.kind || '사료 읽기', o.q));
    const pr = U.el('div',{class:'row'}, U.el('span',{class:'src',text:'펜 고르기:'}));
    const pb = o.pens.map((p,i)=>{ const b = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ pen = i; paintP(); }}, U.el('span',{style:'display:inline-block;width:12px;height:12px;border-radius:3px;background:'+P[i].bg+';border:2px solid '+P[i].bd}), p); pr.append(b); return b; });
    const txt = U.el('p',{style:'line-height:2.3;font-size:1.02rem;background:var(--bg);border-radius:10px;padding:10px 12px'});
    const spans = [];
    o.parts.forEach((pt,i)=>{
      if(typeof pt === 'string'){ txt.append(pt); return; }
      const b = U.el('button',{type:'button',style:'font:inherit;color:inherit;border:0;border-bottom:3px solid var(--line);background:none;padding:0 2px;cursor:pointer;border-radius:3px 3px 0 0;line-height:1.5',onclick:()=>{ if(s[i]===pen) delete s[i]; else s[i] = pen; st.set(o.key, s); paint(); }}, pt.w);
      spans.push({b, i, a: pt.a==null ? null : pt.a}); txt.append(b);
    });
    function paintP(){ pb.forEach((b,i)=>b.classList.toggle('pri', i===pen)); }
    function paint(){ spans.forEach(({b,i})=>{ const m = s[i]; b.style.background = m!=null ? P[m].bg : 'none'; b.style.borderBottomColor = m!=null ? P[m].bd : 'var(--line)'; b.style.outline = ''; }); }
    host.append(pr, U.el('p',{class:'src',text:'펜을 고른 다음, 사료 속 낱말을 눌러 표시해요. 한 번 더 누르면 지워져요.'}), txt,
      U.el('div',{class:'row'},
        U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
          let n = 0;
          spans.forEach(({b,i,a})=>{ const m = s[i]==null ? null : s[i]; const ok = m===a; if(ok) n++; b.style.outline = ok ? '' : '2px solid var(--bad)'; });
          const f = U.fb(host); const all = n===spans.length; f.className = 'fb '+(all?'ok':'bad');
          f.innerHTML = (all ? '모두 알맞게 표시했어요. ' : spans.length+'곳 중 '+n+'곳이 알맞아요. 빨간 테두리를 다시 살펴보세요. ') + (o.model ? '<br>'+o.model : '');
        }},'비교하기'),
        U.el('button',{type:'button',class:'btn sm',onclick:()=>{ Object.keys(s).forEach(k=>delete s[k]); st.set(o.key, s); paint(); const f = host.querySelector('.fb'); if(f) f.remove(); }},'모두 지우기')));
    paintP(); paint();
  });

  /* ---------- 위젯: 인과 사슬 순서 맞추기 ---------- */
  GS.widget('climate-chain', function(host, o, st, U){
    let seq = st.get(o.key) || [];
    host.append(ah(U, o.kind || '순서 맞추기', o.q));
    const slots = U.el('ol',{class:'steplist'});
    const pool = U.el('div',{class:'pool','aria-label':'아직 놓지 않은 카드'});
    const save = () => st.set(o.key, seq);
    function paint(){
      slots.innerHTML = ''; pool.innerHTML = '';
      o.items.forEach((_,k)=>{
        const idx = seq[k];
        slots.append(U.el('li',{}, idx!=null
          ? U.el('div',{}, U.el('button',{type:'button',class:'chip',onclick:()=>{ seq.splice(k,1); save(); paint(); }}, o.items[idx]+'  ✕'), k<o.items.length-1 ? U.el('span',{class:'src',style:'margin-left:8px',text:'↓'}) : null)
          : U.el('span',{class:'src',style:'line-height:28px',text:'(빈칸 — 아래 카드를 눌러 채워요)'})));
      });
      o.order.forEach(i=>{ if(!seq.includes(i)) pool.append(U.el('button',{type:'button',class:'chip',onclick:()=>{ seq.push(i); save(); paint(); }}, o.items[i])); });
      if(!pool.children.length) pool.append(U.el('span',{class:'src',text:'모든 카드를 놓았어요. 확인해 보세요.'}));
    }
    host.append(U.el('p',{class:'src',text:'아래 카드를 원인에서 결과 순서대로 눌러요. 놓은 카드를 누르면 다시 빠져요.'}), pool, slots,
      U.el('div',{class:'row'},
        U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
          const f = U.fb(host);
          if(seq.length < o.items.length){ f.className = 'fb info'; f.textContent = '카드를 모두 놓은 다음 확인해요.'; return; }
          const ok = seq.every((v,k)=>v===k);
          f.className = 'fb '+(ok?'ok':'bad');
          f.innerHTML = ok ? '알맞은 순서예요. '+(o.explain||'') : '순서를 다시 생각해 볼까요? 맨 처음 일어난 일은 무엇일까요?';
        }},'확인하기'),
        U.el('button',{type:'button',class:'btn sm',onclick:()=>{ seq = []; save(); paint(); const f = host.querySelector('.fb'); if(f) f.remove(); }},'처음부터')));
    paint();
  });

  /* ---------- 위젯: 과거 ↔ 현대 이슈 짝짓기 ---------- */
  GS.widget('climate-pair', function(host, o, st, U){
    const s = st.get(o.key) || {pairs:[]};
    let pickL = null;
    host.append(ah(U, o.kind || '짝짓기', o.q));
    const colL = U.el('div',{style:'display:flex;flex-direction:column;gap:6px;align-items:flex-start'}, U.el('b',{style:'font-size:.9rem;color:var(--th)',text:o.leftTitle}));
    const colR = U.el('div',{style:'display:flex;flex-direction:column;gap:6px;align-items:flex-start'}, U.el('b',{style:'font-size:.9rem;color:var(--th)',text:o.rightTitle}));
    const lb = o.left.map((t,i)=>{ const b = U.el('button',{type:'button',class:'chip',onclick:()=>{ pickL = pickL===i ? null : i; paint(); }}, t); colL.append(b); return b; });
    o.right.forEach((t,j)=>{ colR.append(U.el('button',{type:'button',class:'chip',onclick:()=>{
      if(pickL==null){ const f = U.fb(host); f.className = 'fb info'; f.textContent = '왼쪽(조선왕조실록) 카드를 먼저 눌러요.'; return; }
      if(!s.pairs.some(p=>p[0]===pickL && p[1]===j)) s.pairs.push([pickL, j]);
      pickL = null; st.set(o.key, s); paint();
    }}, t)); });
    const list = U.el('div',{style:'display:flex;flex-direction:column;gap:6px'});
    host.append(U.el('p',{class:'src',text:'왼쪽 카드를 누른 다음, 함께 비교하고 싶은 오른쪽 카드를 눌러요. 정답이 정해진 활동은 아니에요.'}),
      U.el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px'}, colL, colR),
      U.el('p',{style:'font-weight:700;font-size:.92rem',text:'우리 모둠이 만든 짝'}), list,
      U.el('div',{class:'callout warn'}, U.el('div',{class:'ct',text:'주의'}), U.el('div',{html:'기록 횟수 ≠ 실제 발생 횟수'})));
    function paint(){
      lb.forEach((b,i)=>b.classList.toggle('pick', pickL===i));
      list.innerHTML = '';
      if(!s.pairs.length){ list.append(U.el('span',{class:'src',text:'아직 짝이 없어요.'})); return; }
      s.pairs.forEach((p,k)=>list.append(U.el('div',{class:'row'},
        U.el('span',{html:'<b>'+esc(o.left[p[0]])+'</b> ↔ '+esc(o.right[p[1]])}),
        U.el('button',{type:'button',class:'btn sm','aria-label':'이 짝 지우기',onclick:()=>{ s.pairs.splice(k,1); st.set(o.key, s); paint(); }},'지우기'))));
      const f = host.querySelector('.fb'); if(f) f.remove();
    }
    paint();
  });

  /* ---------- 위젯: 과거 기록 횟수 + 현대 관측값 그래프 ---------- */
  GS.widget('climate-dual', function(host, o, st, U){
    const s = st.get(o.key) || {p:[{},{},{},{}], m:[{},{},{},{}], pt:'', mt:'', mu:''};
    const save = () => st.set(o.key, s);
    host.append(ah(U, o.kind || '데이터 시각화', '조사한 수치를 넣으면 그래프가 바로 그려져요.'));
    function section(title, rows, labPh, valLab, kind, nameKey, namePh, unitKey){
      const box = U.el('div',{style:'display:flex;flex-direction:column;gap:8px'});
      const ch = U.el('div',{class:'chart'});
      const nm = U.el('input',{class:'w',placeholder:namePh,oninput:e=>{ s[nameKey] = e.target.value; save(); draw(); }}); nm.value = s[nameKey] || '';
      const head = [U.el('label',{style:'font-weight:700;font-size:.92rem;color:var(--th)',text:title}), nm];
      let un = null;
      if(unitKey){ un = U.el('input',{class:'w',placeholder:'단위 (예: 일, mm, ℃)',style:'max-width:12em',oninput:e=>{ s[unitKey] = e.target.value; save(); draw(); }}); un.value = s[unitKey] || ''; head.push(un); }
      const tb = U.el('tbody',{});
      rows.forEach((r,i)=>{
        const a = U.el('input',{class:'w',placeholder:labPh,'aria-label':(i+1)+'번째 시기',oninput:e=>{ r.l = e.target.value; save(); draw(); }}); a.value = r.l || '';
        const b = U.el('input',{class:'w',inputmode:'decimal','aria-label':(i+1)+'번째 값',oninput:e=>{ r.v = e.target.value; save(); draw(); }}); b.value = r.v || '';
        tb.append(U.el('tr',{}, U.el('td',{},a), U.el('td',{},b)));
      });
      box.append(...head, U.el('div',{class:'tbl'}, U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{text:'시기·연도'}), U.el('th',{text:valLab}))), tb)), ch);
      function draw(){
        const got = rows.filter(r=>num(r.v)!=null);
        ch.innerHTML = got.length ? U.chart({kind:kind, x:got.map((r,i)=>esc(r.l||String(i+1))), series:[{name:s[nameKey]||title, values:got.map(r=>num(r.v))}], unit: unitKey ? esc(s[unitKey]||'') : '회', labels:true, height:220, title:title})
          : '<p class="src" style="padding:10px">값을 넣으면 그래프가 나타나요.</p>';
      }
      draw();
      return box;
    }
    host.append(
      section('과거: 조선왕조실록 기록 횟수', s.p, '예: 1670', '기록 횟수(회)', 'bar', 'pt', '검색한 기후 이슈 (예: 서리)', null),
      U.el('div',{class:'callout warn'}, U.el('div',{class:'ct',text:'주의'}), U.el('div',{html:'기록 횟수 ≠ 실제 발생 횟수. 실록은 사관이 남긴 기록이라, 기록이 많다고 실제로 더 자주 일어났다고 단정할 수 없어요.'})),
      section('현대: 기상청 기후정보포털 관측값', s.m, '예: 2015', '관측값', 'line', 'mt', '분석한 지표 (예: 폭염 일수)', 'mu'));
  });

  /* ---------- 공통 자료 ---------- */
  const JOSEON_URL = 'https://data.kma.go.kr/data/history/selectJoseonDynastyHistoryList.do';
  const SEJONG_URL = 'https://sillok.history.go.kr/id/kda_12405008_001';
  const ATLAS_URL = 'https://climate.go.kr/atlas';
  const KMA_PRESS = 'https://www.kma.go.kr/kma/news/press.jsp?bid=press&mode=view&num=1194530&page=3&&from=2025-08-25&to=2025-11-25';
  const GEN = '그림: 생성 이미지';

  /* =====================================================================
     1~2차시 (초등) 과거의 지혜로 기록하는 내일
     ===================================================================== */
  const TAEJO = '「비가 내렸다. 이보다 앞서 오랫동안 가물었는데, 임금이 왕위에 오르자 억수같이 비가 내리니, 백성의 마음이 크게 기뻐하였다.」';
  const SILLOK_SRC = '조선왕조실록(국사편찬위원회 번역), 기상청 기상자료개방포털 재가공';
  const CARDS = [
    {when:'1392. 8. 6.', title:'가뭄 뒤 큰비', date:'태조 1년 7월 18일(음력) · 서기 1392년 8월 6일 · 『태조실록』 1권', text:TAEJO,
      think:['억수같이 비가 내린 것은 관찰한 사실일까요?','「백성의 마음이 크게 기뻐하였다」고 말하려면 어떤 정보가 더 필요할까요?','사관은 왜 비와 즉위를 함께 적었을까요?'],
      has:'오랜 가뭄 뒤 억수같은 비, 즉위 시점', missing:'강수량 등 (예: 강수량은 몇 mm였을까?)'},
    {when:'1392. 10. 17.', title:'큰비와 천둥', date:'태조 1년 10월 1일(음력) · 서기 1392년 10월 17일 · 『태조실록』 2권 · 분류: 기상 > 비 > 큰비', text:'「큰비가 오고 천둥이 쳤다.」 (원문 요지)',
      think:['짧은 기록만으로 피해를 알 수 있을까요?','오늘의 기자라면 누구에게 무엇을 더 물어볼까요?'],
      has:'큰비, 천둥, 날짜', missing:'강수량, 지속 시간, 지역, 피해 규모'},
    {when:'1394. 5. 17.', title:'우박', date:'태조 3년 4월 17일(음력) · 서기 1394년 5월 17일 · 『태조실록』 5권', text:'「우박이 내리었다.」',
      think:['5월 중순의 우박은 왜 특별한 기록일까요?'],
      has:'시기(음력 4월 17일, 서기 1394년 5월 17일), 기상 현상(우박)', missing:'지역, 작물 피해, 우박 크기, 지속 시간'},
    {when:'1442. 5. 8.', title:'측우기로 비를 재다', date:'세종 24년 5월 8일 · 서기 1442년 · 『세종실록』 96권 「호조에서 우량을 측정하는 일에 관해 아뢰다」',
      text:'(원문 요지) 서울에서는 쇠로 만든 측우기를 서운관의 대 위에 두고, 비가 온 뒤 주척(자)으로 물의 깊이를 재어 비가 내린 때·갠 때와 함께 자세히 적어요. 지방의 각 고을에도 측우기를 두고 같은 방법으로 재어 보고하고 기록해 두게 했어요.',
      think:['비를 숫자로 재면 무엇이 달라질까요?'],
      has:'재는 도구(측우기·주척), 재는 곳(서울 서운관·지방 각 고을), 적을 것(비 온 때·갠 때·물 깊이)', missing:'이 기사는 재는 방법을 정한 기록이에요. 실제로 잰 비의 양은 다른 날의 기록에서 찾아야 해요.'}
  ];

  GS.lesson({
    id:'k12', theme:'climate', order:1, period:'1~2차시', periods:2,
    level:'초등 6학년', minutes:80,
    title:'과거의 지혜로 기록하는 내일',
    question:'옛 기록에서 사실과 해석을 어떻게 구별하며 읽을 수 있을까요?',
    goals:['조선왕조실록 등 역사 기록에서 사실과 해석을 구분하여 비판적으로 읽고, 오늘의 관점에서 기록을 재구성한 그림카드를 만들 수 있다.'],
    steps:[
      {id:'news', phase:'도입', minutes:10, move:'예측',
        title:'600년 전에도 날씨 뉴스가 있었을까요?',
        prompt:'조선 사람들도 날씨를 기록했을까요?',
        lead:'먼저 예측을 고르면 실제 기록이 열려요.',
        visual:{src:'img/k12-scribe.jpg', alt:'촛불 아래에서 붓으로 기록하는 사관과 창밖에 내리는 비', cap:GEN+'(상상한 장면)'},
        blocks:[
          {t:'predict', id:'k12-p-news', q:'600년 전 조선의 날씨 기록은 어떤 모습이었을까요?',
            options:['날씨는 거의 기록하지 않았을 거예요.','특별한 날씨를 날짜와 함께 짧게 적었을 거예요.','오늘처럼 매일 기온과 강수량을 숫자로 적었을 거예요.'],
            reveal:[
              {t:'visual', src:'slides/k12/s06.jpg', alt:'1392년 조선왕조실록의 기상·천문 기록 목록', cap:'출처: '+SILLOK_SRC},
              {t:'blanks', id:'k12-w1', kind:'활동지 1', q:'목록을 보고 조선왕조실록을 정리해 봅시다.',
                text:'<b>무엇인가요?</b> 왕이 살았던 시대의 일을 [[날짜]]별로 적은 기록<br><b>누가 썼나요?</b> 국가의 기록 담당자인 [[사관]]<br><b>왜 썼나요?</b> 다음 [[세대]]가 사실을 살피도록',
                hints:['목록의 맨 왼쪽 칸에는 무엇이 차례로 적혀 있나요?','나라의 기록을 맡은 사람은 「사○」, 뒤에 올 사람들은 「다음 ○○」라고 해요.'],
                explain:'실록은 왕이 세상을 떠난 뒤 실록청이 사초 등을 바탕으로 만들었어요.'}
            ],
            compare:'내 예측과 실제 기록은 무엇이 같고 달랐나요? 목록에 없는 것은 무엇이었나요?'}
        ]},

      {id:'detective', phase:'활동 1', minutes:8, move:'판단',
        title:'출처 탐정이 되어 봐요',
        prompt:'기록을 믿기 전에 무엇을 확인해야 할까요?',
        lead:'국어 시간의 「사실과 의견」이 역사 기록에서는 「사실과 해석」이 돼요.',
        visual:{src:'slides/k12/s08.jpg', alt:'출처 탐정 질문 7가지와 별표', cap:'수업 슬라이드 · 활동지 2번'},
        layout:'split',
        blocks:[
          {t:'widget', name:'climate-star-vote', opts:{key:'k12-star', kind:'활동지 2', max:2, q:'모둠에서 가장 중요한 질문 두 개에 ★를 눌러요.',
            items:['누가 기록했나요?','언제, 어디에서 기록했나요?','직접 본 사실인가요, 전해 들은 말인가요?','수치·날짜·장소 같은 근거가 있나요?','사실과 해석이 섞여 있나요?','빠진 사람이나 정보는 없나요?','다른 기록과 비교할 수 있나요?']}},
          {t:'write', id:'k12-w2', kind:'활동지 2', q:'두 질문을 고른 까닭은 무엇인가요? 그 질문을 하지 않으면 어떤 점을 놓칠 수 있을까요?', rows:3, placeholder:'예: ○번과 ○번을 골랐어요. 왜냐하면 …'}
        ]},

      {id:'fact', phase:'활동 2', minutes:12, move:'분석',
        title:'사실일까, 해석일까?',
        prompt:'가뭄 뒤에 비가 내리면 모두 같은 마음일까요?',
        lead:'사료 카드 1(『태조실록』, 1392년 8월 6일)을 읽고 기록을 조각으로 나눠요.',
        visual:{src:'slides/k12/s09.jpg', alt:'태조실록 1392년 8월 6일 기사의 상세정보와 생각 질문', cap:'출처: '+SILLOK_SRC},
        blocks:[
          {t:'sort', id:'k12-gnd', kind:'활동지 3·5', q:'기록 조각을 알맞은 칸에 놓아 보세요.',
            bins:['기록에서 확인한 사실','기록한 사람의 해석','기록에 없는 정보를 찾는 질문'],
            items:[{text:'오랫동안 가물었다',bin:0},{text:'억수같이 비가 내렸다',bin:0},{text:'임금이 왕위에 올랐다',bin:0},{text:'백성의 마음이 크게 기뻐하였다',bin:1},{text:'강수량은 몇 mm였을까?',bin:2},{text:'비는 얼마 동안 내렸을까?',bin:2}],
            explain:'백성의 마음은 직접 볼 수 없어서 해석에 가까워요. 해석은 틀린 것이 아니라 <b>더 확인이 필요한 생각</b>이에요. 기록에 없는 것은 질문으로 남겨요.'},
          {t:'write', id:'k12-w3', kind:'활동지 3', q:'사관은 왜 비와 임금의 즉위를 함께 적었을까요? 이 비를 다르게 느낀 사람도 있었을까요?', rows:3,
            example:'새 임금이 왕위에 오르자 좋은 일이 생겼다는 것을 보여 주고 싶었을 수 있어요. 비가 너무 많이 와서 피해를 본 사람은 기뻐하지 않았을 수도 있어요.'}
        ]},

      {id:'cards', phase:'활동 2', minutes:10, move:'관찰',
        title:'짧은 기록, 무엇이 빠졌을까?',
        prompt:'짧은 기록만으로 피해를 알 수 있을까요?',
        lead:'카드 앞면을 읽고 아래 칸에 먼저 써 본 다음, 카드를 뒤집어 비교해요.',
        visual:{src:'slides/k12/s11.jpg', alt:'큰비와 천둥 기록, 기자가 인터뷰하는 그림', cap:'수업 슬라이드 · 활동지 4번'},
        blocks:[
          {t:'widget', name:'climate-source-cards', opts:{key:'k12-flip23', cards:CARDS, show:[1,2], src:'기상청 기상자료개방포털 조선왕조실록'}},
          {t:'write', id:'k12-w4', kind:'활동지 4', q:'카드 2·3의 「기록에 있는 것 / 없는 것」을 쓰고, 오늘의 기자라면 누구에게 무엇을 더 물어볼지 적어 보세요.', rows:4,
            placeholder:'카드 2 — 있는 것: … / 없는 것: …\n카드 3 — 있는 것: … / 없는 것: …\n기자 질문: …',
            example:'카드 2는 큰비·천둥·날짜는 알 수 있지만 강수량·지속 시간·지역·피해 규모는 알 수 없어요. 그 마을 농부에게 「논밭이 얼마나 물에 잠겼나요?」라고 묻고 싶어요.'}
        ]},

      {id:'rain', phase:'활동 2', minutes:10, move:'설명',
        title:'비를 숫자로 재면?',
        prompt:'비를 숫자로 재면 무엇이 달라질까요?',
        lead:'사료 카드 4는 세종 24년(1442년), 측우기로 비를 재는 방법을 정한 기록이에요.',
        visual:{src:'slides/k12/s13.jpg', alt:'세종실록: 호조에서 우량을 측정하는 일에 관해 아뢴 기사', cap:'출처: 세종실록 (조선왕조실록 누리집)'},
        blocks:[
          {t:'widget', name:'climate-source-cards', opts:{key:'k12-flip4', cards:CARDS, show:[3], src:'『세종실록』 96권, 세종 24년 5월 8일 기사'}},
          {t:'choice', id:'k12-rain', q:'카드 2의 「큰비」와 측우기로 잰 비는 무엇이 다를까요?',
            options:['측우기로 재면 비가 더 많이 내려요.','같은 도구와 단위로 재서, 다른 날·다른 지역의 비와 견줄 수 있어요.','숫자로 적으면 사관의 해석이 더 많이 들어가요.'],
            answer:1, hints:['「큰비」는 얼마만큼일까요? 사람마다 다르게 느낄 수 있어요.','한양의 비와 지방 고을의 비를 비교하려면 무엇이 같아야 할까요?'], why:true,
            explain:'같은 도구·같은 단위·같은 방법으로 재면 기록끼리 비교할 수 있어요.'},
          {t:'write', id:'k12-w5', kind:'활동지 5', q:'사료 카드 한 장을 골라 사실 2개 + 해석 1개 + 추가 질문 1개를 적어 보세요. (해석이 없는 카드는 「해석 없음」과 그 까닭을 적어요.)', rows:5,
            placeholder:'카드 번호: ( )번\n사실①:\n사실②:\n해석:\n더 필요한 정보(질문):'}
        ]},

      {id:'newscard', phase:'활동 3', minutes:22, move:'실천',
        title:'오늘의 실록 그림카드',
        prompt:'실록 기사를 오늘의 날씨 뉴스로 바꿔 볼까요?',
        lead:'칸을 채우면 뉴스 카드 미리보기가 만들어져요. 기록에 없는 장면은 「상상한 부분」으로 표시해요.',
        visual:{src:'slides/k12/s16.jpg', alt:'예시 그림카드: 오늘의 날씨 뉴스, 비가 얼마나 내렸을까?', cap:'예시 그림카드 · 출처: 이미지 생성 ChatGPT(AI로 상상해 그린 그림)'},
        blocks:[
          {t:'widget', name:'climate-form', opts:{key:'k12-newsform', target:'k12-w6', kind:'활동지 6', q:'오늘의 실록 그림카드에 꼭 넣을 것',
            note:'완성한 카드는 선생님이 알려 준 학급 Padlet에 올려요. 그림이 어려우면 문장으로 대신해도 괜찮아요. 개인정보나 실제 인물이 드러나지 않게 해요.',
            fields:[
              {k:'when', label:'날짜와 장소', ph:'예: 1392년 8월 6일, 한양'},
              {k:'head', label:'날씨 사건을 담은 한 줄 제목', ph:'예: 오랜 가뭄 끝에 큰비!'},
              {k:'f1', label:'기록에서 확인한 사실 ①'},
              {k:'f2', label:'기록에서 확인한 사실 ②'},
              {k:'miss', label:'기록에 없는 정보 1개', ph:'예: 강수량은 몇 mm였을까?'},
              {k:'pic', label:'당시 사람의 모습을 보여 주는 그림(무엇을 그릴지 적어요)', type:'area', wide:true},
              {k:'imag', label:'그림에 기록에 없는 장면이 있어요 → 「상상한 부분」으로 표시하기', type:'check', wide:true},
              {k:'src', label:'출처 이름', ph:'예: 조선왕조실록(국사편찬위원회 번역)', wide:true}
            ],
            preview:(v,e)=>'<div style="border:2px solid var(--th);border-radius:12px;overflow:hidden;background:var(--surface)">'
              +'<div style="background:var(--th);color:var(--go-ink);padding:6px 12px;font-size:.8rem;font-weight:700;letter-spacing:.06em">오늘의 실록 · 날씨 뉴스</div>'
              +'<div style="padding:12px 14px;display:flex;flex-direction:column;gap:8px">'
              +'<div class="src">'+(e(v.when)||'날짜와 장소')+'</div>'
              +'<h3 style="font-size:1.4rem">'+(e(v.head)||'한 줄 제목')+'</h3>'
              +'<ul class="goals"><li>'+(e(v.f1)||'사실 ①')+'</li><li>'+(e(v.f2)||'사실 ②')+'</li></ul>'
              +'<div style="background:var(--sunk);border-radius:8px;padding:8px 10px;font-size:.92rem"><b>기록에 없는 정보</b> '+(e(v.miss)||'…')+'</div>'
              +'<div style="border:1px dashed var(--line);border-radius:8px;padding:10px;font-size:.92rem;color:var(--muted)">그림: '+(e(v.pic)||'당시 사람의 모습')+(v.imag?' <b style="color:var(--th)">[상상한 부분]</b>':'')+'</div>'
              +'<div class="src">출처: '+(e(v.src)||'…')+'</div></div></div>'}},
          {t:'write', id:'k12-w6', kind:'활동지 6', q:'오늘의 실록 그림카드 내용 (위 칸을 채우면 자동으로 들어가요)', rows:8},
          {t:'write', id:'k12-w6c', kind:'활동지 6', q:'친구 카드에 「근거를 더 묻는 질문」 하나를 댓글로 달고, 여기에도 적어요.', rows:1, placeholder:'예: 그날 비가 억수같이 왔다는 것은 어느 기록에서 확인했나요?'}
        ]},

      {id:'wrap', phase:'정리', minutes:8, move:'성찰',
        title:'날씨 기록에서 기후로',
        prompt:'더운 하루만으로 기후변화를 말할 수 있을까요?',
        lead:'날씨는 오늘·이번 주처럼 짧은 시간의 대기 상태, 기후는 한 지역에서 오랫동안 나타난 날씨의 평균과 범위예요.',
        visual:{src:'img/k12-weather.jpg', alt:'달력 한 장과 멀리 이어진 긴 달력 띠', cap:GEN},
        blocks:[
          {t:'cer', id:'k12-cer', q:'더운 하루만으로 기후변화를 말할 수 있을까요? 주장·근거·이유로 답해 봅시다.',
            starters:{c:'더운 하루만으로 기후변화를 말할 수 (있다 / 없다).', e:'「오늘 32℃였다」는 ___이고, 「30년 평균보다 더운 날이 늘었다」는 ___이기 때문이다.', r:'그래서 기후를 알려면 ___이(가) 필요하다.'},
            example:'말할 수 없다. 「오늘 32℃였다」는 날씨 관측이고 「30년 평균보다 더운 날이 늘었다」는 기후 경향이다. 한 번의 값은 중요하지만 결론은 아니므로 같은 방법의 긴 기록, 평년값, 여러 지점의 자료를 함께 봐야 한다. 실록 한 기사도 같은 원리로 읽어야 한다.'},
          {t:'reflect', id:'k12-exit', items:['오늘 새롭게 알게 된 점 한 가지','오늘 우리가 남긴 기록은 미래에 무엇이 될까요?']},
          {t:'more', title:'더 나아가기', items:[
            {img:'img/k12-more-archive.jpg', tag:'사이트', title:'실록 속 날씨 기록 찾기', text:'기상청 기상자료개방포털에서 내 생일과 같은 날짜의 옛 날씨 기록을 찾아봐요.', url:JOSEON_URL},
            {img:'img/k12-more-raingauge.jpg', tag:'원문', title:'세종실록 측우기 기사', text:'비를 재는 방법이 어떻게 정해졌는지 원문으로 읽어 봐요.', url:SEJONG_URL},
            {img:'img/k12-more-diary.jpg', tag:'도전', title:'일주일 날씨 일기', text:'같은 장소·같은 시각·같은 도구와 단위로, 빠짐없이 7일 동안 기록해 봐요. 다음 시간에는 우리 반이 기후 관측단이 돼요.'}
          ]}
        ]}
    ]
  });

  /* =====================================================================
     3~4차시 (초등) 관측으로 확인하는 기후변화, 내일의 약속
     ===================================================================== */
  const HEAT_SRC = '환경부(현 기후에너지환경부)·기상청(2025) 「한국 기후위기 평가보고서 2025」; 기준 기간 확인: 국가기후위기적응센터 「기후변화 전망」';

  GS.lesson({
    id:'k34', theme:'climate', order:2, period:'3~4차시', periods:2,
    level:'초등 6학년', minutes:80,
    title:'관측으로 확인하는 기후변화, 내일의 약속',
    question:'우리는 기후변화를 어떻게 관측하고, 무엇을 약속할 수 있을까요?',
    goals:['관측 약속에 따라 태양-그림자를 관측하고 같은 종류의 기온끼리 비교하여 날씨와 기후를 구분할 수 있으며, 기후변화 시나리오 자료를 근거로 실천 다짐을 세울 수 있다.'],
    steps:[
      {id:'tools', phase:'도입', minutes:6, move:'관찰',
        title:'관측 도구 떠올리기',
        prompt:'날씨·기후를 재는 도구, 무엇을 알고 있나요?',
        lead:'오늘은 우리 반이 기후 관측단이 되어 그림자와 온도계로 직접 관측해요.',
        visual:{src:'slides/k34/s03.jpg', alt:'온도계, 우량계, 풍향계, 해시계 사진', cap:'출처: 이미지 생성 Canva AI'},
        layout:'split',
        blocks:[
          {t:'sort', id:'k34-tools', q:'사진 속 도구는 무엇을 알려 줄까요? 설명 카드를 알맞은 도구 칸에 놓아 보세요.',
            bins:['온도계','우량계','풍향계','해시계'],
            items:[{text:'기온을 재요',bin:0},{text:'비가 내린 양을 재요',bin:1},{text:'바람의 방향을 재요',bin:2},{text:'그림자로 태양의 높이를 알 수 있어요',bin:3}],
            explain:'오늘은 해시계처럼 그림자를 보고, 온도계로 기온을 직접 재 봐요.'}
        ]},

      {id:'shadow', phase:'활동 1', minutes:10, move:'예측',
        title:'태양이 높을수록 그림자는?',
        prompt:'태양이 높이 뜨면 막대 그림자는 어떻게 달라질까요?',
        lead:'예측을 고르면 실험실이 열려요. 슬라이더로 태양 고도를 바꿔 직접 확인해요.',
        visual:{src:'img/k34-sun-shadow.jpg', alt:'운동장에 막대를 세우는 학생들과 하늘을 가로지르는 태양의 길', cap:GEN},
        blocks:[
          {t:'predict', id:'k34-p-shadow', q:'태양 고도가 높아지면 막대 그림자의 길이는 어떻게 될까요?',
            options:['길어진다','짧아진다','변하지 않는다'],
            reveal:[
              {t:'widget', name:'climate-shadow', opts:{key:'k34-shadow'}},
              {t:'ox', id:'k34-sun', q:'실험실에서 발견한 것을 정리해요.', items:[
                {q:'태양 고도가 높아지면 그림자는 길어져요.', a:false, explain:'태양 고도가 높을수록 그림자는 짧아져요.'},
                {q:'태양 고도가 높아지면 같은 면적이 받는 태양 에너지가 많아져 기온이 오르기 쉬워요.', a:true, explain:'태양 고도↑ → 받는 에너지↑ → 기온이 오르기 쉬워요. 계절마다 태양 고도와 낮 길이가 달라져 계절의 기온도 달라져요.'},
                {q:'하루 중 기온이 가장 높은 때는 보통 태양이 가장 높이 뜬 남중 바로 그때예요.', a:false, explain:'지표가 데워지고 공기로 열이 전해지는 데 시간이 걸려, 기온 최고 시각은 남중보다 늦게 나타나요.'}]}
            ],
            compare:'실험 결과는 내 예측과 같았나요? 태양 고도, 그림자 길이, 기온은 어떻게 이어질까요?'}
        ]},

      {id:'log', phase:'활동 1', minutes:14, move:'판단',
        title:'공정한 관측 약속',
        prompt:'공정하게 비교하려면 무엇을 같게 해야 할까요?',
        lead:'태양은 맨눈으로 직접 보지 않고, 막대는 수직으로 세워요. 못 잰 날은 빈칸 대신 「관측 못 함」이라고 적어요.',
        visual:{src:'slides/k34/s07.jpg', alt:'그림자 길이를 재고 온도·하늘을 기록하는 모습과 관측 조건', cap:'출처: 이미지 생성 Canva AI · 수업 슬라이드'},
        blocks:[
          {t:'choice', id:'k34-fair', q:'1주에는 햇볕 드는 운동장 바닥에서, 2주에는 그늘진 1.5m 높이에서 기온을 쟀어요. 두 값의 차이를 보고 「일주일 사이에 기온이 변했다」고 말할 수 있을까요?',
            options:['네, 같은 온도계를 썼으니 비교할 수 있어요.','아니요, 재는 장소와 높이가 달라서 공정한 비교가 아니에요.','아니요, 기온은 일주일마다 잴 수 없어요.'],
            answer:1, hints:['두 번의 관측에서 달라진 조건을 모두 찾아보세요.','관측 약속: 장소·시각·막대·기온(지상 약 1.5m 그늘, 같은 온도계)·단위를 같게 해요.'], why:true,
            explain:'알고 싶은 것(날짜에 따른 변화) 말고 나머지 조건을 모두 같게 해야 공정하게 비교할 수 있어요.'},
          {t:'widget', name:'climate-form', opts:{key:'k34-logform', target:'k34-w1', kind:'활동지 1', q:'관측 약속을 지키며 오늘 한 번의 관측 결과를 기록해 봅시다.',
            note:'관측 순서: ① 그림자 길이 재기 ② 온도·하늘 기록하기. 기상청 같은 시각 값은 선생님과 함께 기상청 날씨누리에서 찾아요.',
            fields:[
              {k:'date', label:'날짜'}, {k:'time', label:'시각'}, {k:'place', label:'장소'},
              {k:'sky', label:'하늘', type:'pick', options:['맑음','구름','비','눈']},
              {k:'stick', label:'막대 높이', type:'num', unit:'cm'}, {k:'shadow', label:'그림자 길이', type:'num', unit:'cm'},
              {k:'sun', label:'태양 고도 느낌', type:'pick', options:['낮음','보통','높음']},
              {k:'temp', label:'기온', type:'num', unit:'℃'},
              {k:'wind', label:'바람', type:'pick', options:['약함','보통','강함']},
              {k:'kma', label:'기상청 같은 시각 관측값', type:'num', unit:'℃'},
              {k:'note', label:'특이사항', wide:true}
            ],
            check:v=>{ const a = num(v.temp), b = num(v.kma); if(a==null || b==null) return null; const d = r1(a-b); return {ok:null, msg:'우리 값 − 기상청 값 = <b class="num">'+d+'℃</b>. 차이가 난 까닭은 「세 값은 왜 다를까?」 단계에서 설명해요.'}; },
            checkHint:'기온과 기상청 값을 모두 넣으면 차이를 계산해 줘요.'}},
          {t:'write', id:'k34-w1', kind:'활동지 1', q:'오늘의 1회 관측 기록 (위 칸을 채우면 자동으로 들어가요)', rows:6}
        ]},

      {id:'week4', phase:'활동 1', minutes:8, move:'분석',
        title:'4주 기록의 경향',
        prompt:'기록이 쌓이면 어떤 경향이 보일까요?',
        lead:'오늘은 1주 칸만 채워요. 매주 같은 요일·같은 시각에 재고 이 화면에 다시 와서 채워요.',
        visual:{src:'slides/k34/s09.jpg', alt:'주간 관측 기록표와 꺾은선그래프 그리기 활동지', cap:'출처: 이미지 생성 ChatGPT · 활동지 2번'},
        blocks:[
          {t:'widget', name:'climate-4week', opts:{key:'k34-4week', kind:'활동지 2'}},
          {t:'write', id:'k34-w2', kind:'활동지 2', q:'가장 크게 변한 구간에 ★표시하고 문장을 완성해 봅시다. 「___주에서 ___주 사이, (기온/그림자 길이)가 ___에서 ___로 ___ 증가/감소했어요.」', rows:2, placeholder:'예: 1주에서 2주 사이, 그림자 길이가 …cm에서 …cm로 …cm 감소했어요.'},
          {t:'ox', id:'k34-wc', kind:'활동지 3', q:'날씨일까요, 기후일까요? 알맞은 것에 표시해요.', items:[
            {q:'4주 동안 기온이 오른 것은 기후변화예요.', a:false, explain:'4주 동안의 변화는 계절 변화예요. 기후를 알려면 몇십 년의 기록이 필요해요.'},
            {q:'「오늘 32℃였다」는 날씨 관측이에요.', a:true, explain:'하루의 관측값이라 날씨예요.'},
            {q:'「30년 평균보다 더운 날이 늘었다」는 기후 경향이에요.', a:true, explain:'오랜 기간의 평균과 비교했어요.'},
            {q:'더운 하루만으로 기후변화라고 말할 수 있어요.', a:false, explain:'한 번의 값은 중요하지만 결론은 아니에요. 같은 방법의 긴 기록, 평년값, 여러 지점의 자료를 함께 봐야 해요. 실록 한 기사도 같은 원리예요.'}]}
        ]},

      {id:'three', phase:'활동 2', minutes:12, move:'설명',
        title:'세 값은 왜 다를까?',
        prompt:'우리가 관측한 값과 기상청 값이 다른 이유는 무엇일까요?',
        lead:'①은 ② 기상청의 같은 날짜·같은 시각 값과, 기상청 그날 최고기온은 ③ 평년 최고기온(1991~2020년 평균)과 비교해요. 차이는 실수가 아니라 탐구의 시작일 수 있어요.',
        visual:{src:'slides/k34/s10.jpg', alt:'우리 관측값, 기상청 관측값, 30년 평년값 설명', cap:'수업 슬라이드 · 활동지 3번'},
        blocks:[
          {t:'widget', name:'climate-three', opts:{key:'k34-three', kind:'활동지 3'}},
          {t:'cer', id:'k34-cer', kind:'활동지 1·3', q:'우리 값과 기상청 값의 차이가 난 까닭을 주장·근거·이유로 설명해 봅시다.',
            starters:{c:'우리 값과 기상청 값이 다른 까닭은 ___ 때문이라고 생각한다.', e:'우리 값은 ___℃, 기상청 값은 ___℃였다. 우리는 ___(장소·그늘·지면)에서 ___에 쟀다.', r:'장소·그늘·지면·시각·도구가 다르면 ___ 때문이다.'},
            example:'우리 값이 더 높은 까닭은 햇볕이 드는 바닥 가까이에서 쟀기 때문이라고 생각한다. 우리 값이 기상청 값보다 높았고, 우리는 햇볕 드는 운동장에서 쟀다. 기상청은 정해진 관측 환경과 장비로 재지만, 우리는 학교의 특정 장소에서 쟀으므로 지면과 햇볕의 영향을 더 받을 수 있다.'}
        ]},

      {id:'heat', phase:'활동 3', minutes:16, move:'예측',
        title:'폭염일수, 두 갈래 미래',
        prompt:'우리의 선택이 미래 폭염일수를 바꿀 수 있을까요?',
        lead:'폭염일은 하루 중 가장 더운 기온이 33℃ 이상인 날이에요. 기준 기간(2000~2019년) 한반도 평균은 1년에 8.8일이었어요.',
        visual:{src:'img/k34-two-futures.jpg', alt:'두 갈래로 갈라진 길 앞에 선 아이: 시원한 숲과 뜨겁고 메마른 땅', cap:GEN},
        blocks:[
          {t:'predict', id:'k34-p-heat', q:'온실가스를 계속 많이 내보내면(고탄소 미래), 2081~2100년 한반도의 1년 폭염일수는 며칠쯤일까요?',
            options:['약 10일 — 지금과 비슷해요','약 25일','약 50일','약 80일'],
            reveal:[
              {t:'widget', name:'climate-heat-calendar', opts:{key:'k34-cal', low:2, high:3, src:HEAT_SRC, scen:[
                {label:'기준 기간', days:8.8, note:'2000~2019년 평균'},
                {label:'최근 10년', days:15.6, note:'2015~2024년 평균'},
                {label:'저탄소 미래', days:24.2, note:'2081~2100년 · 온실가스를 많이 줄이면'},
                {label:'고탄소 미래', days:79.5, note:'2081~2100년 · 온실가스를 계속 많이 내보내면'}]}},
              {t:'tablefill', id:'k34-w4t', kind:'활동지 4', q:'달력 버튼을 눌러 보며 한반도 평균 1년 폭염일수 표를 채워 봅시다.',
                head:['구분','폭염일수(일)'],
                rows:[['기준 기간 평균 (2000~2019)','8.8'],['최근 10년 평균 (2015~2024)','15.6'],['저탄소 미래 (2081~2100)','?24.2|24'],['고탄소 미래 (2081~2100)','?79.5|80'],['두 미래의 차이','?55.3|55']],
                explain:'두 미래의 차이 = 79.5 − 24.2 = 55.3일이에요. 미래는 정해져 있지 않아요. 시나리오는 우리가 어떻게 하느냐에 따라 달라지는 <b>가능한 미래</b>예요.'}
            ],
            compare:'내 예측과 실제 전망은 얼마나 달랐나요? 두 미래의 차이를 만드는 것은 무엇일까요?'},
          {t:'write', id:'k34-w4', kind:'활동지 4', q:'기후변화 상황지도에서 우리 동네를 읍·면·동까지 찾아 문장을 완성해 봅시다. 단위·기간·범례를 먼저 읽어요. (우리 동네 값은 위의 한반도 평균과 공간 범위가 달라요.)', rows:1,
            placeholder:'우리 동네의 (평균기온 또는 폭염일수)은/는 (현재 값)에서 (21세기 후반 값)으로 변한다.'},
          {t:'links', items:[{label:'기후변화 상황지도', url:ATLAS_URL, kind:'도구'}]}
        ]},

      {id:'pledge', phase:'정리', minutes:14, move:'실천',
        title:'근거 있는 내일의 약속',
        prompt:'근거가 있는 실천 다짐은 어떻게 만들까요?',
        lead:'좋은 다짐 = 구체적 행동 + 횟수/기간 + 확인 방법. 「전기를 아끼겠다」보다 「4주 동안 사용하지 않는 교실 조명을 매일 점심시간에 확인하고 기록하겠다」가 더 구체적이에요.',
        visual:{src:'slides/k34/s17.jpg', alt:'나의 근거, 나의 다짐, 오늘의 자기평가 카드', cap:'출처: 이미지 생성 ChatGPT · 활동지 5번'},
        blocks:[
          {t:'widget', name:'climate-form', opts:{key:'k34-pledgeform', target:'k34-w5', kind:'활동지 5', q:'폭염일수 자료를 근거로 나만의 실천 다짐을 만들어 봅시다.',
            note:'완성한 실천다짐카드(근거·행동·확인)는 Padlet에 올리고, 친구 다짐에 「좋은 점 1개 + 더 구체적으로 만들 질문 1개」를 댓글로 달아요. 개인정보가 드러나는 사진이나 위치는 올리지 않아요.',
            fields:[
              {k:'gap', label:'나의 근거: 두 미래의 폭염일수 차이', type:'num', unit:'일', wide:true},
              {k:'period', label:'기간', ph:'예: 4주'},
              {k:'act', label:'구체적 행동', ph:'예: 쓰지 않는 교실 조명 끄기'},
              {k:'times', label:'횟수', ph:'예: 매일 1'},
              {k:'how', label:'확인 방법', ph:'예: 기록표'}
            ],
            compose:v=>'나의 근거: 두 미래의 폭염일수 차이는 '+(v.gap||'___')+'일이다.\n나의 다짐: 나는 '+(v.period||'___')+' 동안, '+(v.act||'___')+'을/를 '+(v.times||'___')+'회 실천하고 '+(v.how||'___')+'(으)로 확인하겠다.',
            check:v=>{ const g = num(v.gap); if(g==null) return null; return (Math.abs(g-55.3)<0.06 || g===55) ? {ok:true, msg:'근거 수치가 맞아요. 79.5 − 24.2 = 55.3일'} : {ok:false, msg:'두 미래의 차이를 다시 계산해 볼까요? (고탄소 미래 − 저탄소 미래)'}; },
            preview:(v,e)=>'<div style="border-left:5px solid var(--th);background:var(--th-soft);border-radius:8px;padding:12px 14px;line-height:1.7">'
              +'<div class="src">나의 근거</div><div>두 미래의 폭염일수 차이는 <b>'+(e(v.gap)||'___')+'일</b>이다.</div>'
              +'<div class="src" style="margin-top:6px">나의 다짐</div><div>나는 <b>'+(e(v.period)||'___')+'</b> 동안, <b>'+(e(v.act)||'___')+'</b>을/를 <b>'+(e(v.times)||'___')+'회</b> 실천하고 <b>'+(e(v.how)||'___')+'</b>(으)로 확인하겠다.</div></div>'}},
          {t:'write', id:'k34-w5', kind:'활동지 5', q:'나의 실천 다짐 (위 칸을 채우면 자동으로 들어가요)', rows:3},
          {t:'reflect', id:'k34-exit', items:['오늘의 마지막 한 줄: 좋은 기록은 ___','관측값과 평년값의 차이를 친구에게 어떻게 설명할까요?']},
          {t:'more', title:'더 나아가기', items:[
            {img:'slides/k34/s14.jpg', tag:'도구', title:'기후변화 상황지도', text:'우리 동네의 평균기온·폭염일수를 저탄소·고탄소 미래로 비교해 봐요.', url:ATLAS_URL},
            {img:'img/k34-more-report.jpg', tag:'자료', title:'한국 기후위기 평가보고서 2025', text:'오늘 본 폭염일수 전망이 실린 기상청 보도자료예요.', url:KMA_PRESS},
            {img:'img/k34-more-observe.jpg', tag:'도전', title:'4주 관측 이어 가기', text:'같은 요일·같은 시각에 재고, 그래프에서 가장 크게 변한 구간을 찾아요.'},
            {img:'img/k34-more-pledge.jpg', tag:'실천', title:'다짐 확인 기록표', text:'4주 동안 내 다짐을 지켰는지 기록표로 확인하고 친구와 나눠요.'}
          ]}
        ]}
    ]
  });

  /* =====================================================================
     5~7차시 (중고등) 역사적 성찰과 데이터 분석을 통해 그린(Green) 미래
     ===================================================================== */
  const SRC1 = '「8세기 후반~10세기 초, 신라 하대에는 유독 가뭄과 흉년의 기록이 집중되었으며, 백성들이 초적(도적)이 되어 봉기하는 등 정치적 붕괴로 이어졌다. 고려 말 역시 이상 저온과 수해로 인해 농업 생산량이 급감하며 사회적 혼란이 극에 달했다.」';

  GS.lesson({
    id:'k57', theme:'climate', order:3, period:'5~7차시', periods:3,
    level:'중고등', minutes:135,
    title:'역사적 성찰과 데이터 분석을 통해 그린(Green) 미래',
    question:'기후 위기 극복을 위해 우리가 할 수 있는 일은 무엇일까요?',
    goals:['역사적 사료 분석과 공공데이터 시각화를 통해 기후 위기가 사회 시스템에 미친 구조적 영향을 파악하고, 국제 기후 협약 분석을 바탕으로 미래세대의 안전을 보호하는 새로운 기후 협약안을 제안하여 생태 시민으로서의 역량을 향상한다.'],
    steps:[
      {id:'open', phase:'도입', minutes:15, move:'예측',
        title:'기근과 기온, 관계가 있을까?',
        prompt:'동아시아에 큰 기근이 든 해, 여름 기온은 어땠을까요?',
        lead:'17세기 조선·중국·일본의 주요 기근 시기와 북반구 여름 기온 그래프를 볼 거예요. 먼저 예측해요.',
        visual:{src:'img/k57-famine.jpg', alt:'서리 내린 논과 빈 바구니를 든 사람들이 있는 추운 여름의 마을', cap:GEN+'(상상한 장면)'},
        blocks:[
          {t:'predict', id:'k57-p-temp', q:'기근이 든 해의 북반구 여름 기온은 평소와 비교해 어땠을까요?',
            options:['평소보다 높았을 것이다','평소보다 낮았을 것이다','기근과 기온은 관계가 없을 것이다'],
            reveal:[
              {t:'visual', src:'slides/k57/s03.jpg', alt:'17세기 북반구 여름 기온 변화 막대그래프와 조선·중국·일본의 주요 기근 시기(경신대기근, 을병대기근 표시)', cap:'17세기 북반구의 여름 기온 변화(Global Crisis, 2013) · 동아출판 한국사1 교과서 자료 인용'}
            ],
            compare:'과거 동아시아의 기근이 발생한 시기의 공통점은 무엇인가요? 그래프에서 근거를 찾아 내 예측과 비교해 써 보세요.'},
          {t:'callout', tone:'q', title:'사료 1 — 신라 하대와 고려 말', text:SRC1},
          {t:'write', id:'k57-1q', kind:'워크북 1-1', q:'Q1. 사료 1에 나타난 역사 속 기후 현상은? Q2. 그 기후 현상이 영향을 준 사회·정치적 문제는?', rows:3, placeholder:'Q1. …\nQ2. …',
            example:'Q1. 가뭄, 흉년, 이상 저온, 수해 / Q2. 봉기 등 정치적 혼란, 농업 생산량 급감 등 사회적 혼란'}
        ]},

      {id:'sillok', phase:'활동 1', minutes:25, move:'분석',
        title:'경신대기근의 인과 사슬',
        prompt:'기후 현상은 사회를 어떻게 흔들었을까요?',
        lead:'17세기 소빙기에 냉해·가뭄·우박·전염병·우역이 겹친 1670~1671년의 대기근을, 경술년과 신해년의 앞 글자를 따서 경신대기근이라 불러요.',
        visual:{src:'slides/k57/s08.jpg', alt:'사료 3: 경신대기근 설명', cap:'수업 슬라이드 · 활동지 3번'},
        blocks:[
          {t:'widget', name:'climate-highlight', opts:{key:'k57-hl', kind:'워크북 1-2', q:'사료 2(현종개수실록 내용 요약 및 재구성)에서 기후 현상과 사회적 영향을 색깔별로 표시해 봅시다.',
            pens:['기후 현상','사회적 영향'],
            parts:[
              {w:'봄부터 여름을 지나 가을에 이르기까지', a:null}, ' ', {w:'가뭄', a:0}, '과 ', {w:'홍수', a:0}, ', ', {w:'강풍', a:0}, '과 ', {w:'우박', a:0}, '이 번갈아 몰아쳤다. ',
              {w:'대낮에 서리가 내려', a:0}, ' ', {w:'곡식이 모두 얼어 죽었고', a:1}, ', ', {w:'전염병까지 돌아', a:1}, ' 팔도(八道)의 백성들이 ', {w:'굶주림으로', a:1}, ' ',
              {w:'부모 자식이 서로를 버리는 참상이 극에 달했다', a:1}, '. ', {w:'이는 역사상 유례가 없는 재앙이다', a:null}, '.'],
            model:'<b>기후 현상</b> 가뭄, 홍수, 강풍, 우박, 대낮에 서리 · <b>사회적 영향</b> 곡식이 얼어 죽음, 전염병, 굶주림, 부모 자식이 서로를 버림'}},
          {t:'widget', name:'climate-chain', opts:{key:'k57-chain', kind:'워크북 1-2', q:'표시한 낱말을 떠올리며, 기후 변동이 사회를 흔든 인과 사슬을 순서대로 만들어 봅시다.',
            items:['기후 현상 (가뭄·서리·우박)','농업 생산량 감소','굶주림·아사자 발생','사회적 혼란 (초적 봉기 등)'], order:[2,0,3,1],
            explain:'기후 변동이 농업 생산량을 떨어뜨리고, 굶주림과 아사로 이어져 사회적 혼란을 불렀어요.'}},
          {t:'write', id:'k57-3q1', kind:'워크북 1-3', q:'현종개수실록 탐구! 경술년·신해년 자료 중 기후 변화와 관련된 사료의 내용을 찾아 3건 이상 정리해 봅시다. (QR은 선생님이 나눠 준 워크북에 있어요.)', rows:5, placeholder:'1)\n2)\n3)'}
        ]},

      {id:'relief', phase:'활동 1', minutes:15, move:'판단',
        title:'21세기의 진휼청',
        prompt:'미래세대의 안전과 학습권을 지킬 「21세기 구휼 제도」는 무엇일까요?',
        lead:'역사 속 기후 재난은 모두에게 똑같이 힘들었을까요? 누구에게 더 가혹했을지 먼저 모둠에서 이야기해요.',
        visual:{src:'img/k57-relief.jpg', alt:'조선의 곡식 나눔과 오늘날 폭염 쉼터가 하나로 이어진 그림', cap:GEN},
        blocks:[
          {t:'blanks', id:'k57-jh', kind:'워크북 1-4', q:'Q1. OOO에 들어갈 기관은 무엇일까요?',
            text:'과거 조선시대에는 기후 위기가 발생했을 때 국가가 「[[진휼청]]」을 설치하여 구휼활동을 펼쳤습니다.<br><span class="src">※ 기근 때 설치된 임시 기구였다가 17세기 후반 상설화</span>',
            hints:['흉년에 굶주린 백성을 도와주는 일을 「진휼」이라고 해요.','관청 이름은 「○○청」 꼴이에요.'],
            explain:'진휼청은 굶주린 백성을 구제(구휼)하기 위한 기관이에요.'},
          {t:'timer', minutes:8, label:'모둠 토의'},
          {t:'cer', id:'k57-cer', kind:'워크북 1-4', q:'Q2. 오늘날 기후 위기로 위협받는 「미래세대의 안전과 학습권」을 지키기 위해 국가와 공동체가 마련해야 할 「21세기 구휼 제도(기후 적응 정책)」를 제안해 봅시다. (모둠 토의 후 학급 환경 패들렛에도 올려요.)',
            starters:{c:'국가와 공동체는 ___ 제도를 마련해야 한다.', e:'사료에서는 ___, 오늘날 자료에서는 ___이(가) 나타났다.', r:'이 제도는 ___을(를) 막거나 줄여 미래세대의 안전과 학습권을 지킨다.'}}
        ]},

      {id:'data', phase:'활동 2', minutes:15, move:'분석',
        title:'과거와 현대, 무엇을 비교할까?',
        prompt:'실록에 「가뭄」 기록이 많으면, 가뭄이 실제로 더 많았던 걸까요?',
        lead:'워크북의 조선왕조실록 QR로 기후 이슈를 검색하고, 기후정보포털 지표와 짝지어 모둠 주제를 정해요.',
        visual:{src:'slides/k57/s12.jpg', alt:'조선왕조실록에서 검색할 기후 이슈와 정리 방법', cap:'수업 슬라이드 · 활동지 1번'},
        blocks:[
          {t:'choice', id:'k57-count', q:'어떤 시기에 실록에서 「가뭄」 기록이 많이 검색되었어요. 이 결과를 해석하는 태도로 가장 알맞은 것은?',
            options:['그 시기에 가뭄이 검색된 횟수만큼 정확히 일어났다고 결론 내린다.','기록된 횟수일 뿐이므로, 실제 발생 횟수와 같다고 단정하지 않고 다른 자료와 함께 살핀다.','기록이 적은 시기에는 가뭄이 전혀 없었다고 본다.'],
            answer:1, hints:['실록은 누가, 무엇을 골라 남긴 기록인지 떠올려 보세요.','기록이 적은 시기는 가뭄이 없었던 걸까요, 덜 기록된 걸까요?'], why:true,
            explain:'기록 횟수 ≠ 실제 발생 횟수. 사료 데이터는 무엇이 기록되었는지를 보여 줄 뿐이라, 다른 자료와 함께 살펴야 해요.'},
          {t:'widget', name:'climate-pair', opts:{key:'k57-pair', q:'조선왕조실록에서 검색할 기후 이슈와 기상청 기후정보포털에서 분석할 지표를 짝지어 우리 모둠 주제를 정해 봅시다.',
            leftTitle:'조선왕조실록 검색 이슈', left:['기근','홍수','가뭄','서리','폭설'],
            rightTitle:'기후정보포털 분석 지표', right:['열대야 및 폭염 일수','한파 및 서리 일수','호우 일수 및 1일 최대 강수량','4계절 길이 변화','수온 및 해수면 높이 변화']}},
          {t:'write', id:'k57-a2-1', kind:'워크북 2-1', q:'조선왕조실록을 통해 우리 모둠이 주목한 기후 이슈를 정리해 봅시다. (예: 기근·서리·폭설 기록이 나타난 시기, 병자호란 당시 폭설로 인한 국가와 백성들의 상황)', rows:6,
            placeholder:'기후 이슈:\n핵심 원인:\n영향을 준 상황:\n수치 기록(시기별 기록 횟수 등):\n기록 분석:'}
        ]},

      {id:'viz', phase:'활동 2', minutes:20, move:'예측',
        title:'과거와 현대의 기록이 보내는 메시지',
        prompt:'최근 30년, 우리 지역의 기후 지표는 어떻게 변했을까요?',
        lead:'워크북의 기상청 기후정보포털 QR로 수치를 찾기 전에 먼저 예측해요.',
        visual:{src:'slides/k57/s13.jpg', alt:'기상청 기후정보포털 기후변화 상황지도 화면', cap:'기상청 기후정보포털 화면 · 수업 슬라이드'},
        blocks:[
          {t:'predict', id:'k57-p-trend', q:'우리 모둠이 고른 지표(예: 열대야 및 폭염 일수, 호우 일수 및 1일 최대 강수량, 4계절 길이)는 최근 30년 동안 어떻게 변했을까요? 방향과 크기를 예측해 써 보세요.',
            placeholder:'예: (지표)는 (늘었/줄었)을 것이다. 왜냐하면 …',
            reveal:[
              {t:'write', id:'k57-a2-2', kind:'워크북 2-2', q:'기후정보포털에서 찾은 수치를 기록하고 변화 추이를 분석해 봅시다.', rows:6,
                placeholder:'기후 이슈:\n핵심 원인:\n영향을 준 상황:\n수치 기록(연도·값·단위):\n변화 추이 분석:'},
              {t:'widget', name:'climate-dual', opts:{key:'k57-dual', kind:'워크북 2-3'}}
            ],
            compare:'실제 수치는 내 예측과 같았나요? 가장 놀라웠던 수치와 그 까닭을 써 보세요.'},
          {t:'write', id:'k57-a2-3', kind:'워크북 2-3', q:'역사적 성찰과 데이터 분석을 바탕으로 한 우리의 시사점을, 그래프의 수치를 근거로 한 문장으로 써 봅시다. (캔바 양식 QR로 인포그래픽을 완성해 학급 패들렛에 올려요. 꾸미기보다 수치를 객관적으로 전달해요.)', rows:3}
        ]},

      {id:'treaty', phase:'활동 3', minutes:15, move:'판단',
        title:'국제 기후 협약의 빈틈',
        prompt:'약속을 했는데도 탄소 감축이 어려운 까닭은 무엇일까요?',
        lead:'세계는 교토 의정서, 파리 협정 같은 국제 기후 협약을 맺어 왔어요. 비판 자료를 보기 전에 먼저 짐작해 봐요.',
        visual:{src:'img/k57-treaty.jpg', alt:'둥근 회의 탁자에서 지구에 묶인 줄을 서로 다른 방향으로 당기는 대표단', cap:GEN},
        blocks:[
          {t:'predict', id:'k57-p-treaty', q:'여러 나라가 협약을 맺었는데도 실질적인 탄소 감축과 생태계 보전이 잘되지 않는 까닭은 무엇일까요?',
            placeholder:'내 짐작과 그렇게 생각한 이유',
            reveal:[
              {t:'visual', src:'slides/k57/s17.jpg', alt:'국제 기후 협약의 한계에 대한 비판 글', cap:'수업 슬라이드 · 활동지 1번'},
              {t:'widget', name:'climate-form', opts:{key:'k57-trform', target:'k57-a3-1', kind:'워크북 3-1', q:'협약 하나를 골라 핵심 내용과 한계를 직접 조사해 정리해 봅시다.',
                fields:[
                  {k:'name', label:'내가 조사한 기후 협약', type:'pick', options:['몬트리올 의정서','교토 의정서','파리 협정'], wide:true},
                  {k:'core', label:'핵심 내용', type:'area', wide:true},
                  {k:'limit', label:'한계', type:'area', wide:true}]}},
              {t:'write', id:'k57-a3-1', kind:'워크북 3-1', q:'국제 기후 협약 조사 (위 칸을 채우면 자동으로 들어가요)', rows:5}
            ],
            compare:'비판 자료가 말한 한계는 내 짐작과 어떻게 같고 달랐나요? 내가 조사한 협약에도 같은 한계가 있었나요?'}
        ]},

      {id:'proposal', phase:'정리', minutes:30, move:'실천',
        title:'미래 세대 기후 생태 협약',
        prompt:'국제 사회의 대표단이라면, 어떤 협약을 제안할까요?',
        lead:'과거의 역사적 교훈과 현대의 데이터 분석을 근거로 써요. 완성한 협약문은 캔바 양식 QR로 만들어 학급 패들렛에 올려요.',
        visual:{src:'slides/k57/s19.jpg', alt:'미래 세대 기후 생태 협약 제안 안내와 협약문 양식·패들렛 QR', cap:'수업 슬라이드 · 활동지 2번'},
        blocks:[
          {t:'widget', name:'climate-form', opts:{key:'k57-prform', target:'k57-a3-2', kind:'워크북 3-2', q:'모둠 토의를 거쳐 협약 제안서 칸을 채워 봅시다. 앞에서 찾은 사료와 수치를 근거로 써요.',
            fields:[
              {k:'name', label:'협약의 명칭', wide:true},
              {k:'why', label:'Q1. 위와 같은 명칭을 붙이게 된 이유', type:'area', wide:true},
              {k:'bg', label:'Q2. 협약을 만들게 된 배경 (역사 및 데이터 근거 제시)', type:'area', wide:true},
              {k:'a1', label:'제1조 (탄소중립 및 기후)', type:'area', wide:true},
              {k:'a2', label:'제2조 (생태계 보전)', type:'area', wide:true},
              {k:'a3', label:'제3조 (미래세대 보호 및 환경 정의)', type:'area', wide:true}],
            preview:(v,e)=>'<div style="border:1px solid var(--line);border-top:6px solid var(--th);border-radius:10px;background:var(--surface);padding:16px 18px;display:flex;flex-direction:column;gap:10px">'
              +'<div class="src" style="text-align:center;letter-spacing:.1em">미래 세대 기후 생태 협약</div>'
              +'<h3 style="font-size:1.5rem;text-align:center">'+(e(v.name)||'(협약의 명칭)')+'</h3>'
              +'<p style="font-size:.93rem"><b>명칭의 이유</b> '+(e(v.why)||'…')+'</p>'
              +'<p style="font-size:.93rem"><b>배경</b> '+(e(v.bg)||'…')+'</p>'
              +'<ol style="margin:0;padding-left:1.3em;display:flex;flex-direction:column;gap:6px">'
              +'<li><b>제1조 (탄소중립 및 기후)</b> '+(e(v.a1)||'…')+'</li>'
              +'<li><b>제2조 (생태계 보전)</b> '+(e(v.a2)||'…')+'</li>'
              +'<li><b>제3조 (미래세대 보호 및 환경 정의)</b> '+(e(v.a3)||'…')+'</li></ol></div>'}},
          {t:'write', id:'k57-a3-2', kind:'워크북 3-2', q:'미래 세대 기후 생태 협약 제안서 (위 칸을 채우면 자동으로 들어가요)', rows:9},
          {t:'reflect', id:'k57-exit', items:['다른 모둠 작품(정책·인포그래픽·협약문) 중 가장 설득력 있었던 근거','오늘 수업으로 새롭게 알게 된 점']},
          {t:'more', title:'더 나아가기', items:[
            {img:'img/k57-more-archive.jpg', tag:'사이트', title:'실록 속 기상 기록 검색', text:'기상청이 정리한 조선왕조실록 기상기록에서 서리·우박·가뭄 기록을 찾아 시기별로 세어 봐요.', url:JOSEON_URL},
            {img:'img/k57-more-atlas.jpg', tag:'도구', title:'기후변화 상황지도', text:'우리 지역의 미래 기온·강수를 저탄소·고탄소 시나리오로 비교해 봐요.', url:ATLAS_URL},
            {img:'img/k57-more-report.jpg', tag:'자료', title:'한국 기후위기 평가보고서 2025', text:'한반도 폭염일수가 기준 기간 8.8일에서 최근 10년 15.6일로 늘어난 자료를 확인해요.', url:KMA_PRESS}
          ]}
        ]}
    ]
  });
})();
