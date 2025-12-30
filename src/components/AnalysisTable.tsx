import { OpenAPIAnalysis } from '@/lib/openapi-parser';
import { MethodBadge } from './MethodBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AnalysisTableProps {
  analysis: OpenAPIAnalysis;
}

export function AnalysisTable({ analysis }: AnalysisTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-muted-foreground font-semibold w-[80px]">Method</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Path</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center w-[100px]">
              <div className="flex flex-col">
                <span>Request</span>
                <span className="text-xs font-normal">Fields</span>
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center w-[100px]">
              <div className="flex flex-col">
                <span>Request</span>
                <span className="text-xs font-normal">Depth</span>
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center w-[100px]">
              <div className="flex flex-col">
                <span>Response</span>
                <span className="text-xs font-normal">Fields</span>
              </div>
            </TableHead>
            <TableHead className="text-muted-foreground font-semibold text-center w-[100px]">
              <div className="flex flex-col">
                <span>Response</span>
                <span className="text-xs font-normal">Depth</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analysis.endpoints.map((endpoint, index) => (
            <TableRow 
              key={`${endpoint.method}-${endpoint.path}-${index}`}
              className="hover:bg-secondary/50 border-border transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <TableCell>
                <MethodBadge method={endpoint.method} />
              </TableCell>
              <TableCell className="font-mono text-sm text-foreground">
                <div className="flex flex-col">
                  <span className="truncate max-w-[400px]">{endpoint.path}</span>
                  {endpoint.summary && (
                    <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                      {endpoint.summary}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-secondary rounded text-foreground">
                  {endpoint.request.fieldCount}
                </span>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                  {endpoint.request.maxDepth}
                </span>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-secondary rounded text-foreground">
                  {endpoint.response.fieldCount}
                </span>
              </TableCell>
              <TableCell className="text-center font-mono text-sm">
                <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 bg-secondary rounded text-muted-foreground">
                  {endpoint.response.maxDepth}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
