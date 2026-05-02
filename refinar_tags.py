import os
import re

def refine_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remover tags redundantes (Tags que fecham e abrem logo em seguida)
    # Ex: </ai_ignore>\n\n<ai_ignore> -> \n\n
    content = re.sub(r'</ai_ignore>\s*<ai_ignore>', '\n', content)
    content = re.sub(r'</ai_context>\s*<ai_context>', '\n', content)

    # 2. Limpar tags que ficaram sozinhas em linhas vazias
    content = re.sub(r'<(ai_context|ai_ignore)>\s*</\1>', '', content)

    # 3. Garantir que cabeçalhos e divisores fiquem FORA das tags
    # Se uma tag abrir antes de um # e fechar depois, vamos quebrar
    lines = content.split('\n')
    refined_lines = []
    current_tag = None

    for line in lines:
        stripped = line.strip()
        is_header = stripped.startswith('#')
        is_divider = stripped.startswith('---') or (len(stripped) > 5 and all(c in '- ' for c in stripped))

        if is_header or is_divider:
            if current_tag:
                refined_lines.append(f"</{current_tag}>")
            refined_lines.append(line)
            if current_tag:
                refined_lines.append(f"<{current_tag}>")
        else:
            # Capturar mudança de tag no meio da linha (caso o script anterior tenha feito isso)
            if '<ai_context>' in line: current_tag = 'ai_context'
            if '<ai_ignore>' in line: current_tag = 'ai_ignore'
            if '</ai_context>' in line or '</ai_ignore>' in line: current_tag = None
            refined_lines.append(line)

    final_content = "\n".join(refined_lines)

    # Limpeza final de quebras de linha duplas causadas pela lógica acima
    final_content = re.sub(r'\n\s*\n\s*\n', '\n\n', final_content)
    # Remover tags vazias geradas pela quebra de cabeçalho
    final_content = re.sub(r'<(ai_context|ai_ignore)>\s*</\1>', '', final_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)

# Processar todos os arquivos novamente
base_path = 'docs/system'
print("Iniciando refinamento estético das tags...")
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.md'):
            refine_file(os.path.join(root, file))

print("✨ Refinamento concluído! Documentação agora está limpa e organizada.")
