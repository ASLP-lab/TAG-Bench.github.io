(() => {
  'use strict';
  const D = window.TAGBENCH;
  if (!D) return;
  const $ = (id) => document.getElementById(id);
  const taskMap = new Map(D.tasks.map(t => [t.id, t]));
  const sampleMap = new Map(D.examples.map(s => [s.id, s]));
  const english = {};
  document.querySelectorAll('[data-i18n]').forEach(el => { english[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { english[el.dataset.i18nHtml] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { english[el.dataset.i18nPlaceholder] = el.placeholder; });
  Object.assign(english, {
    allTasks: 'All tasks', allDurations: 'All durations', under10: '< 10 sec', from10: '10–60 sec', from60: '1–3 min', from180: '3–10 min', from600: '≥ 10 min',
    filtered: '{n} of {total} queries · hover or tap a dot to inspect', examplesFound: '{n} examples', noExamples: 'No examples match. Try another query or reset the filters.',
    nTargets: '{n} targets', oneTarget: '1 target', targetTime: 'Target time', totalDuration: 'Recording', copied: 'Copied to clipboard.', copyFailed: 'Copy was unavailable. The text is shown below.',
    audioFailure: 'Audio could not be loaded. Check that the audio assets are present, or try serving this folder with a local HTTP server.',
    page: 'Page {page} of {pages} · {n} queries', emptyData: 'No queries match these filters.', listen: 'Listen ↗', durationAxis: 'Recording duration · log scale', coverageAxis: 'Target coverage (%)', countAxis: 'Annotated intervals',
    shortContext: 'Short context', longContext: 'Long context', listenShort: 'Listen short ↗', listenLong: 'Listen long ↗', longerContext: 'longer recording', sameTargetTime: 'same target duration', coverageChange: 'target coverage',
    fullRecording: 'Full recording', waveHint: 'Click the waveform to seek.', spectrumHint: '0–4 kHz · relative energy · click to seek.', pauseTargets: 'Stop target sequence',
    allMoments: '5+ targets', openExample: 'Audio available · click to listen', noCurated: 'Summary point · no bundled audio', seconds: 's', exportDone: 'Filtered data downloaded.', fivePlus: '5+ targets',
    playMoment: 'Play target {n}: {start} to {end} seconds', sampleAria: 'Select example {id}: {title}', sampleControls: 'Filter audio examples by task', selectedSignal: 'Audio timeline, {duration} seconds. Arrow keys seek. Home and End jump to the edges.'
  });
  const zh = {
    skip:'跳转到内容', navBenchmark:'数据概览', navContext:'长上下文', navListen:'试听与探索',
    heroTitle:'每一种声音，<br>都有它的<em>时刻。</em>', heroDescription:'听懂发生了什么，只是故事的一半。TAG-Bench 进一步追问：它发生在什么时候？每一次出现，都找到了吗？',
    startListening:'探索音频样例', readPaper:'阅读论文', heroDemoEyebrow:'一个查询，找到每一次出现。', heroDemoTitle:'18 次金属碰撞。', heroDemoText:'一分钟录音，十八个需要找到的瞬间。', humanAnnotations:'标注目标区间',
    heroBottom:'在音频中，定位声音、词语、语义与情绪。', statQueries:'条时间定位查询', statHours:'小时完整音频', statTasks:'类听觉任务', statMulti:'的查询包含多个目标',
    benchmarkEyebrow:'01 / 数据概览', benchmarkTitle:'八种任务，同一个「何时」。', benchmarkDescription:'从不到一秒的目标，到二十分钟的录音。探索任务构成、音频时长，以及目标在整段录音中的占比。',
    exploreDataset:'探索完整数据集', taskLabel:'任务', targetsLabel:'目标数量', durationLabel:'音频时长', allTargets:'全部目标', singleTarget:'单目标', multipleTargets:'多目标', reset:'重置',
    scatterTitle:'时间定位的不同尺度', verticalAxis:'纵轴', coverage:'目标覆盖率', targetCount:'目标数量', currentSelection:'当前筛选', queries:'条查询', medianDuration:'时长中位数', medianCoverage:'覆盖率中位数',
    scatterHint:'每个点对应一条查询。悬停或点按可查看详情，音频时长使用对数坐标。', durationDistribution:'录音有多长？', queryCount:'查询数量', targetDistribution:'需要找到多少个瞬间？', durationChartNote:'点击时长范围可筛选全部统计图。', countChartNote:'数量来自原始标注区间，未合并相接区间。',
    coverageDefinition:'覆盖率 = 目标区间并集在录音范围内的总时长 ÷ 实际录音时长。', exportCsv:'导出筛选结果 CSV', browseData:'查看统计图背后的数据', sampleAudio:'试听样例', previous:'上一页', next:'下一页',
    contextEyebrow:'02 / 长上下文挑战', contextTitle:'同一段声音，<br>更长的搜索范围。', contextDescription:'两段录音包含完全相同的 60 秒音频。目标本身没有变化，周围的上下文却变长了。', doorPair:'门的开与关', waterPair:'水滴落下', sameQuery:'相同的查询', pairNote:'每条时间轴均展示完整录音。底色区域标出嵌入其中的同一段 60 秒音频。',
    listenEyebrow:'03 / 试听与探索', listenTitle:'找到它，听见它，看见它。', listenDescription:'精选 16 个真实样例，每类任务各两个。试听完整录音、跳转标注区间，或在波形与频谱之间切换。', searchPlaceholder:'搜索声音、话题或样例编号…', originalQuery:'原始查询 · 英文', waveform:'波形', spectrogram:'频谱', zoomTargets:'放大目标区域',
    annotatedMoments:'标注的目标区间', playAll:'依次播放目标', intervalNote:'点击一个区间，仅播放该目标。所有时间戳均以原始录音起点为零点。', inspectAnnotation:'查看原始查询与标注', copyAnnotation:'复制标注', downloadExample:'下载样例 JSON ↓', shareExample:'复制样例链接 ↗',
    aboutEyebrow:'从听懂到定位', aboutTitle:'是什么，在哪里，每一次。', aboutDescription:'TAG-Bench 评估音频时间定位能力：给定录音和自然语言查询，返回所有匹配的时间区间。准确的边界与完整的目标检索同样重要。', citation:'引用本项目', copyCitation:'复制 BibTeX', footerNote:'统计图覆盖全部 1,750 条查询；试听区为人工挑选的样例。', downloadSelection:'下载样例标注 ↓',
    allTasks:'全部任务', allDurations:'全部时长', under10:'小于 10 秒', from10:'10–60 秒', from60:'1–3 分钟', from180:'3–10 分钟', from600:'不少于 10 分钟', filtered:'共 {total} 条查询，当前显示 {n} 条 · 悬停或点按查看', examplesFound:'{n} 个样例', noExamples:'没有匹配的样例。请调整关键词或重置筛选。',
    nTargets:'{n} 个目标', oneTarget:'1 个目标', targetTime:'目标总时长', totalDuration:'录音时长', copied:'已复制到剪贴板。', copyFailed:'无法自动复制，文本已显示在下方。', audioFailure:'音频未能加载，请确认音频资源完整，或通过本地 HTTP 服务打开页面。',
    page:'第 {page} / {pages} 页 · {n} 条查询', emptyData:'没有符合当前筛选条件的查询。', listen:'试听 ↗', durationAxis:'录音时长 · 对数坐标', coverageAxis:'目标覆盖率（%）', countAxis:'原始标注区间数',
    shortContext:'短上下文', longContext:'长上下文', listenShort:'试听短音频 ↗', listenLong:'试听长音频 ↗', longerContext:'倍录音时长', sameTargetTime:'目标总时长不变', coverageChange:'目标覆盖率', fullRecording:'显示完整录音', waveHint:'点击波形可跳转播放位置。', spectrumHint:'0–4 kHz · 相对能量 · 点击可跳转。', pauseTargets:'停止连续播放', allMoments:'5 个及以上目标',
    openExample:'有试听样例 · 点击打开', noCurated:'统计数据点 · 未打包试听音频', seconds:'秒', exportDone:'已下载筛选结果。', fivePlus:'5 个及以上目标', playMoment:'播放第 {n} 个目标：{start} 至 {end} 秒', sampleAria:'选择样例 {id}：{title}', sampleControls:'按任务筛选试听样例', selectedSignal:'音频时间轴，共 {duration} 秒。左右方向键跳转，Home 和 End 移动到首尾。'
  };
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('tagbench-language'); } catch (_) { /* Storage can be disabled. */ }
  const params = new URLSearchParams(location.search);
  const requestedLanguage = params.get('lang') || savedLanguage;
  const state = { lang: requestedLanguage === 'zh' ? 'zh' : 'en', task:'all', multiplicity:'all', duration:'all', y:'coverage', page:0,
    sampleTask:'all', sampleMultiplicity:'all', search:'', sampleId:sampleMap.has(params.get('sample')) ? params.get('sample') : 'tagbench-0534', view:'waveform', zoom:false, focusIndex:null, pair:'door' };
  const t = (key, values = {}) => {
    let text = (state.lang === 'zh' ? zh[key] : undefined) ?? english[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
  };
  const esc = (str) => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => n.toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
  const label = task => taskMap.get(task).label[state.lang];
  const title = sample => sample.title[state.lang];
  const sample = () => sampleMap.get(state.sampleId);
  const median = values => { if (!values.length) return null; const v=[...values].sort((a,b)=>a-b); const i=Math.floor(v.length/2); return v.length%2 ? v[i] : (v[i-1]+v[i])/2; };
  const percent = (v, digits = v < .01 ? 2 : 1) => `${(v * 100).toFixed(digits)}%`;
  function time(seconds, decimals=0) {
    const rounded=Math.round(Math.max(0,seconds)*10**decimals)/10**decimals;
    return `${String(Math.floor(rounded/60)).padStart(2,'0')}:${(rounded%60).toFixed(decimals).padStart(decimals ? 3+decimals : 2,'0')}`;
  }
  const duration = seconds => seconds === null ? '—' : seconds < 60 ? `${seconds.toFixed(seconds < 10 ? 2 : 1)} ${t('seconds')}` : time(seconds);
  const bins = [
    {id:'under10', min:0, max:10, key:'under10'}, {id:'from10',min:10,max:60,key:'from10'}, {id:'from60',min:60,max:180,key:'from60'}, {id:'from180',min:180,max:600,key:'from180'}, {id:'from600',min:600,max:Infinity,key:'from600'}
  ];
  const countBins = [{id:'single',label:'1',test:n=>n===1},{id:'2',label:'2',test:n=>n===2},{id:'3',label:'3',test:n=>n===3},{id:'4',label:'4',test:n=>n===4},{id:'5plus',label:'5+',test:n=>n>=5}];
  const multiplicityMatches = (point, filter) => filter==='all' || (filter==='single' ? !point.multi : filter==='multi' ? point.multi : filter==='5plus' ? point.count>=5 : point.count===Number(filter));
  function filteredPoints() {
    const bin = bins.find(b => b.id === state.duration);
    return D.points.filter(p => (state.task==='all' || p.task===state.task) && multiplicityMatches(p,state.multiplicity) && (!bin || p.duration>=bin.min && p.duration<bin.max));
  }
  function filteredSamples() {
    const query=state.search.trim().toLocaleLowerCase();
    return D.examples.filter(s=>(state.sampleTask==='all'||s.task===state.sampleTask) && multiplicityMatches(s,state.sampleMultiplicity) && (!query || [s.id,s.question,s.query,s.title.en,s.title.zh,taskMap.get(s.task).label.en,taskMap.get(s.task).label.zh].join(' ').toLocaleLowerCase().includes(query)));
  }
  function option(value,text) { return `<option value="${esc(value)}">${esc(text)}</option>`; }
  function setSelect(id, html, value) { $(id).innerHTML=html; $(id).value=value; }
  function applyLanguage() {
    document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';
    document.title=state.lang==='zh'?'TAG-Bench — 探索声音发生的时刻':'TAG-Bench — Every sound. In its own time.';
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.i18nPlaceholder);});
    $('language').innerHTML=state.lang==='en'?'中文 <span aria-hidden="true">↗</span>':'EN <span aria-hidden="true">↗</span>';
    $('language').setAttribute('aria-label',state.lang==='en'?'切换到中文':'Switch to English');
    const taskOptions=option('all',t('allTasks'))+D.tasks.map(task=>option(task.id,task.label[state.lang])).join('');
    setSelect('dataTask',taskOptions,state.task); setSelect('sampleTask',taskOptions,state.sampleTask);
    setSelect('dataDuration',option('all',t('allDurations'))+bins.map(b=>option(b.id,t(b.key))).join(''),state.duration);
    const multiOptions=option('all',t('allTargets'))+option('single',t('singleTarget'))+option('multi',t('multipleTargets'));
    setSelect('dataMultiplicity',multiOptions+['2','3','4'].map(n=>option(n,t('nTargets',{n}))).join('')+option('5plus',t('fivePlus')),state.multiplicity);
    setSelect('sampleMultiplicity',multiOptions,state.sampleMultiplicity);
    $('sampleSearch').setAttribute('aria-label',t('searchPlaceholder'));
    $('sampleTask').setAttribute('aria-label',t('sampleControls'));
    $('sampleMultiplicity').setAttribute('aria-label',t('targetsLabel'));
    $('heroPlay').setAttribute('aria-label',state.lang==='zh'?'试听第一个金属碰撞目标':'Listen to the first metal clink');
    $('scatter').setAttribute('aria-label',state.lang==='zh'?'录音时长与目标覆盖率或目标数量的交互散点图，下方提供相同数据的表格。':'Interactive scatter plot of recording duration and target coverage or target count. The same data is in the table below.');
    $('statQueries').textContent=number(D.stats.count);
    $('statHours').innerHTML=`${D.stats.hours.toFixed(2)}<span> h</span>`;
    $('statMulti').innerHTML=`${(D.stats.multi/D.stats.count*100).toFixed(1)}<span>%</span>`;
    renderTasks(); renderDataset(); renderPairs(); renderLibrary(); renderPlayer(); drawHero();
  }
  function renderTasks() {
    const max=Math.max(...D.tasks.map(task=>task.count));
    $('taskGrid').innerHTML=D.tasks.map((task,i)=>`<button class="task-tile" data-task="${task.id}" aria-pressed="${state.task===task.id}" style="--task-color:${task.color}"><div class="task-tile-top"><span>${String(i+1).padStart(2,'0')}</span><strong>${task.count}</strong></div><h3>${esc(task.label[state.lang])}</h3><p>${esc(task.description[state.lang])}</p><div class="task-line" aria-hidden="true"><i style="width:${task.count/max*100}%"></i></div></button>`).join('');
    $('plotLegend').innerHTML=D.tasks.map(task=>`<span class="legend-item"><i style="background:${task.color}"></i>${esc(task.label[state.lang])}</span>`).join('');
  }
  function renderDataset() {
    const rows=filteredPoints();
    $('filterSummary').textContent=t('filtered',{n:number(rows.length),total:number(D.stats.count)});
    $('filteredCount').textContent=number(rows.length);
    $('filteredDuration').textContent=duration(median(rows.map(p=>p.duration)));
    $('filteredCoverage').textContent=rows.length?percent(median(rows.map(p=>p.coverage))):'—';
    $('scatterTip').hidden=true;
    drawScatter(rows); renderDistributions(rows); renderTable(rows);
    $('dataTask').value=state.task; $('dataDuration').value=state.duration; $('dataMultiplicity').value=state.multiplicity;
    document.querySelectorAll('.task-tile').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.task===state.task)));
  }
  function renderDistributions(rows) {
    const counts=bins.map(bin=>rows.filter(p=>p.duration>=bin.min&&p.duration<bin.max).length);
    const max=Math.max(1,...counts);
    $('durationChart').innerHTML=bins.map((b,i)=>`<button class="chart-column" data-duration="${b.id}" aria-pressed="${state.duration===b.id}" aria-label="${esc(t(b.key))}: ${counts[i]} ${esc(t('queries'))}"><span>${number(counts[i])}</span><i class="bar" style="height:${Math.max(counts[i]?3:0,counts[i]/max*112)}px"></i><b class="bar-label">${esc(t(b.key))}</b></button>`).join('');
    const targetCounts=countBins.map(bin=>rows.filter(p=>bin.test(p.count)).length);
    const maxCount=Math.max(1,...targetCounts);
    $('countChart').innerHTML=countBins.map((b,i)=>`<button class="chart-column" data-count="${b.id}" aria-pressed="${state.multiplicity===b.id}" aria-label="${esc(b.id==='5plus'?t('fivePlus'):t('nTargets',{n:b.label}))}: ${targetCounts[i]} ${esc(t('queries'))}"><span>${number(targetCounts[i])}</span><i class="bar" style="height:${Math.max(targetCounts[i]?3:0,targetCounts[i]/maxCount*112)}px"></i><b class="bar-label">${b.label}</b></button>`).join('');
  }
  const pageSize=20;
  function renderTable(rows=filteredPoints()) {
    const pages=Math.max(1,Math.ceil(rows.length/pageSize)); state.page=Math.min(state.page,pages-1);
    $('dataTableBody').innerHTML=rows.slice(state.page*pageSize,(state.page+1)*pageSize).map(p=>`<tr><td>${p.id}</td><td>${esc(label(p.task))}</td><td>${duration(p.duration)}</td><td>${p.count}</td><td>${percent(p.coverage)}</td><td>${sampleMap.has(p.id)?`<button class="text-link" data-open="${p.id}">${esc(t('listen'))}</button>`:'—'}</td></tr>`).join('') || `<tr><td colspan="6">${esc(t('emptyData'))}</td></tr>`;
    $('pageInfo').textContent=t('page',{page:state.page+1,pages,n:number(rows.length)});
    $('previousPage').disabled=state.page===0; $('nextPage').disabled=state.page>=pages-1;
  }
  function canvasSetup(canvas) {
    const rect=canvas.getBoundingClientRect(); const w=Math.max(1,rect.width),h=Math.max(1,rect.height),ratio=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.round(w*ratio); canvas.height=Math.round(h*ratio);
    const ctx=canvas.getContext('2d'); ctx.scale(ratio,ratio); return {ctx,w,h};
  }
  let scatterPositions=[];
  function drawScatter(rows=filteredPoints()) {
    const {ctx,w,h}=canvasSetup($('scatter'));
    const pad={left:38,right:14,top:33,bottom:51}; const width=w-pad.left-pad.right,height=h-pad.top-pad.bottom;
    const maxY=state.y==='coverage'?100:20;
    ctx.font='10px Arial'; ctx.fillStyle='#71817e'; ctx.textAlign='left';
    ctx.fillText(t(state.y==='coverage'?'coverageAxis':'countAxis'),pad.left,15);
    for (let i=0;i<=4;i++) {
      const value=i*maxY/4,y=pad.top+height*(1-i/4);
      ctx.strokeStyle='#e8ece4'; ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(w-pad.right,y);ctx.stroke();
      ctx.textAlign='right';ctx.fillStyle='#7e8a84';ctx.fillText(String(value),pad.left-8,y+3);
    }
    const ticks=[1,10,60,300,1200],names=state.lang==='zh'?['1秒','10秒','1分','5分','20分']:['1s','10s','1m','5m','20m'];
    ticks.forEach((v,i)=>{const x=pad.left+Math.log10(v)/Math.log10(1200)*width;ctx.strokeStyle='#f0f2ed';ctx.beginPath();ctx.moveTo(x,pad.top);ctx.lineTo(x,pad.top+height);ctx.stroke();ctx.fillStyle='#7e8a84';ctx.textAlign=i===4?'right':'center';ctx.fillText(names[i],x,h-31);});
    ctx.textAlign='center'; ctx.fillStyle='#71817e'; ctx.font='9px Arial';ctx.fillText(t('durationAxis'),pad.left+width/2,h-9);
    scatterPositions=rows.map(p=>({...p,x:pad.left+Math.log10(Math.max(1,p.duration))/Math.log10(1200)*width,y:pad.top+height*(1-(state.y==='coverage'?p.coverage*100:p.count)/maxY)}));
    ctx.save();ctx.beginPath();ctx.rect(pad.left-3,pad.top-4,width+6,height+8);ctx.clip();
    scatterPositions.forEach(p=>{ctx.globalAlpha=.52;ctx.fillStyle=taskMap.get(p.task).color;ctx.beginPath();ctx.arc(p.x,p.y,2.8,0,Math.PI*2);ctx.fill();});
    scatterPositions.filter(p=>sampleMap.has(p.id)).forEach(p=>{ctx.globalAlpha=.95;ctx.strokeStyle=taskMap.get(p.task).color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,4.6,0,Math.PI*2);ctx.stroke();});
    ctx.restore();ctx.globalAlpha=1;
    if(!rows.length){ctx.fillStyle='#6b797b';ctx.textAlign='center';ctx.font='12px Arial';ctx.fillText(t('emptyData'),w/2,h/2);}
  }
  function nearestPoint(event) {
    const rect=$('scatter').getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    let best=null,dist=14;
    scatterPositions.forEach(p=>{const d=Math.hypot(p.x-x,p.y-y);if(d<dist){best=p;dist=d;}});return best;
  }
  function showPoint(p) {
    const tip=$('scatterTip'); if(!p){tip.hidden=true;return;}
    tip.innerHTML=`<strong>${p.id} · ${esc(label(p.task))}</strong>${duration(p.duration)} · ${t('nTargets',{n:p.count})}<br>${esc(t('coverage'))}: ${percent(p.coverage)}<br><span>${esc(t(sampleMap.has(p.id)?'openExample':'noCurated'))}</span>`;
    tip.hidden=false; const w=$('scatter').clientWidth;
    tip.style.left=`${Math.max(0,Math.min(p.x+12,w-tip.offsetWidth))}px`;tip.style.top=`${Math.max(0,p.y-tip.offsetHeight-9)}px`;
  }
  function waveDraw(ctx,w,h,s,options={}) {
    const dark=Boolean(options.dark),start=options.start??0,end=options.end??s.duration,span=end-start;
    ctx.clearRect(0,0,w,h);
    if(options.embedded){const [a,b]=options.embedded;ctx.fillStyle='#36565a';ctx.fillRect((a-start)/span*w,0,(b-a)/span*w,h);}
    s.intervals.forEach(([a,b])=>{if(b<start||a>end)return;const x=Math.max(0,(a-start)/span*w),right=Math.min(w,(b-start)/span*w);ctx.fillStyle=dark?'#d4ef8924':'#accb963b';ctx.fillRect(x,8,Math.max(1,right-x),h-16);ctx.fillStyle=dark?'#d4ef89':'#55845d';ctx.fillRect(x,h-7,Math.max(1,right-x),3);});
    ctx.strokeStyle=dark?'#597b75':'#b8cbb8';ctx.lineWidth=1.25;
    for(let x=1;x<w;x+=2.5){const a=Math.max(0,Math.floor((start+x/w*span)/s.duration*s.waveform.length));const b=Math.min(s.waveform.length,Math.ceil((start+(x+2.5)/w*span)/s.duration*s.waveform.length));let peak=0;for(let i=a;i<Math.max(a+1,b)&&i<s.waveform.length;i++)peak=Math.max(peak,s.waveform[i]);const at=start+x/w*span,inside=s.intervals.some(([p,q])=>at>=p&&at<=q);ctx.strokeStyle=inside?(dark?'#d4ef89':'#477955'):(dark?'#688c82':'#9bb69f');const height=Math.max(1,peak/255*h*.36);ctx.beginPath();ctx.moveTo(x,h/2-height);ctx.lineTo(x,h/2+height);ctx.stroke();}
  }
  function drawHero(){const {ctx,w,h}=canvasSetup($('heroWave'));waveDraw(ctx,w,h,sampleMap.get('tagbench-0534'),{dark:true});}
  function renderPairs() {
    const pair=D.pairs.find(p=>p.id===state.pair),short=sampleMap.get(pair.short),long=sampleMap.get(pair.long);
    $('pairQuery').textContent=short.query;
    document.querySelectorAll('[data-pair]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.pair===state.pair)));
    $('pairRows').innerHTML=[short,long].map((s,i)=>`<div class="pair-row"><div class="pair-row-label"><span>${esc(t(i?'longContext':'shortContext'))}</span><strong>${time(s.duration)}</strong></div><div class="pair-row-plot"><canvas id="pairCanvas${i}" role="img" aria-label="${esc(t(i?'longContext':'shortContext'))}: ${time(s.duration)}, ${percent(s.coverage)}"></canvas><div class="timeline-ticks"><span>00:00</span><span>${time(s.duration/2)}</span><span>${time(s.duration)}</span></div></div><button class="text-link" data-pair-play="${s.id}">${esc(t(i?'listenLong':'listenShort'))}</button></div>`).join('');
    const targetTime=short.intervals.reduce((sum,[a,b])=>sum+b-a,0);
    $('pairMetrics').innerHTML=`<div class="pair-metric"><strong>${(long.duration/short.duration).toFixed(0)}×</strong><span>${esc(t('longerContext'))}</span></div><div class="pair-metric"><strong>${targetTime.toFixed(2)}s</strong><span>${esc(t('sameTargetTime'))}</span></div><div class="pair-metric"><strong>${percent(short.coverage,2)} → ${percent(long.coverage,2)}</strong><span>${esc(t('coverageChange'))}</span></div>`;
    [short,long].forEach((s,i)=>{const {ctx,w,h}=canvasSetup($(`pairCanvas${i}`));waveDraw(ctx,w,h,s,{dark:true,embedded:i?[pair.offset,pair.offset+short.duration]:[0,short.duration]});});
  }
  function renderLibrary() {
    const rows=filteredSamples();$('sampleCount').textContent=t('examplesFound',{n:rows.length});
    $('sampleList').innerHTML=rows.map(s=>`<button class="sample-card" data-sample="${s.id}" aria-pressed="${state.sampleId===s.id}" aria-label="${esc(t('sampleAria',{id:s.id,title:title(s)}))}" style="--task-color:${taskMap.get(s.task).color}"><div class="sample-card-top"><span><i></i>${esc(label(s.task))}</span><span class="mono">${s.id.slice(-4)}</span></div><h4>${esc(title(s))}</h4><div class="sample-card-bottom"><span>${time(s.duration)} · ${esc(t(s.count===1?'oneTarget':'nTargets',{n:s.count}))}</span><svg viewBox="0 0 40 16" aria-hidden="true"><path d="M2 6v4m4-6v8m4-10v12m4-9v6m4-8v10m4-12v14m4-10v6m4-5v4m4-8v12m4-8v4"/></svg></div></button>`).join('')||`<p class="empty-samples">${esc(t('noExamples'))}</p>`;
  }
  const audio=$('mainAudio');
  let segment=null,sequence=[],sequenceActive=false,requestToken=0,pendingSeek=null,frameId=null;
  const images=new Map();
  function annotation(s=sample()) { return {id:s.id,task_tag:taskMap.get(s.task).tag,audio_file:s.source_file,question:s.question,raw_query:s.query,timestamp:s.timestamp,multi_target:s.multi,intervals:s.intervals}; }
  function renderPlayer() {
    const s=sample(); $('playerTask').textContent=label(s.task);$('playerTask').style.color=taskMap.get(s.task).color;
    $('playerId').textContent=s.id; $('playerTitle').textContent=title(s);$('playerQuery').textContent=s.question;
    const targetTime=s.duration*s.coverage;
    $('sampleMetrics').innerHTML=[['totalDuration',duration(s.duration)],['targetsLabel',s.count],['targetTime',`${targetTime.toFixed(2)}s`],['coverage',percent(s.coverage)]].map(([key,value])=>`<div><strong>${value}</strong><span>${esc(t(key))}</span></div>`).join('');
    $('intervalList').innerHTML=s.intervals.map(([start,end],i)=>`<button class="interval-button" data-interval="${i}" aria-pressed="false" aria-label="${esc(t('playMoment',{n:i+1,start:start.toFixed(2),end:end.toFixed(2)}))}"><span>${String(i+1).padStart(2,'0')}</span><span>${start.toFixed(2)}–${end.toFixed(2)}s</span><span aria-hidden="true">▶</span></button>`).join('');
    $('annotationJson').textContent=JSON.stringify(annotation(),null,2);
    $('signalCanvas').setAttribute('aria-valuemax',String(s.duration));$('signalCanvas').setAttribute('aria-label',t('selectedSignal',{duration:s.duration.toFixed(2)}));
    drawSignal();updateActiveTargets();updateCursor();
  }
  function viewRange() {
    const s=sample();if(!state.zoom)return [0,s.duration];
    const spans=state.focusIndex===null?s.intervals:[s.intervals[state.focusIndex]];
    const start=Math.min(...spans.map(i=>i[0])),end=Math.max(...spans.map(i=>i[1])),pad=Math.max(.25,Math.min(8,(end-start)*.15+1));
    return [Math.max(0,start-pad),Math.min(s.duration,end+pad)];
  }
  function drawSignal() {
    const s=sample(),[start,end]=viewRange(),{ctx,w,h}=canvasSetup($('signalCanvas'));
    document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.view===state.view)));
    $('zoomTargets').textContent=t(state.zoom?'fullRecording':'zoomTargets');$('zoomTargets').setAttribute('aria-pressed',String(state.zoom));
    $('frequencyLabel').hidden=state.view!=='spectrogram';
    $('signalHint').textContent=t(state.view==='waveform'?'waveHint':'spectrumHint');
    if(state.view==='waveform') waveDraw(ctx,w,h,s,{start,end});
    else {
      ctx.fillStyle='#142d32';ctx.fillRect(0,0,w,h);
      let img=images.get(s.id);
      if(!img){img=new Image();images.set(s.id,img);img.onload=()=>{if(sample().id===s.id&&state.view==='spectrogram')drawSignal();};img.src=s.spectrogram;}
      if(img.complete&&img.naturalWidth){const sx=start/s.duration*img.width,sw=(end-start)/s.duration*img.width;ctx.drawImage(img,sx,0,sw,img.height,0,0,w,h);}
      s.intervals.forEach(([a,b])=>{if(b<start||a>end)return;const x=Math.max(0,(a-start)/(end-start)*w),right=Math.min(w,(b-start)/(end-start)*w);ctx.fillStyle='#d4ef891f';ctx.fillRect(x,0,Math.max(1,right-x),h);ctx.strokeStyle='#d4ef89';ctx.lineWidth=1;ctx.strokeRect(x+.5,1,Math.max(1,right-x)-1,h-2);});
    }
    $('signalTicks').innerHTML=Array.from({length:5},(_,i)=>`<span>${time(start+(end-start)*i/4,end-start<10?2:0)}</span>`).join('');
    updateCursor();
  }
  function updateCursor() {
    const [start,end]=viewRange(),current=audio.currentTime||0,position=(current-start)/(end-start);
    $('signalOverlay').style.left=`${Math.max(0,Math.min(1,position))*100}%`;
    $('signalOverlay').hidden=position<0||position>1;
    $('signalCanvas').setAttribute('aria-valuenow',current.toFixed(2));$('signalCanvas').setAttribute('aria-valuetext',time(current,2));
  }
  function updateActiveTargets() {
    document.querySelectorAll('[data-interval]').forEach(el=>el.setAttribute('aria-pressed',String(segment!==null&&Number(el.dataset.interval)===segment.index)));
    $('playAll').innerHTML=`<span aria-hidden="true">${sequenceActive?'■':'▶'}</span> <span>${esc(t(sequenceActive?'pauseTargets':'playAll'))}</span>`;
  }
  function updateUrl() {
    try{const url=new URL(location.href);url.searchParams.set('sample',state.sampleId);url.searchParams.set('lang',state.lang);history.replaceState(null,'',url);}catch(_){/* file:// browsers may limit history updates. */}
  }
  function cancelSequence() {sequence=[];sequenceActive=false;segment=null;pendingSeek=null;requestToken++;updateActiveTargets();}
  function selectExample(id,{playIndex=null,scroll=false}={}) {
    if(!sampleMap.has(id))return;
    cancelSequence();audio.pause();state.sampleId=id;state.zoom=false;state.focusIndex=null;
    $('audioError').hidden=true;audio.preload='none';audio.src=sample().audio;audio.load();
    renderLibrary();renderPlayer();updateUrl();
    if(playIndex!==null)playInterval(playIndex);
    if(scroll)$('workbench').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  function playInterval(index,keepQueue=false) {
    const s=sample();if(!s.intervals[index])return;
    if(!keepQueue){sequence=[];sequenceActive=false;}
    const [start,end]=s.intervals[index],token=++requestToken;
    audio.pause();segment={index,start,end,token};pendingSeek={time:start,token,play:true};
    state.focusIndex=index;if(s.duration>300)state.zoom=true;drawSignal();updateActiveTargets();$('audioError').hidden=true;
    audio.preload='auto';if(audio.readyState===0)audio.load();finishPendingSeek();
  }
  function finishPendingSeek() {
    if(!pendingSeek||pendingSeek.token!==requestToken||audio.readyState<1||audio.seeking)return;
    const target=pendingSeek.time;
    const seekable=target===0||Array.from({length:audio.seekable.length},(_,i)=>[audio.seekable.start(i),audio.seekable.end(i)]).some(([a,b])=>target>=a&&target<=b);
    if(!seekable)return;
    if(Math.abs(audio.currentTime-target)>.015){audio.currentTime=target;return;}
    const {token,play}=pendingSeek;pendingSeek=null;updateCursor();
    if(!play)return;
    const promise=audio.play();
    if(promise)promise.catch(error=>{if(token!==requestToken||error.name==='AbortError')return;cancelSequence();$('audioError').textContent=t('audioFailure');$('audioError').hidden=false;});
  }
  function tick() {
    updateCursor();
    if(segment&&!pendingSeek&&!audio.seeking&&audio.currentTime>=segment.end-.006){
      if(sequence.length){const next=sequence.shift();playInterval(next,true);}
      else {const end=segment.end;segment=null;sequenceActive=false;audio.pause();audio.currentTime=Math.min(end,sample().duration);updateActiveTargets();}
    }
    if(!audio.paused)frameId=requestAnimationFrame(tick);else frameId=null;
  }
  ['loadedmetadata','progress','canplay','seeked'].forEach(event=>audio.addEventListener(event,finishPendingSeek));
  audio.addEventListener('play',()=>{if(frameId===null)frameId=requestAnimationFrame(tick);});
  audio.addEventListener('pause',()=>{if(frameId!==null)cancelAnimationFrame(frameId);frameId=null;updateCursor();});
  audio.addEventListener('timeupdate',updateCursor);
  audio.addEventListener('error',()=>{if(!audio.getAttribute('src'))return;cancelSequence();$('audioError').textContent=t('audioFailure');$('audioError').hidden=false;});
  audio.addEventListener('seeking',()=>{if(segment&&!pendingSeek&&(audio.currentTime<segment.start-.1||audio.currentTime>segment.end+.1))cancelSequence();updateCursor();});
  function seek(position) {const resume=!audio.paused;cancelSequence();audio.pause();pendingSeek={time:Math.max(0,Math.min(sample().duration,position)),token:requestToken,play:resume};audio.preload='auto';if(audio.readyState===0)audio.load();finishPendingSeek();updateCursor();}
  $('signalCanvas').addEventListener('click',event=>{const r=$('signalCanvas').getBoundingClientRect(),[a,b]=viewRange();seek(a+(event.clientX-r.left)/r.width*(b-a));});
  $('signalCanvas').addEventListener('keydown',event=>{let position=audio.currentTime||0;if(event.key==='ArrowRight')position+=event.shiftKey ? 0.1 : 5;else if(event.key==='ArrowLeft')position-=event.shiftKey ? 0.1 : 5;else if(event.key==='Home')position=0;else if(event.key==='End')position=sample().duration;else return;event.preventDefault();seek(position);});
  $('playAll').addEventListener('click',()=>{if(sequenceActive){cancelSequence();audio.pause();return;}sequenceActive=true;sequence=sample().intervals.map((_,i)=>i);const first=sequence.shift();playInterval(first,true);});
  $('intervalList').addEventListener('click',event=>{const button=event.target.closest('[data-interval]');if(button)playInterval(Number(button.dataset.interval));});
  $('signalSwitch').addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(button){state.view=button.dataset.view;drawSignal();}});
  $('zoomTargets').addEventListener('click',()=>{state.zoom=!state.zoom;state.focusIndex=null;drawSignal();});
  $('heroPlay').addEventListener('click',()=>selectExample('tagbench-0534',{playIndex:0,scroll:true}));
  $('pairSwitch').addEventListener('click',event=>{const button=event.target.closest('[data-pair]');if(button){state.pair=button.dataset.pair;renderPairs();}});
  $('pairRows').addEventListener('click',event=>{const button=event.target.closest('[data-pair-play]');if(button)selectExample(button.dataset.pairPlay,{playIndex:0,scroll:true});});
  $('sampleList').addEventListener('click',event=>{const button=event.target.closest('[data-sample]');if(button)selectExample(button.dataset.sample);});
  $('sampleSearch').addEventListener('input',event=>{state.search=event.target.value;renderLibrary();});
  ['sampleTask','sampleMultiplicity'].forEach(id=>$(id).addEventListener('change',event=>{state[id]=event.target.value;const rows=filteredSamples();if(rows.length&&!rows.some(s=>s.id===state.sampleId))selectExample(rows[0].id);else renderLibrary();}));
  $('resetSamples').addEventListener('click',()=>{state.sampleTask='all';state.sampleMultiplicity='all';state.search='';$('sampleTask').value='all';$('sampleMultiplicity').value='all';$('sampleSearch').value='';renderLibrary();});
  function dataFilter(key,value){state[key]=value;state.page=0;renderDataset();}
  $('taskGrid').addEventListener('click',event=>{const button=event.target.closest('[data-task]');if(button)dataFilter('task',state.task===button.dataset.task?'all':button.dataset.task);});
  $('dataTask').addEventListener('change',event=>dataFilter('task',event.target.value));
  $('dataMultiplicity').addEventListener('change',event=>dataFilter('multiplicity',event.target.value));
  $('dataDuration').addEventListener('change',event=>dataFilter('duration',event.target.value));
  $('scatterY').addEventListener('change',event=>{state.y=event.target.value;drawScatter();});
  $('resetFilters').addEventListener('click',()=>{state.task='all';state.multiplicity='all';state.duration='all';state.page=0;renderDataset();});
  $('durationChart').addEventListener('click',event=>{const button=event.target.closest('[data-duration]');if(button)dataFilter('duration',state.duration===button.dataset.duration?'all':button.dataset.duration);});
  $('countChart').addEventListener('click',event=>{const button=event.target.closest('[data-count]');if(button)dataFilter('multiplicity',state.multiplicity===button.dataset.count?'all':button.dataset.count);});
  $('scatter').addEventListener('pointermove',event=>showPoint(nearestPoint(event)));
  $('scatter').addEventListener('pointerleave',()=>{$('scatterTip').hidden=true;});
  $('scatter').addEventListener('click',event=>{const point=nearestPoint(event);showPoint(point);if(point&&sampleMap.has(point.id))selectExample(point.id,{scroll:true});});
  $('previousPage').addEventListener('click',()=>{state.page--;renderTable();});$('nextPage').addEventListener('click',()=>{state.page++;renderTable();});
  $('dataTableBody').addEventListener('click',event=>{const button=event.target.closest('[data-open]');if(button)selectExample(button.dataset.open,{scroll:true});});
  let toastTimer;
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},3200);}
  async function copy(text){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const textarea=document.createElement('textarea');textarea.value=text;textarea.style.position='fixed';textarea.style.opacity='0';document.body.append(textarea);textarea.select();const ok=document.execCommand('copy');textarea.remove();if(!ok)throw new Error('copy');}toast(t('copied'));}catch(_){let box=$('manualCopy');if(!box){box=document.createElement('textarea');box.id='manualCopy';box.style.cssText='position:fixed;inset:25% 10%;width:80%;height:40%;z-index:101;padding:20px;background:white;border:2px solid #377864;';box.setAttribute('aria-label','Select and copy this text. Press Escape to close.');document.body.append(box);box.addEventListener('keydown',e=>{if(e.key==='Escape')box.remove();});}box.value=text;box.focus();box.select();toast(t('copyFailed'));}}
  function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('copyAnnotation').addEventListener('click',()=>copy(JSON.stringify(annotation(),null,2)));
  $('downloadExample').addEventListener('click',()=>download(`${sample().id}.json`,JSON.stringify(annotation(),null,2)+'\n','application/json'));
  $('shareExample').addEventListener('click',()=>{const url=new URL(location.href);url.searchParams.set('sample',state.sampleId);url.searchParams.set('lang',state.lang);url.hash='listen';copy(url.href);});
  $('exportCsv').addEventListener('click',()=>{const rows=[['id','task','duration_seconds','original_interval_count','multi_target','coverage_fraction'],...filteredPoints().map(p=>[p.id,taskMap.get(p.task).tag,p.duration,p.count,p.multi,p.coverage])];const text=rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');download('tagbench-filtered.csv',text+'\r\n','text/csv;charset=utf-8');toast(t('exportDone'));});
  const citation='@misc{dai2026tagbench,\n  title={TAG-Bench: Benchmarking Temporal Audio Grounding in Large Audio Language Models},\n  author={Yuhang Dai and Xin Shu and Zengxi Li and Lei Xie and Xiangang Li and Jianwei Yu},\n  year={2026},\n  eprint={2609.01542},\n  archivePrefix={arXiv},\n  primaryClass={eess.AS},\n  url={https://arxiv.org/abs/2609.01542}\n}';
  $('copyCitation').addEventListener('click',()=>copy(citation));
  $('language').addEventListener('click',()=>{state.lang=state.lang==='en'?'zh':'en';try{localStorage.setItem('tagbench-language',state.lang);}catch(_){}applyLanguage();updateUrl();});
  let resizeFrame;
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{drawHero();drawScatter();renderPairs();drawSignal();});});
  observer.observe(document.querySelector('.hero-grid'));observer.observe($('scatter'));observer.observe($('signalCanvas'));
  applyLanguage();selectExample(state.sampleId);requestAnimationFrame(()=>{drawHero();drawScatter();renderPairs();drawSignal();});
})();
