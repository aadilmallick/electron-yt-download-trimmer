import { useNavigate } from "react-router-dom";
import React from "react";
import { toast } from "react-toastify";
export const ClearVideoButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  return (
    <button
      className="bg-black border-gray-200 shadow-md border-2 text-white font-semibold px-2 py-1 text-center rounded-md focus:ring-blue-300 focus:ring-2 absolute top-0 right-2 z-50 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        window.appApi.clearVideos();
        window.appApi.handleEvent("success:clear", (payload) => {
          toast.success(payload.message);
          setLoading(false);
          navigate("/");
        });
        window.appApi.handleEvent("error:clear", (payload) => {
          toast.error(payload.message);
          setLoading(false);
        });
      }}
    >
      Back to start
    </button>
  );
};
