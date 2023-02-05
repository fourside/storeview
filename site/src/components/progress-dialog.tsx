import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { getProgressDataList } from "../fetch-client";
import { ProgressData } from "../type";
import styles from "./progress-dialog.module.css";

type ProgressDialogProps = {
  progressList: ProgressData[];
  onClose: () => void;
};

export const ProgressDialog: FC<ProgressDialogProps> = (props) => {
  const [progressList, setProgressList] = useState(props.progressList);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const list = await getProgressDataList();
      if (list.every((it) => it.total === it.progress)) {
        return;
      }
      setProgressList(list);
    }, 5000);
    () => {
      clearTimeout(timer);
    };
  }, [progressList]);

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} onClick={props.onClose} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>Progress</Dialog.Title>
          </div>
          <div className={styles.body}>
            {progressList.map((progress) => (
              <ProgressBar key={progress.directory} progressData={progress} />
            ))}
          </div>
          <Dialog.Close onClick={props.onClose} className={styles.closeButton}>
            <Image src="/close.svg" width="16" height="16" alt="close" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type ProgressBarProps = {
  progressData: ProgressData;
};

const ProgressBar: FC<ProgressBarProps> = (props) => {
  const value = useMemo(() => {
    return Math.floor(props.progressData.progress / props.progressData.total);
  }, [props.progressData]);

  return (
    <div className={styles.progressContainer}>
      <div>{props.progressData.directory}</div>
      <Progress.Root value={value} className={styles.progressRoot}>
        <Progress.Indicator
          className={styles.progressIndicator}
          style={{ transform: `translateX(-${100 - props.progressData.progress}%)` }}
        />
      </Progress.Root>
    </div>
  );
};
