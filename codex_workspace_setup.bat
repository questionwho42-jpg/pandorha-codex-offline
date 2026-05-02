@echo off
setlocal enabledelayedexpansion

:: =============================================================================
:: PANDORHA ENGINE - CODEX WORKSPACE SETUP
:: Este script configura automaticamente uma nova worktree do Codex.
:: =============================================================================

echo [PANDORHA] Inicializando Setup de Workspace...

:: Validação de Variáveis de Ambiente do Codex
if "%CODEX_SOURCE_TREE_PATH%"=="" (
    echo [ERRO] Variável CODEX_SOURCE_TREE_PATH não encontrada.
    echo Certifique-se de estar rodando dentro do contexto do Codex Desktop App.
    pause
    exit /b 1
)

if "%CODEX_WORKTREE_PATH%"=="" (
    echo [ERRO] Variável CODEX_WORKTREE_PATH não encontrada.
    pause
    exit /b 1
)

echo [PANDORHA] Caminho Original: %CODEX_SOURCE_TREE_PATH%
echo [PANDORHA] Destino (Worktree): %CODEX_WORKTREE_PATH%

:: 1. Copiar o arquivo .env (Segredo e Configurações)
echo [PANDORHA] Sincronizando variáveis de ambiente (.env)...
if exist "%CODEX_SOURCE_TREE_PATH%\.env" (
    copy "%CODEX_SOURCE_TREE_PATH%\.env" "%CODEX_WORKTREE_PATH%\.env" /Y
    echo [OK] Arquivo .env copiado com sucesso.
) else (
    echo [AVISO] Arquivo .env não encontrado na origem. Pulando...
)

:: 2. Entrar na Worktree e Instalar Dependências
echo [PANDORHA] Instalando pacotes (npm install)...
cd /d "%CODEX_WORKTREE_PATH%"

:: Verifica se existe um package.json antes de tentar instalar
if exist "package.json" (
    call npm install
    echo [OK] Dependências instaladas.
) else (
    echo [AVISO] package.json não encontrado na raiz da worktree.
    echo Verifique se o projeto utiliza sub-diretórios para o código-fonte.
)

echo [PANDORHA] Setup Concluído! O ambiente está pronto para o Agente.
echo -----------------------------------------------------------------------------
pause
