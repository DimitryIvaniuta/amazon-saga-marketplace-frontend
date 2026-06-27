import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const assetsDirectory = path.resolve('dist/assets');
const limits = {
  largestJavaScriptBytes: 300 * 1024,
  totalJavaScriptBytes: 700 * 1024,
  totalCssBytes: 120 * 1024,
};

const files = await readdir(assetsDirectory);
const measured = await Promise.all(files.map(async (name) => ({
  name,
  bytes: (await stat(path.join(assetsDirectory, name))).size,
})));
const javascript = measured.filter(({ name }) => name.endsWith('.js'));
const styles = measured.filter(({ name }) => name.endsWith('.css'));
const largestJavaScript = javascript.toSorted((left, right) => right.bytes - left.bytes)[0];
const totalJavaScriptBytes = javascript.reduce((total, asset) => total + asset.bytes, 0);
const totalCssBytes = styles.reduce((total, asset) => total + asset.bytes, 0);

const failures = [];
if ((largestJavaScript?.bytes ?? 0) > limits.largestJavaScriptBytes) {
  failures.push(`Largest JavaScript asset ${largestJavaScript?.name} is ${format(largestJavaScript?.bytes ?? 0)}; budget is ${format(limits.largestJavaScriptBytes)}.`);
}
if (totalJavaScriptBytes > limits.totalJavaScriptBytes) {
  failures.push(`Total JavaScript is ${format(totalJavaScriptBytes)}; budget is ${format(limits.totalJavaScriptBytes)}.`);
}
if (totalCssBytes > limits.totalCssBytes) {
  failures.push(`Total CSS is ${format(totalCssBytes)}; budget is ${format(limits.totalCssBytes)}.`);
}

console.log(`Bundle: largest JS ${format(largestJavaScript?.bytes ?? 0)}, total JS ${format(totalJavaScriptBytes)}, total CSS ${format(totalCssBytes)}.`);
if (failures.length > 0) throw new Error(failures.join('\n'));

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
