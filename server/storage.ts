import { type Event, type InsertEvent, type ReferenceWebsite, type InsertReferenceWebsite, type UserInterest, type InsertUserInterest, type LocationTag, type InsertLocationTag, type CalendarMetadata, events, locationTags, referenceWebsites, userInterests, calendarMetadata } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Location Tags
  getLocationTags(): Promise<LocationTag[]>;
  getLocationTag(id: string): Promise<LocationTag | undefined>;
  createLocationTag(locationTag: InsertLocationTag): Promise<LocationTag>;
  updateLocationTag(id: string, locationTag: Partial<InsertLocationTag>): Promise<LocationTag | undefined>;
  deleteLocationTag(id: string): Promise<boolean>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventsByDate(date: string): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Reference Websites
  getReferenceWebsites(): Promise<ReferenceWebsite[]>;
  createReferenceWebsite(website: InsertReferenceWebsite): Promise<ReferenceWebsite>;
  updateReferenceWebsite(id: string, website: Partial<InsertReferenceWebsite>): Promise<ReferenceWebsite | undefined>;
  deleteReferenceWebsite(id: string): Promise<boolean>;
  
  // User Interests　I dont use it anymore. So it can be removed.
  getUserInterests(sessionId: string): Promise<string[]>; // Returns event IDs
  toggleUserInterest(sessionId: string, eventId: string): Promise<boolean>; // Returns new state
  
  // Calendar Metadata
  getLastUpdated(): Promise<Date | null>;
  updateLastUpdated(): Promise<void>;
}

export class MemStorage implements IStorage {
  private locationTags: Map<string, LocationTag>;
  private events: Map<string, Event>;
  private referenceWebsites: Map<string, ReferenceWebsite>;
  private userInterests: Map<string, Set<string>>; // sessionId -> Set<eventId>

  constructor() {
    this.locationTags = new Map();
    this.events = new Map();
    this.referenceWebsites = new Map();
    this.userInterests = new Map();
    
    // Initialize with some mock data
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Mock location tags (3 colors as requested)
    const mockLocationTags: InsertLocationTag[] = [
      { name: "Downtown", color: "#3B82F6" }, // Blue
      { name: "Park District", color: "#10B981" }, // Green
      { name: "Arts Quarter", color: "#F59E0B" } // Amber
    ];
    
    const locationTagIds: string[] = [];
    for (const tag of mockLocationTags) {
      const created = await this.createLocationTag(tag);
      locationTagIds.push(created.id);
    }
    
    // Mock events with location tags
    const mockEvents: InsertEvent[] = [
      {
        title: "Weekly Farmers Market",
        date: "2025-01-15",
        description: "Fresh local produce, artisanal goods, and community vendors",
        externalLink: "https://example.com/farmers-market",
        locationTagId: locationTagIds[0] // Downtown
      },
      {
        title: "Jazz Night at The Blue Note",
        date: "2025-01-15",
        description: "Live jazz performance featuring local musicians",
        externalLink: "https://example.com/jazz-night",
        locationTagId: locationTagIds[0] // Downtown
      },
      {
        title: "Community Art Fair",
        date: "2025-01-20",
        description: "Local artists showcase their work",
        externalLink: "https://example.com/art-fair",
        locationTagId: locationTagIds[2] // Arts Quarter
      },
      {
        title: "Classical Concert Series",
        date: "2025-01-25",
        description: "Monthly classical music performance",
        externalLink: "https://example.com/classical-concert",
        locationTagId: locationTagIds[1] // Park District
      },
      // September 2025 events for testing badge width and filtering
      {
        title: "Example Event",
        date: "2025-09-17",
        description: "Test event for September",
        externalLink: "https://example.com/",
        locationTagId: locationTagIds[0] // Downtown
      },
      {
        title: "Downtown Market",
        date: "2025-09-17",
        description: "Another downtown event",
        externalLink: "https://example.com/",
        locationTagId: locationTagIds[0] // Downtown
      },
      {
        title: "Park Festival",
        date: "2025-09-17",
        description: "Park district event",
        externalLink: "https://example.com/",
        locationTagId: locationTagIds[1] // Park District
      },
      {
        title: "Visual Test Event", 
        date: "2025-09-25",
        description: "Another test event for September",
        externalLink: "https://example.com/",
        locationTagId: locationTagIds[2] // Arts Quarter
      }
    ];
    
    for (const event of mockEvents) {
      await this.createEvent(event);
    }
    
    // Mock reference websites
    const mockWebsites: InsertReferenceWebsite[] = [
      { title: "Local Events Board", url: "https://example.com/events" },
      { title: "City Cultural Calendar", url: "https://example.com/culture" },
      { title: "Music Venue Listings", url: "https://example.com/music" }
    ];
    
    for (const website of mockWebsites) {
      await this.createReferenceWebsite(website);
    }
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.date === date);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  // Location Tags methods
  async getLocationTags(): Promise<LocationTag[]> {
    return Array.from(this.locationTags.values());
  }

  async getLocationTag(id: string): Promise<LocationTag | undefined> {
    return this.locationTags.get(id);
  }

  async createLocationTag(insertLocationTag: InsertLocationTag): Promise<LocationTag> {
    const id = randomUUID();
    const locationTag: LocationTag = { ...insertLocationTag, id };
    this.locationTags.set(id, locationTag);
    return locationTag;
  }

  async updateLocationTag(id: string, updateData: Partial<InsertLocationTag>): Promise<LocationTag | undefined> {
    const existing = this.locationTags.get(id);
    if (!existing) return undefined;
    
    const updated: LocationTag = { ...existing, ...updateData };
    this.locationTags.set(id, updated);
    return updated;
  }

  async deleteLocationTag(id: string): Promise<boolean> {
    return this.locationTags.delete(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      id,
      title: insertEvent.title,
      date: insertEvent.date,
      description: insertEvent.description || null,
      externalLink: insertEvent.externalLink || null,
      locationTagId: insertEvent.locationTagId || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    
    const updated: Event = { ...existing, ...updateData };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async getReferenceWebsites(): Promise<ReferenceWebsite[]> {
    return Array.from(this.referenceWebsites.values());
  }

  async createReferenceWebsite(insertWebsite: InsertReferenceWebsite): Promise<ReferenceWebsite> {
    const id = randomUUID();
    const website: ReferenceWebsite = { ...insertWebsite, id };
    this.referenceWebsites.set(id, website);
    return website;
  }

  async updateReferenceWebsite(id: string, updateData: Partial<InsertReferenceWebsite>): Promise<ReferenceWebsite | undefined> {
    const existing = this.referenceWebsites.get(id);
    if (!existing) return undefined;
    
    const updated: ReferenceWebsite = { ...existing, ...updateData };
    this.referenceWebsites.set(id, updated);
    return updated;
  }

  async deleteReferenceWebsite(id: string): Promise<boolean> {
    return this.referenceWebsites.delete(id);
  }

  async getUserInterests(sessionId: string): Promise<string[]> {
    const interests = this.userInterests.get(sessionId);
    return interests ? Array.from(interests) : [];
  }

  async toggleUserInterest(sessionId: string, eventId: string): Promise<boolean> {
    if (!this.userInterests.has(sessionId)) {
      this.userInterests.set(sessionId, new Set());
    }
    
    const interests = this.userInterests.get(sessionId)!;
    const wasInterested = interests.has(eventId);
    
    if (wasInterested) {
      interests.delete(eventId);
    } else {
      interests.add(eventId);
    }
    
    return !wasInterested; // Return new state
  }

  async getLastUpdated(): Promise<Date | null> {
    // For in-memory storage, we don't track this
    return null;
  }

  async updateLastUpdated(): Promise<void> {
    // For in-memory storage, we don't track this
  }
}

export class DatabaseStorage implements IStorage {
  async getLocationTags(): Promise<LocationTag[]> {
    return await db.select().from(locationTags);
  }

  async getLocationTag(id: string): Promise<LocationTag | undefined> {
    const [tag] = await db.select().from(locationTags).where(eq(locationTags.id, id));
    return tag || undefined;
  }

  async createLocationTag(insertLocationTag: InsertLocationTag): Promise<LocationTag> {
    const [tag] = await db
      .insert(locationTags)
      .values(insertLocationTag)
      .returning();
    await this.updateLastUpdated();
    return tag;
  }

  async updateLocationTag(id: string, updateData: Partial<InsertLocationTag>): Promise<LocationTag | undefined> {
    const [tag] = await db
      .update(locationTags)
      .set(updateData)
      .where(eq(locationTags.id, id))
      .returning();
    if (tag) await this.updateLastUpdated();
    return tag || undefined;
  }

  async deleteLocationTag(id: string): Promise<boolean> {
    const result = await db.delete(locationTags).where(eq(locationTags.id, id));
    const wasDeleted = result.rowCount !== null && result.rowCount > 0;
    if (wasDeleted) await this.updateLastUpdated();
    return wasDeleted;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventsByDate(date: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.date, date));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    await this.updateLastUpdated();
    return event;
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    if (event) await this.updateLastUpdated();
    return event || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    const wasDeleted = result.rowCount !== null && result.rowCount > 0;
    if (wasDeleted) await this.updateLastUpdated();
    return wasDeleted;
  }

  async getReferenceWebsites(): Promise<ReferenceWebsite[]> {
    return await db.select().from(referenceWebsites);
  }

  async createReferenceWebsite(insertWebsite: InsertReferenceWebsite): Promise<ReferenceWebsite> {
    const [website] = await db
      .insert(referenceWebsites)
      .values(insertWebsite)
      .returning();
    await this.updateLastUpdated();
    return website;
  }

  async updateReferenceWebsite(id: string, updateData: Partial<InsertReferenceWebsite>): Promise<ReferenceWebsite | undefined> {
    const [website] = await db
      .update(referenceWebsites)
      .set(updateData)
      .where(eq(referenceWebsites.id, id))
      .returning();
    if (website) await this.updateLastUpdated();
    return website || undefined;
  }

  async deleteReferenceWebsite(id: string): Promise<boolean> {
    const result = await db.delete(referenceWebsites).where(eq(referenceWebsites.id, id));
    const wasDeleted = result.rowCount !== null && result.rowCount > 0;
    if (wasDeleted) await this.updateLastUpdated();
    return wasDeleted;
  }

  async getUserInterests(sessionId: string): Promise<string[]> {
    const interests = await db
      .select({ eventId: userInterests.eventId })
      .from(userInterests)
      .where(eq(userInterests.sessionId, sessionId));
    return interests.map(i => i.eventId);
  }

  async toggleUserInterest(sessionId: string, eventId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userInterests)
      .where(and(
        eq(userInterests.sessionId, sessionId),
        eq(userInterests.eventId, eventId)
      ));

    if (existing) {
      await db
        .delete(userInterests)
        .where(and(
          eq(userInterests.sessionId, sessionId),
          eq(userInterests.eventId, eventId)
        ));
      return false; // No longer interested
    } else {
      await db
        .insert(userInterests)
        .values({ sessionId, eventId });
      return true; // Now interested
    }
  }

  async getLastUpdated(): Promise<Date | null> {
    const [metadata] = await db
      .select({ lastUpdated: calendarMetadata.lastUpdated })
      .from(calendarMetadata)
      .orderBy(calendarMetadata.lastUpdated)
      .limit(1);
    return metadata?.lastUpdated || null;
  }

  async updateLastUpdated(): Promise<void> {
    // First, delete any existing metadata records
    await db.delete(calendarMetadata);
    // Insert a new record with current timestamp
    await db.insert(calendarMetadata).values({});
  }
}

export const storage = new DatabaseStorage();
