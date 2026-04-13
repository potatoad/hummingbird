export const getStatusColor = (isBreak: boolean, status?: string): string => {
  if (isBreak == true) {
    return '#a4a4a4'
  }
  switch (status) {
    case 'COMPLETED':
      return '#e6b8af'
    case 'IN INTERVIEW':
      return '#f9cb9c'
    case 'ON DECK':
      return '#b7e1cd'
    case 'CANCELLED':
      return '#f2dede'
    default:
      return '#eee'
  }
}
