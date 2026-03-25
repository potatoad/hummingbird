import React, { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { type DropResult } from '@hello-pangea/dnd'
import {
  Container, Box, FormControl, InputLabel, Select, MenuItem,
  Typography,
} from '@mui/material'
import JunketComponent from './components/junket/Junket'
import './App.css'

const API_URL = '' // using Vite proxy

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string }
type Room = { id: string; name: string; slots: Slot[] }
type Day = { id: string; date: string; rooms: Room[] }
type Junket = { id: string; name: string; days: Day[] }

export default function App() {
  const [junkets, setJunkets] = useState<Junket[]>([])
  const [selectedJunketId, setSelectedJunketId] = useState<string>('')
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [highlightedSlots, setHighlightedSlots] = useState<string[]>([])

  const socketRef = useRef<Socket | null>(null)

  const fetchJunkets = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/junkets`)
      const data = await res.json()
      setJunkets(data)
      if (data.length > 0 && !selectedJunketId) {
        setSelectedJunketId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch junkets:', error)
    }
  }, [selectedJunketId])

  const highlightSlot = useCallback((id: string) => {
    setHighlightedSlots((prev) => [...prev, id])

    setTimeout(() => {
      setHighlightedSlots((prev) => prev.filter((slotId) => slotId !== id))
    }, 1500) // Matched to the 1.5s animation duration in App.css
  }, [])

  useEffect(() => {
    const initFetch = async () => {
      await fetchJunkets()
    }
    initFetch()

    // Combined socket listener: Fetches new data and triggers glow if a slotId is provided
    socketRef.current = io()

    socketRef.current.on('board-updated', (data) => {
      console.log('Another user updated the board. Refreshing data...')
      fetchJunkets()
      if (data && data.slotId) {
        highlightSlot(data.slotId)
      }
    })

    return () => {
      socketRef.current?.off('board-updated')
      socketRef.current?.disconnect()
    }
  }, [highlightSlot, fetchJunkets])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside a valid list or didn't move
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Deep clone junkets to optimistically update UI
    const newJunkets = JSON.parse(JSON.stringify(junkets)) as Junket[]
    const currentJunket = newJunkets.find(j => j.id === selectedJunketId)
    if (!currentJunket) return

    const currentDay = currentJunket.days[activeTabIndex]
    const sourceRoom = currentDay.rooms.find(r => r.id === source.droppableId)
    const destRoom = currentDay.rooms.find(r => r.id === destination.droppableId)

    if (!sourceRoom || !destRoom) return

    // Remove slot from source
    const [movedSlot] = sourceRoom.slots.splice(source.index, 1)

    // Calculate new orderIndex (midpoint math)
    let newOrderIndex = 0
    if (destRoom.slots.length === 0) {
      newOrderIndex = 1 // First item in empty room
    } else if (destination.index === 0) {
      newOrderIndex = destRoom.slots[0].orderIndex - 1 // Dropped at the top
    } else if (destination.index >= destRoom.slots.length) {
      newOrderIndex = destRoom.slots[destRoom.slots.length - 1].orderIndex + 1 // Dropped at the bottom
    } else {
      // Dropped in the middle
      const prevOrder = destRoom.slots[destination.index - 1].orderIndex
      const nextOrder = destRoom.slots[destination.index].orderIndex
      newOrderIndex = (prevOrder + nextOrder) / 2
    }

    // Update slot data
    movedSlot.orderIndex = newOrderIndex
    movedSlot.roomId = destRoom.id

    // Add to destination
    destRoom.slots.splice(destination.index, 0, movedSlot)

    // NOTE: highlightSlot(draggableId) has been REMOVED from here.

    // Optimistically update UI
    setJunkets(newJunkets)

    // Persist to backend
    try {
      await fetch(`${API_URL}/slots/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Pass the socket ID so the server knows to ignore us!
          'x-socket-id': socketRef.current?.id || ''
        },
        body: JSON.stringify({ orderIndex: newOrderIndex, roomId: destRoom.id }),
      })
    } catch (error) {
      console.error('Failed to update slot order:', error)
      fetchJunkets() // Revert on failure
    }
  }

  const selectedJunket = junkets.find((j) => j.id === selectedJunketId)
  const days = selectedJunket?.days || []

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">Junket Board</Typography>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Junket</InputLabel>
          <Select
            value={selectedJunketId}
            label="Select Junket"
            onChange={(e) => {
              setSelectedJunketId(e.target.value)
              setActiveTabIndex(0)
            }}
          >
            {junkets.map((junket) => (
              <MenuItem key={junket.id} value={junket.id}>{junket.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedJunket && days.length > 0 ? (
        <JunketComponent
          junket={selectedJunket}
          days={days}
          highlightedSlots={highlightedSlots}
          activeTabIndex={activeTabIndex}
          handleTabChange={(_, val) => setActiveTabIndex(val)}
          handleDragEnd={handleDragEnd}
        />
      ) : (
        <Typography color="text.secondary">No data available.</Typography>
      )}
    </Container>
  )
}