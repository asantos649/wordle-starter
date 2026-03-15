import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GameLengthSelector from '../components/GameLengthSelector'
import GameBoard from '../components/GameBoard'
import { fetchGameById, submitGuess } from '../api'

function GamePage({ newGameLength, onNewGameLengthChange, onCreateGame }) {
  const { gameId } = useParams()
  const navigate = useNavigate()

  const [game, setGame] = useState(null)

  const showGameLengthSelector =
    game?.status === 'completed_success' || game?.status === 'completed_failed'

  useEffect(() => {
    setGame(null)

    const loadGame = async () => {
      try {
        const data = await fetchGameById(gameId)
        setGame(data)
      } catch (err) {
        console.error(err)
        setGame(null)
        if (err?.status === 404) {
          navigate('/', { replace: true })
        }
      }
    }

    loadGame()
  }, [gameId, navigate])

  const handleCreateGame = async (wordLength) => {
    setGame(null)

    await onCreateGame(wordLength)
  }

  const handleSubmitGuess = async (guessWordValue) => {
    const gameIdForSubmission = game?.id || gameId

    if (!gameIdForSubmission) {
      const error = new Error('Game not found')
      error.status = 404
      throw error
    }

    return submitGuess(gameIdForSubmission, guessWordValue)
  }

  return (
    <>
      {game && (
        <GameBoard
          game={game}
          onSubmitGuess={handleSubmitGuess}
          onGameUpdated={setGame}
          onNotFound={() => navigate('/', { replace: true })}
        />
      )}

      {showGameLengthSelector && (
        <div className="card">
          <GameLengthSelector
            value={newGameLength}
            min={5}
            max={8}
            onChange={onNewGameLengthChange}
            onCreate={handleCreateGame}
          />
        </div>
      )}
    </>
  )
}

export default GamePage