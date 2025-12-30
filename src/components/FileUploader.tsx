import { useCallback, useState } from 'react';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileLoad: (content: string, fileName: string) => void;
  isLoading?: boolean;
}

export function FileUploader({ onFileLoad, isLoading }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    const validExtensions = ['.json', '.yaml', '.yml'];
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setError('Please upload a JSON or YAML file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300",
          isDragOver 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50",
          isLoading && "pointer-events-none opacity-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
        
        <div className={cn(
          "flex flex-col items-center gap-3 transition-transform duration-300",
          isDragOver && "scale-110"
        )}>
          <div className={cn(
            "p-4 rounded-full bg-secondary transition-colors duration-300",
            isDragOver && "bg-primary/20"
          )}>
            {isDragOver ? (
              <FileJson className="w-8 h-8 text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragOver ? 'Drop your file here' : 'Drop your OpenAPI file here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse • JSON, YAML supported
            </p>
          </div>
        </div>

        {isDragOver && (
          <div className="absolute inset-0 rounded-lg bg-primary/5 animate-pulse" />
        )}
      </label>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
