export const redact = (str: string) => str.replace(/[a-zA-Z0-9]/gim, '▆');
export const redactObj = (obj: unknown) =>
  Object.keys(obj).reduce((result, key) => {
    if (typeof result !== 'string') {
      result[key] = redact(JSON.stringify(obj[key]));
    } else {
      result[key] = redact(obj[key]);
    }

    return result;
  }, {});
