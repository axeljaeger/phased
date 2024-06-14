import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
setCompodocJson(docJson);

const customViewports = {
  sidebarPanel: {
    name: 'Sidebar Panel',
    styles: {
      width: '300px',
      height: '300px',
    },
  },
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: { inlineStories: true },
  viewport: {
    viewports: {
      //...MINIMAL_VIEWPORTS,
      ...customViewports,
    },
  },
}
export const tags = ["autodocs"];