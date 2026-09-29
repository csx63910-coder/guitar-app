import serialsMeta from '$lib/data/serials.json';

export interface DecodedSerialResult {
  brand: string;
  serial: string;
  year?: string;
  factory?: string;
  batchOrSequence?: string;
  notes?: string;
  counterfeitRisk: 'Low' | 'Medium' | 'High (Known Fake Serial)';
  authenticityTips: string[];
}

// Martin serial milestone database
const MARTIN_YEAR_MAP = [
  { maxSerial: 14500, year: 1910 },
  { maxSerial: 22000, year: 1925 },
  { maxSerial: 60000, year: 1935 },
  { maxSerial: 90000, year: 1945 },
  { maxSerial: 145000, year: 1955 },
  { maxSerial: 205000, year: 1965 },
  { maxSerial: 265000, year: 1970 },
  { maxSerial: 370000, year: 1975 },
  { maxSerial: 420000, year: 1980 },
  { maxSerial: 460000, year: 1985 },
  { maxSerial: 500000, year: 1990 },
  { maxSerial: 560000, year: 1995 },
  { maxSerial: 726000, year: 2000 },
  { maxSerial: 1080000, year: 2005 },
  { maxSerial: 1470000, year: 2010 },
  { maxSerial: 1930000, year: 2015 },
  { maxSerial: 2400000, year: 2020 },
  { maxSerial: 2800000, year: 2024 },
  { maxSerial: 3000000, year: 2026 }
];

export function decodeSerial(rawSerial: string, brandHint?: string): DecodedSerialResult {
  const clean = rawSerial.trim().toUpperCase().replace(/[\s-]/g, '');

  // 1. Check known counterfeit database
  const fakeMatch = serialsMeta.known_counterfeits.find(
    (f) => f.serial.toUpperCase() === clean
  );
  if (fakeMatch) {
    return {
      brand: fakeMatch.brand,
      serial: clean,
      counterfeitRisk: 'High (Known Fake Serial)',
      notes: fakeMatch.reason,
      authenticityTips: [
        'Check bridge posts: authentic USA Gibsons use thin threaded posts directly into wood, fakes use large flathead/metric slotted bushings.',
        'Check headstock: open-book mustache curve is often distorted on fakes.',
        'Truss rod cover: authentic Gibsons use 2 screws; cheap counterfeits often use 3 screws.'
      ]
    };
  }

  // Auto-detect brand if not provided or normalize hint
  let brand = (brandHint || 'auto').toLowerCase();
  if (brand.includes('gibson')) {
    brand = 'Gibson';
  } else if (brand.includes('fender')) {
    brand = 'Fender';
  } else if (brand.includes('martin')) {
    brand = 'Martin';
  } else if (brand.includes('ibanez')) {
    brand = 'Ibanez';
  } else {
    if (clean.startsWith('US') || clean.startsWith('MX') || clean.startsWith('MN') || clean.startsWith('MZ') || clean.startsWith('JV') || clean.startsWith('CIJ') || clean.startsWith('MIJ') || clean.startsWith('V')) {
      brand = 'Fender';
    } else if (clean.startsWith('F') && /^[A-Z]\d{6,8}$/.test(clean)) {
      brand = 'Ibanez';
    } else if (/^\d{8,9}$/.test(clean)) {
      brand = 'Gibson';
    } else if (/^\d{5,7}$/.test(clean)) {
      brand = 'Martin';
    }
  }

  if (brand === 'Gibson') {
    return decodeGibson(clean);
  } else if (brand === 'Fender') {
    return decodeFender(clean);
  } else if (brand === 'Martin') {
    return decodeMartin(clean);
  } else if (brand === 'Ibanez') {
    return decodeIbanez(clean);
  }

  // Fallback generic
  return {
    brand: brand !== 'Auto' ? brand : 'Unknown',
    serial: clean,
    counterfeitRisk: 'Medium',
    notes: 'Could not match standard serial algorithms. Check manufacturer documentation or historic batch records.',
    authenticityTips: [
      'Inspect neck pocket or pickup cavities for factory production date stamps.',
      'Check potentiometer EIA codes (e.g., 137YYWW indicates CTS pot made in Year YY, Week WW).'
    ]
  };
}

function decodeGibson(clean: string): DecodedSerialResult {
  // 8-digit system (1977 - 2005): YDDDYRRR
  // 9-digit system (2005 - 2019): YDDDYBRRR
  if (/^\d{8}$/.test(clean) || /^\d{9}$/.test(clean)) {
    const isNineDigit = clean.length === 9;
    const yearPart = clean[0] + clean[4];
    const yearFull = parseInt(yearPart, 10) < 70 ? `20${yearPart}` : `19${yearPart}`;
    const dayOfYear = clean.substring(1, 4);

    const rankingPart = isNineDigit ? clean.substring(6) : clean.substring(5);
    const rankingNum = parseInt(rankingPart, 10);

    let factory = 'Nashville, TN';
    if (parseInt(yearFull, 10) < 1984 && rankingNum < 500) {
      factory = 'Kalamazoo, MI (Plant 1)';
    }

    // Sanity check: Kalamazoo plant closed in 1984
    let risk: 'Low' | 'Medium' | 'High (Known Fake Serial)' = 'Low';
    const tips = [
      'Gibson serials are stamped into the mahogany wood before the nitrocellulose lacquer is applied.',
      'Check fret end binding nibs: genuine USA Gibsons feature plastic binding extending over the fret ends.',
      'Check bridge posts: authentic USA Nashville/ABR bridges thread directly into the wood without metric hex/slotted posts.'
    ];

    if (parseInt(yearFull, 10) > 1984 && rankingNum < 500 && factory.includes('Kalamazoo')) {
      risk = 'Medium';
      tips.unshift('Anomaly: Kalamazoo plant closed in 1984, but serial indicates sub-500 batch.');
    }

    return {
      brand: 'Gibson USA',
      serial: clean,
      year: `${yearFull} (Day ${dayOfYear} of the year)`,
      factory,
      batchOrSequence: `Production Unit #${rankingPart}`,
      counterfeitRisk: risk,
      notes: `Standard Gibson USA ${isNineDigit ? '9-digit' : '8-digit'} date stamped serial.`,
      authenticityTips: tips
    };
  }

  // Modern 2019+ system: YYxxxxxxx
  if (/^\d{9}$/.test(clean) && parseInt(clean.substring(0, 2), 10) >= 19) {
    const year = `20${clean.substring(0, 2)}`;
    return {
      brand: 'Gibson USA',
      serial: clean,
      year,
      factory: 'Nashville, TN',
      batchOrSequence: `Production Sequence #${clean.substring(2)}`,
      counterfeitRisk: 'Low',
      notes: 'Modern Gibson USA serial format (2019–present).',
      authenticityTips: [
        'Check headstock silkscreen logo and lacquer checking under UV blacklight.',
        'Look inside control cavity: modern USA models use Gibson PCB or neat braided wire shielding.'
      ]
    };
  }

  // Historic Reissue format: 5 or 6 digits (e.g. 9 1234 = 1959 Les Paul Reissue)
  if (/^[0-9]\d{4,5}$/.test(clean) || clean.startsWith('CS')) {
    return {
      brand: 'Gibson Custom Shop',
      serial: clean,
      year: 'Custom Shop / Historic Reissue Series',
      factory: 'Nashville, TN (Custom Shop)',
      counterfeitRisk: 'Medium',
      notes: 'Historic Reissue or Custom Shop serial pattern.',
      authenticityTips: [
        'Custom Shop guitars should have certificate of authenticity (COA) booklet.',
        'Check case candy, Lifton reissue brown/pink case, and Custom Shop neck heel decal.'
      ]
    };
  }

  return {
    brand: 'Gibson',
    serial: clean,
    counterfeitRisk: 'Medium',
    notes: 'Unrecognized Gibson format. May be pre-1977, Custom Shop, or an Asian-made copy.',
    authenticityTips: ['Verify pot codes on potentiometers inside cavity.']
  };
}

function decodeFender(clean: string): DecodedSerialResult {
  // USA Modern: US + 8 digits (e.g. US20123456 = 2020)
  const usMatch = clean.match(/^US(\d{2})\d{6}$/);
  if (usMatch) {
    const yearDigits = parseInt(usMatch[1], 10);
    const fullYear = `20${yearDigits}`;
    return {
      brand: 'Fender USA',
      serial: clean,
      year: fullYear,
      factory: 'Corona, California, USA',
      batchOrSequence: clean.substring(4),
      counterfeitRisk: 'Low',
      notes: 'Standard American Series Fender serial (2010s–present).',
      authenticityTips: [
        'Check truss rod opening at headstock: genuine USA Fenders use a walnut wood plug, not plastic.',
        'Check bridge saddles: stamped "Fender" block saddles or vintage bent steel.',
        'Check micro-tilt adjustment hole on the neck plate (where applicable).'
      ]
    };
  }

  // American Vintage Reissue (AVRI): V + 5 to 7 digits
  if (/^V\d{5,7}$/.test(clean)) {
    return {
      brand: 'Fender USA (AVRI)',
      serial: clean,
      year: '1982–present (Check neck heel date stamp for exact year)',
      factory: 'Corona, California (American Vintage / AVRI)',
      batchOrSequence: clean.substring(1),
      counterfeitRisk: 'Low',
      notes: 'American Vintage Reissue neck plate serial. Because AVRI plates were used across decades without chronological numbering, removing the neck to inspect the heel pencil/ink stamp is required for precise year determination.',
      authenticityTips: [
        'Inspect neck heel for pencil or ink date stamp (Month-Day-Year).',
        'Verify vintage-style slotted tuner posts and 3-way/5-way vintage switch.'
      ]
    };
  }

  // Corona USA E / N / Z series (E = 80s, N = 90s, Z = 2000s)
  const letterYearMatch = clean.match(/^([ENZ])(\d{1})\d{5,6}$/);
  if (letterYearMatch) {
    const eraLetter = letterYearMatch[1];
    const secondDigit = letterYearMatch[2];
    let decade = '1980';
    if (eraLetter === 'N') decade = '1990';
    if (eraLetter === 'Z') decade = '2000';

    const year = `${decade.substring(0, 3)}${secondDigit}`;
    return {
      brand: 'Fender USA',
      serial: clean,
      year: `${year} (approx. ${decade}s)`,
      factory: 'Corona, California, USA (or Fullerton if early 80s)',
      counterfeitRisk: 'Low',
      notes: `Classic ${eraLetter}-prefix American Standard era Fender.`,
      authenticityTips: [
        'Check neck heel date stamp inside neck pocket.',
        'Pickguard screws: USA Strats use 11-hole pattern with countersunk screw holes.'
      ]
    };
  }

  // Mexico: MX, MN, MZ
  const mexMatch = clean.match(/^(MX|MN|MZ)(\d{2}|\d{1})\d+/);
  if (mexMatch) {
    const prefix = mexMatch[1];
    let year = 'Mexico Series';
    if (prefix === 'MN') year = `199${mexMatch[2]}`;
    if (prefix === 'MZ') year = `200${mexMatch[2]}`;
    if (prefix === 'MX') year = `20${mexMatch[2]}`;

    return {
      brand: 'Fender Ensenada',
      serial: clean,
      year,
      factory: 'Ensenada, Baja California, Mexico',
      counterfeitRisk: 'Low',
      notes: 'Standard / Player / Vintera series made in Ensenada, Mexico.',
      authenticityTips: [
        'Black plastic truss rod teardrop plug (unlike USA walnut wood plug).',
        'Check neck plate: usually stamped with Fender logo or blank on early models.'
      ]
    };
  }

  // Japan: JV, MIJ, CIJ
  if (clean.startsWith('JV')) {
    return {
      brand: 'Fender Japan (JV Series)',
      serial: clean,
      year: '1982 – 1984',
      factory: 'Fujigen Gakki, Japan',
      counterfeitRisk: 'Low',
      notes: 'Legendary Japanese Vintage (JV) series highly prized for custom-shop quality build.',
      authenticityTips: ['USA pickups with cloth wire were standard on domestic export JV models.']
    };
  }

  return {
    brand: 'Fender',
    serial: clean,
    counterfeitRisk: 'Medium',
    notes: 'Unrecognized Fender serial format. May be vintage Pre-CBS (4-5 digits), Custom Shop, or licensed import.',
    authenticityTips: [
      'Pre-CBS Fenders (1950–1965) used sequential numbers on neck plates or bridge plates.'
    ]
  };
}

function decodeMartin(clean: string): DecodedSerialResult {
  const num = parseInt(clean, 10);
  if (isNaN(num)) {
    return {
      brand: 'Martin Guitar',
      serial: clean,
      counterfeitRisk: 'Medium',
      notes: 'Martin serials are purely numeric. Stamped on the mahogany neck block inside soundhole.',
      authenticityTips: ['Look through soundhole directly at neck block with a flashlight.']
    };
  }

  let yearEst = 'Modern';
  for (const milestone of MARTIN_YEAR_MAP) {
    if (num <= milestone.maxSerial) {
      yearEst = `${milestone.year}`;
      break;
    }
  }

  return {
    brand: 'C.F. Martin & Co.',
    serial: clean,
    year: `Circa ${yearEst}`,
    factory: 'Nazareth, Pennsylvania, USA',
    counterfeitRisk: 'Low',
    notes: 'Sequential chronological serial number stamped on inner neck block.',
    authenticityTips: [
      'Check neck block: model name (e.g. D-28) is stamped directly above serial number.',
      'Genuine Martins feature cedar kerfing lining and distinct Spanish cedar / spruce aroma.'
    ]
  };
}

function decodeIbanez(clean: string): DecodedSerialResult {
  // Fujigen Japan: F + 2-digit year (or 1-digit 90s)
  const fujigenMatch = clean.match(/^F(\d{2})(\d{5})$/);
  if (fujigenMatch) {
    const yearDigits = parseInt(fujigenMatch[1], 10);
    const year = yearDigits >= 95 ? `19${yearDigits}` : `20${yearDigits}`;
    return {
      brand: 'Ibanez Prestige / Genesis',
      serial: clean,
      year,
      factory: 'Fujigen Gakki, Nagano, Japan',
      batchOrSequence: `Production #${fujigenMatch[2]}`,
      counterfeitRisk: 'Low',
      notes: 'Japanese Fujigen manufacture, typical of high-end Prestige and J-Custom models.',
      authenticityTips: [
        'Check neck joint: All-Access Neck Joint (AANJ) precision contouring.',
        'Check bridge: Original Edge or Lo-Pro Edge tremolo stamped "Made in Japan".'
      ]
    };
  }

  // Cort Korea: C + digits
  if (clean.startsWith('C') && /^[A-Z]\d+/.test(clean)) {
    return {
      brand: 'Ibanez (Cort)',
      serial: clean,
      year: 'Korean Production Era (1990s–2000s)',
      factory: 'Cort Guitars, Incheon, Korea',
      counterfeitRisk: 'Low',
      notes: 'High quality mid-tier Ibanez production.',
      authenticityTips: ['Check back of headstock silkscreen.']
    };
  }

  return {
    brand: 'Ibanez',
    serial: clean,
    counterfeitRisk: 'Medium',
    notes: 'Ibanez models use factory letter prefixes (F = Fujigen, I = Cort Indonesia, C = Cort Korea).',
    authenticityTips: ['Check headstock back stamp.']
  };
}
