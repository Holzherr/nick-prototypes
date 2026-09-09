import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import { Toaster as SonnerToaster, toast } from './sonner';
import { ToastAction } from './toast';
import { Toaster } from './toaster';
import { useToast } from './use-toast';

// Both toast systems shipped in the Lovable export and both are still wired in App.tsx:
// sonner for fire-and-forget confirmations, the Radix toaster where an action button is needed.
const meta = {
  title: 'Shared/UI/Toasts',
  parameters: {
    docs: {
      description: {
        component:
          'Two stacks. **Sonner** (`toast()` from ./sonner) drops a compact card in the corner for confirmations — "Saved to your box". **Radix toast** (`useToast()` + ./toaster) is the one that can carry an action button, used for undo. Mount `<Toaster />` and `<SonnerToaster />` once at the app root.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sonner: Story = {
  render: () => (
    <div className="p-6">
      <SonnerToaster />
      <Button onClick={() => toast('Saved to your recipe box')}>Save to box</Button>
    </div>
  ),
};

function RadixDemo() {
  const { toast: push } = useToast();
  return (
    <div className="p-6">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          push({
            title: 'Removed from your list',
            description: '2 cloves garlic',
            action: <ToastAction altText="Undo">Undo</ToastAction>,
          })
        }
      >
        Remove item
      </Button>
    </div>
  );
}

export const WithAction: Story = { render: () => <RadixDemo /> };
