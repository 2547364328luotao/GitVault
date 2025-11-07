'use client';

import { useState, useEffect } from 'react';
import { GitHubAccount } from '@/lib/db';

interface AccountFormProps {
  onAccountCreated: () => void;
  editingAccount?: GitHubAccount | null;
  onCancelEdit?: () => void;
}

export default function AccountForm({ onAccountCreated, editingAccount, onCancelEdit }: AccountFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    email_password: '',
    email_phone: '',
    github_username: '',
    github_password: '',
    github_name: '',
    github_recovery_codes: '',
    copilot_pro_status: 'none' as 'none' | 'pending' | 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setFormData({
        email: editingAccount.email || '',
        email_password: editingAccount.email_password || '',
        email_phone: editingAccount.email_phone || '',
        github_username: editingAccount.github_username || '',
        github_password: editingAccount.github_password || '',
        github_name: editingAccount.github_name || '',
        github_recovery_codes: editingAccount.github_recovery_codes || '',
        copilot_pro_status: editingAccount.copilot_pro_status || 'none',
      });
    }
  }, [editingAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingAccount 
        ? `/api/accounts/${editingAccount.id}`
        : '/api/accounts';
      
      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          email: '',
          email_password: '',
          email_phone: '',
          github_username: '',
          github_password: '',
          github_name: '',
          github_recovery_codes: '',
          copilot_pro_status: 'none',
        });
        onAccountCreated();
      } else {
        alert('操作失败，请重试');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      email_password: '',
      email_phone: '',
      github_username: '',
      github_password: '',
      github_name: '',
      github_recovery_codes: '',
      copilot_pro_status: 'none',
    });
    onCancelEdit?.();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {editingAccount ? '编辑账号' : '添加新账号'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            邮箱账号 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            邮箱密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={formData.email_password}
            onChange={(e) => setFormData({ ...formData, email_password: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            邮箱绑定手机号
          </label>
          <input
            type="tel"
            value={formData.email_phone}
            onChange={(e) => setFormData({ ...formData, email_phone: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="+86 138 0000 0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub 账号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.github_username}
            onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub 密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={formData.github_password}
            onChange={(e) => setFormData({ ...formData, github_password: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub Name
          </label>
          <input
            type="text"
            value={formData.github_name}
            onChange={(e) => setFormData({ ...formData, github_name: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub Recovery Codes
          </label>
          <textarea
            value={formData.github_recovery_codes}
            onChange={(e) => setFormData({ ...formData, github_recovery_codes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
            placeholder="Recovery codes (一行一个)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
            GitHub Copilot Pro 状态
          </label>
          <div className="flex gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="copilot_status"
                value="none"
                checked={formData.copilot_pro_status === 'none'}
                onChange={(e) => setFormData({ ...formData, copilot_pro_status: 'none' })}
                className="w-4 h-4 text-purple-500 border-gray-400 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">未开通</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="copilot_status"
                value="pending"
                checked={formData.copilot_pro_status === 'pending'}
                onChange={(e) => setFormData({ ...formData, copilot_pro_status: 'pending' })}
                className="w-4 h-4 text-purple-500 border-gray-400 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">申请中</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="copilot_status"
                value="active"
                checked={formData.copilot_pro_status === 'active'}
                onChange={(e) => setFormData({ ...formData, copilot_pro_status: 'active' })}
                className="w-4 h-4 text-purple-500 border-gray-400 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">已激活</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/50"
          >
            {isSubmitting ? '提交中...' : (editingAccount ? '保存修改' : '添加账号')}
          </button>
          {editingAccount && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-colors border border-gray-300 dark:border-gray-700"
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
