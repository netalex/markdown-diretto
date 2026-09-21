# Contribuire

Leggi [sviluppo](docs/development.md), [architettura](docs/architecture.md) e [verifica](docs/testing.md).

- Documentazione e interfaccia in italiano; identificatori del codice e messaggi dei commit in inglese.
- Un commit per cambiamento comprensibile: problema, modifica, test pertinente.
- Prefissi: `feat`, `fix`, `test`, `docs`, `build`, `ci`, `chore`.
- Mantieni separate conversione Markdown, manipolazione dell'editor e API Thunderbird.
- Usa `npm run format`; non modificare manualmente i file di terze parti.
- Non aggiungere permessi al manifest senza motivarli nella pull request.
- Non inserire credenziali, profili Thunderbird, email reali o dati personali nelle fixture.
- Le prove Chromium non dimostrano la compatibilità Thunderbird. Registra sempre il client reale provato.

Prima di proporre una modifica:

```powershell
npm ci
npm run check
npm run format:check
npm test
npm run test:package
npm run build
```

Per modifiche a selezione, conversione e ripristino, esegui anche `npm run test:editor` e la checklist Thunderbird.
