<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Settings())
        ->default('linkrobins-countdown-widget.title',        '')
        ->default('linkrobins-countdown-widget.icon',         '')
        ->default('linkrobins-countdown-widget.target',       '')
        ->default('linkrobins-countdown-widget.timezone',     'UTC')
        ->default('linkrobins-countdown-widget.done_message', '')
        ->default('linkrobins-countdown-widget.link_url',     '')

        ->serializeToForum('linkrobinsCountdownTitle',       'linkrobins-countdown-widget.title')
        ->serializeToForum('linkrobinsCountdownIcon',        'linkrobins-countdown-widget.icon')
        ->serializeToForum('linkrobinsCountdownTarget',      'linkrobins-countdown-widget.target')
        ->serializeToForum('linkrobinsCountdownTimezone',    'linkrobins-countdown-widget.timezone')
        ->serializeToForum('linkrobinsCountdownDoneMessage', 'linkrobins-countdown-widget.done_message')
        ->serializeToForum('linkrobinsCountdownLinkUrl',     'linkrobins-countdown-widget.link_url'),
];
