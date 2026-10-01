# Architettura

## Percorso di una conversione

1. L'utente scrive nel corpo del messaggio e apre il popup dell'estensione.
2. `popup.js` individua la finestra di composizione e verifica il formato HTML.
3. Inietta, nell'ordine, Marked, `renderer.js` e `compose.js`.
4. `compose.js` legge la selezione, controlla i contenuti protetti e chiede l'HTML al renderer.
5. Il renderer interpreta il Markdown e ricostruisce il DOM con un elenco ristretto di elementi e attributi.
6. `compose.js` inserisce il risultato con `execCommand('insertHTML')`; il popup marca il messaggio come modificato.

## Responsabilità dei file

| File               | Responsabilità                                       | Non deve gestire                               |
| ------------------ | ---------------------------------------------------- | ---------------------------------------------- |
| `manifest.json`    | Identità, permesso `compose`, popup, versione minima | Logica applicativa                             |
| `popup.js`         | API Thunderbird, comandi, errori visibili            | Parsing Markdown                               |
| `renderer.js`      | Markdown → HTML filtrato, stili inline               | Selezione e API Thunderbird                    |
| `compose.js`       | Selezione, protezioni, sostituzione, ripristino      | Invio o persistenza delle email                |
| `vendor/marked.js` | Parser CommonMark/GFM                                | Regole di sicurezza specifiche dell'estensione |

## Stato e ripristino

Ogni documento di composizione conserva una `Map` di snapshot in memoria. Un identificatore progressivo, univoco nel documento, sul blocco HTML collega il risultato allo snapshot; il Markdown originale non viene serializzato nell'email.

Il ripristino è consentito solo se l'HTML attuale coincide con quello salvato subito dopo la conversione. Questa scelta conservativa protegge da sovrascritture, ma può rifiutare anche modifiche equivalenti introdotte dall'editor.

Riaprire una bozza o ricaricare l'estensione può perdere la mappa. L'HTML resta nel messaggio; il recupero del Markdown tra sessioni è una funzionalità futura.

## Scelte tecniche

- JavaScript e HTML/CSS standard: nessun framework necessario per un popup di due comandi.
- Manifest V2 e API pubbliche Thunderbird. Il numero minimo 128 nel manifest è ereditato dal prototipo, non certifica tutte le versioni successive.
- Script classici perché vengono iniettati nell'editor; le inizializzazioni sono protette contro l'iniezione ripetuta.
- `execCommand` è usato per tentare di mantenere l'annullamento nativo. È un punto da validare sul vero editor Gecko, non solo su Chromium.
- Stili inline per l'HTML email; rendering finale dipendente dal client destinatario.
- Nessun servizio remoto, telemetria, intercettazione dell'invio o accesso automatico alla posta ricevuta. La modalità lettura 0.2.0 richiede `messagesModify` e viene attivata dall’utente.

## Protezioni e limiti

HTML arbitrario nel Markdown viene reso testo. Le immagini Markdown diventano descrizioni inerti. I link attivi sono limitati a HTTP, HTTPS e mailto; niente link relativi. Il filtro DOM ricostruisce gli elementi ammessi senza copiare attributi arbitrari.

Le firme e le citazioni vengono riconosciute dai marcatori DOM usuali di Thunderbird. Se sono presenti, è richiesta una selezione esplicita che le escluda. I marcatori di eventuali altre estensioni richiedono prove specifiche.

## Documentazione API consultata per il prototipo

- https://webextension-api.thunderbird.net/en/mv2/composeScripts.html
- https://webextension-api.thunderbird.net/en/mv2/tabs.html
- https://webextension-api.thunderbird.net/en/latest/compose.html

La documentazione consultata riportava Thunderbird 155.0.1. Questi link seguono le versioni correnti del sito; non sono copie immutabili delle specifiche.

## Correzione 0.1.1

Su Thunderbird 155.0.1 Windows l’installazione della 0.1.0 è riuscita, ma la conversione ha segnalato `crypto.randomUUID is not a function`. Gli identificatori servono solo a collegare DOM e snapshot: non devono essere UUID o token crittografici. La 0.1.1 usa un contatore locale e controlla collisioni sia nel DOM sia negli snapshot, senza dipendere da Web Crypto.

## Modalità lettura (0.2.0)

- `message_display_action` registra il secondo pulsante Thunderbird.
- `reader-popup.js` inietta Marked, il renderer condiviso e `reader.js` nel messaggio visualizzato tramite `tabs.executeScript`.
- `reader.js` estrae testo e interruzioni di riga dal corpo visualizzato (wrapper `.moz-text-plain`, `.moz-text-flowed`, `.moz-text-html`, altrimenti body).
- Il corpo originale viene spostato in un DocumentFragment in memoria, mantenendo l’identità dei nodi. La vista temporanea contiene solo HTML generato dal renderer filtrato.
- Il ripristino rimette gli stessi nodi e recupera la posizione di scorrimento. Se la vista non appartiene più al body, lo snapshot viene scartato per non ripristinare il messaggio precedente su una nuova email.
- Nessun salvataggio, modifica MIME, lettura tramite `messages.get*` o API `compose` nel flusso di lettura.

Il permesso `messagesModify` permette di intervenire sul documento visualizzato. Non viene richiesto `messagesRead`, perché non serve recuperare messaggi o intestazioni via API. La selezione multipla non è supportata; aprire una singola email.

Riferimenti: [messageDisplayAction](https://webextension-api.thunderbird.net/en/mv2/messageDisplayAction.html), [messageDisplayScripts](https://webextension-api.thunderbird.net/en/mv2/messageDisplayScripts.html).

## Ripristino esatto del blocco

Il comando Torna al Markdown sostituisce direttamente il blocco con il suo HTML originale. Non usa `execCommand(insertHTML)`, che in Chromium può conservare contenitori e titoli preesistenti. Gli altri nodi del messaggio non vengono modificati. La conversione continua a usare l’inserimento nativo; il ripristino diretto non costituisce una transazione nella cronologia undo del browser. Per alternare le due viste usare i comandi dell’estensione, non Ctrl+Z sul ripristino. Il popup segnala comunque la modifica a Thunderbird tramite `isModified`.
