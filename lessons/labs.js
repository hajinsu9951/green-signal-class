/* 그린 시그널 수업실 · 실험실(웹 시뮬레이션) — 학생이 조건을 바꾸며 직접 관찰하는 위젯
   lab-thermal : 온배수 열지도 실험실 (맨눈 ↔ 열적외선, 탐침, 피해 면적, 5×5 행렬로 읽기)
   lab-rebound : 리바운드 효과 실험실 (효율·사용 반응·간접 소비, 100가구 1년 추이, 정책 손잡이)
   모든 수치는 교육용 단순 모형이며, 실제 해역·가구 자료가 아니다. */
(function(){
'use strict';

/* ================= 공통 ================= */
if(!document.getElementById('lab-css')){
  const css = document.createElement('style'); css.id = 'lab-css';
  css.textContent = `
.lab{display:flex;flex-direction:column;gap:12px}
.lab-badge{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;letter-spacing:.05em;color:var(--th)}
.lab-badge::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--th);box-shadow:0 0 0 3px var(--th-soft)}
.lab-main{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
@media (min-width:900px){.lab-main{grid-template-columns:minmax(0,3fr) minmax(250px,2fr);align-items:start}}
.lab-screen{position:relative;border-radius:12px;overflow:hidden;background:#0b1a24;border:1px solid var(--line)}
.lab-screen canvas{display:block;width:100%;height:auto;touch-action:manipulation;cursor:crosshair}
.lab-hud{position:absolute;left:8px;top:8px;display:flex;gap:6px;flex-wrap:wrap;pointer-events:none}
.lab-hud span{background:rgba(0,0,0,.6);color:#fff;font-size:.75rem;padding:3px 8px;border-radius:999px;font-family:var(--f-num)}
.lab-legend{display:flex;align-items:center;gap:8px;font-size:.75rem;color:var(--muted);font-family:var(--f-num)}
.lab-legend i{flex:1;height:10px;border-radius:5px}
.lab-ctl{display:flex;flex-direction:column;gap:10px}
.lab-ctl fieldset{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:0;display:flex;flex-direction:column;gap:8px;min-width:0}
.lab-ctl legend{font-size:.75rem;font-weight:700;color:var(--th);padding:0 4px}
.lab-sl{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;align-items:center;font-size:.88rem}
.lab-sl input{grid-column:1/-1;width:100%;accent-color:var(--th)}
.lab-sl output{font-family:var(--f-num);font-weight:700;color:var(--th)}
.lab-seg{display:flex;flex-wrap:wrap;gap:6px}
.lab-seg button{font:inherit;font-size:.82rem;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer}
.lab-seg button[aria-pressed="true"]{background:var(--th);border-color:transparent;color:var(--go-ink)}
.lab-read{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,92px),1fr));gap:8px}
.lab-read div{background:var(--sunk);border-radius:10px;padding:8px 10px;min-width:0}
.lab-read small{display:block;font-size:.72rem;color:var(--muted);line-height:1.3}
.lab-read b{font-family:var(--f-num);font-size:1.15rem;color:var(--ink)}
.lab-mis{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:.9rem}
.lab-mis li{display:grid;grid-template-columns:1.5em 1fr;gap:6px;align-items:start;line-height:1.5}
.lab-mis li::before{content:"○";color:var(--muted);font-weight:700}
.lab-mis li.ok::before{content:"✓";color:var(--th)}
.lab-mis li.ok{color:var(--muted)}
.lab-note{font-size:.78rem;color:var(--muted);line-height:1.5;margin:0}
.lab-mat{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;max-width:320px}
.lab-mat div{border-radius:6px;padding:6px 0;text-align:center;font-family:var(--f-num);font-weight:700;font-size:.92rem}
.lab-hh{display:grid;grid-template-columns:repeat(20,minmax(0,1fr));gap:4px;max-width:440px;margin-top:6px}
.lab-hh i{aspect-ratio:1;border-radius:50%;background:var(--line);transition:background .3s}
.lab-verdict{font-weight:700;padding:8px 12px;border-radius:10px;background:var(--th-soft);color:var(--ink);line-height:1.5}
.lab-verdict.bad{background:color-mix(in srgb,var(--bad) 18%,var(--surface))}
`;
  document.head.append(css);
}
function sl(U, label, min, max, step, val, fmt, on){
  const out = U.el('output',{});
  const r = U.el('input',{type:'range',min:String(min),max:String(max),step:String(step),'aria-label':label});
  r.value = val;
  const upd = () => { out.textContent = fmt(+r.value); };
  r.addEventListener('input', () => { upd(); on(+r.value); });
  upd();
  const w = U.el('label',{class:'lab-sl'}, U.el('span',{},label), out, r);
  w.set = v => { r.value = v; upd(); };
  return w;
}
function seg(U, items, cur, on){
  const box = U.el('div',{class:'lab-seg',role:'group'});
  const draw = v => box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.v===v)));
  items.forEach(([v,t])=>box.append(U.el('button',{type:'button','data-v':v,onclick:()=>{ draw(v); on(v); }},t)));
  draw(cur); box.set = draw;
  return box;
}
function missions(U, list){
  const ul = U.el('ol',{class:'lab-mis'});
  const lis = list.map(t=>{ const li = U.el('li',{}, U.el('span',{html:t})); ul.append(li); return li; });
  ul.done = (k, ok) => { lis[k].classList.toggle('ok', !!ok); };
  return ul;
}
// 열화상 팔레트(검정 → 보라 → 빨강 → 주황 → 노랑 → 흰색)
const PAL = [[12,7,40],[72,12,110],[150,30,110],[215,60,60],[245,130,30],[250,205,60],[255,250,220]];
function heat(p){ p = Math.max(0, Math.min(1, p)) * (PAL.length-1); const i = Math.min(PAL.length-2, Math.floor(p)), f = p-i, a = PAL[i], b = PAL[i+1];
  return 'rgb('+Math.round(a[0]+(b[0]-a[0])*f)+','+Math.round(a[1]+(b[1]-a[1])*f)+','+Math.round(a[2]+(b[2]-a[2])*f)+')'; }
const HEAT_CSS = 'linear-gradient(90deg,'+PAL.map(c=>'rgb('+c.join(',')+')').join(',')+')';
function rng(seed){ let s = seed>>>0; return () => { s = (s*1664525 + 1013904223)>>>0; return s/4294967296; }; }

/* ================= 온배수 열지도 실험실 ================= */
GS.widget('lab-thermal', function(host, o, st, U){
  const NX = 48, NY = 30, PX = 12, BASE = 25, TMIN = 24, TMAX = 34, KM2 = 0.01; // 한 칸 = 100 m × 100 m (Landsat 열적외선 밴드 해상도 수준)
  const D = 0.15, LOSS = 0.006, Y0 = 15; // 안정 조건: 1 − 4D − |조류| − LOSS > 0
  const coast = y => 5 + Math.round(1.6*Math.sin(y/4.5) + 0.8*Math.sin(y/2.1));
  const isLand = (x,y) => x < coast(y);
  const OX = coast(Y0);
  const CUR = {calm:[0,0,'정지'], north:[0,-0.28,'북쪽으로'], south:[0,0.28,'남쪽으로'], off:[0.28,0,'먼바다로']};
  const sv = Object.assign({q:2, dt:7, cur:'north', view:'eye', thr:1, reuse:0, probes:0, sawIR:false, curSeen:[]}, st.get('lab-th')||{});
  const save = () => st.set('lab-th', sv);
  const noise = new Float32Array(NX*NY), r = rng(7); for(let k=0;k<noise.length;k++) noise[k] = (r()-0.5)*0.5;
  let E = new Float32Array(NX*NY), hours = 0, playing = true, probe = null;
  const SPEED = {slow:[2,'천천히 (1초 = 1시간)'], mid:[10,'보통 (1초 = 5시간)'], fast:[60,'빠르게 (1초 = 30시간)']}; // 1단계 = 30분
  if(!SPEED[sv.speed]) sv.speed = 'mid';
  const hm = h => h < 24 ? (Math.floor(h)+'시간'+(h%1 ? ' 30분' : '')) : (Math.floor(h/24)+'일 '+Math.floor(h%24)+'시간');

  function outlets(){ const out = [], h = Math.floor((sv.q-1)/2); for(let y=Y0-h; y<=Y0-h+sv.q-1; y++) out.push(coast(y) + y*NX); return out; }
  function step(){
    const n = new Float32Array(E.length), [ux, uy] = CUR[sv.cur], src = sv.dt*(1 - sv.reuse/100);
    for(let y=0;y<NY;y++) for(let x=0;x<NX;x++){
      const k = x + y*NX; if(isLand(x,y)) continue;
      const e = E[k];
      const nb = (xx,yy) => (xx<0||yy<0||xx>=NX||yy>=NY) ? 0 : isLand(xx,yy) ? e : E[xx+yy*NX];
      const l = nb(x-1,y), rr = nb(x+1,y), u = nb(x,y-1), d = nb(x,y+1);
      const adv = (ux>0 ? ux*(e-l) : ux<0 ? ux*(rr-e) : 0) + (uy>0 ? uy*(e-u) : uy<0 ? uy*(d-e) : 0);
      n[k] = Math.min(src, Math.max(0, e + D*(l+rr+u+d-4*e) - adv - LOSS*e));
    }
    outlets().forEach(k=>{ n[k] = src; });
    E = n; hours += 0.5;
  }
  const temp = k => BASE + E[k] + noise[k]*(1 - Math.min(1,E[k]/2)*0.5);

  // 화면
  const cv = U.el('canvas',{width:String(NX*PX),height:String(NY*PX),role:'img','aria-label':'발전소 앞바다 온배수 확산 시뮬레이션 화면'});
  const ctx = cv.getContext('2d');
  const hud = U.el('div',{class:'lab-hud'});
  const legend = U.el('div',{class:'lab-legend'}, U.el('span',{},TMIN+'℃'), U.el('i',{style:'background:'+HEAT_CSS}), U.el('span',{},TMAX+'℃ 이상'));
  function draw(){
    const ir = sv.view==='ir';
    for(let y=0;y<NY;y++) for(let x=0;x<NX;x++){
      const k = x + y*NX;
      if(isLand(x,y)){ ctx.fillStyle = ir ? heat((31 + noise[k]*2 - TMIN)/(TMAX-TMIN)) : (x===coast(y)-1 ? '#c9b98a' : (noise[k]>0 ? '#7fa45e' : '#76995a')); }
      else ctx.fillStyle = ir ? heat((temp(k)-TMIN)/(TMAX-TMIN)) : 'rgb('+Math.round(48+noise[k]*14)+','+Math.round(112+noise[k]*18)+','+Math.round(160+noise[k]*20)+')';
      ctx.fillRect(x*PX, y*PX, PX, PX);
    }
    // 발전소와 배수구
    ctx.fillStyle = ir ? 'rgba(255,255,255,.85)' : '#d9dde0'; ctx.fillRect((OX-4)*PX, (Y0-3)*PX, 3*PX, 4*PX);
    ctx.fillStyle = ir ? 'rgba(255,255,255,.85)' : '#9aa3a8'; ctx.beginPath(); ctx.arc((OX-2.5)*PX, (Y0-4)*PX, PX*1.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('발전소', (OX-4.6)*PX, (Y0+2.4)*PX);
    outlets().forEach(k=>{ const x = k%NX, y = Math.floor(k/NX); ctx.fillStyle = '#222'; ctx.fillRect(x*PX, y*PX+PX/3, PX/2, PX/3); });
    // 피해 기준선(열화상에서만)
    if(ir){ ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.5; ctx.beginPath();
      const inz = (x,y) => x>=0&&y>=0&&x<NX&&y<NY&&!isLand(x,y)&&E[x+y*NX]>=sv.thr;
      for(let y=0;y<NY;y++) for(let x=0;x<NX;x++) if(inz(x,y)){
        if(!inz(x+1,y)){ ctx.moveTo((x+1)*PX,y*PX); ctx.lineTo((x+1)*PX,(y+1)*PX); }
        if(!inz(x-1,y)&&!isLand(x-1,y)){ ctx.moveTo(x*PX,y*PX); ctx.lineTo(x*PX,(y+1)*PX); }
        if(!inz(x,y+1)){ ctx.moveTo(x*PX,(y+1)*PX); ctx.lineTo((x+1)*PX,(y+1)*PX); }
        if(!inz(x,y-1)){ ctx.moveTo(x*PX,y*PX); ctx.lineTo((x+1)*PX,y*PX); }
      } ctx.stroke(); }
    // 조류 화살표
    const [ux,uy] = CUR[sv.cur];
    if(ux||uy){ ctx.strokeStyle = ir ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; const cx = (NX-5)*PX, cy = 4*PX, L = 26;
      ctx.beginPath(); ctx.moveTo(cx-ux/0.28*L/2, cy-uy/0.28*L/2); ctx.lineTo(cx+ux/0.28*L/2, cy+uy/0.28*L/2); ctx.stroke();
      const ax = cx+ux/0.28*L/2, ay = cy+uy/0.28*L/2, ang = Math.atan2(uy,ux); ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax-8*Math.cos(ang-0.5), ay-8*Math.sin(ang-0.5)); ctx.lineTo(ax-8*Math.cos(ang+0.5), ay-8*Math.sin(ang+0.5)); ctx.closePath(); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      ctx.font = '11px sans-serif'; ctx.fillText('조류', cx-12, cy+30); }
    // 탐침
    if(probe){ const {x,y} = probe; ctx.strokeStyle = ir ? '#fff' : '#ffeb3b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc((x+.5)*PX,(y+.5)*PX,PX*.9,0,Math.PI*2); ctx.moveTo((x+.5)*PX,(y-1)*PX); ctx.lineTo((x+.5)*PX,(y+2)*PX); ctx.moveTo((x-1)*PX,(y+.5)*PX); ctx.lineTo((x+2)*PX,(y+.5)*PX); ctx.stroke(); }
    readout();
  }

  // 측정값
  const rArea = U.el('b',{}), rMax = U.el('b',{}), rProbe = U.el('b',{}), rTime = U.el('b',{});
  const probeNote = U.el('p',{class:'lab-note'});
  function readout(){
    let n = 0, mx = 0; for(let k=0;k<E.length;k++){ if(E[k]>=sv.thr) n++; if(E[k]>mx) mx = E[k]; }
    const ir = sv.view==='ir';
    rArea.textContent = ir ? (n*KM2).toFixed(2)+' km²' : '?';
    rMax.textContent = ir ? '+'+mx.toFixed(1)+'℃' : '?';
    rTime.textContent = hm(hours);
    hud.innerHTML = '';
    hud.append(U.el('span',{}, ir ? '열적외선(열화상) 보기' : '맨눈(가시광) 보기'), U.el('span',{}, '경과 '+hm(hours)));
    if(probe){ const k = probe.x + probe.y*NX, dist = Math.hypot(probe.x-OX, probe.y-Y0)*100;
      if(isLand(probe.x, probe.y)){ rProbe.textContent = '육지'; probeNote.textContent = '바다를 눌러 수온을 재 보세요.'; }
      else { rProbe.textContent = temp(k).toFixed(1)+'℃'; probeNote.textContent = '탐침: 배수구에서 약 '+Math.round(dist/10)*10+' m · 주변 바닷물보다 +'+E[k].toFixed(1)+'℃'+(ir?'':' (맨눈으로는 차이가 안 보여요)'); } }
    else { rProbe.textContent = '—'; probeNote.textContent = '화면을 누르면 그 자리의 수온을 재요(탐침). 맨눈 보기에서도 잴 수 있어요.'; }
    mis.done(0, sv.sawIR); mis.done(1, sv.curSeen.length>=3); mis.done(2, sv.probes>=3);
  }
  cv.addEventListener('click', e=>{ const b = cv.getBoundingClientRect(); const x = Math.floor((e.clientX-b.left)/b.width*NX), y = Math.floor((e.clientY-b.top)/b.height*NY);
    if(x<0||y<0||x>=NX||y>=NY) return; probe = {x,y}; if(!isLand(x,y)){ sv.probes++; save(); } draw(); });

  // 조작
  const playBtn = U.el('button',{type:'button',class:'btn sm pri',onclick:()=>{ playing = !playing; playBtn.textContent = playing ? '⏸ 멈춤' : '▶ 재생'; if(playing) requestAnimationFrame(loop); }},'⏸ 멈춤');
  const resetBtn = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ E = new Float32Array(NX*NY); hours = 0; draw(); }},'↺ 처음부터');
  const ffBtn = U.el('button',{type:'button',class:'btn sm',onclick:()=>{ for(let k=0;k<48;k++) step(); draw(); }},'⏩ 하루 뒤로');
  const viewSeg = seg(U, [['eye','👁 맨눈'],['ir','🌡 열화상(위성)']], sv.view, v=>{ sv.view = v; if(v==='ir') sv.sawIR = true; save(); legend.hidden = v!=='ir'; draw(); });
  legend.hidden = sv.view!=='ir';
  const curSeg = seg(U, Object.entries(CUR).map(([k,v])=>[k,v[2]]), sv.cur, v=>{ sv.cur = v; if(!sv.curSeen.includes(v)) sv.curSeen.push(v); save(); draw(); });
  const ctl = U.el('div',{class:'lab-ctl'},
    U.el('fieldset',{}, U.el('legend',{},'보기'), viewSeg, legend),
    U.el('fieldset',{}, U.el('legend',{},'발전소'),
      sl(U,'가동 중인 발전기',1,5,1,sv.q,v=>v+'기',v=>{ sv.q = v; save(); }),
      sl(U,'배출 수온 상승',2,10,0.1,sv.dt,v=>'+'+v.toFixed(1)+'℃',v=>{ sv.dt = v; save(); }),
      o.policy ? sl(U,'정책: 온배수 재이용(양식·난방)',0,80,10,sv.reuse,v=>v+'%',v=>{ sv.reuse = v; save(); }) : null),
    U.el('fieldset',{}, U.el('legend',{},'바다'), U.el('span',{class:'lab-note'},'조류 방향'), curSeg,
      sl(U,'피해 기준선(주변보다)',0.5,4,0.5,sv.thr,v=>'+'+v+'℃ 이상',v=>{ sv.thr = v; save(); draw(); })),
    U.el('fieldset',{}, U.el('legend',{},'시간 흐름'), seg(U, Object.entries(SPEED).map(([k,v])=>[k,v[1]]), sv.speed, v=>{ sv.speed = v; save(); })),
    U.el('div',{class:'row'}, playBtn, ffBtn, resetBtn));

  const mis = missions(U, [
    '맨눈 보기에서 온배수를 찾아보고, <b>열화상(위성)</b>으로 바꿔 보세요. 무엇이 달라지나요?',
    '<b>조류 방향 3가지 이상</b>을 바꿔 보며 피해 면적(km²)이 가장 넓어지는 조건을 찾으세요.',
    '<b>탐침으로 3곳 이상</b>을 재어, 배수구에서 멀어질수록 수온이 어떻게 변하는지 확인하세요.'
  ]);

  // 5×5 행렬로 읽기
  const matBox = U.el('div',{hidden:true});
  const matBtn = U.el('button',{type:'button',class:'btn sm',onclick:()=>{
    matBox.hidden = false; matBox.innerHTML = '';
    const g = U.el('div',{class:'lab-mat'});
    for(let i=0;i<5;i++) for(let j=0;j<5;j++){ const x = OX + 1 + i*2, y = Y0 - 4 + j*2, v = Math.round(E[x+y*NX]);
      g.append(U.el('div',{style:'background:'+heat(v/9)+';color:'+(v>=5?'#222':'#fff')}, String(v))); }
    matBox.append(U.el('b',{},'지금 화면을 위성 픽셀 25칸으로 읽으면 (주변보다 몇 ℃ 높은가, 반올림)'), g,
      U.el('p',{class:'lab-note',html:'배수구 바로 앞(1행)부터 먼바다 쪽(5행)까지, 해안을 따라 5칸(열)을 2칸(200 m) 간격으로 읽었어요. 배수구는 3열이에요. 이 숫자 격자가 다음 장면의 <b>행렬 A = T − B</b>예요.'}));
  }},'🔢 5×5 행렬로 읽기');

  host.append(U.el('div',{class:'ah'}, U.el('span',{class:'k'},'실험실'), U.el('span',{class:'q'},'온배수 열지도 실험실 — 보이지 않는 열을 위성처럼 보기')),
    U.el('div',{class:'lab'},
      U.el('div',{class:'lab-main'},
        U.el('div',{class:'lab'}, U.el('div',{class:'lab-screen'}, cv, hud),
          U.el('div',{class:'lab-read'},
            U.el('div',{}, U.el('small',{},'피해 기준 이상 해역'), rArea),
            U.el('div',{}, U.el('small',{},'최고 상승 수온'), rMax),
            U.el('div',{}, U.el('small',{},'탐침 수온'), rProbe),
            U.el('div',{}, U.el('small',{},'경과 시간'), rTime)),
          probeNote),
        ctl),
      U.el('div',{}, U.el('span',{class:'lab-badge'},'미션'), mis),
      U.el('div',{class:'row'}, matBtn), matBox,
      U.el('p',{class:'lab-note'},'교육용 단순 모형: 열이 퍼지고(확산), 조류에 실려 가고(이류), 공기 중으로 식는(냉각) 세 과정만 계산해요. 한 칸은 100 m × 100 m, 기준 수온은 여름 바다 25℃로 가정했어요. 실제 해역 자료가 아니에요.')));

  // 실제 시간에 맞춰 단계 수를 정한다(화면 새로고침 빈도와 무관)
  let last = 0, acc = 0;
  function loop(t){ if(!playing || !host.isConnected){ last = 0; return; }
    if(last){ acc += Math.min(0.25, (t-last)/1000) * SPEED[sv.speed][0]; let n = 0; while(acc >= 1 && n < 30){ step(); acc -= 1; n++; } if(n) draw(); }
    last = t; requestAnimationFrame(loop); }
  for(let k=0;k<160;k++) step();
  draw(); requestAnimationFrame(loop);
});

/* ================= 리바운드 효과 실험실 ================= */
GS.widget('lab-rebound', function(host, o, st, U){
  // 서비스 단가가 (1−e)(1+p)배가 되면 사용량은 그 −ε 제곱배, 전력은 사용량 × (1−e)
  const PRE = {
    ac:{t:'에어컨 (활동지 7번 예)', e:30, eps:0.62, s:0, note:'하루 8시간 → 약 10시간으로 늘어난 활동지 예와 같아요.'},
    car:{t:'자동차 연비', e:20, eps:0.2, s:20, note:'실증 연구에서 직접 리바운드는 대략 10~30%예요(Sorrell, 2007).'},
    led:{t:'LED 조명', e:60, eps:0.85, s:20, note:'조명이 싸지자 쓰임이 크게 늘었다는 분석이 있어 ‘논쟁 중’이에요.'},
    ai:{t:'AI 반도체', e:40, eps:1.3, s:30, note:'연산 비용이 싸지자 쓰임이 폭증한 2020년대 제번스 역설 논의를 가정한 값이에요.'}
  };
  const sv = Object.assign({pre:'ac', e:30, eps:0.62, s:0, p:0, fb:false, back:false, low:false}, st.get('lab-rb')||{});
  const save = () => st.set('lab-rb', sv);
  const N = 100, MONTHS = 12, START = 3, r = rng(11), spread = Array.from({length:N}, ()=>0.55 + r()*0.9);
  const EI = 0.25; // 아낀 돈 1원어치 다른 소비가 쓰는 에너지(전력 1원어치 대비, 교육용 가정)

  function model(epsMul){
    const e = sv.e/100, p = sv.p/100, eps = sv.eps*(sv.fb?0.7:1)*epsMul, c = (1-e)*(1+p);
    const use = Math.pow(c, -eps), direct = use*(1-e), saved = Math.max(0, 1 - (1+p)*direct);
    return {use, direct, total: direct + sv.s/100*saved*EI};
  }
  function calc(){
    const rep = model(1), e = sv.e/100;
    const actual = 1 - rep.total, reb = e>0 ? (1 - actual/e)*100 : 0;
    const hh = spread.map(m=>model(m));
    return {rep, actual, reb, hh};
  }

  const svg = U.el('div',{});
  const hhBox = U.el('div',{class:'lab-hh','aria-hidden':'true'}); for(let k=0;k<N;k++) hhBox.append(U.el('i',{}));
  const rExp = U.el('b',{}), rAct = U.el('b',{}), rReb = U.el('b',{}), rUse = U.el('b',{});
  const verdict = U.el('div',{class:'lab-verdict',role:'status'});
  const preNote = U.el('p',{class:'lab-note'});
  let anim = 0, month = MONTHS;

  function chart(res){
    const W = 600, H = 230, L = 44, R = 12, T = 14, B = 34, mx = Math.max(1.3, 1 + Math.max(0, res.rep.total-1)*1.2), mn = Math.min(0.3, res.rep.total-0.1, 1-sv.e/100-0.1);
    const X = m => L + (m)/(MONTHS)*(W-L-R), Y = v => T + (mx-v)/(mx-mn)*(H-T-B);
    const at = m => m < START ? 1 : res.rep.total + (1-res.rep.total)*Math.exp(-(m-START)/1.6);
    const exp = m => m < START ? 1 : 1 - sv.e/100;
    let pa = '', pe = '';
    for(let m=0;m<=Math.min(month,MONTHS);m+=0.25){ pa += (pa?'L':'M')+X(m).toFixed(1)+' '+Y(at(m)).toFixed(1); }
    for(let m=0;m<=MONTHS;m+=0.25){ pe += (pe?'L':'M')+X(m).toFixed(1)+' '+Y(exp(m)).toFixed(1); }
    const grid = [mn, 1, mx].map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" ${v===1?'':'stroke-dasharray="3 4"'}/><text x="${L-6}" y="${Y(v)+4}" font-size="11" text-anchor="end" fill="var(--muted)">${Math.round(v*100)}</text>`).join('');
    const xt = [0,3,6,9,12].map(m=>`<text x="${X(m)}" y="${H-B+16}" font-size="11" text-anchor="middle" fill="var(--muted)">${m}월</text>`).join('');
    svg.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="100가구 전력 사용량 1년 추이: 예상과 실제 비교" style="width:100%;height:auto;display:block">
      ${grid}${xt}
      <line x1="${X(START)}" x2="${X(START)}" y1="${T}" y2="${H-B}" stroke="var(--th)" stroke-dasharray="4 4"/>
      <text x="${X(START)+5}" y="${T+12}" font-size="11" fill="var(--th)">고효율 제품으로 교체</text>
      <path d="${pe}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="6 5"/>
      <path d="${pa}" fill="none" stroke="var(--th)" stroke-width="3" stroke-linejoin="round"/>
      <text x="${W-R}" y="${Y(exp(MONTHS))+(exp(MONTHS)<res.rep.total?16:-6)}" font-size="11" text-anchor="end" fill="var(--muted)">예상(사용 습관 그대로)</text>
      ${month>=MONTHS?`<text x="${W-R}" y="${Y(res.rep.total)+(exp(MONTHS)<res.rep.total?-6:16)}" font-size="12" font-weight="700" text-anchor="end" fill="var(--th)">실제 ${Math.round(res.rep.total*100)}</text>`:''}
      <text x="${L}" y="${H-4}" font-size="11" fill="var(--muted)">100가구 전력 사용량 (교체 전 = 100)</text></svg>`;
  }
  function draw(){
    const res = calc(), e = sv.e;
    chart(res);
    const dots = hhBox.children;
    res.hh.forEach((h,k)=>{ const g = h.use - 1; dots[k].style.background = h.total > 1 ? 'var(--bad)' : g > 0.35 ? 'var(--climate)' : g > 0.08 ? 'color-mix(in srgb,var(--climate) 45%,var(--surface))' : 'var(--th)'; });
    rExp.textContent = e+'%';
    rAct.textContent = (res.actual*100).toFixed(1)+'%';
    rReb.textContent = Math.round(res.reb)+'%';
    rUse.textContent = '×'+res.rep.use.toFixed(2);
    const back = res.reb > 100, none = res.reb <= 0;
    verdict.className = 'lab-verdict' + (back ? ' bad' : '');
    verdict.innerHTML = back ? '🔥 <b>백파이어(제번스의 역설)</b> — 효율을 높였는데 전체 사용량이 오히려 늘었어요.'
      : none ? (res.reb < -0.5 ? '✅ <b>리바운드 없음</b> — 예상보다 더 줄었어요. 가격 신호나 피드백이 사용을 함께 줄였기 때문이에요.'
               : '✅ <b>리바운드 없음</b> — 사용 습관이 그대로라 예상한 만큼 줄었어요.')
      : res.reb < 30 ? '🟢 <b>작은 부분 리바운드</b> — 예상 절감의 대부분이 실제로 남았어요.'
      : '🟠 <b>부분 리바운드</b> — 예상 절감 중 '+Math.round(res.reb)+'%가 늘어난 사용으로 되돌아왔어요.';
    if(back) sv.back = true;
    if((sv.p>0||sv.fb) && res.reb <= 30 && sv.e >= 20) sv.low = true;
    save();
    mis.done(0, sv.pre==='ac' && Math.abs(res.reb-58) < 3 && sv.p===0 && !sv.fb && sv.s===0);
    mis.done(1, sv.back); mis.done(2, sv.low);
  }
  function run(){ cancelAnimationFrame(anim); month = 0; const t0 = performance.now();
    const tick = t => { month = Math.min(MONTHS, (t-t0)/160); draw(); if(month < MONTHS && host.isConnected) anim = requestAnimationFrame(tick); };
    anim = requestAnimationFrame(tick); }

  const sE = sl(U,'효율 개선 (같은 일에 드는 전기 감소)',0,70,5,sv.e,v=>v+'%',v=>{ sv.e = v; run(); });
  const sEps = sl(U,'싸진 만큼 더 쓰는 정도 ε',0,1.6,0.01,sv.eps,v=>v.toFixed(2)+(v>1?' (아주 많이)':v>0.5?' (꽤)':v>0.1?' (조금)':' (그대로)'),v=>{ sv.eps = v; run(); });
  const sS = sl(U,'아낀 돈을 다른 소비에 쓰는 비율(간접)',0,100,10,sv.s,v=>v+'%',v=>{ sv.s = v; run(); });
  const preSeg = seg(U, Object.entries(PRE).map(([k,v])=>[k,v.t]), sv.pre, k=>{ const P = PRE[k]; Object.assign(sv,{pre:k, e:P.e, eps:P.eps, s:P.s}); sE.set(P.e); sEps.set(P.eps); sS.set(P.s); preNote.textContent = P.note; run(); });
  preNote.textContent = (PRE[sv.pre]||PRE.ac).note;
  const fbBox = U.el('input',{type:'checkbox'}); fbBox.checked = sv.fb; fbBox.addEventListener('change',()=>{ sv.fb = fbBox.checked; run(); });
  const policy = U.el('details',{class:'lab-ctl'});
  if(o.policy) policy.open = true;
  policy.append(U.el('summary',{style:'cursor:pointer;font-weight:700;color:var(--th)'},'정책 손잡이 (리바운드 억제)'),
    U.el('fieldset',{},
      sl(U,'전기요금 인상(누진·탄소가격)',0,60,5,sv.p,v=>'+'+v+'%',v=>{ sv.p = v; run(); }),
      U.el('label',{class:'row',style:'gap:8px;font-size:.88rem'}, fbBox, U.el('span',{},'스마트미터 실시간 사용량 알림 (ε를 30% 낮춤)'))));

  const mis = missions(U, [
    '<b>에어컨</b> 예시로 실행해, 활동지 7번에서 계산한 리바운드율(약 58%)이 나오는지 확인하세요.',
    'ε와 효율을 바꿔 <b>백파이어(리바운드율 100% 초과)</b>가 일어나는 조건을 찾으세요.',
    '효율 개선을 20% 이상 유지하면서 <b>정책 손잡이</b>로 리바운드율을 30% 이하로 낮춰 보세요.'
  ]);

  host.append(U.el('div',{class:'ah'}, U.el('span',{class:'k'},'실험실'), U.el('span',{class:'q'},'리바운드 효과 실험실 — 100가구에 고효율 제품을 보급하면?')),
    U.el('div',{class:'lab'},
      U.el('div',{}, U.el('span',{class:'lab-note'},'사례 고르기'), preSeg, preNote),
      U.el('div',{class:'lab-main'},
        U.el('div',{class:'lab'}, svg,
          U.el('div',{class:'lab-read'},
            U.el('div',{}, U.el('small',{},'예상 절감률'), rExp),
            U.el('div',{}, U.el('small',{},'실제 절감률'), rAct),
            U.el('div',{}, U.el('small',{},'리바운드율'), rReb),
            U.el('div',{}, U.el('small',{},'사용 시간·횟수'), rUse)),
          verdict),
        U.el('div',{class:'lab-ctl'},
          U.el('fieldset',{}, U.el('legend',{},'조건'), sE, sEps, sS), policy,
          U.el('div',{class:'row'}, U.el('button',{type:'button',class:'btn sm pri',onclick:run},'▶ 1년 다시 보기')))),
      U.el('div',{}, U.el('span',{class:'lab-badge'},'우리 마을 100가구'), hhBox,
        U.el('p',{class:'lab-note',html:'<span style="color:var(--th)">●</span> 거의 그대로 · <span style="color:var(--climate)">●</span> 더 오래·자주 씀 · <span style="color:var(--bad)">●</span> 교체 전보다 더 많이 씀 — 가구마다 ε가 조금씩 달라요.'})),
      U.el('div',{}, U.el('span',{class:'lab-badge'},'미션'), mis),
      U.el('p',{class:'lab-note'},'교육용 단순 모형: 사용량 = (서비스 단가)^(−ε), 전력 = 사용량 × (1 − 효율 개선). 리바운드율 = 1 − 실제 절감 ÷ 예상 절감. ε와 간접 소비의 에너지 비율(0.25)은 가정값이에요.')));
  run();
});
})();
