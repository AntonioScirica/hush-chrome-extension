// Trova i campi di login nella pagina, ci appoggia il tasto Hush, e compila
// utente/password quando l'utente sceglie una voce dal menu.
(function () {
  const seen = new WeakSet()
  let openDropdown = null

  function closeDropdown() {
    if (openDropdown) { openDropdown.remove(); openDropdown = null }
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

  function showDropdown(anchor, passwordField, usernameField) {
    closeDropdown()
    const box = document.createElement("div")
    box.className = "hush-dropdown"
    positionNear(box, anchor)
    box.textContent = ""
    const loading = document.createElement("div")
    loading.className = "hush-empty"
    loading.textContent = "Hush · cerco…"
    box.appendChild(loading)
    document.documentElement.appendChild(box)
    openDropdown = box

    chrome.runtime.sendMessage({ type: "matches", host: location.hostname }).then((res) => {
      if (openDropdown !== box) return
      box.textContent = ""
      if (!res || res.error) {
        const empty = document.createElement("div")
        empty.className = "hush-empty"
        empty.textContent = messaggioErrore(res && res.error)
        box.appendChild(empty)
        return
      }
      if (!res.entries || res.entries.length === 0) {
        const empty = document.createElement("div")
        empty.className = "hush-empty"
        empty.textContent = "Nessuna voce per questo sito."
        box.appendChild(empty)
        return
      }
      res.entries.forEach((entry) => {
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
        row.addEventListener("click", () => {
          if (usernameField && entry.username) fillReact(usernameField, entry.username)
          if (passwordField) fillReact(passwordField, entry.password)
          closeDropdown()
        })
        box.appendChild(row)
      })
    })
  }

  function positionNear(el, anchor) {
    const r = anchor.getBoundingClientRect()
    el.style.position = "absolute"
    el.style.top = window.scrollY + r.bottom + 4 + "px"
    el.style.left = window.scrollX + r.left + "px"
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

  function hasPasswordInScope(el) {
    const scope = el.form || document
    return !!scope.querySelector('input[type="password"]')
  }

  function attach(field, passwordField) {
    if (seen.has(field)) return
    seen.add(field)

    const button = document.createElement("div")
    button.className = "hush-button"
    button.textContent = "🔒"
    button.title = "Compila con Hush"
    document.documentElement.appendChild(button)

    function reposition() {
      const r = field.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) { button.style.display = "none"; return }
      button.style.display = "flex"
      button.style.top = window.scrollY + r.top + (r.height - 22) / 2 + "px"
      button.style.left = window.scrollX + r.right - 26 + "px"
    }
    reposition()
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)

    function open() {
      const usernameField = passwordField ? usernameFieldFor(passwordField) : field
      showDropdown(button, passwordField, usernameField)
    }

    button.addEventListener("mousedown", (e) => {
      e.preventDefault()
      e.stopPropagation()
      open()
    })

    // Compare da sé al focus, come i suggerimenti nativi del browser —
    // niente bisogno di cliccare il lucchetto ogni volta.
    field.addEventListener("focus", open)
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
    if (openDropdown && !openDropdown.contains(e.target)) closeDropdown()
  })

  scan()
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true })
})()
