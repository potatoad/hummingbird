import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Paper, Typography, Box, List } from '@mui/material';
import SlotComponent from '../slot/Slot';

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string };
type Room = { id: string; name: string; slots: Slot[] };

interface RoomProps {
  room: Room;
  highlightedSlots: string[];
}

const RoomComponent: React.FC<RoomProps> = ({ room, highlightedSlots }) => {
  return (
    <Paper key={room.id} sx={{ minWidth: 320, maxWidth: 320, bgcolor: 'grey.100', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 250px)' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
        <Typography variant="h6">{room.name}</Typography>
      </Box>

      <Droppable droppableId={room.id}>
        {(provided) => (
          <List
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{
              p: 2,
              overflowY: 'auto',
              flexGrow: 1,
              transition: 'background-color 0.2s ease',
            }}
          >
            {room.slots
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((slot, index) => {
                const isHighlighted = highlightedSlots.includes(slot.id);
                return (
                  <SlotComponent
                    key={slot.id}
                    slot={slot}
                    index={index}
                    isHighlighted={isHighlighted}
                  />
                );
              })}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    </Paper>
  );
};

export default RoomComponent;