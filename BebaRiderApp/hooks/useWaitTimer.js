import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";

// Wait fee rate per minute (from README: GH₵ 0.50 per minute after limit)
const WAIT_FEE_RATE = 0.5;

// Return time limit (from README: 10 minutes max)
const RETURN_TIME_LIMIT = 10;

/**
 * useWaitTimer Hook
 * Manages wait time at pickup/delivery location
 * - Starts counting when rider arrives
 * - Tracks wait fees based on time
 * - Shows return option after 10 minutes
 */
export const useWaitTimer = (category = "PARCEL", isArrived = false) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Determine max wait time based on category (from README)
  const maxWaitTime = category === "FOOD" ? 5 * 60 : 10 * 60; // Food: 5 min, Parcel/Document: 10 min

  // Start timer when arrived
  useEffect(() => {
    if (isArrived && !isRunning) {
      setIsRunning(true);
    } else if (!isArrived && isRunning) {
      // Stop and reset
      stopTimer();
    }
  }, [isArrived]);

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setSeconds(0);
  }, [stopTimer]);

  // Format time as MM:SS
  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, [seconds]);

  // Calculate wait fee - only starts after max wait time
  const waitFee = useCallback(() => {
    const waitSeconds = Math.max(0, seconds - maxWaitTime);
    const waitMinutes = waitSeconds / 60;
    return (Math.floor(waitMinutes) * WAIT_FEE_RATE).toFixed(2);
  }, [seconds, maxWaitTime]);

  // Check if can return item (after 10 mins from README)
  const canReturn = seconds >= RETURN_TIME_LIMIT * 60;

  // Check if exceeded category wait limit (for wait fee calculation)
  const exceededLimit = seconds > maxWaitTime;

  const value = {
    seconds,
    isRunning,
    formatTime,
    waitFee: parseFloat(waitFee()),
    canReturn,
    exceededLimit,
    maxWaitTime: maxWaitTime / 60, // in minutes
    resetTimer,
    stopTimer,
  };

  return value;
};

export default useWaitTimer;
