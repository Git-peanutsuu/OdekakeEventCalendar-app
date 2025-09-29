import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string | null;
  externalLink: string | null;
  locationTagId: string | null;
}

interface LocationTag {
  id: string;
  name: string;
  color: string;
}

interface MonthlyCalendarProps {
  events: Event[];
  locationTags: LocationTag[];
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
  selectedLocationTags: string[];
  onLocationTagsChange: (tags: string[]) => void;
}

export default function MonthlyCalendar({ events, locationTags, onDateClick, selectedDate, selectedLocationTags, onLocationTagsChange }: MonthlyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch last updated time
  const { data: lastUpdatedData } = useQuery<{ lastUpdated: string | null }>({
    queryKey: ['/api/calendar/last-updated'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Filter events based on selected location tags
  const getFilteredEvents = () => {
    if (selectedLocationTags.includes('all')) {
      return events;
    }
    return events.filter(event => 
      event.locationTagId && selectedLocationTags.includes(event.locationTagId)
    );
  };

  // Get events for a specific date (filtered)
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => event.date === dateStr);
  };
  
  // Get location tag by ID
  const getLocationTagById = (id: string | null) => {
    if (!id) return null;
    return locationTags.find(tag => tag.id === id);
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Handle location tag filter changes
  const handleLocationTagChange = (tagId: string, checked: boolean) => {
    const newTags = (() => {
      if (tagId === 'all') {
        // If "all" is selected, clear specific tags
        return checked ? ['all'] : [];
      } else {
        // If a specific tag is selected, remove "all"
        let updatedTags = selectedLocationTags.filter(id => id !== 'all');
        
        if (checked) {
          updatedTags = [...updatedTags, tagId];
        } else {
          updatedTags = updatedTags.filter(id => id !== tagId);
        }
        
        // If no specific tags are selected, default to "all"
        return updatedTags.length === 0 ? ['all'] : updatedTags;
      }
    })();
    
    onLocationTagsChange(newTags);
  };
  
  // Format last updated time in Japanese
  const formatLastUpdated = (date: string | null) => {
    if (!date) return null;
    const updatedDate = new Date(date);
    return format(updatedDate, 'yyyy年M月d日', { locale: ja });
  };

  return (
    <Card className="p-0 m-0" data-testid="monthly-calendar">
      {/* Last Updated Time */}
      {lastUpdatedData?.lastUpdated && (
        <div className="text-xs text-muted-foreground px-1 pt-1 mb-2" data-testid="text-last-updated">
          更新日時: {formatLastUpdated(lastUpdatedData.lastUpdated)}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-1">
        <h2 className="text-2xl font-semibold " data-testid="text-month-year">
          {format(currentDate, 'yyyy M月')}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            data-testid="button-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-4 px-1">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-sm gap-2"
              data-testid="button-location-filter"
            >
              <Filter className="h-4 w-4" />
              フィルター
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">ロケーション</h4>
              
              {/* All option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="location-all"
                  checked={selectedLocationTags.includes('all')}
                  onCheckedChange={(checked) => handleLocationTagChange('all', checked as boolean)}
                  data-testid="checkbox-location-all"
                />
                <label
                  htmlFor="location-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  すべて
                </label>
              </div>

              {/* Individual location tags */}
              {locationTags.map(tag => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${tag.id}`}
                    checked={selectedLocationTags.includes(tag.id)}
                    onCheckedChange={(checked) => handleLocationTagChange(tag.id, checked as boolean)}
                    data-testid={`checkbox-location-${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <label
                    htmlFor={`location-${tag.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24"></div>
        ))}
        
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={`
                h-24 rounded-md border transition-colors hover-elevate relative
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${isCurrentDay && !isSelected ? 'bg-accent' : ''}
                ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
              `}
              data-testid={`button-date-${format(day, 'yyyy-MM-dd')}`}
            >
              <div className="h-full flex flex-col">
                <span className={`text-sm font-medium pt-1 px-1 ${isSelected ? 'text-primary-foreground' : ''}`}>
                  {format(day, 'd')}
                </span>
                <div className="flex-1 flex flex-col gap-0 pb-1 px-0 overflow-hidden">
                  {dayEvents.slice(0, 2).map(event => {
                    const locationTag = getLocationTagById(event.locationTagId);
                    return (
                      <Badge
                        key={event.id}
                        variant="secondary"
                        className="text-xs px-0.5 py-0.5 h-auto truncate w-full block min-w-0"
                        /* above text you can change space between text and badge because parent element div specify px-0 and you can change it more than 0*/
                        style={{
                          borderColor: locationTag?.color || '#e5e7eb',
                          borderWidth: '2px',
                          borderStyle: 'solid'
                        }}
                        data-testid={`badge-event-${event.id}`}
                      >
                        {event.title}
                      </Badge>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <Badge variant="outline" className="text-xs px-0.1 py-0.5 h-auto w-full block min-w-0">
                      +{dayEvents.length - 2} 件
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}