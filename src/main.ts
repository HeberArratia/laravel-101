import './style.css'
import {
  httpCheat,
  milestones,
  resourceHint,
  supportPages,
  troubleShoot,
  utilities,
  type Milestone,
  type SupportPage,
} from './content/guide'

const app = document.querySelector<HTMLDivElement>('#app')!

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function codeBlock(code: string): string {
  return `<div class="code-block">
    <button class="copy-btn" type="button" data-copy>Copiar</button>
    <pre><code>${escapeHtml(code)}</code></pre>
  </div>`
}

function navHtml(active: string): string {
  const links = milestones
    .map((m) => {
      const isActive = active === m.slug
      return `<li>
        <a class="nav-link ${isActive ? 'is-active' : ''}" href="/hito/${m.slug}">
          <span class="nav-num">${m.number}</span>
          <span class="nav-title">${escapeHtml(m.title)}${m.star ? ' <span class="star">★</span>' : ''}</span>
        </a>
      </li>`
    })
    .join('')

  return `
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="/">
        <div class="brand-mark"><span>API</span> HITOS</div>
        <p class="brand-sub">Guía Laravel API REST</p>
      </a>
      <p class="nav-label">Estaciones</p>
      <ul class="nav-list">${links}</ul>
      <div class="nav-extra">
        <p class="nav-label">Apoyo</p>
        <ul class="nav-list">
          ${supportPages
            .map(
              (page) => `<li>
            <a class="nav-link ${active === `apoyo-${page.slug}` ? 'is-active' : ''}" href="/apoyo/${page.slug}">
              <span class="nav-num">+</span>
              <span class="nav-title">${escapeHtml(page.title)}</span>
            </a>
          </li>`,
            )
            .join('')}
          <li>
            <a class="nav-link ${active === 'utilidades' ? 'is-active' : ''}" href="/utilidades">
              <span class="nav-num">··</span>
              <span class="nav-title">Utilidades</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
    <div class="sidebar-backdrop" data-close-nav></div>
  `
}

function shell(active: string, content: string): string {
  return `
    <div class="shell">
      ${navHtml(active)}
      <div class="main">
        <div class="topbar">
          <button class="menu-btn" type="button" data-open-nav>Menú</button>
          <strong>HITOS</strong>
        </div>
        <div class="content">${content}</div>
      </div>
    </div>
  `
}

function renderHome(): string {
  const stations = milestones
    .map(
      (m, i) => `
      <li>
        <a class="station" href="/hito/${m.slug}" style="animation-delay:${80 + i * 45}ms">
          <span class="station-num">${m.number}</span>
          <div class="station-body">
            <strong>${escapeHtml(m.title)}${m.star ? ' <span class="badge-star">estrella</span>' : ''}</strong>
            <p>${escapeHtml(m.goal)}</p>
          </div>
          <span class="station-meta">${escapeHtml(m.minutes)}</span>
        </a>
      </li>`,
    )
    .join('')

  return shell(
    'home',
    `
    <section class="hero">
      <div class="hero-kicker">Curso universitario · backend</div>
      <h1 class="hero-brand">HITOS<em>.</em></h1>
      <p class="hero-lead">Guía práctica de Laravel como API REST. Avanza estación por estación: de la primera ruta al CRUD, validaciones, lógica y ensayos de entrega.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="/hito/${milestones[0].slug}">Empezar estación 01</a>
        <a class="btn btn-ghost" href="/apoyo/entregas">Preparar entregas</a>
        <a class="btn btn-ghost" href="/utilidades">Utilidades</a>
      </div>
    </section>

    <section class="station-map">
      <div class="section-head">
        <h2>Mapa de estaciones</h2>
        <p>${milestones.length} hitos + apoyo + utilidades</p>
      </div>
      <ul class="station-list">${stations}</ul>
      <p class="note-strip">${escapeHtml(resourceHint)} El hito ★ Store (POST) es clave. Antes de entregar, pasá por <a href="/apoyo/entregas">Preparar Tarea 4 + EV2</a>.</p>
    </section>

    <section class="station-map" style="margin-top:2rem;animation-delay:200ms">
      <div class="section-head">
        <h2>Apoyo</h2>
        <p>Entregas, defensa y React</p>
      </div>
      <ul class="station-list">
        ${supportPages
          .map(
            (page) => `
          <li>
            <a class="station" href="/apoyo/${page.slug}">
              <span class="station-num">+</span>
              <div class="station-body">
                <strong>${escapeHtml(page.title)}</strong>
                <p>${escapeHtml(page.goal)}</p>
              </div>
              <span class="station-meta">${escapeHtml(page.minutes)}</span>
            </a>
          </li>`,
          )
          .join('')}
      </ul>
    </section>
  `,
  )
}

function pager(m: Milestone): string {
  const index = milestones.findIndex((item) => item.slug === m.slug)
  const prev = milestones[index - 1]
  const next = milestones[index + 1]

  const prevHtml = prev
    ? `<a href="/hito/${prev.slug}"><span>Anterior</span><strong>${escapeHtml(prev.title)}</strong></a>`
    : `<a href="/"><span>Inicio</span><strong>Mapa de estaciones</strong></a>`

  const nextHtml = next
    ? `<a class="next" href="/hito/${next.slug}"><span>Siguiente</span><strong>${escapeHtml(next.title)}</strong></a>`
    : `<a class="next" href="/utilidades"><span>Siguiente</span><strong>Utilidades</strong></a>`

  return `<nav class="pager">${prevHtml}${nextHtml}</nav>`
}

function renderMilestone(m: Milestone): string {
  const steps = m.steps
    .map(
      (step) => `
      <article class="step">
        <h3 class="step-title">${escapeHtml(step.title)}</h3>
        ${step.body ? `<p>${escapeHtml(step.body)}</p>` : ''}
        ${step.code ? codeBlock(step.code) : ''}
      </article>`,
    )
    .join('')

  const done = m.doneWhen.map((item) => `<li>${escapeHtml(item)}</li>`).join('')

  const tests = m.tests
    .map(
      (t) => `
      <article class="test-card">
        <div>
          <span class="method method-${escapeHtml(t.method)}">${escapeHtml(t.method)}</span>
        </div>
        <div class="test-path">${escapeHtml(t.path)}</div>
        ${
          t.headers?.length
            ? `<div class="test-expect">Headers: ${t.headers.map((h) => escapeHtml(h)).join(' · ')}</div>`
            : ''
        }
        ${t.body ? codeBlock(t.body) : ''}
        <p class="test-expect"><strong>Listo cuando:</strong> ${escapeHtml(t.expect)}</p>
      </article>`,
    )
    .join('')

  const tips = m.tips?.length
    ? `<section class="panel" style="animation-delay:180ms">
        <h2>Si te trabas</h2>
        <ul class="tip-list">${m.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      </section>`
    : ''

  return shell(
    m.slug,
    `
    <header class="milestone-hero">
      <div class="eyebrow">
        <span class="pill">Estación ${m.number}</span>
        <span>${escapeHtml(m.minutes)}</span>
        ${m.star ? '<span class="pill pill-star">Hito estrella</span>' : ''}
      </div>
      <h1>${escapeHtml(m.title)}</h1>
      <p class="goal">${escapeHtml(m.goal)}</p>
    </header>

    <section class="panel" style="animation-delay:60ms">
      <h2>Listo cuando…</h2>
      <ul class="check-list">${done}</ul>
    </section>

    <section class="panel" style="animation-delay:100ms">
      <h2>Pasos</h2>
      <div class="step-list">${steps}</div>
    </section>

    <section class="panel" style="animation-delay:140ms">
      <h2>Cómo probarlo</h2>
      ${tests}
    </section>

    ${tips}
    ${pager(m)}
  `,
  )
}

function renderUtilities(): string {
  const groups = utilities
    .map(
      (group) => `
      <section class="panel">
        <h2>${escapeHtml(group.title)}</h2>
        <div>
          ${group.items
            .map(
              (item) => `
            <div class="util-item">
              <span>${escapeHtml(item.label)}</span>
              ${codeBlock(item.command)}
            </div>`,
            )
            .join('')}
        </div>
      </section>`,
    )
    .join('')

  const codes = httpCheat
    .map(
      (row) => `
      <tr>
        <td><code>${escapeHtml(row.code)}</code></td>
        <td>${escapeHtml(row.meaning)}</td>
      </tr>`,
    )
    .join('')

  const trouble = troubleShoot
    .map(
      (item) => `
      <div class="trouble-item">
        <strong>${escapeHtml(item.problem)}</strong>
        <p>${escapeHtml(item.fix)}</p>
      </div>`,
    )
    .join('')

  return shell(
    'utilidades',
    `
    <header class="milestone-hero">
      <div class="eyebrow"><span class="pill">Hoja final</span></div>
      <h1>Utilidades</h1>
      <p class="goal">Comandos típicos, códigos HTTP y errores frecuentes. Úsala cuando te trabes en cualquier estación.</p>
    </header>

    <div class="util-grid">${groups}</div>

    <section class="panel">
      <h2>Códigos HTTP</h2>
      <table class="cheat-table">
        <thead><tr><th>Código</th><th>Significado</th></tr></thead>
        <tbody>${codes}</tbody>
      </table>
    </section>

    <section class="panel">
      <h2>Errores típicos</h2>
      <div class="trouble">${trouble}</div>
    </section>

    <nav class="pager">
      <a href="/hito/${milestones[milestones.length - 1].slug}">
        <span>Anterior</span>
        <strong>${escapeHtml(milestones[milestones.length - 1].title)}</strong>
      </a>
      <a class="next" href="/">
        <span>Inicio</span>
        <strong>Mapa de estaciones</strong>
      </a>
    </nav>
  `,
  )
}

function renderSupport(page: SupportPage): string {
  const steps = page.steps
    .map(
      (step) => `
      <article class="step">
        <h3 class="step-title">${escapeHtml(step.title)}</h3>
        ${step.body ? `<p>${escapeHtml(step.body)}</p>` : ''}
        ${step.code ? codeBlock(step.code) : ''}
      </article>`,
    )
    .join('')

  const done = page.doneWhen.map((item) => `<li>${escapeHtml(item)}</li>`).join('')

  const tips = page.tips?.length
    ? `<section class="panel" style="animation-delay:140ms">
        <h2>Si te trabas</h2>
        <ul class="tip-list">${page.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
      </section>`
    : ''

  const trouble = page.trouble?.length
    ? `<section class="panel" style="animation-delay:180ms">
        <h2>Errores típicos</h2>
        <div class="trouble">
          ${page.trouble
            .map(
              (item) => `
            <div class="trouble-item">
              <strong>${escapeHtml(item.problem)}</strong>
              <p>${escapeHtml(item.fix)}</p>
            </div>`,
            )
            .join('')}
        </div>
      </section>`
    : ''

  return shell(
    `apoyo-${page.slug}`,
    `
    <header class="milestone-hero">
      <div class="eyebrow">
        <span class="pill">Apoyo</span>
        <span>${escapeHtml(page.minutes)}</span>
      </div>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="goal">${escapeHtml(page.goal)}</p>
    </header>

    <section class="panel" style="animation-delay:60ms">
      <h2>Listo cuando…</h2>
      <ul class="check-list">${done}</ul>
    </section>

    <section class="panel" style="animation-delay:100ms">
      <h2>Pasos</h2>
      <div class="step-list">${steps}</div>
    </section>

    ${tips}
    ${trouble}

    <nav class="pager">
      <a href="/"><span>Inicio</span><strong>Mapa de estaciones</strong></a>
      <a class="next" href="/utilidades"><span>También</span><strong>Utilidades</strong></a>
    </nav>
  `,
  )
}

function parseRoute(
  pathname: string,
): { page: 'home' | 'utilidades' | 'hito' | 'apoyo'; slug?: string } {
  if (pathname === '/' || pathname === '') return { page: 'home' }
  if (pathname === '/utilidades') return { page: 'utilidades' }
  const apoyo = pathname.match(/^\/apoyo\/([^/]+)\/?$/)
  if (apoyo) return { page: 'apoyo', slug: apoyo[1] }
  const match = pathname.match(/^\/hito\/([^/]+)\/?$/)
  if (match) return { page: 'hito', slug: match[1] }
  return { page: 'home' }
}

function setTitle(title: string) {
  document.title = title
}

function bindUi() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.parentElement?.querySelector('code')?.textContent ?? ''
      try {
        await navigator.clipboard.writeText(code)
        btn.textContent = 'Copiado'
        setTimeout(() => {
          btn.textContent = 'Copiar'
        }, 1200)
      } catch {
        btn.textContent = 'Error'
      }
    })
  })

  document.querySelector('[data-open-nav]')?.addEventListener('click', () => {
    document.body.classList.add('nav-open')
  })

  document.querySelector('[data-close-nav]')?.addEventListener('click', () => {
    document.body.classList.remove('nav-open')
  })

  document.querySelectorAll('.sidebar a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open')
    })
  })
}

function render() {
  const route = parseRoute(window.location.pathname)
  document.body.classList.remove('nav-open')

  if (route.page === 'utilidades') {
    app.innerHTML = renderUtilities()
    setTitle('Utilidades · HITOS')
  } else if (route.page === 'apoyo' && route.slug) {
    const page = supportPages.find((item) => item.slug === route.slug)
    if (!page) {
      history.replaceState({}, '', '/')
      app.innerHTML = renderHome()
      setTitle('HITOS · Laravel API REST')
    } else {
      app.innerHTML = renderSupport(page)
      setTitle(`${page.title} · HITOS`)
    }
  } else if (route.page === 'hito' && route.slug) {
    const milestone = milestones.find((m) => m.slug === route.slug)
    if (!milestone) {
      history.replaceState({}, '', '/')
      app.innerHTML = renderHome()
      setTitle('HITOS · Laravel API REST')
    } else {
      app.innerHTML = renderMilestone(milestone)
      setTitle(`${milestone.number} ${milestone.title} · HITOS`)
    }
  } else {
    app.innerHTML = renderHome()
    setTitle('HITOS · Laravel API REST')
  }

  bindUi()
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a')
  if (!anchor) return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('mailto:')) return
  if (anchor.target === '_blank') return
  event.preventDefault()
  if (href !== window.location.pathname) {
    history.pushState({}, '', href)
  }
  render()
})

window.addEventListener('popstate', render)

render()
