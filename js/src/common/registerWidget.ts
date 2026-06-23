import type Application from 'flarum/common/Application';
import makeCountdownWidget from './components/makeCountdownWidget';

/**
 * Registers the widget with fof/forum-widgets-core. Called from both the forum
 * and admin initializers so the widget renders on the forum AND previews in
 * the Forum Widgets layout editor.
 *
 * fof's Widget base class and Widgets extender are resolved here (at
 * initializer time) via the registry rather than top-level `ext:` imports, so
 * they are guaranteed to be loaded before the widget class is defined.
 */
export default function registerWidget(app: Application): void {
  const Widget = flarum.reg.get('fof-forum-widgets-core', 'common/components/Widget');
  const Widgets = flarum.reg.get('fof-forum-widgets-core', 'common/extend/Widgets');

  if (!Widget || !Widgets) {
    console.error('[linkrobins/countdown-widget] fof/forum-widgets-core not available; widget not registered.');
    return;
  }

  new Widgets()
    .add({
      key: 'linkrobins-countdown-widget',
      component: makeCountdownWidget(Widget),
      isDisabled: false,
      isUnique: true,
      placement: 'start_top',
      position: 1,
    })
    .extend(app, 'linkrobins-countdown-widget');
}
