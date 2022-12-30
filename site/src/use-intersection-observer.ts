import { RefObject, useEffect, useRef } from "react";

export function useIntersectionObserver<T extends Element>(callback: Function): { observedRef: RefObject<T> } {
  const observedRef = useRef<T>(null);

  useEffect(() => {
    if (observedRef.current === null) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        root: null,
        rootMargin: "80px",
        threshold: 1.0,
      }
    );
    observer.observe(observedRef.current);
    return () => {
      observer.disconnect();
    };
  }, [callback]);

  return { observedRef };
}
