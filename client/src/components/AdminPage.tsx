import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import AdminInterface from '@/components/AdminInterface';
import AdminLogin from '@/components/AdminLogin';
import ThemeToggle from '@/components/ThemeToggle';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useReferenceWebsites, useCreateReferenceWebsite, useDeleteReferenceWebsite } from '@/hooks/useReferenceWebsites';
import { useAdminStatus, useAdminLogout } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // API hooks
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: referenceWebsites = [], isLoading: websitesLoading } = useReferenceWebsites();
  const { data: isAdmin = false, isLoading: adminLoading } = useAdminStatus();
  
  // Mutations
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();
  const createWebsiteMutation = useCreateReferenceWebsite();
  const deleteWebsiteMutation = useDeleteReferenceWebsite();
  const logoutMutation = useAdminLogout();

  const handleAddEvent = async (event: { title: string; date: string; description?: string; externalLink?: string; locationTagId?: string }) => {
    try {
      await createEventMutation.mutateAsync(event);
      toast({
        title: "Success",
        description: "Event added successfully"
      });
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reference website",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLocation('/')}
                data-testid="button-back-to-calendar"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-admin-logout"
                >
                  Logout
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {eventsLoading || websitesLoading || adminLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin panel...</p>
            </div>
          </div>
        ) : (
          <>
            {!isAdmin && (
              <AdminLogin onLoginSuccess={() => {}} />
            )}

            {isAdmin && (
              <AdminInterface
                events={events}
                referenceWebsites={referenceWebsites}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddReferenceWebsite={handleAddReferenceWebsite}
                onDeleteReferenceWebsite={handleDeleteReferenceWebsite}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}