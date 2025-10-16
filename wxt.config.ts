import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Bookmark Saga',
    description: 'New Tab yang menampilkan riwayat kunjungan terbaru.',
    version: '1.0.0',
    permissions: ['history', 'storage', 'tabs'],
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
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
