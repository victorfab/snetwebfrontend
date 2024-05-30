const replace = require('replace-in-file');

// Replace base URL
const baseOptions = {
    files: 'dist/index.html',
    // Replacement to make (string or regex) 
    from: /href="\/"/g,
    to: 'href="./"'
};
replace(baseOptions)
  .then((changedFiles) => {
  })
  .catch((error) => {
  });

// Replace assets
const assetsOptions = {
    // Glob(s) 
    files: [
      'dist/**/*.html',
      'dist/**/*.css'
    ],
    // Replacement to make (string or regex) 
    from: /\/assets/g,
    to: 'assets'
};
replace(assetsOptions)
    .then((changedFiles) => {
    })
    .catch((error) => {
    });

// Replace Google Analytics ID
const gaOptions = {
    // Glob(s)
    files: [
        'dist/**/*.html'
    ],
    // Replacement to make (string or regex)
    from: /UA\-83906400\-3/g,
    to: 'UA-114900360-2'
};
const gaChangedFiles = replace.sync(gaOptions);

// Replace the Tealium script
const tealiumOptions = {
    // Glob(s) 
    files: [
        'dist/**/*.html'
    ],
    // Replacement to make (string or regex) 
    from: /mx\-aclaraciones\/prod/g,
    to: 'mx-aclaraciones/dev'
};
replace(tealiumOptions)
    .then((changedFiles) => {
    })
    .catch((error) => {
    });
