# Markdown Diretto

**Scrivi in Markdown. Invia email formattate. Leggi il Markdown che ricevi.**

Estensione per Thunderbird desktop, con comandi separati per composizione e lettura. Funziona localmente: nessun servizio esterno, account aggiuntivo o telemetria.

**Versione 0.2.0 · Alpha · Interfaccia in italiano**

[Installazione](#installazione) · [Uso](#uso) · [Sviluppo](#sviluppo) · [Limiti](#limiti-attuali) · [Changelog](CHANGELOG.md)

## Cosa fa

| In composizione                                    | In lettura                               |
| -------------------------------------------------- | ---------------------------------------- |
| Scrivi Markdown nel normale corpo dell’email       | Apri un’email contenente Markdown grezzo |
| Formatta tutto il testo o una selezione            | Mostra il corpo come HTML formattato     |
| Torna al sorgente durante la stessa sessione       | Ripristina la vista originale            |
| Protegge firme e messaggi citati dalla conversione | Lascia invariato il messaggio salvato    |

Supporta titoli, grassetto, corsivo, elenchi annidati, citazioni, link, tabelle, codice, testo barrato e caselle di controllo rappresentate da simboli.

## Installazione

Il file da installare è **`markdown-diretto-0.2.0.xpi`**. Puoi generarlo dai sorgenti seguendo la sezione [Sviluppo](#sviluppo).

1. Apri **Componenti aggiuntivi e temi** in Thunderbird.
2. Dal menu con l’ingranaggio scegli **Installa componente aggiuntivo da file…**.
3. Seleziona l’XPI e accetta i permessi richiesti.
4. Dopo un aggiornamento, riavvia Thunderbird e riapri il messaggio.

Lo ZIP dei sorgenti di GitHub **non è installabile** come estensione. Vedi [installazione e risoluzione dei problemi](docs/installation.md).

## Uso

### Scrivere un messaggio

Apri una composizione in formato HTML e scrivi, ad esempio:

```markdown
## Aggiornamento progetto

Ciao, ecco i **punti principali**:

- Interfaccia pronta
- Test in corso

| Attività     | Stato       |
| ------------ | ----------- |
| Frontend     | Completato  |
| Integrazione | In verifica |
```

Seleziona il testo, escludendo l’eventuale firma, e premi **Markdown Diretto → Formatta Markdown**. Per recuperare il sorgente, posiziona il cursore nel blocco e scegli **Torna al Markdown**.

Senza selezione viene convertito tutto il corpo, purché non contenga firme, citazioni o contenuti già protetti. L’invio resta quello normale di Thunderbird.

### Leggere un messaggio ricevuto

Apri una singola email e usa **Markdown Diretto** nella barra del messaggio, vicino ai comandi di risposta:

- **Mostra Markdown formattato** interpreta il testo del corpo.
- **Mostra originale** ripristina la visualizzazione precedente.

La trasformazione riguarda solo la vista corrente. Non riscrive l’email salvata e non modifica gli allegati. Sono previsti riquadro di lettura, scheda e finestra separata; il collaudo sul client reale della modalità lettura è ancora in corso.

## Compatibilità e stato

Ambiente di riferimento: **Thunderbird 155.0.1 Meadow, Windows 64 bit**.

| Verifica                                       | Stato                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| Conversione e ripristino in composizione 0.1.1 | Confermati dall’utente su Thunderbird                            |
| Modalità lettura 0.2.0                         | Test automatici passati; da confermare sul client                |
| Test JavaScript                                | 19 passati nell’ambiente di sviluppo                             |
| Test del pacchetto XPI                         | 4 passati                                                        |
| Test editor Chromium                           | Predisposti; esecuzione locale bloccata dal download del browser |
| CI Windows/Linux                               | Workflow incluso; consultare gli esiti di GitHub Actions         |

Il manifest ammette Thunderbird 128+, ma questo **non certifica tutte le versioni successive**. I test DOM non sostituiscono il collaudo Thunderbird. Dettagli e checklist in [docs/testing.md](docs/testing.md).

## Limiti attuali

- Il sorgente della composizione è mantenuto in memoria: può andare perso chiudendo una bozza o ricaricando l’estensione.
- Il ripristino viene rifiutato se il blocco formattato è stato modificato, per evitare perdita di testo.
- La lettura interpreta Markdown grezzo; non ricostruisce Markdown da un’email HTML già impaginata.
- Immagini Markdown rappresentate come descrizioni testuali, HTML arbitrario reso inerte, nessuna evidenziazione sintattica del codice.
- Link attivi limitati a HTTP, HTTPS e mailto. Resa grafica dipendente dal client email.
- Nessuna conversione automatica all’invio o all’apertura di un messaggio.

## Permessi e dati

| Permesso         | Motivo                                           |
| ---------------- | ------------------------------------------------ |
| `compose`        | Leggere e formattare il testo nella composizione |
| `messagesModify` | Cambiare il documento del messaggio visualizzato |

L’estensione non usa servizi remoti e non invia dati a terzi. La modalità lettura non chiama API di scrittura dei messaggi. Il parser e le risorse sono inclusi nel pacchetto.

## Sviluppo

Richiede **Node.js 22+**, **npm** e **Python 3.10+**, disponibili nel PATH.

```powershell
npm ci
npm run check
npm run format:check
npm test
npm run test:package
npm run build
```

Il pacchetto viene creato in `dist/markdown-diretto-0.2.0.xpi`.

Per i test dell’editor:

```powershell
npx playwright install chromium
npm run test:editor
```

| Percorso     | Contenuto                                        |
| ------------ | ------------------------------------------------ |
| `extension/` | Codice dell’estensione, popup e parser incluso   |
| `tests/`     | Test renderer, composizione, lettura e packaging |
| `tools/`     | Controlli e build XPI                            |
| `docs/`      | Architettura, sviluppo, collaudo e pubblicazione |
| `.github/`   | CI e modelli per segnalazioni e pull request     |

Leggi la [guida Windows](docs/development.md), l’[architettura](docs/architecture.md) e le [convenzioni per contribuire](CONTRIBUTING.md). La [roadmap](docs/roadmap.md) raccoglie i prossimi passi; la [guida ai commit](docs/commit-guide.md) spiega l’evoluzione del progetto.

## Licenza

Il codice originale non ha ancora una licenza open source: `UNLICENSED`. Marked è distribuito con la propria licenza MIT, inclusa nel repository. Vedi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
