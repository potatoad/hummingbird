import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, ListItem, Typography } from '@mui/material';

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string };

interface SlotProps {
  slot: Slot;
  index: number;
  isHighlighted: boolean;
}

const SlotComponent: React.FC<SlotProps> = ({ slot, index, isHighlighted }) => {
  return (
    <Draggable key={slot.id} draggableId={slot.id} index={index}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          disablePadding
          sx={{ mb: 1.5, ...provided.draggableProps.style }}
        >
          <Card
            className={`${isHighlighted ? 'item-dropped-glow' : ''}`}
            sx={{
              width: '100%',
              boxShadow: snapshot.isDragging ? 6 : 2,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {slot.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {slot.duration / 60} min
              </Typography>
            </CardContent>
          </Card>
        </ListItem>
      )}
    </Draggable>
  );
};

export default SlotComponent;