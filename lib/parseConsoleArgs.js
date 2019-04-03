'use strict';

/**
 * Transform process.argv to key-value object
 * @param {string[]} [argv]
 * @return {{_: string[]} & Object<string, string | boolean>}
 */
function parseConsoleArgs(argv) {
  argv = Array.isArray(argv) ? argv : process.argv.slice(2);

  let key;
  return argv.reduce((res, arg) => {
    if (arg.indexOf('-') === 0) {
      key = arg.replace(/^-+/, '');

      if (key.indexOf('=') > 0) {
        const [k, v] = key.split('=', 2).map(s => s.trim());
        key = null;
        return { ...res, [k]: v };
      }

      return { ...res, [key]: res[key] || true };
    }

    if (key) {
      if (!res[key] || res[key] === true) {
        res[key] = arg.trim();
      } else {
        res[key] = [].concat(res[key]).concat(arg.trim());
      }

      key = null;
    } else {
      res._.push(arg.trim());
    }

    return res;
  }, { _: [] });
}

module.exports = parseConsoleArgs;
