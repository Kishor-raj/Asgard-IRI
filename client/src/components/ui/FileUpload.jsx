import { useRef, useState } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function FileUpload({
  label,
  error,
  required,
  accept = '.pdf,application/pdf',
  maxSizeMB = 5,
  onChange,
  className = '',
  id,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'file-upload');

  const handleFile = (file) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size exceeds maximum allowed size (${maxSizeMB} MB).`);
      return;
    }

    setLocalError(null);
    setSelectedFile(file);
    if (onChange) onChange(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onChange) onChange(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-grey-900 mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {!selectedFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors bg-grey-50 hover:bg-grey-100 ${
            error || localError ? 'border-error' : 'border-grey-200 hover:border-navy'
          }`}
        >
          <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-grey-400 mb-2" />
          <p className="text-sm font-medium text-grey-900">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-grey-400 mt-1">
            Max {maxSizeMB} MB ({accept.replace(/,/g, ', ')})
          </p>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border border-grey-200 rounded-lg bg-grey-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <DocumentIcon className="w-6 h-6 text-navy shrink-0" />
            <div className="truncate">
              <p className="text-sm font-medium text-grey-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-grey-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-grey-400 hover:text-error transition-colors rounded"
            aria-label="Remove uploaded file"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {(error || localError) && (
        <p className="text-error text-xs mt-1">{error || localError}</p>
      )}
    </div>
  );
}
