import { useEffect, useRef, useState } from 'react'
import { MAX_ZOOM, originHtml, pinHtml } from './mapPins'

// DEMO_MAP_ID é o identificador de testes do Google; os pinos personalizados exigem um Map ID.
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

let scriptPromise = null

function loadGoogleMaps(apiKey) {
  scriptPromise ??= new Promise((resolve, reject) => {
    window.tobiasGoogleMapsReady = resolve
    const params = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      loading: 'async',
      language: 'pt-BR',
      region: 'BR',
      callback: 'tobiasGoogleMapsReady',
    })
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`
    script.async = true
    script.onerror = reject
    document.head.append(script)
  })
  return scriptPromise
}

function markerContent(className, html) {
  const element = document.createElement('div')
  element.className = className
  element.innerHTML = html
  return element
}

export function GoogleMap({ apiKey, center, pins, selectedId, onSelect, interactive = true, onUnavailable }) {
  const containerRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const [map, setMap] = useState(null)

  onSelectRef.current = onSelect

  useEffect(() => {
    let cancelled = false
    // O Google chama esta função quando recusa a chave ou a conta de faturamento.
    window.gm_authFailure = onUnavailable

    async function start() {
      await loadGoogleMaps(apiKey)
      const { maps } = window.google
      const [{ Map }] = await Promise.all([maps.importLibrary('maps'), maps.importLibrary('marker')])
      if (cancelled) return
      const instance = new Map(containerRef.current, {
        center,
        zoom: MAX_ZOOM,
        mapId: MAP_ID,
        disableDefaultUI: true,
        zoomControl: interactive,
        keyboardShortcuts: interactive,
        gestureHandling: interactive ? 'cooperative' : 'none',
        clickableIcons: false,
      })
      instance.addListener('click', () => onSelectRef.current?.(null))
      setMap(instance)
    }

    start().catch(onUnavailable)
    return () => {
      cancelled = true
    }
    // O mapa é criado uma vez; centro e pinos são atualizados nos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Enquadra o ponto de origem e os pinos sempre que a lista muda.
  const pinIds = pins.map((pin) => pin.id).join()
  useEffect(() => {
    if (!map) return
    const { LatLngBounds, event } = window.google.maps
    const bounds = new LatLngBounds()
    bounds.extend(center)
    pins.forEach((pin) => bounds.extend({ lat: pin.lat, lng: pin.lng }))
    map.fitBounds(bounds, { top: 60, right: 36, bottom: 28, left: 36 })
    event.addListenerOnce(map, 'idle', () => {
      if (map.getZoom() > MAX_ZOOM) map.setZoom(MAX_ZOOM)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, pinIds])

  useEffect(() => {
    if (!map) return undefined
    const { AdvancedMarkerElement } = window.google.maps.marker
    const origin = new AdvancedMarkerElement({
      map,
      position: { lat: center.lat, lng: center.lng },
      content: markerContent('origin-marker', originHtml),
    })
    const markers = pins.map((pin) => {
      const selected = pin.id === selectedId
      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: pin.lat, lng: pin.lng },
        title: pin.name,
        gmpClickable: true,
        zIndex: selected ? 1000 : 0,
        content: markerContent('pin-wrap google-pin', pinHtml(selected)),
      })
      marker.addEventListener('gmp-click', () => onSelectRef.current?.(pin.id))
      return marker
    })
    return () => {
      ;[origin, ...markers].forEach((marker) => {
        marker.map = null
      })
    }
  }, [map, pins, selectedId, center.lat, center.lng])

  return (
    <div className="map">
      <div ref={containerRef} className="map-canvas" />
    </div>
  )
}
