import "server-only";
import { getStore } from "@netlify/blobs";
import {localDemoConfig} from "../security/local-demo";
import {filesystemMediaStore} from "./local";
import { scope } from "../config";
import { requireAccess } from "../security/access";
import { HttpError } from "../security/errors";
import { normalizeImage } from "./validate-image";
export { normalizeImage } from "./validate-image";
export function mediaNamespace() {
  return scope.namespace;
}
// No caller-provided namespace: a preview cannot select the production store.
export function mediaStore() {
  const local=localDemoConfig();
  if(local)return filesystemMediaStore(local.root,scope.namespace);
  return getStore({ name: scope.storeName, consistency: "strong" });
}
const imageKey = (key: string) => {
  if (!/^[0-9a-f-]{36}\.webp$/.test(key))
    throw new HttpError(422, "Invalid image key.");
  return key;
};
export async function storeImage(bytes: Buffer) {
  await requireAccess();
  const image = await normalizeImage(bytes);
  const key = `${crypto.randomUUID()}.webp`;
  await mediaStore().set(key, new Uint8Array(image.bytes).buffer, {
    metadata: {
      mime: image.mime,
      width: image.width,
      height: image.height,
      scope: scope.key,
    },
  });
  return { key, namespace: scope.namespace, ...image };
}
export async function readImage(key: string) {
  await requireAccess();
  return mediaStore().get(imageKey(key), { type: "arrayBuffer" });
}
export async function deleteImage(key: string) {
  await requireAccess();
  await mediaStore().delete(imageKey(key));
}
