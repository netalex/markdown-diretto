# Test e collaudo

## Risultati della preparazione — 21 settembre 2026

| Verifica                       | Risultato                                                         |
| ------------------------------ | ----------------------------------------------------------------- |
| Sintassi JavaScript e manifest | Passata                                                           |
| Formattazione Prettier         | Passata                                                           |
| Renderer Node/LinkeDOM         | 6/6 passati                                                       |
| Packaging Python               | 4/4 passati                                                       |
| Build ripetuta                 | Byte identici nell'ambiente corrente                              |
| Suite Chromium                 | 8 casi predisposti; non eseguiti con successo per browser assente |
| Thunderbird 155.0.1 Windows    | Da eseguire                                                       |
| GitHub Actions                 | Configurato; non ancora eseguito sul servizio                     |

Il download di Chromium nel precedente tentativo è fallito per timeout. Non si dichiara la suite editor superata e non si disabilita il relativo job in CI.

## Cosa coprono i test

Il renderer verifica sintassi Markdown, caratteri Unicode, tabelle, codice, HTML inerte, link ammessi, immagini trasformate in descrizioni e interruzioni di riga.

Il packaging verifica build ripetibili nello stesso ambiente, manifest alla radice, script necessari e riferimento al popup. Non valida lo schema completo Thunderbird né certifica l'installazione. L'identità byte per byte tra versioni diverse di Python/zlib non è garantita.

La suite editor prova selezione, ripristino, firme/citazioni, rifiuto delle sovrascritture e undo su Chromium. Non esercita `messenger.*`, il popup dentro Thunderbird, il salvataggio delle bozze o la serializzazione MIME.

## Checklist Thunderbird

Usare testo fittizio e riportare versione esatta e sistema operativo.

- [ ] Installazione dell'XPI e presenza del pulsante.
- [ ] Composizione HTML e rifiuto chiaro in modalità testo semplice.
- [ ] Conversione senza selezione in messaggio vuoto di firma.
- [ ] Conversione selettiva con firma preservata.
- [ ] Risposte e inoltri con testo citato preservato.
- [ ] Elenchi annidati, tabelle, accenti, codice e righe vuote.
- [ ] Ripristino immediato e rifiuto dopo modifica del risultato.
- [ ] Ctrl+Z/Ctrl+Y e corretto stato di messaggio modificato.
- [ ] Due finestre contemporanee senza interferenze.
- [ ] Salvataggio e riapertura bozza: HTML conservato, limite sul sorgente esplicito.
- [ ] Invio a se stessi e controllo HTML/testo semplice e allegati.

Per ogni bug: passi, risultato atteso, risultato ottenuto, messaggio esatto della console. Evitare email reali e dati personali negli allegati.
