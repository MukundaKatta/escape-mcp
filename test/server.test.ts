import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { escape } from '../src/server.js';

test('regex escapes metachars', () => {
  assert.equal(escape('a.b*c', 'regex'), 'a\\.b\\*c');
  assert.equal(escape('1+1=2', 'regex'), '1\\+1=2');
});

test('shell quotes with single quotes', () => {
  assert.equal(escape('hello', 'shell'), "'hello'");
  assert.equal(escape("it's", 'shell'), "'it'\\''s'");
});

test('sql doubles embedded quotes', () => {
  assert.equal(escape("O'Brien", 'sql'), "'O''Brien'");
});

test('json uses JSON.stringify', () => {
  assert.equal(escape('hi\nthere', 'json'), '"hi\\nthere"');
});

test('html entity-encodes', () => {
  assert.equal(escape('<a href="x">Tom & Jerry</a>', 'html'), '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;');
});

test('url percent-encodes', () => {
  assert.equal(escape('a b/c', 'url'), 'a%20b%2Fc');
});

test('regex output round-trips as a literal match', () => {
  const literal = 'a.b*';
  const re = new RegExp(escape(literal, 'regex'));
  assert.ok(re.test('xx' + literal + 'yy'));
  assert.ok(!re.test('xxa1b2yy'));
});
