# Hush — estensione Chrome

Compila utente e password nei siti, direttamente da Chrome, parlando col
bridge locale che [Hush.app](https://github.com/AntonioScirica/Scrigno)
apre mentre è sbloccato (`127.0.0.1:51823` — mai la rete).

Diversa da com'è fatta quella per Safari: Chrome non può leggere il
Portachiavi di macOS come fa codice nativo Swift, quindi qui non c'è nessun
handler nativo — solo JavaScript, e il token che autentica le richieste al
bridge va incollato una volta sola (Hush → Impostazioni → Estensione
Chrome → Copia token).

## Installare (sviluppo)

1. `chrome://extensions`
2. Attiva "Modalità sviluppatore" in alto a destra
3. "Carica estensione non pacchettizzata" → scegli questa cartella
4. Apri il popup dell'estensione, incolla il token copiato da Hush

## File

- `manifest.json` — Manifest V3
- `background.js` — service worker: inoltra le richieste al bridge, token in `chrome.storage.local`
- `content.js` / `content.css` — tasto 🔒 sopra i campi password, menu a tendina con le voci che combaciano
- `popup.html` / `popup.js` — stato del collegamento, incolla-token
