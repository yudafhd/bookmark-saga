import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bookmark Saga',
    description: 'New Tab showcasing your bookmark and latest browsing history.',
    version: '1.6.0',
    permissions: ['history', 'storage', 'tabs', 'bookmarks'],

    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png"
    },

    action: {
      default_popup: 'action.html',
      default_title: 'Bookmark Saga',
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
      },
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
