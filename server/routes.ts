import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertReferenceWebsiteSchema, insertUserInterestSchema, insertLocationTagSchema } from "@shared/schema";
import { z } from "zod";
import 'express-session';
declare module 'express-session' {
    interface SessionData {
        isAdmin?: boolean; // isAdmin をセッションデータに追加
    }
}
interface AuthRequest extends Request {
  session: Request['session'] & { isAdmin?: boolean };
}
// Session-based admin authentication middleware
const adminAuth = (req: AuthRequest, res: any, next: any) => {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  app.post("/api/admin/login", async (req: AuthRequest, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        console.error('ADMIN_PASSWORD environment variable not set');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      if (password !== adminPassword) {
        return res.status(401).json({ error: 'Invalid admin password' });
      }
      // 🚨 修正: res.json の実行までコールバックチェーンに含める
      await new Promise<void>((resolve, reject) => {
          req.session.regenerate((err) => {
              if (err) return reject(err);

              req.session.isAdmin = true; 

            req.session.save((err) => {
                if (err) return reject(err);

                req.session.reload((err) => {
                    if (err) return reject(err);

                    // res.json をコールバック内に残す
                    res.json({ success: true, message: 'Admin authenticated successfully', isAdmin: true }); // 🚨 変更: isAdmin: true を追加
                    resolve(); 
                });
            });
          });
      });

      // ⚠️ res.json はコールバック内で実行されるため、ここには到達しない
    } catch (error) {
        console.error('Error during admin login:', error);
        if (!res.headersSent) { 
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
  });
  
  app.post("/api/admin/logout", async (req: AuthRequest, res) => {
    try {
      // Destroy session completely on logout
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        
        res.json({ success: true, message: 'Admin logged out successfully' });
      });
    } catch (error) {
      console.error('Error during admin logout:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });
  
  app.get("/api/admin/status", async (req: AuthRequest, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });

  // Location Tags routes (admin protected)
  app.get("/api/location-tags", async (req, res) => {
    try {
      const locationTags = await storage.getLocationTags();
      res.json(locationTags);
    } catch (error) {
      console.error('Error fetching location tags:', error);
      res.status(500).json({ error: 'Failed to fetch location tags' });
    }
  });

  app.get("/api/calendar/last-updated", async (req, res) => {
    try {
      const lastUpdated = await storage.getLastUpdated();
      res.json({ lastUpdated });
    } catch (error) {
      console.error('Error fetching last updated time:', error);
      res.status(500).json({ error: 'Failed to fetch last updated time' });
    }
  });

  app.post("/api/location-tags", adminAuth, async (req: AuthRequest, res) => {
    try {
      const result = insertLocationTagSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid location tag data', details: result.error.issues });
      }

      const locationTag = await storage.createLocationTag(result.data);
      res.status(201).json(locationTag);
    } catch (error) {
      console.error('Error creating location tag:', error);
      res.status(500).json({ error: 'Failed to create location tag' });
    }
  });

  app.put("/api/location-tags/:id", adminAuth, async (req: AuthRequest, res) => {
    try {
      const result = insertLocationTagSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid location tag data', details: result.error.issues });
      }

      const locationTag = await storage.updateLocationTag(req.params.id, result.data);
      if (!locationTag) {
        return res.status(404).json({ error: 'Location tag not found' });
      }

      res.json(locationTag);
    } catch (error) {
      console.error('Error updating location tag:', error);
      res.status(500).json({ error: 'Failed to update location tag' });
    }
  });

  app.delete("/api/location-tags/:id", adminAuth, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteLocationTag(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Location tag not found' });
      }

      res.json({ success: true, message: 'Location tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting location tag:', error);
      res.status(500).json({ error: 'Failed to delete location tag' });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.get("/api/events/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const events = await storage.getEventsByDate(date);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by date:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.post("/api/events", adminAuth, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid event data', details: error.errors });
      } else {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
      }
    }
  });

  app.put("/api/events/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid event data', details: error.errors });
      } else {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
      }
    }
  });

  app.delete("/api/events/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // Reference websites routes
  app.get("/api/reference-websites", async (req, res) => {
    try {
      const websites = await storage.getReferenceWebsites();
      res.json(websites);
    } catch (error) {
      console.error('Error fetching reference websites:', error);
      res.status(500).json({ error: 'Failed to fetch reference websites' });
    }
  });

  app.post("/api/reference-websites", adminAuth, async (req, res) => {
    try {
      const validatedData = insertReferenceWebsiteSchema.parse(req.body);
      const website = await storage.createReferenceWebsite(validatedData);
      res.status(201).json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid website data', details: error.errors });
      } else {
        console.error('Error creating reference website:', error);
        res.status(500).json({ error: 'Failed to create reference website' });
      }
    }
  });

  app.put("/api/reference-websites/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertReferenceWebsiteSchema.partial().parse(req.body);
      const website = await storage.updateReferenceWebsite(id, validatedData);
      
      if (!website) {
        return res.status(404).json({ error: 'Reference website not found' });
      }
      
      res.json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid website data', details: error.errors });
      } else {
        console.error('Error updating reference website:', error);
        res.status(500).json({ error: 'Failed to update reference website' });
      }
    }
  });

  app.delete("/api/reference-websites/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteReferenceWebsite(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Reference website not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting reference website:', error);
      res.status(500).json({ error: 'Failed to delete reference website' });
    }
  });

  // User interests routes (session-based)
  app.get("/api/user-interests", async (req: AuthRequest, res) => {
    try {
      const sessionId = req.sessionID || 'anonymous';
      const interests = await storage.getUserInterests(sessionId);
      res.json({ interests });
    } catch (error) {
      console.error('Error fetching user interests:', error);
      res.status(500).json({ error: 'Failed to fetch user interests' });
    }
  });

  app.post("/api/user-interests/toggle", async (req: AuthRequest, res) => {
    try {
      const sessionId = req.sessionID || 'anonymous';
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // Validate that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      const isInterested = await storage.toggleUserInterest(sessionId, eventId);
      res.json({ eventId, isInterested });
    } catch (error) {
      console.error('Error toggling user interest:', error);
      res.status(500).json({ error: 'Failed to toggle user interest' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
