import { useMemoryGame } from "../hooks/useMemoryGame";
import GameCard from "./GameCard";
import GameOverModal from "./GameOverModal";

const GameSection = () => {
  const {
    deck,
    isGameStarted,
    isGameOver,
    isGameWon,
    timeLeft,
    movesLeft,
    isCardFaceUp,
    handleCardClick,
    startGame,
    resetGame,
  } = useMemoryGame();

  const minutes = Math.floor(Math.max(timeLeft, 0) / 60);
  const seconds = Math.max(timeLeft, 0) % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="game-section">
      {isGameOver && (
        <GameOverModal isWon={isGameWon} onClose={resetGame} />
      )}
      <div className="game-status">
        <p>تعداد حرکت : {movesLeft}</p>
        <p>زمان : {formattedTime}</p>
      </div>
      <div className="cards-container">
        {deck.map((card, position) => (
          <GameCard
            key={card.id}
            card={card}
            position={position}
            isFaceUp={isCardFaceUp(card)}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>
      <button className="game-start-btn" onClick={startGame}>
        شروع {isGameStarted ? "مجدد" : "بازی"}
      </button>
    </div>
  );
};

export default GameSection;
