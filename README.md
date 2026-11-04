# Link Robins Countdown Widget

A configurable countdown widget for [Flarum 2](https://flarum.org), built as a widget for [`fof/forum-widgets-core`](https://packagist.org/packages/fof/forum-widgets-core). It ticks down to a moment you choose and shows a message when it arrives.

## Features

- **Four-box countdown.** Days, hours, minutes and seconds, updating once per second. Days are not padded once they reach three digits, so a year-long countdown reads "365".
- **Configurable target** through the browser's native date and time picker (year, month, day, hour, minute).
- **Timezone-aware.** You pick the IANA timezone the target is in, and every visitor counts down to the same actual instant wherever they are. Daylight-saving changes for the target date are handled. A "Use my timezone" button fills in your browser's zone.
- **Optional title, description and icon.** A heading, small text under it (a date range, a venue, anything), and a FontAwesome icon. If you leave the title empty, an icon and/or description still get a header of their own.
- **Done state.** When the countdown reaches zero it shows your message, or a party emoji if you left it blank. The widget stops ticking once it is done, and a target already in the past shows the done message straight away.
- **Optional link.** Make the whole countdown (and the done message) a clickable link, for example "launching in..." pointing at the details. Only `http`, `https` and site-relative links are used; anything else is ignored and the countdown shows without a link.
- **Theme-friendly.** Colors come from Flarum 2's CSS custom properties, so it follows your theme, light or dark. Digits use tabular numerals so they do not jitter as they tick.
- **Private forums.** If guests cannot view your forum, they do not get the countdown either: its settings are only sent to visitors who can view the forum, like your discussions.
- **Previews in the layout editor.** The widget shows up live in the Forum Widgets layout editor in the admin panel.

Until a target is set, the widget shows a note asking for one.

## Settings

Admin, then Extensions, then Link Robins Countdown Widget.

| Setting | Default | What it does |
|---|---|---|
| Title | empty | Shown above the countdown. Leave blank for no heading. |
| Description | empty | Small text under the title: a date range, a venue, any extra detail. |
| Icon class | empty | FontAwesome class shown next to the title, such as `fas fa-rocket`. |
| Target date and time | empty | The moment to count down to, in the timezone below. |
| Timezone | UTC | IANA name such as `UTC`, `America/New_York`, `Europe/London` or `Asia/Tokyo`. |
| Done message | empty (shows a party emoji) | Shown when the countdown reaches zero. |
| Link URL | empty | If set, the countdown becomes a clickable link to this address. |

The widget is a single instance. It is added to the top of the forum's start column by default, and you can move it from the **FoF Forum Widgets** layout editor. The extension adds no permissions and no database tables.

## Requirements

- Flarum 2.x
- PHP 8.3 or newer
- [`fof/forum-widgets-core`](https://packagist.org/packages/fof/forum-widgets-core) installed and enabled

## Installation

```sh
composer require linkrobins/countdown-widget
```

Then toggle it on in the admin panel's **Extensions** page (it is listed under **Forum Widgets**), configure the target on its settings page, and place the widget in the **FoF Forum Widgets** layout editor.

## Updating

```sh
composer update linkrobins/countdown-widget
php flarum cache:clear
```

## How the timezone math works

The target is stored as a wall-clock date and time (for example `2026-12-31T23:59`) paired with a timezone (for example `America/New_York`). At render time the widget converts that pair into one absolute instant using the browser's `Intl.DateTimeFormat` API, which accounts for daylight saving on the target date. Every visitor's browser then counts down to that single instant, which avoids the classic bug where the admin sets 11pm and visitors elsewhere see a different time.

One edge case: a target set inside the single skipped or repeated hour of a daylight-saving change can land an hour off. Pick a time outside that hour.

## License

MIT
