# TidyChat - AI Chat Collapser

一个 Chrome 扩展，用于折叠/展开 AI 聊天消息，方便浏览长对话。

## 支持平台

- ✅ **ChatGPT** (chatgpt.com, chat.openai.com)
- ✅ **Grok** (grok.com, x.com/i/grok)
- ✅ **Gemini** (gemini.google.com, bard.google.com)
- ✅ **Claude** (claude.ai)
- ✅ **Poe** (poe.com)

## 功能

- **全局按钮**：一键折叠/展开所有聊天消息（固定在页面角落）
- **独立按钮**：每条消息悬停时显示单独的折叠/展开按钮
- **预览文本**：折叠后显示消息前 50 个字符
- **平滑动画**：优雅的折叠/展开过渡效果
- **深色模式**：自动适配各平台深色主题
- **多平台架构**：可扩展的平台适配器设计

## 安装方法

### 1. 生成图标（重要）

首先需要生成正确的扩展图标：

```bash
cd icons
# 在浏览器中打开 generate-icons.html
open generate-icons.html  # macOS
# 或者 start generate-icons.html  # Windows
```

点击下载按钮保存三个图标文件到 `icons/` 目录。

### 2. 加载扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `tidychat` 文件夹

### 3. 使用

1. 访问任一支持的 AI 聊天平台
2. 页面角落会出现全局折叠按钮
3. 悬停在任意消息上会显示单独的折叠按钮
4. 点击扩展图标可以打开控制面板

## 架构设计

```
tidychat/
├── manifest.json              # 扩展配置 (Manifest V3)
├── styles.css                 # 通用样式
├── popup.html                 # 弹窗 UI
├── popup.js                   # 弹窗逻辑
├── src/
│   ├── platforms/             # 平台适配器
│   │   ├── index.js           # 平台注册中心 & 所有适配器
│   │   ├── base.js            # 基类定义（备用）
│   │   ├── chatgpt.js         # ChatGPT 适配器（备用）
│   │   ├── grok.js            # Grok 适配器（备用）
│   │   ├── gemini.js          # Gemini 适配器（备用）
│   │   └── claude.js          # Claude 适配器（备用）
│   ├── core/
│   │   ├── collapser.js       # 核心折叠逻辑
│   │   └── ui.js              # UI 管理器
│   └── main.js                # 主入口
├── icons/                     # 扩展图标
└── README.md
```

### 平台适配器模式

每个平台有独立的适配器，继承自 `BasePlatformAdapter`，只需实现以下方法：

```javascript
class MyPlatformAdapter extends BasePlatformAdapter {
  get id() { return 'my-platform'; }
  get name() { return 'My Platform'; }
  
  matchURL(url) {
    return url.includes('myplatform.com');
  }
  
  getMessageSelector() {
    return '.message-container';
  }
  
  // 可选：自定义其他行为
  getUserMessageSelector() { ... }
  getAssistantMessageSelector() { ... }
  extractMessageText(el) { ... }
  getGlobalButtonPosition() { ... }
}
```

### 添加新平台

1. 在 `src/platforms/index.js` 中添加新的适配器类
2. 在 `window.TidyChat.adapters` 数组中注册
3. 在 `manifest.json` 中添加新平台的 `host_permissions` 和 `matches`

## 开发

```bash
# 修改代码后，在 chrome://extensions/ 页面点击刷新按钮
# 或使用 Extensions Reloader 扩展自动刷新
```

### 调试

在浏览器控制台中：

```javascript
// 查看当前适配器
TidyChat.PlatformManager.getAdapter()

// 查看支持的平台
TidyChat.PlatformManager.getSupportedPlatforms()

// 手动触发折叠/展开
TidyChat.getCollapser().toggleAll()
```

## License

MIT
