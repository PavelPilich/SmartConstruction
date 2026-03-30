import { Upload, FileText, X } from "lucide-react";

interface FileUploadSimProps {
  fileName: string;
  onUpload: (fileName: string) => void;
  onClear: () => void;
  label?: string;
}

export function FileUploadSim({ fileName, onUpload, onClear, label }: FileUploadSimProps) {
  const handleClick = () => {
    // Simulate file selection
    const extensions = ["pdf", "pdf", "pdf", "jpg", "png", "docx"];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    const baseName = (label || "document").toLowerCase().replace(/[^a-z0-9]/g, "-");
    const simName = `${baseName}-${Date.now().toString(36)}.${ext}`;
    onUpload(simName);
  };

  if (fileName) {
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="text-sm text-blue-800 flex-1 truncate">{fileName}</span>
        <button onClick={onClear} className="text-blue-400 hover:text-red-500 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition w-full"
    >
      <Upload className="w-4 h-4" />
      <span>Upload file</span>
    </button>
  );
}
