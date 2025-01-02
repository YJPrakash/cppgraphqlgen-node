const fs = require('fs/promises');
const path = require('path');

(async () => {
    // Define source and destination directories
    const sourceDir = await path.resolve("../greet/build/Release");
    const destinationDir = await path.resolve("./src/pages/api/");

    try {
        // Ensure destination directory exists
        await fs.mkdir(destinationDir, { recursive: true });

        // Read all files from the source directory
        const files = await fs.readdir(sourceDir);

        // Filter and copy files with custom extensions
        const extensionsToCopy = [".node"]; // Add extensions here
        for (const file of files) {
            const file_ = file.replace('greet.node', 'cppgraphql.node');
            const fileExt = path.extname(file_);

            if (extensionsToCopy.includes(fileExt)) {
                const sourceFile = path.join(sourceDir, file);
                const destinationFile = path.join(destinationDir, file_);
                await fs.copyFile(sourceFile, destinationFile);
                console.log(`Copied: ${sourceFile} -> ${destinationFile}`);
            }
        }
    } catch (err) {
        console.error("Error copying files:", err);
    }
})()