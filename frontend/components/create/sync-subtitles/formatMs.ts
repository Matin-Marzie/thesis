export const formatMs = (ms: number) => {
  const totalSeconds = ms / 1000;
  return `${totalSeconds.toFixed(2)}s`;
};
