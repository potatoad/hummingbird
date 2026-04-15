export type SlotType = 'TALENT' | 'INTERVIEW' | 'NOTE' | 'BUFFER' | 'BREAK'
export type Status = 'BLANK' | 'ARRIVED' | 'WAITING' | 'INTERVIEW' | 'COMPLETED' | 'CANCELLED'

export interface Slot {
  id: string
  name: string
  outlet?: string
  notes?: string
  territory?: string
  color: string
  status: Status
  isVirtual: boolean
  slotType: SlotType
  isBreak: boolean
  checkInTime?: string | Date
  plannedStartTime?: string | Date
  duration?: number
  plannedEndTime?: string | Date
  actualStartTime?: string | Date
  actualEndTime?: string | Date
  orderIndex: number
  roomId: string
}

export interface Room {
  id: string
  color: string
  name: string
  producer?: string | null
  timer?: string | null
  technician?: string | null
  streamURL?: string | null
  zoomLink?: string | null
  checkInBuffer: number
  localTimeOffset: number
  turnaround: number
  plannedStartTime?: string | Date | null
  actualStartTime?: string | Date | null
  plannedEndTime?: string | Date | null
  actualEndTime?: string | Date | null
  orderIndex: number
  dayId: string
  slots: Slot[] // Nested relationship from Prisma
}

export interface Day {
  id: string
  date: string | Date
  greenroom: boolean
  greenroomUrl?: string | null
  greenroomPassword?: string | null
  pressHospitalityURL?: string | null
  pressHospitalityID?: string | null
  pressHospitalityPassword?: string | null
  junketId: string
  rooms: Room[] // Nested relationship from Prisma
}

export interface Junket {
  id: string
  name: string
  description?: string | null
  location?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  days: Day[] // Nested relationship from Prisma
}
