/**
 * TidyChat - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const btnText = document.getElementById('btnText');
  const collapseIcon = document.getElementById('collapseIcon');
  const expandIcon = document.getElementById('expandIcon');
  const statusValue = document.getElementById('statusValue');
  const errorMsg = document.getElementById('errorMsg');
  const platformBadge = document.getElementById('platformBadge');
  const collapseModeSelect = document.getElementById('collapseMode');

  let isAllCollapsed = false;

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['collapseMode']);
      const mode = result.collapseMode || 'all';
      collapseModeSelect.value = mode;
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      // Notify content script about the change
      await sendMessage('updateSettings', { [key]: value });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * Update UI state
   */
  function updateUI(collapsed, platformName = null) {
    isAllCollapsed = collapsed;

    if (collapsed) {
      btnText.textContent = 'Expand All Messages';
      collapseIcon.classList.add('hidden');
      expandIcon.classList.remove('hidden');
      toggleBtn.classList.add('expanded');
      statusValue.textContent = 'Collapsed';
      statusValue.classList.remove('expanded');
      statusValue.classList.add('collapsed');
    } else {
      btnText.textContent = 'Collapse All Messages';
      collapseIcon.classList.remove('hidden');
      expandIcon.classList.add('hidden');
      toggleBtn.classList.remove('expanded');
      statusValue.textContent = 'Expanded';
      statusValue.classList.remove('collapsed');
      statusValue.classList.add('expanded');
    }

    if (platformName && platformBadge) {
      platformBadge.textContent = platformName;
      platformBadge.style.display = 'inline-block';
    }
  }

  /**
   * Get current active tab
   */
  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  /**
   * Check if supported platform
   */
  function isSupportedPlatform(url) {
    if (!url) return false;
    
    const supportedDomains = [
      'chatgpt.com',
      'chat.openai.com',
      'grok.com',
      'x.com/i/grok',
      'gemini.google.com',
      'bard.google.com',
      'claude.ai',
      'poe.com'
    ];

    return supportedDomains.some(domain => url.includes(domain));
  }

  /**
   * Send message to content script
   */
  async function sendMessage(action, data = {}) {
    const tab = await getCurrentTab();

    if (!isSupportedPlatform(tab.url)) {
      errorMsg.classList.add('show');
      toggleBtn.disabled = true;
      toggleBtn.style.opacity = '0.5';
      toggleBtn.style.cursor = 'not-allowed';
      return null;
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action, ...data });
      return response;
    } catch (error) {
      console.error('Failed to communicate with content script:', error);
      errorMsg.textContent = 'Failed to connect. Please refresh the page.';
      errorMsg.classList.add('show');
      return null;
    }
  }

  /**
   * Initialize popup
   */
  async function init() {
    // Load saved settings
    await loadSettings();

    const tab = await getCurrentTab();

    if (!isSupportedPlatform(tab.url)) {
      errorMsg.classList.add('show');
      toggleBtn.disabled = true;
      toggleBtn.style.opacity = '0.5';
      toggleBtn.style.cursor = 'not-allowed';
      return;
    }

    // Get platform info and state
    const [platformInfo, state] = await Promise.all([
      sendMessage('getPlatformInfo'),
      sendMessage('getState')
    ]);

    if (platformInfo && platformInfo.supported) {
      updateUI(state?.isAllCollapsed || false, platformInfo.name);
    } else if (state) {
      updateUI(state.isAllCollapsed, state.platformName);
    }
  }

  // Toggle button click
  toggleBtn.addEventListener('click', async () => {
    const response = await sendMessage('toggleAll');
    if (response && response.success) {
      updateUI(response.isAllCollapsed);
    }
  });

  // Collapse mode change
  collapseModeSelect.addEventListener('change', async (e) => {
    await saveSettings('collapseMode', e.target.value);
  });

  // Initialize
  init();

  // WeChat ID copy functionality
  const wechatBtn = document.getElementById('wechatBtn');
  const wechatToast = document.getElementById('wechatToast');
  
  if (wechatBtn) {
    wechatBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Copy to clipboard
      navigator.clipboard.writeText('Raingle01').then(() => {
        // Show toast
        if (wechatToast) {
          wechatToast.classList.add('show');
          setTimeout(() => {
            wechatToast.classList.remove('show');
          }, 2000);
        }
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = 'Raingle01';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (wechatToast) {
          wechatToast.classList.add('show');
          setTimeout(() => {
            wechatToast.classList.remove('show');
          }, 2000);
        }
      });
    });
  }
});
