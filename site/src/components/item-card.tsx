import { Item } from "@prisma/client";
import Image from "next/image";
import { FC, MouseEvent, useCallback, useEffect, useRef } from "react";
import styles from "./item-card.module.css";

type ItemCardProps = {
  item: Item;
  isActive: boolean;
  pinned: boolean;
  queueing: boolean;
  onEnqueueModalOpen: (item: Item) => void;
};

export const ItemCard: FC<ItemCardProps> = (props) => {
  const { onEnqueueModalOpen } = props;
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onEnqueueModalOpen(props.item);
    },
    [onEnqueueModalOpen, props.item]
  );

  useEffect(() => {
    if (props.isActive && ref.current !== null) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [props.isActive]);

  return (
    <a
      href={props.item.url}
      className={styles.container}
      data-active={props.isActive || undefined}
      data-pinned={props.pinned || undefined}
      ref={ref}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/images?item_id=${props.item.id}`}
        loading="lazy"
        width="200"
        height="350"
        className={styles.image}
        alt={props.item.title}
      />
      <div>
        <div className={styles.header}>
          <span
            className={styles.category}
            style={{
              backgroundColor: labelColor(props.item.category.length),
            }}
          >
            {props.item.category}
          </span>
          <button onClick={handleClick} className={styles.iconButton} title="enqueue" disabled={props.queueing}>
            <Image src="/download.svg" width="16" height="16" alt="download" />
          </button>
        </div>
        <h3 className={styles.title} title={props.item.title}>
          {props.item.title}
        </h3>
        <div className={styles.description}>{props.item.publishedAt}</div>
      </div>
    </a>
  );
};

function labelColor(num: number): string {
  if (num > 8) {
    return "#f09010";
  }
  if (num > 6) {
    return "#7700bb";
  }
  return "#ff6050";
}
