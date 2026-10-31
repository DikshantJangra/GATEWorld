import { expect, test } from "vitest";
import { step } from "./nav";

test("step wraps both ways and handles empty", () => {
  expect(step(2, 3, 1)).toBe(0);
  expect(step(0, 3, -1)).toBe(2);
  expect(step(1, 3, 1)).toBe(2);
  expect(step(0, 0, 1)).toBe(0);
});
