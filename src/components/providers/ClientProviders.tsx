"use client";

import { ReactNode } from "react";
import { AccentProvider } from "./AccentProvider";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export function ClientProviders({ children }: { children: ReactNode }) {
  const { toasts } = useToast();

  return (
    <AccentProvider>
      {children}
      <ToastContainer toasts={toasts} />
    </AccentProvider>
  );
}
