import { useState } from 'react';
import AdminInterface from '../AdminInterface';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string | null;
  externalLink: string | null;
}

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

const mockReferenceWebsites = [
  { id: '1', title: 'Local Events Board', url: 'https://example.com/events' },
  { id: '2', title: 'City Cultural Calendar', url: 'https://example.com/culture' },
  { id: '3', title: 'Music Venue Listings', url: 'https://example.com/music' }
];

export default function AdminInterfaceExample() {
  const [events, setEvents] = useState(mockEvents);
  const [websites, setWebsites] = useState(mockReferenceWebsites);

  const handleAddEvent = (event: { title: string; date: string; description?: string; externalLink?: string }) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: event.title,
      date: event.date,
      description: event.description || null,
      externalLink: event.externalLink || null
    };
    setEvents(prev => [...prev, newEvent]);
    console.log('Event added:', newEvent);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    console.log('Event deleted:', id);
  };

  const handleAddWebsite = (website: { title: string; url: string }) => {
    const newWebsite = {
      id: Date.now().toString(),
      ...website
    };
    setWebsites(prev => [...prev, newWebsite]);
    console.log('Website added:', newWebsite);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(prev => prev.filter(w => w.id !== id));
    console.log('Website deleted:', id);
  };

  return (
    <div className="p-4">
      <AdminInterface
        events={events}
        referenceWebsites={websites}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
        onAddReferenceWebsite={handleAddWebsite}
        onDeleteReferenceWebsite={handleDeleteWebsite}
      />
    </div>
  );
}