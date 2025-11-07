import { EmailMessage } from '@/types/email';

interface EmailListItemProps {
  email: EmailMessage;
  isSelected: boolean;
  onClick: () => void;
  formatDate: (date: string) => string;
}

export function EmailListItem({ email, isSelected, onClick, formatDate }: EmailListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1">
          {email.from}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
          {formatDate(email.date)}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 truncate">
        {email.subject}
      </p>
      {email.snippet && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {email.snippet}
        </p>
      )}
    </button>
  );
}
