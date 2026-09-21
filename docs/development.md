# Sviluppo su Windows

## Preparazione

Installa Git, Node.js 22+ e Python 3.10+. Verifica da PowerShell o dal terminale di VS Code:

```powershell
git --version
node --version
npm --version
python --version
npm ci
```

Se PowerShell blocca `npm.ps1`, usa `npm.cmd` al posto di `npm`; per esempio `npm.cmd ci`. Se Python è disponibile solo tramite `py`, esegui direttamente `py tools/build.py` e `py -m unittest discover -s tests -p test_packaging.py`, oppure configura `python` nel PATH.

## Comandi

| Comando                | Scopo                                         |
| ---------------------- | --------------------------------------------- |
| `npm ci`               | Installa le versioni esatte del lockfile      |
| `npm run check`        | Sintassi JS, manifest, coerenza versione      |
| `npm run format`       | Formatta sorgenti e documentazione            |
| `npm run format:check` | Controlla senza modificare                    |
| `npm test`             | Sei test del renderer, senza browser          |
| `npm run test:package` | Quattro test del pacchetto XPI                |
| `npm run test:editor`  | Otto test contenteditable in Chromium         |
| `npm run test:all`     | Renderer e Chromium; packaging resta separato |
| `npm run build`        | Genera e valida l'XPI in `dist`               |

Per la suite editor, una volta:

```powershell
npx playwright install chromium
npm run test:editor
```

## Ciclo di modifica

1. Crea un branch, ad esempio `git switch -c fix/selection-restore`.
2. Leggi `docs/architecture.md` e modifica il file responsabile del comportamento.
3. Esegui i controlli pertinenti e formatta.
4. Carica temporaneamente `extension/manifest.json` dal pannello di debug dei componenti aggiuntivi di Thunderbird.
5. Dopo ogni modifica ricarica l'estensione e apri una nuova finestra di composizione; gli script già iniettati conservano lo stato precedente.
6. Verifica il comportamento con testo fittizio e registra i passi per riprodurlo.
7. Crea un commit piccolo e descrittivo.

Non c'è un bundler: i file sotto `extension` sono quelli eseguiti dal client. `dist`, `node_modules` e risultati temporanei non vengono versionati. `package-lock.json` viene versionato.

## Identità Git

I commit iniziali sono stati preparati dall'assistente con autore `Codex <codex@local.invalid>` e date reali della preparazione. Nessuna identità dell'utente è stata inventata. Configura nome ed email per i tuoi nuovi commit con `git config user.name` e `git config user.email`, usando i tuoi valori.
