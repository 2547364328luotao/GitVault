import { neon } from '@neondatabase/serverless';

export type CopilotProStatus = 'none' | 'pending' | 'active';

export interface GitHubAccount {
  id?: number;
  email: string;
  email_password: string;
  email_phone?: string;
  github_username: string;
  github_password: string;
  github_name?: string;
  github_recovery_codes?: string;
  copilot_pro_status?: CopilotProStatus;
  created_at?: Date;
  updated_at?: Date;
}

// 延迟初始化数据库连接
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be a Neon postgres connection string');
  }
  return neon(process.env.DATABASE_URL);
}

export async function getAllAccounts(): Promise<GitHubAccount[]> {
  const sql = getDb();
  const accounts = await sql`
    SELECT * FROM github_accounts 
    ORDER BY created_at DESC
  `;
  return accounts as GitHubAccount[];
}

export async function getAccountById(id: number): Promise<GitHubAccount | null> {
  const sql = getDb();
  const accounts = await sql`
    SELECT * FROM github_accounts 
    WHERE id = ${id}
  `;
  return accounts[0] as GitHubAccount || null;
}

export async function createAccount(account: Omit<GitHubAccount, 'id' | 'created_at' | 'updated_at'>): Promise<GitHubAccount> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO github_accounts (
      email, 
      email_password, 
      email_phone, 
      github_username, 
      github_password, 
      github_name, 
      github_recovery_codes,
      copilot_pro_status
    )
    VALUES (
      ${account.email},
      ${account.email_password},
      ${account.email_phone || null},
      ${account.github_username},
      ${account.github_password},
      ${account.github_name || null},
      ${account.github_recovery_codes || null},
      ${account.copilot_pro_status || 'none'}
    )
    RETURNING *
  `;
  return result[0] as GitHubAccount;
}

export async function updateAccount(id: number, account: Partial<GitHubAccount>): Promise<GitHubAccount | null> {
  const sql = getDb();
  // 直接执行完整的 UPDATE，使用 COALESCE 保留原值
  const result = await sql`
    UPDATE github_accounts 
    SET 
      email = COALESCE(${account.email}, email),
      email_password = COALESCE(${account.email_password}, email_password),
      email_phone = COALESCE(${account.email_phone}, email_phone),
      github_username = COALESCE(${account.github_username}, github_username),
      github_password = COALESCE(${account.github_password}, github_password),
      github_name = COALESCE(${account.github_name}, github_name),
      github_recovery_codes = COALESCE(${account.github_recovery_codes}, github_recovery_codes),
      copilot_pro_status = COALESCE(${account.copilot_pro_status}, copilot_pro_status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  
  return result[0] as GitHubAccount || null;
}

export async function deleteAccount(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM github_accounts 
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
