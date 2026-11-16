/* =========================================================================
   ANISH NIROULA — ELECTRICAL ENGINEERING PORTFOLIO (aniroula.com.np)
   DATA LAYER: CAREER BAYS, ACADEMIC NODES, CASE STUDIES & PHOTO SLOTS
   ========================================================================= */

const NEC_LICENSE_URL = "https://nec.gov.np/registration/1977?programName=Electrical%20%26%20Electronics%20Engineering";
const LINKEDIN_URL = "https://www.linkedin.com/in/anish-niroula-bb448713a/";

/* -------------------------------------------------------------------------
   STATIC IMAGE PATH REGISTRY WITH LOCAL FALLBACK
   ------------------------------------------------------------------------- */
const STATIC_IMAGE_REGISTRY = {
  slot_portrait: 'assets/images/portrait.jpg',
  slot_field_banner: 'assets/images/banner-corridor.jpg',
  slot_prasauni: 'assets/images/prasauni-132kv.jpg',
  slot_chilime: 'assets/images/chilime-220kv.jpg',
  slot_nagdhunga: 'assets/images/nagdhunga-11kv.jpg',
  slot_samundratar: 'assets/images/samundratar-132kv.jpg',
  slot_trishuli3b: 'assets/images/trishuli3b-220kv.jpg'
};

/* -------------------------------------------------------------------------
   CAREER SLD BAYS (4 EXCLUSIVE EPC ROLES)
   ------------------------------------------------------------------------- */
const BAY_X = { bay01: 165, bay02: 441, bay03: 717, bay04: 993 };

const CAREER_BAYS = {
  bay01: {
    id: 'bay01',
    ds: 'DS-01',
    cb: 'CB-01',
    period: 'Oct 2018 – Aug 2021',
    role: 'Electrical Project Engineer',
    company: 'ETERN-CCCE-FEPEC Joint Venture',
    project: 'Samundratar – Trishuli 3B Hub 132 kV Transmission Line & Substation Project (Nuwakot — EIB & ADB Funded)',
    funding: 'European Investment Bank (EIB) & Asian Development Bank (ADB) Funded',
    bullets: [
      'Supervised construction, drawing verification, switchgear and power transformer installation, testing, and commissioning for the 132/33 kV Substation at Samundratar, Nuwakot.',
      'Directed field execution, tower erection quality checks, and conductor stringing supervision along the 26 km double-circuit 132 kV transmission line to Trishuli 3B Hub.',
      'Prepared technical submittals, QA/QC documentation, and commissioning test records under EIB and ADB engineering standards.'
    ],
    photoSlot: 'slot_samundratar',
    photoTitle: 'Samundratar – Trishuli 3B 132 kV Line & Substation'
  },
  bay02: {
    id: 'bay02',
    ds: 'DS-02',
    cb: 'CB-02',
    period: 'Aug 2021 – Mar 2022',
    role: 'Electrical Engineer',
    company: 'Cosmic Electrical Engineering Associates Pvt. Ltd.',
    project: 'Nagdhunga Tunnel 11 kV Underground Cabling (JICA / Hazama Ando) & Sanima Middle Tamor 220 kV Transmission Line Project (73 MW, Taplejung)',
    funding: 'Japan International Cooperation Agency (JICA) & Private Hydropower EPC',
    bullets: [
      'Executed 11 kV underground cabling and civil/electrical equipment installation for the JICA-funded Nagdhunga Tunnel Construction Project under main contractor Hazama Ando Corporation.',
      'Supervised 220 kV transmission line electrical engineering and high-altitude line construction for the 73 MW Sanima Middle Tamor Hydropower Project in Taplejung.',
      'Verified electrical layout drawings, medium-voltage cable terminations, and site safety compliance.'
    ],
    photoSlot: 'slot_nagdhunga',
    photoTitle: 'Nagdhunga Tunnel 11 kV Cabling & Tamor 220 kV'
  },
  bay03: {
    id: 'bay03',
    ds: 'DS-03',
    cb: 'CB-03',
    period: 'Mar 2022 – Jun 2023',
    role: 'Assistant Manager (Substations)',
    company: 'Global Electro Mechanical Works',
    project: '220/132/33 kV Chilime Hub New GIS (Part-I) & 220(Hybrid)/132/33 kV Trishuli-3B Hub New AIS (Part-II) Substations (Rasuwa — EIB, KfW & ADB Funded; Pinggao Group)',
    funding: 'EIB, KfW Development Bank & ADB Funded (Main Contractor: Pinggao Group Co., Ltd.)',
    bullets: [
      'Directed substation installation, SF6 GIS bay erection, power transformer assembly, testing, and pre-commissioning across both 220 kV hub substations in Rasuwa.',
      'Prepared Joint Measurement Certificates (JMC), running bills, and commercial reconciliation with Pinggao Group Co., Ltd. and Nepal Electricity Authority (NEA).',
      'Coordinated protection/control panel wiring checks, HV dielectric testing, and switchyard commissioning schedules.'
    ],
    photoSlot: 'slot_chilime',
    photoTitle: '220 kV Chilime Hub GIS & Trishuli-3B Hybrid AIS'
  },
  bay04: {
    id: 'bay04',
    ds: 'DS-04',
    cb: 'CB-04',
    period: 'Jun 2023 – Present',
    role: 'Senior Project Engineer',
    company: 'China Railway No.2 Engineering Group Co., Ltd. (CREGC)',
    project: 'Prasauni – Birgunj 132 kV Underground Electricity Transmission Line Project (132/33/11 kV AIS, 132/66 kV GIS & 4 km 800 sq.mm Double-Circuit 132 kV XLPE UG Line)',
    funding: 'National High-Voltage Urban Substation & Underground Transmission EPC',
    bullets: [
      'Leading engineering design review, QA/QC compliance, contract administration, and site execution for the 132/33/11 kV AIS Substation and 132/66 kV GIS Substation.',
      'Supervising civil duct-bank construction, 4 km 800 sq.mm double-circuit 132 kV XLPE underground cable pulling, straight-through jointing bays, cross-bonding, and GIS/AIS terminations.',
      'Managing testing and commissioning procedures, HSE compliance, and multidisciplinary site engineering teams.'
    ],
    photoSlot: 'slot_prasauni',
    photoTitle: 'Prasauni – Birgunj 132 kV GIS/AIS & 800 mm² UG Line'
  }
};

/* -------------------------------------------------------------------------
   ACADEMIC & LICENSURE TRANSMISSION ROUTE (T-01 to T-04 + NEC-1977)
   ------------------------------------------------------------------------- */
const ACADEMIC_NODES = {
  t01: {
    id: 't01',
    code: 'TOWER T-01',
    level: 'SECONDARY EDUCATION',
    year: '2011',
    degree: 'School Leaving Certificate (SLC)',
    institution: 'Everest Secondary English School',
    location: 'Biratnagar, Nepal',
    spanIds: [],
    details: 'Completed secondary-level foundation in mathematics, physical sciences, and English at Everest Secondary English School, Biratnagar.'
  },
  t02: {
    id: 't02',
    code: 'TOWER T-02',
    level: 'HIGHER SECONDARY EDUCATION',
    year: '2011 – 2013',
    degree: 'GCE A-Levels (Cambridge International Examinations — CIE)',
    institution: "King's College",
    location: 'Kathmandu, Nepal',
    spanIds: ['acad-span-1'],
    details: 'Completed Cambridge International A-Levels with focus on Physics, Mathematics, and analytical problem-solving.'
  },
  t03: {
    id: 't03',
    code: 'TOWER T-03',
    level: 'UNDERGRADUATE DEGREE',
    year: '2014 – 2018',
    degree: 'Bachelor of Engineering (B.E.) in Electrical & Electronics Engineering',
    institution: 'Nepal Engineering College (Affiliated to Pokhara University)',
    location: 'Bhaktapur, Nepal',
    spanIds: ['acad-span-1', 'acad-span-2'],
    details: 'Comprehensive undergraduate engineering education in high-voltage engineering, electrical machines, power system protection, switchgear design, and transmission/distribution networks.'
  },
  t04: {
    id: 't04',
    code: 'TOWER T-04',
    level: 'POSTGRADUATE DEGREE',
    year: 'Graduated 2023',
    degree: 'Master of Business Administration (MBA) — Operations Management',
    institution: 'Indira Gandhi National Open University (IGNOU)',
    location: 'Operations & Infrastructure Management',
    spanIds: ['acad-span-1', 'acad-span-2', 'acad-span-3'],
    details: 'Graduate management degree specializing in operations management, supply chain coordination, project cost control, and commercial contract administration.'
  },
  nec1977: {
    id: 'nec1977',
    code: 'RECEIVING TERMINAL NEC-1977',
    level: 'STATUTORY ENGINEERING LICENSURE',
    year: 'Registered Electrical & Electronics Engineer',
    degree: 'Nepal Engineering Council — License Registration No. 1977',
    institution: 'Nepal Engineering Council (NEC)',
    location: 'Kathmandu, Nepal',
    spanIds: ['acad-span-1', 'acad-span-2', 'acad-span-3', 'acad-span-4'],
    details: 'Statutory registered Electrical & Electronics Engineer (Registration No. 1977) authorized for high-voltage substation and transmission line engineering design, site supervision, testing, and commissioning.'
  }
};

/* -------------------------------------------------------------------------
   SITE PHOTO ARCHIVE SLOTS
   ------------------------------------------------------------------------- */
const ARCHIVE_SLOTS = [
  { key: 'slot_portrait', label: '01 • Portrait', title: 'On-Site Helmet Portrait', desc: 'Substations & Transmission Field Leadership' },
  { key: 'slot_prasauni', label: '02 • 132 kV GIS / UG', title: 'Prasauni – Birgunj 132 kV GIS & UG', desc: '132/66 kV GIS Hall & 800 sq.mm XLPE Underground Line' },
  { key: 'slot_chilime', label: '03 • 220 kV GIS', title: 'Chilime Hub 220/132/33 kV GIS', desc: 'SF6 GIS Bay Assembly & Transformer Installation, Rasuwa' },
  { key: 'slot_trishuli3b', label: '04 • 220 kV Hybrid AIS', title: 'Trishuli-3B Hub 220 kV Hybrid AIS', desc: 'Switchyard Commissioning & HV Testing, Rasuwa' },
  { key: 'slot_nagdhunga', label: '05 • 11 kV Tunnel', title: 'Nagdhunga Tunnel 11 kV Cabling', desc: 'Underground Tunnel Electrical Installation (JICA)' },
  { key: 'slot_samundratar', label: '06 • 132 kV OHL', title: 'Samundratar – Trishuli 3B 132 kV', desc: '132/33 kV Substation & 26 km Double-Circuit Line' }
];
