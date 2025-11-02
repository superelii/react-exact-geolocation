// test/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import TestPage from './TestPage.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestPage />
  </React.StrictMode>
);