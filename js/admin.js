'use strict';

(function () {

    function getBrowserTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        } catch (e) {
            return 'UTC';
        }
    }

    app.initializers.add('linkrobins/countdown-widget', function () {

        if (app.widgets) {
            app.widgets.add({
                key:        'linkrobins-countdown-widget',
                component:  { view: function () { return null; } },
                placement:  'start_top',
                isUnique:   true,
                isDisabled: false,
            }, 'linkrobins-countdown-widget');
        }

        if (!app.registry || typeof app.registry.for !== 'function') return;

        var t = function (key) {
            return app.translator.trans('linkrobins-countdown-widget.admin.settings.' + key);
        };

        app.registry
            .for('linkrobins-countdown-widget')

            .registerSetting({
                setting:     'linkrobins-countdown-widget.title',
                type:        'text',
                label:       t('title_label'),
                help:        t('title_help'),
                placeholder: 'Launching in...',
            })

            .registerSetting({
                setting:     'linkrobins-countdown-widget.icon',
                type:        'text',
                label:       t('icon_label'),
                help:        t('icon_help'),
                placeholder: 'fas fa-rocket',
            })

            .registerSetting({
                setting: 'linkrobins-countdown-widget.target',
                type:    'datetime-local',
                label:   t('target_label'),
                help:    t('target_help'),
            })

            .registerSetting(function () {
                var page  = this;
                var value = page.setting('linkrobins-countdown-widget.timezone', 'UTC');

                return m('div', { className: 'Form-group' },
                    m('label', t('timezone_label')),
                    m('div', { className: 'LinkRobinsCountdown-tzRow' },
                        m('input', {
                            className:   'FormControl',
                            type:        'text',
                            value:       value(),
                            oninput:     function (e) { value(e.target.value); },
                            placeholder: 'UTC',
                        }),
                        m('button', {
                            type:      'button',
                            className: 'Button',
                            onclick:   function () {
                                value(getBrowserTimezone());
                                m.redraw();
                            },
                        }, t('use_my_timezone'))
                    ),
                    m('p', { className: 'helpText' }, t('timezone_help'))
                );
            }, 0, 'linkrobins-countdown-widget.timezone')

            .registerSetting({
                setting:     'linkrobins-countdown-widget.done_message',
                type:        'text',
                label:       t('done_message_label'),
                help:        t('done_message_help'),
                placeholder: '🎉 We are live!',
            })

            .registerSetting({
                setting:     'linkrobins-countdown-widget.link_url',
                type:        'url',
                label:       t('link_url_label'),
                help:        t('link_url_help'),
                placeholder: 'https://example.com/launch',
            });
    });

})();

module.exports = {};
