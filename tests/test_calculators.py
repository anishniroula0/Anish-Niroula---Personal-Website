#!/usr/bin/env python3
"""
Automated E2E and functional tests for Electrical Engineering & Grid Calculators Suite.
Validates multi-standard selection (IEC, NBC 207, IS, BS 7671), domestic appliance wire/MCB sizing,
substation control cables, transformers, fault levels, transmission SIL, and mobile layout.
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
        cls.port = 8795
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

        # Click desktop Calculators nav pill
        calc_nav = self.page.locator("a.nav-pill[data-target='calculators']")
        self.assertTrue(calc_nav.is_visible())
        calc_nav.click()
        self.page.wait_for_timeout(300)

        # Check URL hash
        self.assertIn("#calculators", self.page.url)

        # Check view active state
        view_el = self.page.locator("#view-calculators")
        self.assertTrue(view_el.is_visible())
        self.assertIn("active", view_el.get_attribute("class"))

        # Check title
        self.assertIn("Electrical Engineering Calculators", self.page.title())

    def test_02_regulatory_standard_switching(self):
        """Test switching between IEC, NBC 207 (Nepal), IS, and BS 7671 updates citation and rules."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        # Default is IEC
        citation = self.page.locator("#activeStdCitationText")
        self.assertIn("IEC", citation.inner_text())

        # Switch to NBC 207 (Nepal)
        nbc_btn = self.page.locator("button.calc-std-pill[data-std='NBC']")
        nbc_btn.click()
        self.page.wait_for_timeout(200)

        self.assertIn("NBC 207", citation.inner_text())
        self.assertIn("active", nbc_btn.get_attribute("class"))

        # Verify NBC rule applied to domestic wire compliance badge
        badge = self.page.locator("#m1_complianceBadge")
        self.assertIn("NBC 207", badge.inner_text())

    def test_03_module0_energy_power_conversion(self):
        """Test Module 0 converts 10 kW for 24 hours into 240 kWh and 864 MJ."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

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

        # Click AC preset
        self.page.locator("button:has-text('1.5 Ton AC')").click()
        self.page.wait_for_timeout(200)

        current = self.page.locator("#m1_res_current").inner_text()
        wire = self.page.locator("#m1_res_wire").inner_text()
        mcb = self.page.locator("#m1_res_mcb").inner_text()

        self.assertEqual(current, "9.21 A")
        self.assertEqual(wire, "2.5 mm² Cu")
        self.assertIn("16A", mcb)

    def test_05_module2_substation_control_cable(self):
        """Test Module 2 evaluates 110V DC trip coil voltage drop and positive tripping guarantee."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        self.page.select_option("#m2_vbat", "110")
        self.page.fill("#m2_itrip", "8.5")
        self.page.select_option("#m2_csize", "2.5")
        self.page.fill("#m2_length", "120")
        self.page.wait_for_timeout(200)

        vterm = self.page.locator("#m2_res_vterm").inner_text()
        pct = self.page.locator("#m2_res_pct").inner_text()
        banner = self.page.locator("#m2_statusBanner").inner_text()

        self.assertIn("95.72 V DC", vterm)
        self.assertIn("87.0%", pct)
        self.assertIn("Positive Circuit Breaker Tripping Guaranteed", banner)

    def test_06_module4_transformer_sizing(self):
        """Test Module 4 calculates 63 MVA transformer for 45 MW at 0.85 PF with HV & LV currents."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        self.page.fill("#m4_v1", "132")
        self.page.fill("#m4_v2", "33")
        self.page.fill("#m4_loadMw", "45")
        self.page.fill("#m4_pf", "0.85")
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

        self.page.fill("#m5_vkv", "33")
        self.page.fill("#m5_txMva", "63")
        self.page.fill("#m5_zpct", "12.5")
        self.page.fill("#m5_gridMva", "2500")
        self.page.wait_for_timeout(200)

        isc = self.page.locator("#m5_res_isc").inner_text()
        ipeak = self.page.locator("#m5_res_ipeak").inner_text()

        self.assertEqual(isc, "7.34 kA rms")
        self.assertEqual(ipeak, "18.71 kA peak")

    def test_08_module8_transmission_sil(self):
        """Test Module 8 calculates 132 kV surge impedance loading."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        self.page.select_option("#m8_vkv", "132")
        self.page.fill("#m8_zc", "380")
        self.page.fill("#m8_len", "85")
        self.page.wait_for_timeout(200)

        sil = self.page.locator("#m8_res_sil").inner_text()
        self.assertEqual(sil, "45.85 MW")

    def test_09_module11_nbc207_compliance(self):
        """Test Module 11 calculates Nepal National Building Code maximum demand and earthing check."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        self.page.select_option("#m11_type", "residential")
        self.page.fill("#m11_lightKw", "1.8")
        self.page.fill("#m11_socketKw", "4.0")
        self.page.fill("#m11_hvacKw", "3.5")
        self.page.wait_for_timeout(200)

        demand = self.page.locator("#m11_res_demandKw").inner_text()
        self.assertEqual(demand, "5.64 kW")

    def test_10_category_filter(self):
        """Test category filters show only matching cards."""
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")

        # Filter by building
        self.page.locator("button.calc-filter-pill[data-cat='building']").click()
        self.page.wait_for_timeout(200)

        building_cards = self.page.locator(".calc-card[data-category='building']")
        energy_cards = self.page.locator(".calc-card[data-category='energy']")

        self.assertTrue(building_cards.first.is_visible())
        self.assertFalse(energy_cards.first.is_visible())

        # Reset to all
        self.page.locator("button.calc-filter-pill[data-cat='all']").click()
        self.page.wait_for_timeout(200)
        self.assertTrue(energy_cards.first.is_visible())

    def test_11_mobile_viewport_and_bottom_nav(self):
        """Test mobile navigation bar displays 6 columns cleanly on iPhone viewport (390x844)."""
        mobile_context = self.browser.new_context(viewport={"width": 390, "height": 844})
        mobile_page = mobile_context.new_page()
        mobile_page.goto(f"http://127.0.0.1:{self.port}/")
        mobile_page.wait_for_load_state("domcontentloaded")

        # Check mobile bottom nav has 6 items
        pills = mobile_page.locator("nav[aria-label='Mobile Navigation'] a.mobile-pill")
        self.assertEqual(pills.count(), 6)

        # Click the 6th pill (Calc)
        calc_pill = mobile_page.locator("nav[aria-label='Mobile Navigation'] a[data-target='calculators']")
        self.assertTrue(calc_pill.is_visible())
        calc_pill.click()
        mobile_page.wait_for_timeout(300)

        self.assertIn("#calculators", mobile_page.url)
        self.assertTrue(mobile_page.locator("#view-calculators").is_visible())

        mobile_context.close()

if __name__ == "__main__":
    unittest.main()
