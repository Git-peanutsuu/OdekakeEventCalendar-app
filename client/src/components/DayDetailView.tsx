import { ArrowLeft, ExternalLink, MapPin, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

interface DayDetailViewProps {
  date: Date;
  events: Event[];
  locationTags: LocationTag[];
  onBack: () => void;
}

export default function DayDetailView({ date, events, locationTags, onBack }: DayDetailViewProps) {
  const { toast } = useToast();
  const dayEvents = events.filter(event => event.date === format(date, 'yyyy-MM-dd'));
  
  // Get location tag by ID
  const getLocationTagById = (id: string | null) => {
    if (!id) return null;
    return locationTags.find(tag => tag.id === id);
  };
  // Format date in Japanese style: 9月1日 月曜, 2025
  const formatJapaneseDate = (date: Date) => {
    const dayNames = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const dayOfWeek = dayNames[date.getDay()];

    return `${year}年${month}月${day}日 ${dayOfWeek}`;
  };

  // Share event function
  const shareEvent = async (event: Event) => {
    const eventDate = new Date(event.date + 'T00:00:00');
    // const formattedDate = format(eventDate, 'MMMM d, yyyy');
    const formattedDate = format(eventDate, 'yyyy年 M月d日');
    
    let shareText = `🎉 ${event.title}\n📅 ${formattedDate}`;
    
    if (event.description) {
      shareText += `\n${event.description}`;
    }
    
    if (event.externalLink) {
      shareText += `\n🔗 ${event.externalLink}`;
    }

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText
        });
        return;
      } catch (error) {
        // Fallback to clipboard if sharing is cancelled or fails
      }
    }

    // Fallback: Copy to clipboard (desktop)
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "クリップボードにコピーされました!",
        description: "イベントの詳細がコピーされました"
      });
    } catch (error) {
      toast({
        title: "共有に失敗しました",
        description: "sorry!イベントを共有できていません",
        variant: "destructive"
      });
    }
  };

  const addToCalendar = (event: Event) => {
    // Generate calendar URL (works for Google Calendar)
    const startDate = new Date(event.date + 'T09:00:00');
    const endDate = new Date(event.date + 'T10:00:00');
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.externalLink || '')}`;
    
    window.open(googleUrl, '_blank');
    console.log('Add to calendar:', event.title);
  };

  return (
    <div className="space-y-6" data-testid="day-detail-view">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          data-testid="button-back-to-month"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-selected-date">
            {formatJapaneseDate(date)}
          </h1>
          <p className="text-muted-foreground">
            {dayEvents.length} 件のイベント
          </p>
        </div>
      </div>

      {/* Events */}
      {dayEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground" data-testid="text-no-events">
            この日はイベントが追加されていません
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dayEvents.map(event => {
            return (
              <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </CardTitle>
                      {event.locationTagId && (
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin 
                            className="h-4 w-4" 
                            style={{ color: getLocationTagById(event.locationTagId)?.color || '#666' }}
                            fill="currentColor"
                          />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: getLocationTagById(event.locationTagId)?.color || '#666' }}
                            data-testid={`text-event-location-${event.id}`}
                          >
                            {getLocationTagById(event.locationTagId)?.name}
                          </span>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-muted-foreground mt-2" data-testid={`text-event-description-${event.id}`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => shareEvent(event)}
                      data-testid={`button-share-event-${event.id}`}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.externalLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(event.externalLink || '', '_blank')}
                        data-testid={`button-external-link-${event.id}`}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        イベントの詳細をみる
                      </Button>
                    )}
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addToCalendar(event)}
                      data-testid={`button-add-to-calendar-${event.id}`}
                    >
                      カレンダーに追加する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}