# Changelog

## Unreleased

- Repository organizzato con documentazione in italiano e commit tematici.
- Dipendenze di sviluppo bloccate nel lockfile e formattazione uniforme.
- Test separati per renderer, editor e packaging.
- Build XPI con controlli della struttura e output ripetibile nello stesso ambiente.
- CI Windows/Linux e suite Chromium separata.
- Istruzioni esplicite sulla differenza tra ZIP sorgenti e XPI installabile.

## 0.2.0 — Markdown in lettura

- Pulsante dedicato nei messaggi ricevuti, con vista formattata e ripristino originale.
- Trasformazione locale del documento visualizzato, senza API di scrittura dei messaggi.
- Nuovo permesso `messagesModify` per gli script nel riquadro di lettura.
- Renderer condiviso e 10 nuovi test di lettura e integrazione popup simulata.
- Conversione/ripristino in composizione 0.1.1 confermati dall’utente; lettura da verificare sul client.

## 0.1.1 — Correzione identificatori nell’editor

- Risolve `crypto.randomUUID is not a function` segnalato su Thunderbird 155.0.1 Windows.
- Sostituisce gli UUID con identificatori locali progressivi, verificando collisioni con blocchi esistenti e snapshot.
- Aggiunge tre test di regressione: conversione/ripristino senza Web Crypto, marker preesistenti e conversioni successive.
- Conserva lo stesso ID dell’estensione per aggiornare l’installazione precedente.
- Il nuovo XPI richiede ancora conferma sul client dell’utente.

## 0.1.0 — Prototipo alpha

- Conversione esplicita da Markdown a HTML nella composizione Thunderbird.
- Ripristino in memoria e protezioni per firme, citazioni e modifiche successive.
- Marked 17.0.5 incluso localmente.
- Compatibilità Thunderbird reale non ancora verificata; nessuna release pubblicata.
