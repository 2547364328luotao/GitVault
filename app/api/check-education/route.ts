import { NextRequest, NextResponse } from 'next/server';

interface EducationStatus {
  status: string;
  applicationType: string;
  submittedAt: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { applyId, cookie } = await request.json();

    // 验证参数
    if (!applyId) {
      return NextResponse.json(
        { error: '缺少 applyId 参数', tip: '请在编辑账号时填写 GitHub 申请ID' },
        { status: 400 }
      );
    }

    if (!cookie) {
      return NextResponse.json(
        { error: '缺少 cookie 参数', tip: '请在编辑账号时填写 GitHub Cookie' },
        { status: 400 }
      );
    }

    console.log(`[Check Education] Apply ID: ${applyId}`);

    // 构建 API URL
    const apiUrl = `https://github.com/settings/education/developer_pack_applications/metadata/${applyId}`;
    
    // 发送请求（不使用代理）
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Referer': 'https://github.com/settings/education/benefits',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(15000), // 15秒超时
    });

    console.log(`[Check Education] Response status: ${response.status}`);

    // 检查响应状态
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: '申请ID不存在或无权访问', tip: '请检查申请ID是否正确' },
          { status: 404 }
        );
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Cookie 无效或已过期', tip: '请重新获取 GitHub Cookie' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `GitHub 返回错误: ${response.status}` },
        { status: response.status }
      );
    }

    // 读取 HTML 响应
    const html = await response.text();
    console.log(`[Check Education] Response length: ${html.length} bytes`);

    // 解析 HTML
    const result = parseEducationHTML(html);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('[Check Education] Error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: '请求超时', tip: '请检查网络连接或稍后重试' },
          { status: 504 }
        );
      }
      
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return NextResponse.json(
          { error: '网络连接失败', tip: '无法连接到 GitHub，请检查网络' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: '查询失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * 解析 GitHub Education HTML 响应
 */
function parseEducationHTML(html: string): EducationStatus {
  // 提取申请日期
  const dateMatch = html.match(/<strong>Applied<\/strong> on ([^<]+)</);
  const submittedAt = dateMatch ? dateMatch[1] : '未知';
  
  // 提取申请类型
  const typeMatch = html.match(/<strong>Application Type:<\/strong> ([^<]+)</);
  const applicationType = typeMatch ? typeMatch[1] : '未知';
  
  // 判断状态
  let status = 'Applied'; // 默认状态：申请中
  let message = '申请正在审核中';
  
  if (html.includes('color-bg-success') || html.includes('has been approved')) {
    status = 'Approved';
    message = '✅ 申请已通过！';
  } else if (html.includes('color-bg-danger') || html.includes('has been denied')) {
    status = 'Denied';
    message = '❌ 申请被拒绝';
  } else if (html.includes('pending review')) {
    status = 'Pending';
    message = '⏳ 申请正在审核中';
  }
  
  return {
    status,
    applicationType,
    submittedAt,
    message
  };
}
