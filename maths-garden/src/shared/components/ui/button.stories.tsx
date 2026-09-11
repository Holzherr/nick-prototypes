import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Rounded "candy" buttons: a solid slab of a darker colour sits under the button and shrinks when pressed. Variants: primary (pink fill, raspberry slab), quiet (cream fill, petal slab), answer (the big round number bubble), right (turns green and bounces), wrong (pale pink and wobbles), ghost (text only). Sizes: sm, md, lg, answer (84–118px circle), icon (58px circle).',
      },
    },
  },
  args: { children: 'Play again 💗' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { size: 'lg' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6 p-8">
      <Button size="lg">Play again 💗</Button>
      <Button variant="quiet" size="lg">
        All games
      </Button>
      <Button variant="answer" size="answer">
        4
      </Button>
      <Button variant="right" size="answer">
        5
      </Button>
      <Button variant="wrong" size="answer">
        6
      </Button>
      <Button variant="quiet" size="icon" aria-label="Home">
        🏠
      </Button>
      <Button variant="ghost">⚙️ Grown-ups</Button>
      <Button size="sm">Small</Button>
    </div>
  ),
};
