export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoCard = {
  title: string;
  body: string;
};

export type SeoStep = {
  number: string;
  title: string;
  body: string;
};

export type PublicSeoConfig = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  intentLabel: string;
  audienceTitle: string;
  audienceBody: string;
  problemTitle: string;
  problemBody: string;
  solutionTitle: string;
  solutionBody: string;
  cards: SeoCard[];
  steps: SeoStep[];
  faq: SeoFaq[];
  related: Array<{ label: string; path: string }>;
};

export const HOME_SEO: PublicSeoConfig = {
  path: '/',
  title: 'BrazilBR | Resolve your next need in Brazil',
  description: 'BrazilBR brings people, places and practical local knowledge together around the city you are in.',
  eyebrow: 'For people making a life in Brazil',
  headline: 'Resolve your next need in Brazil.',
  subheadline: 'BrazilBR brings people, places and practical local knowledge together around the city you are in.',
  intentLabel: 'Start with context',
  audienceTitle: 'For people navigating a Brazilian city',
  audienceBody: 'Use BrazilBR when you are traveling, living, working or settling in Brazil and need a useful person, place or local reference.',
  problemTitle: 'The answer is usually scattered.',
  problemBody: 'When you are new to a city, the next useful answer can be spread across maps, chats, event pages, hostels and informal recommendations. BrazilBR starts from the need, not from another feed to keep up with.',
  solutionTitle: 'One city. One need. A more useful next step.',
  solutionBody: 'Set your city and current context, discover relevant people and Places, then take an action through a connection, message or external link.',
  cards: [
    { title: 'City-level context', body: 'Set the city you are in and decide whether you want to appear on the map at city level.' },
    { title: 'People discovery', body: 'Explore public profiles by city, language, interests and shared context.' },
    { title: 'Practical Places', body: 'Open community Places with references for Maps, menus, websites, bookings and contact.' },
    { title: 'Private connections', body: 'Move from discovery to a private connection when another person can help.' },
  ],
  steps: [
    { number: '01', title: 'Tell us where you are', body: 'Set your current city in Brazil and your visibility preference.' },
    { number: '02', title: 'Choose what you need', body: 'Add your current need, languages and interests so the context is useful.' },
    { number: '03', title: 'Act on what you find', body: 'Open a Place, connect with a person, send a message or follow a reference.' },
  ],
  faq: [
    { question: 'Is BrazilBR a booking platform?', answer: 'No. Place Profiles can link to external Maps, menus, websites, booking pages and WhatsApp. You complete the action on the linked service.' },
    { question: 'Do I need to share my exact location?', answer: 'No. The product uses city-level context and map visibility is optional.' },
    { question: 'Do I need to upload photos or files?', answer: 'No. The current MVP works with text, links and optional external HTTP/HTTPS media references.' },
  ],
  related: [
    { label: 'Expat community in Brazil', path: '/expat-community-brazil' },
    { label: 'Digital nomad community in Brazil', path: '/digital-nomad-brazil' },
    { label: 'Meet people in Brazil', path: '/meet-people-in-brazil' },
  ],
};

export const PUBLIC_SEO_PATHS = new Set([
  '/',
  '/expat-community-brazil',
  '/digital-nomad-brazil',
  '/meet-people-in-brazil',
]);

export const SEO_PAGES: Record<string, PublicSeoConfig> = {
  '/expat-community-brazil': {
    path: '/expat-community-brazil',
    title: 'Expat Community in Brazil | BrazilBR',
    description: 'Find practical local context, people and Places for expats living, working or settling in Brazil.',
    eyebrow: 'For expats building a life in Brazil',
    headline: 'A practical expat community for Brazil.',
    subheadline: 'Find people, Places and local references around the Brazilian city you are in — starting with what you need today.',
    intentLabel: 'Expat community Brazil',
    audienceTitle: 'Made for the first weeks and the next move',
    audienceBody: 'BrazilBR is for foreigners who are new to a Brazilian city, moving between cities or building a local routine without a trusted network yet.',
    problemTitle: 'Moving abroad creates a different kind of search.',
    problemBody: 'An expat does not only need a list of attractions. They may need a person who understands the transition, a practical place, a language connection, a local reference or a next step they can act on.',
    solutionTitle: 'Organize local context around the city you are in.',
    solutionBody: 'BrazilBR combines public profiles, city-level context, community Places, contributions and private connections in one starting point for life in Brazil.',
    cards: [
      { title: 'Find your local context', body: 'Set your current city, languages, interests and current need so discovery starts from your situation.' },
      { title: 'Meet people with shared context', body: 'Browse public profiles and start a connection when you find someone relevant to your city or interests.' },
      { title: 'Discover practical Places', body: 'Open community references for food, work, events, services and other places that matter to daily life.' },
      { title: 'Keep your exact location private', body: 'Map participation is optional and the product is designed around city-level visibility.' },
    ],
    steps: [
      { number: '01', title: 'Choose your city', body: 'Tell BrazilBR which Brazilian city you are navigating now.' },
      { number: '02', title: 'Add the context you need', body: 'Share languages, interests and a current need instead of writing a generic introduction.' },
      { number: '03', title: 'Move from search to action', body: 'Connect with a person, open a Place Profile or follow a useful external link.' },
    ],
    faq: [
      { question: 'Is BrazilBR for long-term expats or short stays?', answer: 'The current product is designed for people traveling, living, working or settling in a Brazilian city. It is most useful when you know the city you are in and have a concrete need.' },
      { question: 'Can I find official immigration or legal advice here?', answer: 'BrazilBR is not a legal or immigration advisory service. Use it for community context and external references, and verify official requirements with the appropriate authorities.' },
      { question: 'Can I use BrazilBR without publishing myself on the map?', answer: 'Yes. Map visibility is optional and the product uses city-level context rather than precise coordinates.' },
      { question: 'What does the current MVP cost?', answer: 'There is no active paid plan or checkout in the current MVP.' },
    ],
    related: [
      { label: 'Digital nomad community in Brazil', path: '/digital-nomad-brazil' },
      { label: 'Meet people in Brazil', path: '/meet-people-in-brazil' },
      { label: 'How BrazilBR works', path: '/' },
    ],
  },
  '/digital-nomad-brazil': {
    path: '/digital-nomad-brazil',
    title: 'Digital Nomad Community in Brazil | BrazilBR',
    description: 'Connect with people and practical Places for digital nomads working, traveling and living in Brazilian cities.',
    eyebrow: 'For digital nomads working from Brazil',
    headline: 'Find your next useful connection in Brazil.',
    subheadline: 'Use city and current need to discover people, work-friendly Places and local references while you move through Brazil.',
    intentLabel: 'Digital nomad Brazil',
    audienceTitle: 'For remote work with a local life around it',
    audienceBody: 'BrazilBR is for digital nomads and remote workers who need more than a destination list: they need a workable routine, local context and people they can actually meet or message.',
    problemTitle: 'Remote work solves location. It does not solve belonging.',
    problemBody: 'A nomad can find a café, coworking space or apartment and still lack context about the city, a person to ask or a simple way to turn a stay into a local routine.',
    solutionTitle: 'Start from the need behind the destination.',
    solutionBody: 'Set your city, language, interests and current need. Then use People, Places, Messages and community contributions to move toward a practical next step.',
    cards: [
      { title: 'Work context', body: 'Use current needs such as finding work-friendly places, internet, events or local services as a starting point.' },
      { title: 'People beyond the itinerary', body: 'Discover public profiles by city and shared context instead of browsing a generic social timeline.' },
      { title: 'Useful local references', body: 'Open Maps, websites, menus, booking pages or WhatsApp from a community Place Profile.' },
      { title: 'A city-level boundary', body: 'Choose whether to appear on the map and keep precise location out of the public experience.' },
    ],
    steps: [
      { number: '01', title: 'Set the city you are working from', body: 'Create a context around the Brazilian city you are in now.' },
      { number: '02', title: 'Name the next friction', body: 'Choose what would make the current week easier: people, food, work, events or a place.' },
      { number: '03', title: 'Take the useful action', body: 'Open a reference, message someone or contribute what you learned for the next person.' },
    ],
    faq: [
      { question: 'Is BrazilBR a coworking booking service?', answer: 'No. It can surface community Places and external references, but bookings and payments happen on linked services.' },
      { question: 'Can I use it for more than social events?', answer: 'Yes. The current product includes discovery of people, Places, practical links, contributions and private messages.' },
      { question: 'Does BrazilBR promise internet quality or availability?', answer: 'No. The MVP can organize references, but it does not guarantee current availability, response times or service quality.' },
      { question: 'Is there a paid nomad membership?', answer: 'No active paid plan or checkout is available in the current MVP.' },
    ],
    related: [
      { label: 'Expat community in Brazil', path: '/expat-community-brazil' },
      { label: 'Meet people in Brazil', path: '/meet-people-in-brazil' },
      { label: 'How BrazilBR works', path: '/' },
    ],
  },
  '/meet-people-in-brazil': {
    path: '/meet-people-in-brazil',
    title: 'Meet People in Brazil | BrazilBR',
    description: 'Meet people in Brazil through city-level context, shared interests, languages and private connections.',
    eyebrow: 'For solo travelers and new arrivals',
    headline: 'Meet people in Brazil without starting with a random feed.',
    subheadline: 'Tell BrazilBR your city and current need, then discover public profiles and private connections around the context you share.',
    intentLabel: 'Meet people in Brazil',
    audienceTitle: 'For the moment when you want a person, not another tab',
    audienceBody: 'Use BrazilBR when you are traveling alone, new to a city, practicing a language or looking for a local connection that fits the situation you are actually in.',
    problemTitle: 'The hard part is not finding social apps.',
    problemBody: 'The hard part is finding someone relevant to your city, timing, language or need — and knowing how to move from a public profile to a private conversation without oversharing.',
    solutionTitle: 'Match the conversation to the context.',
    solutionBody: 'BrazilBR brings city, languages, interests and current need into discovery, then lets you choose whether to create a connection and message privately.',
    cards: [
      { title: 'Start with a real situation', body: 'Your current city and need create more context than a generic request to make friends.' },
      { title: 'Discover by shared signals', body: 'Public profiles can show city, languages, interests and the context someone has chosen to share.' },
      { title: 'Keep the next step private', body: 'Use connections and messages when a conversation should move out of public discovery.' },
      { title: 'Contribute the local answer', body: 'Share a useful Place, link or tip so the next person can act on it too.' },
    ],
    steps: [
      { number: '01', title: 'Tell us your city', body: 'Give the conversation a place without publishing your exact coordinates.' },
      { number: '02', title: 'Choose the kind of help', body: 'Add the need, language or interest that would make a connection relevant.' },
      { number: '03', title: 'Start at your comfort level', body: 'Explore a profile, send a connection or use a private message when ready.' },
    ],
    faq: [
      { question: 'Can I meet locals as well as travelers?', answer: 'The product supports public profiles and community participation by city. The quality and availability of people depends on the city and the active community.' },
      { question: 'Does BrazilBR show exact locations?', answer: 'No. The product is designed around city-level context and optional map visibility.' },
      { question: 'Is this a dating app?', answer: 'No. BrazilBR is a local context and connection product. People may use it for friendship, language, community or practical help, but dating is not the core promise.' },
      { question: 'How much does it cost to start?', answer: 'There is no active paid plan or checkout in the current MVP.' },
    ],
    related: [
      { label: 'Expat community in Brazil', path: '/expat-community-brazil' },
      { label: 'Digital nomad community in Brazil', path: '/digital-nomad-brazil' },
      { label: 'How BrazilBR works', path: '/' },
    ],
  },
};

export function getSeoConfig(path: string): PublicSeoConfig {
  return SEO_PAGES[path] || HOME_SEO;
}
