/**
 * Collapser Core Module
 * 核心折叠逻辑，与平台无关
 */

(function() {
  'use strict';

  const ATTR = {
    initialized: 'data-tidychat-initialized',
    collapsed: 'data-tidychat-collapsed'
  };

  // 字符宽度估算（中文约 14px，英文约 7px，按平均 10px 计算）
  const AVG_CHAR_WIDTH = 10;
  const MIN_PREVIEW_LENGTH = 30;
  const MAX_PREVIEW_LENGTH = 200;
  const PADDING_SPACE = 120; // 预留给边距、按钮等的空间

  /**
   * 折叠管理器
   */
  class Collapser {
    constructor(adapter) {
      this.adapter = adapter;
      this.isAllCollapsed = false;
      this.observer = null;
      this.collapseMode = 'all'; // 'all', 'ai', 'user'
    }

    /**
     * 设置折叠模式
     */
    setCollapseMode(mode) {
      this.collapseMode = mode;
      console.log('TidyChat: Collapse mode set to', mode);
    }

    /**
     * 获取折叠模式
     */
    getCollapseMode() {
      return this.collapseMode;
    }

    /**
     * 检查元素是否应该被折叠（根据模式）
     */
    shouldCollapse(element) {
      const isUser = this.adapter.isUserMessage(element);
      
      switch (this.collapseMode) {
        case 'ai':
          return !isUser; // 只折叠 AI 消息
        case 'user':
          return isUser; // 只折叠用户消息
        case 'all':
        default:
          return true; // 折叠所有
      }
    }

    /**
     * 根据容器宽度计算预览文字长度
     */
    calculatePreviewLength(element) {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      
      const availableWidth = rect.width - paddingLeft - paddingRight - PADDING_SPACE;
      let charCount = Math.floor(availableWidth / AVG_CHAR_WIDTH);
      charCount = Math.max(MIN_PREVIEW_LENGTH, Math.min(charCount, MAX_PREVIEW_LENGTH));
      
      return charCount;
    }

    /**
     * 获取消息预览文本
     */
    getPreviewText(element) {
      const text = this.adapter.extractMessageText(element);
      const clean = text.trim().replace(/\s+/g, ' ');
      
      const previewLength = this.calculatePreviewLength(element);
      
      if (clean.length <= previewLength) {
        return clean;
      }
      
      let truncated = clean.substring(0, previewLength);
      
      const breakPoints = [
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('，'),
        truncated.lastIndexOf('、'),
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf(', '),
        truncated.lastIndexOf(' '),
        truncated.lastIndexOf('：'),
        truncated.lastIndexOf('；')
      ];
      
      const lastBreak = Math.max(...breakPoints);
      
      if (lastBreak > previewLength * 0.6) {
        truncated = clean.substring(0, lastBreak + 1);
      }
      
      return truncated.trim() + '...';
    }

    /**
     * 折叠单个消息
     */
    collapse(element) {
      if (element.getAttribute(ATTR.collapsed) === 'true') {
        return;
      }

      element.setAttribute(ATTR.collapsed, 'true');
      
      if (!element.querySelector('.tidychat-preview')) {
        const preview = document.createElement('div');
        preview.className = 'tidychat-preview';
        preview.textContent = this.getPreviewText(element);
        element.insertBefore(preview, element.firstChild);
      }
    }

    /**
     * 展开单个消息
     */
    expand(element) {
      if (element.getAttribute(ATTR.collapsed) !== 'true') {
        return;
      }

      element.setAttribute(ATTR.collapsed, 'false');
      
      const preview = element.querySelector('.tidychat-preview');
      if (preview) {
        preview.remove();
      }
    }

    /**
     * 切换单个消息状态
     */
    toggle(element) {
      const isCollapsed = element.getAttribute(ATTR.collapsed) === 'true';
      
      if (isCollapsed) {
        this.expand(element);
      } else {
        this.collapse(element);
      }

      return !isCollapsed;
    }

    /**
     * 折叠所有消息（根据模式）
     */
    collapseAll() {
      const messages = this.getAllMessages();
      messages.forEach(el => {
        if (this.shouldCollapse(el)) {
          this.collapse(el);
        }
      });
      this.isAllCollapsed = true;
    }

    /**
     * 展开所有消息
     */
    expandAll() {
      const messages = this.getAllMessages();
      messages.forEach(el => this.expand(el));
      this.isAllCollapsed = false;
    }

    /**
     * 切换所有消息状态
     */
    toggleAll() {
      if (this.isAllCollapsed) {
        this.expandAll();
      } else {
        this.collapseAll();
      }
      return this.isAllCollapsed;
    }

    /**
     * 获取所有消息元素
     */
    getAllMessages() {
      const selector = this.adapter.getMessageSelector();
      return Array.from(document.querySelectorAll(selector));
    }

    /**
     * 初始化单个消息元素
     */
    initMessage(element) {
      if (element.hasAttribute(ATTR.initialized)) {
        return;
      }

      element.setAttribute(ATTR.initialized, 'true');
      element.setAttribute(ATTR.collapsed, 'false');
      element.style.position = 'relative';

      const event = new CustomEvent('tidychat:message-init', {
        detail: { element, adapter: this.adapter }
      });
      document.dispatchEvent(event);
    }

    /**
     * 初始化所有现有消息
     */
    initAllMessages() {
      const messages = this.getAllMessages();
      messages.forEach(el => this.initMessage(el));
    }

    /**
     * 启动 MutationObserver 监听新消息
     */
    startObserver() {
      if (this.observer) {
        return;
      }

      const selector = this.adapter.getMessageSelector();
      const target = this.adapter.getObserveTarget();

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (node.matches && node.matches(selector)) {
              this.initMessage(node);
            }

            const messages = node.querySelectorAll?.(selector);
            if (messages) {
              messages.forEach(el => this.initMessage(el));
            }
          });
        });
      });

      this.observer.observe(target, {
        childList: true,
        subtree: true
      });
    }

    /**
     * 停止 MutationObserver
     */
    stopObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }

    /**
     * 更新所有折叠消息的预览
     */
    updateAllPreviews() {
      const messages = this.getAllMessages();
      messages.forEach(el => {
        if (el.getAttribute(ATTR.collapsed) === 'true') {
          const preview = el.querySelector('.tidychat-preview');
          if (preview) {
            preview.textContent = this.getPreviewText(el);
          }
        }
      });
    }

    /**
     * 获取当前状态
     */
    getState() {
      return {
        isAllCollapsed: this.isAllCollapsed,
        totalMessages: this.getAllMessages().length,
        platformId: this.adapter.id,
        platformName: this.adapter.name,
        collapseMode: this.collapseMode
      };
    }

    /**
     * 销毁折叠器
     */
    destroy() {
      this.stopObserver();
      
      const messages = this.getAllMessages();
      messages.forEach(el => {
        el.removeAttribute(ATTR.initialized);
        el.removeAttribute(ATTR.collapsed);
        
        const preview = el.querySelector('.tidychat-preview');
        if (preview) preview.remove();
        
        const btnContainer = el.querySelector('.tidychat-btn-container');
        if (btnContainer) btnContainer.remove();
      });
    }
  }

  // Export
  window.TidyChat = window.TidyChat || {};
  window.TidyChat.Collapser = Collapser;
})();
