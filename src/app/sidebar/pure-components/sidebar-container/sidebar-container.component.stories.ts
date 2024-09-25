import { importProvidersFrom } from "@angular/core";
import { SidebarContainerComponent } from "./sidebar-container.component";
import * as menuLeft from "./sidebar-container.component.metadata";

import { StoryFn, Meta, moduleMetadata, applicationConfig } from "@storybook/angular";
import { userEvent, within } from "@storybook/test";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

export default {
  title: "Sidebar Container",
  component: SidebarContainerComponent,
  argTypes: {},
  decorators: [moduleMetadata(menuLeft.moduleMetaData), 
    applicationConfig({
    
      providers: [importProvidersFrom(NoopAnimationsModule)]
    })
  ],
  parameters: {
    viewport: {
      defaultViewport: "sidebarPanel",
    },
  },
} as Meta<SidebarContainerComponent>;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: StoryFn<SidebarContainerComponent> = (
  args,
) => ({
  props: args,
});

export const Default: StoryFn<SidebarContainerComponent> = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Default.args = {};

export const Environment = Template.bind({});
Environment.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByTestId("section-environment"));
};

export const ArrayConfig = Template.bind({});
ArrayConfig.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByTestId("section-arrayconfig"));
};

export const Beamforming = Template.bind({});
Beamforming.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByTestId("section-beamforming"));
};
