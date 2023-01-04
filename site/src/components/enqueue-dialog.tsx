"use client";

import { Item } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { ChangeEvent, FC, FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./enqueue-dialog.module.css";

type EnqueueDialogProps = {
  item: Item;
  onEnqueue: (param: { directory: string; url: string; itemId: string }) => void;
  onClose: () => void;
};

export const EnqueueDialog: FC<EnqueueDialogProps> = (props) => {
  const { onEnqueue } = props;
  const [directory, setDirectory] = useState("");
  const [url, setUrl] = useState(props.item.url);
  const [validationMessage, setValidationMessage] = useState({
    directory: "",
    url: "",
  });

  const handleDirectoryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDirectory(event.target.value);
  }, []);

  const handleUrlChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      if (validationMessage.directory !== "" || validationMessage.url !== "") {
        throw new Error("disabled attribute not work");
      }
      onEnqueue({ directory, url, itemId: props.item.id });
    },
    [directory, onEnqueue, props.item.id, url, validationMessage.directory, validationMessage.url]
  );

  useEffect(() => {
    if (directory === "") {
      setValidationMessage((prev) => ({ ...prev, directory: "set value" }));
    } else if (directory.trim().includes(" ")) {
      setValidationMessage((prev) => ({ ...prev, directory: "directory must not contain spaces" }));
    } else if (directory.includes("/")) {
      setValidationMessage((prev) => ({ ...prev, directory: "directory must not contain slash" }));
    } else {
      setValidationMessage((prev) => ({ ...prev, directory: "" }));
    }

    if (url === "") {
      setValidationMessage((prev) => ({ ...prev, url: "set value" }));
    } else if (!isURL(url)) {
      setValidationMessage((prev) => ({ ...prev, url: "set valid URL" }));
    } else {
      setValidationMessage((prev) => ({ ...prev, url: "" }));
    }
  }, [directory, url]);

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} onClick={props.onClose} />
        <Dialog.Content className={styles.content}>
          <div className={styles.body}>
            <Dialog.Title className={styles.title}>Queue</Dialog.Title>
            <Dialog.Description className={styles.description}>{props.item.title}</Dialog.Description>
            <form className={styles.form} onSubmit={handleSubmit}>
              <fieldset className={styles.formControl}>
                <label className={styles.label}>
                  directory
                  <input
                    value={directory}
                    onChange={handleDirectoryChange}
                    className={styles.input}
                    autoFocus={true}
                    data-error={validationMessage.directory !== "" || undefined}
                  />
                </label>
                {validationMessage.directory !== "" && (
                  <span className={styles.errorMessage}>{validationMessage.directory}</span>
                )}
              </fieldset>
              <fieldset className={styles.formControl}>
                <label className={styles.label}>
                  url
                  <input
                    value={url}
                    onChange={handleUrlChange}
                    className={styles.input}
                    data-error={validationMessage.url !== "" || undefined}
                  />
                </label>
                {validationMessage.url !== "" && <span className={styles.errorMessage}>{validationMessage.url}</span>}
              </fieldset>
              <div>
                <button
                  type="submit"
                  disabled={validationMessage.directory !== "" || validationMessage.url !== ""}
                  className={styles.button}
                >
                  enqueue
                </button>
              </div>
            </form>
          </div>
          <Dialog.Close onClick={props.onClose} className={styles.closeButton}>
            <Image src="/close.svg" width="16" height="16" alt="close" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (ignore) {}
  return false;
}
