// The canonical public snapshot lives at data/articles.json in the GitHub knowledge repository.
// Keep a local snapshot as a fallback while the hosted site is updated separately.
const CANONICAL_URL = 'https://raw.githubusercontent.com/yokim99/ai-frontier-knowledge/main/data/articles.json';
const state = { filter: 'all', rows: [] };
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLink = url => { try { const u = new URL(url); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const sourceOf = a => {
  const raw = [...(Array.isArray(a.kinds) ? a.kinds : []), ...(Array.isArray(a.sourceTypes) ? a.sourceTypes : []), a.kind].filter(Boolean);
  return [...new Set(raw.flatMap(s => s === '个人收藏' || s === 'saved' ? ['saved'] : s === '日报点赞' || s === 'liked' ? ['liked'] : []))];
};
const groupOf = a => {
  const topic = a.topic || '';
  if (['行业商业化','模型与技术','行业落地','安全与治理'].includes(topic)) {
    return { category: 'AI市场动态', sub: ({'行业商业化':'行业研究与市场','模型与技术':'模型与技术','行业落地':'行业应用','安全与治理':'政策与安全'})[topic] };
  }
  return { category: '产品与运营洞察', sub: ({'Agent 与平台':'产品与生态动态','产品体验':'产品体验与设计','增长与运营':'增长与运营'})[topic] || '产品与生态动态' };
};
const canonicalKey = a => {
  const url = safeLink(a.sourceUrl);
  if (url) { const u = new URL(url); u.hash = ''; [...u.searchParams.keys()].filter(k => /^utm_|^(spm|from|ref)$/i.test(k)).forEach(k => u.searchParams.delete(k)); return u.href.replace(/\/$/, ''); }
  return String(a.id || a.title || '').trim().toLowerCase();
};
function normalize(items) {
  if (!Array.isArray(items)) throw new Error('Invalid article data');
  const map = new Map();
  for (const item of items) {
    if (!item || !item.title || !item.summary || !sourceOf(item).length) continue;
    const key = canonicalKey(item);
    if (!key) continue;
    const current = map.get(key);
    if (!current) map.set(key, { ...item, kinds: sourceOf(item) });
    else {
      current.kinds = [...new Set([...current.kinds, ...sourceOf(item)])];
      if (String(item.date || '') > String(current.date || '')) current.date = item.date;
      // A real recorded reflection may replace a pending or editorial placeholder.
      if (hasReflection(item) && !hasReflection(current)) { current.userReflection = item.userReflection; current.userReflectionStatus = item.userReflectionStatus; }
    }
  }
  return [...map.values()].sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')) || String(a.title).localeCompare(String(b.title),'zh-CN'));
}
function hasReflection(a) {
  const note = String(a.userReflection || a.reflection || '').trim();
  const status = String(a.userReflectionStatus || '').trim();
  if (!note || status === '待补充' || status === '无') return false;
  // Do not present inferred descriptions of a like/save as the user's own opinion.
  if (/你在 AI 洞察晨报中点了赞|更具体的个人(判断|感想)尚未记录|你明确说.{0,30}收录/.test(note)) return false;
  return true;
}
function card(a) {
  const kinds = sourceOf(a);
  const labels = kinds.map(k => '<span class="pill '+k+'">'+(k === 'saved' ? '个人收藏' : '日报点赞')+'</span>').join('');
  const note = hasReflection(a) ? '<div class="reflection"><strong>我的感想</strong><p>'+esc(a.userReflection || a.reflection)+'</p></div>' : '';
  const link = safeLink(a.sourceUrl);
  const where = groupOf(a);
  return '<article class="article"><div class="article-top"><div class="labels">'+labels+'</div><time datetime="'+esc(a.date || '')+'">'+esc(a.date || '')+'</time></div><h4>'+esc(a.title)+'</h4><p class="summary">'+esc(a.summary)+'</p>'+note+'<div class="article-bottom"><span class="topic">'+esc(where.sub)+'</span>'+(link?'<a href="'+esc(link)+'" target="_blank" rel="noopener noreferrer" aria-label="阅读原文：'+esc(a.title)+'">阅读原文 ↗</a>':'')+'</div></article>';
}
function render() {
  const rows = state.rows.filter(a => state.filter === 'all' || sourceOf(a).includes(state.filter));
  $('#total-count').textContent = '共 '+state.rows.length+' 篇';
  $('#view-count').textContent = '显示 '+rows.length+' 篇';
  if (!rows.length) { $('#library-content').innerHTML = '<div class="empty-state">暂无匹配文章</div>'; return; }
  const categories = ['AI市场动态','产品与运营洞察'];
  const groups = {
    'AI市场动态': ['行业研究与市场','模型与技术','行业应用','政策与安全'],
    '产品与运营洞察': ['产品与生态动态','产品体验与设计','增长与运营']
  };
  $('#library-content').innerHTML = categories.map(category => {
    const catRows = rows.filter(a => groupOf(a).category === category);
    if (!catRows.length) return '';
    const sections = groups[category].map(sub => {
      const sectionRows = catRows.filter(a => groupOf(a).sub === sub);
      if (!sectionRows.length) return '';
      return '<h4 class="subheading">'+esc(sub)+'</h4><div class="cards">'+sectionRows.map(card).join('')+'</div>';
    }).join('');
    return '<section class="category"><header class="category-head"><h3>'+category+'</h3><span>'+catRows.length+' 篇</span></header>'+sections+'</section>';
  }).join('');
}
async function readJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Request failed: ' + response.status);
  return normalize(await response.json());
}
async function load() {
  try { state.rows = await readJson(CANONICAL_URL + '?t=' + Date.now()); }
  catch (error) {
    try { state.rows = await readJson('articles.json'); }
    catch { $('#library-content').innerHTML = '<div class="empty-state">文章暂时加载失败，请稍后刷新。</div>'; return; }
  }
  render();
}
$('#source-filters').addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  state.filter = button.dataset.filter;
  document.querySelectorAll('button[data-filter]').forEach(el => {
    const selected = el === button;
    el.classList.toggle('is-active', selected);
    el.setAttribute('aria-pressed', String(selected));
  });
  render();
});
load();
