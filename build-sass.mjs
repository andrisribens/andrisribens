import * as sass from 'sass';
import fs from 'node:fs';
import path from 'node:path';

const componentsDir = path.join(process.cwd(), 'src/components');
const outputDir = path.join(process.cwd(), 'public/css');

function compileDir(dir) {
    for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            compileDir(filePath);
            continue;
        }
        if (!file.endsWith('.scss')) continue;

        const rel = path.relative(componentsDir, filePath).replace(/\.scss$/, '.css');
        const cssOutputPath = path.join(outputDir, rel);
        const mapOutputPath = cssOutputPath + '.map';
        fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true });

        const result = sass.compile(filePath, {
            style: 'expanded',
            sourceMap: true,
            sourceMapIncludeSources: true
        });

        fs.writeFileSync(cssOutputPath, result.css);
        if (result.sourceMap) fs.writeFileSync(mapOutputPath, JSON.stringify(result.sourceMap));
        console.log('✓', rel);
    }
}

compileDir(componentsDir);
console.log('SCSS compiled successfully.');


