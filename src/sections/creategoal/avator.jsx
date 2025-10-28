import { useState } from 'react';
import { X, Check } from 'lucide-react';

// Manual SVG imports
import Avatar01 from 'src/AVATORS/01.svg';
import Avatar02 from 'src/AVATORS/02.svg';
import Avatar03 from 'src/AVATORS/03.svg';
// Add more as needed...

export default function AvatarChooser({ onComplete }) {
 const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [showModal, setShowModal] = useState(true);

  const avatars = [
    { id: 1, name: 'Avatar 01', src: Avatar01 },
    { id: 2, name: 'Avatar 02', src: Avatar02 },
    { id: 3, name: 'Avatar 03', src: Avatar03 },
    // Add more manually here
  ];

 const handleConfirm = () => {
    if (!selectedAvatar) return;

    localStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
    console.log('Selected avatar saved:', selectedAvatar);

    // Close modal immediately
    setShowModal(false);
 }

  const handleCancel = () => {
    setSelectedAvatar(null);
    setShowModal(false);
  };

  if (!showModal) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center p-4">
        <div className="text-center">
          {selectedAvatar && (
  <div className="mt-6 text-center">
    <p className="text-green-400 font-semibold mb-4">
      Avatar selected successfully! Ready to go!
    </p>

    <div className="flex justify-center gap-4">
      {/* Choose another avatar */}
      <button
        onClick={() => setSelectedAvatar(null)}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold"
      >
        Choose Another
      </button>

      {/* Continue to onboarding quiz */}
      <button
        onClick={() => {
          if (typeof onComplete === "function") onComplete();
        }}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold"
      >
        Continue
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    );
  }

  return (
  <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
    {/* Thick opaque purple background */}
    <div className="absolute inset-0 bg-purple-950 z-0"></div>

    {/* Modal content */}
    <div className="relative z-10 bg-purple-900 rounded-3xl border-2 border-purple-500 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col items-center">
      
      {/* Header */}
      <div className="bg-purple-900 px-6 py-6 border-b-2 border-purple-500 flex items-center justify-between w-full">
        <div className="text-center flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Choose Your Avatar
          </h2>
          <p className="text-purple-300 text-sm">Pick one that represents you</p>
        </div>
        <button onClick={handleCancel} className="p-2 hover:bg-purple-800 rounded-lg">
          <X className="w-6 h-6 text-purple-400" />
        </button>
      </div>

      {/* Avatar Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-8 w-full flex justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 justify-items-center">
          {avatars.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
              className={`flex flex-col items-center gap-3 transition-transform ${
                selectedAvatar?.id === avatar.id ? 'scale-105' : hoveredAvatar === avatar.id ? 'scale-100' : 'scale-95'
              }`}
            >
              <div
                className={`relative w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg overflow-hidden transition-all
                ${
                  selectedAvatar?.id === avatar.id
                    ? 'ring-4 ring-purple-300 shadow-2xl scale-110 bg-purple-900'
                    : hoveredAvatar === avatar.id
                    ? 'ring-4 ring-purple-400 shadow-xl scale-105 -rotate-3 bg-purple-900'
                    : 'ring-2 ring-purple-500 bg-purple-900'
                }`}
              >
                <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                {selectedAvatar?.id === avatar.id && (
                  <div className="absolute inset-0 bg-purple-900 flex items-center justify-center rounded-3xl animate-pulse">
                    <Check className="w-8 h-8 md:w-10 md:h-10 text-white animate-bounce" />
                  </div>
                )}
              </div>
              <p className={`text-xs md:text-sm font-bold text-center ${
                selectedAvatar?.id === avatar.id ? 'text-white' : hoveredAvatar === avatar.id ? 'text-purple-200' : 'text-purple-400'
              }`}>{avatar.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-5 border-t-2 border-purple-500 flex gap-3 justify-center w-full">
        <button
          onClick={handleCancel}
          className="px-6 py-3 bg-purple-800 hover:bg-purple-700 rounded-2xl border-2 border-purple-500 text-white font-bold"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            handleConfirm();
            if (typeof onComplete === "function") onComplete();
          }}
          disabled={!selectedAvatar}
          className="px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-2xl border-2 border-purple-500 text-white font-bold disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);
};
