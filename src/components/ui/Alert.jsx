import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Alert = ({ 
  children, 
  variant = 'info', 
  onClose, 
  className,
  ...props 
}) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-current opacity-70 hover:opacity-100"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
