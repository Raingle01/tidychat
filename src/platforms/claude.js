/**
 * Claude Platform Adapter
 * 适配 claude.ai
 */

class ClaudeAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'claude';
  }

  get name() {
    return 'Claude';
  }

  matchURL(url) {
    return url.includes('claude.ai');
  }

  getMessageSelector() {
    // Claude 的消息选择器
    return '[data-testid="user-message"], [data-testid="assistant-message"], .message-row';
  }

  getUserMessageSelector() {
    return '[data-testid="user-message"], [class*="human-message"]';
  }

  getAssistantMessageSelector() {
    return '[data-testid="assistant-message"], [class*="assistant-message"]';
  }

  extractMessageText(messageElement) {
    const contentArea = messageElement.querySelector('.prose, [class*="markdown"], p');
    if (contentArea) {
      return contentArea.textContent || '';
    }
    return messageElement.textContent || '';
  }

  getGlobalButtonPosition() {
    return {
      top: '16px',
      right: '80px'
    };
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new ClaudeAdapter());

