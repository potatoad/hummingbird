import { type DropResult } from '@hello-pangea/dnd'
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import JunketComponent from './components/junket/Junket'
import { type Junket } from './utils/types'

const API_URL = '' // using Vite proxy

export default function App() {
  const [junkets, setJunkets] = useState<Junket[]>([])
  const [selectedJunketId, setSelectedJunketId] = useState<string>('')
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [highlightedSlots, setHighlightedSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)

  const fetchJunkets = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/junkets`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const data: Junket[] = await res.json()
      setJunkets(data)
      setError(null)
      if (data.length > 0 && !selectedJunketId) {
        setSelectedJunketId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch junkets:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setJunkets([])
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
    <Box sx={{ p: 2 }}>
      <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction={'row'} spacing={1} sx={{ alignItems: 'center', position: 'relative' }}>
          <img
            src='/favicon/favicon.svg'
            width={'60px'}
            height={'60px'}
            style={{ position: 'absolute', top: '-23px', left: '-8px' }}
            alt='Hummingbird Logo'
          />
          <Typography variant='h1' component='h1' fontWeight='bold' sx={{ pl: '30px' }}>
            Hummingbird
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          spacing={2}
          sx={{
            justifyContent: 'flex-end',
            alignItems: 'stretch',
          }}
        >
          {error && (
            <Typography variant='body1' color='error'>
              Error: {error}
            </Typography>
          )}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Select Junket</InputLabel>
            <Select
              value={selectedJunketId}
              label='Select Junket'
              size='small'
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
        </Stack>
      </Stack>

      {selectedJunket ? (
        <JunketComponent
          junket={selectedJunket}
          days={days}
          highlightedSlots={highlightedSlots}
          activeTabIndex={activeTabIndex}
          setActiveTabIndex={setActiveTabIndex}
          handleDragEnd={handleDragEnd}
          onBoardNeedsRefresh={fetchJunkets}
        />
      ) : (
        <Typography color='text.secondary'>No data available.</Typography>
      )}
    </Box>
  )
}
