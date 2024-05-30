const replace = require("replace-in-file");

// Replace base URL
const baseOptions = {
  files: "dist/index.html",
  // Replacement to make (string or regex)
  from: /href="\/"/g,
  to: 'href="./"'
};
replace(baseOptions)
  .then((changedFiles) => {
    console.log(changedFiles);
  })
  .catch((error) => {
    console.log(error);
  });

// Replace assets
const assetsOptions = {
  // Glob(s)
  files: ["dist/**/*.html", "dist/**/*.css"],
  // Replacement to make (string or regex)
  from: /\/assets/g,
  to: "assets"
};
replace(assetsOptions)
.then((changedFiles) => {
  console.log(changedFiles);
})
.catch((error) => {
  console.log(error);
});

// Replace the Tealium script
const tealiumOptions = {
  // Glob(s)
  files: ["dist/**/*.html"],
  // Replacement to make (string or regex)
  from: /mx\-aclaraciones\/dev/g,
  to: "mx-aclaraciones/prod"
};
replace(tealiumOptions)
.then((changedFiles) => {
  console.log(changedFiles);
})
.catch((error) => {
  console.log(error);
});
// Remove last character ">"
const webpackBugOptions = {
  // Glob(s)
  files: ["dist/**/*.html"],
  // Replacement to make (string or regex)
  //from: /<\/html>[\n]>/gim,
  from: /^>$/gim,
  to: ""
};
replace(webpackBugOptions)
  .then((changedFiles) => {
    console.log(changedFiles);
  })
  .catch((error) => {
    console.log(error);
  });

const urlToDelete = [
  "https:\/\/scg-mxgestaclar-service-mxgestaclar-dev.apps.str01.mex.dev.mx1.paas.cloudcenter.corp\/",
  "https:\/\/stars-score-mxgestaclar-dev.appls.cto2.paas.gsnetcloud.corp",
  "https:\/\/gestionaclaraciones.pre.mx.corp\/",
  "https:\/\/stars-score-mxgestaclar-pre.appls.cto2.paas.gsnetcloud.corp",
  "https:\/\/gestionaclaraciones.santander.com.mx\/",
  "https:\/\/stars-score-mxgestaclar-pro.appls.cto2.paas.gsnetcloud.corp"
];

// Replace the Tealium script
const urls = {
  // Glob(s)
  files: ["dist/**/*.js"],
  // Replacement to make (string or regex)
  // every url that ends with corp or do
  from: urlToDelete,
  to: ""
};
replace(urls)
.then((changedFiles) => {
  console.log(changedFiles);
})
.catch((error) => {
  console.log(error);
});
