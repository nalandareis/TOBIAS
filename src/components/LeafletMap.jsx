import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import { MAX_ZOOM, originHtml, pinHtml } from './mapPins'

const pinIcon = (selected) =>
  L.divIcon({
    className: 'pin-wrap',
    html: pinHtml(selected),
    iconSize: [38, 46],
    iconAnchor: [19, 46],
  })

const originIcon = L.divIcon({
  className: 'pin-wrap',
  html: originHtml,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export function LeafletMap({ center, pins, selectedId, onSelect, interactive = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const [tilesFailed, setTilesFailed] = useState(false)

  onSelectRef.current = onSelect

  useEffect(() => {
    const map = L.map(containerRef.current, {
      zoomControl: false,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([center.lat, center.lng], MAX_ZOOM)
    map.attributionControl.setPrefix(false)
    if (interactive) L.control.zoom({ zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(map)
    map.on('click', () => onSelectRef.current?.(null))
    let anyTileLoaded = false
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    })
      .on('tileerror', () => setTilesFailed(!anyTileLoaded))
      .on('tileload', () => {
        anyTileLoaded = true
        setTilesFailed(false)
      })
      .addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    // O mapa precisa saber o tamanho real quando o layout muda.
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
    }
    // O mapa é criado uma vez; centro e pinos são atualizados nos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Enquadra o ponto de origem e os pinos sempre que a lista muda.
  const pinIds = pins.map((pin) => pin.id).join()
  useEffect(() => {
    const points = [center, ...pins].map((point) => [point.lat, point.lng])
    // Sem animação: o Leaflet quebra se a tela fecha com uma animação em andamento.
    mapRef.current?.fitBounds(points, {
      animate: false,
      maxZoom: MAX_ZOOM,
      paddingTopLeft: [36, 60],
      paddingBottomRight: [36, 28],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, pinIds])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    L.marker([center.lat, center.lng], { icon: originIcon, interactive: false, keyboard: false }).addTo(layer)
    pins.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon(pin.id === selectedId),
        title: pin.name,
        alt: pin.name,
        zIndexOffset: pin.id === selectedId ? 1000 : 0,
      })
      marker.on('click', () => onSelectRef.current?.(pin.id))
      marker.addTo(layer)
    })
  }, [pins, selectedId, center.lat, center.lng])

  return (
    <div className="map">
      <div ref={containerRef} className="map-canvas" />
      {tilesFailed && (
        <p className="map-offline">Mapa indisponível sem internet. A lista de locais continua funcionando.</p>
      )}
    </div>
  )
}
