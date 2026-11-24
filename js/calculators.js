/* =========================================================================
   ELECTRICAL ENGINEERING & GRID COMPUTATION WORKBENCH (400 V - 400 kV)
   Master-Detail Single-Calculator Workspace • Verified Engineering Formulas
   Standards: IEC 60364 / 60909 / 60865 / 61869 / 60255 / 60099, NBC 207, IS 732, BS 7671, IEEE 485 / 525
   ========================================================================= */

window.currentCalcStandard = 'IEC';
window.activeCalcId = 'mod_energy';

const STD_INFO = {
  IEC: { label: 'IEC 60364 / IEC 60909', lvDropMax: 3.0, lvPowerDropMax: 5.0, tempMult: 1.2, earthingLimit: 5.0, badge: '🌐 IEC' },
  NBC: { label: 'NBC 207:2003 / NEA (Nepal)', lvDropMax: 3.0, lvPowerDropMax: 5.0, tempMult: 1.2, earthingLimit: 5.0, badge: '🇳🇵 NBC 207' },
  IS:  { label: 'IS 732 / IS 3043 (India)', lvDropMax: 3.0, lvPowerDropMax: 5.0, tempMult: 1.2, earthingLimit: 5.0, badge: '🇮🇳 IS' },
  BS:  { label: 'BS 7671 18th Ed (UK)', lvDropMax: 3.0, lvPowerDropMax: 5.0, tempMult: 1.2, earthingLimit: 5.0, badge: '🇬🇧 BS 7671' }
};

// Standard-aligned LV/MV PVC/XLPE copper ampacity table (Reference Method C / B)
const LV_COPPER_TABLE = [
  { size: 1.5, ampIEC: 17.5, ampBS: 17.5, ampIS: 15, ampNBC: 15 },
  { size: 2.5, ampIEC: 24,   ampBS: 24,   ampIS: 21, ampNBC: 21 },
  { size: 4.0, ampIEC: 32,   ampBS: 32,   ampIS: 28, ampNBC: 28 },
  { size: 6.0, ampIEC: 41,   ampBS: 41,   ampIS: 36, ampNBC: 36 },
  { size: 10,  ampIEC: 57,   ampBS: 57,   ampIS: 50, ampNBC: 50 },
  { size: 16,  ampIEC: 76,   ampBS: 76,   ampIS: 68, ampNBC: 68 },
  { size: 25,  ampIEC: 101,  ampBS: 101,  ampIS: 89, ampNBC: 89 },
  { size: 35,  ampIEC: 125,  ampBS: 125,  ampIS: 110, ampNBC: 110 },
  { size: 50,  ampIEC: 151,  ampBS: 151,  ampIS: 134, ampNBC: 134 },
  { size: 70,  ampIEC: 192,  ampBS: 192,  ampIS: 171, ampNBC: 171 },
  { size: 95,  ampIEC: 232,  ampBS: 232,  ampIS: 207, ampNBC: 207 },
  { size: 120, ampIEC: 269,  ampBS: 269,  ampIS: 239, ampNBC: 239 },
  { size: 150, ampIEC: 309,  ampBS: 309,  ampIS: 272, ampNBC: 272 },
  { size: 185, ampIEC: 353,  ampBS: 353,  ampIS: 310, ampNBC: 310 },
  { size: 240, ampIEC: 415,  ampBS: 415,  ampIS: 364, ampNBC: 364 },
  { size: 300, ampIEC: 477,  ampBS: 477,  ampIS: 419, ampNBC: 419 }
];

// Complete 230V 0.4s Disconnection Maximum Zs Table (BS 7671 / IEC 60364, Cmin = 0.95)
const MAX_ZS_230V = {
  '6_B': 7.28,  '10_B': 4.37, '16_B': 2.73, '20_B': 2.19, '25_B': 1.75, '32_B': 1.37, '40_B': 1.09, '50_B': 0.87, '63_B': 0.69,
  '6_C': 3.64,  '10_C': 2.19, '16_C': 1.37, '20_C': 1.09, '25_C': 0.87, '32_C': 0.68, '40_C': 0.55, '50_C': 0.44, '63_C': 0.35,
  '6_D': 1.82,  '10_D': 1.09, '16_D': 0.68, '20_D': 0.55, '25_D': 0.44, '32_D': 0.34, '40_D': 0.27, '50_D': 0.22, '63_D': 0.17
};

const CALC_CATEGORIES = [
  { id: 'fundamentals', label: 'Fundamentals & Power Systems', icon: '📐' },
  { id: 'building',     label: 'Buildings & LV (NBC / IEC / IS / BS)', icon: '🏠' },
  { id: 'substation',   label: 'Substations, Transformers & Protection', icon: '⚙' },
  { id: 'transmission', label: 'Transmission Lines & UG Cables', icon: '🔌' }
];

const CALC_CATALOG = [
  {
    id: 'mod_energy',
    category: 'fundamentals',
    shortTitle: 'Energy & Power Converter',
    title: 'Energy, Power & Apparent Power Converter',
    subtitle: 'Convert W, kW, MW, hp, BTU/h to kWh, MWh, Joules, MJ, GJ, and kW ↔ kVA.',
    usesStandard: false,
    badge: 'Universal Physics'
  },
  {
    id: 'mod_pf',
    category: 'fundamentals',
    shortTitle: '1-Ph / 3-Ph Power & PF Bank',
    title: '1-Phase / 3-Phase Power, Current & Capacitor Bank Sizing',
    subtitle: 'Calculate line current, kVA, kVAr, and capacitor bank rating to improve power factor (400 V – 400 kV).',
    usesStandard: false,
    badge: 'Universal Physics'
  },
  {
    id: 'mod_pu',
    category: 'fundamentals',
    shortTitle: 'Per-Unit (Zpu) & Impedance',
    title: 'Per-Unit (Zpu) Base Changer & Ohmic Impedance',
    subtitle: 'Convert transformer/line per-unit impedance across MVA and kV bases, plus actual Ohmic Z (Ω) & I_base.',
    usesStandard: false,
    badge: 'Power Systems'
  },
  {
    id: 'mod_building',
    category: 'building',
    shortTitle: 'Building Load & Earthing Pit',
    title: 'Building Maximum Demand & Earthing Pit Resistance',
    subtitle: 'Diversity factor load estimation, service mains sizing, and Dwight rod earthing resistance.',
    usesStandard: true,
    badge: 'NBC 207 / IEC 60364'
  },
  {
    id: 'mod_lvcable',
    category: 'building',
    shortTitle: 'LV Cable Sizing & MCB',
    title: 'LV Cable Sizing, Voltage Drop & MCB Selection',
    subtitle: 'Domestic & industrial 230 V / 400 V cable sizing with installation derating, Cu/Al choice, ΔV%, and MCB.',
    usesStandard: true,
    badge: 'Wiring Code Aware'
  },
  {
    id: 'mod_zs',
    category: 'building',
    shortTitle: 'Earth Fault Loop (Zs)',
    title: 'Earth Fault Loop Impedance (Zs) & 0.4s Disconnection',
    subtitle: 'Verify touch-voltage protection using separate Phase/CPC sizes, 1.2× temp factor, and full MCB B/C/D limits.',
    usesStandard: true,
    badge: 'IEC 60364 / BS 7671'
  },
  {
    id: 'mod_tx',
    category: 'substation',
    shortTitle: 'Transformer Sizing & Z%',
    title: 'Power Transformer MVA Sizing, FLC & Short-Circuit Z%',
    subtitle: 'Select standard IEC MVA rating (400 V – 400 kV), Primary/Secondary FLC, Ohmic impedance, and fault current.',
    usesStandard: false,
    badge: 'IEC 60076'
  },
  {
    id: 'mod_fault',
    category: 'substation',
    shortTitle: 'Busbar Fault & Force',
    title: 'Busbar Symmetrical Fault Level & Electro-Dynamic Force',
    subtitle: 'Compute busbar Ik″, fault MVA, peak making current ip (IEC 60909), and conductor force (IEC 60865).',
    usesStandard: false,
    badge: 'IEC 60909 / 60865'
  },
  {
    id: 'mod_ct',
    category: 'substation',
    shortTitle: 'Protection CT Knee-Point (Vk)',
    title: 'Protection CT Knee-Point Voltage (Vk) & Loop Burden',
    subtitle: 'Compute required CT Vk (IEC 61869) from actual lead length, wire mm², relay burden, Rct, and X/R factor.',
    usesStandard: false,
    badge: 'IEC 61869'
  },
  {
    id: 'mod_idmt',
    category: 'substation',
    shortTitle: 'IDMT Relay Trip Time',
    title: 'IDMT Overcurrent Relay Coordination Curve',
    subtitle: 'Calculate exact relay trip time (SI, VI, EI, LTI curves) from Plug Setting, Fault Current, and TMS.',
    usesStandard: false,
    badge: 'IEC 60255'
  },
  {
    id: 'mod_arrester',
    category: 'substation',
    shortTitle: 'Surge Arrester & BIL',
    title: 'Surge Arrester Rating (MCOV, Ur) & BIL Margin',
    subtitle: 'Select arrester MCOV and rated voltage (11 – 400 kV) for solidly or non-effectively earthed systems.',
    usesStandard: false,
    badge: 'IEC 60099'
  },
  {
    id: 'mod_battery',
    category: 'substation',
    shortTitle: 'Substation DC Battery Bank',
    title: 'Substation DC Battery Bank Sizing (110V / 220V DC)',
    subtitle: 'Size substation auxiliary DC battery bank (Ah) from continuous + trip loads, autonomy, and IEEE 485 margins.',
    usesStandard: false,
    badge: 'IEEE 485'
  },
  {
    id: 'mod_hvcable',
    category: 'transmission',
    shortTitle: 'HV / EHV Power Cable Sizing',
    title: 'HV / EHV XLPE Power Cable Sizing (400 V – 400 kV)',
    subtitle: 'Adiabatic short-circuit withstand (I²t) + continuous ampacity with burial/air derating and parallel runs.',
    usesStandard: true,
    badge: 'IEC 60287 / 60949'
  },
  {
    id: 'mod_pulling',
    category: 'transmission',
    shortTitle: 'UG Cable Pulling & SWBP',
    title: 'Underground Cable Pulling Tension & Sidewall Pressure',
    subtitle: 'Compute straight & bend pulling tension (T1, T2) and sidewall bearing pressure (SWBP) against 7.3 kN/m limit.',
    usesStandard: false,
    badge: 'IEEE 525'
  },
  {
    id: 'mod_txline',
    category: 'transmission',
    shortTitle: 'TX Line Z, SIL & Sag-Tension',
    title: 'Transmission Line Impedance, SIL & Overhead Sag-Tension',
    subtitle: 'Line R + jX total impedance, Surge Impedance Loading (SIL), St. Clair limit, and parabolic conductor sag.',
    usesStandard: false,
    badge: 'Transmission EPC'
  }
];

/* =========================================================================
   HTML FORM TEMPLATES FOR EACH MODULE
   ========================================================================= */
function fieldHtml(id, label, val, opts = {}) {
  const step = opts.step || 'any';
  const min = opts.min !== undefined ? `min="${opts.min}"` : '';
  const max = opts.max !== undefined ? `max="${opts.max}"` : '';
  return `
    <div>
      <label for="${id}" class="block text-[11px] font-mono font-semibold text-slate-600 dark:text-[#94A3B8] mb-1">${label}</label>
      <input type="number" id="${id}" value="${val}" step="${step}" ${min} ${max}
        class="w-full px-3 py-2 rounded-xl border border-hairline dark:border-[#334155] bg-linen/40 dark:bg-[#1E293B] text-ink dark:text-[#F8FAFC] text-sm font-mono outline-none focus:border-cerulean transition-colors"
        oninput="runActiveCalculator()">
    </div>`;
}

function selectHtml(id, label, options, selectedVal) {
  const optsHtml = options.map(o => `<option value="${o.v}" ${String(o.v) === String(selectedVal) ? 'selected' : ''}>${o.t}</option>`).join('');
  return `
    <div>
      <label for="${id}" class="block text-[11px] font-mono font-semibold text-slate-600 dark:text-[#94A3B8] mb-1">${label}</label>
      <select id="${id}"
        class="w-full px-3 py-2 rounded-xl border border-hairline dark:border-[#334155] bg-linen/40 dark:bg-[#1E293B] text-ink dark:text-[#F8FAFC] text-sm font-mono outline-none focus:border-cerulean transition-colors"
        onchange="runActiveCalculator()">
        ${optsHtml}
      </select>
    </div>`;
}

function getModuleInputsHtml(id) {
  switch (id) {
    case 'mod_energy':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m0_powerVal', 'Power Magnitude', 100, { min: 0 })}
          ${selectHtml('m0_powerUnit', 'Power Unit', [
            { v: 'W', t: 'Watts (W)' }, { v: 'kW', t: 'Kilowatts (kW)' }, { v: 'MW', t: 'Megawatts (MW)' },
            { v: 'hp', t: 'Horsepower (hp)' }, { v: 'BTU_h', t: 'BTU / hour' }
          ], 'kW')}
          ${fieldHtml('m0_durationVal', 'Operating Duration', 24, { min: 0 })}
          ${selectHtml('m0_durationUnit', 'Time Unit', [
            { v: 'hours', t: 'Hours' }, { v: 'days', t: 'Days (24h)' }, { v: 'months', t: 'Months (30d)' }, { v: 'years', t: 'Years (365d)' }
          ], 'hours')}
        </div>
        <div class="mt-3.5 calc-inputs-grid">
          ${fieldHtml('m0_pf', 'Power Factor (for kW ↔ kVA)', 0.85, { step: 0.01, min: 0.1, max: 1.0 })}
        </div>`;

    case 'mod_pf':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('mpf_phase', 'System Phase', [
            { v: '3ph', t: '3-Phase AC (√3 · V · I)' }, { v: '1ph', t: '1-Phase AC (V · I)' }
          ], '3ph')}
          ${fieldHtml('mpf_vkv', 'Line Voltage (kV)', 11, { step: 0.01, min: 0.1 })}
          ${fieldHtml('mpf_pkw', 'Active Power Load (kW)', 500, { min: 0.1 })}
          ${fieldHtml('mpf_pf1', 'Existing Power Factor (cos φ₁)', 0.75, { step: 0.01, min: 0.1, max: 1.0 })}
          ${fieldHtml('mpf_pf2', 'Target Power Factor (cos φ₂)', 0.95, { step: 0.01, min: 0.1, max: 1.0 })}
        </div>`;

    case 'mod_pu':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('mpu_zold', 'Nameplate / Old Z (pu or %)', 0.125, { step: 0.001, min: 0 })}
          ${selectHtml('mpu_unit', 'Input Format', [
            { v: 'pu', t: 'Per-Unit (pu)' }, { v: 'pct', t: 'Percentage (%)' }
          ], 'pu')}
          ${fieldHtml('mpu_sold', 'Old Base Power S_old (MVA)', 50, { min: 0.01 })}
          ${fieldHtml('mpu_vold', 'Old Base Voltage V_old (kV)', 132, { min: 0.1 })}
          ${fieldHtml('mpu_snew', 'New Base Power S_new (MVA)', 100, { min: 0.01 })}
          ${fieldHtml('mpu_vnew', 'New Base Voltage V_new (kV)', 132, { min: 0.1 })}
        </div>`;

    case 'mod_building':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('m11_type', 'Building Type', [
            { v: 'residential', t: 'Residential House / Apt' },
            { v: 'office', t: 'Institutional / Office' },
            { v: 'commercial', t: 'Commercial Complex' }
          ], 'residential')}
          ${fieldHtml('m11_lightKw', 'Lighting Connected (kW)', 3.0, { step: 0.5, min: 0 })}
          ${fieldHtml('m11_socketKw', 'Socket / Power Outlets (kW)', 6.0, { step: 0.5, min: 0 })}
          ${fieldHtml('m11_hvacKw', 'AC / Geyser / Heating (kW)', 8.0, { step: 0.5, min: 0 })}
          ${fieldHtml('m11_soilRho', 'Soil Resistivity ρ (Ω·m)', 50, { step: 5, min: 1 })}
          ${fieldHtml('m11_rodLen', 'Earth Rod Length (m)', 3.0, { step: 0.5, min: 1 })}
        </div>`;

    case 'mod_lvcable':
      return `
        <div class="mb-3 flex flex-wrap gap-1.5">
          <span class="text-[11px] font-mono text-slate-500 self-center mr-1">Presets:</span>
          <button type="button" onclick="applyLvPreset(300,'230_1ph',20,0.95,'lighting')" class="px-2.5 py-1 rounded-lg bg-linen dark:bg-[#1E293B] border border-hairline dark:border-[#334155] text-xs font-mono cursor-pointer hover:border-cerulean">💡 Lighting 300W</button>
          <button type="button" onclick="applyLvPreset(1800,'230_1ph',25,0.85,'power')" class="px-2.5 py-1 rounded-lg bg-linen dark:bg-[#1E293B] border border-hairline dark:border-[#334155] text-xs font-mono cursor-pointer hover:border-cerulean">❄ AC 1.5 Ton</button>
          <button type="button" onclick="applyLvPreset(2500,'230_1ph',15,1.0,'power')" class="px-2.5 py-1 rounded-lg bg-linen dark:bg-[#1E293B] border border-hairline dark:border-[#334155] text-xs font-mono cursor-pointer hover:border-cerulean">🚿 Geyser 2.5kW</button>
          <button type="button" onclick="applyLvPreset(15000,'400_3ph',45,0.85,'power')" class="px-2.5 py-1 rounded-lg bg-linen dark:bg-[#1E293B] border border-hairline dark:border-[#334155] text-xs font-mono cursor-pointer hover:border-cerulean">🏭 3-Ph Motor 15kW</button>
        </div>
        <div class="calc-inputs-grid">
          ${fieldHtml('m1_loadW', 'Load Power (Watts)', 1800, { min: 10 })}
          ${selectHtml('m1_supply', 'Supply System', [
            { v: '230_1ph', t: '230 V Single-Phase' }, { v: '400_3ph', t: '400 V Three-Phase' }
          ], '230_1ph')}
          ${fieldHtml('m1_length', 'One-Way Cable Run (m)', 25, { min: 1 })}
          ${fieldHtml('m1_pf', 'Power Factor (cos φ)', 0.85, { step: 0.05, min: 0.5, max: 1.0 })}
          ${selectHtml('m1_circuitType', 'Circuit Type (ΔV Limit)', [
            { v: 'lighting', t: 'Lighting (Max 3% Drop)' }, { v: 'power', t: 'Power / Sub-main (Max 5% Drop)' }
          ], 'lighting')}
          ${selectHtml('m1_derate', 'Ambient / Grouping Derating', [
            { v: '1.0', t: '1.00 (Standard 30°C Single)' },
            { v: '0.87', t: '0.87 (40°C Ambient)' },
            { v: '0.70', t: '0.70 (Grouped in Conduit)' }
          ], '1.0')}
        </div>`;

    case 'mod_zs':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m12_ze', 'External Loop Ze (Ω)', 0.35, { step: 0.05, min: 0.01 })}
          ${fieldHtml('m12_len', 'Circuit Length (m)', 30, { min: 1 })}
          ${selectHtml('m12_phaseSize', 'Phase Conductor (mm² Cu)', [
            { v: '1.5', t: '1.5 mm²' }, { v: '2.5', t: '2.5 mm²' }, { v: '4', t: '4.0 mm²' },
            { v: '6', t: '6.0 mm²' }, { v: '10', t: '10 mm²' }, { v: '16', t: '16 mm²' }, { v: '25', t: '25 mm²' }
          ], '2.5')}
          ${selectHtml('m12_cpcSize', 'Earth / CPC Conductor (mm² Cu)', [
            { v: '1.0', t: '1.0 mm²' }, { v: '1.5', t: '1.5 mm²' }, { v: '2.5', t: '2.5 mm²' },
            { v: '4', t: '4.0 mm²' }, { v: '6', t: '6.0 mm²' }, { v: '10', t: '10 mm²' }, { v: '16', t: '16 mm²' }
          ], '1.5')}
          ${selectHtml('m12_mcb', 'MCB Rating & Curve', [
            { v: '6_B', t: '6A Type B' }, { v: '10_B', t: '10A Type B' }, { v: '16_B', t: '16A Type B' },
            { v: '20_B', t: '20A Type B' }, { v: '32_B', t: '32A Type B' }, { v: '16_C', t: '16A Type C' },
            { v: '20_C', t: '20A Type C' }, { v: '32_C', t: '32A Type C' }, { v: '40_C', t: '40A Type C' },
            { v: '16_D', t: '16A Type D' }, { v: '32_D', t: '32A Type D' }
          ], '16_B')}
        </div>`;

    case 'mod_tx':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m4_v1', 'Primary Voltage (kV)', 132, { min: 0.4 })}
          ${fieldHtml('m4_v2', 'Secondary Voltage (kV)', 33, { min: 0.23 })}
          ${fieldHtml('m4_loadMva', 'Connected Load (MVA)', 50, { min: 0.01 })}
          ${fieldHtml('m4_pf', 'Load Power Factor (cos φ)', 0.85, { step: 0.05, min: 0.5, max: 1.0 })}
          ${fieldHtml('m4_growth', 'Growth Margin (%)', 15, { step: 5, min: 0, max: 50 })}
          ${fieldHtml('m4_zpct', 'Transformer Impedance Z (%)', 12.5, { step: 0.5, min: 2, max: 25 })}
        </div>`;

    case 'mod_fault':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m5_vkv', 'Busbar Voltage (kV)', 33, { min: 0.4 })}
          ${fieldHtml('m5_txMva', 'Incomer Transformer (MVA)', 63, { min: 0.1 })}
          ${fieldHtml('m5_zpct', 'Transformer Impedance (%)', 12.5, { step: 0.5, min: 1 })}
          ${fieldHtml('m5_gridMva', 'Upstream Grid Fault (MVA)', 2500, { min: 10 })}
          ${fieldHtml('m5_spacing', 'Busbar Phase Spacing (mm)', 1500, { step: 50, min: 100 })}
          ${fieldHtml('m5_span', 'Busbar Support Span (m)', 5.0, { step: 0.5, min: 0.5 })}
        </div>`;

    case 'mod_ct':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m9_ipri', 'CT Primary Current (A)', 800, { step: 50, min: 50 })}
          ${selectHtml('m9_isec', 'CT Secondary (A)', [{ v: '1', t: '1 A' }, { v: '5', t: '5 A' }], '1')}
          ${fieldHtml('m9_ifault', 'Max Through-Fault (kA)', 31.5, { step: 0.5, min: 1 })}
          ${fieldHtml('m9_rct', 'CT Winding R_ct (Ω)', 4.0, { step: 0.5, min: 0.1 })}
          ${fieldHtml('m9_leadLen', 'One-Way Lead Length (m)', 60, { step: 5, min: 1 })}
          ${selectHtml('m9_leadSize', 'Lead Wire Cross-Section', [
            { v: '2.5', t: '2.5 mm² Cu' }, { v: '4.0', t: '4.0 mm² Cu' }, { v: '6.0', t: '6.0 mm² Cu' }
          ], '4.0')}
          ${fieldHtml('m9_relayVa', 'Relay Burden (VA)', 0.5, { step: 0.1, min: 0.05 })}
          ${fieldHtml('m9_xr', 'System X/R Ratio (K_td=1+X/R or 2)', 2.0, { step: 1, min: 1, max: 20 })}
        </div>`;

    case 'mod_idmt':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('mid_curve', 'IEC 60255 Curve', [
            { v: 'SI', t: 'Standard Inverse (SI)' },
            { v: 'VI', t: 'Very Inverse (VI)' },
            { v: 'EI', t: 'Extremely Inverse (EI)' },
            { v: 'LTI', t: 'Long Time Inverse (LTI)' }
          ], 'SI')}
          ${fieldHtml('mid_is', 'Relay Pickup Current Is (A)', 400, { min: 1 })}
          ${fieldHtml('mid_if', 'Fault Current If (A)', 4000, { min: 1 })}
          ${fieldHtml('mid_tms', 'Time Multiplier (TMS)', 0.25, { step: 0.05, min: 0.05, max: 2.0 })}
        </div>`;

    case 'mod_arrester':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('m10_vn', 'Nominal Voltage Vn (kV)', [
            { v: '11', t: '11 kV (Um = 12 kV)' }, { v: '33', t: '33 kV (Um = 36 kV)' },
            { v: '66', t: '66 kV (Um = 72.5 kV)' }, { v: '132', t: '132 kV (Um = 145 kV)' },
            { v: '220', t: '220 kV (Um = 245 kV)' }, { v: '400', t: '400 kV (Um = 420 kV)' }
          ], '132')}
          ${selectHtml('m10_earthing', 'System Earthing', [
            { v: 'solid', t: 'Solidly Earthed (k = 1.4)' },
            { v: 'isolated', t: 'Isolated / Resonant (k = 1.73)' }
          ], 'solid')}
          ${fieldHtml('m10_bil', 'Equipment BIL (kVp)', 650, { step: 25, min: 75 })}
        </div>`;

    case 'mod_battery':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('mbat_vdc', 'DC System Voltage', [
            { v: '110', t: '110 V DC Substation' }, { v: '220', t: '220 V DC Substation' }, { v: '48', t: '48 V DC Telecom/SCADA' }
          ], '110')}
          ${fieldHtml('mbat_icont', 'Continuous Load (A)', 15, { step: 1, min: 1 })}
          ${fieldHtml('mbat_ihours', 'Autonomy Backup Time (hrs)', 8, { step: 1, min: 1 })}
          ${fieldHtml('mbat_itrip', 'Breaker Trip / Momentary (A)', 35, { step: 5, min: 0 })}
          ${fieldHtml('mbat_aging', 'Aging Factor (IEEE 485)', 1.25, { step: 0.05, min: 1.0, max: 1.5 })}
          ${fieldHtml('mbat_design', 'Design Margin Factor', 1.15, { step: 0.05, min: 1.0, max: 1.5 })}
        </div>`;

    case 'mod_hvcable':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('m6_vkv', 'Voltage Class', [
            { v: '0.4', t: '0.4 kV (LV)' }, { v: '11', t: '11 kV (MV)' }, { v: '33', t: '33 kV (MV)' },
            { v: '66', t: '66 kV (HV)' }, { v: '132', t: '132 kV (HV)' }, { v: '220', t: '220 kV (EHV)' }, { v: '400', t: '400 kV (EHV)' }
          ], '132')}
          ${selectHtml('m6_mat', 'Conductor & Insulation', [
            { v: 'Cu_XLPE', t: 'Copper XLPE (k = 143)' }, { v: 'Al_XLPE', t: 'Aluminum XLPE (k = 94)' }
          ], 'Cu_XLPE')}
          ${fieldHtml('m6_iload', 'Total Load Current (A)', 450, { min: 10 })}
          ${fieldHtml('m6_isc', 'Symmetrical Fault Isc (kA)', 25, { step: 0.5, min: 1 })}
          ${fieldHtml('m6_tfault', 'Fault Clearing Time (s)', 1.0, { step: 0.1, min: 0.05 })}
          ${selectHtml('m6_laying', 'Installation & Derating', [
            { v: '1.0', t: 'In Free Air (Factor 1.00)' },
            { v: '0.88', t: 'Direct Buried 1.2m (Factor 0.88)' },
            { v: '0.78', t: 'Buried in Duct Bank (Factor 0.78)' }
          ], '0.88')}
          ${selectHtml('m6_runs', 'Parallel Runs / Phase', [
            { v: '1', t: '1 Run / Phase' }, { v: '2', t: '2 Parallel Runs / Phase' }
          ], '1')}
        </div>`;

    case 'mod_pulling':
      return `
        <div class="calc-inputs-grid">
          ${fieldHtml('m14_weight', 'Cable Weight (kg/m)', 12.5, { step: 0.5, min: 0.5 })}
          ${fieldHtml('m14_len', 'Straight Pull Length (m)', 250, { step: 10, min: 1 })}
          ${fieldHtml('m14_mu', 'Friction Coefficient (μ)', 0.25, { step: 0.05, min: 0.1, max: 0.8 })}
          ${selectHtml('m14_bendAngle', 'Bend Angle', [
            { v: '0', t: '0° (Straight)' }, { v: '45', t: '45° Bend' }, { v: '90', t: '90° Bend' }
          ], '90')}
          ${fieldHtml('m14_radius', 'Bend Radius R (m)', 2.5, { step: 0.5, min: 0.5 })}
        </div>`;

    case 'mod_txline':
      return `
        <div class="calc-inputs-grid">
          ${selectHtml('m8_vkv', 'Line Voltage (kV)', [
            { v: '11', t: '11 kV' }, { v: '33', t: '33 kV' }, { v: '66', t: '66 kV' },
            { v: '132', t: '132 kV' }, { v: '220', t: '220 kV' }, { v: '400', t: '400 kV' }
          ], '132')}
          ${fieldHtml('m8_len', 'Line Length (km)', 85, { min: 1 })}
          ${fieldHtml('m8_rkm', 'Resistance R (Ω/km)', 0.12, { step: 0.01, min: 0.001 })}
          ${fieldHtml('m8_xkm', 'Reactance X (Ω/km)', 0.39, { step: 0.01, min: 0.001 })}
          ${fieldHtml('m8_zc', 'Surge Impedance Zc (Ω)', 380, { step: 10, min: 50 })}
          ${fieldHtml('m8_span', 'Ruling Span (m)', 300, { step: 10, min: 20 })}
          ${fieldHtml('m8_wkg', 'Conductor Weight (kg/m)', 1.15, { step: 0.05, min: 0.1 })}
          ${fieldHtml('m8_tension', 'Horizontal Tension (kN)', 22.0, { step: 0.5, min: 1 })}
        </div>`;
  }
  return '';
}

/* =========================================================================
   WORKBENCH RENDERING & NAVIGATION
   ========================================================================= */
function initCalculators() {
  renderCalculatorsWorkbench();
  selectCalculator(window.activeCalcId || 'mod_energy');
}

function renderCalculatorsWorkbench() {
  const root = document.getElementById('calculatorsWorkbenchRoot');
  if (!root) return;

  // Sidebar HTML (Desktop)
  let sidebarHtml = '';
  let mobileOptionsHtml = '';
  CALC_CATEGORIES.forEach(cat => {
    const items = CALC_CATALOG.filter(m => m.category === cat.id);
    sidebarHtml += `
      <div class="mb-4">
        <div class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] flex items-center gap-1.5">
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
        </div>
        <div class="space-y-1 mt-1">
          ${items.map(item => `
            <button type="button" data-calc-id="${item.id}" onclick="selectCalculator('${item.id}')"
              class="calc-sidebar-btn w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-linen dark:hover:bg-[#1E293B] transition-all cursor-pointer border border-transparent flex items-center justify-between gap-2">
              <span class="truncate">${item.shortTitle}</span>
            </button>
          `).join('')}
        </div>
      </div>`;

    mobileOptionsHtml += `<optgroup label="${cat.icon} ${cat.label}">`;
    items.forEach(item => {
      mobileOptionsHtml += `<option value="${item.id}">${item.shortTitle}</option>`;
    });
    mobileOptionsHtml += `</optgroup>`;
  });

  root.innerHTML = `
    <!-- Mobile Calculator Selector Dropdown -->
    <div class="calc-mobile-picker mb-4 bg-card dark:bg-[#151F2E] border border-hairline dark:border-[#233247] rounded-2xl p-3 shadow-sm">
      <label for="mobileCalcSelect" class="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-1.5">
        Select Engineering Calculator (15 Tools)
      </label>
      <select id="mobileCalcSelect" onchange="selectCalculator(this.value)"
        class="w-full px-3 py-2.5 rounded-xl border border-hairline dark:border-[#334155] bg-linen/60 dark:bg-[#1E293B] text-ink dark:text-[#F8FAFC] text-sm font-semibold outline-none focus:border-cerulean">
        ${mobileOptionsHtml}
      </select>
    </div>

    <!-- Desktop Master-Detail Split Workbench -->
    <div class="calc-workbench-layout">
      <!-- Left Sidebar (Desktop Only) -->
      <aside class="calc-sidebar bg-card dark:bg-[#151F2E] border border-hairline dark:border-[#233247] rounded-2xl p-3.5 shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto" aria-label="Calculator Selection Sidebar">
        ${sidebarHtml}
      </aside>

      <!-- Right Focused Calculator Workspace -->
      <div id="activeCalculatorWorkspace" class="flex-1 min-w-0 w-full bg-card dark:bg-[#151F2E] border border-hairline dark:border-[#233247] rounded-2xl p-5 sm:p-7 shadow-sm print-calc-sheet">
        <!-- Populated dynamically by selectCalculator() -->
      </div>
    </div>
  `;
}

function selectCalculator(calcId) {
  const mod = CALC_CATALOG.find(c => c.id === calcId) || CALC_CATALOG[0];
  window.activeCalcId = mod.id;

  // Sync sidebar buttons
  document.querySelectorAll('.calc-sidebar-btn').forEach(btn => {
    const active = btn.getAttribute('data-calc-id') === mod.id;
    if (active) {
      btn.classList.add('active', 'bg-cerulean', 'text-white', 'font-bold', 'shadow-sm');
      btn.classList.remove('text-slate-700', 'dark:text-[#CBD5E1]', 'hover:bg-linen', 'dark:hover:bg-[#1E293B]');
    } else {
      btn.classList.remove('active', 'bg-cerulean', 'text-white', 'font-bold', 'shadow-sm');
      btn.classList.add('text-slate-700', 'dark:text-[#CBD5E1]', 'hover:bg-linen', 'dark:hover:bg-[#1E293B]');
    }
  });

  // Sync mobile select
  const mobSel = document.getElementById('mobileCalcSelect');
  if (mobSel) mobSel.value = mod.id;

  // Toggle standard selector visibility based on whether this calculator depends on wiring/building standards
  const stdBox = document.getElementById('calcStandardContainer');
  if (stdBox) {
    stdBox.style.display = mod.usesStandard ? 'block' : 'none';
  }

  const workspace = document.getElementById('activeCalculatorWorkspace');
  if (!workspace) return;

  const stdLabel = mod.usesStandard ? STD_INFO[window.currentCalcStandard].label : mod.badge;

  workspace.innerHTML = `
    <!-- Print-Only Official Header -->
    <div class="hidden print:block border-b-2 border-slate-800 pb-3 mb-4">
      <div class="flex justify-between items-end">
        <div>
          <div class="font-serif text-xl font-bold text-slate-900">Anish Niroula — Engineering Calculation Note</div>
          <div class="font-mono text-xs text-slate-600">NEC Registration No. 1977 (Electrical) &bull; anish-niroula.com.np</div>
        </div>
        <div class="font-mono text-xs text-slate-600 text-right">
          <div>Ref: ${mod.id.toUpperCase()}</div>
          <div>Basis: ${stdLabel}</div>
        </div>
      </div>
    </div>

    <!-- Calculator Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 mb-5 border-b border-hairline dark:border-[#233247]">
      <div>
        <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cerulean/10 text-cerulean dark:text-[#38BDF8] font-mono text-[11px] font-bold mb-2">
          <span id="activeCalcBasisBadge">${stdLabel}</span>
        </div>
        <h3 class="text-xl sm:text-2xl font-serif font-bold text-ink dark:text-[#F8FAFC] leading-snug">${mod.title}</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] mt-1">${mod.subtitle}</p>
      </div>

      <!-- Actions: Copy & Print / Save PDF -->
      <div class="flex items-center gap-2 flex-shrink-0 print:hidden">
        <button type="button" onclick="copyActiveReport()"
          class="px-3 py-2 rounded-xl bg-linen dark:bg-[#1E293B] border border-hairline dark:border-[#334155] hover:border-cerulean text-xs font-mono font-semibold text-ink dark:text-[#F8FAFC] cursor-pointer transition-colors">
          📋 Copy
        </button>
        <button type="button" onclick="printCalcSheet()"
          class="px-3 py-2 rounded-xl bg-cerulean text-white hover:bg-sky-700 text-xs font-mono font-semibold cursor-pointer shadow-sm transition-colors">
          🖨 Print / PDF
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="mb-6">
      <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-3">Design Parameters</div>
      ${getModuleInputsHtml(mod.id)}
    </div>

    <!-- Results Banner -->
    <div class="mb-5">
      <div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-2.5">Computed Engineering Results</div>
      <div id="activeCalcResults" class="calc-results-grid"></div>
      <div id="activeCalcStatus" class="mt-3"></div>
    </div>

    <!-- Collapsible Step-by-Step Formula Panel (Students & Verification) -->
    <details class="group bg-linen/50 dark:bg-[#0F172A]/70 border border-hairline dark:border-[#233247] rounded-xl p-3.5" open>
      <summary class="cursor-pointer font-mono text-xs font-bold text-cerulean dark:text-[#38BDF8] flex items-center justify-between select-none list-none">
        <span>📘 Formula &amp; Step-by-Step Calculation (Verification)</span>
        <span class="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div id="activeCalcSteps" class="mt-3 pt-3 border-t border-hairline dark:border-[#233247] font-mono text-xs text-slate-700 dark:text-[#CBD5E1] space-y-1.5 leading-relaxed"></div>
    </details>
  `;

  runActiveCalculator();
}

function setCalcStandard(std) {
  if (!STD_INFO[std]) std = 'IEC';
  window.currentCalcStandard = std;

  document.querySelectorAll('.calc-std-pill').forEach(p => {
    const active = p.getAttribute('data-std') === std;
    if (active) {
      p.classList.add('active', 'border-cerulean', 'bg-cerulean', 'text-white');
      p.classList.remove('bg-white', 'dark:bg-[#111A28]', 'text-slate-700', 'dark:text-[#CBD5E1]');
    } else {
      p.classList.remove('active', 'border-cerulean', 'bg-cerulean', 'text-white');
      p.classList.add('bg-white', 'dark:bg-[#111A28]', 'text-slate-700', 'dark:text-[#CBD5E1]');
    }
  });

  const badgeText = document.getElementById('activeStdBadgeText');
  if (badgeText) badgeText.textContent = STD_INFO[std].label;

  const basisBadge = document.getElementById('activeCalcBasisBadge');
  const mod = CALC_CATALOG.find(c => c.id === window.activeCalcId);
  if (basisBadge && mod && mod.usesStandard) {
    basisBadge.textContent = STD_INFO[std].label;
  }

  runActiveCalculator();
}

function applyLvPreset(w, sup, len, pf, ctype) {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('m1_loadW', w);
  setVal('m1_supply', sup);
  setVal('m1_length', len);
  setVal('m1_pf', pf);
  setVal('m1_circuitType', ctype);
  runActiveCalculator();
}

function renderResultsUI(cards, statusHtml, steps) {
  const resEl = document.getElementById('activeCalcResults');
  const statEl = document.getElementById('activeCalcStatus');
  const stepsEl = document.getElementById('activeCalcSteps');

  if (resEl) {
    resEl.innerHTML = cards.map(c => `
      <div class="p-3.5 rounded-xl bg-linen/60 dark:bg-[#0F172A] border border-hairline dark:border-[#233247]">
        <div class="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">${c.label}</div>
        <div class="text-base sm:text-lg font-mono font-bold mt-1 ${c.color || 'text-ink dark:text-white'}" ${c.id ? `id="${c.id}"` : ''}>${c.value}</div>
      </div>
    `).join('');
  }
  if (statEl) statEl.innerHTML = statusHtml || '';
  if (stepsEl) stepsEl.innerHTML = steps.map(s => `<div>&bull; ${s}</div>`).join('');
}

function statusBanner(ok, msg) {
  const cls = ok
    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40';
  return `<div class="p-3 rounded-xl border text-xs font-mono font-semibold ${cls}">${msg}</div>`;
}

const num = (id, def = 0) => {
  const el = document.getElementById(id);
  if (!el) return def;
  const v = parseFloat(el.value);
  return isNaN(v) ? def : v;
};
const str = (id, def = '') => document.getElementById(id)?.value ?? def;

/* =========================================================================
   VERIFIED CALCULATION ENGINES (15 MODULES)
   ========================================================================= */
function runActiveCalculator() {
  const id = window.activeCalcId;
  const std = window.currentCalcStandard || 'IEC';
  const stdMeta = STD_INFO[std];

  if (id === 'mod_energy') {
    const pVal = num('m0_powerVal', 100);
    const pUnit = str('m0_powerUnit', 'kW');
    const dVal = num('m0_durationVal', 24);
    const dUnit = str('m0_durationUnit', 'hours');
    const pf = Math.min(1, Math.max(0.1, num('m0_pf', 0.85)));

    const multP = { W: 1, kW: 1e3, MW: 1e6, hp: 745.69987, BTU_h: 0.29307107 };
    const multT = { hours: 3600, days: 86400, months: 86400 * 30, years: 86400 * 365 };
    const powerW = pVal * (multP[pUnit] || 1e3);
    const durSec = dVal * (multT[dUnit] || 3600);
    const energyJ = powerW * durSec;
    const kwh = energyJ / 3.6e6;
    const mj = energyJ / 1e6;
    const kva = (powerW / 1e3) / pf;

    const kwhTxt = kwh >= 1e6 ? `${(kwh / 1e6).toFixed(2)} GWh` : kwh >= 1e3 ? `${(kwh / 1e3).toFixed(2)} MWh` : `${kwh.toFixed(2)} kWh`;
    const jTxt = mj >= 1e3 ? `${(mj / 1e3).toFixed(2)} GJ` : `${mj.toFixed(2)} MJ`;

    renderResultsUI([
      { id: 'res_m0_kwh', label: 'Electrical Energy', value: kwhTxt, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m0_j', label: 'SI Energy (Joules)', value: jTxt },
      { id: 'res_m0_kva', label: `Apparent Power (PF ${pf})`, value: kva >= 1000 ? `${(kva / 1000).toFixed(2)} MVA` : `${kva.toFixed(2)} kVA`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_m0_hp', label: 'Mechanical Equiv.', value: `${(powerW / 745.69987).toFixed(2)} hp` }
    ], '', [
      `Active Power P = ${pVal} ${pUnit} = ${powerW.toLocaleString()} W`,
      `Duration t = ${dVal} ${dUnit} = ${durSec.toLocaleString()} s`,
      `E(J) = P × t = ${energyJ.toExponential(3)} J`,
      `E(kWh) = E(J) / 3.6×10⁶ = ${kwh.toFixed(2)} kWh`,
      `Apparent Power S = P(kW) / cos φ = ${(powerW / 1000).toFixed(2)} / ${pf} = ${kva.toFixed(2)} kVA`
    ]);
  }

  else if (id === 'mod_pf') {
    const ph = str('mpf_phase', '3ph');
    const vkv = Math.max(0.1, num('mpf_vkv', 11));
    const pkw = Math.max(0.1, num('mpf_pkw', 500));
    const pf1 = Math.min(1, Math.max(0.1, num('mpf_pf1', 0.75)));
    const pf2 = Math.min(1, Math.max(0.1, num('mpf_pf2', 0.95)));

    const i1 = ph === '3ph' ? pkw / (Math.sqrt(3) * vkv * pf1) : pkw / (vkv * pf1);
    const i2 = ph === '3ph' ? pkw / (Math.sqrt(3) * vkv * pf2) : pkw / (vkv * pf2);
    const phi1 = Math.acos(pf1);
    const phi2 = Math.acos(pf2);
    const q1 = pkw * Math.tan(phi1);
    const q2 = pkw * Math.tan(phi2);
    const qc = Math.max(0, q1 - q2);

    renderResultsUI([
      { id: 'res_mpf_qc', label: 'Required Capacitor Bank', value: `${qc.toFixed(1)} kVAr`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_mpf_i1', label: 'Current Before PF', value: `${i1.toFixed(1)} A` },
      { id: 'res_mpf_i2', label: 'Current After PF', value: `${i2.toFixed(1)} A`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_mpf_s2', label: 'New Apparent Power S₂', value: `${(pkw / pf2).toFixed(1)} kVA` }
    ], qc > 0 ? statusBanner(true, `✓ Adding ${qc.toFixed(1)} kVAr reduces line current by ${((1 - i2 / i1) * 100).toFixed(1)}% (${(i1 - i2).toFixed(1)} A saved).`) : '', [
      `Initial Reactive Power Q₁ = P · tan(cos⁻¹ ${pf1}) = ${q1.toFixed(1)} kVAr`,
      `Target Reactive Power Q₂ = P · tan(cos⁻¹ ${pf2}) = ${q2.toFixed(1)} kVAr`,
      `Capacitor Bank Qc = Q₁ − Q₂ = ${qc.toFixed(1)} kVAr`,
      `Line Current I = P / (${ph === '3ph' ? '√3 · ' : ''}V · cos φ)`
    ]);
  }

  else if (id === 'mod_pu') {
    const zInput = num('mpu_zold', 0.125);
    const unit = str('mpu_unit', 'pu');
    const sold = Math.max(0.01, num('mpu_sold', 50));
    const vold = Math.max(0.1, num('mpu_vold', 132));
    const snew = Math.max(0.01, num('mpu_snew', 100));
    const vnew = Math.max(0.1, num('mpu_vnew', 132));

    const zOldPu = unit === 'pct' ? zInput / 100 : zInput;
    const zNewPu = zOldPu * (snew / sold) * Math.pow(vold / vnew, 2);
    const zBaseNew = Math.pow(vnew, 2) / snew;
    const zOhms = zNewPu * zBaseNew;
    const iBaseNew = (snew * 1e3) / (Math.sqrt(3) * vnew);

    renderResultsUI([
      { id: 'res_mpu_znew', label: 'New Z_pu', value: `${zNewPu.toFixed(4)} pu`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_mpu_zpct', label: 'New Z (%)', value: `${(zNewPu * 100).toFixed(2)} %` },
      { id: 'res_mpu_zohm', label: 'Actual Ohmic Z (Ω)', value: `${zOhms.toFixed(3)} Ω`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_mpu_ibase', label: 'New Base Current I_base', value: `${iBaseNew.toFixed(1)} A` }
    ], '', [
      `Z_pu,new = Z_pu,old × (S_new / S_old) × (V_old / V_new)²`,
      `Z_pu,new = ${zOldPu.toFixed(4)} × (${snew}/${sold}) × (${vold}/${vnew})² = ${zNewPu.toFixed(4)} pu`,
      `Z_base,new = V_new² / S_new = ${vnew}² / ${snew} = ${zBaseNew.toFixed(2)} Ω`,
      `Actual Ohmic Impedance Z(Ω) = Z_pu,new × Z_base,new = ${zOhms.toFixed(3)} Ω`
    ]);
  }

  else if (id === 'mod_building') {
    const btype = str('m11_type', 'residential');
    const lKw = num('m11_lightKw', 3);
    const sKw = num('m11_socketKw', 6);
    const hKw = num('m11_hvacKw', 8);
    const rho = Math.max(1, num('m11_soilRho', 50));
    const rodLen = Math.max(1, num('m11_rodLen', 3.0));

    const divMap = {
      residential: [0.66, 0.50, 0.70],
      office:      [0.80, 0.60, 0.80],
      commercial:  [0.90, 0.70, 0.85]
    };
    const [dl, ds, dh] = divMap[btype] || divMap.residential;
    const totKw = lKw + sKw + hKw;
    const demandKw = lKw * dl + sKw * ds + hKw * dh;
    const demandKva = demandKw / 0.85;

    let mains = '6 mm² (25A 1-Ph)';
    if (demandKw > 15) mains = '25 mm² (63A 3-Ph)';
    else if (demandKw > 10) mains = '16 mm² (40A 3-Ph)';
    else if (demandKw > 6.9) mains = '10 mm² (32A 3-Ph)';
    else if (demandKw > 4.5) mains = '10 mm² (32A 1-Ph)';

    // Dwight formula for vertical driven rod (radius a = 0.02 m for 40mm rod/GI pipe)
    const a = 0.02;
    const rRod = (rho / (2 * Math.PI * rodLen)) * (Math.log((4 * rodLen) / a) - 1);
    const rodsNeeded = Math.max(1, Math.ceil(rRod / stdMeta.earthingLimit));

    renderResultsUI([
      { id: 'res_m11_tot', label: 'Connected Load', value: `${totKw.toFixed(2)} kW` },
      { id: 'res_m11_dem', label: 'Max Demand (w/ Diversity)', value: `${demandKw.toFixed(2)} kW (${demandKva.toFixed(1)} kVA)`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m11_mains', label: 'Recommended Service Mains', value: mains },
      { id: 'res_m11_earth', label: 'Single Rod Resistance Re', value: `${rRod.toFixed(2)} Ω`, color: rRod <= stdMeta.earthingLimit ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' }
    ], statusBanner(rRod <= stdMeta.earthingLimit, rRod <= stdMeta.earthingLimit
      ? `✓ Earthing Re = ${rRod.toFixed(2)} Ω ≤ ${stdMeta.earthingLimit} Ω target (${stdMeta.label}).`
      : `⚠ Single rod ${rRod.toFixed(2)} Ω exceeds ${stdMeta.earthingLimit} Ω target — install ${rodsNeeded} parallel rods ≥ ${(rodLen * 2).toFixed(1)} m apart.`), [
      `Diversity Factors (${btype}): Lighting ${dl}, Sockets ${ds}, HVAC ${dh}`,
      `Max Demand = (${lKw}×${dl}) + (${sKw}×${ds}) + (${hKw}×${dh}) = ${demandKw.toFixed(2)} kW`,
      `Dwight Formula: Re = (ρ / 2πL) · [ln(4L/a) − 1] with L=${rodLen}m, a=0.02m, ρ=${rho} Ω·m`
    ]);
  }

  else if (id === 'mod_lvcable') {
    const loadW = Math.max(1, num('m1_loadW', 1800));
    const sup = str('m1_supply', '230_1ph');
    const len = Math.max(1, num('m1_length', 25));
    const pf = Math.min(1, Math.max(0.1, num('m1_pf', 0.85)));
    const ctype = str('m1_circuitType', 'lighting');
    const derate = num('m1_derate', 1.0);

    const is3ph = sup === '400_3ph';
    const vSys = is3ph ? 400 : 230;
    const iLoad = is3ph ? loadW / (Math.sqrt(3) * vSys * pf) : loadW / (vSys * pf);
    const maxDropPct = ctype === 'lighting' ? stdMeta.lvDropMax : stdMeta.lvPowerDropMax;

    // Standard-specific ampacity column
    const ampKey = std === 'IS' ? 'ampIS' : std === 'NBC' ? 'ampNBC' : std === 'BS' ? 'ampBS' : 'ampIEC';
    const minSize = (loadW >= 1000 || iLoad > 5) ? 2.5 : 1.5;
    const rho = 0.0175 * stdMeta.tempMult; // operating temperature resistivity ~ 0.021 Ω·mm²/m

    let chosen = LV_COPPER_TABLE[LV_COPPER_TABLE.length - 1];
    for (const row of LV_COPPER_TABLE) {
      if (row.size < minSize) continue;
      const effAmp = row[ampKey] * derate;
      if (effAmp >= iLoad) {
        const rOneWay = (rho * len) / row.size;
        const vd = is3ph ? Math.sqrt(3) * iLoad * rOneWay * pf : 2 * iLoad * rOneWay * pf;
        if ((vd / vSys) * 100 <= maxDropPct) {
          chosen = row;
          break;
        }
      }
    }

    const rOneWay = (rho * len) / chosen.size;
    const vDrop = is3ph ? Math.sqrt(3) * iLoad * rOneWay * pf : 2 * iLoad * rOneWay * pf;
    const vDropPct = (vDrop / vSys) * 100;
    const lossW = is3ph ? 3 * iLoad * iLoad * rOneWay : 2 * iLoad * iLoad * rOneWay;

    const mcbList = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400];
    const mcb = mcbList.find(r => r >= iLoad * 1.15) || 400;
    const curve = pf < 0.9 || loadW >= 1500 ? 'Type C' : 'Type B';

    renderResultsUI([
      { id: 'res_m1_i', label: 'Operating Current', value: `${iLoad.toFixed(2)} A` },
      { id: 'res_m1_wire', label: 'Recommended Cable', value: `${chosen.size} mm² Cu`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m1_vdrop', label: `Voltage Drop (≤ ${maxDropPct}%)`, value: `${vDrop.toFixed(2)} V (${vDropPct.toFixed(2)}%)`, color: vDropPct <= maxDropPct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' },
      { id: 'res_m1_mcb', label: 'Breaker & Power Loss', value: `${mcb}A ${curve} • ${lossW.toFixed(1)} W` }
    ], statusBanner(vDropPct <= maxDropPct, vDropPct <= maxDropPct
      ? `✓ ${stdMeta.label}: Effective Ampacity ${(chosen[ampKey] * derate).toFixed(1)} A ≥ ${iLoad.toFixed(2)} A | Drop ${vDropPct.toFixed(2)}% ≤ ${maxDropPct}%.`
      : `⚠ Voltage Drop ${vDropPct.toFixed(2)}% exceeds ${maxDropPct}% limit (${stdMeta.label}).`), [
      `Operating Current I = ${loadW} / (${is3ph ? '√3 × ' : ''}${vSys} × ${pf}) = ${iLoad.toFixed(2)} A`,
      `Standard (${std}) Base Ampacity (${chosen.size} mm²): ${chosen[ampKey]} A × Derating (${derate}) = ${(chosen[ampKey] * derate).toFixed(1)} A`,
      `Hot Copper Resistivity ρ_op = 0.0175 × ${stdMeta.tempMult} = ${rho.toFixed(4)} Ω·mm²/m`,
      `ΔV = ${is3ph ? '√3' : '2'} × I × (ρ_op · L / A) × cos φ = ${vDrop.toFixed(2)} V (${vDropPct.toFixed(2)}%)`
    ]);
  }

  else if (id === 'mod_zs') {
    const ze = Math.max(0.01, num('m12_ze', 0.35));
    const len = Math.max(1, num('m12_len', 30));
    const sPhase = num('m12_phaseSize', 2.5);
    const sCpc = num('m12_cpcSize', 1.5);
    const mcbKey = str('m12_mcb', '16_B');

    const rhoCold = 0.0175;
    const r1 = (rhoCold * len) / sPhase;
    const r2 = (rhoCold * len) / sCpc;
    const r1r2Hot = stdMeta.tempMult * (r1 + r2);
    const zs = ze + r1r2Hot;
    const maxZs = MAX_ZS_230V[mcbKey] || 1.37;
    const ifault = 230 / zs;

    renderResultsUI([
      { id: 'res_m12_zs', label: 'Total Loop Zs (Hot)', value: `${zs.toFixed(3)} Ω`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m12_max', label: `Max Allowed Zs (${mcbKey.replace('_', 'A ')})`, value: `${maxZs.toFixed(2)} Ω` },
      { id: 'res_m12_if', label: 'Earth Fault Current If', value: `${ifault.toFixed(1)} A`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_m12_r1r2', label: '1.2 × (R₁ + R₂)', value: `${r1r2Hot.toFixed(3)} Ω` }
    ], statusBanner(zs <= maxZs, zs <= maxZs
      ? `✓ Touch Voltage Safe: Zs (${zs.toFixed(3)} Ω) ≤ Max Zs (${maxZs.toFixed(2)} Ω) — Disconnects in < 0.4s.`
      : `✕ FAIL: Zs (${zs.toFixed(3)} Ω) exceeds ${maxZs.toFixed(2)} Ω! Increase CPC or upgrade cable size.`), [
      `R₁ (Phase ${sPhase} mm²) = 0.0175 × ${len} / ${sPhase} = ${r1.toFixed(3)} Ω`,
      `R₂ (CPC ${sCpc} mm²) = 0.0175 × ${len} / ${sCpc} = ${r2.toFixed(3)} Ω`,
      `Zs = Ze + ${stdMeta.tempMult} × (R₁ + R₂) = ${ze} + ${r1r2Hot.toFixed(3)} = ${zs.toFixed(3)} Ω`,
      `Fault Current If = U₀ / Zs = 230 / ${zs.toFixed(3)} = ${ifault.toFixed(1)} A`
    ]);
  }

  else if (id === 'mod_tx') {
    const v1 = Math.max(0.4, num('m4_v1', 132));
    const v2 = Math.max(0.23, num('m4_v2', 33));
    const loadMva = Math.max(0.01, num('m4_loadMva', 50));
    const pf = Math.min(1, Math.max(0.1, num('m4_pf', 0.85)));
    const growth = Math.max(0, num('m4_growth', 15));
    const zpct = Math.max(0.5, num('m4_zpct', 12.5));

    const sReq = loadMva * (1 + growth / 100);
    const ratings = [0.025, 0.05, 0.1, 0.2, 0.315, 0.5, 0.63, 0.8, 1.0, 1.6, 2.0, 2.5, 3.15, 5.0, 8.0, 10, 16, 20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315];
    const chosen = ratings.find(r => r >= sReq) || ratings[ratings.length - 1];

    const ihv = (chosen * 1e6) / (Math.sqrt(3) * v1 * 1e3);
    const ilv = (chosen * 1e6) / (Math.sqrt(3) * v2 * 1e3);
    const zPu = zpct / 100;
    const zOhmsLv = zPu * (Math.pow(v2, 2) / chosen);
    const iscLvKa = (ilv / zPu) / 1000;

    renderResultsUI([
      { id: 'res_m4_rating', label: 'Standard IEC Rating', value: chosen < 1 ? `${(chosen * 1000).toFixed(0)} kVA` : `${chosen.toFixed(1)} MVA`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m4_ihv', label: `Primary FLC (${v1} kV)`, value: `${ihv.toFixed(1)} A`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_m4_ilv', label: `Secondary FLC (${v2} kV)`, value: `${ilv.toFixed(1)} A` },
      { id: 'res_m4_isc', label: `LV Fault / Z_LV`, value: `${iscLvKa.toFixed(2)} kA • ${zOhmsLv.toFixed(3)} Ω` }
    ], statusBanner(true, `Loading: ${((loadMva / chosen) * 100).toFixed(1)}% | Active: ${(loadMva * pf).toFixed(1)} MW | Reactive: ${(loadMva * Math.sin(Math.acos(pf))).toFixed(1)} MVAr`), [
      `Required S_req = ${loadMva} × (1 + ${growth}/100) = ${sReq.toFixed(2)} MVA → Selected ${chosen} MVA`,
      `I_HV = (${chosen} × 10⁶) / (√3 × ${v1} × 10³) = ${ihv.toFixed(1)} A`,
      `I_LV = (${chosen} × 10⁶) / (√3 × ${v2} × 10³) = ${ilv.toFixed(1)} A`,
      `LV Ohmic Impedance Z_LV = (${zpct}/100) × (${v2}² / ${chosen}) = ${zOhmsLv.toFixed(4)} Ω`,
      `Bolted LV Fault Current I_sc = I_LV / Z_pu = ${iscLvKa.toFixed(2)} kA`
    ]);
  }

  else if (id === 'mod_fault') {
    const vkv = Math.max(0.4, num('m5_vkv', 33));
    const txMva = Math.max(0.1, num('m5_txMva', 63));
    const zpct = Math.max(0.5, num('m5_zpct', 12.5));
    const gridMva = Math.max(10, num('m5_gridMva', 2500));
    const spacing = Math.max(50, num('m5_spacing', 1500));
    const span = Math.max(0.5, num('m5_span', 5.0));

    const baseMva = 100;
    const ztx = (zpct / 100) * (baseMva / txMva);
    const zgrid = baseMva / gridMva;
    const ztot = ztx + zgrid;

    const isc = baseMva / (Math.sqrt(3) * vkv * ztot);
    const fMva = Math.sqrt(3) * vkv * isc;
    const ipeak = 2.55 * isc; // IEC 60909 kappa*sqrt(2) = 1.8*1.414 ≈ 2.55

    const aM = spacing / 1000;
    const fm = (2e-7 * Math.pow(ipeak * 1e3, 2)) / aM;
    const ftot = fm * span;

    renderResultsUI([
      { id: 'res_m5_isc', label: 'Symmetrical Fault Ik″', value: `${isc.toFixed(2)} kA rms`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m5_ipeak', label: 'Peak Making Current ip', value: `${ipeak.toFixed(2)} kA peak` },
      { id: 'res_m5_mva', label: 'Short-Circuit Level', value: `${fMva.toFixed(1)} MVA` },
      { id: 'res_m5_force', label: 'Busbar Peak Force', value: `${(ftot / 1000).toFixed(2)} kN (${fm.toFixed(0)} N/m)`, color: ftot < 8000 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600' }
    ], '', [
      `On 100 MVA Base: Z_tx = ${ztx.toFixed(4)} pu, Z_grid = ${zgrid.toFixed(4)} pu → Z_tot = ${ztot.toFixed(4)} pu`,
      `Ik″ = 100 / (√3 × ${vkv} × ${ztot.toFixed(4)}) = ${isc.toFixed(2)} kA rms`,
      `Peak Current ip = 2.55 × Ik″ = ${ipeak.toFixed(2)} kA (κ ≈ 1.80)`,
      `IEC 60865 Force Fm = 2×10⁻⁷ × ip² / a = ${fm.toFixed(1)} N/m → F_span = ${ftot.toFixed(0)} N`
    ]);
  }

  else if (id === 'mod_ct') {
    const ipri = Math.max(10, num('m9_ipri', 800));
    const isec = num('m9_isec', 1);
    const ifault = Math.max(0.5, num('m9_ifault', 31.5));
    const rct = Math.max(0.05, num('m9_rct', 4.0));
    const leadLen = Math.max(1, num('m9_leadLen', 60));
    const leadSize = num('m9_leadSize', 4.0);
    const relayVa = Math.max(0.01, num('m9_relayVa', 0.5));
    const xr = Math.max(1, num('m9_xr', 2.0));

    const ratio = ipri / isec;
    const ifSec = (ifault * 1000) / ratio;
    const rLead = (2 * 0.0175 * leadLen) / leadSize; // Loop lead resistance (go + return)
    const rRelay = relayVa / (isec * isec);
    const vk = xr * ifSec * (rct + rLead + rRelay);

    renderResultsUI([
      { id: 'res_m9_ifsec', label: 'Secondary Fault I_f,sec', value: `${ifSec.toFixed(2)} A` },
      { id: 'res_m9_rlead', label: 'Loop Lead + Relay R', value: `${(rLead + rRelay).toFixed(3)} Ω` },
      { id: 'res_m9_vk', label: 'Required Knee-Point Vk', value: `${vk.toFixed(1)} V`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m9_rec', label: 'Recommended Spec', value: `Class PX, Vk ≥ ${Math.ceil(vk / 50) * 50} V`, color: 'text-emerald-600 dark:text-emerald-400' }
    ], '', [
      `CT Ratio = ${ipri}/${isec} = ${ratio}:1 → I_f,sec = ${ifault * 1000} / ${ratio} = ${ifSec.toFixed(2)} A`,
      `Loop Lead Resistance R_lead = 2 × 0.0175 × ${leadLen} / ${leadSize} = ${rLead.toFixed(3)} Ω`,
      `Relay Resistance R_relay = ${relayVa} / ${isec}² = ${rRelay.toFixed(3)} Ω`,
      `Required Knee-Point Vk = K × I_f,sec × (R_ct + R_lead + R_relay) = ${xr} × ${ifSec.toFixed(2)} × ${(rct + rLead + rRelay).toFixed(3)} = ${vk.toFixed(1)} V`
    ]);
  }

  else if (id === 'mod_idmt') {
    const curve = str('mid_curve', 'SI');
    const is = Math.max(1, num('mid_is', 400));
    const ifault = Math.max(1, num('mid_if', 4000));
    const tms = Math.max(0.01, num('mid_tms', 0.25));

    const curves = {
      SI:  { name: 'Standard Inverse',  k: 0.14,  a: 0.02 },
      VI:  { name: 'Very Inverse',      k: 13.5,  a: 1.0  },
      EI:  { name: 'Extremely Inverse', k: 80.0,  a: 2.0  },
      LTI: { name: 'Long Time Inverse', k: 120.0, a: 1.0  }
    };
    const c = curves[curve] || curves.SI;
    const psm = ifault / is;
    const tripTime = psm > 1 ? tms * (c.k / (Math.pow(psm, c.a) - 1)) : Infinity;

    renderResultsUI([
      { id: 'res_mid_psm', label: 'Plug Setting Multiplier (PSM)', value: `${psm.toFixed(2)} × Is` },
      { id: 'res_mid_time', label: 'Relay Operating Time t', value: isFinite(tripTime) ? `${tripTime.toFixed(3)} s` : 'No Trip (If ≤ Is)', color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_mid_curve', label: 'IEC 60255 Constants', value: `k = ${c.k}, α = ${c.a}` },
      { id: 'res_mid_ms', label: 'Trip Time (ms)', value: isFinite(tripTime) ? `${Math.round(tripTime * 1000)} ms` : '—' }
    ], isFinite(tripTime)
      ? statusBanner(true, `✓ ${c.name} trips in ${tripTime.toFixed(3)} s (${Math.round(tripTime * 1000)} ms) at ${psm.toFixed(2)}× pickup.`)
      : statusBanner(false, `⚠ Fault current (${ifault} A) does not exceed pickup setting (${is} A).`), [
      `PSM = If / Is = ${ifault} / ${is} = ${psm.toFixed(2)}`,
      `IEC 60255 Formula: t = TMS × [ k / (PSM^α − 1) ]`,
      `t = ${tms} × [ ${c.k} / (${psm.toFixed(2)}^${c.a} − 1) ] = ${isFinite(tripTime) ? tripTime.toFixed(3) + ' s' : '∞'}`
    ]);
  }

  else if (id === 'mod_arrester') {
    const vn = num('m10_vn', 132);
    const earthing = str('m10_earthing', 'solid');
    const bil = Math.max(75, num('m10_bil', 650));

    const umMap = { 11: 12, 33: 36, 66: 72.5, 132: 145, 220: 245, 400: 420 };
    const um = umMap[vn] || vn * 1.1;
    const kEarth = earthing === 'solid' ? 1.4 : 1.73;

    const mcovMin = (um / Math.sqrt(3)) * 1.05;
    const urMin = kEarth * (um / Math.sqrt(3));
    const stdMap = {
      11: { ur: 9, mcov: 7.65, upl: 30, ka: 10 },
      33: { ur: 30, mcov: 24.4, upl: 90, ka: 10 },
      66: { ur: 60, mcov: 48, upl: 165, ka: 10 },
      132: { ur: 120, mcov: 98, upl: 320, ka: 10 },
      220: { ur: 198, mcov: 158, upl: 510, ka: 10 },
      400: { ur: 360, mcov: 288, upl: 850, ka: 20 }
    };
    const stdLA = stdMap[vn] || { ur: Math.ceil(urMin), mcov: Math.ceil(mcovMin), upl: Math.ceil(urMin * 2.6), ka: 10 };
    const bilMarginPct = ((bil - stdLA.upl) / stdLA.upl) * 100;

    renderResultsUI([
      { id: 'res_m10_mcov', label: 'Min Required MCOV', value: `${mcovMin.toFixed(1)} kV rms` },
      { id: 'res_m10_ur', label: 'Min Rated Ur (TOV)', value: `${urMin.toFixed(1)} kV rms` },
      { id: 'res_m10_std', label: 'Standard IEC Arrester', value: `${stdLA.ur} kV / ${stdLA.ka} kA`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m10_margin', label: 'BIL Protection Margin', value: `${bilMarginPct.toFixed(1)}% (Upl ≈ ${stdLA.upl} kVp)`, color: bilMarginPct >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }
    ], statusBanner(bilMarginPct >= 20, bilMarginPct >= 20
      ? `✓ Insulation Coordination Safe: BIL (${bil} kVp) gives ${bilMarginPct.toFixed(1)}% margin above Upl (${stdLA.upl} kVp) ≥ 20%.`
      : `⚠ BIL Margin ${bilMarginPct.toFixed(1)}% is below recommended 20% minimum!`), [
      `Highest System Voltage Um = ${um} kV → Phase-to-Ground = ${(um / Math.sqrt(3)).toFixed(2)} kV`,
      `Min MCOV = 1.05 × (Um / √3) = ${mcovMin.toFixed(1)} kV rms`,
      `Min Rated Voltage Ur = ${kEarth} × (Um / √3) = ${urMin.toFixed(1)} kV rms`,
      `BIL Margin = (BIL − Upl) / Upl = (${bil} − ${stdLA.upl}) / ${stdLA.upl} = ${bilMarginPct.toFixed(1)}%`
    ]);
  }

  else if (id === 'mod_battery') {
    const vdc = num('mbat_vdc', 110);
    const icont = Math.max(0.5, num('mbat_icont', 15));
    const hrs = Math.max(1, num('mbat_ihours', 8));
    const itrip = Math.max(0, num('mbat_itrip', 35));
    const aging = Math.max(1, num('mbat_aging', 1.25));
    const design = Math.max(1, num('mbat_design', 1.15));

    const contAh = icont * hrs;
    const momAh = itrip * 0.25; // Equivalent 15-min momentary allowance
    const rawAh = contAh + momAh;
    const reqAh = rawAh * aging * design;
    const stdAhList = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200];
    const chosenAh = stdAhList.find(a => a >= reqAh) || 1200;
    const cells = vdc === 110 ? 55 : vdc === 220 ? 108 : 24; // 2V Lead-Acid VRLA cells

    renderResultsUI([
      { id: 'res_mbat_raw', label: 'Uncorrected Load Ah', value: `${rawAh.toFixed(1)} Ah` },
      { id: 'res_mbat_req', label: 'Factored Required Ah', value: `${reqAh.toFixed(1)} Ah` },
      { id: 'res_mbat_std', label: 'Standard Battery Bank', value: `${vdc} V / ${chosenAh} Ah`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_mbat_cells', label: '2V VRLA Cell Count', value: `${cells} Cells`, color: 'text-emerald-600 dark:text-emerald-400' }
    ], '', [
      `Continuous Capacity = ${icont} A × ${hrs} h = ${contAh.toFixed(1)} Ah`,
      `Momentary Trip Allowance = ${itrip} A × 0.25 h = ${momAh.toFixed(1)} Ah`,
      `IEEE 485 Sizing = ${rawAh.toFixed(1)} × ${aging} (Aging) × ${design} (Design) = ${reqAh.toFixed(1)} Ah → Selected ${chosenAh} Ah`
    ]);
  }

  else if (id === 'mod_hvcable') {
    const vkv = num('m6_vkv', 132);
    const mat = str('m6_mat', 'Cu_XLPE');
    const iload = Math.max(10, num('m6_iload', 450));
    const isc = Math.max(1, num('m6_isc', 25));
    const tfault = Math.max(0.05, num('m6_tfault', 1.0));
    const laying = num('m6_laying', 0.88);
    const runs = num('m6_runs', 1);

    const kFactor = mat === 'Al_XLPE' ? 94 : 143;
    const sMinFault = (isc * 1000 * Math.sqrt(tfault)) / kFactor;
    const iPerRun = iload / runs;

    // Realistic Cu/Al XLPE ampacity table (approx continuous rating in air before derating)
    const xlpeTable = [
      { size: 50, cu: 210, al: 165 }, { size: 70, cu: 265, al: 205 }, { size: 95, cu: 325, al: 250 },
      { size: 120, cu: 375, al: 290 }, { size: 150, cu: 430, al: 330 }, { size: 185, cu: 495, al: 380 },
      { size: 240, cu: 585, al: 450 }, { size: 300, cu: 670, al: 515 }, { size: 400, cu: 785, al: 605 },
      { size: 500, cu: 900, al: 695 }, { size: 630, cu: 1030, al: 800 }, { size: 800, cu: 1170, al: 910 },
      { size: 1000, cu: 1310, al: 1020 }
    ];
    const key = mat === 'Al_XLPE' ? 'al' : 'cu';
    const rowCont = xlpeTable.find(r => (r[key] * laying) >= iPerRun) || xlpeTable[xlpeTable.length - 1];
    const finalSize = Math.max(rowCont.size, sMinFault);
    const recRow = xlpeTable.find(r => r.size >= finalSize) || xlpeTable[xlpeTable.length - 1];

    renderResultsUI([
      { id: 'res_m6_smin', label: 'Min Fault Area (I²t)', value: `${sMinFault.toFixed(1)} mm²` },
      { id: 'res_m6_scont', label: 'Continuous Ampacity Size', value: `${rowCont.size} mm²` },
      { id: 'res_m6_rec', label: `Recommended (${vkv} kV)`, value: `${runs}× ${recRow.size} mm² ${mat.replace('_', ' ')}`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m6_amp', label: 'Derated Bank Capacity', value: `${(recRow[key] * laying * runs).toFixed(0)} A`, color: 'text-emerald-600 dark:text-emerald-400' }
    ], '', [
      `Adiabatic Formula (IEC 60949): S_min = (Isc × √t) / k = (${isc * 1000} × √${tfault}) / ${kFactor} = ${sMinFault.toFixed(1)} mm²`,
      `Required Current per Run = ${iload} / ${runs} = ${iPerRun.toFixed(1)} A (Derating factor ${laying})`,
      `Governing Criterion: max(${sMinFault.toFixed(1)} mm², ${rowCont.size} mm²) → Selected ${runs}× ${recRow.size} mm²`
    ]);
  }

  else if (id === 'mod_pulling') {
    const w = Math.max(0.5, num('m14_weight', 12.5));
    const len = Math.max(1, num('m14_len', 250));
    const mu = Math.max(0.05, num('m14_mu', 0.25));
    const deg = num('m14_bendAngle', 90);
    const rad = Math.max(0.5, num('m14_radius', 2.5));

    const t1Kn = (mu * w * 9.81 * len) / 1000;
    const theta = (deg * Math.PI) / 180;
    const t2Kn = t1Kn * Math.exp(mu * theta);
    const swbp = deg > 0 ? t2Kn / rad : 0;
    const safe = swbp <= 7.3;

    renderResultsUI([
      { id: 'res_m14_t1', label: 'Straight Tension T₁', value: `${t1Kn.toFixed(2)} kN` },
      { id: 'res_m14_t2', label: 'Exit Tension T₂ (w/ Bend)', value: `${t2Kn.toFixed(2)} kN`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m14_swbp', label: 'Sidewall Pressure (SWBP)', value: `${swbp.toFixed(2)} kN/m`, color: safe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' },
      { id: 'res_m14_lim', label: 'IEEE 525 Max Limit', value: `7.30 kN/m` }
    ], statusBanner(safe, safe
      ? `✓ Safe Pulling Geometry: SWBP (${swbp.toFixed(2)} kN/m) ≤ 7.30 kN/m crush threshold.`
      : `⚠ High SWBP (${swbp.toFixed(2)} kN/m)! Increase bend radius R or pull from opposite end.`), [
      `T₁ = μ · w · g · L = ${mu} × ${w} × 9.81 × ${len} = ${t1Kn.toFixed(2)} kN`,
      `T₂ = T₁ · e^(μ · θ) = ${t1Kn.toFixed(2)} × e^(${mu} × ${theta.toFixed(3)}) = ${t2Kn.toFixed(2)} kN`,
      `SWBP = T₂ / R = ${t2Kn.toFixed(2)} / ${rad} = ${swbp.toFixed(2)} kN/m`
    ]);
  }

  else if (id === 'mod_txline') {
    const vkv = num('m8_vkv', 132);
    const len = Math.max(1, num('m8_len', 85));
    const rkm = Math.max(0.001, num('m8_rkm', 0.12));
    const xkm = Math.max(0.001, num('m8_xkm', 0.39));
    const zc = Math.max(50, num('m8_zc', 380));
    const span = Math.max(20, num('m8_span', 300));
    const wkg = Math.max(0.1, num('m8_wkg', 1.15));
    const tKn = Math.max(1, num('m8_tension', 22.0));

    const rTot = rkm * len;
    const xTot = xkm * len;
    const zMag = Math.hypot(rTot, xTot);
    const sil = (vkv * vkv) / zc;

    let stClair = 1.0;
    if (len <= 80) stClair = 2.5 - (len / 80) * 0.7;
    else if (len <= 250) stClair = 1.8 - ((len - 80) / 170) * 0.6;
    else stClair = Math.max(0.7, 1.2 - ((len - 250) / 350) * 0.5);

    const wN = wkg * 9.81;
    const sagM = (wN * span * span) / (8 * tKn * 1000);

    renderResultsUI([
      { id: 'res_m8_z', label: 'Total Line Impedance Z', value: `${rTot.toFixed(1)} + j${xTot.toFixed(1)} Ω (|${zMag.toFixed(1)}|)` },
      { id: 'res_m8_sil', label: 'Surge Impedance Loading', value: `${sil.toFixed(2)} MW`, color: 'text-cerulean dark:text-[#38BDF8]' },
      { id: 'res_m8_lim', label: `St. Clair Limit (${stClair.toFixed(2)}×)`, value: `${(sil * stClair).toFixed(1)} MW`, color: 'text-emerald-600 dark:text-emerald-400' },
      { id: 'res_m8_sag', label: `Parabolic Sag (${span}m Span)`, value: `${sagM.toFixed(2)} m` }
    ], '', [
      `Total Line Impedance Z = (${rkm} + j${xkm}) × ${len} km = ${rTot.toFixed(2)} + j${xTot.toFixed(2)} Ω`,
      `Surge Impedance Loading SIL = V² / Zc = ${vkv}² / ${zc} = ${sil.toFixed(2)} MW`,
      `St. Clair Thermal/Stability Limit (${len} km) ≈ ${stClair.toFixed(2)} × SIL = ${(sil * stClair).toFixed(1)} MW`,
      `Parabolic Sag D = (w · g · S²) / (8 · T) = (${wkg} × 9.81 × ${span}²) / (8 × ${tKn * 1000}) = ${sagM.toFixed(2)} m`
    ]);
  }
}

/* =========================================================================
   COPY REPORT & PRINT / SAVE PDF CALCULATION SHEET
   ========================================================================= */
function copyActiveReport() {
  const mod = CALC_CATALOG.find(c => c.id === window.activeCalcId);
  if (!mod) return;

  let text = `===========================================================\n`;
  text += `ANISH NIROULA — ENGINEERING CALCULATION REPORT\n`;
  text += `Module: ${mod.title}\n`;
  text += `Basis: ${mod.usesStandard ? STD_INFO[window.currentCalcStandard].label : mod.badge}\n`;
  text += `===========================================================\n\nRESULTS:\n`;

  document.querySelectorAll('#activeCalcResults > div').forEach(card => {
    const k = card.children[0]?.innerText || '';
    const v = card.children[1]?.innerText || '';
    text += `• ${k}: ${v}\n`;
  });

  text += `\nVERIFICATION STEPS:\n`;
  document.querySelectorAll('#activeCalcSteps > div').forEach(step => {
    text += `${step.innerText}\n`;
  });

  text += `\n---\nGenerated at anish-niroula.com.np | NEC License Reg. No. 1977`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => alert('Calculation report copied to clipboard!'));
  }
}

function printCalcSheet() {
  window.print();
}
