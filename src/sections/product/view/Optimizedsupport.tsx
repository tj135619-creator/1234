// OptimizedSupport.tsx - PART 1: IMPORTS & SETUP

import React, { useState, useEffect, useRef } from 'react';
import {
Heart, AlertCircle, Shield, Users, MessageCircle,
Phone, Video, Check, X, Flag, Bookmark, Eye, EyeOff,
ThumbsUp, MessageSquare, Clock, Zap, Radio, Volume2, VolumeX
} from 'lucide-react';
import {
getFirestore, collection, addDoc, getDocs, query,
where, orderBy, onSnapshot, updateDoc, doc, serverTimestamp,
Timestamp, limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// STRUGGLE-SPECIFIC GROUP CATEGORIES
const SUPPORT_GROUP_CATEGORIES = [
{
id: 'social-avoidance',
name: 'Social Avoidance Support',
description: 'For those who struggle leaving their room, avoiding people they know, or canceling plans',
icon: '🏠',
color: 'from-blue-600 to-cyan-600',
commonStruggles: [
'Can\'t leave my room',
'Avoiding people I know',
'Canceling plans last minute',
'Fear of running into someone'
]
},
{
id: 'campus-anxiety',
name: 'Campus Life Anxiety',
description: 'Anxiety specific to college/campus environments and social situations',
icon: '🎓',
color: 'from-purple-600 to-pink-600',
commonStruggles: [
'Dining hall anxiety',
'Class participation fear',
'Dorm social pressure',
'Group project stress'
]
},
{
id: 'panic-support',
name: 'Panic Attack Support',
description: 'Immediate support during and after panic attacks',
icon: '🌊',
color: 'from-red-600 to-orange-600',
commonStruggles: [
'Sudden panic attacks',
'Physical symptoms (racing heart, etc)',
'Fear of having another panic attack',
'Not knowing what to do during panic'
]
},
{
id: 'daily-struggles',
name: 'Daily Check-ins',
description: 'Share how you\'re really doing today, no forced positivity',
icon: '📅',
color: 'from-green-600 to-emerald-600',
commonStruggles: [
'Today was hard',
'Small victories',
'Need someone to listen',
'Just venting'
]
},
{
id: 'understanding-needed',
name: 'Just Need Understanding',
description: 'No advice wanted, just validation that what you\'re feeling is real',
icon: '💭',
color: 'from-indigo-600 to-purple-600',
commonStruggles: [
'Tired of "just try harder"',
'Need validation, not solutions',
'Family doesn\'t understand',
'Feeling alone in this'
]
}
];

// SUPPORT POST TEMPLATES (Anti-toxic-positivity)
const SUPPORT_POST_TEMPLATES = [
{
type: 'NEED_SUPPORT_NOW',
icon: '🆘',
title: 'Need Support Right Now',
description: 'For when you\'re really struggling in this moment',
color: 'from-red-600 to-orange-600',
adviceDefault: false, // Just listening
fields: [
{
name: 'situation',
label: 'What\'s happening right now?',
placeholder: 'I\'m supposed to go to class but I can\'t leave my room...',
type: 'textarea'
},
{
name: 'feeling',
label: 'How does this feel?',
placeholder: 'My heart is racing, I feel trapped...',
type: 'textarea'
},
{
name: 'needType',
label: 'What would help most?',
type: 'select',
options: [
'Just need someone to listen',
'Need validation that this is real',
'Want to hear from others who\'ve been there',
'Could use some coping strategies',
'Just need to not be alone right now'
]
}
]
},
{
type: 'SMALL_WIN',
icon: '✨',
title: 'Small Victory (No Matter How Tiny)',
description: 'Celebrate progress, even if it seems small to others',
color: 'from-green-600 to-emerald-600',
adviceDefault: false,
fields: [
{
name: 'achievement',
label: 'What did you do?',
placeholder: 'I left my room to get food today',
type: 'textarea'
},
{
name: 'whyHard',
label: 'Why was this hard for you?',
placeholder: 'I\'ve been avoiding the dining hall for a week because...',
type: 'textarea'
},
{
name: 'howFeels',
label: 'How does it feel?',
placeholder: 'Proud but also exhausted',
type: 'textarea'
}
]
},
{
type: 'JUST_VENTING',
icon: '💨',
title: 'Just Venting (No Advice Please)',
description: 'Sometimes you just need to let it out',
color: 'from-purple-600 to-pink-600',
adviceDefault: false,
fields: [
{
name: 'vent',
label: 'Let it out...',
placeholder: 'I\'m so tired of people saying "just go out more" like it\'s that simple...',
type: 'textarea',
rows: 6
}
]
},
{
type: 'WHAT_HELPS',
icon: '💡',
title: 'Something That Actually Helped Me',
description: 'Share real strategies that worked (not generic advice)',
color: 'from-blue-600 to-cyan-600',
adviceDefault: false,
fields: [
{
name: 'strategy',
label: 'What helped you?',
placeholder: 'Texting a friend "I\'m going to class" and having them reply helped me actually go',
type: 'textarea'
},
{
name: 'situation',
label: 'What situation was this for?',
placeholder: 'When I\'m too anxious to leave my room',
type: 'textarea'
},
{
name: 'honesty',
label: 'What didn\'t work or made it harder?',
placeholder: 'Deep breathing made me more anxious because I focused on my breathing',
type: 'textarea'
}
]
},
{
type: 'CHECK_IN',
icon: '📊',
title: 'Honest Check-in',
description: 'How you\'re really doing (not fine when you\'re not)',
color: 'from-yellow-600 to-orange-600',
adviceDefault: false,
fields: [
{
name: 'today',
label: 'Today I\'m at (1=worst, 10=best)',
type: 'range',
min: 1,
max: 10
},
{
name: 'struggles',
label: 'What made it hard today?',
placeholder: 'Had to skip class because I couldn\'t deal with people',
type: 'textarea'
},
{
name: 'wins',
label: 'Any tiny wins? (even just getting out of bed counts)',
placeholder: 'I showered today',
type: 'textarea',
optional: true
}
]
}
];

// ANONYMITY LEVELS
const ANONYMITY_LEVELS = [
{
id: 'full-anonymous',
name: 'Fully Anonymous',
description: 'No one can see who you are, not even group members',
icon: '👤',
showsName: false,
showsAvatar: false,
showsHistory: false
},
{
id: 'group-anonymous',
name: 'Anonymous in This Group Only',
description: 'Hidden in this group, but visible elsewhere',
icon: '🎭',
showsName: false,
showsAvatar: false,
showsHistory: false
},
{
id: 'first-name-only',
name: 'First Name Only',
description: 'Show first name but hide last name and username',
icon: '👋',
showsName: 'first',
showsAvatar: true,
showsHistory: false
},
{
id: 'full-profile',
name: 'Full Profile',
description: 'Show your complete profile',
icon: '😊',
showsName: true,
showsAvatar: true,
showsHistory: true
}
];

// CONTENT WARNING TAGS
const CONTENT_WARNING_TAGS = [
{ id: 'panic-attacks', label: 'Panic Attacks', color: 'red' },
{ id: 'suicidal-thoughts', label: 'Suicidal Thoughts', color: 'red' },
{ id: 'self-harm', label: 'Self-Harm', color: 'red' },
{ id: 'eating-disorders', label: 'Eating Disorders', color: 'orange' },
{ id: 'trauma', label: 'Trauma', color: 'orange' },
{ id: 'family-issues', label: 'Family Issues', color: 'yellow' },
{ id: 'substance-use', label: 'Substance Use', color: 'yellow' },
{ id: 'academic-stress', label: 'Academic Stress', color: 'blue' }
];

// CRISIS RESOURCES
const CRISIS_RESOURCES = [
{
name: '988 Suicide & Crisis Lifeline',
contact: '988',
type: 'phone',
description: '24/7 support for people in distress',
available: '24/7'
},
{
name: 'Crisis Text Line',
contact: 'Text HOME to 741741',
type: 'text',
description: 'Text with a trained crisis counselor',
available: '24/7'
},
{
name: 'NAMI Helpline',
contact: '1-800-950-NAMI',
type: 'phone',
description: 'Information and referral services',
available: 'Mon-Fri 10am-10pm ET'
}
];

// OptimizedSupport.tsx - PART 2: STATE MANAGEMENT & HOOKS

const OptimizedSupport = () => {
const db = getFirestore();
const auth = getAuth();
const [currentUser, setCurrentUser] = useState(null);

// ============================================
// MAIN STATE
// ============================================

// View State
const [activeView, setActiveView] = useState('groups'); // 'groups', 'group-detail', 'crisis-resources'
const [selectedGroup, setSelectedGroup] = useState(null);
const [showCrisisResources, setShowCrisisResources] = useState(true);

// Support Groups
const [supportGroups, setSupportGroups] = useState([]);
const [loadingGroups, setLoadingGroups] = useState(true);
const [joinedGroupIds, setJoinedGroupIds] = useState([]);

// Posts & Feed
const [posts, setPosts] = useState([]);
const [loadingPosts, setLoadingPosts] = useState(false);
const [collapsedPosts, setCollapsedPosts] = useState(new Set()); // For content warnings

// Post Creation
const [showPostModal, setShowPostModal] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [postData, setPostData] = useState({});
const [anonymityLevel, setAnonymityLevel] = useState('group-anonymous');
const [contentWarnings, setContentWarnings] = useState([]);
const [adviceWanted, setAdviceWanted] = useState(false);

// Live Chat
const [showLiveChat, setShowLiveChat] = useState(false);
const [chatMessages, setChatMessages] = useState([]);
const [activePeers, setActivePeers] = useState([]);

// Quiet Company (Silent Video Room)
const [showQuietRoom, setShowQuietRoom] = useState(false);
const [quietRoomPeers, setQuietRoomPeers] = useState([]);

// Crisis/Panic Features
const [panicAlertActive, setPanicAlertActive] = useState(false);
const [availablePeers, setAvailablePeers] = useState([]);

// Safe People List
const [safePeople, setSafePeople] = useState([]);
const [showSafePeopleModal, setShowSafePeopleModal] = useState(false);

// Filters & Settings
const [contentWarningFilters, setContentWarningFilters] = useState([]);
const [sortBy, setSortBy] = useState('recent'); // 'recent', 'needs-support', 'similar'
const [showOnlyListening, setShowOnlyListening] = useState(false);

// ============================================
// AUTH LISTENER
// ============================================

useEffect(() => {
const unsubscribe = auth.onAuthStateChanged(user => {
if (user) {
setCurrentUser(user);
loadUserData(user.uid);
} else {
setCurrentUser(null);
}
});

return () => unsubscribe();
}, []);

// ============================================
// LOAD USER DATA
// ============================================

const loadUserData = async (userId) => {
try {
// Load joined groups
const userDoc = await getDocs(
query(collection(db, 'users', userId, 'joined_support_groups'))
);
const joined = userDoc.docs.map(doc => doc.id);
setJoinedGroupIds(joined);

// Load safe people list
const safePeopleDoc = await getDocs(
query(collection(db, 'users', userId, 'safe_people'))
);
const safePeopleList = safePeopleDoc.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
setSafePeople(safePeopleList);

// Load content warning preferences
const prefsDoc = await getDocs(
query(collection(db, 'users', userId, 'preferences'))
);
if (!prefsDoc.empty) {
const prefs = prefsDoc.docs[0].data();
setContentWarningFilters(prefs.hiddenContentWarnings || []);
}

} catch (error) {
console.error('Error loading user data:', error);
}
};

// ============================================
// LOAD SUPPORT GROUPS
// ============================================

useEffect(() => {
const loadSupportGroups = async () => {
try {
setLoadingGroups(true);

// Check if groups exist, if not create them
const groupsSnapshot = await getDocs(collection(db, 'support_groups'));

if (groupsSnapshot.empty) {
console.log('🌱 Seeding support groups...');

// Create support groups from categories
for (const category of SUPPORT_GROUP_CATEGORIES) {
await addDoc(collection(db, 'support_groups'), {
categoryId: category.id,
name: category.name,
description: category.description,
icon: category.icon,
color: category.color,
commonStruggles: category.commonStruggles,
memberCount: 0,
activeNow: 0,
postCount: 0,
createdAt: serverTimestamp(),
guidelines: {
rules: [
'✅ Share your real experiences, no matter how "small"',
'✅ Support others without judgment',
'✅ Respect when someone says "no advice please"',
'✅ Validate feelings before offering solutions',
'❌ No "just think positive" or toxic positivity',
'❌ No unsolicited medical/therapy advice',
'❌ No comparing struggles ("others have it worse")',
'❌ No dismissing with "have you tried [basic thing]"'
],
tone: 'This is a safe space for real struggles. We don\'t do forced positivity here.'
},
settings: {
allowAnonymous: true,
defaultAdviceMode: false, // Just listening by default
requireContentWarnings: true,
allowLiveChat: true,
allowQuietRoom: true
}
});
}
}

// Load all support groups
const q = query(
collection(db, 'support_groups'),
orderBy('memberCount', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
const groups = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
setSupportGroups(groups);
setLoadingGroups(false);
});

return unsubscribe;

} catch (error) {
console.error('Error loading support groups:', error);
setLoadingGroups(false);
}
};

loadSupportGroups();
}, [db]);

// ============================================
// LOAD POSTS FOR SELECTED GROUP
// ============================================

useEffect(() => {
if (!selectedGroup) {
setPosts([]);
return;
}

const loadPosts = async () => {
setLoadingPosts(true);

try {
let q = query(
collection(db, 'support_posts'),
where('groupId', '==', selectedGroup.id),
orderBy('createdAt', 'desc'),
limit(50)
);

// Apply filters
if (showOnlyListening) {
q = query(q, where('adviceWanted', '==', false));
}

const unsubscribe = onSnapshot(q, (snapshot) => {
let loadedPosts = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

// Filter by content warnings
if (contentWarningFilters.length > 0) {
loadedPosts = loadedPosts.filter(post => {
if (!post.contentWarnings) return true;
return !post.contentWarnings.some(cw =>
contentWarningFilters.includes(cw)
);
});
}

// Sort
if (sortBy === 'needs-support') {
loadedPosts.sort((a, b) => {
const aUrgent = a.template?.type === 'NEED_SUPPORT_NOW' ? 1 : 0;
const bUrgent = b.template?.type === 'NEED_SUPPORT_NOW' ? 1 : 0;
return bUrgent - aUrgent;
});
}

setPosts(loadedPosts);
setLoadingPosts(false);
});

return unsubscribe;

} catch (error) {
console.error('Error loading posts:', error);
setLoadingPosts(false);
}
};

loadPosts();
}, [selectedGroup, db, showOnlyListening, contentWarningFilters, sortBy]);

// ============================================
// LIVE CHAT LISTENER
// ============================================

useEffect(() => {
if (!selectedGroup || !showLiveChat) return;

const q = query(
collection(db, 'support_groups', selectedGroup.id, 'live_chat'),
orderBy('timestamp', 'desc'),
limit(50)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
const messages = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
})).reverse(); // Show oldest first

setChatMessages(messages);
});

return () => unsubscribe();
}, [selectedGroup, showLiveChat, db]);

// ============================================
// ACTIVE PEERS LISTENER (for panic button)
// ============================================

useEffect(() => {
if (!selectedGroup) return;

const q = query(
collection(db, 'support_groups', selectedGroup.id, 'active_peers'),
where('lastActive', '>', Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000))) // Active in last 5 minutes
);

const unsubscribe = onSnapshot(q, (snapshot) => {
const peers = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
setActivePeers(peers);
setAvailablePeers(peers.filter(p => p.availableForSupport));
});

return () => unsubscribe();
}, [selectedGroup, db]);

// ============================================
// JOIN/LEAVE GROUP
// ============================================

const handleJoinGroup = async (groupId) => {
if (!currentUser) {
alert('Please sign in to join groups');
return;
}

try {
// Add to user's joined groups
await addDoc(
collection(db, 'users', currentUser.uid, 'joined_support_groups'),
{
groupId,
joinedAt: serverTimestamp()
}
);

// Increment group member count
const groupRef = doc(db, 'support_groups', groupId);
await updateDoc(groupRef, {
memberCount: (supportGroups.find(g => g.id === groupId)?.memberCount || 0) + 1
});

setJoinedGroupIds([...joinedGroupIds, groupId]);

// Show guidelines modal
const group = supportGroups.find(g => g.id === groupId);
if (group) {
setSelectedGroup(group);
// Guidelines will be shown in GroupDetailView
}

} catch (error) {
console.error('Error joining group:', error);
alert('Failed to join group. Please try again.');
}
};

const handleLeaveGroup = async (groupId) => {
if (!currentUser) return;

if (!confirm('Are you sure you want to leave this support group?')) return;

try {
// Remove from user's joined groups
const q = query(
collection(db, 'users', currentUser.uid, 'joined_support_groups'),
where('groupId', '==', groupId)
);
const snapshot = await getDocs(q);
snapshot.docs.forEach(doc => doc.ref.delete());

// Decrement group member count
const groupRef = doc(db, 'support_groups', groupId);
await updateDoc(groupRef, {
memberCount: Math.max(0, (supportGroups.find(g => g.id === groupId)?.memberCount || 0) - 1)
});

setJoinedGroupIds(joinedGroupIds.filter(id => id !== groupId));
setSelectedGroup(null);

} catch (error) {
console.error('Error leaving group:', error);
alert('Failed to leave group. Please try again.');
}
};

// ============================================
// CREATE POST
// ============================================

const handleCreatePost = async () => {
if (!currentUser || !selectedGroup || !selectedTemplate) {
alert('Please fill in all required information');
return;
}

// Validate required fields
const requiredFields = selectedTemplate.fields.filter(f => !f.optional);
const missingFields = requiredFields.filter(f => !postData[f.name]?.trim());

if (missingFields.length > 0) {
alert(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
return;
}

try {
// Determine author info based on anonymity level
const anonymitySettings = ANONYMITY_LEVELS.find(l => l.id === anonymityLevel);

let authorData = {
userId: currentUser.uid,
anonymityLevel
};

if (anonymitySettings.showsName) {
// Load user profile
const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', currentUser.uid)));
if (!userDoc.empty) {
const userData = userDoc.docs[0].data();

if (anonymitySettings.showsName === 'first') {
authorData.name = userData.name?.split(' ')[0] || 'Anonymous';
} else {
authorData.name = userData.name;
authorData.username = userData.username;
}

if (anonymitySettings.showsAvatar) {
authorData.avatar = userData.avatar;
}
}
} else {
authorData.name = 'Anonymous';
authorData.avatar = '👤';
}

// Create post
const postDoc = await addDoc(collection(db, 'support_posts'), {
groupId: selectedGroup.id,
author: authorData,
template: selectedTemplate,
content: postData,
adviceWanted,
contentWarnings,
createdAt: serverTimestamp(),
reactions: {
meToo: 0,
thisHelped: 0,
saved: 0,
iUnderstand: 0
},
responseCount: 0,
flagCount: 0
});

// Update group post count
const groupRef = doc(db, 'support_groups', selectedGroup.id);
await updateDoc(groupRef, {
postCount: (selectedGroup.postCount || 0) + 1
});

// Reset form
setShowPostModal(false);
setSelectedTemplate(null);
setPostData({});
setContentWarnings([]);
setAdviceWanted(false);

console.log('✅ Post created successfully:', postDoc.id);

} catch (error) {
console.error('Error creating post:', error);
alert('Failed to create post. Please try again.');
}
};

// ============================================
// PANIC BUTTON
// ============================================

const handlePanicButton = async () => {
if (!currentUser || !selectedGroup) return;

setPanicAlertActive(true);

try {
// Create panic alert
await addDoc(collection(db, 'panic_alerts'), {
userId: currentUser.uid,
groupId: selectedGroup.id,
timestamp: serverTimestamp(),
resolved: false
});

// Notify available peers
availablePeers.forEach(async (peer) => {
await addDoc(collection(db, 'users', peer.userId, 'notifications'), {
type: 'panic-alert',
groupId: selectedGroup.id,
message: 'Someone needs support right now',
createdAt: serverTimestamp(),
read: false
});
});

// Auto-resolve after 30 minutes
setTimeout(() => {
setPanicAlertActive(false);
}, 30 * 60 * 1000);

} catch (error) {
console.error('Error sending panic alert:', error);
alert('Failed to send alert. Please try crisis resources instead.');
}
};

// ============================================
// ADD TO SAFE PEOPLE
// ============================================

const handleAddSafePerson = async (userId, userData) => {
if (!currentUser) return;

try {
await addDoc(collection(db, 'users', currentUser.uid, 'safe_people'), {
userId,
name: userData.name,
avatar: userData.avatar,
addedAt: serverTimestamp()
});

setSafePeople([...safePeople, { userId, ...userData }]);

} catch (error) {
console.error('Error adding safe person:', error);
alert('Failed to add to safe people list.');
}
};

// ============================================
// SEND LIVE CHAT MESSAGE
// ============================================

const handleSendChatMessage = async (message) => {
if (!currentUser || !selectedGroup || !message.trim()) return;

try {
await addDoc(collection(db, 'support_groups', selectedGroup.id, 'live_chat'), {
userId: currentUser.uid,
message: message.trim(),
timestamp: serverTimestamp()
});

} catch (error) {
console.error('Error sending chat message:', error);
}
};

// ============================================
// TOGGLE CONTENT WARNING COLLAPSE
// ============================================

const togglePostCollapse = (postId) => {
const newCollapsed = new Set(collapsedPosts);
if (newCollapsed.has(postId)) {
newCollapsed.delete(postId);
} else {
newCollapsed.add(postId);
}
setCollapsedPosts(newCollapsed);
};

// ============================================
// REACT TO POST
// ============================================

const handleReactToPost = async (postId, reactionType) => {
if (!currentUser) return;

try {
const post = posts.find(p => p.id === postId);
if (!post) return;

const postRef = doc(db, 'support_posts', postId);
await updateDoc(postRef, {
[`reactions.${reactionType}`]: (post.reactions?.[reactionType] || 0) + 1
});

} catch (error) {
console.error('Error reacting to post:', error);
}
};

// ============================================
// CRISIS RESOURCES BANNER COMPONENT
// ============================================

const CrisisResourcesBanner = () => {
if (!showCrisisResources) return null;

return (
<div className="mb-6 p-5 bg-gradient-to-r from-red-900/30 via-red-800/30 to-orange-900/30 border-2 border-red-500/50 rounded-xl backdrop-blur-sm">
<div className="flex items-start gap-4">
<div className="flex-shrink-0">
<AlertCircle className="w-8 h-8 text-red-400" />
</div>

<div className="flex-1">
<div className="flex items-center justify-between mb-3">
<h3 className="font-bold text-red-200 text-lg">
🆘 Need Immediate Help?
</h3>
<button
onClick={() => setShowCrisisResources(false)}
className="text-red-300 hover:text-white transition-colors"
>
<X className="w-5 h-5" />
</button>
</div>

<p className="text-red-100 mb-4 text-sm">
If you're in crisis or having thoughts of self-harm, please reach out to these resources immediately:
</p>

<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
{CRISIS_RESOURCES.map((resource, idx) => (
<div
key={idx}
className="p-3 bg-black/30 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all"
>
<div className="flex items-center gap-2 mb-2">
{resource.type === 'phone' ? (
<Phone className="w-4 h-4 text-red-300" />
) : (
<MessageSquare className="w-4 h-4 text-red-300" />
)}
<span className="font-bold text-red-200 text-sm">
{resource.name}
</span>
</div>
<p className="text-red-100 font-mono text-lg mb-1">
{resource.contact}
</p>
<p className="text-red-300 text-xs mb-1">
{resource.description}
</p>
<p className="text-red-400 text-xs">
{resource.available}
</p>
</div>
))}
</div>

<p className="text-red-200 text-xs mt-3 italic">
These resources are for emergencies. For peer support, continue below.
</p>
</div>
</div>
</div>
);
};

// ============================================
// SUPPORT GROUP CARD COMPONENT
// ============================================

const SupportGroupCard = ({ group, isJoined }) => {
const categoryInfo = SUPPORT_GROUP_CATEGORIES.find(c => c.categoryId === group.categoryId);

return (
<div className={`p-6 rounded-xl border-2 transition-all cursor-pointer
bg-gradient-to-br ${categoryInfo?.color || 'from-purple-600 to-pink-600'}/10
border-purple-500/30 hover:border-purple-400/60 hover:scale-[1.02]
${isJoined ? 'ring-2 ring-green-500/50' : ''}`}
onClick={() => {
setSelectedGroup(group);
setActiveView('group-detail');
}}
>
{/* Header */}
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-3">
<div className="text-4xl">{group.icon}</div>
<div>
<h3 className="font-bold text-white text-xl mb-1">
{group.name}
</h3>
<p className="text-purple-300 text-sm">
{group.description}
</p>
</div>
</div>

{isJoined && (
<div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
<Check className="w-4 h-4 text-green-400" />
<span className="text-green-300 text-sm font-semibold">Joined</span>
</div>
)}
</div>

{/* Common Struggles */}
<div className="mb-4">
<p className="text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wide">
Common Struggles:
</p>
<div className="flex flex-wrap gap-2">
{group.commonStruggles?.slice(0, 3).map((struggle, idx) => (
<span
key={idx}
className="px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded-full text-purple-200 text-xs"
>
{struggle}
</span>
))}
</div>
</div>

{/* Stats */}
<div className="flex items-center gap-6 text-sm">
<div className="flex items-center gap-2">
<Users className="w-4 h-4 text-purple-400" />
<span className="text-purple-300">
{group.memberCount || 0} members
</span>
</div>

<div className="flex items-center gap-2">
<Radio className="w-4 h-4 text-green-400" />
<span className="text-green-300">
{group.activeNow || 0} active now
</span>
</div>

<div className="flex items-center gap-2">
<MessageCircle className="w-4 h-4 text-blue-400" />
<span className="text-blue-300">
{group.postCount || 0} posts
</span>
</div>
</div>

{/* Join Button */}
<button
onClick={(e) => {
e.stopPropagation();
if (isJoined) {
handleLeaveGroup(group.id);
} else {
handleJoinGroup(group.id);
}
}}
className={`w-full mt-4 px-4 py-3 rounded-xl font-bold transition-all
${isJoined
? 'bg-red-600/20 border-2 border-red-500/50 text-red-300 hover:bg-red-600/30'
: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
}`}
>
{isJoined ? 'Leave Group' : 'Join Group'}
</button>
</div>
);
};

// ============================================
// SAFE SPACE GUIDELINES MODAL
// ============================================

const SafeSpaceGuidelines = ({ group, onAccept, onClose }) => {
return (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
<div className="p-8">
{/* Header */}
<div className="flex items-center gap-3 mb-6">
<Shield className="w-8 h-8 text-purple-400" />
<div>
<h2 className="text-2xl font-bold text-white">
Welcome to {group.name}
</h2>
<p className="text-purple-300 text-sm">
Please read our community guidelines
</p>
</div>
</div>

{/* Guidelines Tone */}
<div className="p-4 bg-purple-950/50 rounded-xl border border-purple-500/30 mb-6">
<p className="text-purple-200 italic">
"{group.guidelines?.tone || 'This is a safe space for real struggles.'}"
</p>
</div>

{/* Rules */}
<div className="mb-6">
<h3 className="font-bold text-white mb-4 text-lg">
Community Guidelines:
</h3>
<ul className="space-y-3">
{group.guidelines?.rules.map((rule, idx) => (
<li
key={idx}
className={`flex items-start gap-3 p-3 rounded-lg ${
rule.startsWith('✅')
? 'bg-green-900/20 border border-green-500/30'
: 'bg-red-900/20 border border-red-500/30'
}`}
>
<span className="text-lg">{rule.substring(0, 2)}</span>
<span className={rule.startsWith('✅') ? 'text-green-200' : 'text-red-200'}>
{rule.substring(2)}
</span>
</li>
))}
</ul>
</div>

{/* Why These Rules Matter */}
<div className="p-4 bg-indigo-950/50 rounded-xl border border-indigo-500/30 mb-6">
<h4 className="font-bold text-indigo-200 mb-2">
💜 Why These Rules Matter
</h4>
<p className="text-indigo-300 text-sm">
Many people here have been dismissed, minimized, or given unhelpful "just try harder"
advice. This space is different. We validate real struggles, meet people where they are,
and respect when someone just needs to be heard.
</p>
</div>

{/* Buttons */}
<div className="flex gap-3">
<button
onClick={onClose}
className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
>
Not Ready Yet
</button>
<button
onClick={onAccept}
className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
I Understand & Agree
</button>
</div>
</div>
</div>
</div>
);
};

// ============================================
// POST CREATION MODAL
// ============================================

const PostCreationModal = () => {
const [step, setStep] = useState(1); // 1: select template, 2: fill form

if (!showPostModal) return null;

return (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
<div className="p-8">
{/* Header */}
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">
{step === 1 ? 'What do you need?' : selectedTemplate?.title}
</h2>
<button
onClick={() => {
setShowPostModal(false);
setStep(1);
setSelectedTemplate(null);
setPostData({});
}}
className="text-purple-300 hover:text-white transition-colors"
>
<X className="w-6 h-6" />
</button>
</div>

{/* Step 1: Select Template */}
{step === 1 && (
<div className="space-y-4">
<p className="text-purple-300 mb-6">
Choose what kind of post you want to create:
</p>

{SUPPORT_POST_TEMPLATES.map((template) => (
<button
key={template.type}
onClick={() => {
setSelectedTemplate(template);
setAdviceWanted(template.adviceDefault);
setStep(2);
}}
className={`w-full p-5 rounded-xl border-2 transition-all text-left
bg-gradient-to-br ${template.color}/10 border-purple-500/30
hover:border-purple-400/60 hover:scale-[1.02]`}
>
<div className="flex items-start gap-4">
<div className="text-3xl">{template.icon}</div>
<div className="flex-1">
<h3 className="font-bold text-white text-lg mb-1">
{template.title}
</h3>
<p className="text-purple-300 text-sm">
{template.description}
</p>
{!template.adviceDefault && (
<div className="mt-2 flex items-center gap-2">
<Shield className="w-4 h-4 text-green-400" />
<span className="text-green-300 text-xs font-semibold">
Just listening mode by default
</span>
</div>
)}
</div>
</div>
</button>
))}
</div>
)}

{/* Step 2: Fill Form */}
{step === 2 && selectedTemplate && (
<div className="space-y-6">
{/* Template Description */}
<div className="p-4 bg-purple-950/50 rounded-xl border border-purple-500/30">
<p className="text-purple-200 text-sm">
{selectedTemplate.description}
</p>
</div>

{/* Form Fields */}
{selectedTemplate.fields.map((field) => (
<div key={field.name}>
<label className="block text-white font-semibold mb-2">
{field.label}
{field.optional && (
<span className="text-purple-400 text-sm ml-2">(optional)</span>
)}
</label>

{field.type === 'textarea' ? (
<textarea
value={postData[field.name] || ''}
onChange={(e) => setPostData({
...postData,
[field.name]: e.target.value
})}
placeholder={field.placeholder}
rows={field.rows || 4}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white placeholder-purple-400 focus:border-purple-400
focus:outline-none resize-none"
/>
) : field.type === 'select' ? (
<select
value={postData[field.name] || ''}
onChange={(e) => setPostData({
...postData,
[field.name]: e.target.value
})}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white focus:border-purple-400 focus:outline-none"
>
<option value="">Select...</option>
{field.options?.map((option) => (
<option key={option} value={option}>
{option}
</option>
))}
</select>
) : field.type === 'range' ? (
<div>
<input
type="range"
min={field.min || 1}
max={field.max || 10}
value={postData[field.name] || 5}
onChange={(e) => setPostData({
...postData,
[field.name]: e.target.value
})}
className="w-full"
/>
<div className="flex justify-between text-purple-300 text-sm mt-2">
<span>1 (Worst)</span>
<span className="font-bold text-white text-lg">
{postData[field.name] || 5}
</span>
<span>10 (Best)</span>
</div>
</div>
) : (
<input
type="text"
value={postData[field.name] || ''}
onChange={(e) => setPostData({
...postData,
[field.name]: e.target.value
})}
placeholder={field.placeholder}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white placeholder-purple-400 focus:border-purple-400
focus:outline-none"
/>
)}
</div>
))}

{/* Anonymity Level */}
<div>
<label className="block text-white font-semibold mb-3">
How do you want to appear?
</label>
<div className="grid grid-cols-2 gap-3">
{ANONYMITY_LEVELS.map((level) => (
<button
key={level.id}
onClick={() => setAnonymityLevel(level.id)}
className={`p-4 rounded-xl border-2 transition-all text-left
${anonymityLevel === level.id
? 'bg-purple-600/30 border-purple-400'
: 'bg-purple-950/30 border-purple-500/30 hover:border-purple-400/60'
}`}
>
<div className="flex items-center gap-2 mb-2">
<span className="text-2xl">{level.icon}</span>
<span className="font-bold text-white text-sm">
{level.name}
</span>
</div>
<p className="text-purple-300 text-xs">
{level.description}
</p>
</button>
))}
</div>
</div>

{/* Advice Toggle */}
<div className="p-4 bg-purple-950/40 rounded-xl border border-purple-500/30">
<div className="flex items-center justify-between">
<div>
<p className="text-white font-semibold mb-1">
{adviceWanted ? '💡 Open to Advice' : '👂 Just Listening'}
</p>
<p className="text-purple-400 text-sm">
{adviceWanted
? 'People can offer suggestions and coping strategies'
: 'People will focus on validation and understanding'
}
</p>
</div>
<button
onClick={() => setAdviceWanted(!adviceWanted)}
className={`w-16 h-8 rounded-full transition-all relative ${
adviceWanted ? 'bg-purple-500' : 'bg-gray-600'
}`}
>
<div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-all ${
adviceWanted ? 'left-9' : 'left-1'
}`} />
</button>
</div>
</div>

{/* Content Warnings */}
<div>
<label className="block text-white font-semibold mb-3">
Content Warnings (select all that apply)
</label>
<div className="flex flex-wrap gap-2">
{CONTENT_WARNING_TAGS.map((tag) => (
<button
key={tag.id}
onClick={() => {
if (contentWarnings.includes(tag.id)) {
setContentWarnings(contentWarnings.filter(cw => cw !== tag.id));
} else {
setContentWarnings([...contentWarnings, tag.id]);
}
}}
className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-semibold
${contentWarnings.includes(tag.id)
? `bg-${tag.color}-600/30 border-${tag.color}-400 text-${tag.color}-200`
: 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
}`}
>
{tag.label}
</button>
))}
</div>
</div>

{/* Buttons */}
<div className="flex gap-3 pt-4">
<button
onClick={() => {
setStep(1);
setSelectedTemplate(null);
setPostData({});
}}
className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
>
Back
</button>
<button
onClick={handleCreatePost}
className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
Share with Group
</button>
</div>
</div>
)}
</div>
</div>
</div>
);
};

// ============================================
// POST CARD COMPONENT
// ============================================



// Continue to the main render...
// ============================================
// MAIN RENDER FUNCTION
// ============================================

return (
<div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white">
{/* Crisis Resources Banner (Always visible) */}
<div className="sticky top-0 z-40 bg-gradient-to-br from-purple-950/95 via-purple-900/95 to-indigo-950/95 backdrop-blur-lg border-b-2 border-purple-500/30">
<div className="container mx-auto px-4 py-4">
<CrisisResourcesBanner />
</div>
</div>

<div className="container mx-auto px-4 py-8">
{/* Header */}
<div className="mb-8">
<div className="flex items-center justify-between mb-4"> <div> <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Peer Support Groups </h1> <p className="text-purple-300"> Real people who understand. No toxic positivity. No waiting weeks. </p> </div>

 
{activeView === 'group-detail' && (
<button
onClick={() => {
setActiveView('groups');
setSelectedGroup(null);
}}
className="px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold transition-all"
>
← Back to Groups
</button>
)}
</div>

{/* Key Features Banner */}
{activeView === 'groups' && (
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">👤</div>
<p className="font-semibold text-white mb-1">Anonymous Options</p>
<p className="text-purple-300 text-sm">Share without revealing identity</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">👂</div>
<p className="font-semibold text-white mb-1">Just Listening Mode</p>
<p className="text-purple-300 text-sm">No unwanted advice</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">🚫</div>
<p className="font-semibold text-white mb-1">No Toxic Positivity</p>
<p className="text-purple-300 text-sm">Real validation for real struggles</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">💬</div>
<p className="font-semibold text-white mb-1">Live Support</p>
<p className="text-purple-300 text-sm">Chat with peers right now</p>
</div>
</div>
)}
</div>

{/* GROUPS LIST VIEW */}
{activeView === 'groups' && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{loadingGroups ? (
<div className="col-span-2 text-center py-12">
<div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
<p className="text-purple-300">Loading support groups...</p>
</div>
) : supportGroups.length === 0 ? (
<div className="col-span-2 text-center py-12">
<p className="text-purple-300">No support groups available yet.</p>
</div>
) : (
supportGroups.map(group => (
<SupportGroupCard
key={group.id}
group={group}
isJoined={joinedGroupIds.includes(group.id)}
/>
))
)}
</div>
)}

{/* GROUP DETAIL VIEW */}
{activeView === 'group-detail' && selectedGroup && (
<div className="space-y-6">
{/* Group Header */}
<div className="p-6 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl border-2 border-purple-500/50">
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-4">
<div className="text-5xl">{selectedGroup.icon}</div>
<div>
<h2 className="text-3xl font-bold text-white mb-2">
{selectedGroup.name}
</h2>
<p className="text-purple-300">
{selectedGroup.description}
</p>
</div>
</div>

<div className="flex gap-3">
<button
onClick={() => setShowPostModal(true)}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all
flex items-center gap-2"
>
<MessageCircle className="w-5 h-5" />
New Post
</button>

<button
onClick={() => setShowLiveChat(!showLiveChat)}
className="px-6 py-3 bg-green-600/20 border-2 border-green-500/50
hover:bg-green-600/30 rounded-xl font-bold transition-all
flex items-center gap-2"
>
<Radio className="w-5 h-5 text-green-400" />
Live Chat
</button>
</div>
</div>

{/* Stats Bar */}
<div className="flex items-center gap-6 text-sm border-t border-purple-500/30 pt-4 mt-4">
<div className="flex items-center gap-2">
<Users className="w-5 h-5 text-purple-400" />
<span className="text-purple-300">
{selectedGroup.memberCount || 0} members
</span>
</div>
<div className="flex items-center gap-2">
<Radio className="w-5 h-5 text-green-400" />
<span className="text-green-300">
{activePeers.length} active now
</span>
</div>
<div className="flex items-center gap-2">
<MessageCircle className="w-5 h-5 text-blue-400" />
<span className="text-blue-300">
{selectedGroup.postCount || 0} posts
</span>
</div>
</div>
</div>

{/* Panic Button */}
<div className="p-4 bg-red-900/20 border-2 border-red-500/50 rounded-xl">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<Zap className="w-6 h-6 text-red-400" />
<div>
<p className="font-bold text-red-200">
Need support right now?
</p>
<p className="text-red-300 text-sm">
Alert {availablePeers.length} available peers who can help
</p>
</div>
</div>
<button
onClick={handlePanicButton}
disabled={panicAlertActive}
className={`px-6 py-3 rounded-xl font-bold transition-all ${
panicAlertActive
? 'bg-gray-700 text-gray-400 cursor-not-allowed'
: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white'
}`}
>
{panicAlertActive ? '✓ Alert Sent' : '🆘 Send Alert'}
</button>
</div>
</div>

{/* Filter Controls */}
<div className="flex items-center gap-4">
<select
value={sortBy}
onChange={(e) => setSortBy(e.target.value)}
className="px-4 py-2 bg-purple-900/50 border-2 border-purple-500/30
rounded-xl text-white focus:border-purple-400 focus:outline-none"
>
<option value="recent">Most Recent</option>
<option value="needs-support">Needs Support First</option>
</select>

<button
onClick={() => setShowOnlyListening(!showOnlyListening)}
className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${
showOnlyListening
? 'bg-green-600/30 border-green-500/50 text-green-200'
: 'bg-purple-900/30 border-purple-500/30 text-purple-300'
}`}
>
👂 Just Listening Only
</button>
</div>

{/* Posts Feed */}
<div className="space-y-4">
{loadingPosts ? (
<div className="text-center py-12">
<div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
<p className="text-purple-300">Loading posts...</p>
</div>
) : posts.length === 0 ? (
<div className="text-center py-12 p-8 bg-purple-900/30 rounded-xl border-2 border-purple-500/30">
<MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
<p className="text-purple-300 mb-4">
No posts yet. Be the first to share!
</p>
<button
onClick={() => setShowPostModal(true)}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
Create First Post
</button>
</div>
) : (
posts.map(post => <PostCard key={post.id} post={post} />)
)}
</div>
</div>
)}
</div>

{/* Post Creation Modal */}
<PostCreationModal />

{/* Guidelines Modal (shown when joining) */}
{selectedGroup && !joinedGroupIds.includes(selectedGroup.id) && activeView === 'group-detail' && (
<SafeSpaceGuidelines
group={selectedGroup}
onAccept={() => handleJoinGroup(selectedGroup.id)}
onClose={() => {
setActiveView('groups');
setSelectedGroup(null);
}}
/>
)}
</div> ); 


// OptimizedSupport.tsx - PART 4: REAL-TIME FEATURES

// Add these components after your PostCard component and before the main render

// ============================================
// LIVE CHAT ROOM COMPONENT
// ============================================

const LiveChatRoom = () => {
const [message, setMessage] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [typingUsers, setTypingUsers] = useState([]);
const chatEndRef = useRef(null);
const [isMuted, setIsMuted] = useState(false);

// Auto-scroll to bottom when new messages arrive
useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chatMessages]);

// Update presence (mark as active)
useEffect(() => {
if (!currentUser || !selectedGroup) return;

const updatePresence = async () => {
try {
const presenceRef = doc(
db,
'support_groups',
selectedGroup.id,
'active_peers',
currentUser.uid
);

await updateDoc(presenceRef, {
lastActive: serverTimestamp(),
inLiveChat: showLiveChat,
availableForSupport: true
}).catch(async () => {
// If doc doesn't exist, create it
await addDoc(
collection(db, 'support_groups', selectedGroup.id, 'active_peers'),
{
userId: currentUser.uid,
lastActive: serverTimestamp(),
inLiveChat: showLiveChat,
availableForSupport: true
}
);
});
} catch (error) {
console.error('Error updating presence:', error);
}
};

updatePresence();
const interval = setInterval(updatePresence, 30000); // Update every 30 seconds

return () => clearInterval(interval);
}, [currentUser, selectedGroup, showLiveChat]);

const handleSendMessage = async (e) => {
e.preventDefault();
if (!message.trim() || !currentUser || !selectedGroup) return;

await handleSendChatMessage(message);
setMessage('');
setIsTyping(false);
};

const handleTyping = (e) => {
setMessage(e.target.value);

// Update typing status
if (!isTyping && e.target.value.length > 0) {
setIsTyping(true);
// TODO: Send typing indicator to Firebase
} else if (isTyping && e.target.value.length === 0) {
setIsTyping(false);
}
};

if (!showLiveChat) return null;

return (
<div className="fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-purple-900 to-indigo-900
rounded-2xl border-2 border-purple-500/50 shadow-2xl flex flex-col z-50">

{/* Header */}
<div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="relative">
<Radio className="w-6 h-6 text-green-400" />
<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
</div>
<div>
<h3 className="font-bold text-white">Live Chat</h3>
<p className="text-purple-400 text-xs">
{activePeers.filter(p => p.inLiveChat).length} active
</p>
</div>
</div>

<div className="flex items-center gap-2">
<button
onClick={() => setIsMuted(!isMuted)}
className="p-2 hover:bg-purple-800/50 rounded-lg transition-all"
>
{isMuted ? (
<VolumeX className="w-5 h-5 text-purple-400" />
) : (
<Volume2 className="w-5 h-5 text-purple-400" />
)}
</button>
<button
onClick={() => setShowLiveChat(false)}
className="p-2 hover:bg-purple-800/50 rounded-lg transition-all"
>
<X className="w-5 h-5 text-purple-400" />
</button>
</div>
</div>

{/* Active Peers Indicator */}
<div className="px-4 py-2 bg-purple-950/50 border-b border-purple-500/30">
<div className="flex items-center gap-2 overflow-x-auto">
{activePeers.filter(p => p.inLiveChat).slice(0, 10).map((peer, idx) => (
<div
key={peer.id}
className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600
flex items-center justify-center text-sm border-2 border-green-500/50"
title={`Active peer ${idx + 1}`}
>
👤
</div>
))}
{activePeers.filter(p => p.inLiveChat).length > 10 && (
<span className="text-purple-400 text-xs flex-shrink-0">
+{activePeers.filter(p => p.inLiveChat).length - 10} more
</span>
)}
</div>
</div>

{/* Messages */}
<div className="flex-1 overflow-y-auto p-4 space-y-3">
{chatMessages.length === 0 ? (
<div className="text-center py-12">
<MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
<p className="text-purple-300 text-sm">
No messages yet. Start the conversation!
</p>
</div>
) : (
chatMessages.map((msg) => {
const isOwnMessage = msg.userId === currentUser?.uid;

return (
<div
key={msg.id}
className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
>
<div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
<div className={`p-3 rounded-2xl ${
isOwnMessage
? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
: 'bg-purple-950/50 border border-purple-500/30 text-purple-100 rounded-tl-none'
}`}>
<p className="text-sm break-words">{msg.message}</p>
</div>
<p className="text-purple-400 text-xs mt-1 px-2">
{msg.timestamp?.toDate ?
new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
: 'Just now'
}
</p>
</div>
</div>
);
})
)}
<div ref={chatEndRef} />
</div>

{/* Typing Indicators */}
{typingUsers.length > 0 && (
<div className="px-4 py-2 text-purple-400 text-xs italic">
{typingUsers.length === 1
? 'Someone is typing...'
: `${typingUsers.length} people are typing...`
}
</div>
)}

{/* Input */}
<form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/30">
<div className="flex gap-2">
<input
type="text"
value={message}
onChange={handleTyping}
placeholder="Type a supportive message..."
className="flex-1 px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white placeholder-purple-400 focus:border-purple-400
focus:outline-none text-sm"
/>
<button
type="submit"
disabled={!message.trim()}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all
disabled:opacity-50 disabled:cursor-not-allowed"
>
Send
</button>
</div>

<p className="text-purple-400 text-xs mt-2">
💜 Be kind and supportive. Remember our community guidelines.
</p>
</form>
</div>
);
};

// ============================================
// QUIET COMPANY ROOM COMPONENT
// ============================================

const QuietCompanyRoom = () => {
const [isInRoom, setIsInRoom] = useState(false);
const [roomCount, setRoomCount] = useState(0);

useEffect(() => {
if (!selectedGroup) return;

const q = query(
collection(db, 'support_groups', selectedGroup.id, 'quiet_room'),
where('lastActive', '>', Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)))
);

const unsubscribe = onSnapshot(q, (snapshot) => {
setRoomCount(snapshot.docs.length);
setQuietRoomPeers(snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
})));
});

return () => unsubscribe();
}, [selectedGroup]);

const handleJoinRoom = async () => {
if (!currentUser || !selectedGroup) return;

try {
await addDoc(
collection(db, 'support_groups', selectedGroup.id, 'quiet_room'),
{
userId: currentUser.uid,
joinedAt: serverTimestamp(),
lastActive: serverTimestamp()
}
);

setIsInRoom(true);

// Update presence every 30 seconds
const interval = setInterval(async () => {
const q = query(
collection(db, 'support_groups', selectedGroup.id, 'quiet_room'),
where('userId', '==', currentUser.uid)
);
const snapshot = await getDocs(q);

if (!snapshot.empty) {
await updateDoc(snapshot.docs[0].ref, {
lastActive: serverTimestamp()
});
}
}, 30000);

return () => clearInterval(interval);

} catch (error) {
console.error('Error joining quiet room:', error);
}
};

const handleLeaveRoom = async () => {
if (!currentUser || !selectedGroup) return;

try {
const q = query(
collection(db, 'support_groups', selectedGroup.id, 'quiet_room'),
where('userId', '==', currentUser.uid)
);
const snapshot = await getDocs(q);

snapshot.docs.forEach(doc => doc.ref.delete());
setIsInRoom(false);

} catch (error) {
console.error('Error leaving quiet room:', error);
}
};

if (!showQuietRoom) return null;

return (
<div className="fixed bottom-4 left-4 w-80 bg-gradient-to-br from-indigo-950 to-purple-950
rounded-2xl border-2 border-indigo-500/50 shadow-2xl p-6 z-50">

{/* Header */}
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<div className="text-3xl">🤫</div>
<div>
<h3 className="font-bold text-white">Quiet Company</h3>
<p className="text-indigo-400 text-xs">
{roomCount} people here
</p>
</div>
</div>
<button
onClick={() => setShowQuietRoom(false)}
className="p-2 hover:bg-indigo-800/50 rounded-lg transition-all"
>
<X className="w-5 h-5 text-indigo-400" />
</button>
</div>

{/* Description */}
<div className="mb-4 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl">
<p className="text-indigo-200 text-sm">
A silent space to not be alone. No chat, no pressure to interact.
Just quiet presence with others who understand.
</p>
</div>

{/* People Indicators */}
<div className="mb-4">
<p className="text-indigo-400 text-xs mb-3 uppercase tracking-wide font-semibold">
People Here:
</p>
<div className="grid grid-cols-6 gap-2">
{quietRoomPeers.map((peer, idx) => (
<div
key={peer.id}
className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600
flex items-center justify-center border-2 border-indigo-400/50 animate-pulse"
style={{ animationDelay: `${idx * 200}ms` }}
>
<div className="w-2 h-2 bg-green-400 rounded-full"></div>
</div>
))}
{Array.from({ length: Math.max(0, 6 - quietRoomPeers.length) }).map((_, idx) => (
<div
key={`empty-${idx}`}
className="w-10 h-10 rounded-full border-2 border-indigo-700/30 border-dashed"
/>
))}
</div>
</div>

{/* Join/Leave Button */}
{!isInRoom ? (
<button
onClick={handleJoinRoom}
className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all"
>
Join Room
</button>
) : (
<div>
<div className="mb-3 p-3 bg-green-900/20 border border-green-500/50 rounded-xl text-center">
<p className="text-green-300 text-sm font-semibold">
✓ You're in the room
</p>
<p className="text-green-400 text-xs mt-1">
Others can see your quiet presence
</p>
</div>
<button
onClick={handleLeaveRoom}
className="w-full px-6 py-3 bg-red-600/20 border-2 border-red-500/50
hover:bg-red-600/30 rounded-xl font-bold transition-all text-red-300"
>
Leave Room
</button>
</div>
)}

{/* Tips */}
<div className="mt-4 p-3 bg-indigo-950/50 rounded-lg border border-indigo-500/20">
<p className="text-indigo-300 text-xs">
💡 <span className="font-semibold">Tip:</span> Keep this open while studying,
working, or just existing. You're not alone.
</p>
</div>
</div>
);
};

// ============================================
// RESPONSE/COMMENT SYSTEM
// ============================================

const PostResponses = ({ post }) => {
const [responses, setResponses] = useState([]);
const [showResponses, setShowResponses] = useState(false);
const [newResponse, setNewResponse] = useState('');
const [responseAnonymity, setResponseAnonymity] = useState('group-anonymous');
const [loadingResponses, setLoadingResponses] = useState(false);

// Load responses
useEffect(() => {
if (!showResponses || !post.id) return;

const loadResponses = async () => {
setLoadingResponses(true);

try {
const q = query(
collection(db, 'support_posts', post.id, 'responses'),
orderBy('createdAt', 'asc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
const loadedResponses = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
setResponses(loadedResponses);
setLoadingResponses(false);
});

return unsubscribe;

} catch (error) {
console.error('Error loading responses:', error);
setLoadingResponses(false);
}
};

loadResponses();
}, [showResponses, post.id]);

const handleSubmitResponse = async (e) => {
e.preventDefault();
if (!newResponse.trim() || !currentUser) return;

try {
const anonymitySettings = ANONYMITY_LEVELS.find(l => l.id === responseAnonymity);

let authorData = {
userId: currentUser.uid,
anonymityLevel: responseAnonymity
};

if (anonymitySettings.showsName) {
const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', currentUser.uid)));
if (!userDoc.empty) {
const userData = userDoc.docs[0].data();

if (anonymitySettings.showsName === 'first') {
authorData.name = userData.name?.split(' ')[0] || 'Anonymous';
} else {
authorData.name = userData.name;
}

if (anonymitySettings.showsAvatar) {
authorData.avatar = userData.avatar;
}
}
} else {
authorData.name = 'Anonymous';
authorData.avatar = '👤';
}

await addDoc(collection(db, 'support_posts', post.id, 'responses'), {
author: authorData,
content: newResponse.trim(),
createdAt: serverTimestamp(),
reactions: { helpful: 0, iUnderstand: 0 }
});

// Update post response count
const postRef = doc(db, 'support_posts', post.id);
await updateDoc(postRef, {
responseCount: (post.responseCount || 0) + 1
});

setNewResponse('');

} catch (error) {
console.error('Error submitting response:', error);
alert('Failed to submit response. Please try again.');
}
};

return (
<div className="mt-4 pt-4 border-t border-purple-500/30">
{/* Response Toggle */}
<button
onClick={() => setShowResponses(!showResponses)}
className="flex items-center gap-2 text-purple-300 hover:text-white transition-all"
>
<MessageSquare className="w-4 h-4" />
<span className="text-sm font-semibold">
{post.responseCount || 0} {post.responseCount === 1 ? 'Response' : 'Responses'}
</span>
</button>

{/* Responses List */}
{showResponses && (
<div className="mt-4 space-y-3">
{loadingResponses ? (
<div className="text-center py-6">
<div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent
rounded-full mx-auto mb-2"></div>
<p className="text-purple-400 text-sm">Loading responses...</p>
</div>
) : responses.length === 0 ? (
<p className="text-purple-400 text-sm text-center py-4">
No responses yet. Be the first to respond!
</p>
) : (
responses.map((response) => (
<div
key={response.id}
className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20"
>
<div className="flex items-start gap-3 mb-2">
<div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-sm">
{response.author?.avatar || '👤'}
</div>
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="text-white font-semibold text-sm">
{response.author?.name || 'Anonymous'}
</span>
<span className="text-purple-400 text-xs">
{response.createdAt?.toDate ?
new Date(response.createdAt.toDate()).toLocaleString()
: 'Just now'
}
</span>
</div>
<p className="text-purple-200 text-sm">
{response.content}
</p>
</div>
</div>

{/* Response Reactions */}
<div className="flex items-center gap-3 ml-11">
<button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs">
<ThumbsUp className="w-3 h-3" />
<span>{response.reactions?.helpful || 0}</span>
</button>
<button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs">
<Heart className="w-3 h-3" />
<span>{response.reactions?.iUnderstand || 0}</span>
</button>
</div>
</div>
))
)}

{/* Response Input */}
{post.adviceWanted !== false && (
<form onSubmit={handleSubmitResponse} className="mt-4">
<div className="mb-3">
<textarea
value={newResponse}
onChange={(e) => setNewResponse(e.target.value)}
placeholder={
post.adviceWanted
? "Share support, advice, or encouragement..."
: "Share validation and understanding (no advice unless asked)..."
}
rows={3}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white placeholder-purple-400 focus:border-purple-400
focus:outline-none resize-none text-sm"
/>
</div>

{/* Anonymity Quick Select */}
<div className="flex items-center gap-2 mb-3">
<span className="text-purple-400 text-xs">Respond as:</span>
<select
value={responseAnonymity}
onChange={(e) => setResponseAnonymity(e.target.value)}
className="px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded-lg
text-white text-xs focus:outline-none"
>
{ANONYMITY_LEVELS.map((level) => (
<option key={level.id} value={level.id}>
{level.icon} {level.name}
</option>
))}
</select>
</div>

<button
type="submit"
disabled={!newResponse.trim()}
className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all
disabled:opacity-50 disabled:cursor-not-allowed text-sm"
>
Respond
</button>
</form>
)}

{post.adviceWanted === false && (
<div className="p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
<p className="text-green-300 text-xs flex items-center gap-2">
<Shield className="w-4 h-4" />
This post is in "Just Listening" mode. Focus on validation and understanding.
</p>
</div>
)}
</div>
)}
</div>
);
};

// ============================================
// UPDATE POST CARD TO INCLUDE RESPONSES
// ============================================

// Replace your existing PostCard component with this updated version:

const PostCard = ({ post }) => {
const isCollapsed = collapsedPosts.has(post.id);
const hasContentWarnings = post.contentWarnings && post.contentWarnings.length > 0;

return (
<div className="p-6 bg-purple-950/30 rounded-xl border-2 border-purple-500/30 hover:border-purple-400/50 transition-all">
{/* Author Info */}
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl">
{post.author?.avatar || '👤'}
</div>
<div>
<p className="text-white font-semibold">
{post.author?.name || 'Anonymous'}
</p>
<p className="text-purple-400 text-xs">
{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : 'Just now'}
</p>
</div>
</div>

{/* Template Badge */}
<div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
bg-gradient-to-r ${post.template?.color || 'from-purple-600 to-pink-600'}/20
border border-purple-500/50`}
>
<span>{post.template?.icon}</span>
<span className="text-purple-200">{post.template?.title}</span>
</div>
</div>

{/* Content Warnings */}
{hasContentWarnings && (
<div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<AlertCircle className="w-4 h-4 text-yellow-400" />
<span className="text-yellow-200 text-sm font-semibold">
Content Warning:
</span>
<div className="flex gap-2">
{post.contentWarnings.map((cwId) => {
const tag = CONTENT_WARNING_TAGS.find(t => t.id === cwId);
return tag ? (
<span key={cwId} className="text-yellow-300 text-xs">
{tag.label}
</span>
) : null;
})}
</div>
</div>
<button
onClick={() => togglePostCollapse(post.id)}
className="text-yellow-300 hover:text-yellow-100 text-sm font-semibold flex items-center gap-1"
>
{isCollapsed ? (
<>
<Eye className="w-4 h-4" />
Show
</>
) : (
<>
<EyeOff className="w-4 h-4" />
Hide
</>
)}
</button>
</div>
</div>
)}

{/* Post Content */}
{(!hasContentWarnings || !isCollapsed) && (
<>
<div className="space-y-3 mb-4">
{Object.entries(post.content || {}).map(([key, value]) => {
const field = post.template?.fields.find(f => f.name === key);
if (!field || !value) return null;

return (
<div key={key}>
<p className="text-purple-400 text-sm font-semibold mb-1">
{field.label}
</p>
<p className="text-white">
{value}
</p>
</div>
);
})}
</div>

{/* Advice Mode Badge */}
{post.adviceWanted !== undefined && (
<div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4
${post.adviceWanted
? 'bg-blue-600/20 border border-blue-500/50 text-blue-200'
: 'bg-green-600/20 border border-green-500/50 text-green-200'
}`}
>
{post.adviceWanted ? '💡 Open to advice' : '👂 Just listening'}
</div>
)}

{/* Reactions */}
<div className="flex items-center gap-4 pt-4 border-t border-purple-500/30">
<button
onClick={() => handleReactToPost(post.id, 'meToo')}
className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40
rounded-lg transition-all group"
>
<Heart className="w-4 h-4 text-purple-400 group-hover:text-pink-400" />
<span className="text-purple-300 text-sm">
{post.reactions?.meToo || 0}
</span>
<span className="text-purple-400 text-xs">Me Too</span>
</button>

<button
onClick={() => handleReactToPost(post.id, 'iUnderstand')}
className="flex items-center gap-2 px-3 py-2bg-purple-900/30 hover:bg-purple-800/40 rounded-lg transition-all group" > <MessageCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-300" /> <span className="text-blue-300 text-sm"> {post.reactions?.iUnderstand || 0} </span> <span className="text-blue-400 text-xs">I Understand</span> </button>

 
<button
onClick={() => handleReactToPost(post.id, 'thisHelped')}
className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40
rounded-lg transition-all group"
>
<ThumbsUp className="w-4 h-4 text-green-400 group-hover:text-green-300" />
<span className="text-green-300 text-sm">
{post.reactions?.thisHelped || 0}
</span>
<span className="text-green-400 text-xs">This Helped</span>
</button>

<button
onClick={() => handleReactToPost(post.id, 'saved')}
className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 hover:bg-purple-800/40
rounded-lg transition-all group ml-auto"
>
<Bookmark className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
<span className="text-yellow-300 text-sm">
{post.reactions?.saved || 0}
</span>
</button>
</div>

{/* ADD RESPONSES SECTION */}
<PostResponses post={post} />
</>
)}
</div>
); };

 

// ============================================
// UPDATE MAIN RENDER - ADD REAL-TIME COMPONENTS
// ============================================

// Add these buttons in the Group Detail View header (where you have "New Post" and "Live Chat")
// Replace the existing header buttons section with this:

<div className="flex gap-3">
<button
onClick={() => setShowPostModal(true)}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all
flex items-center gap-2"
>
<MessageCircle className="w-5 h-5" />
New Post
</button>

<button
onClick={() => setShowLiveChat(!showLiveChat)}
className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
${showLiveChat
? 'bg-green-600/30 border-2 border-green-500/50 text-green-200'
: 'bg-green-600/20 border-2 border-green-500/50 hover:bg-green-600/30 text-green-300'
}`}
>
<Radio className="w-5 h-5" />
Live Chat
{activePeers.filter(p => p.inLiveChat).length > 0 && (
<span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
{activePeers.filter(p => p.inLiveChat).length}
</span>
)}
</button>

<button
onClick={() => setShowQuietRoom(!showQuietRoom)}
className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
${showQuietRoom
? 'bg-indigo-600/30 border-2 border-indigo-500/50 text-indigo-200'
: 'bg-indigo-600/20 border-2 border-indigo-500/50 hover:bg-indigo-600/30 text-indigo-300'
}`}
>
<span className="text-xl">🤫</span>
Quiet Room
{roomCount > 0 && (
<span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
{roomCount}
</span>
)}
</button>
</div>

// And add these components at the end of your main return, just before the closing </div>:

{/* Live Chat Room */}
<LiveChatRoom />

{/* Quiet Company Room */}
<QuietCompanyRoom />

// OptimizedSupport.tsx - PART 5: ADVANCED FEATURES

// ============================================
// SAFE PEOPLE LIST & PEER CONNECTIONS
// ============================================

const SafePeopleManager = () => {
const [showManager, setShowManager] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [suggestedPeers, setSuggestedPeers] = useState([]);
const [loadingSuggestions, setLoadingSuggestions] = useState(false);

// Load suggested peers (people who've been helpful)
useEffect(() => {
if (!showManager || !selectedGroup) return;

const loadSuggestions = async () => {
setLoadingSuggestions(true);

try {
// Find users with helpful responses in this group
const postsSnapshot = await getDocs(
query(
collection(db, 'support_posts'),
where('groupId', '==', selectedGroup.id),
orderBy('createdAt', 'desc'),
limit(50)
)
);

const helpfulUsers = new Map();

for (const postDoc of postsSnapshot.docs) {
const responsesSnapshot = await getDocs(
query(
collection(db, 'support_posts', postDoc.id, 'responses'),
orderBy('reactions.helpful', 'desc'),
limit(10)
)
);

responsesSnapshot.docs.forEach(responseDoc => {
const response = responseDoc.data();
if (response.author?.userId && response.author.userId !== currentUser?.uid) {
const userId = response.author.userId;
const current = helpfulUsers.get(userId) || {
count: 0,
helpful: 0,
author: response.author
};
current.count++;
current.helpful += (response.reactions?.helpful || 0);
helpfulUsers.set(userId, current);
}
});
}

// Sort by helpfulness
const sorted = Array.from(helpfulUsers.entries())
.sort((a, b) => b[1].helpful - a[1].helpful)
.slice(0, 10)
.map(([userId, data]) => ({
userId,
...data.author,
helpfulCount: data.helpful,
responseCount: data.count
}));

setSuggestedPeers(sorted);
setLoadingSuggestions(false);

} catch (error) {
console.error('Error loading suggestions:', error);
setLoadingSuggestions(false);
}
};

loadSuggestions();
}, [showManager, selectedGroup, currentUser]);

const handleRemoveSafePerson = async (personId) => {
if (!currentUser) return;

try {
const q = query(
collection(db, 'users', currentUser.uid, 'safe_people'),
where('userId', '==', personId)
);
const snapshot = await getDocs(q);
snapshot.docs.forEach(doc => doc.ref.delete());

setSafePeople(safePeople.filter(p => p.userId !== personId));

} catch (error) {
console.error('Error removing safe person:', error);
}
};

if (!showSafePeopleModal) return null;

return (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
<div className="p-8">
{/* Header */}
<div className="flex items-center justify-between mb-6">
<div>
<h2 className="text-2xl font-bold text-white mb-2">
💜 Safe People List
</h2>
<p className="text-purple-300 text-sm">
People whose support feels safe and helpful to you
</p>
</div>
<button
onClick={() => setShowSafePeopleModal(false)}
className="text-purple-300 hover:text-white transition-colors"
>
<X className="w-6 h-6" />
</button>
</div>

{/* Your Safe People */}
<div className="mb-8">
<h3 className="font-bold text-white mb-4 flex items-center gap-2">
<Shield className="w-5 h-5 text-green-400" />
Your Safe People ({safePeople.length})
</h3>

{safePeople.length === 0 ? (
<div className="p-6 bg-purple-950/30 rounded-xl border border-purple-500/30 text-center">
<Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
<p className="text-purple-300 text-sm">
No safe people added yet. Add people whose responses feel helpful and validating.
</p>
</div>
) : (
<div className="space-y-3">
{safePeople.map((person) => (
<div
key={person.userId}
className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/30
flex items-center justify-between"
>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
{person.avatar || '👤'}
</div>
<div>
<p className="text-white font-semibold">
{person.name || 'Anonymous'}
</p>
<p className="text-purple-400 text-xs">
Added {person.addedAt?.toDate ?
new Date(person.addedAt.toDate()).toLocaleDateString() : 'recently'}
</p>
</div>
</div>
<button
onClick={() => handleRemoveSafePerson(person.userId)}
className="px-4 py-2 bg-red-600/20 border border-red-500/50
hover:bg-red-600/30 rounded-lg text-red-300 text-sm font-semibold transition-all"
>
Remove
</button>
</div>
))}
</div>
)}
</div>

{/* Suggested People */}
<div>
<h3 className="font-bold text-white mb-4 flex items-center gap-2">
<ThumbsUp className="w-5 h-5 text-blue-400" />
Suggested People to Add
</h3>

{loadingSuggestions ? (
<div className="text-center py-6">
<div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent
rounded-full mx-auto mb-2"></div>
<p className="text-purple-400 text-sm">Finding helpful peers...</p>
</div>
) : suggestedPeers.length === 0 ? (
<div className="p-6 bg-purple-950/30 rounded-xl border border-purple-500/30 text-center">
<p className="text-purple-300 text-sm">
No suggestions yet. Interact more in the group to find helpful peers.
</p>
</div>
) : (
<div className="space-y-3">
{suggestedPeers.map((peer) => {
const isAlreadyAdded = safePeople.some(p => p.userId === peer.userId);

return (
<div
key={peer.userId}
className="p-4 bg-purple-950/30 rounded-xl border border-purple-500/30
flex items-center justify-between"
>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600
flex items-center justify-center">
{peer.avatar || '👤'}
</div>
<div>
<p className="text-white font-semibold">
{peer.name || 'Anonymous'}
</p>
<div className="flex items-center gap-3 text-xs">
<span className="text-green-400">
{peer.helpfulCount} helpful reactions
</span>
<span className="text-purple-400">
{peer.responseCount} responses
</span>
</div>
</div>
</div>
{isAlreadyAdded ? (
<div className="px-4 py-2 bg-green-600/20 border border-green-500/50
rounded-lg text-green-300 text-sm font-semibold">
✓ Added
</div>
) : (
<button
onClick={() => handleAddSafePerson(peer.userId, {
name: peer.name,
avatar: peer.avatar
})}
className="px-4 py-2 bg-purple-600 hover:bg-purple-500
rounded-lg text-white text-sm font-semibold transition-all"
>
Add
</button>
)}
</div>
);
})}
</div>
)}
</div>
</div>
</div>
</div>
);
};

// ============================================
// ACCOUNTABILITY BUDDY MATCHER
// ============================================

const AccountabilityBuddyMatcher = () => {
const [showMatcher, setShowMatcher] = useState(false);
const [buddyPreferences, setBuddyPreferences] = useState({
struggles: [],
checkInFrequency: 'daily',
timezone: '',
goals: ''
});
const [matches, setMatches] = useState([]);
const [currentBuddy, setCurrentBuddy] = useState(null);

// Load current buddy
useEffect(() => {
if (!currentUser) return;

const loadBuddy = async () => {
try {
const q = query(
collection(db, 'users', currentUser.uid, 'accountability_buddy'),
limit(1)
);
const snapshot = await getDocs(q);

if (!snapshot.empty) {
setCurrentBuddy({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
}
} catch (error) {
console.error('Error loading buddy:', error);
}
};

loadBuddy();
}, [currentUser]);

const handleFindBuddy = async () => {
// TODO: Implement matching algorithm
alert('Buddy matching coming soon! This will match you with someone with similar struggles and goals.');
};

return (
<div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border-2 border-indigo-500/50">
<div className="flex items-center gap-3 mb-4">
<Users className="w-6 h-6 text-indigo-400" />
<div>
<h3 className="font-bold text-white text-lg">Accountability Buddy</h3>
<p className="text-indigo-300 text-sm">
Get matched with someone for daily check-ins
</p>
</div>
</div>

{currentBuddy ? (
<div className="p-4 bg-indigo-950/50 rounded-xl border border-indigo-500/30">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
{currentBuddy.avatar || '👤'}
</div>
<div>
<p className="text-white font-semibold">{currentBuddy.name || 'Your Buddy'}</p>
<p className="text-indigo-400 text-xs">
Check-ins: {currentBuddy.checkInFrequency || 'daily'}
</p>
</div>
</div>
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-semibold">
Message
</button>
</div>
<button className="text-red-400 hover:text-red-300 text-sm">
End buddy relationship
</button>
</div>
) : (
<button
onClick={handleFindBuddy}
className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600
hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold transition-all"
>
Find an Accountability Buddy
</button>
)}
</div>
);
};

// ============================================
// SEARCH & FILTER SYSTEM
// ============================================

const SearchAndFilter = () => {
const [showFilters, setShowFilters] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState({
templates: [],
dateRange: 'all', // 'today', 'week', 'month', 'all'
hasResponses: false,
savedOnly: false,
hideRead: false
});

return (
<div className="mb-6">
{/* Search Bar */}
<div className="flex gap-3 mb-4">
<div className="flex-1 relative">
<input
type="text"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
placeholder="Search posts by content, struggles, or keywords..."
className="w-full px-5 py-3 pl-12 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white placeholder-purple-400 focus:border-purple-400
focus:outline-none"
/>
<MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
</div>

<button
onClick={() => setShowFilters(!showFilters)}
className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
${showFilters
? 'bg-purple-600 text-white'
: 'bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 hover:border-purple-400'
}`}
>
<Flag className="w-5 h-5" />
Filters
</button>
</div>

{/* Filter Panel */}
{showFilters && (
<div className="p-6 bg-purple-950/30 rounded-xl border-2 border-purple-500/30 space-y-4">
{/* Template Filter */}
<div>
<label className="block text-white font-semibold mb-3">Post Type:</label>
<div className="flex flex-wrap gap-2">
{SUPPORT_POST_TEMPLATES.map((template) => {
const isSelected = filters.templates.includes(template.type);
return (
<button
key={template.type}
onClick={() => {
setFilters({
...filters,
templates: isSelected
? filters.templates.filter(t => t !== template.type)
: [...filters.templates, template.type]
});
}}
className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2
${isSelected
? `bg-gradient-to-r ${template.color}/30 border-2 border-purple-400 text-white`
: 'bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:border-purple-400'
}`}
>
<span>{template.icon}</span>
{template.title}
</button>
);
})}
</div>
</div>

{/* Date Range */}
<div>
<label className="block text-white font-semibold mb-3">Time Period:</label>
<div className="flex gap-2">
{[
{ value: 'today', label: 'Today' },
{ value: 'week', label: 'This Week' },
{ value: 'month', label: 'This Month' },
{ value: 'all', label: 'All Time' }
].map((option) => (
<button
key={option.value}
onClick={() => setFilters({ ...filters, dateRange: option.value })}
className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
${filters.dateRange === option.value
? 'bg-purple-600 text-white'
: 'bg-purple-900/30 text-purple-300 hover:bg-purple-800/40'
}`}
>
{option.label}
</button>
))}
</div>
</div>

{/* Toggle Filters */}
<div className="space-y-2">
<label className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg cursor-pointer">
<span className="text-white">Only show posts with responses</span>
<input
type="checkbox"
checked={filters.hasResponses}
onChange={(e) => setFilters({ ...filters, hasResponses: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>

<label className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg cursor-pointer">
<span className="text-white">Only show saved posts</span>
<input
type="checkbox"
checked={filters.savedOnly}
onChange={(e) => setFilters({ ...filters, savedOnly: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>

<label className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg cursor-pointer">
<span className="text-white">Hide posts I've read</span>
<input
type="checkbox"
checked={filters.hideRead}
onChange={(e) => setFilters({ ...filters, hideRead: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>
</div>

{/* Clear Filters */}
<button
onClick={() => {
setFilters({
templates: [],
dateRange: 'all',
hasResponses: false,
savedOnly: false,
hideRead: false
});
setSearchTerm('');
}}
className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold transition-all"
>
Clear All Filters
</button>
</div>
)}
</div>
);
};

// ============================================
// NOTIFICATION CENTER
// ============================================

const NotificationCenter = () => {
const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

// Load notifications
useEffect(() => {
if (!currentUser) return;

const q = query(
collection(db, 'users', currentUser.uid, 'notifications'),
orderBy('createdAt', 'desc'),
limit(50)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
const notifs = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

setNotifications(notifs);
setUnreadCount(notifs.filter(n => !n.read).length);
});

return () => unsubscribe();
}, [currentUser]);

const handleMarkAsRead = async (notificationId) => {
if (!currentUser) return;

try {
const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
await updateDoc(notifRef, { read: true });
} catch (error) {
console.error('Error marking notification as read:', error);
}
};

const handleMarkAllRead = async () => {
if (!currentUser) return;

try {
const batch = [];
notifications.filter(n => !n.read).forEach(notif => {
const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notif.id);
batch.push(updateDoc(notifRef, { read: true }));
});

await Promise.all(batch);
} catch (error) {
console.error('Error marking all as read:', error);
}
};

const getNotificationIcon = (type) => {
switch (type) {
case 'panic-alert': return <Zap className="w-5 h-5 text-red-400" />;
case 'new-response': return <MessageCircle className="w-5 h-5 text-blue-400" />;
case 'reaction': return <Heart className="w-5 h-5 text-pink-400" />;
case 'buddy-checkin': return <Users className="w-5 h-5 text-purple-400" />;
default: return <AlertCircle className="w-5 h-5 text-purple-400" />;
}
};

return (
<>
{/* Notification Bell */}
<button
onClick={() => setShowNotifications(!showNotifications)}
className="relative p-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-xl transition-all"
>
<AlertCircle className="w-6 h-6 text-purple-300" />
{unreadCount > 0 && (
<div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full
flex items-center justify-center text-xs font-bold text-white">
{unreadCount > 9 ? '9+' : unreadCount}
</div>
)}
</button>

{/* Notification Panel */}
{showNotifications && (
<div className="fixed top-20 right-4 w-96 max-h-[600px] bg-gradient-to-br from-purple-900 to-indigo-900
rounded-2xl border-2 border-purple-500/50 shadow-2xl z-50 overflow-hidden flex flex-col">

{/* Header */}
<div className="p-4 border-b border-purple-500/30 flex items-center justify-between">
<div>
<h3 className="font-bold text-white">Notifications</h3>
<p className="text-purple-400 text-xs">{unreadCount} unread</p>
</div>
<div className="flex gap-2">
{unreadCount > 0 && (
<button
onClick={handleMarkAllRead}
className="text-purple-300 hover:text-white text-xs font-semibold"
>
Mark all read
</button>
)}
<button
onClick={() => setShowNotifications(false)}
className="p-1 hover:bg-purple-800/50 rounded-lg transition-all"
>
<X className="w-5 h-5 text-purple-400" />
</button>
</div>
</div>

{/* Notifications List */}
<div className="flex-1 overflow-y-auto">
{notifications.length === 0 ? (
<div className="p-8 text-center">
<AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
<p className="text-purple-300">No notifications yet</p>
</div>
) : (
<div className="divide-y divide-purple-500/20">
{notifications.map((notif) => (
<div
key={notif.id}
onClick={() => handleMarkAsRead(notif.id)}
className={`p-4 cursor-pointer transition-all
${notif.read
? 'bg-purple-950/20 hover:bg-purple-900/30'
: 'bg-purple-600/20 hover:bg-purple-600/30'
}`}
>
<div className="flex gap-3">
<div className="flex-shrink-0 mt-1">
{getNotificationIcon(notif.type)}
</div>
<div className="flex-1">
<p className={`text-sm mb-1 ${notif.read ? 'text-purple-300' : 'text-white font-semibold'}`}>
{notif.message}
</p>
<p className="text-purple-400 text-xs">
{notif.createdAt?.toDate ?
new Date(notif.createdAt.toDate()).toLocaleString() : 'Just now'}
</p>
</div>
{!notif.read && (
<div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
)}
</div>
</div>
))}
</div>
)}
</div>
</div>
)}
</>
);
};

// ============================================
// USER SETTINGS PANEL
// ============================================

const UserSettingsPanel = () => {
const [showSettings, setShowSettings] = useState(false);
const [settings, setSettings] = useState({
defaultAnonymity: 'group-anonymous',
hiddenContentWarnings: [],
emailNotifications: true,
panicAlertSound: true,
autoMarkRead: false,
theme: 'dark'
});

// Load settings
useEffect(() => {
if (!currentUser) return;

const loadSettings = async () => {
try {
const q = query(
collection(db, 'users', currentUser.uid, 'preferences'),
limit(1)
);
const snapshot = await getDocs(q);

if (!snapshot.empty) {
setSettings({ ...settings, ...snapshot.docs[0].data() });
}
} catch (error) {
console.error('Error loading settings:', error);
}
};

loadSettings();
}, [currentUser]);

const handleSaveSettings = async () => {
if (!currentUser) return;

try {
const q = query(
collection(db, 'users', currentUser.uid, 'preferences'),
limit(1)
);
const snapshot = await getDocs(q);

if (snapshot.empty) {
await addDoc(collection(db, 'users', currentUser.uid, 'preferences'), settings);
} else {
await updateDoc(snapshot.docs[0].ref, settings);
}

alert('Settings saved!');
setShowSettings(false);

} catch (error) {
console.error('Error saving settings:', error);
alert('Failed to save settings');
}
};

if (!showSettings) return null;

return (
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
<div className="p-8">
{/* Header */}
<div className="flex items-center justify-between mb-6">
<h2 className="text-2xl font-bold text-white">⚙️ Settings</h2>
<button
onClick={() => setShowSettings(false)}
className="text-purple-300 hover:text-white transition-colors"
>
<X className="w-6 h-6" />
</button>
</div>

{/* Default Anonymity */}
<div className="mb-6">
<label className="block text-white font-semibold mb-3">
Default Anonymity Level:
</label>
<select
value={settings.defaultAnonymity}
onChange={(e) => setSettings({ ...settings, defaultAnonymity: e.target.value })}
className="w-full px-4 py-3 bg-purple-950/50 border-2 border-purple-500/30
rounded-xl text-white focus:border-purple-400 focus:outline-none"
>
{ANONYMITY_LEVELS.map((level) => (
<option key={level.id} value={level.id}>
{level.icon} {level.name}
</option>
))}
</select>
</div>

{/* Content Warning Preferences */}
<div className="mb-6">
<label className="block text-white font-semibold mb-3">
Hide Content Warnings:
</label>
<div className="flex flex-wrap gap-2">
{CONTENT_WARNING_TAGS.map((tag) => {
const isHidden = settings.hiddenContentWarnings.includes(tag.id);
return (
<button
key={tag.id}
onClick={() => {
 // ============================================
// CONTINUATION OF USER SETTINGS PANEL
// ============================================

// Continue from where ContentWarnings left off:

setSettings({
...settings,
hiddenContentWarnings: isHidden
? settings.hiddenContentWarnings.filter(cw => cw !== tag.id)
: [...settings.hiddenContentWarnings, tag.id]
});
}}
className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
${isHidden
? 'bg-gray-700 border-2 border-gray-600 text-gray-400'
: `bg-${tag.color}-600/30 border-2 border-${tag.color}-500/50 text-${tag.color}-200`
}`}
>
{isHidden ? <EyeOff className="w-4 h-4 inline mr-1" /> : <Eye className="w-4 h-4 inline mr-1" />}
{tag.label}
</button>
);
})}
</div>
<p className="text-purple-400 text-xs mt-2">
Posts with these warnings will be automatically hidden
</p>
</div>

{/* Toggle Settings */}
<div className="space-y-3 mb-6">
<label className="flex items-center justify-between p-4 bg-purple-950/30 rounded-xl cursor-pointer">
<div>
<p className="text-white font-semibold">Email Notifications</p>
<p className="text-purple-400 text-xs">Receive emails for important updates</p>
</div>
<input
type="checkbox"
checked={settings.emailNotifications}
onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>

<label className="flex items-center justify-between p-4 bg-purple-950/30 rounded-xl cursor-pointer">
<div>
<p className="text-white font-semibold">Panic Alert Sound</p>
<p className="text-purple-400 text-xs">Play sound when someone needs immediate support</p>
</div>
<input
type="checkbox"
checked={settings.panicAlertSound}
onChange={(e) => setSettings({ ...settings, panicAlertSound: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>

<label className="flex items-center justify-between p-4 bg-purple-950/30 rounded-xl cursor-pointer">
<div>
<p className="text-white font-semibold">Auto-mark Posts as Read</p>
<p className="text-purple-400 text-xs">Automatically mark posts when you view them</p>
</div>
<input
type="checkbox"
checked={settings.autoMarkRead}
onChange={(e) => setSettings({ ...settings, autoMarkRead: e.target.checked })}
className="w-5 h-5 accent-purple-600"
/>
</label>
</div>

{/* Save Button */}
<div className="flex gap-3">
<button
onClick={() => setShowSettings(false)}
className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition-all"
>
Cancel
</button>
<button
onClick={handleSaveSettings}
className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
Save Settings
</button>
</div>
</div>
</div>
</div>
);
};

// ============================================
// COMPLETE MAIN RENDER FUNCTION
// ============================================

return (
<div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white">
{/* Crisis Resources Banner (Sticky at top) */}
<div className="sticky top-0 z-40 bg-gradient-to-br from-purple-950/95 via-purple-900/95 to-indigo-950/95 backdrop-blur-lg border-b-2 border-purple-500/30">
<div className="container mx-auto px-4 py-4">
<CrisisResourcesBanner />
</div>
</div>

{/* Main Content Container */}
<div className="container mx-auto px-4 py-8">
{/* Header Section */}
<div className="mb-8">
<div className="flex items-center justify-between mb-4">
<div>
<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
Peer Support Groups
</h1>
<p className="text-purple-300">
Real people who understand. No toxic positivity. No waiting weeks.
</p>
</div>

{/* User Actions */}
<div className="flex items-center gap-3">
{/* Notification Bell */}
<NotificationCenter />

{/* Settings Button */}
<button
onClick={() => setShowSettings(true)}
className="p-3 bg-purple-900/50 hover:bg-purple-800/50 rounded-xl transition-all"
>
<Flag className="w-6 h-6 text-purple-300" />
</button>

{/* Back Button (when in group detail) */}
{activeView === 'group-detail' && (
<button
onClick={() => {
setActiveView('groups');
setSelectedGroup(null);
}}
className="px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold transition-all"
>
← Back to Groups
</button>
)}
</div>
</div>

{/* Key Features Banner (only on groups view) */}
{activeView === 'groups' && (
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">👤</div>
<p className="font-semibold text-white mb-1">Anonymous Options</p>
<p className="text-purple-300 text-sm">Share without revealing identity</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">👂</div>
<p className="font-semibold text-white mb-1">Just Listening Mode</p>
<p className="text-purple-300 text-sm">No unwanted advice</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">🚫</div>
<p className="font-semibold text-white mb-1">No Toxic Positivity</p>
<p className="text-purple-300 text-sm">Real validation for real struggles</p>
</div>
<div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl">
<div className="text-2xl mb-2">💬</div>
<p className="font-semibold text-white mb-1">Live Support</p>
<p className="text-purple-300 text-sm">Chat with peers right now</p>
</div>
</div>
)}
</div>

{/* ============================================ */}
{/* GROUPS LIST VIEW */}
{/* ============================================ */}
{activeView === 'groups' && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{loadingGroups ? (
<div className="col-span-2 text-center py-12">
<div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
<p className="text-purple-300">Loading support groups...</p>
</div>
) : supportGroups.length === 0 ? (
<div className="col-span-2 text-center py-12">
<p className="text-purple-300">No support groups available yet.</p>
</div>
) : (
supportGroups.map(group => (
<SupportGroupCard
key={group.id}
group={group}
isJoined={joinedGroupIds.includes(group.id)}
/>
))
)}
</div>
)}

{/* ============================================ */}
{/* GROUP DETAIL VIEW */}
{/* ============================================ */}
{activeView === 'group-detail' && selectedGroup && (
<div className="space-y-6">
{/* Group Header */}
<div className="p-6 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl border-2 border-purple-500/50">
<div className="flex items-start justify-between mb-4">
<div className="flex items-center gap-4">
<div className="text-5xl">{selectedGroup.icon}</div>
<div>
<h2 className="text-3xl font-bold text-white mb-2">
{selectedGroup.name}
</h2>
<p className="text-purple-300">
{selectedGroup.description}
</p>
</div>
</div>

{/* Action Buttons */}
<div className="flex gap-3">
<button
onClick={() => setShowPostModal(true)}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all
flex items-center gap-2"
>
<MessageCircle className="w-5 h-5" />
New Post
</button>

<button
onClick={() => setShowLiveChat(!showLiveChat)}
className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
${showLiveChat
? 'bg-green-600/30 border-2 border-green-500/50 text-green-200'
: 'bg-green-600/20 border-2 border-green-500/50 hover:bg-green-600/30 text-green-300'
}`}
>
<Radio className="w-5 h-5" />
Live Chat
{activePeers.filter(p => p.inLiveChat).length > 0 && (
<span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
{activePeers.filter(p => p.inLiveChat).length}
</span>
)}
</button>

<button
onClick={() => setShowQuietRoom(!showQuietRoom)}
className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
${showQuietRoom
? 'bg-indigo-600/30 border-2 border-indigo-500/50 text-indigo-200'
: 'bg-indigo-600/20 border-2 border-indigo-500/50 hover:bg-indigo-600/30 text-indigo-300'
}`}
>
<span className="text-xl">🤫</span>
Quiet Room
{quietRoomPeers.length > 0 && (
<span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
{quietRoomPeers.length}
</span>
)}
</button>
</div>
</div>

{/* Stats Bar */}
<div className="flex items-center gap-6 text-sm border-t border-purple-500/30 pt-4 mt-4">
<div className="flex items-center gap-2">
<Users className="w-5 h-5 text-purple-400" />
<span className="text-purple-300">
{selectedGroup.memberCount || 0} members
</span>
</div>
<div className="flex items-center gap-2">
<Radio className="w-5 h-5 text-green-400" />
<span className="text-green-300">
{activePeers.length} active now
</span>
</div>
<div className="flex items-center gap-2">
<MessageCircle className="w-5 h-5 text-blue-400" />
<span className="text-blue-300">
{selectedGroup.postCount || 0} posts
</span>
</div>
</div>
</div>

{/* Panic Button Banner */}
<div className="p-4 bg-red-900/20 border-2 border-red-500/50 rounded-xl">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<Zap className="w-6 h-6 text-red-400" />
<div>
<p className="font-bold text-red-200">
Need support right now?
</p>
<p className="text-red-300 text-sm">
Alert {availablePeers.length} available peers who can help
</p>
</div>
</div>
<button
onClick={handlePanicButton}
disabled={panicAlertActive}
className={`px-6 py-3 rounded-xl font-bold transition-all ${
panicAlertActive
? 'bg-gray-700 text-gray-400 cursor-not-allowed'
: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white'
}`}
>
{panicAlertActive ? '✓ Alert Sent' : '🆘 Send Alert'}
</button>
</div>
</div>

{/* Safe People & Buddy System */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<button
onClick={() => setShowSafePeopleModal(true)}
className="p-5 bg-gradient-to-br from-green-900/30 to-emerald-900/30
border-2 border-green-500/50 rounded-xl hover:border-green-400/70 transition-all text-left"
>
<div className="flex items-center gap-3 mb-2">
<Shield className="w-6 h-6 text-green-400" />
<h3 className="font-bold text-white text-lg">Safe People</h3>
</div>
<p className="text-green-300 text-sm">
{safePeople.length} people whose support feels safe to you
</p>
</button>

<AccountabilityBuddyMatcher />
</div>

{/* Search & Filter */}
<SearchAndFilter />

{/* Filter Controls */}
<div className="flex items-center gap-4 flex-wrap">
<select
value={sortBy}
onChange={(e) => setSortBy(e.target.value)}
className="px-4 py-2 bg-purple-900/50 border-2 border-purple-500/30
rounded-xl text-white focus:border-purple-400 focus:outline-none"
>
<option value="recent">Most Recent</option>
<option value="needs-support">Needs Support First</option>
</select>

<button
onClick={() => setShowOnlyListening(!showOnlyListening)}
className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${
showOnlyListening
? 'bg-green-600/30 border-green-500/50 text-green-200'
: 'bg-purple-900/30 border-purple-500/30 text-purple-300'
}`}
>
👂 Just Listening Only
</button>
</div>

{/* Posts Feed */}
<div className="space-y-4">
{loadingPosts ? (
<div className="text-center py-12">
<div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
<p className="text-purple-300">Loading posts...</p>
</div>
) : posts.length === 0 ? (
<div className="text-center py-12 p-8 bg-purple-900/30 rounded-xl border-2 border-purple-500/30">
<MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
<p className="text-purple-300 mb-4">
No posts yet. Be the first to share!
</p>
<button
onClick={() => setShowPostModal(true)}
className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all"
>
Create First Post
</button>
</div>
) : (
posts.map(post => <PostCard key={post.id} post={post} />)
)}
</div>
</div>
)}
</div>

{/* ============================================ */}
{/* MODALS & FLOATING COMPONENTS */}
{/* ============================================ */}

{/* Post Creation Modal */}
<PostCreationModal />

{/* Guidelines Modal (shown when joining a new group) */}
{selectedGroup && !joinedGroupIds.includes(selectedGroup.id) && activeView === 'group-detail' && (
<SafeSpaceGuidelines
group={selectedGroup}
onAccept={() => handleJoinGroup(selectedGroup.id)}
onClose={() => {
setActiveView('groups');
setSelectedGroup(null);
}}
/>
)}

{/* Safe People Manager Modal */}
<SafePeopleManager />

{/* User Settings Panel */}
<UserSettingsPanel />

{/* Live Chat Room (floating) */}
<LiveChatRoom />

{/* Quiet Company Room (floating) */}
<QuietCompanyRoom />
</div>
);
}; // End of OptimizedSupport component

export default OptimizedSupport;