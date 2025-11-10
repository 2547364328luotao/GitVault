'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { EmailMessage } from '@/types/email';
import { EmailListItem } from '@/components/EmailListItem';
import { EmailDetail } from '@/components/EmailDetail';
import { formatRelativeTime } from '@/lib/utils/date';

export default function InboxPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // 设置 60 秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch('/api/emails', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('获取邮件失败');
      }
      const data = await response.json();
      setEmails(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('请求超时,请稍后重试');
        } else {
          setError(err.message);
        }
      } else {
        setError('获取邮件失败');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="h-screen bg-white dark:bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GitVault</h1>
            </Link>
            <nav className="flex gap-1">
              <Link 
                href="/"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                添加账号
              </Link>
              <Link 
                href="/accounts"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                账号列表
              </Link>
              <Link 
                href="/email-notes"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                📝 邮箱备忘
              </Link>
              <Link 
                href="/reports"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                🎓 认证报告
              </Link>
              <Link 
                href="/inbox"
                className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg"
              >
                📧 收件箱
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-custom bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">正在加载邮件...</p>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
              <div className="text-6xl mb-4 text-center">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">加载失败</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
              <button
                onClick={fetchEmails}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                重试
              </button>
            </div>
          ) : (
            <>
              {/* Email Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                      📧
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">收件箱</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">github@luotao.qzz.io</p>
                    </div>
                  </div>
                  <button
                    onClick={fetchEmails}
                    disabled={refreshing}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                    {refreshing ? '刷新中...' : '刷新'}
                  </button>
                </div>
              </div>

              {emails.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 dark:text-gray-400">收件箱为空</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Email List */}
                  <div className="lg:col-span-1 space-y-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          邮件列表 ({emails.length})
                        </h3>
                      </div>
                      <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                        {emails.map((email) => (
                          <EmailListItem
                            key={email.id}
                            email={email}
                            isSelected={selectedEmail?.id === email.id}
                            onClick={() => setSelectedEmail(email)}
                            formatDate={formatRelativeTime}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Email Detail */}
                  <div className="lg:col-span-2">
                    {selectedEmail ? (
                      <EmailDetail email={selectedEmail} />
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center h-full flex items-center justify-center min-h-[500px]">
                        <div>
                          <div className="text-6xl mb-4">👈</div>
                          <p className="text-gray-600 dark:text-gray-400">选择一封邮件查看详情</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
