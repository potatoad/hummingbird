import 'dotenv/config'
import { PrismaClient } from '../prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const junket = await prisma.junket.create({
    data: {
      name: 'The Best Years of Our Lives',
      location: 'Ham Yard Hotel',
      days: {
        create: [
          {
            date: new Date('2026-06-15'), // Day 1: Broadcast TV
            rooms: {
              create: [
                {
                  name: 'Room 104 - Myrna Loy',
                  slots: {
                    create: [
                      { title: 'BBC World News', duration: 300, orderIndex: 1.0 },
                      { title: 'Entertainment Tonight', duration: 300, orderIndex: 2.0 },
                      { title: 'CNN Hollywood', duration: 300, orderIndex: 3.0 },
                    ],
                  },
                },
                {
                  name: 'Room 105 - Fredric March & Dana Andrews',
                  slots: {
                    create: [
                      { title: 'IMDb Exclusive', duration: 300, orderIndex: 1.0 },
                      { title: 'Rotten Tomatoes', duration: 600, orderIndex: 2.0 },
                    ],
                  },
                },
              ],
            },
          },
          {
            date: new Date('2026-06-16'), // Day 2: Print & Podcasts
            rooms: {
              create: [
                {
                  name: 'Room 104 - Fredric March',
                  slots: {
                    create: [
                      { title: 'Variety Magazine', duration: 450, orderIndex: 1.0 },
                      { title: 'The Hollywood Reporter', duration: 900, orderIndex: 2.0 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Created junket:', junket)

  // Query all published posts
  const posts = await prisma.junket.findMany({})
  console.log('All junkets:', posts)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
