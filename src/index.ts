import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import type { Request, Response } from 'express'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }, // Allow frontend connections
})

app.use(cors()) // Add this before your routes!
app.use(express.json())

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

// ==========================================
// JUNKET ROUTES
// ==========================================

// Create a new Junket
app.post('/junkets', async (req: Request, res: Response) => {
  try {
    const junket = await prisma.junket.create({
      data: req.body, // Expects { name, description?, location?, days? }
    })
    io.emit('board-updated')
    res.status(201).json(junket)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create junket', details: error })
  }
})

// Query all Junkets (with related Days, Rooms, and Slots)
app.get('/junkets', async (req, res) => {
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
    })

    const orderedJunkets = junkets.map((junket) => ({
      ...junket,
      days: [...junket.days]
        .sort((a, b) => {
          const aTime = typeof a.date === 'string' ? new Date(a.date).getTime() : (a.date?.getTime() ?? 0)
          const bTime = typeof b.date === 'string' ? new Date(b.date).getTime() : (b.date?.getTime() ?? 0)
          return aTime - bTime
        })
        .map((day) => ({
          ...day,
          rooms: [...day.rooms]
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((room) => ({
              ...room,
              slots: [...room.slots].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
            })),
        })),
    }))

    res.json(orderedJunkets)
  } catch (error) {
    console.error('Failed to fetch junkets:', error)
    res.status(500).json({ error: 'Failed to fetch junkets', details: error })
  }
})

// Delete a Junket (Cascades to Days, Rooms, and Slots)
app.delete('/junkets/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.junket.delete({
      where: { id },
    })
    io.emit('board-updated')
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete junket', details: error })
  }
})

// Update a Junket
app.patch('/junkets/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const senderSocketId = req.headers['x-socket-id'] as string

  try {
    const updatedJunket = await prisma.junket.update({
      where: { id },
      data: req.body,
    })
    if (senderSocketId) {
      io.except(senderSocketId).emit('board-updated', { junketId: id })
    } else {
      io.emit('board-updated', { junketId: id })
    }
    res.json(updatedJunket)
  } catch (error) {
    console.error('Error updating junket:', error)
    res.status(500).json({ error: 'Failed to update junket' })
  }
})

// ==========================================
// DAY ROUTES
// ==========================================

// Create a new Day for a specific Junket
app.post('/days', async (req: Request, res: Response) => {
  try {
    const { date, junketId } = req.body // junketId is required
    const day = await prisma.day.create({
      data: {
        date: new Date(date),
        junketId,
      },
    })
    res.status(201).json(day)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create day', details: error })
  }
})

// Query all Days
app.get('/days', async (req: Request, res: Response) => {
  try {
    const days = await prisma.day.findMany({ include: { rooms: true } })
    res.json(days)
  } catch (error) {
    res.json([])
  }
})

// Delete a Day (Cascades to Rooms and Slots)
app.delete('/days/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.day.delete({
      where: { id },
    })
    io.emit('board-updated')
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete day', details: error })
  }
})

// Update a Day
app.patch('/days/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const senderSocketId = req.headers['x-socket-id'] as string

  try {
    const updatedDay = await prisma.day.update({
      where: { id },
      data: req.body,
    })
    if (senderSocketId) {
      io.except(senderSocketId).emit('board-updated', { dayId: id })
    } else {
      io.emit('board-updated', { dayId: id })
    }
    res.json(updatedDay)
  } catch (error) {
    console.error('Error updating day:', error)
    res.status(500).json({ error: 'Failed to update day' })
  }
})

// ==========================================
// ROOM ROUTES
// ==========================================

// Create a new Room for a specific Day
app.post('/rooms', async (req: Request, res: Response) => {
  try {
    // Expects name, dayId, and optional producer, timer, tech, streamKey
    const room = await prisma.room.create({
      data: req.body,
    })
    io.emit('board-updated')
    res.status(201).json(room)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create room', details: error })
  }
})

// Query all Rooms
app.get('/rooms', async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({ include: { slots: true } })
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms', details: error })
  }
})

// Delete a Room (Cascades to Slots)
app.delete('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.room.delete({
      where: { id },
    })
    io.emit('board-updated')
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete room', details: error })
  }
})

// Update a Room
app.patch('/rooms/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const senderSocketId = req.headers['x-socket-id'] as string

  try {
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: req.body,
    })
    if (senderSocketId) {
      io.except(senderSocketId).emit('board-updated', { roomId: id })
    } else {
      io.emit('board-updated', { roomId: id })
    }
    res.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    res.status(500).json({ error: 'Failed to update room' })
  }
})

// ==========================================
// SLOT ROUTES
// ==========================================

// Create a new Slot for a specific Room
app.post('/slots', async (req: Request, res: Response) => {
  try {
    // Expects title, duration, orderIndex, roomId, and optional description, isVirtual, isNote
    const slot = await prisma.slot.create({
      data: req.body,
    })
    io.emit('board-updated')
    res.status(201).json(slot)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create slot', details: error })
  }
})

// Query all Slots
app.get('/slots', async (req: Request, res: Response) => {
  try {
    const slots = await prisma.slot.findMany()
    res.json(slots)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots', details: error })
  }
})

// Update a Slot (used for drag and drop reordering)
app.patch('/slots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { orderIndex, roomId, name, outlet, duration, isVirtual, isBreak, status } = req.body

    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: {
        ...(orderIndex !== undefined && { orderIndex }),
        ...(roomId !== undefined && { roomId }),
        ...(name !== undefined && { name }),
        ...(outlet !== undefined && { outlet }),
        ...(duration !== undefined && { duration }),
        ...(isVirtual !== undefined && { isVirtual }),
        ...(isBreak !== undefined && { isBreak }),
        ...(status !== undefined && { status }),
      },
    })

    io.emit('board-updated', { slotId: updatedSlot.id })
    res.json(updatedSlot)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update slot', details: error })
  }
})

// Delete a Slot
app.delete('/slots/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.slot.delete({
      where: { id },
    })
    io.emit('board-updated')
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete slot', details: error })
  }
})

// Start the server
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server and WebSockets are running on http://localhost:${PORT}`)
})
