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
    return 'user-query-content, response-container';
  }

  getUserMessageSelector() {
    return 'user-query-content';
  }

  getAssistantMessageSelector() {
    return 'response-container';
  }

  isUserMessage(messageElement) {
    return messageElement.tagName.toLowerCase() === 'user-query-content';
  }

  extractMessageText(messageElement) {
    if (this.isUserMessage(messageElement)) {
      // 用户消息：在 .query-text 中
      const queryText = messageElement.querySelector('.query-text');
      if (queryText) {
        return queryText.textContent.trim();
      }
    } else {
      // AI 消息：在 message-content 或 .markdown 中
      const messageContent = messageElement.querySelector('message-content');
      if (messageContent) {
        return messageContent.textContent.trim();
      }
      const markdown = messageElement.querySelector('.markdown');
      if (markdown) {
        return markdown.textContent.trim();
      }
    }
    return messageElement.textContent.trim();
  }

  getContentContainer(messageElement) {
    if (this.isUserMessage(messageElement)) {
      return messageElement.querySelector('.user-query-container') || messageElement;
    }
    return messageElement.querySelector('.response-container') || messageElement;
  }

  getButtonInsertPosition(messageElement) {
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
    return document.body;
  }

  // 不支持操作栏注入
  supportsActionBarInjection() {
    return false;
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new GeminiAdapter());

