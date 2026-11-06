# Instagram Bulk Unlike

A browser console script that removes your Instagram likes in batches from the "Your activity" page, so you don't have to unlike posts one at a time.

> **Use at your own risk.** This script automates clicks on instagram.com, which goes against Instagram's Terms of Use. Removing a lot of likes quickly can trigger temporary "Try again later" blocks on your account. The script also depends on Instagram's current page layout, so it can break whenever Instagram changes the site. Read the code before running it: it only clicks buttons on the page and doesn't send your data anywhere.

## What it does

Each cycle, the script turns on select mode on your Likes page, scrolls to load up to `MAX` liked posts, ticks them, clicks **Unlike** and confirms. It then waits and repeats until scrolling stops bringing in new posts.

This is a modified version of Chidi's original script. The original only worked with the posts already loaded on the page, so it stopped after the first batch even when more likes were left. This version scrolls the list to load more before each cycle and keeps a running total.

## Requirements

You need a desktop browser (Chrome, Edge, Firefox or Safari) and Instagram set to **English**, because the script finds buttons by their English labels.

## How to use

1. Log into instagram.com in a desktop browser and make sure the language is set to English.
2. Go to https://www.instagram.com/your_activity/interactions/likes
3. Open the developer console: Ctrl+Shift+J (Cmd+Option+J on Mac) in Chrome or Edge, Ctrl+Shift+K (Cmd+Option+K) in Firefox, or Cmd+Option+C in Safari after turning on developer features in Safari's Advanced settings.
4. If the browser warns you about pasting code, type `allow pasting` and press Enter.
5. Copy the whole of `instagram-bulk-unlike.js`, paste it into the console and press Enter.
6. Keep the tab open and in front while it runs. Each cycle is logged in the console with a running total.

## Stopping

Type `window.__STOP_IG_BULK_UNLIKE__ = true` in the console and press Enter to stop after the current step, or refresh the page to stop immediately.

## Settings

You can change these at the top of the script:

| Setting | Default | What it does |
|---|---|---|
| `MAX` | `100` | Likes removed per cycle |
| `CYCLE_DELAY` | `20000` | Pause between cycles, in milliseconds |
| `LOAD_DELAY` | `2000` | Wait after each scroll for more likes to load, in milliseconds |
| `LOAD_ATTEMPTS` | `5` | Scrolls in a row with nothing new before the script decides no likes are left |

If Instagram starts showing "Try again later", stop the script, wait a few hours, then lower `MAX` or raise `CYCLE_DELAY` before running it again.

## Troubleshooting

When the script stops on an error, it prints a diagnostics table in the console showing what it could and couldn't find on the page. "Select button not found" or "Unlike action not found" usually means Instagram isn't set to English or has changed its layout. If you open an issue, include the error message and the table.


## License

MIT. See [LICENSE](LICENSE). The original copyright notice is kept, as the license requires.