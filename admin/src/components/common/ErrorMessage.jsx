import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`error-message ${className}`}>
      <div className="error-icon">
        <AlertCircle size={20} />
      </div>
      <div className="error-content">
        <p className="error-text">{message}</p>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose} aria-label="Close error">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;