import { ArchivedItemsComponent } from "../../components/archived-items";
import { convertItem } from "../../converter";
import { getArchivedItems } from "../../db";
import { ArchivedItemData } from "../../type";
import styles from "./page.module.css";

export default async function Archives() {
  const items = await getArchivedItems();
  const itemDataList = items.map(convertItem).filter((it): it is ArchivedItemData => it.archiveUrl !== undefined);
  return (
    <main className={styles.main}>
      <ArchivedItemsComponent items={itemDataList} />
    </main>
  );
}
