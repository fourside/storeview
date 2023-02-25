"use client";

import { Item } from "@prisma/client";
import Link from "next/link";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { fetchItems, postQueue, putReadAll } from "../fetch-client";
import { ItemData, NotReadCountData, ProgressData } from "../type";
import { useIntersectionObserver } from "../use-intersection-observer";
import { EnqueueDialog } from "./enqueue-dialog";
import { ItemCard } from "./item-card";
import styles from "./items.module.css";
import { Loader } from "./loader";
import { ProgressDialog } from "./progress-dialog";
import { useToaster } from "./toaster";

type ItemsComponentProps = {
  items: ItemData[];
  progressDataList: ProgressData[];
  notReadCountData: NotReadCountData;
};

export const ItemsComponent: FC<ItemsComponentProps> = (props) => {
  const [items, setItems] = useState(props.items);
  const [notReadCountData, setNotReadCountData] = useState(props.notReadCountData);

  const [loading, setLoading] = useState(false);
  const [reachedLast, setReachedLast] = useState(false);
  const nextPageRef = useRef(1);

  const [queueing, setQueueing] = useState(false);
  const { showSuccess, showFailure, Toaster } = useToaster();

  const {
    activeIndex,
    enqueueDialogState,
    openEnqueueDialog,
    closeEnqueueDialog,
    progressOpen,
    openProgressDialog,
    closeProgressDialog,
  } = useKeyboardNavigation(items);

  const fetchNext = useCallback(async () => {
    if (loading || reachedLast) {
      return;
    }
    setLoading(true);
    try {
      const nextItems = await fetchItems(nextPageRef.current);
      if (nextItems.length > 0) {
        nextPageRef.current++;
        setItems((prev) => [...prev, ...nextItems]);
      } else {
        setReachedLast(true);
      }
    } catch (error) {
      console.error(error);
      showFailure("failed to fetch the next page");
    } finally {
      setLoading(false);
    }
  }, [loading, reachedLast, showFailure]);

  const { observedRef } = useIntersectionObserver<HTMLDivElement>(async () => {
    if (loading || reachedLast) {
      return;
    }
    await fetchNext();
  });

  const handleEnqueue = useCallback(
    async (param: { directory: string; url: string; itemId: string }) => {
      setQueueing(true);
      try {
        closeEnqueueDialog();
        await postQueue(param);
        showSuccess("success to queue");
      } catch (error) {
        console.error(error);
        showFailure("failed to queue");
      } finally {
        setQueueing(false);
      }
    },
    [closeEnqueueDialog, showFailure, showSuccess]
  );

  const requesting = useRef(false);

  const handleReachLast = useCallback(
    async (lastItem: Item) => {
      if (requesting.current || notReadCountData.count === 0) {
        return;
      }
      requesting.current = true;
      try {
        await putReadAll();
        setNotReadCountData({ count: 0, lastReadAt: "now" });
        showSuccess("reached last");
        console.log("last read", lastItem);
      } catch (error) {
        console.error(error);
      } finally {
        requesting.current = false;
      }
    },
    [notReadCountData.count, showSuccess]
  );

  return (
    <div className={styles.container}>
      <div className={styles.notReadCard}>
        <div>
          <span className={styles.notReadCardLabel}>newly added</span>
          <span>
            <strong>{notReadCountData.count}</strong>
          </span>
        </div>
        <div>
          <span className={styles.notReadCardLabel}>since</span>
          <span>{notReadCountData.lastReadAt}</span>
        </div>
      </div>
      <button onClick={openProgressDialog}>show progress</button>
      <Link href="/archives">to archives</Link>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            count={index + 1}
            isActive={index === activeIndex}
            queueing={queueing}
            isLast={activeIndex !== 0 ? notReadCountData.count === activeIndex : false}
            onEnqueueModalOpen={openEnqueueDialog}
            onReachLast={handleReachLast}
          />
        ))}
      </div>
      {enqueueDialogState.open && (
        <EnqueueDialog item={enqueueDialogState.data} onEnqueue={handleEnqueue} onClose={closeEnqueueDialog} />
      )}
      {progressOpen && <ProgressDialog onClose={closeProgressDialog} progressList={props.progressDataList} />}
      {Toaster}
      {loading && <Loader />}
      <div ref={observedRef} />
    </div>
  );
};

type DialogState<T> = { open: false } | { open: true; data: T };

function useKeyboardNavigation(items: ItemData[]): {
  activeIndex: number;
  enqueueDialogState: DialogState<ItemData>;
  openEnqueueDialog: (item: ItemData) => void;
  closeEnqueueDialog: () => void;
  progressOpen: boolean;
  openProgressDialog: () => void;
  closeProgressDialog: () => void;
} {
  const prevKeyRef = useRef<string>();

  const [activeIndex, setActiveIndex] = useState(-1);
  const [enqueueDialogState, setEnqueueDialogState] = useState<DialogState<ItemData>>({ open: false });
  const [progressOpen, setProgressOpen] = useState(false);

  const openProgressDialog = useCallback(() => {
    setProgressOpen(true);
  }, []);

  const closeProgressDialog = useCallback(() => {
    setProgressOpen(false);
  }, []);

  const openEnqueueDialog = useCallback((item: ItemData) => {
    setEnqueueDialogState({ open: true, data: item });
  }, []);

  const closeEnqueueDialog = useCallback(() => {
    setEnqueueDialogState({ open: false });
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (progressOpen) {
        // not capture key event in modal except Escape
        if (event.key === "Escape") {
          setProgressOpen(false);
        }
        return;
      }
      if (enqueueDialogState.open) {
        // not capture key event in modal except Escape
        if (event.key === "Escape") {
          setEnqueueDialogState({ open: false });
        }
        return;
      }

      if (event.key === "s") {
        setProgressOpen((prev) => !prev);
      }
      if (event.key === "g" && prevKeyRef.current === "g") {
        setActiveIndex(0);
      }
      if (event.key === "j") {
        setActiveIndex((prev) => {
          return prev >= items.length - 1 ? prev : prev + 1;
        });
      }
      if (event.key === "J") {
        setActiveIndex((prev) => {
          return prev >= items.length - 1 ? prev : Math.min(prev + 3, items.length - 1);
        });
      }
      if (event.key === "k") {
        setActiveIndex((prev) => {
          return prev === 0 ? prev : prev - 1;
        });
      }
      if (event.key === "K") {
        setActiveIndex((prev) => {
          return prev === 0 ? prev : Math.max(prev - 3, 0);
        });
      }
      if (event.key === "o") {
        const activeItem = items[activeIndex];
        if (activeItem !== undefined) {
          window.open(activeItem.url, "_blank", "noopener,noreferrer");
        }
      }
      if (event.key === "e") {
        const activeItem = items[activeIndex];
        if (activeItem !== undefined) {
          event.preventDefault();
          setEnqueueDialogState({ open: true, data: activeItem });
        }
      }
      prevKeyRef.current = event.key;
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeIndex, enqueueDialogState.open, items, progressOpen]);

  return {
    activeIndex,
    enqueueDialogState,
    openEnqueueDialog,
    closeEnqueueDialog,
    progressOpen,
    openProgressDialog,
    closeProgressDialog,
  };
}
