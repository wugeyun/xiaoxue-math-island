const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const COURSE_CONFIG=window.COURSE_CONFIG||{};
const STORE_KEY=COURSE_CONFIG.storeKey||'mathIslandG3Up2022VerifiedV3';
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch(e){saved={}}
const state={unit:0,step:0,progress:saved,activity:{},solverOpen:0,quizIndex:0,quizPoints:100,quizMistakes:0,quizStarted:false};
const lifeReasoningStyle=document.createElement('style');lifeReasoningStyle.textContent='.life-think-preview{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:15px 0 4px;padding:12px 14px;border-radius:14px;background:#fff;border:1px dashed color-mix(in srgb,var(--unit-color) 45%,#ddd);font-size:11px}.life-think-preview b{color:var(--unit-color);margin-right:4px}.life-think-preview span{background:#f3f1ec;border-radius:99px;padding:6px 9px}.reasoning-feedback{text-align:left}.reasoning-feedback>b{display:block;margin-bottom:8px}.reasoning-feedback ol{margin:0;padding-left:22px;line-height:1.8}';document.head.appendChild(lifeReasoningStyle);
const fractionStyle=document.createElement('style');fractionStyle.textContent='.math-fraction{display:inline-grid;grid-template-rows:auto auto;align-items:center;justify-items:center;vertical-align:middle;min-width:1.35em;margin:0 .1em;line-height:1;font-size:.92em;font-variant-numeric:tabular-nums}.math-fraction-num{width:100%;padding:0 .13em .08em;border-bottom:1.5px solid currentColor;text-align:center}.math-fraction-den{padding:.08em .13em 0;text-align:center}.equation-card .math-fraction,.chalk-equation .math-fraction{font-size:.8em;vertical-align:middle}.option-button .math-fraction{font-size:.88em}';document.head.appendChild(fractionStyle);
const fractionSkipSelector='.math-fraction,.unit-progress,.book-progress,.nav-check,.stage-badge,.quiz-number,.mini-track,.unit-card footer';
function stackFractionText(node){
  if(!node?.parentElement||node.parentElement.closest(fractionSkipSelector)||!/[0-9]+\/[1-9][0-9]*/.test(node.nodeValue))return;
  const fragment=document.createDocumentFragment();let last=0;
  node.nodeValue.replace(/([0-9]+)\/([1-9][0-9]*)/g,(match,numerator,denominator,offset)=>{
    fragment.append(node.nodeValue.slice(last,offset));
    const fraction=document.createElement('span');fraction.className='math-fraction';fraction.setAttribute('role','math');fraction.setAttribute('aria-label',`${denominator}分之${numerator}`);fraction.innerHTML=`<span class="math-fraction-num">${numerator}</span><span class="math-fraction-den">${denominator}</span>`;fragment.append(fraction);last=offset+match.length;
  });
  fragment.append(node.nodeValue.slice(last));node.replaceWith(fragment);
}
function stackFractions(root){
  if(root.nodeType===Node.TEXT_NODE){stackFractionText(root);return}
  if(root.nodeType!==Node.ELEMENT_NODE||root.matches('script,style'))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(stackFractionText);
}
const fractionObserver=new MutationObserver(records=>records.forEach(record=>{if(record.type==='characterData')stackFractionText(record.target);record.addedNodes.forEach(stackFractions)}));fractionObserver.observe(document.body,{subtree:true,childList:true,characterData:true});stackFractions(document.body);
courseUnits.forEach(u=>{if(!state.progress[u.id])state.progress[u.id]={done:[],quiz:0}});

function persist(){localStorage.setItem(STORE_KEY,JSON.stringify(state.progress))}
function unit(){return courseUnits[state.unit]}
function doneSet(index=state.unit){return new Set(state.progress[courseUnits[index].id].done)}
function totalStars(){return courseUnits.reduce((n,u)=>n+state.progress[u.id].done.length,0)}
function savedQuizPoints(){return Number(state.progress[unit().id].quiz)||0}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}

function renderRoute(){
  const spots=[[12,23],[35,16],[65,26],[80,48],[55,55],[25,52],[10,72],[37,76],[65,75],[83,78],[46,35],[75,12]];
  $('#routePicture').innerHTML='<div class="route-path"></div>'+courseUnits.map((u,i)=>`<div class="route-island" style="left:${spots[i][0]}%;top:${spots[i][1]}%" title="${u.title}">${u.icon}</div>`).join('');
}
function renderNav(){
  $('#chapterNav').innerHTML=courseUnits.map((u,i)=>{const d=doneSet(i);return `<button class="nav-item ${i===state.unit?'active':''} ${d.size===5?'complete':''}" data-unit="${i}" style="--unit-color:${u.color}"><span class="nav-num">${u.number}</span><span class="nav-name">${u.title}</span><span class="nav-check">${d.size===5?'✓':d.size+'/5'}</span></button>`}).join('');
  $$('.nav-item').forEach(b=>b.onclick=()=>showUnit(Number(b.dataset.unit)));
}
function renderMap(){
  $('#unitGrid').innerHTML=courseUnits.map((u,i)=>{const d=doneSet(i);return `<article class="unit-card ${d.size===5?'complete':''}" data-map-unit="${i}" style="--unit-color:${u.color}" tabindex="0"><div class="unit-top"><span class="unit-no">${u.number==='实'?'综合实践':u.number==='趣'?'数学好玩':u.number==='复'?'整册复习':'第 '+u.number+' 单元'}</span><span class="unit-icon">${u.icon}</span></div><h3>${u.title}</h3><p>${u.subtitle}</p><footer><span>${d.size===5?'已点亮':d.size+'/5 关'}</span><div class="mini-track"><i style="width:${d.size*20}%"></i></div><b>→</b></footer></article>`}).join('');
  $$('[data-map-unit]').forEach(c=>{c.onclick=()=>showUnit(Number(c.dataset.mapUnit));c.onkeydown=e=>{if(e.key==='Enter')c.click()}});
  updateGlobalProgress();
}
function updateGlobalProgress(){
  const stars=totalStars(),total=courseUnits.length*5,pct=Math.round(stars/total*100),isQuiz=$('#lessonView').classList.contains('active')&&state.step===4,quizDisplay=state.quizStarted?state.quizPoints:savedQuizPoints();
  $('#starCount').textContent=isQuiz?quizDisplay:stars;$('#starCount').setAttribute('aria-label',isQuiz?(state.quizStarted?`本次测试实时得分 ${quizDisplay} 分`:`上次测试得分 ${quizDisplay} 分`):`已获得 ${stars} 颗星`);$('#bookProgressText').textContent=pct+'%';$('#bookProgressBar').style.width=pct+'%';
}
function updateUnitProgress(){const d=doneSet();$('#unitProgressText').textContent=d.size+'/5';$('#unitProgressBar').style.width=d.size*20+'%';$('#unitProgressLabel').textContent=unit().title;updateGlobalProgress();renderNav()}
function showMap(){ $('#lessonView').classList.remove('active');$('#mapView').classList.add('active');renderMap();window.scrollTo({top:0,behavior:'smooth'}) }
function showUnit(index){
  state.unit=index;state.step=0;document.documentElement.style.setProperty('--unit-color',unit().color);$('#lessonKicker').textContent=(unit().number==='实'?'综合实践':unit().number==='趣'?'数学好玩':unit().number==='复'?'整册复习':'第 '+unit().number+' 单元')+' · '+unit().title;$('#lessonTitle').textContent=unit().lessonTitle;$('#lessonSubtitle').textContent=unit().lessonSubtitle;$('#mapView').classList.remove('active');$('#lessonView').classList.add('active');renderNav();setStep(0);window.scrollTo({top:0,behavior:'smooth'});
}
function completeStep(step){const p=state.progress[unit().id];if(!p.done.includes(step)){p.done.push(step);p.done.sort();persist();toast('点亮一个关卡，得到 1 颗星 ⭐')}updateUnitProgress()}
function setStep(step){state.step=step;$$('.step-tab').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('done',doneSet().has(i))});renderStage();updateUnitProgress();window.scrollTo({top:175,behavior:'smooth'})}
function stageButton(label='继续下一关 →'){return `<button class="primary-button" id="stageNext">${label}</button>`}
function bindNext(next){const b=$('#stageNext');if(b)b.onclick=()=>setStep(next)}

function renderStage(){if(state.step===0)renderStory();if(state.step===1)renderActivity();if(state.step===2)renderSolver();if(state.step===3)renderLife();if(state.step===4)renderQuiz()}
function renderStory(){const u=unit(),s=u.story;$('#lessonStage').innerHTML=`<article class="stage-panel story-layout"><div class="story-copy"><span class="panel-label">${s.label}</span><h2>${s.title}</h2><p>${s.text}</p><div class="equation-card">${s.equation}</div><div class="rule-card"><span>📣</span><b>${s.rule}</b></div>${stageButton('看懂了，动手试试 →')}</div><div class="visual-card">${s.art}</div></article>`;$('#stageNext').onclick=()=>{completeStep(0);setStep(1)}}

function activityHeader(a){return `<div class="stage-head"><div><span class="panel-label">轮到你动手</span><h2>${a.title}</h2><p>${a.text}</p></div><div class="stage-badge">👆 亲手发现</div></div>`}
function activityFooter(){return `<div class="feedback" id="activityFeedback">先试一试，做错也没关系。</div><div class="panel-actions"><button class="ghost-button" id="activityReset">重新来</button><button class="primary-button" id="stageNext" disabled>完成啦，去分步解题 →</button></div>`}
function activityReasoning(a,extra=''){
  const steps=Array.isArray(a.reasoning)&&a.reasoning.length?a.reasoning:[
    `读题：${a.text||'先读清题目给出的条件和要求。'}`,
    `找关系：${extra||a.success||'把题目中的数量、位置或图形关系对应起来。'}`,
    '检查：完成后把结果带回题目，核对数量、单位、方向或图形关系是否符合要求。'
  ];
  return steps;
}
function showActivityFeedback(kind,title,a,extra=''){
  const f=$('#activityFeedback');if(!f)return;
  f.className=`feedback ${kind} reasoning-feedback`;
  f.innerHTML=`<b>${title}</b><b>🪜 完整解题思路：</b><ol>${activityReasoning(a,extra).map(x=>`<li>${escapeFeedbackText(x)}</li>`).join('')}</ol>`;
}
function finishActivity(msg,a=unit().activity){showActivityFeedback('success','🎉 完成了！',a,msg);$('#stageNext').disabled=false;completeStep(1);bindNext(2)}
function renderActivity(){
  const a=unit().activity;state.activity={count:0,value:a.start||0,sum:0};
  let body='';
  if(a.type==='group')body=`<div class="activity-shell"><button class="source-button" id="sourceButton"><strong>${a.token}</strong><b>点我放一个</b><small>还剩 <em id="remainCount">${a.total}</em> 个</small></button><div class="activity-area bucket-grid">${Array.from({length:a.groups},(_,i)=>`<div class="activity-bucket" data-bucket="${i}" aria-label="第${i+1}组"></div>`).join('')}</div></div>`;
  if(['choice','pattern','calendar'].includes(a.type))body=`<div class="activity-shell"><div class="choice-model">${a.model||a.month||'🔎'}</div><div class="option-grid">${a.options.map((o,i)=>`<button class="option-button" data-activity-answer="${i}">${o}</button>`).join('')}</div></div>`;
  if(a.type==='builder')body=`<div class="builder"><div class="builder-target">目标：${a.target}</div><div class="builder-number" id="builderNumber">${a.start}</div><div class="builder-buttons">${a.buttons.map(([l,v])=>`<button data-change="${v}">${l}</button>`).join('')}</div></div>`;
  if(a.type==='coins')body=`<div class="builder"><div class="builder-target">目标：¥ ${a.target.toFixed(1)}</div><div class="builder-number">¥ <span id="coinTotal">0.0</span></div><div class="coin-purse" id="coinPurse"></div><div class="coin-buttons">${a.coins.map(([l,v])=>`<button data-coin="${v}">🪙 ${l}</button>`).join('')}</div></div>`;
  $('#lessonStage').innerHTML=`<article class="stage-panel">${activityHeader(a)}${body}${activityFooter()}</article>`;bindActivity(a);
}
function bindActivity(a){
  $('#activityReset').onclick=renderActivity;
  if(a.type==='group')$('#sourceButton').onclick=()=>{if(state.activity.count>=a.total)return;const index=state.activity.count%a.groups,bucket=$(`[data-bucket="${index}"]`),token=document.createElement('span');token.className='pop-token';token.textContent=a.token;bucket.appendChild(token);state.activity.count++;$('#remainCount').textContent=a.total-state.activity.count;if(state.activity.count===a.total)finishActivity(a.success)};
  if(['choice','pattern','calendar'].includes(a.type))$$('[data-activity-answer]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.activityAnswer);if(n===a.answer){b.classList.add('correct');$$('[data-activity-answer]').forEach(x=>x.disabled=true);finishActivity(a.success,a)}else{b.classList.add('wrong');showActivityFeedback('error','❌ 这次还没选对。',a,'先把题目给出的条件和每个选项逐一对应，再判断哪项满足全部条件。');setTimeout(()=>b.classList.remove('wrong'),600)}});
  if(a.type==='builder')$$('[data-change]').forEach(b=>b.onclick=()=>{state.activity.value+=Number(b.dataset.change);$('#builderNumber').textContent=state.activity.value;if(state.activity.value===a.target)finishActivity(a.success,a);else showActivityFeedback('error',state.activity.value>a.target?'❌ 已经超过目标。':'🧭 还没有到目标。',a,`目标是${a.target}，当前是${state.activity.value}；先算出还差多少，再选择合适的增减量。`)});
  if(a.type==='coins')$$('[data-coin]').forEach(b=>b.onclick=()=>{const v=Number(b.dataset.coin);state.activity.sum=Math.round((state.activity.sum+v)*10)/10;$('#coinTotal').textContent=state.activity.sum.toFixed(1);$('#coinPurse').textContent+='🪙';if(state.activity.sum===a.target)finishActivity(a.success,a);if(state.activity.sum>a.target){showActivityFeedback('error','❌ 金额超过目标。',a,`目标是${a.target.toFixed(1)}元，当前是${state.activity.sum.toFixed(1)}元；先用减法算出多出的金额，再点击“重新来”重新组合。`);$$('[data-coin]').forEach(x=>x.disabled=true)}});
}

function renderSolver(){const s=unit().solver;state.solverOpen=0;$('#lessonStage').innerHTML=`<article class="stage-panel"><div class="stage-head"><div><span class="panel-label">像搭积木一样解题</span><h2>一步一步，不着急</h2><p>点击每一步，看看思路怎样连起来。</p></div><div class="equation-card">${s.equation}</div></div><div class="solver-layout"><div class="solver-list">${s.steps.map((x,i)=>`<button class="solver-step ${i===0?'active':'locked'}" data-solver="${i}"><i>${i+1}</i><div><small>${x[0]}</small><b>${x[1]}</b></div><span>${i===s.steps.length-1?'✓':'→'}</span></button>`).join('')}</div><div class="solver-board" id="solverBoard"></div></div><div class="panel-actions"><span id="solverHint">点击第 2 步继续</span><button class="primary-button" id="stageNext" disabled>会分步了，练一练 →</button></div></article>`;showSolver(0);$$('[data-solver]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.solver);if(n<=state.solverOpen+1)showSolver(n)})}
function showSolver(n){const s=unit().solver;if(n>state.solverOpen+1)return;state.solverOpen=Math.max(state.solverOpen,n);$$('[data-solver]').forEach((b,i)=>{b.classList.toggle('active',i===n);if(i<=state.solverOpen)b.classList.remove('locked')});const x=s.steps[n];$('#solverBoard').innerHTML=`<div class="chalk-title">第 ${n+1} 步 · ${x[0]}</div><div class="chalk-equation">${x[1]}</div><p>${x[2]}</p><div class="coach"><span>🦊</span><b>${n===s.steps.length-1?'把答案带回题目检查一次。':'想清这一层，再走下一步。'}</b></div>`;if(n===s.steps.length-1){$('#solverHint').textContent='✅ 思路已经连起来了';$('#stageNext').disabled=false;completeStep(2);bindNext(3)}else $('#solverHint').textContent='点击第 '+(n+2)+' 步继续'}

function escapeFeedbackText(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function quizReasoningHtml(item,scoreText,kind='error'){
  const detail=String(item[3]||'请结合题目条件检查计算、单位和实际意义。').trim().replace(/[。！？!?；;：:，,、]+$/,'');
  const steps=Array.isArray(item[4])&&item[4].length?item[4]:[
    '审题：找出题目给出的数量、单位、位置或图形条件，明确题目要求计算、比较还是判断什么。',
    `找关系：${detail}`,
    '完成：按照数量关系、运算顺序或图形关系逐步计算或判断，不要只凭选项猜答案。',
    '检查：把结果带回原题，核对数值、单位和实际意义，确认它确实回答了题目。'
  ];
  const icon=kind==='success'?'✅':'❌';
  const tail=kind==='success'?'把这条思路记下来，下一题也按同样的步骤审题、计算和检查。':'按这条思路重新读题，检查条件、关系和结果后再试一个选项。';
  return `<b>${icon} ${escapeFeedbackText(scoreText)}</b><b>🪜 完整解题思路：</b><ol>${steps.map(x=>`<li>${escapeFeedbackText(x)}</li>`).join('')}</ol><p>${tail}</p>`;
}
function renderLife(){state.lifeIndex=0;renderLifeExample()}
function renderLifeExample(){
  const examples=unit().lifeExamples||[unit().life],l=examples[state.lifeIndex],isLast=state.lifeIndex===examples.length-1;
  const thinking=l.thinking||[`找条件：${l.story}`,`找问题：${l.question}`,`列式、计算并检查：${l.explain}`];
  $('#lessonStage').innerHTML=`<article class="stage-panel"><div class="stage-head"><div><span class="panel-label">数学就在身边</span><h2>${l.title}</h2><p>连续完成3个生活例子，把方法真正用起来。</p></div><div class="stage-badge">例子 ${state.lifeIndex+1} / ${examples.length}</div></div><div class="quiz-progress">${examples.map((_,i)=>`<i class="${i<state.lifeIndex?'done':''}"></i>`).join('')}</div><div class="life-layout"><div class="life-picture">${l.icon}</div><div class="life-card"><h3>${l.story}</h3><p>${l.question}</p><div class="life-think-preview"><b>🪜 解题路线</b><span>① 找条件</span><span>② 找关系</span><span>③ 列式并检查</span></div><div class="option-grid">${l.options.map((o,i)=>`<button class="option-button" data-life-answer="${i}">${o}</button>`).join('')}</div></div></div><div class="feedback" id="lifeFeedback">先沿着“找条件 → 找关系 → 列式检查”的路线想一遍。</div><div class="panel-actions"><button class="primary-button" id="stageNext" disabled>${isLast?'完成生活练，开始闯关 →':'下一个生活例子 →'}</button></div></article>`;
  $$('[data-life-answer]').forEach(b=>b.onclick=()=>{
    const n=Number(b.dataset.lifeAnswer),feedback=$('#lifeFeedback');
    if(n===l.answer){
       b.classList.add('correct');$$('[data-life-answer]').forEach(x=>x.disabled=true);feedback.className='feedback success reasoning-feedback';feedback.innerHTML=`<b>✅ 答对了！完整思路：</b><ol>${thinking.map(x=>`<li>${escapeFeedbackText(x)}</li>`).join('')}</ol>`;
      const next=$('#stageNext');next.disabled=false;if(isLast){completeStep(3);next.onclick=()=>setStep(4)}else next.onclick=()=>{state.lifeIndex++;renderLifeExample()};
    }else{
      b.classList.add('wrong');feedback.className='feedback error reasoning-feedback';feedback.innerHTML=`<b>❌ 还没选对，先不要只看选项。</b><b>🪜 完整解题思路：</b><ol>${thinking.map(x=>`<li>${escapeFeedbackText(x)}</li>`).join('')}</ol><p>按上面的步骤重新检查条件、关系和结果，再试一次。</p>`;setTimeout(()=>b.classList.remove('wrong'),600);
    }
  });
}

function renderQuiz(){state.quizIndex=0;state.quizPoints=100;state.quizMistakes=0;state.quizStarted=false;renderQuizQuestion()}
function renderQuizQuestion(){const q=unit().quiz;if(state.quizIndex>=q.length){renderQuizResult();return}const item=q[state.quizIndex],waiting=!state.quizStarted&&state.quizIndex===0;$('#lessonStage').innerHTML=`<article class="stage-panel"><div class="quiz-head"><div><span class="panel-label">单元闯关赛</span><h2>${unit().title} · ${q.length}题挑战</h2><p>满分100分，每选错一次扣1分；答题后先看解析，再点击“下一题”。</p></div></div><div class="quiz-progress">${q.map((_,i)=>`<i class="${i<state.quizIndex?'done':''}"></i>`).join('')}</div><div class="quiz-question"><span class="quiz-number">第 ${state.quizIndex+1} 题 / 共 ${q.length} 题</span><h3>${item[0]}</h3><div class="option-grid">${item[1].map((o,i)=>`<button class="option-button" data-quiz-answer="${i}">${o}</button>`).join('')}</div><div class="feedback" id="quizFeedback">${waiting?`右上角是上次得分 ${savedQuizPoints()} 分；回答本题后，本次从 100 分开始计分。`:`选一个答案吧，当前 ${state.quizPoints} 分。`}</div><div class="panel-actions quiz-actions"><span>答对后查看完整思路，再手动进入下一题。</span><button class="primary-button" id="quizNext" disabled>下一题 →</button></div></div></article>`;updateGlobalProgress();$$('[data-quiz-answer]').forEach(b=>b.onclick=()=>answerQuiz(Number(b.dataset.quizAnswer),b))}
function renderQuizResult(){const p=state.progress[unit().id];p.quiz=state.quizPoints;completeStep(4);persist();confetti();$('#lessonStage').innerHTML=`<article class="stage-panel quiz-result"><div class="result-icon">🏝️</div><div class="result-stars">${'⭐'.repeat(Math.max(1,Math.ceil(state.quizPoints/20)))}</div><h2>${state.quizPoints===100?'100分，满分通关！':'完成本单元！'}</h2><p>本次得分 ${state.quizPoints} 分（满分 100 分），共选错 ${state.quizMistakes} 次。成绩已经保存。</p><button class="primary-button" id="quizAgain">再挑战一次</button> <button class="ghost-button" id="nextUnit">${state.unit<courseUnits.length-1?'前往下一座岛':'回到学习地图'}</button></article>`;updateGlobalProgress();$('#quizAgain').onclick=renderQuiz;$('#nextUnit').onclick=()=>state.unit<courseUnits.length-1?showUnit(state.unit+1):showMap()}
function confetti(){const c=$('#confetti');c.innerHTML=Array.from({length:34},(_,i)=>`<i style="left:${Math.random()*100}%;background:${['#ff735e','#ffd45b','#5b8def','#55b895','#8b72df'][i%5]};animation-delay:${Math.random()*.5}s"></i>`).join('');setTimeout(()=>c.innerHTML='',2400)}

renderRoute();renderNav();renderMap();updateGlobalProgress();
$('#continueButton').onclick=()=>{const i=courseUnits.findIndex((u,n)=>doneSet(n).size<5);showUnit(i<0?0:i)};$('#lessonBack').onclick=showMap;$('#mapButton').onclick=showMap;$('#menuButton').onclick=()=>$('#sidebar').classList.toggle('open');$$('.step-tab').forEach(b=>b.onclick=()=>setStep(Number(b.dataset.step)));document.addEventListener('click',e=>{if(innerWidth<780&&!$('#sidebar').contains(e.target)&&e.target!==$('#menuButton'))$('#sidebar').classList.remove('open')});
function answerQuiz(n,b){const item=unit().quiz[state.quizIndex],feedback=$('#quizFeedback');if(!state.quizStarted){state.quizStarted=true;state.quizPoints=100}if(n===item[2]){updateGlobalProgress();b.classList.add('correct');$$('[data-quiz-answer]').forEach(x=>x.disabled=true);feedback.className='feedback success reasoning-feedback';feedback.innerHTML=quizReasoningHtml(item,`回答正确，当前 ${state.quizPoints} 分。`,'success');const next=$('#quizNext');if(next){next.disabled=false;next.onclick=()=>{state.quizIndex++;renderQuizQuestion()}}}else{state.quizPoints=Math.max(0,state.quizPoints-1);state.quizMistakes++;b.classList.add('wrong');b.disabled=true;updateGlobalProgress();feedback.className='feedback error reasoning-feedback';feedback.innerHTML=quizReasoningHtml(item,`选错一次，扣 1 分；当前 ${state.quizPoints} 分。`,'error')}}
