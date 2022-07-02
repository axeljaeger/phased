// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { Story, Meta, moduleMetadata, componentWrapperDecorator } from '@storybook/angular';
import { ArrayRendererService } from 'src/app/array-renderer.service';
import { NoOpRendererService } from 'src/app/no-op-renderer.service';


import { StorybookTestbedComponent } from '../storybook-testbed/storybook-testbed.component';


// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'ArrayRenderer',
  component: StorybookTestbedComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  decorators: [
      moduleMetadata( 
        {
        declarations: [StorybookTestbedComponent, ],
        imports: [],
        providers: [{ provide: NoOpRendererService, useClass: ArrayRendererService}]
    })
  ]
} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<StorybookTestbedComponent> = (args: StorybookTestbedComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Primary.args = {
 
};