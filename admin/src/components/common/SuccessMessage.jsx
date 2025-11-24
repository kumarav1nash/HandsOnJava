import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import './SuccessMessage.css';

const SuccessMessage = ({ message, onClose, duration = 5000, className = '' }) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`success-message ${className}`}>
      <div className="success-icon">
        <CheckCircle size={20} />
      </div>
      <div className="success-content">
        <p className="success-text">{message}</p>
      </div>
      {onClose && (
        <button className="success-close" onClick={onClose} aria-label="Close success message">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;