# Test e collaudo

## Risultati della preparazione — 21 settembre 2026

| Verifica                                          | Risultato                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| Sintassi JavaScript e manifest                    | Passata                                                           |
| Formattazione Prettier                            | Passata                                                           |
| Renderer Node/LinkeDOM                            | 6/6 passati                                                       |
| Composizione con adattatore DOM, senza Web Crypto | 3/3 passati                                                       |
| Packaging Python                                  | 4/4 passati                                                       |
| Build ripetuta                                    | Byte identici nell'ambiente corrente                              |
| Suite Chromium                                    | 8 casi predisposti; non eseguiti con successo per browser assente |
| Thunderbird 155.0.1 Windows                       | Da eseguire                                                       |
| GitHub Actions                                    | Configurato; non ancora eseguito sul servizio                     |

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

I tre test della composizione usano un adattatore minimale per selezione e inserimento HTML sopra LinkeDOM. Verificano il codice effettivo con `crypto` assente e le collisioni degli identificatori; non simulano layout, undo o API Thunderbird.

## Verifica 0.2.0

- 19 test JavaScript passati: 6 renderer, 3 composizione, 7 lettura, 3 popup di lettura con API simulate.
- 4 test packaging passati, ora comprensivi dei file della lettura e del secondo popup.
- L’utente conferma conversione/ripristino in composizione nella 0.1.1 su Thunderbird 155.0.1 Windows.
- Modalità lettura 0.2.0 da collaudare sul client; API simulate e DOM LinkeDOM non equivalgono a test Thunderbird.

### Checklist lettura

- [ ] Accettazione nuovo permesso e pulsante nella barra del messaggio.
- [ ] Email plain text con titoli, elenchi, tabelle e codice Markdown.
- [ ] Email HTML contenente Markdown letterale e interruzioni BR/div.
- [ ] Ripristino originale, comprese immagini, firma e citazioni.
- [ ] Cambio messaggio dopo conversione: niente contenuti della precedente email.
- [ ] Prova in riquadro principale, scheda e finestra separata.
- [ ] Riapertura email e sorgente originale invariati.
- [ ] Risposta/inoltro non incorpora modifiche indesiderate della vista; confrontare il corpo citato col messaggio originale.
