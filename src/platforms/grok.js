/**
 * Grok Platform Adapter
 * 适配 grok.com 和 x.com/i/grok
 * 
 * 遵循 UI Design Law:
 * - 用户消息：绿色主题 (#10b981)
 * - AI 消息：蓝色主题 (#3b82f6)
 * - data-tidychat-type: user | assistant
 * - data-tidychat-collapsed: true | false
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
    // Grok 消息容器：div[id^="response-"].group
    // 必须有 group 类才是真正的消息容器
    return 'div[id^="response-"].group';
  }

  getUserMessageSelector() {
    // 用户消息靠右对齐 (items-end)
    return 'div[id^="response-"].group[class*="items-end"]';
  }

  getAssistantMessageSelector() {
    // AI 消息靠左对齐 (items-start)
    return 'div[id^="response-"].group[class*="items-start"]';
  }

  isUserMessage(messageElement) {
    // 检查 class 中是否包含 items-end（用户消息右对齐）
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
    // 将按钮添加到消息容器
    return {
      parent: messageElement,
      position: 'append'
    };
  }

  getGlobalButtonPosition() {
    // 遵循 UI Design Law: 全局按钮默认位置
    return {
      top: '80px',
      right: '20px'
    };
  }

  getObserveTarget() {
    // 监听整个文档的变化（Grok 动态加载消息）
    return document.body;
  }

  // 支持操作栏注入
  supportsActionBarInjection() {
    return true;
  }

  getActionBar(messageElement) {
    // Grok 操作栏：.action-buttons 内的第一个 flex 容器
    const actionButtons = messageElement.querySelector('.action-buttons');
    if (actionButtons) {
      // 找到"更多操作"按钮，在它后面插入
      const moreButton = actionButtons.querySelector('[aria-label="更多操作"]');
      if (moreButton) {
        return moreButton;
      }
      // 备选：找到包含按钮的 flex 容器
      const flexContainer = actionButtons.querySelector('.flex.items-center');
      return flexContainer || actionButtons;
    }
    return null;
  }

  getActionBarInsertPosition() {
    return 'after';
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new GrokAdapter());

