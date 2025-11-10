'use client';

import { useState, useMemo } from 'react';
import { GitHubAccount } from '@/lib/db';

interface AccountListProps {
  accounts: GitHubAccount[];
  onEdit: (account: GitHubAccount) => void;
  onDelete: (id: number) => void;
}

interface AccessCode {
  id: number;
  code: string;
  expires_at: string | null;
  used_count: number;
  max_uses: number;
  created_at: string;
}

export default function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'none'>('all');
  const [saleFilter, setSaleFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [loadingCodes, setLoadingCodes] = useState<{ [key: number]: boolean }>({});
  const [generatedCodes, setGeneratedCodes] = useState<{ [key: number]: AccessCode[] }>({});
  const [showCodeModal, setShowCodeModal] = useState<number | null>(null);
  const [checkingEducation, setCheckingEducation] = useState<{ [key: number]: boolean }>({});
  const [educationStatus, setEducationStatus] = useState<{ [key: number]: any }>({});

  const categorizedAccounts = useMemo(() => {
    return {
      active: accounts.filter(acc => acc.copilot_pro_status === 'active'),
      pending: accounts.filter(acc => acc.copilot_pro_status === 'pending'),
      none: accounts.filter(acc => acc.copilot_pro_status === 'none' || !acc.copilot_pro_status),
    };
  }, [accounts]);

  const displayedAccounts = useMemo(() => {
    if (activeTab === 'all') return accounts;
    
    let filtered = categorizedAccounts[activeTab as keyof typeof categorizedAccounts];
    
    // 如果在 "已激活" 标签下，应用销售状态筛选
    if (activeTab === 'active' && saleFilter !== 'all') {
      filtered = filtered.filter(acc => {
        if (saleFilter === 'available') {
          return acc.sale_status === 'available' || !acc.sale_status;
        }
        return acc.sale_status === 'sold';
      });
    }
    
    return filtered;
  }, [activeTab, saleFilter, accounts, categorizedAccounts]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePassword = (id: number, field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [`${id}-${field}`]: !prev[`${id}-${field}`]
    }));
  };

  const generateAccessCode = async (accountId: number, expiresInDays: number = 7, maxUses: number = 1) => {
    try {
      setLoadingCodes(prev => ({ ...prev, [accountId]: true }));
      const response = await fetch('/api/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, expiresInDays, maxUses })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '生成失败');
      }

      const newCode = await response.json();
      setGeneratedCodes(prev => ({
        ...prev,
        [accountId]: [...(prev[accountId] || []), newCode]
      }));
      setShowCodeModal(accountId);
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成卡密失败');
    } finally {
      setLoadingCodes(prev => ({ ...prev, [accountId]: false }));
    }
  };

  const fetchAccessCodes = async (accountId: number) => {
    try {
      const response = await fetch(`/api/access-codes?accountId=${accountId}`);
      if (response.ok) {
        const codes = await response.json();
        setGeneratedCodes(prev => ({ ...prev, [accountId]: codes }));
      }
    } catch (error) {
      console.error('获取卡密失败:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板!');
  };

  const toggleSaleStatus = async (accountId: number, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'sold' ? 'available' : 'sold';
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_status: newStatus })
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      // 刷新页面以显示更新
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : '更新销售状态失败');
    }
  };

  const checkEducationStatus = async (accountId: number, githubCookie: string | undefined, githubApplyId: string | undefined) => {
    if (!githubApplyId || githubApplyId.trim() === '') {
      alert(
        '❌ 该账号未设置 GitHub 申请ID\n\n' +
        '📋 操作步骤：\n' +
        '1. 点击【编辑】按钮\n' +
        '2. 在 GitHub 申请ID 输入框中填写申请ID\n' +
        '3. 申请ID 从 GitHub Education 页面 URL 获取\n' +
        '4. 保存后即可查询申请状态\n\n' +
        '💡 示例：URL 中的数字部分\n' +
        'https://github.com/settings/education/developer_pack_applications/12345678'
      );
      return;
    }

    if (!githubCookie || githubCookie.trim() === '') {
      alert(
        '❌ 该账号未设置 GitHub Cookie\n\n' +
        '📋 操作步骤：\n' +
        '1. 点击【编辑】按钮\n' +
        '2. 在 GitHub Cookie 输入框中粘贴您的 Cookie\n' +
        '3. 点击输入框旁边的【如何获取？】查看详细教程\n' +
        '4. 保存后即可查询申请状态\n\n' +
        '💡 提示：Cookie 等同于登录凭证，是查询申请状态的必需信息'
      );
      return;
    }

    try {
      setCheckingEducation(prev => ({ ...prev, [accountId]: true }));
      const response = await fetch('/api/check-education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyId: githubApplyId, cookie: githubCookie })
      });

      if (!response.ok) {
        const error = await response.json();
        let errorMsg = error.error || '查询失败';
        if (error.tip) {
          errorMsg += '\n\n💡 提示：' + error.tip;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      setEducationStatus(prev => ({ ...prev, [accountId]: result }));
      
      // 查询成功后显示友好提示
      if (result.status === 'Approved') {
        alert('✅ 查询成功！申请已通过，可以将状态更新为【已激活】了！');
      } else if (result.status === 'Denied') {
        alert('❌ 查询成功：申请被拒绝，建议检查申请信息或重新申请');
      } else {
        alert('⏳ 查询成功：申请正在审核中，请耐心等待');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '查询 Education 状态失败';
      // 使用多行提示框
      if (errorMessage.includes('无法连接到 GitHub')) {
        alert(
          '❌ ' + errorMessage + '\n\n' +
          '这可能是因为：\n' +
          '1. 网络无法访问 GitHub\n' +
          '2. 需要配置代理（中国大陆用户）\n' +
          '3. 防火墙限制\n\n' +
          '解决方法：\n' +
          '→ 查看项目根目录的 PROXY_SETUP.md 文件\n' +
          '→ 在 .env.local 中配置代理（PROXY_URL）\n' +
          '→ 当前配置：' + (process.env.PROXY_URL || '未配置')
        );
      } else if (errorMessage.includes('Cookie 无效')) {
        alert(
          '❌ ' + errorMessage + '\n\n' +
          '📋 解决方法：\n' +
          '1. 在浏览器中访问 GitHub 并登录\n' +
          '2. 按 F12 打开开发者工具\n' +
          '3. 在 Console 中输入：copy(document.cookie)\n' +
          '4. 编辑账号，将新的 Cookie 粘贴到输入框\n' +
          '5. 保存后重新查询'
        );
      } else {
        alert(errorMessage);
      }
      setEducationStatus(prev => ({ ...prev, [accountId]: null }));
    } finally {
      setCheckingEducation(prev => ({ ...prev, [accountId]: false }));
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-gray-600 dark:text-gray-400">还没有添加任何账号</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="space-y-3">
        {/* 使用说明提示 */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1 text-sm text-blue-700 dark:text-blue-300">
            <strong>查询申请状态：</strong>需要先将账号状态设为【申请中】并添加 GitHub Cookie
          </div>
          <a
            href="https://github.com/2547364328luotao/GitVault/blob/master/HOW_TO_CHECK_EDUCATION_STATUS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            📖 查看教程
          </a>
        </div>
        
        {/* 主标签页 */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => {
              setActiveTab('all');
              setSaleFilter('all');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            全部 ({accounts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('active');
              setSaleFilter('all');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            已激活 ({categorizedAccounts.active.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('pending');
              setSaleFilter('all');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            申请中 ({categorizedAccounts.pending.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('none');
              setSaleFilter('all');
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'none'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            未开通 ({categorizedAccounts.none.length})
          </button>
        </div>

        {/* 已激活的二级筛选 - 销售状态 */}
        {activeTab === 'active' && (
          <div className="flex gap-2 bg-purple-50 dark:bg-purple-950/30 p-1 rounded-xl border border-purple-200 dark:border-purple-800">
            <button
              onClick={() => setSaleFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                saleFilter === 'all'
                  ? 'bg-white dark:bg-purple-900 text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              全部 ({categorizedAccounts.active.length})
            </button>
            <button
              onClick={() => setSaleFilter('available')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                saleFilter === 'available'
                  ? 'bg-white dark:bg-purple-900 text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💰 可售 ({categorizedAccounts.active.filter(acc => acc.sale_status === 'available' || !acc.sale_status).length})
            </button>
            <button
              onClick={() => setSaleFilter('sold')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                saleFilter === 'sold'
                  ? 'bg-white dark:bg-purple-900 text-gray-900 dark:text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🔒 已出售 ({categorizedAccounts.active.filter(acc => acc.sale_status === 'sold').length})
            </button>
          </div>
        )}
      </div>

      {/* Account Cards */}
      {displayedAccounts.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400">
            {activeTab === 'active' && saleFilter === 'all' && '还没有已激活 Copilot Pro 的账号'}
            {activeTab === 'active' && saleFilter === 'available' && '还没有可售的已激活账号'}
            {activeTab === 'active' && saleFilter === 'sold' && '还没有已出售的账号'}
            {activeTab === 'pending' && '还没有正在申请 Copilot Pro 的账号'}
            {activeTab === 'none' && '所有账号都已开通或申请 Copilot Pro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all"
            >
              <div
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(account.id!)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {account.github_username}
                    </h3>
                    {account.copilot_pro_status === 'active' && account.sale_status === 'sold' && (
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-medium rounded-full">
                        已出售
                      </span>
                    )}
                    {account.copilot_pro_status === 'active' && (
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                        Copilot Pro
                      </span>
                    )}
                    {account.copilot_pro_status === 'pending' && (
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full">
                        申请中
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{account.email}</p>
                  {account.created_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-600">
                      📅 {new Date(account.created_at).toLocaleString('zh-CN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(account);
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(account.id!);
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-800"
                  >
                    删除
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                      expandedId === account.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedId === account.id && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">邮箱账号</label>
                      <p className="text-sm text-gray-900 dark:text-gray-200 break-all">{account.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">邮箱密码</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                          {showPasswords[`${account.id}-email`] ? account.email_password : '••••••••'}
                        </p>
                        <button
                          onClick={() => togglePassword(account.id!, 'email')}
                          className="text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                        >
                          {showPasswords[`${account.id}-email`] ? '隐藏' : '显示'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {account.email_phone && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">邮箱绑定手机号</label>
                      <p className="text-sm text-gray-900 dark:text-gray-200">{account.email_phone}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">GitHub 账号</label>
                      <p className="text-sm text-gray-900 dark:text-gray-200">{account.github_username}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">GitHub 密码</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                          {showPasswords[`${account.id}-github`] ? account.github_password : '••••••••'}
                        </p>
                        <button
                          onClick={() => togglePassword(account.id!, 'github')}
                          className="text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                        >
                          {showPasswords[`${account.id}-github`] ? '隐藏' : '显示'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {account.github_name && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">GitHub Name</label>
                      <p className="text-sm text-gray-900 dark:text-gray-200">{account.github_name}</p>
                    </div>
                  )}

                  {account.github_recovery_codes && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">GitHub Recovery Codes</label>
                      <pre className="text-xs text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mt-1 overflow-x-auto border border-gray-200 dark:border-gray-800">
                        {account.github_recovery_codes}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                      🤖
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-500 block">GitHub Copilot Pro</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                        {account.copilot_pro_status === 'active' && '已激活'}
                        {account.copilot_pro_status === 'pending' && '申请中'}
                        {account.copilot_pro_status === 'none' && '未开通'}
                      </p>
                    </div>
                    {account.copilot_pro_status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => checkEducationStatus(account.id!, account.github_cookie, account.github_apply_id)}
                          disabled={checkingEducation[account.id!] || !account.github_cookie || !account.github_apply_id}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed whitespace-nowrap"
                          title={!account.github_cookie ? '请先编辑账号添加 GitHub Cookie' : !account.github_apply_id ? '请先编辑账号添加 GitHub 申请ID' : ''}
                        >
                          {checkingEducation[account.id!] ? '查询中...' : '🔍 查询申请状态'}
                        </button>
                        {(!account.github_cookie || !account.github_apply_id) && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⚠️ {!account.github_apply_id && !account.github_cookie ? '未设置 Apply ID 和 Cookie' : !account.github_apply_id ? '未设置 Apply ID' : '未设置 Cookie'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education 申请状态显示区域 */}
                  {account.copilot_pro_status === 'pending' && educationStatus[account.id!] && (
                    <div className={`p-4 rounded-xl border ${
                      educationStatus[account.id!].status === 'Approved' 
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                        : educationStatus[account.id!].status === 'Denied'
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                        : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                          educationStatus[account.id!].status === 'Approved'
                            ? 'bg-green-500'
                            : educationStatus[account.id!].status === 'Denied'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}>
                          {educationStatus[account.id!].status === 'Approved' ? '✅' : educationStatus[account.id!].status === 'Denied' ? '❌' : '⏳'}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold mb-2 ${
                            educationStatus[account.id!].status === 'Approved'
                              ? 'text-green-900 dark:text-green-100'
                              : educationStatus[account.id!].status === 'Denied'
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-yellow-900 dark:text-yellow-100'
                          }`}>
                            申请状态: {educationStatus[account.id!].status}
                          </h4>
                          {educationStatus[account.id!].school_name && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              🏫 学校: {educationStatus[account.id!].school_name}
                            </p>
                          )}
                          {educationStatus[account.id!].school_type && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              📚 类型: {educationStatus[account.id!].school_type}
                            </p>
                          )}
                          {educationStatus[account.id!].submitted_at && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              📅 提交时间: {educationStatus[account.id!].submitted_at}
                            </p>
                          )}
                          {educationStatus[account.id!].message && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                              💬 {educationStatus[account.id!].message}
                            </p>
                          )}
                          {educationStatus[account.id!].status === 'Approved' && (
                            <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700">
                              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                                🎉 恭喜！申请已通过，请：
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                1. 点击【编辑】按钮<br/>
                                2. 将状态改为【已激活】<br/>
                                3. 保存后即可生成分享卡密
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 销售状态切换 - 仅在 Copilot Pro 激活时显示 */}
                  {account.copilot_pro_status === 'active' && (
                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                          account.sale_status === 'sold' 
                            ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                            : 'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          {account.sale_status === 'sold' ? '🔒' : '💰'}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 block">销售状态</label>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                            {account.sale_status === 'sold' ? '已出售' : '可售'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSaleStatus(account.id!, account.sale_status)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          account.sale_status === 'sold'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {account.sale_status === 'sold' ? '标记为可售' : '标记为已售'}
                      </button>
                    </div>
                  )}

                  {/* 生成卡密按钮 - 仅在 Copilot Pro 激活时显示 */}
                  {account.copilot_pro_status === 'active' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          fetchAccessCodes(account.id!);
                          generateAccessCode(account.id!);
                        }}
                        disabled={loadingCodes[account.id!]}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                      >
                        {loadingCodes[account.id!] ? '生成中...' : '🎫 生成分享卡密'}
                      </button>

                      {generatedCodes[account.id!] && generatedCodes[account.id!].length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 block">已生成的卡密</label>
                          {generatedCodes[account.id!].map((code) => (
                            <div
                              key={code.id}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <code className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                                  {code.code}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(code.code)}
                                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  复制
                                </button>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <span>使用次数: {code.used_count}/{code.max_uses}</span>
                                {code.expires_at && (
                                  <span>过期时间: {new Date(code.expires_at).toLocaleDateString('zh-CN')}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            💡 分享此卡密给他人,他们可以在 <a href="/portal" className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 underline" target="_blank">/portal</a> 页面兑换查看账号信息
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-600 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-800">
                    创建时间: {account.created_at ? new Date(account.created_at).toLocaleString('zh-CN') : '-'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
