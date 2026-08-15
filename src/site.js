// Everything the marketing pages say about the company, in one place.
//
// Content mirrors graphicstar.ph -- the branches, hours and numbers below are the real ones from
// their contact page, so this is a working site rather than a shell full of lorem ipsum. Kept as
// data rather than scattered through JSX so a change of opening hours is one edit, not six.

export const COMPANY = {
  name: 'Cebu GraphicStar',
  shortName: 'GraphicStar',
  tagline: 'Creations Made Easy',
  subtitle: 'Your creative destination for all things design',
  promise: 'Your vision. Our prints. Together, we create something unforgettable.',
  facebook: 'https://www.facebook.com/graphicstarph',
  instagram: 'https://www.instagram.com/graphicstarph',
};

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/products', label: 'Products' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact Us' },
];

export const VISION = 'To be the Philippines’ most trusted and leading visual solutions provider '
  + '— driving innovation, brand empowerment, and business growth across the Visayas, Mindanao, and beyond.';

export const MISSION = 'To deliver comprehensive visual solutions across print, signage and digital '
  + 'displays — building brand visibility and loyalty, and supporting sustainable growth through '
  + 'creative, quality output.';

export const VALUES = [
  { name: 'Service Excellence', blurb: 'We hold every job to the standard we would want for our own brand.' },
  { name: 'Transparency', blurb: 'Clear pricing, honest timelines, no surprises at invoicing.' },
  { name: 'Accountability', blurb: 'If we commit to it, we own it through to delivery.' },
  { name: 'Resilience', blurb: 'Deadlines move and briefs change. We adapt without dropping quality.' },
];

// The seven categories the real site lists on /products.
export const CATEGORIES = [
  { name: 'Digital Displays', blurb: 'LED walls and digital signage that hold a room’s attention.' },
  { name: 'Signages & Modular Displays', blurb: 'Custom signage and reconfigurable systems for any footprint.' },
  { name: 'Large Format Prints', blurb: 'Tarpaulins, banners and billboards printed at scale.' },
  { name: 'Small Format Prints', blurb: 'Flyers, brochures, yearbooks and everything desk-sized.' },
  { name: 'Frames & Awards', blurb: 'Plaques, trophies and framing finished by hand.' },
  { name: 'Booths & Carts', blurb: 'Portable stands and carts built for events and malls.' },
  { name: 'Apparel', blurb: 'Uniforms, shirts and wearables, printed or embroidered.' },
];

export const INDUSTRIES = [
  'Corporate & Business', 'Retail & E-commerce', 'Food & Beverage', 'Hospitality & Tourism',
  'Healthcare', 'Education', 'Construction', 'Real Estate', 'Events & Entertainment',
  'Transportation & Logistics', 'Beauty & Wellness', 'Government & Nonprofits',
];

export const CLIENTS = ['Jollibee', 'Honda Philippines', 'Rustan’s', 'Rockwell Land'];

export const BRANCHES = [
  {
    name: 'Main Office',
    address: 'J.S. Alinsug St., Basak, Mandaue City, Cebu',
    hours: 'Monday – Saturday, 8:00 AM – 5:00 PM',
    landline: '238-1234',
    mobile: '0920-981-3961',
  },
  {
    name: 'Ayala Branch',
    address: 'Basement 1, Service Lane, Ayala Center Cebu (beside Wash Up Laundry)',
    hours: 'Sun – Thu, 10:00 AM – 9:00 PM · Fri – Sat, 10:00 AM – 10:00 PM',
    landline: '238-4127',
    mobile: '0920-981-3954',
  },
  {
    name: 'SM Branch',
    address: 'Lower Ground Level, SM City Cebu (across Mascot Pets)',
    hours: 'Sun – Thu, 10:00 AM – 9:00 PM · Fri – Sat, 10:00 AM – 10:00 PM',
    landline: '232-6399',
    mobile: '0939-980-4154',
  },
];
