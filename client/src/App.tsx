import { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DayDetailView from '@/components/DayDetailView';
import AdminInterface from '@/components/AdminInterface';
import AdminPage from '@/components/AdminPage';
import ThemeToggle from '@/components/ThemeToggle';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useReferenceWebsites, useCreateReferenceWebsite, useDeleteReferenceWebsite } from '@/hooks/useReferenceWebsites';
import { useAdminStatus, useAdminLogout } from '@/hooks/useAdmin';
import { useLocationTags } from '@/hooks/useLocationTags';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/AdminLogin';
import NotFound from '@/pages/not-found';


function CalendarApp() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [currentView, setCurrentView] = useState<'calendar' | 'day'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedLocationTags, setSelectedLocationTags] = useState<string[]>(['all']);
  
  // API hooks
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: referenceWebsites = [], isLoading: websitesLoading } = useReferenceWebsites();
  const { data: isAdmin = false, isLoading: adminLoading } = useAdminStatus();
  const { data: locationTags = [], isLoading: locationTagsLoading } = useLocationTags();
  
  // Mutations
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();
  const createWebsiteMutation = useCreateReferenceWebsite();
  const deleteWebsiteMutation = useDeleteReferenceWebsite();
  const logoutMutation = useAdminLogout();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('day');
    console.log('Date selected:', date);
  };

  const handleBackToCalendar = () => {
    setCurrentView('calendar');
    setSelectedDate(undefined);
  };


  const handleAddEvent = async (event: { title: string; date: string; description?: string; externalLink?: string; locationTagId?: string }) => {
    try {
      await createEventMutation.mutateAsync(event);
      toast({
        title: "Success",
        description: "Event added successfully"
      });
      console.log('Event added:', event);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEventMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
      console.log('Event deleted:', id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const handleAddReferenceWebsite = async (website: { title: string; url: string }) => {
    try {
      await createWebsiteMutation.mutateAsync(website);
      toast({
        title: "Success",
        description: "Reference website added successfully"
      });
      console.log('Reference website added:', website);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reference website",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReferenceWebsite = async (id: string) => {
    try {
      await deleteWebsiteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Reference website deleted successfully"
      });
      console.log('Reference website deleted:', id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reference website",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="calendar-app">
      {/* Header */}
      <header className="border-b bg-card ">
        <div className="max-w-7xl mx-auto px-4 sm:px-7 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-0">
              <h1 className="text-xl font-semibold" data-testid="text-app-title">
                滋賀周辺おでかけカレンダー
              </h1>
              {currentView === 'day' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentView('calendar')}
                    data-testid="button-nav-calendar"
                  >
                    Calendar
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0.5 sm:px-2 lg:px-2 py-1">
        {eventsLoading || websitesLoading || adminLoading || locationTagsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar data...</p>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'calendar' && (
            <div className="w-full"> 
              <MonthlyCalendar
                events={events}
                locationTags={locationTags}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                selectedLocationTags={selectedLocationTags}
                onLocationTagsChange={setSelectedLocationTags}
                
              />
              {/* 2. 広告スペース（縦幅 h-16） */}
              {/* <div className="mt-8 mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center shadow-md max-w-2xl mx-auto">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      [スポンサー広告枠] 滋賀のおすすめホテル・旅行代理店のバナーが入ります
                  </p>
                  <div className="h-16 w-full bg-yellow-200 dark:bg-yellow-800 mt-2 flex items-center justify-center text-xs text-yellow-700 dark:text-yellow-300">
                      広告バナーエリア (例: 728x90)
                  </div>
              </div> */}

              {/* 3. サイト紹介文 */}
              <div className="mt-8 mb-12 p-6 bg-card text-card-foreground rounded-xl shadow-lg border border-border max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold mb-3 text-primary text-center">
                      このサイトについて：滋賀のおでかけを応援！
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                      このカレンダーは、地元住民が厳選した滋賀県周辺の魅力的なイベントや、家族で楽しめるスポット情報を集約しています。
                      情報は随時更新されており、フィルター機能を使って、あなたにぴったりのイベントを簡単に見つけられます。
                      週末のおでかけ先や、地域のお祭り探しにご活用ください！
                  </p>
              </div>
              </div>
            )}

            {currentView === 'day' && selectedDate && (
              <DayDetailView
                date={selectedDate}
                events={events}
                locationTags={locationTags}
                onBack={handleBackToCalendar}
              />
            )}

          </>
        )}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={CalendarApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
