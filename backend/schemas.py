from typing import Optional

from pydantic import BaseModel
from models import GameStatus, GuessCharacterStatus


class CreateGameRequest(BaseModel):
    word_length: int = 5


class GameResponse(BaseModel):
    id: int
    word_length: int
    status: GameStatus
    solution_word: Optional[str] = None
    guesses: list["GuessResponse"] = []

    class Config:
        orm_mode = True


class CreateGuessRequest(BaseModel):
    guess_word: str


class GuessCharacterResponse(BaseModel):
    position: int
    char: str
    status: GuessCharacterStatus

    class Config:
        orm_mode = True


class GuessResponse(BaseModel):
    id: int
    game_id: int
    guess_word: str
    characters: list[GuessCharacterResponse] = []

    class Config:
        orm_mode = True


GameResponse.update_forward_refs()
