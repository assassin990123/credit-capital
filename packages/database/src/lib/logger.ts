const log = (...args) =>
  console.log(`[${new Date().toISOString()}][LOG]`, ...args);
const error = (...args) =>
  console.log(`[${new Date().toISOString()}][ERROR]`, ...args);
const debug = (...args) =>
  console.log(`[${new Date().toISOString()}][DEBUG]`, ...args);

const logger = { log, error, debug };

export default logger;
