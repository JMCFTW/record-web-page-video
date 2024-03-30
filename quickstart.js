'use strict';
const {
    record
} = require("./record-page");

async function quickstart(
    url = 'my-url'
) {
    var promiseStack = [];
    [
      {url: url, filename: 'test1'},
    ].forEach(element => { 
      console.log(element); 
      
      promiseStack.push(record(element.url, element.filename));
    }); 
    Promise.all(promiseStack).then((values) => {
      console.log(values);
    });
}

process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
});

quickstart(...process.argv.slice(2));
