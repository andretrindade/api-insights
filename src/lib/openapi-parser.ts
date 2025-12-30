import yaml from 'js-yaml';

export interface SchemaAnalysis {
  fieldCount: number;
  maxDepth: number;
}

export interface EndpointAnalysis {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  request: SchemaAnalysis;
  response: SchemaAnalysis;
}

export interface OpenAPIAnalysis {
  title: string;
  version: string;
  endpoints: EndpointAnalysis[];
  totalEndpoints: number;
}

function resolveRef(spec: any, ref: string): any {
  const parts = ref.replace('#/', '').split('/');
  let result = spec;
  for (const part of parts) {
    result = result?.[part];
  }
  return result;
}

function analyzeSchema(
  spec: any,
  schema: any,
  visited: Set<string> = new Set(),
  depth: number = 1
): SchemaAnalysis {
  if (!schema) {
    return { fieldCount: 0, maxDepth: 0 };
  }

  // Handle $ref
  if (schema.$ref) {
    if (visited.has(schema.$ref)) {
      return { fieldCount: 0, maxDepth: depth };
    }
    visited.add(schema.$ref);
    const resolved = resolveRef(spec, schema.$ref);
    return analyzeSchema(spec, resolved, visited, depth);
  }

  // Handle allOf, oneOf, anyOf
  if (schema.allOf) {
    let totalFields = 0;
    let maxDepth = depth;
    for (const subSchema of schema.allOf) {
      const result = analyzeSchema(spec, subSchema, new Set(visited), depth);
      totalFields += result.fieldCount;
      maxDepth = Math.max(maxDepth, result.maxDepth);
    }
    return { fieldCount: totalFields, maxDepth };
  }

  if (schema.oneOf || schema.anyOf) {
    const schemas = schema.oneOf || schema.anyOf;
    let maxFields = 0;
    let maxDepth = depth;
    for (const subSchema of schemas) {
      const result = analyzeSchema(spec, subSchema, new Set(visited), depth);
      maxFields = Math.max(maxFields, result.fieldCount);
      maxDepth = Math.max(maxDepth, result.maxDepth);
    }
    return { fieldCount: maxFields, maxDepth };
  }

  // Handle array
  if (schema.type === 'array' && schema.items) {
    const itemsResult = analyzeSchema(spec, schema.items, visited, depth + 1);
    return {
      fieldCount: itemsResult.fieldCount,
      maxDepth: itemsResult.maxDepth,
    };
  }

  // Handle object
  if (schema.type === 'object' || schema.properties) {
    const properties = schema.properties || {};
    const propertyNames = Object.keys(properties);
    let totalFields = propertyNames.length;
    let maxDepth = propertyNames.length > 0 ? depth : 0;

    for (const propName of propertyNames) {
      const propSchema = properties[propName];
      const propResult = analyzeSchema(spec, propSchema, new Set(visited), depth + 1);
      
      // Only add nested fields if they exist
      if (propResult.fieldCount > 0 && (propSchema.type === 'object' || propSchema.type === 'array' || propSchema.$ref || propSchema.properties)) {
        totalFields += propResult.fieldCount;
      }
      maxDepth = Math.max(maxDepth, propResult.maxDepth);
    }

    // Handle additionalProperties
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const addResult = analyzeSchema(spec, schema.additionalProperties, new Set(visited), depth + 1);
      totalFields += addResult.fieldCount;
      maxDepth = Math.max(maxDepth, addResult.maxDepth);
    }

    return { fieldCount: totalFields, maxDepth };
  }

  // Primitive types
  return { fieldCount: 0, maxDepth: 0 };
}

function getRequestSchema(spec: any, operation: any): any {
  // Check requestBody (OpenAPI 3.x)
  if (operation.requestBody) {
    const content = operation.requestBody.content;
    if (content) {
      const mediaType = content['application/json'] || content['*/*'] || Object.values(content)[0];
      return (mediaType as any)?.schema;
    }
  }

  // Check parameters for body (OpenAPI 2.x / Swagger)
  if (operation.parameters) {
    const bodyParam = operation.parameters.find((p: any) => p.in === 'body');
    if (bodyParam) {
      return bodyParam.schema;
    }
  }

  return null;
}

function getResponseSchema(spec: any, operation: any): any {
  const responses = operation.responses;
  if (!responses) return null;

  // Only check 2xx status codes
  const responseCodes = Object.keys(responses);
  const successCodes = responseCodes.filter(code => /^2\d{2}$/.test(code)).sort();
  
  for (const code of successCodes) {
    const response = responses[code];
    if (response) {
      // OpenAPI 3.x
      if (response.content) {
        const mediaType = response.content['application/json'] || response.content['*/*'] || Object.values(response.content)[0];
        return (mediaType as any)?.schema;
      }
      // OpenAPI 2.x / Swagger
      if (response.schema) {
        return response.schema;
      }
    }
  }

  return null;
}

export function parseOpenAPI(content: string): OpenAPIAnalysis {
  let spec: any;
  
  // Try parsing as JSON first, then YAML
  try {
    spec = JSON.parse(content);
  } catch {
    try {
      spec = yaml.load(content);
    } catch (e) {
      throw new Error('Failed to parse file. Please provide a valid JSON or YAML OpenAPI specification.');
    }
  }

  // Validate it's an OpenAPI/Swagger spec
  if (!spec.openapi && !spec.swagger) {
    throw new Error('Invalid OpenAPI specification. Missing "openapi" or "swagger" field.');
  }

  const info = spec.info || {};
  const paths = spec.paths || {};
  const endpoints: EndpointAnalysis[] = [];

  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    for (const method of methods) {
      const operation = (pathItem as any)[method];
      if (!operation) continue;

      const requestSchema = getRequestSchema(spec, operation);
      const responseSchema = getResponseSchema(spec, operation);

      const requestAnalysis = analyzeSchema(spec, requestSchema);
      const responseAnalysis = analyzeSchema(spec, responseSchema);

      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId,
        summary: operation.summary,
        request: requestAnalysis,
        response: responseAnalysis,
      });
    }
  }

  return {
    title: info.title || 'Untitled API',
    version: info.version || 'N/A',
    endpoints,
    totalEndpoints: endpoints.length,
  };
}
