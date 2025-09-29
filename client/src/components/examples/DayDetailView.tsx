import { useState } from 'react';
import DayDetailView from '../DayDetailView';

// todo: remove mock functionality
const mockEvents = [
  {
    id: '1',
    title: 'Weekly Farmers Market',
    date: '2025-01-15',
    description: 'Fresh local produce, artisanal goods, and community vendors',
    externalLink: 'https://example.com/farmers-market'
  },
  {
    id: '2', 
    title: 'Jazz Night at The Blue Note',
    date: '2025-01-15',
    description: 'Live jazz performance featuring local musicians',
    externalLink: 'https://example.com/jazz-night'
  }
];

export default function DayDetailViewExample() {
  const [userInterests, setUserInterests] = useState<string[]>(['1']);

  const handleToggleInterest = (eventId: string) => {
    setUserInterests(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
    console.log('Toggle interest for:', eventId);
  };

  const handleBack = () => {
    console.log('Back to monthly view');
  };

  return (
    <div className="p-4">
      <DayDetailView
        date={new Date('2025-01-15')}
        events={mockEvents}
        onBack={handleBack}
        userInterests={userInterests}
        onToggleInterest={handleToggleInterest}
      />
    </div>
  );
}