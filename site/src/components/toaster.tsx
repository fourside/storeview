"use client";

import * as RadixToast from "@radix-ui/react-toast";
import Image from "next/image";
import { ReactElement, useCallback, useMemo, useState } from "react";
import styles from "./toaster.module.css";

export function useToaster(): {
  Toaster: ReactElement;
  showSuccess: (message: string) => void;
  showFailure: (message: string) => void;
} {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "failure">("success");
  const [open, setOpen] = useState(false);

  const handleCloseClick = useCallback(() => {
    setOpen(false);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setMessage(message);
    setType("success");
    setOpen(true);
  }, []);

  const showFailure = useCallback((message: string) => {
    setMessage(message);
    setType("failure");
    setOpen(true);
  }, []);

  const Toaster: ReactElement = useMemo(() => {
    return (
      <RadixToast.Provider swipeDirection="up">
        <RadixToast.Root className={styles.root} open={open} onOpenChange={setOpen} data-type={type}>
          <RadixToast.Title className={styles.title}>{message}</RadixToast.Title>
          <RadixToast.Action asChild altText="close">
            <button className={styles.closeButton} onClick={handleCloseClick}>
              <Image src="/close.svg" width="16" height="16" alt="close" />
            </button>
          </RadixToast.Action>
        </RadixToast.Root>
        <RadixToast.Viewport className={styles.viewport} />
      </RadixToast.Provider>
    );
  }, [handleCloseClick, message, open, type]);

  return {
    showSuccess: showSuccess,
    showFailure: showFailure,
    Toaster: Toaster,
  };
}
