/* 四至六年级共用课程数据装配器：输入教材核对后的简明单元数据，输出 app.js 所需结构。 */
(function(){
  const colors=['#ff735e','#5b8def','#56b57f','#ee9b3f','#8b72df','#39a8c8','#ef6f91','#6a9f45','#d66db1','#3aa7a3','#df8555'];
  const rotate=(correct,wrong1,wrong2,seed)=>{
    const rows=[[correct,wrong1,wrong2],[wrong1,correct,wrong2],[wrong1,wrong2,correct]];
    const answer=seed%3;
    return {options:rows[answer],answer};
  };
  const makeLife=(raw,seed)=>{
    const [icon,title,story,question,correct,wrong1,wrong2,explain,thinking]=raw;
    const choice=rotate(correct,wrong1,wrong2,seed);
    return {icon,title,story,question,options:choice.options,answer:choice.answer,explain,thinking};
  };
  const makeQuiz=(raw,seed)=>{
    const [question,correct,wrong1,wrong2,explain]=raw;
    const choice=rotate(correct,wrong1,wrong2,seed);
    return [question,choice.options,choice.answer,explain];
  };
  const cleanSentence=value=>String(value??'').trim().replace(/[。！？!?；;：:，,、]+$/,'');
  const makeContextChecks=({label,title,text,equation,result,rule})=>{
    const context=`在“${cleanSentence(label)}”情境中，${cleanSentence(title)}。${cleanSentence(text)}`;
    return [
    [`${context}。解决这个具体问题时，适用的规则是什么？`,rule,'只看数字大小，不读题意','把所有数字直接相加',`先读懂“${cleanSentence(title)}”和“${cleanSentence(text)}”，再依据数量或图形关系选择${rule}。`],
    [`${context}。正确的关键算式或表示是？`,equation,'只抄题目标题，不列式','不使用题目给出的条件',`题目中的条件可以表示为：${equation}。`],
    [`${context}。按${equation}计算或判断后，正确结论是什么？`,result,'只写一个数字，不说明意义','得到与题目条件无关的结果',`根据题目条件和${equation}，可以得到：${result}。`],
    [`${context}。哪种做法能避免把答案算错？`,'先读条件、找关系，再列式或作图检查','看到数字就直接套用同一个公式','只看选项长短来猜答案',`先弄清题目给出的条件，再完成${equation}并检查${result}。`],
    [`${context}。完成计算后怎样检查答案是否合理？`,`把${result}带回题目，检查数量、单位和实际意义`,'不需要检查，算出数字就结束','只检查数字写得是否足够大',`把${result}带回“${cleanSentence(title)}”和“${cleanSentence(text)}”对应的情境中检查。`]
    ];
  };
  window.mathUnit=function(u){
    const [label,title,text,equation,result]=u.example;
    const life=u.life||[
      ['🔎','第一步：找出关系',`${label}里遇到一个问题：${title}。${text}`,`把已知条件和问题连起来，应该怎样列式或表示？`,equation,'把所有数字直接相加','只写一个单位，不列关系',`先读懂“${title}。${text}”，再根据数量或图形关系写出：${equation}。`,[`已知情境：${title}。${text}`,`要求：解决“${title}”`, `列式或表示：${equation}`]],
      ['🧮','第二步：算一算',`${label}中已知${text}，题目要求“${title}”。`,`根据这些条件，哪一项是正确的结果或结论？`,result,'只抄下算式，不完成计算','选择一个与条件无关的结果',`根据${equation}计算或判断，可以得到：${result}`,['找出题目给出的条件',`根据关系处理：${equation}`,`写出完整结论：${result}`]],
      ['✅','第三步：回到生活中检查',`${label}的问题是“${title}”，已知${text}`,`把结果带回原问题，哪一句回答完整而合理？`,result,'只写数字，不回答原问题','忽略单位和实际意义',`回到情境检查：${equation}，所以${result}`,['检查条件有没有用全',`核对过程：${equation}`,`完整回答：${result}`]]
    ];
    const checks=Array.isArray(u.checks)&&u.checks.length?u.checks:makeContextChecks({label,title,text,equation,result,rule:u.rule});
    return {
      ...u,
      life,checks,
      story:{label,title,text,equation,rule:u.rule},
      activity:{title:'选对方法再出发',text:`遇到“${title}”这样的任务，哪种做法更合适？`,model:u.icon,options:[u.rule,'只看最后一个数字就猜','把所有数字直接相加'],answer:0,success:`选对了：${u.rule}`},
      solver:{equation,steps:[['读懂问题',text,'圈出已知条件和要解决的问题。'],['选择方法',equation,`根据关系列式或作图：${u.rule}`],['检查回答',result,'把结果带回情境，检查数值、单位和表达。']]}
    };
  };
  window.buildMathCourse=function(units){
    return units.map((u,index)=>{
      const lives=u.life.map((x,i)=>makeLife(x,index+i));
      const core=u.checks.map((x,i)=>makeQuiz(x,index+i));
      const act=u.activity;
      const makeLifeQuiz=(life,seed)=>makeQuiz([
        `${life.story} ${life.question}`,
        life.options[life.answer],
        life.options[(life.answer+1)%3],
        life.options[(life.answer+2)%3],
        life.explain
      ],seed);
      const makeReasoningQuiz=(life,seed)=>{
        const complete=(life.thinking&&life.thinking[2])||life.explain;
        return makeQuiz([
          `${life.story} ${life.question} 要写出完整答案，下面哪种作答最合适？`,
          complete,
          '只写最后的数字，不说明单位或结论',
          '把题目中的所有数字直接相加',
          `先根据条件找关系，再列式或作图并检查：${life.explain}`
        ],seed);
      };
      const review=[
        makeLifeQuiz(lives[0],index+5),
        makeLifeQuiz(lives[1],index+6),
        makeLifeQuiz(lives[2],index+7),
        makeReasoningQuiz(lives[0],index+8),
        makeReasoningQuiz(lives[1],index+9)
      ];
      return {
        id:u.id,number:u.number,title:u.title,icon:u.icon,subtitle:u.subtitle,color:u.color||colors[index%colors.length],
        lessonTitle:u.lessonTitle||u.story.title,lessonSubtitle:u.lessonSubtitle||u.subtitle,
        story:{...u.story,art:`<div class="campus-art"><div style="font-size:72px">${u.icon}</div><b>${u.story.label}</b><div>${u.story.equation}</div><small>${u.story.text}</small></div>`},
        activity:{type:'choice',title:act.title,text:act.text,model:act.model||u.icon,options:act.options,answer:act.answer,success:act.success},
        solver:{equation:u.solver.equation,steps:u.solver.steps},
        life:lives[0],lifeExamples:lives,quiz:[...core,...review]
      };
    });
  };
})();
