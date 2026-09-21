# Markdown Diretto

Estensione Thunderbird per scrivere Markdown nelle email e leggere formattato il Markdown grezzo dei messaggi ricevuti.

**Stato: alpha.** Ambiente di riferimento: Thunderbird **155.0.1 Meadow, 64 bit, Windows**. Compatibilità sul client reale ancora da collaudare.

Il progetto parte dal prototipo 0.1.0. La cronologia Git ricostruisce il lavoro in passi tematici, creati oggi: non rappresenta una cronologia storica precedente.

## Obiettivo

Scrivere nel normale editor di Thunderbird, convertire il testo selezionato e poter tornare al sorgente durante la stessa sessione di composizione. Firme e messaggi citati devono restare intatti.

## Organizzazione

- `extension/`: file installati nell'estensione, senza compilazione JavaScript.
- `tests/`: test del renderer e dell'editor, separati per ambiente.
- `tools/`: controlli e creazione del pacchetto XPI.
- `docs/`: architettura, sviluppo, verifiche e pubblicazione.
- `.github/`: automazione dei controlli e modello per le pull request.

## Avvio rapido su Windows

Prerequisiti per sviluppare: Git, Node.js 22 o successivo, npm e Python 3.10 o successivo, disponibili nel `PATH`. Per installare soltanto l'estensione non servono questi strumenti.

Dalla cartella del repository:

```powershell
npm ci
npm run check
npm test
npm run test:package
npm run build
```

Installa **`dist/markdown-diretto-0.2.0.xpi`** in Thunderbird da **Componenti aggiuntivi e temi → ingranaggio → Installa componente aggiuntivo da file**.

**Lo ZIP del repository non è installabile in Thunderbird.** Estrarlo o rinominarlo in `.xpi` non lo trasforma in un add-on: il pacchetto corretto è quello generato in `dist`.

## Uso

1. Apri un messaggio in formato HTML.
2. Scrivi Markdown nel corpo: `**grassetto**`, `*corsivo*`, titoli, elenchi, tabelle o codice.
3. Seleziona il testo, escludendo firma e messaggi citati.
4. Apri **Markdown Diretto → Formatta Markdown**.
5. Per tornare al sorgente, posiziona il cursore nel blocco e scegli **Torna al Markdown**.

Senza selezione viene convertito tutto il corpo, purché non contenga firme, citazioni o contenuti protetti. Il ripristino è disponibile nella sessione corrente e viene rifiutato se il risultato è stato modificato. Non sopravvive necessariamente alla riapertura delle bozze.

## Dove iniziare a leggere

| Voglio…                                              | Documento                             |
| ---------------------------------------------------- | ------------------------------------- |
| Installare o capire l'errore “appears to be corrupt” | [Installazione](docs/installation.md) |
| Modificare il codice su Windows                      | [Sviluppo](docs/development.md)       |
| Capire file, flusso e limiti                         | [Architettura](docs/architecture.md)  |
| Sapere cosa è stato verificato                       | [Test e collaudo](docs/testing.md)    |
| Pubblicare repository e release                      | [GitHub](docs/publishing.md)          |
| Capire l'ordine dei commit                           | [Cronologia](docs/commit-guide.md)    |
| Scegliere il prossimo lavoro                         | [Roadmap](docs/roadmap.md)            |

## Stato delle verifiche

Sei test renderer, tre test di composizione senza Web Crypto e quattro test packaging passati nell'ambiente Linux di preparazione. Controlli di sintassi, formattazione e build passati. Suite editor Chromium predisposta ma bloccata qui dall'assenza del browser; installazione del browser fallita per timeout. L’utente ha installato la 0.1.0 su Thunderbird 155.0.1 Windows e segnalato l’errore `crypto.randomUUID is not a function`. La 0.1.1 lo corregge; il collaudo completo sul client resta da terminare.

La CI eseguirà controlli su Windows e Linux e una suite editor separata su Chromium dopo il push. Non è ancora stata eseguita su GitHub.

## Distribuzione e licenze

Il parser Marked e la sua licenza MIT sono inclusi. Il codice originale è marcato `UNLICENSED` finché il titolare sceglie la licenza del progetto; vedi [note sulle dipendenze](THIRD_PARTY_NOTICES.md). Il repository è pronto per il lavoro privato; prima di una pubblicazione open source aggiungere una licenza coerente con la scelta del titolare.

## Leggere Markdown nei messaggi ricevuti (0.2.0)

Installa l’XPI aggiornato e accetta il nuovo permesso per intervenire sui messaggi visualizzati. Apri una singola email ricevuta e usa il pulsante **Markdown Diretto** nella barra del messaggio, accanto ai comandi di risposta; potrebbe essere nel menu di overflow.

- **Mostra Markdown formattato**: interpreta il testo del corpo come Markdown.
- **Mostra originale**: ripristina la visualizzazione originale.

La trasformazione è solo nella vista corrente, non nel messaggio salvato. Non è una conversione HTML → Markdown e non viene attivata automaticamente. Sono previsti il riquadro di lettura, le schede e le finestre dei messaggi; tutti e tre richiedono collaudo sul client reale.

Il permesso aggiunto è `messagesModify`, richiesto da Thunderbird per modificare il documento visualizzato. Nessuna chiamata alle API di scrittura delle email. La vista Markdown non incorpora immagini: torna all’originale per visualizzare il layout completo del mittente. L’email e gli allegati restano salvati come prima.

Verifiche 0.2.0: **19 test JavaScript + 4 test packaging passati**. L’utente ha confermato conversione e ripristino in composizione nella 0.1.1; la nuova modalità lettura attende conferma su Thunderbird.
