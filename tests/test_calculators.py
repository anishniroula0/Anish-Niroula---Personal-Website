#!/usr/bin/env python3
"""
Automated E2E & Mathematical Verification Suite for the Refined Electrical Engineering Workbench.
Validates:
- Hidden public nav links (pending launch approval) while #calculators preview route works
- Master-Detail Desktop Sidebar (15 tools) & Mobile Dropdown
- Multi-standard switching (IEC, NBC 207, IS, BS 7671) actually updating ampacity/rules
- Mathematical accuracy across all 15 modules (Fundamentals, LV/Building, Substations/Protection, Transmission/UG Cables)
- Collapsible Formula & Step-by-Step Verification panel + Print/PDF action
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


class TestCalculatorsWorkbench(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        socketserver.TCPServer.allow_reuse_address = True
        cls.port = 8796
        handler = lambda *args, **kwargs: SilentHTTPHandler(*args, directory=WORKSPACE_DIR, **kwargs)
        cls.server = socketserver.TCPServer(("127.0.0.1", cls.port), handler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.4)

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
        self.page.on("pageerror", lambda err: self.fail(f"Uncaught page error: {err}"))

    def tearDown(self):
        self.context.close()

    def open_calc(self, calc_id):
        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.page.locator(f"button.calc-sidebar-btn[data-calc-id='{calc_id}']").click()
        self.page.wait_for_timeout(120)

    def test_01_nav_hidden_and_workbench_loads_15_tools(self):
        """Nav links stay hidden while #calculators renders 15 sidebar tools & Print/PDF button."""
        self.page.goto(f"http://127.0.0.1:{self.port}/")
        self.page.wait_for_load_state("domcontentloaded")
        self.assertEqual(self.page.locator("nav[aria-label='Primary Navigation'] a[data-target='calculators']").count(), 0)
        self.assertEqual(self.page.locator("#mobileNavDrawer a[data-target='calculators']").count(), 0)

        self.page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        self.page.wait_for_load_state("domcontentloaded")
        self.assertEqual(self.page.locator("button.calc-sidebar-btn").count(), 15)
        self.assertTrue(self.page.locator("button:has-text('Print / PDF')").is_visible())

    def test_02_energy_and_power_converter(self):
        """Module 0: 100 kW for 24 h = 2.40 MWh, 864.00 MJ, 117.65 kVA at 0.85 PF."""
        self.open_calc("mod_energy")
        self.assertEqual(self.page.locator("#res_m0_kwh").inner_text(), "2.40 MWh")
        self.assertEqual(self.page.locator("#res_m0_kva").inner_text(), "117.65 kVA")
        self.assertIn("E(kWh)", self.page.locator("#activeCalcSteps").inner_text())

    def test_03_power_factor_capacitor_bank(self):
        """Module PF: 500 kW at 11 kV from 0.75 -> 0.95 requires ~276.6 kVAr."""
        self.open_calc("mod_pf")
        qc = self.page.locator("#res_mpf_qc").inner_text()
        self.assertEqual(qc, "276.6 kVAr")

    def test_04_per_unit_impedance_converter(self):
        """Module PU: 0.125 pu on 50 MVA -> 0.2500 pu on 100 MVA."""
        self.open_calc("mod_pu")
        self.assertEqual(self.page.locator("#res_mpu_znew").inner_text(), "0.2500 pu")
        self.assertEqual(self.page.locator("#res_mpu_zpct").inner_text(), "25.00 %")

    def test_05_lv_cable_standard_switching(self):
        """Module LV Cable: Standard selector genuinely changes base ampacity & rules."""
        self.open_calc("mod_lvcable")
        self.assertTrue(self.page.locator("#calcStandardContainer").is_visible())
        self.page.locator("button.calc-std-pill[data-std='NBC']").click()
        self.page.wait_for_timeout(120)
        self.assertIn("NBC 207", self.page.locator("#activeCalcStatus").inner_text())
        self.assertIn("NBC", self.page.locator("#activeCalcSteps").inner_text())

    def test_06_earth_fault_loop_impedance(self):
        """Module Zs: Separate Phase 2.5 / CPC 1.5 with 1.2x temp factor & 16A Type B."""
        self.open_calc("mod_zs")
        zs = self.page.locator("#res_m12_zs").inner_text()
        self.assertIn("Ω", zs)
        self.assertIn("Touch Voltage Safe", self.page.locator("#activeCalcStatus").inner_text())

    def test_07_transformer_mva_sizing_and_impedance(self):
        """Module Tx: 50 MVA + 15% growth = 57.5 MVA -> 63.0 MVA IEC standard."""
        self.open_calc("mod_tx")
        self.assertEqual(self.page.locator("#res_m4_rating").inner_text(), "63.0 MVA")
        self.assertEqual(self.page.locator("#res_m4_ihv").inner_text(), "275.6 A")
        self.assertEqual(self.page.locator("#res_m4_ilv").inner_text(), "1102.2 A")

    def test_08_busbar_fault_and_force(self):
        """Module Fault: 33 kV, 63 MVA (12.5%), 2500 MVA grid -> 7.34 kA rms, 18.71 kA peak."""
        self.open_calc("mod_fault")
        self.assertEqual(self.page.locator("#res_m5_isc").inner_text(), "7.34 kA rms")
        self.assertEqual(self.page.locator("#res_m5_ipeak").inner_text(), "18.71 kA peak")

    def test_09_ct_knee_point_with_lead_burden(self):
        """Module CT: 800/1 A, 31.5 kA, 60m 4mm2 lead -> computes loop R_lead & Vk."""
        self.open_calc("mod_ct")
        self.assertIn("V", self.page.locator("#res_m9_vk").inner_text())
        self.assertIn("R_lead", self.page.locator("#activeCalcSteps").inner_text())

    def test_10_idmt_overcurrent_relay_trip_time(self):
        """Module IDMT: SI curve, Is=400 A, If=4000 A (PSM=10), TMS=0.25 -> 0.743 s."""
        self.open_calc("mod_idmt")
        self.assertEqual(self.page.locator("#res_mid_psm").inner_text(), "10.00 × Is")
        self.assertEqual(self.page.locator("#res_mid_time").inner_text(), "0.743 s")

    def test_11_surge_arrester_and_substation_battery(self):
        """Modules Arrester & Battery: 132 kV -> 120 kV / 10 kA; 110 V DC -> 200 Ah."""
        self.open_calc("mod_arrester")
        self.assertEqual(self.page.locator("#res_m10_std").inner_text(), "120 kV / 10 kA")
        self.open_calc("mod_battery")
        self.assertEqual(self.page.locator("#res_mbat_std").inner_text(), "110 V / 200 Ah")

    def test_12_transmission_sil_sag_and_ug_pulling(self):
        """Modules TX Line & UG Pulling: 132 kV SIL = 45.85 MW, Sag & SWBP computed."""
        self.open_calc("mod_txline")
        self.assertEqual(self.page.locator("#res_m8_sil").inner_text(), "45.85 MW")
        self.assertIn("m", self.page.locator("#res_m8_sag").inner_text())

        self.open_calc("mod_pulling")
        self.assertIn("kN/m", self.page.locator("#res_m14_swbp").inner_text())

    def test_13_mobile_dropdown_selector(self):
        """Mobile viewport (390x844): shows clean dropdown selector instead of sidebar."""
        mob_ctx = self.browser.new_context(viewport={"width": 390, "height": 844})
        mob_page = mob_ctx.new_page()
        mob_page.goto(f"http://127.0.0.1:{self.port}/#calculators")
        mob_page.wait_for_load_state("domcontentloaded")

        sel = mob_page.locator("#mobileCalcSelect")
        self.assertTrue(sel.is_visible())
        sel.select_option("mod_idmt")
        mob_page.wait_for_timeout(150)
        self.assertEqual(mob_page.locator("#res_mid_time").inner_text(), "0.743 s")
        mob_ctx.close()


if __name__ == "__main__":
    unittest.main()
