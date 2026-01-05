/**
 * TidyChat - Main Entry Point
 * 主入口文件，初始化扩展
 */

(function() {
  'use strict';

  const { PlatformManager, Collapser, UIManager } = window.TidyChat;

  let collapser = null;
  let uiManager = null;
  let resizeTimeout = null;

  /**
   * 从存储加载设置
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['collapseMode']);
      if (result.collapseMode && collapser) {
        collapser.setCollapseMode(result.collapseMode);
      }
    } catch (e) {
      console.warn('TidyChat: Failed to load settings', e);
    }
  }

  /**
   * 初始化扩展
   */
  async function init() {
    // 检测平台
    const adapter = PlatformManager.detect();
    
    if (!adapter) {
      console.log('TidyChat: Current page is not a supported AI chat platform');
      return;
    }

    // 创建折叠管理器
    collapser = new Collapser(adapter);
    
    // 加载设置
    await loadSettings();
    
    // 创建 UI 管理器
    uiManager = new UIManager(collapser);

    // 初始化
    collapser.initAllMessages();
    collapser.startObserver();
    uiManager.init();

    // 平台特定初始化
    adapter.onInit();

    // 监听窗口大小改变
    window.addEventListener('resize', handleResize);

    // 监听存储变化
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.collapseMode) {
        collapser.setCollapseMode(changes.collapseMode.newValue);
      }
    });

    console.log(`TidyChat: Initialized for ${adapter.name}`);
  }

  /**
   * 处理窗口大小改变
   */
  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
      if (collapser) {
        collapser.updateAllPreviews();
      }
    }, 200);
  }

  /**
   * 设置消息监听器（与 popup 通信）
   */
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!collapser) {
        sendResponse({ error: 'Not initialized' });
        return true;
      }

      switch (message.action) {
        case 'toggleAll':
          const isCollapsed = collapser.toggleAll();
          uiManager.updateGlobalButtonState(isCollapsed);
          uiManager.updateAllActionBarButtons();
          sendResponse({ success: true, isAllCollapsed: isCollapsed });
          break;

        case 'getState':
          sendResponse(collapser.getState());
          break;

        case 'collapse':
          collapser.collapseAll();
          uiManager.updateGlobalButtonState(true);
          uiManager.updateAllActionBarButtons();
          sendResponse({ success: true });
          break;

        case 'expand':
          collapser.expandAll();
          uiManager.updateGlobalButtonState(false);
          uiManager.updateAllActionBarButtons();
          sendResponse({ success: true });
          break;

        case 'getPlatformInfo':
          const adapter = PlatformManager.getAdapter();
          sendResponse({
            id: adapter?.id || null,
            name: adapter?.name || null,
            supported: !!adapter
          });
          break;

        case 'updateSettings':
          if (message.collapseMode) {
            collapser.setCollapseMode(message.collapseMode);
          }
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }

      return true;
    });
  }

  /**
   * 销毁扩展
   */
  function destroy() {
    window.removeEventListener('resize', handleResize);
    
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    if (uiManager) {
      uiManager.destroy();
      uiManager = null;
    }

    if (collapser) {
      const adapter = collapser.adapter;
      adapter.onDestroy();
      collapser.destroy();
      collapser = null;
    }
  }

  /**
   * 等待 DOM 就绪后初始化
   */
  function waitForReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 500);
      });
    } else {
      setTimeout(init, 500);
    }
  }

  // 监听页面卸载
  window.addEventListener('beforeunload', destroy);

  // 设置消息监听
  setupMessageListener();

  // 开始初始化
  waitForReady();

  // Export for debugging
  window.TidyChat.init = init;
  window.TidyChat.destroy = destroy;
  window.TidyChat.getCollapser = () => collapser;
  window.TidyChat.getUIManager = () => uiManager;
})();
