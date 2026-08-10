"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Product } from "./products";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  size: string;
  price: number;
  image: string;
  qty: number;
};

type Action =
  | { type: "add"; line: Omit<CartLine, "id"> }
  | { type: "remove"; id: string }
  | { type: "qty"; id: string; qty: number }
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "clear" };

const STORAGE_KEY = "nek-studios.cart.v1";

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const id = `${action.line.slug}:${action.line.size}`;
      const existing = state.find((l) => l.id === id);
      if (existing) {
        return state.map((l) =>
          l.id === id ? { ...l, qty: Math.min(l.qty + action.line.qty, 10) } : l,
        );
      }
      return [...state, { ...action.line, id }];
    }
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "qty":
      return action.qty <= 0
        ? state.filter((l) => l.id !== action.id)
        : state.map((l) =>
            l.id === action.id ? { ...l, qty: Math.min(action.qty, 10) } : l,
          );
    case "clear":
      return [];
  }
}

type CartValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** False until localStorage has been read, so SSR and first paint agree. */
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (product: Product, size: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", lines: JSON.parse(raw) });
    } catch {
      // Corrupt or unavailable storage just means an empty cart.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private mode / quota — the cart still works for this session.
    }
  }, [lines, ready]);

  // Lock the page behind the drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const add = useCallback((product: Product, size: string, qty = 1) => {
    dispatch({
      type: "add",
      line: {
        slug: product.slug,
        name: product.name,
        subtitle: product.subtitle,
        size,
        price: product.price,
        image: product.image,
        qty,
      },
    });
    setOpen(true);
  }, []);

  const value = useMemo<CartValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return {
      lines,
      count,
      subtotal,
      ready,
      open,
      setOpen,
      add,
      remove: (id) => dispatch({ type: "remove", id }),
      setQty: (id, qty) => dispatch({ type: "qty", id, qty }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [lines, ready, open, add]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
