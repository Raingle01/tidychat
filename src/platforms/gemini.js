/**
 * Gemini Platform Adapter
 * 适配 gemini.google.com
 * 
 * 遵循 UI Design Law:
 * - 用户消息：绿色主题 (#10b981)
 * - AI 消息：蓝色主题 (#3b82f6)
 */

class GeminiAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'gemini';
  }

  get name() {
    return 'Gemini';
  }

  matchURL(url) {
    return url.includes('gemini.google.com');
  }

  getMessageSelector() {
    return 'user-query, model-response';
  }

  getUserMessageSelector() {
    return 'user-query';
  }

  getAssistantMessageSelector() {
    return 'model-response';
  }

  isUserMessage(messageElement) {
    return messageElement.tagName.toLowerCase() === 'user-query';
  }

  extractMessageText(messageElement) {
    // Gemini 用户消息文本
    if (this.isUserMessage(messageElement)) {
      const queryText = messageElement.querySelector('.query-text');
      return queryText ? queryText.textContent.trim() : '';
    }
    
    // Gemini AI 消息文本
    // 优先寻找 markdown 内容
    const markdown = messageElement.querySelector('.markdown');
    if (markdown) {
      return markdown.textContent.trim();
    }
    
    // 备选：structured-content-container
    const content = messageElement.querySelector('structured-content-container, message-content');
    if (content) {
      return content.textContent.trim();
    }
    
    return messageElement.textContent.trim();
  }

  getContentContainer(messageElement) {
    // 返回需要隐藏的内容区域
    // 用户消息：.user-query-container
    // AI 消息：.response-container
    return messageElement.querySelector('.user-query-container, .response-container') || messageElement;
  }

  getButtonInsertPosition(messageElement) {
    // 将按钮添加到消息容器最顶层，绝对定位处理
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
    // Gemini 的对话是在动态加载的
    return document.body;
  }

  // 支持操作栏注入
  supportsActionBarInjection() {
    return true;
  }

  getActionBar(messageElement) {
    if (this.isUserMessage(messageElement)) {
      // 用户消息操作区域：通常包含复制按钮的容器
      return messageElement.querySelector('.query-content');
    }
    
    // AI 消息操作区域：.response-container-header-controls
    const headerControls = messageElement.querySelector('.response-container-header-controls');
    if (headerControls) {
      return headerControls;
    }
    
    // 备选：底部的操作栏
    return messageElement.querySelector('message-actions .actions-container-v2');
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new GeminiAdapter());
