import React, { useState } from 'react';
import { Plus, Search, Users, ArrowLeft, MoreVertical, Bell, Pin, Archive, Settings, User, MessageCircle, CheckCircle, Camera, Menu } from 'lucide-react';
import GroupChatApp from './GroupChatApp'; // Your existing component
import { db } from '@/firebase'; // adjust path if needed
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';

import {
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

import { useParams, useNavigate } from 'react-router-dom';
// Mock groups data


function WhatsAppInterface() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'yesterday';
    return `${days}d`;
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedGroups = filteredGroups.filter(g => g.pinned);
  const regularGroups = filteredGroups.filter(g => !g.pinned);



useEffect(() => {
  const q = query(collection(db, 'groups'), orderBy('lastMessageTime', 'desc'));
  const unsubscribe = onSnapshot(q, snapshot => {
    const groupList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGroups(groupList);
  });
  return () => unsubscribe();
}, []);


  // If a group is selected, render the GroupChatApp component
  if (selectedGroup) {
    return (
      <div className="h-screen w-full">
        <GroupChatApp 
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          groupMembers={selectedGroup.members}
          activeMembers={selectedGroup.activeMembers}
          onBack={() => setSelectedGroup(null)}
        />
      </div>
    );
  }

  const handleCreateGroup = async () => {
  const name = prompt("Enter group name:");
  if (!name) return;
  await addDoc(collection(db, 'groups'), {
    name,
    members: 1,
    activeMembers: 1,
    lastMessage: "New group created",
    lastMessageTime: serverTimestamp(),
    unreadCount: 0,
    avatar: '🆕',
    pinned: false
  });
};


  // Groups list view
  return (
    <div className="h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 flex flex-col">
      {/* Header */}
      <div className="bg-teal-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-teal-600 rounded-full transition-all"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">AccountaBuddy Groups</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-teal-600 rounded-full transition-all">
            <Camera className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-teal-600 rounded-full transition-all">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-teal-700 px-4 pb-3">
        <div className="bg-white rounded-lg flex items-center px-4 py-2 gap-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 bg-white overflow-y-auto">
        {/* Pinned Groups */}
        {pinnedGroups.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-100 flex items-center gap-2">
              <Pin className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-600">PbvNED</span>
            </div>
            {pinnedGroups.map(group => (
              <GroupItem 
                key={group.id} 
                group={group} 
                onSelect={setSelectedGroup}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}

        {/* Regular Groups */}
        {regularGroups.map(group => (
          <GroupItem 
            key={group.id} 
            group={group} 
            onSelect={setSelectedGroup}
            formatTime={formatTime}
          />
        ))}

        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No groups found</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110">
        <Plus className="w-7 h-7 text-white" />
      </button>

      <button
  onClick={handleCreateGroup}
  className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
>
  <Plus className="w-7 h-7 text-white" />
</button>


      {/* Side Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl animate-slide-in">
            <div className="bg-teal-700 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Alex Johnson</p>
                  <p className="text-teal-200 text-sm">alex@example.com</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <MenuItem icon={<Users />} label="New Group" />
              <MenuItem icon={<Bell />} label="Notifications" />
              <MenuItem icon={<Archive />} label="Archived" />
              <MenuItem icon={<Settings />} label="Settings" />
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function GroupItem({ group, onSelect, formatTime }) {
  return (
    <button
      onClick={() => onSelect(group)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all border-b border-gray-100"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
        {group.avatar}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
          <span className={`text-xs ${group.unreadCount > 0 ? 'text-teal-600 font-semibold' : 'text-gray-500'}`}>
            {formatTime(group.lastMessageTime?.toMillis ? group.lastMessageTime.toMillis() : group.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate flex-1">{group.lastMessage}</p>
          {group.unreadCount > 0 && (
            <span className="ml-2 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {group.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{group.activeMembers} active • {group.members} members</p>
      </div>
    </button>
  );
}

function MenuItem({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-all">
      <div className="text-gray-600">
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
      <span className="text-gray-800 font-medium">{label}</span>
    </button>
  );
}

export default WhatsAppInterface;