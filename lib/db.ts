import { neon } from '@neondatabase/serverless';

export type CopilotProStatus = 'none' | 'pending' | 'active';
export type SaleStatus = 'available' | 'sold';

export interface GitHubAccount {
  id?: number;
  email: string;
  email_password: string;
  email_phone?: string;
  github_username: string;
  github_password: string;
  github_name?: string;
  github_recovery_codes?: string;
  github_cookie?: string;
  github_apply_id?: string;
  copilot_pro_status?: CopilotProStatus;
  sale_status?: SaleStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmailNote {
  id?: number;
  email: string;
  email_password: string;
  phone?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface VerificationReport {
  id?: number;
  name: string;
  gender: string;
  birth_date: string;
  ethnicity: string;
  institution_name: string;
  level: string;
  major: string;
  duration: string;
  education_type: string;
  learning_form: string;
  branch?: string;
  department?: string;
  admission_date: string;
  status: string;
  graduation_date: string;
  photo_url?: string;
  verification_code: string;
  qr_code_url?: string;
  update_date: string;
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
      github_cookie,
      github_apply_id,
      copilot_pro_status,
      sale_status
    )
    VALUES (
      ${account.email},
      ${account.email_password},
      ${account.email_phone || null},
      ${account.github_username},
      ${account.github_password},
      ${account.github_name || null},
      ${account.github_recovery_codes || null},
      ${account.github_cookie || null},
      ${account.github_apply_id || null},
      ${account.copilot_pro_status || 'none'},
      ${account.sale_status || 'available'}
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
      email = COALESCE(${account.email || null}, email),
      email_password = COALESCE(${account.email_password || null}, email_password),
      email_phone = COALESCE(${account.email_phone || null}, email_phone),
      github_username = COALESCE(${account.github_username || null}, github_username),
      github_password = COALESCE(${account.github_password || null}, github_password),
      github_name = COALESCE(${account.github_name || null}, github_name),
      github_recovery_codes = COALESCE(${account.github_recovery_codes || null}, github_recovery_codes),
      github_cookie = COALESCE(${account.github_cookie || null}, github_cookie),
      github_apply_id = COALESCE(${account.github_apply_id || null}, github_apply_id),
      copilot_pro_status = COALESCE(${account.copilot_pro_status || null}, copilot_pro_status),
      sale_status = COALESCE(${account.sale_status || null}, sale_status),
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

// ==================== Email Notes CRUD ====================

export async function getAllEmailNotes(): Promise<EmailNote[]> {
  const sql = getDb();
  const notes = await sql`
    SELECT * FROM email_notes 
    ORDER BY created_at DESC
  `;
  return notes as EmailNote[];
}

export async function getEmailNoteById(id: number): Promise<EmailNote | null> {
  const sql = getDb();
  const notes = await sql`
    SELECT * FROM email_notes 
    WHERE id = ${id}
  `;
  return notes[0] as EmailNote || null;
}

export async function createEmailNote(note: Omit<EmailNote, 'id' | 'created_at' | 'updated_at'>): Promise<EmailNote> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO email_notes (
      email, 
      email_password, 
      phone, 
      notes
    )
    VALUES (
      ${note.email}, 
      ${note.email_password}, 
      ${note.phone || null}, 
      ${note.notes || null}
    )
    RETURNING *
  `;
  return result[0] as EmailNote;
}

export async function updateEmailNote(id: number, note: Partial<EmailNote>): Promise<EmailNote | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE email_notes
    SET 
      email = COALESCE(${note.email || null}, email),
      email_password = COALESCE(${note.email_password || null}, email_password),
      phone = COALESCE(${note.phone || null}, phone),
      notes = COALESCE(${note.notes || null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as EmailNote || null;
}

export async function deleteEmailNote(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM email_notes 
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

// ==================== Verification Reports CRUD ====================

export async function getAllReports(): Promise<VerificationReport[]> {
  const sql = getDb();
  const reports = await sql`
    SELECT * FROM verification_reports 
    ORDER BY created_at DESC
  `;
  return reports as VerificationReport[];
}

export async function getReportById(id: number): Promise<VerificationReport | null> {
  const sql = getDb();
  const reports = await sql`
    SELECT * FROM verification_reports 
    WHERE id = ${id}
  `;
  return reports[0] as VerificationReport || null;
}

export async function createReport(report: Omit<VerificationReport, 'id' | 'created_at' | 'updated_at'>): Promise<VerificationReport> {
  const sql = getDb();
  const result = await sql`
    INSERT INTO verification_reports (
      name, gender, birth_date, ethnicity, institution_name,
      level, major, duration, education_type, learning_form,
      branch, department, admission_date, status, graduation_date,
      photo_url, verification_code, qr_code_url, update_date
    )
    VALUES (
      ${report.name}, ${report.gender}, ${report.birth_date}, ${report.ethnicity},
      ${report.institution_name}, ${report.level}, ${report.major}, ${report.duration},
      ${report.education_type}, ${report.learning_form}, ${report.branch || null},
      ${report.department || null}, ${report.admission_date}, ${report.status},
      ${report.graduation_date}, ${report.photo_url || null}, ${report.verification_code},
      ${report.qr_code_url || null}, ${report.update_date}
    )
    RETURNING *
  `;
  return result[0] as VerificationReport;
}

export async function updateReport(id: number, report: Partial<VerificationReport>): Promise<VerificationReport | null> {
  const sql = getDb();
  const result = await sql`
    UPDATE verification_reports
    SET 
      name = COALESCE(${report.name || null}, name),
      gender = COALESCE(${report.gender || null}, gender),
      birth_date = COALESCE(${report.birth_date || null}, birth_date),
      ethnicity = COALESCE(${report.ethnicity || null}, ethnicity),
      institution_name = COALESCE(${report.institution_name || null}, institution_name),
      level = COALESCE(${report.level || null}, level),
      major = COALESCE(${report.major || null}, major),
      duration = COALESCE(${report.duration || null}, duration),
      education_type = COALESCE(${report.education_type || null}, education_type),
      learning_form = COALESCE(${report.learning_form || null}, learning_form),
      branch = COALESCE(${report.branch || null}, branch),
      department = COALESCE(${report.department || null}, department),
      admission_date = COALESCE(${report.admission_date || null}, admission_date),
      status = COALESCE(${report.status || null}, status),
      graduation_date = COALESCE(${report.graduation_date || null}, graduation_date),
      photo_url = COALESCE(${report.photo_url || null}, photo_url),
      verification_code = COALESCE(${report.verification_code || null}, verification_code),
      qr_code_url = COALESCE(${report.qr_code_url || null}, qr_code_url),
      update_date = COALESCE(${report.update_date || null}, update_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as VerificationReport || null;
}

export async function deleteReport(id: number): Promise<boolean> {
  const sql = getDb();
  const result = await sql`
    DELETE FROM verification_reports 
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
