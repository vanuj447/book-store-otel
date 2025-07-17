const logger = require('./logger');
const metrics = require('./metrics');

function processPayment(orderId) {
  return new Promise((resolve, reject) => {
    // Simulate latency between 100ms and 1500ms
    const delay = Math.floor(Math.random() * 1400) + 100;
    const shouldFail = Math.random() < 0.1; // 10% failure rate

    const start = Date.now(); // For recording duration metric

    setTimeout(() => {
      const durationInSeconds = (Date.now() - start) / 1000;

      // Record payment duration
      metrics.orderDuration.record(durationInSeconds);

      if (shouldFail) {
        metrics.paymentFailures.add(1); // OTEL metric
        logger.error(`Payment failed for order ${orderId}`);
        reject(new Error('Payment processing failed'));
      } else {
        logger.info(`Payment successful for order ${orderId}`);
        resolve('success');
      }
    }, delay);
  });
}

module.exports = {
  processPayment
};
