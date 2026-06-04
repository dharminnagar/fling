import { describe, it, expect } from "vitest";
import { validateName, RESERVED_NAMES } from "../src/validate.js";

describe("validateName", () => {
  it("accepts valid slug", () => {
    expect(validateName("my-page")).toEqual({ ok: true });
  });

  it("accepts single character slug", () => {
    expect(validateName("a")).toEqual({ ok: true });
  });

  it("accepts slug with numbers", () => {
    expect(validateName("page123")).toEqual({ ok: true });
  });

  it("rejects empty string", () => {
    expect(validateName("")).toEqual({ ok: false, error: "Name cannot be empty" });
  });

  it("rejects reserved names", () => {
    for (const name of RESERVED_NAMES) {
      expect(validateName(name).ok).toBe(false);
    }
  });

  it("rejects names with spaces", () => {
    expect(validateName("my page").ok).toBe(false);
  });

  it("rejects names with underscores", () => {
    expect(validateName("my_page").ok).toBe(false);
  });

  it("rejects uppercase names", () => {
    expect(validateName("MyPage").ok).toBe(false);
  });

  it("rejects names with leading hyphen", () => {
    expect(validateName("-foo").ok).toBe(false);
  });

  it("rejects names with trailing hyphen", () => {
    expect(validateName("foo-").ok).toBe(false);
  });

  it("rejects names longer than 63 characters", () => {
    expect(validateName("a".repeat(64)).ok).toBe(false);
  });
});
