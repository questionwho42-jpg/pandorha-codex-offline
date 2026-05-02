import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Resetar tags para limpeza total
    content = re.sub(r'</?(ai_context|ai_ignore)>', '', content)

    parts = re.split(r'^---$', content, flags=re.MULTILINE)
    frontmatter = ""
    body = content
    if len(parts) >= 3:
        frontmatter = "---" + parts[1] + "---"
        body = "".join(parts[2:])

    lines = body.split('\n')
    new_lines = []
    in_context = False
    in_ignore = False

    # DICIONÁRIO DE PRECISÃO (v4.0 - Cirúrgico)
    # Usando \b para garantir que "civilização" não seja confundido com "Ação"
    keywords = [
        r'\b\d*d\d+\b', r'\[.*?\]\s*=', r'\bDC\b\s*\d+', r'\bCD\b\s*\d+', r'\bCA\b\s*\d+',
        r'\bFísico\b', r'\bMental\b', r'\bSocial\b', r'\bResistência\b', r'\bConflito\b', r'\bInteração\b',
        r'[\s\(][\+\-]\d+\b', r'\bbônus\b', r'\bpenalidade\b', r'\bVantagem\b', r'\bDesvantagem\b',
        r'\bRodada\b', r'\bTurno\b', r'\bCena\b', r'\bReação\b', r'\bAção\b', r'\bLivre\b', r'\bHP\b', r'\bEE\b', r'\bPV\b',
        r'\bTier\b', r'\bNível\b', r'\bXP\b', r'\bBP\b', r'\bSucesso\b', r'\bFalha\b', r'\bCrítico\b', r'\bMargem\b',
        r'\bTalento\b', r'\bAplicação\b', r'\bTreinamento\b', r'\bDestreinado\b', r'\bRD\b', r'\bCura\b', r'\bDano\b'
    ]
    # Regex que exige uma das palavras-chave exatas
    re_mechanics = re.compile(f"({'|'.join(keywords)})", re.IGNORECASE)
    re_table = re.compile(r'^\s*\|.*\|')

    for line in lines:
        stripped = line.strip()
        # Ignorar Cabeçalhos, IDs de sistema (GUIDs) e Divisores
        is_header = stripped.startswith('#')
        is_id = bool(re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', stripped))
        is_divider = stripped.startswith('---') or (len(stripped) > 5 and all(c in '- ' for c in stripped))

        # Só é mecânica se bater com a palavra exata e não for metadado
        is_mechanic = (bool(re_mechanics.search(line)) or bool(re_table.search(line))) and not is_header and not is_divider and not is_id
        is_empty = not stripped

        if is_header or is_divider or is_id:
            if in_context: new_lines.append("</ai_context>")
            if in_ignore: new_lines.append("</ai_ignore>")
            in_context = in_ignore = False
            new_lines.append(line)
        elif is_empty:
            if in_context: new_lines.append("</ai_context>")
            if in_ignore: new_lines.append("</ai_ignore>")
            in_context = in_ignore = False
            new_lines.append(line)
        elif is_mechanic:
            if in_ignore:
                new_lines.append("</ai_ignore>")
                in_ignore = False
            if not in_context:
                new_lines.append("<ai_context>")
                in_context = True
            new_lines.append(line)
        else:
            if in_context:
                new_lines.append("</ai_context>")
                in_context = False
            if not in_ignore:
                new_lines.append("<ai_ignore>")
                in_ignore = True
            new_lines.append(line)

    if in_context: new_lines.append("</ai_context>")
    if in_ignore: new_lines.append("</ai_ignore>")

    final_body = "\n".join(new_lines)
    # Fusão de blocos adjacentes
    final_body = re.sub(r'</ai_ignore>\n\n<ai_ignore>', '\n\n', final_body)
    final_body = re.sub(r'</ai_context>\n\n<ai_context>', '\n\n', final_body)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter + final_body)

# Executar
base_path = 'docs/system'
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.md'):
            process_file(os.path.join(root, file))

print("✅ Revisão Cirúrgica concluída!")
