const GameOverModal = ({ isWon, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">
          {isWon ? "🎉 بردی!" : "باختی!"}
        </p>
        <button className="game-start-btn" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
