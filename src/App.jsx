import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell, RequireAuth, ScrollToTop } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { AppProvider } from './lib/store'
import { ForgotPassword, Login, SignUp, Splash, Welcome } from './screens/Auth'
import { CaregiverDetail, Caregivers, Chat, RequestResult, RequestService } from './screens/Caregivers'
import Favorites from './screens/Favorites'
import History from './screens/History'
import Home from './screens/Home'
import { MyReviews, Review } from './screens/Reviews'
import { NewPet, Profile } from './screens/Profile'
import { PlaceDetail, Places } from './screens/Places'
import { Settings, SettingsPet, SettingsPhoto, SettingsProfile } from './screens/Settings'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            <Route index element={<Splash />} />
            <Route path="bem-vindo" element={<Welcome />} />
            <Route path="entrar" element={<Login />} />
            <Route path="criar-conta" element={<SignUp />} />
            <Route path="esqueci-senha" element={<ForgotPassword />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="inicio" element={<Home />} />
                <Route path="locais" element={<Places />} />
                <Route path="locais/:id" element={<PlaceDetail />} />
                <Route path="cuidadores" element={<Caregivers />} />
                <Route path="cuidadores/:id" element={<CaregiverDetail />} />
                <Route path="cuidadores/:id/solicitar" element={<RequestService />} />
                <Route path="cuidadores/:id/conversa" element={<Chat />} />
                <Route path="solicitacoes/:id" element={<RequestResult />} />
                <Route path="favoritos" element={<Favorites />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="perfil/pets/novo" element={<NewPet />} />
                <Route path="perfil/avaliacoes" element={<MyReviews />} />
                <Route path="historico" element={<History />} />
                <Route path="avaliar/:kind/:id" element={<Review />} />
                <Route path="configuracoes" element={<Settings />} />
                <Route path="configuracoes/dados" element={<SettingsProfile />} />
                <Route path="configuracoes/foto" element={<SettingsPhoto />} />
                <Route path="configuracoes/pet" element={<SettingsPet />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </HashRouter>
    </AppProvider>
  )
}
