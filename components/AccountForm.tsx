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
    github_cookie: '',
    github_apply_id: '',
    copilot_pro_status: 'none' as 'none' | 'pending' | 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showGithubPassword, setShowGithubPassword] = useState(false);

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
        github_cookie: editingAccount.github_cookie || '',
        github_apply_id: editingAccount.github_apply_id || '',
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
          github_cookie: '',
          github_apply_id: '',
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
      github_cookie: '',
      github_apply_id: '',
      copilot_pro_status: 'none',
    });
    onCancelEdit?.();
  };

  const handleAIGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormData({
            email: result.data.email || '',
            email_password: result.data.email_password || '',
            email_phone: result.data.email_phone || '',
            github_username: result.data.github_username || '',
            github_password: result.data.github_password || '',
            github_name: result.data.github_name || '',
            github_recovery_codes: '',
            github_cookie: '',
            github_apply_id: '',
            copilot_pro_status: 'none',
          });
        } else {
          alert('AI 生成失败，请重试');
        }
      } else {
        alert('AI 生成失败，请重试');
      }
    } catch (error) {
      console.error('AI 生成账号失败:', error);
      alert('AI 生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editingAccount ? '编辑账号' : '添加新账号'}
        </h3>
        {!editingAccount && (
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl text-sm"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span> AI 生成中...
              </>
            ) : (
              <>
                🤖 AI 生成
              </>
            )}
          </button>
        )}
      </div>

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
          <div className="relative">
            <input
              type={showEmailPassword ? "text" : "password"}
              required
              value={formData.email_password}
              onChange={(e) => setFormData({ ...formData, email_password: e.target.value })}
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowEmailPassword(!showEmailPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
              title={showEmailPassword ? "隐藏密码" : "显示密码"}
            >
              {showEmailPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
          <div className="relative">
            <input
              type={showGithubPassword ? "text" : "password"}
              required
              value={formData.github_password}
              onChange={(e) => setFormData({ ...formData, github_password: e.target.value })}
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowGithubPassword(!showGithubPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
              title={showGithubPassword ? "隐藏密码" : "显示密码"}
            >
              {showGithubPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub Cookie <span className="text-xs text-gray-500">(用于查询 Education 申请状态)</span>
          </label>
          <textarea
            value={formData.github_cookie}
            onChange={(e) => setFormData({ ...formData, github_cookie: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-xs"
            placeholder="user_session=xxx; _gh_sess=yyy; dotcom_user=zzz"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
            💡 获取方法：登录 GitHub → 按 F12 → Console 标签 → 输入 <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">document.cookie</code> → 复制结果
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            GitHub 申请ID <span className="text-xs text-gray-500">(用于查询 Education 申请状态)</span>
          </label>
          <input
            type="text"
            value={formData.github_apply_id}
            onChange={(e) => setFormData({ ...formData, github_apply_id: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-black border border-gray-300 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
            placeholder="例如: 12345678"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
            💡 <strong>如何获取：</strong>访问 <a href="https://github.com/settings/education" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-600 dark:text-purple-400 underline">GitHub Education</a> → 点击你的申请 → 查看 URL 中的数字
          </p>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            📝 URL 示例: github.com/settings/education/developer_pack_applications/<strong className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">87654321</strong>
          </p>
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
