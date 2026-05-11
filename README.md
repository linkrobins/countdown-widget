# Link Robins Countdown Widget

A configurable countdown widget for [Flarum 2.0](https://flarum.org), built as a widget for [`fof/forum-widgets-core`](https://packagist.org/packages/fof/forum-widgets-core). Same skeleton as [`linkrobins/html-widget`](https://packagist.org/packages/linkrobins/html-widget) and [`linkrobins/markdown-widget`](https://packagist.org/packages/linkrobins/markdown-widget).

## What it does

Renders a four-box countdown — days, hours, minutes, seconds — ticking down to an admin-configured moment. When it hits zero, shows a configurable "done" message. Optionally wraps the whole thing in a link.

## Features

- **Configurable target** via the browser's native date+time picker (year, month, day, hour, minute)
- **Timezone-aware** — admin picks the IANA timezone for the target, and every visitor counts down to the same actual instant regardless of where they are
- **One tick per second** with smooth Mithril redraws
- **Optional title + FontAwesome icon** above the countdown
- **Done state** with a configurable message (defaults to 🎉) when the countdown reaches zero
- **Optional link** wrapping the whole widget — useful for "launching in… [click for details]"
- **Theme-friendly** — uses Flarum 2's CSS custom properties so colors pick up your theme automatically
- **Tabular-numerics font feature** so digits don't jitter as they tick

## Requirements

- Flarum **2.0** or later
- PHP **8.2** or later
- [`fof/forum-widgets-core`](https://packagist.org/packages/fof/forum-widgets-core) installed and enabled

## Installation

```
composer require linkrobins/countdown-widget
php flarum cache:clear
```

In Flarum admin → **Extensions**, find **Link Robins Countdown** under the **Forum Widgets** category and enable it. Configure the target on its settings page, then go to **FoF Forum Widgets** settings and place the widget where you want it.

## Settings

- **Title** (optional) — shown above the countdown
- **Icon** (optional) — FontAwesome class shown next to the title (e.g. `fas fa-rocket`)
- **Target date and time** — uses the browser's date picker; covers year, month, day, hour, and minute
- **Timezone** — IANA name like `UTC`, `America/New_York`, `Europe/London`, `Asia/Tokyo`. There's a "Use my timezone" button that fills this with whatever your browser thinks the local zone is
- **Done message** — shown when the countdown hits zero (defaults to 🎉)
- **Link URL** (optional) — if set, the countdown becomes a clickable link

## How the timezone math works

The target time is stored as a "naive" wall-clock datetime (e.g. `2026-12-31T23:59`) paired with a timezone (e.g. `America/New_York`). At render time, the widget converts that pair into an absolute UTC instant using the browser's `Intl.DateTimeFormat` API, which correctly handles daylight-saving transitions for the target date. Every visitor's browser then counts down to that single instant, so the displayed remaining-time stays consistent across the audience regardless of where each viewer is.

This avoids the most common countdown widget bug: "the admin set it for 11pm but my visitors in Tokyo see a different time."

## License

MIT
