# Hush per Chrome

Compila utente e password nei siti direttamente da Chrome, prendendoli da
[Hush](https://github.com/AntonioScirica/hush) aperto sul tuo Mac. I dati non
passano mai da internet: l'estensione parla solo con Hush sullo stesso computer.

Serve [Hush per Mac](https://github.com/AntonioScirica/hush/releases/latest/download/Hush.dmg)
installato e sbloccato.

## Installa

### ⬇️ [Aggiungi Hush a Chrome](https://chromewebstore.google.com/detail/hush/pfifohnafgmhkdfeahhpojbbehoigean)

1. Apri il link qui sopra e premi **Aggiungi a Chrome**.
2. In Hush vai in **Impostazioni**, premi **Copia token per Chrome**.
3. In Chrome apri l'estensione (icona del puzzle in alto a destra) e incolla
   il token.

Fatto: quando tocchi un campo di login, sopra compare il menu con le voci di
Hush per quel sito. Se non trovi la voce, cerca: guarda in tutto il tuo
archivio, non solo tra le voci del sito.

### Installazione manuale

Per provare una versione non ancora sul Chrome Web Store:
[scarica lo zip](https://github.com/AntonioScirica/hush-chrome-extension/releases/latest/download/hush-chrome-extension.zip),
estrailo, apri `chrome://extensions`, attiva **Modalità sviluppatore** e
scegli la cartella con **Carica estensione non pacchettizzata**.

## Come funziona

- `background.js`: inoltra le richieste a Hush su `127.0.0.1:51823`, con un
  token che solo tu hai copiato da Hush.
- `content.js` / `content.css`: il menu sopra i campi di login.
- `popup.html` / `popup.js`: stato del collegamento e campo per il token.

## Licenza

[MIT](LICENSE) © 2026 Antonio Scirica
