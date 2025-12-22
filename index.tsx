import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initBundleUrl } from './services/generator';

// 번들 URL 초기화 (현재 도메인 기반)
initBundleUrl();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
