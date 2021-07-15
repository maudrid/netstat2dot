/*sudo netstat -tn*/

const fs = require('fs');

function printHelp(){
  console.log('Usage:');
  console.log('node netstat2dot.js FILE [-fl=FILTER] [-ff=FILTER]');
  console.log('');
  console.log('Converts "netstat -tn" output to dot format for usage in Graphviz.');
  console.log('');
  console.log('Options:');
  console.log('  -fl: Filter Local Address. Provide a partial to filter local addresses.');
  console.log('    Example: "-fl=192.168" will only add local addresses that start with "192.168"');
  console.log('    to be added to the diagram.');
  console.log('  -ff: Filter Foreign Address. Provide a partial to filter foreign addresses.');
  console.log('    Same as -fl but for foreign addresses.');
  console.log('');
  console.log('Example:');
  console.log(' netstat -tn > netstat.out');
  console.log(' node netstat2dot.js netstat.out -fl=192.169.0 -ff=172.16 > diagram.dot');
  console.log(' dot -Tsvg diagram.dot > diagram.svg');

};

function addItem(outputObject, id, source, destination, port) {
  if (outputObject[id]) {
    if (outputObject[id].ports.indexOf(port) == -1) {
      outputObject[id].ports.push(port);
    }
  } else {
    outputObject[id] = {source:source, destination:destination,ports:[port]};
  }
}

function setSettings(args, index, settings) {
  let {unique, filterOrigin, filterDest} = settings;
  if (typeof process.argv[index] != 'undefined') {
    unique = (process.argv[index] == '-u=t') ? true : unique;
    filterOrigin = (process.argv[index].startsWith('-fl=')) ? process.argv[index].substr(4) : filterOrigin;
    filterDest = (process.argv[index].startsWith('-ff=')) ? process.argv[index].substr(4) : filterDest;
  }
  return {unique, filterOrigin, filterDest};
}

function findColValue(inputString, colIndex) {
  let currentCol = -1;
  let data = false;
  let result ='';
  inputString.split('').forEach((item, i) => {
    if ((item != ' ') && (!data)) {
      data = true;
      currentCol++;
      if (currentCol == colIndex) {
         result = inputString.substr(i).split(' ')[0];
         return;
      }
    }
    if ((item == ' ') && (data)) {
      data = false;
    }
  });

  return result;
}


if ((process.argv.length < 3) || (process.argv[2]=='-h')) {
  printHelp();
  process.exit(0);
}

let inFile = process.argv[2];
let unique = false;
let filterOrigin = '';
let filterDest = '';
({unique, filterOrigin, filterDest} = setSettings(process.argv, 3, {unique, filterOrigin, filterDest}));
({unique, filterOrigin, filterDest} = setSettings(process.argv, 4, {unique, filterOrigin, filterDest}));
({unique, filterOrigin, filterDest} = setSettings(process.argv, 5, {unique, filterOrigin, filterDest}));


if (!fs.existsSync(inFile)) {
  console.log('File not found.');
  process.exit(1);
}
//{ "SourceDestination" : {source:"1.2.3",destination:"3.2.1",ports:["123","321"]}];
let outputObject = {};
let inData = fs.readFileSync(inFile, 'utf8');
inData = inData.split('\n');

console.log('digraph Diagram {');
inData.forEach((line, i) => {
  if (line.substring(0,3) == 'tcp') {

    let origin = findColValue(line,3);
    let destination = findColValue(line,4);
    let oLabel = origin.split(':')[1];
    let dLabel = destination.split(':')[1];
    origin = '"' + origin.split(':')[0] + '"';
    destination = '"' + destination.split(':')[0] + '"';
    let direction = '>';
    if (oLabel.length >= 5) {
      direction = '<';
    }

    if (
        ((origin.substring(1,filterOrigin.length+1)==filterOrigin) || (filterOrigin=="")) &&
        ((destination.substring(1,filterDest.length+1)==filterDest) || (filterDest==""))
       ){
        if (direction == '>') {
          let id = destination+origin;
          addItem(outputObject, id, destination, origin, oLabel)
        } else {
          let id = origin+destination;
          addItem(outputObject, id, origin, destination, dLabel);
        }
    }
  }
});

let keys = Object.keys(outputObject);
keys.forEach((item, i) => {
  let line = outputObject[item];
  let label = ' [label="' + line.ports.join(', ') + '"]';
  console.log(line.source + ' -> ' + line.destination + label);
});

console.log('}');
