import type { Meta, StoryObj } from '@storybook/react-vite';
import { characterById } from '../characters';
import { CharacterSlot } from './CharacterSlot';

const nova = characterById('nova');

const meta = {
  title: 'Character',
  component: CharacterSlot,
  parameters: {
    docs: {
      description: {
        component:
          'The character that grows as the child plays, one story per stage. Nova, the first of the list: a pop-star girl waving (stage 1), then a microphone (2), a sparkly dress and headphones (3), a stage disc under a spotlight (4), a tiara and a shower of stars (5). Nothing to read; tapping her speaks her line for the stage. Stages begin at 5, 15, 40 and 80 finished rounds.',
      },
    },
  },
  args: { character: nova, childName: 'Tara', size: 200 },
} satisfies Meta<typeof CharacterSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stage1: Story = { name: 'Stage 1', args: { rounds: 0 } };
export const Stage2: Story = { name: 'Stage 2', args: { rounds: nova.stagesAt[0] } };
export const Stage3: Story = { name: 'Stage 3', args: { rounds: nova.stagesAt[1] } };
export const Stage4: Story = { name: 'Stage 4', args: { rounds: nova.stagesAt[2] } };
export const Stage5: Story = { name: 'Stage 5', args: { rounds: nova.stagesAt[3] } };
