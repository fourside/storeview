import Image from "next/image";
import { FC, useEffect, useRef } from "react";
import { Env } from "../env";
import { ArchivedItemData } from "../type";
import styles from "./item-card.module.css";

type ItemCardProps = {
  item: ArchivedItemData;
  count: number;
  isActive: boolean;
};

export const ArchivedItemCard: FC<ItemCardProps> = (props) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (props.isActive && ref.current !== null) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [props.isActive]);

  return (
    <a
      href={`${Env.cloudflareBucketName}/${props.item.archiveUrl}`}
      className={styles.container}
      data-active={props.isActive || undefined}
      download={true}
      ref={ref}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${Env.cloudflareBucketName}/${props.item.thumbnailFileName}`}
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
