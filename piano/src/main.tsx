import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { readSessions, sessionsIn } from './features/practice/sessionLog.ts';
import './index.css';

/** `?sessions` shows the practice log as JSON, to read off the iPad by hand until a backend exists. */
const dump = () => JSON.stringify({ sessions_7d: sessionsIn(7, new Date()), sessions: readSessions() }, null, 2);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {location.search.includes('sessions') ? <pre style={{ padding: 16, whiteSpace: 'pre-wrap' }}>{dump()}</pre> : <App />}
  </StrictMode>,
);
