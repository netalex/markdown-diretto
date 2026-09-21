# Pubblicare su GitHub

Il repository è stato preparato localmente. Nessun repository remoto è stato creato e nessun push è stato eseguito.

## Recuperare tutti i commit dalla consegna

Estrai lo ZIP del repository e, dalla cartella che contiene `markdown-diretto.bundle`, esegui:

```powershell
git clone markdown-diretto.bundle markdown-diretto
cd markdown-diretto
git remote remove origin
git log --oneline --reverse
```

Il bundle è un repository Git trasportabile con tutta la storia di `main`. La cartella `source` nella consegna è soltanto una copia leggibile dei file: per conservare i commit, clona il bundle.

## Primo push

Crea su GitHub un repository vuoto chiamato `markdown-diretto`, scegliendo la visibilità desiderata. Non inizializzarlo con README o altri file: sono già presenti localmente. Per una pubblicazione open source scegli e aggiungi prima la licenza del progetto; al momento il codice originale è `UNLICENSED`.

Sostituisci `TUO_ACCOUNT` con il tuo account o organizzazione:

```powershell
git remote add origin https://github.com/TUO_ACCOUNT/markdown-diretto.git
git push -u origin main
```

Apri la scheda **Actions** e verifica i job. Non dichiarare la release compatibile con Windows/Thunderbird finché non hai completato anche il collaudo sul client.

## Rilasciare l'add-on

1. Allinea `package.json` e `extension/manifest.json` alla versione da rilasciare; aggiorna il lockfile con npm.
2. Aggiorna `CHANGELOG.md` e i risultati del collaudo.
3. Esegui controlli, test e build.
4. Crea il commit di release e un tag annotato per la versione; pubblica entrambi.
5. Crea la release GitHub e allega **il file `.xpi` generato in `dist`**.

Lo ZIP “Source code” generato da GitHub e lo ZIP degli artifact di Actions non sono direttamente installabili: per Actions estrai l'XPI interno. La release deve offrire l'XPI come asset separato.

Nessuna pubblicazione automatica: la CI controlla e produce un artifact, senza creare release o inviare messaggi.

Riferimenti: [workflow Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs), [Playwright in CI](https://playwright.dev/docs/ci-intro).
