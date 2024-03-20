import fs from "fs/promises";
import jstoxml from "jstoxml";

const fileName = process.argv[2];
const format = process.argv[3];

const rawData = (await fs.readFile(fileName, "utf-8"));
const data = rawData.split("\n");
const columns = data[0].split("\t");

const jsonOutput = [];
for (let i = 1; i < data.length; i++){
    const row = data[i].split("\t");
    const parsed = {};

    columns.forEach((c, i) => {
        parsed[c] = row[i];
    });

    jsonOutput.push(parsed);
}

let result = "";
let formatName = "";
switch (format) {
    case "-j":
        result = JSON.stringify(jsonOutput, null, "\t");
        formatName = "json";
        break;
    case "-c":
        result = rawData.replaceAll("\t", ",");
        formatName = "csv";
        break;
    case "-x":
        result = jstoxml.toXML(jsonOutput.reduce((final, row, i) => {
            return {...final, [i]: Object.keys(row).reduce((finalRow, rowName) => {
                return {...finalRow, [rowName.replaceAll(" ", "")]: row[rowName]}
            }, {})};
        }, {}), {indent: "\t", header: '<?xml version="1.0" encoding="UTF-8" ?>'});
        formatName = "xml";
        break;
}

fs.writeFile(fileName + "." + formatName, result, {encoding: "utf-8"});
