const API_URL = 'http://localhost:8000'

async function throwApiError(response, fallbackMessage) {
  const errData = await response.json().catch(() => ({}))
  const error = new Error(errData.detail || fallbackMessage)
  error.status = response.status
  throw error
}

export async function createGame(wordLength) {
  const response = await fetch(`${API_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word_length: wordLength }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to create game')
  }

  return response.json()
}

export async function fetchGameById(id) {
  const response = await fetch(`${API_URL}/games/${id}`)

  if (!response.ok) {
    await throwApiError(response, 'Game not found')
  }

  return response.json()
}

export async function submitGuess(gameId, guessWord) {
  const response = await fetch(`${API_URL}/games/${gameId}/guesses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess_word: guessWord }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to submit guess')
  }

  return response.json()
}