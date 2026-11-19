#!/usr/bin/env python3
"""
Automated E2E and functional tests for Electrical Engineering & Grid Calculators Suite.
Validates 4-discipline compact workbench, multi-standard selection (IEC, NBC 207, IS, BS 7671),
domestic appliance wire/MCB sizing, Earth Fault Loop Impedance (Zs), Transformer MVA sizing,
fault levels, Arc Flash (IEEE 1584), Cable Pulling Tension & SWBP, transmission SIL, and mobile layout.
"""

import http.server
import os
import socketserver
import threading
import time
import unittest
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class SilentHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

class TestCalculatorsSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        socketserver.TCPServer.allow_reuse_address = True
        cls.port = 8796
        handler = lambda *args, **kwargs: SilentHTTPHandler(*args, directory=WORKSPACE_DIR, **kwargs)
        cls.server = socketserver.TCPServer(("127.0.0.1", cls.port), handler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.5)

        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 900})
        self.page = self.context.new_page()

    def tearDown(self):
        self.context.close()

    def test_01_navigation_and_hash_routing(self):
        """Test switching to #calculators view updates DOM, hash, and title."""
        self.page.goto(f"http://127.0.0.1:{self.port}/")
        self.page.wait_for_load_state("domcontentloaded")

        calc_nav = self.page.locator("a.nav-pill[data-target='calculators']")
        self.assertTrue(calc_nav.is_visible())
        calc_nav.click()
        self.page.wait_for_timeout(300)

        self.assertIn("#calculators", self.page.url)
        view_el = self.page.locator("#view-calculators")
        self.assertTrue(view_el.is_visible())
        self.assertIn("active", view_el.get_attribute("class"))
        self.assertIn("Electrical Engineering Calculators", self.page.title())

    def test_02_regulatory_standard_switching(self):
        """Test switching between IEC, NBC 207 (Nepal), IS, and BS 7671 updates citation badge and rules."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        badge = self.page.locator("#activeStdBadgeText")
        self.assertIn("IEC", badge.inner_text())

        # Click NBC 207 standard pill
        self.page.locator("button.calc-std-pill[data-std='NBC']").click()
        self.page.wait_for_timeout(200)

        self.assertIn("NBC 207", badge.inner_text())

        # Switch to building tab to inspect domestic compliance badge
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)

        m1_badge = self.page.locator("#m1_complianceBadge")
        self.assertIn("NBC 207", m1_badge.inner_text())

    def test_03_module0_energy_power_conversion(self):
        """Test Module 0 converts 10 kW for 24 hours into 240 kWh and 864 MJ."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='protection']").click()
        self.page.wait_for_timeout(200)

        self.page.fill("#m0_powerVal", "10")
        self.page.select_option("#m0_powerUnit", "kW")
        self.page.fill("#m0_durationVal", "24")
        self.page.select_option("#m0_durationUnit", "hours")
        self.page.wait_for_timeout(200)

        kwh = self.page.locator("#m0_res_kwh").inner_text()
        mj = self.page.locator("#m0_res_mj").inner_text()
        hp = self.page.locator("#m0_res_hp").inner_text()

        self.assertEqual(kwh, "240.0 kWh")
        self.assertEqual(mj, "864.0 MJ")
        self.assertIn("13.41 hp", hp)

    def test_04_module1_domestic_appliance_wire_mcb(self):
        """Test Module 1 appliance preset (1.5 Ton AC) calculates current, 2.5 mm² wire, and 16A MCB."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)

        self.page.locator("button:has-text('1.5 Ton AC')").click()
        self.page.wait_for_timeout(200)

        current = self.page.locator("#m1_res_current").inner_text()
        wire = self.page.locator("#m1_res_wire").inner_text()
        mcb = self.page.locator("#m1_res_mcb").inner_text()

        self.assertEqual(current, "9.21 A")
        self.assertEqual(wire, "2.5 mm² Cu")
        self.assertIn("16A", mcb)

    def test_05_module12_earth_fault_loop_impedance(self):
        """Test Module 12 calculates Zs, touch voltage disconnection check, and compliance banner."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)

        self.page.fill("#m12_u0", "230")
        self.page.fill("#m12_ze", "0.35")
        self.page.fill("#m12_length", "30")
        self.page.select_option("#m12_phase", "2.5")
        self.page.select_option("#m12_cpc", "1.5")
        self.page.select_option("#m12_mcb", "16_B")
        self.page.wait_for_timeout(200)

        zs = self.page.locator("#m12_res_zs").inner_text()
        ia = self.page.locator("#m12_res_ia").inner_text()
        banner = self.page.locator("#m12_statusBanner").inner_text()

        self.assertIn("Ω", zs)
        self.assertIn("A", ia)
        self.assertIn("COMPLIANT", banner)

    def test_06_module4_transformer_sizing(self):
        """Test Module 4 calculates 63 MVA transformer for 50 MVA load with Primary/Secondary labels."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='transformer']").click()
        self.page.wait_for_timeout(200)

        content = self.page.locator(".calc-card[data-category='transformer']").first.inner_text()
        self.assertIn("Primary Voltage", content)
        self.assertIn("Secondary Voltage", content)
        self.assertNotIn("Primary V_1", content)
        self.assertNotIn("Secondary V_2", content)

        self.page.fill("#m4_v1", "132")
        self.page.fill("#m4_v2", "33")
        self.page.fill("#m4_loadMva", "50")
        self.page.fill("#m4_margin", "20")
        self.page.wait_for_timeout(200)

        rating = self.page.locator("#m4_res_rating").inner_text()
        ihv = self.page.locator("#m4_res_ihv").inner_text()
        ilv = self.page.locator("#m4_res_ilv").inner_text()

        self.assertEqual(rating, "63.0 MVA")
        self.assertEqual(ihv, "275.6 A")
        self.assertEqual(ilv, "1102.2 A")

    def test_07_module5_busbar_fault_level(self):
        """Test Module 5 calculates IEC 60909 symmetrical fault current and peak making current."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='transformer']").click()
        self.page.wait_for_timeout(200)

        self.page.fill("#m5_vkv", "33")
        self.page.fill("#m5_txMva", "63")
        self.page.fill("#m5_zpct", "12.5")
        self.page.fill("#m5_gridMva", "2500")
        self.page.wait_for_timeout(200)

        isc = self.page.locator("#m5_res_isc").inner_text()
        ipeak = self.page.locator("#m5_res_ipeak").inner_text()

        self.assertEqual(isc, "7.34 kA rms")
        self.assertEqual(ipeak, "18.71 kA peak")

    def test_08_module13_switchgear_arc_flash(self):
        """Test Module 13 calculates IEEE 1584 arc flash incident energy and PPE category."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='transformer']").click()
        self.page.wait_for_timeout(200)

        self.page.fill("#m13_vkv", "11")
        self.page.fill("#m13_ifault", "25")
        self.page.fill("#m13_time", "0.15")
        self.page.fill("#m13_dist", "610")
        self.page.wait_for_timeout(200)

        energy = self.page.locator("#m13_res_energy").inner_text()
        cat = self.page.locator("#m13_res_category").inner_text()

        self.assertIn("cal/cm²", energy)
        self.assertTrue(len(cat) > 0)

    def test_09_module14_cable_pulling_tension_swbp(self):
        """Test Module 14 calculates cable pulling straight tension, bend tension, and SWBP."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='transmission']").click()
        self.page.wait_for_timeout(200)

        self.page.fill("#m14_weight", "12")
        self.page.fill("#m14_lstraight", "150")
        self.page.fill("#m14_radius", "1.5")
        self.page.fill("#m14_angle", "90")
        self.page.wait_for_timeout(200)

        tension = self.page.locator("#m14_res_tension").inner_text()
        swbp = self.page.locator("#m14_res_swbp").inner_text()

        self.assertIn("kN", tension)
        self.assertIn("kN/m", swbp)

    def test_10_module8_transmission_sil(self):
        """Test Module 8 calculates 132 kV surge impedance loading."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='transmission']").click()
        self.page.wait_for_timeout(200)

        self.page.select_option("#m8_vkv", "132")
        self.page.fill("#m8_zc", "380")
        self.page.fill("#m8_len", "85")
        self.page.wait_for_timeout(200)

        sil = self.page.locator("#m8_res_sil").inner_text()
        self.assertEqual(sil, "45.85 MW")

    def test_11_module11_nbc207_compliance(self):
        """Test Module 11 calculates Nepal National Building Code maximum demand."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)

        self.page.select_option("#m11_type", "residential")
        self.page.fill("#m11_lightKw", "1.8")
        self.page.fill("#m11_socketKw", "4.0")
        self.page.fill("#m11_hvacKw", "3.5")
        self.page.wait_for_timeout(200)

        demand = self.page.locator("#m11_res_demandKw").inner_text()
        self.assertEqual(demand, "5.64 kW")

    def test_12_category_filter(self):
        """Test category filters toggle visibility of 4 disciplines cleanly."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        # Building tab
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)
        building_cards = self.page.locator(".calc-card[data-category='building']")
        transformer_cards = self.page.locator(".calc-card[data-category='transformer']")

        self.assertTrue(building_cards.first.is_visible())
        self.assertFalse(transformer_cards.first.is_visible())

        # All tab
        self.page.locator("button.calc-filter-pill[data-cat='all']").click()
        self.page.wait_for_timeout(200)
        self.assertTrue(transformer_cards.first.is_visible())
        self.assertTrue(building_cards.first.is_visible())

    def test_13_mobile_viewport_and_bottom_nav(self):
        """Test mobile navigation bar displays 6 columns cleanly on iPhone viewport (390x844)."""
        mobile_context = self.browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = mobile_context.new_page()
        mobile_page.goto(f"http://127.0.0.1:{self.port}/")
        mobile_page.wait_for_load_state("domcontentloaded")

        pills = mobile_page.locator("nav[aria-label='Mobile Navigation'] a.mobile-pill")
        self.assertEqual(pills.count(), 6)

        nav_box = mobile_page.locator("nav[aria-label='Mobile Navigation']").bounding_box()
        self.assertIsNotNone(nav_box)
        self.assertLessEqual(nav_box['height'], 68, f"Mobile nav height was {nav_box['height']}, must be <= 68px (horizontal bar, not vertical stack)")

        calc_pill = mobile_page.locator("nav[aria-label='Mobile Navigation'] a[data-target='calculators']")
        self.assertTrue(calc_pill.is_visible())
        calc_pill.click()
        mobile_page.wait_for_timeout(300)

        self.assertIn("#calculators", mobile_page.url)
        self.assertTrue(mobile_page.locator("#view-calculators").is_visible())

        mobile_context.close()

if __name__ == "__main__":
    unittest.main()
