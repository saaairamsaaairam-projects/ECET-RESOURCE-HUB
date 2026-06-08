"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface CompareCollegesContextValue {
  selectedColleges: string[];
  addCollege: (id: string) => void;
  removeCollege: (id: string) => void;
  clearSelection: () => void;
}

const CompareCollegesContext = createContext<CompareCollegesContextValue | undefined>(undefined);

const STORAGE_KEY = "polyhub-compare-colleges";

export function CompareCollegesProvider({ children }: { children: ReactNode }) {
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setSelectedColleges(parsed.slice(0, 2));
        }
      }
    } catch {
      setSelectedColleges([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedColleges));
  }, [selectedColleges]);

  const addCollege = (id: string) => {
    setSelectedColleges((current) => {
      if (current.includes(id)) {
        return current;
      }

      if (current.length === 0) {
        return [id];
      }

      if (current.length === 1) {
        return [current[0], id];
      }

      return [current[1], id];
    });
  };

  const removeCollege = (id: string) => {
    setSelectedColleges((current) => current.filter((item) => item !== id));
  };

  const clearSelection = () => {
    setSelectedColleges([]);
  };

  const value = useMemo(
    () => ({ selectedColleges, addCollege, removeCollege, clearSelection }),
    [selectedColleges]
  );

  return (
    <CompareCollegesContext.Provider value={value}>
      {children}
    </CompareCollegesContext.Provider>
  );
}

export function useCompareColleges() {
  const context = useContext(CompareCollegesContext);

  if (!context) {
    throw new Error("useCompareColleges must be used within CompareCollegesProvider");
  }

  return context;
}
