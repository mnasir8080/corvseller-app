// scripts/cleanup.js
const fs = require('fs');
const path = require('path');

const directoriesToClean = [
    '../node_modules/.vite',
    '../.vite',
    '../out',
    '../dist'
];

function cleanDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`Cleaned: ${dirPath}`);
        } catch (error) {
            console.error(`Error cleaning ${dirPath}:`, error.message);
            // If standard delete fails, try running system commands
            try {
                if (process.platform === 'win32') {
                    require('child_process').execSync(`rd /s /q "${dirPath}"`);
                    console.log(`Cleaned using system command: ${dirPath}`);
                }
            } catch (cmdError) {
                console.error(`Failed to clean using system command: ${dirPath}`);
            }
        }
    } else {
        console.log(`Directory not found: ${dirPath}`);
    }
}

// Clean directories
directoriesToClean.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    cleanDirectory(dirPath);
});

// Clean build files
const buildFiles = [
    '../.vite/build',
    '../.vite/renderer'
].map(file => path.join(__dirname, file));

buildFiles.forEach(file => {
    cleanDirectory(file);
});

// Clean package-lock.json if needed
const packageLockPath = path.join(__dirname, '../package-lock.json');
if (fs.existsSync(packageLockPath)) {
    try {
        fs.unlinkSync(packageLockPath);
        console.log('Removed package-lock.json');
    } catch (error) {
        console.error('Error removing package-lock.json:', error.message);
    }
}

console.log('Cleanup completed!');

// scripts/cleanup.js
// const fs = require('fs');
// const path = require('path');

// const directoriesToClean = [
//     '../node_modules/.vite',
//     '../.vite',
//     '../out',
//     '../dist'
// ];

// directoriesToClean.forEach(dir => {
//     const dirPath = path.join(__dirname, dir);
//     if (fs.existsSync(dirPath)) {
//         try {
//             fs.rmSync(dirPath, { recursive: true, force: true });
//             console.log(`Cleaned: ${dir}`);
//         } catch (error) {
//             console.error(`Error cleaning ${dir}:`, error);
//         }
//     } else {
//         console.log(`Directory not found: ${dir}`);
//     }
// });

// // Clean any leftover build files
// const buildFiles = [
//     '../.vite/build',
//     '../.vite/renderer'
// ].map(file => path.join(__dirname, file));

// buildFiles.forEach(file => {
//     if (fs.existsSync(file)) {
//         try {
//             fs.rmSync(file, { recursive: true, force: true });
//             console.log(`Removed build file: ${file}`);
//         } catch (error) {
//             console.error(`Error removing ${file}:`, error);
//         }
//     }
// });

// console.log('Cleanup completed!');