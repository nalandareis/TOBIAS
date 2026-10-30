import { useState } from 'react'
import { isInDemoArea } from './geo'
import { useApp } from './store'

export function useLocationRequest() {
  const { setLocation } = useApp()
  const [status, setStatus] = useState('idle')

  function request() {
    if (!navigator.geolocation) {
      setStatus('failed')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude }
        setLocation(
          isInDemoArea(point)
            ? { status: 'granted', ...point }
            : { status: 'granted', outside: true },
        )
        setStatus('idle')
      },
      () => setStatus('failed'),
      { timeout: 8000, maximumAge: 60_000 },
    )
  }

  return { status, request }
}
