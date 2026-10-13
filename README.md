# Hush per Chrome

Compila utente e password nei siti direttamente da Chrome, prendendoli da
[Hush](https://github.com/AntonioScirica/hush) aperto sul tuo Mac. I dati non
passano mai da internet: l'estensione parla solo con Hush sullo stesso computer.

Serve [Hush per Mac](https://github.com/AntonioScirica/hush/releases/latest/download/Hush.dmg)
installato e sbloccato.

## Installa

1. [Scarica l'estensione](https://github.com/AntonioScirica/hush-chrome-extension/releases/latest/download/hush-chrome-extension.zip)
   e fai doppio clic sul file per estrarre la cartella.
2. In Chrome apri l'indirizzo `chrome://extensions`.
3. Attiva **Modalità sviluppatore** (interruttore in alto a destra).
4. Clicca **Carica estensione non pacchettizzata** e scegli la cartella estratta.
5. In Hush vai in **Impostazioni**, premi **Copia token per Chrome**, poi apri
   l'estensione (icona del puzzle in alto a destra in Chrome) e incolla il token.

Fatto: quando tocchi un campo di login, sopra compare il menu con le voci di
Hush per quel sito. Se non trovi la voce, cerca: guarda in tutto il tuo
archivio, non solo tra le voci del sito.

## Come funziona

- `background.js`: inoltra le richieste a Hush su `127.0.0.1:51823`, con un
  token che solo tu hai copiato da Hush.
- `content.js` / `content.css`: il menu sopra i campi di login.
- `popup.html` / `popup.js`: stato del collegamento e campo per il token.

## Licenza

[MIT](LICENSE) © 2026 Antonio Scirica
