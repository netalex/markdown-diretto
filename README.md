# Markdown Diretto

Estensione Thunderbird per scrivere Markdown direttamente nel corpo di un'email e convertirlo in HTML con un pulsante.

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
