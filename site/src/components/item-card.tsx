import Image from "next/image";
import { FC, MouseEvent, useCallback, useEffect, useRef } from "react";
import { Env } from "../env";
import { ItemData } from "../type";
import styles from "./item-card.module.css";

type ItemCardProps = {
  item: ItemData;
  count: number;
  isActive: boolean;
  queueing: boolean;
  isLast: boolean; // TODO: naming
  onEnqueueModalOpen: (item: ItemData) => void;
  onReachLast: (item: ItemData) => void;
};

export const ItemCard: FC<ItemCardProps> = (props) => {
  const { onEnqueueModalOpen, onReachLast } = props;
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (props.item.queued) {
        throw new Error("assertion error: item already queued and button must be disabled");
      }
      onEnqueueModalOpen(props.item);
    },
    [onEnqueueModalOpen, props.item]
  );

  useEffect(() => {
    if (props.isActive && ref.current !== null) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [props.isActive]);

  useEffect(() => {
    if (props.isLast) {
      onReachLast(props.item);
    }
  }, [onReachLast, props.isLast, props.item]);

  return (
    <a
      href={props.item.url}
      className={styles.container}
      data-active={props.isActive || undefined}
      target="_blank"
      rel="noreferrer"
      ref={ref}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${Env.thumbnailHost}/${props.item.thumbnailFileName}`}
          loading="lazy"
          width="200"
          height="350"
          className={styles.image}
          alt={props.item.title}
        />
        <span className={styles.count}>{props.count}</span>
      </div>
      <div>
        <div className={styles.header}>
          <span
            className={styles.category}
            style={{
              backgroundColor: labelColor(props.item.category),
            }}
          >
            {props.item.category}
          </span>
          <button
            onClick={handleClick}
            className={styles.iconButton}
            title={props.item.queued ? "already queued" : "enqueue"}
            disabled={props.queueing || props.item.queued}
          >
            <Image src="/download.svg" width="16" height="16" alt="download" />
          </button>
        </div>
        <h3 className={styles.title} title={props.item.title}>
          {props.item.title}
        </h3>
        <div className={styles.description}>{props.item.totalPage} pages</div>
        <div className={styles.description}>{props.item.publishedAt}</div>
      </div>
    </a>
  );
};

function labelColor(str: string): string {
  if (str.length > 8) {
    if (str.includes(" ")) {
      return "#dddd00";
    }
    return "#f09010";
  }
  if (str.length > 6) {
    return "#7700bb";
  }
  return "#ff6050";
}
