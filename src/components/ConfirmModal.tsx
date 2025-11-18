'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  title?: string;
  type?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  message, 
  title,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: 'fa-info-circle',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400',
      confirmBg: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700',
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-400',
      confirmBg: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
    },
    danger: {
      icon: 'fa-times-circle',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400',
      confirmBg: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
    },
  };

  const config = typeConfig[type];
  const displayTitle = title || (type === 'danger' ? 'Confirm Delete' : type === 'warning' ? 'Confirm Action' : 'Confirm');

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-[#1a1f3a] rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <i className={`fas ${config.icon} ${config.iconColor} text-xl`}></i>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${config.titleColor} mb-1`}>{displayTitle}</h3>
            <p className="text-gray-300 text-sm whitespace-pre-line">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2 text-white min-h-[44px]"
          >
            <span>{cancelText}</span>
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 ${config.confirmBg} rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-white min-h-[44px]`}
          >
            <i className="fas fa-check"></i>
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}





























