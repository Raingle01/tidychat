/**
 * Platform Registry
 * 平台适配器注册中心
 * 
 * 管理所有已加载平台适配器的注册和选择。
 */

// Initialize TidyChat namespace
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];

/**
 * Platform Manager
 * 管理平台检测和适配器选择
 */
window.TidyChat.PlatformManager = {
  currentAdapter: null,
  
  /**
   * 检测当前平台并返回对应适配器
   */
  detect() {
    const url = window.location.href;
    
    // 按照注册顺序尝试匹配
    for (const adapter of window.TidyChat.adapters) {
      if (adapter.matchURL(url)) {
        this.currentAdapter = adapter;
        console.log(`TidyChat: Detected platform - ${adapter.name}`);
        return adapter;
      }
    }
    
    console.log('TidyChat: No supported platform detected');
    return null;
  },
  
  /**
   * 获取当前适配器
   */
  getAdapter() {
    if (!this.currentAdapter) {
      this.detect();
    }
    return this.currentAdapter;
  },
  
  /**
   * 注册新适配器
   */
  registerAdapter(adapter) {
    if (!window.TidyChat.adapters.includes(adapter)) {
      window.TidyChat.adapters.push(adapter);
    }
  },
  
  /**
   * 获取所有支持的平台
   */
  getSupportedPlatforms() {
    return window.TidyChat.adapters.map(a => ({
      id: a.id,
      name: a.name
    }));
  }
};
