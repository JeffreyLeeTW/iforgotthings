import { test } from "node:test";
import assert from "node:assert/strict";
import { academicYear, studentIdError, apiDate } from "./validation.js";

const now = new Date("2026-10-15T00:00:00+08:00");
test("9 digit student IDs validate all segments", () => {
  for (const value of [
    "aaa",
    "11542304",
    "1154230470",
    "１１５４２３０４７",
    "099423047",
    "116423047",
    "115023047",
    "115923047",
    "115413047",
    "115443047",
  ])
    assert.ok(studentIdError(value, now), value);
  for (const value of ["115423047", "100100000", "115850999", "114430001"])
    assert.equal(studentIdError(value, now), "", value);
});
test("academic year switches at August 1 in Taiwan", () => {
  const before = new Date("2026-07-31T15:59:59Z");
  const after = new Date("2026-07-31T16:00:00Z");
  assert.equal(academicYear(before), 114);
  assert.equal(academicYear(after), 115);
  assert.ok(studentIdError("115423047", before));
  assert.equal(studentIdError("115423047", after), "");
});
test("API timestamps without timezone use Taiwan time", () => {
  assert.equal(
    apiDate("2026-10-15T14:30:00").toISOString(),
    "2026-10-15T06:30:00.000Z",
  );
  assert.equal(
    apiDate("2026-10-15T06:30:00Z").toISOString(),
    "2026-10-15T06:30:00.000Z",
  );
});
