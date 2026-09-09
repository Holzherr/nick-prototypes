import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { populatedAppState, withApp } from '@/app/fixtures';
import RecipeCard from './RecipeCard';
import { cookies, misoAubergine, recipes, shakshuka } from './fixtures';

const meta = {
  title: 'Recipe/RecipeCard',
  component: RecipeCard,
  parameters: {
    docs: {
      description: {
        component:
          'The tile the whole feed is made of. A 4:3 photo that scales very slightly on hover (a plain grey block when the recipe has no photo), then the title on one truncated line, the author handle under it, and a bookmark button right-aligned that fills solid once the recipe is in your box. Save count and cook time sit underneath in the small grey.',
      },
    },
  },
  decorators: [
    withApp(populatedAppState),
    // One router for the whole file — the cards are full of <Link>s.
    Story => (
      <MemoryRouter>
        <div className="p-6">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof RecipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const Card = (props: React.ComponentProps<typeof RecipeCard>) => (
  <div className="w-[280px]">
    <RecipeCard {...props} />
  </div>
);

export const Default: Story = {
  args: { recipe: misoAubergine },
  render: args => <Card {...args} />,
};

/** `r1` is in `savedRecipeIds`, so the bookmark is filled. */
export const Saved: Story = {
  args: { recipe: shakshuka },
  render: args => <Card {...args} />,
};

export const LongTitle: Story = {
  args: { recipe: { ...cookies, title: 'Brown butter chocolate chip cookies with flaky salt' } },
  render: args => <Card {...args} />,
};

export const Grid: Story = {
  args: { recipe: shakshuka },
  render: () => (
    <div className="grid w-[880px] max-w-full grid-cols-3 gap-6">
      {recipes.map(r => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  ),
};
