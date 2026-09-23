import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PhotoRecord } from "../data/gallery";

interface LightboxState {
  /** The exact list the viewer may navigate within. */
  photos: PhotoRecord[];
  index: number;
}

interface LightboxContextValue {
  open: (photos: PhotoRecord[], index: number) => void;
  close: () => void;
  navigate: (direction: 1 | -1) => void;
  state: LightboxState | null;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const open = useCallback((photos: PhotoRecord[], index: number) => {
    if (photos.length === 0) return;
    const clamped = Math.max(0, Math.min(index, photos.length - 1));
    setState({ photos, index: clamped });
  }, []);

  const close = useCallback(() => setState(null), []);

  const navigate = useCallback((direction: 1 | -1) => {
    setState((current) => {
      if (!current) return current;
      const count = current.photos.length;
      // Loop, but only inside the list the opener handed us.
      const next = (current.index + direction + count) % count;
      return { ...current, index: next };
    });
  }, []);

  const value = useMemo(
    () => ({ open, close, navigate, state }),
    [open, close, navigate, state]
  );

  return (
    <LightboxContext.Provider value={value}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within <LightboxProvider>");
  }
  return ctx;
}
