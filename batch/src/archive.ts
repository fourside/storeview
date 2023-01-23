import JsZip from "jszip";
import fs from "node:fs";
import path from "node:path";

export async function archive(directory: string): Promise<{ fileName: string; zip: Buffer }> {
  const zipper = new JsZip();
  fs.readdirSync(directory).forEach((file) => {
    const buffer = fs.readFileSync(path.join(directory, file));
    zipper.file(file, buffer);
  });

  const zipBlob = await zipper.generateAsync({
    type: "blob",
  });
  const zipArrayBuffer = await zipBlob.arrayBuffer();
  const basename = path.basename(directory);
  return {
    fileName: `${basename}.zip`,
    zip: Buffer.from(zipArrayBuffer),
  };
}
