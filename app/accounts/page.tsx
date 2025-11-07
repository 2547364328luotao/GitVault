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
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              账号列表
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              查看和管理所有 GitHub 账号
            </p>
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
