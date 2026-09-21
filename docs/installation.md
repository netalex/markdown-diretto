# Installazione e diagnosi

Ambiente di riferimento: **Thunderbird 155.0.1 Meadow, Windows 64 bit**.

## File da scegliere

| File                         | Destinazione                                     |
| ---------------------------- | ------------------------------------------------ |
| `markdown-diretto-0.1.1.xpi` | Installazione in Thunderbird                     |
| ZIP del repository           | Estrazione dei sorgenti e del bundle Git         |
| `markdown-diretto.bundle`    | Clonazione con Git per recuperare tutti i commit |
| `extension/manifest.json`    | Caricamento temporaneo per lo sviluppo           |

Non rinominare lo ZIP del progetto in XPI. L'XPI è un archivio ZIP con `manifest.json` direttamente alla radice e tutti i file necessari ai percorsi attesi.

## Installare

1. Genera l'XPI con `npm run build`, oppure usa l'XPI incluso separatamente nella consegna.
2. In Thunderbird apri **Componenti aggiuntivi e temi**.
3. Menu ingranaggio → **Installa componente aggiuntivo da file…**.
4. Seleziona il file `.xpi` e accetta il permesso per i messaggi in composizione.
5. Apri un messaggio in formato HTML e cerca **Markdown Diretto** nella finestra di composizione.

## Errore “This add-on could not be installed because it appears to be corrupt”

Nella segnalazione iniziale è stato selezionato lo ZIP del progetto. Quel file non contiene `manifest.json` alla radice; l'XPI al suo interno invece lo contiene e supera i controlli ZIP. Questo spiega perché il progetto ZIP non può essere installato come add-on; non dimostra che l'XPI sia già collaudato su Thunderbird.

Verifica un pacchetto dalla cartella del repository:

```powershell
python tools/build.py --verify dist/markdown-diretto-0.1.1.xpi
```

Se anche l'XPI corretto viene rifiutato, annota nome esatto del file, versione Thunderbird ed errore nella Console degli errori (`Ctrl+Shift+J`) al momento dell'installazione. I controlli locali verificano struttura e riferimenti, non sostituiscono il validatore interno di Thunderbird.

## Prova minima

Scrivi e seleziona nel messaggio:

```markdown
## Prova

Testo **grassetto** e _corsivo_.

- Primo punto
- Secondo punto
```

Esegui conversione e ripristino. Prova prima senza firma, poi con firma esclusa dalla selezione. Non inviare email reali finché non hai controllato il risultato; per verificare l'invio usa un messaggio di prova a te stesso.
