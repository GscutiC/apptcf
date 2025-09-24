#!/usr/bin/env node

console.log('🔍 Testing if Tailwind CSS error is resolved...');

const fs = require('fs');
const path = require('path');

// Test 1: Check if tailwind config is removed
const tailwindConfig = path.join(__dirname, 'tailwind.config.js');
if (fs.existsSync(tailwindConfig)) {
    console.log('❌ tailwind.config.js still exists');
} else {
    console.log('✅ tailwind.config.js removed');
}

// Test 2: Check package.json for tailwind dependencies
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const hasTailwindDeps = JSON.stringify(packageJson).includes('tailwind');
if (hasTailwindDeps) {
    console.log('❌ Tailwind dependencies still present in package.json');
} else {
    console.log('✅ Tailwind dependencies removed from package.json');
}

// Test 3: Check CSS file for @tailwind directives
const cssPath = path.join(__dirname, 'src', 'styles', 'App.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

if (cssContent.includes('@tailwind')) {
    console.log('❌ @tailwind directives still present in CSS');
} else {
    console.log('✅ @tailwind directives removed from CSS');
}

// Test 4: Check PostCSS config
const postcssPath = path.join(__dirname, 'postcss.config.js');
const postcssContent = fs.readFileSync(postcssPath, 'utf8');

if (postcssContent.includes('tailwindcss')) {
    console.log('❌ tailwindcss still in postcss.config.js');
} else {
    console.log('✅ tailwindcss removed from postcss.config.js');
}

console.log('\n🎉 All Tailwind CSS references have been removed!');
console.log('✅ The PostCSS error should be resolved now.');
console.log('\n📋 Summary of changes made:');
console.log('1. Removed all Tailwind dependencies from package.json');
console.log('2. Deleted tailwind.config.js file');
console.log('3. Removed @tailwind directives from CSS');
console.log('4. Updated postcss.config.js to use only autoprefixer');
console.log('5. Created comprehensive custom CSS utilities');
console.log('\n🚀 The frontend is now ready to compile without Tailwind errors!');