import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Location tags for organizing events by location
export const locationTags = pgTable("location_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // Hex color code like #3B82F6
});

// Events table for calendar events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  description: text("description"),
  externalLink: text("external_link"),
  locationTagId: varchar("location_tag_id"), // Optional reference to location tag
});

// Reference websites for admin quick access
export const referenceWebsites = pgTable("reference_websites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
});

// User interest tracking
export const userInterests = pgTable("user_interests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  sessionId: text("session_id").notNull(), // Browser session for anonymous users
});

// Calendar metadata for tracking last update time
export const calendarMetadata = pgTable("calendar_metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertLocationTagSchema = createInsertSchema(locationTags).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertReferenceWebsiteSchema = createInsertSchema(referenceWebsites).omit({
  id: true,
});

export const insertUserInterestSchema = createInsertSchema(userInterests).omit({
  id: true,
});

export const insertCalendarMetadataSchema = createInsertSchema(calendarMetadata).omit({
  id: true,
});

export type LocationTag = typeof locationTags.$inferSelect;
export type InsertLocationTag = z.infer<typeof insertLocationTagSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type ReferenceWebsite = typeof referenceWebsites.$inferSelect;
export type InsertReferenceWebsite = z.infer<typeof insertReferenceWebsiteSchema>;
export type UserInterest = typeof userInterests.$inferSelect;
export type InsertUserInterest = z.infer<typeof insertUserInterestSchema>;
export type CalendarMetadata = typeof calendarMetadata.$inferSelect;
export type InsertCalendarMetadata = z.infer<typeof insertCalendarMetadataSchema>;
