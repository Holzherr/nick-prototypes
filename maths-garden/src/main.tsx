import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Subsets named one by one rather than pulled in through the bundled 400.css/500.css/…, which also carry
// Fredoka's Hebrew subset — downloaded by everyone here and read by no one. latin-ext is what draws the
// Polish ł, ż, ę and ą; Fredoka has no Arabic or Devanagari at all, so those two languages fall to the
// system face in the stack (see --font-sans), which is correct for them and worth knowing before anyone
// wonders why Arabic looks different.
import '@fontsource/fredoka/latin-400.css';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/fredoka/latin-ext-400.css';
import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import { bootLocale } from './features/i18n/i18n';
import { bootTheme } from './features/personalise/player';
import App from './app/App';
import { UpdatePrompt } from './app/update-prompt';
import './styles/tailwind.css';

// Repaint to the chosen icon's palette and set the language and reading direction before the first
// render, so the page never flashes the default of either.
bootTheme();
bootLocale();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <UpdatePrompt />
  </StrictMode>
);
