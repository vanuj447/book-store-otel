'use strict';

const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { metrics } = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources'); // ✅ Add this

// Step 1: Create a Resource with a proper service name
const resource = new Resource({
  'service.name': 'bookstore-app',
});

// Step 2: Create Prometheus Exporter
const exporter = new PrometheusExporter(
  { port: 9464, startServer: true },
  () => {
    console.log('✅ Prometheus scrape endpoint: http://localhost:9464/metrics');
  }
);

// Step 3: Create MeterProvider with resource, then attach the exporter
const meterProvider = new MeterProvider({ resource });
meterProvider.addMetricReader(exporter);

// Step 4: Get Meter
const meter = meterProvider.getMeter('bookstore-app');

// Step 5: Define Custom Metrics

// 1. Total Orders
const totalOrders = meter.createCounter('bookstore_total_orders', {
  description: 'Total number of book orders placed'
});

// 2. Payment Failures
const paymentFailures = meter.createCounter('bookstore_payment_failures', {
  description: 'Total number of failed payment attempts'
});

// 3. Out-of-stock Counter
const outOfStockCounter = meter.createCounter('bookstore_out_of_stock', {
  description: 'How many times books were attempted but out of stock'
});

// 4. Order Duration Histogram
const orderDuration = meter.createHistogram('bookstore_order_duration_seconds', {
  description: 'Time taken to place an order'
});

module.exports = {
  totalOrders,
  paymentFailures,
  outOfStockCounter,
  orderDuration
};
