// All site content and the flight plan live here.
export const SECTIONS = [
  'intro',
  'pitch',
  'the decade',
  'short story',
  'numbers',
  'case studies',
  'talks',
  'manifesto',
  "let's talk",
]

export const IDENTITY = {
  first: 'ASTRA',
  last: 'WEBB',
  alias: '( ASWEB )',
  roles: ['Product', 'Designer', 'Builder', 'Educator'],
}

export const PITCH = {
  title: 'Elevator pitch',
  body: 'I ship products people actually use.\nResearch first, opinions second.\nSmall teams, sharp bets, fast loops.',
}

export const DECADE = {
  title: 'The decade',
  body: 'Ten years, four startups, two exits.\nEvery year a ring on the trunk.',
  years: ['2k16', '2k17', '2k18', '2k19', '2k20', '2k21', '2k22', '2k23', '2k24', '2k25'],
}

export const STORY = {
  title: 'Short story',
  body: 'Started as the kid who broke the family PC.\nNow I break assumptions for a living.\nSame curiosity, better tooling.',
}

export const NUMBERS = {
  title: 'Numbers',
  stats: [
    { value: '50%', label: 'faster onboarding' },
    { value: '60%', label: 'support load cut' },
    { value: '2 min', label: 'to first value' },
    { value: '83%', label: 'retention at week 4' },
    { value: '33%', label: 'more conversions' },
    { value: '3', label: 'products at PMF' },
    { value: '30+', label: 'teams mentored' },
    { value: '10', label: 'years in the field' },
  ],
}

export const CASES = {
  title: 'Case studies',
  items: [
    {
      title: 'Dashboard that reads your mind',
      meta: 'fintech — 2k24',
      metrics: ['+41% task success', '-28% time on task', 'NPS 31 → 58'],
      process: 'Interviews, jobs mapping, three throwaway prototypes, one keeper. Shipped in six weeks with two engineers.',
    },
    {
      title: 'Checkout without the sweat',
      meta: 'e-commerce — 2k23',
      metrics: ['+19% completion', '1 field removed = +7%', 'Zero-auth guest flow'],
      process: 'Funnel forensics, price-anxiety research, and a checkout rebuilt around one input at a time.',
    },
    {
      title: 'Design system that survived',
      meta: 'SaaS — 2k22',
      metrics: ['48 components', '5 product teams', '92% adoption'],
      process: 'Tokens first, components second, politics third. Governance that outlived its founders.',
    },
  ],
}

export const TALKS = {
  title: 'Talks',
  items: [
    { img: '/talks/t1.svg', title: 'Data platforms people can drive', tags: ['Talk', 'English'], meta: 'UX Conf @ 2k25' },
    { img: '/talks/t2.svg', title: 'Should everyone do research?', tags: ['Panel', 'English'], meta: 'UX Conf @ 2k23' },
    { img: '/talks/t3.svg', title: 'Designer in the middle of chaos', tags: ['Talk', 'English'], meta: 'Design Ops @ 2k23' },
    { img: '/talks/t4.svg', title: 'Strategy for people who ship', tags: ['Panel', 'English'], meta: 'UX Conf @ 2k24' },
    { img: '/talks/t5.svg', title: 'Rebooting digital education', tags: ['Talk', 'English'], meta: 'PechaKucha @ 2k24' },
    { img: '/talks/t6.svg', title: 'Ten seconds decide everything', tags: ['Podcast', 'English'], meta: 'DesignCast @ 2k26' },
  ],
}

export const MANIFESTO = {
  title: 'Manifesto',
  lines: [
    'Ship the smallest true thing.',
    'Research beats taste. Taste breaks ties.',
    'Fast loops eat big plans.',
    'Boring tech, brave product.',
  ],
}

export const CONTACT = {
  title: "Let's talk",
  body: 'One inbox, no gatekeepers.',
  links: [
    { label: 'email', href: 'mailto:hello@example.com' },
    { label: 'github', href: 'https://github.com/AreebSaleem' },
    { label: 'linkedin', href: 'https://www.linkedin.com/' },
  ],
}

export const FAQ = [
  'Why the heck is this website black and white?',
  'Because color is a decision, and decisions need reasons.',
]

// ---- flight plan ----------------------------------------------------------
// One station per section. The camera flies a Catmull-Rom spline through
// these points; each world is parked at its station, facing the approach.
export const STATIONS = [
  [0, 0, 0],      // intro
  [6, 1, -16],    // pitch
  [-7, -1, -32],  // the decade
  [2, 3, -48],    // short story
  [10, -2, -64],  // numbers
  [-4, 2, -82],   // case studies
  [-12, -1, -100],// talks
  [0, 4, -118],   // manifesto
  [0, 0, -136],   // let's talk
]

// Scroll length in viewport-heights (measured 22 on the reference site).
export const PAGES = 22
