import { StorybookConfig } from '@storybook/angular';
const config: StorybookConfig = {
  "stories": ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  "staticDirs": ["../src"],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@chromatic-com/storybook"
  ],
  "framework": {
    name: "@storybook/angular",
    options: {}
  },
  docs: {}
};
export default config;