import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import { checkApiHealth } from '../services/api'

export default function Layout() {
  const [apiState, setApiState] = useState('checking')
  useEffect(() => { checkApiHealth().then(() => setApiState('online')).catch(() => setApiState('offline')) }, [])
  return <><Header /><main><Outlet /></main><footer><span>Atelier Commerce / Everyday objects, considered.</span><span className={`api-state ${apiState}`}><i /> API {apiState === 'online' ? 'connected' : apiState === 'checking' ? 'checking' : 'preview mode'}</span></footer></>
}
