"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const parseLine_1 = __importDefault(require("./parseLine"));
/**
 * Converts an ixh file to html and returns the html as a string or writes it to a file
 *
 * @param input The path to the ixh file
 * @param fileOutput If null, then the html is returned as a string, otherwise it is written to the file
 * @returns The html as a string if fileOutput is not provided or null, otherwise void
 */
const ixhToHtml = (input, fileOutput = null) => {
    const data = fs.readFileSync(input, 'utf8');
    const lines = data.split('\n');
    let openedTags = [];
    let indentation = null;
    let multiline = '';
    let output = lines.map((line) => {
        // Set indentation if not already set
        if (!indentation) {
            let matchWithWhitespace = line.match(/^\s+/);
            indentation = matchWithWhitespace
                ? matchWithWhitespace[0].length
                : null;
        }
        // Start of a multiline string
        if (line.trim().startsWith('>{') && !line.trim().endsWith('}')) {
            multiline += `${line.trimEnd()} `;
            return null;
        }
        if (multiline !== '') {
            // End of multiline string
            if (line.trim().endsWith('}')) {
                multiline += line.trim().substring(0, line.length - 1);
                line = multiline;
                multiline = '';
            }
            // Continuation of multiline string
            else {
                multiline += `${line.trim()} `;
                return null;
            }
        }
        const { parsedLine, updatedTags } = (0, parseLine_1.default)(line, openedTags, indentation);
        openedTags = updatedTags;
        return parsedLine;
    });
    // Close any remaining tags
    while (openedTags.length > 0) {
        let closedTag = openedTags[openedTags.length - 1];
        openedTags = openedTags.slice(0, -1);
        output = [...output, `</${closedTag}>`];
    }
    let outputString = output.filter((line) => line !== null).join('\n');
    if (fileOutput === null)
        return outputString;
    fs.writeFileSync(fileOutput, outputString);
};
exports.default = ixhToHtml;
