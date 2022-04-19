const { Console } = require('console');
const { Transform } = require('stream');

const ts = new Transform({ transform: (chunk, _, cb) => cb(null, chunk) });
const logger = new Console({ stdout: ts, stderr: ts, colorMode: false });
const handler = {
  get(_, prop) {
    // eslint-disable-next-line no-undef
    return new Proxy(logger[prop], handler);
  },
  apply(target, _, args) {
    target.apply(logger, args);
    return (ts.read() || '').toString();
  },
};

/** @type {typeof console} */
// eslint-disable-next-line no-undef
const dump = new Proxy(logger, handler);
module.exports = { stronsole: dump };
