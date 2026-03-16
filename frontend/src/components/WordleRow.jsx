import { useRef, useEffect, useState } from 'react'

function WordleRow({
  length,
  chars,
  statuses = [],
  celebrate = false,
  revealStatuses = false,
  errorShakeSignal = 0,
  onChange,
  disabled,
  isActive,
  onSubmit,
}) {
  const inputRefs = useRef([])
  const [isErrorShaking, setIsErrorShaking] = useState(false)
  const lastHandledErrorSignal = useRef(errorShakeSignal)

  // Keep keyboard focus on the first empty input of the active row
  useEffect(() => {
    if (!isActive || disabled) return

    const firstEmpty = chars.findIndex((c) => !c || c.trim() === '')
    const focusIndex = firstEmpty === -1 ? length - 1 : firstEmpty
    inputRefs.current[focusIndex]?.focus()
  }, [isActive, disabled, chars, length])

  // Play a single shake animation each time a new error signal is received
  useEffect(() => {
    if (!errorShakeSignal) return
    if (errorShakeSignal === lastHandledErrorSignal.current) return

    lastHandledErrorSignal.current = errorShakeSignal

    setIsErrorShaking(true)
    const timer = setTimeout(() => {
      setIsErrorShaking(false)
    }, 380)

    return () => clearTimeout(timer)
  }, [errorShakeSignal])

  const statusClass = (index) => {
    const status = statuses?.[index]
    return ['correct', 'different_spot', 'incorrect'].includes(status) ? status : ''
  }

  const handleCharChange = (index, value) => {
    const cleaned = value.replace(/[^a-zA-Z]/g, '').toLowerCase()
    const next = [...chars]
    next[index] = cleaned
    onChange(next)
    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      if (!disabled && isActive && chars.every((c) => c && c.trim() !== '')) {
        onSubmit?.()
      }
      return
    }

    if (e.key === 'Backspace') {
      if (!chars[index] && index > 0) {
        const prev = index - 1
        inputRefs.current[prev]?.focus()
        const next = [...chars]
        next[prev] = ''
        onChange(next)
      }
    }
  }

  return (
    <div
      className={`wordle-input-row ${celebrate ? 'win-row' : ''} ${revealStatuses ? 'reveal-row' : ''} ${isErrorShaking ? 'error-row' : ''}`}
    >
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          className={`letter-box ${statusClass(idx)}`}
          value={chars[idx] || ''}
          maxLength={1}
          onChange={(e) => handleCharChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          disabled={disabled || !isActive}
        />
      ))}
    </div>
  )
}

export default WordleRow
