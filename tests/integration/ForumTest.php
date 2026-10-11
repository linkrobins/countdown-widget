<?php

/*
 * This file is part of linkrobins/countdown-widget.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace LinkRobins\CountdownWidget\Tests\integration;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * The extension is front-end only; its PHP side is the settings it sends to the browser and the assets the
 * forum compiles. These run weekly against the newest Flarum 2.x, so a core
 * change that breaks either fails here first.
 */
class ForumTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        $this->extension('linkrobins-countdown-widget');
    }

    /** @return array<string, mixed> */
    private function forumAttributes(): array
    {
        $response = $this->send($this->request('GET', '/api'));
        $this->assertEquals(200, $response->getStatusCode());

        return json_decode($response->getBody()->getContents(), true)['data']['attributes'];
    }

    #[Test]
    public function the_forum_page_loads_with_the_extension_enabled(): void
    {
        // Rendering the forum compiles the extension's JS and LESS into the
        // forum assets; a stylesheet that does not compile fails the page.
        $response = $this->send($this->request('GET', '/'));

        $this->assertEquals(200, $response->getStatusCode());
    }

    #[Test]
    public function the_defaults_reach_the_forum(): void
    {
        $a = $this->forumAttributes();

        foreach (['Title', 'Description', 'Icon', 'Target', 'DoneMessage', 'LinkUrl'] as $key) {
            $this->assertSame('', $a['linkrobinsCountdown'.$key], $key);
        }
        $this->assertSame('UTC', $a['linkrobinsCountdownTimezone']);
    }

    #[Test]
    public function the_configured_countdown_is_sent_as_is(): void
    {
        $this->setting('linkrobins-countdown-widget.title', 'Launch');
        $this->setting('linkrobins-countdown-widget.target', '2027-01-01T00:00');
        $this->setting('linkrobins-countdown-widget.timezone', 'America/New_York');
        $this->setting('linkrobins-countdown-widget.link_url', 'https://example.com/launch');

        $a = $this->forumAttributes();
        $this->assertSame('Launch', $a['linkrobinsCountdownTitle']);
        $this->assertSame('2027-01-01T00:00', $a['linkrobinsCountdownTarget']);
        $this->assertSame('America/New_York', $a['linkrobinsCountdownTimezone']);
        $this->assertSame('https://example.com/launch', $a['linkrobinsCountdownLinkUrl']);
    }
}
