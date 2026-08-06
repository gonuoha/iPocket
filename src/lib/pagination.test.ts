import { describe, expect, it } from "vitest";

import {
  getTotalPages,
  getVisiblePageNumbers,
  normalizePage,
  parsePageParam,
} from "./pagination";

describe("parsePageParam", () => {
  it("defaults invalid values to page 1", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-1")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
  });

  it("parses valid page numbers", () => {
    expect(parsePageParam("1")).toBe(1);
    expect(parsePageParam("3")).toBe(3);
  });
});

describe("getTotalPages", () => {
  it("returns 1 for empty result sets", () => {
    expect(getTotalPages(0, 21)).toBe(1);
  });

  it("calculates total pages from count and page size", () => {
    expect(getTotalPages(21, 21)).toBe(1);
    expect(getTotalPages(22, 21)).toBe(2);
    expect(getTotalPages(42, 21)).toBe(2);
    expect(getTotalPages(43, 21)).toBe(3);
  });
});

describe("normalizePage", () => {
  it("clamps page numbers to the available range", () => {
    expect(normalizePage(0, 5)).toBe(1);
    expect(normalizePage(3, 5)).toBe(3);
    expect(normalizePage(9, 5)).toBe(5);
  });
});

describe("getVisiblePageNumbers", () => {
  it("returns all pages when there are seven or fewer", () => {
    expect(getVisiblePageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("inserts ellipses for larger page counts", () => {
    expect(getVisiblePageNumbers(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("shows early pages when near the start", () => {
    expect(getVisiblePageNumbers(2, 10)).toEqual([
      1,
      2,
      3,
      "ellipsis",
      10,
    ]);
  });

  it("shows late pages when near the end", () => {
    expect(getVisiblePageNumbers(9, 10)).toEqual([
      1,
      "ellipsis",
      8,
      9,
      10,
    ]);
  });
});
