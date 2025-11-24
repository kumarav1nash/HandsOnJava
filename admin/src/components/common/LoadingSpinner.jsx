import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', fullScreen = false }) => {
  const sizeClass = `spinner-${size}`;
  const containerClass = fullScreen ? 'spinner-container-fullscreen' : 'spinner-container';
  
  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;