import { describe, it, expect } from "vitest";
import { hello } from "./index";

describe("canary test", () => {
  it("should return the hello string", () => {
    expect(hello()).toBe("Hello, SurveyBuilder!");
  });
});
