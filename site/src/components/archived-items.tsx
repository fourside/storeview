"use client";

import { FC, useEffect, useRef, useState } from "react";
import { ArchivedItemData } from "../type";
import styles from "./archived-items.module.css";
import { ArchivedItemCard } from "./archived-item-card";

type Props = {
  items: ArchivedItemData[];
};

export const ArchivedItemsComponent: FC<Props> = (props) => {
  const [items, setItems] = useState(props.items);
  const { activeIndex } = useKeyboardNavigation(items);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <ArchivedItemCard key={item.id} item={item} count={index + 1} isActive={index === activeIndex} />
        ))}
      </div>
    </div>
  );
};

function useKeyboardNavigation(items: ArchivedItemData[]): {
  activeIndex: number;
} {
  const prevKeyRef = useRef<string>();

  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
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
      if (event.key === "o") {
        const activeItem = items[activeIndex];
        if (activeItem !== undefined) {
          window.open(activeItem.url, "_blank", "noopener,noreferrer");
        }
      }
      prevKeyRef.current = event.key;
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeIndex, items]);

  return {
    activeIndex,
  };
}
