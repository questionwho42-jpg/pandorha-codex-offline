/// script
requires = ["pyyaml"]
///
import sys
import json
import yaml
import ast
from pathlib import Path

def fail_fast(msg):
    """Fallback determinístico e rápido."""
    sys.stderr.write(f"FATAL ERROR: {msg}\n")
    sys.exit(1)

def detect_framework(src_path: Path):
    """Auto-detecção para carregar o parser correto (Evita dependência de LLM)."""
    root = src_path.parent
    if (root / "requirements.txt").exists():
        reqs = (root / "requirements.txt").read_text()
        if "fastapi" in reqs.lower(): return "fastapi"
    elif (root / "package.json").exists():
        pkg = (root / "package.json").read_text()
        if "express" in pkg.lower(): return "express"
    return "generic"

def parse_openapi(contract_path: str):
    """Lê o OpenAPI e aplica fail-fast se encontrar fragmentação ($ref não resolvida)."""
    try:
        with open(contract_path, 'r', encoding='utf-8') as f:
            spec = yaml.safe_load(f)
    except Exception as e:
        fail_fast(f"Falha ao ler o contrato OpenAPI: {e}")
    
    # Guardrail contra fragmentação
    spec_str = json.dumps(spec)
    if '"$ref"' in spec_str and not contract_path.endswith('bundled.yaml'):
        fail_fast("O contrato OpenAPI possui referências ($ref). Exija um arquivo consolidado (bundled).")
    
    return spec

def full_scan_ast(src_path: str, framework: str):
    """
    Simulação de Full Scan via AST.
    Em um cenário real, módulos como 'tree-sitter' ou 'ast' adaptado
    extrairiam tipos reais, rotas e parâmetros, ignorando Middlewares (Auth).
    """
    # MOCK: Representação de uma AST mastigada pelo adaptador
    return {
        "/users": {"method": "GET", "params": {"user_id": {"type": "integer"}}},
        "/shadow-route": {"method": "POST", "params": {}}, # Rota não documentada
    }

def cross_reference(spec, ast_data):
    """Cruza o contrato com a AST e gera o JSON Minimalista."""
    report = {"failures": [], "warnings": [], "needs_eval": []}
    
    spec_paths = spec.get('paths', {})
    
    # 1. Shadow Routes (No código, mas não no contrato) -> BLOQUEIO ESTRITO
    for ast_route in ast_data.keys():
        if ast_route not in spec_paths:
            report["failures"].append({"route": ast_route, "issue": "missing_in_spec_shadow_route"})
            
    # 2. Avaliação de Tipagem (Hard Fail) e Descrições (Delegação ao Codex)
    for route, details in spec_paths.items():
        if route not in ast_data:
            # Rota não implementada -> AVISO (Não bloqueante)
            report["warnings"].append({"route": route, "issue": "pending_implementation"})
            continue
            
        for method, ops in details.items():
            params = ops.get('parameters', [])
            for p in params:
                p_name = p.get('name')
                p_type = p.get('schema', {}).get('type')
                
                # Checagem Estrita de Tipagem
                ast_type = ast_data[route].get("params", {}).get(p_name, {}).get("type")
                if ast_type and ast_type != p_type:
                    report["failures"].append({"route": route, "param": p_name, "issue": f"type_mismatch (Expected {p_type}, Got {ast_type})"})
                else:
                    # Envia para a IA avaliar com as Regras de Ouro
                    report["needs_eval"].append({
                        "route": route, 
                        "param": p_name, 
                        "desc_to_evaluate": p.get('description', 'NO_DESCRIPTION')
                    })
                    
    return report

if __name__ == "__main__":
    if len(sys.argv) < 3:
        fail_fast("Uso: python extract_ast.py <caminho_openapi> <caminho_src>")
        
    contract_file = sys.argv[1]
    src_dir = sys.argv[2]
    
    framework = detect_framework(Path(src_dir))
    spec = parse_openapi(contract_file)
    ast_data = full_scan_ast(src_dir, framework)
    
    result = cross_reference(spec, ast_data)
    
    # Imprime JSON Minimalista para ser lido pelo Codex
    print(json.dumps(result, indent=2))