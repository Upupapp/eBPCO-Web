/**
 * A file's bytes, base64-encoded — what `POST /documents` and the staff
 * resubmit route both take as `contentBase64`. Chunked: a single spread of a
 * large file's byte array overflows the call stack.
 */
export async function toBase64(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    binary += String.fromCharCode(...buf.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
