/* 그린 시그널 수업실 · 탄소중립 노선 (c12 · c34 · c56) — v2 핵심 장면판
   기준: 최종 PPT(ppt/c12·c34·c56.md, slides/) > v1 차시 파일 > content_탄소중립.md. 위젯은 v1에서 검증된 것만 남김 */
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
    const n = Math.sqrt(x*x+y*y), c = n ? x/n : null;
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

/* Scope 교차검증 대시보드 */
GS.widget('carbon-scope', function(host, o, st, U){
  const D = [
    {n:'A사', cos:'0.00', s:[[88,92],[126,128],[266,320]]},
    {n:'B사', cos:'1.00', s:[[70,58],[110,95],[140,115]]}
  ];
  const tot = (d,t) => d.s.reduce((a,v)=>a+v[t],0);
  const saved = st.get('scope') || {};
  let solved = !!saved.solved;
  host.append(head(U,'활동지 10','Scope 1·2·3를 더해 총배출을 구하고, 말(cos θ)과 데이터를 교차검증해요'));
  host.append(U.el('p',{class:'src',text:'단위: 천 tCO₂e, 2023 → 2024 (교육용 가상 자료)'}));
  const pic = U.el('div',{}), lights = U.el('div',{class:'row',style:'align-items:stretch;gap:10px'}), f = fbx(U);
  const COL = ['var(--muted)','var(--eco)','var(--climate)'];
  function draw(){
    const W=640, H=300, P={l:44,r:10,t:24,b:46}, max=600, ih=H-P.t-P.b, y = v => P.t + ih - v/max*ih;
    let s = '';
    for(let v=0;v<=max;v+=100) s += `<line x1="${P.l}" x2="${W-P.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${P.l-6}" y="${y(v)+4}" font-size="12" text-anchor="end" fill="var(--muted)">${v}</text>`;
    let k = 0;
    D.forEach((d,di)=>[0,1].forEach(t=>{
      const x = P.l + 30 + k*140 + (di?30:0), bw = 92; let base = 0;
      d.s.forEach((v,si)=>{ const h = v[t]/max*ih; s += `<rect x="${x}" y="${y(base+v[t])}" width="${bw}" height="${h}" fill="${COL[si]}" stroke="var(--surface)"/>`; if(h>16) s += `<text x="${x+bw/2}" y="${y(base+v[t]/2)+4}" font-size="12" text-anchor="middle" fill="var(--surface)">${v[t]}</text>`; base += v[t]; });
      if(solved) s += `<text x="${x+bw/2}" y="${y(base)-6}" font-size="13" font-weight="700" text-anchor="middle" fill="var(--ink)">${base}</text>`;
      s += `<text x="${x+bw/2}" y="${H-P.b+18}" font-size="12" text-anchor="middle" fill="var(--muted)">${d.n} ${t?'2024':'2023'}</text>`;
      k++;
    }));
    pic.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="A사와 B사의 Scope별 배출">${s}</svg>`;
    lights.innerHTML = '';
    if(solved) D.forEach(d=>{
      const up = tot(d,1) > tot(d,0), bad = up || d.cos==='0.00';
      lights.append(U.el('div',{class:'card',style:'flex:1 1 220px;display:flex;gap:12px;align-items:center'},
        U.el('div',{html:`<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="${bad?'var(--bad)':'var(--ok)'}"/></svg>`}),
        U.el('div',{html:`<b>${d.n} · ${bad?'빨간불':'초록불'}</b><br>선언 cos θ = ${d.cos} · 총배출 ${tot(d,0)} → ${tot(d,1)} ${up?'증가':'감소'}<br><span class="src">${bad?'말과 데이터 모두 빨간불':'구체적 선언 + 검증 가능한 데이터'}</span>`})));
    });
  }
  const inputs = [];
  const tb = U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{},'기업'), U.el('th',{class:'n'},'2023 총배출'), U.el('th',{class:'n'},'2024 총배출'))),
    U.el('tbody',{}, D.map((d,di)=>U.el('tr',{}, U.el('th',{},d.n), [0,1].map(t=>{
      const key = di+'-'+t, inp = U.el('input',{inputmode:'decimal','aria-label':d.n+' '+(t?'2024':'2023')+' 총배출'});
      inp.value = saved[key] || '';
      inp.addEventListener('input',()=>{ saved[key]=inp.value; st.set('scope',saved); inp.classList.remove('right','wrong'); });
      inputs.push({inp, ans:tot(d,t)}); return U.el('td',{class:'n tf'}, inp);
    })))));
  host.append(pic, U.el('div',{class:'lg',style:'display:flex;gap:14px;flex-wrap:wrap;font-size:.82rem;color:var(--muted)',html:['Scope 1 직접','Scope 2 전력 간접','Scope 3 가치사슬'].map((t,i)=>`<span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;background:${COL[i]}"></i>${t}</span>`).join('')}),
    U.el('div',{class:'tbl'}, tb),
    U.el('div',{class:'row'},
      U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{
        let n=0; inputs.forEach(({inp,ans})=>{ const ok = U.match(inp.value, String(ans), 0.5); inp.classList.toggle('right',ok); inp.classList.toggle('wrong',!ok); if(ok) n++; });
        if(n===inputs.length){ solved=true; saved.solved=true; st.set('scope',saved); draw(); say(f,'ok','모두 맞았어요. A사 480 → 540, B사 320 → 268. 아래 신호등에서 말과 데이터를 함께 보세요.'); }
        else say(f,'bad', inputs.length+'칸 중 '+n+'칸 맞았어요. 막대 속 세 숫자를 더해 보세요.');
      }},'확인하기'),
      U.el('button',{type:'button',class:'btn sm',onclick:()=>{ inputs.forEach(({inp,ans})=>{ inp.value=String(ans); inp.classList.add('right'); }); solved=true; saved.solved=true; st.set('scope',saved); draw(); say(f,'info','정답을 채웠어요.'); }},'정답 보기')),
    f, lights);
  draw();
});

/* ================= c56 위젯 ================= */
const MT = [[25,28,31,29,26],[24,26,29,27,25],[23,25,27,25,25],[23,24,25,25,25],[24,24,24,25,25]];
const MB = [[23,23,24,24,24],[23,23,24,24,24],[23,24,24,24,25],[23,24,24,25,25],[24,24,24,25,25]];
const MA = MT.map((r,i)=>r.map((v,j)=>v-MB[i][j]));

/* 행렬 뺄셈 A = T − B 퍼즐 + 열지도 */
GS.widget('carbon-matsub', function(host, o, st, U){
  const saved = st.get('sub') || {};
  let paint = !!saved.paint;
  host.append(head(U,'활동지 2','A = T − B의 25칸을 채워요. 맞은 칸은 열지도 색으로 칠해져요'));
  const tbl = (M, title) => U.el('div',{style:'flex:1 1 230px;min-width:0'}, U.el('b',{html:title}),
    U.el('div',{class:'tbl'}, U.el('table',{}, U.el('thead',{}, U.el('tr',{}, U.el('th',{}), C5.map(c=>U.el('th',{class:'n'},c)))),
      U.el('tbody',{}, M.map((r,i)=>U.el('tr',{}, U.el('th',{},R5[i]), r.map(v=>U.el('td',{class:'n'},String(v)))))))));
  host.append(U.el('div',{class:'row',style:'align-items:flex-start;gap:12px'}, tbl(MT,'관측 온도 T (가동 중)'), tbl(MB,'배경 온도 B (가동 전)')));
  host.append(U.el('p',{class:'src',text:'단위 ℃ · 행1 = 해안·배수구 쪽, 행5 = 먼바다'}));
  const cells = [];
  const grid = matGrid(U,5,5,(i,j)=>{
    const inp = U.el('input',{inputmode:'numeric','aria-label':'A '+R5[i]+' '+C5[j],style:'width:100%;min-width:0;text-align:center;font-family:var(--f-num);font-size:1rem;padding:8px 2px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink)'});
    inp.value = saved[i+'-'+j] || '';
    inp.addEventListener('input',()=>{ saved[i+'-'+j]=inp.value; st.set('sub',saved); inp.style.background='var(--bg)'; inp.style.color='var(--ink)'; inp.style.borderColor='var(--line)'; });
    cells.push({inp,i,j}); return inp;
  },{rowLabels:R5,colLabels:C5});
  const f = fbx(U);
  function color(c, ok){ const v = MA[c.i][c.j], p = v/7; if(ok){ c.inp.style.background=heatBg(p); c.inp.style.color=heatInk(p); c.inp.style.borderColor='transparent'; } else { c.inp.style.background='var(--bg)'; c.inp.style.color='var(--ink)'; c.inp.style.borderColor='var(--bad)'; } }
  function check(){
    let n=0; cells.forEach(c=>{ const ok = U.match(c.inp.value, String(MA[c.i][c.j]), 0.01); if(ok) n++; color(c, ok); });
    if(n===25){ saved.paint=true; st.set('sub',saved); say(f,'ok','25칸 완성! 온배수의 ‘지문’이 드러났어요. 배수구 쪽 행1 열3이 가장 진하고, 멀어질수록 옅어져요.'); }
    else say(f,'bad','25칸 중 '+n+'칸 맞았어요. 빨간 테두리 칸을 다시 계산해 보세요. 예: A(1,3) = 31 − 24 = 7');
  }
  host.append(U.el('b',{text:'A = T − B'}), grid, U.el('div',{class:'row'},
    U.el('button',{type:'button',class:'btn sm pri',onclick:check},'확인하고 색칠하기'),
    U.el('button',{type:'button',class:'btn sm',onclick:()=>{ cells.forEach(c=>{ c.inp.value=String(MA[c.i][c.j]); saved[c.i+'-'+c.j]=c.inp.value; }); st.set('sub',saved); check(); }},'정답 보기')), f);
  if(paint) check();
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
   1~2차시 · 슬기로운 탄소중립 생활 (초등) — v2: 장면 7개
   ===================================================================== */
GS.lesson({
  id:'c12', theme:'carbon', order:1, period:'1~2차시', periods:2, level:'초등', minutes:80,
  title:'슬기로운 탄소중립 생활',
  question:'탄소중립을 위해 우리가 할 수 있는 일은 무엇일까요?',
  goals:['탄소중립이 무엇인지 내 말로 설명할 수 있어요.','집과 학교에서 할 수 있는 기후행동을 찾아 포스터로 알릴 수 있어요.'],
  steps:[
    { id:'open', phase:'도입', minutes:10, move:'관찰',
      title:'두 그림에 숨은 기체',
      prompt:'불·비행기와 숲·고래, 두 그림에 함께 숨어 있는 기체는 무엇일까요?',
      lead:'위 그림은 이 기체를 <b>내보내고</b>, 아래 그림은 <b>빨아들여요</b>.',
      visual:{src:'slides/c12/s03.jpg', alt:'불과 비행기 사진, 숲과 고래 사진 옆에 OO 빈칸이 있는 문장 두 개', cap:'생각 열기 · OO에 들어갈 말은?'},
      layout:'split',
      blocks:[
        {t:'choice', id:'c12-gas', q:'OO와 관계있는 기체를 골라요.', options:['산소','수소','이산화탄소','질소','메탄'], answer:2,
          hints:['나무가 광합성을 할 때 빨아들이는 기체예요.','기체 이름 속에 ‘탄소’가 들어 있어요.'],
          why:'왜 그 기체라고 생각했나요? 한 문장으로 써요.',
          explain:'이산화탄소예요. 그래서 OO에는 ‘탄소’가 들어가요.'},
        {t:'blanks', id:'c12-song', kind:'활동지 1', q:'선생님이 틀어 주는 기후에너지환경부 ‘전국민 중독송’을 들으며 ㉠~㉣을 채워요.',
          text:'㉠ 날씨가 평소와 다르게 이상해지는 것: [[이상기후]]<br>㉡ 지구가 점점 뜨거워지는 것: [[지구온난|지구온난화]]<br>㉢ 버스·지하철처럼 여럿이 함께 타는 교통: [[대중교통]]<br>㉣ ‘2050’과 함께 여러 번 나오는 말: [[탄소중립]]',
          hints:['㉣은 오늘 수업 제목에 들어 있어요.'], explain:'㉣ 탄소중립이 오늘 배울 말이에요.'}
      ]},

    { id:'absorb', phase:'활동 1', minutes:8, move:'분석',
      title:'흡수일까, 배출일까?',
      prompt:'탄소를 빨아들이는 쪽과 내보내는 쪽, 어떻게 나눌 수 있을까요?',
      visual:{src:'img/c12-absorb-emit.jpg', alt:'왼쪽에 숲과 고래가 사는 바다, 오른쪽에 굴뚝과 쓰레기 소각, 비행기가 있는 그림', cap:'빨아들이는 쪽과 내보내는 쪽'},
      blocks:[
        {t:'sort', id:'c12-sort', kind:'활동지 2', q:'카드를 알맞은 칸에 놓아요.', bins:['흡수 (빨아들여요)','배출 (내보내요)'], items:[
          {text:'숲의 나무들이 광합성을 해요', bin:0},
          {text:'쓰레기 처리장에서 쓰레기를 태워요(소각)', bin:1},
          {text:'고래가 사는 바다 (세계 탄소의 25%)', bin:0},
          {text:'비행기를 타고 해외여행을 가요', bin:1}
        ], explain:'나무와 바다는 탄소를 흡수하고, 소각과 비행기 여행은 탄소를 배출해요. 바다는 세계 탄소의 25%를 흡수해요.'},
        {t:'write', id:'c12-emit', q:'우리 주변에서 탄소를 <b>배출</b>하는 일을 하나 더 찾아 써요.', rows:1, placeholder:'힌트: 무언가를 태우는 일', example:'가까운 곳도 자동차를 타고 가요.'}
      ]},

    { id:'balance', phase:'활동 1', minutes:12, move:'예측',
      title:'저울이 수평이 되려면?',
      prompt:'배출 쪽이 더 무거울 때, 저울을 수평으로 만드는 방법은 무엇일까요?',
      visual:{src:'slides/c12/s12.jpg', alt:'탄소흡수와 탄소배출이 양쪽에 올라간 저울과 가운데 CO₂ 눈금 그림', cap:'사진 출처: 기후행동 1.5 (c-action.kr)'},
      layout:'split',
      blocks:[
        {t:'predict', id:'c12-bal-pred', q:'저울을 수평으로 만드는 방법을 골라요.', options:['배출을 줄인다','흡수를 늘린다','둘 다 할 수 있다','탄소를 하나도 배출하지 않아야만 한다'],
          compare:'내 생각과 저울 놀이 결과가 같았나요? 알게 된 점을 한 줄로 써요.',
          reveal:[
            {t:'widget', name:'carbon-balance'},
            {t:'blanks', id:'c12-mean', kind:'활동지 3', q:'저울 놀이로 알게 된 뜻을 완성해요.',
              text:'[[탄소중립]]: 이산화탄소 순 배출량이 [[0|영]]이 되는 것<br>온실가스 [[배출]]량이 이산화탄소 [[흡수]]량과 균형을 이뤄, 공기 속 이산화탄소가 더 늘지 않는 것',
              hints:['저울이 수평일 때 ‘배출 − 흡수’는 얼마였나요?'],
              explain:'배출한 만큼 흡수해서 남는 양이 0이 되면 ‘중립’이에요. 배출을 0으로 만들지 않아도 흡수와 같아지면 돼요.'}
          ]}
      ]},

    { id:'home', phase:'활동 2', minutes:12, move:'관찰',
      title:'우리 집 숨은 행동 찾기',
      prompt:'이 방에서 탄소 배출을 줄일 수 있는 행동은 어디에 숨어 있을까요?',
      lead:'조명, 텔레비전, 세탁기, 밥솥, 창문을 하나씩 살펴보세요.',
      visual:{src:'slides/c12/s15.jpg', alt:'침실·거실·부엌이 이어진 집 그림(흑백). 조명, 텔레비전, 세탁기, 냉장고, 전기밥솥, 창문이 보여요.', cap:'활동지 4 · 탄소 배출을 줄일 수 있는 행동 찾기'},
      blocks:[
        {t:'choice', id:'c12-home', kind:'활동지 4', q:'집에서 탄소 배출을 줄이는 행동을 <b>모두</b> 골라요.', options:[
          '불필요한 조명 끄기','빈 방에 불을 켜 두기','전기밥솥 보온 시간 줄이기','텔레비전 시청 시간 줄이기','보지 않는 텔레비전 켜 두기','세탁기 사용 횟수 줄이기','창틀과 문틈에 바람막이 설치하기','고효율 가전제품 사용하기'], answer:[0,2,3,5,6,7],
          hints:['전기를 <b>덜 쓰게</b> 만드는 행동을 찾아요.','창틈으로 바람이 새면 냉난방에 에너지가 더 들어요. 정답은 6개예요.'],
          explain:'전기와 냉난방 에너지를 덜 쓰면, 그 에너지를 만들 때 나오는 탄소도 줄어요.'},
        {t:'predict', id:'c12-home-pred', q:'세 행동 중 이산화탄소를 가장 많이 줄이는 것은?', options:['불필요한 조명 끄기','전기밥솥 보온 시간 줄이기','텔레비전 시청 시간 줄이기'],
          compare:'내 예측과 같았나요? 숫자를 보고 놀라운 점을 한 줄로 써요.',
          reveal:[
            {t:'visual', src:'slides/c12/s17.jpg', alt:'조명 소등 이산화탄소 251kg·112,794원, 전기밥솥 보온 줄이기 458kg·205,544원, 텔레비전 시청 줄이기 73kg·32,609원', cap:'출처: 탄소중립 생활 실천 안내서 | 가정의 탄생, 한국환경보전원'},
            {t:'write', id:'c12-why', q:'빈 방의 불을 끄면 왜 지구가 덜 더워질까요?', rows:2, placeholder:'전기를 덜 쓰면 …', example:'전기를 덜 쓰면 전기를 만들 때 나오는 탄소가 줄어서 지구가 덜 더워져요.'}
          ]}
      ]},

    { id:'school', phase:'활동 2', minutes:10, move:'판단',
      title:'우리 학교 숨은 행동 찾기',
      prompt:'학교에서는 어떤 행동이 탄소를 가장 많이 줄일까요?',
      visual:{src:'slides/c12/s19.jpg', alt:'텃밭, 수돗가, 급식 식탁, 분리배출함이 있는 학교 그림(흑백)', cap:'활동지 4 · 학교에서 탄소 배출을 줄이는 행동 찾기'},
      blocks:[
        {t:'choice', id:'c12-school', kind:'활동지 4', q:'학교에서 탄소 배출을 줄이는 행동을 <b>모두</b> 골라요.', options:[
          '양치컵을 써서 물 아끼기','물을 틀어 놓고 양치하기','재활용을 위해 분리배출하기','쓰레기를 한 봉투에 섞어 버리기','음식은 먹을 만큼만 담기','급식을 많이 담고 남기기','교내 텃밭에서 채소 기르기'], answer:[0,2,4,6],
          hints:['아끼고, 다시 쓰고, 덜 버리는 행동을 찾아요.','그림 속 수돗가·분리배출함·식탁·텃밭을 하나씩 보세요.'],
          why:'고른 행동 하나가 왜 탄소를 줄이는지 한 문장으로 써요.',
          explain:'물과 자원을 아끼고 쓰레기를 줄이면 탄소가 줄어요.'},
        {t:'predict', id:'c12-school-pred', q:'세 행동 중 이산화탄소를 가장 많이 줄이는 것은?', options:['양치컵을 써서 물 아끼기','음식은 먹을 만큼만 담기','올바르게 분리배출하기'],
          compare:'내 예측과 같았나요? (t은 ‘톤’, 1t = 1,000kg) 분리배출이 가장 크게 줄이는 까닭을 생각해 써요.',
          reveal:[
            {t:'visual', src:'slides/c12/s21.jpg', alt:'양치컵 사용 이산화탄소 0.1t, 먹을 만큼 담기 0.2t, 올바른 분리배출 9t', cap:'출처: 탄소중립 생활 실천 안내서 | 학교의 탄생, 한국환경보전원'}
          ]}
      ]},

    { id:'mycard', phase:'활동 3', minutes:13, move:'실천',
      title:'나의 기후행동 카드',
      prompt:'세 영역에서 내가 정말 실천할 행동은 무엇인가요?',
      lead:'선생님이 알려 준 <b>기후행동 실천포털</b>(QR)에서 행동마다 얼마나 줄어드는지 찾아요.',
      visual:{src:'img/c12-three-actions.jpg', alt:'불 끄기, 자전거 타기, 분리배출을 보여 주는 세 칸 그림', cap:'에너지 절약 · 친환경 교통 · 자원 순환'},
      blocks:[
        {t:'sort', id:'c12-areas', q:'각 행동은 어느 영역일까요?', bins:['에너지 절약','친환경 교통','자원 순환'], items:[
          {text:'세탁기 사용 횟수 줄이기', bin:0},
          {text:'텔레비전 시청 시간 줄이기', bin:0},
          {text:'가까운 거리는 걷거나 자전거 타기', bin:1},
          {text:'자동차에 불필요한 짐 싣지 않기', bin:1},
          {text:'비닐 사용 줄이기', bin:2},
          {text:'음식물 쓰레기 줄이기', bin:2}
        ], explain:'전기를 아끼면 에너지 절약, 이동 방법을 바꾸면 친환경 교통, 물건을 아끼고 덜 버리면 자원 순환이에요.'},
        {t:'write', id:'c12-card', kind:'활동지 5', q:'영역마다 내가 고른 행동 하나와, 포털에서 찾은 계산식·결과를 적어요.', rows:4,
          placeholder:'에너지 절약: 행동 / 계산식 / 결과\n친환경 교통: 행동 / 계산식 / 결과\n자원 순환: 행동 / 계산식 / 결과',
          example:'에너지 절약: 세탁기 사용 횟수 줄이기 / 친환경 교통: 가까운 거리는 걸어가기 / 자원 순환: 비닐 사용 줄이기. 계산식과 결과는 포털에 나온 숫자를 그대로 옮겨요.'}
      ]},

    { id:'poster', phase:'정리', minutes:15, move:'성찰',
      title:'포스터로 알리고 돌아보기',
      prompt:'우리 모둠은 어떤 기후행동을, 어떤 근거로 알릴까요?',
      lead:'캔바 QR 접속 → 파일 · 사본 만들기 → 우리 모둠 포스터 만들기 → 선생님께 제출',
      visual:{src:'slides/c12/s23.jpg', alt:'‘탄소중립을 위한 기후행동’ 포스터 틀과 캔바 템플릿 QR 코드', cap:'캔바 템플릿은 선생님이 QR로 알려 줘요'},
      layout:'split',
      blocks:[
        {t:'timer', minutes:15, label:'모둠 포스터 시간'},
        {t:'cer', id:'c12-poster', kind:'포스터 기획', q:'우리 모둠이 알릴 기후행동과 그 근거', starters:{c:'우리 모둠은 ___을(를) 알릴 거예요. 한 마디: “___”', e:'오늘 본 숫자나 사실: ___', r:'이 행동을 하면 ___ 때문에 지구에 도움이 돼요.'},
          example:'주장: 전기밥솥 보온 시간 줄이기를 알릴 거예요. 한 마디: “밥은 먹을 때 데워요!” 근거: 보온 시간을 줄이면 이산화탄소를 458kg 줄일 수 있대요. 이유: 전기를 덜 쓰면 전기를 만들 때 나오는 탄소가 줄어요.'},
        {t:'reflect', id:'c12-exit', items:['오늘 새롭게 알게 된 점 한 가지','다른 모둠 포스터에서 따라 하고 싶은 점']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/c12-more-balance.jpg', tag:'사이트', title:'기후행동 1.5', text:'오늘 본 탄소중립 저울 그림이 실린 곳이에요.', url:'https://c-action.kr'},
          {img:'img/c12-more-energy.jpg', tag:'집에서', title:'우리 집 전기 탐정', text:'켜 두기만 하고 쓰지 않는 전기 제품을 하루 동안 찾아 세어 봐요.'},
          {img:'img/c12-more-lunch.jpg', tag:'학교에서', title:'일주일 잔반 0 도전', text:'먹을 만큼만 담고, 남기지 않은 날에 표시해 봐요.'},
          {img:'img/c12-more-tree.jpg', tag:'동네에서', title:'우리 동네 흡수원 지도', text:'학교 둘레의 나무·공원·하천을 찾아 지도에 표시해 봐요.'}
        ]}
      ]}
  ]
});

/* =====================================================================
   3~4차시 · AI 수학으로 해부하는 탄소중립 (고등) — v2: 장면 7개
   ===================================================================== */
GS.lesson({
  id:'c34', theme:'carbon', order:2, period:'3~4차시', periods:2, level:'고등', minutes:100,
  title:'AI 수학으로 해부하는 탄소중립',
  question:'탄소중립은 모두에게 공정할까? 기업의 약속은 진짜일까?',
  goals:[
    '소득분위별 연료비 자료를 회귀·상관으로 분석해 전환의 형평성을 판단할 수 있다.',
    '기업 선언을 벡터·코사인 유사도로 수치화하고 배출 데이터와 교차검증할 수 있다.',
    '분석 결과를 근거로 정의로운 전환 정책을 제안할 수 있다.'
  ],
  steps:[
    { id:'shadow', phase:'도입', minutes:10, move:'관찰',
      title:'전환의 시계, 모두에게 같은 속도일까?',
      prompt:'빠른 내연기관 퇴출 — 누구에겐 기회가, 누구에겐 부담이 먼저 도착할까?',
      lead:'방향은 분명하지만 속도는 흔들려요. 영상 하나를 보고 질문을 만들어요.',
      visual:{src:'slides/c34/s03.jpg', alt:'EU 2035년, 노르웨이 2025년, 한국 2035 전후 내연기관 전환 목표 카드', cap:'2026.10.23 보도 기준. EU는 2025.12 ‘90% 감축’ 완화안 제안, 2026.10 의회 위원회 의결 · 최종 표결 남음'},
      blocks:[
        {t:'links', items:[
          {label:'기후에너지환경부 · 2026 전기차 정책, 무엇이 달라질까?', url:'https://www.youtube.com/watch?v=McQHr2hyn7s', kind:'영상'},
          {label:'SBS · ‘전기차 올인’ 유럽, 디젤 부활?', url:'https://www.youtube.com/watch?v=4oScIU2VKyU', kind:'영상'},
          {label:'KBS · 검증도 없이 보조금부터?', url:'https://www.youtube.com/watch?v=2zTkv8NVqBA', kind:'영상'}
        ]},
        {t:'write', id:'c34-q1', kind:'활동지 1', q:'영상을 보고 떠오른 질문 한 가지', rows:1, example:'충전소가 적은 곳에 살거나 새 차를 살 돈이 없는 사람은 어떻게 하나요?'},
        {t:'sort', id:'c34-concept', kind:'활동지 2', q:'전환의 그림자: 설명에 맞는 개념 칸에 놓아요.', bins:['에너지 빈곤','이동권 불평등','일자리 전환','정의로운 전환'], items:[
          {text:'전환 비용이 전기·난방 요금에 더해지면 저소득층이 먼저 타격을 받는다', bin:0},
          {text:'충전 인프라 접근성이 소득·지역에 따라 달라, 대안이 적은 사람이 더 큰 제약을 받는다', bin:1},
          {text:'부품·정비 등 내연기관 일자리가 줄어, 재교육 없이는 지역경제가 흔들린다', bin:2},
          {text:'누구도 뒤처지지 않도록 혜택과 부담을 공정하게 나누는 원칙(Just Transition)', bin:3}
        ], explain:'네 개념 모두 ‘전환의 비용을 누가 먼저, 더 크게 치르는가’의 문제예요. 오늘은 이 ‘공정함’을 데이터로 검증해요.'}
      ]},

    { id:'gap', phase:'활동 1', minutes:12, move:'예측',
      title:'연료비 부담, 얼마나 다를까?',
      prompt:'소득이 가장 낮은 가구는 가장 높은 가구보다 연료비 부담이 몇 배일까?',
      lead:'연료비 비중 = 소득 대비 연료비(%). 소득분위는 1(최저) ~ 10(최고)이에요.',
      visual:{src:'img/c34-fuel-bill.jpg', alt:'작은 집부터 큰 집까지 늘어선 다섯 집 위에 크기가 다른 불꽃 모양 추가 올라간 그림', cap:'같은 겨울, 다른 무게'},
      blocks:[
        {t:'predict', id:'c34-gap-pred', q:'1분위의 연료비 비중은 10분위의 약 몇 배일까요?', options:['거의 같다 (약 1배)','약 2배','약 5~6배','10배 이상'],
          reveal:[
            {t:'stats', items:[{num:'7.9%',label:'1분위 (최저소득)'},{num:'1.4%',label:'10분위 (최고소득)'},{num:'약 5.6배',label:'부담 격차'}], src:'통계청 가계동향조사·한국에너지공단 공개 통계(1·10분위). 2~9분위는 추세에 맞춘 교육용 재구성'},
            {t:'widget', name:'carbon-regression'},
            {t:'choice', id:'c34-dir', kind:'활동지 3', q:'오차제곱합을 가장 작게 만든 직선의 기울기 a는 무엇을 말하나요?', options:['a > 0 — 소득이 높을수록 연료비 비중이 커진다','a < 0 — 소득이 높을수록 연료비 비중이 작아진다','a ≈ 0 — 소득과 연료비 비중은 관계가 없다'], answer:1,
              hints:['오차제곱합이 줄어드는 쪽으로 a를 움직여 보세요. 직선이 오른쪽으로 갈수록 올라가나요, 내려가나요?','기울기가 음수면 x가 커질 때 ŷ이 작아져요.'],
              why:'이 기울기는 ‘전환의 비용’에 대해 사회적으로 무엇을 뜻할까요? 한 문장으로 써요.',
              explain:'점들이 오른쪽 아래로 늘어서요. 저소득층일수록 버는 돈 대비 에너지 부담이 커서, 요금이 오르면 격차가 더 벌어져요.'}
          ]}
      ]},

    { id:'lsq', phase:'활동 1', minutes:15, move:'분석',
      title:'직선을 손으로 구하기',
      prompt:'실험실에서 찾은 ‘가장 잘 맞는 직선’, 공식으로도 같은 답이 나올까?',
      lead:'a = Σ(x − x̄)(y − ȳ) ÷ Σ(x − x̄)², b = ȳ − a·x̄',
      visual:{src:'slides/c34/s07.jpg', alt:'소득분위 1~10과 연료비 비중 7.9%~1.4% 산점도', cap:'산점도: 소득분위 → 연료비 비중'},
      blocks:[
        {t:'tablefill', id:'c34-lsq', kind:'활동지 4', q:'6~10행과 합계를 채워요. (x̄ = 5.5, ȳ = 3.81, 곱은 소수 셋째 자리까지)', head:['x','y','x − x̄','y − ȳ','(x − x̄)(y − ȳ)','(x − x̄)²'], rows:[
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
        {t:'blanks', id:'c34-ab', kind:'활동지 4·5', q:'기울기·절편·상관계수, 그리고 예측',
          text:'a = −56.45 ÷ 82.5 ≈ [[-0.684|−0.684]], b = 3.81 − (−0.684)(5.5) ≈ [[7.572]] → ŷ = −0.684x + 7.572<br>Σ(y − ȳ)² = 41.21이면 r ≈ [[-0.968|−0.968]], r² ≈ [[0.937]]<br>x = 3을 넣으면 ŷ ≈ [[5.52|5.5]]% (실제 5.2%)',
          hints:['r = −56.45 ÷ √(82.5 × 41.21)', 'ŷ = −0.684 × 3 + 7.572'],
          explain:'r ≈ −0.968, 강한 음의 상관이에요. 분위는 정수 범주라 x = 3.5나 관측 범위 밖(x = 12)을 넣는 외삽은 조심해요.'},
        {t:'choice', id:'c34-cause', kind:'활동지 6 (가)', q:'r² ≈ 0.94예요. ‘소득이 낮아서 연료비 비중이 커진다’고 단정할 수 있을까요?', options:['그렇다 — r²이 1에 가까우니 원인이 증명되었다','아니다 — 상관이 강해도 다른 변수가 두 값에 함께 영향을 줄 수 있다','아니다 — r이 음수라서 두 변수는 관계가 없다'], answer:1,
          hints:['r²은 ‘직선이 얼마나 잘 맞는가’이지 ‘왜 그런가’가 아니에요.','저소득 가구가 사는 집은 어떤 상태일까요? 난방 방식은요?'],
          why:'소득분위와 연료비 비중 모두에 영향을 줄 수 있는 교란변수 2가지를 적어요.',
          explain:'상관 ≠ 인과. r² ≈ 0.937은 연료비 비중 변동의 약 94%를 소득분위로 ‘설명’한다는 뜻일 뿐이에요. 주택 노후도·단열, 난방 방식 같은 변수도 작용해요.'}
      ]},

    { id:'charger', phase:'활동 1', minutes:10, move:'판단',
      title:'분모를 바꾸면 결론도 바뀔까?',
      prompt:'‘농어촌은 충전기가 적다’ — 무엇으로 나눠야 공정한 비교일까?',
      lead:'충전기 대수: 경기 131,126기, 강원 15,241기 → 약 8.6배.',
      visual:{src:'img/c34-chargers.jpg', alt:'아파트 단지와 농촌 마을 사이에 선 전기차 충전기', cap:'충전기는 어디에, 누구 곁에 있을까?'},
      blocks:[
        {t:'predict', id:'c34-charger-pred', q:'인구 1천 명당으로 바꾸면 경기와 강원은?', options:['여전히 경기가 훨씬 많다','두 지역이 거의 같다','강원이 경기의 몇 배다'],
          reveal:[
            {t:'tablefill', id:'c34-per', kind:'활동지 6 (나)', q:'인구 1천 명당 충전기 = 충전기 수 ÷ (인구 만 명 × 10). 소수 첫째 자리까지.', head:['지역','충전기 수(기)','인구(만 명, 어림값)','인구 1천 명당(기)'], rows:[
              ['경기','131,126','약 1,370','9.6'],
              ['서울','약 68,000','약 935','?7.3'],
              ['강원','15,241','약 152','?10.0|10'],
              ['제주','약 12,800','약 67','?19.1|19']
            ], tol:0.1, explain:'서울 약 7.3기, 강원 약 10.0기, 제주 약 19.1기예요.'},
            {t:'chart', kind:'bar', title:'지역별 전기차 충전기', x:['경기','서울','경남','경북','강원','제주'], series:[{name:'충전기 수',values:[131126,68000,34000,30000,15241,12800]}],
              views:[
                {label:'절대 대수', series:[{name:'충전기 수(기)',values:[131126,68000,34000,30000,15241,12800]}], unit:'기'},
                {label:'인구 1천 명당', series:[{name:'인구 1천 명당(기)',values:[9.6,7.3,10.5,11.8,10.0,19.1],color:'--climate'}], unit:'기 / 인구 1천 명'}
              ],
              caption:'표를 채운 뒤 ‘인구 1천 명당’을 눌러요. 서울·제주·경남·경북은 어림값', src:'충전기 — 한국자동차환경협회(2025) · 인구 — 행정안전부 주민등록인구(2025) 어림값'},
            {t:'choice', id:'c34-rural', q:'‘농어촌은 충전기가 적다’는 이 자료로 뒷받침될까요?', options:['그렇다 — 강원의 충전기 대수는 경기의 약 1/8.6이다','아니다 — 인구 1천 명당으로 보면 경기와 강원이 거의 같다','알 수 없다 — 어림값이 섞여 있으니 어떤 결론도 낼 수 없다'], answer:1,
              hints:['그래프를 ‘인구 1천 명당’으로 바꿔 경기와 강원 막대를 비교해 보세요.','대수는 인구가 많은 곳이 클 수밖에 없어요.'],
              why:'진짜 형평성을 보려면 어떤 자료가 더 필요할까요? 한 문장으로 써요.',
              explain:'뒷받침되지 않아요(제주 약 19기로 최다). 분모(인구·전기차 등록대수·면적)에 따라 결론이 바뀌어요. 진짜 질문은 ‘충전기가 어디에(공동주택·읍면) 있고 누가 쓸 수 있는가’예요.'}
          ]}
      ]},

    { id:'sins', phase:'활동 2', minutes:12, move:'설명',
      title:'그린워싱, 어떤 죄일까?',
      prompt:'‘친환경’이라는 말 뒤에 무엇이 숨어 있을까?',
      lead:'그린워싱 = Green + Whitewashing(눈가림). 무엇을·얼마나·언제까지·누가 검증했는가에 답할 수 없으면 의심해요.',
      visual:{src:'slides/c34/s14.jpg', alt:'증거 없는 주장, 모호한 표현, 숨겨진 상충, 거짓 주장 네 가지 죄악 카드', cap:'TerraChoice(2010) ‘7가지 죄악’ 중 데이터로 잡는 4가지'},
      layout:'split',
      blocks:[
        {t:'sort', id:'c34-case', kind:'활동지 7', q:'실제 사례를 가장 가까운 죄악 칸에 놓아요. (겹치는 사례는 둘 중 어느 칸이든 인정해요)', bins:['ⓐ 증거 없는 주장','ⓑ 모호한 표현','ⓒ 숨겨진 상충','ⓓ 거짓 주장'], items:[
          {text:'오스트리아항공 “100% 지속가능항공유(SAF)로 탄소중립 비행” — 실제 SAF 혼합 약 5%, 2023 법원 광고 위법 판결', bin:[3,2]},
          {text:'SPA 패션 브랜드 4곳의 ‘친환경’ 표시 — 객관적 근거 부족, 2025.5 공정위 경고', bin:[1,0]},
          {text:'디젤게이트 ‘클린 디젤’ — 검사 때만 정화장치 작동, 실주행 NOx 최대 40배', bin:3},
          {text:'석탄업계 ‘클린 콜’ — 수명주기 배출 석탄 820 vs 천연가스 490 gCO₂eq/kWh (IPCC, 2014)', bin:[1,2]}
        ], explain:'모범 판정: 오스트리아항공 ⓓ(+ⓒ 나머지 약 95% 화석연료 은폐) · SPA 브랜드 ⓑ(+ⓐ) · 디젤게이트 ⓓ · 클린 콜 ⓑ+ⓒ'},
        {t:'write', id:'c34-case-why', kind:'활동지 7', q:'가장 판단하기 어려웠던 사례 하나를 골라 그 죄악이라고 본 근거를 써요. 딱 맞지 않으면 분류의 한계도 적어요.', rows:3,
          example:'오스트리아항공: ‘100%’라고 했지만 실제 SAF는 약 5%라 수치가 사실과 달라 ⓓ예요. 나머지 95% 화석연료를 숨겼으니 ⓒ도 겹쳐요. 한 칸만 고르게 하면 이런 겹침을 놓쳐요.'}
      ]},

    { id:'cosine', phase:'활동 2', minutes:16, move:'예측',
      title:'말을 숫자로: 코사인 유사도',
      prompt:'두 선언문 중 어느 쪽이 더 믿을 만할까? 느낌을 숫자로 확인해 보자.',
      lead:'x = 구체어 8개의 빈도 합, y = 모호어 8개의 빈도 합. 기준 u = (1, 0)은 ‘완전히 구체적인 선언’의 방향이에요.',
      visual:{src:'slides/c34/s12.jpg', alt:'A사 그린모빌리티와 B사 정직에너지의 탄소중립 선언문 두 개', cap:'A·B·C사는 교육용 가상 사례 (그림을 눌러 크게 보고 단어를 세요)'},
      blocks:[
        {t:'predict', id:'c34-decl-pred', q:'느낌으로 먼저: 더 믿을 만한 선언문은?', options:['A사 ‘그린모빌리티’','B사 ‘정직에너지’','둘 다 비슷하다'],
          compare:'느낌으로 고른 답과 cos θ가 같았나요? ‘느낌’이 속을 수 있는 까닭은 무엇일까요?',
          reveal:[
            {t:'tablefill', id:'c34-vec', kind:'활동지 8·9', q:'구체어(감축·배출량·재생에너지·Scope 3·검증·제3자·목표연도·데이터)와 모호어(친환경·지속가능·그린·깨끗·미래·노력·약속·비전)를 세고, cos θ = (u · v) ÷ (‖u‖ × ‖v‖)를 구해요.',
              head:['문서','x 구체어','y 모호어','‖v‖','u · v','cos θ'], rows:[
                ['A사','?0','?9','?9','?0','?0|0.00'],
                ['B사','?9','?0','?9','?9','?1|1.00'],
                ['C사(예시)','3','4','?5','?3','?0.6|0.60']
              ], caption:'숫자·%·연도는 세지 않아요. 같은 단어가 반복되면 모두 세요.',
              explain:'A사 0.00 그린워싱 의심(직교) · B사 1.00 진정성 높음(같은 방향) · C사 0.60 확인 필요(중간). 판정 기준(수업용): ≥ 0.66 진정성 · 0.33~0.66 확인 필요 · < 0.33 의심'},
            {t:'widget', name:'carbon-cosine'},
            {t:'choice', id:'c34-len', kind:'활동지 9', q:'B사가 같은 문장을 한 번 더 이어 붙여 선언문을 두 배로 늘리면 cos θ는?', options:['2.00으로 커진다','1.00 그대로다','0.50으로 작아진다'], answer:1,
              hints:['계산기에서 B사 (9, 0)을 누른 뒤 x만 크게 늘려 보세요. 화살표의 방향이 바뀌나요?','cos θ는 ‖v‖로 나누므로 길이는 사라지고 방향만 남아요.'],
              why:'코사인 유사도가 ‘길이’가 아니라 ‘방향’을 비교한다는 것은 무슨 뜻일까요? x = 0이면 왜 cos θ = 0인지도 써요.',
              explain:'v = (18, 0)이 되어도 방향은 u와 같아 cos θ = 1이에요. 홍보문이 길다고 더 진실한 것은 아니에요.'}
          ]}
      ]},

    { id:'verdict', phase:'활동 3 · 정리', minutes:25, move:'판단',
      title:'말과 데이터, 그리고 정책',
      prompt:'말(cos θ)과 데이터(Scope)가 같은 방향일 때만 믿을 수 있다면, 어떤 정책이 필요할까?',
      lead:'Scope 3(공급망·제품 사용·폐기)는 통상 총배출의 70% 이상이에요. 단골 수법은 Scope 3을 빼고 1·2만 공개하는 것이에요(WRI & WBCSD, 2004).',
      visual:{src:'slides/c34/s22.jpg', alt:'Scope 1 직접 배출, Scope 2 전력 간접 배출, Scope 3 가치사슬 배출 설명 카드', cap:'활동지 10 · ‘말하지 않는 것’이 핵심'},
      blocks:[
        {t:'predict', id:'c34-scope-pred', q:'cos θ = 0.00인 A사, 실제 총배출(Scope 1+2+3)은 2023 → 2024에 어떻게 변했을까?', options:['줄었다','거의 그대로다','늘었다'],
          reveal:[
            {t:'widget', name:'carbon-scope'},
            {t:'cer', id:'c34-verdict', kind:'활동지 11 · 판정문', q:'그린워싱 판정문: 말과 데이터 두 근거를 모두 인용해요.',
              starters:{c:'우리 모둠은 (   )사를 그린워싱으로 판정한다.', e:'말: cos θ = … / 데이터: 총배출 … → …, Scope 3 … → …', r:'말과 데이터가 … 방향이므로 …'},
              example:'주장: 우리 모둠은 A사를 그린워싱으로 판정한다. 근거: 말 — 모호어 9개·구체어 0개로 cos θ = 0.00, 데이터 — 총배출 480 → 540 증가, Scope 3 266 → 320 급증. 이유: 말도 구체적이지 않고 실제 배출도 늘어 두 근거 모두 빨간불이다. ⓐ 증거 없는 주장 + ⓑ 모호한 표현에 해당한다.'}
          ]},
        {t:'cer', id:'c34-policy', kind:'활동지 12 · 정책 카드', q:'정의로운 전환 정책 하나를 제안해요. 누구에게 도움이 되고, 누구에게 부담이 될까요?',
          starters:{c:'정책 이름과 대상: …', e:'근거 데이터(수치·식): 예) 1분위 7.9% vs 10분위 1.4%, ŷ = −0.684x + 7.572', r:'기대효과와 부작용: …'},
          example:'주장: 저소득층 에너지바우처 확대 + 공동주택·읍면 충전기 우선 설치. 근거: 1분위 연료비 비중 7.9%는 10분위 1.4%의 약 5.6배이고, 분위가 1 낮아질 때마다 약 0.68%p 늘어요. 이유: 요금이 오르면 격차가 더 벌어지므로 먼저 지원해야 해요. 부작용: 예산이 들고 대상 선정 기준이 필요해요.'},
        {t:'reflect', id:'c34-exit', items:['오늘의 한 문장 (공정·말·데이터 중 하나로)','아직 궁금한 것 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/c34-more-cosine.jpg', tag:'도구', title:'코사인 유사도 계산기', text:'성균관대 Math4AI. 내가 쓴 글로 벡터와 사잇각을 계산해 봐요.', url:'https://matrix.skku.ac.kr/math4AI-tools/cosine_similarity/'},
          {img:'img/c34-more-greenwash.jpg', tag:'영상', title:'그린워싱이란?', text:'YTN 사이언스. 광고 속 ‘친환경’을 다시 보는 눈.', url:'https://www.youtube.com/watch?v=Gx-YnBy62TI'},
          {img:'img/c34-more-voucher.jpg', tag:'정책', title:'에너지바우처 사업 안내', text:'한국에너지공단. 에너지 빈곤을 줄이는 실제 정책을 살펴봐요.', url:'https://www.energyv.or.kr'},
          {img:'img/c34-more-charger.jpg', tag:'데이터', title:'지역별 충전기 현황', text:'한국자동차환경협회. 우리 지역 충전기를 다른 분모로 나눠 봐요.', url:'https://chargeinfo.ksga.org'}
        ]}
      ]}
  ]
});

/* =====================================================================
   5~6차시 · 보이지 않는 오염 지도와 리바운드 효과 (고등) — v2: 장면 7개
   ===================================================================== */
GS.lesson({
  id:'c56', theme:'carbon', order:3, period:'5~6차시', periods:2, level:'고등', minutes:100,
  title:'보이지 않는 오염 지도와 리바운드 효과',
  question:'눈에 안 보이는 열 오염은 어떻게 찾고, 효율이 좋아지면 정말 덜 쓸까?',
  goals:[
    '열 이미지를 행렬로 보고 뺄셈·스칼라곱·합성곱으로 고위험 지도를 만들 수 있다.',
    '손실함수와 경사하강법으로 리바운드 계수를 추정해 효율 정책의 실제 효과를 예측할 수 있다.',
    '분석 결과를 근거로 정책을 제안할 수 있다.'
  ],
  steps:[
    { id:'heat', phase:'도입', minutes:10, move:'관찰',
      title:'보이지 않는 오염, 열',
      prompt:'냄새도 색도 없는 온배수와 열섬, 위성은 어떻게 ‘볼’까?',
      lead:'위성은 픽셀마다 온도를 숫자로 기록해요. 숫자가 격자로 놓이면 곧 <b>행렬</b>이에요.',
      visual:{src:'slides/c56/s05.jpg', alt:'발전소 배수구에서 퍼지는 온배수 열영상과 도심·주거·공원의 여름 낮 지표온도 열영상', cap:'교육용 시뮬레이션 (실제 Landsat 열적외선 밴드는 100 m 해상도)'},
      blocks:[
        {t:'stats', items:[{num:'399억 톤',label:'발전소 온배수 배출량 (2020.1~8, 한수원·발전5사)'},{num:'+7.2℃',label:'취수 대비 온배수 평균 배출 온도'}], src:'에너지신문(2020.10.22)'},
        {t:'stw', id:'c56-stw', kind:'활동지 1', q:'두 열영상에서 가장 뜨거운 곳은 어디이고, 왜 그럴까요?'},
        {t:'links', items:[
          {label:'MBC 뉴스데스크(2025.08.01) · 폭염에 뜨거워진 바다, 원전 온배수까지‥어민 ‘이중고’', url:'https://www.youtube.com/watch?v=rZ4nCJVa1Q4', kind:'영상'},
          {label:'YTN 사이언스 · 찜통 같은 도심…원인은 열섬 현상', url:'https://www.youtube.com/watch?v=ubQFC7rV9HQ', kind:'영상'}
        ]}
      ]},

    { id:'sub', phase:'활동 1', minutes:15, move:'분석',
      title:'두 사진을 빼면 보이는 것',
      prompt:'가동 중 온도 T에서 가동 전 온도 B를 빼면, 어디가 얼마나 데워졌는지 보일까?',
      lead:'같은 위치(행, 열)끼리 빼요. 예: A(1,3) = 31 − 24 = 7',
      visual:{src:'slides/c56/s07.jpg', alt:'관측 온도 T(발전소 가동 중)와 배경 온도 B(가동 전) 5×5 행렬', cap:'활동지 2 · 행렬의 뺄셈 A = T − B'},
      blocks:[
        {t:'predict', id:'c56-sub-pred', q:'A = T − B를 채우면 어떤 모양이 나올까요?', options:['배수구 앞이 가장 크고, 멀어질수록 작아진다','바다 전체가 고르게 몇 ℃씩 오른다','먼바다 쪽이 가장 크게 오른다'],
          reveal:[
            {t:'widget', name:'carbon-matsub'},
            {t:'blanks', id:'c56-max', kind:'활동지 2', q:'가장 큰 상승값과 퍼지는 모양', text:'가장 큰 곳: 행 [[1]], 열 [[3]], [[7]]℃<br>열3을 따라 먼바다 쪽으로: 7 → [[5]] → [[3]] → [[1]] → 0',
              explain:'행5(먼바다)는 모두 0, 배경과 같아요. 실제 온배수는 취수 대비 평균 +7.2℃이고 조류·수심에 따라 수 km까지 퍼져요.'}
          ]},
        {t:'tablefill', id:'c56-R', kind:'활동지 3', q:'스칼라곱 R = (1/7)·A: 최댓값 7을 1.00으로 맞춰요. 소수 둘째 자리까지. (행4·행5는 0.14 한 칸 말고 모두 0)', head:['R','열1','열2','열3','열4','열5'], rows:[
          ['행1','?0.29','?0.71','?1.00|1','?0.71','?0.29'],
          ['행2','?0.14','?0.43','?0.71','?0.43','?0.14'],
          ['행3','?0.00|0','?0.14','?0.43','?0.14','?0.00|0']
        ], caption:'등급: R ≥ 0.70 고위험 · 0.30 ≤ R < 0.70 주의 · R < 0.30 낮음', explain:'고위험은 행1 열2·열3·열4, 행2 열3의 4칸이에요. 2/7 ≈ 0.29는 0.30보다 작아 ‘낮음’이에요.'},
        {t:'choice', id:'c56-norm', q:'고위험 기준(R ≥ 0.70)은 그대로 두고 ×(1/7) 대신 ×(1/10)을 곱하면 고위험 칸은?', options:['4칸 그대로다','1칸으로 줄어든다','모든 칸이 고위험이 된다'], answer:1,
          hints:['고위험이던 A 값 7, 5, 5, 5를 각각 10으로 나눠 보세요.','0.70 이상은 7 ÷ 10 = 0.70 하나뿐이에요.'],
          why:'같은 자료인데 기준을 바꾸면 지도가 달라져요. 이 사실은 정책을 정할 때 어떤 질문을 던지나요?',
          explain:'×(1/7)이면 고위험 4칸, ×(1/10)이면 행1 열3 한 칸만 남아요. 기준 설정이 곧 정책 판단이에요.'}
      ]},

    { id:'conv', phase:'활동 1', minutes:12, move:'예측',
      title:'3×3 필터로 지도 다듬기',
      prompt:'혼자 튀는 픽셀을 이웃과 섞으면 지도는 어떻게 달라질까?',
      lead:'평균 필터: 겹친 9칸의 합 ÷ 9가 그 위치의 출력이에요. CNN은 이런 필터를 데이터로 ‘학습’해요.',
      visual:{src:'slides/c56/s08.jpg', alt:'온도 상승 행렬 A 열지도: 행1 열3이 7로 가장 크고 멀어질수록 줄어듦', cap:'입력 행렬 A = T − B (온배수의 ‘지문’) — 이 위에 3×3 창을 겹쳐요'},
      blocks:[
        {t:'predict', id:'c56-conv-pred', q:'평균 필터를 지나면 A(2행, 3열)의 값 5는?', options:['더 커진다','그대로 5다','더 작아진다'],
          reveal:[
            {t:'widget', name:'carbon-conv'},
            {t:'tablefill', id:'c56-conv', kind:'활동지 4', q:'세 위치의 출력을 손으로 구하고, 체험판에서 그 칸을 눌러 확인해요.', head:['위치','3×3 합','출력 = 합 ÷ 9','원래 A'], rows:[
              ['(2행, 2열)','?27','?3','3'],
              ['(3행, 3열)','?17','?1.89','3'],
              ['(3행, 2열)','?14','?1.56','1']
            ], explain:'27 ÷ 9 = 3, 17 ÷ 9 ≈ 1.89, 14 ÷ 9 ≈ 1.56. (2행, 2열)은 이웃 9칸의 평균이 우연히 자기 값 3과 같아요.'},
            {t:'choice', id:'c56-filter', q:'위성영상에 평균 필터를 쓰는 까닭은?', options:['센서 잡음·구름 조각처럼 혼자 튀는 값을 부드럽게 하려고','온배수 경계선을 더 뚜렷하게 하려고','최댓값을 1로 맞추려고'], answer:0,
              hints:['체험판에서 평균 필터와 경계 검출 필터의 출력 지도를 번갈아 보세요.','최댓값을 1로 맞추는 것은 스칼라곱이 하는 일이었어요.'],
              why:true,
              explain:'평균 필터는 이웃과 섞어 부드럽게 만들어요(경계는 흐려짐). 값이 급변하는 경계선을 찾는 것은 경계 검출 필터 [−1 … 8 … −1]이에요.'}
          ]}
      ]},

    { id:'island', phase:'활동 1', minutes:8, move:'판단',
      title:'도시 열섬, 어디부터 식힐까?',
      prompt:'폭염 대책을 한 곳에만 먼저 할 수 있다면, 어디를 골라야 할까?',
      lead:'열섬은 같은 시기 도심과 공원(교외)의 비교예요. P는 모든 성분이 28℃인 공원 기준 행렬.',
      visual:{src:'img/c56-heat-island.jpg', alt:'한여름 햇빛 아래 뜨거운 도심과 시원한 공원·하천이 함께 있는 도시', cap:'도심(상업) · 주거 · 공원·하천'},
      blocks:[
        {t:'tablefill', id:'c56-H', kind:'활동지 5', q:'열섬 강도 H = S − P를 채워요. (S: 여름 낮 지표온도 ℃)', head:['','열1','열2','열3'], rows:[
          ['S 행1','38','36','31'],
          ['S 행2','37','35','30'],
          ['S 행3','33','31','28'],
          ['H 행1','?10','?8','?3'],
          ['H 행2','?9','?7','?2'],
          ['H 행3','?5','?3','?0']
        ], caption:'행1 열1 도심(상업·아스팔트) · 행2 열2 주거 · 행3 열3 공원·하천', explain:'도심 +10℃, 공원·하천 0'},
        {t:'choice', id:'c56-zone', q:'쿨루프·녹지를 가장 먼저 투자할 구역은?', options:['행1 열1 도심(상업, +10℃)','행2 열2 주거 (+7℃)','행3 열3 공원·하천 (0℃)'], answer:0,
          hints:['H가 가장 큰 칸을 찾아요.','열섬 강도가 큰 구역일수록 폭염에 취약해요.'],
          why:'그 구역이 가장 뜨거운 까닭을 쓰고, 주거 지역에 어르신·어린이가 많이 산다면 선택이 바뀔지도 생각해 써요.',
          explain:'도심은 아스팔트·콘크리트가 햇빛을 흡수·저장해 +10℃예요. 공원·하천은 녹지와 물이 열을 완충해 0이에요.'}
      ]},

    { id:'rebound', phase:'활동 2', minutes:15, move:'예측',
      title:'으뜸효율 가전의 역설',
      prompt:'전기를 30% 덜 먹는 에어컨, 정말 30%만큼 줄어들까?',
      lead:'2025년 으뜸효율 환급사업: 185만 건 환급, 연간 절감 48.3 GWh(잠정·추정치).',
      visual:{src:'slides/c56/s13.jpg', alt:'환급 185만 건, 총 매출 2.6조 원, 연간 소비전력 절감 48.3 GWh(잠정·추정치)', cap:'기후에너지환경부·한국에너지공단(2026.1), ZDNet Korea(2026.01.20)'},
      blocks:[
        {t:'predict', id:'c56-ac-pred', q:'소비전력이 30% 준 새 에어컨을 하루 8시간 → 10시간 켠다면, 실제 절감률은?', options:['30% 그대로','30%보다 조금 적다 (약 25%)','절반도 안 된다 (약 12.5%)','오히려 더 쓴다'],
          compare:'48.3 GWh도 실제로는 그만큼 줄지 않을 수 있어요. 내 예측과 계산을 비교하며 그 까닭을 써요.',
          reveal:[
            {t:'blanks', id:'c56-rb', kind:'활동지 7', q:'리바운드를 계산해요. (기존 1시간 소비 = 100)', text:'기존 100 × 8 = 800 → 새 에어컨 70 × 10 = [[700]]<br>실제 절감률 = (800 − 700) ÷ 800 = [[12.5]]%<br>리바운드율 = 1 − (12.5 ÷ 30) ≈ [[58]]%',
              hints:['사용 시간이 그대로라면 예상 절감률은 30%예요.'],
              explain:'예상 절감의 약 58%가 되돌아왔어요. 이해를 돕는 극단적 예이고, 실증 연구의 직접 리바운드는 대략 10~30%예요.'},
            {t:'widget', name:'carbon-rebound'}
          ]},
        {t:'sort', id:'c56-type', kind:'활동지 8', q:'효율이 좋아진 뒤 일어난 일: 역설일까, 부분 리바운드일까?', bins:['제번스의 역설 (총소비가 오히려 늘어남)','부분 리바운드 (절감 일부만 상쇄)','역설 논의가 있는 사례 (논쟁 중)'], items:[
          {text:'와트 증기기관 개량(18세기 후반) → 석탄 사용이 산업 전반으로 퍼져 급증', bin:0},
          {text:'자동차 연비 향상 → 더 자주·더 멀리 운전해 절감분 일부 상쇄', bin:1},
          {text:'LED 조명 → 전광판·야간·장식 조명이 늘어 조명 전력 수요가 늘었다는 분석도 있음', bin:2},
          {text:'AI 반도체 효율 향상 → 데이터센터·모델 규모 급증, 전력 수요 증가(2020년대)', bin:2}
        ], explain:'수업 자료 기준이에요. 자동차 연비의 직접 리바운드는 10~30%라 역설이 아닌 ‘부분 리바운드’예요. 제번스는 1865년 『The Coal Question』에서 효율 개선이 소비를 줄인다는 생각을 착각이라고 지적했어요.'}
      ]},

    { id:'gd', phase:'활동 2', minutes:18, move:'분석',
      title:'되돌아오는 몫, w를 찾아라',
      prompt:'리바운드 계수 w를 데이터로 찾으려면, 손실의 그릇 바닥까지 어떻게 내려갈까?',
      lead:'4가구 자료(교육용) e = 0.1, 0.2, 0.3, 0.4 / u = 0.05, 0.12, 0.17, 0.25. 모델 u = w·e, 손실 L(w) = (1/4)Σ(w·eᵢ − uᵢ)²',
      visual:{src:'img/c56-loss-bowl.jpg', alt:'U자 계곡을 따라 공이 몇 번 튀며 바닥으로 내려가는 그림', cap:'손실함수의 그릇과 경사하강법'},
      blocks:[
        {t:'blanks', id:'c56-L', kind:'활동지 9', q:'두 w의 손실을 비교해요. (반올림 값도 인정)', text:'L(0) = (1/4)(0.05² + 0.12² + 0.17² + 0.25²) ≈ [[0.0271|0.027075]]<br>L(0.6) = (1/4){(0.06 − 0.05)² + 0² + (0.18 − 0.17)² + (0.24 − 0.25)²} ≈ [[0.000075]]<br>→ 손실이 더 작은 w = [[0.6]]', tol:0.00002,
          explain:'w = 0.6일 때 손실이 훨씬 작아요. 그런데 0.6을 미리 모른다면? 기울기를 따라 내려가요.'},
        {t:'predict', id:'c56-eta-pred', q:'w(다음) = w − η·L′(w), L′(w) = 0.15w − 0.09. 보폭 η를 5에서 15로 키우면?', options:['더 빨리 바닥(0.6)에 도착한다','바닥을 넘나들지만 결국 도착한다','바닥을 지나쳐 점점 멀어진다'],
          reveal:[
            {t:'tablefill', id:'c56-gd', kind:'활동지 10', q:'먼저 η = 5, w₀ = 0으로 세 단계를 계산해요.', head:['단계','현재 w','L′(w) = 0.15w − 0.09','다음 w'], rows:[
              ['0 → 1','0','−0.09','0 + 0.45 = 0.45'],
              ['1 → 2','0.45','?-0.0225','?0.5625'],
              ['2 → 3','?0.5625','?-0.005625','?0.5906|0.590625'],
              ['3 → 4','?0.5906','?-0.0014|-0.00141','?0.5977|0.5976']
            ], tol:0.0005, explain:'0.45 → 0.5625 → 0.5906 → 0.5977 … 0.6에 수렴해요.'},
            {t:'widget', name:'carbon-gd'},
            {t:'blanks', id:'c56-wstar', kind:'활동지 10', q:'바닥과 보폭', text:'L′(w*) = 0 → 0.15w* = 0.09 → w* = [[0.6]]<br>뜻: 효율이 10% 좋아지면 사용량은 약 [[6]]% 늘어나요.<br>η = 10: 0 → [[0.9]] → [[0.45]] (진동하며 수렴) · η = 15: 0 → [[1.35]] → [[-0.3375|−0.3375]] (발산)',
              explain:'η > 2/0.15 ≈ 13.3이면 발산해요. 최소제곱법(3~4차시)은 공식으로 한 번에, 경사하강법은 조금씩 반복해 답에 다가가요. 딥러닝은 수백만 개의 w를 이 규칙으로 갱신해요.'}
          ]}
      ]},

    { id:'policy', phase:'활동 3 · 정리', minutes:22, move:'실천',
      title:'효율만으로 충분할까?',
      prompt:'w에 따라 절감이 30% → 17% → 0% 이하로 바뀐다면, 어떤 정책이 함께 가야 할까?',
      lead:'소비전력 30% 감소 → 실제 소비 = (1 − 0.3) × (1 + 0.3w). 결론은 ‘계수’에 달려 있어요.',
      visual:{src:'slides/c56/s22.jpg', alt:'정책 A 보이지 않는 열 오염 대책, 정책 B 리바운드 억제 대책 모둠 미션', cap:'활동지 12·13 · 모둠 미션'},
      blocks:[
        {t:'tablefill', id:'c56-scn', kind:'활동지 11', q:'w에 따른 실제 소비와 실제 절감률을 구해요.', head:['w','실제 소비 (기존 = 1)','실제 절감률(%)'], rows:[
          ['0 (리바운드 없음)','0.7 × 1.00 = 0.70','30'],
          ['0.6 (모델 추정)','?0.826','?17.4'],
          ['1.0','?0.91','?9'],
          ['1.5','?1.015','?-1.5|−1.5']
        ], explain:'w = 1.5면 소비가 오히려 늘어요(제번스의 역설). 국가 적용: w = 0.6이면 리바운드율 ≈ 42% → 48.3 × 0.58 ≈ 28 GWh, 실증 범위(리바운드 10~30%)면 약 34~43 GWh. 실제 데이터로 w를 추정해야 정책 효과를 부풀리지 않아요.'},
        {t:'cer', id:'c56-policy', kind:'활동지 12 · 정책 카드', q:'정책 A(보이지 않는 열 오염) 또는 B(리바운드 억제) 중 하나를 골라 데이터 근거로 제안해요.',
          starters:{c:'정책 이름과 대상: …', e:'근거 데이터(수치·식): 예) R ≥ 0.7 구역, 열섬 H 행렬, w* = 0.6, 48.3 GWh 중 되돌아오는 몫', r:'기대효과와 부작용(누가 부담하나?): …'},
          example:'주장: 정책 B — 효율 환급에 누진요금과 스마트미터 실시간 사용량 알림을 함께 적용해요. 근거: w = 0.6이면 30% 효율 개선이 실제로는 17.4% 절감, 48.3 GWh가 약 28 GWh로 줄어요. 이유: 싸진 전기를 더 쓰는 리바운드를 가격·정보로 막아야 효율이 진짜 감축이 돼요. 부작용: 요금 부담이 저소득층에 커질 수 있어 보완이 필요해요.'},
        {t:'reflect', id:'c56-exit', items:['우리 모둠 슬로건 한 문장','아직 궁금한 것 한 가지']},
        {t:'more', title:'더 나아가기', items:[
          {img:'img/c56-more-landsat.jpg', tag:'데이터', title:'Landsat 열영상', text:'USGS. 우리 지역 지표온도로 행렬을 직접 만들어 봐요.', url:'https://www.usgs.gov/landsat-missions'},
          {img:'img/c56-more-kernel.jpg', tag:'도구', title:'이미지 합성곱 체험', text:'Setosa. 평균·경계 검출 필터를 사진에 직접 씌워 봐요.', url:'https://setosa.io/ev/image-kernels/'},
          {img:'img/c56-more-gd.jpg', tag:'도구', title:'경사하강법 실험', text:'성균관대 Math4AI. η를 바꾸며 수렴·진동·발산을 확인해요.', url:'http://matrix.skku.ac.kr/math4ai/gradient_descent/'},
          {img:'img/c56-more-jevons.jpg', tag:'읽기', title:'제번스의 역설', text:'석탄에서 AI 데이터센터까지, 150년 넘게 이어지는 질문.', url:'https://ko.wikipedia.org/wiki/%EC%A0%9C%EB%B3%B8%EC%8A%A4%EC%9D%98_%EC%97%AD%EC%84%A4'}
        ]}
      ]}
  ]
});

})();
