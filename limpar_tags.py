import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remover todas as tags de IA
    cleaned_content = re.sub(r'</?(ai_context|ai_ignore)>', '', content)

    # Limpar excesso de linhas vazias que podem ter sobrado
    cleaned_content = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

# Percorrer os diretórios
base_path = 'docs/system'
print("Iniciando limpeza total de tags...")
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.md'):
            clean_file(os.path.join(root, file))

print("✅ Documentação restaurada ao estado original!")
