export const SITE = {
  name: "Ana's Estate",
  url: 'https://anasestate.com',
  email: 'anas.oliveoil@gmail.com',
  themeColor: '#001263',
  locale: 'en_CA',
  importer: 'Karteros Enterprises',
  location: 'Brampton, Ontario, Canada',
} as const;

export const STRIPE_LINKS = {
  bottle: 'https://buy.stripe.com/bJe28r5wh9GYbhocZF2Ji08',
  fiveL: 'https://buy.stripe.com/aFadR92k5cTadpwgbR2Ji06',
  sixteenL: 'https://buy.stripe.com/bJe6oH3o9dXegBI4t92Ji07',
} as const;

export const FORMSUBMIT_ACTION = `https://formsubmit.co/${SITE.email}`;
