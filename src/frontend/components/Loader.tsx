import React from "react";

export const Loader = () => {
  // create a blue loading spinner with tailwind styling
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};
