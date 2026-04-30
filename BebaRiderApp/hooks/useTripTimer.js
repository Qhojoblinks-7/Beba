import { useState, useEffect } from 'react';

export const useTripTimer = (isArrived) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isArrived) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isArrived]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const waitFee = (Math.floor(seconds / 60) * 0.5).toFixed(2);

  return { seconds, formatTime, waitFee };
};