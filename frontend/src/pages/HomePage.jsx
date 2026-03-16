import GameLengthSelector from '../components/GameLengthSelector'

function HomePage({ newGameLength, onNewGameLengthChange, onCreateGame }) {
  return (
    <>
      <div className="card">
        <GameLengthSelector
          value={newGameLength}
          min={5}
          max={8}
          onChange={onNewGameLengthChange}
          onCreate={onCreateGame}
        />
      </div>

      <div className="card">
        <h2>How to play</h2>
        <p>- Choose a word length and click Let's Go! to start a new game.</p>
        <p>- Submit a guess for the mystery word.</p>
        <p>- Green means the letter is in the correct spot.</p>
        <p>- Yellow means the letter is in the word but in a different spot.</p>
        <p>- Gray means the letter is not in the word.</p>
        <p>- The mystery word is never plural.</p>
        <p>- You have one more guess than letters in the word.</p>
      </div>
    </>
  )
}

export default HomePage