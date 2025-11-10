'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { EmailNote } from '@/lib/db';

export default function EmailNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<EmailNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<EmailNote | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  
  const [formData, setFormData] = useState({
    email: '',
    email_password: '',
    phone: '',
    notes: '',
  });

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/email-notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch email notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

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

  const resetForm = () => {
    setFormData({
      email: '',
      email_password: '',
      phone: '',
      notes: '',
    });
    setEditingNote(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNote) {
        // 更新
        const response = await fetch(`/api/email-notes/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          fetchNotes();
          resetForm();
        } else {
          alert('更新失败');
        }
      } else {
        // 创建
        const response = await fetch('/api/email-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          fetchNotes();
          resetForm();
        } else {
          alert('添加失败');
        }
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('操作失败');
    }
  };

  const handleEdit = (note: EmailNote) => {
    setEditingNote(note);
    setFormData({
      email: note.email,
      email_password: note.email_password,
      phone: note.phone || '',
      notes: note.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条备忘吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePassword = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
                className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg"
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
                邮箱备忘录
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                记录还未注册 GitHub 账号的邮箱信息
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              {showForm ? '取消' : '+ 添加邮箱'}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingNote ? '编辑邮箱备忘' : '添加邮箱备忘'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      邮箱账号 *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      邮箱密码 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.email_password}
                      onChange={(e) => setFormData({ ...formData, email_password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="密码"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    绑定手机号
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    备注说明
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="备注信息..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingNote ? '更新' : '添加'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Notes List */}
          {isLoading ? (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">加载中...</p>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-600 dark:text-gray-400">还没有邮箱备忘录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                >
                  <div
                    className="p-6 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleExpand(note.id!)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xl">
                          📧
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {note.email}
                          </h3>
                          {note.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📱 {note.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note);
                        }}
                        className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-700"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id!);
                        }}
                        className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-900 dark:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-800"
                      >
                        删除
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                          expandedId === note.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {expandedId === note.id && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">邮箱账号</label>
                          <p className="text-sm text-gray-900 dark:text-gray-200 break-all">{note.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">邮箱密码</label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-900 dark:text-gray-200 font-mono">
                              {showPasswords[note.id!] ? note.email_password : '••••••••'}
                            </p>
                            <button
                              onClick={() => togglePassword(note.id!)}
                              className="text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                            >
                              {showPasswords[note.id!] ? '隐藏' : '显示'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {note.phone && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">绑定手机号</label>
                          <p className="text-sm text-gray-900 dark:text-gray-200">{note.phone}</p>
                        </div>
                      )}

                      {note.notes && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-500 mb-1 block">备注说明</label>
                          <p className="text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{note.notes}</p>
                        </div>
                      )}

                      {note.created_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-600 pt-2 border-t border-gray-200 dark:border-gray-800">
                          创建时间: {new Date(note.created_at).toLocaleString('zh-CN')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
