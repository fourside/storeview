import { getItems, getQueueList } from "../db";
import { ItemsComponent } from "../components/items";
import styles from "./page.module.css";
import { convertQueueToProgress } from "../converter";

export default async function Home() {
  const [items, queueList] = await Promise.all([getItems(), getQueueList()]);
  const progressDataList = queueList.map(convertQueueToProgress);

  return (
    <main className={styles.main}>
      <ItemsComponent items={items} progressDataList={progressDataList} />
    </main>
  );
}
