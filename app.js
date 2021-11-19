const express = require("express");
const axios = require("axios");
const bodyparser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(bodyparser.json());
const port = 3000;

// Lancement du service
app.listen(port, () => {
  console.log(`Service listening at http://localhost:${port}`);
  checkConfig();
  displayFilter();
});

const filterFolder = "./filters/";

const checkFilter = (files) => {
  // if file empty
  if (files.length === 0) {
    return console.log("🙃 Folder /filters doesn't contain any files");
  }

  files.forEach((file) => {
    fs.readFile(`${filterFolder}${file}`, (err, data) => {
      console.log(file);
      const fileContent = data.toString("utf8");
      if (fileContent === "") {
        return console.log("❌ Empty file");
      } else {
        try {
          const module = require(`${filterFolder}${file}`);

          // console.log(fileContent);
          console.log("✅ Filter ok");
        } catch (e) {
          console.log("❌ Not a function");
        }
      }
    });
  });
};

const displayFilter = () => {
  if (!fs.existsSync(filterFolder)) {
    console.log("❌ Folder /filters doesn't exist");
    // Verif dossier vide
  } else {
    fs.readdir(filterFolder, (err, files) => {
      if (err) {
        console.log(err);
      }
      checkFilter(files);
    });
  }
};

const checkConfig = () => {
  if (!fs.existsSync("config-filters.json")) {
    console.log("❌ Folder config-filters.json doesn't exist");
  } else {
    fs.readFile("config-filters.json", (err, data) => {
      const fileContent = data.toString("utf8");
      if (fileContent.length === 0) {
        console.log("❌ Folder config-filters.json is empty");
      } else {
        const configContent = JSON.parse(fileContent);
        if (!configContent.steps) {
          console.log("❌ Missing a parameters 'steps'");
        } else {
          if (Object.keys(configContent.steps).includes("")) {
            console.log("❌ Missing a key in 'steps'");
          } else {
            const filters = listFilter().map((filter) => {
              return filter.substring(0, filter.length - 3);
            });
            Object.values(configContent.steps).forEach((step) => {
              if(!filters.includes(step.filter)) {
                console.log("❌ Filter attribute isn't file name of filter");
              } else {
                if(step.params && !Array.isArray(step.params)) {
                  console.log("❌ Filter params is not an Array")
                } else {
                  if (step.next && !Object.keys(configContent.steps).includes(step.next)) {
                    console.log("❌ Next attribute isn't key of an exiting step")
                  } else {
                    console.log("tout il est bon")
                  }
                }
              }
            })
          }
        }
      }
    });
  }
};

const listFilter = () => {
  files = fs.readdirSync(filterFolder);
  return files;
};
