from wonderwords import RandomWord
import inflect
from spellchecker import SpellChecker
from fastapi import HTTPException

rw = RandomWord()
p = inflect.engine()
spell = SpellChecker(language="en")


def is_valid_english_word(word: str) -> bool:
    # Return True if the word is recognized by the spell checker
    if not word:
        return False
    return not spell.unknown([word])


def pick_solution_word(length: int) -> str:
    # Pick a random valid solution word of the correct length
    # If none work after 100 attempts, fall back to a hardcoded word
    fallback_words = {
        5: "REACT",
        6: "PYTHON",
        7: "INTEGER",
        8: "VARIABLE",
    }

    max_attempts = 100
    words = rw.random_words(
        amount=max_attempts,
        word_min_length=length,
        word_max_length=length,
    ) or []

    for candidate in words:
        if not candidate:
            continue
        candidate = candidate.lower().strip()
        # Inflect returns a singular form for plural nouns; if truthy, candidate is likely plural, so skip it
        if p.singular_noun(candidate):
            continue
        if not is_valid_english_word(candidate):
            continue
        return candidate

    fallback = fallback_words.get(length)
    if fallback:
        return fallback.lower()

    raise HTTPException(status_code=500, detail="Could not pick a solution word")
