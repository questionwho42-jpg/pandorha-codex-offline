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
    # 1. Secret Detection (Regex Básico + Entropia)
    secret_patterns = [
        r'(?i)api[_-]?key', r'(?i)secret', r'(?i)password', r'(?i)token',
        r'[a-zA-Z0-9+/]{40,}' # Potencial Base64 longo/Hashes
    ]
    for pattern in secret_patterns:
        if re.search(pattern, diff_text):
            # Check entropy to reduce false positives
            if calculate_entropy(diff_text) > 4.5:
                print("ERRO: Possível credencial ou segredo detectado no diff.", file=sys.stderr)
                sys.exit(1)

    # 2. Atomic Check (Detector de Tipos Mistos)
    # Heurística simples baseada em keywords no diff
    has_fix = "fix" in diff_text.lower() or "bug" in diff_text.lower()
    has_feat = "feat" in diff_text.lower() or "add" in diff_text.lower()
    
    # Se o agente identificar intuitivamente múltiplos propósitos, ele deve falhar.
    # (A lógica atômica final é refinada pelo LLM via Prompt)
    
    return True

if __name__ == "__main__":
    diff = sys.stdin.read()
    if validate_diff(diff):
        sys.exit(0)
    else:
        sys.exit(1)