const sass = require('sass');
const fs = require('fs');
const path = require('path');

// Define the input and output paths
const componentsDir = path.join(__dirname, 'src/components');
const outputDir = path.join(__dirname, 'public/css'); // or another folder of your choice

// Recursively compile all SCSS files
function compileSassFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            compileSassFiles(filePath);
        } else if (file.endsWith('.scss')) {
            const result = sass.renderSync({
                file: filePath,
                outFile: path.join(outputDir, file.replace('.scss', '.css')),
                sourceMap: true,
            });

            // Write the CSS file
            const cssOutputPath = path.join(
                outputDir,
                path.relative(componentsDir, filePath).replace('.scss', '.css')
            );
            fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true });
            fs.writeFileSync(cssOutputPath, result.css);

            // Write the source map
            const mapOutputPath = cssOutputPath + '.map';
            fs.writeFileSync(mapOutputPath, result.map);
        }
    });
}

// Run the Sass compilation
compileSassFiles(componentsDir);
console.log(`SCSS compiled successfully.`);
