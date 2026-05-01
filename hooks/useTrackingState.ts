import { useCallback, useState } from "react";

interface TrackingState {
  isTracking: boolean;
  sessionDuration: number; // seconds
  distanceCovered: number; // km (mock)
  stopsCompleted: number;
}

export function useTrackingState() {
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    sessionDuration: 0,
    distanceCovered: 0,
    stopsCompleted: 0,
  });

  const startTracking = useCallback(() => {
    setState((prev) => ({ ...prev, isTracking: true }));
  }, []);

  const stopTracking = useCallback(() => {
    setState({
      isTracking: false,
      sessionDuration: 0,
      distanceCovered: 0,
      stopsCompleted: 0,
    });
  }, []);

  return { ...state, startTracking, stopTracking };
}
