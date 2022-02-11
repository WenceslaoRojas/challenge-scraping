const host = require("./app.js");
const { conn } = require("./src/db.js");

// Syncing all the models at once.
conn
  .sync({
    force: true,
  })
  .then(() => {
    host.listen(process.env.PORT || 3001, () => {
      console.log("%s listening at 3001"); // eslint-disable-line no-console
    });
  });
