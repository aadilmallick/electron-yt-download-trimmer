import { toast } from "react-toastify";
import { onDownloadToBrowser } from "./../../backend/controllers";
import React from "react";

function createVideoBlobFromBase64Chunks(base64Array: string[]) {
  if (!Array.isArray(base64Array) || base64Array.length === 0) {
    throw new Error("Input must be a non-empty array of Base64 strings.");
  }

  // Convert each Base64 string to a Uint8Array and concatenate them
  const byteArrays = base64Array.map((base64) => {
    const binaryString = atob(base64); // Decode Base64 to binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  });

  // Merge all Uint8Arrays into one large Uint8Array
  const totalLength = byteArrays.reduce((sum, arr) => sum + arr.length, 0);
  const mergedArray = new Uint8Array(totalLength);

  let offset = 0;
  for (const byteArray of byteArrays) {
    mergedArray.set(byteArray, offset);
    offset += byteArray.length;
  }

  // Create a Blob from the merged Uint8Array
  const blob = new Blob([mergedArray], { type: "video/mp4" });

  return blob;
}

const useVideoDownload = (filepath: string) => {
  const [dataChunks, setDataChunks] = React.useState<string[]>([]);
  const [blobUrl, setBlobUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!filepath) {
      console.error("No filepath provided");
      return;
    }
    async function getVideo() {
      try {
        setLoading(true);
        window.appApi.downloadToBrowser(filepath);
        window.appApi.handleEvent("success:download-to-browser", (payload) => {
          const { base64chunks } = payload;
          setDataChunks(base64chunks);
          const blob = createVideoBlobFromBase64Chunks(base64chunks);
          console.log(blob.size);
          setBlobUrl(URL.createObjectURL(blob));
          setLoading(false);
        });
      } catch (error) {
        console.error(error);
        setDataChunks([]);
        setLoading(false);
      }
    }

    getVideo();

    return () => {
      blobUrl && URL.revokeObjectURL(blobUrl);
    };
  }, [filepath]);

  return { dataChunks, loading, blobUrl };
};

export default useVideoDownload;
