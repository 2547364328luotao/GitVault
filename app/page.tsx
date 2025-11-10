'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AccountForm from '@/components/AccountForm';
import ThemeToggle from '@/components/ThemeToggle';
import { GitHubAccount } from '@/lib/db';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingAccount, setEditingAccount] = useState<GitHubAccount | null>(null);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      fetchAccountForEdit(parseInt(editId));
    }
  }, [searchParams]);

  const fetchAccountForEdit = async (id: number) => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const accounts = await response.json();
        const account = accounts.find((acc: GitHubAccount) => acc.id === id);
        if (account) {
          setEditingAccount(account);
        }
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
    }
  };

  const handleAccountCreated = () => {
    setEditingAccount(null);
    router.push('/accounts');
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    router.push('/');
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
                className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg"
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
                href="/tutorial"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                📚 申请教程
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
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {editingAccount ? '编辑账号' : '添加新账号'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {editingAccount ? '修改 GitHub 账号信息' : '安全地添加您的 GitHub 账号'}
            </p>
          </div>

          <AccountForm 
            onAccountCreated={handleAccountCreated}
            editingAccount={editingAccount}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
