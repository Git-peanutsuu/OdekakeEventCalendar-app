import { useState } from 'react';
import MonthlyCalendar from '../MonthlyCalendar';

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
  },
  {
    id: '3',
    title: 'Community Art Fair',
    date: '2025-01-20',
    description: 'Local artists showcase their work',
    externalLink: 'https://example.com/art-fair'
  },
  {
    id: '4',
    title: 'Classical Concert Series',
    date: '2025-01-25',
    description: 'Monthly classical music performance',
    externalLink: 'https://example.com/classical-concert'
  }
];

export default function MonthlyCalendarExample() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    console.log('Date clicked:', date);
  };

  return (
    <div className="p-4">
      <MonthlyCalendar
        events={mockEvents}
        onDateClick={handleDateClick}
        selectedDate={selectedDate}
      />
    </div>
  );
}