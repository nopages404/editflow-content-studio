const STORAGE_KEY = 'editflow-v1';
const PLATFORMS = [
  'Naver Blog', 'Tistory', 'Google Blogger', 'WordPress', 'Medium',
  'Instagram', 'Facebook', 'Threads', 'LinkedIn', 'Remember', 'X', 'Pinterest'
];
const STEP_NAMES = ['IDEA', 'KEYWORDS', 'MASTER', 'DISTRIBUTE'];

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now = () => new Date().toISOString();
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate = iso => new Intl.DateTimeFormat('ko-KR', {year:'numeric', month:'short', day:'numeric'}).format(new Date(iso));

const defaultBrand = {
  id: 'default-brand', name: 'My Brand', description: '복잡한 정보를 선명하고 실용적인 콘텐츠로 전달합니다.',
  audience: '새로운 도구와 인사이트를 빠르게 실무에 적용하고 싶은 사람', voice: '신뢰감 있고 명료한 전문가',
  tone: '친근하지만 가볍지 않게', preferred: '실전, 핵심, 바로 적용', avoided: '무조건, 대박, 충격',
  topics: '콘텐츠, 브랜딩, 생산성, AI', ctaStyle: '독자가 바로 시도할 수 있는 한 가지 행동 제안'
};

const emptyProject = topic => ({
  id: uid(), name: topic ? `${topic} 콘텐츠` : '새 콘텐츠 프로젝트', topic: topic || '', currentStep: 0,
  createdAt: now(), updatedAt: now(), brandProfileId: 'default-brand', ideas: [], selectedIdea: null,
  keywords: { main: [], related: [], longtail: [], intent: '', angle: '' }, masterContent: '',
  selectedPlatforms: ['Naver Blog', 'Instagram', 'LinkedIn'], distribution: {}
});

const initialState = { view: 'dashboard', activeProjectId: null, activePlatform: null, brandModal: false, loading: false };
let appState = {...initialState};
let data = loadData();

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.projects && stored?.brands) return stored;
  } catch (_) {}
  return { projects: [], brands: [defaultBrand] };
}

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function activeProject() { return data.projects.find(p => p.id === appState.activeProjectId); }
function activeBrand(project = activeProject()) { return data.brands.find(b => b.id === project?.brandProfileId) || data.brands[0]; }
function touch(project) { project.updatedAt = now(); persist(); updateAutosave(); }

function updateAutosave() {
  const el = document.querySelector('.autosave');
  if (el) el.textContent = '방금 자동 저장됨';
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 1900);
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class MockAIService {
  async ideas(topic, brand) {
    await wait(650);
    const templates = [
      [`${topic}, 시작하기 전에 꼭 알아야 할 7가지`, `처음 시작하는 사람이 흔히 놓치는 핵심 원칙과 실전 체크리스트를 정리합니다.`, '신뢰 형성·정보 제공', `${topic} 입문자`, '가이드형'],
      [`요즘 ${topic}이 달라진 이유`, `최근 변화의 배경과 앞으로 주목해야 할 흐름을 사례 중심으로 분석합니다.`, '전문성 강화·관심 유도', '트렌드에 민감한 실무자', '트렌드형'],
      [`잘되는 ${topic}에는 공통점이 있다`, `성과를 만드는 사람과 브랜드의 공통 패턴을 5가지 관점으로 해석합니다.`, '인사이트 전달', '성장을 원하는 중급 사용자', '인사이트형'],
      [`${topic} A to Z: 가장 현실적인 실행 로드맵`, `계획부터 실행, 점검까지 단계별로 바로 적용 가능한 방법을 제공합니다.`, '저장·공유 유도', '실행 방법을 찾는 독자', '정보형'],
      [`${topic}, 직접 해보니 알게 된 것들`, `기대와 현실의 차이, 시행착오, 시간을 아껴준 선택을 솔직하게 공유합니다.`, '공감·관계 형성', '실제 경험을 궁금해하는 독자', '비교형'],
      [`${topic}을 성과로 연결하는 가장 짧은 방법`, `불필요한 과정을 덜어내고 핵심 행동과 도구에 집중하는 전환형 콘텐츠입니다.`, '문의·구매 전환', brand.audience, '판매/전환형']
    ];
    return templates.map((x, i) => ({ id: uid(), title:x[0], summary:x[1], purpose:x[2], target:x[3], type:x[4], index:i }));
  }

  async keywords(project) {
    await wait(600);
    const topic = project.topic;
    const title = project.selectedIdea?.title || topic;
    return {
      main: [topic, `${topic} 가이드`],
      related: [`${topic} 시작하기`, `${topic} 전략`, `${topic} 사례`, `${topic} 노하우`, `${topic} 트렌드`],
      longtail: [`초보자를 위한 ${topic} 방법`, `${topic} 잘하는 법`, `${topic} 실전 체크리스트`, `${topic} 최신 사례`],
      intent: `${topic}에 대한 구체적인 실행 방법과 신뢰할 수 있는 판단 기준을 찾는 정보 탐색 의도`,
      angle: `“${title}”을 독자가 오늘 바로 적용할 수 있는 단계와 실제 사례 중심으로 설명`
    };
  }

  async master(project, brand) {
    await wait(750);
    const idea = project.selectedIdea;
    const k = project.keywords.main[0] || project.topic;
    return `# ${idea.title}\n\n## Hook\n${k}을 잘하는 사람은 더 많은 일을 하지 않습니다. 무엇을 먼저 해야 하는지 알고 있을 뿐입니다.\n\n## Introduction\n${idea.summary} 이 글에서는 막연한 설명 대신, 처음 시작하는 사람도 바로 적용할 수 있는 기준과 순서를 살펴봅니다. ${brand.name}의 관점에서 핵심만 명료하게 정리했습니다.\n\n## 1. 목표보다 먼저 기준을 세우세요\n좋은 결과는 선명한 기준에서 시작합니다. 누구에게 어떤 변화를 만들 것인지 한 문장으로 적어보세요. 기준이 분명하면 도구와 형식을 고르는 일이 훨씬 쉬워집니다.\n\n## 2. 작게 실행하고 빠르게 확인하세요\n완벽한 계획을 기다리기보다 가장 작은 단위로 시작하세요. 첫 결과를 확인하고 반응이 좋았던 요소는 남기고, 불필요한 요소는 덜어내는 방식이 효율적입니다.\n\n## 3. 반복 가능한 흐름을 만드세요\n한 번의 성공보다 중요한 것은 다시 만들 수 있는 시스템입니다. 아이디어, 제작, 검토, 배포의 과정을 체크리스트로 만들면 품질을 유지하면서 속도를 높일 수 있습니다.\n\n## 핵심 포인트\n- 목표 독자와 기대 행동을 먼저 정의합니다.\n- 작은 결과물을 빠르게 만들고 반응을 확인합니다.\n- 잘된 과정을 기록해 반복 가능한 시스템으로 바꿉니다.\n- ${project.keywords.related.slice(0,3).join(', ')}을 함께 고려합니다.\n\n## Conclusion\n${k}의 성패를 가르는 것은 거창한 도구가 아니라 선명한 기준과 꾸준한 실행입니다. 오늘 할 수 있는 가장 작은 한 단계를 정하고 시작해 보세요.\n\n## CTA\n지금 가장 먼저 바꾸고 싶은 한 가지는 무엇인가요? 한 문장으로 적고 오늘 바로 첫 실험을 시작해 보세요.`;
  }

  async refine(content, action) {
    await wait(420);
    const additions = {
      '더 전문적으로':'\n\n> 전문가의 관점: 실행 결과를 정성적 반응과 정량적 지표로 함께 기록하면 다음 의사결정의 정확도가 높아집니다.',
      '더 쉽게':'\n\n쉽게 말하면, “작게 만들고 → 반응을 보고 → 좋은 점만 남기는 것”입니다.',
      '더 감성적으로':'\n\n완벽한 시작을 기다리던 시간도 결국 당신만의 기준을 만드는 과정이었습니다. 이제 작은 한 걸음이면 충분합니다.',
      '더 간결하게':'',
      '내용 확장':'\n\n## 실행 체크리스트\n1. 목표 독자를 한 문장으로 정의하기\n2. 이번 콘텐츠의 핵심 메시지 하나 고르기\n3. 30분 안에 초안 만들기\n4. 반응을 기록하고 다음 버전에 반영하기',
      '사례 추가':'\n\n## 짧은 사례\n한 소규모 브랜드는 매번 새로 기획하던 방식을 버리고 하나의 원본 콘텐츠를 채널별로 변환했습니다. 제작 시간은 줄고 메시지의 일관성은 높아졌습니다.',
      'Hook 개선':'\n\n**좋은 결과를 만드는 사람과 그렇지 않은 사람의 차이는, 시작 전 10분에 결정됩니다.**',
      'CTA 개선':'\n\n**오늘 10분만 투자해 첫 번째 초안을 만들어 보세요. 시작한 뒤에야 보이는 다음 단계가 있습니다.**'
    };
    if (action === '더 간결하게') return content.split('\n').filter((_,i) => i % 5 !== 3).join('\n');
    return content + (additions[action] || '');
  }

  async distribute(project, platform) {
    await wait(260);
    const title = project.selectedIdea.title;
    const topic = project.topic;
    const core = `선명한 기준을 세우고, 작게 실행한 뒤, 잘된 과정을 반복 가능한 시스템으로 만드는 것`;
    const variants = {
      'Naver Blog': `[검색 친화 제목]\n${title}｜초보자도 바로 적용하는 ${topic} 실전 가이드\n\n안녕하세요. 오늘은 ${topic}을 시작할 때 꼭 알아야 할 핵심을 정리합니다.\n\n1. 목표보다 기준을 먼저 세우기\n누구에게 어떤 변화를 만들 것인지 한 문장으로 정리하세요.\n\n2. 작게 시작하고 빠르게 검증하기\n완벽한 계획보다 작은 실행이 더 많은 정보를 줍니다.\n\n3. 반복 가능한 흐름 만들기\n아이디어 → 제작 → 검토 → 배포 과정을 체크리스트로 남겨보세요.\n\n결국 중요한 것은 ${core}입니다. 오늘 할 수 있는 첫 단계를 시작해 보세요.`,
      'Tistory': `TITLE\n${title}｜${topic}을 제대로 시작하는 3단계\n\nSUMMARY\n${topic}을 시작할 때 필요한 기준과 실행 순서, 반복 가능한 시스템을 실전 관점에서 정리했습니다.\n\n## ${topic}, 무엇부터 시작해야 할까?\n처음부터 완벽한 계획을 만들기보다 목표 독자와 기대 행동을 먼저 정하는 것이 중요합니다.\n\n## 실행을 만드는 세 가지 원칙\n1. 목표보다 판단 기준을 먼저 세웁니다.\n2. 가장 작은 단위로 실행하고 반응을 확인합니다.\n3. 잘된 과정을 기록해 다음 작업에 재사용합니다.\n\n## 마무리\n핵심은 ${core}입니다. 오늘 실행할 가장 작은 한 가지를 정해보세요.\n\nTAGS\n${project.keywords.main.concat(project.keywords.related.slice(0,4)).join(', ')}`,
      'Google Blogger': `POST TITLE\n${title}: A Practical Guide to ${topic}\n\nSEARCH DESCRIPTION\n${topic}을 더 효과적으로 시작하기 위한 핵심 기준과 단계별 실행법을 알아보세요.\n\nPOST BODY\n${project.masterContent}\n\nLABELS\n${project.keywords.main.concat(project.keywords.related.slice(0,3)).join(', ')}`,
      'WordPress': `SEO TITLE\n${title} — ${topic} 실전 가이드\n\nMETA DESCRIPTION\n${topic}을 효과적으로 시작하는 기준, 실행법, 반복 시스템을 단계별로 알아보세요.\n\nSLUG\n${topic.toLowerCase().replace(/\s+/g,'-')}-practical-guide\n\nBODY\n${project.masterContent}\n\nTAGS\n${project.keywords.main.concat(project.keywords.related.slice(0,3)).join(', ')}`,
      'Medium': `${title}\n\n${topic}을 잘하는 사람은 더 많은 일을 하지 않습니다. 무엇을 먼저 해야 하는지 알고 있을 뿐입니다.\n\n---\n\n## Start with a clear standard\n누구에게 어떤 변화를 만들 것인지 한 문장으로 정리하세요. 선명한 기준은 더 나은 도구보다 강력합니다.\n\n## Build, learn, and refine\n가장 작은 결과를 만들고 실제 반응을 관찰하세요. 배운 것을 다음 버전에 반영하면 실행할수록 콘텐츠가 좋아집니다.\n\n## Turn the process into a system\n좋은 결과를 만든 과정을 기록하고 반복 가능한 흐름으로 바꾸세요.\n\n결국 중요한 것은 ${core}입니다.\n\n*오늘 시작할 수 있는 가장 작은 실험은 무엇인가요?*\n\nTOPICS\n${project.keywords.main.concat(project.keywords.related.slice(0,3)).join(' · ')}`,
      'Instagram': `막막한 ${topic}, 시작이 어려운 진짜 이유.\n\n더 많이 알아야 해서가 아니라\n‘무엇부터 할지’ 기준이 없기 때문입니다.\n\n✓ 목표 독자를 한 문장으로 정하기\n✓ 30분 안에 첫 결과 만들기\n✓ 반응을 기록해 다음 버전에 반영하기\n\n완벽한 시작보다 작은 실행이 더 멀리 갑니다.\n오늘 시작할 한 가지를 댓글로 남겨보세요 👇\n\n#${topic.replace(/\s/g,'')} #콘텐츠전략 #실전가이드 #생산성 #브랜딩`,
      'Facebook': `${topic}, 어디서부터 시작해야 할지 막막한가요?\n\n많이 아는 것보다 먼저 필요한 건 선명한 기준입니다.\n\n① 누구에게 어떤 변화를 만들지 정하고\n② 가장 작은 결과를 빠르게 만든 뒤\n③ 반응이 좋았던 과정을 반복해 보세요.\n\n완벽하게 준비될 때까지 기다리기보다 작은 실행에서 배우는 편이 빠릅니다. 핵심은 ${core}입니다.\n\n여러분이 오늘 시작하고 싶은 한 가지는 무엇인가요? 댓글로 나눠주세요.`,
      'Threads': `${topic}, 잘하려고 너무 오래 준비하지 마세요.\n\n1/ 기준을 먼저 세우고\n2/ 가장 작은 결과를 만든 다음\n3/ 반응이 좋았던 것만 남기세요.\n\n완벽한 계획보다 빠른 피드백이 훨씬 정확합니다.\n\n여러분은 지금 어느 단계에 있나요?`,
      'LinkedIn': `성과를 만드는 사람은 더 많은 일을 하지 않습니다.\n무엇을 반복해야 하는지 알고 있습니다.\n\n${topic}을 효과적으로 실행하는 과정도 같습니다.\n\n첫째, 목표 독자와 기대 행동을 명확히 정의합니다.\n둘째, 가장 작은 단위로 실행해 반응을 확인합니다.\n셋째, 잘된 과정을 기록해 시스템으로 만듭니다.\n\n핵심은 ${core}입니다.\n\n여러분의 팀은 어떤 과정을 시스템화하고 있나요?`,
      'Remember': `일을 잘하는 사람은 ‘더 많이’보다 ‘무엇을 반복할지’를 먼저 결정합니다.\n\n${topic}에서도 마찬가지였습니다. 제가 현장에서 효과를 본 순서는 다음과 같습니다.\n\n1. 목표 독자와 기대 결과를 한 문장으로 정의합니다.\n2. 최소 단위로 실행해 실제 반응을 확인합니다.\n3. 성과가 난 과정을 기록해 팀의 시스템으로 만듭니다.\n\n결국 ${core}이 성과의 차이를 만듭니다.\n\n실무에서 여러분이 반복 가능하게 만든 프로세스가 있다면 경험을 나눠주세요.`,
      'X': `${topic}을 잘하는 가장 현실적인 방법:\n\n1. 목표보다 기준을 먼저 세운다\n2. 작게 실행하고 빨리 확인한다\n3. 잘된 과정을 시스템으로 만든다\n\n완벽한 계획보다 작은 실행이 더 많은 답을 준다.`,
      'Pinterest': `PIN TITLE\n${title}: 한눈에 보는 실전 체크리스트\n\nDESCRIPTION\n${topic}을 처음 시작하는 분을 위한 단계별 가이드. 목표 설정부터 작은 실행, 반복 가능한 시스템을 만드는 방법까지 저장해 두고 활용하세요.\n\nKEYWORDS\n${project.keywords.main.concat(project.keywords.longtail.slice(0,3)).join(', ')}`
    };
    return variants[platform];
  }
}

const AIService = new MockAIService();

function render() {
  document.getElementById('app').innerHTML = `
    <div class="app-shell">
      ${topbar()}
      ${appState.view === 'dashboard' ? dashboardView() : studioView()}
    </div>
    ${appState.brandModal ? brandModal() : ''}`;
  bindEvents();
}

function topbar() {
  return `<header class="topbar">
    <div class="brand-lockup" data-action="dashboard"><span class="brand-mark">EF</span><span class="brand-name">EDITFLOW</span></div>
    <div class="top-actions">
      ${appState.view === 'studio' ? '<span class="autosave">자동 저장됨</span>' : ''}
      <button class="btn small" data-action="brand">Brand Profile</button>
    </div>
  </header>`;
}

function dashboardView() {
  const sorted = [...data.projects].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt));
  return `<main class="dashboard">
    <section class="dashboard-head">
      <div><span class="eyebrow">AI Content Operating System</span><h1 class="display-title">One idea.<br>Every channel.</h1><p class="display-sub">하나의 아이디어를 발견하고, 다듬고, 모든 플랫폼에 맞는 콘텐츠로 확장하세요. 콘텐츠가 중심이 되는 조용하고 강력한 작업 공간입니다.</p></div>
      <button class="new-project-card" data-action="new-project"><span class="plus">＋</span><span><small>START FROM AN IDEA</small><br><strong>새 프로젝트</strong></span></button>
    </section>
    <section><div class="section-head"><h2>Recent projects</h2><span>${sorted.length} PROJECT${sorted.length === 1 ? '' : 'S'}</span></div>
      ${sorted.length ? `<div style="overflow:auto"><table class="project-table"><thead><tr><th>Project name</th><th>Topic</th><th>Current step</th><th>Created</th><th>Last updated</th></tr></thead><tbody>${sorted.map(p => `<tr data-id="${p.id}"><td><span class="project-name">${escapeHtml(p.name)}</span></td><td><span class="topic-text">${escapeHtml(p.topic || '주제 미정')}</span></td><td><span class="step-pill">0${p.currentStep+1} ${STEP_NAMES[p.currentStep]}</span></td><td>${formatDate(p.createdAt)}</td><td>${formatDate(p.updatedAt)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state">아직 프로젝트가 없습니다. 첫 아이디어를 시작해 보세요.</div>`}
    </section>
  </main>`;
}

function studioView() {
  const p = activeProject();
  if (!p) { appState.view = 'dashboard'; return dashboardView(); }
  return `<div class="studio">
    <aside class="studio-sidebar"><button class="back-link" data-action="dashboard">← Dashboard</button><span class="project-label">Project name</span><input class="project-title-input" id="projectName" value="${escapeHtml(p.name)}" aria-label="프로젝트 이름" />
      <nav class="steps">${STEP_NAMES.map((s,i) => `<div class="step ${i===p.currentStep?'active':''} ${i<p.currentStep?'complete':''}" data-step="${i}"><span class="step-num">${i<p.currentStep?'✓':`0${i+1}`}</span><div><strong>${s}</strong><span>${['주제 기획','키워드 설계','원본 콘텐츠','채널별 변환'][i]}</span></div></div>`).join('')}</nav>
      <div class="sidebar-foot">SOURCE OF TRUTH<br>Master Content 기반 워크플로우</div>
    </aside>
    <main class="studio-main">${stageView(p)}</main>
  </div>`;
}

function stageHeader(no, title, desc) { return `<header class="stage-header"><span class="stage-no">0${no} / 04</span><h1>${title}</h1><p>${desc}</p></header>`; }

function stageView(p) {
  if (p.currentStep === 0) return ideaStage(p);
  if (p.currentStep === 1) return keywordStage(p);
  if (p.currentStep === 2) return masterStage(p);
  return distributeStage(p);
}

function ideaStage(p) {
  return `${stageHeader(1,'Find the angle.','큰 주제를 입력하면 실제 콘텐츠로 발전시킬 수 있는 구체적인 아이디어를 제안합니다.')}
    <div class="field"><label for="topicInput">Big topic or category</label><div class="topic-row"><input id="topicInput" class="text-input topic-input" placeholder="예: AI 자동화" value="${escapeHtml(p.topic)}"/><button class="btn accent" data-action="generate-ideas" ${appState.loading?'disabled':''}>${p.ideas.length?'다시 제안':'아이디어 제안'} →</button></div><div class="suggestion-row">${['실내 식물','브랜딩','AI 자동화','여행'].map(x=>`<button class="suggestion" data-topic="${x}">${x}</button>`).join('')}</div></div>
    ${appState.loading ? '<div class="loading">콘텐츠가 될 만한 각도를 찾고 있습니다…</div>' : ''}
    ${!appState.loading && p.ideas.length ? `<div class="idea-list">${p.ideas.map(x => `<article class="idea-card ${p.selectedIdea?.id===x.id?'selected':''}" data-idea="${x.id}"><span class="radio"></span><div><div class="idea-title">${escapeHtml(x.title)}</div><div class="idea-summary">${escapeHtml(x.summary)}</div></div><div class="idea-meta"><span class="type-label">${x.type}</span><br>목적 · ${escapeHtml(x.purpose)}<br>타깃 · ${escapeHtml(x.target)}</div></article>`).join('')}</div>` : ''}
    ${p.selectedIdea ? `<section class="selected-editor"><span class="field-label">Selected idea — 직접 수정 가능</span><div class="editor-grid"><div class="field"><label>콘텐츠 제목</label><input class="text-input" data-idea-field="title" value="${escapeHtml(p.selectedIdea.title)}"></div><div class="field"><label>콘텐츠 유형</label><select class="select" data-idea-field="type">${['정보형','가이드형','비교형','인사이트형','트렌드형','판매/전환형'].map(x=>`<option ${x===p.selectedIdea.type?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>핵심 내용</label><textarea class="text-area" data-idea-field="summary">${escapeHtml(p.selectedIdea.summary)}</textarea></div><div><div class="field"><label>콘텐츠 목적</label><input class="text-input" data-idea-field="purpose" value="${escapeHtml(p.selectedIdea.purpose)}"></div><div class="field"><label>예상 타깃</label><input class="text-input" data-idea-field="target" value="${escapeHtml(p.selectedIdea.target)}"></div></div></div></section>`:''}
    <div class="step-actions"><button class="btn ghost" data-action="dashboard">취소</button><button class="btn primary" data-action="next" ${!p.selectedIdea?'disabled':''}>키워드 만들기 →</button></div>`;
}

function keywordTags(items, type) { return `<div class="tags">${items.map((x,i)=>`<span class="tag ${type==='main'?'main':''}">${escapeHtml(x)}<button data-remove-tag="${type}:${i}" aria-label="삭제">×</button></span>`).join('')}<span class="tag-add"><input placeholder="+ 키워드 추가" data-add-tag="${type}" /></span></div>`; }

function keywordStage(p) {
  return `${stageHeader(2,'Shape the search.','아이디어의 검색 맥락과 콘텐츠 각도를 설계하세요. 선택한 모든 키워드는 Master Content에 반영됩니다.')}
    ${appState.loading ? '<div class="loading">검색 의도와 키워드 맥락을 설계하고 있습니다…</div>' : `<div class="keyword-section"><div class="keyword-section-head"><h3>Main Keyword</h3><span>핵심 주제</span></div>${keywordTags(p.keywords.main,'main')}</div>
    <div class="keyword-section"><div class="keyword-section-head"><h3>Related Keywords</h3><span>의미적 연관어</span></div>${keywordTags(p.keywords.related,'related')}</div>
    <div class="keyword-section"><div class="keyword-section-head"><h3>Long-tail Keywords</h3><span>구체적 검색 문구</span></div>${keywordTags(p.keywords.longtail,'longtail')}</div>
    <div class="intent-angle"><div class="insight-box"><strong>Search Intent</strong><textarea data-keyword-field="intent">${escapeHtml(p.keywords.intent)}</textarea></div><div class="insight-box" style="background:var(--yellow)"><strong>Content Angle</strong><textarea data-keyword-field="angle">${escapeHtml(p.keywords.angle)}</textarea></div></div>`}
    <div class="step-actions"><button class="btn" data-action="prev">← 아이디어</button><div><button class="btn ghost" data-action="regenerate-keywords">다시 생성</button> <button class="btn primary" data-action="next" ${!p.keywords.main.length||appState.loading?'disabled':''}>원본 작성 →</button></div></div>`;
}

function masterStage(p) {
  const tools = ['더 전문적으로','더 쉽게','더 감성적으로','더 간결하게','내용 확장','사례 추가','Hook 개선','CTA 개선'];
  return `${stageHeader(3,'Write the source.','모든 플랫폼 콘텐츠의 기준이 되는 원본입니다. 직접 편집하거나 AI와 함께 원하는 방향으로 다듬으세요.')}
    ${appState.loading ? '<div class="loading">브랜드 보이스와 키워드를 반영해 원본을 쓰고 있습니다…</div>' : `<div class="master-layout"><div class="editor-paper"><div class="editor-toolbar"><span>MASTER CONTENT · MARKDOWN</span><button class="btn ghost small" data-action="regenerate-master">전체 다시 생성</button></div><textarea id="masterEditor" class="editor-content" aria-label="Master Content">${escapeHtml(p.masterContent)}</textarea></div><aside class="ai-tools"><h3>AI refine</h3>${tools.map(x=>`<button class="ai-action" data-refine="${x}">↗ ${x}</button>`).join('')}<div class="word-count">${p.masterContent.replace(/[#*>\-]/g,'').trim().length} CHARACTERS</div></aside></div>`}
    <div class="step-actions"><button class="btn" data-action="prev">← 키워드</button><button class="btn primary" data-action="next" ${!p.masterContent||appState.loading?'disabled':''}>플랫폼 변환 →</button></div>`;
}

function distributeStage(p) {
  const generated = Object.keys(p.distribution);
  const active = appState.activePlatform && p.distribution[appState.activePlatform] ? appState.activePlatform : generated[0];
  appState.activePlatform = active;
  return `${stageHeader(4,'Multiply the message.','Master Content를 각 플랫폼의 문법과 독자 경험에 맞춰 한 번에 변환합니다.')}
    <div class="field"><span class="field-label">Select platforms</span><div class="platform-picker">${PLATFORMS.map(x=>`<label class="platform-check"><input type="checkbox" data-platform="${x}" ${p.selectedPlatforms.includes(x)?'checked':''}> ${x}</label>`).join('')}</div><button class="btn accent" data-action="generate-distribution" ${!p.selectedPlatforms.length||appState.loading?'disabled':''}>${generated.length?'선택 플랫폼 다시 변환':'모든 버전 생성'} →</button></div>
    ${appState.loading ? '<div class="loading">각 플랫폼의 문법으로 콘텐츠를 재구성하고 있습니다…</div>' : ''}
    ${!appState.loading && generated.length ? `<section class="distribution-wrap"><div class="platform-tabs">${generated.map(x=>`<button class="platform-tab ${x===active?'active':''}" data-platform-tab="${x}">${x}</button>`).join('')}</div><div class="platform-result"><div class="result-head"><strong>${active}</strong><div class="result-actions"><button class="btn small" data-result-action="copy">Copy</button><button class="btn small" data-result-action="regenerate">Regenerate</button><button class="btn primary small" data-result-action="save">Save</button></div></div><textarea class="result-editor" id="resultEditor" aria-label="${active} 콘텐츠">${escapeHtml(p.distribution[active])}</textarea></div></section>`:''}
    <div class="step-actions"><button class="btn" data-action="prev">← 원본 콘텐츠</button><button class="btn primary" data-action="dashboard">프로젝트 완료</button></div>`;
}

function brandModal() {
  const b = activeBrand() || data.brands[0];
  const fields = [['name','Brand Name'],['description','Brand Description'],['audience','Target Audience'],['voice','Brand Voice'],['tone','Tone'],['preferred','Preferred Vocabulary'],['avoided','Avoided Expressions'],['topics','Main Topics'],['ctaStyle','CTA Style']];
  return `<div class="modal-backdrop" data-action="close-brand"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="brandTitle" onclick="event.stopPropagation()"><div class="modal-head"><div><span class="eyebrow">Content consistency</span><h2 id="brandTitle">Brand Profile</h2></div><button class="icon-btn" data-action="close-brand">×</button></div><div class="modal-grid">${fields.map(([key,label],i)=>`<div class="field ${[1,2,8].includes(i)?'wide':''}"><label>${label}</label>${[1,2,8].includes(i)?`<textarea class="text-area" data-brand-field="${key}">${escapeHtml(b[key])}</textarea>`:`<input class="text-input" data-brand-field="${key}" value="${escapeHtml(b[key])}">`}</div>`).join('')}</div><div class="modal-actions"><button class="btn" data-action="close-brand">취소</button><button class="btn primary" data-action="save-brand">프로필 저장</button></div></section></div>`;
}

function openProject(id) { appState.view = 'studio'; appState.activeProjectId = id; appState.activePlatform = null; render(); }

async function generateIdeas() {
  const p = activeProject(); const input = document.getElementById('topicInput'); const topic = input.value.trim();
  if (!topic) return toast('먼저 큰 주제를 입력해 주세요.');
  p.topic = topic; if (p.name === '새 콘텐츠 프로젝트' || !p.name) p.name = `${topic} 콘텐츠`;
  appState.loading = true; touch(p); render();
  p.ideas = await AIService.ideas(topic, activeBrand(p)); p.selectedIdea = null; appState.loading = false; touch(p); render();
}

async function ensureKeywords(p) { appState.loading = true; render(); p.keywords = await AIService.keywords(p); appState.loading = false; touch(p); render(); }
async function ensureMaster(p) { appState.loading = true; render(); p.masterContent = await AIService.master(p, activeBrand(p)); appState.loading = false; touch(p); render(); }

async function nextStep() {
  const p = activeProject();
  if (p.currentStep === 0) { p.currentStep = 1; touch(p); render(); if (!p.keywords.main.length) await ensureKeywords(p); return; }
  if (p.currentStep === 1) { p.currentStep = 2; touch(p); render(); if (!p.masterContent) await ensureMaster(p); return; }
  if (p.currentStep === 2) { p.currentStep = 3; touch(p); render(); }
}

async function generateDistribution() {
  const p = activeProject(); appState.loading = true; render();
  const output = {...p.distribution};
  for (const platform of p.selectedPlatforms) output[platform] = await AIService.distribute(p, platform);
  p.distribution = output; appState.activePlatform = p.selectedPlatforms[0]; appState.loading = false; touch(p); render();
}

function bindEvents() {
  document.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', async e => {
    const action = e.currentTarget.dataset.action;
    if (action === 'dashboard') { appState.view='dashboard'; appState.activeProjectId=null; render(); }
    if (action === 'new-project') { const p=emptyProject(); data.projects.push(p); persist(); openProject(p.id); }
    if (action === 'brand') { appState.brandModal=true; render(); }
    if (action === 'close-brand') { appState.brandModal=false; render(); }
    if (action === 'save-brand') { const b=activeBrand()||data.brands[0]; document.querySelectorAll('[data-brand-field]').forEach(x=>b[x.dataset.brandField]=x.value.trim()); persist(); appState.brandModal=false; render(); toast('Brand Profile을 저장했습니다.'); }
    if (action === 'generate-ideas') await generateIdeas();
    if (action === 'next') await nextStep();
    if (action === 'prev') { const p=activeProject(); p.currentStep=Math.max(0,p.currentStep-1); touch(p); render(); }
    if (action === 'regenerate-keywords') await ensureKeywords(activeProject());
    if (action === 'regenerate-master') await ensureMaster(activeProject());
    if (action === 'generate-distribution') await generateDistribution();
  }));

  document.querySelectorAll('tr[data-id]').forEach(x => x.addEventListener('click',()=>openProject(x.dataset.id)));
  document.querySelectorAll('[data-step]').forEach(x => x.addEventListener('click',()=>{ const p=activeProject(); const next=Number(x.dataset.step); if(next<=p.currentStep || (next===p.currentStep+1 && ((p.currentStep===0&&p.selectedIdea)||(p.currentStep===1&&p.keywords.main.length)||(p.currentStep===2&&p.masterContent)))) { p.currentStep=next; touch(p); render(); } }));
  document.querySelectorAll('[data-topic]').forEach(x=>x.addEventListener('click',()=>{ document.getElementById('topicInput').value=x.dataset.topic; }));
  document.querySelectorAll('[data-idea]').forEach(x=>x.addEventListener('click',()=>{ const p=activeProject(); p.selectedIdea=p.ideas.find(i=>i.id===x.dataset.idea); touch(p); render(); }));
  document.querySelectorAll('[data-idea-field]').forEach(x=>x.addEventListener('input',()=>{ const p=activeProject(); p.selectedIdea[x.dataset.ideaField]=x.value; const found=p.ideas.find(i=>i.id===p.selectedIdea.id); if(found) found[x.dataset.ideaField]=x.value; touch(p); }));
  document.querySelectorAll('[data-remove-tag]').forEach(x=>x.addEventListener('click',()=>{ const [type,index]=x.dataset.removeTag.split(':'); const p=activeProject(); p.keywords[type].splice(Number(index),1); touch(p); render(); }));
  document.querySelectorAll('[data-add-tag]').forEach(x=>x.addEventListener('keydown',e=>{ if(e.key==='Enter' && e.currentTarget.value.trim()) { e.preventDefault(); const p=activeProject(); p.keywords[e.currentTarget.dataset.addTag].push(e.currentTarget.value.trim()); touch(p); render(); } }));
  document.querySelectorAll('[data-keyword-field]').forEach(x=>x.addEventListener('input',()=>{ const p=activeProject(); p.keywords[x.dataset.keywordField]=x.value; touch(p); }));
  document.querySelectorAll('[data-platform]').forEach(x=>x.addEventListener('change',()=>{ const p=activeProject(); p.selectedPlatforms=[...document.querySelectorAll('[data-platform]:checked')].map(i=>i.dataset.platform); touch(p); render(); }));
  document.querySelectorAll('[data-platform-tab]').forEach(x=>x.addEventListener('click',()=>{ appState.activePlatform=x.dataset.platformTab; render(); }));
  document.querySelectorAll('[data-refine]').forEach(x=>x.addEventListener('click',async()=>{ const p=activeProject(); const editor=document.getElementById('masterEditor'); p.masterContent=editor.value; appState.loading=true; render(); p.masterContent=await AIService.refine(p.masterContent,x.dataset.refine); appState.loading=false; touch(p); render(); toast(`${x.dataset.refine} 수정을 반영했습니다.`); }));
  const pn=document.getElementById('projectName'); if(pn) pn.addEventListener('input',()=>{ const p=activeProject(); p.name=pn.value; touch(p); });
  const me=document.getElementById('masterEditor'); if(me) me.addEventListener('input',()=>{ const p=activeProject(); p.masterContent=me.value; touch(p); const wc=document.querySelector('.word-count'); if(wc) wc.textContent=`${me.value.replace(/[#*>\-]/g,'').trim().length} CHARACTERS`; });
  const re=document.getElementById('resultEditor'); if(re) re.addEventListener('input',()=>{ const p=activeProject(); p.distribution[appState.activePlatform]=re.value; touch(p); });
  document.querySelectorAll('[data-result-action]').forEach(x=>x.addEventListener('click',async()=>{ const p=activeProject(); const action=x.dataset.resultAction; const editor=document.getElementById('resultEditor'); if(action==='copy'){ await navigator.clipboard.writeText(editor.value); toast('클립보드에 복사했습니다.'); } if(action==='save'){ p.distribution[appState.activePlatform]=editor.value; touch(p); toast(`${appState.activePlatform} 버전을 저장했습니다.`); } if(action==='regenerate'){ p.distribution[appState.activePlatform]=await AIService.distribute(p,appState.activePlatform); touch(p); render(); toast('새 버전을 생성했습니다.'); } }));
}

render();
