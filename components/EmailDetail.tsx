import { EmailMessage } from '@/types/email';

interface EmailDetailProps {
  email: EmailMessage;
}

export function EmailDetail({ email }: EmailDetailProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {email.subject}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              发件人: <span className="font-medium text-gray-900 dark:text-white">{email.from}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              时间: {new Date(email.date).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 max-h-[calc(100vh-400px)] overflow-y-auto">
        {email.html ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : email.text ? (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-sans">
            {email.text}
          </pre>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">无邮件内容</p>
        )}
      </div>
    </div>
  );
}
