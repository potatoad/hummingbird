import React from 'react';
import { Box } from '@mui/material';
import RoomComponent from '../room/Room';

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string };
type Room = { id: string; name: string; slots: Slot[] };
type Day = { id: string; date: string; rooms: Room[] };

interface DayProps {
  day: Day;
  highlightedSlots: string[];
}

const DayComponent: React.FC<DayProps> = ({ day, highlightedSlots }) => {
  return (
    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, height: '100%' }}>
      {day.rooms.map((room) => (
        <RoomComponent
          key={room.id}
          room={room}
          highlightedSlots={highlightedSlots}
        />
      ))}
    </Box>
  );
};

export default DayComponent;