// backendClient.test.js

const axios = require("axios");
const { translate, sendFeedback, getAvailableModels } = require("../src/utils/backendClient");

jest.mock("axios");

describe("backendClient", () => {

  // ---------------------------------------
  // TEST: translate()
  // ---------------------------------------
  test("translate() calls backend with correct payload", async () => {
    axios.post.mockResolvedValue({
      data: { translatedMessage: "🔥hello🔥" }
    });

    const result = await translate("hello", true);

    expect(axios.post).toHaveBeenCalledWith(
      "https://genzlator-api.saichaparala.com/api/v1/translate",
      {
        originalMessage: "hello",
        isToEmoji: true,
        chatHistory: []
      }
    );

    expect(result).toBe("🔥hello🔥");
  });

  test("translate() handles chatHistory parameter", async () => {
    axios.post.mockResolvedValue({
      data: { translatedMessage: "👌yo" }
    });

    const chatHistory = [{ role: "user", content: "hi" }];

    await translate("wow", false, chatHistory);

    expect(axios.post).toHaveBeenCalledWith(
      "https://genzlator-api.saichaparala.com/api/v1/translate",
      {
        originalMessage: "wow",
        isToEmoji: false,
        chatHistory
      }
    );
  });

  test("translate() throws on backend error", async () => {
    axios.post.mockRejectedValue(new Error("Backend failed"));

    await expect(translate("oops", true)).rejects.toThrow("Backend failed");
  });

  // ---------------------------------------
  // TEST: sendFeedback()
  // ---------------------------------------
  test("sendFeedback() sends payload correctly", async () => {
    axios.post.mockResolvedValue({ data: { ok: true } });

    const result = await sendFeedback("bad text", "fixed text", "abc123", 5);

    expect(axios.post).toHaveBeenCalledWith(
      "https://genzlator-api.saichaparala.com/api/v1/feedback",
      {
        originalInput: "bad text",
        correctionText: "fixed text",
        anonymousId: "abc123",
        rating: 5
      }
    );

    expect(result).toEqual({ ok: true });
  });

  test("sendFeedback() throws on backend error", async () => {
    axios.post.mockRejectedValue(new Error("Feedback failed"));

    await expect(
      sendFeedback("x", "y", "z", 3)
    ).rejects.toThrow("Feedback failed");
  });

  // ---------------------------------------
  // TEST: getAvailableModels()
  // ---------------------------------------
  test("getAvailableModels() fetches models from backend", async () => {
    const fakeData = { models: [{ id: "mistral" }], total_count: 1 };

    axios.get.mockResolvedValue({ data: fakeData });

    const result = await getAvailableModels();

    expect(axios.get).toHaveBeenCalledWith(
      "https://genzlator-api.saichaparala.com/api/v1/models"
    );

    expect(result).toEqual(fakeData);
  });

  test("getAvailableModels() throws on error", async () => {
    axios.get.mockRejectedValue(new Error("Network error"));

    await expect(getAvailableModels()).rejects.toThrow("Network error");
  });
});
