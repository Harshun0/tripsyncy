export interface TravelerProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  location: string;
  bio: string;
  budget: 'Budget' | 'Mid-Range' | 'Luxury';
  personality: 'Introvert' | 'Extrovert' | 'Ambivert';
  interests: string[];
  badges: string[];
  verified: boolean;
  isOnline: boolean;
  distance?: number;
  matchScore?: number;
  trips: number;
  followers: number;
  following: number;
}

export interface TravelPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  saved: boolean;
  liked: boolean;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitWith: string[];
  status: 'paid' | 'pending';
  date: string;
}

export const dummyProfiles: TravelerProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    location: 'Mumbai, India',
    bio: 'Adventure seeker | Solo traveler | Mountain lover 🏔️',
    budget: 'Mid-Range',
    personality: 'Extrovert',
    interests: ['Adventure', 'Nature', 'Photography', 'Culture'],
    badges: ['Solo Explorer', 'Mountain Master', 'Verified'],
    verified: true,
    isOnline: true,
    distance: 2.5,
    matchScore: 87,
    trips: 24,
    followers: 1250,
    following: 340,
  },
  {
    id: '2',
    name: 'Arjun Patel',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Delhi, India',
    bio: 'Food explorer | Budget backpacker | Always up for spontaneous trips',
    budget: 'Budget',
    personality: 'Ambivert',
    interests: ['Food', 'Culture', 'History', 'Budget Travel'],
    badges: ['Foodie', 'Budget King', 'Culture Vulture'],
    verified: true,
    isOnline: true,
    distance: 4.8,
    matchScore: 92,
    trips: 45,
    followers: 2340,
    following: 567,
  },
  {
    id: '3',
    name: 'Ananya Reddy',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Bangalore, India',
    bio: 'Spiritual journey seeker | Temple hopper | Yoga enthusiast 🧘‍♀️',
    budget: 'Mid-Range',
    personality: 'Introvert',
    interests: ['Spirituality', 'Yoga', 'Culture', 'Nature'],
    badges: ['Spiritual Seeker', 'Yoga Master'],
    verified: true,
    isOnline: false,
    distance: 8.2,
    matchScore: 78,
    trips: 18,
    followers: 890,
    following: 234,
  },
  {
    id: '4',
    name: 'Rahul Mehta',
    age: 31,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: 'Pune, India',
    bio: 'Luxury traveler | Wine connoisseur | Business + Leisure',
    budget: 'Luxury',
    personality: 'Extrovert',
    interests: ['Luxury', 'Food', 'Wine', 'Beach'],
    badges: ['Luxury Explorer', 'Beach Lover', 'Verified'],
    verified: true,
    isOnline: true,
    distance: 1.2,
    matchScore: 65,
    trips: 52,
    followers: 4560,
    following: 230,
  },
  {
    id: '5',
    name: 'Sneha Kapoor',
    age: 27,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    location: 'Jaipur, India',
    bio: 'Heritage hunter | Photography lover | Cultural explorer 📸',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: ['Culture', 'Photography', 'History', 'Art'],
    badges: ['Heritage Hunter', 'Photographer'],
    verified: false,
    isOnline: true,
    distance: 12.5,
    matchScore: 81,
    trips: 31,
    followers: 1890,
    following: 456,
  },
  {
    id: '6',
    name: 'Vikram Singh',
    age: 28,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Goa, India',
    bio: 'Beach bum | Water sports addict | Party animal 🏄‍♂️',
    budget: 'Budget',
    personality: 'Extrovert',
    interests: ['Beach', 'Adventure', 'Nightlife', 'Water Sports'],
    badges: ['Beach Pro', 'Party Animal', 'Adventure Junkie'],
    verified: true,
    isOnline: false,
    distance: 22.0,
    matchScore: 74,
    trips: 38,
    followers: 3200,
    following: 890,
  },
];

export const dummyPosts: TravelPost[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Arjun Patel',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Rishikesh, Uttarakhand',
    image: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=600&h=400&fit=crop',
    caption: 'Found peace by the Ganges 🙏 The sound of river flowing is pure meditation. Rishikesh never disappoints! #SoloTravel #Rishikesh',
    likes: 234,
    comments: 18,
    saved: false,
    liked: false,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    userId: '1',
    userName: 'Priya Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    location: 'Leh, Ladakh',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    caption: 'Conquered Khardung La at 18,380 ft! 🏔️ The view was worth every breath I struggled for. Who wants to join my next mountain expedition?',
    likes: 567,
    comments: 45,
    saved: true,
    liked: true,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    userId: '5',
    userName: 'Sneha Kapoor',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    location: 'Hampi, Karnataka',
    image: 'https://images.unsplash.com/photo-1590766940554-634a7c9a2fe4?w=600&h=400&fit=crop',
    caption: 'Walking through history at Hampi. Every stone tells a story of the magnificent Vijayanagara Empire 🏛️ #HeritageTravel #Hampi',
    likes: 189,
    comments: 12,
    saved: false,
    liked: false,
    timestamp: '1 day ago',
  },
  {
    id: '4',
    userId: '6',
    userName: 'Vikram Singh',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Arambol, Goa',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    caption: 'Sunset sessions at Arambol beach 🌅 This is what dreams are made of. Goa vibes hitting different this season!',
    likes: 432,
    comments: 28,
    saved: false,
    liked: true,
    timestamp: '2 days ago',
  },
];

export const dummyMessages: Message[] = [
  { id: '1', senderId: '2', content: "Hey! I saw you're also planning a trip to Goa next week?", timestamp: '10:30 AM', isMe: false },
  { id: '2', senderId: 'me', content: "Yes! I'm planning to go from 15th to 20th. Are you going solo?", timestamp: '10:32 AM', isMe: true },
  { id: '3', senderId: '2', content: "Same dates! I'm going with one friend but we're open to meeting fellow travelers", timestamp: '10:35 AM', isMe: false },
  { id: '4', senderId: 'me', content: "That's awesome! Our match score is 92% 😄 Would love to plan some activities together", timestamp: '10:38 AM', isMe: true },
  { id: '5', senderId: '2', content: "Perfect! I'm really into water sports and beach hopping. What about you?", timestamp: '10:40 AM', isMe: false },
];

export const dummyExpenses: Expense[] = [
  { id: '1', title: 'Hotel Booking - 3 nights', amount: 12000, paidBy: 'Arjun', splitWith: ['You', 'Priya'], status: 'pending', date: '15 Dec' },
  { id: '2', title: 'Dinner at Beach Shack', amount: 2400, paidBy: 'You', splitWith: ['Arjun', 'Priya'], status: 'pending', date: '16 Dec' },
  { id: '3', title: 'Water Sports Package', amount: 4500, paidBy: 'Priya', splitWith: ['You', 'Arjun'], status: 'paid', date: '17 Dec' },
  { id: '4', title: 'Scooter Rental - 3 days', amount: 1200, paidBy: 'You', splitWith: ['Arjun'], status: 'paid', date: '15 Dec' },
];

export const itineraryDays = [
  {
    day: 1,
    title: 'Arrival & North Goa Exploration',
    activities: [
      { time: '10:00 AM', activity: 'Arrive at Dabolim Airport', cost: 0 },
      { time: '12:00 PM', activity: 'Check-in at Anjuna Beach Resort', cost: 4000 },
      { time: '2:00 PM', activity: 'Lunch at Curlies Beach Shack', cost: 800 },
      { time: '4:00 PM', activity: 'Visit Chapora Fort (Dil Chahta Hai Fort)', cost: 0 },
      { time: '7:00 PM', activity: 'Sunset at Vagator Beach', cost: 0 },
      { time: '9:00 PM', activity: 'Dinner at Thalassa Greek Restaurant', cost: 1500 },
    ],
  },
  {
    day: 2,
    title: 'Adventure & Water Sports',
    activities: [
      { time: '8:00 AM', activity: 'Breakfast at Resort', cost: 500 },
      { time: '10:00 AM', activity: 'Water Sports at Calangute (Parasailing, Jet Ski)', cost: 3000 },
      { time: '1:00 PM', activity: 'Lunch at Fisherman\'s Wharf', cost: 1200 },
      { time: '3:00 PM', activity: 'Dolphin Watching Tour', cost: 1000 },
      { time: '6:00 PM', activity: 'Evening at Baga Beach', cost: 0 },
      { time: '9:00 PM', activity: 'Club night at Tito\'s', cost: 2000 },
    ],
  },
  {
    day: 3,
    title: 'Culture & Heritage',
    activities: [
      { time: '9:00 AM', activity: 'Visit Se Cathedral & Basilica of Bom Jesus', cost: 0 },
      { time: '12:00 PM', activity: 'Explore Old Goa', cost: 0 },
      { time: '1:30 PM', activity: 'Goan Thali Lunch at Ritz Classic', cost: 600 },
      { time: '3:30 PM', activity: 'Spice Plantation Tour', cost: 500 },
      { time: '7:00 PM', activity: 'Panjim Fontainhas Latin Quarter Walk', cost: 0 },
      { time: '9:00 PM', activity: 'Dinner at Black Sheep Bistro', cost: 1800 },
    ],
  },
];
