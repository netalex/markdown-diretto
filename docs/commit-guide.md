# Leggere la cronologia

Questa è una ricostruzione tematica del prototipo in sette commit iniziali, seguiti da una correzione, tutti creati durante la preparazione del repository. Ogni passo ha uno scopo leggibile; i primi passi sono parziali e il repository completo da usare è `main` al termine della sequenza.

| Passo | Commit                                                                 | Contenuto                                               |
| ----- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| 1     | `chore: establish project structure and development scope`             | Cartelle, convenzioni, obiettivo e roadmap              |
| 2     | `feat: render Markdown with restricted HTML output`                    | Parser, filtro HTML, licenza e provenienza di Marked    |
| 3     | `feat: integrate conversion and guarded restore into Thunderbird`      | Popup, manifest, editor e architettura                  |
| 4     | `test: add locked tooling and renderer and editor regression suites`   | Lockfile, controlli, test e formattazione leggibile     |
| 5     | `fix: validate installable XPI layout and make packaging reproducible` | Build e regressione sullo ZIP non installabile          |
| 6     | `ci: check Windows and Linux builds and editor regressions`            | GitHub Actions e convenzioni per contribuire            |
| 7     | `docs: document Windows setup, validation and GitHub publishing`       | Guide utente/sviluppatore e stato reale delle verifiche |

```powershell
git log --oneline --reverse
git show --stat HEAD
git show HEAD~2
```

I commit sono locali, non firmati e senza tag di release: il prodotto resta un'alpha da collaudare.

## Ottavo commit: correzione segnalata dall’utente

`fix: avoid unavailable randomUUID in Thunderbird compose editor` — rimuove la dipendenza da Web Crypto, aggiunge tre test di regressione e aggiorna l’estensione alla 0.1.1.
