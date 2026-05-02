import os
import re

# Dicionários de decisão semântica
IGNORE_KEYWORDS = ['história', 'introdução', 'lore', 'citação', 'descrição', 'ambientação', 'apoteose', 'narrativo']
CONTEXT_KEYWORDS = ['regra', 'tabela', 'dc', 'teste', 'custo', 'efeito', 'mecânico', 'bônus', 'talento', 'nível', 'fórmula', 'especificações', 'traços', 'matriz']

def diagram_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_content = []
    current_block = []
    current_type = None # 'ai_context' ou 'ai_ignore'

    # Preservar Frontmatter
    in_frontmatter = False
    start_idx = 0
    if lines[0].startswith('---'):
        in_frontmatter = True
        new_content.append(lines[0])
        for i in range(1, len(lines)):
            new_content.append(lines[i])
            if lines[i].startswith('---'):
                in_frontmatter = False
                start_idx = i + 1
                break

    body = "".join(lines[start_idx:])

    # Limpeza de ruídos de exportação
    body = re.sub(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', '', body) # GUIDs
    body = body.replace('\\_', '_').replace('\\[', '[').replace('\\]', ']')

    # Split por Títulos ## (Preservando o título)
    sections = re.split(r'(^##\s+.*$)', body, flags=re.MULTILINE)

    final_body = []

    for section in sections:
        if not section.strip():
            continue

        if section.startswith('##'):
            # Títulos ficam fora das tags
            final_body.append(f"\n{section.strip()}\n")
        else:
            # Decisão semântica baseada em palavras-chave
            lower_section = section.lower()
            is_context = any(kw in lower_section for kw in CONTEXT_KEYWORDS)

            tag = 'ai_context' if is_context else 'ai_ignore'

            # Limpar espaços extras e aplicar tag
            clean_section = section.strip()
            if clean_section:
                final_body.append(f"<{tag}>\n{clean_section}\n</{tag}>\n")

    # Escrita final
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_content)
        f.write("".join(final_body))

# Lista de arquivos já editados (para não sobrescrever o trabalho manual premium)
ALREADY_EDITED = [
    '00-mecanicas-fundamentais.md', '01-01-humanos.md', '01-02-elfos.md', '01-03-anoes.md',
    '01-04-drakari.md', '01-05-umbrais.md', '01-06-feras.md', '05-01-vanguarda.md',
    '05-02-tecelao.md', '05-03-emissario.md', '05-04-cacador.md', '04-arsenal-e-economia.md',
    '09-guia-do-artifice-e-criacao.md', 'regras-ouro-equipamento-inicial.md', 'regras-peso-carga.md'
]

base_path = 'docs/system/survival'
print("Iniciando Diagramação Premium em Massa...")

for file in os.listdir(base_path):
    if file.endswith('.md') and file not in ALREADY_EDITED:
        print(f"Diagramando: {file}")
        diagram_file(os.path.join(base_path, file))

print("✅ Todos os arquivos da pasta Survival foram diagramados!")
