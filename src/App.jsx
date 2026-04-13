import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MusicPlayer from './components/MusicPlayer'

const App = () => {
  return (
    <>
      <MusicPlayer />
      <Routes>
        <Route path='/' element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App