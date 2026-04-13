import { type DropResult } from '@hello-pangea/dnd'
import { Box, Container, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import './App.css'
import JunketComponent from './components/junket/Junket'
import { type Junket } from './types'

const API_URL = '' // using Vite proxy

export default function App() {
  const [junkets, setJunkets] = useState<Junket[]>([])
  const [selectedJunketId, setSelectedJunketId] = useState<string>('')
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [highlightedSlots, setHighlightedSlots] = useState<string[]>([])

  const socketRef = useRef<Socket | null>(null)

  const fetchJunkets = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/junkets`)
      const data: Junket[] = await res.json()
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
    }, 1500)
  }, [])

  useEffect(() => {
    const initFetch = async () => {
      await fetchJunkets()
    }
    initFetch()

    socketRef.current = io()

    socketRef.current.on('board-updated', (data) => {
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

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newJunkets = JSON.parse(JSON.stringify(junkets)) as Junket[]
    const currentJunket = newJunkets.find((j) => j.id === selectedJunketId)
    if (!currentJunket) return

    const currentDay = currentJunket.days[activeTabIndex]
    const sourceRoom = currentDay.rooms.find((r) => r.id === source.droppableId)
    const destRoom = currentDay.rooms.find((r) => r.id === destination.droppableId)

    if (!sourceRoom || !destRoom) return

    const [movedSlot] = sourceRoom.slots.splice(source.index, 1)

    let newOrderIndex = 0
    if (destRoom.slots.length === 0) {
      newOrderIndex = 1
    } else if (destination.index === 0) {
      newOrderIndex = destRoom.slots[0].orderIndex - 1
    } else if (destination.index >= destRoom.slots.length) {
      newOrderIndex = destRoom.slots[destRoom.slots.length - 1].orderIndex + 1
    } else {
      const prevOrder = destRoom.slots[destination.index - 1].orderIndex
      const nextOrder = destRoom.slots[destination.index].orderIndex
      newOrderIndex = (prevOrder + nextOrder) / 2
    }

    movedSlot.orderIndex = newOrderIndex
    movedSlot.roomId = destRoom.id

    destRoom.slots.splice(destination.index, 0, movedSlot)
    setJunkets(newJunkets)

    try {
      await fetch(`${API_URL}/slots/${draggableId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-socket-id': socketRef.current?.id || '',
        },
        body: JSON.stringify({ orderIndex: newOrderIndex, roomId: destRoom.id }),
      })
    } catch (error) {
      console.error('Failed to update slot order:', error)
      fetchJunkets()
    }
  }

  const selectedJunket = junkets.find((j) => j.id === selectedJunketId)
  const days = selectedJunket?.days || []

  return (
    <Container maxWidth='xl' sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' component='h1' fontWeight='bold'>
          Junket Board
        </Typography>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Select Junket</InputLabel>
          <Select
            value={selectedJunketId}
            label='Select Junket'
            onChange={(e) => {
              setSelectedJunketId(e.target.value)
              setActiveTabIndex(0)
            }}
          >
            {junkets.map((junket) => (
              <MenuItem key={junket.id} value={junket.id}>
                {junket.name}
              </MenuItem>
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
        <Typography color='text.secondary'>No data available.</Typography>
      )}
    </Container>
  )
}
