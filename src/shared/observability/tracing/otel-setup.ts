import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const SERVICE_NAME = 'distribuidora-quality-lab';
const SERVICE_VERSION = '1.0.0';

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
});

const sdk = new NodeSDK({
  resource,
});

const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);

export function setupTracing(): void {
  sdk.start();
}

export function getTracer() {
  return tracer;
}

export function getActiveContext() {
  return context.active();
}

export { SpanStatusCode, trace, context };
