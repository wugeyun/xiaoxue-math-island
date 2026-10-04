/* 六年级 v2.0：原创数学图解。数值独立于题目，逐步观看也能读懂。 */
(function () {
  'use strict';
  const C = { ink: '#26324b', coral: '#ef735e', gold: '#f2bb45', blue: '#588ac1', mint: '#52a98b', pale: '#fff4dd' };
  const esc = v => String(v).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const txt = (x, y, text, size = 20, color = C.ink, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}">${esc(text)}</text>`;
  const rect = (x, y, w, h, fill = C.pale, stroke = C.ink) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const line = (x, y, xx, yy, color = C.ink, dashed = false) => `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="2" ${dashed ? 'stroke-dasharray="6 5"' : ''}/>`;
  const circle = (x, y, r, fill = C.pale) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="2"/>`;
  const lerp = (a, b, p) => a + (b - a) * p;
  const bar = (x, y, w, parts, selected, color = C.coral) => Array.from({ length: parts }, (_, n) => rect(x + n * w / parts, y, w / parts - 2, 42, n < selected ? color : '#fff')).join('');
  const grid = () => Array.from({ length: 11 }, (_, n) => line(60 + n * 40, 55, 60 + n * 40, 255, '#dedbd1')).join('') + Array.from({ length: 6 }, (_, n) => line(60, 55 + n * 40, 460, 55 + n * 40, '#dedbd1')).join('');
  const scenes = {};
  function add(key, title, steps, draw) { scenes[key] = { title, steps, draw }; }

  add('circle', '圆：从半径到周长与面积', [
    '圆心到圆上任意一点的距离是半径。这里半径 r＝3 cm。',
    '直径经过圆心，两段半径拼成直径：d＝2r＝6 cm。',
    '绕圆一周的长度是周长：C＝πd＝6π cm。',
    '把圆分成细小扇形再交错拼接，近似长方形：长≈πr，宽≈r，所以 S＝πr²＝9π cm²。'
  ], (s, p) => {
    if (s < 3) return circle(270, 158, 88) + circle(270, 158, 3, C.ink) + line(270, 158, 358, 158, C.coral) + txt(310, 145, 'r＝3 cm', 18, C.coral) + (s > 0 ? line(182, 158, lerp(270, 358, p), 158, C.blue) + txt(270, 276, 'd＝6 cm') : txt(270, 276, '每一条半径都一样长')) + (s === 2 ? `<circle cx="270" cy="158" r="88" fill="none" stroke="${C.coral}" stroke-width="7" stroke-dasharray="${553 * p} 553" transform="rotate(-90 270 158)"/>` + txt(270, 311, 'C＝6π cm', 21, C.coral) : '');
    let wedges = ''; const r = 74;
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, b = (i + 1) * Math.PI / 8;
      const originalX = 270, originalY = 156;
      const endX = 172 + i * r * Math.sin(Math.PI / 16), endY = i % 2 ? 140 + r * Math.cos(Math.PI / 16) : 140;
      const rotation = lerp(0, i % 2 ? 180 - (i + .5) * 22.5 + 90 : -(i + .5) * 22.5 + 90, p);
      wedges += `<path d="M0 0 L${Math.cos(a) * r} ${Math.sin(a) * r} A${r} ${r} 0 0 1 ${Math.cos(b) * r} ${Math.sin(b) * r} Z" fill="${i % 2 ? C.gold : C.coral}" stroke="#fff" transform="translate(${lerp(originalX, endX, p)} ${lerp(originalY, endY, p)}) rotate(${rotation})"/>`;
    }
    return wedges + txt(270, 74, '扇形越来越细，拼出的图形越接近长方形', 17) + txt(270, 265, '长≈πr；宽≈r', 21) + txt(270, 305, 'S＝πr × r＝πr²', 23, C.coral);
  });
  add('fraction-mixed', '分数运算：先看单位“1”', [
    '一条长方形纸带代表单位“1”，平均分成 4 份。',
    '取其中 3 份，表示整条纸带的 3/4。',
    '再取这 3 份的一半：3/4 × 1/2＝3/8。',
    '把整条分成 8 小份，取到的是 3 小份。乘分数就是求一个数的几分之几。'
  ], (s, p) => {
    const base = rect(60, 105, 440, 100, '#fff') + Array.from({ length: 3 }, (_, i) => line(170 + i * 110, 105, 170 + i * 110, 205)).join('');
    return base + (s > 0 ? rect(60, 105, 330 * (s === 1 ? p : 1), 100, '#f6d684') : '') + (s > 1 ? rect(60, 105, 330, 50 * (s === 2 ? p : 1), C.coral) + line(60, 155, 500, 155, C.ink, true) : '') + Array.from({ length: 3 }, (_, i) => line(170 + i * 110, 105, 170 + i * 110, 205)).join('') + txt(280, 70, s > 1 ? '先取 3/4，再取它的一半' : '整条纸带＝单位“1”', 22) + txt(280, 258, s > 1 ? '红色部分＝3/8' : s ? '黄色部分＝3/4' : '每大份＝1/4', 24, C.coral) + txt(280, 306, s > 1 ? '3/4 × 1/2＝3/8' : '分母说明平均分的份数', 20);
  });
  add('view-objects', '观察物体：三个方向看到什么', [
    '这里摆了 4 个小正方体：底层横排 3 个，最左上面再放 1 个。',
    '从正面看：横排 3 格，左边高 2 格，共看到 4 个正方形。',
    '从上面看：只有横排 3 格；叠放的两个小正方体投影重合。',
    '从左面看：是一列高 2 格。视图记录宽和高，重合的面只画一格。'
  ], (s, p) => {
    const cube = (x, y) => `<path d="M${x} ${y} l36 -18 l36 18 l-36 18 Z" fill="#ffd986" stroke="${C.ink}"/><path d="M${x} ${y} l36 18 v48 l-36 -18 Z" fill="#ef997e" stroke="${C.ink}"/><path d="M${x + 36} ${y + 18} l36 -18 v48 l-36 18 Z" fill="#91bbb0" stroke="${C.ink}"/>`;
    const shape = cube(70, 156) + cube(142, 156) + cube(214, 156) + cube(70, 108);
    const cells = s === 1 ? [[0, 0], [0, 1], [1, 1], [2, 1]] : s === 2 ? [[0, 0], [1, 0], [2, 0]] : [[0, 0], [0, 1]];
    return shape + txt(172, 271, '4 个小正方体', 20) + (s ? `<g opacity="${p}">${cells.map(([x, y]) => rect(332 + x * 48, 122 + y * 48, 46, 46, C.blue)).join('')}</g>` + txt(408, 271, ['立体摆法', '正面', '上面', '左面'][s], 22, C.blue) : txt(410, 165, '正面 →', 22));
  });
  add('percent', '百分数：每一百份中的几份', [
    '把整幅方格图看作单位“1”：共有 100 个小格。',
    '涂色 25 格，表示 25/100，也就是 25%。',
    '25/100＝1/4＝0.25＝25%。四种写法表示同样的大小。',
    '百分数通常表达两个数量的关系。25% 表示每 100 份中占 25 份。'
  ], (s, p) => {
    const count = s ? s === 1 ? Math.floor(25 * p) : 25 : 0;
    return Array.from({ length: 100 }, (_, i) => rect(125 + i % 10 * 25, 45 + Math.floor(i / 10) * 23, 22, 20, i < count ? C.coral : '#fff')).join('') + txt(420, 125, s ? '25 格' : '100 格', 25, C.coral) + txt(420, 166, s ? '25%' : '单位“1”', 25) + txt(280, 317, s > 1 ? '1/4＝0.25＝25%' : '每一格占总数的 1%', 22);
  });
  add('ratio', '比：看清对应的两种数量', [
    '调一杯果汁：用 2 份原汁、3 份水，原汁与水的比是 2∶3。',
    '同时加倍：4 份原汁、6 份水，4∶6＝2∶3，浓淡不变。',
    '原汁与水是 2∶3；原汁与混合饮料总量是 2∶5。注意比较对象。',
    '总共 10 杯按 2∶3 分配：一份是 10÷5＝2 杯，原汁 4 杯、水 6 杯。'
  ], (s, p) => {
    const n = s === 1 ? lerp(1, 2, p) : s === 3 ? 2 : 1;
    const cups = (x, y, count, color) => Array.from({ length: count }, (_, i) => `<path d="M${x + i * 53} ${y} h36 l-5 55 h-26 Z" fill="${color}" stroke="${C.ink}" stroke-width="2"/>`).join('');
    return cups(70, 100, 2, C.coral) + cups(290, 100, 3, C.blue) + (s === 1 || s === 3 ? `<g opacity="${n - 1}">${cups(70, 178, 2, C.coral) + cups(290, 178, 3, C.blue)}</g>` : '') + txt(123, 78, s === 3 ? '原汁 4 杯' : '原汁 2 份', 21, C.coral) + txt(360, 78, s === 3 ? '水 6 杯' : '水 3 份', 21, C.blue) + txt(280, 285, s === 2 ? '原汁∶水＝2∶3；原汁∶总量＝2∶5' : s === 3 ? '10÷(2＋3)＝2；2×2＝4，3×2＝6' : s === 1 ? '4∶6＝2∶3' : '原汁∶水＝2∶3', 20);
  });
  add('average', '数据整理：看懂平均数与分布', [
    '四名同学一次跳绳的成绩是 60、80、80、100 次。',
    '用条形图比较：最高 100 次，最低 60 次，相差 40 次。',
    '把最高成绩中多出的 20 次匀给最低的同学，四条柱都成为 80 次。',
    '平均数＝(60＋80＋80＋100)÷4＝80 次，它反映这一组成绩的总体水平。'
  ], (s, p) => {
    const heights = [60, 80, 80, 100].map(v => s >= 2 ? lerp(v, 80, s === 2 ? p : 1) : v);
    return line(80, 250, 480, 250) + heights.map((v, i) => rect(105 + i * 100, 250 - v * 1.65, 55, v * 1.65, [C.coral, C.gold, C.blue, C.mint][i]) + txt(132 + i * 100, 235 - v * 1.65, `${Math.round(v)}次`, 19) + txt(132 + i * 100, 281, ['小明', '小兰', '小刚', '小丽'][i], 19)).join('') + (s >= 2 ? line(80, 118, 480, 118, C.coral, true) : '') + txt(280, 324, s >= 2 ? '平均数：80 次' : '每根柱子的高度表示跳绳次数', 21, C.coral);
  });
  add('percent-app', '百分数应用：先找到单位“1”', [
    '一件衣服原价 200 元，把原价看作单位“1”，对应 100%。',
    '打八折就是按原价的 80% 付钱，图中 8 份代表现价。',
    '现价＝200×80%＝160 元；每一小份是 200÷10＝20 元。',
    '省下的 2 份占原价 20%：200−160＝40 元。降低了 20%，不是 80%。'
  ], (s, p) => bar(60, 126, 440, 10, 0) + (s ? `<rect x="60" y="126" width="${352 * (s === 1 ? p : 1)}" height="42" rx="5" fill="${C.coral}" opacity=".8"/>` : '') + txt(280, 75, '原价 200 元＝100%', 24) + txt(236, 210, s ? '现价 160 元＝80%' : '十份中的每份：20 元', 22, C.coral) + (s >= 3 ? txt(450, 247, '省 40 元', 19, C.blue) : '') + txt(280, 309, s >= 2 ? '200×80%＝160（元）' : '原价是计算现价的基准', 22));
  add('cylinder', '圆柱与圆锥：展开、测量、比较', [
    '圆柱底面半径 r＝2 cm，高 h＝6 cm；侧面沿高剪开。',
    '展开的侧面是长方形：长为底面周长 4π cm，宽为高 6 cm。侧面积是 24π cm²。',
    '换成同样底面、同样高的空圆柱和圆锥。倒满圆锥第 1 次，圆柱装到 1/3。',
    '再倒满圆锥第 2 次，圆柱装到 2/3。每次增加的是相同的一份。',
    '连续倒满圆锥 3 次，圆柱恰好装满：V圆柱＝24π cm³，V圆锥＝8π cm³。'
  ], (s, p) => {
    const cy = (x, amount) => rect(x, 100, 110, 138, '#fff') + `<rect x="${x + 2}" y="${238 - amount * 134}" width="106" height="${amount * 134}" fill="${C.blue}" opacity=".6"/><ellipse cx="${x + 55}" cy="100" rx="55" ry="18" fill="#fff4dd" stroke="${C.ink}" stroke-width="2"/><ellipse cx="${x + 55}" cy="238" rx="55" ry="18" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
    if (s < 2) return cy(55, 0) + txt(110, 278, 'r＝2 cm；h＝6 cm', 17) + (s ? `<g opacity="${p}">${rect(240, 100, 255, 138, '#f5ce76') + txt(365, 84, '长＝4π cm', 19) + txt(369, 178, '侧面积＝24π cm²', 20) + txt(365, 271, '宽＝6 cm', 19)}</g>` : txt(365, 177, '沿高剪开 →', 24, C.coral));
    const amount = (s - 2 + p) / 3;
    return `<path d="M110 92 L55 238 H165 Z" fill="#f5ce76" stroke="${C.ink}" stroke-width="2"/><ellipse cx="110" cy="238" rx="55" ry="18" fill="#f5ce76" stroke="${C.ink}" stroke-width="2"/>` + txt(110, 286, '等底等高的圆锥', 19) + cy(350, amount) + txt(405, 286, '圆柱', 20) + txt(265, 164, '倒入 →', 21, C.coral) + txt(405, 69, `${s - 1} 次`, 23, C.blue) + txt(280, 327, 'V圆锥＝1/3 × 底面积 × 高', 21);
  });
  add('proportion', '比例与比例尺：形状按同一倍数变化', [
    '一块长方形长 4 cm、宽 2 cm，长与宽的比为 2∶1。',
    '长和宽都扩大到 2 倍：长 8 cm、宽 4 cm，8∶4＝4∶2。',
    '对应长度都乘同一个数，形状不变；面积扩大到 2²＝4 倍。',
    '地图比例尺 1∶1000：图上 4 cm 表示实际 4000 cm，也就是 40 m。'
  ], (s, p) => {
    if (s === 3) return rect(100, 108, 340, 115, '#d8eadf') + line(120, 166, lerp(120, 420, p), 166, C.coral) + txt(270, 83, '比例尺 1∶1000', 23) + txt(270, 154, '图上 4 cm → 实际 40 m', 22) + txt(270, 282, '4×1000＝4000 cm＝40 m', 22, C.coral);
    const k = s ? lerp(1, 2, s === 1 ? p : 1) : 1;
    return rect(130, 98, 145 * k, 70 * k, '#f5ce76') + txt(130 + 72.5 * k, 80, `${s ? '8' : '4'} cm`, 23) + txt(140 + 145 * k, 115 + 35 * k, `${s ? '4' : '2'} cm`, 20, C.coral) + txt(280, 293, s >= 2 ? '长×2，宽×2，面积×4' : '对应的长度按同一倍数变化', 22);
  });
  add('motion', '图形运动：平移、旋转与轴对称', [
    '每个小方格边长为 1 格。先看左侧的直角三角形。',
    '向右平移 3 格：每个顶点都向右移动 3 格，形状与大小不变。',
    '围绕点 O 顺时针旋转 90°：O 不动，另外两个顶点绕 O 转动。',
    '沿竖直虚线折叠：左右三角形完全重合，对应点到对称轴距离相等。'
  ], (s, p) => {
    let shape = `<path d="M100 215 V135 H180 Z" fill="${C.coral}" opacity=".75" stroke="${C.ink}" stroke-width="2"/>`;
    if (s === 1) shape += `<path d="M100 215 V135 H180 Z" fill="${C.blue}" opacity=".7" stroke="${C.ink}" stroke-width="2" transform="translate(${120 * p} 0)"/>`;
    if (s === 2) shape = `<path d="M180 175 V95 H260 Z" fill="${C.coral}" opacity=".3" stroke="${C.ink}"/><path d="M180 175 V95 H260 Z" fill="${C.blue}" opacity=".8" stroke="${C.ink}" stroke-width="2" transform="rotate(${90 * p} 180 175)"/>` + circle(180, 175, 4, C.ink) + txt(168, 202, 'O', 17);
    if (s === 3) shape += line(280, 55, 280, 255, C.blue, true) + `<path d="M${lerp(100, 460, p)} 215 V135 H${lerp(180, 380, p)} Z" fill="${C.blue}" opacity=".65" stroke="${C.ink}" stroke-width="2"/>` + txt(280, 40, '对称轴', 18);
    return grid() + shape + txt(280, 304, ['先找对应的顶点', '向右移动 3 格', '顺时针旋转 90°', '沿轴折叠，左右重合'][s], 23);
  });
  add('variation', '正比例与反比例：两种不同的关系', [
    '每本练习本 3 元。买 1、2、3 本，总价分别是 3、6、9 元。',
    '总价÷本数始终是 3 元/本，商一定：总价与本数成正比例。',
    '全程 120 km。速度是 30、60、120 km/h，时间分别是 4、2、1 h。',
    '速度×时间始终是 120 km，积一定：速度与时间成反比例。'
  ], (s, p) => {
    const inverse = s > 1, labels = inverse ? ['30', '60', '120'] : ['1', '2', '3'];
    const values = inverse ? [4, 2, 1] : [3, 6, 9];
    return txt(280, 54, inverse ? '路程一定：120 km' : '单价一定：3 元/本', 24) + line(100, 247, 465, 247) + values.map((v, i) => rect(132 + i * 113, 247 - v * (inverse ? 38 : 17) * (s % 2 ? 1 : p), 56, v * (inverse ? 38 : 17) * (s % 2 ? 1 : p), inverse ? C.blue : C.coral) + txt(160 + i * 113, 234 - v * (inverse ? 38 : 17), `${v}${inverse ? 'h' : '元'}`, 20) + txt(160 + i * 113, 278, labels[i] + (inverse ? 'km/h' : '本'), 18)).join('') + txt(280, 322, inverse ? '速度×时间＝120（一定）' : '总价÷数量＝3（一定）', 22, inverse ? C.blue : C.coral);
  });
  add('math-fun', '数学好玩：搭配与有序枚举', [
    '有 2 件上衣和 3 条裤子，每套衣服各选一件上衣、一条裤子。',
    '先固定第 1 件上衣，它可以分别搭配 3 条裤子，共 3 套。',
    '再固定第 2 件上衣，也有 3 套；按顺序记录，不重复也不遗漏。',
    '共有 2×3＝6 种搭配。树状图帮助我们有顺序地数完所有情况。'
  ], (s, p) => {
    let picture = ''; [0, 1].forEach(i => { const y = 108 + i * 118; picture += rect(70, y, 92, 40, i ? '#f5ce76' : '#f3a08c') + txt(116, y + 27, `上衣 ${i + 1}`, 18); for (let j = 0; j < 3; j++) { const yy = y - 20 + j * 43, active = s > i; picture += line(162, y + 20, lerp(162, 330, active ? p : 0), lerp(y + 20, yy + 15, active ? p : 0), C.blue) + rect(330, yy, 110, 33, '#d8eadf') + txt(385, yy + 23, `裤子 ${j + 1}`, 17); }}); return picture + txt(280, 324, s === 3 ? '3＋3＝2×3＝6（种）' : '固定一项，再依次搭配另一项', 21);
  });
  add('down-fun', '校园平面图：用比例尺安排位置', [
    '画校园平面图，比例尺取 1∶1000，图上 1 cm 表示实际 10 m。',
    '教学楼实际长 40 m、宽 20 m，图上画长 4 cm、宽 2 cm 的长方形。',
    '操场长 60 m、宽 30 m，图上画长 6 cm、宽 3 cm 的长方形。',
    '平面图还要标明方向和比例尺。右上角箭头朝北，图中长度都按同一比例缩小。'
  ], (s, p) => rect(45, 65, 470, 218, '#f3eddd') + line(474, 106, 474, 77, C.ink) + `<path d="M469 83 L474 73 L479 83" fill="none" stroke="${C.ink}" stroke-width="2"/>` + txt(474, 62, '北', 19) + (s ? `<g opacity="${s === 1 ? p : 1}">${rect(80, 114, 120, 60, '#efaa90') + txt(140, 141, '教学楼', 18) + txt(140, 162, '4 cm×2 cm', 15)}</g>` : '') + (s >= 2 ? `<g opacity="${s === 2 ? p : 1}">${rect(250, 135, 180, 90, '#a6cdb8') + txt(340, 173, '操场', 21) + txt(340, 205, '6 cm×3 cm', 17)}</g>` : '') + txt(280, 319, '比例尺 1∶1000；图上 1 cm ↔ 实际 10 m', 19));
  add('fraction-division', '分数除法：数一数能分成几份', [
    '有 3/4 米长的彩带，每段长 1/8 米。想一想能剪成几段。',
    '把 1 米平均分成 8 份，3/4 米就是其中的 6 份。',
    '每段是 1/8 米，一份就是一段，能剪成 6 段。',
    '3/4 ÷ 1/8＝3/4 × 8＝6（段）。除以一个非零分数，等于乘它的倒数。'
  ], (s, p) => {
    let pic = txt(280, 64, '彩带总长：3/4 m；每段：1/8 m', 22) + bar(60, 120, 440, 8, 0);
    pic += `<rect x="60" y="120" width="330" height="42" fill="${C.gold}" opacity=".7"/>`;
    if (s > 0) pic += Array.from({ length: 9 }, (_, i) => line(60 + i * 55, 113, 60 + i * 55, 177, C.ink)).join('');
    if (s > 1) pic += Array.from({ length: 6 }, (_, i) => `<g opacity="${s === 2 ? Math.max(0, Math.min(1, p * 6 - i)) : 1}">${rect(63 + i * 55, 207, 49, 35, C.coral) + txt(87 + i * 55, 231, String(i + 1), 18, '#fff')}</g>`).join('');
    return pic + txt(280, 288, s > 1 ? '6 段，每段 1/8 m' : '在同一单位长度上数份数', 22, C.coral) + txt(280, 328, s === 3 ? '3/4 ÷ 1/8＝6' : '整条刻度：1 m', 20);
  });
  add('letters', '用字母表示数：写出变化的数量关系', [
    '用小棒摆连在一起的正方形。第 1 个正方形用 4 根。',
    '每增加 1 个正方形，共用一条边，只增加 3 根小棒。',
    '摆 3 个连在一起的正方形，需要 3×3＋1＝10 根小棒。',
    '摆 n 个需要 3n＋1 根；n 表示正方形的个数。把 n＝3 代入得到 10 根。'
  ], (s, p) => {
    const count = s === 0 ? 1 : s === 1 ? 2 : 3;
    let pic = txt(280, 65, '共用一条边，新增一个只加 3 根', 21);
    for (let i = 0; i < count; i++) {
      pic += `<g opacity="${i === count - 1 && s === 1 ? p : 1}">${line(100 + i * 110, 118, 210 + i * 110, 118, C.coral) + line(100 + i * 110, 228, 210 + i * 110, 228, C.coral) + line(210 + i * 110, 118, 210 + i * 110, 228, C.coral)}</g>`;
    }
    pic += line(100, 118, 100, 228, C.blue);
    return pic + txt(280, 280, ['1×3＋1＝4', '2×3＋1＝7', '3×3＋1＝10', 'n×3＋1＝3n＋1'][s], 26, C.coral) + txt(280, 326, '蓝色固定 1 根；每个方形增加 3 根红色小棒', 18);
  });
  add('water-plan', '节约用水：调查、比较、制定计划', [
    '某班调查洗手用水：原来每人每天平均用 5 L，节水后用 3 L。',
    '每人每天少用 5−3＝2 L。先比较同一时间范围、同一单位的数据。',
    '全班 30 人，一天预计节水 2×30＝60 L。',
    '按 5 个上课日计算，一周预计节水 60×5＝300 L；实际效果还要继续调查记录。'
  ], (s, p) => line(85, 260, 480, 260) + rect(140, 90, 90, 170, C.blue) + rect(330, 260 - 102 * (s === 1 ? p : 1), 90, 102 * (s === 1 ? p : 1), C.mint) + txt(185, 76, '5 L', 25, C.blue) + txt(375, 145, '3 L', 25, C.mint) + txt(185, 289, '原来 / 人·天', 18) + txt(375, 289, '节水后 / 人·天', 18) + txt(280, 327, s === 3 ? '30 人 × 5 天：预计节水 300 L' : s === 2 ? '30 人一天：预计节水 60 L' : '每人每天少用 2 L', 21, C.coral));
  add('fraction-app', '分数应用：线段图找对应关系', [
    '一根绳长 24 m，把全长看作单位“1”。剪去全长的 1/3。',
    '全长平均分成 3 份，每份长 24÷3＝8 m，剪去其中 1 份。',
    '剩下 2 份，占全长的 2/3：24×2/3＝16 m。',
    '剪去的 8 m 加剩下的 16 m 恰好是 24 m。已知部分与对应分率，可求单位“1”。'
  ], (s, p) => txt(280, 78, '绳子全长 24 m＝单位“1”', 24) + bar(60, 129, 440, 3, 3, C.gold) + (s ? `<rect x="60" y="129" width="${146 * (s === 1 ? p : 1)}" height="42" fill="${C.coral}"/>` : '') + txt(131, 219, s ? '剪去：8 m' : '每份 1/3', 20, C.coral) + txt(350, 219, s >= 2 ? '剩下：16 m＝全长的 2/3' : '三等份，先找每份长', 18) + txt(280, 293, s === 3 ? '8＋16＝24（m）' : s === 2 ? '24×(1−1/3)＝16（m）' : '24÷3＝8（m）', 25));
  add('location', '确定位置：方向、角度和距离', [
    '以学校为观测点 O。地图上方是北，右方是东。',
    '从正东方向向北转 30°，得到“东偏北 30°”的方向。',
    '公园在这个方向上，离学校 600 m。方向和距离一起确定位置。',
    '从公园返回学校，方向是西偏南 30°，距离仍是 600 m。观测点变化，方向也变化。'
  ], (s, p) => {
    const ox = 140, oy = 236, ex = 417, ey = 76;
    return line(ox, 45, ox, 300, '#b4b9c0') + line(60, oy, 490, oy, '#b4b9c0') + txt(ox, 30, '北', 20) + txt(503, 243, '东', 20) + circle(ox, oy, 5, C.ink) + txt(ox - 20, oy + 33, '学校 O', 18) + (s ? line(ox, oy, lerp(ox, ex, p), lerp(oy, ey, p), C.coral) + `<path d="M200 236 A60 60 0 0 0 192 206" fill="none" stroke="${C.blue}" stroke-width="2"/>` + txt(220, 220, '30°', 18, C.blue) : '') + (s >= 2 ? circle(ex, ey, 8, C.mint) + txt(ex, ey - 18, '公园', 20, C.mint) + txt(295, 134, '600 m', 23, C.coral) : '') + txt(280, 330, s === 3 ? '返回：西偏南 30°，600 m' : s > 0 ? '从东向北转 30°' : '先确定观测点与基本方向', 22);
  });
  add('gomoku', '五子棋：一条直线上的五个点', [
    '棋子放在棋盘的交点上。横、竖或斜着连成五子就形成五连。',
    '这条斜线已放好 4 颗棋子，位置每次向右 1 格、向上 1 格。',
    '在相同方向的下一个交点放第 5 颗，五颗棋子就落在同一直线上。',
    '检查三个条件：同一种棋子、连续没有空位、位于同一直线；弯曲的五颗不能算五连。'
  ], (s, p) => {
    let pic = grid(); const count = s === 0 ? 1 : s === 1 ? 4 : 5;
    for (let i = 0; i < count; i++) pic += `<g opacity="${i === 4 && s === 2 ? p : 1}">${circle(100 + i * 40, 255 - i * 40, 13, C.ink)}</g>`;
    if (s >= 2) pic += line(100, 255, 260, 95, C.coral);
    return pic + txt(280, 307, s >= 2 ? '5 颗同色棋子：连续、同一直线' : '每次向右 1 格、向上 1 格', 23);
  });
  add('nutrition-plan', '营养午餐：用数据比较与搭配', [
    '一份示例午餐含主食 200 g、蔬菜 150 g、肉类 100 g，共 450 g。',
    '按 50 g 为一份，主食、蔬菜、肉类分别是 4、3、2 份，质量比为 4∶3∶2。',
    '蔬菜占总质量 150÷450＝1/3，约 33.3%。注意百分比是质量比例。',
    '搭配时还要比较食物的营养成分，并结合实际需求。这组示例质量比并不是通用营养标准。'
  ], (s, p) => {
    const widths = [200, 150, 100], colors = [C.gold, C.mint, C.coral];
    let x = 55, pic = txt(280, 74, '示例午餐：总质量 450 g', 23);
    widths.forEach((w, i) => { pic += rect(x, 133, w - 2, 64, colors[i]) + txt(x + w / 2, 171, ['主食', '蔬菜', '肉类'][i], 20) + txt(x + w / 2, 228, `${w} g`, 19); x += w; });
    if (s === 1) pic += Array.from({ length: 10 }, (_, i) => line(55 + i * 50, 125, 55 + i * 50, 206, C.ink)).join('');
    if (s > 1) pic += `<rect x="253" y="128" width="152" height="74" rx="6" fill="none" stroke="${C.ink}" stroke-width="${2 + 2 * p}"/>`;
    return pic + txt(280, 297, s >= 2 ? '蔬菜：150÷450＝1/3≈33.3%' : '质量比：200∶150∶100＝4∶3∶2', 21) + txt(280, 329, '示例数据，用于练习比较和计算', 16, '#697185');
  });
  const pieSlice = (cx, cy, r, start, end, color) => {
    const point = a => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
    const a = point(start), b = point(end);
    return `<path d="M${cx} ${cy} L${a[0]} ${a[1]} A${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${b[0]} ${b[1]} Z" fill="${color}" stroke="#fff" stroke-width="2"/>`;
  };
  add('data-processing', '数据表示与分析：分段、条形与扇形', [
    '调查 100 名同学每天阅读时长：不足 15 分钟的 20 人，15 至不足 30 分钟的 50 人，30 至不足 45 分钟的 30 人。',
    '先按时长分段整理，三段人数分别是 20、50、30。分段的边界不能重叠。',
    '条形图能比较各段人数；15 至不足 30 分钟这一段人数最多，是 50 人。',
    '扇形统计图展示每段占总体的百分比：20%、50%、30%，合起来是 100%。'
  ], (s, p) => {
    if (s === 3) return pieSlice(200, 162, 102, -90, -18, C.gold) + pieSlice(200, 162, 102, -18, 162, C.coral) + pieSlice(200, 162, 102, 162, 270, C.blue) + txt(207, 101, '20%', 20) + txt(240, 196, '50%', 24) + txt(139, 158, '30%', 22) + txt(422, 116, '不足15分：20%', 18) + txt(422, 160, '15—不足30分：50%', 16) + txt(422, 203, '30—不足45分：30%', 16) + txt(280, 318, '部分占整体：20%＋50%＋30%＝100%', 21);
    return txt(280, 42, '100 人每日阅读时长调查', 22) + line(55, 246, 500, 246) + [20, 50, 30].map((v, i) => rect(100 + i * 140, 246 - v * 3 * (s === 2 ? p : 1), 74, v * 3 * (s === 2 ? p : 1), [C.gold, C.coral, C.blue][i]) + txt(137 + i * 140, 230 - v * 3, `${v} 人`, 21) + txt(137 + i * 140, 277, ['不足15分', '15—不足30分', '30—不足45分'][i], 16)).join('') + txt(280, 324, '分段整理：每名同学只能计入其中一段', 19);
  });
  add('projection', '有趣的投影：方向不同，轮廓也不同', [
    '先看圆柱与圆锥。它们的底面都呈圆形。',
    '从正上方观察：圆柱、圆锥的轮廓都是圆。',
    '从正面观察：圆柱轮廓为长方形，圆锥轮廓为三角形。',
    '同一个圆形轮廓可能来自不同立体。要结合多个方向的投影，才能判断物体。'
  ], (s, p) => {
    let pic = rect(65, 106, 100, 111, '#efb398') + `<ellipse cx="115" cy="106" rx="50" ry="17" fill="#f5d48b" stroke="${C.ink}"/><ellipse cx="115" cy="217" rx="50" ry="17" fill="none" stroke="${C.ink}"/><path d="M250 85 L200 217 H300 Z" fill="#94c5b0" stroke="${C.ink}"/><ellipse cx="250" cy="217" rx="50" ry="17" fill="#b6d7c7" stroke="${C.ink}"/>` + txt(115, 265, '圆柱', 20) + txt(250, 265, '圆锥', 20);
    if (s === 1) pic += `<g opacity="${p}">${circle(402, 115, 42, '#efb398') + circle(402, 224, 42, '#94c5b0')}</g>` + txt(402, 54, '从上方看', 20);
    if (s >= 2) pic += `<g opacity="${s === 2 ? p : 1}">${rect(356, 76, 92, 76, '#efb398')}<path d="M402 185 L356 261 H448 Z" fill="#94c5b0" stroke="${C.ink}"/></g>` + txt(402, 54, '从正面看', 20);
    return pic + txt(280, 329, '结合多个方向的轮廓来判断', 22);
  });
  add('building', '搭积木：看见的格数与真实块数', [
    '正面视图是一列 2 格：只说明这个方向看到 2 层。',
    '用 2 个小正方体上下叠放，可以得到这一正面视图。',
    '在这一列后面再叠放一列，也能看到同样的正面视图，但已用了 4 块。',
    '只给一个方向的视图，通常不能唯一确定块数。还需要上面、侧面等条件限制最少和最多。'
  ], (s, p) => {
    let pic = rect(70, 101, 65, 65, C.coral) + rect(70, 168, 65, 65, C.coral) + txt(102, 280, '正面：2 格', 20);
    if (s) pic += rect(245, 100, 65, 65, C.gold) + rect(245, 167, 65, 65, C.gold) + txt(278, 280, '2 块', 20);
    if (s >= 2) pic += `<g opacity="${s === 2 ? p : 1}">${rect(392, 71, 65, 65, '#b7d8c5') + rect(392, 138, 65, 65, '#b7d8c5') + rect(366, 101, 65, 65, C.blue) + rect(366, 168, 65, 65, C.blue)}</g>` + txt(411, 280, '前后共 4 块', 20);
    return pic + txt(280, 326, '前面的积木会遮住后面的积木', 22);
  });
  add('grouped-data', '复式统计图：同一标准比较两组', [
    '调查 100 人喜欢的运动。男生：篮球 20 人、足球 30 人；女生：篮球 30 人、足球 20 人。',
    '给两组数据用不同颜色，男生为蓝色，女生为珊瑚色。',
    '篮球女生比男生多 10 人；足球男生比女生多 10 人。比较时要看同一项目。',
    '两个项目总人数都是 50 人，但组内分布不同。复式统计图能同时比较项目和组别。'
  ], (s, p) => {
    const bars = [[20, 30], [30, 20]]; let pic = line(65, 255, 500, 255) + txt(207, 284, '篮球', 21) + txt(398, 284, '足球', 21);
    bars.forEach((pair, i) => pair.forEach((v, j) => { const x = 147 + i * 190 + j * 63, k = s === 1 ? p : 1; pic += rect(x, 255 - v * 4 * k, 51, v * 4 * k, j ? C.coral : C.blue) + txt(x + 25, 240 - v * 4, `${v} 人`, 20); }));
    return pic + rect(154, 36, 17, 17, C.blue) + txt(202, 51, '男生', 18) + rect(301, 36, 17, 17, C.coral) + txt(349, 51, '女生', 18) + txt(280, 327, '先看图例，再比较同一项目', 22);
  });
  add('interest', '储蓄：本金、利率与利息', [
    '假设本金 1000 元，年利率 2%，存 1 年。这里用示例利率练习计算。',
    '一年利息＝本金×年利率×存期＝1000×2%×1＝20 元。',
    '到期本息合计＝1000＋20＝1020 元。利息与本金要分清。',
    '在单利且利率不变的示例条件下，存 2 年利息是 40 元。实际储蓄应按具体产品的计息规则计算。'
  ], (s, p) => rect(75, 121, 310, 78, C.gold) + txt(230, 155, '本金', 23) + txt(230, 183, '1000 元', 23) + (s ? `<g opacity="${s === 1 ? p : 1}">${rect(395, 121, 90, 78, C.coral) + txt(440, 154, '利息', 20, '#fff') + txt(440, 183, s === 3 ? '40 元' : '20 元', 21, '#fff')}</g>` : '') + txt(280, 75, '示例年利率：2%', 24) + txt(280, 264, s === 3 ? '1000×2%×2＝40（元）' : '1000×2%×1＝20（元）', 25) + txt(280, 321, s === 2 ? '1 年后：本息共 1020 元' : '示意块用于区分本金和利息，不按金额比例绘制', 17));
  function mobiusBand(cx, cy, radius = 62, width = 17) {
    const points = (u, v) => {
      const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      return [cx + x, cy + y * .52 + z];
    };
    let surface = '';
    for (let i = 0; i < 64; i++) {
      const a = i * Math.PI / 32, b = (i + 1) * Math.PI / 32;
      const corners = [points(a, -width), points(a, width), points(b, width), points(b, -width)];
      surface += `<polygon points="${corners.map(q => q.join(',')).join(' ')}" fill="#efaa90" stroke="#da907b" stroke-width=".5"/>`;
    }
    return surface;
  }
  const paperRing = (cx, cy, rx = 62, ry = 26) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.blue}" stroke-width="17"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="4 4"/>`;
  add('mobius', '神奇的莫比乌斯带：观察纸环的面', [
    '普通纸环：纸条不扭转，首尾粘接。莫比乌斯带：纸条的一端扭半圈，再首尾粘接。',
    '普通纸环有内外两个面。不跨过边缘涂色，不能从内面涂到外面。',
    '莫比乌斯带只有一个连续的面。从一点开始，不跨边缘一直涂，可以涂遍整个面。',
    '沿纸条中线剪一圈：普通纸环变成两个纸环；半扭转莫比乌斯带仍是一条更长的纸环。请用纸条实验验证。'
  ], (s, p) => {
    let pic = txt(140, 59, '普通纸环', 22, C.blue) + txt(415, 59, '半扭转莫比乌斯带', 21, C.coral);
    if (s === 3) return pic + paperRing(137, 119, 57, 21) + paperRing(137, 205, 57, 21) + paperRing(410, 163, 88, 33) + txt(140, 267, '剪成两个环', 21, C.blue) + txt(411, 267, '仍是一个长环', 21, C.coral) + txt(280, 324, '结果示意：不按剪开后的扭转细节绘制', 17);
    pic += paperRing(139, 162) + mobiusBand(412, 162);
    if (s === 1) pic += `<ellipse cx="139" cy="162" rx="62" ry="26" fill="none" stroke="${C.gold}" stroke-width="5" stroke-dasharray="${280 * p} 350"/>`;
    if (s === 2) pic += `<ellipse cx="412" cy="162" rx="62" ry="32" fill="none" stroke="${C.gold}" stroke-width="5" stroke-dasharray="${340 * p} 400"/>`;
    return pic + txt(140, 259, s >= 1 ? '内外两个面' : '不扭转后粘合', 20) + txt(413, 259, s >= 2 ? '一个连续的面' : '扭半圈后粘合', 20) + txt(280, 323, '涂色实验：不跨过纸条边缘', 22);
  });
  add('cat-stretch', '可爱的小猫：改变数对来变形', [
    '用数对确定小猫轮廓。示例顶点 C＝(6，2)：第一个数表示横向位置，第二个数表示纵向位置。',
    '每个顶点的第一个数乘 2，第二个数不变：C变成(12，2)。小猫横向拉宽，形状发生变化。',
    '每个顶点的第一个数不变，第二个数乘 2：C变成(6，4)。小猫纵向拉高，形状也发生变化。',
    '每个顶点的两个数都乘 2：C变成(12，4)。长和宽同时扩大为原来的 2 倍，形状保持不变。'
  ], (s, p) => {
    const original = [[2,0],[4,0],[6,2],[6,6],[5,8],[4,6],[2,6],[1,8],[0,6],[0,2]];
    const kx = s === 1 || s === 3 ? lerp(1, 2, p) : 1;
    const ky = s === 2 || s === 3 ? lerp(1, 2, p) : 1;
    const path = (ox, oy, a, b) => `<path d="${original.map(([x,y],i)=>`${i?'L':'M'}${ox+x*12*a} ${oy-y*12*b}`).join(' ')} Z" fill="#f6c574" stroke="${C.ink}" stroke-width="2"/>`;
    let pic = path(89, 270, 1, 1) + path(313, 270, kx, ky) + txt(125, 308, '原小猫', 21) + txt(388, 308, ['原数对', '只把横向乘2', '只把纵向乘2', '两项都乘2'][s], 21);
    pic += line(75, 270, 201, 270, '#bbb') + line(89, 279, 89, 151, '#bbb') + line(300, 270, 496, 270, '#bbb') + line(313, 279, 313, 53, '#bbb');
    pic += circle(161, 246, 4, C.coral) + txt(182, 244, 'C(6,2)', 14, C.coral);
    pic += circle(313 + 72*kx, 270 - 24*ky, 4, C.coral) + txt(313 + 72*kx, 293 - 24*ky, ['C(6,2)','C(12,2)','C(6,4)','C(12,4)'][s], 14, C.coral);
    return pic + txt(280, 32, '每一个对应顶点都按同一规则改变', 21);
  });
  const reviewSteps = ['先辨认单位“1”或不变的量，再选择数量关系。', '图形题先标出已知的长度、角度和单位。', '用图、式、文字互相检验，说明每一步为什么这样做。', '检查结果的单位和实际意义；估算也能帮助发现错误。'];
  function reviewDraw(s, p) {
    return rect(55, 56, 210, 103, '#fff3d5') + circle(160, 107, 35, '#f4b49b') + line(160, 107, 195, 107, C.ink) + txt(164, 145, 'r', 17) + rect(294, 56, 210, 103, '#e2ede9') + txt(400, 112, '单价 × 数量', 21) + rect(55, 185, 210, 102, '#fce4de') + bar(76, 213, 166, 4, 3) + txt(160, 278, '单位“1”与部分', 17) + rect(294, 185, 210, 102, '#e5ebf4') + txt(400, 236, '图 → 式 → 检查', 21) + `<rect x="${s % 2 ? 290 : 51}" y="${s < 2 ? 52 : 181}" width="218" height="111" rx="9" fill="none" stroke="${C.coral}" stroke-width="${2 + 3 * p}"/>` + txt(280, 327, ['先找基准', '标清条件', '说明思路', '检查答案'][s], 21, C.coral);
  }
  ['review-one', 'final-review', 'down-review', 'down-final'].forEach(k => add(k, '复习路线：图、式、文字连起来', reviewSteps, reviewDraw));

  // 同一知识图用于图册时，显示完整的最后一步。
  const aliases = { 'circle-area': 'circle', 'circle-circumference': 'circle', 'fraction': 'fraction-mixed', 'fraction-multiplication': 'fraction-mixed', 'fraction-division': 'fraction-mixed', 'cylinder-cone': 'cylinder', 'scale': 'proportion', 'symmetry': 'motion', 'positive-negative-proportion': 'variation', 'percent-two': 'percent-app', 'statistics': 'data-processing', 'review': 'final-review' };
  const resolve = key => scenes[key] || scenes[aliases[key]];
  function svg(scene, step, phase = 1) { return `<svg class="g6-diagram" viewBox="0 0 560 350" role="img" aria-label="${esc(scene.title)}：${esc(scene.steps[step])}" xmlns="http://www.w3.org/2000/svg"><title>${esc(scene.title)}：${esc(scene.steps[step])}</title>${scene.draw(step, phase)}</svg>`; }
  function staticArt(key) { const scene = resolve(key); return scene ? `<figure class="g6-static">${svg(scene, scene.steps.length - 1)}<figcaption><b>独立演示例题：</b>${esc(scene.steps.at(-1))}</figcaption></figure>` : ''; }
  function neutralArt(key) {
    const title = '章节示意图：请以题目条件为准';
    let picture;
    if (['cylinder','projection','building'].includes(key)) picture = rect(95, 91, 110, 126, '#efb398') + `<ellipse cx="150" cy="91" rx="55" ry="18" fill="#f5d48b" stroke="${C.ink}"/><ellipse cx="150" cy="217" rx="55" ry="18" fill="none" stroke="${C.ink}"/><path d="M385 76 L325 218 H445 Z" fill="#a5cdbb" stroke="${C.ink}"/><ellipse cx="385" cy="218" rx="60" ry="18" fill="#c8ded2" stroke="${C.ink}"/>`;
    else if (['circle'].includes(key)) picture = circle(280, 160, 97, '#f5d48b');
    else if (['proportion','down-fun','location','cat-stretch'].includes(key)) picture = rect(92, 75, 376, 171, '#eee8d8') + rect(123, 103, 90, 65, '#efb398') + rect(314, 150, 115, 68, '#a5cdbb') + `<path d="M214 128 H274 V185 H314" fill="none" stroke="#fff" stroke-width="14"/>`;
    else if (['gomoku','motion','view-objects'].includes(key)) picture = grid();
    else if (['fraction-division','fraction-app','fraction-mixed','percent','percent-app'].includes(key)) picture = rect(90, 127, 380, 72, '#f5d48b') + `<path d="M277 83 C292 114 267 133 280 162 S295 218 280 248" fill="none" stroke="${C.coral}" stroke-width="3" stroke-dasharray="5 6"/>`;
    else if (['ratio','nutrition-plan'].includes(key)) picture = `<path d="M85 120 H165 L150 232 H100 Z" fill="#efb398" stroke="${C.ink}"/><ellipse cx="359" cy="173" rx="99" ry="60" fill="#a5cdbb" stroke="${C.ink}"/><ellipse cx="359" cy="173" rx="62" ry="37" fill="#fff4dd" stroke="${C.ink}"/>`;
    else if (['data-processing','water-plan','variation','grouped-data','interest'].includes(key)) picture = rect(93, 71, 374, 181, '#fff') + line(126, 102, 126, 223, '#c9c9c3') + line(126, 223, 440, 223, '#c9c9c3') + `<path d="M156 148 C205 92 268 218 331 151 S399 176 419 133" fill="none" stroke="${C.blue}" stroke-width="4"/>`;
    else picture = rect(96, 78, 367, 173, '#fff4dd') + circle(187, 163, 45, '#efb398') + rect(296, 119, 102, 89, '#a5cdbb');
    return `<figure class="g6-static g6-neutral"><svg class="g6-diagram" viewBox="0 0 560 310" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg"><title>${title}</title>${picture}</svg><figcaption>先读题，按题目给出的条件计算或判断。</figcaption></figure>`;
  }
  function art(key) { const scene = resolve(key); if (!scene) return ''; return `<section class="g6-visual" data-g6-visual="${esc(key)}" aria-label="${esc(scene.title)}"><div class="g6-visual-heading"><span>数学图解实验室 · 独立演示例题</span><b>${esc(scene.title)}</b></div><div class="g6-canvas">${svg(scene, 0)}</div><p class="g6-explanation" aria-live="polite">${esc(scene.steps[0])}</p><div class="g6-controls"><button type="button" data-g6-action="prev" aria-label="图解上一步" disabled>← 上一步</button><button type="button" data-g6-action="play" class="g6-play">播放讲解</button><button type="button" data-g6-action="next" aria-label="图解下一步">下一步 →</button><button type="button" data-g6-action="restart">重播</button></div><div class="g6-step-track" aria-label="讲解进度">${scene.steps.map((_, i) => `<span class="${i ? '' : 'is-current'}"></span>`).join('')}</div><small class="g6-step-label">第 1 / ${scene.steps.length} 步 · 可暂停，按自己的速度看</small></section>`; }
  let controllers = [];
  function dispose() { controllers.forEach(c => c.stop()); controllers = []; }
  function mount(root = document.querySelector('#lessonStage')) {
    dispose(); if (!root) return;
    root.querySelectorAll('[data-g6-visual]').forEach(card => {
      const scene = resolve(card.dataset.g6Visual); if (!scene) return;
      let step = 0, raf = 0, playing = false, started = 0, drawing = false;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const play = card.querySelector('[data-g6-action="play"]');
      function paint(phase = 1) { card.querySelector('.g6-canvas').innerHTML = svg(scene, step, phase); }
      function labels() {
        card.querySelector('.g6-explanation').textContent = scene.steps[step];
        card.querySelector('.g6-step-label').textContent = `第 ${step + 1} / ${scene.steps.length} 步 · ${reduced.matches ? '减少动态效果已开启，请逐步观看' : '可暂停，按自己的速度看'}`;
        card.querySelector('[data-g6-action="prev"]').disabled = step === 0;
        card.querySelector('[data-g6-action="next"]').disabled = step === scene.steps.length - 1;
        card.querySelectorAll('.g6-step-track span').forEach((dot, i) => dot.classList.toggle('is-current', i === step));
        play.textContent = reduced.matches ? '逐步观看' : playing ? '暂停讲解' : step === scene.steps.length - 1 ? '再播放一次' : '播放讲解';
        play.setAttribute('aria-pressed', String(playing));
      }
      function stop() { playing = false; cancelAnimationFrame(raf); raf = 0; if (drawing) paint(); drawing = false; labels(); }
      function setStep(n) { stop(); step = Math.max(0, Math.min(n, scene.steps.length - 1)); paint(); labels(); }
      function tick(time) {
        if (!playing || !card.isConnected || document.hidden || card.closest('.view') && !card.closest('.view').classList.contains('active')) { stop(); return; }
        if (!started) started = time;
        const elapsed = time - started;
        if (drawing) { paint(Math.min(1, elapsed / 750)); if (elapsed >= 750) drawing = false; }
        if (elapsed >= 3000) {
          if (step === scene.steps.length - 1) { stop(); return; }
          step++; started = time; drawing = true; paint(0); labels();
        }
        raf = requestAnimationFrame(tick);
      }
      card.querySelectorAll('[data-g6-action]').forEach(button => button.addEventListener('click', () => {
        const action = button.dataset.g6Action;
        if (action === 'prev') setStep(step - 1);
        if (action === 'next') setStep(step + 1);
        if (action === 'restart') setStep(0);
        if (action === 'play') {
          if (reduced.matches) { setStep(step === scene.steps.length - 1 ? 0 : step + 1); return; }
          if (playing) { stop(); return; }
          if (step === scene.steps.length - 1) step = 0;
          playing = true; started = 0; drawing = true; paint(0); labels(); raf = requestAnimationFrame(tick);
        }
      }));
      controllers.push({ stop }); labels();
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) dispose(); });
  window.addEventListener('pagehide', dispose);
  window.Grade6Visuals = { art, staticArt, neutralArt, mount, dispose, keys: Object.keys(scenes) };
})();
