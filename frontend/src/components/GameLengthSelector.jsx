function GameLengthSelector({ value, min = 5, max = 8, onChange, onCreate }) {
  const handleDecrement = () => {
    onChange(Math.max(min, value - 1))
  }

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1))
  }

  return (
    <div className="game-length-selector">
      <p className="game-length-copy">
        Start a new{' '}
        <span className="inline-length-picker">
          <button
            type="button"
            className="arrow-btn"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrease word length"
          >
            &lsaquo;
          </button>
          <span className="length-value">{value}</span>
          <button
            type="button"
            className="arrow-btn"
            onClick={handleIncrement}
            disabled={value >= max}
            aria-label="Increase word length"
          >
            &rsaquo;
          </button>
        </span>{' '}
        letter game
      </p>
      <button type="button" className="create-game-btn" onClick={() => onCreate(value)}>
        Let's Go!
      </button>
    </div>
  )
}

export default GameLengthSelector
