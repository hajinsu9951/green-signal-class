/* 그린 시그널 수업실 — 기후변화 노선 v3 (k12 · k34 · k57)
   기준(우선순위): 결과보고서 공식 흐름 > 통합 지도안(conv/plan_all.txt) > 학생 워크북(files/<id>/student-worksheet.pdf) > 최종 PPT(ppt/, slides/, media/) > v2
   v2 백업: scratchpad/climate_v2_backup.js */
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
      syncWrite(st, o.target, sel.length ? '★ '+sel.slice().sort((a,b)=>a-b).map(k=>(k+1)+'. '+o.items[k]).join(' / ') : '');
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
    const s = st.get(o.key) || {m:1, rows:[{},{},{},{}]};
    const M = [{k:'sh', name:'그림자 길이', unit:'cm'}, {k:'t', name:'기온', unit:'℃'}];
    const C = [{k:'d', h:'날짜', ph:'예: 4월 6일'}, {k:'sh', h:'그림자(cm)', num:1}, {k:'t', h:'기온(℃)', num:1}, {k:'sky', h:'하늘', ph:'예: 맑음'}, {k:'note', h:'특이사항', ph:''}];
    const save = () => st.set(o.key, s);
    let bestTxt = '';
    host.append(ah(U, o.kind || '관측 기록', '4주 동안 같은 방법으로 관측한 기록을 표에 적으면 꺾은선그래프가 그려져요.'));
    const tbody = U.el('tbody',{});
    s.rows.forEach((r,i)=>{
      const tr = U.el('tr',{}, U.el('th',{text:(i+1)+'주'}));
      const nums = [];
      C.forEach(c=>{
        const inp = U.el('input',{class:'w',placeholder:c.ph||'',inputmode:c.num?'decimal':null,'aria-label':(i+1)+'주 '+c.h,style:'min-width:'+(c.num?'4.5em':'6em'),oninput:e=>{ r[c.k] = e.target.value; changed(); }});
        inp.value = r[c.k]==null ? '' : r[c.k];
        if(c.num){ nums.push(inp); inp.disabled = !!r.x; }
        tr.append(U.el('td',{}, inp));
      });
      const cb = U.el('input',{type:'checkbox',style:'accent-color:var(--th);width:18px;height:18px',onchange:e=>{ r.x = e.target.checked; nums.forEach(n=>n.disabled = r.x); changed(); }});
      cb.checked = !!r.x;
      tr.append(U.el('td',{}, U.el('label',{style:'display:flex;gap:6px;align-items:center;font-size:.85rem;white-space:nowrap'}, cb, '관측 못 함')));
      tbody.append(tr);
    });
    const tbl = U.el('div',{class:'tbl'}, U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{text:'주차'}), ...C.map(c=>U.el('th',{text:c.h})), U.el('th',{text:'메모'}))), tbody));
    const mrow = U.el('div',{class:'row'}, U.el('span',{class:'src',text:'그래프 세로축:'}));
    const mb = M.map((m,i)=>{ const b = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ s.m = i; paintM(); changed(); }}, m.name+'('+m.unit+')'); mrow.append(b); return b; });
    const chartBox = U.el('div',{class:'chart'});
    const res = U.el('div',{class:'fb info'});
    host.append(tbl, mrow, chartBox, res, U.el('p',{class:'cap',text:'가로축은 관측 날짜, 세로축은 기온(또는 그림자 길이)이에요. 4주 동안의 변화는 계절 변화예요.'}));
    function paintM(){ mb.forEach((b,i)=>b.classList.toggle('pri', i===s.m)); }
    function draw(){
      const m = M[s.m], unit = m.unit;
      const pts = s.rows.map((r,i)=>({lab: esc(r.d || ((i+1)+'주')), raw: r.d || ((i+1)+'주'), v: r.x ? null : num(r[m.k])}));
      bestTxt = '';
      if(!pts.some(p=>p.v!=null)){ chartBox.innerHTML = '<p class="src" style="padding:10px">값을 넣으면 그래프가 나타나요.</p>'; res.textContent = '두 번 이상 기록하면 가장 크게 변한 구간을 찾아 줘요.'; return; }
      chartBox.innerHTML = U.chart({kind:'line', x:pts.map(p=>p.lab), series:[{name:m.name, values:pts.map(p=>p.v)}], unit:unit, labels:true, height:240, title:'4주 관측 그래프 · '+m.name});
      let best = null, prev = null;
      pts.forEach(p=>{ if(p.v==null) return; if(prev){ const d = p.v - prev.v; if(!best || Math.abs(d) > Math.abs(best.d)) best = {a:prev.raw, b:p.raw, d}; } prev = p; });
      if(!best){ res.textContent = '한 번 더 기록하면 변화를 비교할 수 있어요.'; return; }
      if(best.d === 0){ res.textContent = '두 기록의 값이 같아서 변화가 없어요.'; return; }
      bestTxt = '★ 가장 크게 변한 구간('+m.name+'): '+best.a+' → '+best.b+', '+r1(Math.abs(best.d))+unit+' '+(best.d>0?'증가':'감소');
      res.innerHTML = '★ 가장 크게 변한 구간('+m.name+'): <b>'+esc(best.a)+' → '+esc(best.b)+'</b> · <b class="num">'+r1(Math.abs(best.d))+unit+' '+(best.d>0?'증가':'감소')+'</b>';
    }
    function compose(){
      return s.rows.map((r,i)=>(r.d||r.sh||r.t||r.sky||r.note||r.x) ? (i+1)+'주 | 날짜 '+(r.d||'')+' | '+(r.x?'관측 못 함':'그림자 '+(r.sh||'')+'cm | 기온 '+(r.t||'')+'℃')+' | 하늘 '+(r.sky||'')+' | 특이사항 '+(r.note||'') : null).filter(Boolean).join('\n')+(bestTxt?'\n'+bestTxt:'');
    }
    function changed(){ save(); draw(); syncWrite(st, o.target, compose()); }
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
    host.append(ah(U, o.kind || '활동지 3', '세 값을 넣어 나란히 비교해 봐요. (단위: ℃)'));
    const grid = U.el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px 14px'});
    F.forEach(f=>{
      const inp = U.el('input',{class:'w',inputmode:'decimal',id:o.key+'-'+f.k,oninput:e=>{ s.v[f.k] = e.target.value; st.set(o.key, s); draw(); syncWrite(st, o.target, compose()); }}); inp.value = s.v[f.k] || '';
      grid.append(U.el('div',{}, U.el('label',{for:o.key+'-'+f.k,style:'display:block;font-weight:700;font-size:.9rem;margin-bottom:4px',text:f.l}), inp));
    });
    const chartBox = U.el('div',{class:'chart'});
    const res = U.el('div',{class:'fb info'});
    const chips = U.el('div',{class:'row'});
    WHY.forEach(w=>{
      const b = U.el('button',{type:'button',class:'chip','aria-pressed':'false',onclick:()=>{ s.why = s.why.includes(w) ? s.why.filter(x=>x!==w) : [...s.why, w]; st.set(o.key, s); paintChips(); syncWrite(st, o.target, compose()); }}, w);
      chips.append(b);
    });
    host.append(grid, chartBox, res, U.el('p',{style:'font-weight:700;font-size:.92rem',text:'차이가 난 까닭이 될 만한 것을 모두 골라 보세요.'}), chips);
    function compose(){ const v = k => num(s.v[k]); return F.map(f=>f.l+': '+(s.v[f.k]||'')+'℃').join('\n')+(v('a')!=null&&v('b')!=null?'\n① − ② = '+r1(v('a')-v('b'))+'℃':'')+(v('c')!=null&&v('d')!=null?'\n기상청 그날 최고 − ③ 평년 최고 = '+r1(v('c')-v('d'))+'℃':'')+'\n차이가 난 까닭: '+(s.why.join(', ')||''); }
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
      pickL = null; st.set(o.key, s); paint(); syncWrite(st, o.target, compose());
    }}, t)); });
    const list = U.el('div',{style:'display:flex;flex-direction:column;gap:6px'});
    host.append(U.el('p',{class:'src',text:'왼쪽 카드를 누른 다음, 함께 비교하고 싶은 오른쪽 카드를 눌러요. 정답이 정해진 활동은 아니에요.'}),
      U.el('div',{style:'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px'}, colL, colR),
      U.el('p',{style:'font-weight:700;font-size:.92rem',text:'우리 모둠이 만든 짝'}), list,
      U.el('div',{class:'callout warn'}, U.el('div',{class:'ct',text:'주의'}), U.el('div',{html:'기록 횟수 ≠ 실제 발생 횟수'})));
    function compose(){ return s.pairs.map(p=>o.left[p[0]]+' ↔ '+o.right[p[1]]).join('\n'); }
    function paint(){
      lb.forEach((b,i)=>b.classList.toggle('pick', pickL===i));
      list.innerHTML = '';
      if(!s.pairs.length){ list.append(U.el('span',{class:'src',text:'아직 짝이 없어요.'})); return; }
      s.pairs.forEach((p,k)=>list.append(U.el('div',{class:'row'},
        U.el('span',{html:'<b>'+esc(o.left[p[0]])+'</b> ↔ '+esc(o.right[p[1]])}),
        U.el('button',{type:'button',class:'btn sm','aria-label':'이 짝 지우기',onclick:()=>{ s.pairs.splice(k,1); st.set(o.key, s); paint(); syncWrite(st, o.target, compose()); }},'지우기'))));
      const f = host.querySelector('.fb'); if(f) f.remove();
    }
    paint();
  });

  /* ---------- 위젯: 과거 기록 횟수 + 현대 관측값 그래프 ---------- */
  GS.widget('climate-dual', function(host, o, st, U){
    const s = st.get(o.key) || {p:[{},{},{},{}], m:[{},{},{},{}], pt:'', mt:'', mu:''};
    const save = () => { st.set(o.key, s); syncWrite(st, o.target, compose()); };
    function compose(){ const line = rows => rows.filter(r=>r.l||r.v).map(r=>(r.l||'?')+': '+(r.v||'')).join(', '); return '과거(조선왕조실록 기록 횟수) — '+(s.pt||'이슈')+': '+line(s.p)+' (단위: 회)\n현대(기상청 기후정보포털) — '+(s.mt||'지표')+': '+line(s.m)+(s.mu?' (단위: '+s.mu+')':''); }
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
  const ATLAS_URL = 'https://climate.go.kr/atlas/dsh/ccf';
  const SILLOK2_URL = 'https://m.site.naver.com/2cAhV';
  const SILLOK3_URL = 'https://m.site.naver.com/2gyKq';
  const KMA_PRESS = 'https://www.kma.go.kr/kma/news/press.jsp?bid=press&mode=view&num=1194530&page=3&&from=2025-08-25&to=2025-11-25';
  const GEN = '그림: 생성 이미지';
  const PPT = '교사 제작 PPT 수록 자료';

  /* 도입 역사 자료(교사 PPT 속 원본 사진) */
  const H_LIST = {src:'media/k12/s06-07.jpg', title:'실록 속 날씨 기록 목록 (1392년)',
    fact:'기상청은 조선왕조실록에서 날씨·하늘에 관한 기사를 골라 날짜와 분류(기상 > 비, 기상 > 뇌전 > 천둥, 천문 > 성변 등)로 정리해 두었어요. 1392년 8월 6일 「비가 내렸다」, 10월 17일 「큰 비가 오고 천둥이 쳤다」 같은 기록이 이어져요.',
    credit:PPT+'(1~2차시) · 원출처: 조선왕조실록(국사편찬위원회 번역), 기상청 기상자료개방포털 재가공'};
  const H_TAEJO = {src:'media/k12/s09-10.jpg', title:'『태조실록』 1권, 1392년 8월 6일 기사',
    fact:'태조 1년 7월 18일(음력) 기사예요. 번역과 한문 원문이 함께 실려 있고, 실록 이름·권·왕력·서기력 같은 출처 정보를 확인할 수 있어요.',
    credit:PPT+' · 원출처: 조선왕조실록(국사편찬위원회 번역), 기상청 기상자료개방포털'};
  const H_RAIN2 = {src:'media/k12/s10-11.jpg', title:'『태조실록』 2권, 1392년 10월 17일 기사',
    fact:'태조 1년 10월 1일(음력) 기사예요. 번역은 「큰 비가 오고 천둥이 쳤다」 한 줄뿐이에요. 짧은 기록에는 무엇이 빠져 있을까요?',
    credit:PPT+' · 원출처: 기상청 기상자료개방포털 조선왕조실록'};
  const H_SEJONG = {src:'media/k12/s13-14.jpg', title:'『세종실록』 96권, 1442년 측우기 기사',
    fact:'세종 24년 5월 8일 「호조에서 우량을 측정하는 일에 관해 아뢰다」. 서울 서운관에는 쇠로 만든 측우기를, 지방 각 고을에는 같은 모양으로 자기나 기와로 구워 만든 측우기를 두고, 비가 온 뒤 주척으로 물의 깊이를 재어 기록하게 했어요.',
    credit:PPT+'(1~2차시) · 원출처: 조선왕조실록 누리집(국사편찬위원회)'};
  const H_GRAPH = {src:'media/k57/s03-04.jpg', title:'17세기 북반구의 여름 기온 변화와 동아시아의 주요 기근',
    fact:'1630~1700년 북반구 여름 기온(막대)과 조선·중국·일본의 주요 기근 시기(색 띠)를 함께 보여 줘요. 조선의 경신대기근과 을병대기근이 표시되어 있어요.',
    credit:PPT+' · 원출처: Global Crisis(2013), 동아출판 한국사1 교과서 자료 인용'};
  const H_PORTAL = {src:'media/k57/s13-09.jpg', title:'기상청 기후정보포털 · 기후변화 상황지도',
    fact:'우리나라 지역별 기온·강수·폭염 같은 기후 지표의 변화와 미래 전망(저탄소·고탄소 시나리오)을 지도와 그래프로 보여 주는 화면이에요.',
    credit:PPT+' · 원출처: 기상청 기후정보포털 화면'};
  const H_ATLAS = {src:'media/k34/s14-07.jpg', title:'기후변화 상황지도로 보는 우리 동네의 미래',
    fact:'지역을 고르고 현재와 21세기 후반, 저탄소·고탄소 미래를 비교할 수 있어요. 지도의 색은 값의 크기를 나타내요.',
    credit:PPT+'(3~4차시) · 원출처: 기상청 기후정보포털 climate.go.kr/atlas'};

  /* =====================================================================
     1~2차시 (초등) 과거의 지혜로 기록하는 내일
     공식 흐름: 600년 전 날씨 뉴스 살펴보기 → 실록 이해하고 출처 확인하기 → 사료 카드로 사실·해석 구별하기 → 오늘의 실록 그림카드 만들기
     ===================================================================== */
  const TAEJO = '「비가 내렸다. 이보다 앞서 오랫동안 가물었는데, 임금이 왕위에 오르자 억수같이 비가 내리니, 백성의 마음이 크게 기뻐하였다.」';
  const SILLOK_SRC = '조선왕조실록(국사편찬위원회 번역), 기상청 기상자료개방포털 재가공';
  const CARDS = [
    {when:'1392. 8. 6.', title:'1. 가뭄 뒤 큰비', date:'태조 1년 7월 18일(음력) · 서기 1392년 8월 6일 · 『태조실록』 1권', text:TAEJO,
      think:['억수같이 비가 내린 것은 관찰한 사실일까요?','「백성의 마음이 크게 기뻐하였다」고 말하려면 어떤 정보가 더 필요할까요?','사관은 왜 비와 즉위를 함께 적었을까요?'],
      has:'오랜 가뭄 뒤 억수같은 비, 즉위 시점', missing:'강수량 등 (예: 강수량은 몇 mm였을까?)'},
    {when:'1392. 10. 17.', title:'2. 큰비와 천둥', date:'태조 1년 10월 1일(음력) · 서기 1392년 10월 17일 · 『태조실록』 2권 · 분류: 기상 > 뇌전 > 천둥', text:'「큰 비가 오고 천둥이 쳤다.」 (원문: 大雨雷。)',
      think:['짧은 기록만으로 피해를 알 수 있을까요?','오늘의 기자라면 누구에게 무엇을 더 물어볼까요?'],
      has:'큰비, 천둥, 날짜', missing:'강수량, 지속 시간, 지역, 피해 규모'},
    {when:'1394. 5. 17.', title:'3. 우박', date:'태조 3년 4월 17일(음력) · 서기 1394년 5월 17일 · 『태조실록』 5권', text:'「우박이 내리었다.」',
      think:['5월 중순의 우박은 왜 특별한 기록일까요?'],
      has:'시기(음력 4월 17일, 서기 1394년 5월 17일), 기상 현상(우박)', missing:'지역, 작물 피해, 우박 크기, 지속 시간'},
    {when:'1442. 5. 8.', title:'4. 측우기로 비를 재다', date:'세종 24년 5월 8일 · 서기 1442년 · 『세종실록』 96권 「호조에서 우량을 측정하는 일에 관해 아뢰다」',
      text:'(원문 요지) 서울에서는 쇠로 만든 측우기를 서운관의 대 위에 두고, 비가 온 뒤 주척(자)으로 물의 깊이를 재어 비가 내린 때·갠 때와 함께 자세히 적게 했어요. 지방의 각 고을에도 측우기(자기나 기와로 구워 만들기도 함)를 두고 같은 방법으로 재어 보고하고 기록해 두게 했어요.',
      think:['비를 숫자로 재면 무엇이 달라질까요?'],
      has:'재는 도구(측우기·주척), 재는 곳(서울 서운관·지방 각 고을), 적을 것(비 온 때·갠 때·물 깊이)', missing:'이 기사는 재는 방법을 정한 기록이에요. 실제로 잰 비의 양은 다른 날의 기록에서 찾아야 해요.'}
  ];

  GS.lesson({
    id:'k12', theme:'climate', order:1, period:'1~2차시', periods:2,
    level:'초등', minutes:80,
    title:'과거의 지혜로 기록하는 내일',
    question:'옛 기록에서 사실과 해석을 어떻게 구별하며 읽을 수 있을까요?',
    goals:['조선왕조실록 등 역사 기록에서 사실과 해석을 구분하여 비판적으로 읽을 수 있다.','오늘의 관점에서 기록을 재구성한 그림카드를 만들 수 있다.'],
    standards:['[6국02-03] 글·자료의 내용과 표현 평가','[6국06-02] 정보 매체의 신뢰성 평가','[6국06-03] 복합양식 자료 제작·공유','※ 선수학습: [4국02-04] 사실과 의견 구별하기를 역사 기록의 사실·해석 읽기에 적용'],
    prep:['준비물: PPT(조선왕조실록 편집본, 사료 카드), 학생 워크북, 디지털 기기, 패들렛',
      '4인 1모둠으로 편성하고 사료 카드 1~4를 모둠별로 준비한다.',
      '태블릿 충전 상태와 패들렛 그림카드 보드 접속 여부를 미리 확인한다.',
      '안전 약속(도입 5′): 태블릿은 두 손으로 옮기고 책상 가운데에 두고 사용한다. 패들렛 그림카드에 얼굴 사진·실명 등 개인정보를 올리지 않는다(활동3 그림카드 제작 전에 다시 상기).',
      '학생 사전 준비: 국어 시간에 배운 「사실과 의견 구별하기」를 떠올려 온다.'],
    assess:[
      {what:'사료 카드에서 사실 2개 + 해석 1개 + 추가 질문 1개 구분하기(활동2, 활동지 5번)', how:'활동지'},
      {what:'친구의 그림카드에 근거를 더 묻는 질문 남기기(활동3)', how:'패들렛 댓글 · 상호 피드백'},
      {what:'모둠별 그림카드 감상, 오늘 새롭게 알게 된 점 나누기(정리)', how:'발표 · 감상 나눔'}],
    history:[H_LIST, H_RAIN2, H_SEJONG],
    steps:[
      {id:'news', phase:'도입', minutes:5, move:'예측',
        title:'600년 전 날씨 뉴스 살펴보기',
        purpose:'조선 사람들도 날씨를 기록했는지, 그 기록을 어떻게 읽어야 하는지 오늘 공부할 문제를 찾으려고 해요.',
        how:['문장 속 OO에 들어갈 낱말을 떠올려 써요.','600년 전 조선의 날씨 기록이 어땠을지 먼저 예측해요.','『태조실록』 1392년 8월 6일 기록을 읽고 무엇을 알 수 있는지 적어요.'],
        outcome:'조선은 특별한 날씨를 날짜와 함께 「기록」했고, 그 기록은 「사실」과 해석을 구별해서 읽어야 한다는 것을 알게 돼요.',
        prompt:'600년 전에도 날씨 뉴스가 있었을까요?',
        visual:{src:H_TAEJO.src, alt:'『태조실록』 1392년 8월 6일 기사의 상세정보 화면(번역과 원문)', cap:'『태조실록』 1권, 태조 1년 7월 18일(음력) · 출처: '+SILLOK_SRC+' · '+PPT},
        teacher:{
          ask:['아래 내용에 들어갈 낱말은 무엇일까요?','이 기록을 보고 무엇을 알 수 있나요?','이 중에서 확실한 사실은 무엇이고, 기록한 사람의 생각(해석)이 들어간 부분은 어디일까요?'],
          answer:['첫 번째는 「기록」, 두 번째는 「사실」입니다.','그날 비가 내렸다는 것, 백성들이 기뻐했다는 것을 알 수 있습니다.','「비가 내렸다」는 사실이고, 「백성의 마음이 크게 기뻐하였다」는 해석에 가깝습니다. 비와 즉위를 함께 적은 사관의 의도도 생각해 볼 수 있습니다.'],
          tip:['안전교육: 태블릿은 두 손으로 옮기고 책상 가운데에 두기, 패들렛에 얼굴 사진·실명 올리지 않기를 함께 읽는다.','정답을 맞히는 활동이 아니라 자유롭게 떠올려 보는 활동임을 안내하여 편안하게 발표하도록 돕는다.','옛 기록이 낯설게 느껴지지 않도록, 실록이 오늘날 뉴스·일기처럼 그날그날의 일을 남긴 기록물임을 짚어 준다.','학습 문제: 실록 속 기후 기록을 비판적으로 읽고, 사실과 해석을 구분하여 오늘의 관점으로 재구성한 그림카드를 만들어 봅시다.'],
          link:'「기록」과 「사실」이라는 두 낱말이 활동1(실록과 출처)과 활동2(사실·해석 구별)로 이어진다.'},
        blocks:[
          {t:'blanks', id:'k12-oo', ws:'생각 열기', q:'아래 내용에 들어갈 낱말은 무엇일까요? (정답을 맞히기보다 자유롭게 떠올려 봐요.)',
            text:'조선 시대에는 특별한 날씨를 날짜와 함께 [[기록]]해서 실록에 남겼어요.<br>기록을 읽을 때는 [[사실]]과 해석을 구별해서 읽어야 해요.',
            hints:['실록은 그날그날의 일을 남긴 「○○물」이에요.','국어 시간의 「○○과 의견」을 떠올려 보세요.'],
            explain:'오늘은 옛 기록에서 <b>사실과 해석을 구별하며 읽는 활동</b>을 해요.'},
          {t:'predict', id:'k12-p-news', ws:'생각 열기', q:'600년 전 조선의 날씨 기록은 어떤 모습이었을까요?',
            options:['날씨는 거의 기록하지 않았을 거예요.','특별한 날씨를 날짜와 함께 짧게 적었을 거예요.','오늘처럼 매일 기온과 강수량을 숫자로 적었을 거예요.'],
            reveal:[
              {t:'callout', tone:'q', title:'『태조실록』 1권 · 1392년 8월 6일', text:TAEJO+'<br><span class="src">태조 1년 7월 18일(음력) · 출처: '+SILLOK_SRC+'</span>'},
              {t:'visual', src:H_LIST.src, alt:'1392년 조선왕조실록의 기상·천문 기록 목록', cap:'기상청이 정리한 1392년 실록 속 날씨·하늘 기록 · 출처: '+SILLOK_SRC},
              {t:'write', id:'k12-news-know', ws:'생각 열기', q:'이 기록을 보고 무엇을 알 수 있나요? 그중 확실한 사실과, 기록한 사람의 생각이 들어간 부분을 짐작해 보세요.', rows:2,
                placeholder:'알 수 있는 것: …\n사실 같아요: … / 생각이 들어간 것 같아요: …'},
              {t:'slides', from:3, to:6, title:'생각 열기 · 600년 전 날씨 뉴스'}
            ],
            compare:'내 예측과 실제 기록은 무엇이 같고 달랐나요?'}
        ]},

      {id:'silrok', phase:'활동 1', minutes:7, move:'관찰',
        title:'실록 이해하고 출처 확인하기 ① 조선왕조실록은 어떤 기록일까?',
        purpose:'앞에서 읽은 날씨 기록이 어디에 실려 있는지 알아야 그 기록을 믿을 수 있는지 판단할 수 있어요.',
        how:['조선왕조실록이 무엇인지, 누가, 왜 썼는지 표로 확인해요.','조선왕조실록이 왜 중요한 기록인지 내 말로 써요.'],
        outcome:'실록은 사관이 날짜별로 남긴 나라의 기록이라는 것을 알고, 기록을 믿기 전에 확인할 것이 무엇인지 궁금해져요.',
        prompt:'조선왕조실록은 왜 중요한 기록일까요?',
        visual:{src:'slides/k12/s07.jpg', alt:'조선왕조실록: 무엇인가요, 누가 썼나요, 왜 썼나요', cap:'수업 슬라이드 7 · 활동지 1번'},
        layout:'split',
        teacher:{
          ask:['조선왕조실록은 왜 중요한 기록일까요?'],
          answer:['470여 년 동안 있었던 일을 날짜별로 기록해, 오늘날에도 당시의 날씨·생활을 알 수 있게 해 주기 때문입니다.'],
          tip:['실록은 왕이 죽은 뒤 실록청이 사초 등을 바탕으로 편찬했음을 함께 소개한다.','국어 시간에 배운 「사실과 의견 구분하기」를 상기시키며, 국어과의 「사실과 의견」이 역사 읽기에서는 「사실과 해석」으로 쓰임을 한 줄로 설명한다.'],
          link:'실록이 「누가·왜」 쓴 기록인지 알았으니, 다음 장면에서 기록을 믿기 전에 확인할 질문(출처 탐정)을 고른다.'},
        blocks:[
          {t:'table', title:'조선왕조실록에 대해 정리해 봅시다 (활동지 1번)', head:['질문','정리'], rowhead:true,
            rows:[['무엇인가요?','왕이 살았던 시대의 일을 날짜별로 적은 기록'],['누가 썼나요?','국가의 기록 담당자인 사관 (왕이 세상을 떠난 뒤, 사관의 기록을 모아 실록으로 엮었어요)'],['왜 썼나요?','다음 세대가 사실을 살피도록']]},
          {t:'write', id:'k12-w1', ws:'활동지 1', q:'조선왕조실록은 왜 중요한 기록일까요?', rows:2,
            placeholder:'예: 오랜 기간의 일을 날짜별로 적어서 …',
            example:'470여 년 동안 있었던 일을 날짜별로 기록해, 오늘날에도 당시의 날씨와 생활을 알 수 있게 해 주기 때문이에요.'},
          {t:'callout', tone:'key', title:'국어 시간과 이어 보기', text:'국어 시간의 <b>사실과 의견</b>이 역사 기록에서는 <b>사실과 해석</b>이 돼요.'},
          {t:'slides', from:7, to:7, title:'조선왕조실록은 왜 중요한 기록일까요?'}
        ]},

      {id:'detective', phase:'활동 1', minutes:8, move:'판단',
        title:'실록 이해하고 출처 확인하기 ② 출처 탐정',
        purpose:'실록이 중요한 기록이라도, 믿기 전에 누가·언제·어떻게 기록했는지 확인하는 눈이 필요해요.',
        how:['출처 탐정 질문 7가지를 읽어요.','모둠에서 가장 중요하다고 생각하는 질문 두 개에 ★를 눌러요.','그 두 질문을 고른 까닭을 써요.'],
        outcome:'기록을 읽을 때 「사실과 해석이 섞여 있나요?」, 「빠진 정보는 없나요?」 같은 질문으로 따져 볼 수 있게 돼요. 이 질문을 들고 사료 카드를 읽어요.',
        prompt:'기록을 믿기 전에 무엇을 확인해야 할까요?',
        visual:{src:'slides/k12/s08.jpg', alt:'출처 탐정 질문 7가지와 별표', cap:'수업 슬라이드 8 · 활동지 2번'},
        layout:'split',
        teacher:{
          ask:['기록을 믿기 전에 무엇을 확인해야 할까요?'],
          answer:['누가, 언제 기록했는지, 직접 본 사실인지 전해 들은 말인지 등을 확인해야 합니다.'],
          tip:['모둠별로 가장 중요하다고 생각하는 질문 두 개에 별표하고 그 까닭을 이야기하게 한다(활동지 1~2번).','출처 신뢰성 판단은 국어과 「비판적으로 읽어요」와 연계한다.'],
          link:'고른 질문 가운데 「사실과 해석이 섞여 있나요?」를 활동2에서 사료 카드 1에 바로 적용한다.'},
        blocks:[
          {t:'widget', name:'climate-star-vote', ws:'활동지 2', opts:{key:'k12-star', target:'k12-w2s', kind:'별표 고르기', max:2, q:'모둠에서 가장 중요한 질문 두 개에 ★를 눌러요.',
            items:['누가 기록했나요?','언제, 어디에서 기록했나요?','직접 본 사실인가요, 전해 들은 말인가요?','수치·날짜·장소 같은 근거가 있나요?','사실과 해석이 섞여 있나요?','빠진 사람이나 정보는 없나요?','다른 기록과 비교할 수 있나요?']}},
          {t:'write', id:'k12-w2s', ws:'활동지 2', q:'우리 모둠이 별표한 질문 (위에서 ★를 누르면 자동으로 들어가요)', rows:2},
          {t:'write', id:'k12-w2', ws:'활동지 2', q:'우리 모둠이 별표한 질문을 고른 까닭은 무엇인가요?', rows:3, placeholder:'예: ○번과 ○번을 골랐어요. 왜냐하면 …'},
          {t:'slides', from:8, to:8, title:'출처 탐정 질문 7가지'}
        ]},

      {id:'card1', phase:'활동 2', minutes:6, move:'분석',
        title:'사료 카드로 사실·해석 구별하기 ① 가뭄 뒤에 내린 비',
        purpose:'출처 탐정 질문 「사실과 해석이 섞여 있나요?」를 실제 실록 기록에 적용해 보려고 해요.',
        how:['사료 카드 1(『태조실록』 1392년 8월 6일)을 다시 읽어요.','기록 조각을 「사실」, 「해석」, 「기록에 없는 정보를 찾는 질문」 칸으로 나눠요.','사관이 비와 즉위를 함께 적은 까닭을 생각해 써요.'],
        outcome:'「억수같이 비가 내렸다」는 사실, 「백성의 마음이 크게 기뻐하였다」는 해석에 가깝다는 것을 구별할 수 있어요. 다른 카드에는 무엇이 빠졌는지 살펴보러 가요.',
        prompt:'가뭄 뒤에 비가 내리면 모두 같은 마음일까요?',
        visual:{src:'slides/k12/s09.jpg', alt:'태조실록 1392년 8월 6일 기사의 상세정보와 생각 질문', cap:'수업 슬라이드 9 · 활동지 3번 · 출처: '+SILLOK_SRC},
        teacher:{
          ask:['가뭄 뒤에 비가 내리면 모두 같은 마음일까요?','억수같이 비가 내린 것은 관찰한 사실일까요?','사관은 왜 비와 즉위를 함께 적었을까요?'],
          answer:['「비가 내렸다」는 사실이고, 「백성의 마음이 크게 기뻐하였다」는 해석에 가깝습니다.'],
          tip:['「해석」이 틀린 것이 아니라 「더 확인이 필요한 생각」이라는 점을 강조하여, 비판적 읽기가 기록을 불신하는 것이 아니라 꼼꼼히 확인하는 태도임을 이해하도록 돕는다.'],
          link:'카드 1에서 연습한 사실·해석 구별을 다음 장면에서 카드 1~4의 「기록에 있는 것·없는 것」으로 넓힌다.'},
        blocks:[
          {t:'sort', id:'k12-gnd', ws:'활동지 3', q:'다음 실록 기록을 읽고 사실과 해석을 구분해 봅시다. 기록 조각을 알맞은 칸에 놓아 보세요.',
            bins:['① 기록에서 확인할 수 있는 사실','② 기록한 사람의 해석이라고 생각되는 부분','기록에 없는 정보를 찾는 질문'],
            items:[{text:'오랫동안 가물었다',bin:0},{text:'억수같이 비가 내렸다',bin:0},{text:'임금이 왕위에 올랐다',bin:0},{text:'백성의 마음이 크게 기뻐하였다',bin:1},{text:'강수량은 몇 mm였을까?',bin:2},{text:'비는 얼마 동안 내렸을까?',bin:2}],
            explain:'백성의 마음은 직접 볼 수 없어서 해석에 가까워요. 해석은 틀린 것이 아니라 <b>더 확인이 필요한 생각</b>이에요. 기록에 없는 것은 질문으로 남겨요.'},
          {t:'write', id:'k12-w3', ws:'활동지 3', q:'사관은 왜 비와 임금의 즉위를 함께 적었을까요? 이 비를 다르게 느낀 사람도 있었을까요?', rows:3,
            example:'새 임금이 왕위에 오르자 좋은 일이 생겼다는 것을 보여 주고 싶었을 수 있어요. 비가 너무 많이 와서 피해를 본 사람은 기뻐하지 않았을 수도 있어요.'},
          {t:'slides', from:9, to:9, title:'사료 카드 1 · 가뭄 뒤 큰비'}
        ]},

      {id:'cards', phase:'활동 2', minutes:8, move:'관찰',
        title:'사료 카드로 사실·해석 구별하기 ② 기록에 있는 것, 없는 것',
        purpose:'짧은 실록 기록에는 무엇이 적혀 있고 무엇이 빠져 있는지 알아야 기록만으로 판단할 수 있는 것과 없는 것을 구별할 수 있어요.',
        how:['사료 카드 1~4를 차례로 읽어요(카드를 뒤집으면 정리 예시가 나와요).','카드마다 「기록에 있는 것」과 「기록에 없는 것」을 표 칸에 적어요.','측우기 기록(카드 4)을 보고 비를 숫자로 재면 무엇이 달라지는지 골라요.'],
        outcome:'짧은 기록에는 강수량·지역·피해 규모가 빠져 있고, 측우기처럼 같은 도구·단위로 재면 기록끼리 비교할 수 있다는 것을 알게 돼요.',
        prompt:'짧은 기록만으로 피해를 알 수 있을까요?',
        visual:{src:'slides/k12/s11.jpg', alt:'큰비와 천둥 기록, 기자가 인터뷰하는 그림', cap:'수업 슬라이드 11 · 활동지 4번'},
        teacher:{
          ask:['짧은 기록만으로 피해를 알 수 있을까요?','5월 중순의 우박은 왜 특별한 기록일까요?','측우기로 비를 숫자로 재면 무엇이 달라질까요?'],
          answer:['큰비·천둥·날짜는 알 수 있지만, 강수량·지속 시간·지역·피해 규모는 알 수 없어 판단하기 어렵습니다.','같은 도구·단위·방법으로 재기 때문에 지역과 시기의 비를 서로 비교할 수 있게 됩니다.'],
          tip:['사료 카드 1~4(가뭄 뒤 비, 큰비와 천둥, 우박, 세종실록 측우기 지침)를 차례로 살펴보게 한다.'],
          link:'「있는 것·없는 것」을 구별했으니, 다음 장면에서 카드 한 장을 골라 사실 2개 + 해석 1개 + 질문 1개로 정리한다.'},
        blocks:[
          {t:'widget', name:'climate-source-cards', ws:'활동지 4', opts:{key:'k12-flip', kind:'사료 카드 1~4', cards:CARDS, show:[0,1,2,3], src:'기상청 기상자료개방포털 조선왕조실록 · 『세종실록』 96권(조선왕조실록 누리집)'}},
          {t:'widget', name:'climate-form', ws:'활동지 4', opts:{key:'k12-w4form', target:'k12-w4', kind:'표 채우기', q:'사료 카드 1~4를 살펴보고, 기록에 있는 것과 없는 것을 정리해 봅시다.',
            fields:[
              {k:'c1h', label:'1. 가뭄 뒤 큰비 — 기록에 있는 것'}, {k:'c1m', label:'1. 가뭄 뒤 큰비 — 기록에 없는 것'},
              {k:'c2h', label:'2. 큰비와 천둥 — 기록에 있는 것'}, {k:'c2m', label:'2. 큰비와 천둥 — 기록에 없는 것'},
              {k:'c3h', label:'3. 우박 — 기록에 있는 것'}, {k:'c3m', label:'3. 우박 — 기록에 없는 것'},
              {k:'c4h', label:'4. 측우기 지침 — 기록에 있는 것'}, {k:'c4m', label:'4. 측우기 지침 — 기록에 없는 것'},
              {k:'ask', label:'오늘의 기자라면 누구에게 무엇을 더 물어볼까요?', type:'area', wide:true}]}},
          {t:'write', id:'k12-w4', ws:'활동지 4', q:'사료 카드 1~4 정리표 (위 칸을 채우면 자동으로 들어가요)', rows:6},
          {t:'choice', id:'k12-rain', ws:'활동지 4', q:'카드 2의 「큰비」와 측우기로 잰 비는 무엇이 다를까요?',
            options:['측우기로 재면 비가 더 많이 내려요.','같은 도구와 단위로 재서, 다른 날·다른 지역의 비와 견줄 수 있어요.','숫자로 적으면 사관의 해석이 더 많이 들어가요.'],
            answer:1, hints:['「큰비」는 얼마만큼일까요? 사람마다 다르게 느낄 수 있어요.','한양의 비와 지방 고을의 비를 비교하려면 무엇이 같아야 할까요?'], why:true,
            explain:'같은 도구·같은 단위·같은 방법으로 재면 지역과 시기가 다른 비도 서로 비교할 수 있어요.'},
          {t:'tool', url:SEJONG_URL, title:'『세종실록』 측우기 기사 원문 (조선왕조실록 누리집)', text:'세종 24년 5월 8일 「호조에서 우량을 측정하는 일에 관해 아뢰다」', img:H_SEJONG.src},
          {t:'slides', from:10, to:13, title:'사료 카드 2~4'}
        ]},

      {id:'pick', phase:'활동 2', minutes:6, move:'분석',
        title:'사료 카드로 사실·해석 구별하기 ③ 사실 2 + 해석 1 + 질문 1',
        purpose:'카드 네 장에서 연습한 방법을 한 장의 카드에 스스로 적용해 보려고 해요.',
        how:['「가. 사실 / 나. 해석 / 다. 기록에 없는 정보를 찾는 질문」 예시를 확인해요.','모둠에서 사료 카드 한 장을 골라요.','사실 2개, 해석 1개, 더 필요한 정보(질문) 1개를 적어요. 해석이 없으면 「해석 없음」과 그 까닭을 적어요.'],
        outcome:'기록 하나를 사실·해석·질문으로 나눠 읽을 수 있게 돼요. 이렇게 고른 사실과 질문이 그림카드의 재료가 돼요.',
        prompt:'사실, 해석, 필요한 정보를 구별해 봅시다.',
        visual:{src:'slides/k12/s14.jpg', alt:'가. 사실, 나. 해석, 다. 기록에 없는 정보를 찾는 질문 예시', cap:'수업 슬라이드 14 · 활동지 5번'},
        teacher:{
          ask:['사료 카드 한 장을 골라 사실 2개 + 해석 1개 + 추가로 궁금한 질문 1개를 적어 볼까요?'],
          answer:['가. 오랫동안 가물었다가 억수같이 비가 내렸다(사실) / 나. 백성의 마음이 크게 기뻐하였다(기록한 사람의 해석) / 다. 강수량은 몇 mm였을까?(기록에 없는 정보를 찾는 질문)'],
          tip:['해석이 없는 카드는 「해석 없음」과 그 까닭을 적도록 안내한다(활동지 5번).'],
          link:'여기서 정리한 사실·질문을 활동3 「오늘의 실록」 그림카드에 그대로 옮겨 쓴다.'},
        blocks:[
          {t:'widget', name:'climate-form', ws:'활동지 5', opts:{key:'k12-w5form', target:'k12-w5', kind:'카드 정리', q:'사료 카드를 한 장 골라, 사실 2개 + 해석 1개 + 추가 질문 1개를 적어 봅시다.',
            fields:[
              {k:'no', label:'고른 사료 카드 번호', type:'pick', options:['1번','2번','3번','4번'], wide:true},
              {k:'f1', label:'사실 ①'}, {k:'f2', label:'사실 ②'},
              {k:'it', label:'해석 (없으면 「해석 없음」과 그 까닭)', wide:true},
              {k:'q', label:'더 필요한 정보(질문)', wide:true}],
            compose:v=>'사료 카드 ('+(v.no||'  ')+')\n사실 ①: '+(v.f1||'')+'\n사실 ②: '+(v.f2||'')+'\n해석: '+(v.it||'')+'\n더 필요한 정보(질문): '+(v.q||'')}},
          {t:'write', id:'k12-w5', ws:'활동지 5', q:'사실 2 + 해석 1 + 질문 1 (위 칸을 채우면 자동으로 들어가요)', rows:5},
          {t:'slides', from:14, to:14, title:'사실·해석·필요한 정보 구별하기'}
        ]},

      {id:'newscard', phase:'활동 3', minutes:30, move:'실천',
        title:'오늘의 실록 그림카드 만들기',
        purpose:'사실과 해석을 구별해 읽은 실록 기사를, 오늘의 날씨 뉴스처럼 다른 사람에게 정확하게 전해 보려고 해요.',
        how:['날짜·장소, 한 줄 제목, 기록에서 확인한 사실 2개, 기록에 없는 정보 1개, 당시 사람의 모습 그림, 출처를 채워요.','기록에 없는 장면을 그렸다면 「상상한 부분」이라고 표시해요.','완성한 카드를 패들렛에 올리고, 친구 카드에 근거를 더 묻는 질문을 댓글로 남겨요.'],
        outcome:'기록을 바탕으로 사실과 상상을 섞지 않고 정보를 전하는 방법을 알게 돼요. 이제 이런 기록이 미래에 어떤 자료가 되는지 정리해요.',
        prompt:'실록 기사를 오늘의 날씨 뉴스로 바꿔 봅시다.',
        visual:{src:'media/k12/s16-15.jpg', alt:'예시 그림카드: 오늘의 날씨 뉴스, 비가 얼마나 내렸을까?', cap:'예시 그림카드(PPT 16) · 출처: 이미지 생성 ChatGPT(AI로 상상해 그린 그림)'},
        teacher:{
          ask:['기록에 없는 장면을 그림으로 표현할 때는 어떻게 표시해야 할까요?','과거의 기록과 오늘의 약속은 어떻게 이어질까요?'],
          answer:['「상상한 부분」이라고 표시해서, 사실과 상상이 섞이지 않게 합니다.'],
          tip:['개인정보나 실제 인물이 드러나지 않는 범위에서 창작하도록 안내하고, 그림 표현이 어려운 학생은 문장으로 대신 표현할 수 있도록 허용한다.','게시 후 친구의 그림카드에 근거를 묻는 질문을 댓글로 하나씩 남기게 한다.'],
          link:'완성한 그림카드를 정리 단계에서 함께 감상하며 날씨와 기후의 차이로 이어 간다.'},
        blocks:[
          {t:'widget', name:'climate-form', ws:'활동지 6', opts:{key:'k12-newsform', target:'k12-w6', kind:'그림카드 만들기', q:'「오늘의 실록」 그림카드를 만들어 봅시다. (빠짐없이 채워 보세요)',
            note:'완성한 카드는 선생님이 알려 준 학급 패들렛에 올려요. 그림이 어려우면 문장으로 대신해도 괜찮아요. 개인정보나 실제 인물이 드러나지 않게 해요.',
            fields:[
              {k:'when', label:'날짜 · 장소', ph:'예: 1392년 8월 6일, 개경(당시 도읍)'},
              {k:'head', label:'날씨 사건 한 줄 제목', ph:'예: 오랜 가뭄 끝에 큰비!'},
              {k:'f1', label:'기록에서 확인한 사실 ①'},
              {k:'f2', label:'기록에서 확인한 사실 ②'},
              {k:'miss', label:'기록에 없는 정보 1개', ph:'예: 강수량은 몇 mm였을까?'},
              {k:'pic', label:'당시 사람의 모습을 보여 주는 그림(무엇을 그릴지 적어요)', type:'area', wide:true},
              {k:'imag', label:'그림에 기록에 없는 장면이 있어요 → 「상상한 부분」으로 표시하기', type:'check', wide:true},
              {k:'src', label:'출처', ph:'예: 조선왕조실록(국사편찬위원회 번역), 기상청 기상자료개방포털', wide:true}
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
          {t:'write', id:'k12-w6', ws:'활동지 6', q:'「오늘의 실록」 그림카드 내용 (위 칸을 채우면 자동으로 들어가요)', rows:8},
          {t:'write', id:'k12-w6c', ws:'활동지 6', q:'친구의 그림카드를 보고, 근거를 더 묻는 질문 하나를 댓글로 남겨 봅시다. (여기에도 적어요)', rows:1, placeholder:'예: 그날 비가 억수같이 왔다는 것은 어느 기록에서 확인했나요?'},
          {t:'slides', from:15, to:17, title:'오늘의 실록 그림카드 만들기'}
        ]},

      {id:'wrap', phase:'정리', minutes:10, move:'성찰',
        title:'오늘의 실록 그림카드 만들기 — 감상하고 정리하기',
        purpose:'친구들의 그림카드를 보며 오늘 배운 읽기 방법을 날씨와 기후의 차이로 넓혀 보려고 해요.',
        how:['모둠별 그림카드를 함께 감상하고 느낀 점을 나눠요.','「더운 하루만으로 기후변화를 말할 수 있을까?」에 주장·근거·이유로 답해요.','오늘 새롭게 알게 된 점을 출구 카드에 적어요.'],
        outcome:'한 번의 기록은 「날씨」이고, 같은 방법으로 쌓인 여러 해의 기록이 「기후」의 변화를 보여 준다는 것을 알게 돼요. 다음 시간에는 우리 반이 직접 관측 기록을 남겨요.',
        prompt:'오늘 우리가 남긴 기록은 미래에 무엇이 될까요?',
        visual:{src:'slides/k12/s19.jpg', alt:'실록의 짧은 날씨 기록은 수백 년 뒤 연구 자료가 되었다는 정리 슬라이드', cap:'수업 슬라이드 19 · 정리하기'},
        teacher:{
          ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?','더운 하루만으로 기후변화를 말할 수 있을까요?','오늘 우리가 남긴 기록은 미래에 무엇이 될까요?'],
          answer:['옛 기록도 사실과 해석을 구분해서 읽어야 한다는 것을 알게 되었습니다.','기록에 없는 정보가 무엇인지 확인하는 것이 중요하다는 것을 알게 되었습니다.'],
          tip:['모둠별 그림카드를 함께 감상하고 느낀 점을 나눈다. 날씨(짧은 시간)와 기후(오랜 기간의 평균)의 차이, 같은 방법으로 쌓은 기록이 미래의 연구 자료가 됨을 짚으며 정리한다(PPT 18~19번).','오늘 익힌 「사실과 해석 구분하기」가 다음 차시(우리 반 기후 관측)에서 관측 데이터를 읽을 때도 똑같이 적용된다는 점을 예고하며 마무리한다.'],
          link:'3~4차시 「지난 차시 돌아보기」에서 실록 기록이 연구 자료가 된 까닭을 다시 묻는다.'},
        blocks:[
          {t:'cer', id:'k12-cer', ws:'정리', q:'더운 하루만으로 기후변화를 말할 수 있을까요? 주장·근거·이유로 답해 봅시다.',
            starters:{c:'더운 하루만으로 기후변화를 말할 수 (있다 / 없다).', e:'「오늘 32℃였다」는 ___이고, 「30년 평균보다 더운 날이 늘었다」는 ___이기 때문이다.', r:'그래서 기후를 알려면 ___이(가) 필요하다.'},
            example:'말할 수 없다. 「오늘 32℃였다」는 날씨 관측이고 「30년 평균보다 더운 날이 늘었다」는 기후 경향이다. 한 번의 값은 중요하지만 결론은 아니므로 같은 방법의 긴 기록, 평년값, 여러 지점의 자료를 함께 봐야 한다. 실록 한 기사도 같은 원리로 읽어야 한다.'},
          {t:'slides', from:18, to:19, title:'정리하기 · 날씨와 기후'},
          {t:'reflect', id:'k12-exit', items:['오늘 수업을 통해 새롭게 알게 된 점','오늘 우리가 남긴 기록은 미래에 무엇이 될까요?']},
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
     공식 흐름: 지난 차시 돌아보기 → 우리 반 기후 관측하기 → 세 값 비교와 날씨·기후 구분하기 → 내일의 약속 만들기
     ===================================================================== */
  const HEAT_SRC = '환경부(현 기후에너지환경부)·기상청(2025) 「한국 기후위기 평가보고서 2025」; 기준 기간 확인: 국가기후위기적응센터 「기후변화 전망」';

  GS.lesson({
    id:'k34', theme:'climate', order:2, period:'3~4차시', periods:2,
    level:'초등', minutes:80,
    title:'관측으로 확인하는 기후변화, 내일의 약속',
    question:'우리는 기후변화를 어떻게 관측하고, 무엇을 약속할 수 있을까요?',
    goals:['관측 약속에 따라 태양-그림자를 관측할 수 있다.','같은 종류의 기온끼리 비교하여 날씨와 기후를 구분할 수 있다.','기후변화 시나리오 자료를 근거로 실천 다짐을 세울 수 있다.'],
    standards:['[6과13-01] 태양 고도·그림자 길이·기온의 관계 탐구','[6과13-02] 계절별 남중 고도와 낮 길이 관계','[6과08-03] 자원·에너지 효율적 이용 실천','※ 수학 연계: [6수04-01] 평균의 의미와 활용, [6수04-03] 자료 수집·그래프 해석'],
    prep:['준비물: PPT, 학생 워크북(관측 일지), 막대·줄자·온도계, 디지털 기기, 패들렛',
      '통풍되는 그늘이 있는 관측 장소를 미리 정하고, 막대·줄자·온도계를 모둠별로 준비한다.',
      '학교와 가까운 기상청 관측소와 패들렛 보드 접속 여부를 미리 확인한다.',
      '안전 약속(도입 10′): 운동장으로 이동할 때 질서를 지키고 막대·줄자를 휘두르지 않는다. 태양을 직접 보지 않는다(활동1 관측 전에 다시 상기). 패들렛 실천다짐카드에 얼굴 사진·실명·사는 곳 등 개인정보를 올리지 않는다.',
      '4주 기록표는 본 차시 이후 여러 주에 걸쳐 누적하는 장기 과제이므로, 본 차시에는 1회 관측 실습과 기록 방법 안내까지 진행한다.',
      '학생 사전 준비: 지난 차시에 만든 실록 그림카드를 떠올려 온다.'],
    assess:[
      {what:'관측 약속을 지켜 기록하기', how:'자기평가 체크리스트(활동지 5번)'},
      {what:'같은 종류의 기온끼리 비교하기', how:'자기평가 체크리스트(활동지 5번)'},
      {what:'데이터 근거를 넣은 실천다짐', how:'자기평가 체크리스트 · 패들렛 친구 댓글(좋은 점 1개 + 더 구체적으로 만들 질문 1개)'}],
    history:[H_SEJONG, H_LIST, H_ATLAS],
    steps:[
      {id:'recall', phase:'도입', minutes:10, move:'관찰',
        title:'지난 차시 돌아보기',
        purpose:'지난 시간에 읽은 실록의 날씨 기록과, 오늘 우리가 직접 남길 관측 기록이 어떻게 이어지는지 알려고 해요.',
        how:['실록의 짧은 날씨 기록이 오늘날 연구 자료가 될 수 있었던 까닭을 골라요.','날씨 관측 도구가 무엇을 재는지 카드를 도구 칸에 놓아요.','오늘 우리 반이 그림자와 온도계로 관측단이 된다는 것을 확인해요.'],
        outcome:'옛 기록은 특별한 날만 골라 적은 기록이라, 오늘의 관측은 같은 조건으로 이어서 재야 한다는 것을 알게 돼요. 먼저 태양과 그림자의 관계부터 살펴봐요.',
        prompt:'과거의 기록과 오늘의 관측은 어떻게 이어질까요?',
        visual:{src:H_SEJONG.src, alt:'『세종실록』 측우기 기사 화면', cap:'『세종실록』 96권 · 세종 24년(1442) 측우기 기사 · 1~2차시 '+PPT},
        teacher:{
          ask:['여러분이 알고 있는 날씨 관측 도구를 말하고, 그림자를 이용하는 도구와 구별해 봅시다.','실록의 짧은 날씨 기록이 오늘날 연구 자료가 될 수 있었던 까닭은 무엇일까요?','오늘 우리가 남긴 기록은 미래에 무엇이 될까요?'],
          answer:['날씨 관측에는 온도계·우량계·풍향계를 씁니다. 해시계는 그림자로 시간을 알아내는 도구입니다.','날짜와 함께 남긴 특별한 날씨 기록이 전해졌기 때문입니다. 다만 실록은 선택적 기록이므로 현대의 일정한 조건에 따른 연속 관측과 구별해야 합니다.'],
          tip:['안전교육: 운동장 이동 질서, 막대·줄자 휘두르지 않기, 패들렛 개인정보 올리지 않기를 함께 읽는다.','정답을 맞히는 활동이 아니라 자유롭게 떠올려 보는 활동임을 안내한다.','지난 차시의 「사실과 해석 구분하기」가 오늘의 관측 데이터 읽기에도 똑같이 적용된다는 점을 짚어 준다.','학습 문제: 태양-그림자 관측으로 날씨와 계절 변화를 기록하고, 기후변화는 긴 기록과 평년값으로 확인하며 기후 자료를 근거로 실천 다짐을 세워 봅시다.'],
          link:'「오늘은 그림자와 온도계로 우리 반만의 기후 관측을 직접 해 봅니다」로 활동1을 연다.'},
        blocks:[
          {t:'choice', id:'k34-recall', ws:'생각 열기', q:'실록의 짧은 날씨 기록이 오늘날 연구 자료가 될 수 있었던 까닭은 무엇일까요?',
            options:['날짜와 함께 남긴 특별한 날씨 기록이 오늘까지 전해졌기 때문이에요.','실록이 매일 같은 시각에 기온을 숫자로 재어 적었기 때문이에요.','사관이 모든 날의 날씨를 빠짐없이 적었기 때문이에요.'],
            answer:0, hints:['실록에 적힌 기록에는 언제나 무엇이 함께 있었나요?','실록은 매일의 기온을 숫자로 적은 기록이었나요?'],
            explain:'날짜와 함께 남긴 기록이 전해졌기 때문이에요. 다만 실록은 특별한 날만 골라 적은 <b>선택적 기록</b>이라, 정해진 조건에 따라 이어서 재는 오늘날의 <b>연속 관측</b>과는 구별해요.'},
          {t:'sort', id:'k34-tools', ws:'생각 열기', q:'날씨·기후 관측 도구는 무엇을 알려 줄까요? 설명 카드를 알맞은 도구 칸에 놓아 보세요.',
            bins:['온도계','우량계','풍향계','해시계'],
            items:[{text:'기온을 재요',bin:0},{text:'비가 내린 양을 재요',bin:1},{text:'바람의 방향을 재요',bin:2},{text:'그림자로 시간을 알아내요',bin:3}],
            explain:'온도계·우량계·풍향계는 날씨 관측 도구예요. 해시계는 그림자로 시간을 알아내는 도구로, 그림자를 보면 태양의 높이 변화도 알 수 있어요. 오늘은 막대 그림자로 태양 고도 변화를 살펴요.'},
          {t:'slides', from:3, to:4, title:'생각 열기 · 관측 도구'}
        ]},

      {id:'shadow', phase:'활동 1', minutes:8, move:'예측',
        title:'우리 반 기후 관측하기 ① 태양이 높을수록 그림자는?',
        purpose:'관측을 시작하기 전에, 우리가 잴 그림자 길이와 기온이 태양의 높이와 어떻게 이어지는지 알아야 기록을 해석할 수 있어요.',
        how:['태양 고도가 높아지면 그림자가 어떻게 될지 예측해요.','실험실에서 태양 고도를 바꿔 그림자 길이와 받는 에너지를 확인해요.','발견한 것을 O/X로 정리해요.'],
        outcome:'태양 고도↑ → 그림자↓, 받는 에너지↑ → 기온이 오르기 쉬움을 알게 돼요. 이제 이 관계를 직접 재기 위한 관측 약속을 세워요.',
        prompt:'태양이 높을수록 그림자는 어떻게 달라질까요?',
        visual:{src:'img/k34-sun-shadow.jpg', alt:'운동장에 막대를 세우는 학생들과 하늘을 가로지르는 태양의 길', cap:GEN},
        teacher:{
          ask:['태양이 높을수록 그림자는 어떻게 달라질까요?'],
          answer:['그림자 길이가 짧아집니다.'],
          tip:['태양 고도가 높아지면 그림자는 짧아지고, 받는 태양 에너지는 커져 기온이 오르기 쉬움을 설명한다. 단, 기온 최고 시각은 열 전달 시간차로 남중보다 늦게 나타남. 계절별 태양 고도·낮 길이 변화가 계절의 기온 차이를 만든다.'],
          link:'그림자 길이와 기온을 공정하게 비교하려면 무엇을 같게 할지 다음 장면에서 정한다.'},
        blocks:[
          {t:'predict', id:'k34-p-shadow', ws:'개념 확인', q:'태양 고도가 높아지면 막대 그림자의 길이는 어떻게 될까요?',
            options:['길어진다','짧아진다','변하지 않는다'],
            reveal:[
              {t:'widget', name:'climate-shadow', ws:'개념 확인', opts:{key:'k34-shadow'}},
              {t:'ox', id:'k34-sun', ws:'개념 확인', q:'실험실에서 발견한 것을 정리해요.', items:[
                {q:'태양 고도가 높아지면 그림자는 길어져요.', a:false, explain:'태양 고도가 높을수록 그림자는 짧아져요.'},
                {q:'태양 고도가 높아지면 같은 면적이 받는 태양 에너지가 많아져 기온이 오르기 쉬워요.', a:true, explain:'태양 고도↑ → 받는 에너지↑ → 기온이 오르기 쉬워요. 계절마다 태양 고도와 낮 길이가 달라져 계절의 기온도 달라져요.'},
                {q:'하루 중 기온이 가장 높은 때는 보통 태양이 가장 높이 뜬 남중 바로 그때예요.', a:false, explain:'땅이 데워지고 공기로 열이 전해지는 데 시간이 걸려, 기온 최고 시각은 남중보다 늦게 나타나요.'}]},
              {t:'slides', from:5, to:5, title:'태양 고도·그림자·기온의 관계'}
            ],
            compare:'실험 결과는 내 예측과 같았나요? 태양 고도, 그림자 길이, 기온은 어떻게 이어질까요?'}
        ]},

      {id:'log', phase:'활동 1', minutes:10, move:'판단',
        title:'우리 반 기후 관측하기 ② 관측 약속 지키며 한 번 기록하기',
        purpose:'그림자와 기온을 날짜마다 비교하려면 재는 방법이 매번 같아야 해요. 그래서 관측 약속을 먼저 정하고 한 번 재 봐요.',
        how:['공정한 비교인지 아닌지 사례를 보고 판단해요.','관측 약속(같은 장소·시각·막대·온도계·단위, 지상 약 1.5m 통풍되는 그늘)을 지키며 그림자 길이를 재고 온도·하늘을 기록해요.','기상청 같은 시각 값과 비교하고, 차이가 난 까닭을 한 문장으로 써요.'],
        outcome:'관측 약속을 지킨 1회 기록이 생겨요. 이 기록을 4주 동안 이어 가면 어떤 경향이 보일지 살펴봐요.',
        prompt:'공정하게 비교하려면 무엇을 같게 해야 할까요?',
        lead:'태양은 맨눈으로 직접 보지 않고, 막대는 수직으로 세우고, 기구 주변에서 뛰지 않아요. 못 잰 날은 빈칸 대신 「관측 못 함」이라고 적어요.',
        visual:{src:'slides/k34/s07.jpg', alt:'그림자 길이를 재고 온도·하늘을 기록하는 모습과 관측 조건', cap:'수업 슬라이드 7 · 출처: 이미지 생성 Canva AI'},
        teacher:{
          ask:['공정하게 비교하려면 무엇을 같게 해야 할까요?'],
          answer:['장소·시각·막대·온도계·단위를 같게 하고, 지면 조건과 통풍되는 그늘도 확인합니다.'],
          tip:['관측 도구 사용 시 안전 수칙(태양 직시 금지 등)을 반드시 사전 지도한다.','운동장(또는 지정 장소)에서 관측 일지 양식(날짜·시각·장소, 막대 높이·그림자 길이, 태양 고도 느낌, 기온·하늘·바람, 특이사항, 기상청 같은 시각 관측값)에 따라 1회 관측을 실습하고 활동지 1번에 기록한다.'],
          link:'오늘 잰 1회 기록이 활동지 2번 4주 기록표의 1주 칸이 된다.'},
        blocks:[
          {t:'choice', id:'k34-fair', ws:'개념 확인', q:'1주에는 햇볕 드는 운동장 바닥에서, 2주에는 그늘진 1.5m 높이에서 기온을 쟀어요. 두 값의 차이를 보고 「일주일 사이에 기온이 변했다」고 말할 수 있을까요?',
            options:['네, 같은 온도계를 썼으니 비교할 수 있어요.','아니요, 재는 장소와 높이가 달라서 공정한 비교가 아니에요.','아니요, 기온은 일주일마다 잴 수 없어요.'],
            answer:1, hints:['두 번의 관측에서 달라진 조건을 모두 찾아보세요.','관측 약속: 장소·시각·막대·기온(지상 약 1.5m 그늘, 같은 온도계)·단위를 같게 해요.'], why:true,
            explain:'알고 싶은 것(날짜에 따른 변화) 말고 나머지 조건을 모두 같게 해야 공정하게 비교할 수 있어요.'},
          {t:'widget', name:'climate-form', ws:'활동지 1', opts:{key:'k34-logform', target:'k34-w1', kind:'관측 일지', q:'관측 약속을 지키며, 오늘 한 번의 관측 결과를 기록해 봅시다.',
            note:'관측 순서: ① 그림자 길이 재기 ② 온도·하늘 기록하기. 기상청 같은 시각 값은 선생님과 함께 기상청 날씨누리·기상자료개방포털에서 관측소, 날짜·시각을 확인해 찾아요.',
            fields:[
              {k:'date', label:'날짜'}, {k:'time', label:'시각'}, {k:'place', label:'장소'},
              {k:'sky', label:'날씨(하늘)', type:'pick', options:['맑음','구름','비','눈']},
              {k:'stick', label:'막대 높이', type:'num', unit:'cm'}, {k:'shadow', label:'그림자 길이', type:'num', unit:'cm'},
              {k:'sun', label:'태양 고도 느낌', type:'pick', options:['낮음','보통','높음']},
              {k:'temp', label:'기온', type:'num', unit:'℃'},
              {k:'wind', label:'바람', type:'pick', options:['약함','보통','강함']},
              {k:'kma', label:'기상청 같은 시각 값', type:'num', unit:'℃'},
              {k:'note', label:'특이사항', wide:true}
            ],
            check:v=>{ const a = num(v.temp), b = num(v.kma); if(a==null || b==null) return null; const d = r1(a-b); return {ok:null, msg:'우리 값 − 기상청 값 = <b class="num">'+d+'℃</b>. 아래 칸에 차이가 난 까닭을 한 문장으로 써 봐요.'}; },
            checkHint:'기온과 기상청 값을 모두 넣으면 차이를 계산해 줘요.'}},
          {t:'write', id:'k34-w1', ws:'활동지 1', q:'오늘의 1회 관측 기록 (위 칸을 채우면 자동으로 들어가요)', rows:6},
          {t:'write', id:'k34-w1why', ws:'활동지 1', q:'우리가 관측한 값과 기상청 값의 차이가 난 까닭을 한 문장으로 써 봅시다.', rows:2,
            placeholder:'예: 우리는 햇볕이 드는 ○○에서 재고, 기상청은 …에서 재기 때문이에요.'},
          {t:'slides', from:6, to:8, title:'관측 약속과 1회 관측 기록'}
        ]},

      {id:'week4', phase:'활동 1', minutes:7, move:'분석',
        title:'우리 반 기후 관측하기 ③ 4주 기록과 꺾은선그래프',
        purpose:'한 번의 관측으로는 변화를 알 수 없어요. 같은 방법으로 쌓은 기록이 어떤 경향을 보이는지 그래프로 확인하려고 해요.',
        how:['4주 동안 같은 요일·같은 시각에 잰 날짜·그림자·기온·하늘·특이사항을 표에 적어요(오늘은 1주 칸).','가로축은 관측 날짜, 세로축은 기온 또는 그림자 길이로 꺾은선그래프를 그려요.','가장 크게 변한 구간에 ★ 표시하고 「증가/감소」와 근거 수치를 써요.'],
        outcome:'4주 동안의 변화는 계절 변화이고, 기후를 알려면 몇십 년의 기록이 필요하다는 것을 알게 돼요. 그래서 다음 활동에서 30년 평년값과 비교해요.',
        prompt:'기록이 쌓이면 어떤 경향이 보일까요?',
        visual:{src:'media/k34/s09-06.jpg', alt:'주간 관측 기록표와 꺾은선그래프 그리기 활동지', cap:'수업 슬라이드 9 · 활동지 2번 · 출처: 이미지 생성 ChatGPT'},
        teacher:{
          ask:['기록이 쌓이면 어떤 경향이 보일까요?'],
          tip:['이후 4주간 매주 같은 요일·시각에 관측을 이어 가며 기록표를 작성하고 꺾은선그래프로 나타내는 방법을 안내한다(가로축: 날짜, 세로축: 기온 또는 그림자 길이, 가장 큰 변화 표시).','4주 동안의 변화는 기후변화가 아니라 계절 변화이며, 기후를 알려면 몇십 년의 기록이 필요함을 함께 안내한다.'],
          link:'몇십 년의 기록이 필요하다는 생각을 활동2의 「30년 평년값」으로 잇는다.'},
        blocks:[
          {t:'widget', name:'climate-4week', ws:'활동지 2', opts:{key:'k34-4wk', target:'k34-w2', kind:'주간 관측 기록'}},
          {t:'write', id:'k34-w2', ws:'활동지 2', q:'4주 관측 기록표 (위 표를 채우면 자동으로 들어가요)', rows:6},
          {t:'write', id:'k34-w2s', ws:'활동지 2', q:'가장 크게 변한 구간에 ★ 표시하고 문장을 완성해 봅시다. 「___주에서 ___주 사이, (기온/그림자 길이)가 ___에서 ___로 ___ 증가/감소했어요.」', rows:2,
            placeholder:'예: 1주에서 2주 사이, 그림자 길이가 …cm에서 …cm로 …cm 감소했어요.'},
          {t:'callout', tone:'key', title:'잊지 말아요', text:'4주 동안의 변화는 <b>계절 변화</b>예요. 기후를 알려면 몇십 년의 기록이 필요해요.'},
          {t:'slides', from:9, to:9, title:'주간 관측 기록 & 그래프 그리기'}
        ]},

      {id:'three', phase:'활동 2', minutes:8, move:'설명',
        title:'세 값 비교와 날씨·기후 구분하기 ① 세 값은 왜 다를까?',
        purpose:'우리 관측값이 기상청 값, 30년 평년값과 다르다면 그 차이가 무엇 때문인지 설명할 수 있어야 기록을 바르게 읽을 수 있어요.',
        how:['① 우리 관측값과 ② 기상청의 같은 날짜·같은 시각 기온을 비교해요.','기상청의 그날 일최고기온과 ③ 같은 관측소·같은 날짜의 평년 일최고기온(1991~2020년 평균)을 비교해요.','차이가 난 까닭(장소·그늘·지면·시각·도구)을 골라 주장·근거·이유로 설명해요.'],
        outcome:'같은 종류의 기온끼리 비교해야 하고, 차이는 실수가 아니라 탐구의 시작일 수 있다는 것을 알게 돼요. 이제 「하루의 값」과 「긴 기간의 평균」을 구분해 봐요.',
        prompt:'우리가 관측한 값과 기상청 값이 다른 이유는 무엇일까요?',
        visual:{src:'slides/k34/s10.jpg', alt:'우리 관측값, 기상청 관측값, 30년 평년값 설명', cap:'수업 슬라이드 10 · 활동지 3번'},
        teacher:{
          ask:['우리의 값과 기상청 값이 다르다면 그 까닭은 무엇일까요?'],
          answer:['관측 장소, 그늘 유무, 지면 상태, 시각, 도구 차이 등이 원인이 될 수 있습니다.'],
          tip:['순간 관측값을 일최고기온으로 여기지 않도록 하고, 하루의 차이만으로 기후변화를 단정하지 않는다.','기상청 날씨누리·기상자료개방포털에서 관측소, 자료 종류, 날짜·시각, 조회일을 확인해 기록한다.'],
          link:'세 값 비교에서 「평년값 = 오랜 기간의 평균」을 확인한 뒤 날씨·기후 구분 문항으로 넘어간다.'},
        blocks:[
          {t:'widget', name:'climate-three', ws:'활동지 3', opts:{key:'k34-three', target:'k34-w3', kind:'세 값 비교'}},
          {t:'write', id:'k34-w3', ws:'활동지 3', q:'세 값 비교표 (위 칸을 채우면 자동으로 들어가요)', rows:5},
          {t:'cer', id:'k34-cer', ws:'활동지 3', q:'차이가 난 까닭(장소·그늘·시각·도구)을 주장·근거·이유로 설명해 봅시다.',
            starters:{c:'우리 값과 기상청 값이 다른 까닭은 ___ 때문이라고 생각한다.', e:'우리 값은 ___℃, 기상청 값은 ___℃였다. 우리는 ___(장소·그늘·지면)에서 ___에 쟀다.', r:'장소·그늘·지면·시각·도구가 다르면 ___ 때문이다.'},
            example:'우리 값이 더 높은 까닭은 햇볕이 드는 바닥 가까이에서 쟀기 때문이라고 생각한다. 우리 값이 기상청 값보다 높았고, 우리는 햇볕 드는 운동장에서 쟀다. 기상청은 정해진 관측 환경과 장비로 재지만, 우리는 학교의 특정 장소에서 쟀으므로 지면과 햇볕의 영향을 더 받을 수 있다.'},
          {t:'slides', from:10, to:10, title:'세 값 비교'}
        ]},

      {id:'weather', phase:'활동 2', minutes:7, move:'판단',
        title:'세 값 비교와 날씨·기후 구분하기 ② 날씨일까, 기후일까?',
        purpose:'하루의 관측값과 긴 기간의 평균을 구분해야 「기후변화」를 바르게 말할 수 있어요.',
        how:['날씨(짧은 시간의 대기 상태)와 기후(한 지역에서 오랫동안 나타난 날씨의 평균과 범위)의 뜻을 읽어요.','두 문장을 날씨 관측과 기후 경향으로 나눠요.','「더운 하루만으로 기후변화라고 말할 수 있다」에 O/X로 답해요.'],
        outcome:'한 번의 값만으로는 결론을 내릴 수 없고, 같은 방법의 긴 기록·평년값·여러 지점의 자료를 함께 봐야 한다는 것을 알게 돼요. 그래서 다음에는 긴 기간의 미래 전망 자료를 찾아봐요.',
        prompt:'더운 하루만으로 기후변화를 말할 수 있을까요?',
        lead:'<b>날씨</b>는 오늘·이번 주처럼 짧은 시간의 대기 상태, <b>기후</b>는 한 지역에서 오랫동안 나타난 날씨의 평균과 범위예요.',
        visual:{src:'img/k12-weather.jpg', alt:'달력 한 장과 멀리 이어진 긴 달력 띠', cap:GEN},
        teacher:{
          ask:['오늘 하루 더웠다고 기후변화라고 말할 수 있을까요?'],
          answer:['한 번의 값만으로는 결론을 내릴 수 없고, 같은 방법의 긴 기록과 평년값, 여러 지점의 자료를 함께 봐야 합니다.'],
          tip:['1~2차시에서 읽은 실록 기사도 같은 원리(한 기록만으로 단정하지 않기)로 읽어야 함을 연결 지어 정리한다.','짧은 복습으로 운영하되, 지난 차시의 「사실·해석 구분」과 「같은 종류의 기온 비교」가 같은 비판적 사고 방식임을 학생들이 스스로 연결하도록 돕는다.'],
          link:'「긴 기간의 자료」가 필요하다는 결론을 활동3 기후변화 상황지도·폭염일수 전망으로 잇는다.'},
        blocks:[
          {t:'sort', id:'k34-wc1', ws:'활동지 3', q:'1)·2) 문장이 그날의 날씨인지, 오랜 기간의 기후인지 알맞은 칸에 놓아 보세요.',
            bins:['날씨 관측','기후 경향'],
            items:[{text:'1) 「오늘 32℃였다.」',bin:0},{text:'2) 「30년 평균보다 더운 날이 늘었다.」',bin:1}],
            explain:'하루의 관측값은 날씨, 오랜 기간의 평균과 비교한 것은 기후 경향이에요.'},
          {t:'ox', id:'k34-wc2', ws:'활동지 3', q:'3) 알맞은 것에 ○ 표시해 봅시다.', items:[
            {q:'더운 하루만으로 기후변화라고 말할 수 있어요.', a:false, explain:'한 번의 값은 중요하지만 결론은 아니에요. 같은 방법의 긴 기록, 평년값, 여러 지점의 자료를 함께 봐야 해요. 실록 한 기사도 같은 원리로 읽어요.'}]},
          {t:'slides', from:11, to:11, title:'날씨와 기후 구분하기'}
        ]},

      {id:'atlas', phase:'활동 3', minutes:8, move:'관찰',
        title:'내일의 약속 만들기 ① 기후변화 상황지도에서 우리 동네 찾기',
        purpose:'기후는 긴 기간의 자료로 봐야 하니, 우리 동네의 기후가 앞으로 어떻게 변할지 공식 자료에서 찾아보려고 해요.',
        how:['기후변화 상황지도에서 지역을 읍·면·동까지 선택해요.','현재와 21세기 후반을 비교하고, 평균기온·폭염일수 중 하나를 골라요.','저탄소 미래와 고탄소 미래를 각각 확인하고, 화면의 단위·기간·범례(색이 뜻하는 값)를 먼저 읽어요.','「우리 동네의 ___은/는 ___에서 ___(으)로 변한다」 문장을 완성해요.'],
        outcome:'우리 동네의 미래 기후 값이 시나리오에 따라 달라진다는 것을 알게 돼요. 이제 한반도 전체의 폭염일수 전망을 비교해 봐요.',
        prompt:'지도의 색이 다르면 무엇이 달라지는 걸까요?',
        visual:{src:H_ATLAS.src, alt:'기후변화 상황지도 화면', cap:'수업 슬라이드 14 · 출처: https://climate.go.kr/atlas/dsh/ccf'},
        teacher:{
          ask:['기후변화 상황지도에서 무엇을 비교할까요?','지도의 색이 다르면 무엇이 달라지는 걸까요?'],
          tip:['검색 방법: 읍·면·동 선택 → 현재와 21세기 후반 비교 → 평균기온·폭염일수 중 선택 → 저탄소·고탄소 시나리오 비교 → 단위·기간·범례 확인.','상황지도에서 찾은 우리 동네 값과 보고서의 전국 평균 폭염일수 표는 공간 범위와 출처가 다름을 구별한다.'],
          link:'우리 동네 값을 찾은 뒤 다음 장면에서 한반도 평균 폭염일수 표를 채운다.'},
        blocks:[
          {t:'tool', url:ATLAS_URL, title:'기후변화 상황지도 (기상청 기후정보포털)', text:'읍·면·동 선택 → 현재와 21세기 후반 → 평균기온·폭염일수 → 저탄소·고탄소 미래 → 단위·기간·범례 확인', img:H_ATLAS.src},
          {t:'write', id:'k34-w4', ws:'활동지 4', q:'기후변화 상황지도(climate.go.kr/atlas)에서 우리 동네의 미래를 찾아 문장을 완성해 봅시다.', rows:2,
            placeholder:'우리 동네의 (평균기온 또는 폭염일수)은/는 (현재 값)에서 (21세기 후반 값)(으)로 변한다. (시나리오: 저탄소/고탄소)'},
          {t:'slides', from:12, to:14, title:'기후변화 상황지도 읽기'}
        ]},

      {id:'heat', phase:'활동 3', minutes:9, move:'예측',
        title:'내일의 약속 만들기 ② 폭염일수, 두 갈래 미래',
        purpose:'우리의 선택에 따라 미래가 얼마나 달라지는지 숫자로 확인해야 근거 있는 약속을 세울 수 있어요.',
        how:['고탄소 미래(2081~2100년)의 한반도 1년 폭염일수를 먼저 예측해요.','365칸 달력 버튼을 눌러 기준 기간·최근 10년·저탄소·고탄소 미래를 비교해요.','표를 채우고 두 미래의 차이를 계산해요.'],
        outcome:'온실가스를 얼마나 줄이느냐에 따라 폭염일수가 약 55일이나 달라질 수 있다는 것을 알게 돼요. 이 수치가 내 실천 다짐의 근거가 돼요.',
        prompt:'우리의 선택이 미래 폭염일수를 바꿀 수 있을까요?',
        lead:'폭염일은 하루 최고기온이 33℃ 이상인 날이에요. 기준 기간(2000~2019년) 한반도 평균은 1년에 8.8일이었어요.',
        visual:{src:'img/k34-two-futures.jpg', alt:'두 갈래로 갈라진 길 앞에 선 아이: 시원한 숲과 뜨겁고 메마른 땅', cap:GEN},
        teacher:{
          ask:['우리의 선택이 미래의 폭염일수를 바꿀 수 있을까요?'],
          answer:['온실가스를 줄이려는 노력에 따라 미래의 폭염일수가 크게 달라질 수 있습니다.'],
          tip:['전국 평균 폭염일수: 기준기간(2000~2019년) 연평균 8.8일, 최근 10년(2015~2024) 평균 15.6일 → 2081~2100년 저탄소 SSP1-2.6 24.2일, 고탄소 SSP5-8.5 79.5일, 두 미래의 차이 55.3일. 출처: '+HEAT_SRC,'시나리오는 「정해진 미래」가 아니라 온실가스 감축 정도에 따라 달라지는 가능한 미래임을 설명하고, 시나리오 수치를 「반드시 일어날 미래」로 단정하지 않도록 유의한다.'],
          link:'두 미래의 차이(55.3일)를 실천다짐카드의 「나의 근거」에 옮겨 적는다.'},
        blocks:[
          {t:'predict', id:'k34-p-heat', ws:'활동지 4', q:'온실가스를 계속 많이 내보내면(고탄소 미래), 2081~2100년 한반도의 1년 폭염일수는 며칠쯤일까요?',
            options:['약 10일 — 지금과 비슷해요','약 25일','약 50일','약 80일'],
            reveal:[
              {t:'widget', name:'climate-heat-calendar', ws:'활동지 4', opts:{key:'k34-cal', low:2, high:3, src:HEAT_SRC, scen:[
                {label:'기준 기간', days:8.8, note:'2000~2019년 평균'},
                {label:'최근 10년', days:15.6, note:'2015~2024년 평균'},
                {label:'저탄소 미래', days:24.2, note:'2081~2100년 · 온실가스를 많이 줄이면'},
                {label:'고탄소 미래', days:79.5, note:'2081~2100년 · 온실가스를 계속 많이 내보내면'}]}},
              {t:'tablefill', id:'k34-w4t', ws:'활동지 4', q:'달력 버튼을 눌러 보며 한반도 평균 1년 폭염일수(하루 최고기온 33℃ 이상인 날) 표를 채워 봅시다.',
                head:['구분','일 수'],
                rows:[['기준 기간 평균 / 최근 10년 평균','8.8일 / 15.6일'],['온실가스를 많이 줄이면 (저탄소 미래, 2081~2100년)','?24.2|24'],['온실가스를 계속 많이 내보내면 (고탄소 미래, 2081~2100년)','?79.5|80'],['두 미래의 차이','?55.3|55']],
                explain:'두 미래의 차이 = 79.5 − 24.2 = 55.3일이에요. 미래는 정해져 있지 않아요. 시나리오는 우리가 어떻게 하느냐에 따라 달라지는 <b>가능한 미래</b>예요.'},
              {t:'slides', from:15, to:15, title:'우리의 선택이 미래 폭염일수를 바꿀 수 있을까요?'}
            ],
            compare:'내 예측과 실제 전망은 얼마나 달랐나요? 두 미래의 차이를 만드는 것은 무엇일까요?'}
        ]},

      {id:'pledge', phase:'활동 3', minutes:8, move:'실천',
        title:'내일의 약속 만들기 ③ 근거 있는 실천 다짐',
        purpose:'두 미래의 폭염일수 차이를 근거로, 막연한 다짐이 아니라 확인할 수 있는 다짐을 세우려고 해요.',
        how:['막연한 다짐과 구체적인 다짐(구체적 행동 + 횟수/기간 + 확인 방법)을 비교해요.','나의 근거(미래 1·미래 2의 폭염일수와 차이)를 적어요.','「나는 ___ 동안, ___을/를 ___회 실천하고, ___(으)로 확인하겠다」를 완성해 패들렛에 올려요.'],
        outcome:'데이터 근거가 담긴 나만의 실천 다짐이 완성돼요. 마지막으로 오늘의 기록을 스스로 점검해요.',
        prompt:'근거가 있는 실천 다짐은 어떻게 만들까요?',
        lead:'막연한 다짐 「전기를 아끼겠다」 → 바꾼 다짐 「4주 동안 사용하지 않는 교실 조명을 매일 점심시간에 확인하고 기록하겠다」',
        visual:{src:'media/k34/s17-08.jpg', alt:'나의 근거, 나의 다짐, 오늘의 자기평가 카드', cap:'수업 슬라이드 17 · 활동지 5번 · 출처: 이미지 생성 ChatGPT'},
        teacher:{
          ask:['근거가 있는 실천 다짐은 어떻게 만들까요?'],
          tip:['「막연한 다짐」과 「구체적 행동+횟수/기간+확인 방법이 담긴 다짐」을 비교 예시로 보여 주고, 데이터 근거를 담아 나만의 실천 다짐을 활동지 5번에 작성하게 한다.','패들렛에 실천다짐카드(근거·행동·확인)를 게시하고, 친구 다짐에 「좋은 점 1개 + 더 구체적으로 만들 질문 1개」를 댓글로 남기게 한다.','개인정보가 드러나는 사진이나 위치는 올리지 않도록 사전에 안내한다.'],
          link:'다짐을 올린 뒤 정리 단계에서 자기평가 체크리스트로 점검한다.'},
        blocks:[
          {t:'widget', name:'climate-form', ws:'활동지 5', opts:{key:'k34-pledgeform', target:'k34-w5', kind:'실천다짐카드', q:'위의 데이터를 근거로, 나만의 실천 다짐을 만들어 봅시다.',
            note:'완성한 실천다짐카드(근거·행동·확인)는 패들렛에 올리고, 친구 다짐에 「좋은 점 1개 + 더 구체적으로 만들 질문 1개」를 댓글로 달아요. 개인정보가 드러나는 사진이나 위치는 올리지 않아요.',
            fields:[
              {k:'f1', label:'① 나의 근거: 미래 1 (저탄소 미래) 폭염일수', type:'num', unit:'일'},
              {k:'f2', label:'미래 2 (고탄소 미래) 폭염일수', type:'num', unit:'일'},
              {k:'gap', label:'두 미래의 폭염일수 차이', type:'num', unit:'일', wide:true},
              {k:'period', label:'② 나의 다짐: 기간', ph:'예: 4주'},
              {k:'act', label:'구체적 행동', ph:'예: 쓰지 않는 교실 조명 끄기'},
              {k:'times', label:'횟수', ph:'예: 매일 1'},
              {k:'how', label:'확인 방법', ph:'예: 기록표'}
            ],
            compose:v=>'나의 근거: 미래 1 '+(v.f1||'___')+'일, 미래 2 '+(v.f2||'___')+'일 → 두 미래의 폭염일수 차이는 '+(v.gap||'___')+'일이다.\n나의 다짐: 나는 '+(v.period||'___')+' 동안, '+(v.act||'___')+'을/를 '+(v.times||'___')+'회 실천하고, '+(v.how||'___')+'(으)로 확인하겠다.',
            check:v=>{ const g = num(v.gap); if(g==null) return null; return (Math.abs(g-55.3)<0.06 || g===55) ? {ok:true, msg:'근거 수치가 맞아요. 79.5 − 24.2 = 55.3일'} : {ok:false, msg:'두 미래의 차이를 다시 계산해 볼까요? (고탄소 미래 − 저탄소 미래)'}; },
            preview:(v,e)=>'<div style="border-left:5px solid var(--th);background:var(--th-soft);border-radius:8px;padding:12px 14px;line-height:1.7">'
              +'<div class="src">① 나의 근거</div><div>미래 1 <b>'+(e(v.f1)||'___')+'일</b> · 미래 2 <b>'+(e(v.f2)||'___')+'일</b> → 두 미래의 폭염일수 차이는 <b>'+(e(v.gap)||'___')+'일</b>이다.</div>'
              +'<div class="src" style="margin-top:6px">② 나의 다짐</div><div>나는 <b>'+(e(v.period)||'___')+'</b> 동안, <b>'+(e(v.act)||'___')+'</b>을/를 <b>'+(e(v.times)||'___')+'회</b> 실천하고, <b>'+(e(v.how)||'___')+'</b>(으)로 확인하겠다.</div></div>'}},
          {t:'write', id:'k34-w5', ws:'활동지 5', q:'나의 근거와 실천 다짐 (위 칸을 채우면 자동으로 들어가요)', rows:3},
          {t:'slides', from:16, to:17, title:'근거가 있는 실천다짐 만들기'}
        ]},

      {id:'wrap', phase:'정리', minutes:5, move:'성찰',
        title:'내일의 약속 만들기 — 과거·오늘·미래 잇기',
        purpose:'오늘 한 관측·비교·다짐을 스스로 점검하고, 과거의 기록과 오늘의 약속이 어떻게 이어지는지 정리하려고 해요.',
        how:['자기평가 체크리스트 3가지를 스스로 점검해요.','「좋은 기록은 ___.」 문장을 완성해요.','출구 카드에 오늘 새롭게 알게 된 점을 적어요.'],
        outcome:'과거(실록)는 날씨와 사람들의 대응을 남겼고, 오늘 우리는 같은 방법으로 관측·비교하며, 미래는 더 나은 선택을 약속한다는 흐름을 정리해요.',
        prompt:'과거의 기록과 오늘의 약속은 어떻게 이어질까요?',
        visual:{src:'slides/k34/s18.jpg', alt:'과거·오늘·미래와 자기평가, 오늘의 마지막 한 줄', cap:'수업 슬라이드 18 · 활동지 5번'},
        teacher:{
          ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?','「좋은 기록은 ___.」'],
          answer:['같은 종류의 기온끼리 비교해야 한다는 것을 알게 되었습니다.','데이터 근거가 있으면 더 구체적인 다짐을 세울 수 있다는 것을 알게 되었습니다.'],
          tip:['자기평가 체크리스트(관측 약속을 지켜 기록하기, 같은 종류의 기온끼리 비교하기, 데이터 근거를 넣은 실천다짐)로 스스로 점검한다.','과거(실록)·오늘(관측)·미래(약속)가 하나의 흐름으로 이어진다는 점을 다시 한번 정리하도록 돕는다.'],
          link:'5~7차시에서는 역사 속 기후 재난 기록과 현대 공공데이터를 함께 분석한다.'},
        blocks:[
          {t:'widget', name:'climate-form', ws:'활동지 5', opts:{key:'k34-selfform', target:'k34-w5e', kind:'오늘의 자기평가', q:'③ 오늘의 자기평가와 오늘의 마지막 한 줄',
            fields:[
              {k:'a', label:'관측 약속을 지켜 기록했다.', type:'check', wide:true},
              {k:'b', label:'관측값과 평년값의 차이를 설명할 수 있다.', type:'check', wide:true},
              {k:'c', label:'데이터 근거를 넣어 다짐을 만들었다.', type:'check', wide:true},
              {k:'line', label:'오늘의 마지막 한 줄: 「좋은 기록은 ___.」', ph:'예: 같은 방법으로 빠짐없이 쌓은 기록이다', wide:true}],
            compose:v=>'자기평가 — 관측 약속을 지켜 기록했다: '+(v.a?'☑':'☐')+' / 관측값과 평년값의 차이를 설명할 수 있다: '+(v.b?'☑':'☐')+' / 데이터 근거를 넣어 다짐을 만들었다: '+(v.c?'☑':'☐')+'\n오늘의 마지막 한 줄: 좋은 기록은 '+(v.line||'___')+'.'}},
          {t:'write', id:'k34-w5e', ws:'활동지 5', q:'자기평가와 오늘의 마지막 한 줄 (위 칸을 채우면 자동으로 들어가요)', rows:3},
          {t:'reflect', id:'k34-exit', items:['오늘 수업을 통해 새롭게 알게 된 점','관측값과 평년값의 차이를 친구에게 어떻게 설명할까요?']},
          {t:'slides', from:18, to:18, title:'과거의 기록과 오늘의 약속'},
          {t:'more', title:'더 나아가기', items:[
            {img:'slides/k34/s14.jpg', tag:'도구', title:'기후변화 상황지도', text:'우리 동네의 평균기온·폭염일수를 저탄소·고탄소 미래로 비교해 봐요.', url:ATLAS_URL},
            {img:'img/k34-more-report.jpg', tag:'자료', title:'한국 기후위기 평가보고서 2025', text:'오늘 본 폭염일수 전망이 실린 기상청 보도자료예요(PPT 15 출처).', url:KMA_PRESS},
            {img:'img/k34-more-observe.jpg', tag:'도전', title:'4주 관측 이어 가기', text:'같은 요일·같은 시각에 재고, 그래프에서 가장 크게 변한 구간을 찾아요.'},
            {img:'img/k34-more-pledge.jpg', tag:'실천', title:'다짐 확인 기록표', text:'4주 동안 내 다짐을 지켰는지 기록표로 확인하고 친구와 나눠요.'}
          ]}
        ]}
    ]
  });

  /* =====================================================================
     5~7차시 (중고등) 역사적 성찰과 데이터 분석을 통해 그린(Green) 미래
     공식 흐름: 17세기 기온 변화와 기근 그래프 살펴보기 → 역사 속 기후 변화 사례 탐구 → 기후 변화 데이터 분석 → 미래 세대 기후 생태 협약 제안
     시간: 중학교 135분 기준(각 활동 40′). 고등학교 150분은 각 활동 45′.
     ===================================================================== */
  const SRC1 = '8세기 후반~10세기 초, 신라 하대에는 유독 가뭄과 흉년의 기록이 집중되었으며, 백성들이 초적(도적)이 되어 봉기하는 등 정치적 붕괴로 이어졌다. 고려 말 역시 이상 저온과 수해로 인해 농업 생산량이 급감하며 사회적 혼란이 극에 달했다.';
  const KS_DEF = '17세기 북반구를 중심으로 한랭이 두드러졌던 소빙기에 냉해·가뭄·우박·전염병·우역이 겹쳐, 조선 현종 11년(1670년)부터 현종 12년(1671년)까지 2년간 기후 이상으로 이어진 대기근으로, 1670년인 경술년, 1671년인 신해년의 앞 글자를 따서 경신대기근이라고 부른다.';

  GS.lesson({
    id:'k57', theme:'climate', order:3, period:'5~7차시', periods:3,
    level:'중고등', minutes:135,
    title:'역사적 성찰과 데이터 분석을 통해 그린(Green) 미래',
    question:'기후 위기 극복을 위해 우리가 할 수 있는 일은 무엇일까요?',
    goals:['역사 속 기후 재난 기록을 분석하여 기후 변동이 사회 시스템에 미친 구조적 영향을 설명할 수 있다.','조선왕조실록 기록과 기상청 공공데이터를 시각화하여 기후 위기의 시사점을 제시할 수 있다.','국제 기후 협약을 분석하여 미래세대의 안전을 보호하는 새로운 기후 협약안을 제안할 수 있다.'],
    standards:['[9역12-03] 조선 후기 사회적 모순에 대한 여러 세력의 대응을 탐구한다.','[9역13-04] 지속가능한 사회를 위한 과제를 역사적 맥락에서 탐구하고, 과제 해결에 참여하는 자세를 갖는다.','[9사(지리)08-02] 우리나라의 계절별, 지역별 기후 특성 및 변화 양상을 파악하고, 기후변화에 대한 지역별 대응 노력을 조사한다.','[9과17-01] 지구 대기권을 4개 권역으로 구분하며, 온실효과와 지구온난화를 복사 평형의 관점으로 설명할 수 있다.','[10한사1-01-04] 조선 후기에 등장한 새로운 변화 양상을 이해한다.','[10한사1-02-05] 근대 이전 한국사 주제를 설정하여 탐구하고, 그 결과를 다양한 방법으로 표현한다.','[12정02-04] 빅데이터 분석 도구를 활용하여 데이터를 시각화하고 그 의미와 가치를 해석한다.','[12세사04-03] 현대 세계의 과제를 해결하기 위해 인류가 기울여온 노력을 탐구한다.'],
    prep:['준비물: PPT, 학생 워크북, 디지털 기기, 실록 자료 QR 코드, 캔바 템플릿, 패들렛',
      '4인 1모둠으로 편성하고 디지털 기기 충전 상태와 캔바 템플릿·패들렛 링크를 미리 점검한다.',
      '실록 QR 코드가 해당 기사로 연결되는지, 기상청 기후 데이터 사이트 접속이 원활한지 미리 확인한다.',
      '안전 약속(도입 5′): QR 코드는 교사가 제공한 것만 스캔하고, 수업과 관련 없는 사이트에 접속하지 않는다. 캔바·패들렛 게시물에 얼굴 사진·실명·학번 등 개인정보를 올리지 않는다(활동2 인포그래픽 제작 전에 다시 상기).',
      '학생 사전 준비: 최근 겪은 폭염·폭우 등 이상기후 사례를 떠올려 온다.',
      '시간: 중학교 135분(활동별 40′) / 고등학교 150분(활동별 45′). 고등학교 교육과정 기준으로 개발했으며, 재구성하여 중학교에서 활용할 수 있다.'],
    assess:[
      {what:'다른 모둠의 21세기 기후 적응 정책, 기후 변화 데이터 분석 인포그래픽, 미래 세대 기후 생태 협약문을 감상하고 느낀 점 공유(정리)', how:'패들렛 모둠 결과물 상호 감상'},
      {what:'인포그래픽: 디자인을 꾸미기보다 데이터 수치를 객관적으로 전달하는가(활동2)', how:'교사 관찰 · 결과물(워크북 2쪽, 캔바)'},
      {what:'협약문: 추상적인 내용에 머무르지 않는가(활동3)', how:'교사 관찰 · 결과물(워크북 3쪽, 캔바)'}],
    history:[H_GRAPH, H_LIST, H_PORTAL],
    steps:[
      {id:'graph', phase:'도입', minutes:5, move:'관찰',
        title:'17세기 기온 변화와 기근 그래프 살펴보기',
        purpose:'기후 문제가 사회의 혼란과 관련이 있는지, 17세기 실제 기온 자료와 기근 시기를 겹쳐 보며 오늘의 질문을 세우려고 해요.',
        how:['그래프 아래쪽 막대(북반구 여름 기온, 0보다 아래면 평소보다 낮음)를 읽어요.','위쪽 색 띠(조선·중국·일본의 주요 기근 시기)가 언제인지 찾아요.','기근이 발생한 시기의 공통점을 골라요.'],
        outcome:'동아시아의 기근은 비슷한 시기에 겹쳐 일어났고, 그 무렵 여름 기온이 낮았다는 것을 알게 돼요. 이제 역사 기록 속에서 기후와 사회 혼란이 어떻게 이어졌는지 사례를 살펴봐요.',
        prompt:'과거 동아시아에서 기근이 발생한 시기에는 어떤 공통점이 있나요?',
        visual:{src:H_GRAPH.src, alt:'17세기 북반구 여름 기온 변화 막대그래프와 조선·중국·일본의 주요 기근 시기(경신대기근, 을병대기근 표시)', cap:'17세기 북반구의 여름 기온 변화(Global Crisis, 2013) · 동아출판 한국사1 교과서 자료 인용 · '+PPT},
        teacher:{
          ask:['(그래프를 가리키며) 과거 동아시아에서 기근이 발생한 시기에는 어떤 공통점이 있나요?'],
          answer:['모두 비슷한 시기에 발생했어요.'],
          tip:['안전교육: 교사가 제공한 QR만 스캔, 관련 없는 사이트 접속 금지, 캔바·패들렛 개인정보 금지를 함께 읽는다.','학생들이 스스로 그래프를 분석할 수 있도록 허용적인 분위기를 조성한다.','학습 문제: 기후 위기가 사회 시스템에 미치는 영향을 파악하고 새로운 기후 협약문을 제시하며 우리 사회가 해야 할 역할을 고민해 봅시다.'],
          link:'「기후 문제와 사회적 혼란의 연관성」을 활동1에서 신라 하대·고려 말·경신대기근 사료로 확인한다.'},
        blocks:[
          {t:'choice', id:'k57-graph', ws:'생각 열기', q:'그래프에서 찾은 공통점으로 가장 알맞은 것은?',
            options:['조선·중국·일본의 기근이 비슷한 시기에 겹쳐 일어났고, 그 무렵 북반구 여름 기온이 평소보다 낮았다.','기근이 든 시기에는 북반구 여름 기온이 평소보다 높았다.','세 나라의 기근은 서로 다른 시기에 따로따로 일어났다.'],
            answer:0, hints:['색 띠가 모여 있는 시기(1640년대, 1670년 무렵, 1690년대)를 찾아보세요.','그 시기 아래 막대는 0보다 위에 있나요, 아래에 있나요?'], why:true,
            explain:'기근 시기가 겹치는 무렵, 북반구 여름 기온 막대가 0보다 아래(평소보다 낮음)로 길게 내려가 있어요. 다만 사회 변화에는 여러 요인이 작용하며, 기후는 그중 하나예요.'},
          {t:'slides', from:3, to:3, title:'생각 열기 · 17세기 북반구의 여름 기온 변화'}
        ]},

      {id:'cases', phase:'활동 1', minutes:8, move:'분석',
        title:'역사 속 기후 변화 사례 탐구 ① 신라 하대 및 고려 말의 기후 변화',
        purpose:'그래프에서 본 「기후와 기근의 관계」가 우리 역사에도 있었는지 사료로 확인하려고 해요.',
        how:['신라 하대와 고려 말의 기록(사료 1)을 읽어요.','Q1. 사료에서 볼 수 있는 기후 현상을 찾아요.','Q2. 그 기후 현상이 영향을 준 사회·정치적 문제를 찾아요.'],
        outcome:'가뭄·흉년·이상 저온·수해가 봉기와 농업 생산량 급감 같은 혼란으로 이어졌다는 것을 알게 돼요. 조선 후기 경신대기근은 어땠는지 실록으로 살펴봐요.',
        prompt:'역사 속 기후 현상은 사회에 어떤 문제를 남겼을까요?',
        visual:{src:'slides/k57/s04.jpg', alt:'사료 1: 신라 하대와 고려 말의 기후 변화', cap:'수업 슬라이드 4 · 워크북 활동1-1'},
        teacher:{
          ask:['자료에서 볼 수 있는 역사 속 기후 현상은 무엇인가요?','이러한 기후 현상이 영향을 준 사회·정치적 문제는 무엇인가요?'],
          answer:['(자료1) 가뭄, 흉년, 이상 저온, 수해입니다.','(자료1) 봉기 등 정치적 혼란, 농업 생산량 급감 등 사회적 혼란입니다.'],
          tip:['모둠별로 신라 하대, 고려 말, 조선 후기(경신대기근)의 기후 재난 기록을 비교한다.','사회 변화에는 여러 요인이 작용하며, 기후는 그중 하나임을 강조한다.'],
          link:'같은 Q1·Q2 질문을 다음 장면의 현종개수실록 사료에 적용한다.'},
        blocks:[
          {t:'callout', tone:'q', title:'사료 1 — 신라 하대 및 고려 말의 기후 변화', text:'「'+SRC1+'」<br><span class="src">출처: 교사 제작 워크북 활동1-1 · 수업 슬라이드 4 (요약문)</span>'},
          {t:'write', id:'k57-1q', ws:'활동지 1-1', q:'Q1. 자료를 통해 볼 수 있는 역사 속 기후 현상은? Q2. 위와 같은 기후 현상이 영향을 준 사회/정치적 문제는?', rows:3, placeholder:'Q1. …\nQ2. …',
            example:'Q1. 가뭄, 흉년, 이상 저온, 수해 / Q2. 봉기 등 정치적 혼란, 농업 생산량 급감 등 사회적 혼란'},
          {t:'slides', from:4, to:5, title:'사료 1 읽고 답 확인하기'}
        ]},

      {id:'kyeongsin', phase:'활동 1', minutes:12, move:'분석',
        title:'역사 속 기후 변화 사례 탐구 ② 「조선왕조실록」으로 보는 기후 변화',
        purpose:'조선 후기 실록 기록에서 기후 현상과 사회적 영향을 구분해, 기후 변동이 사회를 흔든 인과 관계를 정리하려고 해요.',
        how:['사료 2(현종개수실록 내용 요약 및 재구성)에서 기후 현상과 사회적 영향을 색깔별로 표시해요.','Q1·Q2에 답을 써요.','기후 변동 → 흉작 → 아사자 발생 → 사회 혼란의 인과 사슬을 순서대로 놓아요.'],
        outcome:'가뭄·홍수·강풍·우박·대낮의 서리가 굶주림과 참상으로 이어졌다는 인과 관계를 설명할 수 있어요. 이 대기근을 실록 원문으로 더 찾아봐요.',
        prompt:'기후 현상은 사회를 어떻게 흔들었을까요?',
        visual:{src:'slides/k57/s06.jpg', alt:'사료 2: 현종개수실록 내용 요약 및 재구성', cap:'수업 슬라이드 6 · 워크북 활동1-2'},
        teacher:{
          ask:['자료에서 볼 수 있는 역사 속 기후 현상은 무엇인가요?','이러한 기후 현상이 영향을 준 사회·정치적 문제는 무엇인가요?'],
          answer:['(자료2) 가뭄, 홍수, 강풍과 우박, 대낮의 서리입니다.','(자료2) 농사의 어려움, 백성들의 굶주림 등 사회적 혼란입니다.','기후 변동 → 흉작 → 아사자 발생 → 사회 혼란의 인과관계를 활동지에 작성한다.'],
          tip:['기후 변동이 농업 생산량 감소, 아사자 발생, 사회적 혼란(초적 봉기 등)으로 이어진 인과관계를 정리하도록 한다.'],
          link:'사료 2의 시기(경술년·신해년)를 다음 장면에서 「경신대기근」으로 정의하고 실록 원문을 찾는다.'},
        blocks:[
          {t:'widget', name:'climate-highlight', ws:'활동지 1-2', opts:{key:'k57-hl', kind:'사료 읽기', q:'사료 2(현종개수실록 내용 요약 및 재구성)에서 기후 현상과 사회적 영향을 색깔별로 표시해 봐요.',
            pens:['기후 현상','사회적 영향'],
            parts:[
              {w:'봄부터 여름을 지나 가을에 이르기까지', a:null}, ' ', {w:'가뭄', a:0}, '과 ', {w:'홍수', a:0}, ', ', {w:'강풍', a:0}, '과 ', {w:'우박', a:0}, '이 번갈아 몰아쳤다. ',
              {w:'대낮에 서리가 내려', a:0}, ' ', {w:'곡식이 모두 얼어 죽었고', a:1}, ', ', {w:'전염병까지 돌아', a:null}, ' 팔도(八道)의 백성들이 ', {w:'굶주림으로', a:1}, ' ',
              {w:'부모 자식이 서로를 버리는 참상이 극에 달했다', a:1}, '. ', {w:'이는 역사상 유례가 없는 재앙이다', a:null}, '.'],
            model:'<b>기후 현상</b> 가뭄, 홍수, 강풍, 우박, 대낮에 서리 · <b>사회적 영향</b> 곡식이 얼어 죽음, 전염병, 굶주림, 부모 자식이 서로를 버림 · <b>전염병</b>은 기후 재난의 결과이자 사회적 피해라 어느 쪽으로 칠해도 괜찮아요(채점하지 않아요)'}},
          {t:'write', id:'k57-2q', ws:'활동지 1-2', q:'Q1. 위 글을 통해 볼 수 있는 역사 속 기후 현상은? Q2. 위와 같은 기후 현상이 영향을 준 사회/정치적 문제는?', rows:3, placeholder:'Q1. …\nQ2. …',
            example:'Q1. 가뭄, 홍수, 강풍과 우박, 대낮에 서리 / Q2. 농사의 어려움, 백성들의 굶주림 등 사회적 혼란'},
          {t:'widget', name:'climate-chain', ws:'활동지 1-2', opts:{key:'k57-chain', kind:'인과 사슬', q:'표시한 낱말을 떠올리며, 기후 변동이 사회를 흔든 인과 사슬을 순서대로 만들어 봅시다.',
            items:['기후 변동 (가뭄·서리·우박)','흉작 (농업 생산량 감소)','아사자 발생 (굶주림)','사회 혼란 (유랑민·도적 증가 등)'], order:[2,0,3,1],
            explain:'기후 변동이 농업 생산량을 떨어뜨리고, 굶주림과 아사로 이어져 사회적 혼란을 불렀어요.'}},
          {t:'slides', from:6, to:7, title:'사료 2 읽고 답 확인하기'}
        ]},

      {id:'qr', phase:'활동 1', minutes:10, move:'관찰',
        title:'역사 속 기후 변화 사례 탐구 ③ 사료로 탐구하는 경신대기근',
        purpose:'요약된 사료만이 아니라 실제 실록 기사에서 기후 변화 기록을 직접 찾아보려고 해요.',
        how:['「경신대기근이란?」을 읽고 시기(1670~1671년)와 원인을 확인해요.','워크북 QR(또는 아래 링크)로 현종개수실록 경술년·신해년 기사를 열어요.','기후 변화와 관련된 기사 내용을 3건 이상 정리해요.'],
        outcome:'실록에 냉해·가뭄·우박·전염병 같은 기록이 날짜와 함께 남아 있다는 것을 확인해요. 그렇다면 이런 재난 앞에서 나라는 무엇을 했는지 살펴봐요.',
        prompt:'경술년·신해년 실록에는 어떤 기후 기록이 남아 있을까요?',
        visual:{src:'slides/k57/s08.jpg', alt:'사료 3: 경신대기근 설명', cap:'수업 슬라이드 8 · 워크북 활동1-3'},
        teacher:{
          ask:['경신대기근 시기 조선왕조실록 사료를 탐구하며 어떤 기후 변화가 기록되어 있는지 찾아 정리해 봅시다.'],
          answer:['QR 코드로 실록 기사를 읽고 기후 관련 기록을 활동지에 정리한다.'],
          tip:['QR 코드를 스캔하여 실록 내용을 파악하고 활동지에 정리하도록 한다.','수업 전 실록 QR 코드가 해당 기사로 연결되는지 확인한다.'],
          link:'기록된 참상을 바탕으로 다음 장면에서 조선의 구휼 기관과 오늘날의 제도를 비교한다.'},
        blocks:[
          {t:'callout', tone:'key', title:'경신대기근이란?', text:KS_DEF+'<br><span class="src">출처: 교사 제작 워크북 활동1-3 · 수업 슬라이드 8</span>'},
          {t:'tool', url:SILLOK2_URL, title:'현종개수실록 탐구 — 경술년·신해년 기사 (워크북·PPT 9 QR 링크)', text:'경술년(1670년)·신해년(1671년) 자료 중 기후 변화와 관련된 사료의 내용을 찾아 정리해요.'},
          {t:'write', id:'k57-3q1', ws:'활동지 1-3', q:'Q1. QR 코드를 스캔하여 기후 변화와 관련된 내용을 찾아 정리해 봅시다. (3건 이상)', rows:5, placeholder:'1) (날짜) …\n2) (날짜) …\n3) (날짜) …'},
          {t:'slides', from:8, to:9, title:'경신대기근 · 현종개수실록 탐구'}
        ]},

      {id:'relief', phase:'활동 1', minutes:10, move:'판단',
        title:'역사 속 기후 변화 사례 탐구 ④ 역사로 성찰하기',
        purpose:'조선이 기후 재난에 대응한 제도를 오늘의 기후 위기 대응과 비교해, 미래세대를 지킬 제도를 생각해 보려고 해요.',
        how:['조선이 기후 위기 때 설치한 구휼 기관의 이름을 채워요.','역사 속 기후 재난이 누구에게 더 가혹했을지 모둠에서 이야기해요.','진휼청과 현대 기후 피해 지원 제도의 공통점·차이점을 토의하고, 「21세기 구휼 제도(기후 적응 정책)」를 제안해 패들렛에 올려요.'],
        outcome:'기후 재난은 사회적 약자에게 더 가혹했고, 국가와 공동체의 제도가 그 피해를 줄일 수 있다는 것을 알게 돼요. 이제 과거와 현대의 데이터를 직접 분석해요.',
        prompt:'미래세대의 안전과 학습권을 지킬 「21세기 구휼 제도」는 무엇일까요?',
        visual:{src:'img/k57-relief.jpg', alt:'조선의 곡식 나눔과 오늘날 폭염 쉼터가 하나로 이어진 그림', cap:GEN},
        teacher:{
          ask:['OOO에 들어갈 기관은?','오늘날 현대 사회에서 기후 위기로 위협받는 「미래세대의 안전과 학습권」 보호를 위해 국가와 공동체가 마련해야 할 「21세기 구휼 제도(기후 적응 정책)」는 무엇이 있을까요?'],
          answer:['진휼청','진휼청과 현대 기후 피해 지원 제도의 공통점·차이점을 토의하여 패들렛에 게시한다.'],
          tip:['과거 조선의 진휼청 구휼 제도와 현대의 「기후 적응·피해 지원 제도」를 비교 토의하고, 토의 내용을 패들렛에 게시하도록 한다.','역사 속 기후 변동이 단순한 자연재해가 아니라 사회적 약자에게 더 가혹했음을 전달한다.'],
          link:'역사 사례 탐구를 마치고, 활동2에서 실록 기록 횟수와 기상청 지표를 데이터로 비교한다.'},
        blocks:[
          {t:'blanks', id:'k57-jh', ws:'활동지 1-4', q:'Q1. OOO에 들어갈 기관은?',
            text:'과거 조선시대에는 기후 위기가 발생했을 때 국가가 「[[진휼청]]」을 설치하여 구휼활동을 펼쳤습니다.<br><span class="src">※ 기근 때 설치된 임시 기구였다가 17세기 후반 상설화</span>',
            hints:['흉년에 굶주린 백성을 도와주는 일을 「진휼」이라고 해요.','관청 이름은 「○○청」 꼴이에요.'],
            explain:'진휼청은 굶주린 백성을 구제(구휼)하기 위한 기관이에요.'},
          {t:'timer', minutes:6, label:'모둠 토의 · 진휼청과 오늘의 기후 피해 지원 제도 비교'},
          {t:'cer', id:'k57-cer', ws:'활동지 1-4', q:'Q2. 오늘날 기후 위기로 위협받는 「미래세대의 안전과 학습권」 보호를 위해 국가와 공동체가 마련해야 할 「21세기 구휼 제도(기후 적응 정책)」를 제안해 봅시다. (모둠 토의 후 학급 환경 패들렛에도 올려요.)',
            starters:{c:'국가와 공동체는 ___ 제도를 마련해야 한다.', e:'조선의 진휼청은 ___을(를) 했고, 오늘날에는 ___ 같은 위험이 있다.', r:'이 제도는 ___을(를) 막거나 줄여, 특히 ___에게 더 가혹한 피해로부터 미래세대의 안전과 학습권을 지킨다.'}},
          {t:'slides', from:10, to:11, title:'역사로 성찰하기 · 21세기 구휼 제도'}
        ]},

      {id:'joseon', phase:'활동 2', minutes:13, move:'분석',
        title:'기후 변화 데이터 분석 ① 조선 시대의 기후 변화',
        purpose:'역사 사례를 데이터로 비교하려면, 실록에서 우리 모둠이 집중할 기후 이슈를 정하고 기록을 세는 방법부터 알아야 해요.',
        how:['실록 기록 횟수를 해석하는 바른 태도를 골라요(기록 횟수 ≠ 실제 발생 횟수).','실록 검색 이슈와 기후정보포털 지표를 짝지어 모둠 주제를 정해요.','조선왕조실록 QR로 이슈를 검색하고 원인·영향·기록 횟수·기록 분석을 정리해요.'],
        outcome:'우리 모둠의 기후 이슈와 조선 시대의 기록이 정리돼요. 같은 이슈가 오늘날에는 어떻게 나타나는지 현대 데이터로 확인해요.',
        prompt:'실록에 「가뭄」 기록이 많으면, 가뭄이 실제로 더 많았던 걸까요?',
        visual:{src:'slides/k57/s12.jpg', alt:'조선왕조실록에서 검색할 기후 이슈와 정리 방법', cap:'수업 슬라이드 12 · 워크북 활동2-1'},
        teacher:{
          ask:['해당 기후 문제의 원인과, 그 기후 문제가 영향을 준 사회적 상황은 무엇일까요?'],
          answer:['우리 모둠은 「가뭄과 폭염」을 주제로 정했어요.'],
          tip:['기근과 강수량, 가뭄과 폭염 등 모둠별로 집중할 기후 이슈를 정하도록 한다.','조선 전기, 경신대기근 시기, 최근 30년 등 시기를 정해 기후 이슈를 조사하도록 안내한다.','실록의 기록 횟수가 실제 발생 횟수를 뜻하지는 않는다는 점에 유의하도록 한다.'],
          link:'정한 이슈와 짝지은 현대 지표를 다음 장면에서 기상청 기후정보포털로 찾는다.'},
        blocks:[
          {t:'choice', id:'k57-count', ws:'개념 확인', q:'어떤 시기에 실록에서 「가뭄」 기록이 많이 검색되었어요. 이 결과를 해석하는 태도로 가장 알맞은 것은?',
            options:['그 시기에 가뭄이 검색된 횟수만큼 정확히 일어났다고 결론 내린다.','기록된 횟수일 뿐이므로, 실제 발생 횟수와 같다고 단정하지 않고 다른 자료와 함께 살핀다.','기록이 적은 시기에는 가뭄이 전혀 없었다고 본다.'],
            answer:1, hints:['실록은 누가, 무엇을 골라 남긴 기록인지 떠올려 보세요.','기록이 적은 시기는 가뭄이 없었던 걸까요, 덜 기록된 걸까요?'], why:true,
            explain:'기록 횟수 ≠ 실제 발생 횟수. 사료 데이터는 무엇이 기록되었는지를 보여 줄 뿐이라, 다른 자료와 함께 살펴야 해요.'},
          {t:'widget', name:'climate-pair', ws:'활동지 2-1', opts:{key:'k57-pair', target:'k57-topic', kind:'모둠 주제 정하기', q:'조선왕조실록에서 검색할 기후 이슈와 기상청 기후정보포털에서 분석할 지표를 짝지어 우리 모둠 주제를 정해 봅시다.',
            leftTitle:'조선왕조실록 검색 이슈', left:['기근','홍수','가뭄','서리','폭설'],
            rightTitle:'기후정보포털 분석 지표', right:['열대야 및 폭염 일수','한파 및 서리 일수','호우 일수 및 1일 최대 강수량','4계절 길이 변화','수온 및 해수면 높이 변화']}},
          {t:'write', id:'k57-topic', ws:'활동지 2-1', q:'우리 모둠 주제(짝) (위에서 짝을 지으면 자동으로 들어가요)', rows:2},
          {t:'tool', url:SILLOK3_URL, title:'조선왕조실록 기후 이슈 검색 (PPT 12 「조선왕조실록 QR」 링크)', text:'기근·홍수·가뭄·서리 등 우리 모둠의 기후 이슈를 검색해 시기별 기록을 찾아요.'},
          {t:'write', id:'k57-a2-1', ws:'활동지 2-1', q:'조선왕조실록을 통해 기후 변화와 관련된 기록을 정리해 봅시다. (예: 기근·서리·폭설 기록이 나타난 시기, 병자호란 당시 폭설로 인한 국가와 백성들의 상황)', rows:6,
            placeholder:'우리 모둠이 주목한 기후 이슈:\n해당 기후 문제의 핵심 원인:\n해당 기후 문제가 영향을 준 상황:\n기후 문제 수치 기록(시기별 기록 횟수 등):\n기록 분석:'},
          {t:'slides', from:12, to:12, title:'조선왕조실록에서 검색할 기후 이슈'}
        ]},

      {id:'modern', phase:'활동 2', minutes:12, move:'예측',
        title:'기후 변화 데이터 분석 ② 현대 사회의 기후 변화',
        purpose:'과거 기록과 견줄 수 있도록, 같은 기후 이슈가 최근 우리나라에서 어떻게 변했는지 공공데이터로 확인하려고 해요.',
        how:['우리 모둠 지표가 최근 30년 동안 어떻게 변했을지 먼저 예측해요.','기상청 기후정보포털에서 지표의 수치를 찾아 기록해요(연도·값·단위).','원인·영향·변화 추이를 분석해 정리해요.'],
        outcome:'현대의 관측 수치로 기후 변화의 방향과 크기를 확인해요. 이제 과거 기록과 현대 수치를 한 화면에 시각화해요.',
        prompt:'최근 30년, 우리 지역의 기후 지표는 어떻게 변했을까요?',
        visual:{src:H_PORTAL.src, alt:'기상청 기후정보포털 기후변화 상황지도 화면', cap:'수업 슬라이드 13 · 기상청 기후정보포털 화면 · '+PPT},
        teacher:{
          ask:['해당 기후 문제의 원인과, 그 기후 문제가 영향을 준 사회적 상황은 무엇일까요?'],
          answer:['기상청 자료에서 최근 30년 동안 폭염일수가 늘어나는 경향을 확인했어요.'],
          tip:['기후 정보 포털에서 분석할 이슈 예: 열대야 및 폭염 일수, 한파 및 서리 일수, 호우 일수 및 1일 최대 강수량, 4계절 길이 변화, 수온 및 해수면 높이 변화 등.','수업 전 기상청 기후 데이터 사이트 접속이 원활한지 확인한다.'],
          link:'찾은 수치를 다음 장면에서 실록 기록 횟수와 함께 그래프로 나타낸다.'},
        blocks:[
          {t:'predict', id:'k57-p-trend', ws:'활동지 2-2', q:'우리 모둠이 고른 지표(예: 열대야 및 폭염 일수, 호우 일수 및 1일 최대 강수량, 4계절 길이)는 최근 30년 동안 어떻게 변했을까요? 방향과 크기를 예측해 써 보세요.',
            placeholder:'예: (지표)는 (늘었/줄었)을 것이다. 왜냐하면 …',
            reveal:[
              {t:'tool', url:ATLAS_URL, title:'기상청 기후정보포털 · 기후변화 상황지도', text:'워크북의 「기상청 QR」로 연 화면과 같은 기후정보포털이에요. 지표·지역·기간을 골라 수치를 찾아요.', img:H_PORTAL.src},
              {t:'write', id:'k57-a2-2', ws:'활동지 2-2', q:'기상청 기후정보포털을 활용하여 기후 변화와 관련된 수치를 기록하고 변화 추이를 분석해 봅시다.', rows:6,
                placeholder:'우리 모둠이 주목한 기후 이슈:\n해당 기후 문제의 핵심 원인:\n해당 기후 문제가 영향을 준 상황:\n기후 변화 수치 기록(연도·값·단위):\n변화 추이 분석:'},
              {t:'slides', from:13, to:14, title:'기상청 기후정보포털에서 분석할 기후 이슈'}
            ],
            compare:'실제 수치는 내 예측과 같았나요? 가장 놀라웠던 수치와 그 까닭을 써 보세요.'}
        ]},

      {id:'viz', phase:'활동 2', minutes:15, move:'설명',
        title:'기후 변화 데이터 분석 ③ 과거와 현대의 기록으로 보는 기후 메시지',
        purpose:'과거 기록과 현대 수치를 함께 그래프로 보여 주면, 기후 위기가 우리에게 보내는 메시지를 근거 있게 말할 수 있어요.',
        how:['시각화 주제를 정해요(예: 경신대기근 당시 이상 저온·서리 기록 횟수 + 최근 30년 우리 지역 평균 기온·폭염 일수).','실록 기록 횟수(막대)와 기후정보포털 수치(꺾은선)를 넣어 그래프를 만들어요.','캔바 양식으로 인포그래픽을 완성해 패들렛에 올리고, 시사점을 한 문장으로 써요.'],
        outcome:'과거와 현대의 기록을 근거로 한 우리 모둠의 시사점이 완성돼요. 이 시사점을 국제 협약의 빈틈을 메우는 데 써 봐요.',
        prompt:'과거와 현대의 기록은 우리에게 어떤 메시지를 보낼까요?',
        visual:{src:'slides/k57/s15.jpg', alt:'데이터 시각화 주제 선택 예시와 시사점 한 문장', cap:'수업 슬라이드 15 · 워크북 활동2-3'},
        teacher:{
          ask:['역사적 성찰과 데이터 분석을 바탕으로 기후 위기에 대한 시사점을 한 문장으로 제시해 볼까요?'],
          answer:['(예) 기후 위기는 가장 약한 사람들에게 먼저 닥친다.','모둠에서 역할을 나누어 그래프가 들어간 인포그래픽을 완성하고 패들렛에 게시한다.'],
          tip:['분석한 데이터를 막대·꺾은선 그래프 등을 활용해 인포그래픽으로 제작하고, 캔바 양식으로 제작하여 패들렛에 게시하도록 한다.','단순히 디자인을 꾸미기보다 데이터 수치를 객관적으로 전달하는 데 집중하도록 지도한다.','개인정보 보호 약속을 인포그래픽 제작 전에 다시 상기시킨다.'],
          link:'시사점을 근거로 활동3에서 국제 기후 협약의 한계를 살피고 새 협약을 제안한다.'},
        blocks:[
          {t:'widget', name:'climate-dual', ws:'활동지 2-3', opts:{key:'k57-dual', target:'k57-dual-w', kind:'데이터 시각화'}},
          {t:'write', id:'k57-dual-w', ws:'활동지 2-3', q:'시각화한 자료 (위 표를 채우면 자동으로 들어가요)', rows:4},
          {t:'write', id:'k57-a2-3', ws:'활동지 2-3', q:'역사적 성찰과 데이터 분석을 바탕으로 한 우리의 시사점을, 그래프의 수치를 근거로 한 문장으로 써 봅시다. (캔바 양식 QR로 인포그래픽을 완성해 학급 패들렛에 올려요.)', rows:3,
            placeholder:'예: (수치 근거) … 그러므로 …'},
          {t:'slides', from:15, to:16, title:'데이터 시각화 주제와 방법'}
        ]},

      {id:'treaty', phase:'활동 3', minutes:12, move:'판단',
        title:'미래 세대 기후 생태 협약 제안 ① 국제 기후 협약',
        purpose:'새 협약을 제안하기 전에, 지금까지의 국제 기후 협약이 무엇을 약속했고 어디에 한계가 있었는지 알아야 해요.',
        how:['협약을 맺었는데도 탄소 감축이 어려운 까닭을 먼저 짐작해요.','비판 자료(경제적 이해관계 상충, 강제성 부족)를 읽어요.','기후변화협약(UNFCCC, 1992)·교토 의정서(1997)·파리 협정(2015) 중 하나를 골라 핵심 내용과 한계를 조사해요.'],
        outcome:'기존 협약의 핵심 내용과 한계를 근거로, 우리 협약이 무엇을 보완해야 하는지 알게 돼요.',
        prompt:'약속을 했는데도 탄소 감축이 어려운 까닭은 무엇일까요?',
        visual:{src:'img/k57-treaty.jpg', alt:'둥근 회의 탁자에서 지구에 묶인 줄을 서로 다른 방향으로 당기는 대표단', cap:GEN},
        teacher:{
          ask:['개인 또는 모둠별로 기후 협약 한 가지를 골라 핵심 내용과 한계점을 조사해 볼까요?'],
          answer:['교토 의정서는 선진국에만 감축 의무를 두어 한계가 있었어요.','파리 협정은 모든 당사국이 참여하지만 감축 목표를 각 나라가 스스로 정해요.'],
          tip:['기후변화협약(UNFCCC, 1992), 교토 의정서(1997), 파리 협정(2015)의 핵심 조항과 한계점을 비교한다.'],
          link:'조사한 한계를 다음 장면 협약 제안서의 「배경」과 조항에 반영한다.'},
        blocks:[
          {t:'predict', id:'k57-p-treaty', ws:'활동지 3-1', q:'여러 나라가 협약을 맺었는데도 실질적인 탄소 감축과 생태계 보전이 잘되지 않는 까닭은 무엇일까요?',
            placeholder:'내 짐작과 그렇게 생각한 이유',
            reveal:[
              {t:'slides', from:17, to:18, title:'국제 기후 협약의 한계 · 협약 조사'},
              {t:'widget', name:'climate-form', ws:'활동지 3-1', opts:{key:'k57-trform', target:'k57-a3-1', kind:'협약 조사', q:'과거의 기후 협약을 찾아보고 기후 협약의 핵심 내용 및 한계를 정리해 봅시다.',
                fields:[
                  {k:'name', label:'내가 조사한 기후 협약', type:'pick', options:['기후변화협약(UNFCCC, 1992)','교토 의정서(1997)','파리 협정(2015)'], wide:true},
                  {k:'core', label:'핵심 내용', type:'area', wide:true},
                  {k:'limit', label:'한계', type:'area', wide:true}]}},
              {t:'write', id:'k57-a3-1', ws:'활동지 3-1', q:'국제 기후 협약 조사 (위 칸을 채우면 자동으로 들어가요)', rows:5}
            ],
            compare:'비판 자료가 말한 한계는 내 짐작과 어떻게 같고 달랐나요? 내가 조사한 협약에도 같은 한계가 있었나요?'}
        ]},

      {id:'proposal', phase:'활동 3', minutes:28, move:'실천',
        title:'미래 세대 기후 생태 협약 제안 ② 협약 제안서 만들기',
        purpose:'역사의 교훈과 데이터 분석, 기존 협약의 한계를 모아 미래세대를 지킬 구체적인 약속을 만들려고 해요.',
        how:['협약의 명칭을 정하고, 그 이름을 붙인 이유를 써요.','협약을 만든 배경을 역사 사료와 데이터 수치로 밝혀요.','제1조(탄소중립 및 기후)·제2조(생태계 보전)·제3조(미래세대 보호 및 환경 정의)를 모둠 토의로 써요.','캔바 협약문 양식 QR로 완성해 학급 패들렛에 올려요.'],
        outcome:'근거가 담긴 「미래 세대 기후 생태 협약」 초안이 완성돼요. 다른 모둠의 결과물과 비교하며 정리해요.',
        prompt:'국제 사회의 대표단이라면, 어떤 협약을 제안할까요?',
        visual:{src:'slides/k57/s19.jpg', alt:'미래 세대 기후 생태 협약 제안 안내와 협약문 양식·패들렛 QR', cap:'수업 슬라이드 19 · 워크북 활동3-2'},
        teacher:{
          ask:['협약의 명칭을 정하고, 그 명칭을 붙인 이유와 만든 배경은 무엇인가요?','핵심 조항 3가지는 무엇인가요?'],
          answer:['모둠별로 협약 명칭과 핵심 조항 3가지를 정해 협약문 초안을 완성한다.'],
          tip:['역사적 성찰과 데이터 분석 결과를 바탕으로 모둠별 「새로운 기후 협약 조항」 초안을 작성한다.','캔바 템플릿으로 작성하여 패들렛에 게시하도록 한다.','협약문이 추상적인 내용에 머무르지 않도록 지도한다.'],
          link:'완성한 협약문을 정리 단계에서 다른 모둠 결과물과 함께 감상한다.'},
        blocks:[
          {t:'widget', name:'climate-form', ws:'활동지 3-2', opts:{key:'k57-prform', target:'k57-a3-2', kind:'협약 제안서', q:'국제 사회의 대표단이 되어 과거의 역사적 교훈과 현대의 데이터 분석을 바탕으로 [미래 세대 기후 생태 협약 제안서]를 만들어 봅시다.',
            note:'협약문이 추상적인 말에 머무르지 않도록, 앞에서 찾은 사료와 수치를 근거로 누가·무엇을·언제까지 할지 써요.',
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
          {t:'write', id:'k57-a3-2', ws:'활동지 3-2', q:'미래 세대 기후 생태 협약 제안서 (위 칸을 채우면 자동으로 들어가요)', rows:9},
          {t:'timer', minutes:15, label:'모둠 토의 · 협약 조항 쓰기'},
          {t:'slides', from:19, to:19, title:'미래 세대 기후 생태 협약 제안'}
        ]},

      {id:'wrap', phase:'정리', minutes:10, move:'성찰',
        title:'미래 세대 기후 생태 협약 제안 — 결과물 감상하고 정리하기',
        purpose:'다른 모둠의 정책·인포그래픽·협약문을 보며 기후 위기와 사회적 약자의 관계를 다시 정리하려고 해요.',
        how:['패들렛에서 다른 모둠의 21세기 기후 적응 정책, 데이터 분석 인포그래픽, 협약문을 감상해요.','가장 설득력 있었던 근거와 느낀 점을 나눠요.','오늘 새롭게 알게 된 점을 출구 카드에 적어요.'],
        outcome:'과거에도 기후 위기가 있었고 사회·정치적 요인과 겹쳐 혼란을 키웠다는 것, 현재 데이터로 위기를 확인할 수 있다는 것, 기존 협약의 한계를 넘는 약속이 필요하다는 것을 정리해요.',
        prompt:'기후 위기 극복을 위해 우리가 할 수 있는 일은 무엇일까요?',
        visual:{src:'slides/k57/s02.jpg', alt:'수업 목차: 역사 속 기후 변화 사례 탐구, 기후 변화 데이터 분석, 미래 세대 기후 생태 협약 제안', cap:'수업 슬라이드 2 · 오늘의 흐름'},
        teacher:{
          ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?'],
          answer:['과거에도 기후 위기가 있었고, 사회·정치적 요인과 겹쳐 혼란을 키웠다는 것을 알게 되었습니다.','현재의 데이터를 분석하여 기후 위기를 눈으로 확인할 수 있었습니다.','과거 기후 협약의 한계점을 알게 되었습니다.'],
          tip:['다른 모둠이 완성한 21세기 기후 적응 정책, 기후 변화 데이터 분석 인포그래픽, 미래 세대 기후 생태 협약문을 감상하고 느낀 점을 공유하도록 한다.','다른 모둠의 결과물을 감상하며 기후 위기와 사회적 약자의 관계를 다시 한번 정리하도록 한다.'],
          link:'1~7차시 전체: 과거의 기록 읽기(1~2) → 오늘의 관측(3~4) → 역사와 데이터로 미래 약속(5~7).'},
        blocks:[
          {t:'write', id:'k57-share', ws:'정리', q:'다른 모둠 결과물(정책·인포그래픽·협약문) 중 가장 설득력 있었던 근거와 느낀 점을 써 봅시다.', rows:3},
          {t:'reflect', id:'k57-exit', items:['오늘 수업을 통해 새롭게 알게 된 점','기후 위기는 누구에게 먼저, 더 크게 닥칠까요?']},
          {t:'more', title:'더 나아가기', items:[
            {img:'img/k57-more-archive.jpg', tag:'사이트', title:'실록 속 기상 기록 검색', text:'기상청이 정리한 조선왕조실록 기상기록에서 서리·우박·가뭄 기록을 찾아 시기별로 세어 봐요.', url:JOSEON_URL},
            {img:'img/k57-more-atlas.jpg', tag:'도구', title:'기후변화 상황지도', text:'우리 지역의 미래 기온·강수를 저탄소·고탄소 시나리오로 비교해 봐요.', url:ATLAS_URL},
            {img:'img/k57-more-report.jpg', tag:'자료', title:'한국 기후위기 평가보고서 2025', text:'한반도 폭염일수가 기준 기간 8.8일에서 최근 10년 15.6일로 늘어난 자료를 확인해요.', url:KMA_PRESS}
          ]}
        ]}
    ]
  });
})();
