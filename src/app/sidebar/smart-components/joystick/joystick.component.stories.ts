import { Meta, StoryObj } from '@storybook/angular';
import { JoystickComponent } from './joystick.component';

const meta: Meta<JoystickComponent> = {
  title: 'Controls/Joystick',
  component: JoystickComponent,
  tags: ['autodocs'],
  argTypes: {
    position: { action: 'position' }, // 👈 Aktiviert das Actions-Panel
  },
};

export default meta;
type Story = StoryObj<JoystickComponent>;

export const AZEL: Story = {
  args: {
    mode: 'AZEL',
    disabled: false,
    positionInput: { x: 0, y: 0 },
  },
};

export const UV: Story = {
  args: {
    mode: 'UV',
    disabled: false,
    positionInput: { x: 0, y: 0 },
  },
};

export const Disabled: Story = {
  args: {
    mode: 'UV',
    disabled: true,
    positionInput: { x: 0, y: 0 },
  },
};