# Dipendenze distribuite

## Marked 17.0.5

- Sorgente upstream: https://github.com/markedjs/marked
- File incluso: `extension/vendor/marked.js` (distribuzione UMD originale).
- Licenza MIT: `extension/vendor/marked-LICENSE.md`.
- Il file vendorizzato viene conservato senza riformattarlo o modificarlo.

Per aggiornare: procurarsi il pacchetto ufficiale della versione scelta, copiare `lib/marked.umd.js` e `LICENSE.md`, aggiornare versione e hash in `extension/vendor/README.md`, eseguire tutti i test e registrare il cambiamento in un commit dedicato.

Playwright, LinkeDOM e Prettier sono strumenti di sviluppo e non vengono inseriti nell'XPI. Le relative licenze sono contenute nei pacchetti npm.

Il codice originale del progetto non ha ancora una licenza di distribuzione scelta dal titolare. Prima della pubblicazione pubblica, scegliere e aggiungere `LICENSE`; la licenza MIT di Marked non si estende automaticamente al resto del repository.
