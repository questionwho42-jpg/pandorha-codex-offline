import json
import random
import os

def load_rules(manifest_path):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def simulate_dying_process(physique, resistance, level, cd_target):
    successes = 0
    failures = 0
    turns = 0
    
    while successes < 3 and failures < 3:
        turns += 1
        roll = random.randint(1, 20)
        
        # Regras de Crítico
        if roll == 20:
            return "stabilized_critical", turns
        if roll == 1:
            failures += 2
            if failures >= 3:
                return "dead", turns
            continue
            
        total = roll + physique + resistance + level
        if total >= cd_target:
            successes += 1
        else:
            failures += 1
            
    if successes >= 3:
        return "stabilized", turns
    else:
        return "dead", turns

def run_simulation(simulations_count=10000):
    manifest_path = os.path.join("docs", "system", "rpg-rules-manifest.json")
    if not os.path.exists(manifest_path):
        print(f"Erro: Manifesto não encontrado em {manifest_path}")
        return

    rules = load_rules(manifest_path)
    dying_rules = rules["rules"]["dying_state"]["stabilization_test"]
    
    print("=" * 70)
    print("PANDORHA ENGINE - BALANCING SIMULATION (MONTE CARLO 10k)")
    print("=" * 70)
    
    test_cases = [
        {"name": "Andarilho Frágil (Level 1)", "physique": -1, "resistance": 0, "level": 1},
        {"name": "Andarilho Comum (Level 1)", "physique": 0, "resistance": 0, "level": 1},
        {"name": "Andarilho Experiente (Level 3)", "physique": 2, "resistance": 1, "level": 3},
        {"name": "Andarilho Tanque (Level 5)", "physique": 4, "resistance": 2, "level": 5},
    ]
    
    for case in test_cases:
        # Fórmulas oficiais do Manifesto JSON:
        # CD = 10 + Nível + Físico + Resistência
        cd_target = 10 + case["level"] + case["physique"] + case["resistance"]
        
        results = {"stabilized": 0, "stabilized_critical": 0, "dead": 0}
        total_turns = 0
        
        for _ in range(simulations_count):
            outcome, turns = simulate_dying_process(
                case["physique"], case["resistance"], case["level"], cd_target
            )
            results[outcome] += 1
            total_turns += turns
            
        total_stabilized = results["stabilized"] + results["stabilized_critical"]
        pct_stabilized = (total_stabilized / simulations_count) * 100
        pct_dead = (results["dead"] / simulations_count) * 100
        pct_crit = (results["stabilized_critical"] / simulations_count) * 100
        avg_turns = total_turns / simulations_count
        
        print(f"\nCaso: {case['name']}")
        print(f" -> Atributos: Físico {case['physique']}, Resistência {case['resistance']}, Nível {case['level']}")
        print(f" -> CD de Resistência de Morte: {cd_target}")
        print(f" -> Resultados: Estabilizou: {pct_stabilized:.2f}% (Crítico: {pct_crit:.2f}%) | Morte Definitiva: {pct_dead:.2f}%")
        print(f" -> Duração Média da Agonia: {avg_turns:.2f} turnos")
        
        # Guardrail de Letalidade
        if case["physique"] == 0 and pct_dead > 45.0:
            print(" [BALANCING_WARNING]: Risco de morte para Andarilhos neutros é muito alto (> 45%)!")
            
    print("\n" + "=" * 70)

if __name__ == "__main__":
    run_simulation()
