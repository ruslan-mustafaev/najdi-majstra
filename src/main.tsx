import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('='.repeat(80));
console.log('🚀 MAIN.TSX: APPLICATION STARTING - VERSION 2.0 [20251006-2043]');
console.log('='.repeat(80));

try {
  const rootElement = document.getElementById('root');
  console.log('🔍 MAIN.TSX: Root element:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('🔍 MAIN.TSX: Creating React root...');
  const root = createRoot(rootElement);

  console.log('🔍 MAIN.TSX: Rendering App...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('✅ MAIN.TSX: App rendered successfully');
} catch (error) {
  console.error('❌ MAIN.TSX: Failed to render:', error);
}
