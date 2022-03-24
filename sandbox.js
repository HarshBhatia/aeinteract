const extract = require("./aeinteract");

extract
  .getProjectStructure("./test/white_ethnic.aep")
  .then((c) => {
    console.log("Done Extracting")
  })
  .catch(console.log);
