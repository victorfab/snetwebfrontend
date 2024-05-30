const fs = require('fs');
fs.readFile('./dist/index.html', 'utf8', (err, data) =>{
    console.log(data);

});