import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const manifest = JSON.parse(fs.readFileSync('dist/.vite/manifest.json', 'utf8'));
const files = new Set();
function visit(key) {
  const entry = manifest[key];
  if (!entry || files.has(entry.file)) return;
  files.add(entry.file);
  entry.css?.forEach(file => files.add(file));
  entry.imports?.forEach(visit);
}
Object.entries(manifest).filter(([, value]) => value.isEntry).forEach(([key]) => visit(key));
const documents = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'));
let bytes = 0, gzipBytes = 0;
for (const file of files) {
  const buffer = fs.readFileSync(path.join('dist', file));
  bytes += buffer.length; gzipBytes += zlib.gzipSync(buffer).length;
  if (file.endsWith('.js')) {
    const code = buffer.toString();
    for (const doc of documents) {
      const rawPrefix = JSON.stringify(doc.rawContent.slice(0, 140)).slice(1, -1);
      if (code.includes(rawPrefix)) throw new Error(`Corpo de ${doc.path} no carregamento inicial: ${file}`);
    }
  }
}
const budget = 250_000;
if (gzipBytes > budget) throw new Error(`Carregamento inicial gzip ${gzipBytes} supera orçamento ${budget}.`);
const result = { initialFiles: [...files], bytes, gzipBytes, gzipBudget: budget,
  scope: 'JS e CSS estaticamente importados pelo ponto de entrada. Não inclui documento solicitado, fontes externas ou recursos abertos posteriormente.' };
fs.mkdirSync('.audit', { recursive: true });
fs.writeFileSync('.audit/bundle.json', JSON.stringify(result, null, 2));
console.log(`[bundle] Inicial ${bytes} bytes; gzip ${gzipBytes}; orçamento gzip ${budget}.`);
// Also check the first reading experience: Markdown is requested immediately after the shell.
const readers = Object.entries(manifest).filter(([, entry]) => entry.name === 'MarkdownRenderer');
if (readers.length !== 1) throw new Error('Ponto de entrada do leitor não identificado.');
readers.forEach(([key]) => visit(key));
const readerFiles = [...files];
result.firstReaderBytes = readerFiles.reduce((sum, file) => sum + fs.statSync(path.join('dist', file)).size, 0);
result.firstReaderGzipBytes = readerFiles.reduce((sum, file) => sum + zlib.gzipSync(fs.readFileSync(path.join('dist', file))).length, 0);
result.firstReaderGzipBudget = 300_000;
if (result.firstReaderGzipBytes > result.firstReaderGzipBudget) throw new Error('Leitor inicial supera orçamento de 300 KB gzip.');
for (const doc of documents) {
  const payload = JSON.parse(fs.readFileSync(path.join('dist', doc.contentUrl), 'utf8'));
  if (payload.rawContent !== doc.rawContent) throw new Error(`Documento publicado difere da origem: ${doc.path}`);
}
const search = JSON.parse(fs.readFileSync('src/data/search.json', 'utf8'));
const searchBytes = fs.readFileSync(path.join('dist', search.url));
result.searchIndex = { bytes: searchBytes.length, gzipBytes: zlib.gzipSync(searchBytes).length, onDemand: true };
fs.writeFileSync('.audit/bundle.json', JSON.stringify(result, null, 2));
console.log(`[bundle] Entrada + leitor: ${result.firstReaderBytes} bytes; gzip ${result.firstReaderGzipBytes}. Todos os documentos publicados conferem com a origem.`);
// The local assistant shares the existing search index; no model weights are shipped.
const beforeAssistant = new Set(files);
const assistants = Object.entries(manifest).filter(([, entry]) => entry.name === 'AssistantSidebar');
if (assistants.length !== 1) throw new Error('Módulo do assistente não identificado.');
assistants.forEach(([key]) => visit(key));
const assistantFiles = [...files].filter(file => !beforeAssistant.has(file));
const assistantJavaScriptGzip = assistantFiles.reduce((sum, file) => sum + zlib.gzipSync(fs.readFileSync(path.join('dist', file))).length, 0);
result.assistant = { additionalFiles: assistantFiles, additionalCodeGzipBytes: assistantJavaScriptGzip,
  sharedSearchGzipBytes: result.searchIndex.gzipBytes, totalOnDemandGzipBytes: assistantJavaScriptGzip + result.searchIndex.gzipBytes,
  budgetGzipBytes: 500_000, modelWeights: false, inferenceAPI: false };
if (result.assistant.totalOnDemandGzipBytes > result.assistant.budgetGzipBytes) throw new Error('Consulta local supera orçamento de500KB gzip.');
fs.writeFileSync('.audit/bundle.json', JSON.stringify(result, null, 2));
console.log(`[assistant] Código adicional + índice compartilhado: ${result.assistant.totalOnDemandGzipBytes} bytes gzip, sob demanda.`);
