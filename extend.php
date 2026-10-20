<?php

use Flarum\Api\Context;
use Flarum\Api\Resource\ForumResource;
use Flarum\Api\Schema;
use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

// Forum attribute => setting key. These reach the browser in the forum data.
$attributes = [
    'linkrobinsCountdownTitle'       => 'linkrobins-countdown-widget.title',
    'linkrobinsCountdownDescription' => 'linkrobins-countdown-widget.description',
    'linkrobinsCountdownIcon'        => 'linkrobins-countdown-widget.icon',
    'linkrobinsCountdownTarget'      => 'linkrobins-countdown-widget.target',
    'linkrobinsCountdownTimezone'    => 'linkrobins-countdown-widget.timezone',
    'linkrobinsCountdownDoneMessage' => 'linkrobins-countdown-widget.done_message',
    'linkrobinsCountdownLinkUrl'     => 'linkrobins-countdown-widget.link_url',
];

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
        ->default('linkrobins-countdown-widget.description',  '')
        ->default('linkrobins-countdown-widget.icon',         '')
        ->default('linkrobins-countdown-widget.target',       '')
        ->default('linkrobins-countdown-widget.timezone',     'UTC')
        ->default('linkrobins-countdown-widget.done_message', '')
        ->default('linkrobins-countdown-widget.link_url',     ''),

    // Only visitors who can view the forum get the countdown, so on a private
    // forum (guests without "View forum") a logged-out visitor sees none of it.
    (new Extend\ApiResource(ForumResource::class))
        ->fields(fn () => array_map(
            fn (string $attribute, string $key) => Schema\Str::make($attribute)
                ->get(fn () => (string) resolve(SettingsRepositoryInterface::class)->get($key))
                ->visible(fn ($forum, Context $context) => $context->getActor()->can('viewForum')),
            array_keys($attributes),
            $attributes
        )),
];
