import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

// IMAP 配置 - 生产环境应使用环境变量
const IMAP_CONFIG = {
  user: process.env.IMAP_USER || 'github@luotao.qzz.io',
  password: process.env.IMAP_PASSWORD || '20050508luoTAO',
  host: process.env.IMAP_HOST || 'imap.qiye.aliyun.com',
  port: parseInt(process.env.IMAP_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const FETCH_TIMEOUT = 30000; // 30秒超时

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: Date;
  text?: string;
  html?: string;
  snippet?: string;
}

/**
 * 从 IMAP 服务器获取邮件
 * @param limit 获取邮件数量,默认 20
 */
function fetchEmails(limit: number = 20): Promise<EmailMessage[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap(IMAP_CONFIG);
    const emails: EmailMessage[] = [];
    let processedCount = 0;
    let totalToFetch = 0;
    let isResolved = false; // 防止重复 resolve

    // 设置超时保护
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        imap.end();
        reject(new Error('获取邮件超时'));
      }
    }, FETCH_TIMEOUT);

    // 清理函数
    const cleanup = () => {
      clearTimeout(timeout);
      if (!isResolved) {
        isResolved = true;
      }
    };

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err: any, box: any) => {
        if (err) {
          cleanup();
          reject(err);
          return;
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          cleanup();
          imap.end();
          resolve([]);
          return;
        }

        // 计算要获取的邮件范围
        const start = Math.max(1, totalMessages - limit + 1);
        const end = totalMessages;
        totalToFetch = end - start + 1;

        // 获取邮件头部和正文
        const fetch = imap.seq.fetch(`${start}:${end}`, {
          bodies: ['HEADER', 'TEXT'],
          struct: true
        });

        fetch.on('message', (msg: any, seqno: number) => {
          let emailData: any = {
            id: `${seqno}`,
            headers: null,
            body: null
          };

          msg.on('body', (stream: any, info: any) => {
            let buffer = '';
            stream.on('data', (chunk: any) => {
              buffer += chunk.toString('utf8');
            });
            
            stream.once('end', () => {
              if (info.which === 'HEADER') {
                emailData.headers = Imap.parseHeader(buffer);
              } else if (info.which === 'TEXT') {
                emailData.body = buffer;
              }
            });
          });

          msg.once('end', async () => {
            try {
              // 使用 mailparser 解析完整邮件
              const fullEmail = (emailData.headers ? 
                Object.keys(emailData.headers).map(k => `${k}: ${emailData.headers[k].join(', ')}`).join('\r\n') 
                : '') + '\r\n\r\n' + (emailData.body || '');
              
              const parsed = await simpleParser(fullEmail);
              
              const email: EmailMessage = {
                id: emailData.id,
                from: parsed.from?.text || emailData.headers?.from?.[0] || '未知发件人',
                subject: parsed.subject || emailData.headers?.subject?.[0] || '(无主题)',
                date: parsed.date || (emailData.headers?.date ? new Date(emailData.headers.date[0]) : new Date()),
                text: parsed.text || '',
                html: parsed.html || '',
                snippet: (parsed.text || parsed.subject || '').substring(0, 100)
              };

              emails.push(email);
              processedCount++;

              // 所有邮件处理完成
              if (processedCount === totalToFetch && !isResolved) {
                cleanup();
                
                // 按日期倒序排列
                emails.sort((a, b) => b.date.getTime() - a.date.getTime());
                
                resolve(emails);
                imap.end();
              }
            } catch (err) {
              console.error('邮件解析错误:', err);
              processedCount++;
              
              if (processedCount === totalToFetch && !isResolved) {
                cleanup();
                emails.sort((a, b) => b.date.getTime() - a.date.getTime());
                resolve(emails);
                imap.end();
              }
            }
          });
        });

        fetch.once('error', (err: any) => {
          if (!isResolved) {
            cleanup();
            reject(err);
          }
        });
      });
    });

    imap.once('error', (err: any) => {
      if (!isResolved) {
        cleanup();
        reject(err);
      }
    });

    imap.connect();
  });
}

/**
 * GET /api/emails
 * 获取邮箱收件箱邮件列表
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '未授权,请先登录' }, { status: 401 });
  }
  try {
  const emails = await fetchEmails(20);
    
    // 禁用所有缓存,确保每次都获取最新邮件
    const response = NextResponse.json(emails);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[API] 获取邮件失败:', error);
    return NextResponse.json(
      { 
        error: '获取邮件失败', 
        message: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}

// 禁用 Next.js 的路由缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;
