import React from "react";

interface FileDialogProps {
  dirPath: string;
  onChooseDir: () => void;
}

const FileDialog = ({ dirPath, onChooseDir }: FileDialogProps) => {
  return (
    <div className="p-8 flex items-center flex-wrap gap-4 max-w-[800px]">
      <button
        className="px-3 py-1 font-semibold text-white bg-blue-400 rounded-3xl text-sm"
        onClick={onChooseDir}
      >
        Choose output folder
      </button>
      {dirPath && (
        <p className="flex-1 bg-gray-200 text-gray-500 min-w-[20rem] p-1 rounded-sm">
          {dirPath}
        </p>
      )}
    </div>
  );
};

export default FileDialog;
