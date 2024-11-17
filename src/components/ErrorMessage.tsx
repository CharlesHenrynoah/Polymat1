import React from 'react';
import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'success' | 'info' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss, type = 'error' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex items-center justify-between ${getBgColor()}`}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="focus:outline-none"
      >
        Dismiss
      </button>
    </div>
  );
};
