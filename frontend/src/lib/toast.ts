import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'success', title) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, title }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (message: string, title?: string) => useToastStore.getState().addToast(message, 'success', title),
  error: (message: string, title?: string) => useToastStore.getState().addToast(message, 'error', title),
  info: (message: string, title?: string) => useToastStore.getState().addToast(message, 'info', title),
  warning: (message: string, title?: string) => useToastStore.getState().addToast(message, 'warning', title),
};
