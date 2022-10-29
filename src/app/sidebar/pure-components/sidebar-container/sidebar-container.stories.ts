import { MenuLeftComponent } from './sidebar-container';
import * as menuLeft from './sidebar-container.metadata' ;

import { StoryFn, Meta, moduleMetadata } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';

export default {
  title: 'Menu Left',
  component: MenuLeftComponent,
  argTypes: {},
  decorators: [moduleMetadata(menuLeft.moduleMetaData)],
} as Meta<MenuLeftComponent>;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: StoryFn<MenuLeftComponent> = (args: MenuLeftComponent) => ({
  props: args,
});

export const Default: StoryFn<MenuLeftComponent> = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Default.args = {
  
};

export const Environment = Template.bind({});
Environment.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByTestId('section-environment'));
};

export const ArrayConfig = Template.bind({});
ArrayConfig.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByTestId('section-arrayconfig'));
};

export const Beamforming = Template.bind({});
Beamforming.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByTestId('section-beamforming'));
};