# ADR-004: SQLite WASM via OPFS em Web Worker Dedicado

- **ID:** ADR-004
- **Status:** Aceito
- **Data:** 2026-05-14
- **Task Ledger:** T33B (SQLite WASM OPFS Bootstrap)

## Contexto

O Pandorha Engine é um jogo RPG **local-first e offline-first**. Toda a persistência de dados (personagens, estado do mundo, saves, logs de auditoria) deve funcionar completamente no browser do usuário, sem necessidade de servidor, após o primeiro carregamento.

**Requisitos de persistência:**
1. Dados seguros entre sessões (sobrevivem a refresh da página)
2. Queries tipadas com ORM (Drizzle)
3. Transações atômicas para operações de combate e saves
4. I/O não bloqueante para a Main Thread (UI responsiva durante escrita)
5. Migrações automáticas para proteger saves antigos quando o schema muda
6. Funcionamento 100% offline após primeiro carregamento (PWA)

## Decisão

Usar **SQLite compilado para WebAssembly** (via `sql.js`) com **OPFS** (Origin Private File System) como storage backend, executando dentro de um **Web Worker dedicado**.

**Arquitetura resultante:**
```
Main Thread (Svelte 5)
    ↕ postMessage RPC (ADR-001)
Web Worker (pandorhaDatabase.worker.ts)
    ↕ Drizzle ORM
SQLite WASM
    ↕ OPFS VFS (Origin Private File System)
Disco do usuário (privado ao origin)
```

**Componentes:**
- `src/shared/persistence/SqliteOpfsBootstrapService.ts` — inicialização do WASM, montagem OPFS, execução de migrações
- `src/shared/persistence/BrowserOpfsDatabaseStorage.ts` — VFS adapter OPFS
- `src/shared/persistence/databaseWorkerHandler.ts` — handler de mensagens RPC no Worker
- `src/shared/persistence/pandorhaDatabase.worker.ts` — ponto de entrada do Worker
- Schemas Drizzle em `src/entities/*/infrastructure/` — 16 schema files registrados em `drizzle.config.mjs`
- Migrations em `drizzle/` — 18 arquivos (0000 → 0017)

**Bootstrap timeout:** 30 segundos para `INIT_DATABASE` (contra 5s para operações normais).

## Consequências

**Positivas:**
- Zero dependência de servidor — jogador pode usar offline indefinidamente
- Queries 100% tipadas via Drizzle — sem SQL raw com strings
- Transações atômicas nativas do SQLite para integridade dos saves
- OPFS persiste os dados no disco do usuário com segurança de origin
- Migrações automáticas protegem saves antigos

**Negativas:**
- `SqliteOpfsBootstrapService.ts` é o módulo mais complexo do projeto (~105KB compilado)
- OPFS não está disponível em todos os contextos (ex.: Brave com shields, alguns mobile browsers)
- Primeiro carregamento é mais lento (download do WASM ~1MB)
- Debugging requer ferramentas específicas de browser (OPFS não é visível no DevTools padrão)

## Fallback

Em ambientes sem OPFS, o `BrowserOpfsDatabaseStorage` deve detectar a ausência e lançar `fail('OPFS_NOT_AVAILABLE')` — nunca silenciar o erro ou usar localStorage como fallback silencioso (risco de perda de dados).

## Alternativas Consideradas

| Opção | Prós | Contras |
|:---|:---|:---|
| **IndexedDB direto** | Nativo, sem WASM | Sem SQL, sem Drizzle, sem transactions complexas |
| **SQLite WASM + localStorage** | Mais compatível | Limite de 5MB, sem OPFS persistence entre sessões |
| **SQLite WASM + OPFS (escolhido)** | Persistência real, tipado | Complexidade de bootstrap, compatibilidade OPFS |
| **PocketBase / Supabase** | Backend gerenciado | Requer servidor, não é offline-first |
