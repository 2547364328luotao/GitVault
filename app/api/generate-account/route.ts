import { NextResponse } from 'next/server';

const BASE_URL = 'https://api-inference.modelscope.cn/v1';
const API_KEY = process.env.DEEPSEEK_API_KEY || 'ms-6c8062b8-ee2b-4df5-b2c9-fde51d71311c';

interface GeneratedAccount {
  email: string;
  email_password: string;
  email_phone: string;
  github_username: string;
  github_password: string;
  github_name: string;
}

/**
 * POST /api/generate-account
 * 使用 DeepSeek AI 生成随机账号信息
 */
export async function POST() {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.2-Exp',
        messages: [
          {
            role: 'system',
            content: '你是一个数据生成助手。请严格按照JSON格式返回，不要有任何其他文字说明。'
          },
          {
            role: 'user',
            content: `请生成一组真实合理的账号信息，返回纯JSON格式，包含以下字段：
{
  "email": "邮箱地址（使用常见邮箱服务商如 gmail.com, outlook.com, yahoo.com 等）",
  "email_password": "邮箱密码（10-16位，包含大小写字母、数字和特殊字符）",
  "email_phone": "手机号（格式：+86 138 0000 0000）",
  "github_username": "GitHub用户名（6-20位，字母数字组合，不要使用user123这种格式）",
  "github_password": "GitHub密码（12-20位，包含大小写字母、数字和特殊字符）",
  "github_name": "GitHub显示名称（真实英文姓名，如 John Smith）"
}

要求：
1. 只返回JSON，不要有任何其他说明文字
2. 邮箱地址要真实合理
3. 密码要符合安全标准
4. GitHub用户名要看起来像真实用户
5. 姓名要使用常见的英文名字`
          }
        ],
        temperature: 0.9,
        max_tokens: 500,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API 调用失败:', error);
      return NextResponse.json(
        { error: '生成账号信息失败' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 尝试解析 JSON
    let accountData: GeneratedAccount;
    try {
      // 提取 JSON 内容（可能被代码块包裹）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        accountData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法从响应中提取 JSON');
      }
    } catch (parseError) {
      console.error('JSON 解析失败:', content);
      // 如果解析失败，返回一个默认的随机数据
      accountData = generateFallbackAccount();
    }

    return NextResponse.json({
      success: true,
      data: accountData
    });

  } catch (error) {
    console.error('生成账号信息失败:', error);
    
    // 如果 API 调用失败，返回一个备用的随机数据
    const fallbackData = generateFallbackAccount();
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      fallback: true
    });
  }
}

/**
 * 生成备用的随机账号数据
 */
function generateFallbackAccount(): GeneratedAccount {
  const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Liam', 'Isabella', 'Noah', 'Mia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  
  const emailProviders = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
  const emailProvider = emailProviders[Math.floor(Math.random() * emailProviders.length)];
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specialChars = '!@#$%^&*';
  
  const generatePassword = (length: number) => {
    let password = '';
    password += chars.charAt(Math.floor(Math.random() * 26)); // 大写字母
    password += chars.charAt(Math.floor(Math.random() * 26) + 26); // 小写字母
    password += chars.charAt(Math.floor(Math.random() * 10) + 52); // 数字
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length)); // 特殊字符
    
    for (let i = 4; i < length; i++) {
      password += (chars + specialChars).charAt(Math.floor(Math.random() * (chars.length + specialChars.length)));
    }
    
    // 打乱顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  
  const phone = `+86 ${130 + Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0').match(/.{1,4}/g)?.join(' ')}`;
  
  return {
    email: `${username}@${emailProvider}`,
    email_password: generatePassword(12),
    email_phone: phone,
    github_username: username,
    github_password: generatePassword(16),
    github_name: `${firstName} ${lastName}`
  };
}
