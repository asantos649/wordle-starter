from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Game, Guess, GuessCharacter, GameStatus, GuessCharacterStatus
from schemas import CreateGameRequest, GameResponse, CreateGuessRequest
from word_service import pick_solution_word, is_valid_english_word

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}


def build_game_response(game: Game) -> GameResponse:
    response = GameResponse.model_validate(game, from_attributes=True)
    if response.status == GameStatus.playing:
        response.solution_word = None
    return response


@app.post("/games", response_model=GameResponse)
def create_game(game: CreateGameRequest, db: Session = Depends(get_db)):
    if not (5 <= game.word_length <= 8):
        raise HTTPException(status_code=422, detail="word_length must be between 5 and 8")

    solution = pick_solution_word(game.word_length)

    game_obj = Game(
        word_length=game.word_length,
        status=GameStatus.playing,
        solution_word=solution,
    )
    db.add(game_obj)
    db.commit()
    db.refresh(game_obj)
    return build_game_response(game_obj)


@app.get("/games/{game_id}", response_model=GameResponse)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return build_game_response(game)


@app.post("/games/{game_id}/guesses", response_model=GameResponse)
def create_guess(game_id: int, guess: CreateGuessRequest, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status in (GameStatus.completed_success, GameStatus.completed_failed):
        raise HTTPException(status_code=409, detail="Game already completed")

    existing_guesses = db.query(Guess).filter(Guess.game_id == game_id).count()

    guess_value = guess.guess_word.strip().lower()

    duplicate_guess = (
        db.query(Guess)
        .filter(Guess.game_id == game_id, Guess.guess_word == guess_value)
        .first()
    )
    if duplicate_guess:
        raise HTTPException(
            status_code=409,
            detail="You already guessed that word",
        )
    if len(guess_value) != game.word_length:
        raise HTTPException(
            status_code=422,
            detail=f"Guess must be {game.word_length} letters",
        )

    if not is_valid_english_word(guess_value):
        raise HTTPException(
            status_code=422,
            detail="Not a valid English word",
        )

    guess_obj = Guess(game_id=game_id, guess_word=guess_value)
    db.add(guess_obj)

    solution = (game.solution_word or "").strip().lower()
    
    # Map the counts of each character in the solution for multiple yellows
    solution_counts = {}
    for i, ch in enumerate(solution):
        if guess_value[i] == ch:
            continue
        solution_counts[ch] = solution_counts.get(ch, 0) + 1

    # Correct = right place, different_spot = in word elsewhere, incorrect = not in word
    char_statuses = []
    for i, ch in enumerate(guess_value):
        if ch == solution[i]:
            char_statuses.append(GuessCharacterStatus.correct)
        elif solution_counts.get(ch, 0) > 0:
            char_statuses.append(GuessCharacterStatus.different_spot)
            solution_counts[ch] -= 1
        else:
            char_statuses.append(GuessCharacterStatus.incorrect)

    for i, status in enumerate(char_statuses):
        guess_obj.characters.append(
            GuessCharacter(position=i, char=guess_value[i], status=status)
        )

    if game.solution_word and guess_value == game.solution_word.strip().lower():
        game.status = GameStatus.completed_success
        db.add(game)

    db.commit()

    max_guesses = game.word_length + 1
    updated_guesses = existing_guesses + 1
    if updated_guesses >= max_guesses and game.status != GameStatus.completed_success:
        game.status = GameStatus.completed_failed
        db.add(game)
        db.commit()

    updated_game = db.query(Game).filter(Game.id == game_id).first()
    if updated_game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    # Ensure relationships are loaded for response serialization
    _ = updated_game.guesses
    for saved_guess in updated_game.guesses:
        _ = saved_guess.characters

    return build_game_response(updated_game)
