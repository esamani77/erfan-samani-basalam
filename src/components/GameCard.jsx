import { memo, useCallback } from "react";

const GameCard = ({ card, position, isFaceUp, onCardClick }) => {
  const handleClick = useCallback(() => {
    onCardClick(card);
  }, [onCardClick, card]);

  return (
    <div className="card" onClick={handleClick}>
      <div className={`card-inner ${isFaceUp ? "is-flipped" : ""}`}>
        <div className="card-back">
          <p>{position + 1}</p>
        </div>
        <div className="card-front">
          <img src={card.image} alt={card.value} className="card-image" />
        </div>
      </div>
    </div>
  );
};

export default memo(GameCard);
