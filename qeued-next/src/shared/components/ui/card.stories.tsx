import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Shared/UI/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'White surface with a 1px border, 12px radius and a soft shadow. Header (title + description) and content sections; every title and entry card is built on it.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Severance</CardTitle>
        <CardDescription>Series · 2022 · ★ 8.7</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Employees at Lumon undergo a procedure that splits their work and home memories.</CardContent>
    </Card>
  ),
};
