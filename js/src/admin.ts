import app from 'flarum/admin/app';

import registerWidget from './common/registerWidget';

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

app.initializers.add('linkrobins/countdown-widget', () => {
  // Register the widget so it appears (and previews) in the Forum Widgets editor.
  registerWidget(app);

  const t = (key: string) => app.translator.trans(`linkrobins-countdown-widget.admin.settings.${key}`);

  app.registry
    .for('linkrobins-countdown-widget')

    .registerSetting({
      setting: 'linkrobins-countdown-widget.title',
      type: 'text',
      label: t('title_label'),
      help: t('title_help'),
      placeholder: t('title_placeholder'),
    })

    .registerSetting({
      setting: 'linkrobins-countdown-widget.icon',
      type: 'text',
      label: t('icon_label'),
      help: t('icon_help'),
      placeholder: t('icon_placeholder'),
    })

    .registerSetting({
      setting: 'linkrobins-countdown-widget.target',
      type: 'datetime-local',
      label: t('target_label'),
      help: t('target_help'),
    })

    .registerSetting(function (this: any) {
      const value = this.setting('linkrobins-countdown-widget.timezone', 'UTC');

      return m(
        'div',
        { className: 'Form-group' },
        m('label', t('timezone_label')),
        m(
          'div',
          { className: 'LinkRobinsCountdown-tzRow' },
          m('input', {
            className: 'FormControl',
            type: 'text',
            value: value(),
            oninput: (e: InputEvent & { target: HTMLInputElement }) => value(e.target.value),
            placeholder: 'UTC',
          }),
          m(
            'button',
            {
              type: 'button',
              className: 'Button',
              onclick: () => {
                value(getBrowserTimezone());
                m.redraw();
              },
            },
            t('use_my_timezone')
          )
        ),
        m('p', { className: 'helpText' }, t('timezone_help'))
      );
    }, 0, 'linkrobins-countdown-widget.timezone')

    .registerSetting({
      setting: 'linkrobins-countdown-widget.done_message',
      type: 'text',
      label: t('done_message_label'),
      help: t('done_message_help'),
      placeholder: t('done_message_placeholder'),
    })

    .registerSetting({
      setting: 'linkrobins-countdown-widget.link_url',
      type: 'url',
      label: t('link_url_label'),
      help: t('link_url_help'),
      placeholder: t('link_url_placeholder'),
    });
});
