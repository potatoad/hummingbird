export const getStatusColor = (isBreak: boolean, status?: string): string => {
  if (isBreak == true) {
    return '#a4a4a4'
  }
  switch (status) {
    case 'ARRIVED':
      return '#eee'
    case 'WAITING':
      return '#b7e1cd'
    case 'INTERVIEW':
      return '#f9cb9c'
    case 'COMPLETED':
      return '#e6b8af'
    case 'CANCELLED':
      return '#f2dede'
    default:
      return '#eee'
  }
}
