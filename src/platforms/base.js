/**
 * Base Platform Adapter
 * 所有平台适配器的基类，定义统一接口
 */

class BasePlatformAdapter {
  constructor() {
    if (new.target === BasePlatformAdapter) {
      throw new Error('BasePlatformAdapter is abstract and cannot be instantiated directly');
    }
  }

  /**
   * 平台唯一标识
   * @returns {string}
   */
  get id() {
    throw new Error('Must implement id getter');
  }

  /**
   * 平台显示名称
   * @returns {string}
   */
  get name() {
    throw new Error('Must implement name getter');
  }

  /**
   * 匹配当前 URL 是否属于该平台
   * @param {string} url
   * @returns {boolean}
   */
  matchURL(url) {
    throw new Error('Must implement matchURL()');
  }

  /**
   * 获取消息容器选择器
   * @returns {string}
   */
  getMessageSelector() {
    throw new Error('Must implement getMessageSelector()');
  }

  /**
   * 获取用户消息选择器（可选）
   * @returns {string|null}
   */
  getUserMessageSelector() {
    return null;
  }

  /**
   * 获取 AI 消息选择器（可选）
   * @returns {string|null}
   */
  getAssistantMessageSelector() {
    return null;
  }

  /**
   * 从消息元素中提取文本内容
   * @param {HTMLElement} messageElement
   * @returns {string}
   */
  extractMessageText(messageElement) {
    return messageElement.textContent || '';
  }

  /**
   * 获取消息内容容器（用于隐藏/显示）
   * @param {HTMLElement} messageElement
   * @returns {HTMLElement|null}
   */
  getContentContainer(messageElement) {
    return messageElement;
  }

  /**
   * 获取按钮插入位置
   * @param {HTMLElement} messageElement
   * @returns {{ parent: HTMLElement, position: 'prepend'|'append'|'before'|'after' }}
   */
  getButtonInsertPosition(messageElement) {
    return {
      parent: messageElement,
      position: 'append'
    };
  }

  /**
   * 获取全局按钮的 CSS 定位配置
   * @returns {{ top?: string, right?: string, bottom?: string, left?: string }}
   */
  getGlobalButtonPosition() {
    return {
      top: '80px',
      right: '20px'
    };
  }

  /**
   * 判断消息是否为用户消息
   * @param {HTMLElement} messageElement
   * @returns {boolean}
   */
  isUserMessage(messageElement) {
    const userSelector = this.getUserMessageSelector();
    if (userSelector) {
      return messageElement.matches(userSelector);
    }
    return false;
  }

  /**
   * 获取观察目标元素（MutationObserver）
   * @returns {HTMLElement}
   */
  getObserveTarget() {
    return document.body;
  }

  /**
   * 平台特定的初始化逻辑
   */
  onInit() {
    // Override in subclass if needed
  }

  /**
   * 平台特定的清理逻辑
   */
  onDestroy() {
    // Override in subclass if needed
  }
}

// Export for use in other modules
window.TidyChat = window.TidyChat || {};
window.TidyChat.BasePlatformAdapter = BasePlatformAdapter;

