// xkmyth 下载中心
// 1) 星空背景由 /sub.js 统一提供
// 2) GitHub Releases 实时数据（localStorage 缓存 10 分钟，失败优雅降级）
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========== Releases 实时数据 ========== */
  var API = 'https://api.github.com/repos/xkmyth/xkmyth';
  var CACHE_KEY = 'xkmyth-releases-cache';
  var TTL = 10 * 60 * 1000;

  function humanSize(bytes) {
    if (bytes == null) return '—';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return n.toFixed(n >= 100 || i === 0 ? 0 : 1) + ' ' + units[i];
  }

  function fetchWithCache() {
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { /* ignore */ }
    if (cached && Date.now() - cached.ts < TTL) {
      return Promise.resolve(cached.data);
    }
    var urls = [
      API + '/releases?per_page=5',
      API + '/releases/latest'
    ];
    return Promise.all(urls.map(function (u) {
      return fetch(u, { headers: { Accept: 'application/vnd.github+json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); });
    })).then(function (parts) {
      var data = { list: parts[0], latest: parts[1] };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) { /* 隐私模式 */ }
      return data;
    });
  }

  function renderCards(data) {
    var latest = data.latest || {};
    var assets = latest.assets || [];
    var byName = {};
    assets.forEach(function (a) { byName[a.name] = a; });

    document.querySelectorAll('.dl-card[data-asset]').forEach(function (card) {
      var asset = byName[card.getAttribute('data-asset')];
      var ver = card.querySelector('[data-field="ver"]');
      var size = card.querySelector('[data-field="size"]');
      var count = card.querySelector('[data-field="count"]');
      if (!asset) {
        card.classList.add('missing');
        if (ver) ver.textContent = '本版暂无此包';
        if (size) size.textContent = '—';
        if (count) count.textContent = '—';
        return;
      }
      if (ver) ver.textContent = latest.tag_name || '';
      if (size) size.textContent = humanSize(asset.size);
      if (count) count.textContent = '已下载 ' + (asset.download_count || 0) + ' 次';
    });

    var note = document.getElementById('releaseNote');
    if (note) {
      var d = latest.published_at ? new Date(latest.published_at) : null;
      note.textContent = '最新发行：' + (latest.tag_name || '—') +
        (d ? ' · ' + d.toISOString().slice(0, 10) : '');
    }
  }

  function renderHistory(list) {
    var box = document.getElementById('releaseList');
    if (!box) return;
    box.textContent = '';
    (list || []).forEach(function (rel) {
      var row = document.createElement('a');
      row.className = 'rel-row';
      row.href = rel.html_url;
      row.target = '_blank';
      row.rel = 'noopener';

      var tag = document.createElement('span');
      tag.className = 'rel-tag';
      tag.textContent = rel.tag_name;

      var date = document.createElement('span');
      date.className = 'rel-date';
      date.textContent = rel.published_at ? rel.published_at.slice(0, 10) : '';

      var body = document.createElement('span');
      body.className = 'rel-body';
      var text = (rel.body || '').replace(/[#*`\[\]()]/g, '').trim();
      body.textContent = text ? text.split('\n')[0].slice(0, 60) : '（无更新说明）';

      var count = document.createElement('span');
      count.className = 'rel-assets';
      count.textContent = (rel.assets || []).length + ' 个文件';

      row.appendChild(tag); row.appendChild(date); row.appendChild(body); row.appendChild(count);
      box.appendChild(row);
    });
  }

  fetchWithCache().then(function (data) {
    renderCards(data);
    renderHistory(data.list);
  }).catch(function () {
    // 网络失败：保留静态链接（latest/download 依然有效），仅标注状态
    var note = document.getElementById('releaseNote');
    if (note) note.textContent = '无法连接 GitHub API，展示缓存/默认信息（下载链接仍可用）';
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) { /* ignore */ }
    if (cached) {
      renderCards(cached.data);
      renderHistory(cached.data.list);
    }
  });

  /* ========== 页脚年份 ========== */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
