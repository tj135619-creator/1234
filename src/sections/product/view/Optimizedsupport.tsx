import React, { useState, useEffect } from 'react';
import {
Heart, AlertCircle, Users, MessageCircle, ThumbsUp,
Check, ArrowRight, Lightbulb, Target, Clock,
CheckCircle, Star, Flame, Home, PlusCircle, User,
Bell, Send, Lock, Filter, Mic, PlayCircle,
ChevronRight, Plus, MoreHorizontal, Share2, Bookmark,
Calendar, TrendingUp, Eye, ArrowDown, X, ChevronDown,
Copy, Flag, Edit, Trash2, ExternalLink, Repeat2
} from 'lucide-react';
import CommunityStories from './Communitystories';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import mixpanelService from 'src/services/servicesmixpanel'; // Adjust path based on your structure
import FirebaseService from './friendsService';
import { auth } from './firebaseConfig';

import { initializeNewUser } from './initializeUser';
import { getDatabase, ref, onValue, push, runTransaction } from 'firebase/database';
import { serverTimestamp } from 'firebase/firestore';
import seedSampleData from './seedData';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 

  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  doc,
  updateDoc,
  increment,

} from 'firebase/firestore';

const Optimizedsupport = () => {
// Firebase state
const [firebaseConnected, setFirebaseConnected] = useState(false);

// UI state
const [showSolutionInput, setShowSolutionInput] = useState({});
const [showCommentInput, setShowCommentInput] = useState({});
const [commentText, setCommentText] = useState({});
const [expandedComments, setExpandedComments] = useState({});
const [expandedSolutions, setExpandedSolutions] = useState({});
const [showShareMenu, setShowShareMenu] = useState({});
const [showMoreMenu, setShowMoreMenu] = useState({});
const [reactionAnimations, setReactionAnimations] = useState({});
const [activeTab, setActiveTab] = useState('all');
const [showFullPost, setShowFullPost] = useState({});

const [currentUser, setCurrentUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const navigate = useNavigate();

// Firebase initialization


useEffect(() => {
  const initFirebase = async () => {
    try {
      const db = getFirestore();
      const postsRef = collection(db, 'groups', 'socialAvoidance', 'posts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      
      // Real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = [];
        snapshot.forEach((doc) => {
          postsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('📊 Posts loaded:', postsData.length);
        setPosts(postsData);
        setFirebaseConnected(true);
      }, (error) => {
        console.error('❌ Error loading posts:', error);
        setFirebaseConnected(false);
      });
      
      // Cleanup listener on unmount
      return () => unsubscribe();
      
    } catch (error) {
      console.error('Firebase connection failed:', error);
      setFirebaseConnected(false);
    }
  };

  initFirebase();
}, []);


const handleReaction = async (postId, reactionType) => {
  const key = `${postId}-${reactionType}`;
  setReactionAnimations({ ...reactionAnimations, [key]: true });
  setTimeout(() => {
    setReactionAnimations(prev => ({ ...prev, [key]: false }));
  }, 600);

  const db = getFirestore();
  const postRef = doc(db, 'groups', 'socialAvoidance', 'posts', postId);
  
  await updateDoc(postRef, {
    [`reactions.${reactionType}`]: increment(1)
  });
};


const handleAddComment = async (postId, text) => {
  const db = getFirestore();
  const commentsRef = collection(db, 'groups', 'socialAvoidance', 'posts', postId, 'comments');
  
  await addDoc(commentsRef, {
    text,
    author: '👤',
    authorUid: currentUser?.uid || 'anonymous',
    timestamp: serverTimestamp(),
    likes: 0,
    timeAgo: 'just now'
  });

  setShowCommentInput({ ...showCommentInput, [postId]: false });
  setCommentText({ ...commentText, [postId]: '' });
};

const handleAddSolution = async (postId, solution) => {
  const db = getDatabase();
  const solutionsRef = ref(db, `groups/socialAvoidance/posts/${postId}/solutions`);
  
  await push(solutionsRef, {
    text: solution,
    from: '👤',
    author: currentUser?.uid || 'anonymous',
    timestamp: serverTimestamp(),
    helped: 0,
    verified: false
  });

  setShowSolutionInput({ ...showSolutionInput, [postId]: false });
};

const [posts, setPosts] = useState([]);

// ============================================
// STRUGGLE → SOLUTION CARD
// ============================================

const StruggleSolutionCard = ({ post }) => {
const urgencyStyles = {
high: 'border-red-500/50 bg-red-500/5',
medium: 'border-yellow-500/50 bg-yellow-500/5',
low: 'border-blue-500/50 bg-blue-500/5'
};

const [localReactions, setLocalReactions] = useState(post.reactions);
const [hasReacted, setHasReacted] = useState({});

return (
<div className={`rounded-2xl border-2 ${urgencyStyles[post.urgency]} backdrop-blur-sm p-4 md:p-6 space-y-4 relative`}>
{/* Header */}
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg md:text-xl flex-shrink-0">
{post.author.avatar}
</div>
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
{post.urgency === 'high' && (
<span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
URGENT
</span>
)}
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
<div className="relative">
<button
onClick={() => setShowMoreMenu({ ...showMoreMenu, [post.id]: !showMoreMenu[post.id] })}
className="p-2 hover:bg-white/5 rounded-lg transition-all flex-shrink-0"
>
<MoreHorizontal className="w-5 h-5 text-purple-400" />
</button>

{/* More Menu Dropdown */}
{showMoreMenu[post.id] && (
<div className="absolute right-0 top-10 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-20 overflow-hidden min-w-[160px]">
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Bookmark className="w-4 h-4" /> Save Post
</button>
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Flag className="w-4 h-4" /> Report
</button>
<button className="w-full px-4 py-2 hover:bg-slate-700 text-left text-white text-sm flex items-center gap-2">
<Copy className="w-4 h-4" /> Copy Link
</button>
</div>
)}
</div>
</div>

{/* THE STRUGGLE */}
<div
className="space-y-2 cursor-pointer"
onClick={() => setShowFullPost({ ...showFullPost, [post.id]: !showFullPost[post.id] })}
>
<div className="flex items-center gap-2">
<AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
<span className="text-red-400 font-black text-xs tracking-wider">THE STRUGGLE</span>
</div>
<p className="text-white text-lg md:text-xl font-semibold leading-tight pl-4 md:pl-6">
{post.struggle}
</p>
{!showFullPost[post.id] && (
<button className="text-purple-400 text-sm font-medium pl-4 md:pl-6 flex items-center gap-1 hover:text-purple-300">
<ChevronDown className="w-4 h-4" />
Read more
</button>
)}
</div>

{showFullPost[post.id] && (
<>
{/* HELP NEEDED */}
<div className="space-y-2 pl-4 md:pl-6">
<div className="text-blue-400 font-bold text-xs tracking-wide">→ HELP I NEED</div>
<p className="text-purple-200 font-medium text-sm md:text-base">{post.helpNeeded}</p>
</div>

{/* WHAT I'VE TRIED */}
<div className="space-y-2 pl-4 md:pl-6">
<div className="text-yellow-400 font-bold text-xs tracking-wide">✓ WHAT I'VE TRIED</div>
<div className="space-y-1">
{post.whatTried.map((item, idx) => (
<div key={idx} className="flex items-start gap-2">
<span className="text-yellow-600 text-sm">•</span>
<span className="text-purple-300 text-sm">{item}</span>
</div>
))}
</div>
</div>
</>
)}

{/* Quick Stats Bar */}
<div className="flex items-center gap-4 text-xs text-purple-400 pl-4 md:pl-6">
<span className="flex items-center gap-1">
<MessageCircle className="w-3 h-3" />
{post.reactions.comments} comments
</span>
<span className="flex items-center gap-1">
<Lightbulb className="w-3 h-3" />
{post.solutions.length} solutions
</span>
<span className="flex items-center gap-1">
<Clock className="w-3 h-3" />
{post.responseTime}
</span>
</div>

{/* SOLUTIONS FROM COMMUNITY */}
<div className="pt-4 border-t-2 border-white/5 space-y-3">
<button
onClick={() => setExpandedSolutions({ ...expandedSolutions, [post.id]: !expandedSolutions[post.id] })}
className="flex items-center gap-2 text-green-400 font-black text-sm hover:text-green-300"
>
<Lightbulb className="w-5 h-5" />
<span>{post.solutions.length} SOLUTIONS THAT WORKED</span>
<ChevronDown className={`w-4 h-4 transition-transform ${expandedSolutions[post.id] ? 'rotate-180' : ''}`} />
</button>

{expandedSolutions[post.id] && (
<div className="space-y-3">
{post.solutions.map((sol) => (
<div key={sol.id} className="p-3 md:p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
<div className="flex items-start gap-2 md:gap-3 mb-3">
<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-600 flex items-center justify-center text-sm md:text-lg flex-shrink-0">
{sol.from}
</div>
<p className="text-white text-sm md:text-base flex-1 leading-relaxed">{sol.text}</p>
</div>

{/* Solution Context Tags */}
{sol.context && (
<div className="flex flex-wrap gap-2 mb-3 pl-8 md:pl-11">
{sol.context.map((tag, idx) => (
<span key={idx} className="px-2 py-1 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-xs">
{tag}
</span>
))}
</div>
)}

<div className="flex items-center gap-2 md:gap-4 pl-8 md:pl-11 flex-wrap">
<button
onClick={() => handleReaction(post.id, `solution-${sol.id}`)}
className={`flex items-center gap-1.5 px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50
rounded-lg transition-all group ${reactionAnimations[`${post.id}-solution-${sol.id}`] ? 'scale-110' : ''}`}
>
<ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-xs md:text-sm">{sol.helped}</span>
<span className="text-green-300 text-xs hidden sm:inline">This helped me</span>
</button>
{sol.verified && (
<span className="flex items-center gap-1 text-blue-400 text-xs font-bold">
<CheckCircle className="w-3 h-3" />

</span>
)}
<button className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
<Share2 className="w-3 h-3" />
<span className="hidden sm:inline">Share</span>
</button>
<button className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
<Repeat2 className="w-3 h-3" />
<span className="hidden sm:inline">I'll try this</span>
</button>
</div>
</div>
))}
</div>
)}

{/* Add Your Solution */}
{!showSolutionInput[post.id] ? (
<button
onClick={() => setShowSolutionInput({ ...showSolutionInput, [post.id]: true })}
className="w-full p-3 md:p-4 border-2 border-dashed border-green-500/30 hover:border-green-500
rounded-xl text-green-400 font-bold transition-all flex items-center justify-center gap-2 text-sm md:text-base"
>
<Plus className="w-4 h-4 md:w-5 md:h-5" />
Share what worked for you
</button>
) : (
<div className="space-y-2 p-3 md:p-4 bg-white/5 rounded-xl">
<textarea
placeholder="What worked for you? Be specific..."
rows={3}
className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-900 border border-green-500/30 rounded-lg
text-white text-sm md:text-base placeholder-purple-500 focus:border-green-500 focus:outline-none resize-none"
/>
<div className="flex gap-2">
<button
onClick={() => setShowSolutionInput({ ...showSolutionInput, [post.id]: false })}
className="px-3 md:px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
>
Cancel
</button>
<button
onClick={() => handleAddSolution(post.id, 'solution text')}
className="flex-1 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-sm"
>
Share Solution
</button>
</div>
</div>
)}
</div>

{/* Comments Section */}
{post.comments && post.comments.length > 0 && (
<div className="pt-4 border-t-2 border-white/5 space-y-3">
<button
onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !expandedComments[post.id] })}
className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium text-sm"
>
<MessageCircle className="w-4 h-4" />
<span>{post.comments.length} comments</span>
<ChevronDown className={`w-4 h-4 transition-transform ${expandedComments[post.id] ? 'rotate-180' : ''}`} />
</button>

{expandedComments[post.id] && (
<div className="space-y-2">
{post.comments.map((comment) => (
<div key={comment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
<div className="flex items-start gap-2">
<div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm flex-shrink-0">
{comment.author}
</div>
<div className="flex-1 min-w-0">
<p className="text-purple-200 text-sm mb-1">{comment.text}</p>
<div className="flex items-center gap-3 text-xs text-purple-400">
<span>{comment.timeAgo}</span>
<button
onClick={() => handleReaction(post.id, `comment-${comment.id}`)}
className="hover:text-pink-400 flex items-center gap-1"
>
<Heart className="w-3 h-3" />
{comment.likes}
</button>
<button className="hover:text-purple-300">Reply</button>
</div>
</div>
</div>
</div>
))}
</div>
)}
</div>
)}

{/* Add Comment */}
{!showCommentInput[post.id] ? (
<button
onClick={() => setShowCommentInput({ ...showCommentInput, [post.id]: true })}
className="w-full p-2 md:p-3 border border-purple-500/30 hover:border-purple-500 rounded-lg text-purple-400
font-medium text-sm transition-all flex items-center justify-center gap-2"
>
<MessageCircle className="w-4 h-4" />
Add a comment
</button>
) : (
<div className="space-y-2 p-3 bg-white/5 rounded-lg">
<textarea
placeholder="Share your thoughts..."
value={commentText[post.id] || ''}
onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
rows={2}
className="w-full px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg
text-white text-sm placeholder-purple-500 focus:border-purple-500 focus:outline-none resize-none"
/>
<div className="flex gap-2">
<button
onClick={() => {
setShowCommentInput({ ...showCommentInput, [post.id]: false });
setCommentText({ ...commentText, [post.id]: '' });
}}
className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
>
Cancel
</button>
<button
onClick={() => handleAddComment(post.id, commentText[post.id])}
className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-sm"
>
Post Comment
</button>
</div>
</div>
)}

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
onClick={() => {
handleReaction(post.id, 'relate');
setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all
${reactionAnimations[`${post.id}-relate`] ? 'scale-110' : ''}`}>
<Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
<span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">I relate</span>
</button>

<button
onClick={() => {
setLocalReactions({ ...localReactions, following: localReactions.following + (hasReacted.following ? -1 : 1) });
setHasReacted({ ...hasReacted, following: !hasReacted.following });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.following ? 'bg-blue-500/20' : 'bg-blue-500/10'}
hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-all`}
>
<Bookmark className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.following ? 'fill-blue-400' : ''} text-blue-400`} />
<span className="text-blue-400 font-bold text-sm">{localReactions.following}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Following</span>
</button>

<button
onClick={() => setShowShareMenu({ ...showShareMenu, [post.id]: !showShareMenu[post.id] })}
className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto"
>
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Share</span>
</button>
</div>

{/* Share Menu */}
{showShareMenu[post.id] && (
<div className="flex gap-2 p-3 bg-white/5 rounded-lg border border-purple-500/30">
<button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm flex items-center justify-center gap-2">
<Copy className="w-4 h-4" />
Copy Link
</button>
<button className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm flex items-center justify-center gap-2">
<ExternalLink className="w-4 h-4" />
Share
</button>
</div>
)}
</div>
);
};

// ============================================ // JOURNEY TRACKER CARD (Similar interactive enhancements) // ============================================

const JourneyTrackerCard = ({ post }) => { const [localReactions, setLocalReactions] = useState(post.reactions); const [hasReacted, setHasReacted] = useState({});

 
return (
<div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4 relative">
{/* Similar header and interactive elements as StruggleSolutionCard */}
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-bold">
JOURNEY
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo} • {post.timeline}</span>
</div>
</div>
<button
onClick={() => setShowMoreMenu({ ...showMoreMenu, [post.id]: !showMoreMenu[post.id] })}
className="p-2 hover:bg-white/5 rounded-lg transition-all"
>
<MoreHorizontal className="w-5 h-5 text-purple-400" />
</button>
</div>

<h3 className="text-white text-lg md:text-xl font-bold">{post.title}</h3>

{/* Timeline */}
<div className="space-y-4">
<div className="relative pl-6 md:pl-8 border-l-4 border-red-500/30">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-red-500 flex items-center justify-center">
<span className="text-white text-xs font-bold">1</span>
</div>
<div className="text-red-400 font-black text-xs mb-1.5 tracking-wider">BEFORE</div>
<p className="text-purple-200 text-sm md:text-base">{post.before}</p>
</div>

<div className="relative pl-6 md:pl-8 border-l-4 border-yellow-500">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-yellow-500 flex items-center justify-center">
<Flame className="w-3 h-3 md:w-4 md:h-4 text-white" />
</div>
<div className="text-yellow-400 font-black text-xs mb-1.5 tracking-wider">TODAY</div>
<p className="text-white font-semibold text-base md:text-lg">{post.today}</p>
</div>

<div className="relative pl-6 md:pl-8 border-l-4 border-green-500/30 border-dashed">
<div className="absolute -left-[11px] md:-left-[13px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 border-4 border-green-500"></div>
<div className="text-green-400 font-black text-xs mb-1.5 tracking-wider">GOAL</div>
<p className="text-purple-200 font-medium text-sm md:text-base">{post.goal}</p>
</div>
</div>

{/* Progress Updates */}
{post.updates.length > 0 && (
<div className="pt-4 border-t-2 border-white/5 space-y-2">
<div className="text-blue-400 font-bold text-sm flex items-center gap-2">
<Calendar className="w-4 h-4" />
PROGRESS UPDATES
</div>
{post.updates.map((update, idx) => (
<div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
<div className="flex items-center gap-2 mb-1">
<CheckCircle className="w-4 h-4 text-green-400" />
<span className="text-white font-bold text-sm">Day {update.day}</span>
</div>
<p className="text-purple-200 text-sm pl-6">{update.note}</p>
</div>
))}
</div>
)}

{/* Cheer Button */}
<button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500
hover:to-emerald-500 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2">
<Flame className="w-5 h-5" />
Cheer them on! 🎉
</button>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
onClick={() => {
handleReaction(post.id, 'relate');
setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all`}
>
<Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
<span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500/20
border border-green-500/30 rounded-lg transition-all">
<Flame className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-sm">{localReactions.cheering}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Cheering</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20
border border-blue-500/30 rounded-lg transition-all">
<Eye className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
<span className="text-blue-400 font-bold text-sm">{localReactions.following}</span>
</button>
</div>
</div>
);
};

// ============================================ // WHAT WORKED CARD // ============================================

const WhatWorkedCard = ({ post }) => { const [localReactions, setLocalReactions] = useState(post.reactions); const [hasReacted, setHasReacted] = useState({});

 
return (
<div className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
<Lightbulb className="w-3 h-3" />
SOLUTION
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
{post.verified && (
<div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
<CheckCircle className="w-3 h-3 text-blue-400" />
<span className="text-blue-400 text-xs font-bold"></span>
</div>
)}
</div>

<div className="space-y-4">
<div>
<div className="text-red-400 font-black text-xs mb-2 tracking-wider">THE PROBLEM</div>
<p className="text-purple-200 font-medium text-sm md:text-base pl-4">{post.problem}</p>
</div>

<div className="flex items-center justify-center py-2">
<div className="flex flex-col items-center gap-1">
<ArrowDown className="w-6 h-6 md:w-8 md:h-8 text-green-400 animate-bounce" />
<span className="text-green-400 font-bold text-xs">SOLUTION</span>
</div>
</div>

<div className="p-4 md:p-5 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
<p className="text-white font-bold text-base md:text-lg leading-relaxed">{post.solution}</p>
</div>

<div className="p-3 md:p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
<div className="text-emerald-300 font-bold text-xs mb-2">✨ THE IMPACT</div>
<p className="text-emerald-100 font-medium text-sm md:text-base">{post.impact}</p>
</div>
</div>

{/* Community Stats */}
<div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10 gap-2">
<div className="flex items-center gap-2">
<Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
<span className="text-white font-bold text-sm md:text-base">{post.reactions.trying}</span>
<span className="text-purple-300 text-xs md:text-sm">trying this now</span>
</div>
<button className="px-3 md:px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-xs md:text-sm transition-all whitespace-nowrap">
I'll Try This
</button>
</div>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button
onClick={() => {
handleReaction(post.id, 'relate');
setLocalReactions({ ...localReactions, relate: localReactions.relate + (hasReacted.relate ? -1 : 1) });
setHasReacted({ ...hasReacted, relate: !hasReacted.relate });
}}
className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 ${hasReacted.relate ? 'bg-pink-500/20' : 'bg-pink-500/10'}
hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-all`}
>
<Heart className={`w-3 h-3 md:w-4 md:h-4 ${hasReacted.relate ? 'fill-pink-400' : ''} text-pink-400`} />
<span className="text-pink-400 font-bold text-sm">{localReactions.relate}</span>
</button>

<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500/20
border border-green-500/30 rounded-lg transition-all">
<ThumbsUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
<span className="text-green-400 font-bold text-sm">{localReactions.helped}</span>
<span className="text-purple-300 text-xs md:text-sm hidden sm:inline">Helped me</span>
</button>

<button className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto">
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
</button>
</div>
</div>
);
};

// ============================================ // MICRO CHALLENGE CARD // ============================================

const MicroChallengeCard = ({ post }) => { const diffColors = { beginner: 'bg-green-500/10 border-green-500/30 text-green-400', intermediate: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', advanced: 'bg-red-500/10 border-red-500/30 text-red-400' };

 
const [hasJoined, setHasJoined] = useState(false);
const [localJoined, setLocalJoined] = useState(post.reactions.joined);

return (
<div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5
backdrop-blur-sm p-4 md:p-6 space-y-4">
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2 md:gap-3">
<div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-600 flex items-center justify-center text-lg md:text-xl">
{post.author.avatar}
</div>
<div>
<div className="flex items-center gap-2">
<span className="text-white font-bold text-sm md:text-base">Anonymous</span>
<span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
<Target className="w-3 h-3" />
CHALLENGE
</span>
</div>
<span className="text-purple-400 text-xs">{post.timeAgo}</span>
</div>
</div>
<span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold border ${diffColors[post.difficulty]}`}>
{post.difficulty}
</span>
</div>

<div className="space-y-3">
<div className="text-cyan-400 font-black text-xs tracking-wider">THE CHALLENGE</div>
<p className="text-white text-xl md:text-2xl font-bold pl-4">{post.challenge}</p>

<div className="flex items-center gap-3 md:gap-4 pl-4 text-xs md:text-sm flex-wrap">
<div className="flex items-center gap-2">
<Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
<span className="text-purple-300 font-medium">{post.duration}</span>
</div>
<div className="flex items-center gap-2">
<Users className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
<span className="text-cyan-400 font-bold">{localJoined}</span>
<span className="text-purple-300">joined</span>
</div>
</div>

{/* Why This Matters */}
<div className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
<div className="text-cyan-300 font-bold text-xs mb-1">💡 WHY THIS MATTERS</div>
<p className="text-cyan-100 text-sm">{post.whyThisMatters}</p>
</div>
</div>

{/* Participants */}
<div className="space-y-3 pt-4 border-t-2 border-white/5">
<div className="text-white font-bold text-sm flex items-center gap-2">
<Star className="w-4 h-4 text-yellow-400" />
PEOPLE DOING IT
</div>

<div className="space-y-2 max-h-64 overflow-y-auto">
{post.participants.map((p, idx) => (
<div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-start gap-2 md:gap-3">
<div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-cyan-600 flex items-center justify-center text-sm md:text-lg flex-shrink-0">
{p.avatar}
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center gap-2 mb-1 flex-wrap">
{p.status === 'done' ? (
<CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
) : p.status === 'setback' ? (
<AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
) : (
<Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
)}
<span className={`text-xs font-bold ${
p.status === 'done' ? 'text-green-400' :
p.status === 'setback' ? 'text-yellow-400' :
'text-blue-400'
}`}>
{p.status === 'done' ? 'COMPLETED' : p.status === 'setback' ? 'SETBACK' : 'IN PROGRESS'}
</span>
<span className="text-purple-400 text-xs">{p.timeAgo}</span>
</div>
<p className="text-purple-200 text-xs md:text-sm">{p.note}</p>
</div>
</div>
))}
</div>
</div>

{/* Join Button */}
<button
onClick={() => {
setHasJoined(!hasJoined);
setLocalJoined(localJoined + (hasJoined ? -1 : 1));
handleReaction(post.id, 'join-challenge');
}}
className={`w-full px-4 md:px-6 py-3 md:py-4 ${hasJoined ? 'bg-green-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}
hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-base md:text-lg transition-all
flex items-center justify-center gap-2`}
>
{hasJoined ? (
<>
<CheckCircle className="w-5 h-5" />
Challenge Accepted! 🎯
</>
) : (
<>
<Target className="w-5 h-5" />
Accept Challenge
</>
)}
</button>

{/* Reactions */}
<div className="flex items-center gap-2 md:gap-3 pt-3 border-t-2 border-white/5 flex-wrap">
<button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20
border border-pink-500/30 rounded-lg transition-all">
<Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
<span className="text-pink-400 font-bold text-sm">{post.reactions.relate}</span>
</button>
<button className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20
border border-purple-500/30 rounded-lg transition-all ml-auto">
<Share2 className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
</button>
</div>
</div>
);
};

// ============================================ // MAIN RENDER // ============================================

return ( <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"> {/* Top Bar - Mobile Optimized */} <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-800/30 sticky top-0 z-50"> <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4"> <div className="flex items-center justify-between"> <div className="flex items-center gap-2 md:gap-3"> <div className="text-2xl md:text-3xl">💜</div> <div> <div className="text-white font-bold text-sm md:text-base">Social Avoidance</div> <div className="text-purple-400 text-xs"> {firebaseConnected ? '🟢 Live' : '🔴 Offline'} • 1,247 members </div> </div> </div>

 


<div className="flex items-center gap-2 md:gap-3">



</div>
</div>
</div>
</div>

{/* Main Content */}
<div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
{/* Filters - Mobile Scrollable */}
<div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
<button
onClick={() => setActiveTab('all')}
className={`px-3 md:px-4 py-2 ${activeTab === 'all' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
rounded-lg text-white font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
All Posts
</button>
<button
onClick={() => setActiveTab('support')}
className={`px-3 md:px-4 py-2 ${activeTab === 'support' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
🆘 Need Support
</button>
<button
onClick={() => setActiveTab('solutions')}
className={`px-3 md:px-4 py-2 ${activeTab === 'solutions' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
💡 Solutions
</button>
<button
onClick={() => setActiveTab('journeys')}
className={`px-3 md:px-4 py-2 ${activeTab === 'journeys' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
🛤️ Journeys
</button>
<button
onClick={() => setActiveTab('challenges')}
className={`px-3 md:px-4 py-2 ${activeTab === 'challenges' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}
rounded-lg text-purple-300 font-medium text-xs md:text-sm whitespace-nowrap transition-all flex-shrink-0`}
>
🎯 Challenges
</button>
</div>

{/* Create Post Button */}
<button className="w-full p-3 md:p-4 mb-4 md:mb-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 hover:from-purple-900/70 hover:to-pink-900/70 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl text-purple-300 hover:text-white font-medium text-sm md:text-base transition-all flex items-center justify-center gap-2"> <Plus className="w-4 h-4 md:w-5 md:h-5" /> Share your struggle, journey, solution, or challenge... </button>

 



{/* Feed */}
<div className="space-y-4 md:space-y-6">
{posts.map((post) => (
<div key={post.id}>
{post.type === 'struggle-solution' && <StruggleSolutionCard post={post} />}
{post.type === 'journey-tracker' && <JourneyTrackerCard post={post} />}
{post.type === 'what-worked' && <WhatWorkedCard post={post} />}
{post.type === 'micro-challenge' && <MicroChallengeCard post={post} />}
</div>
))}
</div>


</div>

{/* Mobile Bottom Navigation (Optional) */}


{/* Add padding for mobile bottom nav */}
<div className="md:hidden h-20"></div>
</div>
); };

export default Optimizedsupport;