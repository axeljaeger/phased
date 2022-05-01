// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { EngineService } from 'src/app/engine.service';
import { MenuLeftComponent } from './menu-left.component';

import { Story, Meta, moduleMetadata } from '@storybook/angular';
import { userEvent, within } from '@storybook/testing-library';

import { FormBuilder } from '@angular/forms';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule  } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';

import { BehaviorSubject } from 'rxjs';

// More on default export: https://storybook.js.org/docs/angular/writing-stories/introduction#default-export
export default {
  title: 'Menu Left',
  component: MenuLeftComponent,
  // More on argTypes: https://storybook.js.org/docs/angular/api/argtypes
  argTypes: {

  },
  decorators: [
    moduleMetadata({
      providers: [
        {provide: EngineService, useValue: {
            transducers$: new BehaviorSubject([{name: "x"},{name: "y"}]),
            setTransducerPositions: () => {}
        }}, 
        {provide: FormBuilder, useClass: FormBuilder}
      ],
      imports: [
        MatExpansionModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ]
    })
  ]
} as Meta;

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<MenuLeftComponent> = (args: MenuLeftComponent) => ({
  props: args,
});

const fb = new FormBuilder();

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Default.args = {
  
};

export const OpenAndClose = Template.bind({});
OpenAndClose.play = async ({ canvasElement }) => {
  // Starts querying the component from its root element
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByTestId('section-environment'));
  await userEvent.click(canvas.getByTestId('section-arrayconfig'));
  await userEvent.click(canvas.getByTestId('section-beamforming'));

};

