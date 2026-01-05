/**
 * Doubao Platform Adapter
 * 适配 doubao.com (豆包)
 * 
 * 遵循 UI Design Law:
 * - 用户消息：绿色主题 (#10b981)
 * - AI 消息：蓝色主题 (#3b82f6)
 */

class DoubaoAdapter extends window.TidyChat.BasePlatformAdapter {
  get id() {
    return 'doubao';
  }

  get name() {
    return 'Doubao';
  }

  matchURL(url) {
    return url.includes('doubao.com');
  }

  getMessageSelector() {
    return '[data-testid="send_message"], [data-testid="receive_message"]';
  }

  getUserMessageSelector() {
    return '[data-testid="send_message"]';
  }

  getAssistantMessageSelector() {
    return '[data-testid="receive_message"]';
  }

  isUserMessage(messageElement) {
    return messageElement.hasAttribute('data-testid') && 
           messageElement.getAttribute('data-testid') === 'send_message';
  }

  extractMessageText(messageElement) {
    // 豆包的消息内容在 [data-testid="message_text_content"] 中
    const textContent = messageElement.querySelector('[data-testid="message_text_content"]');
    if (textContent) {
      return textContent.textContent.trim();
    }
    return messageElement.textContent.trim();
  }

  getContentContainer(messageElement) {
    // 返回需要隐藏的内容区域
    return messageElement.querySelector('[data-testid="message_content"]') || messageElement;
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
    // 豆包操作栏按钮容器
    const buttonContainer = messageElement.querySelector('.message-action-button-main');
    if (buttonContainer) {
      // 找到"更多"按钮的父元素（它在一个div里面），在它后面插入
      const moreButton = buttonContainer.querySelector('[data-testid="message_action_more"]');
      if (moreButton && moreButton.parentElement) {
        return moreButton.parentElement;
      }
      return buttonContainer;
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
window.TidyChat.adapters.push(new DoubaoAdapter());

