import sys
import re
import math

def calculate_entropy(s):
    if not s: return 0
    entropy = 0
    for x in range(256):
        p_x = float(s.count(chr(x))) / len(s)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return entropy

def validate_diff(diff_text):
    # Filtrar apenas linhas adicionadas para ignorar metadados do diff e imports antigos
    added_lines = []
    for line in diff_text.split('\n'):
        if line.startswith('+') and not line.startswith('+++'):
            added_lines.append(line[1:])
    
    added_content = '\n'.join(added_lines)
    if not added_content:
        return True

    # 1. Secret Detection (Regex Básico + Entropia da String Casada)
    secret_patterns = [
        r'(?i)api[_-]?key', r'(?i)secret', r'(?i)password', r'(?i)token',
        r'[a-zA-Z0-9+/]{40,}' # Potencial Base64 longo/Hashes
    ]
    for pattern in secret_patterns:
        for match in re.finditer(pattern, added_content):
            matched_str = match.group(0)
            if calculate_entropy(matched_str) > 4.5:
                # Ignorar se contiver barras ou for parte de caminhos/imports
                if '/' in matched_str or '\\' in matched_str or matched_str.startswith('$lib'):
                    continue
                print(f"ERRO: Possível credencial ou segredo detectado no diff: '{matched_str}'", file=sys.stderr)
                sys.exit(1)

    return True

if __name__ == "__main__":
    diff = sys.stdin.read()
    if validate_diff(diff):
        sys.exit(0)
    else:
        sys.exit(1)