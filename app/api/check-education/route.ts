import { NextRequest, NextResponse } from 'next/server';

interface ApplicationInfo {
  status?: string;
  submitted_time?: string;
  processed_date?: string;
  application_type?: string;
  expiry_date?: string;
  denial_reasons?: string[];
  header_details?: string[];
  paragraphs?: string[];
  list_items?: string[];
  school_name?: string;
  school_type?: string;
}

/**
 * POST /api/check-education
 * 使用 Cookie 查询 GitHub Education 申请状态
 */
export async function POST(request: NextRequest) {
  try {
    const { cookie } = await request.json();

    if (!cookie) {
      return NextResponse.json(
        { error: '缺少 Cookie 参数' },
        { status: 400 }
      );
    }

    // 解析 Cookie 字符串
    const cookieString = typeof cookie === 'string' ? cookie : JSON.stringify(cookie);
    const parsedCookies = parseCookies(cookieString);

    if (Object.keys(parsedCookies).length === 0) {
      return NextResponse.json(
        { error: 'Cookie 格式错误或为空' },
        { status: 400 }
      );
    }

    // 构建 Cookie 头
    const cookieHeader = Object.entries(parsedCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    // 配置代理（如果环境变量中有设置）
    const fetchOptions: RequestInit = {
      headers: {
        'Cookie': cookieHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'manual', // 不自动跟随重定向
      signal: AbortSignal.timeout(30000) // 30秒超时
    };

    // 如果设置了代理，使用代理
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      // Node.js 会自动使用环境变量中的代理设置
      console.log('使用代理访问 GitHub');
    }

    // 请求 GitHub Education 页面
    const response = await fetch('https://github.com/settings/education/benefits', fetchOptions);

    // 检查是否被重定向到登录页面
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location && location.includes('login')) {
        return NextResponse.json(
          { error: 'Cookie 无效或已过期，请重新获取 Cookie' },
          { status: 401 }
        );
      }
    }

    if (!response.ok && response.status !== 302) {
      return NextResponse.json(
        { error: `GitHub 返回错误: ${response.status}` },
        { status: 500 }
      );
    }

    const html = await response.text();

    // 检查是否包含登录页面的标志
    if (html.includes('Sign in to GitHub') || html.includes('login')) {
      return NextResponse.json(
        { error: 'Cookie 无效或已过期，请重新获取 Cookie' },
        { status: 401 }
      );
    }

    // 解析 HTML 获取申请状态
    const applicationInfo = parseApplicationInfo(html);

    if (!applicationInfo || !applicationInfo.status) {
      return NextResponse.json(
        { error: '未找到任何申请记录，请确认该账号已提交 GitHub Education 申请' },
        { status: 404 }
      );
    }

    // 格式化返回数据，方便前端使用
    return NextResponse.json({
      success: true,
      status: applicationInfo.status,
      school_name: applicationInfo.school_name,
      school_type: applicationInfo.school_type,
      submitted_at: applicationInfo.submitted_time,
      message: applicationInfo.status === 'Approved' 
        ? `申请已通过${applicationInfo.expiry_date ? `，到期时间：${applicationInfo.expiry_date}` : ''}`
        : applicationInfo.status === 'Denied'
        ? `申请被拒绝${applicationInfo.denial_reasons ? `：${applicationInfo.denial_reasons.join('; ')}` : ''}`
        : '申请正在审核中，请耐心等待',
      raw_data: applicationInfo
    });

  } catch (error) {
    console.error('查询 GitHub Education 状态失败:', error);
    
    // 根据错误类型返回更友好的提示
    let errorMessage = '查询失败';
    let userTip = '';
    
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
        errorMessage = '无法连接到 GitHub';
        userTip = '可能原因：1. 网络连接问题 2. 需要配置代理（中国大陆用户）3. 防火墙限制。请检查网络或尝试使用代理。';
      } else if (error.message.includes('timeout')) {
        errorMessage = '连接超时';
        userTip = 'GitHub 响应超时，请稍后重试或检查网络连接。';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        tip: userTip,
        technical_details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * 解析 Cookie 字符串
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  // 移除可能的前缀
  cookieString = cookieString.replace('Cookie:', '').trim();

  // 解析每个 cookie 项
  for (const item of cookieString.split(';')) {
    const trimmed = item.trim();
    if (trimmed && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('='); // 处理值中可能包含 = 的情况
      if (key && value) {
        cookies[key.trim()] = value.trim();
      }
    }
  }

  return cookies;
}

/**
 * 解析 HTML 获取申请信息（增强版）
 */
function parseApplicationInfo(html: string): ApplicationInfo | null {
  try {
    // 查找最新申请的状态
    const statusMatch = html.match(/<span[^>]*class="[^"]*text-bold[^"]*"[^>]*>(Approved|Denied|Pending|Applied)<\/span>/i);
    const status = statusMatch ? statusMatch[1] : null;

    if (!status) {
      return null;
    }

    const info: ApplicationInfo = {
      status: status
    };

    // 提取学校名称（多种可能的格式）
    const schoolMatch = html.match(/School name:?\s*<[^>]*>([^<]+)<\/|"school"[^>]*>([^<]+)</i) ||
                       html.match(/Academic institution:?\s*<[^>]*>([^<]+)</i) ||
                       html.match(/Institution:?\s*([^<\n]+)/i);
    if (schoolMatch) {
      info.school_name = (schoolMatch[1] || schoolMatch[2] || '').trim();
    }

    // 提取学校类型
    const typeMatch = html.match(/School type:?\s*<[^>]*>([^<]+)<\/|Type:?\s*([^<\n]+)/i);
    if (typeMatch) {
      info.school_type = (typeMatch[1] || typeMatch[2] || '').trim();
    }

    // 提取提交时间
    const timeMatch = html.match(/Submitted on\s+([^<]+)</i) ||
                     html.match(/Applied on\s+([^<]+)</i) ||
                     html.match(/(\w+ \d{1,2}, \d{4})/);
    if (timeMatch) {
      info.submitted_time = timeMatch[1].trim();
    }

    // 提取申请类型
    const appTypeMatch = html.match(/Application Type:?\s*<[^>]*>([^<]+)<\/|Type:?\s*([^<\n]+)/i);
    if (appTypeMatch) {
      info.application_type = (appTypeMatch[1] || appTypeMatch[2] || '').trim();
    }

    // 如果是 Approved，提取过期日期
    if (status === 'Approved') {
      const expiryMatch = html.match(/expire[sd]?\s+on\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i) ||
                         html.match(/valid until\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i);
      if (expiryMatch) {
        info.expiry_date = expiryMatch[1];
      }
    }

    // 如果是 Denied，尝试提取拒绝原因
    if (status === 'Denied') {
      const reasonsMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (reasonsMatches) {
        info.denial_reasons = reasonsMatches
          .map(match => match.replace(/<\/?li[^>]*>/gi, '').trim())
          .filter(reason => reason.length > 0 && reason.length < 200); // 过滤掉过长的无关内容
      }
    }

    return info;

  } catch (error) {
    console.error('解析 HTML 失败:', error);
    return null;
  }
}
