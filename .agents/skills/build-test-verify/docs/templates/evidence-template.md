## 📝 RELATÓRIO DE EVIDÊNCIA (QA PANDORHA)

### 🔗 Mapeamento de Regras

- **Regra:** [ID_GDD_AQUI] - [Título da Seção]
- **ADR Registrada:** [Caminho_do_ADR_ou_N/A]

### 📊 Métricas de Cobertura

````json
// Injetar snippet do coverage-summary.json aqui
{ "lines": { "pct": 100 } }

🧪 Casos de Borda Testados (Boundary Testing)[ ] Transição de valor Mínimo ($min$)[ ] Transição de valor Crítico ($threshold$)[ ] Comportamento de valor Máximo ($max$)
🏗️ Infraestrutura de DadosSQL Gerado (Drizzle):SQL-- Injetar SQL aqui para auditoria humana
⚡ Orçamento de Queries (I/O)Operação: [Nome]Chamadas RPC: [X] de [Limite Y]
---

### 5. Configuração de Linter de Design: `.eslintrc.cjs` (Snippet)
Regra para forçar o uso de tokens e barrar classes genéricas do Tailwind.

```javascript
module.exports = {
  // ... outras configurações
  rules: {
    "tailwindcss/no-custom-classname": "error",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/classnames-order": "warn",
    // Custom rule para Pandorha: Impede cores não registradas no design system
    "no-restricted-syntax": [
      "error",
      {
        "selector": "Literal[value=/text-(red|blue|green|gray|yellow)-/]",
        "message": "❌ PROIBIDO: Use apenas os tokens de Pandorha (ex: text-bone, text-ether) definidos no Styleguide."
      }
    ]
  }
};
````
