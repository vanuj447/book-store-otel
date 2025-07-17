'use strict';

const process = require('process');
const grpc = require('@grpc/grpc-js');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const traceExporter = new OTLPTraceExporter({
  url: 'otel-collector:4317', // Collector hostname (matching Docker network)
  credentials: grpc.credentials.createInsecure(), // 🔥 No TLS
});

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'bookstore-app',
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
});

const sdk = new NodeSDK({
  traceExporter,
  resource,
  instrumentations: getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-http': { enabled: true },
    '@opentelemetry/instrumentation-express': { enabled: true },
    '@opentelemetry/instrumentation-pg': {
      enabled: true,
      enhancedDatabaseReporting: true,
    },
  }),
});

(async () => {
  try {
    await sdk.start();
    console.log('✅ Tracing initialized: bookstore-app → OTEL Collector → Tempo');
  } catch (err) {
    console.error('❌ Failed to initialize tracing', err);
  }

  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown();
      console.log('🔻 Tracing shut down cleanly');
    } catch (err) {
      console.error('❌ Error during tracing shutdown', err);
    } finally {
      process.exit(0);
    }
  });
})();
