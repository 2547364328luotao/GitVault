'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useState, useEffect } from 'react';

export default function TutorialPage() {
  const [activeSection, setActiveSection] = useState<string>('registration');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [previewImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewImage]);

  // 监听滚动，高亮当前章节
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'registration',
        'registration-1',
        'registration-2',
        'registration-3',
        'registration-4',
        'registration-5',
        'registration-6',
        'registration-7',
        'application',
        'application-1',
        'application-2',
        'application-3',
        'application-4',
        'application-5',
        'application-6',
        'application-7',
        'benefits',
        'faq'
      ];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 滚动到指定章节
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.offsetTop - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // 按钮组件
  const Button = ({ text, style }: { text: string; style: string }) => {
    const styles = {
      github: 'inline-flex items-center px-4 py-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-sm font-medium rounded-md border border-[#1f883d]/20 shadow-sm transition-colors cursor-default',
      gradient: 'inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-md transition-all cursor-default',
      primary: 'inline-flex items-center px-4 py-1.5 bg-[#0969da] hover:bg-[#0860ca] text-white text-sm font-medium rounded-md shadow-sm transition-colors cursor-default',
      danger: 'inline-flex items-center px-3 py-1 bg-white hover:bg-[#f6f8fa] text-[#cf222e] text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm transition-colors cursor-default',
    };
    
    return (
      <span className={styles[style as keyof typeof styles]}>
        {text}
      </span>
    );
  };

  // 类型定义
  type StepImage = {
    src: string;
    caption: string;
  };

  type Step = {
    title: string;
    description: React.ReactNode;
    link?: { text: string; url: string };
    images: StepImage[];
    note?: string | React.ReactNode;
    warning?: string | React.ReactNode;
    success?: string;
  };

  // 第一板块：GitHub 账号注册步骤
  const registrationSteps: Step[] = [
    {
      title: '准备邮箱',
      description: '准备一个 163 邮箱或者 QQ 邮箱',
      link: { text: 'https://github.com/signup', url: 'https://github.com/signup' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t1.png', caption: '访问 GitHub 注册网站,先填入准备的邮箱' }
      ],
      note: '📝 提示:先填入刚刚准备的自己的邮箱'
    },
    {
      title: '生成账号信息',
      description: (
        <span>
          返回 GitVault 网站,点击 <Button text="🤖 AI 生成" style="gradient" /> 按钮生成账号信息
        </span>
      ),
      link: { text: 'https://opxqo.com', url: 'https://opxqo.com' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t2.png', caption: '点击添加账号按钮' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t4.png', caption: 'AI 会随机生成 GitHub 账号信息' }
      ],
      warning: (
        <span>
          ⚠️ 重要:目前用得着的信息有 GitHub 账号、密码、Name。(邮箱账号暂时不用,后面换绑需要)记得先点击 <Button text="添加" style="primary" /> 按钮保存一下!
        </span>
      )
    },
    {
      title: '完成 GitHub 注册',
      description: (
        <span>
          使用生成的信息完成 GitHub 注册,填好后点击 <Button text="Create account" style="github" /> 按钮
        </span>
      ),
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t5.png', caption: '填好信息后点击 Create account 按钮' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t6.png', caption: '完成人机验证' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t7.png', caption: '🎉 注册成功!' }
      ]
    },
    {
      title: '邮箱换绑',
      description: (
        <span>
          将邮箱换绑到 GitVault 邮箱,填入后点击 <Button text="Add" style="github" /> 按钮
        </span>
      ),
      link: { text: 'https://github.com/settings/emails', url: 'https://github.com/settings/emails' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t8.png', caption: '填入 GitVault 生成的邮箱账号' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t9.png', caption: '点击 Add 按钮' }
      ],
      warning: '⚠️ 注意:邮箱后缀必须是 @opqo.qzz.io'
    },
    {
      title: '验证邮箱',
      description: (
        <span>
          返回 GitVault 收件箱,收到邮件后点击 <Button text="Verify email address" style="github" /> 按钮
        </span>
      ),
      link: { text: 'https://www.opxqo.com/inbox', url: 'https://www.opxqo.com/inbox' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t10.png', caption: '收到邮件后点击 Verify email address 按钮' },
      ],
      note: '✅ 邮箱验证成功!'
    },
    {
      title: '删除旧邮箱',
      description: (
        <span>
          删除之前的注册邮箱,点击 <Button text="Delete" style="danger" /> 按钮
        </span>
      ),
      link: { text: 'https://github.com/settings/emails', url: 'https://github.com/settings/emails' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t13.png', caption: '点击旧邮箱的 Delete 按钮' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t14.png', caption: '🎉 邮箱换绑成功!' }
      ]
    },
    {
      title: '保存到 GitVault',
      description: (
        <span>
          最后保存账号信息,点击 <Button text="添加注册" style="primary" /> 按钮
        </span>
      ),
      link: { text: 'https://www.opxqo.com/', url: 'https://www.opxqo.com/' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t15.png', caption: '点击添加注册按钮' }
      ],
      success: '🎉 恭喜!至此 GitHub 账号注册成功'
    }
  ];

  // 第二板块：GitHub 学生包申请步骤
  const applicationSteps: Step[] = [
    {
      title: '完善账号信息',
      description: (
        <span>
          登录 GitHub 账号,访问个人资料页面完善账号信息,点击 <Button text="Save" style="github" /> 保存
        </span>
      ),
      link: { text: 'https://github.com/settings/profile', url: 'https://github.com/settings/profile' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t16.png', caption: '修改个人资料信息' }
      ],
      note: '📝 需要填写的信息:\n• Name: 与 GitVault 保持一致\n• Public email: 选择 GitVault 邮箱\n• Bio: 简短的英文自我介绍\n• Company & Location: 填写学校名称'
    },
    {
      title: '完善支付信息',
      description: '填写账单地址信息,用于后续认证',
      link: { text: 'https://github.com/settings/billing/payment_information', url: 'https://github.com/settings/billing/payment_information' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t18.png', caption: '填写支付信息' }
      ],
      warning: '⚠️ 重要: First name 和 Last name 必须与生成的账号信息一致'
    },
    {
      title: '开启两步验证',
      description: (
        <span>
          访问安全设置页面,点击 <Button text="Enable two-factor authentication" style="github" /> 按钮
        </span>
      ),
      link: { text: 'https://github.com/settings/security', url: 'https://github.com/settings/security' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t19.png', caption: '开启两步验证' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t20.png', caption: '使用 Authenticator 扫码' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t22.png', caption: '输入验证码' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t23.png', caption: '下载恢复码' }
      ],
      note: '� 需要使用 Google Authenticator 或类似的验证器 APP\n• 扫描二维码绑定账号\n• 输入 6 位验证码\n• 保存恢复码到 GitVault'
    },
    {
      title: '保存恢复码',
      description: (
        <span>
          返回 GitVault,在账号编辑页面填入 GitHub Recovery Codes,点击 <Button text="保存" style="primary" /> 按钮
        </span>
      ),
      link: { text: 'https://www.opxqo.com/accounts', url: 'https://www.opxqo.com/accounts' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t24.png', caption: '填入恢复码' }
      ],
      warning: '⚠️ 恢复码非常重要,请妥善保存!'
    },
    {
      title: '生成学生证明',
      description: (
        <span>
          访问 GitVault 认证报告页面,点击 <Button text="🎲 随机生成" style="gradient" /> 按钮生成学生证明
        </span>
      ),
      link: { text: 'https://www.opxqo.com/reports', url: 'https://www.opxqo.com/reports' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t25.png', caption: '点击随机生成按钮' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t26.png', caption: 'AI 生成学生信息' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t27.png', caption: '生成报告成功' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t28.png', caption: '预览学生证明' }
      ],
      note: '� 确保 Name 与 GitHub 账号信息完全一致\n• 点击生成报告按钮\n• 预览确认信息无误\n• 保存图片用于后续上传'
    },
    {
      title: '提交学生认证',
      description: (
        <span>
          访问 GitHub Education 申请页面,点击 <Button text="Start an application" style="github" /> 开始申请
        </span>
      ),
      link: { text: 'https://github.com/settings/education/benefits', url: 'https://github.com/settings/education/benefits' },
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t29.png', caption: '学生证明预览效果' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t30.png', caption: '填写申请信息' },
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t31.png', caption: '上传学生证明' }
      ],
      note: '📸 申请步骤:\n• 点击 Share Location 按钮\n• 选择 "Dated school ID - Good"\n• 上传刚才生成的学生证明\n• 点击 Continue 提交申请'
    },
    {
      title: '等待审核通过',
      description: '提交成功后,等待 GitHub 审核,通常 3-7 个工作日会有结果',
      images: [
        { src: 'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/t32.png', caption: '🎉 认证申请已提交' }
      ],
      success: '🎉 恭喜!学生认证申请已提交,请耐心等待审核结果',
      note: '📧 审核期间:\n• 注意查收 GitHub 邮件通知\n• 可能需要补充材料\n• 审核通过后即可享受学生包福利'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
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
                className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg"
              >
                📚 申请教程
              </Link>
              <Link 
                href="/inbox"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                📧 收件箱
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-8">
        {/* 左侧目录导航 */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-3">
              目录导航
            </div>
            
            {/* 第一板块 */}
            <button
              onClick={() => scrollToSection('registration')}
              className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                activeSection === 'registration'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              📝 GitHub 账号注册
            </button>
            
            <div className="pl-4 space-y-1">
              {registrationSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(`registration-${index + 1}`)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeSection === `registration-${index + 1}`
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                      : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {index + 1}. {step.title}
                </button>
              ))}
            </div>

            {/* 第二板块 */}
            <button
              onClick={() => scrollToSection('application')}
              className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors mt-4 ${
                activeSection === 'application'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              🎓 学生包申请
            </button>
            
            <div className="pl-4 space-y-1">
              {applicationSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(`application-${index + 1}`)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeSection === `application-${index + 1}`
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  {index + 1}. {step.title}
                </button>
              ))}
            </div>

            {/* 其他章节 */}
            <button
              onClick={() => scrollToSection('benefits')}
              className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors mt-4 ${
                activeSection === 'benefits'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              🎁 福利一览
            </button>
            
            <button
              onClick={() => scrollToSection('faq')}
              className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                activeSection === 'faq'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              ❓ 常见问题
            </button>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 min-w-0">
        {/* 标题 */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            GitHub 学生包申请教程 🎓
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            完整的 GitHub Student Developer Pack 申请指南,帮助学生获取价值超过 $200,000 的免费开发者工具和服务
          </p>
        </div>

        {/* 教程导航 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-2xl text-white">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-3">第一步：注册 GitHub 账号</h3>
            <p className="text-white/90 mb-4">使用 GitVault 快速创建 GitHub 账号,完成邮箱验证</p>
            <div className="flex items-center text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">7 个步骤</span>
              <span className="ml-2">约 15 分钟</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 rounded-2xl text-white">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold mb-3">第二步：申请学生包</h3>
            <p className="text-white/90 mb-4">提交学生认证,获取价值 $200,000+ 的开发者福利</p>
            <div className="flex items-center text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">7 个步骤</span>
              <span className="ml-2">约 10 分钟</span>
            </div>
          </div>
        </div>

        {/* 第一板块：GitHub 账号注册 */}
        <section id="registration" className="mb-20">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-3 font-bold text-xl">
              📝 第一步：注册 GitHub 账号
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent ml-4"></div>
          </div>
          
          <div className="space-y-12">
            {registrationSteps.map((step, index) => (
              <div key={index} id={`registration-${index + 1}`} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 scroll-mt-24">
                {/* 步骤标题 */}
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>

                {/* 链接 */}
                {step.link && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl mb-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">🌐 访问链接:</p>
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-mono underline break-all transition-colors"
                    >
                      {step.link.text}
                    </a>
                  </div>
                )}

                {/* 图片列表 */}
                {step.images.length > 0 && (
                  <div className="space-y-4">
                    {step.images.map((image, imgIndex) => (
                      <div 
                        key={imgIndex} 
                        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-all group"
                        onClick={() => setPreviewImage(image.src)}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={image.src}
                            alt={image.caption}
                            className="w-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{image.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 提示 */}
                {step.note && (
                  <div className="bg-blue-500/10 dark:bg-blue-500/20 border-l-4 border-blue-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">{step.note}</p>
                  </div>
                )}

                {/* 警告 */}
                {step.warning && (
                  <div className="bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white">{step.warning}</p>
                  </div>
                )}

                {/* 成功 */}
                {step.success && (
                  <div className="bg-green-500/10 dark:bg-green-500/20 border-l-4 border-green-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{step.success}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 分隔提示 */}
        <div className="relative mb-20">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-black px-6 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-full border-2 border-gray-300 dark:border-gray-700">
              ✅ 账号注册完成，继续申请学生包 👇
            </span>
          </div>
        </div>

        {/* 第二板块：GitHub 学生包申请 */}
        <section id="application" className="mb-20">
          <div className="flex items-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-6 py-3 font-bold text-xl">
              🎓 第二步：申请 GitHub 学生包
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent ml-4"></div>
          </div>
          
          <div className="space-y-12">
            {applicationSteps.map((step, index) => (
              <div key={index} id={`application-${index + 1}`} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 scroll-mt-24">
                {/* 步骤标题 */}
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>

                {/* 链接 */}
                {step.link && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl mb-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">🌐 访问链接:</p>
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-mono underline break-all transition-colors"
                    >
                      {step.link.text}
                    </a>
                  </div>
                )}

                {/* 图片列表 */}
                {step.images.length > 0 && (
                  <div className="space-y-4">
                    {step.images.map((image, imgIndex) => (
                      <div 
                        key={imgIndex} 
                        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                        onClick={() => setPreviewImage(image.src)}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={image.src}
                            alt={image.caption}
                            className="w-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{image.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 提示 */}
                {step.note && (
                  <div className="bg-blue-500/10 dark:bg-blue-500/20 border-l-4 border-blue-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">{step.note}</p>
                  </div>
                )}

                {/* 警告 */}
                {step.warning && (
                  <div className="bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white">{step.warning}</p>
                  </div>
                )}

                {/* 成功 */}
                {step.success && (
                  <div className="bg-green-500/10 dark:bg-green-500/20 border-l-4 border-green-500 p-4 rounded-r-lg mt-6">
                    <p className="text-gray-900 dark:text-white font-bold text-lg">{step.success}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 学生包福利展示 */}
        <div id="benefits" className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 border border-purple-500/30 dark:border-purple-500/50 rounded-2xl p-8 mb-16 scroll-mt-24">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🎁</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">GitHub 学生包福利一览</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                成功申请后,你将获得价值超过 <span className="text-purple-600 dark:text-purple-400 font-bold">$200,000</span> 的免费开发者工具和服务！
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">☁️</span>
                    云服务平台
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Digital Ocean - $200 免费额度</li>
                    <li>• Microsoft Azure - $100 免费额度</li>
                    <li>• Heroku - 免费托管服务</li>
                    <li>• AWS Educate - 云计算资源</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">💻</span>
                    开发工具
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• JetBrains 全家桶 - 免费使用</li>
                    <li>• GitHub Copilot - AI 代码助手</li>
                    <li>• GitKraken - Git 可视化工具</li>
                    <li>• Termius - SSH 客户端</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">🎨</span>
                    设计工具
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Canva Pro - 专业设计工具</li>
                    <li>• Figma Pro - UI/UX 设计</li>
                    <li>• Bootstrap Studio - 网页设计</li>
                    <li>• Icons8 - 图标资源库</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">�</span>
                    学习资源
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• DataCamp - 数据科学课程</li>
                    <li>• Frontend Masters - 前端课程</li>
                    <li>• Educative - 编程教程</li>
                    <li>• LinkedIn Learning - 技能提升</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">🗄️</span>
                    数据库服务
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• MongoDB Atlas - 云数据库</li>
                    <li>• PlanetScale - MySQL 数据库</li>
                    <li>• CockroachDB - 分布式数据库</li>
                    <li>• Redis Cloud - 缓存服务</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <span className="text-xl mr-2">�</span>
                    安全工具
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Namecheap SSL - 免费证书</li>
                    <li>• Dashlane - 密码管理器</li>
                    <li>• Snyk - 代码安全扫描</li>
                    <li>• Honeybadger - 错误监控</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>提示:</strong> 完整的福利列表包含 100+ 项服务,访问 <a href="https://education.github.com/pack" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700">GitHub Education Pack</a> 查看所有福利
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <section id="faq" className="mt-16 scroll-mt-24">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            常见问题 FAQ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                为什么要换绑邮箱?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                GitHub Education 认证需要教育邮箱或学生证明,使用 GitVault 的邮箱系统可以方便接收验证邮件,并且支持学生包申请。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                AI 生成的信息安全吗?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                AI 生成的是随机虚拟信息,仅用于 GitHub 账号注册。所有信息都保存在您自己的 GitVault 账户中,完全由您掌控。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                学生认证审核需要多久?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                通常 3-7 个工作日会有结果。审核期间请注意查收 GitHub 邮件,可能需要补充材料。高峰期可能会延长到 2 周。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                验证邮件收不到怎么办?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                确保邮箱后缀是 @opqo.qzz.io,刷新 GitVault 收件箱页面。邮件可能延迟 5-10 分钟送达,请耐心等待。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                两步验证的恢复码丢了怎么办?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                恢复码非常重要!建议保存在 GitVault 账户中。如果丢失,需要通过 GitHub 支持恢复账号,过程较为复杂。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                学生包有效期是多久?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                学生包通常有效期为 2 年,到期前可以续期。只要还是学生身份,就可以继续享受福利。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                认证失败怎么办?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                如果认证失败,检查学生证明是否清晰、信息是否一致。可以重新生成证明并再次提交申请,没有次数限制。
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-2xl mr-2">❓</span>
                可以用真实的教育邮箱吗?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                当然可以!如果您有 .edu 或学校官方邮箱,可以直接使用,无需换绑。使用真实教育邮箱通过率更高。
              </p>
            </div>
          </div>
        </section>

        {/* 底部按钮 */}
        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-center"
          >
            🚀 返回首页开始申请
          </Link>
          <Link
            href="/inbox"
            className="px-8 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-800 text-center"
          >
            📧 查看收件箱
          </Link>
        </div>
        </main>
      </div>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Made with ❤️ for Students | GitVault © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
