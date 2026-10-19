import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

test('comparison reproduces historical results without filling missing debt', () => {
  execFileSync(process.execPath, ['scripts/build-comparisons.mjs']);
  const data = JSON.parse(fs.readFileSync('data/comparisons.json', 'utf8'));
  const current = data.rows.find(row => row.start === 2023);
  // Independently published annual IPCA results: 4.62%, 4.83%, 4.26%.
  const expected = (1.0462 * 1.0483 * 1.0426 - 1) * 100;
  assert.ok(Math.abs(current.ipcaAccumulated - expected) < 0.01);
  assert.equal(current.end, 2025);
  assert.equal(current.years, 3);
  assert.equal(data.rows.find(row => row.start === 2003).debtChangePP, null);
  assert.equal(data.rows.find(row => row.start === 1999).debtEnd, null);
  const years = data.rows.flatMap(row => Array.from({ length: row.years }, (_, i) => row.start + i));
  assert.deepEqual(years, Array.from({ length: 27 }, (_, i) => 1999 + i));
  // The compounded two-year recession must not be a simple sum (-6.8%).
  assert.ok(Math.abs(data.rows.find(row => row.start === 2015).gdpAccumulated - (-6.6845)) < 0.001);
});
