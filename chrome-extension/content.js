// GitHub Cookie Helper - Content Script
// 直接从 HTML 中提取 Apply ID (从 include-fragment 元素)

console.log('[GitHub Cookie Helper] Content script 已注入');

// 用于存储已检测到的 Apply ID
let detectedApplyIds = new Set();

// 用于存储当前登录的 GitHub 用户名
let currentUsername = null;

// 从 include-fragment 元素的 src 属性中提取 Apply ID
function extractApplyIdFromFragment(element) {
    const src = element.getAttribute('src');
    if (src) {
        const match = src.match(/\/settings\/education\/developer_pack_applications\/metadata\/(\d+)/);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    }
    return null;
}

// 从任何包含 metadata URL 的属性中提取 Apply ID
function extractApplyIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/\/metadata\/(\d+)/);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}

// 获取当前登录的 GitHub 用户名
function getCurrentUsername() {
    // 方法1: 从导航栏的用户菜单获取
    const userMenu = document.querySelector('meta[name="user-login"]');
    if (userMenu) {
        return userMenu.getAttribute('content');
    }
    
    // 方法2: 从头像链接获取
    const avatarLink = document.querySelector('a.Header-link img[alt^="@"]');
    if (avatarLink) {
        const alt = avatarLink.getAttribute('alt');
        return alt.replace('@', '');
    }
    
    // 方法3: 从用户菜单按钮获取
    const userButton = document.querySelector('[data-login]');
    if (userButton) {
        return userButton.getAttribute('data-login');
    }
    
    return null;
}

// 检查账号是否切换,如果切换则清空 Apply ID
function checkAccountSwitch() {
    const username = getCurrentUsername();
    
    if (!username) {
        console.log('[GitHub Cookie Helper] 未检测到登录用户');
        return;
    }
    
    // 从 storage 获取之前保存的用户名
    chrome.storage.local.get(['lastUsername'], (result) => {
        const lastUsername = result.lastUsername;
        
        if (lastUsername && lastUsername !== username) {
            // 账号切换了,清空 Apply ID
            console.log(`[GitHub Cookie Helper] 检测到账号切换: ${lastUsername} -> ${username}`);
            console.log('[GitHub Cookie Helper] 清空旧的 Apply ID');
            
            // 清空本地缓存
            detectedApplyIds.clear();
            
            // 通知 background 清空存储
            chrome.runtime.sendMessage({
                action: 'clearApplyId'
            }, (response) => {
                console.log('[GitHub Cookie Helper] Apply ID 已清空');
            });
        } else if (!lastUsername) {
            console.log(`[GitHub Cookie Helper] 首次检测到用户: ${username}`);
        } else {
            console.log(`[GitHub Cookie Helper] 用户未变化: ${username}`);
        }
        
        // 保存当前用户名
        currentUsername = username;
        chrome.storage.local.set({ lastUsername: username }, () => {
            console.log(`[GitHub Cookie Helper] 已保存当前用户名: ${username}`);
        });
    });
}

// 保存 Apply ID 到 background (取最大值)
function saveApplyId(applyId) {
    if (applyId && !detectedApplyIds.has(applyId)) {
        detectedApplyIds.add(applyId);
        console.log(`[GitHub Cookie Helper] 检测到 Apply ID: ${applyId}`);
        
        // 发送到 background script
        chrome.runtime.sendMessage({
            action: 'saveApplyId',
            applyId: applyId
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[GitHub Cookie Helper] 发送消息失败:', chrome.runtime.lastError);
            } else {
                console.log(`[GitHub Cookie Helper] Apply ID 已保存: ${applyId}`);
            }
        });
    }
}

// 扫描页面中的所有 include-fragment 元素
function scanIncludeFragments() {
    const fragments = document.querySelectorAll('include-fragment[src*="/metadata/"]');
    console.log(`[GitHub Cookie Helper] 找到 ${fragments.length} 个 include-fragment 元素`);
    
    let foundIds = [];
    fragments.forEach((fragment) => {
        const applyId = extractApplyIdFromFragment(fragment);
        if (applyId) {
            foundIds.push(applyId);
            saveApplyId(applyId);
        }
    });
    
    if (foundIds.length > 0) {
        console.log(`[GitHub Cookie Helper] 提取到的 Apply IDs: ${foundIds.join(', ')}`);
    }
    
    return foundIds.length;
}

// 扫描页面中的所有可能包含 Apply ID 的元素
function scanAllElements() {
    let totalFound = 0;
    
    // 1. 扫描 include-fragment 元素
    totalFound += scanIncludeFragments();
    
    // 2. 扫描所有带 src 属性的元素
    const elementsWithSrc = document.querySelectorAll('[src*="/metadata/"]');
    console.log(`[GitHub Cookie Helper] 找到 ${elementsWithSrc.length} 个带 src 的元素`);
    elementsWithSrc.forEach((el) => {
        const applyId = extractApplyIdFromUrl(el.getAttribute('src'));
        if (applyId) {
            saveApplyId(applyId);
            totalFound++;
        }
    });
    
    // 3. 扫描所有带 href 属性的元素
    const elementsWithHref = document.querySelectorAll('[href*="/metadata/"]');
    console.log(`[GitHub Cookie Helper] 找到 ${elementsWithHref.length} 个带 href 的元素`);
    elementsWithHref.forEach((el) => {
        const applyId = extractApplyIdFromUrl(el.getAttribute('href'));
        if (applyId) {
            saveApplyId(applyId);
            totalFound++;
        }
    });
    
    // 4. 扫描页面 HTML 源码
    const bodyHTML = document.body.innerHTML;
    const matches = bodyHTML.matchAll(/\/metadata\/(\d+)/g);
    let htmlMatches = 0;
    for (const match of matches) {
        const applyId = parseInt(match[1], 10);
        if (!isNaN(applyId)) {
            saveApplyId(applyId);
            htmlMatches++;
        }
    }
    if (htmlMatches > 0) {
        console.log(`[GitHub Cookie Helper] 从 HTML 源码中找到 ${htmlMatches} 个 Apply ID`);
        totalFound += htmlMatches;
    }
    
    console.log(`[GitHub Cookie Helper] 总共检测到 ${detectedApplyIds.size} 个不重复的 Apply ID`);
    return totalFound;
}

// 监听 DOM 变化,当新元素添加时扫描
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // 检查是否是 include-fragment
                if (node.tagName === 'INCLUDE-FRAGMENT') {
                    const applyId = extractApplyIdFromFragment(node);
                    if (applyId) {
                        saveApplyId(applyId);
                    }
                }
                
                // 检查子元素中的 include-fragment
                const fragments = node.querySelectorAll('include-fragment[src*="/metadata/"]');
                fragments.forEach((fragment) => {
                    const applyId = extractApplyIdFromFragment(fragment);
                    if (applyId) {
                        saveApplyId(applyId);
                    }
                });
                
                // 检查任何包含 metadata URL 的元素
                if (node.getAttribute) {
                    const src = node.getAttribute('src');
                    const href = node.getAttribute('href');
                    const applyIdFromSrc = extractApplyIdFromUrl(src);
                    const applyIdFromHref = extractApplyIdFromUrl(href);
                    
                    if (applyIdFromSrc) saveApplyId(applyIdFromSrc);
                    if (applyIdFromHref) saveApplyId(applyIdFromHref);
                }
            }
        });
    });
});

// 开始监听 DOM 变化
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'href']
});

// 检查账号切换
checkAccountSwitch();

// 立即扫描一次(针对已加载的内容)
console.log('[GitHub Cookie Helper] 立即扫描页面...');
scanAllElements();

// DOMContentLoaded 时再扫描一次
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[GitHub Cookie Helper] DOMContentLoaded - 再次扫描...');
        setTimeout(() => scanAllElements(), 100);
    });
}

// 页面完全加载后再扫描一次
window.addEventListener('load', () => {
    console.log('[GitHub Cookie Helper] 页面完全加载 - 最终扫描...');
    checkAccountSwitch(); // 再次检查账号
    setTimeout(() => scanAllElements(), 500);
});

// 每隔 2 秒扫描一次(捕获延迟加载的内容)
setInterval(() => {
    const newCount = scanAllElements();
    if (newCount > 0) {
        console.log('[GitHub Cookie Helper] 定期扫描发现新的 Apply ID');
    }
}, 2000);

console.log('[GitHub Cookie Helper] Apply ID 监听已启动');
