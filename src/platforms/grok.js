/**
 * Grok Platform Adapter
 * 适配 grok.com 和 x.com/i/grok
 */

class GrokAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'grok';
  }

  get name() {
    return 'Grok';
  }

  matchURL(url) {
    // 支持多种 Grok URL 格式
    // 检查 x.com 时只匹配 grok 相关路径，避免匹配 Twitter 其他页面
    if (url.includes('x.com')) {
      return url.includes('/i/grok') || url.includes('/grok');
    }
    return url.includes('grok.com') || url.includes('grok.x.ai');
  }

  getMessageSelector() {
    // Grok 消息容器：div[id^="response-"] 
    // 使用更宽松的选择器
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

  isUserMessage(messageElement) {
    // 检查 class 中是否包含 items-end
    return messageElement.className.includes('items-end');
  }

  extractMessageText(messageElement) {
    // Grok 消息内容在 .response-content-markdown 内
    const contentArea = messageElement.querySelector('.response-content-markdown');
    if (contentArea) {
      return contentArea.textContent || '';
    }
    // 备选：.message-bubble 内的文本
    const bubble = messageElement.querySelector('.message-bubble');
    if (bubble) {
      return bubble.textContent || '';
    }
    return messageElement.textContent || '';
  }

  getContentContainer(messageElement) {
    // 返回需要隐藏的内容区域
    return messageElement.querySelector('.message-bubble') || messageElement;
  }

  getButtonInsertPosition(messageElement) {
    // 将按钮添加到消息容器末尾
    return {
      parent: messageElement,
      position: 'append'
    };
  }

  getGlobalButtonPosition() {
    return {
      top: '80px',
      right: '20px'
    };
  }

  getObserveTarget() {
    // 监听整个聊天容器的变化
    return document.body;
  }

  // 支持操作栏注入
  supportsActionBarInjection() {
    return true;
  }

  getActionBar(messageElement) {
    // Grok 操作栏：.action-buttons 内的 flex 容器
    const actionButtons = messageElement.querySelector('.action-buttons');
    if (actionButtons) {
      return actionButtons.querySelector('.flex.items-center');
    }
    return null;
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new GrokAdapter());

