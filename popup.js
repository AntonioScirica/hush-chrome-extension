const pallino = document.getElementById("pallino")
const titolo = document.getElementById("titolo")
const testo = document.getElementById("testo")
const formToken = document.getElementById("formToken")
const tokenInput = document.getElementById("token")
const salvaBtn = document.getElementById("salva")

async function aggiorna() {
  const { hushToken } = await chrome.storage.local.get("hushToken")

  if (!hushToken) {
    titolo.textContent = "Collega Hush"
    testo.textContent = "Serve il token, una volta sola."
    formToken.style.display = "block"
    return
  }

  formToken.style.display = "none"
  try {
    const res = await chrome.runtime.sendMessage({ type: "status" })
    if (res && res.unlocked) {
      pallino.classList.add("ok")
      titolo.textContent = "Hush è sbloccato"
      testo.textContent = "Tocca un campo email o password in una pagina: il menu compare da solo."
    } else if (res && res.hasVault) {
      titolo.textContent = "Hush è chiuso"
      testo.textContent = "Apri Hush sul Mac e sblocca il caveau."
    } else if (res && res.error === "unreachable") {
      titolo.textContent = "Hush non è aperto"
      testo.textContent = "Apri l'app Hush sul Mac."
    } else {
      titolo.textContent = "Token non valido"
      testo.textContent = "Ricopialo dalle Impostazioni di Hush."
      formToken.style.display = "block"
    }
  } catch {
    titolo.textContent = "Hush non è aperto"
    testo.textContent = "Apri l'app Hush sul Mac."
  }
}

salvaBtn.addEventListener("click", async () => {
  const valore = tokenInput.value.trim()
  if (!valore) return
  await chrome.storage.local.set({ hushToken: valore })
  tokenInput.value = ""
  aggiorna()
})

aggiorna()
