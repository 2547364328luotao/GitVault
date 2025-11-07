'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface AccountInfo {
  id: number;
  email: string;
  email_password: string;
  email_phone?: string;
  github_username: string;
  github_password: string;
  github_name?: string;
  github_recovery_codes?: string;
  copilot_pro_status: string;
  created_at: string;
}

interface AccessCodeInfo {
  usedCount: number;
  maxUses: number;
  expiresAt: string | null;
}

export default function PortalPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [accessCodeInfo, setAccessCodeInfo] = useState<AccessCodeInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAccount(null);
    setLoading(true);

    try {
      const response = await fetch('/api/access-codes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证失败');
        return;
      }

      setAccount(data.account);
      setAccessCodeInfo(data.accessCode);
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitVault Portal</h1>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            卡密查询门户
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            输入您的访问卡密以查看 GitHub 账号信息
          </p>
        </div>

        {/* 验证表单 */}
        <form onSubmit={handleVerify} className="mb-8">
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
            <label className="block mb-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                访问卡密
              </span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all uppercase tracking-wider"
                required
              />
            </label>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '验证中...' : '验证卡密'}
            </button>
          </div>
        </form>

        {/* 账号信息显示 */}
        {account && accessCodeInfo && (
          <div className="space-y-6">
            {/* 卡密信息 */}
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">卡密信息</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  使用次数: <span className="text-gray-900 dark:text-white font-medium">{accessCodeInfo.usedCount} / {accessCodeInfo.maxUses}</span>
                </p>
                {accessCodeInfo.expiresAt && (
                  <p className="text-gray-600 dark:text-gray-400">
                    过期时间: <span className="text-gray-900 dark:text-white font-medium">{formatDate(accessCodeInfo.expiresAt)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* GitHub 账号信息 */}
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">GitHub 账号信息</h3>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {account.copilot_pro_status === 'active' ? 'Copilot Pro 已开通' : 
                   account.copilot_pro_status === 'pending' ? '申请中' : '未开通'}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    GitHub 用户名
                  </label>
                  <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white">
                    {account.github_username}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    GitHub 密码
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-mono">
                      {showPassword ? account.github_password : '••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      {showPassword ? '隐藏' : '显示'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    注册邮箱
                  </label>
                  <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white">
                    {account.email}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    邮箱密码
                  </label>
                  <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-mono">
                    {account.email_password}
                  </div>
                </div>

                {account.email_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      邮箱绑定手机
                    </label>
                    <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white">
                      {account.email_phone}
                    </div>
                  </div>
                )}

                {account.github_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      GitHub 姓名
                    </label>
                    <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white">
                      {account.github_name}
                    </div>
                  </div>
                )}

                {account.github_recovery_codes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      恢复代码
                    </label>
                    <div className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-mono text-sm whitespace-pre-wrap">
                      {account.github_recovery_codes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
