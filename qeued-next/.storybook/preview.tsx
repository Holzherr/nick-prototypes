import type { Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/features/auth/AuthContext';
import { TooltipProvider } from '../src/shared/components/ui/tooltip';
import '../src/styles/tailwind.css';

const queryClient = new QueryClient();

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MemoryRouter>
            <AuthProvider>
              <Story />
            </AuthProvider>
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
    backgrounds: { options: { app: { name: 'app', value: '#fcfcfc' }, white: { name: 'white', value: '#ffffff' } } },
    viewport: {
      options: {
        iphone: { name: 'iPhone 15', styles: { width: '393px', height: '852px' }, type: 'mobile' },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' }, type: 'desktop' },
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'app' } },
};

export default preview;
