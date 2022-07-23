const fs = require("fs");
const path = require("path");
const cors = require("cors");
const https = require("https");
const app = require("express")();
const bodyParser = require("body-parser");
const ae = require("./aeinteract");
const { getExtractionServerState, pingState } = require("./pingState");
const aeDir = "./temp";

const PORT = 80;

// create temp dir if not there
if (!fs.existsSync(aeDir)) {
  fs.mkdirSync(aeDir);
}

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => res.send({ status: "OK" }));
app.get("/status", (req, res) => res.send(getExtractionServerState()));

app.post("/", async (req, res, next) => {
  try {
    const { fileUrl } = req.body;
    if (!fileUrl) return res.status(400).json({ message: "no file provided" });

    const type = path.basename(fileUrl).split(".").pop();
    if (!["aep", "aepx"].includes(type))
      return res.status(400).json({ message: "Invalid file type" });
    //mark as not idle
    await pingState(false)
    const filename = `${Date.now()}.${type}`;
    const file = fs.createWriteStream(`temp/${filename}`);

    https.get(fileUrl, function (response) {
      response.pipe(file);
      console.log(file.path);
      ae.getProjectStructure(file.path)
        .then(async (output) => {
          // fs.unlinkSync(`./temp/${filename}`);
          //mark as idle
          await pingState(true)
          fs.unlinkSync(file.path);
          return res.json(output);
        })
        .catch(async (err) => {
          console.log(err);
          //mark as idle
          await pingState(true)
          next(err);
        });
    });
  } catch (err) {
    console.log(err);
    //mark as idle
    await pingState(true)
    next(err);
  }
});

app.use(({ message }, req, res, next) => res.status(500).json({ message }));
app.listen(PORT, () => console.log(`aeinteract: ${PORT}`));
