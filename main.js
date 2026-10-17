// xkmyth 下载中心
// 1) 星空背景（DPR 自适应 / 后台暂停 / 尊重 reduced-motion）
// 2) GitHub Releases 实时数据（localStorage 缓存 10 分钟，失败优雅降级）
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========== 星空背景 ========== */
  var cv = document.getElementById('sky');
  if (cv && !reducedMotion) {
    var ctx = cv.getContext('2d');
    var W, H, stars = [], meteors = [];

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = Math.floor(innerWidth * dpr);
      H = cv.height = Math.floor(innerHeight * dpr);
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = innerWidth; H = innerHeight; // 逻辑像素坐标
      if (!stars.length) seed();
    }

    function seed() {
      stars = [];
      for (var i = 0; i < 160; i++) {
        stars.push({
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random(),
          r: Math.random() * 1.5 + 0.3,
          tw: Math.random() * Math.PI * 2
        });
      }
      meteors = [];
    }

    function spawnMeteor() {
      meteors.push({
        x: Math.random() * W * 0.8 + W * 0.2,
        y: Math.random() * H * 0.25,
        vx: -(Math.random() * 3 + 4),
        vy: Math.random() * 1.6 + 1.6,
        life: 1
      });
    }

    var meteorTimer = setInterval(spawnMeteor, 2600);
    var raf = null, running = false;

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var t = Date.now() / 1000;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var x = (s.x + t * 0.004 * s.z) % 2 - 1;
        var a = 0.3 + 0.7 * Math.abs(Math.sin(s.tw + t * 1.3));
        ctx.globalAlpha = a * (0.4 + 0.6 * s.z);
        ctx.fillStyle = i % 9 === 0 ? '#9ae3ff' : '#fff';
        ctx.beginPath();
        ctx.arc((x + 1) / 2 * W, (s.y + 1) / 2 * H, s.r * (0.5 + s.z), 0, 7);
        ctx.fill();
      }
      for (var j = meteors.length - 1; j >= 0; j--) {
        var m = meteors[j];
        m.x += m.vx; m.y += m.vy; m.life -= 0.012;
        if (m.life <= 0) { meteors.splice(j, 1); continue; }
        var grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
        grad.addColorStop(0, 'rgba(255,255,255,' + m.life + ')');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    resize();
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    start();
  }

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
