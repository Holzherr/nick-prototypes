import { useCallback, useState } from "react";

export type UnitSystem = "metric" | "imperial";

const STORAGE_KEY = "unit-preference";

export function useUnitPreference() {
  const [units, setUnitsState] = useState<UnitSystem>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "imperial" ? "imperial" : "metric";
    } catch {
      return "metric";
    }
  });

  const setUnits = useCallback((value: UnitSystem) => {
    setUnitsState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    // Dispatch storage event so other components can react
    window.dispatchEvent(new Event("unit-preference-change"));
  }, []);

  return { units, setUnits };
}

/** Standalone getter for use outside React */
export function getUnitPreference(): UnitSystem {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}
