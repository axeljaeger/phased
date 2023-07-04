// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { StoryFn, Meta, moduleMetadata, componentWrapperDecorator, Story } from '@storybook/angular';

import { ExcitationRendererComponent } from './excitation-renderer.component';
import { BabylonJSViewComponent } from '../../smart-components/babylon-jsview/babylon-jsview.component';


// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'ExcitationRendererComponent',
  component: BabylonJSViewComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  decorators: [
    moduleMetadata({
      declarations: [BabylonJSViewComponent],
      imports: [],
    }),
    componentWrapperDecorator((story) => `<app-babylon-jsview>${story}</app-babylon-jsview>`),
  ],
} as Meta<ExcitationRendererComponent>;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<ExcitationRendererComponent> = (args: ExcitationRendererComponent) => ({
  props: args,
});

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Primary.args = {
 
};