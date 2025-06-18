import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, X, File, CheckCircle, Clock } from "lucide-react";

interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  files: File[];
}

export function FileUpload({
  accept,
  multiple = false,
  onFilesChange,
  title,
  description,
  icon,
  files
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiple) {
      onFilesChange([...files, ...acceptedFiles]);
    } else {
      onFilesChange(acceptedFiles);
    }
  }, [files, multiple, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <Card className="overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          {icon}
          {title}
        </h2>
        <p className="text-indigo-100 mt-1">{description}</p>
      </div>
      
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-primary bg-indigo-50"
              : "border-gray-300 hover:border-primary hover:bg-indigo-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-indigo-100 rounded-full">
              <FileUp className="text-primary text-3xl" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-500 mt-1">Drag and drop your files here, or click to browse</p>
              <p className="text-sm text-gray-400 mt-2">Supports PDF and TXT files (max 5MB{multiple ? ' each' : ''})</p>
            </div>
          </div>
        </div>
        
        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="text-purple-600" size={20} />
                  <div>
                    <p className="font-medium text-purple-900">{file.name}</p>
                    <p className="text-sm text-purple-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    Ready
                  </span>
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
