import { useState, useEffect, useRef, useCallback } from "react";

export const MAX_MOVES = 40;
export const MAX_TIME = 120;
const MISMATCH_DELAY_MS = 1000;
const PREVIEW_DELAY_MS = 2000;

export const CARDS = [
  { id: 1, value: "A", side: "F", image: "images/product-1.jpg" },
  { id: 2, value: "B", side: "F", image: "images/product-2.jpg" },
  { id: 3, value: "C", side: "F", image: "images/product-3.jpg" },
  { id: 4, value: "D", side: "F", image: "images/product-4.jpg" },
  { id: 5, value: "E", side: "F", image: "images/product-5.jpg" },
  { id: 6, value: "F", side: "F", image: "images/product-6.jpg" },
  { id: 7, value: "G", side: "F", image: "images/product-7.jpg" },
  { id: 8, value: "H", side: "F", image: "images/product-8.jpg" },
  { id: 9, value: "A", side: "B", image: "images/product-1.jpg" },
  { id: 10, value: "B", side: "B", image: "images/product-2.jpg" },
  { id: 11, value: "C", side: "B", image: "images/product-3.jpg" },
  { id: 12, value: "D", side: "B", image: "images/product-4.jpg" },
  { id: 13, value: "E", side: "B", image: "images/product-5.jpg" },
  { id: 14, value: "F", side: "B", image: "images/product-6.jpg" },
  { id: 15, value: "G", side: "B", image: "images/product-7.jpg" },
  { id: 16, value: "H", side: "B", image: "images/product-8.jpg" },
];

const shuffle = (cards) => {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function useMemoryGame() {
  const [deck, setDeck] = useState(() => shuffle(CARDS));
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState(() => new Set());
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [pairAttempts, setPairAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [result, setResult] = useState(null); // null | "won" | "lost"
  const isGameOver = result !== null;

  const timerRef = useRef(null);
  const mismatchTimeoutRef = useRef(null);
  const previewTimeoutRef = useRef(null);

  const stateRef = useRef();
  stateRef.current = {
    deck,
    selectedIds,
    matchedIds,
    isPreviewing,
    isGameStarted,
    isGameOver,
  };

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      clearTimeout(mismatchTimeoutRef.current);
      clearTimeout(previewTimeoutRef.current);
    };
  }, [stopTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isGameStarted || isGameOver) return;
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isGameStarted, isGameOver, startTimer, stopTimer]);

  useEffect(() => {
    if (!isGameStarted || isGameOver) return;
    if (timeLeft <= 0) {
      setResult("lost");
      stopTimer();
    }
  }, [timeLeft, isGameStarted, isGameOver, stopTimer]);

  useEffect(() => {
    if (!isGameStarted || isGameOver) return;
    if (pairAttempts >= MAX_MOVES) {
      setResult("lost");
      stopTimer();
    }
  }, [pairAttempts, isGameStarted, isGameOver, stopTimer]);

  const resetGame = useCallback(() => {
    stopTimer();
    clearTimeout(mismatchTimeoutRef.current);
    clearTimeout(previewTimeoutRef.current);
    setIsGameStarted(false);
    setResult(null);
    setSelectedIds([]);
    setMatchedIds(new Set());
    setPairAttempts(0);
    setTimeLeft(MAX_TIME);
    setIsPreviewing(false);
  }, [stopTimer]);

  const startGame = useCallback(() => {
    if (isGameStarted) {
      resetGame();
      return;
    }

    setDeck(shuffle(CARDS));
    setIsGameStarted(true);
    setIsPreviewing(true);
    startTimer();

    previewTimeoutRef.current = setTimeout(() => {
      setIsPreviewing(false);
    }, PREVIEW_DELAY_MS);
  }, [isGameStarted, resetGame, startTimer]);

  const handleCardClick = useCallback(
    (card) => {
      const {
        deck: currentDeck,
        selectedIds: currentSelected,
        matchedIds: currentMatched,
        isPreviewing: currentPreviewing,
        isGameStarted: currentStarted,
        isGameOver: currentOver,
      } = stateRef.current;

      if (
        !currentStarted ||
        currentOver ||
        currentPreviewing ||
        currentSelected.length === 2 ||
        currentMatched.has(card.id) ||
        currentSelected.includes(card.id)
      ) {
        return;
      }

      const nextSelected = [...currentSelected, card.id];
      setSelectedIds(nextSelected);

      if (nextSelected.length !== 2) {
        return;
      }

      setPairAttempts((prev) => prev + 1);

      const [firstId, secondId] = nextSelected;
      const firstCard = currentDeck.find((c) => c.id === firstId);
      const secondCard = card;
      const isMatch = firstCard?.value === secondCard.value;

      if (isMatch) {
        setMatchedIds((prev) => {
          const next = new Set(prev);
          next.add(firstId);
          next.add(secondId);
          if (next.size === CARDS.length) {
            setResult("won");
            stopTimer();
          }
          return next;
        });
        setSelectedIds([]);
        return;
      }

      mismatchTimeoutRef.current = setTimeout(() => {
        setSelectedIds([]);
      }, MISMATCH_DELAY_MS);
    },
    [stopTimer]
  );

  const isCardFaceUp = useCallback(
    (card) =>
      isPreviewing || matchedIds.has(card.id) || selectedIds.includes(card.id),
    [isPreviewing, matchedIds, selectedIds]
  );

  return {
    deck,
    isGameStarted,
    isGameOver,
    isGameWon: result === "won",
    timeLeft,
    movesLeft: MAX_MOVES - pairAttempts,
    isCardFaceUp,
    handleCardClick,
    startGame,
    resetGame,
  };
}
