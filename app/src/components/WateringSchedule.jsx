import React from 'react';

export const WateringSchedule = ({ weather, userProfile }) => {
  const { rainChance, temperature, isLoading } = weather;
  const crop = userProfile?.crop || 'Default';

  const getWateringAdvice = () => {
    if (isLoading) return { text: "Calculating...", amount: "--" };
    
    if (rainChance > 65) {
      return { 
        text: `Skip watering - Rain expected in 24 hours 🌧️`, 
        amount: "0 Liters" 
      };
    }

    if (crop === 'Rice') {
      return { text: "Next watering: Today", amount: "5000 liters per acre" };
    } else if (crop === 'Wheat') {
      return { text: "Next watering: Tomorrow", amount: "2500 liters per acre" };
    } else if (['Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal', 'Chilli'].includes(crop)) {
      return { text: "Next watering: Today at 6:00 AM", amount: "1200 liters per acre" };
    } else if (['Mango', 'Banana', 'Grapes', 'Pomegranate', 'Coconut'].includes(crop)) {
      return { text: "Next watering: In 2 days", amount: "2000 liters per acre" };
    } else if (crop === 'Cotton') {
      return { text: "Next watering: In 3 days", amount: "1500 liters per acre" };
    }
    
    return { text: "Next watering: Tomorrow", amount: "1000 liters per acre" };
  };

  const advice = getWateringAdvice();

  return (
    <div className="glass-card p-6 mt-4">
      <h3 className="text-label-md text-gray-100 uppercase tracking-wider mb-4">Watering Schedule</h3>
      
      <div className="bg-primary/5 rounded-xl p-4 border border-outline-variant/30 mb-4">
        <p className="text-headline-md text-primary">{advice.text}</p>
        <p className="text-body-md text-gray-100 mt-2 font-medium">Amount: {advice.amount}</p>
      </div>

      <div className="flex justify-between items-center bg-surface-variant/30 p-3 rounded-lg overflow-x-auto gap-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
          // Simple visual logic: if Rice -> everyday, else alternating
          const isWateringDay = crop === 'Rice' || idx % 2 === 0;
          return (
            <div key={day} className="flex flex-col items-center min-w-[36px]">
              <span className="text-[10px] text-gray-100 mb-1">{day}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isWateringDay ? 'bg-secondary-container text-primary' : 'bg-surface text-outline'}`}>
                {isWateringDay ? '💧' : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
