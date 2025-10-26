import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root.tsx';
import './index.css';
import { AuthProvider } from './lib/authContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
