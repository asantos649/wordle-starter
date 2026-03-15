from enum import Enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base


class GameStatus(str, Enum):
    playing = "playing"
    completed_success = "completed_success"
    completed_failed = "completed_failed"


class GuessCharacterStatus(str, Enum):
    incorrect = "incorrect"
    correct = "correct"
    different_spot = "different_spot"


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    word_length = Column(Integer, default=5)
    status = Column(
        SQLEnum(GameStatus, name="game_status", native_enum=False),
        default=GameStatus.playing,
        nullable=False,
    )
    solution_word = Column(String, nullable=True)
    guesses = relationship("Guess", back_populates="game")


class Guess(Base):
    __tablename__ = "guesses"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    guess_word = Column(String, nullable=False)

    game = relationship("Game", back_populates="guesses")
    characters = relationship(
        "GuessCharacter",
        back_populates="guess",
        cascade="all, delete-orphan",
        order_by="GuessCharacter.position",
    )


class GuessCharacter(Base):
    __tablename__ = "guess_characters"

    id = Column(Integer, primary_key=True, index=True)
    guess_id = Column(Integer, ForeignKey("guesses.id"), nullable=False)
    position = Column(Integer, nullable=False)
    char = Column(String(1), nullable=False)
    status = Column(
        SQLEnum(GuessCharacterStatus, name="guess_character_status", native_enum=False),
        nullable=False,
    )

    guess = relationship("Guess", back_populates="characters")
