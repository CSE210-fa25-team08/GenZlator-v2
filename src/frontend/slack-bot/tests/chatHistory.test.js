const { getChatHistory } = require("../src/utils/chatHistory");

// Mock Slack client
const mockClient = {
  conversations: {
    history: jest.fn()
  }
};

describe("getChatHistory()", () => {
  
  test("returns [] when no channelId is provided", async () => {
    const result = await getChatHistory(mockClient, null);
    expect(result).toEqual([]);
  });

  test("fetches history and returns last 2 valid user messages", async () => {

    mockClient.conversations.history.mockResolvedValue({
      messages: [
        { type: "message", text: "hello", subtype: null },
        { type: "message", text: "world" },
        { type: "message", text: "bot here", bot_id: "123" },  // excluded
        { type: "file", text: "file uploaded" },              // excluded
      ]
    });

    const result = await getChatHistory(mockClient, "C12345");

    expect(mockClient.conversations.history).toHaveBeenCalledWith({
      channel: "C12345",
      limit: 20
    });

    expect(result).toEqual(["hello", "world"]);
  });

  test("filters out subtype messages", async () => {

    mockClient.conversations.history.mockResolvedValue({
      messages: [
        { type: "message", text: "hello" },
        { type: "message", text: "edited", subtype: "message_changed" }, // excluded
        { type: "message", text: "final" },
      ]
    });

    const result = await getChatHistory(mockClient, "C12345");
    expect(result).toEqual(["hello", "final"]);
  });

  test("only returns first 2 valid messages", async () => {

    mockClient.conversations.history.mockResolvedValue({
      messages: [
        { type: "message", text: "msg1" },
        { type: "message", text: "msg2" },
        { type: "message", text: "msg3" },
      ]
    });

    const result = await getChatHistory(mockClient, "C12345");
    expect(result).toEqual(["msg1", "msg2"]);
  });

  test("returns [] when Slack API throws", async () => {

    mockClient.conversations.history.mockRejectedValue(new Error("Slack error"));

    const result = await getChatHistory(mockClient, "C12345");

    expect(result).toEqual([]);
  });

});
