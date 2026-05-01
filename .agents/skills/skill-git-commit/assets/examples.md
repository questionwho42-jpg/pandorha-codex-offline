# Exemplos de Formatação Híbrida

### Exemplo 1: Nova Funcionalidade

**Input Diff:** (Alteração em `src/auth/service.py`)
**Mensagem Gerada:**
feat(auth): adiciona integração com provedor de login externo

- Implementa interface de comunicação com OAuth2
- Adiciona mapeamento de campos de perfil do usuário
- Configura variáveis de ambiente para o novo provedor

### Exemplo 2: Correção de Bug

**Input Diff:** (Alteração em `scripts/backup.sh`)
**Mensagem Gerada:**
fix(scripts): corrige erro de permissão no script de backup

- Ajusta permissão de execução após rotação de arquivos
- Adiciona verificação de existência do diretório de destino

### Exemplo 3: Refatoração (Breaking Change)

**Input Intent:** "refatora banco de dados, quebra compatibilidade"
**Mensagem Gerada:**
refactor(db)!: altera esquema da tabela de inventário

- Remove coluna obsoleta 'old_stock_id'
- Normaliza relação entre produtos e fornecedores
- Atualiza queries de agregação para novo formato
