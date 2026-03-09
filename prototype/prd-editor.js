/**
 * PRD Editor — 通用可编辑 PRD 面板
 *
 * 使用方式：
 *   <link rel="stylesheet" href="prd-editor.css">
 *   <script src="prd-editor.js"></script>
 *
 * HTML 约定：
 *   每个 .prd-panel 需要 data-prd-key="unique-key" 属性（localStorage 键名）
 *
 * 自动检测两种模式：
 *   Card 模式  — 面板内含 .prd-card 元素
 *   Section 模式 — 面板内含 .prd-section 元素
 *
 * 功能：
 *   - 内容 inline 编辑 + 自动保存（blur 触发）
 *   - 板块拖拽排序
 *   - 板块之间插入新板块
 *   - 板块/条目删除
 *   - 重置为原始内容
 */
(function() {
  'use strict';

  // ================================================================
  //  工具函数
  // ================================================================

  function storageKey(panel) {
    return 'prd-edit-' + (panel.dataset.prdKey || 'default');
  }

  function versionKey(panel) {
    return storageKey(panel) + '-version';
  }

  function showToast(anchor, text) {
    var old = document.querySelector('.prd-save-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.className = 'prd-save-toast';
    toast.textContent = text || '✓ 已保存';
    toast.style.cssText = 'position:fixed;top:56px;right:20px;background:#36A590;color:white;' +
      'padding:4px 12px;border-radius:4px;font-size:12px;opacity:1;transition:opacity 0.3s;' +
      'z-index:9999;pointer-events:none;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; }, 800);
    setTimeout(function() { toast.remove(); }, 1100);
  }

  // ================================================================
  //  模式检测
  // ================================================================

  function detectMode(panel) {
    if (panel.querySelector('.prd-card')) return 'card';
    if (panel.querySelector('.prd-section')) return 'section';
    // 空面板默认 card
    return panel.dataset.prdMode || 'card';
  }

  // ================================================================
  //  Card 模式
  // ================================================================

  var CardMode = {

    serialize: function(panel) {
      var title = panel.querySelector('.prd-title');
      var cards = panel.querySelectorAll('.prd-card');
      var data = { title: title ? title.innerText : '', cards: [] };
      cards.forEach(function(card) {
        var ct = card.querySelector('.prd-card-title');
        var accent = card.style.getPropertyValue('--accent') || '#757980';
        // 行级模式：序列化为 lines 数组
        var lines = card.querySelectorAll('.prd-card-line');
        if (lines.length) {
          var lineArr = [];
          lines.forEach(function(l) {
            var clone = l.cloneNode(true);
            clone.querySelectorAll('.prd-card-line-delete').forEach(function(b) { b.remove(); });
            lineArr.push(clone.innerText);
          });
          data.cards.push({ title: ct ? ct.innerText : '', lines: lineArr, accent: accent.trim() });
        } else {
          // 兼容旧的 body 模式
          var cb = card.querySelector('.prd-card-body');
          data.cards.push({ title: ct ? ct.innerText : '', body: cb ? cb.innerText : '', accent: accent.trim() });
        }
      });
      return data;
    },

    save: function(panel) {
      localStorage.setItem(storageKey(panel), JSON.stringify(CardMode.serialize(panel)));
      if (panel.dataset.prdVersion) localStorage.setItem(versionKey(panel), panel.dataset.prdVersion);
      showToast(panel);
    },

    // ---- 行级操作 ----
    createLine: function(text, card, panel) {
      var line = document.createElement('div');
      line.className = 'prd-card-line';
      line.contentEditable = 'true';
      line.innerText = text;
      var del = document.createElement('button');
      del.className = 'prd-card-line-delete';
      del.textContent = '×';
      del.title = '删除此行';
      del.contentEditable = 'false';
      del.onclick = function(e) {
        e.stopPropagation();
        line.remove();
        if (panel) CardMode.save(panel);
      };
      line.appendChild(del);
      return line;
    },

    createAddLineBtn: function(card, panel) {
      var btn = document.createElement('div');
      btn.className = 'prd-card-add-line';
      btn.textContent = '+ 添加行';
      btn.onclick = function() {
        var line = CardMode.createLine('新内容', card, panel);
        card.insertBefore(line, btn);
        if (panel) CardMode.save(panel);
        line.focus();
      };
      return btn;
    },

    // 将 body 文本拆分为行级元素
    bodyToLines: function(card, bodyText, panel) {
      var lines = bodyText.split('\n').filter(function(s) { return s.trim() !== ''; });
      if (!lines.length) lines = [''];
      lines.forEach(function(text) {
        card.appendChild(CardMode.createLine(text, card, panel));
      });
      card.appendChild(CardMode.createAddLineBtn(card, panel));
    },

    createCard: function(title, linesOrBody, accent, panel) {
      var card = document.createElement('div');
      card.className = 'prd-card';
      card.style.setProperty('--accent', accent);

      var del = document.createElement('button');
      del.className = 'prd-card-delete';
      del.textContent = '×';
      del.title = '删除卡片';
      del.onclick = function() {
        if (confirm('确定删除此卡片？')) {
          var p = card.closest('.prd-panel');
          card.remove();
          CardMode.refreshZones(p);
          CardMode.save(p);
        }
      };

      var ct = document.createElement('div');
      ct.className = 'prd-card-title';
      ct.contentEditable = 'true';
      ct.innerText = title;

      card.appendChild(del);
      card.appendChild(ct);

      // 支持 lines 数组或 body 字符串
      if (Array.isArray(linesOrBody)) {
        linesOrBody.forEach(function(text) {
          card.appendChild(CardMode.createLine(text, card, panel));
        });
        card.appendChild(CardMode.createAddLineBtn(card, panel));
      } else {
        CardMode.bodyToLines(card, linesOrBody || '', panel);
      }

      if (panel) CardMode.enableDrag(card, panel);
      return card;
    },

    // ---- Insert Zone ----
    createInsertZone: function(panel) {
      var zone = document.createElement('div');
      zone.className = 'prd-insert-zone';
      var btn = document.createElement('button');
      btn.className = 'prd-insert-zone-btn';
      btn.textContent = '+';
      btn.title = '在此插入新卡片';
      btn.onclick = function(e) {
        e.stopPropagation();
        var card = CardMode.createCard('新卡片标题', '在此输入内容', '#757980', panel);
        panel.insertBefore(card, zone.nextSibling);
        CardMode.refreshZones(panel);
        CardMode.save(panel);
        card.querySelector('.prd-card-title').focus();
      };
      zone.appendChild(btn);
      return zone;
    },

    refreshZones: function(panel) {
      panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.remove(); });
      var cards = panel.querySelectorAll('.prd-card');
      cards.forEach(function(card) {
        card.parentNode.insertBefore(CardMode.createInsertZone(panel), card);
      });
    },

    // ---- Drag & Drop ----
    enableDrag: function(card, panel) {
      var dragSrcRef = panel._dragSrc || { el: null };
      panel._dragSrc = dragSrcRef;

      card.draggable = true;
      card.addEventListener('dragstart', function(e) {
        if (e.target !== card) return; // Don't drag from contenteditable children
        dragSrcRef.el = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.style.display = 'none'; });
      });
      card.addEventListener('dragend', function() {
        card.classList.remove('dragging');
        dragSrcRef.el = null;
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.style.display = ''; });
      });
      card.addEventListener('dragover', function(e) {
        if (!dragSrcRef.el || dragSrcRef.el === card) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var rect = card.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        var indicator = document.createElement('div');
        indicator.className = 'prd-drop-indicator';
        if (e.clientY < mid) {
          card.parentNode.insertBefore(indicator, card);
        } else {
          card.parentNode.insertBefore(indicator, card.nextSibling);
        }
      });
      card.addEventListener('drop', function(e) {
        e.preventDefault();
        if (!dragSrcRef.el || dragSrcRef.el === card) return;
        var rect = card.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          card.parentNode.insertBefore(dragSrcRef.el, card);
        } else {
          card.parentNode.insertBefore(dragSrcRef.el, card.nextSibling);
        }
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        CardMode.refreshZones(panel);
        CardMode.save(panel);
      });
    },

    // ---- Controls ----
    appendControls: function(panel) {
      panel.querySelectorAll('.prd-add-card, .prd-toolbar').forEach(function(el) { el.remove(); });

      var addBtn = document.createElement('div');
      addBtn.className = 'prd-add-card';
      addBtn.textContent = '+ 添加卡片';
      addBtn.onclick = function() {
        var card = CardMode.createCard('新卡片标题', '在此输入内容', '#757980', panel);
        panel.insertBefore(card, addBtn);
        CardMode.refreshZones(panel);
        CardMode.save(panel);
        card.querySelector('.prd-card-title').focus();
      };
      panel.appendChild(addBtn);

      var toolbar = document.createElement('div');
      toolbar.className = 'prd-toolbar';
      var resetBtn = document.createElement('button');
      resetBtn.className = 'prd-toolbar-btn danger';
      resetBtn.textContent = '重置为原始';
      resetBtn.title = '清除编辑，恢复页面原始内容';
      resetBtn.onclick = function() {
        if (confirm('确定重置此面板为原始内容？所有编辑将丢失。')) {
          localStorage.removeItem(storageKey(panel));
          location.reload();
        }
      };
      toolbar.appendChild(resetBtn);
      panel.appendChild(toolbar);
    },

    // ---- Rebuild from saved ----
    rebuild: function(panel, data) {
      panel.querySelectorAll('.prd-card, .prd-add-card, .prd-toolbar, .prd-insert-zone').forEach(function(el) { el.remove(); });
      var title = panel.querySelector('.prd-title');
      if (title) { title.innerText = data.title; title.contentEditable = 'true'; }
      data.cards.forEach(function(c) {
        // 兼容旧数据：lines 数组优先，否则用 body 字符串
        var content = c.lines || c.body || '';
        panel.appendChild(CardMode.createCard(c.title, content, c.accent, panel));
      });
      CardMode.refreshZones(panel);
      CardMode.appendControls(panel);
    },

    // ---- Init original ----
    initOriginal: function(panel) {
      panel.querySelectorAll('.prd-title, .prd-card-title').forEach(function(el) {
        el.contentEditable = 'true';
      });
      panel.querySelectorAll('.prd-card').forEach(function(card) {
        // 卡片删除按钮
        var del = document.createElement('button');
        del.className = 'prd-card-delete';
        del.textContent = '×';
        del.title = '删除卡片';
        del.onclick = function() {
          if (confirm('确定删除此卡片？')) {
            card.remove();
            CardMode.refreshZones(panel);
            CardMode.save(panel);
          }
        };
        card.insertBefore(del, card.firstChild);

        // 将 .prd-card-body 拆分为行级元素
        var body = card.querySelector('.prd-card-body');
        if (body) {
          var text = body.innerText;
          body.remove();
          CardMode.bodyToLines(card, text, panel);
        }

        CardMode.enableDrag(card, panel);
      });
      CardMode.refreshZones(panel);
      CardMode.appendControls(panel);
    },

    // ---- Blur selectors for auto-save ----
    blurSelector: '.prd-title, .prd-card-title, .prd-card-line'
  };

  // ================================================================
  //  Section 模式
  // ================================================================

  var SectionMode = {

    serialize: function(panel) {
      var sections = panel.querySelectorAll('.prd-section');
      var data = [];
      sections.forEach(function(sec) {
        var items = [];
        var children = sec.children;
        for (var i = 0; i < children.length; i++) {
          var el = children[i];
          if (el.classList.contains('prd-section-title')) {
            items.push({ type: 'title', html: el.innerHTML, cls: el.className.replace('prd-section-title', '').trim() });
          } else if (el.classList.contains('prd-label')) {
            var clone = el.cloneNode(true);
            clone.querySelectorAll('.prd-item-delete').forEach(function(b) { b.remove(); });
            items.push({ type: 'label', html: clone.innerHTML });
          } else if (el.classList.contains('prd-item')) {
            var clone = el.cloneNode(true);
            clone.querySelectorAll('.prd-item-delete').forEach(function(b) { b.remove(); });
            items.push({ type: 'item', html: clone.innerHTML });
          } else if (el.classList.contains('prd-sub')) {
            var clone = el.cloneNode(true);
            clone.querySelectorAll('.prd-item-delete').forEach(function(b) { b.remove(); });
            items.push({ type: 'sub', html: clone.innerHTML });
          }
          // skip .prd-add-item, .prd-section-delete etc.
        }
        data.push(items);
      });
      return data;
    },

    save: function(panel) {
      localStorage.setItem(storageKey(panel), JSON.stringify(SectionMode.serialize(panel)));
      if (panel.dataset.prdVersion) localStorage.setItem(versionKey(panel), panel.dataset.prdVersion);
      showToast(panel);
    },

    createItemDeleteBtn: function(itemEl, panel) {
      var del = document.createElement('button');
      del.className = 'prd-item-delete';
      del.textContent = '×';
      del.title = '删除';
      del.contentEditable = 'false';
      del.onclick = function(e) {
        e.stopPropagation();
        itemEl.remove();
        SectionMode.save(panel);
      };
      return del;
    },

    createSectionDeleteBtn: function(secEl, panel) {
      var del = document.createElement('button');
      del.className = 'prd-section-delete';
      del.innerHTML = '× 删除章节';
      del.contentEditable = 'false';
      del.onclick = function(e) {
        e.stopPropagation();
        if (confirm('确定删除整个章节？')) {
          secEl.remove();
          SectionMode.refreshZones(panel);
          SectionMode.renumberSections(panel);
          SectionMode.save(panel);
        }
      };
      return del;
    },

    createAddItemBtn: function(section, panel) {
      var btn = document.createElement('div');
      btn.className = 'prd-add-item';
      btn.textContent = '+ 添加条目';
      btn.onclick = function() {
        var item = document.createElement('div');
        item.className = 'prd-item';
        item.contentEditable = 'true';
        item.textContent = '新条目内容';
        item.appendChild(SectionMode.createItemDeleteBtn(item, panel));
        section.insertBefore(item, btn);
        SectionMode.save(panel);
        item.focus();
      };
      return btn;
    },

    createNewSection: function(panel) {
      var sec = document.createElement('div');
      sec.className = 'prd-section';
      var title = document.createElement('div');
      title.className = 'prd-section-title green';
      title.contentEditable = 'true';
      title.textContent = '新章节标题';
      sec.appendChild(title);
      var item = document.createElement('div');
      item.className = 'prd-item';
      item.contentEditable = 'true';
      item.textContent = '新条目内容';
      item.appendChild(SectionMode.createItemDeleteBtn(item, panel));
      sec.appendChild(item);
      sec.appendChild(SectionMode.createAddItemBtn(sec, panel));
      sec.appendChild(SectionMode.createSectionDeleteBtn(sec, panel));
      SectionMode.enableDrag(sec, panel);
      return sec;
    },

    // ---- Insert Zone ----
    createInsertZone: function(panel) {
      var zone = document.createElement('div');
      zone.className = 'prd-insert-zone';
      var btn = document.createElement('button');
      btn.className = 'prd-insert-zone-btn';
      btn.textContent = '+';
      btn.title = '在此插入新章节';
      btn.onclick = function(e) {
        e.stopPropagation();
        var sec = SectionMode.createNewSection(panel);
        panel.insertBefore(sec, zone.nextSibling);
        SectionMode.refreshZones(panel);
        SectionMode.renumberSections(panel);
        SectionMode.save(panel);
        sec.querySelector('.prd-section-title').focus();
      };
      zone.appendChild(btn);
      return zone;
    },

    // Re-number section titles sequentially (1. 2. 3. ...)
    renumberSections: function(panel) {
      var sections = panel.querySelectorAll('.prd-section');
      var idx = 1;
      sections.forEach(function(sec) {
        var title = sec.querySelector('.prd-section-title');
        if (!title) return;
        // Replace leading number: "3. 搜索区" → "1. 搜索区"
        var text = title.textContent || '';
        var newText = text.replace(/^\s*\d+\.\s*/, idx + '. ');
        // Only update if changed (preserve innerHTML structure for spans etc.)
        var html = title.innerHTML;
        var newHtml = html.replace(/^\s*\d+\.\s*/, idx + '. ');
        if (newHtml !== html) title.innerHTML = newHtml;
        // Update id for scroll-to-prd
        sec.id = 'prd-s' + idx;
        idx++;
      });
    },

    refreshZones: function(panel) {
      panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.remove(); });
      var sections = panel.querySelectorAll('.prd-section');
      sections.forEach(function(sec) {
        sec.parentNode.insertBefore(SectionMode.createInsertZone(panel), sec);
      });
    },

    // ---- Drag & Drop ----
    enableDrag: function(sec, panel) {
      var dragSrcRef = panel._dragSrc || { el: null };
      panel._dragSrc = dragSrcRef;

      sec.draggable = true;
      sec.addEventListener('dragstart', function(e) {
        if (e.target !== sec) return;
        dragSrcRef.el = sec;
        sec.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.style.display = 'none'; });
      });
      sec.addEventListener('dragend', function() {
        sec.classList.remove('dragging');
        dragSrcRef.el = null;
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        panel.querySelectorAll('.prd-insert-zone').forEach(function(z) { z.style.display = ''; });
      });
      sec.addEventListener('dragover', function(e) {
        if (!dragSrcRef.el || dragSrcRef.el === sec) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        var rect = sec.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        var indicator = document.createElement('div');
        indicator.className = 'prd-drop-indicator';
        if (e.clientY < mid) {
          sec.parentNode.insertBefore(indicator, sec);
        } else {
          sec.parentNode.insertBefore(indicator, sec.nextSibling);
        }
      });
      sec.addEventListener('drop', function(e) {
        e.preventDefault();
        if (!dragSrcRef.el || dragSrcRef.el === sec) return;
        var rect = sec.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          sec.parentNode.insertBefore(dragSrcRef.el, sec);
        } else {
          sec.parentNode.insertBefore(dragSrcRef.el, sec.nextSibling);
        }
        panel.querySelectorAll('.prd-drop-indicator').forEach(function(ind) { ind.remove(); });
        SectionMode.refreshZones(panel);
        SectionMode.renumberSections(panel);
        SectionMode.save(panel);
      });
    },

    // ---- Controls ----
    appendControls: function(panel) {
      panel.querySelectorAll('.prd-add-section, .prd-edit-toolbar').forEach(function(el) { el.remove(); });

      var addSec = document.createElement('div');
      addSec.className = 'prd-add-section';
      addSec.textContent = '+ 添加章节';
      addSec.onclick = function() {
        var sec = SectionMode.createNewSection(panel);
        panel.insertBefore(sec, addSec);
        SectionMode.refreshZones(panel);
        SectionMode.renumberSections(panel);
        SectionMode.save(panel);
        sec.querySelector('.prd-section-title').focus();
      };
      panel.appendChild(addSec);

      var toolbar = document.createElement('div');
      toolbar.className = 'prd-edit-toolbar';
      var resetBtn = document.createElement('button');
      resetBtn.className = 'prd-edit-toolbar-btn danger';
      resetBtn.textContent = '重置为原始';
      resetBtn.title = '清除所有编辑，恢复原始内容';
      resetBtn.onclick = function() {
        if (confirm('确定重置 PRD 面板为原始内容？所有编辑将丢失。')) {
          localStorage.removeItem(storageKey(panel));
          location.reload();
        }
      };
      toolbar.appendChild(resetBtn);
      panel.appendChild(toolbar);
    },

    // ---- Rebuild from saved ----
    rebuild: function(panel, data) {
      panel.querySelectorAll('.prd-section, .prd-add-section, .prd-edit-toolbar, .prd-insert-zone').forEach(function(el) { el.remove(); });
      data.forEach(function(sectionItems) {
        var sec = document.createElement('div');
        sec.className = 'prd-section';
        sectionItems.forEach(function(item) {
          var el = document.createElement('div');
          if (item.type === 'title') {
            el.className = 'prd-section-title ' + (item.cls || '');
            el.innerHTML = item.html;
            el.contentEditable = 'true';
          } else if (item.type === 'label') {
            el.className = 'prd-label';
            el.innerHTML = item.html;
            el.contentEditable = 'true';
            el.appendChild(SectionMode.createItemDeleteBtn(el, panel));
          } else if (item.type === 'item') {
            el.className = 'prd-item';
            el.innerHTML = item.html;
            el.contentEditable = 'true';
            el.appendChild(SectionMode.createItemDeleteBtn(el, panel));
          } else if (item.type === 'sub') {
            el.className = 'prd-sub';
            el.innerHTML = item.html;
            el.contentEditable = 'true';
            el.appendChild(SectionMode.createItemDeleteBtn(el, panel));
          }
          sec.appendChild(el);
        });
        sec.appendChild(SectionMode.createAddItemBtn(sec, panel));
        sec.appendChild(SectionMode.createSectionDeleteBtn(sec, panel));
        panel.appendChild(sec);
        SectionMode.enableDrag(sec, panel);
      });
      SectionMode.refreshZones(panel);
      SectionMode.renumberSections(panel);
      SectionMode.appendControls(panel);
    },

    // ---- Init original ----
    initOriginal: function(panel) {
      panel.querySelectorAll('.prd-section-title, .prd-label, .prd-item, .prd-sub').forEach(function(el) {
        el.contentEditable = 'true';
      });
      panel.querySelectorAll('.prd-item, .prd-label, .prd-sub').forEach(function(item) {
        item.appendChild(SectionMode.createItemDeleteBtn(item, panel));
      });
      panel.querySelectorAll('.prd-section').forEach(function(sec) {
        sec.appendChild(SectionMode.createAddItemBtn(sec, panel));
        sec.appendChild(SectionMode.createSectionDeleteBtn(sec, panel));
        SectionMode.enableDrag(sec, panel);
      });
      SectionMode.refreshZones(panel);
      SectionMode.appendControls(panel);
    },

    blurSelector: '.prd-section-title, .prd-label, .prd-item, .prd-sub'
  };

  // ================================================================
  //  初始化
  // ================================================================

  function initPanel(panel) {
    var mode = detectMode(panel);
    var handler = mode === 'section' ? SectionMode : CardMode;

    // 标记模式，供外部查询
    panel.dataset.prdMode = mode;

    var saved = localStorage.getItem(storageKey(panel));
    var htmlVersion = panel.dataset.prdVersion || '';
    var savedVersion = localStorage.getItem(versionKey(panel)) || '';

    // If HTML version changed, discard old localStorage data and use fresh HTML
    if (saved && htmlVersion && htmlVersion !== savedVersion) {
      console.info('PRD Editor: version changed (' + savedVersion + ' → ' + htmlVersion + '), discarding localStorage');
      localStorage.removeItem(storageKey(panel));
      localStorage.removeItem(versionKey(panel));
      saved = null;
    }

    if (saved) {
      try {
        handler.rebuild(panel, JSON.parse(saved));
      } catch (e) {
        console.warn('PRD Editor: load error for', storageKey(panel), e);
        handler.initOriginal(panel);
      }
    } else {
      handler.initOriginal(panel);
    }
  }

  function init() {
    var panels = document.querySelectorAll('.prd-panel[data-prd-key]');
    if (!panels.length) return;

    panels.forEach(initPanel);

    // 全局 blur 监听，统一处理自动保存
    document.addEventListener('blur', function(e) {
      var panel = e.target.closest('.prd-panel[data-prd-key]');
      if (!panel) return;
      var mode = panel.dataset.prdMode;
      var handler = mode === 'section' ? SectionMode : CardMode;
      if (e.target.matches(handler.blurSelector)) {
        handler.save(panel);
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露 API 供外部使用
  window.PRDEditor = {
    initPanel: initPanel,
    CardMode: CardMode,
    SectionMode: SectionMode
  };

})();
