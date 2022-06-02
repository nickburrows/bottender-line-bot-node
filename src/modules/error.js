const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: 'https://1ea30777d9024571bd961c6263cbd51a@o1182010.ingest.sentry.io/6297947',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: 'test',
  name: 'My First Test Transaction',
});

module.exports = async function HandleError(context, props) {
  if (process.env.NODE_ENV === 'development') {
    Sentry.captureException(props.error);
    setTimeout(() => {
      try {
        context.sendText(props.error.stack);
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    }, 99);
  }
};
