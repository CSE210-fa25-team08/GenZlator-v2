const { app } = require("./app");

const registerCommands = require("./routes/commands");
const registerActions = require("./routes/actions");
const registerViews = require("./routes/views");
const registerEvents = require("./routes/events");
const registerShortcuts = require("./routes/shortcuts");

registerCommands(app);
registerActions(app);
registerViews(app);
registerEvents(app);
registerShortcuts(app);


(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`Slack app running on port ${port}`);
})();