export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  // Convert to number and round to nearest second
  const totalSeconds = Math.round(Number(seconds));
  
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  
  // Pad seconds with leading zero if needed
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 