/**
 * UI Module
 * 负责创建和管理 UI 元素
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'tidychat-btn-position';
  const NAV_STORAGE_KEY = 'tidychat-nav-position';
  const HOVER_DELAY = 1000; // 1 second

  /**
   * UI 管理器
   */
  class UIManager {
    constructor(collapser) {
      this.collapser = collapser;
      this.adapter = collapser.adapter;
      this.globalButton = null;
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
      this.hoverTimeout = null;
      this.previewPopup = null;
      this.isHoveringPopup = false;
      this.hoverPreviewInitialized = false;
      this.isLoading = false;
    }

    /**
     * 创建折叠/展开图标 SVG
     */
    createIcons() {
      return {
        collapse: `
          <svg class="tidychat-icon tidychat-icon-collapse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        `,
        expand: `
          <svg class="tidychat-icon tidychat-icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 15 12 9 18 15"></polyline>
          </svg>
        `,
        collapseAll: `
          <svg class="tidychat-icon tidychat-icon-collapse-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="7 8 12 3 17 8"></polyline>
            <polyline points="7 16 12 21 17 16"></polyline>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
        `,
        expandAll: `
          <svg class="tidychat-icon tidychat-icon-expand-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="7 4 12 9 17 4"></polyline>
            <polyline points="7 20 12 15 17 20"></polyline>
          </svg>
        `,
        // 操作栏专用的收起图标（与 ChatGPT 风格一致）
        collapseInline: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="7 8 12 3 17 8"></polyline>
            <polyline points="7 16 12 21 17 16"></polyline>
          </svg>
        `,
        expandInline: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="7 4 12 9 17 4"></polyline>
            <polyline points="7 20 12 15 17 20"></polyline>
          </svg>
        `
      };
    }

    /**
     * 创建单个消息的折叠按钮（悬浮按钮）
     */
    createToggleButton(messageElement) {
      const icons = this.createIcons();
      
      const container = document.createElement('div');
      container.className = 'tidychat-btn-container';

      const btn = document.createElement('button');
      btn.className = 'tidychat-toggle-btn';
      btn.setAttribute('aria-label', 'Toggle message');
      btn.innerHTML = icons.collapse + icons.expand;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.collapser.toggle(messageElement);
        this.updateActionBarButton(messageElement);
      });

      container.appendChild(btn);
      return container;
    }

    /**
     * 创建操作栏内的收起按钮（与 ChatGPT 原生按钮风格一致）
     */
    createActionBarButton(messageElement) {
      const icons = this.createIcons();
      
      const btn = document.createElement('button');
      btn.className = 'tidychat-action-btn';
      btn.setAttribute('aria-label', 'Collapse');
      btn.setAttribute('title', 'Collapse');
      btn.setAttribute('data-tidychat-action', 'collapse');
      btn.innerHTML = icons.collapseInline;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.collapser.toggle(messageElement);
        this.updateActionBarButton(messageElement);
      });

      return btn;
    }

    /**
     * 更新操作栏按钮状态
     */
    updateActionBarButton(messageElement) {
      const isCollapsed = messageElement.getAttribute('data-tidychat-collapsed') === 'true';
      const actionBtn = messageElement.querySelector('.tidychat-action-btn');
      
      if (actionBtn) {
        const icons = this.createIcons();
        
        if (isCollapsed) {
          actionBtn.innerHTML = icons.expandInline;
          actionBtn.setAttribute('aria-label', 'Expand');
          actionBtn.setAttribute('title', 'Expand');
        } else {
          actionBtn.innerHTML = icons.collapseInline;
          actionBtn.setAttribute('aria-label', 'Collapse');
          actionBtn.setAttribute('title', 'Collapse');
        }
      }
    }

    /**
     * 在操作栏中注入收起按钮
     */
    injectActionBarButton(messageElement) {
      // 检查适配器是否支持操作栏注入
      if (!this.adapter.supportsActionBarInjection || !this.adapter.supportsActionBarInjection()) {
        return;
      }

      // 检查是否已经注入
      if (messageElement.querySelector('.tidychat-action-btn')) {
        return;
      }

      const actionBar = this.adapter.getActionBar(messageElement);
      if (!actionBar) {
        return;
      }

      const actionBtn = this.createActionBarButton(messageElement);
      
      // 获取插入位置（默认 append）
      const insertPosition = this.adapter.getActionBarInsertPosition 
        ? this.adapter.getActionBarInsertPosition() 
        : 'append';
      
      switch (insertPosition) {
        case 'before':
          actionBar.before(actionBtn);
          break;
        case 'after':
          actionBar.after(actionBtn);
          break;
        case 'prepend':
          actionBar.prepend(actionBtn);
          break;
        case 'append':
        default:
          actionBar.appendChild(actionBtn);
      }
    }

    /**
     * 为消息添加折叠按钮和点击事件
     */
    addButtonToMessage(messageElement) {
      if (messageElement.querySelector('.tidychat-btn-container')) {
        return; // Already has button
      }

      // 添加悬浮按钮
      const buttonContainer = this.createToggleButton(messageElement);
      const { parent, position } = this.adapter.getButtonInsertPosition(messageElement);

      switch (position) {
        case 'prepend':
          parent.prepend(buttonContainer);
          break;
        case 'before':
          parent.before(buttonContainer);
          break;
        case 'after':
          parent.after(buttonContainer);
          break;
        case 'append':
        default:
          parent.appendChild(buttonContainer);
      }

      // 在操作栏注入按钮
      this.injectActionBarButton(messageElement);

      // 添加点击整个消息区域展开的功能
      this.addClickToExpand(messageElement);

      // 标记消息类型（用户/AI）
      this.markMessageType(messageElement);

      // 使用 MutationObserver 监听操作栏的出现（懒加载场景）
      this.observeActionBar(messageElement);
    }

    /**
     * 监听操作栏的出现（处理懒加载）
     */
    observeActionBar(messageElement) {
      if (messageElement.hasAttribute('data-tidychat-actionbar-observed')) {
        return;
      }
      messageElement.setAttribute('data-tidychat-actionbar-observed', 'true');

      const observer = new MutationObserver((mutations) => {
        // 检查是否已经有按钮
        if (messageElement.querySelector('.tidychat-action-btn')) {
          observer.disconnect();
          return;
        }

        // 尝试注入
        this.injectActionBarButton(messageElement);
        
        // 如果成功注入，停止观察
        if (messageElement.querySelector('.tidychat-action-btn')) {
          observer.disconnect();
        }
      });

      observer.observe(messageElement, {
        childList: true,
        subtree: true
      });

      // 5秒后自动停止观察
      setTimeout(() => observer.disconnect(), 5000);
    }

    /**
     * 添加点击消息任意位置展开的功能
     */
    addClickToExpand(messageElement) {
      if (messageElement.hasAttribute('data-tidychat-clickable')) {
        return;
      }

      messageElement.setAttribute('data-tidychat-clickable', 'true');
      messageElement.style.cursor = 'pointer';

      messageElement.addEventListener('click', (e) => {
        // 只在折叠状态下点击才展开
        const isCollapsed = messageElement.getAttribute('data-tidychat-collapsed') === 'true';
        
        if (isCollapsed) {
          // 检查是否点击了按钮（按钮有自己的处理逻辑）
          if (e.target.closest('.tidychat-btn-container') || e.target.closest('.tidychat-action-btn')) {
            return;
          }
          
          e.preventDefault();
          this.hidePreviewPopup(); // Hide popup when expanding
          this.collapser.expand(messageElement);
          this.updateActionBarButton(messageElement);
        }
      });

      // Add hover preview functionality
      this.addHoverPreview(messageElement);
    }

    /**
     * 创建预览弹窗
     */
    createPreviewPopup() {
      if (this.previewPopup) {
        return this.previewPopup;
      }

      const popup = document.createElement('div');
      popup.className = 'tidychat-preview-popup';
      popup.innerHTML = `
        <div class="tidychat-preview-popup-header">
          <span class="tidychat-preview-popup-title">PREVIEW</span>
          <button class="tidychat-preview-popup-close" title="Close">&times;</button>
        </div>
        <div class="tidychat-preview-popup-content"></div>
      `;

      document.body.appendChild(popup);
      this.previewPopup = popup;

      // Keep popup visible when mouse is over it
      popup.addEventListener('mouseenter', () => {
        this.isHoveringPopup = true;
      });

      popup.addEventListener('mouseleave', () => {
        this.isHoveringPopup = false;
        this.hidePreviewPopup();
      });

      // Close button
      const closeBtn = popup.querySelector('.tidychat-preview-popup-close');
      closeBtn.addEventListener('click', () => {
        this.hidePreviewPopup();
      });

      return popup;
    }

    /**
     * 显示预览弹窗
     */
    showPreviewPopup(messageElement, event) {
      // 检查消息是否仍处于折叠状态
      if (messageElement.getAttribute('data-tidychat-collapsed') !== 'true') {
        return;
      }
      
      const popup = this.createPreviewPopup();
      const content = popup.querySelector('.tidychat-preview-popup-content');
      
      // Get full message text
      const fullText = this.adapter.extractMessageText(messageElement);
      content.textContent = fullText;

      // Determine message type for styling and positioning
      const isUser = this.adapter.isUserMessage(messageElement);
      popup.setAttribute('data-type', isUser ? 'user' : 'assistant');

      // Position the popup aligned with the collapsed message bar
      const rect = messageElement.getBoundingClientRect();
      const popupWidth = 400;
      const popupMaxHeight = 300;
      
      let left, top;
      // 悬浮窗紧贴消息条下方（无间隙，避免鼠标移动时闪烁）
      top = rect.bottom;

      // 悬浮窗起始位置与消息条对齐
      left = rect.left;
      
      // 确保不超出右边界
      if (left + popupWidth > window.innerWidth - 20) {
        left = window.innerWidth - popupWidth - 20;
      }
      
      // 确保不超出左边界
      if (left < 20) {
        left = 20;
      }

      // Adjust if too close to bottom edge - show above instead
      if (top + popupMaxHeight > window.innerHeight - 20) {
        top = rect.top - popupMaxHeight;
        // 确保不超出顶部
        if (top < 20) {
          top = 20;
        }
      }

      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
      popup.classList.add('show');
    }

    /**
     * 隐藏预览弹窗
     */
    hidePreviewPopup() {
      if (this.previewPopup) {
        this.previewPopup.classList.remove('show');
      }
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
    }

    /**
     * 初始化全局 hover 预览功能
     */
    initGlobalHoverPreview() {
      if (this.hoverPreviewInitialized) return;
      this.hoverPreviewInitialized = true;
      
      const self = this;
      
      // 使用 MutationObserver 监听新添加的预览元素
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            
            // 检查是否是预览元素
            if (node.classList?.contains('tidychat-preview')) {
              self.attachPreviewHover(node);
            }
            
            // 检查子元素
            const previews = node.querySelectorAll?.('.tidychat-preview');
            if (previews) {
              previews.forEach(p => self.attachPreviewHover(p));
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      // 为现有的预览元素添加事件
      document.querySelectorAll('.tidychat-preview').forEach(p => {
        self.attachPreviewHover(p);
      });
    }
    
    /**
     * 为预览元素添加 hover 事件
     */
    attachPreviewHover(previewElement) {
      if (previewElement.hasAttribute('data-tidychat-hover-attached')) return;
      previewElement.setAttribute('data-tidychat-hover-attached', 'true');
      
      const self = this;
      let hoverTimer = null;
      
      previewElement.addEventListener('mouseenter', function(e) {
        const messageElement = previewElement.parentElement;
        if (!messageElement || messageElement.getAttribute('data-tidychat-collapsed') !== 'true') {
          return;
        }
        
        // 启动 1 秒计时器
        hoverTimer = setTimeout(() => {
          self.showPreviewPopup(messageElement, e);
        }, HOVER_DELAY);
      });
      
      previewElement.addEventListener('mouseleave', function(e) {
        // 清除计时器
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        
        // 检查是否移动到了悬浮框
        const relatedTarget = e.relatedTarget;
        if (relatedTarget?.closest('.tidychat-preview-popup')) {
          return;
        }
        
        // 延迟隐藏，允许鼠标移到悬浮框
        setTimeout(() => {
          if (!self.isHoveringPopup) {
            self.hidePreviewPopup();
          }
        }, 300);
      });
    }

    /**
     * 添加悬停预览功能（已废弃，使用全局事件委托）
     */
    addHoverPreview(messageElement) {
      // 现在使用全局事件委托，不需要为每个消息单独添加
    }

    /**
     * 标记消息类型（用户/AI）
     */
    markMessageType(messageElement) {
      const isUser = this.adapter.isUserMessage(messageElement);
      messageElement.setAttribute('data-tidychat-type', isUser ? 'user' : 'assistant');
    }

    /**
     * 获取保存的按钮位置
     */
    getSavedPosition() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('TidyChat: Failed to load saved position', e);
      }
      return null;
    }

    /**
     * 保存按钮位置
     */
    savePosition(x, y) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
      } catch (e) {
        console.warn('TidyChat: Failed to save position', e);
      }
    }

    /**
     * 设置按钮位置
     */
    setButtonPosition(x, y) {
      if (!this.globalButton) return;

      // 确保按钮不会超出视口
      const btnRect = this.globalButton.getBoundingClientRect();
      const maxX = window.innerWidth - btnRect.width;
      const maxY = window.innerHeight - btnRect.height;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      // 清除默认位置样式
      this.globalButton.style.top = '';
      this.globalButton.style.right = '';
      this.globalButton.style.bottom = '';
      this.globalButton.style.left = '';

      // 设置新位置
      this.globalButton.style.left = `${x}px`;
      this.globalButton.style.top = `${y}px`;
    }

    /**
     * 初始化拖拽功能
     */
    initDraggable(btn) {
      let startX, startY, startLeft, startTop;
      let hasMoved = false;

      const onMouseDown = (e) => {
        // 只响应左键
        if (e.button !== 0) return;

        this.isDragging = true;
        hasMoved = false;

        const rect = btn.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        btn.style.transition = 'none';
        btn.style.cursor = 'grabbing';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!this.isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // 如果移动超过 5px，标记为拖拽
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          hasMoved = true;
        }

        const newX = startLeft + deltaX;
        const newY = startTop + deltaY;

        this.setButtonPosition(newX, newY);
      };

      const onMouseUp = (e) => {
        this.isDragging = false;

        btn.style.transition = '';
        btn.style.cursor = 'grab';

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // 保存位置
        if (hasMoved) {
          const rect = btn.getBoundingClientRect();
          this.savePosition(rect.left, rect.top);
        }
      };

      // 点击事件（只在没有拖拽时触发）
      btn.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
          hasMoved = false;
          return;
        }

        if (this.isLoading) return;
        this.isLoading = true;

        // 添加 processing 样式（降低透明度表示正在处理）
        btn.classList.add('processing');
        
        // 使用 setTimeout 让浏览器有机会渲染
        setTimeout(() => {
          try {
            const isCollapsed = this.collapser.toggleAll();
            this.updateGlobalButtonState(isCollapsed);
            this.updateAllActionBarButtons();
          } finally {
            btn.classList.remove('processing');
            this.isLoading = false;
          }
        }, 20);
      });

      btn.addEventListener('mousedown', onMouseDown);

      // 触摸设备支持
      let touchStartX, touchStartY, touchStartLeft, touchStartTop;
      let touchHasMoved = false;

      btn.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = btn.getBoundingClientRect();

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartLeft = rect.left;
        touchStartTop = rect.top;
        touchHasMoved = false;

        btn.style.transition = 'none';
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          touchHasMoved = true;
        }

        const newX = touchStartLeft + deltaX;
        const newY = touchStartTop + deltaY;

        this.setButtonPosition(newX, newY);
      }, { passive: true });

      btn.addEventListener('touchend', (e) => {
        btn.style.transition = '';

        if (touchHasMoved) {
          const rect = btn.getBoundingClientRect();
          this.savePosition(rect.left, rect.top);
          e.preventDefault();
        }
      });
    }

    /**
     * 更新所有操作栏按钮状态
     */
    updateAllActionBarButtons() {
      const messages = this.collapser.getAllMessages();
      messages.forEach(el => this.updateActionBarButton(el));
    }

    /**
     * 创建全局折叠按钮
     */
    createGlobalButton() {
      if (this.globalButton) {
        return this.globalButton;
      }

      const icons = this.createIcons();

      const btn = document.createElement('button');
      btn.className = 'tidychat-global-btn';
      btn.setAttribute('title', 'Collapse All (draggable)');
      btn.setAttribute('data-all-collapsed', 'false');
      btn.innerHTML = icons.collapseAll + icons.expandAll;

      // 设置拖拽样式
      btn.style.cursor = 'grab';
      btn.style.userSelect = 'none';

      document.body.appendChild(btn);
      this.globalButton = btn;

      // 恢复保存的位置或使用默认位置
      const savedPos = this.getSavedPosition();
      if (savedPos) {
        this.setButtonPosition(savedPos.x, savedPos.y);
      } else {
        // 使用平台适配器的默认位置
        const defaultPos = this.adapter.getGlobalButtonPosition();
        Object.entries(defaultPos).forEach(([prop, value]) => {
          btn.style[prop] = value;
        });
      }

      // 初始化拖拽
      this.initDraggable(btn);

      // 窗口大小改变时确保按钮不超出
      window.addEventListener('resize', () => {
        const rect = btn.getBoundingClientRect();
        this.setButtonPosition(rect.left, rect.top);
      });

      return btn;
    }

    /**
     * 更新全局按钮状态
     */
    updateGlobalButtonState(isCollapsed) {
      if (!this.globalButton) return;

      this.globalButton.setAttribute('data-all-collapsed', isCollapsed.toString());
      this.globalButton.setAttribute('title', isCollapsed ? 'Expand All (draggable)' : 'Collapse All (draggable)');
    }


    /**
     * 移除全局按钮
     */
    removeGlobalButton() {
      if (this.globalButton) {
        this.globalButton.remove();
        this.globalButton = null;
      }
    }

    /**
     * 初始化 UI
     */
    init() {
      // 创建全局按钮
      this.createGlobalButton();

      // 初始化全局 hover 预览
      this.initGlobalHoverPreview();

      // 为现有消息添加按钮
      const messages = this.collapser.getAllMessages();
      messages.forEach(el => this.addButtonToMessage(el));

      // 监听新消息初始化事件
      document.addEventListener('tidychat:message-init', (e) => {
        this.addButtonToMessage(e.detail.element);
      });
    }

    /**
     * 销毁 UI
     */
    destroy() {
      this.removeGlobalButton();
      this.hidePreviewPopup();
      
      if (this.previewPopup) {
        this.previewPopup.remove();
        this.previewPopup = null;
      }

      // 移除所有消息按钮
      document.querySelectorAll('.tidychat-btn-container').forEach(el => el.remove());
      document.querySelectorAll('.tidychat-action-btn').forEach(el => el.remove());
    }
  }

  // Export
  window.TidyChat = window.TidyChat || {};
  window.TidyChat.UIManager = UIManager;
})();
