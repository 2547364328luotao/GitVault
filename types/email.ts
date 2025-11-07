export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  text?: string;
  html?: string;
  snippet?: string;
}

export interface EmailApiResponse {
  error?: string;
  message?: string;
}
