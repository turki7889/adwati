"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

export interface MultiFile {
  id: string;
  file: File;
}

interface MultiUploadAreaProps {
  onFilesSelect: (files: MultiFile[]) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export default function MultiUploadArea({
  onFilesSelect,
  accept = ".pdf",
  label = "اسحب وأفلت الملفات هنا",
  hint = "أو اضغط للاختيار",
}: MultiUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const multi: MultiFile[] = Array.from(files).map((file, i) => ({
          id: `file-${Date.now()}-${i}`,
          file,
        }));
        onFilesSelect(multi);
      }
    },
    [onFilesSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const multi: MultiFile[] = Array.from(files).map((file, i) => ({
        id: `file-${Date.now()}-${i}`,
        file,
      }));
      onFilesSelect(multi);
    }
    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center
        transition-all duration-200
        ${
          isDragging
            ? "border-primary bg-primary-bg scale-[1.02]"
            : "border-border bg-bg-main hover:border-primary/50 hover:bg-bg-surface"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-5xl mb-4 opacity-30">📁</div>
      <p className="text-lg text-text-secondary font-medium mb-1">{label}</p>
      <p className="text-sm text-text-muted">{hint}</p>
    </div>
  );
}
