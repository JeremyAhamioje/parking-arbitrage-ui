const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function fetchMetrics() {
  try {
    const response = await fetch(`${API_URL}/api/metrics`)
    if (!response.ok) throw new Error('Failed to fetch metrics')
    return await response.json()
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return null
  }
}

export async function fetchEvents() {
  try {
    const response = await fetch(`${API_URL}/api/events`)
    if (!response.ok) throw new Error('Failed to fetch events')
    return await response.json()
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function fetchVenueData(venueId: string) {
  try {
    const response = await fetch(`${API_URL}/api/venues/${venueId}`)
    if (!response.ok) throw new Error('Failed to fetch venue data')
    return await response.json()
  } catch (error) {
    console.error('Error fetching venue data:', error)
    return null
  }
}

export async function fetchPriceHistory(venueId?: string, days: number = 7) {
  try {
    const params = new URLSearchParams({ days: String(days) })
    if (venueId) params.append('venueId', venueId)
    const response = await fetch(`${API_URL}/api/price-history?${params}`)
    if (!response.ok) throw new Error('Failed to fetch price history')
    return await response.json()
  } catch (error) {
    console.error('Error fetching price history:', error)
    return []
  }
}

export async function fetchAvailableSpots(venueId?: string) {
  try {
    const params = venueId ? `?venueId=${venueId}` : ''
    const response = await fetch(`${API_URL}/api/available-spots${params}`)
    if (!response.ok) throw new Error('Failed to fetch available spots')
    return await response.json()
  } catch (error) {
    console.error('Error fetching available spots:', error)
    return null
  }
}
