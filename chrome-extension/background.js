// 后台服务：存储和管理 Apply ID

let maxApplyId = null;

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveApplyId') {
    // 保存 Apply ID
    const applyId = request.applyId;
    
    if (applyId && (maxApplyId === null || applyId > maxApplyId)) {
      maxApplyId = applyId;
      console.log('[GitHub Cookie Helper] 更新最大 Apply ID:', applyId);
      
      // 存储到 chrome.storage
      chrome.storage.local.set({ maxApplyId: applyId }, () => {
        console.log('[GitHub Cookie Helper] Apply ID 已保存到 storage');
      });
    }
    
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'getApplyId') {
    // 返回当前存储的最大 apply_id
    chrome.storage.local.get(['maxApplyId'], (result) => {
      console.log('[GitHub Cookie Helper] 获取 Apply ID:', result.maxApplyId);
      sendResponse({ applyId: result.maxApplyId || null });
    });
    return true; // 异步响应
  }
  
  if (request.action === 'clearApplyId') {
    // 清除存储的 apply_id
    maxApplyId = null;
    chrome.storage.local.remove('maxApplyId', () => {
      console.log('[GitHub Cookie Helper] Apply ID 已清除');
      sendResponse({ success: true });
    });
    return true;
  }
});

// 启动时从 storage 加载
chrome.storage.local.get(['maxApplyId'], (result) => {
  if (result.maxApplyId) {
    maxApplyId = result.maxApplyId;
    console.log('[GitHub Cookie Helper] 从 storage 加载 Apply ID:', maxApplyId);
  }
});

console.log('[GitHub Cookie Helper] 后台服务已启动');
