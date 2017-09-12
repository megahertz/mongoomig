'use strict';

const { expect } = require('chai');
const parseConsoleArgs = require('./parseConsoleArgs');

describe('Parse console arguments', () => {
  it('should parse short named arguments', () => {
    expect(parseConsoleArgs(['-a', '1', '-b', '2'])).to.deep.equal({
      _: [],
      a: '1',
      b: '2',
    });
  });

  it('should parse long named arguments', () => {
    expect(parseConsoleArgs(['--a=1', '-b=2'])).to.deep.equal({
      _: [],
      a: '1',
      b: '2',
    });
  });

  it('should parse flag arguments', () => {
    expect(parseConsoleArgs(['-a', '-b'])).to.deep.equal({
      _: [],
      a: true,
      b: true,
    });
  });

  it('should parse anonymous arguments', () => {
    expect(parseConsoleArgs(['a=1', 'b'])).to.deep.equal({
      _: ['a=1', 'b'],
    });
  });

  it('should parse mixed arguments', () => {
    expect(parseConsoleArgs(['-a', '-b', '-c', '1', 'd'])).to.deep.equal({
      _: ['d'],
      a: true,
      b: true,
      c: '1',
    });
  });
});
