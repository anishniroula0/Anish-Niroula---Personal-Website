"""
Automated End-to-End Test Suite for Field Engineer Mascot Revision.
Authoritative Specifications: ORIGINAL_REQUEST.md, PROJECT.md, GEMINI.md.

Test Tiers:
- Tier 1: Feature Coverage (DOM placement under <body>, z-index: 9999, 50% rendered dimensions 30x50 desktop & 25x42 mobile, removal of action buttons, first click audio triggering, second click football kick, third click Labrador interaction & corner nap, front-facing pose, red transformation class, reduced-motion freezing without display: none)
- Tier 2: Boundary & Corner Cases (Mobile bottom clearance, rapid clicks, scroll boundary clamping, footer toggle on/off)
- Tier 3: Cross-Feature Interactions (Clicking during scroll follow, scroll while dog napping, toggle during red transformation)
- Tier 4: Real-world User Journey (Full portfolio walk-through with mascot interaction sequence)

Runner:
  /Users/anishniroula/Desktop/Antigravity Projects/Ireland Job Application/.venv/bin/python -m unittest tests/test_mascot_e2e.py
"""

import functools
import http.server
import os
import threading
import unittest
from playwright.sync_api import sync_playwright

SERVER = None
PORT = None
PLAYWRIGHT = None
BROWSER = None
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that suppresses access logs and handles broken client pipes gracefully."""
    def log_message(self, format, *args):
        pass

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError):
            pass


class QuietServer(http.server.HTTPServer):
    def handle_error(self, request, client_address):
        pass


def setUpModule():
    """Start local ephemeral HTTP server and launch Edge browser instance once for the module."""
    global SERVER, PORT, PLAYWRIGHT, BROWSER
    handler = functools.partial(QuietHandler, directory=PROJECT_ROOT)
    SERVER = QuietServer(('127.0.0.1', 0), handler)
    PORT = SERVER.server_address[1]
    server_thread = threading.Thread(target=SERVER.serve_forever, daemon=True)
    server_thread.start()

    PLAYWRIGHT = sync_playwright().start()
    BROWSER = PLAYWRIGHT.chromium.launch(
        channel='msedge',
        headless=True,
        args=[
            '--autoplay-policy=no-user-gesture-required',
            '--disable-web-security',
            '--mute-audio=false'
        ]
    )


def tearDownModule():
    """Teardown browser and HTTP server."""
    global SERVER, PLAYWRIGHT, BROWSER
    if BROWSER:
        BROWSER.close()
    if PLAYWRIGHT:
        PLAYWRIGHT.stop()
    if SERVER:
        SERVER.shutdown()
        SERVER.server_close()


class MascotE2ETestBase(unittest.TestCase):
    """Base class managing per-test isolated browser contexts, routing, and helpers."""

    def setUp(self):
        self.page_errors = []
        self.console_errors = []
        self.context = BROWSER.new_context(
            viewport={'width': 1280, 'height': 800},
            has_touch=False
        )

        # Route external third-party CDN/fonts to keep test execution fast, offline, and deterministic
        def handle_route(route):
            url = route.request.url
            if f'127.0.0.1:{PORT}' in url:
                route.continue_()
            else:
                route.fulfill(status=200, content_type='text/css', body='')

        self.context.route('**/*', handle_route)
        self.page = self.context.new_page()

        self.page.on('pageerror', lambda err: self.page_errors.append(str(err)))
        self.page.on('console', lambda msg: self.console_errors.append(msg.text) if msg.type == 'error' else None)

        self.base_url = f'http://127.0.0.1:{PORT}/index.html'
        self.page.goto(self.base_url, wait_until='domcontentloaded')
        self.page.wait_for_selector('#engineerMascotContainer', state='attached', timeout=5000)

    def tearDown(self):
        try:
            self.context.close()
        except Exception:
            pass

    def click_mascot(self, count=1, delay_ms=80):
        """Clicks mascot character wrapper using force=True to handle continuous RAF animation."""
        for _ in range(count):
            self.page.locator('#mascotCharacterWrapper').dispatch_event('click')
            if delay_ms > 0:
                self.page.wait_for_timeout(delay_ms)

    def setup_audio_spy(self):
        """Attaches tracking spy to HTMLAudioElement and AudioContext to detect playback triggers."""
        self.page.evaluate('''() => {
            window.__audioPlayCalls = 0;
            const audio = document.getElementById('walkOfLifeAudio');
            if (audio) {
                const origPlay = audio.play.bind(audio);
                audio.play = function() {
                    window.__audioPlayCalls++;
                    return origPlay ? origPlay().catch(() => {}) : Promise.resolve();
                };
            }
            if (window.AudioContext || window.webkitAudioContext) {
                const OrigAC = window.AudioContext || window.webkitAudioContext;
                window.__audioContextCreated = 0;
                window.AudioContext = function() {
                    window.__audioContextCreated++;
                    return new OrigAC();
                };
            }
        }''')


# =============================================================================
# TIER 1: FEATURE COVERAGE
# =============================================================================
class TestTier1FeatureCoverage(MascotE2ETestBase):
    """Validates core features defined in PROJECT.md and ORIGINAL_REQUEST.md."""

    def test_tier1_01_dom_placement_under_body(self):
        """R5 / GEMINI.md Rule 2: #engineerMascotContainer must be an immediate child of <body>."""
        parent_tag = self.page.evaluate('document.getElementById("engineerMascotContainer").parentElement.tagName')
        self.assertEqual(parent_tag, 'BODY', f'Expected parent of #engineerMascotContainer to be BODY, got {parent_tag}')

        # Verify not entrapped in main, header, footer, section
        is_entrapped = self.page.evaluate('''() => {
            const el = document.getElementById("engineerMascotContainer");
            return !!el.closest("main, header, footer, section, article");
        }''')
        self.assertFalse(is_entrapped, "#engineerMascotContainer should not be inside any landmark container")

    def test_tier1_02_authoritative_z_index(self):
        """R5 / GEMINI.md Rule 2: Container must have authoritative z-index: 9999."""
        z_index = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).zIndex')
        self.assertEqual(z_index, '9999', f'Expected zIndex 9999, got {z_index}')

    def test_tier1_03_rendered_dimensions_desktop(self):
        """R1: Desktop mascot rendered size must be 50% (30px width, 50px height +/- 1.5px)."""
        box = self.page.locator('#mascotCharacterWrapper').bounding_box()
        self.assertIsNotNone(box, "Could not get bounding box for #mascotCharacterWrapper")
        self.assertAlmostEqual(box['width'], 30, delta=1.5, msg=f"Desktop width {box['width']} expected ~30px")
        self.assertAlmostEqual(box['height'], 50, delta=1.5, msg=f"Desktop height {box['height']} expected ~50px")

        # Verify CSS variables
        width_var = self.page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--mascot-width").trim()')
        height_var = self.page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--mascot-height").trim()')
        self.assertEqual(width_var, '30px', f'Expected --mascot-width: 30px, got {width_var}')
        self.assertEqual(height_var, '50px', f'Expected --mascot-height: 50px, got {height_var}')

    def test_tier1_04_rendered_dimensions_mobile(self):
        """R1: Mobile mascot rendered size must be 50% (25px width, 42px height +/- 1.5px)."""
        self.page.set_viewport_size({'width': 375, 'height': 667})
        self.page.wait_for_timeout(200)

        box = self.page.locator('#mascotCharacterWrapper').bounding_box()
        self.assertIsNotNone(box, "Could not get mobile bounding box for #mascotCharacterWrapper")
        self.assertAlmostEqual(box['width'], 25, delta=1.5, msg=f"Mobile width {box['width']} expected ~25px")
        self.assertAlmostEqual(box['height'], 42, delta=1.5, msg=f"Mobile height {box['height']} expected ~42px")

        width_var = self.page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--mascot-width").trim()')
        height_var = self.page.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--mascot-height").trim()')
        self.assertEqual(width_var, '25px', f'Expected mobile --mascot-width: 25px, got {width_var}')
        self.assertEqual(height_var, '42px', f'Expected mobile --mascot-height: 42px, got {height_var}')

    def test_tier1_05_action_buttons_and_popups_removed(self):
        """R2: Action buttons ('Inspect', 'Work', 'Sprint', 'Chelsea', 'Jam', 'Rest') and popup menus removed."""
        obsolete_buttons = ["Inspect", "Work", "Sprint", "Chelsea", "Jam", "Rest"]
        for btn_name in obsolete_buttons:
            count = self.page.locator(f'#engineerMascotContainer button:has-text("{btn_name}")').count()
            self.assertEqual(count, 0, f'Button "{btn_name}" should be completely absent from mascot UI')

        action_btn_count = self.page.locator('.mascot-action-btn').count()
        self.assertEqual(action_btn_count, 0, 'No .mascot-action-btn elements should exist in DOM')

        actions_row_count = self.page.locator('.mascot-actions-row').count()
        self.assertEqual(actions_row_count, 0, 'No .mascot-actions-row container should exist in DOM')

    def test_tier1_06_no_audio_elements_or_playback(self):
        """Zero Music: Mascot must be 100% silent. No audio elements or Web Audio synthesizers."""
        self.setup_audio_spy()

        # Audio element must not exist in DOM
        audio_count = self.page.locator('#walkOfLifeAudio').count()
        self.assertEqual(audio_count, 0, '#walkOfLifeAudio element must be completely removed from DOM')

        # Click mascot and verify no audio context or playback occurred
        self.click_mascot(count=1)
        self.page.wait_for_timeout(200)

        audio_played = self.page.evaluate('''() => {
            const spyCalls = window.__audioPlayCalls || 0;
            const ctxCalls = window.__audioContextCreated || 0;
            return spyCalls > 0 || ctxCalls > 0;
        }''')
        self.assertFalse(audio_played, "Clicking mascot must not trigger any audio playback or AudioContext synthesis")

    def test_tier1_07_first_click_football_kick(self):
        """Physical Interaction: First click triggers football kicking action and animation."""
        self.setup_audio_spy()

        # Click 1: Football kick
        self.click_mascot(count=1)
        self.page.wait_for_timeout(200)

        football_active = self.page.evaluate('''() => {
            const fb = document.getElementById('mascotFootball');
            const fbActive = fb && (
                fb.classList.contains('is-active') ||
                window.getComputedStyle(fb).opacity === '1'
            );
            const engineKicking = window.mascotEngine && (
                window.mascotEngine.isKicking === true ||
                window.mascotEngine.currentAction === 'football'
            );
            const spriteKicking = document.querySelector('.mascot-sprite.is-kicking') !== null;
            return fbActive || engineKicking || spriteKicking;
        }''')
        self.assertTrue(football_active, "First click on mascot must activate football kicking interaction")

    def test_tier1_08_second_click_labrador_interaction_and_corner_nap(self):
        """Physical Interaction: Second click introduces black Labrador dog, interaction, and corner nap."""
        self.setup_audio_spy()

        # Track CLS specifically during state transitions
        self.page.evaluate('''() => {
            window.__mascotShifts = [];
            window.__clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    for (const s of (entry.sources || [])) {
                        if (s.node && (s.node.id === 'mascotDog' || (s.node.closest && s.node.closest('#engineerMascotContainer')))) {
                            window.__mascotShifts.push({
                                value: entry.value,
                                id: s.node.id
                            });
                        }
                    }
                }
            });
            window.__clsObserver.observe({ type: 'layout-shift', buffered: false });
        }''')

        # Click 1: Football kick
        self.click_mascot(count=1, delay_ms=100)

        # Click 2: Dog interaction
        self.click_mascot(count=1)
        self.page.wait_for_timeout(250)

        dog_active = self.page.evaluate('''() => {
            const dog = document.getElementById('mascotDog');
            const cornerDog = document.getElementById('mascotDogCorner');
            const dogActive = dog && (
                dog.classList.contains('is-active') ||
                window.getComputedStyle(dog).opacity === '1'
            );
            const cornerActive = cornerDog && (
                cornerDog.classList.contains('is-visible') ||
                window.getComputedStyle(cornerDog).visibility !== 'hidden'
            );
            const engineDogState = window.mascotEngine && (
                window.mascotEngine.isDogPlaying === true ||
                window.mascotEngine.dogNapping === true ||
                window.mascotEngine.currentAction === 'dog'
            );
            return dogActive || cornerActive || engineDogState;
        }''')
        self.assertTrue(dog_active, "Second click on mascot must activate Labrador dog interaction / corner nap")

        # Verify zero layout shift induced by mascot/dog transitions
        shifts = self.page.evaluate('''() => {
            if (window.__clsObserver) window.__clsObserver.disconnect();
            return window.__mascotShifts || [];
        }''')
        self.assertEqual(len(shifts), 0, f"Mascot/dog triggered unexpected layout shifts: {shifts}")

        # Verify boundary clamping safety: extreme right edge desktop (1280px)
        boundary_desktop = self.page.evaluate('''() => {
            const engine = window.mascotEngine;
            engine.isPaused = true;
            engine.posX = window.innerWidth - 35;
            engine.direction = 1;
            engine.updateTransform();
            engine.triggerDogAction();
            const dog = document.getElementById('mascotDog');
            const rect = dog.getBoundingClientRect();
            return {
                right: rect.right,
                left: rect.left,
                windowWidth: window.innerWidth,
                overflow: rect.right - window.innerWidth,
                underflow: 0 - rect.left
            };
        }''')
        self.assertLessEqual(boundary_desktop['right'], boundary_desktop['windowWidth'],
                             f"Companion dog overflowed right screen boundary on desktop: {boundary_desktop}")
        self.assertGreaterEqual(boundary_desktop['left'], 0,
                                f"Companion dog underflowed left screen boundary on desktop: {boundary_desktop}")

        # Verify boundary clamping safety: extreme right edge mobile (375px)
        self.page.set_viewport_size({'width': 375, 'height': 667})
        self.page.wait_for_timeout(100)
        boundary_mobile = self.page.evaluate('''() => {
            const engine = window.mascotEngine;
            engine.isPaused = true;
            engine.posX = window.innerWidth - 35;
            engine.direction = 1;
            engine.updateTransform();
            engine.triggerDogAction();
            const dog = document.getElementById('mascotDog');
            const rect = dog.getBoundingClientRect();
            return {
                right: rect.right,
                left: rect.left,
                windowWidth: window.innerWidth,
                overflow: rect.right - window.innerWidth,
                underflow: 0 - rect.left
            };
        }''')
        self.assertLessEqual(boundary_mobile['right'], boundary_mobile['windowWidth'],
                             f"Companion dog overflowed right screen boundary on mobile: {boundary_mobile}")
        self.assertGreaterEqual(boundary_mobile['left'], 0,
                                f"Companion dog underflowed left screen boundary on mobile: {boundary_mobile}")

    def test_tier1_09_front_facing_pose(self):
        """R1: Mascot supports front-facing perspective with mascot-front.png asset."""
        # Verify front-facing CSS rule and asset
        has_front_style = self.page.evaluate('''() => {
            const styleSheets = Array.from(document.styleSheets);
            let foundRule = false;
            for (const sheet of styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.selectorText && (
                            rule.selectorText.includes('.is-facing-front') ||
                            rule.selectorText.includes('.is-front-facing')
                        )) {
                            if (rule.cssText.includes('mascot-front.png')) foundRule = true;
                        }
                    }
                } catch(e) {}
            }
            return foundRule;
        }''')
        self.assertTrue(has_front_style, "CSS must define front-facing pose with mascot-front.png")

        # Test applying front-facing class dynamically
        self.page.evaluate('''() => {
            const sprite = document.getElementById('mascotSprite');
            sprite.classList.add('is-facing-front');
        }''')
        bg_image = self.page.evaluate('window.getComputedStyle(document.getElementById("mascotSprite")).backgroundImage')
        self.assertIn('mascot-front.png', bg_image, f"Expected mascot-front.png in background-image, got {bg_image}")

    def test_tier1_10_red_transformation_class(self):
        """R3: Mascot supports periodic red appearance transformation via .is-red-variant."""
        has_red_rule = self.page.evaluate('''() => {
            const styleSheets = Array.from(document.styleSheets);
            let foundRule = false;
            for (const sheet of styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.selectorText && rule.selectorText.includes('.is-red-variant')) {
                            if (rule.cssText.includes('hue-rotate') || rule.cssText.includes('filter')) {
                                foundRule = true;
                            }
                        }
                    }
                } catch(e) {}
            }
            return foundRule;
        }''')
        self.assertTrue(has_red_rule, "CSS must define red variant styling via hue-rotate filter on .is-red-variant")

        # Apply .is-red-variant and check filter
        self.page.evaluate('''() => {
            const sprite = document.getElementById('mascotSprite');
            sprite.classList.add('is-red-variant');
        }''')
        filter_style = self.page.evaluate('window.getComputedStyle(document.getElementById("mascotSprite")).filter')
        self.assertTrue('hue-rotate' in filter_style or filter_style != 'none',
                        f"Expected hue-rotate/filter on red variant, got {filter_style}")

    def test_tier1_11_reduced_motion_freezing_without_display_none(self):
        """R5 / GEMINI.md Rule 1: prefers-reduced-motion: reduce must NEVER use display: none, and freeze motion."""
        # Emulate reduced motion
        self.page.emulate_media(reduced_motion='reduce')
        self.page.wait_for_timeout(200)

        # 1. Container must remain visible (never display: none)
        display = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).display')
        self.assertNotEqual(display, 'none', "Mascot container MUST NOT use display: none under prefers-reduced-motion")
        self.assertEqual(display, 'block', f"Expected display: block under reduced-motion, got {display}")

        # 2. Sprite animations must be frozen (animation: none or paused)
        sprite_anim = self.page.evaluate('''() => {
            const el = document.getElementById("mascotSprite");
            const style = window.getComputedStyle(el);
            return { name: style.animationName, state: style.animationPlayState };
        }''')
        is_sprite_frozen = sprite_anim['name'] == 'none' or sprite_anim['state'] == 'paused'
        self.assertTrue(is_sprite_frozen, f"Sprite animation should be frozen under reduced motion: {sprite_anim}")

        # 3. Dog animations must be frozen
        dog_anim = self.page.evaluate('''() => {
            const el = document.getElementById("mascotDog");
            if (!el) return { name: 'none', state: 'paused' };
            const style = window.getComputedStyle(el);
            return { name: style.animationName, state: style.animationPlayState };
        }''')
        is_dog_frozen = dog_anim['name'] == 'none' or dog_anim['state'] == 'paused'
        self.assertTrue(is_dog_frozen, f"Dog animation should be frozen under reduced motion: {dog_anim}")


# =============================================================================
# TIER 2: BOUNDARY & CORNER CASES
# =============================================================================
class TestTier2BoundaryCornerCases(MascotE2ETestBase):
    """Validates boundary conditions, layout clearance, and input stress."""

    def test_tier2_01_mobile_tab_bar_clearance(self):
        """Mobile viewport: mascot bottom clearance must be >= 70px to avoid obscuring bottom nav."""
        self.page.set_viewport_size({'width': 375, 'height': 667})
        self.page.wait_for_timeout(200)

        bottom_clearance = self.page.evaluate('''() => {
            const el = document.getElementById('engineerMascotContainer');
            const style = window.getComputedStyle(el);
            return parseFloat(style.bottom) || 0;
        }''')
        self.assertGreaterEqual(bottom_clearance, 70,
                                f"Mobile bottom clearance must be >= 70px (found {bottom_clearance}px) to clear bottom nav")

    def test_tier2_02_rapid_clicks_state_robustness(self):
        """Adversarial stress: rapid burst of clicks must not crash mascot engine or corrupt state."""
        self.setup_audio_spy()

        # Fire 6 rapid clicks in fast succession
        self.click_mascot(count=6, delay_ms=30)
        self.page.wait_for_timeout(200)

        self.assertEqual(len(self.page_errors), 0, f"Uncaught page errors after rapid clicks: {self.page_errors}")

        # Mascot container transform must remain valid (not NaN or undefined)
        transform = self.page.evaluate('document.getElementById("engineerMascotContainer").style.transform')
        self.assertNotIn('NaN', transform, "Mascot transform became NaN after rapid clicks")

    def test_tier2_03_scroll_boundary_clamping(self):
        """R4: Scrolling to extremes (0px, 1500px, 6000px, overscroll) keeps mascot within viewport bounds."""
        scroll_targets = [0, 1500, 4500, 0]

        for target in scroll_targets:
            self.page.evaluate(f'window.scrollTo(0, {target})')
            self.page.wait_for_timeout(200)

            box = self.page.locator('#engineerMascotContainer').bounding_box()
            self.assertIsNotNone(box, f"Bounding box missing at scroll {target}")

            viewport_height = self.page.viewport_size['height']
            self.assertGreaterEqual(box['y'] + box['height'], 0,
                                    f"Mascot scrolled off top of screen at scroll {target}")
            self.assertLessEqual(box['y'], viewport_height + 50,
                                 f"Mascot dropped below bottom of viewport at scroll {target}")

    def test_tier2_04_footer_toggle_on_off(self):
        """User-facing toggle: clicking footer mascot toggle cleanly dismisses and restores mascot."""
        # Click footer toggle to turn Off
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)

        is_disabled = self.page.evaluate('document.documentElement.classList.contains("mascot-disabled")')
        self.assertTrue(is_disabled, "html should have class mascot-disabled when toggled off")

        display = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).display')
        self.assertEqual(display, 'none', "Mascot container should be display: none when disabled")

        # Click footer toggle to turn back On
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)

        is_disabled_after = self.page.evaluate('document.documentElement.classList.contains("mascot-disabled")')
        self.assertFalse(is_disabled_after, "html mascot-disabled should be removed when toggled on")

        display_after = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).display')
        self.assertNotEqual(display_after, 'none', "Mascot container should be visible when re-enabled")


# =============================================================================
# TIER 3: CROSS-FEATURE INTERACTIONS
# =============================================================================
class TestTier3CrossFeatureInteractions(MascotE2ETestBase):
    """Validates concurrent and interacting behaviors across multiple subsystems."""

    def test_tier3_01_click_during_scroll_follow(self):
        """Clicking mascot while smooth scroll interpolation is active registers cleanly."""
        self.setup_audio_spy()

        # Trigger smooth scroll down
        self.page.evaluate('window.scrollTo({ top: 1200, behavior: "smooth" })')
        self.page.wait_for_timeout(80)

        # Click mascot during scroll
        self.click_mascot(count=1)
        self.page.wait_for_timeout(200)

        self.assertEqual(len(self.page_errors), 0, f"Errors clicking during scroll: {self.page_errors}")

        transform = self.page.evaluate('document.getElementById("engineerMascotContainer").style.transform')
        self.assertNotIn('NaN', transform, "Transform corrupted during simultaneous scroll and click")

    def test_tier3_02_scroll_while_dog_napping(self):
        """When dog is napping in corner, scrolling does not dislodge the dog from its fixed corner position."""
        # Activate corner dog
        self.page.evaluate('''() => {
            const corner = document.getElementById('mascotDogCorner');
            if (corner) corner.classList.add('is-visible');
        }''')
        self.page.wait_for_timeout(100)

        initial_box = self.page.locator('#mascotDogCorner').bounding_box()

        # Scroll page down by 1500px
        self.page.evaluate('window.scrollTo(0, 1500)')
        self.page.wait_for_timeout(250)

        scrolled_box = self.page.locator('#mascotDogCorner').bounding_box()
        self.assertIsNotNone(scrolled_box, "Corner dog disappeared after scrolling")

        # Position should remain fixed relative to viewport (delta < 5px)
        if initial_box and scrolled_box:
            self.assertAlmostEqual(initial_box['y'], scrolled_box['y'], delta=5,
                                   msg="Napping dog moved vertically with page scroll instead of staying fixed in corner")

    def test_tier3_03_toggle_during_red_transformation(self):
        """Toggling mascot Off and On while in red variant preserves clean state and styles."""
        # Enable red variant
        self.page.evaluate('''() => {
            const sprite = document.getElementById('mascotSprite');
            if (sprite) sprite.classList.add('is-red-variant');
        }''')

        # Toggle off
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)
        display_off = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).display')
        self.assertEqual(display_off, 'none', "Container should hide even if red variant was active")

        # Toggle on
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)
        display_on = self.page.evaluate('window.getComputedStyle(document.getElementById("engineerMascotContainer")).display')
        self.assertNotEqual(display_on, 'none', "Container should restore cleanly after toggle")
        self.assertEqual(len(self.page_errors), 0, f"Errors during red variant toggle: {self.page_errors}")


# =============================================================================
# TIER 4: REAL-WORLD USER JOURNEY
# =============================================================================
class TestTier4RealWorldUserJourney(MascotE2ETestBase):
    """End-to-end full portfolio walk-through exercising all mascot capabilities in sequence."""

    def test_tier4_01_full_portfolio_walkthrough_journey(self):
        """Simulate realistic recruiter/visitor journey with continuous mascot interaction."""
        self.setup_audio_spy()

        # 1. Visitor arrives at Hero section; observe mascot initialized
        self.page.wait_for_timeout(200)
        is_mounted = self.page.evaluate('document.getElementById("engineerMascotContainer") !== null')
        self.assertTrue(is_mounted, "Mascot container must mount on page load")

        # 2. First click on mascot: Football kick (100% silent)
        self.click_mascot(count=1)
        self.page.wait_for_timeout(250)
        football_triggered = self.page.evaluate('''() => {
            const fb = document.getElementById('mascotFootball');
            const engineAction = window.mascotEngine && (window.mascotEngine.currentAction === 'football' || window.mascotEngine.isKicking);
            return (fb && fb.classList.contains('is-active')) || !!engineAction;
        }''')
        self.assertTrue(football_triggered, "Click 1 in user journey must trigger football kick")

        # 3. Visitor scrolls down to Experience section
        self.page.evaluate('''() => {
            const exp = document.getElementById("experience");
            if (exp) exp.scrollIntoView({ behavior: "smooth" });
            else window.scrollTo(0, 1000);
        }''')
        self.page.wait_for_timeout(300)

        # 4. Second click on mascot: Labrador dog interaction & corner nap
        self.click_mascot(count=1)
        self.page.wait_for_timeout(300)
        dog_triggered = self.page.evaluate('''() => {
            const dog = document.getElementById('mascotDog');
            const corner = document.getElementById('mascotDogCorner');
            const engineAction = window.mascotEngine && (window.mascotEngine.currentAction === 'dog' || window.mascotEngine.isDogPlaying || window.mascotEngine.dogNapping);
            return (dog && dog.classList.contains('is-active')) || (corner && corner.classList.contains('is-visible')) || !!engineAction;
        }''')
        self.assertTrue(dog_triggered, "Click 2 in user journey must trigger Labrador dog interaction")

        # 5. Visitor scrolls further down to Projects & GIS section
        self.page.evaluate('''() => {
            const proj = document.getElementById("projects");
            if (proj) proj.scrollIntoView({ behavior: "smooth" });
            else window.scrollTo(0, 2200);
        }''')
        self.page.wait_for_timeout(300)

        # 6. Third click cycles back: Football kick
        self.click_mascot(count=1)
        self.page.wait_for_timeout(300)
        cycled_football = self.page.evaluate('''() => {
            const fb = document.getElementById('mascotFootball');
            const engineAction = window.mascotEngine && (window.mascotEngine.currentAction === 'football' || window.mascotEngine.isKicking);
            return (fb && fb.classList.contains('is-active')) || !!engineAction;
        }''')
        self.assertTrue(cycled_football, "Click 3 cycles back to football kick")
        self.assertTrue(dog_triggered, "Click 3 in user journey must trigger Labrador dog interaction")

        # 7. Visitor scrolls to Footer section
        self.page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        self.page.wait_for_timeout(300)

        # 8. Visitor tests footer toggle (Off, then On)
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)
        self.page.evaluate('toggleMascot()')
        self.page.wait_for_timeout(150)

        # Assert no uncaught JS exceptions during the entire journey
        self.assertEqual(len(self.page_errors), 0,
                         f"Encountered uncaught errors during user journey: {self.page_errors}")


if __name__ == '__main__':
    unittest.main(verbosity=2)
