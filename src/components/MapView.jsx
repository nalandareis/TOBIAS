import { Component } from 'react'
import { GoogleMap } from './GoogleMap'
import { LeafletMap } from './LeafletMap'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Sem chave, ou se o Google recusar a chave, o site continua com o OpenStreetMap.
let googleUnavailable = !API_KEY

// Precisa ser classe: só assim uma falha do Google vira troca de mapa, e não tela em branco.
export class MapView extends Component {
  state = { useGoogle: !googleUnavailable }

  static getDerivedStateFromError() {
    googleUnavailable = true
    return { useGoogle: false }
  }

  fallBack = () => {
    googleUnavailable = true
    this.setState({ useGoogle: false })
  }

  render() {
    if (!this.state.useGoogle) return <LeafletMap {...this.props} />
    return <GoogleMap {...this.props} apiKey={API_KEY} onUnavailable={this.fallBack} />
  }
}
