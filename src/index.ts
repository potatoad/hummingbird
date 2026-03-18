import 'dotenv/config'

import express, { Request, Response } from 'express';
import { PrismaClient } from '../prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import cors from 'cors';


const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const app = express();

app.use(cors()); // Add this before your routes!
app.use(express.json());

// ==========================================
// JUNKET ROUTES
// ==========================================

// Create a new Junket
app.post('/junkets', async (req: Request, res: Response) => {
  try {
    const junket = await prisma.junket.create({
      data: req.body, // Expects { name, description?, location?, days? }
    });
    res.status(201).json(junket);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create junket', details: error });
  }
});

// Query all Junkets (with related Days, Rooms, and Slots)
app.get('/junkets', async (req: Request, res: Response) => {
  try {
    const junkets = await prisma.junket.findMany({
      include: {
        days: {
          include: {
            rooms: {
              include: {
                slots: true,
              },
            },
          },
        },
      },
    });
    res.json(junkets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch junkets', details: error });
  }
});

// Delete a Junket (Cascades to Days, Rooms, and Slots)
app.delete('/junkets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.junket.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete junket', details: error });
  }
});

// ==========================================
// DAY ROUTES
// ==========================================

// Create a new Day for a specific Junket
app.post('/days', async (req: Request, res: Response) => {
  try {
    const { date, junketId } = req.body; // junketId is required
    const day = await prisma.day.create({
      data: {
        date: new Date(date), 
        junketId,
      },
    });
    res.status(201).json(day);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create day', details: error });
  }
});

// Query all Days
app.get('/days', async (req: Request, res: Response) => {
  try {
    const days = await prisma.day.findMany({ include: { rooms: true } });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch days', details: error });
  }
});

// Delete a Day (Cascades to Rooms and Slots)
app.delete('/days/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.day.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete day', details: error });
  }
});

// ==========================================
// ROOM ROUTES
// ==========================================

// Create a new Room for a specific Day
app.post('/rooms', async (req: Request, res: Response) => {
  try {
    // Expects name, dayId, and optional producer, timer, tech, streamKey
    const room = await prisma.room.create({
      data: req.body, 
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create room', details: error });
  }
});

// Query all Rooms
app.get('/rooms', async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({ include: { slots: true } });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms', details: error });
  }
});

// Delete a Room (Cascades to Slots)
app.delete('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.room.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete room', details: error });
  }
});

// ==========================================
// SLOT ROUTES
// ==========================================

// Create a new Slot for a specific Room
app.post('/slots', async (req: Request, res: Response) => {
  try {
    // Expects title, duration, orderIndex, roomId, and optional description, isVirtual, isNote
    const slot = await prisma.slot.create({
      data: req.body,
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create slot', details: error });
  }
});

// Query all Slots
app.get('/slots', async (req: Request, res: Response) => {
  try {
    const slots = await prisma.slot.findMany();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots', details: error });
  }
});

// Delete a Slot
app.delete('/slots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.slot.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete slot', details: error });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});