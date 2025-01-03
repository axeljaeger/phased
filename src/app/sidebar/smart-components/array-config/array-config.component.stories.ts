import { importProvidersFrom } from "@angular/core";
import { ArrayConfigComponent } from "./array-config.component";
import * as componentMetadata from "./array-config.component.metadata";

import { StoryFn, Meta, moduleMetadata, applicationConfig } from "@storybook/angular";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

export default {
  title: "Array config",
  component: ArrayConfigComponent,
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
} as Meta<ArrayConfigComponent>;

const Template: StoryFn<ArrayConfigComponent> = (
  args,
) => ({
  props: args,
});

export const Default: StoryFn<ArrayConfigComponent> = Template.bind({});
Default.args = {};

