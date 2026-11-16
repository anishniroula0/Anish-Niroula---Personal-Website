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
  slot_portrait: 'assets/images/portrait.jpg?v=3.0',
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
    photoTitle: 'Samundratar – Trishuli 3B 132 kV Line & Substation',
    defaultPhotos: [
      {
        id: 'bay01_p1',
        src: 'assets/images/samundratar-132kv.jpg',
        title: 'Samundratar 132/33 kV Substation Yard',
        caption: '132/33 kV switchyard equipment erection and power transformer pre-commissioning (Nuwakot).'
      },
      {
        id: 'bay01_p2',
        src: 'assets/images/banner-corridor.jpg',
        title: '26 km Double-Circuit 132 kV Transmission Towers',
        caption: 'Lattice tower assembly and conductor stringing along mountain corridors to Trishuli 3B Hub.'
      },
      {
        id: 'bay01_p3',
        src: 'assets/images/samundratar-control.jpg',
        title: 'Control & Relay Protection Panel Testing',
        caption: 'Substation secondary wiring verification, CT/PT injection, and trip circuit interlocks.'
      }
    ]
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
    photoTitle: 'Nagdhunga Tunnel 11 kV Cabling & Tamor 220 kV',
    defaultPhotos: [
      {
        id: 'bay02_p1',
        src: 'assets/images/nagdhunga-11kv.jpg',
        title: 'Nagdhunga Tunnel 11 kV Underground Cabling',
        caption: 'Medium-voltage power cable pulling and bracket installation inside the main tunnel (JICA).'
      },
      {
        id: 'bay02_p2',
        src: 'assets/images/tamor-220kv.jpg',
        title: 'Middle Tamor 220 kV High-Altitude Transmission',
        caption: 'Tower foundation and line supervision across rugged Himalayan slopes for 73 MW evacuation.'
      },
      {
        id: 'bay02_p3',
        src: 'assets/images/nagdhunga-switchgear.jpg',
        title: 'Tunnel Medium-Voltage Switchgear Installation',
        caption: 'Distribution switchboards, vacuum circuit breaker alignments, and Japanese standard HSE.'
      }
    ]
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
    photoTitle: '220 kV Chilime Hub GIS & Trishuli-3B Hybrid AIS',
    defaultPhotos: [
      {
        id: 'bay03_p1',
        src: 'assets/images/chilime-220kv.jpg',
        title: 'Chilime Hub 220 kV SF6 GIS Bay Assembly',
        caption: 'High-altitude SF6 gas insulated switchgear module alignment and vacuum treatment (Pinggao Group).'
      },
      {
        id: 'bay03_p2',
        src: 'assets/images/trishuli3b-220kv.jpg',
        title: 'Trishuli-3B Hub 220 kV Hybrid AIS Switchyard',
        caption: 'High-voltage gantry erection, busbar clamping, and CT/PT instrument transformer testing.'
      },
      {
        id: 'bay03_p3',
        src: 'assets/images/chilime-transformer.jpg',
        title: '220/132/33 kV Main Power Transformer Installation',
        caption: 'Bushing mounting, oil filtration, and dielectric breakdown testing at mountain site.'
      }
    ]
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
    photoTitle: 'Prasauni – Birgunj 132 kV GIS/AIS & 800 mm² UG Line',
    defaultPhotos: [
      {
        id: 'bay04_p1',
        src: 'assets/images/prasauni-132kv.jpg',
        title: 'Prasauni 132/66 kV GIS Hall & Building',
        caption: '132 kV indoor gas-insulated switchgear building civil execution and equipment layout (CREGC).'
      },
      {
        id: 'bay04_p2',
        src: 'assets/images/prasauni-cable.jpg',
        title: '800 sq.mm XLPE 132 kV Underground Cable Pulling',
        caption: 'Duct-bank cable pulling, motorized winching, and tension monitoring along Birgunj commercial corridor.'
      },
      {
        id: 'bay04_p3',
        src: 'assets/images/prasauni-jointing.jpg',
        title: '132 kV Straight-Through Jointing Bay Execution',
        caption: 'Cleanroom jointing tent, screen interruption, and cross-bonding link box installation.'
      },
      {
        id: 'bay04_p4',
        src: 'assets/images/prasauni-yard.jpg',
        title: '132/33/11 kV AIS Outdoor Switchyard Gantry',
        caption: 'Outdoor air-insulated switchgear foundation, tubular busbars, and disconnect switch alignment.'
      }
    ]
  }
};

/* -------------------------------------------------------------------------
   ACADEMIC & LICENSURE TRANSMISSION ROUTE (VOLTAGE ESCALATION)
   400V Distribution -> 11kV Distribution -> 33kV Sub-Transmission -> 
   132/220kV Grid Licensure (NEC-1977) -> Grid Operations & Management Hub (MBA)
   ------------------------------------------------------------------------- */
const ACADEMIC_NODES = {
  t01: {
    id: 't01',
    code: 'NODE T-01 • 400 V DISTRIBUTION',
    level: 'SECONDARY FOUNDATION',
    year: '2011',
    degree: 'School Leaving Certificate (SLC)',
    institution: 'Everest Secondary English School',
    location: 'Biratnagar, Nepal',
    voltage: '400 V Low-Voltage Distribution',
    spanIds: [],
    details: 'Completed secondary-level foundation in mathematics, physical sciences, and English at Everest Secondary English School, Biratnagar, initiating the foundational stepping-stone into engineering sciences.'
  },
  t02: {
    id: 't02',
    code: 'NODE T-02 • 11 kV MEDIUM VOLTAGE',
    level: 'HIGHER SECONDARY EDUCATION',
    year: '2011 – 2013',
    degree: 'GCE A-Levels (Cambridge International Examinations — CIE)',
    institution: "King's College",
    location: 'Kathmandu, Nepal',
    voltage: '11 kV Medium-Voltage Distribution',
    spanIds: ['acad-span-1'],
    details: 'Completed Cambridge International A-Levels specializing in Physics, Advanced Mathematics, and analytical problem-solving, building the core quantitative foundation for power systems analysis.'
  },
  t03: {
    id: 't03',
    code: 'NODE T-03 • 33 kV SUB-TRANSMISSION',
    level: 'UNDERGRADUATE DEGREE',
    year: '2014 – 2018',
    degree: 'Bachelor of Engineering (B.E.) in Electrical & Electronics Engineering',
    institution: 'Nepal Engineering College (Affiliated to Pokhara University)',
    location: 'Bhaktapur, Nepal',
    voltage: '33 kV Sub-Transmission & Primary Substations',
    spanIds: ['acad-span-1', 'acad-span-2'],
    details: 'Comprehensive four-year undergraduate engineering degree covering power system analysis, high-voltage engineering, switchgear and protection, electrical machine design, power electronics, and electrical grid synchronization.'
  },
  nec1977: {
    id: 'nec1977',
    code: 'TOWER T-04 • 132/220 kV HIGH-VOLTAGE GRID',
    level: 'STATUTORY ENGINEERING LICENSURE',
    year: 'Registered Electrical & Electronics Engineer',
    degree: 'Nepal Engineering Council — License Registration No. 1977',
    institution: 'Nepal Engineering Council (NEC)',
    location: 'Kathmandu, Nepal',
    voltage: '132 kV & 220 kV National Grid & High-Voltage Substations',
    spanIds: ['acad-span-1', 'acad-span-2', 'acad-span-3'],
    details: 'Statutory registered Electrical & Electronics Engineer (License Registration No. 1977) officially authorized for high-voltage substation and transmission line engineering design, site supervision, quality control, testing, and commissioning across Nepal.'
  },
  t04: {
    id: 't04',
    code: 'TERMINAL T-05 • GRID OPERATIONS & DISPATCH',
    level: 'POSTGRADUATE MANAGEMENT DEGREE',
    year: 'Graduated 2023',
    degree: 'Master of Business Administration (MBA) — Operations Management',
    institution: 'Indira Gandhi National Open University (IGNOU)',
    location: 'Operations & Commercial Infrastructure Management',
    voltage: 'System Load Dispatch & EPC Contract Governance',
    spanIds: ['acad-span-1', 'acad-span-2', 'acad-span-3', 'acad-span-4'],
    details: 'Graduate management degree specializing in operations management, supply chain logistics, project cost accounting, FIDIC commercial contract administration, and utility risk governance, bridging high-voltage electrical engineering precision with multi-million dollar EPC leadership.'
  }
};

/* -------------------------------------------------------------------------
   NEPAL HIGH-VOLTAGE TRANSMISSION & SUBSTATION GIS MAP MARKERS
   Open-source Leaflet.js interactive map coordinates across Nepal
   ------------------------------------------------------------------------- */
const NEPAL_GRID_PROJECTS = [
  {
    id: 'prasauni',
    title: 'Prasauni – Birgunj 132 kV Substation & UG Line',
    voltage: '132/66 kV GIS, 132/33/11 kV AIS & 800 mm² UG',
    contractor: 'China Railway No.2 Engineering Group (CREGC)',
    location: 'Bara / Parsa Corridor',
    coords: [27.0167, 84.8833],
    desc: '4 km 800 sq.mm double-circuit 132 kV XLPE underground line, 132/66 kV GIS hall & 132/33/11 kV AIS substation.'
  },
  {
    id: 'chilime',
    title: 'Chilime Hub 220/132/33 kV GIS Substation',
    voltage: '220/132/33 kV Gas Insulated Switchgear',
    contractor: 'Global Electro Mechanical Works / Pinggao Group',
    location: 'Chilime, Rasuwa',
    coords: [28.1833, 85.3167],
    desc: 'High-altitude 220 kV SF6 GIS bay assembly, power transformer installation, and Trishuli hydropower evacuation.'
  },
  {
    id: 'trishuli3b',
    title: 'Trishuli-3B Hub 220 kV Hybrid AIS Substation',
    voltage: '220(Hybrid)/132/33 kV Air Insulated Switchgear',
    contractor: 'Global Electro Mechanical Works / Pinggao Group',
    location: 'Trishuli, Rasuwa / Nuwakot',
    coords: [27.9833, 85.1833],
    desc: 'Switchyard erection, testing, and commissioning for 220 kV hybrid air-insulated transmission hub.'
  },
  {
    id: 'samundratar',
    title: 'Samundratar – Trishuli 3B 132 kV Substation & OHL',
    voltage: '132/33 kV Substation & 26 km 132 kV OHL',
    contractor: 'ETERN-CCCE-FEPEC Joint Venture',
    location: 'Samundratar, Nuwakot',
    coords: [27.9500, 85.3000],
    desc: '132/33 kV substation turnkey construction, transformer testing, and 26 km double-circuit transmission corridor.'
  },
  {
    id: 'nagdhunga',
    title: 'Nagdhunga Tunnel 11 kV Underground Cabling',
    voltage: '11 kV Medium-Voltage Tunnel Cabling',
    contractor: 'Cosmic Electrical / Hazama Ando Corp. (JICA)',
    location: 'Nagdhunga, Kathmandu / Dhading',
    coords: [27.7050, 85.2050],
    desc: 'Tunnel power distribution, 11 kV underground cable laying, and switchgear installation under Japanese safety standards.'
  },
  {
    id: 'tamor',
    title: 'Sanima Middle Tamor 220 kV Transmission Line (73 MW)',
    voltage: '220 kV High-Altitude Transmission Line',
    contractor: 'Cosmic Electrical Engineering Associates',
    location: 'Taplejung, Eastern Nepal',
    coords: [27.3500, 87.6700],
    desc: 'Supervision of 220 kV high-altitude line construction and grid interconnection for 73 MW hydropower generation.'
  }
];

/* -------------------------------------------------------------------------
   SITE PHOTO ARCHIVE SLOTS & MULTI-PROJECT PHOTO REGISTRY
   ------------------------------------------------------------------------- */
const ARCHIVE_SLOTS = [
  { key: 'slot_portrait', label: '01 • Portrait', title: 'On-Site Helmet Portrait', desc: 'Substations & Transmission Field Leadership' },
  { key: 'slot_prasauni', label: '02 • 132 kV GIS / UG', title: 'Prasauni – Birgunj 132 kV GIS & UG', desc: '132/66 kV GIS Hall & 800 sq.mm XLPE Underground Line' },
  { key: 'slot_chilime', label: '03 • 220 kV GIS', title: 'Chilime Hub 220/132/33 kV GIS', desc: 'SF6 GIS Bay Assembly & Transformer Installation, Rasuwa' },
  { key: 'slot_trishuli3b', label: '04 • 220 kV Hybrid AIS', title: 'Trishuli-3B Hub 220 kV Hybrid AIS', desc: 'Switchyard Commissioning & HV Testing, Rasuwa' },
  { key: 'slot_nagdhunga', label: '05 • 11 kV Tunnel', title: 'Nagdhunga Tunnel 11 kV Cabling', desc: 'Underground Tunnel Electrical Installation (JICA)' },
  { key: 'slot_samundratar', label: '06 • 132 kV OHL', title: 'Samundratar – Trishuli 3B 132 kV', desc: '132/33 kV Substation & 26 km Double-Circuit Line' }
];

const PROJECT_ARCHIVE_FILTERS = [
  { id: 'all', label: 'All Projects' },
  { id: 'prasauni', label: 'Prasauni 132 kV (CREGC)' },
  { id: 'chilime', label: 'Chilime Hub 220 kV (Pinggao)' },
  { id: 'trishuli3b', label: 'Trishuli-3B 220 kV' },
  { id: 'nagdhunga', label: 'Nagdhunga 11 kV (Cosmic)' },
  { id: 'samundratar', label: 'Samundratar 132 kV (ETERN)' },
  { id: 'tamor', label: 'Middle Tamor 220 kV' }
];

const PROJECT_SITE_ARCHIVES = [
  {
    id: 'arch_prasauni_1',
    projectId: 'prasauni',
    projectTitle: 'Prasauni – Birgunj 132 kV Substation & UG Line',
    contractor: 'China Railway No.2 Engineering Group (CREGC)',
    voltage: '132/66 kV GIS & AIS',
    src: 'assets/images/prasauni-132kv.jpg',
    title: '132/66 kV GIS Hall & Power Transformers',
    desc: 'GIS indoor building construction, SF6 gas compartment filling, and busduct installation at Prasauni Substation.',
    date: '2023–Present',
    location: 'Bara / Parsa, Nepal'
  },
  {
    id: 'arch_prasauni_2',
    projectId: 'prasauni',
    projectTitle: 'Prasauni – Birgunj 132 kV Substation & UG Line',
    contractor: 'China Railway No.2 Engineering Group (CREGC)',
    voltage: '132 kV Underground',
    src: 'assets/images/prasauni-cable.jpg',
    title: '4 km 800 sq.mm XLPE Cable Pulling & Trenching',
    desc: 'Deep civil duct-bank trenching, motorized cable pulling, and straight-through jointing bays in urban Birgunj.',
    date: '2023–Present',
    location: 'Birgunj Commercial Corridor'
  },
  {
    id: 'arch_chilime_1',
    projectId: 'chilime',
    projectTitle: 'Chilime Hub 220/132/33 kV GIS Substation',
    contractor: 'Pinggao Group / Global Electro Mechanical',
    voltage: '220/132/33 kV SF6 GIS',
    src: 'assets/images/chilime-220kv.jpg',
    title: 'High-Altitude 220 kV SF6 GIS Bay Assembly',
    desc: 'Substation bay assembly, precision alignment, SF6 gas vacuuming, and high-voltage dielectric withstand testing in Rasuwa.',
    date: '2022–2023',
    location: 'Chilime, Rasuwa (Himalayan Gorge)'
  },
  {
    id: 'arch_trishuli3b_1',
    projectId: 'trishuli3b',
    projectTitle: 'Trishuli-3B Hub 220 kV Hybrid AIS Substation',
    contractor: 'Pinggao Group / Global Electro Mechanical',
    voltage: '220 kV Hybrid AIS',
    src: 'assets/images/trishuli3b-220kv.jpg',
    title: '220 kV Switchyard Gantry & Transformer Bay',
    desc: 'Switchyard civil foundations, high-voltage busbar connections, circuit breaker timing tests, and control cabling.',
    date: '2022–2023',
    location: 'Trishuli, Nuwakot / Rasuwa'
  },
  {
    id: 'arch_nagdhunga_1',
    projectId: 'nagdhunga',
    projectTitle: 'Nagdhunga Tunnel Construction Project',
    contractor: 'Cosmic Electrical / Hazama Ando (JICA)',
    voltage: '11 kV Medium Voltage',
    src: 'assets/images/nagdhunga-11kv.jpg',
    title: 'Tunnel 11 kV Power Cable Laying & Switchgear',
    desc: 'Underground medium-voltage distribution cabling, bracket mounting, and substations under Japanese JICA safety standards.',
    date: '2021–2022',
    location: 'Nagdhunga Tunnel, Kathmandu / Dhading'
  },
  {
    id: 'arch_tamor_1',
    projectId: 'tamor',
    projectTitle: 'Sanima Middle Tamor 220 kV Transmission Line',
    contractor: 'Cosmic Electrical Engineering Associates',
    voltage: '220 kV Transmission Line',
    src: 'assets/images/tamor-220kv.jpg',
    title: '220 kV Mountain Transmission Tower Erection',
    desc: 'Lattice tower erection, cliffside foundation inspection, and conductor stringing for 73 MW hydropower generation.',
    date: '2021–2022',
    location: 'Taplejung, Eastern Nepal'
  },
  {
    id: 'arch_samundratar_1',
    projectId: 'samundratar',
    projectTitle: 'Samundratar – Trishuli 3B 132 kV Substation & Line',
    contractor: 'ETERN-CCCE-FEPEC Joint Venture',
    voltage: '132/33 kV Substation & OHL',
    src: 'assets/images/samundratar-132kv.jpg',
    title: '132/33 kV Substation Switchyard Commissioning',
    desc: 'Turnkey substation construction, 132/33 kV power transformer energization, and protection relay testing under EIB/ADB standards.',
    date: '2018–2021',
    location: 'Samundratar, Nuwakot'
  },
  {
    id: 'arch_samundratar_2',
    projectId: 'samundratar',
    projectTitle: 'Samundratar – Trishuli 3B 132 kV Substation & Line',
    contractor: 'ETERN-CCCE-FEPEC Joint Venture',
    voltage: '132 kV Double-Circuit Line',
    src: 'assets/images/banner-corridor.jpg',
    title: '26 km Double-Circuit 132 kV Transmission Corridor',
    desc: 'High-voltage conductor stringing across steep mountain terrain connecting Samundratar to the national transmission grid.',
    date: '2018–2021',
    location: 'Nuwakot Ridge Corridors'
  }
];
