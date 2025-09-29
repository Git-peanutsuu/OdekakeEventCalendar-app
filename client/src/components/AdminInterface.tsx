import { useState } from 'react';
import { Plus, Trash2, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocationTags, useCreateLocationTag, useUpdateLocationTag, useDeleteLocationTag } from '@/hooks/useLocationTags';

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

interface ReferenceWebsite {
  id: string;
  title: string;
  url: string;
}

interface AdminInterfaceProps {
  events: Event[];
  referenceWebsites: ReferenceWebsite[];
  onAddEvent: (event: { title: string; date: string; description?: string; externalLink?: string; locationTagId?: string }) => void;
  onDeleteEvent: (id: string) => void;
  onAddReferenceWebsite: (website: { title: string; url: string }) => void;
  onDeleteReferenceWebsite: (id: string) => void;
}

export default function AdminInterface({
  events,
  referenceWebsites,
  onAddEvent,
  onDeleteEvent,
  onAddReferenceWebsite,
  onDeleteReferenceWebsite
}: AdminInterfaceProps) {
  const { toast } = useToast();
  
  // Location tag hooks
  const { data: locationTags = [], isLoading: locationTagsLoading } = useLocationTags();
  const createLocationTagMutation = useCreateLocationTag();
  const updateLocationTagMutation = useUpdateLocationTag();
  const deleteLocationTagMutation = useDeleteLocationTag();
  
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    externalLink: '',
    locationTagId: 'none'
  });
  const [websiteForm, setWebsiteForm] = useState({
    title: '',
    url: ''
  });
  const [locationTagForm, setLocationTagForm] = useState({
    name: '',
    color: '#3B82F6'
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date) {
      toast({
        title: "Error",
        description: "Title and date are required",
        variant: "destructive"
      });
      return;
    }

    onAddEvent({
      title: eventForm.title,
      date: eventForm.date,
      description: eventForm.description || undefined,
      externalLink: eventForm.externalLink || undefined,
      locationTagId: eventForm.locationTagId === 'none' ? undefined : eventForm.locationTagId || undefined
    });

    setEventForm({ title: '', date: '', description: '', externalLink: '', locationTagId: 'none' });
    toast({
      title: "Success",
      description: "Event added successfully"
    });
    console.log('Event added:', eventForm);
  };

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteForm.title || !websiteForm.url) {
      toast({
        title: "Error", 
        description: "Title and URL are required",
        variant: "destructive"
      });
      return;
    }

    onAddReferenceWebsite(websiteForm);
    setWebsiteForm({ title: '', url: '' });
    toast({
      title: "Success",
      description: "Reference website added successfully"
    });
    console.log('Website added:', websiteForm);
  };

  const handleDeleteEvent = (id: string) => {
    onDeleteEvent(id);
    toast({
      title: "Success",
      description: "Event deleted successfully"
    });
    console.log('Event deleted:', id);
  };

  const handleDeleteWebsite = (id: string) => {
    onDeleteReferenceWebsite(id);
    toast({
      title: "Success",
      description: "Reference website deleted successfully"
    });
    console.log('Website deleted:', id);
  };

  // Location tag handlers
  const handleAddLocationTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationTagForm.name) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await createLocationTagMutation.mutateAsync(locationTagForm);
      setLocationTagForm({ name: '', color: '#3B82F6' });
      toast({
        title: "Success",
        description: "Location tag added successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location tag",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLocationTag = async (id: string) => {
    try {
      await deleteLocationTagMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Location tag deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location tag",
        variant: "destructive"
      });
    }
  };

  // Helper function to get location tag by ID
  const getLocationTagById = (id: string | null) => {
    if (!id) return null;
    return locationTags.find(tag => tag.id === id);
  };

  return (
    <Card className="w-full max-w-4xl" data-testid="admin-interface">
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events" data-testid="tab-events">Events Management</TabsTrigger>
            <TabsTrigger value="websites" data-testid="tab-websites">Reference Websites</TabsTrigger>
            <TabsTrigger value="locations" data-testid="tab-locations">Location Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Add Event Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-title">Title *</Label>
                      <Input
                        id="event-title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Event title"
                        data-testid="input-event-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-date">Date *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                        data-testid="input-event-date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief event description"
                      data-testid="textarea-event-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-link">External Link</Label>
                    <Input
                      id="event-link"
                      type="url"
                      value={eventForm.externalLink}
                      onChange={(e) => setEventForm(prev => ({ ...prev, externalLink: e.target.value }))}
                      placeholder="https://example.com/event-details"
                      data-testid="input-event-link"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-location">Location (Optional)</Label>
                    <Select
                      value={eventForm.locationTagId}
                      onValueChange={(value) => setEventForm(prev => ({ ...prev, locationTagId: value }))}
                    >
                      <SelectTrigger data-testid="select-event-location">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No location</SelectItem>
                        {locationTags.map(tag => (
                          <SelectItem key={tag.id} value={tag.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" data-testid="button-add-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Existing Events ({events.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                      data-testid={`event-item-${event.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium" data-testid={`text-event-title-${event.id}`}>
                            {event.title}
                          </h4>
                          <Badge variant="outline" data-testid={`badge-event-date-${event.id}`}>
                            {event.date}
                          </Badge>
                          {event.locationTagId && (
                            <Badge 
                              variant="secondary" 
                              style={{ 
                                backgroundColor: getLocationTagById(event.locationTagId)?.color + '20',
                                borderColor: getLocationTagById(event.locationTagId)?.color 
                              }}
                              data-testid={`badge-event-location-${event.id}`}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              {getLocationTagById(event.locationTagId)?.name}
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-events">
                      No events added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="websites" className="space-y-6">
            {/* Add Website Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Reference Website</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddWebsite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website-title">Title *</Label>
                      <Input
                        id="website-title"
                        value={websiteForm.title}
                        onChange={(e) => setWebsiteForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Website name"
                        data-testid="input-website-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website-url">URL *</Label>
                      <Input
                        id="website-url"
                        type="url"
                        value={websiteForm.url}
                        onChange={(e) => setWebsiteForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        data-testid="input-website-url"
                      />
                    </div>
                  </div>
                  <Button type="submit" data-testid="button-add-website">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Website
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Websites List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reference Websites ({referenceWebsites.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referenceWebsites.map(website => (
                    <div
                      key={website.id}
                      className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                      data-testid={`website-item-${website.id}`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium" data-testid={`text-website-title-${website.id}`}>
                          {website.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {website.url}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(website.url, '_blank')}
                          data-testid={`button-visit-website-${website.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteWebsite(website.id)}
                          data-testid={`button-delete-website-${website.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {referenceWebsites.length === 0 && (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-websites">
                      No reference websites added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            {/* Add Location Tag Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Location Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLocationTag} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location-name">Location Name *</Label>
                      <Input
                        id="location-name"
                        value={locationTagForm.name}
                        onChange={(e) => setLocationTagForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Downtown, Park District, etc."
                        data-testid="input-location-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-color">Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="location-color"
                          type="color"
                          value={locationTagForm.color}
                          onChange={(e) => setLocationTagForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-16 h-10 p-1 border rounded"
                          data-testid="input-location-color"
                        />
                        <Input
                          value={locationTagForm.color}
                          onChange={(e) => setLocationTagForm(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#3B82F6"
                          className="flex-1"
                          data-testid="input-location-color-text"
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createLocationTagMutation.isPending}
                    data-testid="button-add-location"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createLocationTagMutation.isPending ? 'Adding...' : 'Add Location Tag'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Location Tags List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location Tags ({locationTags.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {locationTagsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading location tags...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {locationTags.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                        data-testid={`location-item-${tag.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: tag.color }}
                            data-testid={`location-color-${tag.id}`}
                          />
                          <div>
                            <h4 className="font-medium" data-testid={`text-location-name-${tag.id}`}>
                              {tag.name}
                            </h4>
                            <p className="text-sm text-muted-foreground font-mono">
                              {tag.color}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteLocationTag(tag.id)}
                          disabled={deleteLocationTagMutation.isPending}
                          data-testid={`button-delete-location-${tag.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {locationTags.length === 0 && (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-locations">
                        No location tags added yet
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}