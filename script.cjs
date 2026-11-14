
const fs = require("fs");
const path = require("path");

const raiz = process.cwd();
const saida = path.join(raiz, "projeto-completo.txt");

const pastasIgnoradas = new Set([
  "node_modules", ".git", ".vscode", ".idea",
  "dist", "build", "coverage", ".next",
  ".expo", ".cache", ".turbo", "vendor",
  "tmp", "temp", "__pycache__"
]);

const arquivosIgnorados = new Set([
  "package-lock.json", "yarn.lock",
  "pnpm-lock.yaml", "bun.lock",
  "bun.lockb", "projeto-completo.txt",
  ".DS_Store", "exportar-projeto.cjs"
]);

const extensoesPermitidas = new Set([
  ".js", ".jsx", ".ts", ".tsx",
  ".html", ".css", ".scss",
  ".json", ".md", ".sql",
  ".yml", ".yaml", ".xml",
  ".py", ".java", ".php",
  ".env.example"
]);

let total = 0;
const partes = [];

function percorrer(diretorio) {
  const itens = fs.readdirSync(diretorio, {
    withFileTypes: true
  });

  for (const item of itens) {
    const caminho = path.join(diretorio, item.name);

    if (item.isSymbolicLink()) continue;

    if (item.isDirectory()) {
      if (!pastasIgnoradas.has(item.name)) {
        percorrer(caminho);
      }
      continue;
    }

    if (!item.isFile()) continue;
    if (arquivosIgnorados.has(item.name)) continue;
    if (item.name.startsWith(".env") &&
        item.name !== ".env.example") continue;

    const extensao = path.extname(item.name);

    if (!extensoesPermitidas.has(extensao) &&
        item.name !== ".env.example") continue;

    try {
      const conteudo = fs.readFileSync(caminho, "utf8");
      const relativo = path.relative(raiz, caminho);

      partes.push(
        "\n" + "=".repeat(80) +
        "\nARQUIVO: " + relativo +
        "\n" + "=".repeat(80) +
        "\n\n" + conteudo + "\n"
      );

      total++;
      console.log("Lido:", relativo);
    } catch (erro) {
      console.error("Erro:", caminho, erro.message);
    }
  }
}

percorrer(raiz);

fs.writeFileSync(saida, partes.join("\n"), "utf8");

console.log("\nExportação concluída!");
console.log("Arquivos lidos:", total);
console.log("Saída:", saida);
