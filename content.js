// Trova i campi di login nella pagina e compila utente/password quando
// l'utente sceglie una voce dal menu, che compare da sé sopra il campo
// appena lo tocchi — niente lucchetto da cliccare.
(function () {
  const seen = new WeakSet()
  let openDropdown = null
  let openField = null

  function closeDropdown() {
    if (openDropdown) { openDropdown.remove(); openDropdown = null }
    openField = null
  }

  function usernameFieldFor(passwordField) {
    const form = passwordField.form
    const candidates = form
      ? Array.from(form.querySelectorAll("input"))
      : Array.from(document.querySelectorAll("input"))
    const idx = candidates.indexOf(passwordField)
    for (let i = idx - 1; i >= 0; i--) {
      const el = candidates[i]
      const type = (el.type || "text").toLowerCase()
      if (["text", "email", "tel"].includes(type)) return el
    }
    return null
  }

  function fillReact(el, value) {
    const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, "value").set
    setter.call(el, value)
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.dispatchEvent(new Event("change", { bubbles: true }))
  }

  function messaggioErrore(errore) {
    if (errore === "non_collegato") return "Incolla il token di Hush nel popup dell'estensione."
    if (errore === "locked") return "Hush è chiuso: apri l'app sul Mac."
    return "Hush non risponde: apri l'app."
  }

  function positionAbove(box, field) {
    const r = field.getBoundingClientRect()
    box.style.left = window.scrollX + r.left + "px"
    box.style.width = r.width + "px"
    const above = r.top - box.offsetHeight - 4
    // Se sopra il campo non c'è spazio (campo vicino al bordo della
    // pagina) il menu finirebbe fuori schermo: si mette sotto.
    box.style.top = window.scrollY + (above >= 0 ? above : r.bottom + 4) + "px"
  }

  function showDropdown(field, passwordField, usernameField) {
    closeDropdown()
    const box = document.createElement("div")
    box.className = "hush-dropdown"
    box.style.position = "absolute"
    const loading = document.createElement("div")
    loading.className = "hush-empty"
    loading.textContent = "Hush · cerco…"
    box.appendChild(loading)
    document.documentElement.appendChild(box)
    openDropdown = box
    openField = field
    positionAbove(box, field)

    chrome.runtime.sendMessage({ type: "matches", host: location.hostname }).then((res) => {
      if (openDropdown !== box) return
      box.textContent = ""
      if (!res || res.error) {
        const empty = document.createElement("div")
        empty.className = "hush-empty"
        empty.textContent = messaggioErrore(res && res.error)
        box.appendChild(empty)
        positionAbove(box, field)
        return
      }
      // Campo solo-email (password in un altro schermo): senza username
      // salvato non c'è nulla da riempire qui, inutile mostrare la voce.
      const entries = (res.entries || []).filter((e) => passwordField || e.username)
      if (entries.length === 0) {
        const empty = document.createElement("div")
        empty.className = "hush-empty"
        empty.textContent = res.entries && res.entries.length > 0
          ? "Le voci di questo sito non hanno un'email salvata: aggiungila in Hush."
          : "Nessuna voce per questo sito."
        box.appendChild(empty)
        positionAbove(box, field)
        return
      }
      entries.forEach((entry) => {
        const row = document.createElement("div")
        row.className = "hush-row"
        const title = document.createElement("span")
        title.className = "hush-title"
        title.textContent = entry.title
        const sub = document.createElement("span")
        sub.className = "hush-sub"
        sub.textContent = [entry.username, entry.projectName].filter(Boolean).join(" · ")
        row.appendChild(title)
        row.appendChild(sub)
        // mousedown, non click: il click arriva dopo il blur del campo e
        // certi siti nel frattempo rifanno il DOM, perdendo la selezione.
        row.addEventListener("mousedown", (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (usernameField && entry.username) fillReact(usernameField, entry.username)
          if (passwordField) fillReact(passwordField, entry.password)
          closeDropdown()
        })
        box.appendChild(row)
      })
      positionAbove(box, field)
    })
  }

  // Alcuni login (X, Google…) chiedono email/utente in uno schermo e la
  // password solo dopo — niente campo password da agganciare finché non si
  // arriva lì. Riconosciamo comunque il campo utente da solo.
  function looksLikeUsernameField(el) {
    const type = (el.type || "text").toLowerCase()
    if (!["text", "email", "tel"].includes(type)) return false
    const auto = (el.autocomplete || "").toLowerCase()
    if (auto === "username" || auto === "email") return true
    const hay = [el.name, el.id, el.placeholder].join(" ").toLowerCase()
    return /email|user|phone|identifier|login/.test(hay)
  }

  // Il rect del campo da solo non basta: Netflix & co. nascondono il campo
  // password collassando un antenato ad altezza zero, e il campo continua a
  // dichiarare le sue misure. Si risale la catena.
  function isVisible(el) {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const r = n.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return false
    }
    return true
  }

  // Solo password VISIBILI: molti siti (Netflix…) tengono nel DOM un campo
  // password nascosto anche nello schermo che chiede solo l'email.
  function hasPasswordInScope(el) {
    const scope = el.form || document
    return Array.from(scope.querySelectorAll('input[type="password"]')).some(isVisible)
  }

  function attach(field, passwordField) {
    if (seen.has(field)) return
    seen.add(field)

    function reposition() {
      if (openDropdown && openField === field) positionAbove(openDropdown, field)
    }
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)

    // Compare da sé al focus, come i suggerimenti nativi del browser.
    field.addEventListener("focus", () => {
      const usernameField = passwordField ? usernameFieldFor(passwordField) : field
      showDropdown(field, passwordField, usernameField)
    })

    // Scrivendo si sceglie a mano: il menu sparisce.
    field.addEventListener("input", () => {
      if (openField === field) closeDropdown()
    })
  }

  function scan() {
    document.querySelectorAll('input[type="password"]').forEach((f) => attach(f, f))
    document.querySelectorAll("input").forEach((el) => {
      if ((el.type || "text").toLowerCase() === "password") return
      if (hasPasswordInScope(el)) return
      if (!looksLikeUsernameField(el)) return
      attach(el, null)
    })
  }

  document.addEventListener("mousedown", (e) => {
    if (openDropdown && !openDropdown.contains(e.target) && e.target !== openField) closeDropdown()
  })

  scan()
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true })
})()
