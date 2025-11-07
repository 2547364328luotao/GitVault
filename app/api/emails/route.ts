import { NextResponse } from 'next/server';
import Imap from 'imap';

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

        // 只获取邮件头部(高性能)
        const fetch = imap.seq.fetch(`${start}:${end}`, {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
          struct: false
        });

        fetch.on('message', (msg: any, seqno: number) => {
          msg.on('body', (stream: any) => {
            let buffer = '';
            stream.on('data', (chunk: any) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              const parsed = Imap.parseHeader(buffer);
              
              const email: EmailMessage = {
                id: `${seqno}`,
                from: parsed.from?.[0] || '未知发件人',
                subject: parsed.subject?.[0] || '(无主题)',
                date: parsed.date ? new Date(parsed.date[0]) : new Date(),
                snippet: parsed.subject?.[0]?.substring(0, 100) || ''
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
            });
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
export async function GET() {
  try {
    const emails = await fetchEmails(20);
    return NextResponse.json(emails);
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
