'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { VerificationReport } from '@/lib/db';

// 照片URL池
const PHOTO_URLS = [
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7009.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7008.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7007.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7006.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7005.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7004.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7003.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7002.png',
  'https://pub-bb2418c72b2345ca95be56a4f387301b.r2.dev/%E8%AF%81%E4%BB%B6%E7%85%A7/%E8%AF%81%E4%BB%B6%E7%85%A7001.png',
];

// 姓氏和名字池（拼音格式）
const LAST_NAMES = ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo', 'He', 'Gao', 'Lin', 'Luo'];
const FIRST_NAMES = ['Wei', 'Fang', 'Na', 'Min', 'Jing', 'Lei', 'Jun', 'Yan', 'Tao', 'Ping', 'Hong', 'Xia', 'Hui', 'Qiang', 'Li', 'Hua', 'Bo', 'Jie', 'Long', 'Ying'];

// 专业池
const MAJORS = [
  'Computer Science and Technology',
  'Software Engineering', 
  'Information Security',
  'Data Science and Big Data Technology',
  'Artificial Intelligence',
  'Network Engineering',
  'Internet of Things Engineering',
  'Digital Media Technology',
  'Electronic Information Engineering',
  'Communication Engineering',
  'Automation',
  'Electrical Engineering',
  'Business Administration',
  'International Economics and Trade',
  'Marketing',
  'Accounting',
  'Finance',
  'English',
  'Japanese',
  'Mechanical Design and Manufacturing'
];

// 院系池
const DEPARTMENTS = [
  'School of Computer Science',
  'School of Software Engineering',
  'School of Information Engineering',
  'School of Business Administration',
  'School of Foreign Languages',
  'School of Mechanical Engineering',
  'School of Electronic Engineering',
  'School of Economics and Management'
];

// 民族池
const ETHNICITIES = ['汉族', '回族', '满族', '蒙古族', '藏族', '维吾尔族', '苗族', '彝族', '壮族', '布依族'];

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<VerificationReport | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    birth_date: '',
    ethnicity: '汉族',
    institution_name: 'Wuhan City College',
    level: '本科',
    major: '',
    duration: '4 年',
    education_type: '普通高等教育',
    learning_form: '普通全日制',
    branch: '',
    department: '',
    admission_date: '',
    status: '在籍（注册学籍）',
    graduation_date: '',
    photo_url: '',
    verification_code: '',
    qr_code_url: 'https://example.com/qrcode.png',
    update_date: new Date().toISOString().split('T')[0].replace(/-/g, '年').replace(/年(\d{2})$/, '年$1日').replace(/(\d{4})年(\d{2})/, '$1年$2月'),
  });

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const generateVerificationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatChineseDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  };

  const generateRandomReport = async () => {
    setIsGeneratingPhoto(true);
    
    try {
      // 随机生成两个字的姓名（拼音格式）
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const name = `${lastName} ${firstName}`;

      // 随机性别
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';

      // 随机出生日期（1995-2005年之间）
      const birthDate = randomDate(new Date(1995, 0, 1), new Date(2005, 11, 31));

      // 随机民族
      const ethnicity = ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)];

      // 随机专业和院系
      const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
      const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];

      // 随机入学日期（2018-2023年9月）
      const admissionYear = 2018 + Math.floor(Math.random() * 6);
      const admissionDate = new Date(admissionYear, 8, 1); // 9月1日

      // 毕业日期 = 入学日期 + 4年
      const graduationDate = new Date(admissionYear + 4, 5, 30); // 6月30日

      // 随机验证码
      const verificationCode = generateVerificationCode();

      // 调用 AI 生成证件照
      let photoUrl = '';
      try {
        const genderText = gender === 'Male' ? '男性' : '女性';
        
        // 随机选择年龄段
        const ages = ['18岁', '20岁', '22岁', '24岁', '26岁', '28岁'];
        const age = ages[Math.floor(Math.random() * ages.length)];
        
        // 随机选择发型
        const maleHairstyles = ['短发', '寸头', '中分短发', '偏分短发', '自然短发', '侧分发型'];
        const femaleHairstyles = ['长直发', '短发', '中长发', '披肩发', '齐肩发', '马尾辫', '自然卷发'];
        const hairstyle = gender === 'Male' 
          ? maleHairstyles[Math.floor(Math.random() * maleHairstyles.length)]
          : femaleHairstyles[Math.floor(Math.random() * femaleHairstyles.length)];
        
        // 随机选择脸型
        const faceShapes = ['圆脸', '瓜子脸', '鹅蛋脸', '方脸', '长脸'];
        const faceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
        
        // 随机选择皮肤特征
        const skinTones = ['白皙皮肤', '自然肤色', '健康肤色', '偏白肤色'];
        const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        
        // 随机选择五官特征
        const features = [
          '双眼皮大眼睛',
          '单眼皮小眼睛',
          '丹凤眼',
          '圆眼睛',
          '杏眼'
        ];
        const feature = features[Math.floor(Math.random() * features.length)];
        
        // 随机选择表情
        const expressions = ['微笑', '自然表情', '亲和笑容', '淡淡微笑'];
        const expression = expressions[Math.floor(Math.random() * expressions.length)];
        
        // 随机选择服装
        const maleClothes = ['白色衬衫', '深色西装', '浅蓝色衬衫', '黑色衬衫'];
        const femaleClothes = ['白色衬衫', '黑色职业装', '浅色衬衫', '深色正装'];
        const clothes = gender === 'Male'
          ? maleClothes[Math.floor(Math.random() * maleClothes.length)]
          : femaleClothes[Math.floor(Math.random() * femaleClothes.length)];
        
        // 构建详细的提示词
        const prompt = `一张标准的中国${genderText}大学生证件照，白色背景，${age}左右，${faceShape}，${skinTone}，${feature}，${hairstyle}，${expression}，穿着${clothes}，正面照，头部和肩部特写，专业证件照风格，高清画质，光线均匀，符合证件照标准`;
        
        const response = await fetch('/api/generate-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (response.ok) {
          const data = await response.json();
          photoUrl = data.imageUrl;
        } else {
          console.error('AI 生成证件照失败，使用默认照片');
          // 如果 AI 生成失败，从照片池中随机选择
          photoUrl = PHOTO_URLS[Math.floor(Math.random() * PHOTO_URLS.length)];
        }
      } catch (error) {
        console.error('调用 AI 生成证件照出错:', error);
        // 如果出错，从照片池中随机选择
        photoUrl = PHOTO_URLS[Math.floor(Math.random() * PHOTO_URLS.length)];
      }

      setFormData({
        name,
        gender,
        birth_date: formatDate(birthDate),
        ethnicity,
        institution_name: 'Wuhan City College',
        level: '本科',
        major,
        duration: '4 年',
        education_type: '普通高等教育',
        learning_form: '普通全日制',
        branch: '',
        department,
        admission_date: formatDate(admissionDate),
        status: '在籍（注册学籍）',
        graduation_date: formatDate(graduationDate),
        photo_url: photoUrl,
        verification_code: verificationCode,
        qr_code_url: 'https://www.chsi.com.cn/report/img/707469384q443084049c107481749f7406a8440411.jpg',
        update_date: formatChineseDate(new Date()),
      });
      
      // 自动显示表单
      setShowForm(true);
    } catch (error) {
      console.error('生成随机报告失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const generateVerificationCodeOnly = () => {
    const code = generateVerificationCode();
    setFormData({ ...formData, verification_code: code });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'Male',
      birth_date: '',
      ethnicity: '汉族',
      institution_name: 'Wuhan City College',
      level: '本科',
      major: '',
      duration: '4 年',
      education_type: '普通高等教育',
      learning_form: '普通全日制',
      branch: '',
      department: '',
      admission_date: '',
      status: '在籍（注册学籍）',
      graduation_date: '',
      photo_url: '',
      verification_code: '',
      qr_code_url: 'https://www.chsi.com.cn/report/img/707469384q443084049c107481749f7406a8440411.jpg',
      update_date: new Date().toISOString().split('T')[0].replace(/-/g, '年').replace(/年(\d{2})$/, '年$1日').replace(/(\d{4})年(\d{2})/, '$1年$2月'),
    });
    setEditingReport(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingReport) {
        const response = await fetch(`/api/reports/${editingReport.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          fetchReports();
          resetForm();
        } else {
          alert('更新失败');
        }
      } else {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          fetchReports();
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

  const handleEdit = (report: VerificationReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      gender: report.gender,
      birth_date: report.birth_date,
      ethnicity: report.ethnicity,
      institution_name: report.institution_name,
      level: report.level,
      major: report.major,
      duration: report.duration,
      education_type: report.education_type,
      learning_form: report.learning_form,
      branch: report.branch || '',
      department: report.department || '',
      admission_date: report.admission_date,
      status: report.status,
      graduation_date: report.graduation_date,
      photo_url: report.photo_url || '',
      verification_code: report.verification_code,
      qr_code_url: report.qr_code_url || '',
      update_date: report.update_date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这份报告吗？')) return;
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (response.ok) fetchReports();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleGenerateHTML = async (id: number) => {
    try {
      const response = await fetch(`/api/reports/${id}/generate`);
      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const handleDownloadHTML = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/reports/${id}/generate`);
      if (response.ok) {
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}_学籍验证报告.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download:', error);
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
              <Link href="/" className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                添加账号
              </Link>
              <Link href="/accounts" className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                账号列表
              </Link>
              <Link href="/tutorial" className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                📚 申请教程
              </Link>
              <Link href="/email-notes" className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                📝 邮箱备忘
              </Link>
              <Link href="/reports" className="px-4 py-2 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-lg">
                🎓 认证报告
              </Link>
              <Link href="/inbox" className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                📧 收件箱
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
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
                认证报告生成器
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                生成教育部学籍在线验证报告
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateRandomReport}
                disabled={isGeneratingPhoto}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isGeneratingPhoto ? (
                  <>
                    <span className="animate-spin">⏳</span> AI 生成中...
                  </>
                ) : (
                  <>
                    🎲 随机生成
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {showForm ? '取消' : '+ 创建报告'}
              </button>
            </div>
          </div>

          {/* Form - Part 1 */}
          {showForm && (
            <div className="mb-8 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingReport ? '编辑报告' : '创建新报告'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息 */}
                <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">基本信息</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名 (Name) *</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Yan Hua" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">性别 (Gender) *</label>
                      <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">出生日期 *</label>
                      <input type="text" required value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="2005年05月08日" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">民族 *</label>
                      <input type="text" required value={formData.ethnicity} onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="汉族" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">照片URL</label>
                      <input type="url" value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                {/* 学校信息 - 继续在下一个消息 */}
                <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">学校信息</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学校名称 (Institution Name) *</label>
                      <input type="text" required value={formData.institution_name} onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Wuhan City College" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">层次 *</label>
                        <select required value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                          <option>本科</option>
                          <option>专科</option>
                          <option>硕士研究生</option>
                          <option>博士研究生</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">专业 *</label>
                        <input type="text" required value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="计算机科学与技术" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学制 *</label>
                        <input type="text" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="4 年" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学历类别 *</label>
                        <input type="text" required value={formData.education_type} onChange={(e) => setFormData({ ...formData, education_type: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="普通高等教育" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学习形式 *</label>
                        <input type="text" required value={formData.learning_form} onChange={(e) => setFormData({ ...formData, learning_form: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="普通全日制" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分院</label>
                        <input type="text" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="选填" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">系所</label>
                        <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="信息工程学部" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 学籍信息 */}
                <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">学籍信息</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">入学日期 (Admission) *</label>
                      <input type="text" required value={formData.admission_date} onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="September 12, 2023" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">学籍状态 *</label>
                      <input type="text" required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="在籍（注册学籍）" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">预计毕业 (Expected Graduation) *</label>
                      <input type="text" required value={formData.graduation_date} onChange={(e) => setFormData({ ...formData, graduation_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="June 30, 2027" />
                    </div>
                  </div>
                </div>

                {/* 验证信息 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">验证信息</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">更新日期 *</label>
                      <input type="text" required value={formData.update_date} onChange={(e) => setFormData({ ...formData, update_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="2025年07月24日" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">在线验证码 *</label>
                        <div className="flex gap-2">
                          <input type="text" required value={formData.verification_code} onChange={(e) => setFormData({ ...formData, verification_code: e.target.value })} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="AUE13JQXKN" />
                          <button type="button" onClick={generateVerificationCodeOnly} className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all whitespace-nowrap">
                            🎲 随机生成
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">二维码URL</label>
                        <input type="url" value={formData.qr_code_url} onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
                    {editingReport ? '更新报告' : '创建报告'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors">
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reports List */}
          {isLoading ? (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">加载中...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🎓</div>
              <p className="text-gray-600 dark:text-gray-400">还没有创建认证报告</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {report.photo_url && (
                        <img src={report.photo_url} alt={report.name} className="w-16 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.institution_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{report.major}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">验证码:</span>
                        <span className="font-mono text-gray-900 dark:text-white">{report.verification_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">更新日期:</span>
                        <span className="text-gray-900 dark:text-white">{report.update_date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleGenerateHTML(report.id!)} className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all">
                        预览
                      </button>
                      <button onClick={() => handleDownloadHTML(report.id!, report.name)} className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all">
                        下载
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEdit(report)} className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors">
                        编辑
                      </button>
                      <button onClick={() => handleDelete(report.id!)} className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-900 dark:text-white rounded-lg transition-colors">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">报告预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0 rounded-lg bg-white"
                title="Report Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
