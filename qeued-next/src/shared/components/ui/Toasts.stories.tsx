import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Toaster as SonnerToaster, toast as sonnerToast } from './sonner';
import { Toaster } from './toaster';
import { useToast } from './use-toast';

const Demo = () => {
  const { toast } = useToast();
  return (
    <div className="flex gap-3 p-6">
      <Button onClick={() => toast({ title: 'Added to watchlist!', description: 'Severance' })}>Radix toast</Button>
      <Button variant="outline" onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })}>
        Destructive toast
      </Button>
      <Button variant="secondary" onClick={() => sonnerToast('Link copied')}>
        Sonner toast
      </Button>
      <Toaster />
      <SonnerToaster />
    </div>
  );
};

const meta = {
  title: 'Shared/UI/Toasts',
  component: Demo,
  parameters: {
    docs: {
      description: {
        component: 'Two toast systems inherited from the Lovable build: the Radix toaster (bottom-right cards, used with useToast) and sonner (compact, used for copy confirmations). Both are mounted once in App.',
      },
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
