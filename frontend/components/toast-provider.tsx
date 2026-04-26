"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "stellar-toast",
          title: "stellar-toast-title",
          description: "stellar-toast-description",
          actionButton: "stellar-toast-action",
          cancelButton: "stellar-toast-cancel",
          closeButton: "stellar-toast-close",
          success: "stellar-toast-success",
          error: "stellar-toast-error",
          warning: "stellar-toast-warning",
          info: "stellar-toast-info",
        },
      }}
      gap={12}
      expand={false}
      richColors={false}
    />
  );
}
