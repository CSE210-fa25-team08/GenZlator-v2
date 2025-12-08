const { withTimeout } = require("../src/utils/withTimeout");

describe("withTimeout()", () => {

  // -------------------------------------------
  // 1. resolves before timeout
  // -------------------------------------------
  test("resolves successfully before timeout", async () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve("OK"), 50));

    const result = await withTimeout(promise, 100);  // 100ms > 50ms

    expect(result).toBe("OK");
  });

  // -------------------------------------------
  // 2. rejects when timeout exceeded
  // -------------------------------------------
  test("rejects with timeout error when time exceeded", async () => {
    const promise = new Promise((resolve) => setTimeout(() => resolve("Late"), 100));

    await expect(withTimeout(promise, 30))   // timeout < promise resolve
      .rejects.toThrow("Timeout");
  });

  // -------------------------------------------
  // 3. custom timeout message should work
  // -------------------------------------------
  test("uses custom timeout message", async () => {
    const promise = new Promise(() => {}); // never resolves

    await expect(
      withTimeout(promise, 10, "Custom Timeout!")
    ).rejects.toThrow("Custom Timeout!");
  });

  // -------------------------------------------
  // 4. if promise rejects first, reject immediately
  // -------------------------------------------
  test("propagates the original error if promise rejects first", async () => {
    const promise = Promise.reject(new Error("Original Error"));

    await expect(withTimeout(promise, 100)).rejects.toThrow("Original Error");
  });

});
