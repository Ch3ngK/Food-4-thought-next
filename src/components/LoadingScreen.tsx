import React from 'react';
import './LoadingScreen.css'; // or inline styles if you prefer

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="bowl-spinner">🍜</div>
      <p className="loading-text">Loading delicious food...</p>
    </div>
  );
};

export default LoadingScreen;