import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconFile } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 5,  // Reduzido de 20 para 5
    y: -5, // Reduzido de -20 para -5
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  onChange: (file: File | null) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ onChange, accept, label }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const newFile = newFiles[0] || null;
    setFile(newFile);
    onChange(newFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: accept ? { [accept]: [] } : undefined,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log("File rejected:", error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-6 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden backdrop-filter backdrop-blur-sm border border-white/10"
      >
        <input
          {...getInputProps()}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-white to-black opacity-20 group-hover/file:opacity-10 transition-opacity" />
        </div>
        <div className="flex flex-col items-center justify-center">
          <motion.div
            variants={mainVariant}
            className="relative z-20 text-white mb-2"
          >
            {file ? <IconFile className="w-8 h-8" /> : <IconUpload className="w-8 h-8" />}
          </motion.div>
          <motion.p
            variants={secondaryVariant}
            className="relative z-20 font-sans font-bold text-white text-base"
          >
            {file ? file.name : (label || "Upload File")}
          </motion.p>
          <motion.p
            variants={secondaryVariant}
            className="relative z-20 font-sans font-normal text-white/70 text-sm mt-1"
          >
            {file ? "Click or drag to replace" : (isDragActive ? "Drop the file here" : "Drag and drop or click to select")}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
