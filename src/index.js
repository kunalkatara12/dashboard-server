import app from "./app.js";
import { connectToDB } from "./config/db.config.js";
const port = process.env.PORT ? parseInt(process.env.PORT) : 2312;
connectToDB()
  .then(() => {
    // sample response
    app.get("/", (req, res) => {
      res.send("Jai Shree Ram");
    });
    app.listen(port, () => {
      console.log(
        `Connected to DB 👍 and Port is listening on http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.log("Error in connecting to database in index.js:", err);
  });
