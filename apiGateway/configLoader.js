// configLoader.js
const fs = require('fs');
const yaml = require('js-yaml');
require('dotenv').config();

const replaceEnvVariables = (content) => {
    return content.replace(/\$\{(\w+)\}/g, (_, n) => process.env[n]);
};

export const loadConfig = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const replacedContent = replaceEnvVariables(fileContent);
    return yaml.load(replacedContent);
};

const config = loadConfig('../config/models/gateway.config.yml');
console.log(config);
