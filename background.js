// Fa da ponte fra le pagine (content.js) e il bridge locale che Hush.app
// apre mentre è sbloccato (127.0.0.1:51823, mai la rete). Qui non c'è
// nessuna password: solo l'inoltro delle richieste, col token incollato
// una volta dalle Impostazioni di Hush.

const BRIDGE_URL = "http://127.0.0.1:51823"

async function getToken() {
  const { hushToken } = await chrome.storage.local.get("hushToken")
  return hushToken || null
}

async function chiediAlBridge(path) {
  const token = await getToken()
  if (!token) return { error: "non_collegato" }

  try {
    const res = await fetch(`${BRIDGE_URL}${path}`, {
      headers: { "X-Hush-Token": token },
    })
    return await res.json()
  } catch {
    return { error: "unreachable" }
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "status") {
    chiediAlBridge("/status").then(sendResponse)
    return true
  }
  if (message.type === "matches") {
    const host = encodeURIComponent(message.host || "")
    chiediAlBridge(`/matches?host=${host}`).then(sendResponse)
    return true
  }
  if (message.type === "search") {
    const q = encodeURIComponent(message.query || "")
    chiediAlBridge(`/search?q=${q}`).then(sendResponse)
    return true
  }
  return false
})
