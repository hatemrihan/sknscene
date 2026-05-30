'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────

export type CartItemVariant = {
    attributes: Record<string, string>;  // { [optionGroupName]: selectedValue }
};

export type CartItem = {
    id: string;         // product ID
    name: string;
    image: string;
    price: number;
    quantity: number;
    maxStock?: number;  // stock limit from DB — enforced on add/update
    variant?: CartItemVariant;
};

type CartState = {
    items: CartItem[];
    isOpen: boolean;    // for slide-out drawer
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: { item: Omit<CartItem, 'quantity'>; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { id: string; variant?: CartItemVariant } }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; variant?: CartItemVariant; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'SET_CART_OPEN'; payload: boolean }
    | { type: 'LOAD_CART'; payload: CartItem[] };

import { isSameAttributes } from '@/lib/cart-utils';

// ─── Helpers ──────────────────────────────────────────────────

const STORAGE_KEY = 'sknscene_cart';

function isSameItem(a: CartItem, id: string, variant?: CartItemVariant): boolean {
    return (
        a.id === id &&
        isSameAttributes(a.variant?.attributes, variant?.attributes)
    );
}

// ─── Reducer ──────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { item, quantity } = action.payload;
            const existing = state.items.find(i =>
                isSameItem(i, item.id, item.variant)
            );

            let items: CartItem[];
            if (existing) {
                items = state.items.map(i => {
                    if (!isSameItem(i, item.id, item.variant)) return i;
                    const max = item.maxStock ?? Infinity;
                    const newQty = Math.min(i.quantity + quantity, max);
                    return { ...i, quantity: newQty, maxStock: item.maxStock ?? i.maxStock };
                });
            } else {
                const max = item.maxStock ?? Infinity;
                items = [...state.items, { ...item, quantity: Math.min(quantity, max) }];
            }

            return { ...state, items };
        }

        case 'REMOVE_ITEM': {
            const items = state.items.filter(i =>
                !isSameItem(i, action.payload.id, action.payload.variant)
            );
            return { ...state, items };
        }

        case 'UPDATE_QUANTITY': {
            const { id, variant, quantity } = action.payload;
            if (quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id, variant } });
            }
            const items = state.items.map(i => {
                if (!isSameItem(i, id, variant)) return i;
                const max = i.maxStock ?? Infinity;
                return { ...i, quantity: Math.min(quantity, max) };
            });
            return { ...state, items };
        }

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen };

        case 'SET_CART_OPEN':
            return { ...state, isOpen: action.payload };

        case 'LOAD_CART':
            return { ...state, items: action.payload };

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────

type CartContextType = {
    state: CartState;
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: string, variant?: CartItemVariant) => void;
    updateQuantity: (id: string, variant: CartItemVariant | undefined, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setCartOpen: (open: boolean) => void;
    totalItems: number;
    totalPrice: number;
    isLoaded: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const items = JSON.parse(saved) as CartItem[];
                dispatch({ type: 'LOAD_CART', payload: items });
            }
        } catch { /* ignore */ }
        finally {
            setIsLoaded(true);
        }
    }, []);

    // Persist to localStorage on changes
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
        } catch { /* ignore */ }
    }, [state.items, isLoaded]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
    }, []);

    const removeItem = useCallback((id: string, variant?: CartItemVariant) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id, variant } });
    }, []);

    const updateQuantity = useCallback((id: string, variant: CartItemVariant | undefined, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, variant, quantity } });
    }, []);

    const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
    const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
    const setCartOpen = useCallback((open: boolean) => dispatch({ type: 'SET_CART_OPEN', payload: open }), []);

    const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{
            state,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            toggleCart,
            setCartOpen,
            totalItems,
            totalPrice,
            isLoaded,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
