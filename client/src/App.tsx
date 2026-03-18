import React, { useState, useEffect } from 'react';

const API_URL = '';

function App() {
  const [junkets, setJunkets] = useState([]);
  
  // Form States
  const [junketName, setJunketName] = useState('');
  
  const [dayDate, setDayDate] = useState('');
  const [selectedJunketId, setSelectedJunketId] = useState('');
  
  const [roomName, setRoomName] = useState('');
  const [selectedDayId, setSelectedDayId] = useState('');
  
  const [slotTitle, setSlotTitle] = useState('');
  const [slotDuration, setSlotDuration] = useState('');
  const [slotOrder, setSlotOrder] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Fetch all junkets (with nested days, rooms, slots based on our Express route)
  const fetchJunkets = async () => {
    try {
      const res = await fetch(`${API_URL}/junkets`);
      const data = await res.json();
      setJunkets(data);
    } catch (error) {
      console.error('Failed to fetch junkets:', error);
    }
  };

  useEffect(() => {
    fetchJunkets();
  }, []);

  // ---------------- Handlers ----------------

  const handleCreateJunket = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/junkets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: junketName })
    });
    setJunketName('');
    fetchJunkets();
  };

  const handleCreateDay = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dayDate, junketId: selectedJunketId })
    });
    setDayDate('');
    fetchJunkets();
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, dayId: selectedDayId })
    });
    setRoomName('');
    fetchJunkets();
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: slotTitle, 
        duration: parseInt(slotDuration), 
        orderIndex: parseFloat(slotOrder), 
        roomId: selectedRoomId 
      })
    });
    setSlotTitle('');
    setSlotDuration('');
    setSlotOrder('');
    fetchJunkets();
  };

  const handleDeleteJunket = async (id) => {
    await fetch(`${API_URL}/junkets/${id}`, { method: 'DELETE' });
    fetchJunkets();
  };

  // ---------------- Render Helpers to extract flat lists for dropdowns ----------------
  const allDays = junkets.flatMap(j => j.days || []);
  const allRooms = allDays.flatMap(d => d.rooms || []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Junket Management</h1>

      {/* --- FORMS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        
        {/* Junket Form */}
        <form onSubmit={handleCreateJunket} style={formStyle}>
          <h3>Create Junket</h3>
          <input required placeholder="Junket Name" value={junketName} onChange={e => setJunketName(e.target.value)} />
          <button type="submit">Add Junket</button>
        </form>

        {/* Day Form */}
        <form onSubmit={handleCreateDay} style={formStyle}>
          <h3>Create Day</h3>
          <select required value={selectedJunketId} onChange={e => setSelectedJunketId(e.target.value)}>
            <option value="">Select a Junket...</option>
            {junkets.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <input required type="date" value={dayDate} onChange={e => setDayDate(e.target.value)} />
          <button type="submit">Add Day</button>
        </form>

        {/* Room Form */}
        <form onSubmit={handleCreateRoom} style={formStyle}>
          <h3>Create Room</h3>
          <select required value={selectedDayId} onChange={e => setSelectedDayId(e.target.value)}>
            <option value="">Select a Day...</option>
            {allDays.map(d => <option key={d.id} value={d.id}>{new Date(d.date).toLocaleDateString()}</option>)}
          </select>
          <input required placeholder="Room Name" value={roomName} onChange={e => setRoomName(e.target.value)} />
          <button type="submit">Add Room</button>
        </form>

        {/* Slot Form */}
        <form onSubmit={handleCreateSlot} style={formStyle}>
          <h3>Create Slot</h3>
          <select required value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
            <option value="">Select a Room...</option>
            {allRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <input required placeholder="Slot Title" value={slotTitle} onChange={e => setSlotTitle(e.target.value)} />
          <input required type="number" placeholder="Duration (sec)" value={slotDuration} onChange={e => setSlotDuration(e.target.value)} />
          <input required type="number" step="0.1" placeholder="Order Index" value={slotOrder} onChange={e => setSlotOrder(e.target.value)} />
          <button type="submit">Add Slot</button>
        </form>
      </div>

      {/* --- DATA DISPLAY --- */}
      <h2>Current Data</h2>
      {junkets.length === 0 && <p>No junkets found. Create one above!</p>}
      
      {junkets.map(junket => (
        <div key={junket.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{junket.name}</h2>
            <button onClick={() => handleDeleteJunket(junket.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
          </div>
          
          {junket.days?.map(day => (
            <div key={day.id} style={{ marginLeft: '20px', marginTop: '10px', paddingLeft: '10px', borderLeft: '2px solid #ccc' }}>
              <strong>Day:</strong> {new Date(day.date).toLocaleDateString()}
              
              {day.rooms?.map(room => (
                <div key={room.id} style={{ marginLeft: '20px', marginTop: '5px' }}>
                  <strong>Room:</strong> {room.name}
                  
                  <ul style={{ margin: '5px 0' }}>
                    {room.slots?.map(slot => (
                      <li key={slot.id}>
                        {slot.title} ({slot.duration}s) - Order: {slot.orderIndex}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Basic inline styles to make it look acceptable
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9'
};

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  backgroundColor: '#fff'
};

export default App;