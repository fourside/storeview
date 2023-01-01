"use client";

import { Item } from "@prisma/client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { fetchItems, postQueue } from "../fetch-client";
import { useIntersectionObserver } from "../use-intersection-observer";
import { EnqueueDialog } from "./enqueue-dialog";
import { ItemCard } from "./item-card";
import styles from "./items.module.css";
import { Loader } from "./loader";
import { useToaster } from "./toaster";

type ItemsComponentProps = {
  items: Item[];
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
    async (param: { directory: string; url: string }) => {
      setQueueing(true);
      try {
        await postQueue(param);
        setEnqueuedItem(undefined);
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

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            isActive={index === activeIndex}
            pinned={pinnedItems.some((it) => it.id === item.id)}
            queueing={queueing && item === enqueuedItem}
            onEnqueueModalOpen={handleEnqueueModalOpen}
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
      {Toaster}
      {loading && <Loader />}
      <div ref={observedRef} />
    </div>
  );
};
