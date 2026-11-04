/* 그린 시그널 수업실 · 탄소중립 노선 (c12 · c34 · c56) — v3 교사 개발 자료 반영판
   기준: 결과보고서 공식 흐름 > 통합 지도안(conv/plan_all.txt) > 워크북(files/<id>/student-worksheet.pdf, 활동 블록 ws 번호 1:1) > 교사 PPT(ppt/<id>.md, slides/, media/) > v2 검증 위젯
   v2 대비: carbon-matsub·carbon-scope 위젯은 학습지 기록을 위해 tablefill로 대체, carbon-scatter·carbon-riskmap 추가 */
(function(){
'use strict';

/* ================= 공통 도우미 ================= */
function head(U, k, q){ return U.el('div',{class:'ah'}, U.el('span',{class:'k'},k), U.el('span',{class:'q',html:q})); }
function fbx(U){ return U.el('div',{class:'fb info',role:'status',hidden:true}); }
function say(f, tone, html){ f.hidden = false; f.className = 'fb '+tone; f.innerHTML = html; }
function sgn(v, d){ return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d); }
function heatBg(p){ p = Math.max(0, Math.min(1, p)); return 'color-mix(in srgb, var(--climate) '+Math.round(p*88)+'%, var(--surface))'; }
function heatInk(p){ return p > 0.55 ? 'var(--surface)' : 'var(--ink)'; }
const CELL = 'border-radius:6px;padding:6px 2px;text-align:center;font-family:var(--f-num);font-size:.92rem;min-height:2.3em;display:grid;place-items:center;border:1px solid var(--line);line-height:1.2';
function slider(U, label, min, max, step, val, on, fmt){
  const out = U.el('span',{class:'num',style:'min-width:4.6em;text-align:right'});
  const r = U.el('input',{type:'range',min:String(min),max:String(max),step:String(step),'aria-label':label});
  r.value = val;
  const upd = () => { out.textContent = fmt ? fmt(+r.value) : r.value; };
  r.addEventListener('input', () => { upd(); on(+r.value); });
  upd();
  const w = U.el('label',{class:'slider'}, U.el('span',{},label), r, out);
  w.set = v => { if(v > +r.max) r.max = String(v); r.value = v; upd(); };
  w.show = txt => { out.textContent = txt; };
  return w;
}
function matGrid(U, n, m, cell, o){
  o = o || {};
  const g = U.el('div',{style:'display:grid;grid-template-columns:'+(o.rowLabels?'auto ':'')+'repeat('+m+',minmax(0,1fr));gap:3px;align-items:stretch'});
  if(o.colLabels){ if(o.rowLabels) g.append(U.el('span',{})); for(let j=0;j<m;j++) g.append(U.el('span',{class:'src',style:'text-align:center',text:o.colLabels[j]})); }
  for(let i=0;i<n;i++){
    if(o.rowLabels) g.append(U.el('span',{class:'src',style:'align-self:center;padding-right:6px;white-space:nowrap',text:o.rowLabels[i]}));
    for(let j=0;j<m;j++) g.append(cell(i,j));
  }
  return g;
}
const R5 = ['행1','행2','행3','행4','행5'], C5 = ['열1','열2','열3','열4','열5'];
function uid(p){ return p + Math.random().toString(36).slice(2,8); }
/* ================= c12 위젯 ================= */

/* 탄소중립 저울: 배출 카드와 흡수 카드를 올려 순 배출량 0(수평)을 만든다 */
GS.widget('carbon-balance', function(host, o, st, U){
  const E = [{k:'burn',t:'쓰레기 소각'},{k:'plane',t:'비행기 여행'},{k:'fossil',t:'화석연료 사용'}];
  const A = [{k:'forest',t:'숲의 나무(광합성)'},{k:'sea',t:'고래와 바다'}];
  const s = Object.assign({burn:1,plane:1,fossil:1,forest:0,sea:0}, st.get('bal')||{});
  host.append(head(U,'저울 놀이','배출과 흡수를 저울에 올려 저울을 수평으로 만들어 보세요'));
  host.append(U.el('p',{class:'src',text:'탄소 덩어리 한 개는 양을 비교하려고 정한 놀이용 단위예요. + 와 − 를 눌러 올리고 내려요.'}));
  const pic = U.el('div',{});
  const info = U.el('p',{class:'num',style:'text-align:center;font-weight:700'});
  const f = fbx(U);
  function side(list, label, col){
    const box = U.el('div',{style:'display:flex;flex-direction:column;gap:6px;flex:1 1 220px;min-width:0'}, U.el('b',{style:'color:'+col,text:label}));
    list.forEach(it=>{
      const n = U.el('span',{class:'num',style:'min-width:1.6em;text-align:center;font-weight:700'});
      it.upd = () => { n.textContent = s[it.k]; };
      box.append(U.el('div',{class:'row',style:'justify-content:space-between;flex-wrap:nowrap'},
        U.el('span',{text:it.t}),
        U.el('span',{class:'row',style:'flex-wrap:nowrap'},
          U.el('button',{type:'button',class:'btn sm','aria-label':it.t+' 하나 내리기',onclick:()=>{ if(s[it.k]>0){ s[it.k]--; draw(); } }},'−'), n,
          U.el('button',{type:'button',class:'btn sm','aria-label':it.t+' 하나 올리기',onclick:()=>{ if(s[it.k]<4){ s[it.k]++; draw(); } }},'+'))));
    });
    return box;
  }
  const ctr = U.el('div',{class:'row',style:'align-items:flex-start;gap:16px'}, side(E,'배출 (탄소가 나와요)','var(--climate)'), side(A,'흡수 (탄소를 빨아들여요)','var(--th)'));
  function pan(x, y, cnt, col, label){
    let g = `<line x1="${x}" y1="${y}" x2="${x-42}" y2="${y+62}" stroke="var(--muted)" stroke-width="1.5"/><line x1="${x}" y1="${y}" x2="${x+42}" y2="${y+62}" stroke="var(--muted)" stroke-width="1.5"/>`;
    g += `<path d="M${x-50} ${y+62} Q${x} ${y+84} ${x+50} ${y+62} Z" fill="var(--sunk)" stroke="var(--muted)" stroke-width="1.5"/>`;
    for(let k=0;k<cnt;k++){ const bx = x-36+(k%4)*18, by = y+44-Math.floor(k/4)*18; g += `<rect x="${bx}" y="${by}" width="16" height="16" rx="3" fill="${col}"/>`; }
    g += `<text x="${x}" y="${y+100}" text-anchor="middle" font-size="14" font-weight="700" fill="${col}">${label} ${cnt}</text>`;
    return g;
  }
  function draw(){
    st.set('bal', s);
    E.concat(A).forEach(i=>i.upd());
    const e = E.reduce((a,i)=>a+s[i.k],0), a = A.reduce((t,i)=>t+s[i.k],0), net = e - a;
    const ang = Math.max(-16, Math.min(16, net*4)) * Math.PI/180;
    const cx = 200, cy = 56, L = 135;
    const lx = cx - L*Math.cos(ang), ly = cy + L*Math.sin(ang), rx = cx + L*Math.cos(ang), ry = cy - L*Math.sin(ang);
    let g = `<path d="M${cx} ${cy} L${cx-34} 236 L${cx+34} 236 Z" fill="var(--sunk)" stroke="var(--muted)" stroke-width="1.5"/>`;
    g += `<line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="var(--ink)" stroke-width="6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="8" fill="var(--ink)"/>`;
    g += pan(lx, ly, s.burn+s.plane+s.fossil, 'var(--climate)', '배출') + pan(rx, ry, s.forest+s.sea, 'var(--th)', '흡수');
    if(net===0) g += `<text x="${cx}" y="28" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ok)">수평! 순 배출량 0</text>`;
    pic.innerHTML = `<svg viewBox="0 0 400 250" role="img" aria-label="탄소중립 저울: 배출 ${e}, 흡수 ${a}">${g}</svg>`;
    info.textContent = '순 배출량 = 배출 '+e+' − 흡수 '+a+' = '+net;
    if(net===0 && e>0) say(f,'ok','저울이 수평이 되었어요! 배출한 만큼 흡수해서 <b>순 배출량이 0</b>이 되었어요. 이것이 <b>탄소중립</b>이에요.');
    else if(net===0) say(f,'info','저울에 아무것도 없어요. 배출 카드를 먼저 올려 보세요.');
    else if(net>0) say(f,'info','배출 쪽이 무거워요. 배출을 <b>줄이거나</b>, 흡수를 <b>늘려</b> 수평을 만들어 보세요.');
    else say(f,'info','흡수 쪽이 더 무거워요. 순 배출량이 0보다 작아졌어요.');
  }
  host.append(pic, info, ctr, f);
  draw();
});

/* ================= c34 위젯 ================= */
const FX = [1,2,3,4,5,6,7,8,9,10], FY = [7.9,6.4,5.2,4.3,3.6,3.0,2.5,2.1,1.7,1.4];

/* 산점도 + 회귀직선 실험실 */
GS.widget('carbon-regression', function(host, o, st, U){
  const sv = st.get('reg') || {};
  let a = sv.a!=null?sv.a:-0.3, b = sv.b!=null?sv.b:6, best = sv.best!=null?sv.best:null, res = true;
  host.append(head(U,'실험실','기울기 a와 절편 b를 움직여 10개 점에 가장 잘 맞는 직선을 찾아요'));
  const W=640, H=360, P={l:44,r:14,t:26,b:40};
  const sx = x => P.l + x/11*(W-P.l-P.r), sy = y => P.t + (1-y/9)*(H-P.t-P.b);
  const cid = uid('rc');
  const sse = (a,b) => FX.reduce((t,x,i)=>t+Math.pow(FY[i]-(a*x+b),2),0);
  const pic = U.el('div',{}), eq = U.el('p',{class:'num',style:'font-weight:700;font-size:1.05rem'}), rd = U.el('p',{class:'num'}), f = fbx(U);
  function draw(){
    st.set('reg',{a,b,best});
    let s = `<defs><clipPath id="${cid}"><rect x="${P.l}" y="${P.t}" width="${W-P.l-P.r}" height="${H-P.t-P.b}"/></clipPath></defs>`;
    for(let x=0;x<=11;x++) s += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${P.t}" y2="${H-P.b}" stroke="var(--line)"/>` + (x>=1&&x<=10?`<text x="${sx(x)}" y="${H-P.b+18}" font-size="12" text-anchor="middle" fill="var(--muted)">${x}</text>`:'');
    for(let y=0;y<=9;y++) s += `<line x1="${P.l}" x2="${W-P.r}" y1="${sy(y)}" y2="${sy(y)}" stroke="var(--line)"/><text x="${P.l-8}" y="${sy(y)+4}" font-size="12" text-anchor="end" fill="var(--muted)">${y}</text>`;
    s += `<text x="${W-P.r}" y="${H-6}" font-size="12" text-anchor="end" fill="var(--muted)">소득분위 x</text><text x="${P.l}" y="${P.t-10}" font-size="12" fill="var(--muted)">연료비 비중 y(%)</text>`;
    s += `<g clip-path="url(#${cid})">`;
    if(res) FX.forEach((x,i)=>{ s += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${sy(FY[i])}" y2="${sy(a*x+b)}" stroke="var(--bad)" stroke-width="2" stroke-dasharray="4 3"/>`; });
    s += `<line x1="${sx(0)}" y1="${sy(b)}" x2="${sx(11)}" y2="${sy(a*11+b)}" stroke="var(--climate)" stroke-width="3"/></g>`;
    FX.forEach((x,i)=>{ s += `<circle cx="${sx(x)}" cy="${sy(FY[i])}" r="6" fill="var(--th)"/>`; });
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="소득분위와 연료비 비중 산점도와 직선">${s}</svg>`;
    const e = sse(a,b); if(best==null || e<best) best = e;
    eq.textContent = 'ŷ = ' + sgn(a,3) + 'x ' + (b<0?'− ':'+ ') + Math.abs(b).toFixed(3);
    rd.innerHTML = '오차제곱합 Σ(y − ŷ)² = <b>' + e.toFixed(3) + '</b> · 내 최소 기록 ' + best.toFixed(3);
  }
  const sa = slider(U,'기울기 a',-1.5,0.5,0.001,a,v=>{ a=v; draw(); },v=>sgn(v,3));
  const sb = slider(U,'절편 b',0,12,0.001,b,v=>{ b=v; draw(); },v=>v.toFixed(3));
  host.append(pic, eq, sa, sb, rd,
    U.el('div',{class:'row'},
      U.el('button',{type:'button',class:'btn sm',onclick:e=>{ res=!res; e.target.textContent = res?'오차 선 숨기기':'오차 선 보기'; draw(); }},'오차 선 숨기기'),
      U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
        a = -0.684; b = 7.572; sa.set(a); sb.set(b); sa.show('−0.684'); sb.show('7.572'); draw();
        say(f,'info','<b>최소제곱 정답</b> ŷ = −0.684x + 7.572 · 상관계수 r ≈ −0.968 · 결정계수 r² ≈ 0.937 · 이때 오차제곱합 ≈ '+sse(a,b).toFixed(3)+'<br>빨간 점선(오차)을 제곱해 더한 값이 가장 작아지는 직선이에요. 내 기록과 비교해 보세요.');
      }},'최소제곱 정답 보기')), f);
  draw();
});

/* 선언문 구체어·모호어 (코사인 계산기에서 사용) */
const SPEC = ['감축','배출량','재생에너지','Scope 3','검증','제3자','목표연도','데이터'];
const VAGUE = ['친환경','지속가능','그린','깨끗','미래','노력','약속','비전'];

/* 코사인 유사도 계산기: 붙여 넣은 글 → v=(x,y) 화살표 · cos θ · 판정 */
function countKw(text, list){
  const t = text.toLowerCase(); const out = [];
  list.forEach(k=>{ const re = k==='Scope 3' ? /scope\s*3/g : new RegExp(k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'); const n = (t.match(re)||[]).length; if(n) out.push([k,n]); });
  return out;
}
GS.widget('carbon-cosine', function(host, o, st, U){
  const sv = st.get('cos') || {x:3,y:4,text:''};
  let x = sv.x, y = sv.y;
  host.append(head(U,'계산기','선언문을 붙여 넣거나 x, y를 움직여 cos θ와 판정을 확인해요'));
  const ta = U.el('textarea',{class:'w',rows:'3',placeholder:'여기에 선언문을 붙여 넣거나 직접 써 보세요. (예: 우리 반의 탄소중립 다짐문)'});
  ta.value = sv.text || '';
  const brk = U.el('p',{class:'src'});
  const pic = U.el('div',{style:'max-width:460px'}), rd = U.el('div',{class:'tbl'}), f = fbx(U);
  const mid = uid('mk');
  function save(){ st.set('cos',{x,y,text:ta.value}); }
  function draw(){
    save();
    const D = Math.max(10, x, y) + 1, ox = 46, oy = 262, S = 230/D;
    const tick = Math.ceil(D/6);
    const n = Math.sqrt(x*x+y*y), c = n ? Math.round(x/n*100)/100 : null; // 화면에 보이는 소수 둘째 자리 값으로 판정
    const col = c==null ? 'var(--muted)' : c>=0.66 ? 'var(--ok)' : c>=0.33 ? 'var(--climate)' : 'var(--bad)';
    let s = `<defs><marker id="${mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker><marker id="${mid}u" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--th)"/></marker></defs>`;
    for(let k=0;k<=D;k+=tick){ s += `<line x1="${ox+k*S}" x2="${ox+k*S}" y1="${oy}" y2="${oy-D*S}" stroke="var(--line)"/><line x1="${ox}" x2="${ox+D*S}" y1="${oy-k*S}" y2="${oy-k*S}" stroke="var(--line)"/><text x="${ox+k*S}" y="${oy+16}" font-size="11" text-anchor="middle" fill="var(--muted)">${k}</text>` + (k?`<text x="${ox-6}" y="${oy-k*S+4}" font-size="11" text-anchor="end" fill="var(--muted)">${k}</text>`:''); }
    s += `<text x="${ox+D*S}" y="${oy+32}" font-size="12" text-anchor="end" fill="var(--muted)">x 구체어</text><text x="${ox}" y="${oy-D*S-8}" font-size="12" fill="var(--muted)">y 모호어</text>`;
    if(n){
      const th = Math.atan2(y,x), rr = 38;
      s += `<path d="M${ox+rr} ${oy} A${rr} ${rr} 0 0 0 ${ox+rr*Math.cos(th)} ${oy-rr*Math.sin(th)}" fill="none" stroke="${col}" stroke-width="2"/><text x="${ox+rr+8}" y="${oy-10}" font-size="13" fill="${col}">θ</text>`;
      s += `<line x1="${ox}" y1="${oy}" x2="${ox+x*S}" y2="${oy-y*S}" stroke="${col}" stroke-width="4" marker-end="url(#${mid})"/><text x="${ox+x*S+6}" y="${oy-y*S-6}" font-size="13" font-weight="700" fill="${col}">v = (${x}, ${y})</text>`;
    }
    s += `<line x1="${ox}" y1="${oy}" x2="${ox+Math.max(S,24)}" y2="${oy}" stroke="var(--th)" stroke-width="5" marker-end="url(#${mid}u)"/><text x="${ox+4}" y="${oy-8}" font-size="12" font-weight="700" fill="var(--th)">u</text>`;
    pic.innerHTML = `<svg viewBox="0 0 330 300" role="img" aria-label="기준 벡터 u와 선언문 벡터 v">${s}</svg>`;
    const verdict = c==null ? '방향 없음' : c>=0.66 ? '진정성 높음' : c>=0.33 ? '확인 필요' : '그린워싱 의심';
    rd.innerHTML = '<table><tbody>' +
      `<tr><th>v</th><td class="n">(${x}, ${y})</td></tr>` +
      `<tr><th>‖v‖ = √(x² + y²)</th><td class="n">√(${x*x} + ${y*y}) = ${n%1?n.toFixed(3):n}</td></tr>` +
      `<tr><th>u · v = 1·x + 0·y</th><td class="n">${x}</td></tr>` +
      `<tr><th>cos θ = (u · v) ÷ (1 × ‖v‖)</th><td class="n"><b>${c==null?'계산할 수 없음':c.toFixed(2)}</b></td></tr>` +
      `<tr><th>판정</th><td class="n"><b style="color:${col}">${verdict}</b></td></tr></tbody></table>`;
    if(c==null) say(f,'info','구체어도 모호어도 하나도 없으면 v = (0, 0)이라 방향을 정할 수 없어요(분모가 0).');
    else f.hidden = true;
  }
  const sx = slider(U,'x (구체어)',0,15,1,x,v=>{ x=v; draw(); });
  const sy = slider(U,'y (모호어)',0,15,1,y,v=>{ y=v; draw(); });
  function setXY(a,b){ x=a; y=b; sx.set(a); sy.set(b); draw(); }
  host.append(ta, U.el('div',{class:'row'},
    U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
      const s1 = countKw(ta.value, SPEC), s2 = countKw(ta.value, VAGUE);
      const a = s1.reduce((t,p)=>t+p[1],0), b = s2.reduce((t,p)=>t+p[1],0);
      brk.innerHTML = '구체어: ' + (s1.map(p=>p[0]+' '+p[1]).join(', ')||'없음') + ' → x = ' + a + '<br>모호어: ' + (s2.map(p=>p[0]+' '+p[1]).join(', ')||'없음') + ' → y = ' + b;
      setXY(a,b);
    }},'단어 세기'),
    U.el('span',{class:'src'},'예시:'),
    [['A사',0,9],['B사',9,0],['C사',3,4]].map(p=>U.el('button',{type:'button',class:'chip',onclick:()=>{ brk.textContent=''; setXY(p[1],p[2]); }}, p[0]+' ('+p[1]+', '+p[2]+')'))),
    brk, pic, sx, sy, rd, f,
    U.el('p',{class:'src',text:'수업용 판정 기준(임의 기준): cos θ ≥ 0.66 진정성 높음 · 0.33 ~ 0.66 확인 필요 · 0.33 미만 의심. 자동 세기는 정해 둔 16개 단어만 글자 그대로 찾아요.'}));
  ta.addEventListener('input', save);
  draw();
});

/* ================= c56 위젯 ================= */
const MT = [[25,28,31,29,26],[24,26,29,27,25],[23,25,27,25,25],[23,24,25,25,25],[24,24,24,25,25]];
const MB = [[23,23,24,24,24],[23,23,24,24,24],[23,24,24,24,25],[23,24,24,25,25],[24,24,24,25,25]];
const MA = MT.map((r,i)=>r.map((v,j)=>v-MB[i][j]));

/* ================= v3 새 위젯 ================= */

/* 활동지 3(c34): 표의 10개 점을 좌표평면에 직접 찍는 산점도 */
GS.widget('carbon-scatter', function(host, o, st, U){
  const sv = st.get('sc') || {};
  const pts = Object.assign({}, sv.p || {});
  let tries = sv.t || 0, shown = !!sv.shown, cur = null;
  host.append(head(U,'산점도','표의 10개 점을 좌표평면에 찍어 보세요. 점을 고른 뒤 ▲▼로 0.1씩 옮길 수 있어요.'));
  host.append(U.el('div',{class:'tbl'}, U.el('table',{},
    U.el('tbody',{},
      U.el('tr',{}, U.el('th',{},'소득분위 x'), FX.map(x=>U.el('td',{class:'n'},String(x)))),
      U.el('tr',{}, U.el('th',{},'연료비 비중 y(%)'), FY.map(y=>U.el('td',{class:'n'},y.toFixed(1))))))));
  const W=640, H=380, P={l:48,r:14,t:22,b:44};
  const sx = x => P.l + x/11*(W-P.l-P.r), sy = y => P.t + (1-y/9)*(H-P.t-P.b);
  const pic = U.el('div',{style:'cursor:crosshair;touch-action:manipulation'});
  const info = U.el('p',{class:'num'}), f = fbx(U);
  const showBtn = U.el('button',{type:'button',class:'btn sm',hidden:tries<2,onclick:()=>{ shown=true; save(); draw(); say(f,'info','빈 원이 표의 실제 위치예요. 내 점과 비교해 보세요.'); }},'정답 점 보기');
  function save(){ st.set('sc',{p:pts,t:tries,shown}); }
  function draw(){
    let s = '';
    for(let x=0;x<=11;x++) s += `<line x1="${sx(x)}" x2="${sx(x)}" y1="${P.t}" y2="${H-P.b}" stroke="var(--line)"/>` + `<text x="${sx(x)}" y="${H-P.b+18}" font-size="12" text-anchor="middle" fill="var(--muted)">${x}</text>`;
    for(let y=0;y<=9;y++) s += `<line x1="${P.l}" x2="${W-P.r}" y1="${sy(y)}" y2="${sy(y)}" stroke="var(--line)"/><text x="${P.l-8}" y="${sy(y)+4}" font-size="12" text-anchor="end" fill="var(--muted)">${y}</text>`;
    s += `<text x="${W-P.r}" y="${H-6}" font-size="12" text-anchor="end" fill="var(--muted)">소득분위 x (1 = 최저소득 … 10 = 최고소득)</text><text x="${P.l}" y="${P.t-8}" font-size="12" fill="var(--muted)">소득 대비 연료비 비중 y (%)</text>`;
    if(shown) FX.forEach((x,i)=>{ s += `<circle cx="${sx(x)}" cy="${sy(FY[i])}" r="9" fill="none" stroke="var(--climate)" stroke-width="2"/>`; });
    Object.keys(pts).forEach(k=>{ const x=+k, y=pts[k]; s += `<circle cx="${sx(x)}" cy="${sy(y)}" r="${cur===x?8:6}" fill="var(--th)" stroke="${cur===x?'var(--ink)':'none'}" stroke-width="2"/><text x="${sx(x)}" y="${sy(y)-12}" font-size="11" text-anchor="middle" fill="var(--ink)">${y.toFixed(1)}</text>`; });
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="소득분위와 연료비 비중 좌표평면. 찍은 점 ${Object.keys(pts).length}개">${s}</svg>`;
    const ks = Object.keys(pts).map(Number).sort((a,b)=>a-b);
    info.textContent = ks.length ? '찍은 점: ' + ks.map(x=>'('+x+', '+pts[x].toFixed(1)+')').join(' ') : '아직 찍은 점이 없어요. 격자 위를 눌러 보세요.';
  }
  pic.addEventListener('click', e=>{
    const svg = pic.querySelector('svg'); if(!svg) return;
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left)/r.width*W, py = (e.clientY - r.top)/r.height*H;
    const x = Math.round((px-P.l)/(W-P.l-P.r)*11), y = Math.round((1-(py-P.t)/(H-P.t-P.b))*90)/10;
    if(x<1 || x>10 || y<0 || y>9){ say(f,'info','x는 1~10, y는 0~9 안쪽을 눌러 주세요.'); return; }
    pts[x] = y; cur = x; f.hidden = true; save(); draw();
  });
  const nudge = d => { if(cur==null){ say(f,'info','먼저 옮길 점을 찍거나 눌러 주세요.'); return; } pts[cur] = Math.max(0, Math.min(9, Math.round((pts[cur]+d)*10)/10)); save(); draw(); };
  host.append(pic, info, U.el('div',{class:'row'},
    U.el('button',{type:'button',class:'btn sm','aria-label':'고른 점 0.1 올리기',onclick:()=>nudge(0.1)},'▲ 0.1'),
    U.el('button',{type:'button',class:'btn sm','aria-label':'고른 점 0.1 내리기',onclick:()=>nudge(-0.1)},'▼ 0.1'),
    U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
      tries++;
      let n = 0; FX.forEach((x,i)=>{ if(pts[x]!=null && Math.abs(pts[x]-FY[i]) <= 0.25) n++; });
      if(tries>=2) showBtn.hidden = false;
      save();
      if(n===10) say(f,'ok','10개 점을 모두 알맞게 찍었어요. 점들이 <b>오른쪽 아래</b>로 늘어서요. 이 방향을 직선 하나로 요약해 봐요.');
      else say(f,'bad','10개 중 '+n+'개가 표의 위치와 맞아요(허용 ±0.2). 표의 y값을 다시 확인해 보세요.');
    }},'확인하기'),
    showBtn,
    U.el('button',{type:'button',class:'btn sm',onclick:()=>{ Object.keys(pts).forEach(k=>delete pts[k]); cur=null; shown=false; save(); draw(); f.hidden=true; }},'모두 지우기')), f);
  draw();
});

/* 활동지 3(c56): 위험지수 R 등급에 따라 5×5 지도를 칠한다 (빨강 고위험 · 주황 주의 · 노랑 낮음) */
GS.widget('carbon-riskmap', function(host, o, st, U){
  const NAME = ['','고위험','주의','낮음'], SHORT = ['','고','주','낮'];
  const BG = ['var(--bg)','var(--bad)','var(--climate)','var(--hl)'], INK = ['var(--muted)','var(--surface)','var(--surface)','var(--ink)'];
  const grade = (v, den) => { const r = Math.round(v/den*100)/100; return r >= 0.70 ? 1 : r >= 0.30 ? 2 : 3; };
  const saved = st.get('rm') || {};
  const g = saved.g || {};
  let tries = saved.t || 0, solved = !!saved.ok;
  host.append(head(U,'색칠하기','칸을 누를 때마다 고위험(빨강) → 주의(주황) → 낮음(노랑) 순서로 바뀌어요'));
  host.append(U.el('p',{class:'src',html:'등급 기준: R ≥ 0.70 고위험 · 0.30 ≤ R &lt; 0.70 주의 · R &lt; 0.30 낮음. 위에서 구한 R을 보고 칠해요.'}));
  const f = fbx(U), cells = [];
  const grid = matGrid(U,5,5,(i,j)=>{
    const b = U.el('button',{type:'button',style:CELL+';cursor:pointer;font:inherit;font-weight:700'});
    const paint = bad => { const k = g[i+'-'+j]||0; b.style.background = BG[k]; b.style.color = INK[k]; b.style.borderColor = bad ? 'var(--ink)' : 'var(--line)'; b.style.borderWidth = bad ? '3px' : '1px'; b.textContent = SHORT[k] || '·'; b.setAttribute('aria-label', R5[i]+' '+C5[j]+' '+(NAME[k]||'아직 안 칠함')); };
    b.addEventListener('click',()=>{ const k = ((g[i+'-'+j]||0) % 3) + 1; g[i+'-'+j] = k; saved.g = g; st.set('rm', saved); paint(false); });
    cells.push({i,j,paint}); paint(false); return b;
  },{rowLabels:R5,colLabels:C5});
  const cmp = U.el('div',{hidden:!solved});
  function answerMap(den, title){
    return U.el('div',{style:'flex:1 1 220px;min-width:0'}, U.el('b',{text:title}),
      matGrid(U,5,5,(i,j)=>{ const k = grade(MA[i][j], den); return U.el('div',{style:CELL+';background:'+BG[k]+';color:'+INK[k]+';font-weight:700','aria-label':R5[i]+' '+C5[j]+' '+NAME[k]}, SHORT[k]); },{rowLabels:R5,colLabels:C5}));
  }
  function count(den){ const c=[0,0,0,0]; MA.forEach(r=>r.forEach(v=>c[grade(v,den)]++)); return c; }
  cmp.append(U.el('p',{class:'src',text:'같은 자료를 ×(1/7)과 ×(1/10)으로 정규화한 두 지도예요. 기준을 그대로 두고 나누는 수만 바꿨어요.'}),
    U.el('div',{class:'row',style:'align-items:flex-start;gap:12px'}, answerMap(7,'R = (1/7)·A'), answerMap(10,'R = (1/10)·A')),
    U.el('p',{class:'num',text:'고위험 칸: ×(1/7) '+count(7)[1]+'칸 → ×(1/10) '+count(10)[1]+'칸'}));
  const showBtn = U.el('button',{type:'button',class:'btn sm',hidden:tries<2,onclick:()=>{ cells.forEach(c=>{ g[c.i+'-'+c.j] = grade(MA[c.i][c.j],7); c.paint(false); }); saved.g=g; saved.ok=true; st.set('rm',saved); cmp.hidden=false; say(f,'info','정답 색으로 칠했어요. 아래에서 ×(1/10)일 때와 비교해 보세요.'); }},'정답 보기');
  host.append(grid, U.el('div',{class:'row'},
    U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
      let n = 0; cells.forEach(c=>{ const ok = (g[c.i+'-'+c.j]||0) === grade(MA[c.i][c.j],7); if(ok) n++; c.paint(!ok); });
      tries++; saved.t = tries;
      if(n===25){ saved.ok = true; solved = true; cmp.hidden = false; say(f,'ok','25칸 모두 맞았어요. 고위험은 배수구 앞 4칸(행1 열2·열3·열4, 행2 열3)이에요. 아래 비교도 보세요.'); }
      else { say(f,'bad','25칸 중 '+n+'칸이 맞아요. 굵은 테두리 칸의 R을 다시 보세요. 2/7 ≈ 0.29는 0.30보다 작아요.'); if(tries>=2) showBtn.hidden=false; }
      st.set('rm', saved);
    }},'확인하기'), showBtn), f, cmp);
});

/* 3×3 합성곱 필터 체험 */
GS.widget('carbon-conv', function(host, o, st, U){
  const sv = Object.assign({i:1,j:2,flt:'avg'}, st.get('conv')||{});
  let {i:ci, j:cj, flt} = sv;
  host.append(head(U,'필터 체험','A의 안쪽 칸을 누르면 3×3 창이 겹쳐지고 계산이 나와요'));
  const fbtn = U.el('div',{class:'row'});
  const grid = U.el('div',{}), calc = U.el('div',{class:'fb info',style:'font-family:var(--f-num);font-size:.9rem'}), outBox = U.el('div',{}), note = U.el('p',{class:'src'}), f = fbx(U);
  const KE = [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]];
  function at(i,j){ let s=0; const parts=[]; for(let a=-1;a<=1;a++){ const row=[]; for(let b=-1;b<=1;b++){ const v=MA[i+a][j+b]; row.push(v); s += flt==='avg' ? v : v*KE[a+1][b+1]; } parts.push(row); } return {s, parts}; }
  function outVal(i,j){ const r = at(i,j); return flt==='avg' ? r.s/9 : r.s; }
  function draw(){
    st.set('conv',{i:ci,j:cj,flt});
    fbtn.innerHTML = '';
    fbtn.append(U.el('button',{type:'button',class:'btn sm'+(flt==='avg'?' pri':''),onclick:()=>{ flt='avg'; draw(); }},'평균 필터 (1/9)·[모두 1]'),
      U.el('button',{type:'button',class:'btn sm'+(flt==='edge'?' pri':''),onclick:()=>{ flt='edge'; draw(); }},'경계 검출 필터 [−1 … 8 … −1]'));
    grid.innerHTML = '';
    grid.append(matGrid(U,5,5,(i,j)=>{
      const inWin = Math.abs(i-ci)<=1 && Math.abs(j-cj)<=1, ctr = i===ci && j===cj, p = MA[i][j]/7;
      return U.el('button',{type:'button','aria-label':R5[i]+' '+C5[j]+' 값 '+MA[i][j],style:CELL+';cursor:pointer;font:inherit;font-family:var(--f-num);background:'+(inWin?'var(--th-soft)':heatBg(p*0.6))+';color:var(--ink);border:'+(inWin?'2px solid var(--th)':'1px solid var(--line)')+(ctr?';font-weight:700;text-decoration:underline':''),
        onclick:()=>{ if(i<1||i>3||j<1||j>3){ say(f,'info','가장자리 칸은 3×3 창이 A 밖으로 넘쳐요. 안쪽 칸(2~4행, 2~4열)을 골라 주세요.'); return; } f.hidden=true; ci=i; cj=j; draw(); }}, String(MA[i][j]));
    },{rowLabels:R5,colLabels:C5}));
    const r = at(ci,cj), c = MA[ci][cj];
    if(flt==='avg') calc.innerHTML = '출력('+(ci+1)+'행, '+(cj+1)+'열) = (1/9) × (' + r.parts.map(x=>x.join('+')).join(' + ') + ')<br>= ' + r.s + ' ÷ 9 ≈ <b>' + (r.s/9).toFixed(2) + '</b> &nbsp;(원래 A 값 ' + c + ')';
    else calc.innerHTML = '출력('+(ci+1)+'행, '+(cj+1)+'열) = 8 × ' + c + ' − (주변 8칸의 합 ' + (r.parts.flat().reduce((a,b)=>a+b,0)-c) + ')<br>= <b>' + r.s + '</b> &nbsp;(원래 A 값 ' + c + ')';
    const vals = []; for(let i=1;i<=3;i++) for(let j=1;j<=3;j++) vals.push(outVal(i,j));
    const mx = Math.max(...vals.map(Math.abs)) || 1;
    outBox.innerHTML = '';
    outBox.append(U.el('b',{text:'출력 지도 (안쪽 3×3 위치)'}), matGrid(U,3,3,(a,b)=>{ const v = outVal(a+1,b+1), p = Math.abs(v)/(flt==='avg'?7:mx);
      const bg = flt==='avg' || v>=0 ? heatBg(p) : 'color-mix(in srgb,var(--eco) '+Math.round(p*80)+'%,var(--surface))';
      return U.el('div',{style:CELL+';background:'+bg+';color:'+heatInk(p)+';border-color:'+((a+1===ci&&b+1===cj)?'var(--th)':'transparent')+';border-width:2px',text:flt==='avg'?v.toFixed(2):String(v)}); },
      {rowLabels:['행2','행3','행4'],colLabels:['열2','열3','열4']}));
    note.textContent = flt==='avg' ? '평균 필터: 9칸의 평균이 되므로 튀는 값이 이웃과 비슷해져 지도가 부드러워져요.' : '경계 검출 필터: 주변과 값이 비슷하면 0에 가깝고, 값이 급변하는 곳(온배수 경계선)에서 크게 나와요(음수는 청록색).';
  }
  host.append(fbtn, grid, f, calc, outBox, note);
  draw();
});

/* 에어컨 리바운드 계산기 */
GS.widget('carbon-rebound', function(host, o, st, U){
  const sv = Object.assign({r:30,h0:8,h1:10}, st.get('rb')||{});
  let {r,h0,h1} = sv;
  host.append(head(U,'계산기','소비전력 감소율과 사용 시간을 바꿔 리바운드율을 확인해요'));
  const out = U.el('div',{class:'tbl'}), pic = U.el('div',{}), f = fbx(U);
  function draw(){
    st.set('rb',{r,h0,h1});
    const old = 100*h0, nw = (100-r)*h1, act = (old-nw)/old*100, rb = (1 - act/r)*100, lim = old/(100-r);
    out.innerHTML = '<table><tbody>' +
      `<tr><th>하루 소비량</th><td class="n">100 × ${h0} = ${old} → ${100-r} × ${h1} = <b>${+nw.toFixed(1)}</b></td></tr>` +
      `<tr><th>예상 절감률</th><td class="n">${r}%</td></tr>` +
      `<tr><th>실제 절감률</th><td class="n">(${old} − ${+nw.toFixed(1)}) ÷ ${old} = <b>${sgn(act,1)}%</b></td></tr>` +
      `<tr><th>리바운드율</th><td class="n">1 − (${sgn(act,1)} ÷ ${r}) ≈ <b>${Math.round(rb)}%</b></td></tr></tbody></table>`;
    const W=640, H=110, mx = Math.max(old, nw)*1.1, bw = v => v/mx*(W-150);
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="기존과 새 에어컨 하루 소비량 비교"><text x="0" y="34" font-size="13" fill="var(--muted)">기존</text><rect x="110" y="18" width="${bw(old)}" height="24" rx="4" fill="var(--muted)"/><text x="${116+bw(old)}" y="35" font-size="13" fill="var(--ink)">${old}</text><text x="0" y="84" font-size="13" fill="var(--muted)">으뜸효율</text><rect x="110" y="68" width="${bw(nw)}" height="24" rx="4" fill="${nw>old?'var(--bad)':'var(--th)'}"/><text x="${116+bw(nw)}" y="85" font-size="13" fill="var(--ink)">${+nw.toFixed(1)}</text></svg>`;
    if(nw>old) say(f,'bad','<b>백파이어!</b> 리바운드율이 100%를 넘어 효율을 높였는데도 소비가 오히려 늘었어요(제번스의 역설).');
    else say(f,'info','새 사용 시간이 ' + lim.toFixed(1) + '시간(= ' + old + ' ÷ ' + (100-r) + ')을 넘으면 리바운드율이 100%를 넘어요. 실증 연구의 직접 리바운드는 대략 10~30%예요(Sorrell, 2007).');
  }
  host.append(
    slider(U,'소비전력 감소율',10,60,5,r,v=>{ r=v; draw(); },v=>v+'%'),
    slider(U,'기존 사용 시간',1,12,1,h0,v=>{ h0=v; draw(); },v=>v+'시간'),
    slider(U,'새 사용 시간',1,16,0.5,h1,v=>{ h1=v; draw(); },v=>v+'시간'),
    pic, out, f);
  draw();
});

/* 4가구 자료(교육용): u = w·e, 손실함수 L(w) */
const HE = [0.10,0.20,0.30,0.40], HU = [0.05,0.12,0.17,0.25];
const LW = w => HE.reduce((t,e,i)=>t+Math.pow(w*e-HU[i],2),0)/4;
const dLW = w => 0.15*w - 0.09;

/* 경사하강법 · 학습률 실험 */
GS.widget('carbon-gd', function(host, o, st, U){
  let eta = st.get('eta') || 5, path = [0];
  host.append(head(U,'학습률 실험','학습률 η를 바꾸며 w₀ = 0에서 한 걸음씩 내려가 보세요'));
  const pic = U.el('div',{}), tb = U.el('div',{class:'tbl'}), status = U.el('div',{class:'fb info'});
  function draw(){
    st.set('eta', eta);
    const W=640, H=280, P={l:46,r:12,t:22,b:36}, wmin=-1, wmax=2.2, Lmax=0.2;
    const sx = v => P.l + (v-wmin)/(wmax-wmin)*(W-P.l-P.r), sy = L => P.t + (1-L/Lmax)*(H-P.t-P.b);
    let s = '';
    [0,0.05,0.1,0.15,0.2].forEach(L=>{ s += `<line x1="${P.l}" x2="${W-P.r}" y1="${sy(L)}" y2="${sy(L)}" stroke="var(--line)"/><text x="${P.l-5}" y="${sy(L)+4}" font-size="11" text-anchor="end" fill="var(--muted)">${L}</text>`; });
    [-1,-0.5,0,0.5,1,1.5,2].forEach(v=>{ s += `<text x="${sx(v)}" y="${H-P.b+16}" font-size="11" text-anchor="middle" fill="var(--muted)">${v}</text>`; });
    let d = ''; for(let k=0;k<=320;k++){ const v = wmin + k/100; d += (d?'L':'M')+sx(v)+' '+sy(Math.min(LW(v),Lmax)); }
    s += `<path d="${d}" fill="none" stroke="var(--muted)" stroke-width="2.5"/><line x1="${sx(0.6)}" x2="${sx(0.6)}" y1="${sy(0)}" y2="${sy(0.03)}" stroke="var(--ok)" stroke-dasharray="3 3"/><text x="${sx(0.6)}" y="${sy(0.03)-4}" font-size="11" text-anchor="middle" fill="var(--ok)">w* = 0.6</text>`;
    const vis = path.filter(v=>v>=wmin && v<=wmax);
    for(let k=1;k<path.length;k++){ const a=path[k-1], b=path[k]; if(a<wmin||a>wmax||b<wmin||b>wmax) continue; s += `<line x1="${sx(a)}" y1="${sy(LW(a))}" x2="${sx(b)}" y2="${sy(LW(b))}" stroke="var(--climate)" stroke-width="2"/>`; }
    path.forEach((v,k)=>{ if(v<wmin||v>wmax) return; s += `<circle cx="${sx(v)}" cy="${sy(LW(v))}" r="${k===path.length-1?7:4.5}" fill="${k===path.length-1?'var(--climate)':'var(--th)'}"/><text x="${sx(v)}" y="${sy(LW(v))-10}" font-size="11" text-anchor="middle" fill="var(--ink)">${k}</text>`; });
    s += `<text x="${W-P.r}" y="${H-4}" font-size="11" text-anchor="end" fill="var(--muted)">w</text><text x="${P.l}" y="${P.t-8}" font-size="11" fill="var(--muted)">L(w)</text>`;
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="경사하강법 경로">${s}</svg>`;
    let rows = '';
    for(let k=0;k<path.length-1;k++){ const a = path[k]; rows += `<tr><th>${k} → ${k+1}</th><td class="n">${a.toFixed(4)}</td><td class="n">${dLW(a).toFixed(6)}</td><td class="n">${path[k+1].toFixed(4)}</td></tr>`; }
    tb.innerHTML = '<table><thead><tr><th>단계</th><th class="n">현재 w</th><th class="n">L′(w) = 0.15w − 0.09</th><th class="n">다음 w = w − η·L′(w)</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4">‘한 걸음’을 눌러 시작해요.</td></tr>') + '</tbody></table>';
    const fct = 1 - 0.15*eta;
    if(eta > 2/0.15){ status.className='fb bad'; status.innerHTML='η = '+eta+' → <b>발산</b>: 한 걸음이 너무 커서 바닥을 넘어 점점 멀어져요(η > 2/0.15 ≈ 13.3).' + (path.length>vis.length?' 일부 점은 그래프 밖으로 튕겨 나갔어요.':''); }
    else if(fct < 0){ status.className='fb info'; status.innerHTML='η = '+eta+' → <b>진동하며 수렴</b>: 바닥(0.6)을 넘나들며 다가가요.'; }
    else { status.className='fb ok'; status.innerHTML='η = '+eta+' → <b>차분히 수렴</b>: 한쪽에서 바닥(0.6)으로 다가가요.'; }
  }
  function step(n){ for(let k=0;k<n;k++){ const w = path[path.length-1]; if(Math.abs(w)>1e4 || path.length>40) break; path.push(w - eta*dLW(w)); } draw(); }
  host.append(slider(U,'학습률 η',1,16,0.5,eta,v=>{ eta=v; path=[0]; draw(); }),
    U.el('div',{class:'row'},
      U.el('button',{type:'button',class:'btn sm pri',onclick:()=>step(1)},'한 걸음'),
      U.el('button',{type:'button',class:'btn sm',onclick:()=>step(5)},'다섯 걸음'),
      U.el('button',{type:'button',class:'btn sm',onclick:()=>{ path=[0]; draw(); }},'처음부터 (w₀ = 0)'),
      [5,10,15].map(v=>U.el('button',{type:'button',class:'chip',onclick:()=>{ eta=v; path=[0]; host.querySelector('input[type=range]').value=v; host.querySelector('.slider .num').textContent=v; draw(); }},'η = '+v))),
    status, pic, tb);
  draw();
});


/* =====================================================================
   1~2차시 · 슬기로운 탄소중립 생활 (초등, 80분) — v3
   공식 흐름: 여러 가지 기체 떠올리기 → 탄소중립이란? → 탄소중립 찾기 → 탄소중립 실천하기
   기준: 통합 지도안 [1~2차시/6차시] · 워크북 1~2쪽(활동지 1~5) · 교사 PPT 24장
   ===================================================================== */
GS.lesson({
  id:'c12', theme:'carbon', order:1, period:'1~2차시', periods:2, level:'초등', minutes:80,
  title:'슬기로운 탄소중립 생활',
  question:'탄소중립을 위해 우리가 할 수 있는 일은 무엇일까요?',
  goals:['탄소중립의 개념을 알 수 있어요.','우리가 직접 실천할 수 있는 기후행동을 찾아 포스터를 제작할 수 있어요.'],
  standards:[
    '[4과15-03] 일상생활에서 이용되는 기체의 종류와 성질을 조사하고, 여러 가지 기체에 대해 흥미를 느낄 수 있다.',
    '[4과16-01] 기후변화 현상의 예를 알고, 기후변화가 인간의 활동과 관련되어 있음을 토의할 수 있다.',
    '[4과16-03] 기후변화 대응 방법을 조사하고, 생활 속에서 기후변화 대응 방법을 실천할 수 있다.'
  ],
  prep:[
    '준비물: PPT, 학생 워크북, 디지털 기기, 캔바 템플릿, 색연필 (교육대상 초등 20~25명 · 교실)',
    '4인 1모둠으로 편성하고 태블릿 충전 상태와 캔바 모둠 템플릿 링크를 미리 점검한다.',
    '기후행동 실천포털 접속 여부와 QR 코드가 탄소 감축량 계산 페이지로 연결되는지를 미리 확인한다.',
    '안전 지도(도입 5′): 태블릿은 두 손으로 옮기고 책상 가운데에 두고 사용한다. 캔바 포스터에 얼굴 사진, 실명 등 개인정보를 올리지 않는다(활동3 포스터 제작 전에 다시 상기).',
    '학생 사전 과제: 집과 학교에서 전기를 쓰거나 쓰레기를 버리는 모습을 떠올려 온다.',
    '☆ PPT 내 ‘전국민 중독송’ 영상 · ☆ 활동지(워크북 1~2쪽) · ★ 캔바 템플릿 · 만 13세 미만은 교사가 개설한 Canva for Education 학급 계정으로 참여'
  ],
  assess:[],
  history:[
    {src:'media/c12/s03-07.jpg', title:'쓰레기를 태우는 소각', fact:'쓰레기 처리장에서 쓰레기를 불에 태우는 소각 과정에서 탄소가 배출돼요.', credit:'교사 제작 PPT 수록 자료 (슬라이드 3·9)'},
    {src:'media/c12/s03-04.jpg', title:'광합성을 하는 숲', fact:'숲의 나무들은 광합성을 통해 이산화탄소를 흡수해요.', credit:'교사 제작 PPT 수록 자료 (슬라이드 3·8)'},
    {src:'media/c12/s03-06.jpg', title:'고래가 사는 바다', fact:'고래가 살고 있는 바다는 사람이 배출한 이산화탄소의 약 4분의 1을 흡수해요(활동지 2번).', credit:'교사 제작 PPT 수록 자료 (슬라이드 3·10)'}
  ],
  steps:[
    { id:'gas', phase:'도입', minutes:5, move:'관찰',
      title:'여러 가지 기체 떠올리기',
      purpose:'오늘 배울 ‘탄소중립’의 주인공이 어떤 기체인지 먼저 알아야 해요.',
      how:['슬라이드의 기체(수소·산소·이산화탄소·질소·메탄) 가운데 아는 것을 말해요.','불·비행기 사진과 숲·고래 사진을 보고 OO에 들어갈 말을 생각해요.','OO와 관계있는 기체를 골라요.'],
      outcome:'불을 태우고 비행기가 날 때 나오고, 나무와 바다가 빨아들이는 기체가 <b>이산화탄소</b>라는 것을 알게 돼요.',
      prompt:'불·비행기와 숲·고래, 두 그림에 함께 숨어 있는 기체는 무엇일까요?',
      lead:'위 그림은 이 기체를 <b>내보내고</b>, 아래 그림은 <b>빨아들여요</b>.',
      visual:{src:'slides/c12/s03.jpg', alt:'불과 비행기 사진, 숲과 고래 사진 옆에 OO 빈칸이 있는 두 문장', cap:'생각 열기 · OO에 들어갈 말은? (교사 제작 PPT 슬라이드 3)'},
      layout:'split',
      teacher:{
        ask:['우리가 마시는 공기에는 어떤 기체들이 섞여 있을까요?','요즘 인간의 여러 활동 때문에 공기 중에 ‘이것’이 점점 많아지면서 지구가 뜨거워지고 있습니다. ‘이것’은 무엇일까요?','우리 주변에서는 이산화탄소가 배출되기도 하고 흡수되기도 합니다. 오늘은 이에 관해 자세히 알아봅시다.'],
        answer:['산소 / 이산화탄소 / 질소가 있습니다.','이산화탄소입니다.'],
        tip:['수업 시작 전 디지털 기기 안전 약속을 함께 읽고 확인해요(5′).','메탄, 산소 등 평소 알고 있는 배경지식을 자유롭게 말하도록 허용적인 분위기를 만들어요.','‘탄소’는 원소이며 기체가 아니므로, 공기 중에 점점 많아지는 기체는 ‘이산화탄소’임을 분명히 짚어 줘요.'],
        link:'이산화탄소가 나오는 곳과 빨아들이는 곳이 있다는 데서 출발해, 다음 장면에서 탄소중립의 뜻을 찾아요.'},
      blocks:[
        {t:'write', id:'c12-gases', q:'내가 알고 있는 기체를 모두 적어 보세요.', rows:1, placeholder:'예: 산소, …', example:'산소, 이산화탄소, 질소, 수소, 메탄'},
        {t:'choice', id:'c12-gas', q:'OO와 관계있는 기체를 골라요.', options:['산소','수소','이산화탄소','질소','메탄'], answer:2,
          hints:['나무가 광합성을 할 때 빨아들이는 기체예요.','기체 이름 속에 ‘탄소’가 들어 있어요.'],
          why:'왜 그 기체라고 생각했나요? 한 문장으로 써요.',
          explain:'이산화탄소예요. PPT에서는 OO를 ‘탄소’라고 줄여 불렀어요. 탄소는 원소이고, 공기 속에서 점점 많아지는 기체는 이산화탄소예요.'},
        {t:'slides', from:2, to:4, title:'생각 열기 — 여러 가지 기체'}
      ]},

    { id:'song', phase:'전개 1', minutes:8, move:'관찰',
      title:'탄소중립이란? ① 노래 속 낱말과 흡수·배출',
      purpose:'이산화탄소가 어디서 나오고 어디로 들어가는지 알아야 ‘탄소중립’이라는 말을 이해할 수 있어요.',
      how:['기후에너지환경부 ‘전국민 중독송’을 보며 ㉠~㉣에 들어갈 낱말을 찾아요(활동지 1번).','노래를 보고 느낀 점을 한 줄로 나눠요.','네 장면이 탄소를 흡수하는지 배출하는지 나눠요(활동지 2번).'],
      outcome:'숲과 바다는 탄소를 <b>흡수</b>하고, 소각과 비행기 여행은 탄소를 <b>배출</b>한다는 것을 알게 돼요. 이제 두 양을 저울에 올려 비교해요.',
      prompt:'노래가 여러 번 외치는 말은 무엇이고, 탄소를 내보내는 일과 빨아들이는 일은 무엇일까요?',
      visual:{src:'media/c12/s03-06.jpg', alt:'푸른 바다 위로 고래 꼬리가 솟아오른 사진', cap:'고래가 사는 바다 · 교사 제작 PPT 수록 사진 (슬라이드 10)'},
      teacher:{
        ask:['가사의 빈칸에는 어떤 단어가 들어가나요?','전국민 중독송을 보고 느낀 점을 나누어 봅시다.','활동지 2번을 보고 탄소 배출과 탄소 흡수에 대해 생각해 봅시다.'],
        answer:['이상기후 / 지구온난 / 대중교통 / 탄소중립입니다.','노래가 흥미로워서 눈길이 갑니다. / 탄소중립이라는 말이 어떤 뜻인지 궁금합니다.','쓰레기 처리장에서 쓰레기를 불에 태우는 소각 과정에서 탄소를 배출합니다.','고래가 살고 있는 바다는 사람이 배출한 이산화탄소의 약 4분의 1을 흡수합니다.'],
        tip:['가사 속 ‘지구온난’은 정확한 용어인 ‘지구온난화’로 보충 설명해요.','활동지의 ‘세계 탄소의 25%’는 ‘사람이 배출한 이산화탄소의 약 4분의 1’이라는 뜻으로 풀어 설명해요.','영상은 PPT 6번(활동지 1번), 정답은 7번, 흡수·배출 문항은 8~11번 슬라이드예요.'],
        link:'흡수와 배출을 구분했으니, 다음 장면에서 두 양이 같아지는 상태(순 배출량 0)를 저울로 확인해요.'},
      blocks:[
        {t:'video', yt:'5BvEl_OFBx8', title:'전국민 중독송 (기후에너지환경부)', note:'지도안 활동1 영상. 노래를 들으며 활동지 1번의 ㉠~㉣을 채워요.'},
        {t:'blanks', id:'c12-song', ws:'활동지 1', q:'노래를 듣고 ㉠~㉣에 들어갈 낱말을 채워요.',
          text:'㉠ 날씨가 평소와 다르게 이상해지는 것: [[이상기후]]<br>㉡ 지구가 점점 뜨거워지는 것: [[지구온난|지구온난화]]<br>㉢ 버스·지하철처럼 여럿이 함께 타는 교통: [[대중교통]]<br>㉣ ‘2050’과 함께 여러 번 나오는 말: [[탄소중립]]',
          hints:['㉣은 오늘 수업 제목에 들어 있어요.'], explain:'노래에서는 ㉡을 ‘지구온난’이라고 줄여 불러요. 정확한 말은 ‘지구온난화’예요. ㉣ 탄소중립이 오늘 배울 말이에요.'},
        {t:'write', id:'c12-feel', q:'전국민 중독송을 보고 느낀 점을 한 줄로 써요.', rows:1, example:'노래가 재미있어서 ‘탄소중립’이 무슨 뜻인지 궁금해졌어요.'},
        {t:'gallery', title:'PPT 속 네 장면 (눌러서 크게 보기)', items:[
          {src:'media/c12/s03-04.jpg', cap:'숲의 나무들'},{src:'media/c12/s03-07.jpg', cap:'쓰레기 소각'},{src:'media/c12/s03-06.jpg', cap:'고래가 사는 바다'},{src:'media/c12/s03-05.jpg', cap:'비행기 여행'}]},
        {t:'sort', id:'c12-sort', ws:'활동지 2', q:'탄소 흡수와 탄소 배출 중 무엇에 해당하는지 알맞은 칸에 놓아요.', bins:['흡수','배출'], items:[
          {text:'1) 숲의 나무들은 광합성을 통해 이산화탄소를 …', bin:0},
          {text:'2) 쓰레기 처리장에서 쓰레기를 불에 태우는 소각 과정에서 탄소를 …', bin:1},
          {text:'3) 고래가 살고 있는 바다는 세계 탄소의 25%를 …', bin:0},
          {text:'4) 비행기를 타고 해외여행을 가는 과정에서 탄소를 …', bin:1}
        ], explain:'1) 흡수 2) 배출 3) 흡수 4) 배출. 나무와 바다는 탄소를 빨아들이고, 무언가를 태우거나 연료를 쓰면 탄소가 나와요.'},
        {t:'slides', from:6, to:11, title:'노래 정답과 흡수·배출 확인'}
      ]},

    { id:'zero', phase:'전개 1', minutes:7, move:'예측',
      title:'탄소중립이란? ② 순 배출량 0',
      purpose:'배출하는 쪽과 흡수하는 쪽을 알았으니, 둘이 어떤 관계일 때 ‘중립’인지 따져 봐요.',
      how:['저울을 수평으로 만드는 방법을 먼저 예측해요.','저울 놀이에서 배출·흡수 카드를 올리고 내려 수평을 만들어요.','탄소중립의 뜻을 빈칸에 채워 완성해요(활동지 3번).'],
      outcome:'탄소중립은 배출을 0으로 만드는 것이 아니라, 배출한 만큼 흡수해 <b>순 배출량이 0</b>이 되는 것임을 알게 돼요. 다음 장면부터 우리 집·학교에서 배출을 줄일 곳을 찾아요.',
      prompt:'배출 쪽이 더 무거울 때, 저울을 수평으로 만드는 방법은 무엇일까요?',
      visual:{src:'media/c12/s12-11.jpg', alt:'탄소흡수와 탄소배출이 양쪽에 올라간 저울과 가운데 CO₂ 눈금 그림', cap:'탄소중립 저울 · 사진 출처: 기후행동 1.5 (c-action.kr), 교사 제작 PPT 슬라이드 12'},
      layout:'split',
      teacher:{
        ask:['탄소중립의 의미에 대해 알아봅시다. 저울이 수평이 되려면 어떻게 해야 할까요?'],
        answer:['배출을 줄이거나 흡수를 늘립니다.','이산화탄소 순 배출량이 0이 되는 것입니다.'],
        tip:['온실가스 배출량에서 흡수량을 뺀 순배출량이 ‘0’이 되는 상태(「탄소중립기본법」의 정의)를 초등 수준에 맞게 간략히 설명해요.','저울 놀이의 탄소 덩어리 수는 양을 비교하려고 정한 놀이용 단위예요(실제 수치 아님).'],
        link:'뜻을 알았으니 이제 ‘배출을 줄이는 쪽’을 우리 집에서 찾아봐요.'},
      blocks:[
        {t:'predict', id:'c12-bal-pred', q:'저울을 수평으로 만드는 방법을 골라요.', options:['배출을 줄인다','흡수를 늘린다','둘 다 할 수 있다','탄소를 하나도 배출하지 않아야만 한다'],
          compare:'내 생각과 저울 놀이 결과가 같았나요? 알게 된 점을 한 줄로 써요.',
          reveal:[
            {t:'widget', name:'carbon-balance'},
            {t:'blanks', id:'c12-mean', ws:'활동지 3', q:'탄소중립의 의미를 완성해요.',
              text:'[[탄소중립]] : 이산화탄소 순 배출량이 ( [[0|영]] )이 되는 것<br>화석연료 사용 등 온실가스 ( [[배출]] )량이 이산화탄소 ( [[흡수]] )량과 균형을 이뤄 대기 중 이산화탄소 농도가 더 높아지지 않는 것',
              hints:['저울이 수평일 때 ‘배출 − 흡수’는 얼마였나요?'],
              explain:'배출한 만큼 흡수해서 남는 양이 0이 되면 ‘중립’이에요.'}
          ]},
        {t:'slides', from:12, to:13, title:'탄소중립의 의미'}
      ]},

    { id:'home', phase:'전개 2', minutes:10, move:'관찰',
      title:'탄소중립 찾기 ① 우리 집',
      purpose:'탄소중립의 뜻을 알았으니, 우리 집 어디에서 배출을 줄일 수 있는지 찾아봐요.',
      how:['집 그림에서 조명·텔레비전·세탁기·밥솥·창문을 하나씩 살펴요.','배출을 줄이는 행동을 모두 골라요(활동지 4번: 종이에는 색칠).','세 행동 중 어느 것이 이산화탄소를 가장 많이 줄일지 예측하고 실제 숫자를 확인해요.'],
      outcome:'전기를 아끼는 작은 행동에도 실제 감축량이 있고, 행동마다 크기가 다르다는 것을 알게 돼요. 같은 눈으로 학교를 살펴봐요.',
      prompt:'이 집에서 탄소 배출을 줄일 수 있는 행동은 어디에 숨어 있을까요?',
      visual:{src:'media/c12/s14-13.jpg', alt:'침실·거실·부엌이 이어진 집 그림. 조명, 텔레비전, 세탁기, 냉장고, 전기밥솥, 창문이 보여요.', cap:'우리 집 그림 · 교사 제작 PPT 슬라이드 14 (활동지 4번 색칠 그림의 컬러판)'},
      teacher:{
        ask:['우리가 노력하면 집에서 탄소 배출을 줄일 수 있어요. 탄소 배출을 줄일 수 있는 행동과 관련된 모습을 찾아 색칠해 봅시다.','왜 텔레비전 시청 시간을 줄이거나 빈 방의 불을 끄는 것이 지구가 더 더워지는 것을 막는 데 도움이 될까?'],
        answer:['세탁기가 관련이 있을 것 같습니다. / 불필요한 조명을 끄는 행동과 관련이 있을 것 같습니다.'],
        tip:['종이 활동지에는 색연필로 색칠하게 하고, 웹에서는 고르기로 확인해요.','정답은 PPT 16번, 실제 감축 효과는 17번 슬라이드(출처: 탄소중립 생활 실천 안내서 | 가정의 탄생, 한국환경보전원).'],
        link:'집에서 찾은 눈으로 다음 장면에서 학교를 살펴봐요.'},
      blocks:[
        {t:'choice', id:'c12-home', ws:'활동지 4', q:'집에서 탄소 배출을 줄이는 행동을 <b>모두</b> 골라요.', options:[
          '불필요한 조명기구 소등하기','빈 방에 불을 켜 두기','전기밥솥 보온 시간 줄이기','텔레비전 시청 시간 줄이기','보지 않는 텔레비전 켜 두기','세탁기 사용 횟수 줄이기','창틀과 문틈 바람막이 설치하기','고효율 가전제품 사용하기'], answer:[0,2,3,5,6,7],
          hints:['전기를 <b>덜 쓰게</b> 만드는 행동을 찾아요.','창틈으로 바람이 새면 냉난방에 에너지가 더 들어요. 정답은 6개예요.'],
          explain:'PPT 정답 그림의 여섯 곳이에요. 전기와 냉난방 에너지를 덜 쓰면, 그 에너지를 만들 때 나오는 탄소도 줄어요.'},
        {t:'predict', id:'c12-home-pred', q:'세 행동 중 이산화탄소를 가장 많이 줄이는 것은?', options:['불필요한 조명 소등하기','전기밥솥 보온 시간 줄이기','텔레비전 시청 시간 줄이기'],
          compare:'내 예측과 같았나요? 숫자를 보고 놀라운 점을 한 줄로 써요.',
          reveal:[
            {t:'visual', src:'slides/c12/s17.jpg', alt:'조명 소등 이산화탄소 251kg·112,794원, 전기밥솥 보온 줄이기 458kg·205,544원, 텔레비전 시청 줄이기 73kg·32,609원', cap:'출처: 탄소중립 생활 실천 안내서 | 가정의 탄생, 한국환경보전원 (교사 제작 PPT 슬라이드 17)'},
            {t:'write', id:'c12-why', q:'빈 방의 불을 끄면 왜 지구가 덜 더워질까요?', rows:2, placeholder:'전기를 덜 쓰면 …', example:'전기를 덜 쓰면 전기를 만들 때 나오는 탄소가 줄어서 지구가 덜 더워져요.'}
          ]},
        {t:'slides', from:14, to:17, title:'우리 집 탄소중립 찾기 — 정답과 효과'}
      ]},

    { id:'school', phase:'전개 2', minutes:10, move:'판단',
      title:'탄소중립 찾기 ② 우리 학교',
      purpose:'집에서 찾은 방법이 학교에서도 통하는지, 학교만의 행동은 무엇인지 찾아봐요.',
      how:['학교 그림에서 수돗가·분리배출함·급식 식탁·텃밭을 살펴요.','배출을 줄이는 행동을 모두 골라요(활동지 4번).','세 행동 중 가장 많이 줄이는 것을 예측하고 실제 숫자를 확인해요.'],
      outcome:'물을 아끼고, 먹을 만큼만 담고, 분리배출하는 행동이 모두 탄소를 줄이며, 분리배출의 효과가 특히 크다는 것을 알게 돼요. 이제 내가 실천할 행동을 골라요.',
      prompt:'학교에서는 어떤 행동이 탄소를 가장 많이 줄일까요?',
      visual:{src:'media/c12/s18-16.jpg', alt:'텃밭, 수돗가, 급식 식탁, 분리배출함이 있는 학교 그림', cap:'우리 학교 그림 · 교사 제작 PPT 슬라이드 18 (활동지 4번 색칠 그림의 컬러판)'},
      teacher:{
        ask:['우리가 노력하면 학교에서 탄소 배출을 줄일 수 있어요. 탄소 배출을 줄일 수 있는 행동과 관련된 모습을 찾아 색칠해 봅시다.'],
        answer:['텃밭 채소가 관련이 있을 것 같습니다. / 분리배출하는 모습이 관련이 있을 것 같습니다.'],
        tip:['정답은 PPT 20번, 실제 감축 효과는 21번 슬라이드(출처: 탄소중립 생활 실천 안내서 | 학교의 탄생, 한국환경보전원).','슬라이드의 t는 ‘톤’(1t = 1,000kg)이에요.'],
        link:'집과 학교에서 찾은 행동 가운데 내가 할 것을 골라 다음 장면에서 감축량을 직접 계산해요.'},
      blocks:[
        {t:'choice', id:'c12-school', ws:'활동지 4', q:'학교에서 탄소 배출을 줄이는 행동을 <b>모두</b> 골라요.', options:[
          '물을 절약한다(양치컵 쓰기)','물을 틀어 놓고 양치하기','재활용을 위한 분리배출을 실천한다','쓰레기를 한 봉투에 섞어 버리기','음식은 먹을 만큼만 담는다','급식을 많이 담고 남기기','교내에서 텃밭 채소를 길러 본다'], answer:[0,2,4,6],
          hints:['아끼고, 다시 쓰고, 덜 버리는 행동을 찾아요.','그림 속 수돗가·분리배출함·식탁·텃밭을 하나씩 보세요.'],
          why:'고른 행동 하나가 왜 탄소를 줄이는지 한 문장으로 써요.',
          explain:'PPT 정답 그림의 네 곳이에요. 물과 자원을 아끼고 쓰레기를 줄이면 탄소가 줄어요.'},
        {t:'predict', id:'c12-school-pred', q:'세 행동 중 이산화탄소를 가장 많이 줄이는 것은?', options:['양치컵을 사용해서 물 줄이기','음식을 먹을 만큼만 담기','올바르게 분리배출하기'],
          compare:'내 예측과 같았나요? 분리배출이 가장 크게 줄이는 까닭을 생각해 써요.',
          reveal:[
            {t:'visual', src:'slides/c12/s21.jpg', alt:'양치컵 사용 이산화탄소 감축량 0.1t, 먹을 만큼 담기 0.2t, 올바른 분리배출 9t', cap:'출처: 탄소중립 생활 실천 안내서 | 학교의 탄생, 한국환경보전원 (교사 제작 PPT 슬라이드 21)'}
          ]},
        {t:'slides', from:18, to:21, title:'우리 학교 탄소중립 찾기 — 정답과 효과'}
      ]},

    { id:'portal', phase:'전개 3', minutes:12, move:'실천',
      title:'탄소중립 실천하기 ① 기후행동 실천포털에서 계산하기',
      purpose:'집과 학교에서 찾은 행동 가운데 내가 정말 할 행동을 고르고, 얼마나 줄어드는지 직접 계산해 봐요.',
      how:['행동 카드를 세 영역(에너지 절약·친환경 교통·자원 순환)으로 나눠요.','선생님이 알려 준 QR로 기후행동 실천포털에 들어가요.','영역마다 행동 1가지를 골라 포털에 나온 계산식과 결과를 옮겨 적어요(활동지 5번).'],
      outcome:'내가 고른 행동이 얼마나 줄이는지 숫자로 알게 되고, 모둠 포스터에 쓸 근거가 생겨요.',
      prompt:'세 영역에서 내가 실천할 수 있는 기후행동은 무엇이고, 얼마나 줄일 수 있을까요?',
      lead:'포털 주소는 활동지·PPT의 QR로 접속해요. 계산식과 결과는 포털에 나온 그대로 옮겨요.',
      visual:{src:'slides/c12/s22.jpg', alt:'탄소중립을 실천하면 어느 정도의 효과일까? 직접 계산해 보고 효과를 알아보세요! 문구와 기후행동 실천포털 QR', cap:'활동지 5번 · 기후행동 실천포털 QR (교사 제작 PPT 슬라이드 22)'},
      teacher:{
        ask:['‘에너지 절약’ 측면에서 내가 실천할 수 있는 기후행동은 어떤 것이 있나요?','‘친환경 교통’ 측면에서 내가 실천할 수 있는 기후행동은 어떤 것이 있나요?','‘자원 순환’ 측면에서 내가 실천할 수 있는 기후행동은 어떤 것이 있나요?'],
        answer:['세탁기 사용 횟수 줄이기입니다. / 텔레비전 시청 시간 줄이기입니다.','가까운 거리는 걷거나 자전거 이용하기입니다. / 불필요한 짐 싣지 않기입니다.','비닐 사용 줄이기입니다. / 음식물 쓰레기 줄이기입니다.'],
        tip:['기후행동 실천포털 접속 여부와 QR이 탄소 감축량 계산 페이지로 연결되는지 미리 확인해요.'],
        link:'계산한 행동 가운데 하나를 골라 다음 장면에서 모둠 포스터로 알려요.'},
      blocks:[
        {t:'sort', id:'c12-areas', q:'각 행동은 어느 영역일까요?', bins:['에너지 절약','친환경 교통','자원 순환'], items:[
          {text:'세탁기 사용 횟수 줄이기', bin:0},
          {text:'텔레비전 시청 시간 줄이기', bin:0},
          {text:'가까운 거리는 걷거나 자전거 이용하기', bin:1},
          {text:'불필요한 짐 싣지 않기', bin:1},
          {text:'비닐 사용 줄이기', bin:2},
          {text:'음식물 쓰레기 줄이기', bin:2}
        ], explain:'전기를 아끼면 에너지 절약, 이동 방법을 바꾸면 친환경 교통, 물건을 아끼고 덜 버리면 자원 순환이에요.'},
        {t:'write', id:'c12-act-energy', ws:'활동지 5', q:'<에너지 절약> 내가 실천할 행동과 포털의 계산식·결과', rows:3, placeholder:'행동:\n계산식:\n결과:', example:'행동: 세탁기 사용 횟수 줄이기 / 계산식·결과: 포털에 나온 식과 숫자를 그대로 옮겨요.'},
        {t:'write', id:'c12-act-move', ws:'활동지 5', q:'<친환경 교통> 내가 실천할 행동과 포털의 계산식·결과', rows:3, placeholder:'행동:\n계산식:\n결과:', example:'행동: 가까운 거리는 걷거나 자전거 이용하기 / 계산식·결과: 포털에 나온 그대로'},
        {t:'write', id:'c12-act-cycle', ws:'활동지 5', q:'<자원 순환> 내가 실천할 행동과 포털의 계산식·결과', rows:3, placeholder:'행동:\n계산식:\n결과:', example:'행동: 비닐 사용 줄이기 / 계산식·결과: 포털에 나온 그대로'},
        {t:'slides', from:22, to:22, title:'기후행동 실천포털 안내'}
      ]},

    { id:'poster', phase:'전개 3 · 정리', minutes:28, move:'성찰',
      title:'탄소중립 실천하기 ② 모둠 포스터 만들고 나누기',
      purpose:'내가 찾은 행동과 숫자를 친구들에게 알리면, 실천이 우리 반 전체로 퍼져요.',
      how:['모둠에서 알릴 기후행동 1가지와 근거(오늘 본 숫자)를 정하고 역할을 나눠요.','캔바 QR 접속 → 파일 · 사본 만들기 → 우리 모둠 포스터 만들기 → 선생님께 제출','다른 모둠 포스터를 감상하고, 오늘 새롭게 알게 된 점을 적어요.'],
      outcome:'탄소중립의 뜻(순 배출량 0)과 우리가 실천할 수 있는 기후행동을 한 장의 포스터와 내 학습지로 정리해요.',
      prompt:'우리 모둠은 어떤 기후행동을, 어떤 근거로 알릴까요?',
      visual:{src:'media/c12/s23-20.jpg', alt:'‘탄소중립을 위한 기후행동’ 제목, 사진 칸, 행동 이름과 한 마디를 적는 칸이 있는 포스터 템플릿', cap:'캔바 포스터 템플릿 · 교사 제작 PPT 슬라이드 23 (QR은 선생님이 안내)'},
      layout:'split',
      teacher:{
        ask:['모둠별로 우리가 알리고 싶은 기후행동 1가지를 골라 포스터를 제작해 봅시다.','오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?','다른 모둠이 완성한 포스터를 감상하고 느낀 점을 공유해 봅시다.'],
        answer:['모둠에서 역할을 나누어 기후행동 포스터를 완성한다.','탄소중립의 개념에 대해 알게 되었습니다.','탄소중립을 위해 우리가 실천할 수 있는 기후행동에 대해 알게 되었습니다.'],
        tip:['포스터 제작 시 모둠 활동에서 소외되는 학생이 없도록 역할을 분담해요.','만 13세 미만 학생은 교사가 개설한 Canva for Education 학급 계정으로 참여해요.','포스터에 얼굴 사진·실명 등 개인정보를 올리지 않도록 다시 상기시켜요.','다른 모둠의 포스터를 감상하며 탄소중립의 개념을 다시 한번 정리해요(정리 10′).'],
        link:'포스터 감상으로 수업 전체(기체 → 순 배출량 0 → 집·학교 → 실천)를 다시 묶어요.'},
      blocks:[
        {t:'timer', minutes:18, label:'모둠 포스터 시간'},
        {t:'cer', id:'c12-poster', kind:'포스터 기획', q:'우리 모둠이 알릴 기후행동과 그 근거', starters:{c:'우리 모둠은 ___을(를) 알릴 거예요. 한 마디: “___”', e:'오늘 본 숫자나 사실: ___', r:'이 행동을 하면 ___ 때문에 지구에 도움이 돼요.'},
          example:'주장: 전기밥솥 보온 시간 줄이기를 알릴 거예요. 한 마디: “밥은 먹을 때 데워요!” 근거: 보온 시간을 줄이면 이산화탄소를 458kg 줄일 수 있대요. 이유: 전기를 덜 쓰면 전기를 만들 때 나오는 탄소가 줄어요.'},
        {t:'slides', from:23, to:23, title:'포스터 만들기 방법'},
        {t:'write', id:'c12-gallery', q:'다른 모둠 포스터를 감상하고 느낀 점을 써요.', rows:2, example:'○모둠 포스터는 분리배출로 9t을 줄일 수 있다는 숫자를 크게 써서 눈에 잘 들어왔어요.'},
        {t:'write', id:'c12-learned', q:'오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?', rows:2, example:'탄소중립은 배출한 만큼 흡수해서 순 배출량을 0으로 만드는 것이라는 걸 알게 되었어요.'},
        {t:'reflect', id:'c12-exit', items:['오늘 새롭게 알게 된 점 한 가지','이번 주에 꼭 해 볼 기후행동 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/c12-more-balance.jpg', tag:'사이트', title:'기후행동 1.5', text:'오늘 본 탄소중립 저울 그림의 출처예요(교사 PPT 12번 슬라이드).', url:'https://c-action.kr'},
          {img:'img/c12-more-energy.jpg', tag:'집에서', title:'우리 집 숨은 행동 이어 찾기', text:'오늘 찾은 행동(조명 끄기·밥솥 보온 줄이기 등) 하나를 일주일 동안 해 보고 표시해 봐요.'},
          {img:'img/c12-more-lunch.jpg', tag:'학교에서', title:'먹을 만큼만 담기', text:'급식을 먹을 만큼만 담고, 남기지 않은 날을 세어 봐요.'},
          {img:'img/c12-more-tree.jpg', tag:'우리 반', title:'포스터 함께 알리기', text:'모둠 포스터를 복도에 붙여 다른 반 친구들에게 기후행동을 알려요.'}
        ]}
      ]}
  ]
});


/* =====================================================================
   3~4차시 · AI 수학으로 해부하는 탄소중립 (고등, 100분) — v3
   공식 흐름: 내연기관 퇴출 뉴스 살펴보기 → 전환의 그늘 읽기 → 그린워싱 해부하기 → 데이터로 정책 제안하기
   기준: 통합 지도안 [3~4차시/6차시] · 워크북 1~6쪽(활동지 1~14) · 교사 PPT 31장
   ===================================================================== */
GS.lesson({
  id:'c34', theme:'carbon', order:2, period:'3~4차시', periods:2, level:'고등', minutes:100,
  title:'AI 수학으로 해부하는 탄소중립',
  question:'탄소중립은 모두에게 공정할까? 기업의 약속은 진짜일까?',
  goals:[
    '소득분위별 에너지 데이터를 산점도·회귀·상관으로 분석해 탄소중립 전환의 형평성을 판단할 수 있다.',
    '기업의 탄소중립 선언을 벡터화·코사인 유사도로 검증할 수 있다.',
    '정의로운 전환을 위한 정책을 제안할 수 있다.'
  ],
  standards:[
    '[9수04-08] 자료를 산점도로 나타내고, 이를 이용하여 상관관계를 말할 수 있다.',
    '[9수04-09] 공학 도구를 이용하여 실생활과 관련된 자료를 수집하고, 대푯값, 산포도, 상관관계를 이용하여 자료를 분석하고 그 결과를 해석할 수 있다.',
    '[12인수02-01] 집합과 벡터를 이용하여 텍스트 데이터를 목적에 맞게 표현할 수 있다.',
    '[12인수02-02] 빈도수 벡터를 이용하여 텍스트 데이터를 요약하고 유용한 정보를 추출할 수 있다.',
    '[12인수04-02] 공학 도구를 사용하여 데이터의 경향성을 추세선으로 나타내고 이를 예측에 이용할 수 있다.',
    '[12인수05-01] 수학적 원리를 이용하여 인공지능이 실생활 문제를 합리적으로 해결하는 사례를 찾을 수 있다.'
  ],
  prep:[
    '준비물: PPT, 학생 워크북, 계산기, 산점도 그리드, 정책 카드, 패들렛, 디지털 기기(QR 스캔용) (교육대상 중고등 20~25명 · 교실)',
    '4인 1모둠으로 편성하고 회귀식 손계산 역할(편차·곱·제곱합)을 미리 정해 둔다.',
    '영상·코사인 유사도 계산 도구 QR과 패들렛 발표 보드 접속 여부를 미리 확인한다.',
    '안전 지도(도입 10′): QR 스캔과 영상 시청 시 수업과 관련 없는 사이트에 접속하지 않는다. 패들렛 발표 보드에 실명, 얼굴 사진 등 개인정보를 올리지 않는다(게시 전 다시 상기).',
    '☆ 영상 QR 3종(내연기관 퇴출) · ☆ 그린워싱 영상 QR · ★ 코사인 유사도 계산 도구 QR · ☆ 활동지(워크북 1~5쪽)',
    '고등학교 교육과정 기준으로 개발했으며, 재구성하여 중학교에서 활용할 수 있다.'
  ],
  assess:[
    {what:'그린워싱 4가지 죄악 분류(활동지 7번)', how:'복수 정답을 허용하고 ‘근거’로 평가한다. 한 가지로 딱 맞지 않는 사례는 분류의 한계를 서술하게 한다.'},
    {what:'정의로운 전환 정책 제안(활동지 12번)', how:'실현 가능성·형평성·데이터 근거(수치·회귀식)를 기준으로 상호 평가한다(PPT 25번 평가 관점: 데이터 근거·수학적 해석·형평성·실행 가능성).'},
    {what:'개념 자기점검(활동지 13~14번)', how:'O/X 자기점검 6문항과 오늘의 한 문장. 정답 슬라이드로 확인하고 오답은 왜 틀렸는지 학생이 고쳐 말하게 한다.'}
  ],
  history:[
    {src:'slides/c34/s03.jpg', title:'빨라지는 내연기관 퇴출 시계', fact:'EU 2035년(2025.12 ‘90% 감축’ 완화안 제안, 2026.10 의회 위원회 의결 · 최종 표결 남음) · 노르웨이 2025년 · 한국 2035 전후.', credit:'교사 제작 PPT 수록 자료 (슬라이드 3) · 출처: European Commission(2025.12), 기후에너지환경부(2026)'},
    {src:'slides/c34/s15.jpg', title:'“100% SAF 탄소중립 비행”의 실제', fact:'오스트리아항공 광고는 100%를 내세웠지만 실제 SAF 혼합은 약 5% — 2023년 법원이 광고 위법 판결.', credit:'교사 제작 PPT 수록 자료 (슬라이드 15) · 출처: ESG Today(2023)'},
    {src:'slides/c34/s16.jpg', title:'‘에코’ · ‘클린 디젤’ · ‘클린 콜’', fact:'SPA 패션 4곳 공정위 경고(2025.5), 디젤게이트 실주행 NOx 최대 40배, 석탄 820 vs 천연가스 490 gCO₂eq/kWh.', credit:'교사 제작 PPT 수록 자료 (슬라이드 16) · 출처: 공정거래위원회(2025.5), IPCC(2014)'}
  ],
  steps:[
    { id:'news', phase:'도입', minutes:10, move:'관찰',
      title:'내연기관 퇴출 뉴스 살펴보기',
      purpose:'전기차 전환이 빨라지는 지금, 그 변화가 모든 사람에게 같은 속도로 오는지부터 질문해 봐요.',
      how:['EU 2035 · 노르웨이 2025 · 한국 2035 전후의 전환 일정을 확인해요.','뉴스 영상 3개 가운데 선생님이 고른 영상을 봐요.','영상을 보고 떠오른 질문 한 가지를 적어요(활동지 1번).'],
      outcome:'‘전기차로 바꾸면 모두 이득일까?’라는 질문이 생기고, 다음 장면에서 그 비용을 누가 먼저 치르는지 데이터로 살펴봐요.',
      prompt:'빠른 내연기관 퇴출 — 누구에겐 기회가, 누구에겐 부담이 먼저 도착하지 않을까?',
      lead:'방향은 분명하지만 속도는 흔들려요. EU도 목표 완화를 논의 중이에요(2026.10 의회 위원회 의결, 최종 표결 남음).',
      visual:{src:'slides/c34/s03.jpg', alt:'EU 2035년, 노르웨이 2025년, 한국 2035 전후 내연기관 전환 목표 카드', cap:'내연기관 퇴출의 시계 · 교사 제작 PPT 슬라이드 3'},
      teacher:{
        ask:['내연기관차를 전기차로 바꾸면 모두에게 이득일까요?','영상을 보고 떠오른 질문을 활동지 1번에 적어 봅시다.'],
        answer:['충전소가 적은 지역은 불편할 것 같습니다. / 차를 새로 살 돈이 없는 사람은 어떻게 하나요?'],
        tip:['안전 약속(QR·영상 시청 때 관련 없는 사이트 접속 금지, 패들렛 개인정보 보호)을 먼저 함께 읽어요.','‘전기차=무조건 이득’이라는 통념에 대해 학생들이 자유롭게 반론·질문을 말할 수 있도록 허용적인 분위기를 조성해요.'],
        link:'학생 질문(충전소·차 살 돈)을 다음 장면의 ‘에너지 빈곤·이동권 불평등’ 개념과 연결해요.'},
      blocks:[
        {t:'slides', from:3, to:4, title:'전환의 시계와 영상 QR'},
        {t:'video', yt:'McQHr2hyn7s', title:'기후에너지환경부 · 2026 전기차 정책, 무엇이 달라질까?', note:'활동지 1쪽 영상 QR ①'},
        {t:'video', yt:'4oScIU2VKyU', title:'SBS · ‘전기차 올인’ 유럽, 디젤 부활?', note:'활동지 1쪽 영상 QR ②'},
        {t:'video', yt:'2zTkv8NVqBA', title:'KBS · 검증도 없이 보조금부터?', note:'활동지 1쪽 영상 QR ③'},
        {t:'write', id:'c34-q1', ws:'활동지 1', q:'영상을 보고 떠오른 질문을 한 가지 적어 봅시다.', rows:1, example:'충전소가 적은 곳에 살거나 새 차를 살 돈이 없는 사람은 어떻게 하나요?'}
      ]},

    { id:'shadow', phase:'전개 1', minutes:15, move:'예측',
      title:'전환의 그늘 읽기 ① 그늘의 이름과 산점도',
      purpose:'질문을 데이터로 확인하려면, 먼저 ‘그늘’의 종류를 구분하고 소득과 연료비 자료를 그림으로 그려 봐야 해요.',
      how:['네 개념(에너지 빈곤·이동권 불평등·일자리 전환·정의로운 전환)을 설명과 연결해요(활동지 2번).','1분위와 10분위의 연료비 부담 차이를 예측한 뒤 10개 점을 좌표평면에 찍어요(활동지 3번).','실험실에서 직선을 움직여 오차제곱합이 가장 작은 직선을 찾고 기울기의 부호를 읽어요.'],
      outcome:'소득분위가 높아질수록 연료비 비중이 뚜렷이 줄어드는 ‘오른쪽 아래’ 방향을 확인하고, 다음 장면에서 그 직선을 손으로 구해요.',
      prompt:'소득이 가장 낮은 가구는 가장 높은 가구보다 연료비 부담이 몇 배일까?',
      visual:{src:'slides/c34/s05.jpg', alt:'에너지 빈곤, 이동권 불평등, 일자리 전환 세 카드와 정의로운 전환 설명', cap:'전환의 그림자 — 누가 비용을 치르는가? · 교사 제작 PPT 슬라이드 5'},
      teacher:{
        ask:['‘정의로운 전환’은 무엇을 공정하게 나누자는 원칙인가요?','점들은 어떤 방향으로 늘어서 있나요? 이 방향을 직선 하나로 요약하려면?'],
        answer:['탄소중립으로 가는 과정의 혜택과 부담입니다.','오른쪽 아래로 내려갑니다. / 최소제곱법으로 회귀직선을 구합니다.'],
        tip:['1·10분위 값은 공개 통계, 2~9분위는 교육용 재구성임을 안내해요.','(참고, 5분위 기준) 하위 20%의 소비 1순위는 식료품(21.1%)·주거·광열(19.4%), 상위 20%는 교통(16.0%)(통계청 2023.4Q) — 연료비 자료는 10분위 기준이라 같은 ‘1분위’라도 집단이 달라요(슬라이드 6).','★산점도 그리드를 함께 써도 좋아요.'],
        link:'실험실에서 찾은 직선을 다음 장면에서 최소제곱 공식으로 확인해요.'},
      blocks:[
        {t:'sort', id:'c34-concept', ws:'활동지 2', q:'개념과 설명을 알맞게 연결해요. (내연기관 퇴출이 남기는 ‘그늘’)', bins:['에너지 빈곤','이동권 불평등','일자리 전환','정의로운 전환'], items:[
          {text:'전기차·충전 인프라 접근성이 소득·지역에 따라 달라 이동의 자유에 격차가 생김', bin:1},
          {text:'탄소중립으로 가는 과정에서 혜택과 부담을 공정하게 나누어 누구도 뒤처지지 않게 하는 원칙', bin:3},
          {text:'냉난방·전기 등 필수 에너지 비용을 감당하기 어려운 상태. 요금이 오르면 저소득층이 먼저 타격', bin:0},
          {text:'부품·정비 등 내연기관 기반 일자리가 줄어 재교육·전직 지원이 없으면 지역경제 충격', bin:2}
        ], explain:'네 개념 모두 ‘전환의 비용을 누가 먼저, 더 크게 치르는가’의 문제예요. 오늘은 이 ‘공정함’을 데이터로 검증해요.'},
        {t:'blanks', id:'c34-jt', q:'정의로운 전환은 무엇을 공정하게 나누자는 원칙일까요?', text:'탄소중립으로 가는 과정의 [[혜택]]과 [[부담]]을 공정하게 나누어 누구도 뒤처지지 않게 하는 원칙', explain:'Just Transition — 혜택과 부담을 함께 설계해야 진짜 탄소중립에 가까워져요.'},
        {t:'predict', id:'c34-gap-pred', q:'소득 대비 연료비 비중: 1분위(최저소득)는 10분위(최고소득)의 약 몇 배일까요?', options:['거의 같다 (약 1배)','약 2배','약 5~6배','10배 이상'],
          reveal:[
            {t:'stats', items:[{num:'7.9%',label:'1분위(최저소득) 소득 대비 연료비'},{num:'1.4%',label:'10분위(최고소득) 소득 대비 연료비'},{num:'약 5.6배',label:'저소득–고소득 부담 격차'}], src:'통계청 가계동향조사·한국에너지공단(교사 제작 PPT 슬라이드 6). 2~9분위는 추세에 맞춘 교육용 재구성'},
            {t:'widget', name:'carbon-scatter', ws:'활동지 3'},
            {t:'widget', name:'carbon-regression'},
            {t:'choice', id:'c34-dir', ws:'활동지 3', q:'점들이 늘어선 방향과, 오차제곱합을 가장 작게 만든 직선의 기울기 a는?', options:['오른쪽 위 · a > 0 — 소득이 높을수록 연료비 비중이 커진다','오른쪽 아래 · a < 0 — 소득이 높을수록 연료비 비중이 작아진다','방향 없음 · a ≈ 0 — 소득과 연료비 비중은 관계가 없다'], answer:1,
              hints:['산점도에서 x가 커질 때 점의 높이가 어떻게 되나요?','기울기가 음수면 x가 커질 때 ŷ이 작아져요.'],
              explain:'점들이 오른쪽 아래로 늘어서요. 저소득층일수록 버는 돈 대비 에너지 부담이 커서, 요금이 오르면 격차가 더 벌어져요.'}
          ]},
        {t:'slides', from:5, to:7, title:'전환의 그림자 · 오늘의 데이터 · 산점도'}
      ]},

    { id:'lsq', phase:'전개 1', minutes:20, move:'분석',
      title:'전환의 그늘 읽기 ② 회귀식으로 격차 해석하기',
      purpose:'실험실에서 찾은 직선이 정말 ‘가장 잘 맞는’ 직선인지 공식으로 확인하고, 그 숫자가 사회적으로 무엇을 뜻하는지 말해야 해요.',
      how:['편차·곱·제곱 표의 6~10행과 합계를 채워요(곱은 소수 셋째 자리, 활동지 4번).','① 평균 ② 기울기 ③ 절편 ④ 회귀식 ⑤ 상관계수를 구해요.','x = 3 예측, r²의 뜻, 음의 기울기의 사회적 의미를 써요(활동지 5번).','상관과 인과를 구분하고, 충전기 수를 ‘대수’와 ‘인구 1천 명당’으로 비교해요(활동지 6번).'],
      outcome:'ŷ = −0.684x + 7.572, r ≈ −0.968로 격차를 숫자로 말할 수 있고, 무엇으로 나누느냐(분모)에 따라 결론이 달라진다는 것을 알게 돼요. 다음은 기업의 ‘약속’을 수학으로 검증해요.',
      prompt:'실험실에서 찾은 직선, 공식으로도 같은 답이 나올까? 그리고 그 숫자는 무엇을 말할까?',
      visual:{src:'media/c34/s07-03.jpg', alt:'소득분위 1~10과 연료비 비중 7.9%~1.4% 산점도', cap:'산점도: 소득분위 → 연료비 비중 · 교사 제작 PPT 슬라이드 7'},
      teacher:{
        ask:['x=3을 대입하면 얼마이고, r²≈0.94는 무엇을 뜻하나요?','대수로는 8.6배인데 인구당으로는 거의 같다면, 어느 비교가 공정할까요?'],
        answer:['약 5.5%입니다. / 연료비 비중 변동의 약 94%를 소득분위로 설명할 수 있다는 뜻입니다.','인구나 전기차 수로 나눠 봐야 합니다. 분모에 따라 결론이 달라집니다.'],
        tip:['회귀식 손계산은 모둠에서 역할을 나누어(편차·곱·제곱합) 진행하고, 곱은 소수 셋째 자리까지 쓰게 해요. 값이 나오면 ‘기울기가 음수인 것의 사회적 의미’를 반드시 말로 풀게 해요.','‘상관이 강하다=인과’로 단정하지 않도록 교란변수(주택 노후도·난방 방식·지역)를 토론하고, 충전기 자료로 ‘무엇으로 나누느냐(분모)’에 따라 결론이 바뀜을 확인해요.','분위는 정수 범주라 x = 3.5나 범위 밖(x = 12) 외삽은 조심해요(슬라이드 9).'],
        link:'‘데이터는 격차를 드러낸다’로 1부를 묶고(슬라이드 11), 2부에서 기업 선언을 벡터로 검증해요.'},
      blocks:[
        {t:'tablefill', id:'c34-lsq', ws:'활동지 4', q:'최소제곱법으로 회귀직선 ŷ = ax + b를 손으로 구해요. 6~10행과 합계를 채워요(곱은 소수 셋째 자리까지).', head:['x','y','x − x̄','y − ȳ','(x − x̄)(y − ȳ)','(x − x̄)²'], rows:[
          ['1','7.9','−4.5','4.09','−18.405','20.25'],
          ['2','6.4','−3.5','2.59','−9.065','12.25'],
          ['3','5.2','−2.5','1.39','−3.475','6.25'],
          ['4','4.3','−1.5','0.49','−0.735','2.25'],
          ['5','3.6','−0.5','−0.21','0.105','0.25'],
          ['6','3.0','?0.5','?-0.81','?-0.405','?0.25'],
          ['7','2.5','?1.5','?-1.31','?-1.965','?2.25'],
          ['8','2.1','?2.5','?-1.71','?-4.275','?6.25'],
          ['9','1.7','?3.5','?-2.11','?-7.385','?12.25'],
          ['10','1.4','?4.5','?-2.41','?-10.845','?20.25'],
          ['합계','38.1','0','0','?-56.45','?82.5']
        ], explain:'Σ(x − x̄)(y − ȳ) = −56.45, Σ(x − x̄)² = 82.5'},
        {t:'blanks', id:'c34-ab', ws:'활동지 4', q:'① 평균 ② 기울기 ③ 절편 ④ 회귀식 ⑤ 상관계수',
          text:'① x̄ = (1+2+…+10)/10 = ( [[5.5]] ), ȳ = 38.1/10 = ( [[3.81]] )<br>② a = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² = ( [[-56.45|−56.45]] ) / ( [[82.5]] ) ≈ ( [[-0.684|−0.684]] )<br>③ b = ȳ − a·x̄ = ( [[7.572]] ) &nbsp; ④ ŷ = ( [[-0.684|−0.684]] ) x + ( [[7.572]] )<br>⑤ r = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)²·Σ(y−ȳ)²) ≈ ( [[-0.968|−0.968]] ) ※ Σ(y−ȳ)² = 41.21 → r² ≈ ( [[0.937]] )',
          hints:['b = 3.81 − (−0.684)(5.5) = 3.81 + 3.762','r = −56.45 ÷ √(82.5 × 41.21)'],
          explain:'ŷ = −0.684x + 7.572, r ≈ −0.968(강한 음의 상관), r² ≈ 0.937'},
        {t:'blanks', id:'c34-pred', ws:'활동지 5', q:'회귀식으로 예측해요.', text:'x = 3(3분위)을 대입하면 ŷ = −0.684 × 3 + 7.572 ≈ ( [[5.52|5.5]] )%', explain:'실제 5.2%와 근사해요. 분위는 정수 범주라 x = 3.5나 범위 밖(x = 12) 외삽은 조심해요.'},
        {t:'write', id:'c34-pred-cmp', ws:'활동지 5', q:'예측값을 실제 5.2%와 비교하면?', rows:1, example:'예측 5.52%는 실제 5.2%보다 약 0.3%p 크지만 거의 비슷해요.'},
        {t:'write', id:'c34-r2', ws:'활동지 5', q:'r² ≈ 0.94의 의미를 한 문장으로 써요.', rows:1, example:'연료비 비중 변동의 약 94%를 소득분위로 설명할 수 있다는 뜻이에요.'},
        {t:'write', id:'c34-slope', ws:'활동지 5', q:'기울기가 음수(−)라는 것은 사회적으로 무엇을 뜻할까요?', rows:2, example:'소득이 낮을수록 버는 돈에 비해 연료비 부담이 커서, 전환 비용이 요금에 붙으면 저소득층이 먼저, 더 크게 타격을 받는다는 뜻이에요.'},
        {t:'choice', id:'c34-cause', ws:'활동지 6', q:'(가) r² ≈ 0.94예요. ‘상관이 강하다’가 곧 인과를 증명할까요?', options:['그렇다 — r²이 1에 가까우니 원인이 증명되었다','아니다 — 상관이 강해도 다른 변수가 두 값에 함께 영향을 줄 수 있다','아니다 — r이 음수라서 두 변수는 관계가 없다'], answer:1,
          hints:['r²은 ‘직선이 얼마나 잘 맞는가’이지 ‘왜 그런가’가 아니에요.','저소득 가구가 사는 집은 어떤 상태일까요? 난방 방식은요?'],
          explain:'상관 ≠ 인과. 주택 노후도·단열, 난방 방식, 지역 같은 변수도 작용할 수 있어요.'},
        {t:'write', id:'c34-conf', ws:'활동지 6', q:'(가) 연료비 비중에 영향을 줄 수 있는 다른 변수(교란변수)를 2가지 적어요.', rows:2, placeholder:'교란변수 ① (예: 주택 노후도·단열)\n교란변수 ②', example:'① 주택 노후도·단열 ② 난방 방식(도시가스·등유·전기) 또는 사는 지역'},
        {t:'predict', id:'c34-charger-pred', q:'(나) 충전기 대수는 경기가 강원의 약 8.6배예요. 인구 1천 명당으로 바꾸면?', options:['여전히 경기가 훨씬 많다','두 지역이 거의 같다','강원이 경기의 몇 배다'],
          reveal:[
            {t:'tablefill', id:'c34-per', ws:'활동지 6', q:'인구 1천 명당 충전기 = 충전기 수 ÷ (인구 만 명 × 10). 소수 첫째 자리까지.', head:['지역','충전기 수(기)','인구(만 명, 어림값)','인구 1천 명당(기)'], rows:[
              ['경기','131,126','약 1,370','9.6'],
              ['서울','약 68,000','약 935','?7.3'],
              ['강원','15,241','약 152','?10.0|10'],
              ['제주','약 12,800','약 67','?19.1|19']
            ], tol:0.1, caption:'충전기: 한국자동차환경협회(2025, 서울·제주는 어림값) / 인구: 행정안전부 주민등록인구(2025) 어림값', explain:'서울 약 7.3기, 강원 약 10.0기, 제주 약 19.1기예요.'},
            {t:'visual', src:'media/c34/s10-05.jpg', alt:'지역별 충전기 절대 대수 막대와 인구 1천 명당 막대 비교 그래프. 강원은 대수 15,241기, 1천 명당 10.0기', cap:'같은 자료, 다른 결론? — 절대 대수 vs 인구 1천 명당 (교사 제작 PPT 슬라이드 10)'},
            {t:'choice', id:'c34-rural', ws:'활동지 6', q:'‘농어촌은 충전기가 적다’는 결론이 이 자료로 맞나요?', options:['맞다 — 강원의 충전기 대수는 경기의 약 1/8.6이다','맞지 않다 — 인구 1천 명당으로 보면 경기와 강원이 거의 같다','알 수 없다 — 어림값이 섞여 있으니 어떤 결론도 낼 수 없다'], answer:1,
              hints:['인구 1천 명당 경기 9.6기와 강원 10.0기를 비교해 보세요.','대수는 인구가 많은 곳이 클 수밖에 없어요.'],
              why:'진짜 형평성을 보려면 어떤 분모나 자료가 더 필요할까요? 한 문장으로 써요.',
              explain:'뒷받침되지 않아요(제주 약 19기로 최다). 분모(인구·전기차 등록대수·면적)에 따라 결론이 바뀌어요. 진짜 질문은 ‘충전기가 어디에(공동주택·읍면) 있고 누가 쓸 수 있는가’예요.'}
          ]},
        {t:'slides', from:8, to:11, title:'최소제곱법 · 예측과 r² · 분모 비교 · 1부 요약'}
      ]},

    { id:'sins', phase:'전개 2', minutes:17, move:'판단',
      title:'그린워싱 해부하기 ① 느낌 대신 4가지 죄악과 단어 세기',
      purpose:'기업의 ‘약속’이 진짜인지 따지려면, 느낌으로 먼저 판단해 보고 그린워싱의 유형을 알고 말을 숫자로 바꿀 준비를 해야 해요.',
      how:['A사·B사 선언문을 읽고 어느 쪽이 더 믿을 만한지 직관으로 골라요.','그린워싱 영상을 보고 4가지 죄악(증거 없음·모호함·숨겨진 상충·거짓 주장)을 확인해요.','실제 사례 4개를 죄악에 분류하고 근거를 적어요(활동지 7번).','두 선언문의 구체어·모호어 빈도를 세요(활동지 8번).'],
      outcome:'사례마다 어떤 죄악이 겹치는지 근거로 말할 수 있고, A사 (0, 9)·B사 (9, 0)처럼 선언문을 숫자로 바꿔 다음 장면에서 벡터로 계산해요.',
      prompt:'‘친환경’이라는 말 뒤에 무엇이 숨어 있을까? 느낌은 믿을 만할까?',
      visual:{src:'slides/c34/s14.jpg', alt:'증거 없는 주장, 모호한 표현, 숨겨진 상충, 거짓 주장 네 가지 죄악 카드', cap:'‘7가지 죄악’ 중 데이터로 잡는 4가지 (TerraChoice, 2010) · 교사 제작 PPT 슬라이드 14'},
      teacher:{
        ask:['두 선언문 중 어느 쪽이 더 믿을 만한가요? 왜 그렇게 생각했나요?','‘느낌’이 아니라 숫자로 구체성을 잴 수 있는 방법은 무엇일까요?'],
        answer:['단어를 세어 벡터로 만들면 됩니다.'],
        tip:['죄악 분류는 복수 정답을 허용하고 ‘근거’로 평가해요. 한 가지로 딱 맞지 않는 사례는 분류의 한계를 서술하게 해요.','단어는 괄호 안 8개만 센다(숫자·%·연도 제외)는 규칙을 먼저 확인해요. 반복되면 모두 세고, ‘총배출량’처럼 다른 말에 붙어 있어도 세요.','A·B·C사 선언문과 Scope 수치는 교육용 가상 사례임을 안내해요.'],
        link:'센 빈도 (x, y)를 다음 장면에서 벡터로 놓고 기준 방향과의 코사인 유사도를 구해요.'},
      blocks:[
        {t:'cards', title:'두 기업의 탄소중립 선언문 (교육용 가상 사례)', items:[
          {tag:'A사', title:'‘그린모빌리티’', text:'우리는 친환경 미래를 약속합니다. 지속가능한 그린 경영으로 깨끗한 지구를 만들고, 탄소중립을 향해 끊임없이 노력하겠습니다. 친환경은 우리의 변함없는 비전입니다.'},
          {tag:'B사', title:'‘정직에너지’', text:'2024년 온실가스 총배출량을 2020년 대비 32% 감축했습니다. 재생에너지 전력 비율 45%를 달성했고, Scope 3까지 포함해 제3자 검증을 받았습니다. 2040년 목표연도까지의 감축 경로를 데이터로 공개합니다.'}
        ]},
        {t:'predict', id:'c34-decl-pred', q:'느낌으로 먼저: 더 믿을 만한 선언문은?', options:['A사 ‘그린모빌리티’','B사 ‘정직에너지’','둘 다 비슷하다'], compare:false,
          reveal:[
            {t:'callout', tone:'key', title:'그린워싱(Greenwashing)이란?', text:'Green + Whitewashing(눈가림). 실제로는 친환경적이지 않으면서 친환경인 것처럼 ‘포장’하는 행위예요. ‘느낌’은 속을 수 있어요 — 말을 숫자로 바꾸면(벡터화) 얼마나 구체적인지 계산할 수 있어요.'}
          ]},
        {t:'video', yt:'Gx-YnBy62TI', title:'YTN 사이언스 · 그린워싱이란?', note:'교사 PPT 13번 슬라이드 영상 QR'},
        {t:'sort', id:'c34-case', ws:'활동지 7', q:'실제 사례가 그린워싱 ‘4가지 죄악’ 중 어디에 가장 가까운지 분류해요. (복수 가능 — 겹치는 사례는 가까운 칸 어디든 인정)', bins:['ⓐ 증거 없는 주장 (No proof)','ⓑ 모호한 표현 (Vagueness)','ⓒ 숨겨진 상충 (Hidden trade-off)','ⓓ 거짓 주장 (Fibbing)'], items:[
          {text:'오스트리아항공: “100% 지속가능항공유(SAF)로 CO₂ 중립 비행” 광고 (실제 SAF 약 5%, 2023 법원 그린워싱 위법 판결)', bin:[3,2]},
          {text:'국내 SPA 패션 브랜드 4곳: “에코·지속가능” 표시 (객관적 근거 부족, 2025.5 공정위 경고 — 표시광고법 위반)', bin:[1,0]},
          {text:'폭스바겐 디젤게이트: “클린 디젤” (검사 때만 정화장치 작동, 실주행 NOx 최대 40배)', bin:3},
          {text:'석탄업계 ‘클린 콜(Clean Coal)’ 캠페인 (수명주기 배출 석탄 820 vs 천연가스 490 gCO₂eq/kWh, IPCC 2014)', bin:[1,2]}
        ], explain:'PPT 판정: 오스트리아항공 ⓓ(+ⓒ 나머지 약 95% 화석연료 은폐) · SPA 브랜드 ⓑ(+ⓐ) · 디젤게이트 ⓓ · 클린 콜 ⓑ+ⓒ'},
        {t:'write', id:'c34-case-why', ws:'활동지 7', q:'사례별로 그 죄악이라고 본 이유·근거를 적어요. 딱 맞지 않으면 ‘가장 가까운 것 + 분류의 한계’를 적어요.', rows:4,
          placeholder:'오스트리아항공:\nSPA 패션 브랜드:\n디젤게이트:\n클린 콜:',
          example:'오스트리아항공: ‘100%’라고 했지만 실제 SAF는 약 5%라 ⓓ, 나머지 95% 화석연료를 숨겼으니 ⓒ도 겹쳐요. 한 칸만 고르게 하면 이런 겹침을 놓쳐요.'},
        {t:'tablefill', id:'c34-count', ws:'활동지 8', q:'두 선언문의 구체어와 모호어 빈도를 세어요.', head:['문서','구체어 빈도 x (감축·배출량·재생에너지·Scope 3·검증·제3자·목표연도·데이터)','모호어 빈도 y (친환경·지속가능·그린·깨끗·미래·노력·약속·비전)'], rows:[
          ['A사','?0','?9'],
          ['B사','?9','?0']
        ], caption:'세는 규칙: 괄호 안 8개 단어만 셉니다(숫자·%·연도는 세지 않음). 반복되면 모두 세고, ‘총배출량’처럼 다른 말에 붙어 있어도 셉니다.',
          explain:'A사: ‘친환경’ 2회 + 지속가능·그린·깨끗·미래·노력·약속·비전 각 1회 = 9. B사: ‘감축’ 2회 + 배출량·재생에너지·Scope 3·검증·제3자·목표연도·데이터 각 1회 = 9.'},
        {t:'slides', from:12, to:18, title:'선언문 · 그린워싱 · 4가지 죄악과 사례 · 단어 빈도'}
      ]},

    { id:'cosine', phase:'전개 2', minutes:18, move:'분석',
      title:'그린워싱 해부하기 ② 코사인 유사도와 Scope 교차검증',
      purpose:'센 단어 수를 벡터로 바꾸면 ‘얼마나 구체적인지’를 계산할 수 있고, 실제 배출 데이터와 비교해야 진짜인지 알 수 있어요.',
      how:['v = (x, y)와 기준 벡터 u = (1, 0)의 코사인 유사도를 A·B·C사에 대해 구해요(활동지 9번).','선언문을 두 배로 늘려도 cos θ가 그대로인 까닭으로 ‘방향’의 뜻을 써요.','Scope 1·2·3을 더해 총배출을 구하고, 말(cos θ)과 데이터를 함께 판정해요(활동지 10번).'],
      outcome:'‘말’과 ‘데이터’가 같은 방향일 때만 믿을 수 있다는 기준이 생기고, 다음 장면에서 이 기준으로 판정문과 정책을 써요.',
      prompt:'느낌으로 고른 답, 숫자로 확인하면 같을까? 말이 구체적이면 배출도 줄었을까?',
      lead:'cos θ = (u · v) / (‖u‖ × ‖v‖) = (1·x + 0·y) / (1 × √(x² + y²)). 수업용 판정 기준(임의): ≥ 0.66 진정성 높음 / 0.33 ~ 0.66 확인 필요 / < 0.33 의심',
      visual:{src:'media/c34/s19-06.jpg', alt:'x축 구체어, y축 모호어 좌표평면에 A사 (0, 9), B사 (9, 0), C사 (3, 4) 벡터와 기준 u = (1, 0)', cap:'구체성 축으로 옮기기 — 2차원 벡터 · 교사 제작 PPT 슬라이드 19'},
      teacher:{
        ask:['A사 cos=0, B사 cos=1은 각각 무엇을 뜻하나요?','코사인이 높아도 총배출이 늘어난다면 어떻게 판단해야 할까요?'],
        answer:['A사는 정해 둔 구체어가 하나도 없어 기준과 직교합니다. / B사는 기준과 같은 방향입니다.','말과 데이터가 다른 방향이므로 의심해야 합니다.'],
        tip:['코사인 유사도는 ‘크기’가 아니라 ‘방향’의 닮음임을 강조하고, x=0일 때 cos=0이 되는 이유(분자=0)를 학생이 말로 설명하게 해요.','판정 기준 0.66/0.33은 수업용 임의 기준임을 밝혀요.','Scope 3(공급망·제품 사용·폐기)은 보통 총배출의 70% 이상이며, 단골 수법은 Scope 3을 빼고 1·2만 공개하는 것이에요(WRI & WBCSD, 2004).'],
        link:'진단 매트릭스(슬라이드 24)로 말·데이터 두 근거를 정리해 판정문으로 넘어가요.'},
      blocks:[
        {t:'videos', items:[{yt:'WdXAWkUQCRs', start:1360, title:'수학 개념 ① 벡터의 내적', note:'EBSi 공식 채널 · [수능길잡이] 기하와벡터 12강(이민형) · 22:40 「벡터의 내적」부터 재생'},{yt:'C92uxVqawto', start:164, title:'수학 개념 ② 두 벡터가 이루는 각', note:'EBSi 공식 채널 · [수능길잡이] 기하와벡터 13강(이민형) · 2:44 「두 평면벡터가 이루는 각의 크기」부터 재생'}]},
        {t:'tablefill', id:'c34-vec', ws:'활동지 9', q:'선언문을 벡터 v = (x, y)로 나타내고, 진정성 기준 벡터 u = (1, 0)과의 코사인 유사도를 계산해요.', head:['문서','벡터 v = (x, y)','‖v‖ = √(x² + y²)','u · v','cos θ','판정'], rows:[
          ['A사','?(0, 9)|(0,9)|0,9','?9','?0','?0|0.00','?의심|그린워싱 의심|그린워싱의심|직교'],
          ['B사','?(9, 0)|(9,0)|9,0','?9','?9','?1|1.00','?진정성 높음|진정성높음|진정성|진정성 있음'],
          ['C사(예시)','(3, 4)','?5','?3','?0.6|0.60','?확인 필요|확인필요|중간']
        ], caption:'성분이 모두 0 이상이면 0 ≤ cos θ ≤ 1 (일반적으로는 −1 ~ 1). 판정 칸은 ‘의심 / 확인 필요 / 진정성 높음’ 중 하나로 써요.',
          explain:'A사 0.00 의심(직교) · B사 1.00 진정성 높음(같은 방향) · C사 0.60 확인 필요(중간)'},
        {t:'tool', url:'https://matrix.skku.ac.kr/math4AI-tools/cosine_similarity/', title:'코사인 유사도 계산 도구 (성균관대 Math4AI)', text:'활동지 9번 QR 도구. 내가 쓴 글이나 실제 지속가능경영보고서 문장으로 벡터와 사잇각을 계산해 봐요. 사이트가 열리지 않으면 아래 계산기로 같은 계산을 할 수 있어요.', img:'img/c34-more-cosine.jpg'},
        {t:'widget', name:'carbon-cosine'},
        {t:'choice', id:'c34-len', ws:'활동지 9', q:'B사가 같은 문장을 한 번 더 이어 붙여 선언문을 두 배로 늘리면 cos θ는?', options:['2.00으로 커진다','1.00 그대로다','0.50으로 작아진다'], answer:1,
          hints:['계산기에서 B사 (9, 0)을 누른 뒤 x만 크게 늘려 보세요. 화살표의 방향이 바뀌나요?','cos θ는 ‖v‖로 나누므로 길이는 사라지고 방향만 남아요.'],
          why:'코사인 유사도가 ‘길이’가 아니라 ‘방향’을 비교한다는 것은 무슨 뜻일까요? x = 0이면 왜 cos θ = 0인지도 써요.',
          explain:'v = (18, 0)이 되어도 방향은 u와 같아 cos θ = 1이에요. 홍보문이 길다고 더 진실한 것은 아니에요.'},
        {t:'write', id:'c34-feel', q:'앞 장면에서 ‘느낌’으로 고른 답과 cos θ 결과를 비교해요. 느낌이 속을 수 있는 까닭은?', rows:2, example:'처음엔 A사가 ‘친환경’을 많이 말해서 좋아 보였는데, 구체어가 0개라 cos θ = 0이었어요. 좋은 단어가 많으면 믿음직해 보이는 착각이 생겨요.'},
        {t:'predict', id:'c34-scope-pred', q:'cos θ = 0.00인 A사, 실제 총배출(Scope 1+2+3)은 2023 → 2024에 어떻게 변했을까?', options:['줄었다','거의 그대로다','늘었다'],
          reveal:[
            {t:'tablefill', id:'c34-scope', ws:'활동지 10', q:'선언(말)과 실제 배출(데이터)을 교차검증해요. 총배출을 계산하고 판정하세요. (단위: 천 tCO₂e, 2023 → 2024)', head:['기업','선언 cos θ','Scope 1 (직접)','Scope 2 (전력)','Scope 3 (가치사슬)','총배출 2023','총배출 2024','판정'], rows:[
              ['A사','?0|0.00','88 → 92','126 → 128','266 → 320','?480','?540','?그린워싱 의심|의심|그린워싱의심|빨간불'],
              ['B사','?1|1.00','70 → 58','110 → 95','140 → 115','?320','?268','?진정성 있음|진정성|진정성 높음|진정성있음|초록불']
            ], caption:'Scope 1·2·3 수치는 교육용 가상 사례. Scope 3(공급망·제품 사용·폐기)은 총배출에서 큰 몫을 차지하는 경우가 많아요(이 가상 사례에서 A사 55%, B사 44%).',
              explain:'A사: 말(cos 0.00)도 모호하고 Scope 3이 266 → 320으로 급증, 총배출 480 → 540 증가 → 말과 데이터 모두 빨간불. B사: cos 1.00 + 모든 Scope 감소, 총배출 320 → 268 → 진정성 있음.'},
            {t:'visual', src:'media/c34/s23-07.jpg', alt:'A사와 B사의 Scope 1·2·3 배출 2023·2024 비교 막대그래프. A사 Scope 3이 266에서 320으로 증가', cap:'교차검증: 말과 데이터가 같은 방향인가? · 교사 제작 PPT 슬라이드 23'}
          ]},
        {t:'slides', from:19, to:24, title:'벡터 · 코사인 유사도 · Scope · 교차검증 · 진단 매트릭스'}
      ]},

    { id:'policy', phase:'전개 3', minutes:15, move:'판단',
      title:'데이터로 정책 제안하기 ① 판정문과 정의로운 전환 정책',
      purpose:'앞에서 구한 cos θ·Scope·회귀식을 근거로 써야, 판정과 정책이 ‘느낌’이 아닌 ‘데이터’ 위에 서요.',
      how:['말(코사인)과 데이터(Scope) 두 근거로 그린워싱 판정문을 써요(활동지 11번).','가장 ‘불공정하다’고 느낀 지표를 골라, 정책 2가지를 정책 카드(이름·대상·근거 데이터·기대효과/부작용)로 설계해요(활동지 12번).','모둠 슬로건과 함께 패들렛에 발표하고 서로 평가해요.'],
      outcome:'데이터 근거가 있는 판정문과 정책 2가지가 완성되고, 마지막 장면에서 오늘 쓴 개념을 스스로 점검해요.',
      prompt:'이 정책은 누구에게 도움이 되고, 누구에게 부담이 될 수 있을까?',
      visual:{src:'slides/c34/s26.jpg', alt:'Scope 3 의무 공개, 인프라 형평성, 표시·광고 규제 세 가지 정책 아이디어 카드', cap:'정책 아이디어 예시 — 데이터가 가리키는 방향 · 교사 제작 PPT 슬라이드 26'},
      teacher:{
        ask:['이 정책은 누구에게 도움이 되고, 누구에게 부담이 될 수 있나요?'],
        answer:['저소득·농어촌 가구에 도움이 되지만 예산이 필요합니다.'],
        tip:['정책 제안은 실현 가능성·형평성·데이터 근거(수치·회귀식)를 기준으로 상호 평가해요(평가 관점: 슬라이드 25).','모둠 내 역할(근거 수집·문장 작성·발표)을 나누어 소외되는 학생이 없게 해요.','패들렛 게시 전 개인정보 보호 약속을 다시 상기시켜요.'],
        link:'정책을 발표한 뒤 O/X 자기점검으로 개념을 확인하며 마무리해요.'},
      blocks:[
        {t:'timer', minutes:15, label:'모둠 미션 시간'},
        {t:'cer', id:'c34-verdict', ws:'활동지 11', kind:'그린워싱 판정문', q:'코사인 유사도(말)와 Scope 추이(데이터)를 모두 근거로 들어 판정문을 써요.',
          starters:{c:'우리 모둠은 (   )사를 그린워싱으로 판정한다.', e:'근거 ① (말): cos θ = … (구체어 …개, 모호어 …개) / 근거 ② (데이터): 총배출 … → …, Scope 3 … → …', r:'말과 데이터가 함께 … 을 가리키므로 …'},
          example:'주장: 우리 모둠은 A사를 그린워싱으로 판정한다. 근거: ①(말) 모호어 9개·구체어 0개로 cos θ = 0.00(기준과 직교), ②(데이터) 총배출 480 → 540 증가, Scope 3 266 → 320 급증. 이유: 말과 데이터 모두 빨간불이며 ⓐ 증거 없는 주장 + ⓑ 모호한 표현에 해당한다.'},
        {t:'write', id:'c34-policy1', ws:'활동지 12', q:'정책 1 — ‘정의로운 전환’을 위한 정책 카드 (수치·회귀식 등 데이터 근거를 반드시 인용)', rows:4,
          placeholder:'정책 이름:\n대상(누구에게 도움?):\n근거 데이터(수치·식):\n기대효과 / 부작용:',
          example:'이름: 에너지바우처 확대 / 대상: 1~2분위 저소득 가구 / 근거: 1분위 7.9% vs 10분위 1.4%(약 5.6배), ŷ = −0.684x + 7.572 — 분위가 1 낮아질 때마다 약 0.68%p 증가 / 기대효과·부작용: 요금 인상 충격 완화, 예산과 대상 선정 기준이 필요'},
        {t:'write', id:'c34-policy2', ws:'활동지 12', q:'정책 2 — 정책 카드', rows:4,
          placeholder:'정책 이름:\n대상(누구에게 도움?):\n근거 데이터(수치·식):\n기대효과 / 부작용:',
          example:'이름: Scope 3 포함 배출량 의무 공개·제3자 검증 / 대상: 소비자·투자자 / 근거: A사 cos θ = 0.00인데 Scope 3 266 → 320 급증 / 기대효과·부작용: ‘숨겨진 상충’ 차단, 중소기업 보고 부담'},
        {t:'p', text:'예시: Scope 3 포함 배출량 의무 공개·제3자 검증 / 공동주택·읍면 지역 충전 접근성 개선 / 에너지바우처 확대 / ‘친환경’ 표시 근거 표기 의무 (활동지 5쪽)'},
        {t:'write', id:'c34-slogan', q:'모둠 발표 슬로건 한 문장', rows:1, example:'말이 아닌 데이터로, 누구도 뒤처지지 않는 전환!'},
        {t:'slides', from:25, to:26, title:'모둠 미션과 정책 아이디어 예시'}
      ]},

    { id:'check', phase:'정리', minutes:5, move:'성찰',
      title:'데이터로 정책 제안하기 ② 스스로 점검하기',
      purpose:'정책의 근거로 쓴 회귀·코사인·Scope 개념을 바르게 이해했는지 스스로 확인해요.',
      how:['O/X 6문항을 풀고 틀린 문장은 바르게 고쳐요(활동지 13번).','오늘의 한 문장을 써요(활동지 14번).','출구 카드로 이해 정도를 표시해요.'],
      outcome:'‘말(코사인 유사도)과 데이터(회귀·Scope)가 같은 방향을 가리킬 때만 신뢰한다’는 오늘의 핵심을 정리하고, 다음 차시(행렬·합성곱·경사하강법)로 이어 가요.',
      prompt:'수학은 어떻게 ‘속지 않을 힘’이 될까?',
      visual:{src:'slides/c34/s29.jpg', alt:'전환은 공정해야 한다, 말은 데이터로 검증한다, 수학은 속지 않을 힘이다 세 메시지', cap:'세 활동, 세 개의 메시지 · 교사 제작 PPT 슬라이드 29'},
      teacher:{
        ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?'],
        answer:['탄소중립 전환이 모두에게 공평하지 않다는 것을 데이터로 확인했습니다. / 코사인 유사도로 선언문의 구체성을 잴 수 있다는 것을 알았습니다.'],
        tip:['O/X 정답(1 O, 2 X, 3 O, 4 X, 5 O, 6 O)은 정답 슬라이드(28번)로 확인하고, 오답은 ‘왜 틀렸는지’를 학생이 고쳐 말하게 해요.','‘말(코사인)과 데이터(회귀·Scope)가 같은 방향일 때만 신뢰한다’로 정리하고 다음 차시(행렬·합성곱·경사하강법)를 예고해요.'],
        link:'다음 차시: 보이지 않는 오염 지도(행렬·합성곱)와 리바운드 효과(경사하강법)'},
      blocks:[
        {t:'ox', id:'c34-ox', ws:'활동지 13', q:'다음 문장이 맞으면 O, 틀리면 X를 골라요.', items:[
          {q:'상관계수가 +1에 가까우면 두 변수는 같은 방향으로 강하게 움직인다.', a:true, explain:'+1에 가까울수록 강한 양의 상관이에요.'},
          {q:'코사인 유사도는 두 벡터의 ‘크기(길이)’를 비교하는 값이다.', a:false, explain:'크기가 아니라 ‘방향’이 얼마나 비슷한지를 비교해요(길이는 나눠서 정규화).'},
          {q:'기업이 Scope 1·2만 공개하면 ‘숨겨진 상충’ 그린워싱일 수 있다.', a:true, explain:'가장 큰 Scope 3을 빼면 더 큰 배출원을 숨기게 돼요.'},
          {q:'‘지속가능·친환경’ 같은 단어가 많을수록 신뢰할 수 있는 선언이다.', a:false, explain:'모호어가 많을수록 오히려 의심해야 해요. 신뢰는 구체어·검증 가능한 데이터에서 나와요.'},
          {q:'선언의 코사인이 높아도 실제 배출이 늘면 교차검증에서 의심해야 한다.', a:true, explain:'말과 데이터가 같은 방향일 때만 믿어요.'},
          {q:'r²이 0.94이면 y 변동의 약 94%를 x로 설명할 수 있다는 뜻이다.', a:true, explain:'결정계수의 뜻이에요. 단, 상관 ≠ 인과.'}
        ]},
        {t:'write', id:'c34-fix', ws:'활동지 13', q:'틀린 문장(X)을 바르게 고쳐 써요.', rows:2, example:'2. 코사인 유사도는 두 벡터의 ‘방향’이 얼마나 비슷한지를 비교하는 값이다. 4. 모호어가 많을수록 의심해야 하고, 구체어·검증 데이터가 있어야 신뢰할 수 있다.'},
        {t:'write', id:'c34-one', ws:'활동지 14', q:'오늘의 한 문장 — 이번 수업에서 가장 중요하다고 느낀 점을 한 문장으로 써요.', rows:2, example:'말(코사인 유사도)과 데이터(회귀·Scope)가 같은 방향을 가리킬 때만 신뢰한다. 수학은 속지 않을 힘이다.'},
        {t:'reflect', id:'c34-exit', items:['오늘 새롭게 알게 된 점 한 가지','아직 궁금한 것 한 가지']},
        {t:'slides', from:27, to:29, title:'스스로 점검하기 · 정답 · 정리'},
        {t:'more', title:'더 나아가기 (워크북 6쪽 심화 탐구 제안)', items:[
          {img:'img/c34-more-greenwash.jpg', tag:'프로젝트', title:'실제 기업 진단 프로젝트', text:'관심 기업의 지속가능경영보고서를 코사인 유사도 + Scope 추이로 직접 진단하고 발표하기'},
          {img:'img/c34-more-cosine.jpg', tag:'심화', title:'TF-IDF·임베딩 심화', text:'단어 빈도를 넘어 TF-IDF, word2vec 등 실제 NLP 임베딩으로 확장해 선언문 비교하기', url:'https://matrix.skku.ac.kr/math4AI-tools/cosine_similarity/'},
          {img:'img/c34-more-charger.jpg', tag:'데이터', title:'지역 에너지 형평성 지도', text:'우리 지역 충전소·에너지빈곤 데이터를 수집해 시각화하고 우선 지원 지역 제안하기 (참고: 한국자동차환경협회 충전기 현황)', url:'https://chargeinfo.ksga.org'},
          {img:'img/c34-more-voucher.jpg', tag:'정책', title:'정책 제안서 작성', text:'데이터 근거로 ‘정의로운 전환’ 정책 제안서를 작성해 학교·지자체에 공유하기 (참고: 한국에너지공단 에너지바우처)', url:'https://www.energyv.or.kr'}
        ]}
      ]}
  ]
});


/* =====================================================================
   5~6차시 · 보이지 않는 오염 지도와 리바운드 효과 (고등, 100분) — v3
   공식 흐름: 보이지 않는 오염 살펴보기 → 열을 숫자로 보기 → 으뜸효율 가전의 역설 → 데이터로 정책 제안하기
   기준: 통합 지도안 [5~6차시/6차시] · 워크북 1~6쪽(활동지 1~15) · 교사 PPT 28장
   ===================================================================== */
const M5 = M => M.map((r,i)=>['행'+(i+1)].concat(r.map(String)));
const Q5 = M => M.map((r,i)=>['행'+(i+1)].concat(r.map(v=>'?'+v)));
const RQ = MA.map(r=>r.map(v=>{ const x = Math.round(v/7*100)/100; return x.toFixed(2) + (x===Math.round(x) ? '|'+Math.round(x) : ''); }));
const H5 = ['','열1','열2','열3','열4','열5'];

GS.lesson({
  id:'c56', theme:'carbon', order:3, period:'5~6차시', periods:2, level:'고등', minutes:100,
  title:'보이지 않는 오염 지도와 리바운드 효과',
  question:'눈에 안 보이는 열 오염은 어떻게 찾고, 효율이 좋아지면 정말 덜 쓸까?',
  goals:[
    '열 이미지를 행렬로 표현해 뺄셈·스칼라곱·합성곱으로 온배수·열섬 고위험 지도를 만들 수 있다.',
    '손실함수와 경사하강법으로 리바운드 계수를 추정해 효율 정책의 실제 감축 효과를 예측할 수 있다.',
    '분석 결과를 근거로 정책을 제안할 수 있다.'
  ],
  standards:[
    '[9수02-15] 이차함수의 그래프를 그릴 수 있고, 그 성질을 설명할 수 있다.',
    '[12인수03-01] 행렬을 이용하여 이미지 데이터를 목적에 맞게 표현할 수 있다.',
    '[12인수04-03] 손실함수를 이해하고 최적화된 추세선을 찾을 수 있다.',
    '[12인수04-04] 경사하강법을 이해하고 최적화된 예측을 위한 인공지능의 학습 방법을 설명할 수 있다.'
  ],
  prep:[
    '준비물: PPT, 학생 워크북, 온도 행렬 카드, 색연필(빨강·주황·노랑), 계산기, 정책 카드, 패들렛, 디지털 기기(QR 스캔용) (교육대상 중고등 20~25명 · 교실)',
    '4인 1모둠으로 편성하고 온도 행렬 카드와 색연필(빨강·주황·노랑)을 모둠별로 준비한다.',
    '영상·합성곱 체험 도구·경사하강법 자료 QR과 패들렛 발표 보드 접속 여부를 미리 확인한다.',
    '안전 지도(도입 10′): QR 스캔과 영상 시청 시 수업과 관련 없는 사이트에 접속하지 않는다. 패들렛 발표 보드에 실명, 얼굴 사진 등 개인정보를 올리지 않는다(게시 전 다시 상기).',
    '☆ 영상 QR(온배수·열섬) · ★ 합성곱 체험 도구 QR(Setosa) · ★ 경사하강법 인터랙티브 자료 QR(성균관대 Math4AI) · ☆ 활동지(워크북 1~5쪽)',
    '온도 행렬과 4가구 자료·w = 0.6은 교육용 재구성, 환급사업 수치는 실제 통계임을 구분해 안내한다. 고등학교 교육과정 기준이며 재구성하여 중학교에서 활용할 수 있다.'
  ],
  assess:[
    {what:'정책 A(열 오염)·B(리바운드) 설계와 발표(활동지 12~13번)', how:'근거 데이터(위험지수·w·시나리오)를 인용했는지 확인하고 부담이 누구에게 가는지(형평성) 토론하며, 모둠 슬로건 발표를 상호 평가한다(PPT 22번 평가 관점: 데이터 근거·수학적 해석·형평성·실행 가능성).'},
    {what:'개념 자기점검(활동지 14~15번)', how:'O/X 자기점검 6문항과 오늘의 한 문장. 정답 슬라이드로 확인하고 오답은 이유를 학생이 고쳐 말하게 한다.'}
  ],
  history:[
    {src:'media/c56/s05-03.jpg', title:'바다로 퍼지는 온배수', fact:'2020년 1~8월 발전소 온배수 399억 톤, 취수 대비 평균 +7.2℃로 배출.', credit:'교사 제작 PPT 수록 자료 (슬라이드 5, 교육용 시뮬레이션) · 수치 출처: 에너지신문(2020.10.22)'},
    {src:'media/c56/s05-04.jpg', title:'도시 열섬', fact:'여름 낮 도심(상업)은 공원·하천보다 지표온도가 높아요(오늘의 교육용 행렬: +10℃).', credit:'교사 제작 PPT 수록 자료 (슬라이드 5, 교육용 시뮬레이션)'},
    {src:'slides/c56/s13.jpg', title:'2025 으뜸효율 가전 환급사업', fact:'185만 건(2,348억 원) 환급, 총 매출 2.6조 원, 연간 소비전력 절감 48.3 GWh(잠정·추정치).', credit:'교사 제작 PPT 수록 자료 (슬라이드 13) · 출처: 기후에너지환경부·한국에너지공단(2026.1), ZDNet Korea(2026.01.20)'}
  ],
  steps:[
    { id:'invisible', phase:'도입', minutes:10, move:'관찰',
      title:'보이지 않는 오염 살펴보기',
      purpose:'냄새도 색도 없는 열 오염이 실제로 얼마나 큰지 알고, 그것을 어떻게 ‘볼’ 수 있을지 질문해요.',
      how:['온배수 399억 톤, 평균 +7.2℃ 자료를 확인해요.','온배수 뉴스 영상을 보고, 실험실에서 열을 직접 찾아봐요.','두 열영상(교육용 시뮬레이션)에서 가장 뜨거운 곳과 그 이유를 예상해 적어요(활동지 1번).'],
      outcome:'가장 뜨거운 곳(배수구 앞, 도심)을 짚고, 위성이 열을 ‘숫자’로 기록한다는 다음 장면의 출발점이 생겨요.',
      prompt:'냄새도 색도 없는 온배수와 열섬, 위성은 어떻게 ‘볼’까?',
      lead:'온배수는 냄새도 색도 없고, 열섬은 사진에 찍히지 않아요. 그런데 위성은 ‘열’을 봐요.',
      visual:{src:'slides/c56/s05.jpg', alt:'발전소 배수구에서 퍼지는 온배수 열영상과 도심·주거·공원의 여름 낮 지표온도 열영상', cap:'열적외선 위성영상 — 어디가 가장 뜨거운가? (교육용 시뮬레이션, 실제 Landsat 열적외선 밴드는 100 m 해상도) · 교사 제작 PPT 슬라이드 5'},
      teacher:{
        ask:['열영상에서 가장 뜨거운 곳은 어디이고, 왜 그럴까요?','위성은 열을 어떻게 기록할까요?'],
        answer:['배수구 근처입니다. 뜨거운 물이 계속 나오기 때문입니다. / 도심의 아스팔트 때문입니다.','픽셀마다 온도를 숫자로 기록합니다.'],
        tip:['안전 약속(QR·영상 시청 때 관련 없는 사이트 접속 금지, 패들렛 개인정보 보호)을 먼저 함께 읽어요.','온배수·열섬이 ‘보이지 않는 오염’임을 체감하도록 열영상을 먼저 보여 주고, 사진이 아니라 ‘숫자의 격자’라는 점을 학생 스스로 말하게 해요.'],
        link:'‘픽셀마다 숫자’라는 학생 답을 받아 다음 장면에서 행렬 연산으로 넘어가요.'},
      blocks:[
        {t:'stats', items:[{num:'399억 톤',label:'발전소 온배수 배출량 (2020.1~8, 한수원·발전5사)'},{num:'+7.2℃',label:'취수 대비 온배수 평균 배출 온도'},{num:'+10℃',label:'여름 낮 도심 vs 공원 지표온도 차 (오늘의 교육용 행렬)'}], src:'에너지신문(2020.10.22) · 교사 제작 PPT 슬라이드 3'},
        {t:'video', yt:'rZ4nCJVa1Q4', title:'MBC 뉴스데스크(2025.08.01) · 폭염에 뜨거워진 바다, 원전 온배수까지‥어민 ‘이중고’', note:'활동지 1쪽 영상 QR ①'},
        {t:'widget', name:'lab-thermal'},
        {t:'write', id:'c56-lab-th', q:'실험실에서 맨눈 보기와 열화상 보기는 무엇이 달랐나요? 조류 방향에 따라 피해 면적은 어떻게 바뀌었나요?', rows:3, placeholder:'맨눈 vs 열화상:\n피해 면적이 가장 넓은 조류:\n배수구에서 멀어질수록:', example:'맨눈으로는 바다색이 모두 같았지만 열화상에서는 배수구 앞이 밝게 보였어요. / 조류가 먼바다로 흐를 때 열이 멀리까지 실려 가 피해 면적이 가장 넓었어요(조류가 멈추면 열이 배수구 앞에 쌓였어요). / 배수구에서 멀어질수록 수온 상승이 줄었어요.'},
        {t:'write', id:'c56-hot', ws:'활동지 1', q:'열적외선 위성영상(교육용 시뮬레이션)을 보고, 가장 뜨거운 곳과 그 이유를 예상해요.', rows:2, placeholder:'가장 뜨거운 곳:\n이유:', example:'가장 뜨거운 곳: 왼쪽은 발전소 배수구 앞, 오른쪽은 도심(상업) / 이유: 배수구에서 뜨거운 물이 계속 나오고, 도심은 아스팔트·콘크리트가 햇빛을 흡수·저장하기 때문이에요.'},
        {t:'slides', from:3, to:5, title:'보이지 않는 오염 · 영상 QR · 열영상'}
      ]},

    { id:'matrix', phase:'전개 1', minutes:18, move:'분석',
      title:'열을 숫자로 보기 ① 뺄셈과 스칼라곱으로 위험 지도 만들기',
      purpose:'열영상이 숫자의 격자(행렬)라면, 두 행렬을 빼고 같은 수를 곱해서 ‘어디가 얼마나 위험한지’ 지도를 만들 수 있어요.',
      how:['위성이 열을 기록하는 방식(픽셀 = 숫자 = 행렬)을 확인해요.','A = T − B의 25칸을 같은 위치끼리 빼서 채워요(활동지 2번).','R = (1/7)·A를 소수 둘째 자리까지 구하고 등급에 따라 지도를 칠해요(활동지 3번).','×(1/10)으로 바꾸면 등급 지도가 어떻게 달라지는지 판단해요.'],
      outcome:'온배수의 ‘지문’(배수구 7℃에서 멀어질수록 5 → 3 → 1 → 0)과 고위험 4칸을 찾고, 기준 설정이 곧 정책 판단임을 알게 돼요. 다음은 지도를 필터로 다듬어요.',
      prompt:'가동 중 온도 T에서 가동 전 온도 B를 빼면, 어디가 얼마나 데워졌는지 보일까?',
      visual:{src:'slides/c56/s07.jpg', alt:'관측 온도 T(발전소 가동 중)와 배경 온도 B(가동 전) 5×5 행렬', cap:'행렬의 뺄셈: 온도 상승 A = T − B · 교사 제작 PPT 슬라이드 7'},
      teacher:{
        ask:['위성은 열을 어떻게 기록할까요?','가장 큰 상승값은 어디이고, 멀어질수록 어떻게 변하나요?'],
        answer:['픽셀마다 온도를 숫자로 기록합니다.','행1 열3에서 7℃이고, 멀어질수록 5, 3, 1, 0으로 줄어듭니다.'],
        tip:['행렬 뺄셈·스칼라곱은 ‘같은 위치 성분끼리’임을 강조해요. 예: A(1,3) = 31 − 24 = 7, R(2,3) = (1/7)×5 ≈ 0.71','등급 기준값(0.70/0.30)을 바꾸면 지도가 달라짐을 토론해 ‘기준 설정 = 정책 판단’임을 인식하게 해요.','종이 활동지는 색연필(빨강·주황·노랑)로 칠해요. 온도 행렬은 교육용 재구성 자료임을 안내해요.'],
        link:'등급 지도에 섞일 수 있는 ‘튀는 값’을 다음 장면에서 합성곱 필터로 다듬어요.'},
      blocks:[
        {t:'choice', id:'c56-pixel', ws:'활동지 1', q:'위성은 ‘열’을 어떻게 기록할까요?', options:['열영상을 색깔 사진으로만 저장한다','픽셀마다 온도를 숫자 하나로 기록하고, 그 숫자들이 격자(행렬)를 이룬다','사람이 현장에서 잰 온도를 지도에 옮겨 적는다'], answer:1,
          hints:['한 픽셀(Landsat: 100 m × 100 m)에 온도 값이 몇 개 들어갈까요?'],
          explain:'지표·해수면이 내뿜는 열적외선(10~12 μm)을 센서가 측정해 온도로 바꿔요. 행(row)·열(column)로 놓인 숫자 표 = 행렬이므로, 행렬을 계산하면 영상을 계산하는 거예요(슬라이드 6).'},
        {t:'table', title:'관측 온도 T (발전소 가동 중, ℃)', head:H5, rows:M5(MT), numeric:[1,2,3,4,5], rowhead:true},
        {t:'table', title:'배경 온도 B (가동 전, ℃)', head:H5, rows:M5(MB), numeric:[1,2,3,4,5], rowhead:true, caption:'행1이 해안(배수구 쪽), 행5가 먼바다예요. 발전소 온배수는 취수 대비 평균 약 7.2℃ 높게 배출돼요(에너지신문, 2020).'},
        {t:'predict', id:'c56-sub-pred', q:'A = T − B를 채우면 어떤 모양이 나올까요?', options:['배수구 앞이 가장 크고, 멀어질수록 작아진다','바다 전체가 고르게 몇 ℃씩 오른다','먼바다 쪽이 가장 크게 오른다'],
          reveal:[
            {t:'tablefill', id:'c56-A', ws:'활동지 2', q:'온도 상승 행렬 A = T − B의 25칸을 채워요. (같은 위치끼리 빼요)', head:['A'].concat(H5.slice(1)), rows:Q5(MA), tol:0.01, explain:'행1: 2 5 7 5 2 · 행2: 1 3 5 3 1 · 행3: 0 1 3 1 0 · 행4: 0 0 1 0 0 · 행5: 모두 0'},
            {t:'blanks', id:'c56-max', ws:'활동지 2', q:'가장 큰 상승값은 어느 위치이고 몇 ℃인가요? 배수구에서 멀어질수록 값은 어떻게 변하나요?', text:'(행 [[1]], 열 [[3]]) [[7]] ℃<br>열3을 따라 먼바다 쪽으로: 7 → [[5]] → [[3]] → [[1]] → [[0]]',
              explain:'행5(먼바다)는 모두 0으로 배경과 같아요. 실제 온배수의 확산 범위는 조류·수심에 따라 수 km까지예요(슬라이드 8).'}
          ]},
        {t:'tablefill', id:'c56-R', ws:'활동지 3', q:'스칼라곱으로 위험지수 R = (1/7)·A를 구해요(소수 둘째 자리).', head:['R'].concat(H5.slice(1)), rows:Q5(RQ), tol:0.005,
          caption:'스칼라곱: 모든 성분에 같은 수(1/7)를 곱해요. 최댓값 7 → 1.00으로 정규화(0~1).', explain:'행1: 0.29 0.71 1.00 0.71 0.29 · 행2: 0.14 0.43 0.71 0.43 0.14 · 행3: 0.00 0.14 0.43 0.14 0.00 · 행4: 열3만 0.14 · 행5: 모두 0.00'},
        {t:'widget', name:'carbon-riskmap', ws:'활동지 3'},
        {t:'blanks', id:'c56-grade', ws:'활동지 3', q:'칠한 지도에서 등급별 칸 수를 세어요.', text:'고위험(R ≥ 0.70) [[4]]칸 · 주의(0.30 ≤ R &lt; 0.70) [[3]]칸 · 낮음(R &lt; 0.30) [[18]]칸',
          hints:['2/7 ≈ 0.29는 0.30보다 작아서 ‘낮음’이에요.'], explain:'고위험: 행1 열2·열3·열4, 행2 열3 / 주의: 행2 열2·열4, 행3 열3 / 나머지 18칸 낮음'},
        {t:'choice', id:'c56-norm', ws:'활동지 3', q:'‘×(1/7)’ 대신 ‘×(1/10)’으로 정규화하면(등급 기준은 그대로) 고위험 칸은?', options:['4칸 그대로다','1칸으로 줄어든다','모든 칸이 고위험이 된다'], answer:1,
          hints:['고위험이던 A 값 7, 5, 5, 5를 각각 10으로 나눠 보세요.','0.70 이상은 7 ÷ 10 = 0.70 하나뿐이에요.'],
          why:'같은 자료인데 나누는 수(기준)를 바꾸면 지도가 달라져요. 이 사실은 정책을 정할 때 어떤 질문을 던지나요?',
          explain:'×(1/7)이면 고위험 4칸, ×(1/10)이면 행1 열3 한 칸만 남아요. 기준 설정이 곧 정책 판단이에요.'},
        {t:'slides', from:6, to:9, title:'픽셀 = 숫자 = 행렬 · 뺄셈 · 온배수의 지문 · 위험 등급 지도'}
      ]},

    { id:'conv', phase:'전개 1', minutes:17, move:'예측',
      title:'열을 숫자로 보기 ② 합성곱 필터와 도시 열섬',
      purpose:'위험 지도에는 센서 잡음 같은 튀는 값이 섞일 수 있어요. 필터로 다듬고, 같은 행렬 뺄셈을 도시 열섬에도 써 봐요.',
      how:['평균 필터를 지나면 (2행, 3열)의 값 5가 어떻게 될지 예측해요.','체험판과 커널 도구로 3×3 창을 겹쳐 보고, 세 위치의 합과 출력을 손으로 구해요(활동지 4번).','H = S − P로 열섬 강도를 구하고 폭염 고위험 구역을 골라요(활동지 5번).'],
      outcome:'평균 필터는 이웃과 섞어 부드럽게, 경계 검출 필터는 경계를 뚜렷하게 만든다는 것과, 도심(+10℃)이 가장 먼저 식혀야 할 곳임을 알게 돼요. 다음은 ‘찾는’ 수학에서 ‘예측하는’ 수학으로 넘어가요.',
      prompt:'혼자 튀는 픽셀을 이웃과 섞으면 지도는 어떻게 달라질까?',
      lead:'필터 K = (1/9)·[[1,1,1],[1,1,1],[1,1,1]] · 출력(i, j) = (1/9) × { A의 (i, j) 주변 3×3 칸의 합 }',
      visual:{src:'slides/c56/s10.jpg', alt:'3×3 평균 필터와 합성곱 계산 예시, 경계 검출 필터와 CNN 설명', cap:'합성곱(Convolution): 3×3 필터로 영상을 다듬다 · 교사 제작 PPT 슬라이드 10'},
      teacher:{
        ask:['평균 필터를 지나면 값이 왜 부드러워질까요?'],
        answer:['주변 9칸의 평균이 되기 때문입니다.'],
        tip:['합성곱은 필터를 실제로 겹쳐 보는 카드 조작으로 이해시켜요. 예) 출력(2행, 3열) = (1/9)(5+7+5 + 3+5+3 + 1+3+1) = 33/9 ≈ 3.67','경계 검출 필터 [[−1,−1,−1],[−1,8,−1],[−1,−1,−1]]·CNN과 연결해요.','열섬은 ‘같은 시기’ 도심과 교외(공원)를 비교하는 개념임을 짚어요.'],
        link:'1부 요약(슬라이드 12): 영상은 행렬 → 연산이 오염을 드러냄 → 지도는 정책. 이어서 효율 정책의 효과를 예측해요.'},
      blocks:[
        {t:'video', yt:'ubQFC7rV9HQ', title:'YTN 사이언스 · 찜통 같은 도심…원인은 열섬 현상', note:'활동지 1쪽 영상 QR ② · 도시 열섬을 먼저 보고 필터로 찾아봐요'},
        {t:'predict', id:'c56-conv-pred', q:'평균 필터를 지나면 A(2행, 3열)의 값 5는?', options:['더 커진다','그대로 5다','더 작아진다'],
          reveal:[
            {t:'widget', name:'carbon-conv'},
            {t:'tablefill', id:'c56-conv', ws:'활동지 4', q:'세 위치의 3×3 칸의 합과 출력값을 구하고, 체험판에서 그 칸을 눌러 확인해요.', head:['구할 위치','3×3 칸의 합','출력값 = 합 ÷ 9','원래 A 값'], rows:[
              ['(2행, 2열)','?27','?3','3'],
              ['(3행, 3열)','?17','?1.89','3'],
              ['(3행, 2열)','?14','?1.56','1']
            ], explain:'(2,2): 2+5+7+1+3+5+0+1+3 = 27 → 3 · (3,3): 3+5+3+1+3+1+0+1+0 = 17 → 1.89 · (3,2): 1+3+5+0+1+3+0+0+1 = 14 → 1.56'},
            {t:'write', id:'c56-same', ws:'활동지 4', q:'(2행, 2열)은 출력과 원래 값이 같아요. 왜일까요?', rows:1, example:'주변 9칸의 평균(27 ÷ 9 = 3)이 우연히 자기 값 3과 같기 때문이에요.'},
            {t:'choice', id:'c56-filter', ws:'활동지 4', q:'이런 평균 처리를 하는 이유는?', options:['센서 잡음·구름 조각처럼 혼자 튀는 값을 부드럽게 하려고','온배수 경계선을 더 뚜렷하게 하려고','최댓값을 1로 맞추려고'], answer:0,
              hints:['체험판에서 평균 필터와 경계 검출 필터의 출력 지도를 번갈아 보세요.','최댓값을 1로 맞추는 것은 스칼라곱이 하는 일이었어요.'],
              explain:'평균 필터는 이웃과 섞어 부드럽게 만들어요(경계는 흐려짐). 값이 급변하는 경계선을 찾는 것은 경계 검출 필터예요. CNN은 이런 필터 수백 개를 데이터로 ‘학습’해요.'}
          ]},
        {t:'tool', url:'https://setosa.io/ev/image-kernels/', title:'이미지 합성곱(커널) 체험 (Setosa)', text:'활동지 1쪽·PPT 10번 QR 도구. 평균(blur)·경계(outline) 커널을 사진에 씌워 보고 숫자가 어떻게 바뀌는지 확인해요.', embed:true, img:'img/c56-more-kernel.jpg'},
        {t:'tablefill', id:'c56-H', ws:'활동지 5', q:'도시 열섬: 여름 낮 지표온도 S에서 공원 기준 P(모든 성분 28℃)를 빼 열섬 강도 H = S − P를 구해요.', head:['','열1','열2','열3'], rows:[
          ['S 행1','38','36','31'],
          ['S 행2','37','35','30'],
          ['S 행3','33','31','28'],
          ['H 행1','?10','?8','?3'],
          ['H 행2','?9','?7','?2'],
          ['H 행3','?5','?3','?0']
        ], caption:'행1 열1 = 도심(상업·아스팔트), 행2 열2 = 주거, 행3 열3 = 공원·하천. P = 28 × (모든 성분이 1인 행렬)이므로 H는 각 칸이 공원보다 몇 ℃ 더 뜨거운지를 나타내요.', explain:'도심 +10℃, 주거 +7℃, 공원·하천 0'},
        {t:'choice', id:'c56-zone', ws:'활동지 5', q:'폭염 고위험 구역(쿨루프·녹지 우선 투자 지역)은?', options:['(행1, 열1) 도심(상업, +10℃)','(행2, 열2) 주거 (+7℃)','(행3, 열3) 공원·하천 (0℃)'], answer:0,
          hints:['H가 가장 큰 칸을 찾아요.','열섬 강도가 큰 구역일수록 폭염에 취약해요.'],
          why:'그 구역이 가장 뜨거운 까닭을 쓰고, 주거 지역에 어르신·어린이가 많이 산다면 선택이 바뀔지도 생각해 써요.',
          explain:'도심은 아스팔트·콘크리트가 햇빛을 흡수·저장해 +10℃예요. 공원·하천은 녹지와 물이 열을 완충해 0이에요(슬라이드 11).'},
        {t:'slides', from:10, to:12, title:'합성곱 · 도시 열섬 · 1부 요약'}
      ]},

    { id:'rebound', phase:'전개 2', minutes:15, move:'예측',
      title:'으뜸효율 가전의 역설 ① 리바운드 효과',
      purpose:'효율 좋은 가전을 사면 정말 그만큼 덜 쓸까? 실제 정책의 숫자를 의심해 보고 계산으로 확인해요.',
      how:['2025 으뜸효율 환급사업 자료(185만 건, 48.3 GWh 잠정)를 읽고 실제로 그만큼 줄지 않을 수 있는 이유를 써요(활동지 6번).','에어컨 예시로 실제 절감률과 리바운드율을 계산해요(활동지 7번).','와트 증기기관·LED·자동차 연비·AI 반도체 사례를 설명과 연결하고, 역설인지 부분 리바운드인지 나눠요(활동지 8번).'],
      outcome:'예상 절감의 일부(극단적 예에서는 약 58%)가 되돌아올 수 있고 실증 연구는 10~30%로 본다는 것을 알게 돼요. 그래서 되돌아오는 몫(계수)을 데이터로 추정해야 해요.',
      prompt:'전기를 30% 덜 먹는 에어컨, 정말 30%만큼 줄어들까?',
      visual:{src:'slides/c56/s13.jpg', alt:'환급 185만 건(2,348억 원 환급), 총 매출 2.6조 원, 연간 소비전력 절감 48.3 GWh(잠정·추정치)', cap:'출처: 기후에너지환경부·한국에너지공단(2026.1), ZDNet Korea(2026.01.20) · 교사 제작 PPT 슬라이드 13'},
      teacher:{
        ask:['2025 으뜸효율 환급사업 — 정말 그만큼 줄었을까?','새 에어컨이 전기를 덜 먹으면 우리는 어떻게 행동할까요?'],
        answer:['더 오래, 더 시원하게 켤 것 같습니다.'],
        tip:['리바운드율 계산에서 ‘예상 절감 대비 실제 절감’의 뜻을 먼저 말로 정리하게 해요.','에어컨 예시는 이해를 돕기 위한 극단적 예예요(실증치 10~30%, Sorrell 2007).','환급사업 수치는 실제 통계, 4가구 자료와 w = 0.6은 교육용 재구성임을 구분하고, ‘효율 개선’과 ‘소비전력 감소’를 구분해 써요.'],
        link:'‘리바운드 계수를 데이터로 추정해야 한다’(슬라이드 16 시사점)에서 다음 장면의 손실함수로 넘어가요.'},
      blocks:[
        {t:'callout', tone:'key', title:'2025년 으뜸효율 가전제품 환급사업 (기후에너지환경부·한국에너지공단, 2026.1 발표)', text:'TV·냉장고·에어컨·세탁기 등 11개 품목의 에너지효율 1등급 제품을 사면 구매가의 10%(1인 30만 원 한도)를 환급. 접수 약 196만 건 중 약 185만 건(2,348억 원) 환급, 총매출 약 2조 6천억 원 창출, 연간 소비전력 절감 효과 48.3 GWh(잠정).'},
        {t:'write', id:'c56-why483', ws:'활동지 6', q:'48.3 GWh는 잠정치로, 사용 습관 변화(더 오래·더 자주 사용)를 반영하지 않은 추정일 가능성이 높아요. 실제로 그만큼 줄지 않을 수 있는 이유를 적어요.', rows:2, example:'전기를 덜 먹는 에어컨이라 요금 걱정이 줄어 더 오래, 더 시원하게 켜고, 아낀 돈으로 다른 제품을 사면 그만큼 에너지를 다시 쓰기 때문이에요.'},
        {t:'predict', id:'c56-ac-pred', q:'소비전력이 30% 준 새 에어컨을 하루 8시간 → 10시간 켠다면, 실제 절감률은?', options:['30% 그대로','30%보다 조금 적다 (약 25%)','절반도 안 된다 (약 12.5%)','오히려 더 쓴다'],
          compare:'48.3 GWh도 실제로는 그만큼 줄지 않을 수 있어요. 내 예측과 계산을 비교하며 그 까닭을 써요.',
          reveal:[
            {t:'table', head:['구분','기존 에어컨','으뜸효율 에어컨 (소비전력 30% 감소)'], rows:[['1시간 전력 소비 (기존 = 100)','100','70'],['하루 사용 시간','8시간','10시간 (전기요금 부담↓ → 더 오래 켬)'],['하루 소비량','100 × 8 = 800','70 × 10 = ?']], rowhead:true},
            {t:'blanks', id:'c56-rb', ws:'활동지 7', q:'직접 리바운드 효과를 계산해요.', text:'하루 소비량: 70 × 10 = ( [[700]] )<br>① 예상 절감률(사용 시간이 그대로일 때) = 30%<br>② 실제 절감률 = (800 − 실제 소비량) / 800 = ( [[12.5]] )%<br>③ 리바운드율 = 1 − (실제 절감률 ÷ 예상 절감률) = 1 − ( [[12.5]] ) ÷ 30 = ( [[0.58|0.583|58%|58]] ) → 예상 절감의 약 ( [[58]] )%가 되돌아옴',
              hints:['(800 − 700) ÷ 800 = 0.125','12.5 ÷ 30 ≈ 0.417'],
              explain:'리바운드 효과: 효율 개선으로 단위 서비스 비용이 싸지면 사용이 늘어(직접) 절감의 일부가 사라지고, 아낀 돈을 다른 소비에 써(간접) 배출이 다시 늘어요. 실증 연구는 가정 냉난방·승용차의 직접 리바운드를 대략 10~30%로 추정해요(Sorrell, 2007).'},
            {t:'widget', name:'carbon-rebound'}
          ]},
        {t:'widget', name:'lab-rebound'},
        {t:'write', id:'c56-lab-rb', q:'실험실에서 백파이어가 일어난 조건(효율·ε)은 무엇이었나요? 실제 사례 중 어디에 가까운가요?', rows:2, placeholder:'백파이어 조건:\n가까운 사례:', example:'효율 40%, ε 1.3처럼 싸진 만큼 아주 많이 더 쓰면 리바운드율이 100%를 넘었어요. AI 반도체 사례와 비슷해요.'},
        {t:'sort', id:'c56-match', ws:'활동지 8', q:'리바운드·제번스의 역설 사례 — 설명을 알맞은 사례 칸에 연결해요.', bins:['와트 증기기관 개량 (18세기 후반, 영국)','LED 조명','자동차 연비 향상','AI 반도체 효율 향상'], items:[
          {text:'전광판·야간 조명 등 쓰임이 크게 늘어 조명 전력 수요가 오히려 늘었다는 분석도 있음', bin:1},
          {text:'연비가 좋아지자 더 자주, 더 멀리 운전 → 주행거리 증가로 연료 절감분 일부 상쇄', bin:2},
          {text:'석탄 효율이 좋아지자 석탄 사용이 줄기는커녕 산업 전반으로 확산되어 총소비 급증', bin:0},
          {text:'연산 비용이 싸지자 데이터센터·모델 규모가 급증해 전력 수요 증가 (2020년대)', bin:3}
        ], explain:'제번스는 1865년 『석탄 문제(The Coal Question)』에서 효율적인 연료 사용이 소비를 줄인다는 생각을 착각이라고 지적했어요(슬라이드 15).'},
        {t:'sort', id:'c56-type', ws:'활동지 8', q:'네 사례 중 어느 것이 역설이고 어느 것이 부분 리바운드일까요? (리바운드율 100% 초과 = 백파이어·제번스의 역설, 100% 미만 = 부분 리바운드)', bins:['제번스의 역설 (총소비가 오히려 늘어남)','부분 리바운드 (절감 일부만 상쇄)','역설 논의가 있는 사례 (논쟁 중)'], items:[
          {text:'와트 증기기관 개량 → 석탄 총소비 급증', bin:0},
          {text:'자동차 연비 향상 → 절감분 일부 상쇄', bin:1},
          {text:'LED 조명 → 조명 전력 수요가 늘었다는 분석도 있음', bin:[1,2]},
          {text:'AI 반도체 효율 향상 → 데이터센터 전력 수요 증가', bin:[0,2]}
        ], explain:'교사 PPT 기준: 자동차 연비의 직접 리바운드는 10~30%라 역설이 아닌 ‘부분 리바운드’, LED는 ‘논쟁 중’, AI 반도체는 ‘2020년대 제번스 역설 논의’예요. LED·AI 반도체는 아직 결론이 나지 않은 사례라, 근거를 대면 이웃 칸에 놓아도 맞게 봐요.'},
        {t:'slides', from:13, to:16, title:'환급사업 · 리바운드 효과 · 제번스의 역설 · 실증 연구'}
      ]},

    { id:'gd', phase:'전개 2', minutes:20, move:'분석',
      title:'으뜸효율 가전의 역설 ② 손실함수와 경사하강법으로 w 찾기',
      purpose:'되돌아오는 몫(리바운드 계수 w)을 짐작이 아니라 데이터로 찾으려면, 오차를 재는 손실함수와 그 바닥을 찾는 방법이 필요해요.',
      how:['4가구 자료로 L(0)과 L(0.6)을 계산해 비교해요(활동지 9번).','η = 5, w₀ = 0에서 경사하강법을 세 단계 더 계산하고, η = 10·15와 비교해요(활동지 10번).','w별 실제 소비와 절감률을 구하고 48.3 GWh에 적용해 봐요(활동지 11번).'],
      outcome:'w* = 0.6(교육용 자료)이면 30% 소비전력 감소가 실제로는 17.4% 절감에 그친다는 것을 알고, 이 결과를 정책 B의 근거로 써요.',
      prompt:'리바운드 계수 w를 데이터로 찾으려면, 손실의 그릇 바닥까지 어떻게 내려갈까?',
      lead:'4가구(교육용) 효율 개선율 e = 0.10, 0.20, 0.30, 0.40 → 사용량 증가율 u = 0.05, 0.12, 0.17, 0.25. 모델 u = w·e, 손실함수(평균제곱오차) L(w) = (1/4) Σ (w·eᵢ − uᵢ)²',
      visual:{src:'media/c56/s17-12.jpg', alt:'효율 개선율 e(%)와 사용량 증가율 u(%) 4개 점 (10, 5), (20, 12), (30, 17), (40, 25) 산점도', cap:'모델 세우기: 효율 개선율 e → 사용량 증가율 u · 교사 제작 PPT 슬라이드 17'},
      teacher:{
        ask:['w* = 0.6은 무엇을 뜻하나요?'],
        answer:['효율이 10% 좋아지면 사용량이 약 6% 늘어난다는 뜻입니다.'],
        tip:['경사하강법은 ‘기울기 반대 방향·학습률’ 두 요소를 강조하고, η=10이면 진동하며 수렴, η=15면 발산함을 직접 계산해 확인하게 해요(이 문제는 η > 2/0.15 ≈ 13.3이면 발산).','시나리오 (1−0.3)(1+0.3w)로 w별 실제 절감률을 구하고, w=1.5에서 소비가 오히려 늘어나는 제번스의 역설을 확인해요.','가상 계수(리바운드율 42%)를 적용한 약 28 GWh와 실증 범위(10~30%)를 적용한 약 34~43 GWh를 비교해 ‘계수 추정’의 중요성을 확인해요.','3~4차시 최소제곱법(공식으로 한 번에)과 경사하강법(조금씩 반복)을 비교해 말해 줘요.'],
        link:'‘효율 지원은 탄소가격·총량 규제와 함께 가야 한다’(슬라이드 21)로 정책 설계로 넘어가요.'},
      blocks:[
        {t:'blanks', id:'c56-L', ws:'활동지 9', q:'두 w의 손실을 비교해요. (반올림 값도 인정)', text:'L(0) = (1/4)(0.05² + 0.12² + 0.17² + 0.25²) = ( [[0.0271|0.027075|0.027]] )<br>L(0.6) = (1/4){(0.06−0.05)² + (0.12−0.12)² + (0.18−0.17)² + (0.24−0.25)²} = ( [[0.000075|0.0000750]] )<br>손실이 더 작은 w는? [[0.6]]', tol:0.00002,
          explain:'w = 0.6일 때 손실이 훨씬 작아요. 손실을 ‘가장 작게’ 만드는 w를 찾는 방법이 경사하강법이에요.'},
        {t:'predict', id:'c56-eta-pred', q:'w(다음) = w − η·L′(w), L′(w) = (1/2)Σ(w·eᵢ − uᵢ)·eᵢ = 0.15w − 0.09. 보폭 η를 5에서 15로 키우면?', options:['더 빨리 바닥(0.6)에 도착한다','바닥을 넘나들지만 결국 도착한다','바닥을 지나쳐 점점 멀어진다'],
          reveal:[
            {t:'tablefill', id:'c56-gd', ws:'활동지 10', q:'경사하강법으로 w를 찾아요. 학습률 η = 5, 시작 w₀ = 0', head:['단계','현재 w','기울기 L′(w) = 0.15w − 0.09','다음 w = w − η·L′(w)'], rows:[
              ['0 → 1','w₀ = 0','0.15×0 − 0.09 = −0.09','0 − 5×(−0.09) = 0.45'],
              ['1 → 2','w₁ = 0.45','?-0.0225','?0.5625'],
              ['2 → 3','?0.5625','?-0.005625|-0.0056','?0.5906|0.590625'],
              ['3 → 4','?0.5906','?-0.0014|-0.00141','?0.5977|0.5976']
            ], tol:0.0005, explain:'0.45 → 0.5625 → 0.5906 → 0.5977 … 0.6에 수렴해요(슬라이드 19).'},
            {t:'widget', name:'carbon-gd'},
            {t:'blanks', id:'c56-wstar', ws:'활동지 10', q:'바닥과 보폭', text:'w는 어떤 값으로 다가가나요? w* ≈ [[0.6]] (검산: L′(w*) = 0 → 0.15w* = 0.09)<br>w* = 0.6의 뜻: 효율이 10% 좋아지면 사용량은 약 [[6]]% 늘어난다.<br>η = 10: 0 → [[0.9]] → [[0.45]] ( [[진동|진동하며 수렴|진동하며수렴|진동하며 수렴한다]] ) · η = 15: 0 → [[1.35]] → [[-0.3375|−0.3375]] ( [[발산|발산한다]] )',
              explain:'η > 2/0.15 ≈ 13.3이면 발산해요. 딥러닝은 수백만 개의 w를 이 규칙으로 동시에 갱신해요.'}
          ]},
        {t:'tool', url:'http://matrix.skku.ac.kr/math4ai/gradient_descent/', title:'경사하강법 인터랙티브 자료 (성균관대 Math4AI)', text:'활동지 10번·PPT 18번 QR 도구. 학습률을 바꾸며 수렴·진동·발산을 확인해요. 사이트가 열리지 않으면 이 화면의 학습률 실험으로 같은 내용을 확인할 수 있어요.', img:'img/c56-more-gd.jpg'},
        {t:'tablefill', id:'c56-scn', ws:'활동지 11', q:'시나리오 예측 — 소비전력이 30% 줄 때 실제 소비 = (1 − 0.3) × (1 + 0.3w). w에 따라 계산해요.', head:['리바운드 계수 w','실제 소비 (기존 = 1)','실제 절감률(%)'], rows:[
          ['0 (리바운드 없음)','0.7 × 1.00 = 0.70','30'],
          ['0.6 (모델 추정)','?0.826','?17.4'],
          ['1.0','?0.91','?9'],
          ['1.5','?1.015','?-1.5|−1.5']
        ], caption:'0.6 → 0.7 × 1.18, 1.0 → 0.7 × 1.30, 1.5 → 0.7 × 1.45', explain:'w = 1.5면 소비가 오히려 늘어요(제번스의 역설).'},
        {t:'blanks', id:'c56-nation', ws:'활동지 11', q:'판단하고 국가 데이터에 적용해요. (주의: w = 0.6은 4가구 교육용 값)', text:'소비가 오히려 늘어나는(절감률 &lt; 0) 경우는 w = [[1.5]]일 때 → 제번스의 역설<br>w = 0.6일 때 리바운드율 = 1 − (실제 절감률 ÷ 30%) ≈ [[0.42|42%|42]]<br>48.3 GWh × (1 − 리바운드율) ≈ [[28|28.0]] GWh<br>실증 범위(리바운드 10~30%)를 적용하면 약 [[34|33.8]] ~ [[43|43.5|43.47]] GWh',
          hints:['17.4 ÷ 30 = 0.58','48.3 × 0.7 ≈ 33.8, 48.3 × 0.9 ≈ 43.5'],
          explain:'결론은 ‘계수’에 달려 있어요. 실제 데이터로 w를 추정해야 정책 효과를 부풀리지 않아요(슬라이드 20).'},
        {t:'write', id:'c56-nation-cmp', ws:'활동지 11', q:'두 결과(약 28 GWh와 약 34~43 GWh)를 비교하면?', rows:2, example:'같은 48.3 GWh라도 리바운드 계수를 무엇으로 보느냐에 따라 실제 절감이 28 GWh까지 줄 수 있어요. 그래서 실제 데이터로 계수를 추정해야 해요.'},
        {t:'slides', from:17, to:21, title:'모델 · 경사하강법 · 계산 실습 · 시나리오 · 2부 요약'}
      ]},

    { id:'policy', phase:'전개 3', minutes:15, move:'판단',
      title:'데이터로 정책 제안하기 ① 열 오염 대책과 리바운드 억제 대책',
      purpose:'오염을 ‘찾은’ 수학(위험지수·합성곱)과 효과를 ‘예측한’ 수학(w·시나리오)이 있어야 근거 있는 정책을 만들 수 있어요.',
      how:['정책 A(보이지 않는 열 오염 대책)를 위험지수·합성곱·열섬 결과를 인용해 설계해요(활동지 12번).','정책 B(리바운드 억제 대책)를 리바운드 계수·시나리오를 인용해 설계해요.','우리 모둠의 정책을 슬로건 한 문장으로 만들어 발표하고 서로 평가해요(활동지 13번).'],
      outcome:'데이터 근거와 형평성(누가 부담하나)을 함께 따진 두 정책이 완성되고, 마지막 장면에서 오늘 개념을 점검해요.',
      prompt:'효율 지원만으로 충분하지 않다면, 무엇을 함께 해야 할까?',
      visual:{src:'slides/c56/s22.jpg', alt:'정책 A 보이지 않는 열 오염 대책, 정책 B 리바운드 억제 대책 모둠 미션 카드', cap:'모둠 미션: 두 개의 정책을 데이터 근거로 설계하라 · 교사 제작 PPT 슬라이드 22'},
      teacher:{
        ask:['효율 지원만으로 충분하지 않다면 무엇을 함께 해야 할까요?'],
        answer:['탄소가격이나 총량 규제를 함께 해야 합니다.'],
        tip:['정책 A(열 오염)·B(리바운드)에 각각 ‘근거 데이터(위험지수·w·시나리오)’를 인용했는지 확인하고, 부담이 누구에게 가는지(형평성) 토론해요.','모둠별 슬로건과 함께 발표하고 상호 평가해요(패들렛, 게시 전 개인정보 보호 상기).','진로 연계: 원격탐사·GIS 분석가, 에너지경제학자·정책분석가, AI 엔지니어(슬라이드 23).'],
        link:'발표 후 O/X 자기점검으로 3~6차시 전체를 ‘데이터로 진실을 읽는 수학’으로 묶어요.'},
      blocks:[
        {t:'timer', minutes:15, label:'모둠 미션 시간'},
        {t:'p', text:'정책을 쓰기 전에 실험실에서 정책 손잡이를 움직여 효과를 숫자로 확인해요. 그 숫자를 정책의 근거로 인용하세요.'},
        {t:'widget', name:'lab-thermal', opts:{policy:true}},
        {t:'widget', name:'lab-rebound', opts:{policy:true}},
        {t:'write', id:'c56-polA', ws:'활동지 12', q:'정책 A — 보이지 않는 열 오염 대책 (근거: 위험지수·합성곱 결과·열섬 H 행렬)', rows:4,
          placeholder:'정책 이름:\n대상 지역/집단:\n근거 데이터(수치·식):\n기대효과 / 부작용:',
          example:'이름: 고위험 해역 실시간 수온 감시 + 온배수 재이용 / 대상: 배수구 앞 R ≥ 0.7 구역(4칸)과 인근 어민 / 근거: A(1,3) = 7℃, R ≥ 0.7 고위험 4칸, 실제 온배수 평균 +7.2℃ / 기대효과·부작용: 양식·지역난방·온실에 열을 재활용, 설비 비용은 발전사 부담 필요'},
        {t:'write', id:'c56-polB', ws:'활동지 12', q:'정책 B — 리바운드 억제 대책 (근거: 리바운드 계수 w*·시나리오 표·48.3 GWh 중 되돌아오는 몫)', rows:4,
          placeholder:'정책 이름:\n대상 지역/집단:\n근거 데이터(수치·식):\n기대효과 / 부작용:',
          example:'이름: 효율 환급 + 누진요금·스마트미터 실시간 사용량 피드백 / 대상: 환급을 받은 가구 / 근거: w = 0.6이면 30% 효율 개선이 실제 17.4% 절감, 48.3 GWh → 약 28 GWh / 기대효과·부작용: 리바운드를 가격·정보로 줄임, 요금 부담이 저소득층에 커질 수 있어 보완 필요'},
        {t:'p', text:'예) 정책 A: 고위험 구역(R ≥ 0.7) 우선 감시 · 온배수 재이용(양식·지역난방) · 쿨루프·녹지 / 정책 B: 효율 지원 + 탄소가격·누진요금, 총량 규제, 실시간 사용량 피드백 (활동지 5쪽)'},
        {t:'write', id:'c56-slogan', ws:'활동지 13', q:'발표 슬로건 — 우리 모둠의 정책을 한 문장으로!', rows:1, example:'아낀 만큼 더 쓰지 않게, 보이지 않는 열까지 지도에!'},
        {t:'slides', from:22, to:23, title:'모둠 미션 · 이 수학은 어떤 직업으로 이어질까?'}
      ]},

    { id:'check', phase:'정리', minutes:5, move:'성찰',
      title:'데이터로 정책 제안하기 ② 스스로 점검하기',
      purpose:'정책의 근거로 쓴 행렬 연산·합성곱·리바운드·경사하강법 개념을 바르게 이해했는지 스스로 확인해요.',
      how:['O/X 6문항을 풀고 틀린 문장은 바르게 고쳐요(활동지 14번).','오늘의 한 문장을 써요(활동지 15번).','출구 카드로 이해 정도를 표시해요.'],
      outcome:'‘보이지 않는 오염은 행렬 연산으로 보이게, 효율의 역설은 손실함수와 경사하강법으로 예측한다. 기술의 최적화가 진짜 감축이 되려면 정책이 함께 가야 한다’로 3~6차시를 마무리해요.',
      prompt:'기술의 최적화가 진짜 감축이 되려면 무엇이 함께 가야 할까?',
      visual:{src:'slides/c56/s26.jpg', alt:'보이지 않는 것을 보이게, 효율의 역설을 계산하라, 최적화는 정책과 함께 세 메시지', cap:'세 활동, 세 개의 메시지 · 교사 제작 PPT 슬라이드 26'},
      teacher:{
        ask:['오늘 수업을 통해 새롭게 알게 된 점은 무엇인가요?'],
        answer:['행렬 연산으로 보이지 않는 오염을 지도로 만들 수 있습니다. / 효율이 좋아져도 리바운드 때문에 예상만큼 줄지 않을 수 있습니다.'],
        tip:['O/X 정답(1 O, 2 O, 3 X, 4 X, 5 O, 6 O)은 정답 슬라이드(25번)로 확인하고, 오답은 이유를 학생이 고쳐 말하게 해요.','3~6차시 전체(회귀·코사인·행렬·경사하강법)를 ‘데이터로 진실을 읽는 수학’으로 묶어 정리하고 프로그램을 마무리해요.'],
        link:'탄소중립(고등) 3~6차시 마무리 — 데이터는 거짓말하지 않는다. 다만 우리가 읽을 줄 알아야 한다.'},
      blocks:[
        {t:'ox', id:'c56-ox', ws:'활동지 14', q:'다음 문장이 맞으면 O, 틀리면 X를 골라요.', items:[
          {q:'행렬의 뺄셈 T − B는 같은 위치(행, 열)의 성분끼리 뺀다.', a:true, explain:'같은 위치 성분끼리 빼요.'},
          {q:'스칼라곱 (1/7)·A는 행렬 A의 모든 성분에 1/7을 곱한 것이다.', a:true, explain:'모든 성분에 같은 수를 곱해요.'},
          {q:'3×3 평균 필터로 합성곱을 하면 값이 급격히 변하는 경계가 더 뚜렷해진다.', a:false, explain:'평균 필터는 이웃과 섞어 부드럽게 만들어요(경계는 흐려짐). 경계를 찾는 것은 경계 검출 필터예요.'},
          {q:'기기의 소비전력이 30% 줄면 전체 에너지 사용량도 항상 30% 줄어든다.', a:false, explain:'더 오래·더 자주 쓰면(리바운드) 실제 절감은 30%보다 작아요.'},
          {q:'리바운드율이 100%를 넘으면 효율 개선 후 총 소비가 오히려 늘어난다(제번스의 역설).', a:true, explain:'백파이어, 곧 제번스의 역설이에요.'},
          {q:'경사하강법은 손실함수의 기울기 반대 방향으로 조금씩 이동하며 최솟값을 찾는다.', a:true, explain:'w(다음) = w − η·L′(w)'}
        ]},
        {t:'write', id:'c56-fix', ws:'활동지 14', q:'틀린 문장(X)을 바르게 고쳐 써요.', rows:2, example:'3. 평균 필터는 값을 부드럽게 만들어 경계가 흐려진다. 4. 리바운드 때문에 실제 절감은 30%보다 작을 수 있다.'},
        {t:'write', id:'c56-one', ws:'활동지 15', q:'오늘의 한 문장 — 이번 수업에서 가장 중요하다고 느낀 점을 한 문장으로 써요.', rows:2, example:'보이지 않는 오염은 행렬 연산으로 ‘보이게’ 만들고, 효율의 역설은 손실함수와 경사하강법으로 ‘예측’한다. 기술의 최적화가 진짜 감축이 되려면 정책이 함께 가야 한다.'},
        {t:'reflect', id:'c56-exit', items:['오늘 새롭게 알게 된 점 한 가지','아직 궁금한 것 한 가지']},
        {t:'slides', from:24, to:26, title:'스스로 점검하기 · 정답 · 정리'},
        {t:'more', title:'더 나아가기 (워크북 6쪽 심화 탐구 제안)', items:[
          {img:'img/c56-more-landsat.jpg', tag:'데이터', title:'실제 위성 열영상 분석', text:'USGS EarthExplorer에서 Landsat 8/9 열적외선(TIRS) 영상을 내려받아 우리 지역 발전소·도심의 지표온도 행렬 만들기', url:'https://www.usgs.gov/landsat-missions'},
          {img:'img/c56-more-kernel.jpg', tag:'도구', title:'경계 검출 필터 실험', text:'평균 필터 대신 경계 검출 필터 [[−1,−1,−1],[−1,8,−1],[−1,−1,−1]]을 적용해 온배수 ‘경계선’ 찾기 → CNN의 원리와 연결', url:'https://setosa.io/ev/image-kernels/'},
          {img:'img/c56-more-jevons.jpg', tag:'우리 집', title:'우리 집 리바운드 조사', text:'가전 교체 전후 전기요금 고지서로 실제 절감률을 구하고 리바운드율 추정하기'},
          {img:'img/c56-more-gd.jpg', tag:'심화', title:'최적화 심화', text:'학습률 η를 바꾸며 수렴·진동·발산 실험(η > 2/0.15 ≈ 13.3이면 발산), 2변수 모델 u = w·e + b로 확장하기', url:'http://matrix.skku.ac.kr/math4ai/gradient_descent/'}
        ]}
      ]}
  ]
});

})();
