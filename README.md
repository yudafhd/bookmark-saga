# Bookmark Saga - Chrome Extension

Chrome extension that replaces the New Tab page with a list of recent website visits.

## Installation
1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" in the top right.
3. Click "Load unpacked" and select the folder containing this extension.
4. The New Tab page will now show Bookmark Saga.

## Usage
- **New Tab**: Displays the last 20 (default) visited HTTP(S) sites.
- **Search**: Filter by title, URL, or hostname.
- **Refresh**: Reload the list from storage.
- **Clear**: Remove all visits from storage.
- **Options**: Change max items (5-200) via `chrome://extensions/` > Details > Extension options.

## Permissions
- `history`: Track visited pages.
- `storage`: Store visits and settings.
- `tabs`: Open URLs in current tab.

## Testing
1. Load the extension.
2. Open a new tab → see empty state.
3. Visit 3+ websites.
4. Open new tab → see list with latest on top.
5. Search "google" → filter results.
6. Clear → empty state.
7. Change max items in options → affects list length.