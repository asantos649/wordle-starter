import { useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import { createGame } from './api'

function App() {
  const [newGameLength, setNewGameLength] = useState(5)

  const navigate = useNavigate()
  const handleCreateGame = async (wordLength) => {
    try {
      const createdGame = await createGame(wordLength)
      navigate(`/game/${createdGame.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1><Link to="/">Authentic Wordle</Link></h1>
      </header>

      <main className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                newGameLength={newGameLength}
                onNewGameLengthChange={setNewGameLength}
                onCreateGame={handleCreateGame}
              />
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <GamePage
                newGameLength={newGameLength}
                onNewGameLengthChange={setNewGameLength}
                onCreateGame={handleCreateGame}
              />
            }
          />
          <Route path="/game" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
