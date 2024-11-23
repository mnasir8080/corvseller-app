const fs = require('fs');
const path = require('path');

const iconsCssPath = path.join(__dirname, '../src/assets/styles/material-icons.css');
const iconsDestDir = path.join(__dirname, '../src/assets/fonts');
const iconsSourceDir = path.join(__dirname, '../src/fonts');

// Ensure directories exist
if (!fs.existsSync(path.dirname(iconsCssPath))) {
  fs.mkdirSync(path.dirname(iconsCssPath), { recursive: true });
}
if (!fs.existsSync(iconsDestDir)) {
  fs.mkdirSync(iconsDestDir, { recursive: true });
}

// Copy font files
const fontFiles = ['MaterialIcons-Regular.woff', 'MaterialIcons-Regular.woff2'];
fontFiles.forEach(file => {
  const sourcePath = path.join(iconsSourceDir, file);
  const destPath = path.join(iconsDestDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to assets/fonts directory`);
  } else {
    console.warn(`Warning: ${file} not found in ${sourcePath}`);
  }
});

// Create material-icons.css content
const cssContent = `/* Material Icons CSS */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url('../fonts/MaterialIcons-Regular.woff2') format('woff2'),
       url('../fonts/MaterialIcons-Regular.woff') format('woff');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings: 'liga';
}`;

fs.writeFileSync(iconsCssPath, cssContent);
console.log('Material Icons CSS file created successfully');

// Verify files
console.log('\nVerifying files:');
console.log(`CSS file exists: ${fs.existsSync(iconsCssPath)}`);
fontFiles.forEach(file => {
  const fontPath = path.join(iconsDestDir, file);
  console.log(`${file} exists: ${fs.existsSync(fontPath)}`);
});