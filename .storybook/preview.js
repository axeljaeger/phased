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
  docs: { inlineStories: true },
  viewport: {
    viewports: {
      //...MINIMAL_VIEWPORTS,
      ...customViewports,
    },
  },
}
export const tags = [];