import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const createSampleGroups = async () => {
  const groups = [
    {
      name: 'Social Skills Masters',
      description: 'Master the art of effective communication',
      icon: '💬',
      category: 'Communication',
      members: 0,
      activeNow: 0,
      memberIds: [],
      posts: []
    },
    {
      name: 'Confidence Builders',
      description: 'Build unshakeable confidence together',
      icon: '💪',
      category: 'Personal Growth',
      members: 0,
      activeNow: 0,
      memberIds: [],
      posts: []
    },
    {
      name: 'Leadership League',
      description: 'Develop leadership skills that inspire',
      icon: '👑',
      category: 'Leadership',
      members: 0,
      activeNow: 0,
      memberIds: [],
      posts: []
    }
  ];

  for (const group of groups) {
    await addDoc(collection(db, 'groups'), {
      ...group,
      createdAt: serverTimestamp()
    });
  }
  
  console.log('Sample groups created!');
};

export const createSampleChallenges = async () => {
  const challenges = [
    {
      title: 'Weekly Conversation Master',
      description: 'Have 10 meaningful conversations this week',
      icon: '💬',
      type: 'WEEKLY',
      difficulty: 'MEDIUM',
      target: 10,
      reward: 500,
      rewardType: 'XP',
      timeLeft: '5 days left',
      participants: 0,
      active: true
    },
    {
      title: 'Daily Confidence Boost',
      description: 'Complete 3 confidence-building exercises',
      icon: '⭐',
      type: 'DAILY',
      difficulty: 'EASY',
      target: 3,
      reward: 100,
      rewardType: 'XP',
      timeLeft: '18 hours left',
      participants: 0,
      active: true
    },
    {
      title: 'Public Speaking Champion',
      description: 'Give 5 presentations or speeches',
      icon: '🎤',
      type: 'MONTHLY',
      difficulty: 'HARD',
      target: 5,
      reward: 2000,
      rewardType: 'XP',
      timeLeft: '20 days left',
      participants: 0,
      active: true
    }
  ];

  for (const challenge of challenges) {
    await addDoc(collection(db, 'challenges'), {
      ...challenge,
      createdAt: serverTimestamp()
    });
  }
  
  console.log('Sample challenges created!');
};