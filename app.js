const express = require("express");
const axios = require("axios");
const bodyparser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(bodyparser.json());
const port = 3000;
const { program } = require("commander");

// WARNING !!
// Problème d'asyncrone => les fonctions se font en même temps et non à la suite
// Les filters se lancent en meme temps que la vérification, donc meme si il y a une erreur les filters se lancent ..
// Il faudrait retravailler les fonctions avec des promesses ...

// Lancement du service
app.listen(port, () => {
  console.log(`Service listening at http://localhost:${port}`);
  try {
    checkConfig();
    displayFilter();
    runFilters();
  } catch (e) {
    console.log(e);
  }
});

const filterFolder = "./filters/";
const configFilePath = "config-filters.json";

const runFilters = () => {
  const steps = getSteps();
  const step0 = steps[0];
  doNextFunction(step0, ["hello.txt"]);
};

const checkFilter = (files) => {
  if (files.length === 0) {
    throw new Error("🙃 Folder /filters doesn't contain any files");
  }

  files.forEach((file) => {
    fs.readFile(`${filterFolder}${file}`, (err, data) => {
      console.log(file);
      const fileContent = data.toString("utf8");
      if (fileContent === "") {
        throw new Error("❌ Empty file");
      } else {
        try {
          const module = require(`${filterFolder}${file}`);
          console.log("✅ Filter ok");
        } catch (e) {
          throw new Error("❌ Not a function");
        }
      }
    });
  });
};

const displayFilter = () => {
  if (!fs.existsSync(filterFolder)) {
    throw new Error("❌ Folder /filters doesn't exist");
  } else {
    fs.readdir(filterFolder, (err, files) => {
      if (err) {
        throw new Error(err);
      }
      checkFilter(files);
    });
  }
};

const listFilter = () => {
  files = fs.readdirSync(filterFolder);
  return files;
};

const checkConfig = () => {
  if (!fs.existsSync(configFilePath)) {
    throw new Error("❌ Folder config-filters.json doesn't exist");
  } else {
    fs.readFile(configFilePath, (err, data) => {
      const fileContent = data.toString("utf8");
      if (fileContent.length === 0) {
        throw new Error("❌ Folder config-filters.json is empty");
      } else {
        const configContent = JSON.parse(fileContent);
        if (!configContent.steps) {
          throw new Error("❌ Missing a parameters 'steps'");
        } else {
          if (Object.keys(configContent.steps).includes("")) {
            throw new Error("❌ Missing a key in 'steps'");
          } else {
            const filters = listFilter().map((filter) => {
              return filter.substring(0, filter.length - 3);
            });
            Object.values(configContent.steps).forEach((step) => {
              if (!filters.includes(step.filter)) {
                throw new Error(
                  "❌ Filter attribute isn't file name of filter"
                );
              } else {
                if (step.params && !Array.isArray(step.params)) {
                  throw new Error("❌ Filter params is not an Array");
                } else {
                  if (
                    step.next &&
                    !Object.keys(configContent.steps).includes(step.next)
                  ) {
                    throw new Error(
                      "❌ Next attribute isn't key of an exiting step"
                    );
                  }
                }
              }
            });
          }
        }
      }
    });
  }
};

const doNextFunction = (step, input) => {
  const filter = require(`${filterFolder}${step[1].filter}.js`);
  if (!step[1].next) {
    return filter(input, step[1].params);
  }
  filter(input, step[1].params);

  const steps = getSteps();

  input[0] = filter(input, step[1].params);

  doNextFunction(
    steps.find((_step) => _step[0] == step[1].next),
    input
  );
};

const getSteps = () => {
  const configFile = fs.readFileSync(configFilePath);
  const configParse = JSON.parse(configFile.toString("utf8"));
  return Object.keys(configParse.steps).map((key) => [
    key,
    configParse.steps[key],
  ]);
};
