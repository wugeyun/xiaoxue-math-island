/* 独立整册考试：不改变现有五步学习单元，只在每册地图末尾增加一次系统测试。 */
(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const config=window.COURSE_CONFIG||{};
  const examColor='#d45f78';
  const questionCount=50;
  const examKey=`${config.storeKey||'mathIslandG3Up2022VerifiedV3'}ExamV1`;
  const badQuestionPatterns=[/这道例题/,/这道题/,/上一题/,/上题/,/上述/,/刚才/,/关键表达/,/学习.+首先/,/下面哪句话符合/,/解决新问题时/,/完成后怎样/];
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const readRecord=()=>{try{return JSON.parse(localStorage.getItem(examKey)||'{}')}catch(e){return {}}};
  const record=readRecord();
  const examState={active:false,questions:[],index:0,points:100,mistakes:0,started:false,penalized:false};
  const lessonBack=$('#lessonBack');
  const mapButton=$('#mapButton');
  const originalLessonBack=lessonBack&&lessonBack.onclick;
  const originalMapButton=mapButton&&mapButton.onclick;

  const isUsableQuestion=item=>Array.isArray(item)&&typeof item[0]==='string'&&Array.isArray(item[1])&&item[1].length===3&&Number.isInteger(item[2])&&item[2]>=0&&item[2]<3&&!badQuestionPatterns.some(pattern=>pattern.test(item[0]));
  const normalize=(item,unit,index)=>({question:item[0],options:item[1],answer:item[2],explain:item[3]||'请结合题目条件检查计算和单位。',reasoning:item[4],unit:unit.title,unitIndex:index});
  const reasoningHtml=(item,scoreText,icon)=>{
    const explanation=String(item.explain||'请结合题目条件检查计算和单位。').trim().replace(/[。！？!?；;：:，,、]+$/,'');
    const steps=Array.isArray(item.reasoning)&&item.reasoning.length?item.reasoning:[
      '审题：先找出题目给出的数量、单位、位置或图形条件，明确题目要求计算、比较还是判断什么。',
      `找关系：${explanation}`,
      '完成：按照上面的数量关系、运算顺序或图形关系逐步计算或判断，不要只凭选项猜答案。',
      '检查：把得到的结果带回原题，核对数值、单位和实际意义，确认它确实回答了题目。'
    ];
    return `<b>${icon} ${escapeHtml(scoreText)}</b><b>🪜 完整解题思路：</b><ol>${steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><p>再按这条思路读一遍题目，确认理解后继续。</p>`;
  };
  function buildExamQuestions(){
    const pools=courseUnits.map((unit,unitIndex)=>({unit,unitIndex,items:(unit.quiz||[]).filter(isUsableQuestion).map(item=>normalize(item,unit,unitIndex)),cursor:0}));
    const questions=[];
    while(questions.length<questionCount&&pools.some(pool=>pool.cursor<pool.items.length)){
      pools.forEach(pool=>{
        if(questions.length>=questionCount||pool.cursor>=pool.items.length)return;
        questions.push(pool.items[pool.cursor++]);
      });
    }
    if(questions.length<questionCount)throw new Error(`可用整册考试题只有${questions.length}道，少于${questionCount}道。`);
    return questions;
  }
  function examStatus(){return record.completed?`最佳成绩 ${record.bestScore||0} 分`:'完成50题，检验整册掌握情况'};
  function cardHtml(){
    const done=Boolean(record.completed);
    return `<article class="unit-card exam-card ${done?'complete':''}" data-exam-card data-exam-status="${done?'done':'new'}-${record.bestScore||0}" tabindex="0" style="--unit-color:${examColor}">
      <div class="unit-top"><span class="unit-no">整册考试</span><span class="unit-icon">📝</span></div>
      <h3>整册考试</h3><p>${escapeHtml(examStatus())}。每题2分，满分100分。</p>
      <footer><span>${done?'已完成':'开始考试'}</span><div class="mini-track"><i style="width:${done?100:0}%"></i></div><b>→</b></footer>
    </article>`;
  }
  function navHtml(){
    return `<button class="nav-item exam-nav-item ${examState.active?'active':''} ${record.completed?'complete':''}" data-exam-nav data-exam-status="${record.completed?'done':'new'}-${record.bestScore||0}" style="--unit-color:${examColor}"><span class="nav-num">考</span><span class="nav-name">整册考试</span><span class="nav-check">${record.completed?'✓':'50题'}</span></button>`;
  }
  function bindExamEntry(){
    $$('[data-exam-card]').forEach(card=>{card.onclick=startExam;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' ') {e.preventDefault();startExam()}}});
    $$('[data-exam-nav]').forEach(button=>button.onclick=startExam);
  }
  function appendExamEntries(){
    const grid=$('#unitGrid');
    const card=grid&&grid.querySelector('[data-exam-card]');
    if(grid&&!card)grid.insertAdjacentHTML('beforeend',cardHtml());
    else if(card&&card.dataset.examStatus!==`${record.completed?'done':'new'}-${record.bestScore||0}`)card.outerHTML=cardHtml();
    const nav=$('#chapterNav');
    const examNav=nav&&nav.querySelector('[data-exam-nav]');
    if(nav&&!examNav)nav.insertAdjacentHTML('beforeend',navHtml());
    else if(examNav&&examNav.dataset.examStatus!==`${record.completed?'done':'new'}-${record.bestScore||0}`)examNav.outerHTML=navHtml();
    bindExamEntry();
  }
  function setExamNavActive(){
    const nav=$('#chapterNav');
    const examNav=nav&&nav.querySelector('[data-exam-nav]');
    if(!nav||!examNav)return;
    nav.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===examNav));
  }
  function updateMapCopy(){
    const heading=$('#mapView .course-hero h1 em');
    if(heading&&!heading.dataset.examCopy){heading.textContent=`${courseUnits.length}座学习小岛 + 1座考试岛`;heading.dataset.examCopy='1'}
    const intro=$('#mapView .course-hero p');
    if(intro&&!intro.dataset.examCopy){const base=intro.textContent.split(/每一站/)[0].replace(/[。\s]+$/,'');intro.textContent=`${base}。完成所有学习模块后，再参加一次50题整册考试。`;intro.dataset.examCopy='1'}
  }
  function updateExamTop(){
    const score=$('#starCount'),label=$('#unitProgressLabel'),text=$('#unitProgressText'),bar=$('#unitProgressBar');
    if(score){score.textContent=examState.points;score.setAttribute('aria-label',`整册考试实时得分 ${examState.points} 分`)}
    if(label)label.textContent='整册考试';
    if(text)text.textContent=`${Math.min(examState.index,questionCount)}/${questionCount}`;
    if(bar)bar.style.width=`${Math.round(Math.min(examState.index,questionCount)/questionCount*100)}%`;
  }
  function showExamLesson(){
    const steps=$('.learning-steps');
    if(steps)steps.style.display='none';
    const chips=$$('.lesson-chips span');
    if(chips.length>=4){
      chips[0].textContent='⏱ 约 30 分钟';
      chips[1].textContent='📚 覆盖本册内容';
      chips[2].textContent='⭐ 50 题考试';
      chips[3].textContent='🎯 每题 2 分';
    }
    document.documentElement.style.setProperty('--unit-color',examColor);
    $('#mapView').classList.remove('active');
    $('#lessonView').classList.add('active');
    $('#lessonKicker').textContent='整册考试 · 50道题';
    $('#lessonTitle').textContent=`${config.gradeLabel||document.title.split('·')[0].trim()}整册考试`;
    $('#lessonSubtitle').textContent='覆盖本册全部学习模块，独立完成一次系统测试。';
    if(lessonBack)lessonBack.onclick=exitExam;
    if(mapButton)mapButton.onclick=exitExam;
  }
  function startExam(){
    try{examState.questions=buildExamQuestions()}catch(error){
      console.error(error);
      showExamLesson();
      $('#lessonStage').innerHTML=`<article class="stage-panel"><div class="feedback error">暂时无法生成整册考试：${escapeHtml(error.message)}</div></article>`;
      return;
    }
    examState.active=true;examState.index=0;examState.points=100;examState.mistakes=0;examState.started=false;examState.penalized=false;
    appendExamEntries();
    setExamNavActive();
    showExamLesson();
    renderExamQuestion();
  }
  function renderExamQuestion(){
    const item=examState.questions[examState.index];
    if(!item){renderExamResult();return}
    examState.penalized=false;
    $('#lessonStage').innerHTML=`<article class="stage-panel exam-stage">
      <div class="quiz-head"><div><span class="panel-label">整册考试</span><h2>第${examState.index+1}题 / 共${questionCount}题</h2><p>每题2分，首次答错扣2分；右上角显示本次考试实时得分。</p></div><div class="exam-source">${escapeHtml(item.unit)}</div></div>
      <div class="quiz-progress">${Array.from({length:questionCount},(_,i)=>`<i class="${i<examState.index?'done':''}"></i>`).join('')}</div>
      <div class="quiz-question"><h3>${escapeHtml(item.question)}</h3><div class="option-grid">${item.options.map((option,i)=>`<button class="option-button" data-exam-answer="${i}">${escapeHtml(option)}</button>`).join('')}</div>
      <div class="feedback" id="examFeedback">${examState.started?`当前得分 ${examState.points} 分，请选择答案。`:'考试开始，当前得分100分。请独立读完题目后作答。'}</div></div>
    </article>`;
    updateExamTop();
    $$('[data-exam-answer]').forEach(button=>button.onclick=()=>answerExam(Number(button.dataset.examAnswer),button));
  }
  function answerExam(choice,button){
    const item=examState.questions[examState.index];
    const feedback=$('#examFeedback');
    examState.started=true;
    if(choice===item.answer){
      $$('.exam-stage [data-exam-answer]').forEach(option=>option.disabled=true);
      button.classList.add('correct');
      feedback.className='feedback success reasoning-feedback';
      feedback.innerHTML=reasoningHtml(item,`回答正确，当前得分 ${examState.points} 分。`,'✅')+'<button class="primary-button next-question-button" id="examNext">下一题 →</button>';
      $('#examNext').onclick=()=>{examState.index++;renderExamQuestion()};
      updateExamTop();
      return;
    }
    if(!examState.penalized){examState.points=Math.max(0,examState.points-2);examState.mistakes++;examState.penalized=true}
    button.disabled=true;button.classList.add('wrong');
    feedback.className='feedback error reasoning-feedback';
    feedback.innerHTML=reasoningHtml(item,`这道题扣2分，当前得分 ${examState.points} 分。`,'❌');
    updateExamTop();
  }
  function renderExamResult(){
    examState.index=questionCount;
    record.completed=true;
    record.lastScore=examState.points;
    record.bestScore=Math.max(Number(record.bestScore)||0,examState.points);
    record.attempts=(Number(record.attempts)||0)+1;
    localStorage.setItem(examKey,JSON.stringify(record));
    updateExamTop();
    $('#lessonStage').innerHTML=`<article class="stage-panel quiz-result exam-result"><div class="result-icon">🏝️</div><div class="result-stars">${'⭐'.repeat(Math.max(1,Math.ceil(examState.points/20)))}</div><h2>${examState.points>=60?'整册考试完成！':'考试完成，再复习一下相关模块吧'}</h2><p>本次得分 <strong>${examState.points}</strong> 分，共有 ${examState.mistakes} 道题曾答错。最佳成绩 ${record.bestScore} 分。</p><button class="primary-button" id="examAgain">再考一次</button> <button class="ghost-button" id="examBack">回到学习地图</button></article>`;
    $('#examAgain').onclick=startExam;
    $('#examBack').onclick=exitExam;
  }
  function exitExam(){
    examState.active=false;
    const steps=$('.learning-steps');
    if(steps)steps.style.display='';
    if(lessonBack)lessonBack.onclick=originalLessonBack;
    if(mapButton)mapButton.onclick=originalMapButton;
    if(typeof originalMapButton==='function')originalMapButton();
    else if(typeof window.showMap==='function')window.showMap();
    if(typeof window.renderNav==='function')window.renderNav();
    setTimeout(()=>{appendExamEntries();updateMapCopy()},0);
  }
  function installObservers(){
    const grid=$('#unitGrid'),nav=$('#chapterNav');
    if(grid)new MutationObserver(appendExamEntries).observe(grid,{childList:true});
    if(nav)new MutationObserver(appendExamEntries).observe(nav,{childList:true});
    appendExamEntries();
    updateMapCopy();
  }
  const examStyle=document.createElement('style');
  examStyle.textContent='.exam-card,.exam-nav-item{--unit-color:#d45f78}.exam-card .unit-no,.exam-source{color:var(--unit-color)}.exam-stage .quiz-head{align-items:flex-start}.exam-source{background:#fff0f3;border-radius:999px;padding:8px 12px;font-size:12px;white-space:nowrap}.exam-result strong{color:var(--unit-color);font-size:26px}.exam-card.complete{border-color:var(--unit-color)}.reasoning-feedback .next-question-button{margin-top:10px}';
  document.head.appendChild(examStyle);
  installObservers();
})();
