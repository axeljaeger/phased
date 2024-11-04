import { importProvidersFrom } from "@angular/core";
import { BeamformingComponent } from "./beamforming.component";
import * as componentMetadata from "./beamforming.component.metadata";

import { StoryFn, Meta, moduleMetadata, applicationConfig } from "@storybook/angular";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

export default {
  title: "Beamforming",
  component: BeamformingComponent,
  argTypes: {},
  decorators: [moduleMetadata(componentMetadata.moduleMetaData), 
    applicationConfig({
    
      providers: [importProvidersFrom(NoopAnimationsModule)]
    })
  ],
  parameters: {
    viewport: {
      defaultViewport: "sidebarPanel",
    },
    backgrounds: {
      default: 'dark',
    },
  },
} as Meta<BeamformingComponent>;

const Template: StoryFn<BeamformingComponent> = (
  args,
) => ({
  props: args,
});

export const Default: StoryFn<BeamformingComponent> = Template.bind({});
Default.args = {};

