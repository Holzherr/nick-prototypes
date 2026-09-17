import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import { bootTheme } from './features/personalise/player';
import App from './app/App';
import { UpdatePrompt } from './app/update-prompt';
import './styles/tailwind.css';

// Repaint to the chosen icon's palette before the first render, so the page never flashes the default.
bootTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>
);
