"use client";

import { Item } from "@prisma/client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { fetchItems, postQueue, putReadAll } from "../fetch-client";
import { NotReadCountData, ProgressData } from "../type";
import { useIntersectionObserver } from "../use-intersection-observer";
import { EnqueueDialog } from "./enqueue-dialog";
import { ItemCard } from "./item-card";
import styles from "./items.module.css";
import { Loader } from "./loader";
import { ProgressDialog } from "./progress-dialog";
import { useToaster } from "./toaster";

type ItemsComponentProps = {
  items: Item[];
  progressDataList: ProgressData[];
  notReadCountData: NotReadCountData;
};

export const ItemsComponent: FC<ItemsComponentProps> = (props) => {
  const [items, setItems] = useState(props.items);
  const [loading, setLoading] = useState(false);
  const [reachedLast, setReachedLast] = useState(false);
  const nextPageRef = useRef(1);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [pinnedItems, setPinnedItems] = useState<Item[]>([]);

  const [enqueuedItem, setEnqueuedItem] = useState<Item>();
  const [queueing, setQueueing] = useState(false);
  const { showSuccess, showFailure, Toaster } = useToaster();

  const prevKeyRef = useRef<string>();

  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (enqueuedItem !== undefined) {
          setEnqueuedItem(undefined);
        }
      }
      if (enqueuedItem !== undefined) {
        // not capture key event in modal except esc
        return;
      }
      if (event.key === "g" && prevKeyRef.current === "g") {
        setActiveIndex(0);
      }
      if (event.key === "j") {
        setActiveIndex((prev) => {
          return prev >= items.length - 1 ? prev : prev + 1;
        });
      }
      if (event.key === "k") {
        setActiveIndex((prev) => {
          return prev === 0 ? prev : prev - 1;
        });
      }
      if (event.key === "p") {
        setPinnedItems((prev) => {
          if (activeIndex < 0) {
            return prev;
          }
          const activeItem = items[activeIndex];
          if (activeItem === undefined) {
            return prev;
          }
          if (prev.some((it) => it.id === activeItem.id)) {
            return prev.filter((it) => it.id !== activeItem.id);
          }
          return [...prev, activeItem];
        });
        if (activeIndex > -1) {
          setActiveIndex((prev) => prev + 1);
        }
      }
      if (event.key === "o") {
        if (pinnedItems.length > 0) {
          pinnedItems.forEach((it) => window.open(it.url, "_blank", "noopener,noreferrer"));
          setPinnedItems([]);
        } else {
          const activeItem = items[activeIndex];
          if (activeItem !== undefined) {
            window.open(activeItem.url, "_blank", "noopener,noreferrer");
          }
        }
      }
      if (event.key === "e") {
        const activeItem = items[activeIndex];
        if (activeItem !== undefined) {
          event.preventDefault();
          setEnqueuedItem(activeItem);
        }
      }
      prevKeyRef.current = event.key;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeIndex, enqueuedItem, items, pinnedItems]);

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

  const handleEnqueueModalOpen = useCallback((item: Item) => {
    setEnqueuedItem(item);
  }, []);

  const handleEnqueueModalClose = useCallback(() => {
    setEnqueuedItem(undefined);
  }, []);

  const handleEnqueue = useCallback(
    async (param: { directory: string; url: string; itemId: string }) => {
      setQueueing(true);
      try {
        setEnqueuedItem(undefined);
        await postQueue(param);
        showSuccess("success to queue");
      } catch (error) {
        console.error(error);
        showFailure("failed to queue");
      } finally {
        setQueueing(false);
      }
    },
    [showFailure, showSuccess]
  );

  const handleShowProgress = useCallback(() => {
    setShowProgress(true);
  }, []);

  const handleCloseProgress = useCallback(() => {
    setShowProgress(false);
  }, []);

  const handleReachLast = useCallback(async (lastItem: Item) => {
    try {
      await putReadAll();
      console.log("last read", lastItem);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.notReadCard}>
        <div>
          <span className={styles.notReadCardLabel}>newly added</span>
          <span>
            <strong>{props.notReadCountData.count}</strong>
          </span>
        </div>
        <div>
          <span className={styles.notReadCardLabel}>since</span>
          <span>{props.notReadCountData.lastReadAt}</span>
        </div>
      </div>
      <button onClick={handleShowProgress}>show progress</button>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            count={index + 1}
            isActive={index === activeIndex}
            pinned={pinnedItems.some((it) => it.id === item.id)}
            queueing={queueing && item === enqueuedItem}
            isLast={props.notReadCountData.count === activeIndex}
            onEnqueueModalOpen={handleEnqueueModalOpen}
            onReachLast={handleReachLast}
          />
        ))}
      </div>
      {pinnedItems.length > 0 && (
        <div className={styles.pinnedCount}>
          pinned <strong>{pinnedItems.length}</strong> items
        </div>
      )}
      {enqueuedItem !== undefined && (
        <EnqueueDialog item={enqueuedItem} onEnqueue={handleEnqueue} onClose={handleEnqueueModalClose} />
      )}
      {showProgress && <ProgressDialog onClose={handleCloseProgress} progressList={props.progressDataList} />}
      {Toaster}
      {loading && <Loader />}
      <div ref={observedRef} />
    </div>
  );
};
