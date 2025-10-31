export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const validateScore = (score: number): boolean => {
  return !isNaN(score) && score >= 0 && score <= 100;
};

export const validateAllScores = (scores: number[]): boolean => {
  return scores.every(validateScore);
};
