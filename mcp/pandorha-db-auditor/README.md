# pandorha-db-auditor

SQLite MCP server for auditing Pandorha actor math.

Tools:

- `get_actor_stats`: reads the `actors` table and returns available 3x3 axes/applications for one actor.
- `verify_math`: validates `HP = (Base + Fis + Res) * Nv` and `EE = Nv + Mental` when matching columns exist.
- `execute_query`: executes read-only SQL (`SELECT`, `WITH`, and safe schema `PRAGMA` calls).

Default DB path:

```text
C:/Users/Pichau/Desktop/pandorha sistema 28-04/dev.db
```

Override with:

```powershell
$env:PANDORHA_DB_PATH = "C:/path/to/dev.db"
```
