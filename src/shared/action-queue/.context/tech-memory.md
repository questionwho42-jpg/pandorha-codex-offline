# Action Queue Technical Memory

## 2026-05-06 - T20 ActionQueue Minima

- Created `shared/action-queue` as the pure sequencing foundation for commands.
- `ActionQueueService` keeps normal commands in FIFO order and interruptions in LIFO order.
- Commands are validated with Zod before entering the queue and pending command ids must stay unique across both queues.
- `processNext` removes one command and delegates execution to an injected synchronous processor fake in tests.
- Event Sourcing persistence, Turn Ledger, middlewares, combat, conditions, Worker integration, and UI are deferred.
