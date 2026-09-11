import type { Preview } from '@storybook/react-vite';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '../src/styles/tailwind.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
    backgrounds: { options: { blush: { name: 'blush', value: '#ffe9f1' }, cream: { name: 'cream', value: '#fffdf9' } } },
    viewport: {
      options: {
        ipad: { name: 'iPad (landscape)', styles: { width: '1180px', height: '820px' }, type: 'tablet' },
        ipadPortrait: { name: 'iPad (portrait)', styles: { width: '820px', height: '1180px' }, type: 'tablet' },
        iphone: { name: 'iPhone 15', styles: { width: '393px', height: '852px' }, type: 'mobile' },
      },
    },
  },
  initialGlobals: { backgrounds: { value: 'blush' } },
};

export default preview;
