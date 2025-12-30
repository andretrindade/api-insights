import { useState } from 'react';
import { FileJson, Layers, Hash, ArrowRightLeft, FileText, RefreshCw } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';
import { AnalysisTable } from '@/components/AnalysisTable';
import { StatsCard } from '@/components/StatsCard';
import { parseOpenAPI, OpenAPIAnalysis } from '@/lib/openapi-parser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [analysis, setAnalysis] = useState<OpenAPIAnalysis | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileLoad = (content: string, name: string) => {
    setIsLoading(true);
    setFileName(name);

    // Small delay to show loading state
    setTimeout(() => {
      try {
        const result = parseOpenAPI(content);
        setAnalysis(result);
        toast({
          title: 'Analysis Complete',
          description: `Found ${result.totalEndpoints} endpoints in ${result.title}`,
        });
      } catch (error) {
        toast({
          title: 'Parse Error',
          description: error instanceof Error ? error.message : 'Failed to parse OpenAPI file',
          variant: 'destructive',
        });
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleReset = () => {
    setAnalysis(null);
    setFileName('');
  };

  const totalRequestFields = analysis?.endpoints.reduce((sum, e) => sum + e.request.fieldCount, 0) || 0;
  const totalResponseFields = analysis?.endpoints.reduce((sum, e) => sum + e.response.fieldCount, 0) || 0;
  const maxRequestDepth = analysis?.endpoints.reduce((max, e) => Math.max(max, e.request.maxDepth), 0) || 0;
  const maxResponseDepth = analysis?.endpoints.reduce((max, e) => Math.max(max, e.response.maxDepth), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 animate-pulse-glow">
                <FileJson className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-mono">
                  OpenAPI Analyzer
                </h1>
                <p className="text-xs text-muted-foreground">
                  Analyze request/response structure complexity
                </p>
              </div>
            </div>
            
            {analysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                New File
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!analysis ? (
          <div className="max-w-xl mx-auto pt-16">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Upload your OpenAPI specification
              </h2>
              <p className="text-muted-foreground">
                Get instant insights on field counts and nesting depth for each endpoint
              </p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <FileUploader onFileLoad={handleFileLoad} isLoading={isLoading} />
            </div>

            {/* Feature hints */}
            <div className="mt-12 grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <Hash className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Field Count</p>
                  <p className="text-xs text-muted-foreground">Count all fields in request and response schemas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                <Layers className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Nesting Depth</p>
                  <p className="text-xs text-muted-foreground">Measure data structure complexity levels</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Info */}
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="p-3 rounded-lg bg-secondary">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{analysis.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Version {analysis.version} • <span className="font-mono">{fileName}</span>
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Endpoints"
                value={analysis.totalEndpoints}
                icon={ArrowRightLeft}
                delay={0}
              />
              <StatsCard
                title="Total Request Fields"
                value={totalRequestFields}
                icon={Hash}
                delay={50}
              />
              <StatsCard
                title="Total Response Fields"
                value={totalResponseFields}
                icon={Hash}
                delay={100}
              />
              <StatsCard
                title="Max Nesting Depth"
                value={Math.max(maxRequestDepth, maxResponseDepth)}
                subtitle={`Req: ${maxRequestDepth} / Res: ${maxResponseDepth}`}
                icon={Layers}
                delay={150}
              />
            </div>

            {/* Analysis Table */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Endpoint Analysis
              </h3>
              <AnalysisTable analysis={analysis} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Supports OpenAPI 2.0 (Swagger) and OpenAPI 3.x specifications
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
