export interface InterviewItem {
  id: string
  status?: 'COMPLETED' | 'IN INTERVIEW' | 'ON DECK' | 'CANCELLED' | string
  virtual?: boolean
  name: string
  outlet: string
  territory: string
  notes: string
  interviewDuration: string | number
  calculatedStartTime?: string
  isBreak: boolean
  breakText?: string
}
