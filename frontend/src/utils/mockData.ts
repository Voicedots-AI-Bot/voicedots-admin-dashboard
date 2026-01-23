export interface Conversation {
  id: string
  title: string
  avatar: string
  initials: string
  cost: number
  messages: number
  status: 'active' | 'pending' | 'completed'
  lastActive: string
  date: string // ISO date string for sorting
}

export interface Message {
  id: string
  conversationId: string
  sender: 'bot' | 'user'
  content: string
  timestamp: string
  cost?: number
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Product Launch Strategy',
    avatar: 'PL',
    initials: 'PL',
    cost: 8.5,
    messages: 42,
    status: 'active',
    lastActive: '2 mins ago',
    date: '2023-10-25T10:30:00Z',
  },
  {
    id: '2',
    title: 'Q4 Marketing Plan',
    avatar: 'MK',
    initials: 'MK',
    cost: 6.2,
    messages: 28,
    status: 'active',
    lastActive: '1 hour ago',
    date: '2023-10-25T09:15:00Z',
  },
  {
    id: '3',
    title: 'Website Redesign',
    avatar: 'WR',
    initials: 'WR',
    cost: 9.5,
    messages: 156,
    status: 'pending',
    lastActive: '3 hours ago',
    date: '2023-10-24T16:45:00Z',
  },
  {
    id: '4',
    title: 'Client Onboarding Flow',
    avatar: 'CO',
    initials: 'CO',
    cost: 2.4,
    messages: 12,
    status: 'completed',
    lastActive: '1 day ago',
    date: '2023-10-23T14:20:00Z',
  },
  {
    id: '5',
    title: 'Mobile App Features',
    avatar: 'MA',
    initials: 'MA',
    cost: 4.5,
    messages: 34,
    status: 'active',
    lastActive: '5 mins ago',
    date: '2023-10-25T11:00:00Z',
  },
  {
    id: '6',
    title: 'User Research 2024',
    avatar: 'UR',
    initials: 'UR',
    cost: 1.5,
    messages: 8,
    status: 'pending',
    lastActive: '2 days ago',
    date: '2023-10-22T09:00:00Z',
  },
  {
    id: '7',
    title: 'Brand Guidelines',
    avatar: 'BG',
    initials: 'BG',
    cost: 7.8,
    messages: 67,
    status: 'completed',
    lastActive: '1 week ago',
    date: '2023-10-18T15:30:00Z',
  },
  {
    id: '8',
    title: 'Sales Deck Review',
    avatar: 'SD',
    initials: 'SD',
    cost: 3.2,
    messages: 19,
    status: 'active',
    lastActive: '4 hours ago',
    date: '2023-10-24T13:10:00Z',
  },
  {
    id: '9',
    title: 'Competitor Analysis',
    avatar: 'CA',
    initials: 'CA',
    cost: 11.0,
    messages: 89,
    status: 'completed',
    lastActive: '3 days ago',
    date: '2023-10-21T11:45:00Z',
  },
  {
    id: '10',
    title: 'Email Campaign Copy',
    avatar: 'EC',
    initials: 'EC',
    cost: 4.2,
    messages: 25,
    status: 'active',
    lastActive: '30 mins ago',
    date: '2023-10-25T10:00:00Z',
  },
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversationId: '1',
    sender: 'user',
    content: 'Hi! I need help planning our product launch strategy.',
    timestamp: '2023-10-25T10:15:00Z',
  },
  {
    id: 'm2',
    conversationId: '1',
    sender: 'bot',
    content:
      "Hello! I'd be happy to help you plan your product launch. Let's start by understanding your target audience and key objectives. What product are you launching?",
    timestamp: '2023-10-25T10:15:30Z',
    cost: 0.05,
  },
  {
    id: 'm3',
    conversationId: '1',
    sender: 'user',
    content:
      "We're launching a new SaaS platform for project management teams.",
    timestamp: '2023-10-25T10:16:00Z',
  },
  {
    id: 'm4',
    conversationId: '1',
    sender: 'bot',
    content:
      "Excellent! Project management SaaS is a competitive space. Here's a comprehensive launch strategy:\n\n1. Pre-launch (4-6 weeks before):\n- Build landing page with email capture\n- Create beta tester program\n- Develop content marketing strategy\n\n2. Launch week:\n- Product Hunt launch\n- Email campaign to waitlist\n- Social media announcement\n\n3. Post-launch:\n- Gather user feedback\n- Iterate quickly\n- Build case studies\n\nWould you like me to dive deeper into any of these areas?",
    timestamp: '2023-10-25T10:16:45Z',
    cost: 0.12,
  },
  {
    id: 'm5',
    conversationId: '1',
    sender: 'user',
    content:
      'This is great! Can you help me with the content marketing strategy specifically?',
    timestamp: '2023-10-25T10:18:00Z',
  },
  {
    id: 'm6',
    conversationId: '1',
    sender: 'bot',
    content:
      'Absolutely! Here\'s a content marketing strategy tailored for your project management SaaS:\n\n**Blog Content:**\n- "10 Project Management Mistakes Killing Your Productivity"\n- "How to Choose the Right PM Tool for Your Team"\n- Case studies from beta users\n\n**Video Content:**\n- Product demo walkthrough\n- Customer testimonials\n- Tips & tricks series\n\n**Social Media:**\n- LinkedIn: Thought leadership posts\n- Twitter: Quick tips, feature highlights\n- YouTube: Tutorial videos\n\n**Email Sequences:**\n- Welcome series (5 emails)\n- Feature education drip\n- Success stories\n\nShould I create a detailed content calendar for the first month?',
    timestamp: '2023-10-25T10:19:30Z',
    cost: 0.15,
  },
  {
    id: 'm7',
    conversationId: '2',
    sender: 'user',
    content: 'I need to create a Q4 marketing plan for our company.',
    timestamp: '2023-10-25T09:10:00Z',
  },
  {
    id: 'm8',
    conversationId: '2',
    sender: 'bot',
    content:
      "I'll help you create a comprehensive Q4 marketing plan. First, let me understand your business better. What industry are you in and what are your main marketing goals for Q4?",
    timestamp: '2023-10-25T09:10:30Z',
    cost: 0.04,
  },
]

export const ANALYTICS_DATA = {
  totalConversations: 124,
  totalCost: 48.50,
  totalMessages: 1429,
  avgCost: 3.91,
  costHistory: [
    { day: 'Mon', cost: 120 },
    { day: 'Tue', cost: 145 },
    { day: 'Wed', cost: 132 },
    { day: 'Thu', cost: 180 },
    { day: 'Fri', cost: 210 },
    { day: 'Sat', cost: 95 },
    { day: 'Sun', cost: 85 },
  ],
  messageVolume: [
    { day: 'Mon', messages: 340 },
    { day: 'Tue', messages: 410 },
    { day: 'Wed', messages: 380 },
    { day: 'Thu', messages: 520 },
    { day: 'Fri', messages: 580 },
    { day: 'Sat', messages: 210 },
    { day: 'Sun', messages: 190 },
  ],
}
