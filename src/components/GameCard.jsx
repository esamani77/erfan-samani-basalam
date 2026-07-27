const GameCard = ({ card, position, isFaceUp, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
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

export default GameCard;
