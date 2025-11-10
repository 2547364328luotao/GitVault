// Popup 脚本：获取 Cookie 和 Apply ID

document.addEventListener('DOMContentLoaded', () => {
  const getCookieBtn = document.getElementById('getCookieBtn');
  const getApplyIdBtn = document.getElementById('getApplyIdBtn');
  const clearApplyIdBtn = document.getElementById('clearApplyIdBtn');
  const openGitVaultBtn = document.getElementById('openGitVaultBtn');
  const status = document.getElementById('status');
  const cookiePreview = document.getElementById('cookiePreview');
  const applyIdDisplay = document.getElementById('applyIdDisplay');
  const applyIdValue = document.getElementById('applyIdValue');
  const applyIdHint = document.getElementById('applyIdHint');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');

  // 显示状态消息
  function showStatus(message, type = 'success') {
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
      status.className = 'status';
    }, 3000);
  }

  // 获取并复制 Cookie
  getCookieBtn.addEventListener('click', async () => {
    try {
      // 获取所有 GitHub 域名的 Cookie
      const cookies = await chrome.cookies.getAll({
        domain: '.github.com'
      });

      if (cookies.length === 0) {
        showStatus('❌ 未找到 GitHub Cookie，请先登录 GitHub', 'error');
        return;
      }

      // 构建 Cookie 字符串
      const cookieString = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');

      // 复制到剪贴板
      await navigator.clipboard.writeText(cookieString);

      // 显示预览
      cookiePreview.textContent = cookieString.substring(0, 200) + '...';
      cookiePreview.style.display = 'block';

      showStatus('✅ Cookie 已复制到剪贴板！', 'success');
    } catch (error) {
      console.error('获取 Cookie 失败:', error);
      showStatus('❌ 获取 Cookie 失败: ' + error.message, 'error');
    }
  });

  // 获取并复制 Apply ID
  getApplyIdBtn.addEventListener('click', async () => {
    try {
      console.log('[Popup] 请求获取 Apply ID');
      
      // 从后台服务获取 Apply ID
      chrome.runtime.sendMessage({ action: 'getApplyId' }, (response) => {
        console.log('[Popup] 收到响应:', response);
        
        if (response && response.applyId) {
          const applyId = response.applyId;

          // 复制到剪贴板
          navigator.clipboard.writeText(applyId.toString()).then(() => {
            // 显示 Apply ID
            applyIdValue.textContent = applyId;
            applyIdDisplay.style.display = 'block';
            applyIdHint.style.display = 'none';

            showStatus('✅ Apply ID 已复制到剪贴板！', 'success');
          }).catch(err => {
            showStatus('❌ 复制失败: ' + err.message, 'error');
          });
        } else {
          console.log('[Popup] 未检测到 Apply ID，准备打开 GitHub 页面');
          showStatus('⚠️ 尚未检测到 Apply ID', 'info');
          applyIdHint.style.display = 'block';
          applyIdDisplay.style.display = 'none';

          // 打开 GitHub Education 页面
          setTimeout(() => {
            chrome.tabs.create({
              url: 'https://github.com/settings/education/benefits'
            });
          }, 1500);
        }
      });
    } catch (error) {
      console.error('[Popup] 获取 Apply ID 失败:', error);
      showStatus('❌ 获取 Apply ID 失败: ' + error.message, 'error');
    }
  });

  // 清空 Apply ID
  clearApplyIdBtn.addEventListener('click', () => {
    if (confirm('确定要清空当前的 Apply ID 吗？')) {
      chrome.runtime.sendMessage({ action: 'clearApplyId' }, (response) => {
        if (response && response.success) {
          applyIdDisplay.style.display = 'none';
          applyIdHint.style.display = 'block';
          applyIdValue.textContent = '-';
          showStatus('✅ Apply ID 已清空', 'success');
        }
      });
    }
  });

  // 打开 GitVault
  openGitVaultBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'http://localhost:3001'
    });
  });

  // 页面加载时检查是否已有 Apply ID 和用户名
  chrome.runtime.sendMessage({ action: 'getApplyId' }, (response) => {
    if (response && response.applyId) {
      applyIdValue.textContent = response.applyId;
      applyIdDisplay.style.display = 'block';
      applyIdHint.style.display = 'none';
    }
  });
  
  // 加载并显示当前用户名
  chrome.storage.local.get(['lastUsername'], (result) => {
    if (result.lastUsername) {
      userName.textContent = result.lastUsername;
      userInfo.style.display = 'flex';
    }
  });
});
