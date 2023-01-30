import { getItems, getQueueList, getNotReadCount } from "../db";
import { ItemsComponent } from "../components/items";
import styles from "./page.module.css";
import { convertItem, convertNotReadCount, convertQueueToProgress } from "../converter";

export default async function Home() {
  const [items, queueList, notReadCount] = await Promise.all([getItems(), getQueueList(), getNotReadCount()]);
  const itemDataList = items.map(convertItem);
  const progressDataList = queueList.map(convertQueueToProgress);
  const notReadCountData = convertNotReadCount(notReadCount);

  return (
    <main className={styles.main}>
      <ItemsComponent items={itemDataList} progressDataList={progressDataList} notReadCountData={notReadCountData} />
    </main>
  );
}
