import { onDownloadToBrowser } from "./../../backend/controllers";
import React from "react";

const useVideoDownload = (filepath: string) => {
  const [dataString, setDataString] = React.useState<string | null>(null);
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
          const { base64string } = payload;
          setDataString(base64string);
        });
      } catch (error) {
        console.error(error);
        setDataString(null);
      } finally {
        setLoading(false);
      }
    }

    getVideo();
  }, [filepath]);

  return { dataString, loading };
};

export default useVideoDownload;
