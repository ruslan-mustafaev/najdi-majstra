import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 MAIN.TSX: Starting application...');

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
