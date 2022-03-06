const readline = require('readline');

async function question(q) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        error: process.stderr
    });

    let response;

    rl.setPrompt(q);
    rl.prompt();

    return new Promise((resolve) => {
        rl.on('line', (userResponse) => {
            response = userResponse;
            rl.close();
        });

        rl.on('close', () => {
            resolve(response);
        });
    });
}

module.exports = question;
