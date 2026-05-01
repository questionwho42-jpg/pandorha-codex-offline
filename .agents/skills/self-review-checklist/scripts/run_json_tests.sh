#!/bin/bash
# Wrapper para extrair saídas estruturadas sem poluir a janela de contexto.
# O framework abaixo (ex: Jest/Vitest/PyTest) deve ser ajustado à sua stack.

echo "A correr validações de teste..."

# Exemplo hipotético para Vitest (Node.js) gerando JSON
npm run test -- --reporter=json --outputFile=test-results.json > /dev/null 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "Falha técnica detectada. Verifique test-results.json para detalhes precisos."
  exit $EXIT_CODE
else
  echo "Testes aprovados. test-results.json limpo."
  exit 0
fi