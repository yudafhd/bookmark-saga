import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bookmark Saga',
    description: 'New Tab showcasing your latest browsing history.',
    version: '1.2.0',
    permissions: ['history', 'storage', 'tabs', 'bookmarks'],

    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png"
    },

    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  },
});
