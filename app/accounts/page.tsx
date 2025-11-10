'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AccountList from '@/components/AccountList';
import ThemeToggle from '@/components/ThemeToggle';
import { GitHubAccount } from '@/lib/db';

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<GitHubAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: GitHubAccount) => {
    router.push(`/?edit=${account.id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个账号吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

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

  const handleBackup = () => {
    if (accounts.length === 0) {
      alert('暂无数据可备份');
      return;
    }

    // 创建备份数据
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      total: accounts.length,
      accounts: accounts,
    };

    // 转换为 JSON 字符串
    const jsonString = JSON.stringify(backupData, null, 2);
    
    // 创建 Blob 对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 生成文件名：gitvault-backup-2025-11-09-14-30-00.json
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    link.download = `gitvault-backup-${timestamp}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
                className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg"
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
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
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
      <main className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                账号列表
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                查看和管理所有 GitHub 账号
              </p>
            </div>
            <button
              onClick={handleBackup}
              disabled={accounts.length === 0}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              备份数据
            </button>
          </div>

          {isLoading ? (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">加载中...</p>
              </div>
            </div>
          ) : (
            <AccountList 
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
