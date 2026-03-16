import { useCallback, useEffect, useState } from 'react'
import WordleRow from './WordleRow'

function getSubmitButtonLabel(status) {
  switch (status) {
    case 'completed_success':
      return 'You did it!'
    case 'completed_failed':
      return "You'll get it next time!"
    default:
      return 'Submit Guess'
  }
}

function GameBoard({ game, onSubmitGuess, onGameUpdated, onNotFound }) {
  const [rows, setRows] = useState([])
  const [rowStatuses, setRowStatuses] = useState([])
  const [revealRowIndex, setRevealRowIndex] = useState(-1)
  const [errorShakeSignal, setErrorShakeSignal] = useState(0)
  const [errorShakeRowIndex, setErrorShakeRowIndex] = useState(-1)
  const wordLength = game?.word_length || 5

  const submitButtonLabel = getSubmitButtonLabel(game?.status)
  const winningRowIndex =
    game?.status === 'completed_success' && game?.guesses?.length
      ? game.guesses.length - 1
      : -1
  const currentRow = game?.guesses ? Math.min(game.guesses.length, wordLength) : 0

  const triggerErrorWiggle = (rowIndex = currentRow) => {
    setErrorShakeRowIndex(rowIndex)
    setErrorShakeSignal((value) => value + 1)
  }

  const initializeRows = useCallback((wordLength, guesses = []) => {
    const singleEmptyRow = Array(wordLength).fill('')
    const singleEmptyRowStatuses = Array(wordLength).fill('')

    const allRows = Array.from({ length: wordLength + 1 }, () => [...singleEmptyRow])
    const allStatuses = Array.from({ length: wordLength + 1 }, () => [...singleEmptyRowStatuses])

    guesses.forEach((guess, idx) => {
      if (idx < allRows.length) {
        const chars = guess.guess_word.slice(0, wordLength).split('')
        allRows[idx] = [...chars, ...Array(wordLength - chars.length).fill('')]

        const statusesFromGuess = (guess.characters || [])
          .slice(0, wordLength)
          .map((character) => character.status)
        allStatuses[idx] = [
          ...statusesFromGuess,
          ...Array(wordLength - statusesFromGuess.length).fill(''),
        ]
      }
    })

    setRows(allRows)
    setRowStatuses(allStatuses)
  }, [])

  useEffect(() => {
    if (!game?.word_length) return
    initializeRows(game.word_length, game.guesses || [])
  }, [game, initializeRows])

  useEffect(() => {
    setRevealRowIndex(-1)
    setErrorShakeRowIndex(-1)
  }, [game?.id])

  useEffect(() => {
    if (revealRowIndex < 0) return

    const revealMs = wordLength * 150 + 350
    const timer = setTimeout(() => {
      setRevealRowIndex(-1)
    }, revealMs)

    return () => clearTimeout(timer)
  }, [revealRowIndex, wordLength])

  const handleSubmitGuess = async () => {
    const currentChars = rows[currentRow] || Array(wordLength).fill('')
    const guessWordValue = currentChars.join('')

    if (guessWordValue.length !== wordLength) {
      triggerErrorWiggle()
      return
    }

    const previousGuesses = (game?.guesses || []).map((guess) => guess.guess_word.toLowerCase())
    if (previousGuesses.includes(guessWordValue.toLowerCase())) {
      triggerErrorWiggle()
      return
    }

    try {
      const updatedGame = await onSubmitGuess(guessWordValue)
      onGameUpdated(updatedGame)
      if (updatedGame.word_length) {
        initializeRows(updatedGame.word_length, updatedGame.guesses || [])
      }
      setRevealRowIndex(currentRow)
    } catch (err) {
      console.error(err)
      if (err?.status === 404) {
        onNotFound?.()
        return
      }
      triggerErrorWiggle()
    }
  }

  const handleRowChange = (rowIndex, newChars) => {
    const allRows = [...rows]
    allRows[rowIndex] = newChars
    setRows(allRows)

    const allStatuses = [...rowStatuses]
    allStatuses[rowIndex] = Array(wordLength).fill('')
    setRowStatuses(allStatuses)
  }

  return (
    <div className="card">
      {(rows.length > 0 ? rows : [Array(wordLength).fill('')]).map((rowChars, idx) => (
        <WordleRow
          key={idx}
          length={wordLength}
          chars={rowChars}
          statuses={rowStatuses[idx] || []}
          revealStatuses={idx === revealRowIndex}
          celebrate={idx === winningRowIndex && revealRowIndex !== idx}
          errorShakeSignal={idx === errorShakeRowIndex ? errorShakeSignal : 0}
          onChange={(newChars) => handleRowChange(idx, newChars)}
          disabled={game?.status === 'completed_success' || game?.status === 'completed_failed'}
          isActive={idx === currentRow}
          onSubmit={idx === currentRow ? handleSubmitGuess : undefined}
        />
      ))}
      <button
        onClick={handleSubmitGuess}
        disabled={game?.status === 'completed_success' || game?.status === 'completed_failed'}
      >
        {submitButtonLabel}
      </button>
      {game?.status === 'completed_failed' && (
        <p>
          Your word was <strong>{(game.solution_word || '').toUpperCase()}</strong>
        </p>
      )}
    </div>
  )
}

export default GameBoard