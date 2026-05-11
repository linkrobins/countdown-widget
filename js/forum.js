'use strict';

(function () {


    function naiveToUTC(isoLocal, tz) {
        if (!isoLocal) return null;

        var normalized = String(isoLocal).trim();
        normalized = normalized.replace(/[Zz]$|[+-]\d\d:?\d\d$/, '');

        var asIfUtc = new Date(normalized + 'Z');
        if (isNaN(asIfUtc.getTime())) return null;

        if (!tz) tz = 'UTC';

        try {
            var tzWall  = new Date(asIfUtc.toLocaleString('en-US', { timeZone: tz }));
            var utcWall = new Date(asIfUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
            var offsetMs = utcWall.getTime() - tzWall.getTime();
            return asIfUtc.getTime() + offsetMs;
        } catch (e) {
            return asIfUtc.getTime();
        }
    }

    function breakDown(ms) {
        if (ms < 0) ms = 0;
        var totalSec = Math.floor(ms / 1000);
        var days     = Math.floor(totalSec / 86400);
        var hours    = Math.floor((totalSec % 86400) / 3600);
        var minutes  = Math.floor((totalSec % 3600) / 60);
        var seconds  = totalSec % 60;
        return { days: days, hours: hours, minutes: minutes, seconds: seconds };
    }

    function pad2(n) {
        n = Number(n) || 0;
        return n < 10 ? '0' + n : String(n);
    }


    app.initializers.add('linkrobins/countdown-widget', function () {
        if (!app.widgets) return;

        var Component = flarum.reg.get('core', 'common/Component');
        if (!Component) return;

        class CountdownWidget extends Component {

            oninit(vnode) {
                super.oninit(vnode);
                this._tick   = null;
                this._target = null;
                this._computeTarget();
                this._startTicking();
            }

            onremove() {
                this._stopTicking();
            }

            _computeTarget() {
                var raw = app.forum.attribute('linkrobinsCountdownTarget') || '';
                var tz  = app.forum.attribute('linkrobinsCountdownTimezone') || 'UTC';
                this._target = naiveToUTC(raw, tz);
            }

            _startTicking() {
                var self = this;
                if (this._tick) return;
                this._tick = setInterval(function () {
                    m.redraw();
                }, 1000);
            }

            _stopTicking() {
                if (this._tick) {
                    clearInterval(this._tick);
                    this._tick = null;
                }
            }

            _renderTitle(title, icon) {
                if (!title && !icon) return null;
                var children = [];
                if (icon) {
                    children.push(
                        m('span', { className: 'FofWidgets-Widget-title-icon' },
                            m('i', { className: icon }))
                    );
                }
                if (title) {
                    children.push(
                        m('span', { className: 'FofWidgets-Widget-title-label' }, title)
                    );
                }
                return m('div', { className: 'FofWidgets-Widget-title' }, children);
            }

            _renderDone(doneMessage, linkUrl) {
                var msg = doneMessage && doneMessage.length ? doneMessage : '🎉';
                var inner = m('div', { className: 'LinkRobinsCountdown-done' }, msg);
                if (linkUrl) {
                    return m('a', {
                        className: 'LinkRobinsCountdown-doneLink',
                        href:      linkUrl,
                        rel:       'noopener',
                    }, inner);
                }
                return inner;
            }

            _renderBoxes(remaining, linkUrl) {
                var parts = breakDown(remaining);
                var boxes = m('div', { className: 'LinkRobinsCountdown-boxes' }, [
                    this._box(parts.days,    app.translator.trans('linkrobins-countdown-widget.forum.unit.days')),
                    this._box(parts.hours,   app.translator.trans('linkrobins-countdown-widget.forum.unit.hours')),
                    this._box(parts.minutes, app.translator.trans('linkrobins-countdown-widget.forum.unit.minutes')),
                    this._box(parts.seconds, app.translator.trans('linkrobins-countdown-widget.forum.unit.seconds')),
                ]);

                if (linkUrl) {
                    return m('a', {
                        className: 'LinkRobinsCountdown-boxesLink',
                        href:      linkUrl,
                        rel:       'noopener',
                    }, boxes);
                }
                return boxes;
            }

            _box(value, label) {
                // Days isn't padded if 3+ digits (e.g. a 1-year countdown shows "365").
                var display = value >= 100 ? String(value) : pad2(value);
                return m('div', { className: 'LinkRobinsCountdown-box' }, [
                    m('div', { className: 'LinkRobinsCountdown-box-value' }, display),
                    m('div', { className: 'LinkRobinsCountdown-box-label' }, label),
                ]);
            }

            view() {
                var title       = app.forum.attribute('linkrobinsCountdownTitle')        || '';
                var icon        = app.forum.attribute('linkrobinsCountdownIcon')         || '';
                var doneMessage = app.forum.attribute('linkrobinsCountdownDoneMessage')  || '';
                var linkUrl     = app.forum.attribute('linkrobinsCountdownLinkUrl')      || '';

                var children = [];
                var titleNode = this._renderTitle(title, icon);
                if (titleNode) children.push(titleNode);

                var content;
                if (this._target === null) {
                    content = m('div', { className: 'LinkRobinsCountdown-empty' },
                        app.translator.trans('linkrobins-countdown-widget.forum.not_configured'));
                } else {
                    var remaining = this._target - Date.now();
                    if (remaining <= 0) {
                        content = this._renderDone(doneMessage, linkUrl);
                    } else {
                        content = this._renderBoxes(remaining, linkUrl);
                    }
                }

                children.push(
                    m('div', { className: 'FofWidgets-Widget-content' }, content)
                );

                return m('div', { className: 'FofWidgets-Widget LinkRobinsCountdownWidget' }, children);
            }
        }

        app.widgets.add({
            key:        'linkrobins-countdown-widget',
            component:  CountdownWidget,
            placement:  'start_top',
            isUnique:   true,
            isDisabled: false,
        }, 'linkrobins-countdown-widget');
    });

})();

module.exports = {};
