import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const junketTemplates = [
  {
    name: 'Tsunami',
    description: 'Long Lead Interviews',
    location: 'Ham Yard Hotel',
  },
  {
    name: 'Aurora Rising',
    description: '',
    location: "Claridge's",
  },
  {
    name: 'Wildfire',
    description: 'UK Press',
    location: 'The Corinthia',
  },
  {
    name: 'Nebula',
    description: 'Hybrid Junket',
    location: 'The Soho Hotel',
  },
]

const roomTemplates = [
  { name: '123 - Brad Pitt', color: '#ff8a80' },
  { name: '321 - Tom Cruise', color: '#81d4fa' },
  { name: '420 - Cheech Marin', color: '#b39ddb' },
  { name: '720 - Tony Hawk', color: '#c5e1a5' },
]

const slotOutlets = [
  'Variety',
  'The Hollywood Reporter',
  'Deadline',
  'Entertainment Weekly',
  'Vogue',
  'CNN',
  'BBC',
  'Rolling Stone',
  'NPR',
  'Esquire',
  'GQ',
  'The New York Times',
  'Los Angeles Times',
  'Vanity Fair',
  'BuzzFeed',
]

const slotNames = [
  'Clare Bi',
  'Mathew Parkin',
  'Lewis Warren',
  'Dawn Chan',
  'Lindsay Blackmore',
  'Nana Dalton',
  'Dora Rees',
  'Shelagh Clay',
  'Ian Guy',
  'Jose Fernandes',
  'Peggy Archer',
  'Freda Gregson',
  'Thelma Chambers',
  'Kimberley Prior',
  'Amie Gunn',
]

function buildDate(baseDate: Date, offsetDays: number) {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + offsetDays)
  return date
}

async function main() {
  console.log('Seeding press junket data...')

  const baseDate = new Date('2026-05-01')

  for (let junketIndex = 0; junketIndex < junketTemplates.length; junketIndex += 1) {
    const junketTemplate = junketTemplates[junketIndex]
    const junket = await prisma.junket.create({
      data: {
        ...junketTemplate,
      },
    })

    const daysCount = [1, 2, 3, 2][junketIndex]
    for (let dayIndex = 0; dayIndex < daysCount; dayIndex += 1) {
      const dayDate = buildDate(baseDate, junketIndex * 7 + dayIndex)
      const day = await prisma.day.create({
        data: {
          junketId: junket.id,
          date: dayDate,
          greenroomUrl: `https://${junketTemplate.name.toLowerCase().replace(/\s+/g, '-')}.greenroom.example.com`,
          greenroomPassword: `pass${junketIndex + 1}${dayIndex + 1}`,
        },
      })

      const roomsCount = Math.max(2, (dayIndex % 4) + 1)
      for (let roomIndex = 0; roomIndex < roomsCount; roomIndex += 1) {
        const roomTemplate = roomTemplates[roomIndex]
        const room = await prisma.room.create({
          data: {
            dayId: day.id,
            name: roomTemplate.name,
            color: roomTemplate.color,
            producer: `Producer ${roomIndex + 1}`,
            timer: `${15 + roomIndex * 5} min`,
            technician: `Technician ${roomIndex + 1}`,
            streamURL: `https://stream.example.com/${junketIndex + 1}/${dayIndex + 1}/${roomIndex + 1}`,
            zoomLink: `https://zoom.us/j/${1000000 + junketIndex * 100 + dayIndex * 10 + roomIndex}`,
            checkInBuffer: 60,
            localTimeOffset: 0,
            turnaround: 60,
            orderIndex: roomIndex,
          },
        })

        for (let slotIndex = 0; slotIndex < 15; slotIndex += 1) {
          const outlet = slotOutlets[slotIndex % slotOutlets.length]
          const name = slotNames[slotIndex % slotNames.length]
          await prisma.slot.create({
            data: {
              roomId: room.id,
              name: name,
              outlet,
              color: '#ffffff',
              isVirtual: slotIndex % 5 === 0,
              isBreak: slotIndex % 7 === 0,
              duration: 900,
              orderIndex: slotIndex + 1,
            },
          })
        }
      }
    }
  }

  console.log('Seeding complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
