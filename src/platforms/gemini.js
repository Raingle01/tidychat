/**
 * Gemini Platform Adapter
 * 适配 gemini.google.com 和 bard.google.com
 */

class GeminiAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'gemini';
  }

  get name() {
    return 'Gemini';
  }

  matchURL(url) {
    return url.includes('gemini.google.com') || url.includes('bard.google.com');
  }

  getMessageSelector() {
    // Gemini 的消息选择器（需要根据实际 DOM 调整）
    return 'message-content, [class*="conversation-turn"], [class*="message-row"]';
  }

  getUserMessageSelector() {
    return '[class*="user-query"], [class*="human-turn"]';
  }

  getAssistantMessageSelector() {
    return '[class*="model-response"], [class*="ai-turn"]';
  }

  extractMessageText(messageElement) {
    const contentArea = messageElement.querySelector('.markdown-content, [class*="response-content"], p');
    if (contentArea) {
      return contentArea.textContent || '';
    }
    return messageElement.textContent || '';
  }

  getGlobalButtonPosition() {
    return {
      top: '70px',
      right: '24px'
    };
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new GeminiAdapter());

