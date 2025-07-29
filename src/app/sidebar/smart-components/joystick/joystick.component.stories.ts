import { Meta, StoryObj } from '@storybook/angular';
import { JoystickComponent } from './joystick.component';

const meta: Meta<JoystickComponent> = {
  title: 'Controls/Joystick',
  component: JoystickComponent,
  argTypes: {
    position: { action: 'position' }, // 👈 Aktiviert das Actions-Panel
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<JoystickComponent>;

export const Enabled: Story = {
  args: {
    disabled: false,
    positionInput: { u: 0, v: 0 },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    positionInput: { u: 0, v: 0 },
  },
};