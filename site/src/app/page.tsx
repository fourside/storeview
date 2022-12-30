import { getItems } from "../db";
import { ItemsComponent } from "../components/items";
import styles from "./page.module.css";

export default async function Home() {
  const items = await getItems();

  return (
    <main className={styles.main}>
      <ItemsComponent items={items} />
    </main>
  );
}
