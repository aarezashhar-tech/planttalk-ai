import React, { useState } from 'react';

export const CropSelector = ({ userProfile, onCropChanged }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Onion', 'Potato', 'Sugarcane', 'Groundnut', 'Soybean', 'Chilli', 'Brinjal', 'Cabbage', 'Cauliflower', 'Mango', 'Banana', 'Grapes', 'Pomegranate', 'Coconut'];

  const handleSelectCrop = (crop) => {
    const updatedProfile = { ...userProfile, crop };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    setToastMsg(`Switched to ${crop} ✅`);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
      onCropChanged();
    }, 1500);
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 relative min-h-screen">
      <header className="mb-6">
        <h1 className="text-headline-lg-mobile text-primary">Crop Selector</h1>
        <p className="text-body-md text-gray-100">Switch your actively monitored crop</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {crops.map(crop => (
          <button 
            key={crop}
            onClick={() => handleSelectCrop(crop)}
            className={`glass-card p-4 flex flex-col items-center justify-center transition-transform active:scale-95 ${userProfile?.crop === crop ? 'border-primary border-2 bg-secondary-container/20' : ''}`}
          >
            <div className="text-4xl font-bold mb-2">
              {crop === 'Rice' || crop === 'Wheat' || crop === 'Maize' ? '🌾' : 
               crop === 'Tomato' ? '🍅' : 
               crop === 'Onion' ? '🧅' : 
               crop === 'Potato' ? '🥔' :
               crop === 'Mango' ? '🥭' :
               crop === 'Banana' ? '🍌' :
               crop === 'Grapes' ? '🍇' :
               crop === 'Coconut' ? '🥥' :
               crop === 'Cotton' ? '☁️' : '🌱'}
            </div>
            <h3 className="text-label-md text-primary font-bold">{crop}</h3>
            {userProfile?.crop === crop && <span className="text-xs text-primary mt-1">Active</span>}
          </button>
        ))}
      </div>

      {showToast && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-surface-container-highest shadow-modal px-6 py-3 rounded-full animate-in fade-in slide-in-from-top-4 z-50">
          <p className="text-label-md text-primary font-bold">{toastMsg}</p>
        </div>
      )}
    </div>
  );
};
