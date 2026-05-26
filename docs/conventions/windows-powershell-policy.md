# 📜 Windows PowerShell Policy (Windows 11 Local Development)

Este guia estabelece as convenções de comandos e scripts para o ambiente local no Windows 11, visando eliminar o uso de sintaxes Unix/Linux incompatíveis.

---

## 1. Diretivas de Terminal (PowerShell vs POSIX)

A execução direta de comandos Linux (ou arquivos `.sh`) falhará no ambiente local do desenvolvedor. Aplique sempre os comandos equivalentes do PowerShell listados abaixo:

| Ação | Comando Unix (PROIBIDO) | Comando Windows PowerShell (PERMITIDO) |
| :--- | :--- | :--- |
| **Ler Arquivo** | `cat file.txt` | `Get-Content file.txt` |
| **Criar Arquivo** | `touch file.txt` | `New-Item -ItemType File file.txt` |
| **Criar Diretório** | `mkdir -p path/to/dir` | `New-Item -ItemType Directory -Force path/to/dir` |
| **Remover Recursivo** | `rm -rf path/` | `Remove-Item -Recurse -Force path/` |
| **Mover / Renomear** | `mv source dest` | `Move-Item source dest` |
| **Copiar** | `cp -r source dest` | `Copy-Item -Recurse source dest` |
| **Listar Arquivos** | `ls -la` | `Get-ChildItem -Force` |
| **Encadear Comandos** | `cmd1 && cmd2` | `cmd1; if ($?) { cmd2 }` (ou apenas `;`) |

> [!WARNING]
> NUNCA proponha comandos contendo redirecionamentos Unix complexos, tais como `2>&1` ou pipes POSIX não suportados pelo PowerShell nativo.

---

## 2. Scripts Executáveis e Automações

*   **Proibição de Bash:** Qualquer script de automação, validação ou hooks de compilação deve ser escrito em **JavaScript/TypeScript (`.mjs` / `.ts`)** executado com Node.js ou em **Python (`.py`)** portável.
*   **Hooks de Git:** O acionamento de hooks locais do git deve usar a infraestrutura do projeto baseada em arquivos Node.js (`scripts/process_hook_runner.mjs`) em vez de scripts bash no diretório `.git/hooks/`.

---

## 3. Caminhos de Arquivo (Windows Paths)

*   Em strings de código e importações do TypeScript, utilize a barra comum (`/`).
*   Em comandos do terminal PowerShell no Windows, utilize a barra invertida (`\`) se o comando exigir separadores de caminho nativos, ou passe caminhos relativos delimitados por aspas simples/duplas para evitar problemas com espaços no nome das pastas (ex: `"C:\Users\Pichau\Desktop\antigravity\pandorha sistema 28-04"`).
