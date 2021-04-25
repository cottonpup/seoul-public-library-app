const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {once} = require('events');
const express = require('express');
const app = express()
const port = 3000

async function main() {
    // Load environment variables
    for (const fileName of ['.env', '.env.local']) {
        try {
            const readStream = fs.createReadStream(fileName);
            await once(readStream, 'open');
            const envFile = readline.createInterface({
                input: readStream,
                terminal: false
            });
            envFile.on('line', (line) => {
                const match = /^([^=#]+)=([^#]+)(?:#.*)?/.exec(line);
                if (match !== null) {
                    const [, name, value] = match;
                    process.env[name] = JSON.parse(value);
                }
            })
            await once(envFile, 'close');
        } catch {}
    }

    // Serve HTML, JS and CSS
    app.use('/', express.static('public'));

    // Load and serve serverless functions
    const functions = fs.readdirSync('./api');
    functions.forEach(fileName => {
        const name = path.parse(fileName).name;
        const controller = require(`./api/${fileName}`);
        app.get(`/api/${name}`, controller);
    })

    // Start server
    app.listen(port, () => {
      console.log(`\nDevelopment server running at http://localhost:${port}`);
    })
}

main().then().catch(console.log);
