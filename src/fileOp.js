import { writeFile, readFileSync } from 'fs';
import path from 'path';
import color from 'colors-cli'
const __dirname = path.resolve(path.dirname(decodeURI(new URL(import.meta.url).pathname)));

export const readFile = (files) => {
    const fileContent  = readFileSync(__dirname + files, 'utf-8', (err, data) => {
        if (err) throw err;
        return data;
    });
    return JSON.parse(fileContent);
}

export const writeJsonFile = (outfile, data) => {
    writeFile(__dirname + outfile, JSON.stringify(data, null, 2), (error) => {
    if (error) {
        console.log('An error has occurred ', error);
        return;
    }
    console.log(color.magenta('Data written successfully to disk'));
    })
};