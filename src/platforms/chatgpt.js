/**
 * ChatGPT Platform Adapter
 * 适配 chatgpt.com 和 chat.openai.com
 */

class ChatGPTAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'chatgpt';
  }

  get name() {
    return 'ChatGPT';
  }

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

  extractMessageText(messageElement) {
    // ChatGPT 的消息内容通常在 markdown 渲染区域
    const contentArea = messageElement.querySelector('.markdown, .whitespace-pre-wrap');
    if (contentArea) {
      return contentArea.textContent || '';
    }
    return messageElement.textContent || '';
  }

  getContentContainer(messageElement) {
    // 返回需要隐藏的内容区域
    return messageElement;
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

  // 支持操作栏注入
  supportsActionBarInjection() {
    return true;
  }

  getActionBar(messageElement) {
    // ChatGPT 操作栏在消息底部
    const textMessage = messageElement.querySelector('.text-message');
    if (textMessage && textMessage.nextElementSibling) {
      const actionContainer = textMessage.nextElementSibling.querySelector('div:last-child');
      return actionContainer;
    }
    return null;
  }
}

// Register adapter
window.TidyChat = window.TidyChat || {};
window.TidyChat.adapters = window.TidyChat.adapters || [];
window.TidyChat.adapters.push(new ChatGPTAdapter());

