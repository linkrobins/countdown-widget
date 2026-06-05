import app from 'flarum/common/app';

import { naiveToUTC, breakDown, pad2, TimeParts } from '../utils/time';

/**
 * Builds the Countdown widget class.
 *
 * The fof Widget base class is passed in (resolved at initializer time, not at
 * module load) so the class isn't defined against an `ext:` binding that may
 * not be registered yet during cross-bundle load.
 */
export default function makeCountdownWidget(Widget: any) {
  return class CountdownWidget extends Widget {
    private _tick: ReturnType<typeof setInterval> | null = null;
    private _target: number | null = null;

    // Forum attributes are absent in the admin frontend, where the widget is
    // rendered as a preview by the layout editor — fall back gracefully.
    attr(key: string): string {
      return (app.forum && (app.forum.attribute(key) as string)) || '';
    }

    oninit(vnode: any) {
      super.oninit(vnode);
      this._computeTarget();
      this._startTicking();
    }

    onremove() {
      this._stopTicking();
    }

    _computeTarget() {
      const raw = this.attr('linkrobinsCountdownTarget');
      const tz = this.attr('linkrobinsCountdownTimezone') || 'UTC';
      this._target = naiveToUTC(raw, tz);
    }

    _startTicking() {
      // No target (or already elapsed) means nothing changes per second — do
      // not burn a redraw loop.
      if (this._tick || this._target === null || this._target - Date.now() <= 0) return;

      this._tick = setInterval(() => {
        if (this._target !== null && this._target - Date.now() <= 0) {
          this._stopTicking();
        }
        m.redraw();
      }, 1000);
    }

    _stopTicking() {
      if (this._tick) {
        clearInterval(this._tick);
        this._tick = null;
      }
    }

    className(): string {
      return 'LinkRobinsCountdownWidget';
    }

    icon(): string {
      return this.attr('linkrobinsCountdownIcon');
    }

    title(): string {
      return this.attr('linkrobinsCountdownTitle');
    }

    // The base header() only renders when title() is set; preserve the old
    // behaviour of showing an icon-only header too.
    header() {
      const base = super.header();
      if (base) return base;

      const iconName = this.icon();
      if (!iconName) return null;

      return m(
        'div',
        { className: 'FofWidgets-Widget-title' },
        m('span', { className: 'FofWidgets-Widget-title-icon' }, m('i', { className: iconName }))
      );
    }

    content() {
      if (this._target === null) {
        return m(
          'div',
          { className: 'LinkRobinsCountdown-empty' },
          app.translator.trans('linkrobins-countdown-widget.forum.not_configured')
        );
      }

      const remaining = this._target - Date.now();
      const linkUrl = this.attr('linkrobinsCountdownLinkUrl');

      if (remaining <= 0) {
        return this._renderDone(this.attr('linkrobinsCountdownDoneMessage'), linkUrl);
      }

      return this._renderBoxes(remaining, linkUrl);
    }

    _renderDone(doneMessage: string, linkUrl: string) {
      const msg = doneMessage && doneMessage.length ? doneMessage : '🎉';
      const inner = m('div', { className: 'LinkRobinsCountdown-done' }, msg);

      if (linkUrl) {
        return m('a', { className: 'LinkRobinsCountdown-doneLink', href: linkUrl, rel: 'noopener' }, inner);
      }
      return inner;
    }

    _renderBoxes(remaining: number, linkUrl: string) {
      const parts: TimeParts = breakDown(remaining);
      const boxes = m('div', { className: 'LinkRobinsCountdown-boxes' }, [
        this._box(parts.days, app.translator.trans('linkrobins-countdown-widget.forum.unit.days')),
        this._box(parts.hours, app.translator.trans('linkrobins-countdown-widget.forum.unit.hours')),
        this._box(parts.minutes, app.translator.trans('linkrobins-countdown-widget.forum.unit.minutes')),
        this._box(parts.seconds, app.translator.trans('linkrobins-countdown-widget.forum.unit.seconds')),
      ]);

      if (linkUrl) {
        return m('a', { className: 'LinkRobinsCountdown-boxesLink', href: linkUrl, rel: 'noopener' }, boxes);
      }
      return boxes;
    }

    _box(value: number, label: any) {
      // Days isn't padded if 3+ digits (e.g. a 1-year countdown shows "365").
      const display = value >= 100 ? String(value) : pad2(value);
      return m('div', { className: 'LinkRobinsCountdown-box' }, [
        m('div', { className: 'LinkRobinsCountdown-box-value' }, display),
        m('div', { className: 'LinkRobinsCountdown-box-label' }, label),
      ]);
    }
  };
}
