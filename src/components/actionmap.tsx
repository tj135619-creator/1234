import React, { useState, useEffect } from 'react';
import { MapPin, Users, Zap, Star, Award, Heart, Coffee, BookOpen, TreePine, ShoppingBag, MessageCircle, Smile, Hand, Check, Lock, TrendingUp, Sparkles, ChevronRight, X, Trophy, FolderOpen } from 'lucide-react';


// ADD THESE FIREBASE IMPORTS
import { db, auth } from '../firebase';
import { getAuth } from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc,
  onSnapshot, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  getDocs,
  setDoc
} from 'firebase/firestore';

interface Squad {
  id: string;
  name: string;
  captain: string;
  members: string[]; // array of member IDs
  totalMissions: number;
  avgCompletion: number;
  rank: number;
  color: string;
}

interface PartyMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
  type: 'chat' | 'system' | 'completion';
}

interface MissionParty {
  id: string;
  locationId: string;
  missionName: string;
  startTime: any; // Can be Date or Firebase Timestamp
  participants: string[]; // array of user IDs
  status: 'upcoming' | 'active' | 'completed';
  createdBy?: string;
  createdAt?: any;
}

interface PartyStats {
  totalParticipants: number;
  completions: number;
  avgAnxietyBefore: number;
  avgAnxietyAfter: number;
  totalReactions: number;
  achievements: string[];
}

interface PartyPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: any;
  isAnonymous: boolean;
}

interface SquadMember {
  id: string;
  userId: string;
  squadId: string;
  name: string;
  isOnline: boolean;
  currentLocation: string | null;
  streak: number;
  lastActive: any; // Firebase Timestamp
}

interface LocationMemory {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: any;
  reactions: {
    wave: number;
    heart: number;
  };
  replies: number;
}

interface MissionParty {
  id: string;
  locationId: string;
  missionName: string;
  startTime: any;
  participants: string[]; // array of user IDs
  status: 'upcoming' | 'active' | 'completed';
}



interface Avatar {
  id: string;
  name: string;
  color: string;
  currentLocation: string;
  streak: number;
  isInExperiment?: boolean;
}

interface Reaction {
  id: string;
  type: 'wave' | 'thumbs-up' | 'heart';
  from: string;
  timestamp: Date;
}

interface ExperimentParticipant {
  id: string;
  name: string;
  color: string;
  nodePosition: { x: number; y: number };
  hasCompleted: boolean;
  reactionEmoji?: string;
}

interface Location {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  position: { x: number; y: number };
  mission: string;
  description: string;
  xpReward: number;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  activeUsers: number;
  reflectionPrompt: string;
  day: number;  // ADD THIS LINE
}



export default function SocialCityMap() {
  // ... existing state ...


const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
const [dayExplorerTab, setDayExplorerTab] = useState<'mission' | 'community'>('mission'); // <--- ADD THIS
// ... existing community state ...
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const [showPartiesPanel, setShowPartiesPanel] = useState(false);
const [partyCountdown, setPartyCountdown] = useState<number | null>(null);
  
  // Firebase real-time data
  const [userSquad, setUserSquad] = useState<Squad | null>(null);
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([]);
  const [locationMemories, setLocationMemories] = useState<{[key: string]: LocationMemory[]}>({});
  const [upcomingParties, setUpcomingParties] = useState<MissionParty[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  
  // UI panels
  const [showSquadPanel, setShowSquadPanel] = useState(false);
  const [showMemoryWall, setShowMemoryWall] = useState(false);
  const [memoryInputText, setMemoryInputText] = useState('');
const [memoryFilter, setMemoryFilter] = useState<'all' | 'recent' | 'popular'>('recent');
  const [selectedMemoryLocation, setSelectedMemoryLocation] = useState<string | null>(null);
  

  const [userXP, setUserXP] = useState(450);
  const [userStreak, setUserStreak] = useState(7);
  
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [newParty, setNewParty] = useState({
    locationId: '',
    missionName: '',
    startDate: '',
    startTime: '',
  });

  // Party-specific state
const [selectedParty, setSelectedParty] = useState<MissionParty | null>(null);
const [showPartyLobby, setShowPartyLobby] = useState(false);
const [partyMessages, setPartyMessages] = useState<PartyMessage[]>([]);
const [partyMessageInput, setPartyMessageInput] = useState('');
const [partyStats, setPartyStats] = useState<PartyStats | null>(null);
const [showPartyStats, setShowPartyStats] = useState(false);
const [partyPhotos, setPartyPhotos] = useState<PartyPhoto[]>([]);
const [showPhotoWall, setShowPhotoWall] = useState(false);
const [liveParticipantLocations, setLiveParticipantLocations] = useState<{[userId: string]: {lat: number, lng: number, status: string}}>({});
const [partyReactionCount, setPartyReactionCount] = useState(0);
  
  // New experiment mode states
  const [experimentMode, setExperimentMode] = useState(false);
  const [experimentParticipants, setExperimentParticipants] = useState<ExperimentParticipant[]>([]);
  const [userCompletedExperiment, setUserCompletedExperiment] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [partnerCompletedCount, setPartnerCompletedCount] = useState(0);
  const [showMatchingScreen, setShowMatchingScreen] = useState(false);
const [matchingProgress, setMatchingProgress] = useState(0);

  const [showDayExplorer, setShowDayExplorer] = useState(false);
const [peopleOnSelectedDay, setPeopleOnSelectedDay] = useState<Avatar[]>([]);

  const auth = getAuth();
const currentUserId = auth.currentUser?.uid;
  const currentUserName = 'You';



  const [campfireMessages, setCampfireMessages] = useState<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: any;
    reactions: { [emoji: string]: number };
    isVulnerable: boolean;
  }[]>([]);

  const [liveAtLocation, setLiveAtLocation] = useState<{
    arrived: Avatar[];
    onTheWay: Avatar[];
    preparing: Avatar[];
    justCompleted: Avatar[];
  }>({
    arrived: [],
    onTheWay: [],
    preparing: [],
    justCompleted: []
  });

  const [dayStats, setDayStats] = useState({
    completionsToday: 0,
    completionRate: 0,
    avgTimeToComplete: 0,
    peakTime: '7-8pm',
    hypeLevel: 67,
    trendPercentage: 45
  });

  const [todaysChampions, setTodaysChampions] = useState({
    firstTimer: null,
    bestTip: null,
    biggestBreakthrough: null
  });

  const [encouragementNotes, setEncouragementNotes] = useState([]);
  const [groupDepartures, setGroupDepartures] = useState([]);
  const [buddyMatches, setBuddyMatches] = useState([]);
  const [anxietyJourney, setAnxietyJourney] = useState({
    beforeAvg: 7.8,
    duringAvg: 5.2,
    afterAvg: 2.1,
    totalResponses: 234,
    dropRate: 5.7
  });
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [showCampfireWall, setShowCampfireWall] = useState(false);
  const [campfireInput, setCampfireInput] = useState('');
  const [showBuddyFinder, setShowBuddyFinder] = useState(false);
  const [buddyFilters, setBuddyFilters] = useState({
    anxietyLevel: 5,
    preferredTime: 'evening',
    experience: 'first-timer'
  });

  // ---------------------------------
  // Guarded updates using useEffect
  // ---------------------------------
 // only runs when currentUserId changes

useEffect(() => {
  if (!currentUserId) return;

  // Listen to campfire messages in real-time
  const q = query(
    collection(db, "campfireMessages"),
    where("userId", "==", currentUserId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCampfireMessages(messages as any); // Type assertion if needed
  });

  return () => unsubscribe(); // cleanup listener on unmount
}, [currentUserId]);


useEffect(() => {
  console.log('🎉 showPartiesPanel changed:', showPartiesPanel);
  console.log('📦 upcomingParties:', upcomingParties);
}, [showPartiesPanel, upcomingParties]);




// FIREBASE LISTENER 1: User's Squad
useEffect(() => {
  if (!currentUserId) return;
  
  const unsubscribe = onSnapshot(
    query(collection(db, 'squadMembers'), where('userId', '==', currentUserId)),
    (snapshot) => {
      if (!snapshot.empty) {
        const memberData = snapshot.docs[0].data();
        const squadId = memberData.squadId;
        
        // Listen to squad details
        const squadUnsubscribe = onSnapshot(
          doc(db, 'squads', squadId),
          (squadDoc) => {
            if (squadDoc.exists()) {
              setUserSquad({ id: squadDoc.id, ...squadDoc.data() } as Squad);
            }
          }
        );
        
        return () => squadUnsubscribe();
      }
    }
  );
  
  return () => unsubscribe();
}, [currentUserId]);


// ONE-TIME TASK UPDATE: Add 'done' field to all tasks



// LISTENER: Party Chat Messages
useEffect(() => {
  if (!selectedParty) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'missionParties', selectedParty.id, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    ),
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartyMessage[];
      setPartyMessages(messages.reverse());
    }
  );
  
  return () => unsubscribe();
}, [selectedParty?.id]);

// LISTENER: Live Participant Locations
useEffect(() => {
  if (!selectedParty || selectedParty.status !== 'active') return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'partyParticipants', selectedParty.id, 'locations'),
      where('isActive', '==', true)
    ),
    (snapshot) => {
      const locations: {[key: string]: any} = {};
      snapshot.docs.forEach(doc => {
        locations[doc.data().userId] = doc.data();
      });
      setLiveParticipantLocations(locations);
    }
  );
  
  return () => unsubscribe();
}, [selectedParty?.id, selectedParty?.status]);

// LISTENER: Party Photos
useEffect(() => {
  if (!selectedParty) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'missionParties', selectedParty.id, 'photos'),
      orderBy('timestamp', 'desc'),
      limit(30)
    ),
    (snapshot) => {
      const photos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PartyPhoto[];
      setPartyPhotos(photos);
    }
  );
  
  return () => unsubscribe();
}, [selectedParty?.id]);

// LISTENER: Party Stats (for completed parties)
useEffect(() => {
  if (!selectedParty || selectedParty.status !== 'completed') return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'missionParties', selectedParty.id, 'stats', 'summary'),
    (snapshot) => {
      if (snapshot.exists()) {
        setPartyStats(snapshot.data() as PartyStats);
      }
    }
  );
  
  return () => unsubscribe();
}, [selectedParty?.id, selectedParty?.status]);


// FIREBASE LISTENER 2: Squad Members
useEffect(() => {
  if (!userSquad) return;
  
  const unsubscribe = onSnapshot(
    query(collection(db, 'squadMembers'), where('squadId', '==', userSquad.id)),
    (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SquadMember[];
      setSquadMembers(members);
    }
  );
  
  return () => unsubscribe();
}, [userSquad?.id]);

// FIREBASE LISTENER 3: Location Memories
useEffect(() => {
  if (!selectedMemoryLocation) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'locationMemories', selectedMemoryLocation, 'memories'),
      orderBy('timestamp', 'desc'),
      limit(20)
    ),
    (snapshot) => {
      const memories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LocationMemory[];
      
      setLocationMemories(prev => ({
        ...prev,
        [selectedMemoryLocation]: memories
      }));
    }
  );
  
  return () => unsubscribe();
}, [selectedMemoryLocation]);

// FIREBASE LISTENER 4: Upcoming Mission Parties
// FIREBASE LISTENER 4: Upcoming Mission Parties
useEffect(() => {
  // Simple query without compound index for now
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'missionParties'),
      where('status', '==', 'upcoming'),
      orderBy('startTime', 'asc'),
      limit(10)
    ),
    (snapshot) => {
      const parties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MissionParty[];
      
      // Filter in memory for future parties
      const now = new Date();
      const futureParties = parties.filter(p => 
        p.startTime?.toDate && p.startTime.toDate() > now
      );
      
      setUpcomingParties(futureParties);
    },
    (error) => {
      console.error('Error loading parties:', error);
      // If index error, set empty array
      setUpcomingParties([]);
    }
  );
  
  return () => unsubscribe();
}, []);


// TEMPORARY TEST DATA - Remove this later
// TEMPORARY TEST DATA
// TEMPORARY TEST DATA - FIXED
useEffect(() => {
  const now = new Date();
  
  const testParties: MissionParty[] = [
    {
      id: 'party1',
      locationId: 'coffee',
      missionName: 'Coffee Shop Greeting Party',
      startTime: new Date(now.getTime() + 8 * 60 * 1000),
      participants: [currentUserId, 'alex', 'sam', 'jordan', 'casey'],
      status: 'upcoming',
      createdBy: currentUserId,
      createdAt: now
    },
    {
      id: 'party2',
      locationId: 'library',
      missionName: 'Library Reading Challenge',
      startTime: new Date(now.getTime() + 7 * 60 * 1000),
      participants: [currentUserId, 'alex', 'sam'],
      status: 'upcoming',
      createdBy: 'alex',
      createdAt: now
    },
    {
      id: 'party3',
      locationId: 'park',
      missionName: 'Park Walking Party',
      startTime: new Date(now.getTime() - 5 * 60 * 1000),
      participants: ['alex', 'sam', 'jordan'],
      status: 'active',
      createdBy: 'sam',
      createdAt: now
    },
    {
      id: 'party4',
      locationId: 'market',
      missionName: 'Market Shopping Mission',
      startTime: new Date(now.getTime() - 60 * 60 * 1000),
      participants: [currentUserId, 'alex', 'sam', 'jordan', 'casey', 'riley'],
      status: 'completed',
      createdBy: 'jordan',
      createdAt: now
    }
  ];
  
  setUpcomingParties(testParties);
  
  setPartyStats({
    totalParticipants: 6,
    completions: 5,
    avgAnxietyBefore: 7.2,
    avgAnxietyAfter: 3.1,
    totalReactions: 247,
    achievements: [
      'Wave of Support (200+ reactions)',
      'No One Left Behind (83% completion)',
      'Hype Train (peaked at 97%)'
    ]
  });
  
  setLiveParticipantLocations({
    'alex': {
      lat: 0,
      lng: 0,
      status: 'completed',
      userName: 'Alex',
      locationId: 'park'
    },
    'sam': {
      lat: 0,
      lng: 0,
      status: 'active',
      userName: 'Sam',
      locationId: 'park'
    },
    'jordan': {
      lat: 0,
      lng: 0,
      status: 'arrived',
      userName: 'Jordan',
      locationId: 'park'
    }
  });

  setCampfireMessages([
    { id: 'camp1', userId: 'alex', userName: 'Alex', text: 'Sitting in my car...', timestamp: { toDate: () => new Date(Date.now() - 3000) }, reactions: { '💪': 12, '❤️': 8 }, isVulnerable: true },
    { id: 'camp2', userId: 'sam', userName: 'Sam', text: 'YOU GOT THIS ALEX!', timestamp: { toDate: () => new Date(Date.now() - 12000) }, reactions: { '👋': 47, '💪': 23 }, isVulnerable: false },
    { id: 'camp3', userId: 'jordan', userName: 'Jordan', text: 'Pro tip...', timestamp: { toDate: () => new Date(Date.now() - 60000) }, reactions: { '⭐': 89, '💡': 34 }, isVulnerable: false },
    { id: 'camp4', userId: 'casey', userName: 'Casey', text: 'Anyone else\'s heart racing?', timestamp: { toDate: () => new Date(Date.now() - 120000) }, reactions: { '🙋': 31 }, isVulnerable: true }
  ]);

  setTodaysChampions({
    firstTimer: {
      name: 'Sarah',
      time: '6:47am',
      message: 'I couldn\'t sleep so I just went for it. BEST DECISION!',
      reactions: 234
    },
    bestTip: {
      name: 'Mike',
      tip: 'Smile at the barista when you walk in. It breaks the ice and they smile back.',
      helpful: 178
    },
    biggestBreakthrough: {
      name: 'Jordan',
      story: 'I have social anxiety disorder. I did it. I cried happy tears in my car after.',
      reactions: 456,
      replies: 89
    }
  });

  setEncouragementNotes([
    {
      id: 'enc1',
      from: 'Sarah',
      message: 'I was SO scared. I sat outside for 10 minutes. But I did it. And you know what? The barista was SO NICE. Nobody judged me. You can do this. I believe in you. ❤️',
      completedAgo: '2h ago',
      reactions: 892
    },
    {
      id: 'enc2',
      from: 'Mike',
      message: 'Your anxiety is lying to you. Everyone in there is focused on their own stuff. Nobody is watching you. You\'re going to do amazing. 💪',
      completedAgo: '5h ago',
      reactions: 567
    }
  ]);

  const nextDeparture = new Date(Date.now() + 15 * 60 * 1000);
  setGroupDepartures([
    {
      id: 'group1',
      locationId: 'cafe',
      departureTime: nextDeparture,
      participants: ['alex', 'sam', 'jordan', 'casey', 'pat', 'riley', 'morgan', 'taylor'],
      messages: [
        { userId: 'alex', userName: 'Alex', text: 'Let\'s all order the same thing lol' },
        { userId: 'sam', userName: 'Sam', text: 'I\'m so nervous but excited!' },
        { userId: 'jordan', userName: 'Jordan', text: 'We move together! 💪' }
      ]
    }
  ]);

  setBuddyMatches([
    {
      id: 'buddy1',
      name: 'Alex',
      anxietyLevel: 7,
      preferredTime: 'Evening (6-9pm)',
      experience: 'First timer',
      matchPercentage: 95,
      lastSeen: '2m ago',
      message: 'Also terrified. Want to text each other before/during/after?'
    },
    {
      id: 'buddy2',
      name: 'Sam',
      anxietyLevel: 6,
      preferredTime: 'Evening (6-9pm)',
      experience: 'Did it once before',
      matchPercentage: 89,
      lastSeen: '5m ago',
      message: '7/10 anxiety. Planning to go at 7pm. Would love a buddy!'
    }
  ]);

  setLiveUpdates([
    {
      id: 'live1',
      userId: 'sarah',
      userName: 'Sarah',
      action: 'Just ordered! ✅',
      timestamp: new Date(Date.now() - 5000),
      replies: [
        { userId: 'mike', userName: 'Mike', text: 'YESSS GO SARAH! 🎉' },
        { userId: 'alex', userName: 'Alex', text: 'How do you feel??' },
        { userId: 'sarah', userName: 'Sarah', text: 'Honestly? PROUD. My voice shook but I did it!' }
      ],
      reactions: 47
    },
    {
      id: 'live2',
      userId: 'jordan',
      userName: 'Jordan',
      action: 'Walking in now... here goes 😰',
      timestamp: new Date(Date.now() - 23000),
      replies: [],
      reactions: 47
    },
    {
      id: 'live3',
      userId: 'pat',
      userName: 'Pat',
      action: 'COMPLETED! IM SHAKING! IN A GOOD WAY!!!! 🎉🎉🎉',
      timestamp: new Date(Date.now() - 60000),
      replies: [],
      reactions: 156
    }
  ]);
}, [selectedDayNumber]); // Run only once on mount

// Separate useEffect for party messages based on selected party
useEffect(() => {
  if (selectedParty?.id === 'party2') {
    const now = new Date();
    setPartyMessages([
      {
        id: 'msg1',
        userId: 'alex',
        userName: 'Alex',
        text: 'First timer here, so nervous! 😰',
        timestamp: { toDate: () => new Date(now.getTime() - 30000) },
        type: 'chat'
      },
      {
        id: 'msg2',
        userId: 'sam',
        userName: 'Sam',
        text: 'You got this! 💪',
        timestamp: { toDate: () => new Date(now.getTime() - 20000) },
        type: 'chat'
      },
      {
        id: 'msg3',
        userId: 'jordan',
        userName: 'Jordan',
        text: 'Who else is excited?!',
        timestamp: { toDate: () => new Date(now.getTime() - 10000) },
        type: 'chat'
      }
    ]);
  }
}, [selectedParty?.id]); // Only run when selectedParty changes


// Countdown timer for active party
useEffect(() => {
  if (!selectedParty || !selectedParty.startTime?.toDate) return;
  
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const start = selectedParty.startTime.toDate().getTime();
    const diff = Math.floor((start - now) / 1000); // seconds
    
    if (diff <= 0) {
      setPartyCountdown(0);
      clearInterval(interval);
    } else {
      setPartyCountdown(diff);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [selectedParty]);

// FIREBASE LISTENER 5: Online Count
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'userPresence'), where('isOnline', '==', true)),
    (snapshot) => {
      setOnlineCount(snapshot.size);
    },
    (error) => {
      console.error('Error listening to online count:', error);
    }
  );
  
  return () => unsubscribe();
}, []);

// Update user presence on mount/unmount
useEffect(() => {
  if (!currentUserId) return;
  
  const presenceRef = doc(db, 'userPresence', currentUserId);
  
  // FIXED: Use setDoc with merge to create/update
  const setOnline = async () => {
    try {
      await setDoc(presenceRef, {
        userId: currentUserId,
        isOnline: true,
        currentLocation: null,
        lastSeen: serverTimestamp(),
        status: 'active'
      }, { merge: true }); // Creates if doesn't exist, updates if exists
      
      console.log('✅ User presence set to online');
    } catch (error) {
      console.error('❌ Error setting user online:', error);
    }
  };
  
  setOnline();
  
  // Set offline on unmount
  return () => {
    setDoc(presenceRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    }, { merge: true }).catch((error) => {
      console.error('Error setting user offline:', error);
    });
  };
}, [currentUserId]);


  // Mock data for locations
  const [locations, setLocations] = useState<Location[]>([
  {
    id: 'cafe',
    name: 'Community Café',
    icon: Coffee,
    position: { x: 15, y: 8 },
    mission: 'Say hi to 1 person',
    description: 'Start small with a friendly greeting',
    xpReward: 50,
    status: 'completed',
    activeUsers: 12,
    reflectionPrompt: 'How did it feel to initiate a greeting? What did you notice?',
    day: 1
  },
  {
    id: 'library',
    name: 'Wisdom Library',
    icon: BookOpen,
    position: { x: 35, y: 28 },
    mission: 'Ask someone a question',
    description: 'Practice curiosity and engagement',
    xpReward: 75,
    status: 'in-progress',
    activeUsers: 8,
    reflectionPrompt: 'What made asking easier or harder? How did the other person respond?',
    day: 2
  },
  {
    id: 'park',
    name: 'Friendship Park',
    icon: TreePine,
    position: { x: 65, y: 22 },
    mission: 'Give someone a genuine compliment',
    description: 'Spread positivity and connection',
    xpReward: 100,
    status: 'available',
    activeUsers: 15,
    reflectionPrompt: 'How did giving a compliment make you feel? What was their reaction?',
    day: 3
  },
  {
    id: 'market',
    name: 'Social Market',
    icon: ShoppingBag,
    position: { x: 25, y: 58 },
    mission: 'Share a story or experience',
    description: 'Open up and be vulnerable',
    xpReward: 125,
    status: 'available',
    activeUsers: 6,
    reflectionPrompt: 'What felt comfortable or uncomfortable about sharing?',
    day: 4
  },
  {
    id: 'plaza',
    name: 'Connection Plaza',
    icon: Users,
    position: { x: 55, y: 82 },
    mission: 'Join a group conversation',
    description: 'Practice being part of a group',
    xpReward: 150,
    status: 'locked',
    activeUsers: 20,
    reflectionPrompt: 'How did you contribute to the conversation? What went well?',
    day: 5
  }
]);

  // Mock avatars moving through city
  const [activeAvatars, setActiveAvatars] = useState<Avatar[]>([]);
const [currentUserDay, setCurrentUserDay] = useState<number>(1);

// LISTENER: Campfire Messages for Selected Day
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'dayCampfire', `day${selectedDayNumber}`, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    ),
    (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampfireMessages(messages as any);
    },
    (error) => {
      console.error('Error loading campfire messages:', error);
      setCampfireMessages([]);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber]);

// LISTENER: Today's Champions for Selected Day
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'dayChampions', `day${selectedDayNumber}`),
    (snapshot) => {
      if (snapshot.exists()) {
        setTodaysChampions(snapshot.data() as any);
      }
    },
    (error) => {
      console.error('Error loading champions:', error);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber]);

// LISTENER: Day Stats
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'dayStats', `day${selectedDayNumber}`),
    (snapshot) => {
      if (snapshot.exists()) {
        setDayStats(snapshot.data() as any);
      }
    },
    (error) => {
      console.error('Error loading day stats:', error);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber]);

// LISTENER: Encouragement Notes
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'encouragementNotes', `day${selectedDayNumber}`, 'notes'),
      orderBy('timestamp', 'desc'),
      limit(20)
    ),
    (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEncouragementNotes(notes as any);
    },
    (error) => {
      console.error('Error loading encouragement notes:', error);
      setEncouragementNotes([]);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber]);

// LISTENER: Group Departures
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const locationForDay = locations.find(l => l.day === selectedDayNumber);
  if (!locationForDay) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'groupDepartures'),
      where('locationId', '==', locationForDay.id),
      where('departureTime', '>', new Date()),
      orderBy('departureTime', 'asc'),
      limit(5)
    ),
    (snapshot) => {
      const departures = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroupDepartures(departures as any);
    },
    (error) => {
      console.error('Error loading group departures:', error);
      setGroupDepartures([]);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber, locations]);

// LISTENER: Live Updates for Selected Day
useEffect(() => {
  if (!selectedDayNumber) return;
  
  const locationForDay = locations.find(l => l.day === selectedDayNumber);
  if (!locationForDay) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'liveUpdates', locationForDay.id, 'updates'),
      orderBy('timestamp', 'desc'),
      limit(30)
    ),
    (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLiveUpdates(updates as any);
    },
    (error) => {
      console.error('Error loading live updates:', error);
      setLiveUpdates([]);
    }
  );
  
  return () => unsubscribe();
}, [selectedDayNumber, locations]);

// ADD THIS NEW LISTENER (after the other useEffect listeners, around line 350):

// LISTENER: Real-time community avatars by current day
useEffect(() => {
  if (!currentUserId) return;

  const unsubscribe = onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const avatars: Avatar[] = [];
      console.log(`🧩 Total user documents found: ${snapshot.size}`);

      snapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const courseData = userData.datedcourses?.social_skills;

        console.log(`\n👤 Processing user: ${userId}`);

        if (!courseData) {
          console.log("⚠️ No 'datedcourses.social_skills' found for this user");
          return;
        }
        if (!Array.isArray(courseData.days)) {
          console.log("⚠️ 'days' field missing or not an array");
          return;
        }

        // Detect missing 'done' indicators
        const hasMissingDone = courseData.days.some((day: any) =>
          day.tasks?.some((t: any) => t.done === undefined)
        );

        let currentDayData;

        if (hasMissingDone) {
          currentDayData = courseData.days[0];
          console.log("🟡 Missing 'done' fields → Defaulting to Day 1");
        } else {
          const earliestUnfinished = courseData.days.find((day: any) =>
            day.tasks?.some((t: any) => !t.done)
          );
          currentDayData = earliestUnfinished || courseData.days[courseData.days.length - 1];
          console.log(
            earliestUnfinished
              ? `🔍 Earliest unfinished day found → Day ${currentDayData.day}`
              : `✅ All tasks completed → Using last day (${courseData.days.length})`
          );
        }

        if (!currentDayData) {
          console.log("❌ No valid day data found, skipping user");
          return;
        }

        const dayNumber = currentDayData.day;
        console.log(`📅 Determined current day for ${userId}: Day ${dayNumber}`);

        // Track current user locally
        if (userId === currentUserId) setCurrentUserDay(dayNumber);

        // Determine display location
        const firstTask = currentDayData.tasks?.[0];
        const locationName = firstTask?.location || currentDayData.title || "";
        if (!locationName) {
          console.log("⚠️ No location name found for this day");
          return;
        }

        const locationId = locations.find((loc) =>
          loc.name.toLowerCase().includes(locationName.toLowerCase().slice(0, 10))
        )?.id;
        if (!locationId) {
          console.log(`⚠️ No matching location found for name: ${locationName}`);
          return;
        }

        const colors = [
          "from-blue-500 to-cyan-500",
          "from-pink-500 to-rose-500",
          "from-green-500 to-emerald-500",
          "from-purple-500 to-violet-500",
          "from-orange-500 to-amber-500",
          "from-red-500 to-rose-500",
          "from-yellow-500 to-orange-500",
        ];

        avatars.push({
          id: userId,
          name: courseData.goal_name || "User",
          color: colors[Math.floor(Math.random() * colors.length)],
          currentLocation: locationId,
          streak: courseData.streak || 0,
          isInExperiment: false,
        });
      });

      console.log(`\n✅ Active avatars updated: ${avatars.length}`);
      setActiveAvatars(avatars);
    },
    (error) => {
      console.error("❌ Error loading community avatars:", error);
    }
  );

  return () => unsubscribe();
}, [currentUserId, locations]);





  const [recentActivity] = useState([
    { user: 'Alex', action: 'completed Café mission', time: '2m ago', icon: Check },
    { user: 'Sam', action: 'earned "Conversation Starter" badge', time: '5m ago', icon: Award },
    { user: 'Jordan', action: 'is at Friendship Park', time: '8m ago', icon: MapPin },
    { user: 'Casey', action: 'sent you a wave 👋', time: '12m ago', icon: Hand }
  ]);

  const openLocationModal = (location: Location) => {
    if (location.status === 'locked') return;
    setSelectedLocation(location);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLocation(null);
  };

const startMission = () => {
  if (!selectedLocation) return;
  
  // Update location status locally
  setLocations(locations.map(loc => 
    loc.id === selectedLocation.id 
      ? { ...loc, status: 'in-progress' } 
      : loc
  ));
  
  // Update Firebase presence
  updateUserLocation(selectedLocation.id);
  
  closeModal();
};

  const completeMission = () => {
    setModalOpen(false);
    setCompletionModalOpen(true);
  };

  const submitReflection = async () => {
  if (!selectedLocation) return;
  
  // Update location status locally
  setLocations(locations.map(loc => 
    loc.id === selectedLocation.id 
      ? { ...loc, status: 'completed' } 
      : loc
  ));
  
  setUserXP(prev => prev + selectedLocation.xpReward);
  setUserStreak(prev => prev + 1);
  
  // Save memory to Firebase if reflection text exists
  if (reflectionText.trim()) {
    await leaveMemory(selectedLocation.id, reflectionText);
  }
  
  // Update user location (now null since completed)
  await updateUserLocation(null);
  
  // Update squad stats
  if (userSquad) {
    const squadRef = doc(db, 'squads', userSquad.id);
    await updateDoc(squadRef, {
      totalMissions: increment(1)
    });
  }
  
  setCompletionModalOpen(false);
  setSelectedLocation(null);
  setReflectionText('');
};

  const getAvatarsAtLocation = (locationId: string) => {
    return activeAvatars.filter(avatar => avatar.currentLocation === locationId);
  };

  const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

  const startExperiment = () => {
  // Close modal and show matching screen
  setModalOpen(false);
  setShowMatchingScreen(true);
  setMatchingProgress(0);
  
  // Animate matching progress
  const progressInterval = setInterval(() => {
    setMatchingProgress(prev => {
      if (prev >= 100) {
        clearInterval(progressInterval);
        return 100;
      }
      return prev + 10;
    });
  }, 150);
  
  // After 2 seconds, show the arena
  setTimeout(() => {
    clearInterval(progressInterval);
    setShowMatchingScreen(false);
    
    // Create mini-arena with 2-3 participants
    const participants: ExperimentParticipant[] = [
      {
        id: 'user',
        name: 'You',
        color: 'from-purple-500 to-pink-500',
        nodePosition: { x: 30, y: 50 },
        hasCompleted: false
      },
      {
        id: 'partner1',
        name: 'Alex',
        color: 'from-blue-500 to-cyan-500',
        nodePosition: { x: 70, y: 50 },
        hasCompleted: false
      },
      {
        id: 'partner2',
        name: 'Sam',
        color: 'from-green-500 to-emerald-500',
        nodePosition: { x: 50, y: 25 },
        hasCompleted: false
      }
    ];
    
    setExperimentParticipants(participants);
    setExperimentMode(true);
    setUserCompletedExperiment(false);
    setPartnerCompletedCount(0);
    
    // Simulate partners completing
    setTimeout(() => {
      setExperimentParticipants(prev => 
        prev.map(p => p.id === 'partner2' ? { ...p, hasCompleted: true, reactionEmoji: '👋' } : p)
      );
      setPartnerCompletedCount(1);
    }, 3000);
    
    setTimeout(() => {
      setExperimentParticipants(prev => 
        prev.map(p => p.id === 'partner1' ? { ...p, hasCompleted: true, reactionEmoji: '👍' } : p)
      );
      setPartnerCompletedCount(2);
    }, 5000);
  }, 2000);
  };



  const completeExperiment = () => {
    setUserCompletedExperiment(true);
    setExperimentParticipants(prev => 
      prev.map(p => p.id === 'user' ? { ...p, hasCompleted: true, reactionEmoji: '❤️' } : p)
    );
    
    // Check if all completed
    const allCompleted = experimentParticipants.every(p => p.hasCompleted || p.id === 'user');
    
    if (allCompleted || partnerCompletedCount >= 1) {
      // Trigger reward animation
      setShowRewardAnimation(true);
      
      setTimeout(() => {
        // Award bonus XP
        const bonusXP = selectedLocation ? selectedLocation.xpReward * 1.5 : 150;
        setUserXP(prev => prev + bonusXP);
        
        // Exit experiment mode
        setTimeout(() => {
          setExperimentMode(false);
          setShowRewardAnimation(false);
          setCompletionModalOpen(true);
        }, 2000);
      }, 1500);
    }

  };

  
  


  const exitExperiment = () => {
    setExperimentMode(false);
    setExperimentParticipants([]);
    setUserCompletedExperiment(false);
    setShowRewardAnimation(false);
  };

  // Function to leave a memory at a location
const leaveMemory = async (locationId: string, text: string) => {
  if (!text.trim() || !currentUserId) return;
  
  try {
    await addDoc(collection(db, 'locationMemories', locationId, 'memories'), {
      userId: currentUserId,
      userName: currentUserName,
      text: text.trim(),
      timestamp: serverTimestamp(),
      reactions: { wave: 0, heart: 0 },
      replies: 0
    });
    
    // Clear input
    setReflectionText('');
  } catch (error) {
    console.error('Error leaving memory:', error);
  }
};

// Function to react to a memory
const reactToMemory = async (locationId: string, memoryId: string, reactionType: 'wave' | 'heart') => {
  try {
    const memoryRef = doc(db, 'locationMemories', locationId, 'memories', memoryId);
    await updateDoc(memoryRef, {
      [`reactions.${reactionType}`]: increment(1)
    });
  } catch (error) {
    console.error('Error reacting to memory:', error);
  }
};

// Function to join a mission party


// Update user location when starting mission
const updateUserLocation = async (locationId: string | null) => {
  if (!currentUserId) return;
  
  try {
    const presenceRef = doc(db, 'userPresence', currentUserId);
    await updateDoc(presenceRef, {
      currentLocation: locationId,
      lastSeen: serverTimestamp()
    });
    
    // Also update in squadMembers
    const memberQuery = query(
      collection(db, 'squadMembers'),
      where('userId', '==', currentUserId)
    );
    const memberSnapshot = await getDocs(memberQuery);
    
    if (!memberSnapshot.empty) {
      const memberRef = doc(db, 'squadMembers', memberSnapshot.docs[0].id);
      await updateDoc(memberRef, {
        currentLocation: locationId,
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating location:', error);
  }
};

// Function to join a mission party
const joinMissionParty = async (partyId: string) => {
  if (!currentUserId) return;
  
  try {
    const party = upcomingParties.find(p => p.id === partyId);
    if (!party) return;
    
    // Check if already joined
    if (party.participants.includes(currentUserId)) {
      console.log('Already joined this party!');
      return;
    }
    
    const partyRef = doc(db, 'missionParties', partyId);
    await updateDoc(partyRef, {
      participants: [...party.participants, currentUserId]
    });
    
    console.log('✅ Joined party!');
  } catch (error) {
    console.error('Error joining party:', error);
  }
};

// Function to create a new mission party
const createMissionParty = async () => {
  if (!newParty.locationId || !newParty.startDate || !newParty.startTime) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    // Combine date and time
    const startDateTime = new Date(`${newParty.startDate}T${newParty.startTime}`);
    
    // Check if time is in the future
    if (startDateTime <= new Date()) {
      alert('Party must be scheduled for a future time');
      return;
    }
    
    const location = locations.find(l => l.id === newParty.locationId);
    
    await addDoc(collection(db, 'missionParties'), {
      locationId: newParty.locationId,
      missionName: newParty.missionName || location?.mission || 'Group Mission',
      startTime: startDateTime,
      participants: [currentUserId], // Creator auto-joins
      status: 'upcoming',
      createdBy: currentUserId,
      createdAt: serverTimestamp()
    });
    
    // Reset form
    setNewParty({
      locationId: '',
      missionName: '',
      startTime: '',
      startDate: ''
    });
    setShowCreateParty(false);
    
  } catch (error) {
    console.error('Error creating party:', error);
    alert('Failed to create party. Please try again.');
  }
};

// Function to leave a mission party
const leaveMissionParty = async (partyId: string) => {
  if (!currentUserId) return;
  
  try {
    const party = upcomingParties.find(p => p.id === partyId);
    if (!party) return;
    
    const partyRef = doc(db, 'missionParties', partyId);
    await updateDoc(partyRef, {
      participants: party.participants.filter(id => id !== currentUserId)
    });
  } catch (error) {
    console.error('Error leaving party:', error);
  }
};

// Send message in party chat
const sendPartyMessage = async (partyId: string, text: string) => {
  if (!text.trim() || !currentUserId) return;
  
  try {
    await addDoc(collection(db, 'missionParties', partyId, 'messages'), {
      userId: currentUserId,
      userName: currentUserName,
      text: text.trim(),
      timestamp: serverTimestamp(),
      type: 'chat'
    });
    
    setPartyMessageInput('');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Update live location during active party
const updatePartyLocation = async (partyId: string, status: 'arrived' | 'active' | 'completed') => {
  if (!currentUserId || !selectedLocation) return;
  
  try {
    const locationRef = doc(db, 'partyParticipants', partyId, 'locations', currentUserId);
    await updateDoc(locationRef, {
      userId: currentUserId,
      userName: currentUserName,
      locationId: selectedLocation.id,
      status: status,
      isActive: status !== 'completed',
      timestamp: serverTimestamp()
    }).catch(() => {
      // Create if doesn't exist
      addDoc(collection(db, 'partyParticipants', partyId, 'locations'), {
        userId: currentUserId,
        userName: currentUserName,
        locationId: selectedLocation.id,
        status: status,
        isActive: status !== 'completed',
        timestamp: serverTimestamp()
      });
    });
    
    // Send system message on completion
    if (status === 'completed') {
      await addDoc(collection(db, 'missionParties', partyId, 'messages'), {
        userId: currentUserId,
        userName: currentUserName,
        text: `completed the mission! 🎉`,
        timestamp: serverTimestamp(),
        type: 'completion'
      });
    }
  } catch (error) {
    console.error('Error updating party location:', error);
  }
};

// Send party reaction
const sendPartyReaction = async (partyId: string, reactionType: string) => {
  if (!currentUserId) return;
  
  try {
    await addDoc(collection(db, 'missionParties', partyId, 'reactions'), {
      userId: currentUserId,
      type: reactionType,
      timestamp: serverTimestamp()
    });
    
    setPartyReactionCount(prev => prev + 1);
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
};

// Upload party photo (placeholder - you'd implement actual image upload)
const uploadPartyPhoto = async (partyId: string, imageFile: File) => {
  if (!currentUserId) return;
  
  try {
    // In real implementation, upload to Firebase Storage first
    // For now, using placeholder
    await addDoc(collection(db, 'missionParties', partyId, 'photos'), {
      userId: currentUserId,
      imageUrl: 'placeholder-url', // Replace with actual upload
      timestamp: serverTimestamp(),
      isAnonymous: true
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
  }
};

const openDayExplorer = (dayNumber: number) => {
  setSelectedDayNumber(dayNumber);
  
  // Filter avatars who are on this day
  const peopleOnDay = activeAvatars.filter(avatar => {
    const location = locations.find(l => l.currentLocation === avatar.currentLocation);
    return location?.day === dayNumber;
  });
  
  setPeopleOnSelectedDay(peopleOnDay);
  setShowDayExplorer(true);
};


// Format countdown time
const formatCountdown = (seconds: number) => {
  if (seconds <= 0) return 'Started!';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

// Post message to campfire
const postToCampfire = async (message: string, isVulnerable: boolean = false) => {
  if (!message.trim() || !selectedDayNumber || !currentUserId) return;
  
  try {
    await addDoc(collection(db, 'dayCampfire', `day${selectedDayNumber}`, 'messages'), {
      userId: currentUserId,
      userName: currentUserName,
      text: message.trim(),
      timestamp: serverTimestamp(),
      reactions: {},
      isVulnerable: isVulnerable
    });
    
    setCampfireInput('');
  } catch (error) {
    console.error('Error posting to campfire:', error);
  }
};

// React to campfire message
const reactToCampfireMessage = async (messageId: string, emoji: string) => {
  if (!selectedDayNumber) return;
  
  try {
    const messageRef = doc(db, 'dayCampfire', `day${selectedDayNumber}`, 'messages', messageId);
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: increment(1)
    });
  } catch (error) {
    console.error('Error reacting to message:', error);
  }
};

// Leave encouragement note
const leaveEncouragementNote = async (message: string) => {
  if (!message.trim() || !selectedDayNumber || !currentUserId) return;
  
  try {
    await addDoc(collection(db, 'encouragementNotes', `day${selectedDayNumber}`, 'notes'), {
      from: currentUserName,
      message: message.trim(),
      completedAgo: '2h ago', // Calculate from actual completion
      reactions: 0,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error leaving encouragement:', error);
  }
};

// Join group departure
// Join group departure
const joinGroupDeparture = async (departureId: string) => {
  if (!currentUserId) return;
  
  try {
    const departureRef = doc(db, 'groupDepartures', departureId);
    const departure = groupDepartures.find(d => d.id === departureId);
    
    if (departure && !departure.participants.includes(currentUserId)) {
      await updateDoc(departureRef, {
        participants: [...departure.participants, currentUserId]
      });
    }
  } catch (error) {
    console.error('Error joining group departure:', error);
  }
};

// Calculate live location status
const updateLiveLocationStatus = () => {
  if (!selectedDayNumber) return;
  
  const dayLocation = locations.find(l => l.day === selectedDayNumber);
  if (!dayLocation) return;
  
  const peopleAtLocation = activeAvatars.filter(a => a.currentLocation === dayLocation.id);
  
  // Mock categorization - in real app, track actual status
  setLiveAtLocation({
    arrived: peopleAtLocation.slice(0, 3),
    onTheWay: peopleAtLocation.slice(3, 8),
    preparing: peopleAtLocation.slice(8, 20),
    justCompleted: peopleAtLocation.slice(20, 28)
  });
};

// Update live status when day changes
useEffect(() => {
  updateLiveLocationStatus();
}, [selectedDayNumber, activeAvatars]);



  return (
    <div className="w-full text-white">
      <div className="w-full">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-purple-800/40 backdrop-blur-sm rounded-full border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                <span className="text-sm font-medium text-purple-200">Social Adventure City</span>
                
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
  Your City of Growth
</h1>

              <p className="text-purple-300 mt-2">Complete missions, connect with others, level up your social skills</p>
            </div>
            
            {/* User Stats */}
            <div className="hidden md:flex gap-3">
              <div className="px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-purple-300">XP</span>
                </div>
                <p className="text-xl font-bold text-white">{userXP}</p>
              </div>
              <div className="px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-purple-300">Streak</span>
                </div>
                <p className="text-xl font-bold text-white">{userStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main City Map */}
          <div className="lg:col-span-2">
            <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden">
              
              {/* Decorative background grid */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-purple-400"></div>
                  ))}
                </div>
              </div>

              {/* SVG Path connecting locations */}
              

              {/* City Map Container */}
              {/* City Map Container */}
<div className="relative w-full h-[500px] md:h-[800px] overflow-y-auto overflow-x-hidden" style={{ zIndex: 2 }}>
  <div className="relative w-full min-h-[1000px]">

                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#ec4899" stopOpacity="0.7" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="75%" stopColor="#ec4899" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Path connecting: Cafe(20,15) -> Library(45,30) -> Park(75,20) -> Market(30,55) -> Plaza(60,65) */}
                {/* Path connecting: Cafe -> Library -> Park -> Market -> Plaza */}
<path
  d="M 15 8 C 10 15, 20 22, 35 28 C 42 32, 58 28, 65 22 C 70 18, 60 35, 50 45 C 40 52, 30 55, 25 58 C 22 62, 30 75, 55 82"
  fill="none"
  stroke="url(#pathGradient)"
  strokeWidth="0.5"
  strokeLinecap="round"
  strokeDasharray="3 6"
  filter="url(#glow)"
  className="animate-dash"
/>
              </svg>

                
                
                {/* Locations */}
                {locations.map((location) => {
                  const avatarsHere = getAvatarsAtLocation(location.id);
                  const isHovered = hoveredLocation === location.id;
                  
                  return (
                    <div
                      key={location.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        left: `${location.position.x}%`, 
                        top: `${location.position.y}%` 
                      }}
                    >
                      {/* Location marker */}
                      <div
                        className={`relative cursor-pointer transition-all duration-300 ${
                          isHovered ? 'scale-110' : 'scale-100'
                        }`}
                        onClick={() => openLocationModal(location)}
                        onMouseEnter={() => setHoveredLocation(location.id)}
                        onMouseLeave={() => setHoveredLocation(null)}
                      >
                        {/* Pulsing ring for active locations */}
                        {location.status === 'in-progress' && (
                          <div className="absolute inset-0 w-20 h-20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                            <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-30"></div>
                          </div>
                        )}

                        {/* Main location circle */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 ${

                          location.status === 'completed'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 shadow-green-500/50'
                            : location.status === 'in-progress'
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-purple-500/50 animate-pulse'
                            : location.status === 'available'
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-indigo-500/40'
                            : 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700/30 opacity-60'
                        }`}>
                          {location.status === 'locked' ? (
                            <Lock className="w-7 h-7 text-purple-500" />
                          ) : (
                            <location.icon className="w-10 h-10 text-white drop-shadow-lg" />

                          )}
                        </div>

                        {/* Day Number Badge - TOP LEFT */}
<button
  onClick={(e) => {
    e.stopPropagation();
    openDayExplorer(location.day);
  }}
  className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white shadow-lg z-10 transition-all hover:scale-110"
>
  {location.day}
</button>

{/* Current user's day indicator */}
{location.day === currentUserDay && (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-lg animate-pulse">
    YOUR DAY
  </div>
)}

                        {/* Active users badge */}
                        {location.status !== 'locked' && (
                          <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-purple-950 shadow-lg">
                            {location.activeUsers}
                          </div>
                        )}

                        {/* Completed checkmark */}
                        {location.status === 'completed' && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-purple-950">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Location label */}
<div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap transition-opacity duration-300 ${
  isHovered ? 'opacity-100' : 'opacity-80'
}`}>
  <div className="bg-purple-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-500/30 shadow-xl">
  <div className="flex items-center gap-2 mb-1">
    <div className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-400/40 rounded-full">
      <span className="text-[10px] font-bold text-yellow-300">Day {location.day}</span>
    </div>
    <p className="text-xs font-bold text-white">{location.name}</p>
  </div>
  <p className="text-[10px] text-purple-300">{location.mission}</p>
    
    {/* ADD THIS: Memory count button */}
    {location.status !== 'locked' && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedMemoryLocation(location.id);
          setShowMemoryWall(true);
        }}
        className="mt-1 w-full flex items-center justify-center gap-1 px-2 py-1 bg-purple-700/50 hover:bg-purple-600/70 rounded text-[10px] transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        <span>{locationMemories[location.id]?.length || 0} memories</span>
      </button>
    )}
  </div>
</div>

                      {/* Avatars at this location */}
                      {avatarsHere.length > 0 && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex -space-x-2">
                          {avatarsHere.slice(0, 3).map((avatar) => (
                            <div
                              key={avatar.id}
                              className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.color} border-2 border-purple-950 flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                              title={`${avatar.name} - ${avatar.streak} day streak`}
                            >
                              {avatar.name[0]}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Squad members at location indicator */}
        {userSquad?.members.filter(m => m.currentLocation === location.id && m.id !== 'user').length > 0 && (
          <div className="absolute -top-3 -left-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-1 border-2 border-purple-950 shadow-lg animate-pulse">
            <Users className="w-3 h-3 text-white" />
          </div>
        )}

        {upcomingParties.some(p => p.locationId === location.id) && (
  <div className="absolute -top-2 -right-2 animate-pulse">
    <div className="relative">
      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
        <Users className="w-3 h-3 text-white" />
      </div>
      <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75" />
    </div>
  </div>
)}
                    </div>
                  );
                })}
                 </div> 

                {/* ⬇️⬇️⬇️ ADD STEP 6 CODE HERE ⬇️⬇️⬇️ */}
  {/* Live Party Activity Overlay on Map */}
  {selectedParty && selectedParty.status === 'active' && (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none">
      {/* Live Activity Header */}
      <div className="bg-gradient-to-r from-orange-900/95 to-red-900/95 backdrop-blur-md rounded-2xl border border-orange-500/50 p-4 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-bold text-lg">🔴 PARTY LIVE NOW</span>
          </div>
          <button
            onClick={() => setSelectedParty(null)}
            className="p-1 hover:bg-orange-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-orange-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-2 bg-orange-800/30 rounded-lg">
            <p className="text-xs text-orange-300">Participants</p>
            <p className="text-xl font-bold text-white">{selectedParty.participants.length}</p>
          </div>
          <div className="p-2 bg-green-800/30 rounded-lg">
            <p className="text-xs text-green-300">Active Now</p>
            <p className="text-xl font-bold text-white">{Object.keys(liveParticipantLocations).length}</p>
          </div>
          <div className="p-2 bg-yellow-800/30 rounded-lg">
            <p className="text-xs text-yellow-300">Completed</p>
            <p className="text-xl font-bold text-white">
              {Object.values(liveParticipantLocations).filter((l: any) => l.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Live feed scroll */}
        <div className="mt-3 max-h-24 overflow-y-auto space-y-1">
          {Object.values(liveParticipantLocations).slice(0, 5).map((loc: any, i) => (
            <div key={i} className="text-xs text-orange-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="font-semibold">{loc.userName}</span>
              <span className="text-orange-300">
                {loc.status === 'completed' ? '✅ completed!' : loc.status === 'active' ? '⚡ in progress' : '📍 arrived'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
  {/* ⬆️⬆️⬆️ END OF STEP 6 CODE ⬆️⬆️⬆️ */}

              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600"></div>
                  <span className="text-purple-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
                  <span className="text-purple-300">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600"></div>
                  <span className="text-purple-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-900 to-indigo-900 opacity-60"></div>
                  <span className="text-purple-300">Locked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Activity Feed & Stats */}
          <div className="space-y-6">

            {/* Mission Parties Button */}


            
            {/* Mobile Stats */}
            <div className="md:hidden flex gap-3">
              <div className="flex-1 px-4 py-3 bg-purple-900/60 backdrop-blur-sm rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-purple-300">XP of the entire squad</span>
                </div>
                <p className="text-xl font-bold text-white">{userXP}</p>
              </div>
              
            </div>

              {/* ⬇️⬇️⬇️ ADD STEP 7 CODE HERE ⬇️⬇️⬇️ */}
    {/* Active Party Alert */}
    {upcomingParties.find(p => p.status === 'active' && p.participants.includes(currentUserId)) && (
      <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-md rounded-2xl border border-orange-500/50 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h3 className="font-bold text-white">🔴 YOUR PARTY IS LIVE!</h3>
        </div>
        
        <p className="text-sm text-orange-200 mb-4">
          Your mission party is happening right now!
        </p>
        
        <button
          onClick={() => {
            const activeParty = upcomingParties.find(p => p.status === 'active' && p.participants.includes(currentUserId));
            if (activeParty) {
              setSelectedParty(activeParty);
              setShowPartiesPanel(true);
            }
          }}
          className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Join Action
        </button>
      </div>
    )}
    {/* ⬆️⬆️⬆️ END OF STEP 7 CODE ⬆️⬆️⬆️ */}

            {/* Live Activity Feed */}
            <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Live Activity</h3>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 bg-purple-800/30 rounded-lg hover:bg-purple-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-semibold text-purple-200">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-purple-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 bg-purple-700/50 hover:bg-purple-700/70 rounded-lg text-sm font-medium transition-colors">
                View All Activity
              </button>

                
            
            </div>

            {/* Squad Members */}
            <div className="bg-purple-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-5">
              <button
    onClick={() => setShowPartiesPanel(true)}
    className="w-full p-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-2xl border border-pink-500/30 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 group"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-white">Mission Parties</h3>
          <p className="text-xs text-pink-100">
            {upcomingParties.length} upcoming events
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {upcomingParties.length > 0 && (
          <div className="px-2 py-1 bg-white/20 rounded-full">
            <span className="text-xs font-bold text-white">
              {upcomingParties[0].participants.length} joined
            </span>
          </div>
        )}
        <ChevronRight className="w-5 h-5 text-white" />
      </div>
    </div>
  </button>
              
              
            </div>

           

            {/* Recent Memories Preview */}
<div className="bg-purple-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-5">
  <div className="flex items-center gap-2 mb-4">
    <BookOpen className="w-5 h-5 text-purple-400" />
    <h3 className="font-bold text-white">Recent Memories</h3>
  </div>
  
  <div className="space-y-3">
    {Object.entries(locationMemories)
      .flatMap(([locId, memories]) => 
        memories.slice(0, 2).map(m => ({ ...m, locationId: locId }))
      )
      .slice(0, 3)
      .map((memory, index) => (
        <div 
          key={index}
          className="p-3 bg-purple-800/30 rounded-lg hover:bg-purple-800/50 transition-colors cursor-pointer"
          onClick={() => {
            setSelectedMemoryLocation(memory.locationId);
            setShowMemoryWall(true);
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
              {memory.userName[0]}
            </div>
            <span className="text-sm font-semibold text-purple-200">{memory.userName}</span>
            <span className="text-xs text-purple-400 ml-auto">
              {memory.timestamp?.toDate ? formatTimeAgo(memory.timestamp.toDate()) : 'now'}
            </span>
          </div>
          <p className="text-sm text-purple-100 line-clamp-2">
            {memory.text}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-purple-400">
            <span>👋 {memory.reactions.wave}</span>
            <span>❤️ {memory.reactions.heart}</span>
          </div>
        </div>
      ))
    }
    
    {Object.keys(locationMemories).length === 0 && (
      <p className="text-sm text-purple-400 text-center py-4">
        No memories yet. Complete a mission to share yours!
      </p>
    )}
  </div>

  <button 
    className="w-full mt-4 py-2 bg-purple-700/50 hover:bg-purple-700/70 rounded-lg text-sm font-medium transition-colors"
    onClick={() => {
      // Open memory wall for most active location
      const mostActive = locations.find(l => l.status === 'in-progress' || l.status === 'completed');
      if (mostActive) {
        setSelectedMemoryLocation(mostActive.id);
        setShowMemoryWall(true);
      }
    }}
  >
    Explore All Memories
  </button>
</div>


            
            {/* Team Mission Stats */}
<div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
    <Users className="w-5 h-5 text-cyan-400" />
    Team Mission Stats
  </h3>
  
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm text-cyan-200">People online now</span>
      <span className="text-lg font-bold text-cyan-400">23</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-cyan-200">Avg completion rate</span>
      <span className="text-lg font-bold text-green-400">94%</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm text-cyan-200">Teams active today</span>
      <span className="text-lg font-bold text-purple-400">47</span>
    </div>
  </div>

  <div className="mt-4 p-3 bg-cyan-800/30 rounded-lg border border-cyan-500/20">
    <p className="text-xs text-cyan-200">
      <span className="font-semibold">⚡ Peak time:</span> 7-9pm (5x more matches available)
    </p>
  </div>

  <button className="w-full mt-4 py-2 bg-cyan-700/50 hover:bg-cyan-700/70 rounded-lg text-sm font-medium transition-colors text-white">
    See Who's Online
  </button>
</div>

           

          </div>
        </div>

      </div>

      {/* Location Modal */}
      {/* Location Modal */}
{modalOpen && selectedLocation && (
  <div 
    className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setShowDayExplorer(false)}
  >
    <div 
      className="bg-gradient-to-br from-orange-900/98 to-red-900/98 rounded-2xl border border-orange-500/50 max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-orange-500/30 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Trophy className="w-8 h-8 text-orange-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{selectedDayNumber}</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">🏕️ Day {selectedDayNumber} Base Camp</h2>
              <p className="text-orange-300 text-sm mt-1">
                {peopleOnSelectedDay.length} adventurers warming up together
              </p>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(false)} 
            className="p-2 hover:bg-orange-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-orange-300" />
          </button>
        </div>

        {/* Tab Navigation */}
        {/* Tab Navigation */}
<div className="flex gap-2">
  <button
    onClick={() => setDayExplorerTab('community')}
    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all relative ${
      dayExplorerTab === 'community'
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-orange-800/30 text-orange-300 hover:bg-orange-800/50'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      🔥 Community (Live)
      {/* NEW: Live indicator dot */}
      {dayExplorerTab === 'community' && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse absolute top-2 right-2" />
      )}
    </div>
    {/* NEW: Feature count badge */}
    <div className="text-xs mt-1 opacity-75">
      9 active features
    </div>
  </button>
  <button
    onClick={() => setDayExplorerTab('mission')}
    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
      dayExplorerTab === 'mission'
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-orange-800/30 text-orange-300 hover:bg-orange-800/50'
    }`}
  >
    📍 Mission Info
  </button>
</div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {dayExplorerTab === 'community' ? (
          /* COMMUNITY TAB */
          <div className="p-6 space-y-6">

    
    {/* NEW: Community Features Overview Banner */}
    <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 rounded-2xl border border-cyan-500/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
        <h3 className="text-xl font-bold text-white">Day {selectedDayNumber} Community Hub - All Features Active!</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-orange-800/30 rounded-lg border border-orange-500/30 text-center">
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-xs text-orange-300 font-semibold">Campfire Wall</p>
          <p className="text-lg font-bold text-white">{campfireMessages.length}</p>
        </div>
        <div className="p-3 bg-purple-800/30 rounded-lg border border-purple-500/30 text-center">
          <div className="text-2xl mb-1">📊</div>
          <p className="text-xs text-purple-300 font-semibold">Live Stats</p>
          <p className="text-lg font-bold text-white">{dayStats.hypeLevel}%</p>
        </div>
        <div className="p-3 bg-cyan-800/30 rounded-lg border border-cyan-500/30 text-center">
          <div className="text-2xl mb-1">📍</div>
          <p className="text-xs text-cyan-300 font-semibold">At Location</p>
          <p className="text-lg font-bold text-white">{liveAtLocation.arrived.length}</p>
        </div>
        <div className="p-3 bg-green-800/30 rounded-lg border border-green-500/30 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <p className="text-xs text-green-300 font-semibold">Buddies</p>
          <p className="text-lg font-bold text-white">{buddyMatches.length}</p>
        </div>
      </div>
      <p className="text-center text-sm text-cyan-200 mt-4">
        ⚡ All features are live and updating in real-time
      </p>
    </div>

    {/* ⬇️⬇️⬇️ ADD THE QUICK NAVIGATION HERE ⬇️⬇️⬇️ */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button 
        onClick={() => document.getElementById('campfire')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-orange-700/30 hover:bg-orange-700/50 rounded-lg text-sm text-orange-200 whitespace-nowrap transition-all"
      >
        🔥 Campfire
      </button>
      <button 
        onClick={() => document.getElementById('hype-meter')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-purple-700/30 hover:bg-purple-700/50 rounded-lg text-sm text-purple-200 whitespace-nowrap transition-all"
      >
        📊 Hype Meter
      </button>
      <button 
        onClick={() => document.getElementById('live-location')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg text-sm text-cyan-200 whitespace-nowrap transition-all"
      >
        📍 Live Map
      </button>
      <button 
        onClick={() => document.getElementById('champions')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-yellow-700/30 hover:bg-yellow-700/50 rounded-lg text-sm text-yellow-200 whitespace-nowrap transition-all"
      >
        🏆 Champions
      </button>
      <button 
        onClick={() => document.getElementById('encouragement')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-pink-700/30 hover:bg-pink-700/50 rounded-lg text-sm text-pink-200 whitespace-nowrap transition-all"
      >
        💌 Messages
      </button>
      <button 
        onClick={() => document.getElementById('buddy-finder')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-green-700/30 hover:bg-green-700/50 rounded-lg text-sm text-green-200 whitespace-nowrap transition-all"
      >
        🎯 Buddy Finder
      </button>
    </div>
    {/* ⬆️⬆️⬆️ END OF QUICK NAVIGATION ⬆️⬆️⬆️ */}

            
            {/* THE CAMPFIRE WALL */}
            <div className="bg-gradient-to-br from-orange-800/40 to-red-800/40 rounded-2xl border border-orange-500/50 p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3 animate-pulse">🔥</div>
                <h3 className="text-2xl font-bold text-white mb-2">The Campfire Wall</h3>
                <p className="text-orange-200 text-sm">What people are thinking RIGHT NOW</p>
              </div>

              {/* Live Messages Stream */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {campfireMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-orange-300">Be the first to share your thoughts...</p>
                  </div>
                ) : (
                  campfireMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`p-4 rounded-xl transition-all ${
                        msg.isVulnerable 
                          ? 'bg-pink-900/40 border-2 border-pink-500/50' 
                          : 'bg-orange-900/30 border border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {msg.userName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{msg.userName}</span>
                            <span className="text-xs text-orange-400">
                              {msg.timestamp?.toDate ? formatTimeAgo(msg.timestamp.toDate()) : 'now'}
                            </span>
                            {msg.isVulnerable && (
                              <span className="text-xs px-2 py-0.5 bg-pink-500/30 border border-pink-400/50 rounded-full text-pink-200">
                                vulnerable
                              </span>
                            )}
                          </div>
                          <p className="text-orange-100 mb-2">{msg.text}</p>
                          
                          {/* Reactions */}
                          <div className="flex items-center gap-3">
                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => reactToCampfireMessage(msg.id, emoji)}
                                className="flex items-center gap-1 px-2 py-1 bg-orange-800/30 hover:bg-orange-800/50 rounded-lg transition-all hover:scale-110"
                              >
                                <span>{emoji}</span>
                                <span className="text-xs text-orange-200">{count}</span>
                              </button>
                            ))}
                            {Object.keys(msg.reactions).length === 0 && (
                              <div className="flex gap-1">
                                {['💪', '❤️', '👋'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => reactToCampfireMessage(msg.id, emoji)}
                                    className="px-2 py-1 bg-orange-800/20 hover:bg-orange-800/40 rounded-lg text-lg transition-all hover:scale-125"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Post Input */}
              <div className="border-t border-orange-500/30 pt-4">
                <textarea
                  value={campfireInput}
                  onChange={(e) => setCampfireInput(e.target.value)}
                  placeholder="Share what you're feeling... (be real, everyone here gets it)"
                  className="w-full px-4 py-3 bg-orange-900/30 border border-orange-500/30 rounded-xl text-white placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-orange-400">{campfireInput.length}/300</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => postToCampfire(campfireInput, true)}
                      disabled={!campfireInput.trim()}
                      className="px-4 py-2 bg-pink-600/50 hover:bg-pink-600/70 disabled:bg-orange-800/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      😰 Vulnerable Post
                    </button>
                    <button
                      onClick={() => postToCampfire(campfireInput, false)}
                      disabled={!campfireInput.trim()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* THE HYPE METER */}
            <div className="bg-gradient-to-br from-purple-800/40 to-pink-800/40 rounded-2xl border border-purple-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                🎯 Day {selectedDayNumber} Energy Today
              </h3>

              {/* Hype Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">HYPE LEVEL</span>
                  <span className="text-2xl font-bold text-white">{dayStats.hypeLevel}%</span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${dayStats.hypeLevel}%` }}
                  />
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Completions Today</p>
                  <p className="text-2xl font-bold text-white">{dayStats.completionsToday}</p>
                  <p className="text-xs text-green-400 mt-1">↑ {dayStats.trendPercentage}% from yesterday</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{dayStats.completionRate}%</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Avg Time</p>
                  <p className="text-lg font-bold text-white">{dayStats.avgTimeToComplete} mins</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Peak Time</p>
                  <p className="text-lg font-bold text-white">{dayStats.peakTime}</p>
                </div>
              </div>

              {/* Momentum Alert */}
              <div className="p-4 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-sm font-bold text-orange-200">MOMENTUM ALERT</p>
                    <p className="text-xs text-orange-300">Day {selectedDayNumber} is ON FIRE right now! {dayStats.completionsToday} people completed today!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE "WHO'S HERE" MAP */}
            <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-cyan-400" />
                📍 RIGHT NOW AT THE LOCATION
              </h3>

              {/* Status Groups */}
              <div className="space-y-4">
                {/* Arrived */}
                <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-green-300">🟢 ARRIVED ({liveAtLocation.arrived.length} people)</span>
                  </div>
                  {liveAtLocation.arrived.length === 0 ? (
                    <p className="text-sm text-green-400 italic">No one here yet - be the first!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {liveAtLocation.arrived.map(person => (
                        <div key={person.id} className="px-3 py-2 bg-green-800/30 rounded-lg border border-green-500/30 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-xs font-bold text-white`}>
                            {person.name[0]}
                          </div>
                          <span className="text-sm text-white">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* On The Way */}
                <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="font-bold text-yellow-300">🟡 ON THE WAY ({liveAtLocation.onTheWay.length} people)</span>
                  </div>
                  {liveAtLocation.onTheWay.length > 0 && (
                    <div className="space-y-2">
                      {liveAtLocation.onTheWay.slice(0, 5).map(person => (
                        <p key={person.id} className="text-sm text-yellow-200">
                          • {person.name} - "heading there now..."
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preparing */}
                <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="font-bold text-blue-300">🔵 PREPARING ({liveAtLocation.preparing.length} people)</span>
                  </div>
                  {liveAtLocation.preparing.length > 0 && (
                    <p className="text-sm text-blue-200">
                      {liveAtLocation.preparing.map(p => p.name).slice(0, 3).join(', ')}
                      {liveAtLocation.preparing.length > 3 && ` +${liveAtLocation.preparing.length - 3} more`} getting ready...
                    </p>
                  )}
                </div>

                {/* Just Completed */}
                <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-purple-300">⚡ JUST COMPLETED ({liveAtLocation.justCompleted.length} in last hour)</span>
                  </div>
                  {liveAtLocation.justCompleted.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {liveAtLocation.justCompleted.slice(0, 8).map(person => (
                        <div key={person.id} className="px-2 py-1 bg-purple-800/30 rounded-lg text-xs text-purple-200">
                          {person.name} ✅
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TODAY'S CHAMPIONS */}
            {(todaysChampions.firstTimer || todaysChampions.bestTip || todaysChampions.biggestBreakthrough) && (
              <div className="bg-gradient-to-br from-yellow-800/40 to-orange-800/40 rounded-2xl border border-yellow-500/50 p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  🏆 TODAY'S CHAMPIONS
                </h3>

                <div className="space-y-4">
                  {todaysChampions.firstTimer && (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-yellow-300">FIRST TIMER OF THE DAY</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.firstTimer.name} completed at {todaysChampions.firstTimer.time}</p>
                      <p className="text-yellow-200 italic">"{todaysChampions.firstTimer.message}"</p>
                      <p className="text-xs text-yellow-400 mt-2">👋 {todaysChampions.firstTimer.reactions} reactions</p>
                    </div>
                  )}

                  {todaysChampions.bestTip && (
                    <div className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="font-bold text-cyan-300">MOST HELPFUL TIP</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.bestTip.name}:</p>
                      <p className="text-cyan-200">"{todaysChampions.bestTip.tip}"</p>
                      <p className="text-xs text-cyan-400 mt-2">⭐ {todaysChampions.bestTip.helpful} people: "This helped!"</p>
                    </div>
                  )}

                  {todaysChampions.biggestBreakthrough && (
                    <div className="p-4 bg-pink-900/30 border border-pink-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💪</span>
                        <span className="font-bold text-pink-300">BIGGEST BREAKTHROUGH</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.biggestBreakthrough.name}:</p>
                      <p className="text-pink-200">"{todaysChampions.biggestBreakthrough.story}"</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-pink-400">
                        <span>❤️ {todaysChampions.biggestBreakthrough.reactions} reactions</span>
                        <span>💬 {todaysChampions.biggestBreakthrough.replies} replies</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* THE ENCOURAGEMENT WALL */}
            {encouragementNotes.length > 0 && (
              <div className="bg-gradient-to-br from-pink-800/40 to-purple-800/40 rounded-2xl border border-pink-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  💌 MESSAGES FROM PEOPLE WHO MADE IT
                </h3>

                <div className="space-y-4">
                  {encouragementNotes.map(note => (
                    <div key={note.id} className="p-5 bg-pink-900/30 border border-pink-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-pink-200">From: {note.from}</span>
                        <span className="text-xs text-pink-400">(completed {note.completedAgo})</span>
                      </div>
                      <p className="text-pink-100 leading-relaxed mb-3 whitespace-pre-line">
                        {note.message}
                      </p>
                      <p className="text-xs text-pink-400">👋 {note.reactions} people waved back</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowCampfireWall(true)}
                  className="w-full mt-4 py-3 bg-pink-600/50 hover:bg-pink-600/70 rounded-xl text-white font-semibold transition-all"
                >
                  Leave Your Own Message
                </button>
              </div>
            )}

            {/* THE ANXIETY METER */}
            <div className="bg-gradient-to-br from-indigo-800/40 to-purple-800/40 rounded-2xl border border-indigo-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                📊 DAY {selectedDayNumber} EMOTIONAL JOURNEY
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">BEFORE MISSION:</span>
                    <span className="text-xl font-bold text-white">{anxietyJourney.beforeAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😰','😰','😰','😰','😰','😰','😰','😐','😐','😊'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">DURING MISSION:</span>
                    <span className="text-xl font-bold text-white">{anxietyJourney.duringAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😰','😰','😰','😐','😐','😊','😊','😄','😄','😄'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">AFTER MISSION:</span>
                    <span className="text-xl font-bold text-green-400">{anxietyJourney.afterAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😊','😊','😊','😊','😄','😄','😄','😄','😁','😁'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl space-y-2">
                <p className="text-sm text-indigo-200">
                  <span className="font-semibold">💡 INSIGHT:</span> {anxietyJourney.totalResponses} responses analyzed
                </p>
                <p className="text-sm text-indigo-200">
                  94% of Day {selectedDayNumber}'ers report feeling BETTER after completing than they expected. <span className="font-semibold text-green-400">You will too.</span>
                </p>
                <p className="text-sm text-indigo-200">
                  📈 Average anxiety drops by <span className="font-bold text-green-400">{anxietyJourney.dropRate} points</span>. That's normal!
                </p>
              </div>
            </div>

            {/* NEXT GROUP DEPARTURE */}
            {groupDepartures.length > 0 && (
              <div className="bg-gradient-to-br from-green-800/40 to-emerald-800/40 rounded-2xl border border-green-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-400" />
                  ⏰ NEXT GROUP DEPARTURE
                </h3>

                {groupDepartures.map(departure => (
                  <div key={departure.id} className="space-y-4">
                    {/* Countdown */}
                    <div className="p-6 bg-green-900/40 border-2 border-green-500/50 rounded-xl text-center">
                      <p className="text-green-300 text-sm mb-2">Leaving together in:</p>
                      <p className="text-5xl font-bold text-white mb-2">
                        {Math.floor((departure.departureTime.getTime() - new Date().getTime()) / 60000)}:{
                          String(Math.floor(((departure.departureTime.getTime() - new Date().getTime()) % 60000) / 1000)).padStart(2, '0')
                        }
                      </p>
                      <p className="text-green-400 text-sm">
                        🚀 {departure.participants.length} PEOPLE heading to {
                          locations.find(l => l.id === departure.locationId)?.name || 'location'
                        }
                      </p>
                    </div>

                    {/* Participants */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-green-300 mr-2">Who's joining:</span>
                      {departure.participants.slice(0, 10).map((_, i) => (
                        <div 
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white/30"
                          style={{ marginLeft: i > 0 ? '-12px' : '0', zIndex: 10 - i }}
                        />
                      ))}
                      {departure.participants.length > 10 && (
                        <span className="text-sm font-bold text-green-400 ml-2">
                          +{departure.participants.length - 10} more
                        </span>
                      )}
                    </div>

                    {/* Group Chat Preview */}
                    {departure.messages.length > 0 && (
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <p className="text-xs text-green-400 mb-2">💬 Group Chat:</p>
                        <div className="space-y-1">
                          {departure.messages.map((msg, i) => (
                            <p key={i} className="text-sm text-green-200">
                              <span className="font-semibold">{msg.userName}:</span> {msg.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Join Button */}
                    <button
                      onClick={() => joinGroupDeparture(departure.id)}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Count Me In!
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* "LIVE FROM THE LOCATION" */}
            {liveUpdates.length > 0 && (
              <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 rounded-2xl border border-red-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  📡 LIVE UPDATES - HAPPENING NOW
                </h3>

                <div className="space-y-4">
                  {liveUpdates.map(update => (
                    <div key={update.id} className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {update.userName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{update.userName}:</span>
                            <span className="text-xs text-red-400">{formatTimeAgo(update.timestamp)}</span>
                          </div>
                          <p className="text-red-100 text-lg mb-2">{update.action}</p>
                          
                          {/* Reactions */}
                          {update.reactions > 0 && (
                            <p className="text-sm text-red-300 mb-2">💪 {update.reactions} reactions</p>
                          )}

                          {/* Replies */}
                          {update.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-red-500/30 space-y-2">
                              {update.replies.map((reply, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-semibold text-red-200">{reply.userName}:</span>
                                  <span className="text-red-300 ml-1">{reply.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUDDY BEACON */}
            {buddyMatches.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  🎯 FIND YOUR MISSION BUDDY
                </h3>

                {/* Filters */}
                <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-300 mb-3">Filter by:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">😰 Anxiety Level: {buddyFilters.anxietyLevel}/10</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={buddyFilters.anxietyLevel}
                        onChange={(e) => setBuddyFilters({...buddyFilters, anxietyLevel: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">⏰ Preferred Time</label>
                      <select
                        value={buddyFilters.preferredTime}
                        onChange={(e) => setBuddyFilters({...buddyFilters, preferredTime: e.target.value})}
                        className="w-full px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-white text-sm"
                      >
                        <option value="morning">Morning (6-12pm)</option>
                        <option value="afternoon">Afternoon (12-6pm)</option>
                        <option value="evening">Evening (6-9pm)</option>
                        <option value="night">Night (9pm+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">🎭 Experience</label>
                      <select
                        value={buddyFilters.experience}
                        onChange={(e) => setBuddyFilters({...buddyFilters, experience: e.target.value})}
                        className="w-full px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-white text-sm"
                      >
                        <option value="first-timer">First timer</option>
                        <option value="did-once">Did it once before</option>
                        <option value="experienced">Experienced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Perfect Matches */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-cyan-300 mb-3">PERFECT MATCHES:</p>
                  {buddyMatches.map(match => (
                    <div key={match.id} className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl hover:border-cyan-500/60 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {match.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{match.name}</span>
                              <div className="px-2 py-0.5 bg-green-500/30 border border-green-400/50 rounded-full">
                                <span className="text-xs font-bold text-green-200">{match.matchPercentage}% match</span>
                              </div>
                            </div>
                            <p className="text-xs text-cyan-400">Last seen: {match.lastSeen}</p>
                          </div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Anxiety</p>
                          <p className="text-white font-semibold">{match.anxietyLevel}/10</p>
                        </div>
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Time</p>
                          <p className="text-white font-semibold text-xs">{match.preferredTime}</p>
                        </div>
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Experience</p>
                          <p className="text-white font-semibold text-xs">{match.experience}</p>
                        </div>
                      </div>

                      {/* Their Message */}
                      <div className="p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-lg mb-3">
                        <p className="text-sm text-cyan-100 italic">"{match.message}"</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Message {match.name}
                        </button>
                        <button className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                          <Users className="w-4 h-4" />
                          Buddy Up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowBuddyFinder(true)}
                  className="w-full mt-4 py-3 bg-cyan-600/50 hover:bg-cyan-600/70 rounded-xl text-white font-semibold transition-all"
                >
                  See All Matches
                </button>
              </div>
            )}

          </div>
        ) : (
          /* MISSION TAB */
          <div className="p-6 space-y-6">
            {/* Mission Details */}
            <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 rounded-2xl border border-purple-500/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                {(() => {
                  const dayLocation = locations.find(l => l.day === selectedDayNumber);
                  const IconComponent = dayLocation?.icon || MapPin;
                  return (
                    <>
                      <div className="p-4 rounded-xl bg-purple-500/20">
                        <IconComponent className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{dayLocation?.name}</h3>
                        <p className="text-purple-300">{dayLocation?.mission}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {(() => {
                const dayLocation = locations.find(l => l.day === selectedDayNumber);
                return (
                  <>
                    <div className="p-4 bg-purple-900/30 rounded-xl mb-4">
                      <p className="text-purple-200 leading-relaxed">{dayLocation?.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-yellow-300">Reward</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dayLocation?.xpReward} XP</p>
                      </div>
                      <div className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          <span className="text-sm text-cyan-300">Active Now</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dayLocation?.activeUsers}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* People on This Day */}
            <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-cyan-400" />
                👥 People on Day {selectedDayNumber}
              </h3>

              {peopleOnSelectedDay.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                  <p className="text-cyan-300">No one on this day right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {peopleOnSelectedDay.map((person) => (
                    <div 
                      key={person.id}
                      className="p-4 bg-cyan-900/30 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-lg font-bold text-white border-2 border-cyan-400/50`}>
                          {person.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{person.name}</h4>
                            {person.streak > 5 && (
                              <div className="px-2 py-0.5 bg-orange-500/30 border border-orange-400/50 rounded-full">
                                <span className="text-xs font-bold text-orange-200">🔥 Hot Streak!</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-cyan-300">🔥 {person.streak} day streak</span>
                            <span className="text-cyan-400">
                              📍 {locations.find(l => l.id === person.currentLocation)?.name || 'Exploring'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg transition-all group">
                            <span className="text-lg group-hover:scale-125 transition-transform inline-block">👋</span>
                          </button>
                          <button className="p-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg transition-all">
                            <MessageCircle className="w-5 h-5 text-cyan-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                <p className="text-xs text-green-300 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{dayStats.completionRate}%</p>
              </div>
              <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-xs text-purple-300 mb-1">Avg Time</p>
                <p className="text-2xl font-bold text-white">{dayStats.avgTimeToComplete}m</p>
              </div>
              <div className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-xl">
                <p className="text-xs text-orange-300 mb-1">Peak Hour</p>
                <p className="text-lg font-bold text-white">{dayStats.peakTime}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-orange-500/30 bg-orange-900/20 flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={() => {
              const dayLocation = locations.find(l => l.day === selectedDayNumber);
              if (dayLocation) {
                setShowDayExplorer(false);
                openLocationModal(dayLocation);
              }
            }}
            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Start Day {selectedDayNumber} Mission
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Matching Screen */}
{showMatchingScreen && (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      
      {/* Animated spinner */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="w-12 h-12 text-cyan-400 animate-pulse" />
        </div>
      </div>

      {/* Matching status */}
      <h2 className="text-3xl font-bold text-white mb-4">
        Finding Your Mission Buddy...
      </h2>

      {/* Progress bar */}
      <div className="w-full bg-purple-900/50 rounded-full h-2 mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${matchingProgress}%` }}
        ></div>
      </div>

      {/* Matching steps */}
      <div className="space-y-3 text-left bg-purple-900/40 rounded-xl p-4 border border-purple-500/30">
        <div className={`flex items-center gap-3 transition-opacity ${matchingProgress > 20 ? 'opacity-100' : 'opacity-40'}`}>
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-purple-200">Found 12 people at this location</span>
        </div>
        <div className={`flex items-center gap-3 transition-opacity ${matchingProgress > 50 ? 'opacity-100' : 'opacity-40'}`}>
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-purple-200">Matched by anxiety level & experience</span>
        </div>
        <div className={`flex items-center gap-3 transition-opacity ${matchingProgress > 80 ? 'opacity-100' : 'opacity-40'}`}>
          <Check className="w-5 h-5 text-green-400" />
          <span className="text-purple-200">Creating your safe space...</span>
        </div>
      </div>

      {/* Fun facts while waiting */}
      <div className="mt-6 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
        <p className="text-sm text-cyan-200">
          💡 <span className="font-semibold">Did you know?</span> People matched by anxiety level have 94% completion rates
        </p>
      </div>

      {/* Exit option */}
      <button
        onClick={() => {
          setShowMatchingScreen(false);
          setModalOpen(true);
        }}
        className="mt-6 text-sm text-purple-400 hover:text-purple-300 transition-colors"
      >
        Changed your mind? That's okay →
      </button>
    </div>
  </div>
)}

      {/* Experiment Mode - Mini Arena */}
      {experimentMode && selectedLocation && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full h-[600px] relative">
            
            {/* Exit button */}
            <button
              onClick={exitExperiment}
              className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 hover:bg-purple-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
  {/* Live indicator */}
  <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-cyan-800/40 backdrop-blur-sm rounded-full border border-cyan-500/50 animate-pulse">
    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
    <Sparkles className="w-4 h-4 text-cyan-300" />
    <span className="text-sm font-medium text-cyan-200">Live Mission - 3 People</span>
  </div>
  
  {/* Mission */}
  <h2 className="text-3xl font-bold text-white mb-2">{selectedLocation.mission}</h2>
  
  {/* Instructions */}
  <div className="max-w-xl mx-auto space-y-2">
    <p className="text-purple-300">You each do your own mission. No talking required!</p>
    <p className="text-cyan-400 text-sm font-semibold">✨ Bonus: When everyone completes, you all get 2.5x XP</p>
  </div>

  {/* Partner status */}
  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-800/40 rounded-full border border-purple-500/30">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">
        S
      </div>
      <span className="text-white">Sam (5-day streak)</span>
    </div>
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-800/40 rounded-full border border-purple-500/30">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
        A
      </div>
      <span className="text-white">Alex (12-day streak)</span>
    </div>
  </div>
</div>

            {/* Mini Arena - Interactive Space */}
            <div className="relative w-full h-[400px] bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl border-2 border-purple-500/50 overflow-hidden shadow-2xl">
              
              {/* Animated background grid */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-8 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-purple-400 animate-pulse" style={{ animationDelay: `${i * 0.02}s` }}></div>
                  ))}
                </div>
              </div>

              {/* Connection beams between participants */}
              <svg
  className="absolute inset-0 w-full h-full pointer-events-none"
  style={{ zIndex: 1 }}
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
>
  <defs>
    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
      <stop offset="25%" stopColor="#ec4899" stopOpacity="0.7" />
      <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
      <stop offset="75%" stopColor="#ec4899" stopOpacity="0.7" />
      <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  {/* Alternating curved path */}
  <path
    d="M 10 10 
       Q 30 20, 50 10 
       T 90 10 
       M 10 30 
       Q 30 40, 50 30 
       T 90 30 
       M 10 50 
       Q 30 60, 50 50 
       T 90 50 
       M 10 70 
       Q 30 80, 50 70 
       T 90 70 
       M 10 90 
       Q 30 100, 50 90 
       T 90 90"
    fill="none"
    stroke="url(#pathGradient)"
    strokeWidth="0.8"
    strokeLinecap="round"
    strokeDasharray="4 6"
    filter="url(#glow)"
    className="animate-dash"
  />
</svg>


              {/* Participant nodes */}
              {experimentParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{
                    left: `${participant.nodePosition.x}%`,
                    top: `${participant.nodePosition.y}%`,
                    zIndex: 10
                  }}
                >
                  {/* Pulsing ring when active */}
                  {!participant.hasCompleted && (
                    <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                      <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-40"></div>
                    </div>
                  )}

                  {/* Node circle */}
                  <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${participant.color} border-4 flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    participant.hasCompleted 
                      ? 'border-green-400 shadow-green-500/50 scale-110' 
                      : 'border-purple-400 shadow-purple-500/50'
                  }`}>
                    {participant.hasCompleted ? (
                      <Check className="w-10 h-10 text-white animate-bounce" />
                    ) : (
                      <div className="text-2xl font-bold text-white">
                        {participant.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Name label */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-purple-900/95 backdrop-blur-sm px-3 py-1 rounded-lg border border-purple-500/30">
                      <p className="text-sm font-bold text-white">{participant.name}</p>
                    </div>
                  </div>

                  {/* Reaction emoji */}
                  {participant.reactionEmoji && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
                      {participant.reactionEmoji}
                    </div>
                  )}

                  {/* Completion burst effect */}
                  {participant.hasCompleted && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
                            style={{
                              transform: `rotate(${i * 45}deg) translateY(-40px)`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Reward animation overlay */}
              {showRewardAnimation && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in z-20">
                  <div className="text-center">
                    <div className="text-8xl mb-4 animate-bounce">🎉</div>
                    <h3 className="text-4xl font-bold text-white mb-2 animate-pulse">Amazing Work!</h3>
                    <p className="text-2xl text-cyan-400 font-bold">+{selectedLocation.xpReward * 1.5} XP (Bonus!)</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Zap className="w-8 h-8 text-yellow-400 animate-bounce" />
                      <span className="text-xl text-purple-300">Team completion unlocked!</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            {!userCompletedExperiment && !showRewardAnimation && (
  <div className="mt-6 text-center">
    {/* Motivational message based on partner status */}
    {partnerCompletedCount > 0 && (
      <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl animate-pulse">
        <p className="text-green-400 font-semibold text-lg">
          🎯 {partnerCompletedCount === 1 ? 'Sam' : 'Sam & Alex'} just completed! Your turn!
        </p>
        <p className="text-green-300 text-sm mt-1">
          Don't leave them waiting - you've got this!
        </p>
      </div>
    )}

    <button
      onClick={() => {
        completeExperiment();
        setShowRewardAnimation(true);
        setModalOpen(false); // Close current modal
        setCompletionModalOpen(true);
      }}
      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-green-500/50 text-lg flex items-center justify-center gap-2 mx-auto"
    >
      <Check className="w-6 h-6" />
      I Did It! Mark Complete
      {partnerCompletedCount > 0 && <span className="text-xs bg-green-700 px-2 py-1 rounded-full">+{selectedLocation.xpReward * 0.5} bonus!</span>}
    </button>
    
    <p className="text-purple-300 text-sm mt-3">
      {partnerCompletedCount === 0 && 'Be the first to complete and inspire others!'}
      {partnerCompletedCount === 1 && '1 down, 2 to go! Your completion will motivate the team!'}
      {partnerCompletedCount === 2 && 'Everyones done except you! Quick - claim your bonus!'}
    </p>

    {/* Encouragement */}
    <div className="mt-4 text-xs text-purple-400">
      Remember: They can't see if you don't complete. No judgment, only support. 💜
    </div>
  </div>
)}

            {userCompletedExperiment && !showRewardAnimation && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-900/60 backdrop-blur-sm rounded-full border border-green-500/50">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Waiting for others...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion & Reflection Modal */}
     {completionModalOpen && selectedLocation && (
  <div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setCompletionModalOpen(false)}
  >
    <div 
      className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-2xl border border-purple-500/50 max-w-lg w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 text-center border-b border-purple-500/30">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/50">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Mission Complete! 🎉</h2>
        <p className="text-purple-300">You earned {selectedLocation.xpReward} XP</p>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-3">Reflect on your experience</h3>
        <p className="text-purple-300 text-sm mb-4">{selectedLocation.reflectionPrompt}</p>
        
        {/* Memory preview toggle */}
        <div className="mb-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">Share with community?</span>
          </div>
          <p className="text-xs text-cyan-200">
            Your reflection will appear in the {locations.find(l => l.id === selectedLocation.id)?.name} memory wall. 
            Others find these incredibly helpful!
          </p>
        </div>
        
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="How did it go? What did you learn? What surprised you? (This will be shared with the community)"
          className="w-full h-32 px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          maxLength={500}
        />
        <p className="text-xs text-purple-400 mt-2">{reflectionText.length}/500 characters</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setCompletionModalOpen(false);
              setSelectedLocation(null);
            }}
            className="flex-1 py-3 bg-purple-800/50 hover:bg-purple-800/70 text-white font-semibold rounded-xl transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={submitReflection}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
          >
            {reflectionText.trim() ? 'Share & Continue' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}






              {/* Memory Wall Modal */}
{showMemoryWall && selectedMemoryLocation && (
  <div 
    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setShowMemoryWall(false)}
  >
    <div 
      className="bg-gradient-to-br from-purple-900/98 to-indigo-900/98 rounded-2xl border border-purple-500/50 max-w-2xl w-full max-h-[80vh] shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              {(() => {
                const loc = locations.find(l => l.id === selectedMemoryLocation);
                const IconComponent = loc?.icon || BookOpen;
                return <IconComponent className="w-8 h-8 text-white" />;
              })()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {locations.find(l => l.id === selectedMemoryLocation)?.name} Memories
              </h2>
              <p className="text-purple-300 text-sm mt-1">
                {locationMemories[selectedMemoryLocation]?.length || 0} people have shared their experiences
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowMemoryWall(false)} 
            className="p-2 hover:bg-purple-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-purple-300" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setMemoryFilter('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              memoryFilter === 'recent'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-800/30 text-purple-300 hover:bg-purple-800/50'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setMemoryFilter('popular')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              memoryFilter === 'popular'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-800/30 text-purple-300 hover:bg-purple-800/50'
            }`}
          >
            Most Loved
          </button>
        </div>
      </div>

      {/* Memories Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {locationMemories[selectedMemoryLocation]?.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
            <p className="text-purple-300 text-lg mb-2">No memories yet</p>
            <p className="text-purple-400 text-sm">Be the first to share your experience!</p>
          </div>
        )}

        {(() => {
          let memories = locationMemories[selectedMemoryLocation] || [];
          
          // Apply filter
          if (memoryFilter === 'popular') {
            memories = [...memories].sort((a, b) => 
              (b.reactions.heart + b.reactions.wave) - (a.reactions.heart + a.reactions.wave)
            );
          }
          
          return memories.map((memory) => (
            <div 
              key={memory.id}
              className="p-4 bg-purple-800/30 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              {/* Memory Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {memory.userName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{memory.userName}</p>
                    <p className="text-xs text-purple-400">
                      {memory.timestamp?.toDate ? 
                        formatTimeAgo(memory.timestamp.toDate()) : 
                        'Just now'
                      }
                    </p>
                  </div>
                </div>

                {/* Quick reactions visible */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <span>👋</span>
                    <span>{memory.reactions.wave}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <span>❤️</span>
                    <span>{memory.reactions.heart}</span>
                  </div>
                </div>
              </div>

              {/* Memory Text */}
              <p className="text-purple-100 leading-relaxed mb-3">
                {memory.text}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-purple-500/20">
                <button
                  onClick={() => reactToMemory(selectedMemoryLocation, memory.id, 'wave')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-700/30 hover:bg-purple-700/50 rounded-lg text-sm transition-colors group"
                >
                  <span className="group-hover:scale-125 transition-transform">👋</span>
                  <span className="text-purple-200">Wave</span>
                </button>
                <button
                  onClick={() => reactToMemory(selectedMemoryLocation, memory.id, 'heart')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-700/30 hover:bg-purple-700/50 rounded-lg text-sm transition-colors group"
                >
                  <span className="group-hover:scale-125 transition-transform">❤️</span>
                  <span className="text-purple-200">Love</span>
                </button>
                {memory.userId === currentUserId && (
                  <button className="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors">
                    Edit
                  </button>
                )}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Write Memory Section - Fixed at bottom */}
      <div className="p-6 border-t border-purple-500/30 bg-purple-900/50 flex-shrink-0">
        <h3 className="text-sm font-semibold text-purple-200 mb-3">
          Share your experience at this location
        </h3>
        <div className="flex gap-3">
          <textarea
            value={memoryInputText}
            onChange={(e) => setMemoryInputText(e.target.value)}
            placeholder="What was it like? How did you feel? What surprised you?"
            className="flex-1 px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-purple-400">
            {memoryInputText.length}/500 characters
          </p>
          <button
            onClick={async () => {
              if (memoryInputText.trim() && selectedMemoryLocation) {
                await leaveMemory(selectedMemoryLocation, memoryInputText);
                setMemoryInputText('');
              }
            }}
            disabled={!memoryInputText.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg disabled:shadow-none"
          >
            Share Memory
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showDayExplorer && selectedDayNumber && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-purple-900/90 p-6 rounded-2xl border border-purple-500/40 w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto">
      <button
        onClick={() => setShowDayExplorer(false)}
        className="absolute top-4 right-4 text-purple-200 hover:text-white"
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold mb-4 text-purple-200">
        🌅 Day {selectedDayNumber} Explorer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Feature 1: Campfire Wall */}
        <div 
          className="bg-gradient-to-br from-orange-900/50 to-amber-900/50 p-4 rounded-xl border border-amber-500/30 hover:border-amber-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Set the selected location to show the memory wall
            const firstLocation = locations.find(loc => loc.day === selectedDayNumber);
            if (firstLocation) {
              setSelectedMemoryLocation(firstLocation.id);
              setShowMemoryWall(true);
            }
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Campfire Wall</h3>
          </div>
          <p className="text-sm text-amber-100">Share experiences and cheer others on</p>
        </div>

        {/* Feature 2: Group Challenges */}
        <div 
          className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-4 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show group challenges for this day
            alert(`Loading group challenges for Day ${selectedDayNumber}`);
            // TODO: Implement group challenges view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Group Challenges</h3>
          </div>
          <p className="text-sm text-purple-100">Team up for special missions</p>
        </div>

        {/* Feature 3: Live Events */}
        <div 
          className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 p-4 rounded-xl border border-pink-500/30 hover:border-pink-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show live events for this day
            alert(`Loading live events for Day ${selectedDayNumber}`);
            // TODO: Implement live events view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-semibold text-white">Live Events</h3>
          </div>
          <p className="text-sm text-pink-100">Join real-time activities</p>
        </div>

        {/* Feature 4: Daily Leaderboard */}
        <div 
          className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-4 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show leaderboard for this day
            alert(`Loading leaderboard for Day ${selectedDayNumber}`);
            // TODO: Implement leaderboard view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Daily Leaderboard</h3>
          </div>
          <p className="text-sm text-blue-100">See who's leading today</p>
        </div>

        {/* Feature 5: Study Groups */}
        <div 
          className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 p-4 rounded-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show available study groups
            alert(`Loading study groups for Day ${selectedDayNumber}`);
            // TODO: Implement study groups view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">Study Groups</h3>
          </div>
          <p className="text-sm text-emerald-100">Learn together in small groups</p>
        </div>

        {/* Feature 6: Wellness Check-ins */}
        <div 
          className="bg-gradient-to-br from-rose-900/50 to-pink-900/50 p-4 rounded-xl border border-rose-500/30 hover:border-rose-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show wellness check-in form
            alert(`Opening wellness check-in for Day ${selectedDayNumber}`);
            // TODO: Implement wellness check-in form
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="font-semibold text-white">Wellness Check-ins</h3>
          </div>
          <p className="text-sm text-rose-100">Track your progress together</p>
        </div>

        {/* Feature 7: Resource Hub */}
        <div 
          className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 p-4 rounded-xl border border-violet-500/30 hover:border-violet-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show resources for this day
            alert(`Loading resources for Day ${selectedDayNumber}`);
            // TODO: Implement resource hub view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <FolderOpen className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white">Resource Hub</h3>
          </div>
          <p className="text-sm text-violet-100">Shared materials and guides</p>
        </div>

        {/* Feature 8: Virtual Hangout */}
        <div 
          className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 p-4 rounded-xl border border-amber-500/30 hover:border-amber-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Open virtual hangout room
            alert(`Joining virtual hangout for Day ${selectedDayNumber}`);
            // TODO: Implement virtual hangout functionality
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Virtual Hangout</h3>
          </div>
          <p className="text-sm text-amber-100">Relax and chat with others</p>
        </div>

        {/* Feature 9: Achievement Showcase */}
        <div 
          className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 p-4 rounded-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer"
          onClick={() => {
            setShowDayExplorer(false);
            // Show achievements for this day
            alert(`Loading achievements for Day ${selectedDayNumber}`);
            // TODO: Implement achievement showcase view
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white">Achievement Showcase</h3>
          </div>
          <p className="text-sm text-cyan-100">Celebrate community wins</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-800/30 rounded-xl border border-purple-500/30">
        <h3 className="font-semibold text-purple-200 mb-2">👥 {peopleOnSelectedDay.length} People on Day {selectedDayNumber}</h3>
        <div className="flex flex-wrap gap-2">
          {peopleOnSelectedDay.slice(0, 10).map((person, index) => (
            <div key={index} className="px-3 py-1 bg-purple-700/50 rounded-full text-sm text-purple-100">
              {person.name || `User ${index + 1}`}
            </div>
          ))}
          {peopleOnSelectedDay.length > 10 && (
            <div className="px-3 py-1 bg-purple-700/30 rounded-full text-sm text-purple-300">
              +{peopleOnSelectedDay.length - 10} more
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* Mission Parties Panel */}
{/* Mission Parties Panel */}
{showPartiesPanel && (
<div
className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
onClick={() => {
// Only close if we're on the main parties list (not in lobby/stats/photos)
if (!showPartyLobby && !showPartyStats && !showPhotoWall) {
  setShowPartiesPanel(false);
  setSelectedParty(null);
}
}}
>
<div
className="bg-gradient-to-br from-pink-900/98 to-purple-900/98 rounded-2xl border border-pink-500/50 max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col"
onClick={(e) => e.stopPropagation()}
>
{/* CONDITIONAL RENDERING: Party Lobby, Stats, or Main List */}

{/* PARTY LOBBY VIEW */}
{showPartyLobby && selectedParty ? (
<>
{/* Lobby Header */}
<div className="p-6 border-b border-pink-500/30 flex-shrink-0">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-4">
<div className="p-3 rounded-xl bg-pink-500/20 relative">
<Users className="w-8 h-8 text-white" />
<div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-pulse" />
</div>
<div>
<h2 className="text-2xl font-bold text-white">Party Lobby</h2>
<p className="text-pink-300 text-sm mt-1">
{selectedParty.missionName}
</p>
</div>
</div>
<button
onClick={() => {
setShowPartyLobby(false);
// Don't clear selectedParty - go back to main list
}}
className="p-2 hover:bg-pink-800/50 rounded-lg transition-colors"
>
<X className="w-6 h-6 text-pink-300" />
</button>
</div>

{/* Countdown Timer */}
{(() => {
const timeUntil = selectedParty.startTime?.toDate
? Math.floor((selectedParty.startTime.toDate().getTime() - new Date().getTime()) / 1000)
: 0;

return (
<div className="mt-4 p-4 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-xl border border-pink-500/50">
<div className="text-center">
<p className="text-sm text-pink-200 mb-2">Party starts in</p>
<div className="text-5xl font-bold text-white mb-2">
{Math.floor(timeUntil / 60)}:{(timeUntil % 60).toString().padStart(2, '0')}
</div>
<div className="w-full bg-purple-900/50 rounded-full h-2 mt-3">
<div
className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
style={{ width: `${Math.max(0, 100 - (timeUntil / 600) * 100)}%` }}
/>
</div>
</div>
</div>
);
})()}

{/* Live Participant Count */}
<div className="flex gap-3 mt-4">
<div className="flex-1 p-3 bg-cyan-800/30 rounded-lg border border-cyan-500/20">
<p className="text-xs text-cyan-300 mb-1">In Lobby Now</p>
<p className="text-2xl font-bold text-white">{selectedParty.participants.length}</p>
</div>
<div className="flex-1 p-3 bg-purple-800/30 rounded-lg border border-purple-500/20">
<p className="text-xs text-purple-300 mb-1">Messages</p>
<p className="text-2xl font-bold text-white">{partyMessages.length}</p>
</div>
</div>
</div>

{/* Live Chat */}
<div className="flex-1 overflow-y-auto p-6">
<div className="space-y-3">
{partyMessages.length === 0 && (
<div className="text-center py-8">
<MessageCircle className="w-12 h-12 text-pink-400/50 mx-auto mb-3" />
<p className="text-pink-300">Be the first to say something!</p>
</div>
)}

{partyMessages.map((msg) => (
<div
key={msg.id}
className={`p-3 rounded-xl ${
msg.type === 'completion'
? 'bg-green-900/30 border border-green-500/30'
: msg.type === 'system'
? 'bg-cyan-900/30 border border-cyan-500/30'
: 'bg-purple-800/30 border border-purple-500/20'
}`}
>
<div className="flex items-start gap-3">
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
{msg.userName[0]}
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1">
<span className="font-semibold text-white text-sm">{msg.userName}</span>
<span className="text-xs text-purple-400">
{msg.timestamp?.toDate ? formatTimeAgo(msg.timestamp.toDate()) : 'now'}
</span>
</div>
<p className="text-purple-100 text-sm break-words">
{msg.type === 'completion' && '🎉 '}
{msg.text}
</p>
</div>
</div>
</div>
))}

{/* Auto-scroll anchor */}
<div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
</div>
</div>

{/* Chat Input */}
<div className="p-4 border-t border-pink-500/30 bg-pink-900/20 flex-shrink-0">
<div className="flex gap-3">
<input
type="text"
value={partyMessageInput}
onChange={(e) => setPartyMessageInput(e.target.value)}
onKeyPress={(e) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
sendPartyMessage(selectedParty.id, partyMessageInput);
}
}}
placeholder="Say something to the group..."
className="flex-1 px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
maxLength={200}
/>
<button
onClick={() => sendPartyMessage(selectedParty.id, partyMessageInput)}
disabled={!partyMessageInput.trim()}
className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:from-purple-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
>
Send
</button>
</div>

{/* Quick Reactions */}
<div className="flex gap-2 mt-3">
<span className="text-xs text-pink-300 mr-2">Quick react:</span>
{['💪', '🎉', '❤️', '🔥', '👋'].map(emoji => (
<button
key={emoji}
onClick={() => sendPartyReaction(selectedParty.id, emoji)}
className="px-3 py-1 bg-purple-800/30 hover:bg-purple-700/50 rounded-lg text-lg transition-all hover:scale-110"
>
{emoji}
</button>
))}
</div>
</div>
</>
) : showPartyStats && selectedParty && partyStats ? (
/* POST-PARTY STATS VIEW */
<>
<div className="p-6 border-b border-pink-500/30 flex-shrink-0">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-4">
<div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
<Trophy className="w-8 h-8 text-yellow-400" />
</div>
<div>
<h2 className="text-2xl font-bold text-white">Party Complete!</h2>
<p className="text-pink-300 text-sm mt-1">
{selectedParty.missionName}
</p>
</div>
</div>
<button
onClick={() => {
setShowPartyStats(false);
setSelectedParty(null);
}}
className="p-2 hover:bg-pink-800/50 rounded-lg transition-colors"
>
<X className="w-6 h-6 text-pink-300" />
</button>
</div>
</div>

<div className="flex-1 overflow-y-auto p-6">
{/* Epic Header */}
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
<Trophy className="w-10 h-10 text-white" />
</div>
<h3 className="text-3xl font-bold text-white mb-2">
{partyStats.totalParticipants} PEOPLE CONQUERED THEIR FEARS
</h3>
<p className="text-pink-300">Together, we're unstoppable</p>
</div>

{/* Stats Grid */}
<div className="grid grid-cols-2 gap-4 mb-8">
<div className="p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl border border-green-500/30">
<div className="flex items-center gap-3 mb-2">
<Check className="w-6 h-6 text-green-400" />
<span className="text-sm text-green-300">Completion Rate</span>
</div>
<p className="text-4xl font-bold text-white">
{Math.round((partyStats.completions / partyStats.totalParticipants) * 100)}%
</p>
<p className="text-sm text-green-200 mt-1">
{partyStats.completions}/{partyStats.totalParticipants} completed
</p>
</div>

<div className="p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl border border-blue-500/30">
<div className="flex items-center gap-3 mb-2">
<TrendingUp className="w-6 h-6 text-blue-400" />
<span className="text-sm text-blue-300">Anxiety Drop</span>
</div>
<p className="text-4xl font-bold text-white">
{(partyStats.avgAnxietyBefore - partyStats.avgAnxietyAfter).toFixed(1)}
</p>
<p className="text-sm text-blue-200 mt-1">
{partyStats.avgAnxietyBefore.toFixed(1)} → {partyStats.avgAnxietyAfter.toFixed(1)}
</p>
</div>

<div className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/30">
<div className="flex items-center gap-3 mb-2">
<Heart className="w-6 h-6 text-pink-400" />
<span className="text-sm text-pink-300">Total Reactions</span>
</div>
<p className="text-4xl font-bold text-white">
{partyStats.totalReactions}
</p>
<p className="text-sm text-pink-200 mt-1">
Waves of support sent
</p>
</div>

<div className="p-6 bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-xl border border-orange-500/30">
<div className="flex items-center gap-3 mb-2">
<Zap className="w-6 h-6 text-orange-400" />
<span className="text-sm text-orange-300">Courage Points</span>
</div>
<p className="text-4xl font-bold text-white">
{partyStats.totalParticipants * 60}
</p>
<p className="text-sm text-orange-200 mt-1">
Collective achievement
</p>
</div>
</div>

{/* Achievements */}
{partyStats.achievements.length > 0 && (
<div className="mb-8">
<h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
<Award className="w-6 h-6 text-yellow-400" />
Party Achievements
</h4>
<div className="space-y-3">
{partyStats.achievements.map((achievement, index) => (
<div
key={index}
className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl flex items-center gap-3"
>
<div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
<span className="text-xl">✨</span>
</div>
<div>
<p className="font-semibold text-yellow-100">{achievement}</p>
</div>
</div>
))}
</div>
</div>
)}

{/* Top Quote */}
<div className="p-6 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
<p className="text-lg text-cyan-100 italic mb-2">
"Best experience ever!"
</p>
<p className="text-sm text-cyan-300">
- Shared by 41 participants
</p>
</div>

{/* Actions */}
<div className="flex gap-3 mt-8">
<button
onClick={() => setShowPhotoWall(true)}
className="flex-1 py-3 bg-purple-800/50 hover:bg-purple-800/70 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
>
<BookOpen className="w-5 h-5" />
View Photo Wall
</button>
<button
onClick={() => {
setShowPartyStats(false);
setSelectedParty(null);
}}
className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all"
>
Back to Parties
</button>
</div>
</div>
</>
) : showPhotoWall && selectedParty ? (
/* PHOTO WALL VIEW */
<>
<div className="p-6 border-b border-pink-500/30 flex-shrink-0">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-4">
<div className="p-3 rounded-xl bg-pink-500/20">
<BookOpen className="w-8 h-8 text-white" />
</div>
<div>
<h2 className="text-2xl font-bold text-white">Party Photo Wall</h2>
<p className="text-pink-300 text-sm mt-1">
{partyPhotos.length} anonymous photos shared
</p>
</div>
</div>
<button
onClick={() => setShowPhotoWall(false)}
className="p-2 hover:bg-pink-800/50 rounded-lg transition-colors"
>
<X className="w-6 h-6 text-pink-300" />
</button>
</div>

<div className="mt-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
<p className="text-sm text-cyan-200">
🔒 All photos are anonymous and auto-blurred for privacy
</p>
</div>
</div>

<div className="flex-1 overflow-y-auto p-6">
{partyPhotos.length === 0 ? (
<div className="text-center py-16">
<div className="inline-flex p-4 bg-pink-800/20 rounded-full mb-4">
<BookOpen className="w-12 h-12 text-pink-400" />
</div>
<h3 className="text-xl font-bold text-white mb-2">
No photos yet
</h3>
<p className="text-pink-300 mb-6">
Be the first to share proof of your courage!
</p>
</div>
) : (
<div className="grid grid-cols-3 gap-4">
{partyPhotos.map((photo) => (
<div
key={photo.id}
className="aspect-square bg-purple-800/30 rounded-xl border border-purple-500/20 overflow-hidden hover:border-pink-500/50 transition-all cursor-pointer"
>
{/* Placeholder for photo - in real implementation, show actual image */}
<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20">
<Coffee className="w-12 h-12 text-purple-400" />
</div>
</div>
))}
</div>
)}

{/* Upload button */}
<button className="w-full mt-6 py-4 border-2 border-dashed border-pink-500/30 hover:border-pink-500/60 rounded-xl text-pink-300 hover:text-pink-200 transition-colors flex items-center justify-center gap-2">
<BookOpen className="w-5 h-5" />
<span>Upload Your Photo (Coming Soon)</span>
</button>
</div>
</>
) : (
/* MAIN PARTIES LIST VIEW */
<>
<div className="p-6 border-b border-pink-500/30 flex-shrink-0">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-4">
<div className="p-3 rounded-xl bg-pink-500/20 relative">
<Users className="w-8 h-8 text-white" />
{upcomingParties.length > 0 && (
<div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
<span className="text-xs font-bold text-white">
{upcomingParties.length}
</span>
</div>
)}
</div>
<div>
<h2 className="text-2xl font-bold text-white">Mission Parties</h2>
<p className="text-pink-300 text-sm mt-1">
Join group events • Complete missions together
</p>
</div>
</div>
<button
onClick={() => setShowPartiesPanel(false)}
className="p-2 hover:bg-pink-800/50 rounded-lg transition-colors"
>
<X className="w-6 h-6 text-pink-300" />
</button>
</div>

{/* Stats Bar */}
<div className="flex gap-4 mt-4">
<div className="flex-1 p-3 bg-pink-800/30 rounded-lg border border-pink-500/20">
<p className="text-xs text-pink-300 mb-1">Active Events</p>
<p className="text-xl font-bold text-white">{upcomingParties.length}</p>
</div>
<div className="flex-1 p-3 bg-purple-800/30 rounded-lg border border-purple-500/20">
<p className="text-xs text-purple-300 mb-1">Total Participants</p>
<p className="text-xl font-bold text-white">
{upcomingParties.reduce((sum, p) => sum + p.participants.length, 0)}
</p>
</div>
<div className="flex-1 p-3 bg-cyan-800/30 rounded-lg border border-cyan-500/20">
<p className="text-xs text-cyan-300 mb-1">You Joined</p>
<p className="text-xl font-bold text-white">
{upcomingParties.filter(p => p.participants.includes(currentUserId)).length}
</p>
</div>
</div>
</div>


{/* Parties List - Scrollable */}
<div className="flex-1 overflow-y-auto p-6">
{upcomingParties.length === 0 && (
<div className="text-center py-16">
<div className="inline-flex p-4 bg-pink-800/20 rounded-full mb-4">
<Users className="w-12 h-12 text-pink-400" />
</div>
<h3 className="text-xl font-bold text-white mb-2">
No Upcoming Parties
</h3>
<p className="text-pink-300 mb-6">
Mission parties will appear here. Check back soon!
</p>
<div className="max-w-md mx-auto p-4 bg-pink-900/20 rounded-lg border border-pink-500/20">
<p className="text-sm text-pink-200">
💡 <strong>What are Mission Parties?</strong><br/>
Scheduled events where everyone does the same mission at the exact same time.
You'll see real-time updates and earn bonus XP!
</p>
</div>
</div>
)}

<div className="space-y-4">
{upcomingParties.map((party) => {
const isJoined = party.participants.includes(currentUserId);
const location = locations.find(l => l.id === party.locationId);
const timeUntil = party.startTime?.toDate
? Math.floor((party.startTime.toDate().getTime() - new Date().getTime()) / 1000)
: 0;

const isLobbyOpen = true; // Lobby always open!
const isActive = party.status === 'active';
const isCompleted = party.status === 'completed';

return (
<div
key={party.id}
className={`p-5 rounded-xl border-2 transition-all duration-300 ${
isJoined
? 'bg-pink-800/40 border-pink-500/60 shadow-lg shadow-pink-500/20'
: 'bg-purple-900/30 border-purple-500/30 hover:border-purple-500/50'
}`}
>
{/* Party Header */}
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-3">
{location?.icon && React.createElement(location.icon, {
className: "w-10 h-10 text-white"
})}
<div>
<h3 className="text-lg font-bold text-white">
{party.missionName}
</h3>
<p className="text-sm text-pink-300">
{location?.name || 'Unknown Location'}
</p>
</div>
</div>

<div className="flex flex-col gap-2">
{isJoined && (
<div className="px-3 py-1 bg-pink-500/30 border border-pink-400/50 rounded-full">
<span className="text-xs font-bold text-pink-100">✓ Joined</span>
</div>
)}

{isActive && (
<div className="px-3 py-1 bg-orange-500/30 border border-orange-400/50 rounded-full animate-pulse">
<span className="text-xs font-bold text-orange-100">⚡ LIVE NOW</span>
</div>
)}
{isCompleted && (
<div className="px-3 py-1 bg-yellow-500/30 border border-yellow-400/50 rounded-full">
<span className="text-xs font-bold text-yellow-100">🏆 Completed</span>
</div>
)}
</div>
</div>

{/* Time & Participants */}
<div className="grid grid-cols-2 gap-3 mb-4">
<div className="p-3 bg-purple-800/30 rounded-lg">
<p className="text-xs text-purple-300 mb-1">
{isCompleted ? 'Ended' : isActive ? 'Started' : 'Starts in'}
</p>
<p className="text-lg font-bold text-white">
{isCompleted || isActive ? '—' : formatCountdown(timeUntil)}
</p>
<p className="text-xs text-purple-400 mt-1">
{party.startTime?.toDate?.() ?
party.startTime.toDate().toLocaleTimeString([], {
hour: '2-digit',
minute: '2-digit'
}) :
'TBD'
}
</p>
</div>

<div className="p-3 bg-cyan-800/30 rounded-lg">
<p className="text-xs text-cyan-300 mb-1">Participants</p>
<p className="text-lg font-bold text-white">
{party.participants.length}
</p>
<div className="flex items-center gap-1 mt-1">
{party.participants.slice(0, 5).map((_, i) => (
<div
key={i}
className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border border-white/30"
style={{ marginLeft: i > 0 ? '-8px' : '0' }}
/>
))}
{party.participants.length > 5 && (
<span className="text-xs text-cyan-400 ml-1">
+{party.participants.length - 5}
</span>
)}
</div>
</div>
</div>

{/* Live Activity Indicator (for active parties) */}
{isActive && Object.keys(liveParticipantLocations).length > 0 && (
<div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
<div className="flex items-center gap-2 mb-2">
<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
<span className="text-sm font-semibold text-green-300">
Live Activity
</span>
</div>
<div className="space-y-1">
{Object.values(liveParticipantLocations).slice(0, 3).map((loc: any, i) => (
<p key={i} className="text-xs text-green-200">
• {loc.userName} {loc.status === 'completed' ? '✅ completed!' : loc.status === 'active' ? '⚡ in progress' : '📍 arrived'}
</p>
))}
{Object.keys(liveParticipantLocations).length > 3 && (
<p className="text-xs text-green-400">
+{Object.keys(liveParticipantLocations).length - 3} more active...
</p>
)}
</div>
</div>
)}

{/* Bonus Info */}
<div className="p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg mb-4">
<div className="flex items-center gap-2">
<Zap className="w-4 h-4 text-yellow-400" />
<span className="text-sm font-semibold text-yellow-200">
5x XP Multiplier Active!
</span>
</div>
</div>

{/* Action Buttons */}
<div className="flex gap-3">
{isCompleted ? (
<button
onClick={() => {
setSelectedParty(party);
setShowPartyStats(true);
}}
className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<Trophy className="w-5 h-5" />
View Results
</button>
) : isActive && isJoined ? (
<>
<button
onClick={() => {
setSelectedParty(party);
setShowPartyLobby(true);
}}
className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<MessageCircle className="w-5 h-5" />
Lobby & Chat
</button>
<button
onClick={() => {
setSelectedParty(party);
// In real implementation, open live action view
}}
className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg animate-pulse flex items-center justify-center gap-2"
>
<Zap className="w-5 h-5" />
Live Action
</button>
</>
) : isJoined ? (

<>
<button
onClick={() => {
setSelectedParty(party);
setShowPartyLobby(true);
}}
className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<MessageCircle className="w-5 h-5" />
Open Lobby
</button>
<button
onClick={() => leaveMissionParty(party.id)}
className="flex-1 py-3 bg-purple-800/50 hover:bg-purple-800/70 text-white font-semibold rounded-xl transition-colors"
>
Leave
</button>
</>
) : (
<button
onClick={() => joinMissionParty(party.id)}
className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/50"
>
Join Party
</button>
)}
</div>
</div>
);
})}
</div>
</div>

{/* Create Party Section */}
<div className="p-4 border-t border-pink-500/30 bg-pink-900/20 flex-shrink-0">
{!showCreateParty ? (
<button
onClick={() => setShowCreateParty(true)}
className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<Sparkles className="w-5 h-5" />
<span>Create Your Own Party</span>
</button>
) : (
<div className="space-y-4">
<div className="flex items-center justify-between">
<h3 className="text-lg font-bold text-white">Create Mission Party</h3>
<button
onClick={() => setShowCreateParty(false)}
className="text-pink-300 hover:text-white transition-colors"
>
<X className="w-5 h-5" />
</button>
</div>

{/* Location Selection */}
<div>
<label className="block text-sm font-semibold text-pink-200 mb-2">
Choose Location
</label>
<select
value={newParty.locationId}
onChange={(e) => {
const location = locations.find(l => l.id === e.target.value);
setNewParty({
...newParty,
locationId: e.target.value,
missionName: location?.mission || ''
});
}}
className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
>
<option value="">Select a location...</option>
{locations
.filter(loc => loc.status !== 'locked')
.map(loc => (
<option key={loc.id} value={loc.id}>
{loc.name} - {loc.mission}
</option>
))
}
</select>
</div>

{/* Mission Name (Optional Override) */}
{newParty.locationId && (
<div>
<label className="block text-sm font-semibold text-pink-200 mb-2">
Party Name (Optional)
</label>
<input
type="text"
value={newParty.missionName}
onChange={(e) => setNewParty({ ...newParty, missionName: e.target.value })}
placeholder="Leave blank to use default mission name"
className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
/>
</div>
)}

{/* Date & Time Selection */}
<div className="grid grid-cols-2 gap-3">
<div>
<label className="block text-sm font-semibold text-pink-200 mb-2">
Date
</label>
<input
type="date"
value={newParty.startDate}
onChange={(e) => setNewParty({ ...newParty, startDate: e.target.value })}
min={new Date().toISOString().split('T')[0]}
className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
/>
</div>
<div>
<label className="block text-sm font-semibold text-pink-200 mb-2">
Time
</label>
<input
type="time"
value={newParty.startTime}
onChange={(e) => setNewParty({ ...newParty, startTime: e.target.value })}
className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
/>
</div>
</div>

{/* Preview */}
{newParty.locationId && newParty.startDate && newParty.startTime && (
<div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
<p className="text-xs text-cyan-300 mb-2">Preview:</p>
<p className="text-white font-semibold">
{newParty.missionName || locations.find(l => l.id === newParty.locationId)?.mission}
</p>
<p className="text-sm text-cyan-200 mt-1">
📍 {locations.find(l => l.id === newParty.locationId)?.name}
</p>
<p className="text-sm text-cyan-200">
🕐 {new Date(`${newParty.startDate}T${newParty.startTime}`).toLocaleString()}
</p>
</div>
)}

{/* Action Buttons */}
{/* Action Buttons */}
<div className="flex gap-3">
{isCompleted ? (
<button
onClick={() => {
setSelectedParty(party);
setShowPartyStats(true);
}}
className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<Trophy className="w-5 h-5" />
View Results
</button>
) : isActive && isJoined ? (
<>
<button
onClick={() => {
setSelectedParty(party);
setShowPartyLobby(true);
}}
className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<MessageCircle className="w-5 h-5" />
Lobby & Chat
</button>
<button
onClick={() => {
setSelectedParty(party);
// In real implementation, open live action view
}}
className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg animate-pulse flex items-center justify-center gap-2"
>
<Zap className="w-5 h-5" />
Live Action
</button>
</>
) : isJoined ? (

<>
<button
onClick={() => {
setSelectedParty(party);
setShowPartyLobby(true);
}}
className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
>
<MessageCircle className="w-5 h-5" />
Open Lobby
</button>
<button
onClick={() => leaveMissionParty(party.id)}
className="flex-1 py-3 bg-purple-800/50 hover:bg-purple-800/70 text-white font-semibold rounded-xl transition-colors"
>
Leave
</button>
</>
) : (
<button
onClick={() => joinMissionParty(party.id)}
className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/50"
>
Join Party
</button>
)}
</div>
</div>
)}
</div>
</>
)}
</div>
</div>
)}

{/* Day Explorer Modal */}
{/* Day Explorer Modal - ENHANCED */}
{showDayExplorer && selectedDayNumber && (
  <div 
    className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={() => setShowDayExplorer(false)}
  >
    <div 
      className="bg-gradient-to-br from-orange-900/98 to-red-900/98 rounded-2xl border border-orange-500/50 max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-6 border-b border-orange-500/30 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-xl bg-orange-500/20">
                <Trophy className="w-8 h-8 text-orange-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{selectedDayNumber}</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">🏕️ Day {selectedDayNumber} Base Camp</h2>
              <p className="text-orange-300 text-sm mt-1">
                {peopleOnSelectedDay.length} adventurers warming up together
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowDayExplorer(false)} 
            className="p-2 hover:bg-orange-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-orange-300" />
          </button>
        </div>

        {/* Tab Navigation */}
        {/* Tab Navigation */}
<div className="flex gap-2">
  <button
    onClick={() => setDayExplorerTab('community')}
    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all relative ${
      dayExplorerTab === 'community'
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-orange-800/30 text-orange-300 hover:bg-orange-800/50'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      🔥 Community (Live)
      {/* NEW: Live indicator dot */}
      {dayExplorerTab === 'community' && (
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse absolute top-2 right-2" />
      )}
    </div>
    {/* NEW: Feature count badge */}
    <div className="text-xs mt-1 opacity-75">
      9 active features
    </div>
  </button>
  <button
    onClick={() => setDayExplorerTab('mission')}
    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
      dayExplorerTab === 'mission'
        ? 'bg-orange-600 text-white shadow-lg'
        : 'bg-orange-800/30 text-orange-300 hover:bg-orange-800/50'
    }`}
  >
    📍 Mission Info
  </button>
</div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {dayExplorerTab === 'community' ? (
          /* COMMUNITY TAB */
          <div className="p-6 space-y-6">

    
    {/* NEW: Community Features Overview Banner */}
    <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 rounded-2xl border border-cyan-500/50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
        <h3 className="text-xl font-bold text-white">Day {selectedDayNumber} Community Hub - All Features Active!</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-orange-800/30 rounded-lg border border-orange-500/30 text-center">
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-xs text-orange-300 font-semibold">Campfire Wall</p>
          <p className="text-lg font-bold text-white">{campfireMessages.length}</p>
        </div>
        <div className="p-3 bg-purple-800/30 rounded-lg border border-purple-500/30 text-center">
          <div className="text-2xl mb-1">📊</div>
          <p className="text-xs text-purple-300 font-semibold">Live Stats</p>
          <p className="text-lg font-bold text-white">{dayStats.hypeLevel}%</p>
        </div>
        <div className="p-3 bg-cyan-800/30 rounded-lg border border-cyan-500/30 text-center">
          <div className="text-2xl mb-1">📍</div>
          <p className="text-xs text-cyan-300 font-semibold">At Location</p>
          <p className="text-lg font-bold text-white">{liveAtLocation.arrived.length}</p>
        </div>
        <div className="p-3 bg-green-800/30 rounded-lg border border-green-500/30 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <p className="text-xs text-green-300 font-semibold">Buddies</p>
          <p className="text-lg font-bold text-white">{buddyMatches.length}</p>
        </div>
      </div>
      <p className="text-center text-sm text-cyan-200 mt-4">
        ⚡ All features are live and updating in real-time
      </p>
    </div>

    {/* ⬇️⬇️⬇️ ADD THE QUICK NAVIGATION HERE ⬇️⬇️⬇️ */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button 
        onClick={() => document.getElementById('campfire')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-orange-700/30 hover:bg-orange-700/50 rounded-lg text-sm text-orange-200 whitespace-nowrap transition-all"
      >
        🔥 Campfire
      </button>
      <button 
        onClick={() => document.getElementById('hype-meter')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-purple-700/30 hover:bg-purple-700/50 rounded-lg text-sm text-purple-200 whitespace-nowrap transition-all"
      >
        📊 Hype Meter
      </button>
      <button 
        onClick={() => document.getElementById('live-location')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg text-sm text-cyan-200 whitespace-nowrap transition-all"
      >
        📍 Live Map
      </button>
      <button 
        onClick={() => document.getElementById('champions')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-yellow-700/30 hover:bg-yellow-700/50 rounded-lg text-sm text-yellow-200 whitespace-nowrap transition-all"
      >
        🏆 Champions
      </button>
      <button 
        onClick={() => document.getElementById('encouragement')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-pink-700/30 hover:bg-pink-700/50 rounded-lg text-sm text-pink-200 whitespace-nowrap transition-all"
      >
        💌 Messages
      </button>
      <button 
        onClick={() => document.getElementById('buddy-finder')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-4 py-2 bg-green-700/30 hover:bg-green-700/50 rounded-lg text-sm text-green-200 whitespace-nowrap transition-all"
      >
        🎯 Buddy Finder
      </button>
    </div>
    {/* ⬆️⬆️⬆️ END OF QUICK NAVIGATION ⬆️⬆️⬆️ */}

            
            {/* THE CAMPFIRE WALL */}
            <div className="bg-gradient-to-br from-orange-800/40 to-red-800/40 rounded-2xl border border-orange-500/50 p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3 animate-pulse">🔥</div>
                <h3 className="text-2xl font-bold text-white mb-2">The Campfire Wall</h3>
                <p className="text-orange-200 text-sm">What people are thinking RIGHT NOW</p>
              </div>

              {/* Live Messages Stream */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {campfireMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-orange-300">Be the first to share your thoughts...</p>
                  </div>
                ) : (
                  campfireMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`p-4 rounded-xl transition-all ${
                        msg.isVulnerable 
                          ? 'bg-pink-900/40 border-2 border-pink-500/50' 
                          : 'bg-orange-900/30 border border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {msg.userName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{msg.userName}</span>
                            <span className="text-xs text-orange-400">
                              {msg.timestamp?.toDate ? formatTimeAgo(msg.timestamp.toDate()) : 'now'}
                            </span>
                            {msg.isVulnerable && (
                              <span className="text-xs px-2 py-0.5 bg-pink-500/30 border border-pink-400/50 rounded-full text-pink-200">
                                vulnerable
                              </span>
                            )}
                          </div>
                          <p className="text-orange-100 mb-2">{msg.text}</p>
                          
                          {/* Reactions */}
                          <div className="flex items-center gap-3">
                            {Object.entries(msg.reactions).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => reactToCampfireMessage(msg.id, emoji)}
                                className="flex items-center gap-1 px-2 py-1 bg-orange-800/30 hover:bg-orange-800/50 rounded-lg transition-all hover:scale-110"
                              >
                                <span>{emoji}</span>
                                <span className="text-xs text-orange-200">{count}</span>
                              </button>
                            ))}
                            {Object.keys(msg.reactions).length === 0 && (
                              <div className="flex gap-1">
                                {['💪', '❤️', '👋'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => reactToCampfireMessage(msg.id, emoji)}
                                    className="px-2 py-1 bg-orange-800/20 hover:bg-orange-800/40 rounded-lg text-lg transition-all hover:scale-125"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Post Input */}
              <div className="border-t border-orange-500/30 pt-4">
                <textarea
                  value={campfireInput}
                  onChange={(e) => setCampfireInput(e.target.value)}
                  placeholder="Share what you're feeling... (be real, everyone here gets it)"
                  className="w-full px-4 py-3 bg-orange-900/30 border border-orange-500/30 rounded-xl text-white placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-orange-400">{campfireInput.length}/300</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => postToCampfire(campfireInput, true)}
                      disabled={!campfireInput.trim()}
                      className="px-4 py-2 bg-pink-600/50 hover:bg-pink-600/70 disabled:bg-orange-800/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      😰 Vulnerable Post
                    </button>
                    <button
                      onClick={() => postToCampfire(campfireInput, false)}
                      disabled={!campfireInput.trim()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800/30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* THE HYPE METER */}
            <div className="bg-gradient-to-br from-purple-800/40 to-pink-800/40 rounded-2xl border border-purple-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                🎯 Day {selectedDayNumber} Energy Today
              </h3>

              {/* Hype Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">HYPE LEVEL</span>
                  <span className="text-2xl font-bold text-white">{dayStats.hypeLevel}%</span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${dayStats.hypeLevel}%` }}
                  />
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Completions Today</p>
                  <p className="text-2xl font-bold text-white">{dayStats.completionsToday}</p>
                  <p className="text-xs text-green-400 mt-1">↑ {dayStats.trendPercentage}% from yesterday</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{dayStats.completionRate}%</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Avg Time</p>
                  <p className="text-lg font-bold text-white">{dayStats.avgTimeToComplete} mins</p>
                </div>
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <p className="text-xs text-purple-300 mb-1">Peak Time</p>
                  <p className="text-lg font-bold text-white">{dayStats.peakTime}</p>
                </div>
              </div>

              {/* Momentum Alert */}
              <div className="p-4 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-sm font-bold text-orange-200">MOMENTUM ALERT</p>
                    <p className="text-xs text-orange-300">Day {selectedDayNumber} is ON FIRE right now! {dayStats.completionsToday} people completed today!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE "WHO'S HERE" MAP */}
            <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-cyan-400" />
                📍 RIGHT NOW AT THE LOCATION
              </h3>

              {/* Status Groups */}
              <div className="space-y-4">
                {/* Arrived */}
                <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-green-300">🟢 ARRIVED ({liveAtLocation.arrived.length} people)</span>
                  </div>
                  {liveAtLocation.arrived.length === 0 ? (
                    <p className="text-sm text-green-400 italic">No one here yet - be the first!</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {liveAtLocation.arrived.map(person => (
                        <div key={person.id} className="px-3 py-2 bg-green-800/30 rounded-lg border border-green-500/30 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-xs font-bold text-white`}>
                            {person.name[0]}
                          </div>
                          <span className="text-sm text-white">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* On The Way */}
                <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="font-bold text-yellow-300">🟡 ON THE WAY ({liveAtLocation.onTheWay.length} people)</span>
                  </div>
                  {liveAtLocation.onTheWay.length > 0 && (
                    <div className="space-y-2">
                      {liveAtLocation.onTheWay.slice(0, 5).map(person => (
                        <p key={person.id} className="text-sm text-yellow-200">
                          • {person.name} - "heading there now..."
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preparing */}
                <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="font-bold text-blue-300">🔵 PREPARING ({liveAtLocation.preparing.length} people)</span>
                  </div>
                  {liveAtLocation.preparing.length > 0 && (
                    <p className="text-sm text-blue-200">
                      {liveAtLocation.preparing.map(p => p.name).slice(0, 3).join(', ')}
                      {liveAtLocation.preparing.length > 3 && ` +${liveAtLocation.preparing.length - 3} more`} getting ready...
                    </p>
                  )}
                </div>

                {/* Just Completed */}
                <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-purple-300">⚡ JUST COMPLETED ({liveAtLocation.justCompleted.length} in last hour)</span>
                  </div>
                  {liveAtLocation.justCompleted.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {liveAtLocation.justCompleted.slice(0, 8).map(person => (
                        <div key={person.id} className="px-2 py-1 bg-purple-800/30 rounded-lg text-xs text-purple-200">
                          {person.name} ✅
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TODAY'S CHAMPIONS */}
            {(todaysChampions.firstTimer || todaysChampions.bestTip || todaysChampions.biggestBreakthrough) && (
              <div className="bg-gradient-to-br from-yellow-800/40 to-orange-800/40 rounded-2xl border border-yellow-500/50 p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  🏆 TODAY'S CHAMPIONS
                </h3>

                <div className="space-y-4">
                  {todaysChampions.firstTimer && (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">⭐</span>
                        <span className="font-bold text-yellow-300">FIRST TIMER OF THE DAY</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.firstTimer.name} completed at {todaysChampions.firstTimer.time}</p>
                      <p className="text-yellow-200 italic">"{todaysChampions.firstTimer.message}"</p>
                      <p className="text-xs text-yellow-400 mt-2">👋 {todaysChampions.firstTimer.reactions} reactions</p>
                    </div>
                  )}

                  {todaysChampions.bestTip && (
                    <div className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="font-bold text-cyan-300">MOST HELPFUL TIP</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.bestTip.name}:</p>
                      <p className="text-cyan-200">"{todaysChampions.bestTip.tip}"</p>
                      <p className="text-xs text-cyan-400 mt-2">⭐ {todaysChampions.bestTip.helpful} people: "This helped!"</p>
                    </div>
                  )}

                  {todaysChampions.biggestBreakthrough && (
                    <div className="p-4 bg-pink-900/30 border border-pink-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💪</span>
                        <span className="font-bold text-pink-300">BIGGEST BREAKTHROUGH</span>
                      </div>
                      <p className="text-white font-semibold mb-1">{todaysChampions.biggestBreakthrough.name}:</p>
                      <p className="text-pink-200">"{todaysChampions.biggestBreakthrough.story}"</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-pink-400">
                        <span>❤️ {todaysChampions.biggestBreakthrough.reactions} reactions</span>
                        <span>💬 {todaysChampions.biggestBreakthrough.replies} replies</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* THE ENCOURAGEMENT WALL */}
            {encouragementNotes.length > 0 && (
              <div className="bg-gradient-to-br from-pink-800/40 to-purple-800/40 rounded-2xl border border-pink-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  💌 MESSAGES FROM PEOPLE WHO MADE IT
                </h3>

                <div className="space-y-4">
                  {encouragementNotes.map(note => (
                    <div key={note.id} className="p-5 bg-pink-900/30 border border-pink-500/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-pink-200">From: {note.from}</span>
                        <span className="text-xs text-pink-400">(completed {note.completedAgo})</span>
                      </div>
                      <p className="text-pink-100 leading-relaxed mb-3 whitespace-pre-line">
                        {note.message}
                      </p>
                      <p className="text-xs text-pink-400">👋 {note.reactions} people waved back</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowCampfireWall(true)}
                  className="w-full mt-4 py-3 bg-pink-600/50 hover:bg-pink-600/70 rounded-xl text-white font-semibold transition-all"
                >
                  Leave Your Own Message
                </button>
              </div>
            )}

            {/* THE ANXIETY METER */}
            <div className="bg-gradient-to-br from-indigo-800/40 to-purple-800/40 rounded-2xl border border-indigo-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                📊 DAY {selectedDayNumber} EMOTIONAL JOURNEY
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">BEFORE MISSION:</span>
                    <span className="text-xl font-bold text-white">{anxietyJourney.beforeAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😰','😰','😰','😰','😰','😰','😰','😐','😐','😊'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">DURING MISSION:</span>
                    <span className="text-xl font-bold text-white">{anxietyJourney.duringAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😰','😰','😰','😐','😐','😊','😊','😄','😄','😄'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-indigo-300">AFTER MISSION:</span>
                    <span className="text-xl font-bold text-green-400">{anxietyJourney.afterAvg}/10</span>
                  </div>
                  <div className="flex gap-1">
                    {['😊','😊','😊','😊','😄','😄','😄','😄','😁','😁'].map((emoji, i) => (
                      <span key={i} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl space-y-2">
                <p className="text-sm text-indigo-200">
                  <span className="font-semibold">💡 INSIGHT:</span> {anxietyJourney.totalResponses} responses analyzed
                </p>
                <p className="text-sm text-indigo-200">
                  94% of Day {selectedDayNumber}'ers report feeling BETTER after completing than they expected. <span className="font-semibold text-green-400">You will too.</span>
                </p>
                <p className="text-sm text-indigo-200">
                  📈 Average anxiety drops by <span className="font-bold text-green-400">{anxietyJourney.dropRate} points</span>. That's normal!
                </p>
              </div>
            </div>

            {/* NEXT GROUP DEPARTURE */}
            {groupDepartures.length > 0 && (
              <div className="bg-gradient-to-br from-green-800/40 to-emerald-800/40 rounded-2xl border border-green-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-400" />
                  ⏰ NEXT GROUP DEPARTURE
                </h3>

                {groupDepartures.map(departure => (
                  <div key={departure.id} className="space-y-4">
                    {/* Countdown */}
                    <div className="p-6 bg-green-900/40 border-2 border-green-500/50 rounded-xl text-center">
                      <p className="text-green-300 text-sm mb-2">Leaving together in:</p>
                      <p className="text-5xl font-bold text-white mb-2">
                        {Math.floor((departure.departureTime.getTime() - new Date().getTime()) / 60000)}:{
                          String(Math.floor(((departure.departureTime.getTime() - new Date().getTime()) % 60000) / 1000)).padStart(2, '0')
                        }
                      </p>
                      <p className="text-green-400 text-sm">
                        🚀 {departure.participants.length} PEOPLE heading to {
                          locations.find(l => l.id === departure.locationId)?.name || 'location'
                        }
                      </p>
                    </div>

                    {/* Participants */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-green-300 mr-2">Who's joining:</span>
                      {departure.participants.slice(0, 10).map((_, i) => (
                        <div 
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white/30"
                          style={{ marginLeft: i > 0 ? '-12px' : '0', zIndex: 10 - i }}
                        />
                      ))}
                      {departure.participants.length > 10 && (
                        <span className="text-sm font-bold text-green-400 ml-2">
                          +{departure.participants.length - 10} more
                        </span>
                      )}
                    </div>

                    {/* Group Chat Preview */}
                    {departure.messages.length > 0 && (
                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                        <p className="text-xs text-green-400 mb-2">💬 Group Chat:</p>
                        <div className="space-y-1">
                          {departure.messages.map((msg, i) => (
                            <p key={i} className="text-sm text-green-200">
                              <span className="font-semibold">{msg.userName}:</span> {msg.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Join Button */}
                    <button
                      onClick={() => joinGroupDeparture(departure.id)}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      Count Me In!
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* "LIVE FROM THE LOCATION" */}
            {liveUpdates.length > 0 && (
              <div className="bg-gradient-to-br from-red-800/40 to-orange-800/40 rounded-2xl border border-red-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  📡 LIVE UPDATES - HAPPENING NOW
                </h3>

                <div className="space-y-4">
                  {liveUpdates.map(update => (
                    <div key={update.id} className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {update.userName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{update.userName}:</span>
                            <span className="text-xs text-red-400">{formatTimeAgo(update.timestamp)}</span>
                          </div>
                          <p className="text-red-100 text-lg mb-2">{update.action}</p>
                          
                          {/* Reactions */}
                          {update.reactions > 0 && (
                            <p className="text-sm text-red-300 mb-2">💪 {update.reactions} reactions</p>
                          )}

                          {/* Replies */}
                          {update.replies.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-red-500/30 space-y-2">
                              {update.replies.map((reply, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-semibold text-red-200">{reply.userName}:</span>
                                  <span className="text-red-300 ml-1">{reply.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUDDY BEACON */}
            {buddyMatches.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  🎯 FIND YOUR MISSION BUDDY
                </h3>

                {/* Filters */}
                <div className="mb-6 p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-300 mb-3">Filter by:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">😰 Anxiety Level: {buddyFilters.anxietyLevel}/10</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={buddyFilters.anxietyLevel}
                        onChange={(e) => setBuddyFilters({...buddyFilters, anxietyLevel: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">⏰ Preferred Time</label>
                      <select
                        value={buddyFilters.preferredTime}
                        onChange={(e) => setBuddyFilters({...buddyFilters, preferredTime: e.target.value})}
                        className="w-full px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-white text-sm"
                      >
                        <option value="morning">Morning (6-12pm)</option>
                        <option value="afternoon">Afternoon (12-6pm)</option>
                        <option value="evening">Evening (6-9pm)</option>
                        <option value="night">Night (9pm+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-cyan-400 block mb-1">🎭 Experience</label>
                      <select
                        value={buddyFilters.experience}
                        onChange={(e) => setBuddyFilters({...buddyFilters, experience: e.target.value})}
                        className="w-full px-3 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-white text-sm"
                      >
                        <option value="first-timer">First timer</option>
                        <option value="did-once">Did it once before</option>
                        <option value="experienced">Experienced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Perfect Matches */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-cyan-300 mb-3">PERFECT MATCHES:</p>
                  {buddyMatches.map(match => (
                    <div key={match.id} className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl hover:border-cyan-500/60 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {match.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{match.name}</span>
                              <div className="px-2 py-0.5 bg-green-500/30 border border-green-400/50 rounded-full">
                                <span className="text-xs font-bold text-green-200">{match.matchPercentage}% match</span>
                              </div>
                            </div>
                            <p className="text-xs text-cyan-400">Last seen: {match.lastSeen}</p>
                          </div>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Anxiety</p>
                          <p className="text-white font-semibold">{match.anxietyLevel}/10</p>
                        </div>
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Time</p>
                          <p className="text-white font-semibold text-xs">{match.preferredTime}</p>
                        </div>
                        <div className="p-2 bg-cyan-800/30 rounded">
                          <p className="text-cyan-400">Experience</p>
                          <p className="text-white font-semibold text-xs">{match.experience}</p>
                        </div>
                      </div>

                      {/* Their Message */}
                      <div className="p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-lg mb-3">
                        <p className="text-sm text-cyan-100 italic">"{match.message}"</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Message {match.name}
                        </button>
                        <button className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                          <Users className="w-4 h-4" />
                          Buddy Up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowBuddyFinder(true)}
                  className="w-full mt-4 py-3 bg-cyan-600/50 hover:bg-cyan-600/70 rounded-xl text-white font-semibold transition-all"
                >
                  See All Matches
                </button>
              </div>
            )}

          </div>
        ) : (
          /* MISSION TAB */
          <div className="p-6 space-y-6">
            {/* Mission Details */}
            <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 rounded-2xl border border-purple-500/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                {(() => {
                  const dayLocation = locations.find(l => l.day === selectedDayNumber);
                  const IconComponent = dayLocation?.icon || MapPin;
                  return (
                    <>
                      <div className="p-4 rounded-xl bg-purple-500/20">
                        <IconComponent className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{dayLocation?.name}</h3>
                        <p className="text-purple-300">{dayLocation?.mission}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {(() => {
                const dayLocation = locations.find(l => l.day === selectedDayNumber);
                return (
                  <>
                    <div className="p-4 bg-purple-900/30 rounded-xl mb-4">
                      <p className="text-purple-200 leading-relaxed">{dayLocation?.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-yellow-900/30 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-yellow-300">Reward</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dayLocation?.xpReward} XP</p>
                      </div>
                      <div className="p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          <span className="text-sm text-cyan-300">Active Now</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dayLocation?.activeUsers}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* People on This Day */}
            <div className="bg-gradient-to-br from-cyan-800/40 to-blue-800/40 rounded-2xl border border-cyan-500/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-cyan-400" />
                👥 People on Day {selectedDayNumber}
              </h3>

              {peopleOnSelectedDay.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                  <p className="text-cyan-300">No one on this day right now</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {peopleOnSelectedDay.map((person) => (
                    <div 
                      key={person.id}
                      className="p-4 bg-cyan-900/30 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${person.color} flex items-center justify-center text-lg font-bold text-white border-2 border-cyan-400/50`}>
                          {person.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white">{person.name}</h4>
                            {person.streak > 5 && (
                              <div className="px-2 py-0.5 bg-orange-500/30 border border-orange-400/50 rounded-full">
                                <span className="text-xs font-bold text-orange-200">🔥 Hot Streak!</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-cyan-300">🔥 {person.streak} day streak</span>
                            <span className="text-cyan-400">
                              📍 {locations.find(l => l.id === person.currentLocation)?.name || 'Exploring'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg transition-all group">
                            <span className="text-lg group-hover:scale-125 transition-transform inline-block">👋</span>
                          </button>
                          <button className="p-2 bg-cyan-700/30 hover:bg-cyan-700/50 rounded-lg transition-all">
                            <MessageCircle className="w-5 h-5 text-cyan-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-xl">
                <p className="text-xs text-green-300 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-white">{dayStats.completionRate}%</p>
              </div>
              <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                <p className="text-xs text-purple-300 mb-1">Avg Time</p>
                <p className="text-2xl font-bold text-white">{dayStats.avgTimeToComplete}m</p>
              </div>
              <div className="p-4 bg-orange-900/30 border border-orange-500/30 rounded-xl">
                <p className="text-xs text-orange-300 mb-1">Peak Hour</p>
                <p className="text-lg font-bold text-white">{dayStats.peakTime}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-orange-500/30 bg-orange-900/20 flex-shrink-0">
        <div className="flex gap-3">
          <button
            onClick={() => {
              const dayLocation = locations.find(l => l.day === selectedDayNumber);
              if (dayLocation) {
                setShowDayExplorer(false);
                openLocationModal(dayLocation);
              }
            }}
            className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Start Day {selectedDayNumber} Mission
          </button>
        </div>
      </div>
    </div>
  </div>
)}



      <style>{`
        @keyframes dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -50;
          }
        }

        .animate-dash {
          stroke-dasharray: 15, 10;
          animation: dash 3s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes sparkle {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
          100% { opacity: 0; transform: scale(0.5); }
        }

        .animate-sparkle {
          animation: sparkle 1s ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}