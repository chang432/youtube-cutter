import React, { useState, useEffect } from 'react';

const LoadingBar = (props) => {
  const { showLoader } = props;

  const loaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  };

  const iconStyle = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 2s linear infinite',
  };

  return (
    <div style={loaderStyle} className="z-[9999]">
      {showLoader && <div style={iconStyle}></div>}
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingBar;
