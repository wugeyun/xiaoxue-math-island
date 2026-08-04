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
  const wrongRule='只看数字大小，不看题目关系';
  window.mathUnit=function(u){
    const [label,title,text,equation,result]=u.example;
    const life=u.life||[
      ['🔎','第一步：找出关系',`${label}里遇到一个问题：${title}。${text}`,`把已知条件和问题连起来，应该怎样列式或表示？`,equation,'把所有数字直接相加','只写一个单位，不列关系',`先读懂“${title}。${text}”，再根据数量或图形关系写出：${equation}。`,[`已知情境：${title}。${text}`,`要求：解决“${title}”`, `列式或表示：${equation}`]],
      ['🧮','第二步：算一算',`我们已经得到关键表达：${equation}`,`沿着这个表达继续计算或判断，正确结论是什么？`,result,'停在列式处，不继续完成','换一个与题意无关的结果',`沿着${equation}计算或判断，可以得到：${result}`,['先写出关键关系',`再完成：${equation}`,`得到：${result}`]],
      ['✅','第三步：回到生活中检查',`${label}的问题是“${title}”，已知${text}`,`把结果带回原问题，哪一句回答完整而合理？`,result,'只写数字，不回答原问题','忽略单位和实际意义',`回到情境检查：${equation}，所以${result}`,['检查条件有没有用全',`核对过程：${equation}`,`完整回答：${result}`]]
    ];
    const checks=u.checks||[
      [`“${u.title}”的关键规则是？`,u.rule,'只凭感觉猜','所有数字都相加',u.rule],
      [`“${title}”可以怎样表示？`,equation,'不能表示','只写题目标题',`关键表达是${equation}。`],
      ['这道例题的结论是？',result,'没有答案','答案与条件无关',`结论是：${result}`],
      ['解决新问题时，第一步应该？','读懂条件和问题','马上写答案','忽略单位','先读懂题意。'],
      ['完成后怎样检查？','把结果带回情境并检查单位','不需要检查','只看字写得大不大','回到情境检查最可靠。']
    ];
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
      const review=[
        makeQuiz([`学习“${u.title}”时，首先要做什么？`,'读懂题意并找出数量或图形关系','马上猜答案','只抄算式不思考','先弄清对象和关系，方法才不会选错。'],index+5),
        makeQuiz([`下面哪句话符合“${u.title}”的学习规则？`,u.rule,wrongRule,'所有题都用同一个公式',u.rule],index+6),
        makeQuiz([`例子“${u.story.title}”中的关键表达是？`,u.story.equation,'与题意无关','不能列式',`关键关系可以写成：${u.story.equation}`],index+7),
        makeQuiz([act.text,act.options[act.answer],act.options[(act.answer+1)%3],act.options[(act.answer+2)%3],act.success],index+8),
        makeQuiz([lives[0].question,lives[0].options[lives[0].answer],lives[0].options[(lives[0].answer+1)%3],lives[0].options[(lives[0].answer+2)%3],lives[0].explain],index+9)
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
