<?php

/*
 * This file is part of linkrobins/countdown-widget.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace LinkRobins\CountdownWidget\Tests\integration;

use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * The extension is front-end only; its PHP side is the settings it sends to the browser and the assets the
 * forum compiles. These run weekly against the newest Flarum 2.x, so a core
 * change that breaks either fails here first.
 */
class ForumTest extends TestCase
{
    use RetrievesAuthorizedUsers;

    public function setUp(): void
    {
        parent::setUp();

        $this->extension('linkrobins-countdown-widget');
    }

    /**
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    private function forumAttributes(array $options = []): array
    {
        $response = $this->send($this->request('GET', '/api', $options));
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

    /**
     * "View forum" set to Members: guests lose the permission, members keep it.
     */
    private function makeForumPrivate(): void
    {
        $this->prepareDatabase([
            'users' => [$this->normalUser()],
            'group_permission' => [['permission' => 'viewForum', 'group_id' => 3]],
        ]);

        $this->setting('linkrobins-countdown-widget.title', 'Members-only launch');
        $this->setting('linkrobins-countdown-widget.target', '2027-01-01T00:00');

        // Boots the app, so the settings above must come first.
        $this->database()->table('group_permission')
            ->where('permission', 'viewForum')
            ->where('group_id', 2)
            ->delete();
    }

    #[Test]
    public function guests_get_no_countdown_on_a_private_forum(): void
    {
        $this->makeForumPrivate();

        $a = $this->forumAttributes();
        $this->assertFalse($a['canViewForum']);
        foreach (['Title', 'Description', 'Icon', 'Target', 'Timezone', 'DoneMessage', 'LinkUrl'] as $key) {
            $this->assertArrayNotHasKey('linkrobinsCountdown'.$key, $a, $key);
        }
    }

    #[Test]
    public function members_still_get_the_countdown_on_a_private_forum(): void
    {
        $this->makeForumPrivate();

        $a = $this->forumAttributes(['authenticatedAs' => 2]);
        $this->assertSame('Members-only launch', $a['linkrobinsCountdownTitle']);
        $this->assertSame('2027-01-01T00:00', $a['linkrobinsCountdownTarget']);
    }
}
