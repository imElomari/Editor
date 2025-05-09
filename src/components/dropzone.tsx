"use client";

import { cn } from "../lib/utils";
import type { UseSupabaseUploadReturn } from "../hooks/use-supabase-upload";
import { Button } from "../components/ui/button";
import {
  CheckCircle,
  File,
  XCircle,
} from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { Icons } from "../lib/constances";
import { useTranslation } from "react-i18next";

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: "bytes" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB"
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  if (bytes === 0 || bytes === undefined)
    return size !== undefined ? `0 ${size}` : "0 bytes";
  const i =
    size !== undefined
      ? sizes.indexOf(size)
      : Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

type DropzoneContextType = Omit<
  UseSupabaseUploadReturn,
  "getRootProps" | "getInputProps"
>;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined
);

type DropzoneProps = UseSupabaseUploadReturn & {
  className?: string;
};

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.isSuccess;
  const isActive = restProps.isDragActive;
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0);

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            "border-2 rounded-lg p-6 text-center bg-card transition-all duration-300 text-foreground relative overflow-hidden group",
            className,
            isSuccess
              ? "border-green-500/50 bg-green-50/10 dark:bg-green-900/5"
              : "border-dashed",
            isActive &&
              !isInvalid &&
              "border-primary bg-primary/5 scale-[0.99] transform",
            isActive &&
              isInvalid &&
              "border-destructive bg-destructive/5 scale-[0.99] transform",
            isInvalid && !isActive && "border-destructive/50 bg-destructive/5",
            !isActive &&
              !isInvalid &&
              !isSuccess &&
              "hover:border-primary/50 hover:bg-muted/50"
          ),
        })}
      >
        <input {...getInputProps()} />
        {isActive && !isInvalid && (
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-primary/10 rounded-full p-3 animate-pulse">
              <Icons.upload className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};

// Replace the DropzoneContent component with this enhanced version
const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext();

  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files, setFiles]
  );

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col items-center gap-y-3 py-4", className)}>
        <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full p-3">
          <CheckCircle
            size={24}
            className="animate-in zoom-in-50 duration-300"
          />
        </div>
        <p className="text-green-600 dark:text-green-400 text-sm font-medium animate-in fade-in-50 duration-300">
          Successfully uploaded {files.length} file{files.length > 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  // Only show file list if there are files
  if (files.length > 0) {
    return (
      <div className={cn("flex flex-col", className)}>
        {files.map((file, idx) => {
          const fileError = errors.find((e) => e.name === file.name);
          const isSuccessfullyUploaded = successes.includes(file.name);

          return (
            <div
              key={`${file.name}-${idx}`}
              className={cn(
                "flex items-center gap-x-4 py-3 px-2 rounded-md transition-colors",
                isSuccessfullyUploaded
                  ? "bg-green-50/50 dark:bg-green-900/10"
                  : "hover:bg-muted/50"
              )}
            >
              {file.type.startsWith("image/") ? (
                <div className="h-12 w-12 rounded-md border overflow-hidden shrink-0 bg-muted flex items-center justify-center shadow-sm">
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.name}
                    className="object-cover h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-md border bg-muted/50 flex items-center justify-center shadow-sm">
                  <File size={20} className="text-muted-foreground" />
                </div>
              )}

              <div className="shrink grow flex flex-col items-start truncate">
                <p
                  title={file.name}
                  className="text-sm font-medium truncate max-w-full"
                >
                  {file.name}
                </p>
                {file.errors.length > 0 ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Icons.warning size={12} />
                    {file.errors
                      .map((e) =>
                        e.message.startsWith("File is larger than")
                          ? `File is larger than ${formatBytes(
                              maxFileSize,
                              2
                            )} (Size: ${formatBytes(file.size, 2)})`
                          : e.message
                      )
                      .join(", ")}
                  </p>
                ) : loading && !isSuccessfullyUploaded ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icons.loading size={12} className="animate-spin" />
                    Uploading file...
                  </p>
                ) : fileError ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Icons.close size={12} />
                    Failed to upload: {fileError.message}
                  </p>
                ) : isSuccessfullyUploaded ? (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Successfully uploaded
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Icons.file size={12} />
                    {formatBytes(file.size, 2)}
                  </p>
                )}
              </div>

              {!loading && !isSuccessfullyUploaded && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 justify-self-end text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                  onClick={() => handleRemoveFile(file.name)}
                >
                  <Icons.close size={16} />
                </Button>
              )}
            </div>
          );
        })}
        {exceedMaxFiles && (
          <p className="text-sm text-left mt-2 text-destructive bg-destructive/10 p-2 rounded-md flex items-center gap-2">
            <Icons.alert size={16} />
            You may upload only up to {maxFiles} files, please remove{" "}
            {files.length - maxFiles} file
            {files.length - maxFiles > 1 ? "s" : ""}.
          </p>
        )}
      </div>
    );
  }

  // Return null when there are files (DropzoneEmptyState will handle empty state)
  return null;
};

// Replace the DropzoneEmptyState component with this enhanced version
const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const {
    maxFiles,
    maxFileSize,
    inputRef,
    isSuccess,
    files,
    isDragActive,
    isDragReject,
  } = useDropzoneContext();
  const { t } = useTranslation(['common', 'dashboard']);


  // Don't show empty state if there are files or upload was successful
  if (isSuccess || files.length > 0) {
    return null;
  }

  // Show special state for active drag
  if (isDragActive && !isDragReject) {
    return (
      <div className={cn("flex flex-col items-center gap-y-4 py-8", className)}>
        <div className="bg-primary/10 rounded-full p-4 animate-pulse">
          <Icons.upload size={28} className="text-primary" />
        </div>
        <p className="text-primary font-medium animate-pulse">
        {t('common:dropzone.dropFile')}
        </p>
      </div>
    );
  }

  // Show error state for rejected drag
  if (isDragActive && isDragReject) {
    return (
      <div className={cn("flex flex-col items-center gap-y-4 py-8", className)}>
        <div className="bg-destructive/10 rounded-full p-4 animate-pulse">
          <XCircle size={28} className="text-destructive" />
        </div>
        <p className="text-destructive font-medium">
          These files cannot be uploaded
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-y-4 py-8", className)}>
      <div className="bg-muted rounded-full p-4 group-hover:bg-primary/10 transition-colors duration-300">
        <Icons.upload
          size={28}
          className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
        />
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-base font-medium">
          Upload{!!maxFiles && maxFiles > 1 ? ` ${maxFiles}` : ""} file
          {!maxFiles || maxFiles > 1 ? "s" : ""}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
        {t('dropzone.dragAndDrop')}{' '}
        <a
          onClick={() => inputRef.current?.click()}
          className="text-primary underline cursor-pointer transition hover:text-primary/80"
        >
          {t(maxFiles === 1 ? 'dropzone.selectFile' : 'dropzone.selectFiles')}
        </a>{' '}
        {t('dropzone.toUpload')}
        </p>
        {maxFileSize !== Number.POSITIVE_INFINITY && (
        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 px-3 py-1 rounded-full">
          {t('dropzone.maxFileSize', {
            size: formatBytes(maxFileSize, 2)
          })}
        </p>
      )}
      </div>
    </div>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }

  return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };
