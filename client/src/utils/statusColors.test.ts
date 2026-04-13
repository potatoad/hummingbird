import { describe, expect, it } from 'vitest'
import { getStatusColor } from './statusColors'

describe('getStatusColor', () => {
  it('returns correct colors for known statuses', () => {
    expect(getStatusColor('COMPLETED')).toBe('#e6b8af')
    expect(getStatusColor('IN INTERVIEW')).toBe('#f9cb9c')
    expect(getStatusColor('ON DECK')).toBe('#b7e1cd')
    expect(getStatusColor('CANCELLED')).toBe('#f2dede')
  })

  it('returns default color for unknown or undefined statuses', () => {
    expect(getStatusColor('UNKNOWN_STATUS')).toBe('#eee')
    expect(getStatusColor(undefined)).toBe('#eee')
  })
})
