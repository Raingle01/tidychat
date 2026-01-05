/**
 * Platform Registry
 * 平台适配器注册中心
 */

// Initialize TidyChat namespace
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = [];

/**
 * Base Platform Adapter
 */
class BasePlatformAdapter {
  constructor() {
    if (new.target === BasePlatformAdapter) {
      throw new Error('BasePlatformAdapter is abstract');
    }
  }

  get id() { throw new Error('Must implement id'); }
  get name() { throw new Error('Must implement name'); }
  
  matchURL(url) { throw new Error('Must implement matchURL()'); }
  getMessageSelector() { throw new Error('Must implement getMessageSelector()'); }
  
  getUserMessageSelector() { return null; }
  getAssistantMessageSelector() { return null; }
  
  extractMessageText(el) {
    return el.textContent || '';
  }
  
  getContentContainer(el) { return el; }
  
  getButtonInsertPosition(el) {
    return { parent: el, position: 'append' };
  }
  
  getGlobalButtonPosition() {
    return { top: '80px', right: '20px' };
  }
  
  isUserMessage(el) {
    const sel = this.getUserMessageSelector();
    return sel ? el.matches(sel) : false;
  }
  
  getObserveTarget() { return document.body; }
  onInit() {}
  onDestroy() {}
}

window.TidyChat.BasePlatformAdapter = BasePlatformAdapter;

/**
 * ChatGPT Adapter
 */
class ChatGPTAdapter extends BasePlatformAdapter {
  get id() { return 'chatgpt'; }
  get name() { return 'ChatGPT'; }
  
  matchURL(url) {
    return url.includes('chatgpt.com') || url.includes('chat.openai.com');
  }
  
  getMessageSelector() {
    return 'article[data-turn]';
  }
  
  getUserMessageSelector() {
    return 'article[data-turn="user"]';
  }
  
  getAssistantMessageSelector() {
    return 'article[data-turn="assistant"]';
  }
  
  extractMessageText(el) {
    const content = el.querySelector('.markdown, .whitespace-pre-wrap');
    return content ? content.textContent || '' : el.textContent || '';
  }

  /**
   * 获取消息操作栏（复制、点赞等按钮所在的容器）
   */
  getActionBar(messageElement) {
    // ChatGPT 的操作栏通常在消息底部，包含多个按钮
    // 尝试多种选择器以适应不同版本
    const selectors = [
      '.flex.items-center.justify-start.gap-3', // 常见的操作栏容器
      '[class*="flex"][class*="items-center"] > button:first-child', // 包含按钮的容器
      '.mt-1.flex.gap-3', // 另一种可能的容器
      'div.flex.items-center.gap-1\\.5' // gap-1.5 的容器
    ];

    for (const selector of selectors) {
      const actionBar = messageElement.querySelector(selector);
      if (actionBar) {
        // 确认是操作栏（应该包含多个按钮）
        const buttons = actionBar.querySelectorAll('button');
        if (buttons.length >= 2) {
          return actionBar.parentElement || actionBar;
        }
      }
    }

    // 备选方案：查找包含复制按钮的容器
    const allButtons = messageElement.querySelectorAll('button');
    for (const btn of allButtons) {
      const svg = btn.querySelector('svg');
      if (svg && btn.parentElement) {
        const siblings = btn.parentElement.querySelectorAll('button');
        if (siblings.length >= 2) {
          return btn.parentElement;
        }
      }
    }

    return null;
  }

  /**
   * 是否支持操作栏注入
   */
  supportsActionBarInjection() {
    return true;
  }
}

/**
 * Grok Adapter
 */
class GrokAdapter extends BasePlatformAdapter {
  get id() { return 'grok'; }
  get name() { return 'Grok'; }
  
  matchURL(url) {
    // 支持多种 Grok URL 格式
    if (url.includes('x.com')) {
      return url.includes('/i/grok') || url.includes('/grok');
    }
    return url.includes('grok.com') || url.includes('grok.x.ai');
  }
  
  getMessageSelector() {
    // Grok 消息容器：div[id^="response-"]
    return 'div[id^="response-"]';
  }
  
  getUserMessageSelector() {
    // 用户消息靠右对齐 (items-end)
    return 'div[id^="response-"][class*="items-end"]';
  }
  
  getAssistantMessageSelector() {
    // AI 消息靠左对齐 (items-start)
    return 'div[id^="response-"][class*="items-start"]';
  }
  
  isUserMessage(el) {
    return el.className.includes('items-end');
  }
  
  extractMessageText(el) {
    const content = el.querySelector('.response-content-markdown');
    if (content) return content.textContent || '';
    const bubble = el.querySelector('.message-bubble');
    if (bubble) return bubble.textContent || '';
    return el.textContent || '';
  }
  
  getGlobalButtonPosition() {
    return { top: '80px', right: '20px' };
  }

  getActionBar(messageElement) {
    const actionButtons = messageElement.querySelector('.action-buttons');
    if (actionButtons) {
      return actionButtons.querySelector('.flex.items-center');
    }
    return null;
  }

  supportsActionBarInjection() {
    return true;
  }
}

/**
 * Gemini Adapter
 */
class GeminiAdapter extends BasePlatformAdapter {
  get id() { return 'gemini'; }
  get name() { return 'Gemini'; }
  
  matchURL(url) {
    return url.includes('gemini.google.com') || url.includes('bard.google.com');
  }
  
  getMessageSelector() {
    return 'message-content, [class*="conversation-turn"], [class*="query-content"], [class*="response-content"]';
  }
  
  getUserMessageSelector() {
    return '[class*="query"], [class*="user"]';
  }
  
  getAssistantMessageSelector() {
    return '[class*="response"], [class*="model"]';
  }
  
  getGlobalButtonPosition() {
    return { top: '70px', right: '24px' };
  }
}

/**
 * Claude Adapter
 */
class ClaudeAdapter extends BasePlatformAdapter {
  get id() { return 'claude'; }
  get name() { return 'Claude'; }
  
  matchURL(url) {
    return url.includes('claude.ai');
  }
  
  getMessageSelector() {
    return '[data-testid="user-message"], [data-testid="assistant-message"], [class*="message"]';
  }
  
  getUserMessageSelector() {
    return '[data-testid="user-message"], [class*="human"]';
  }
  
  getAssistantMessageSelector() {
    return '[data-testid="assistant-message"], [class*="assistant"]';
  }
  
  getGlobalButtonPosition() {
    return { top: '16px', right: '80px' };
  }
}

/**
 * Poe Adapter
 */
class PoeAdapter extends BasePlatformAdapter {
  get id() { return 'poe'; }
  get name() { return 'Poe'; }
  
  matchURL(url) {
    return url.includes('poe.com');
  }
  
  getMessageSelector() {
    return '[class*="Message_row"], [class*="ChatMessage"]';
  }
  
  getUserMessageSelector() {
    return '[class*="Message_humanMessage"], [class*="human"]';
  }
  
  getAssistantMessageSelector() {
    return '[class*="Message_botMessage"], [class*="bot"]';
  }
}

// Register all adapters
window.TidyChat.adapters = [
  new ChatGPTAdapter(),
  new GrokAdapter(),
  new GeminiAdapter(),
  new ClaudeAdapter(),
  new PoeAdapter()
];

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
    if (!(adapter instanceof BasePlatformAdapter)) {
      throw new Error('Adapter must extend BasePlatformAdapter');
    }
    window.TidyChat.adapters.push(adapter);
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

