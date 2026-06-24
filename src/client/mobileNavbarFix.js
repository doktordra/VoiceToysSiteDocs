function normalizeMobileNavbarPanel() {
  const isMobile = window.matchMedia('(max-width: 996px)').matches;
  if (!isMobile) return;

  const items = document.querySelector('.navbar-sidebar__items--show-secondary');
  if (!items) return;

  const backButton =
    items.querySelector('.navbar-sidebar__back') ||
    Array.from(items.querySelectorAll('button')).find((button) => {
      const text = (button.textContent || '').toLowerCase();
      const label =
        (button.getAttribute('aria-label') || button.getAttribute('title') || '').toLowerCase();
      return text.includes('назад') || text.includes('back') || label.includes('назад') || label.includes('back');
    });

  if (backButton instanceof HTMLElement) {
    backButton.click();
  }
}

function getBestFullscreenTarget() {
  const pdfTarget = document.querySelector('.plugin-id-bezbednost .pdfFullscreenTarget');
  if (pdfTarget instanceof HTMLElement) {
    return pdfTarget;
  }
  return document.documentElement;
}

async function toggleFullscreenMode() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  const target = getBestFullscreenTarget();
  await target.requestFullscreen();
}

function updateFullscreenButtonState() {
  const button = document.getElementById('vt-navbar-fullscreen-btn');
  if (!(button instanceof HTMLButtonElement)) return;

  if (document.fullscreenElement) {
    button.title = 'Izađi iz celog ekrana';
    button.setAttribute('aria-label', 'Exit fullscreen');
  } else {
    button.title = 'Prikaži preko celog ekrana';
    button.setAttribute('aria-label', 'Fullscreen');
  }
}

function createFullscreenButton() {
  const button = document.createElement('button');
  button.id = 'vt-navbar-fullscreen-btn';
  button.className = 'clean-btn navbar-fullscreen-btn';
  button.type = 'button';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line><polyline points="3 9 3 3 9 3"></polyline><polyline points="21 15 21 21 15 21"></polyline><line x1="3" y1="3" x2="10" y2="10"></line><line x1="21" y1="21" x2="14" y2="14"></line></svg>';
  return button;
}

function ensureNavbarFullscreenButton() {
  const navbarRight = document.querySelector('.navbar .navbar__items--right');
  if (!(navbarRight instanceof HTMLElement)) return;

  let button = document.getElementById('vt-navbar-fullscreen-btn');
  if (!(button instanceof HTMLButtonElement)) {
    button = createFullscreenButton();
  }

  const printButton = navbarRight.querySelector('.navbar-print-btn');
  if (printButton instanceof HTMLElement && printButton.parentElement === navbarRight) {
    if (button.parentElement !== navbarRight || printButton.nextElementSibling !== button) {
      printButton.insertAdjacentElement('afterend', button);
    }
  } else if (button.parentElement !== navbarRight) {
    navbarRight.appendChild(button);
  }

  if (button.dataset.bound !== 'true') {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      toggleFullscreenMode().catch(() => {
        // Browser may block fullscreen in some contexts.
      });
    });
    button.dataset.bound = 'true';
  }

  updateFullscreenButtonState();
}

function getCurrentLocale() {
  const { pathname } = window.location;
  if (pathname.startsWith('/en/')) return 'en';
  if (pathname === '/en') return 'en';
  if (pathname.startsWith('/de/')) return 'de';
  if (pathname === '/de') return 'de';
  return 'sr';
}

function getLocaleLabel(locale) {
  if (locale === 'en') return 'EN';
  if (locale === 'de') return 'DE';
  return 'SR';
}

function getLocaleTitle(locale) {
  if (locale === 'en') return 'English';
  if (locale === 'de') return 'Deutsch';
  return 'Srpski';
}

function detectLocaleFromLabel(value) {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'en' || normalized.includes('english')) return 'en';
  if (normalized === 'de' || normalized.includes('deutsch') || normalized.includes('german')) return 'de';
  if (normalized === 'sr' || normalized.includes('srpski') || normalized.includes('serbian')) return 'sr';
  return null;
}

function getExistingLocaleLinks(sidebar) {
  const roots = [document.querySelector('.navbar'), sidebar].filter(Boolean);
  const links = {};

  for (const root of roots) {
    const anchors = root.querySelectorAll('a[href]');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (!href) continue;

      const locale =
        detectLocaleFromLabel(anchor.textContent) ||
        detectLocaleFromLabel(anchor.getAttribute('title')) ||
        detectLocaleFromLabel(anchor.getAttribute('aria-label'));

      if (!locale || links[locale]) continue;
      links[locale] = href;
    }
  }

  return links;
}

function buildLocalePath(targetLocale) {
  const { pathname, search, hash } = window.location;
  const currentLocale = getCurrentLocale();
  let pathWithoutLocale = pathname;

  if (currentLocale === 'en' && pathWithoutLocale.startsWith('/en/')) {
    pathWithoutLocale = pathWithoutLocale.slice(3);
  } else if (currentLocale === 'de' && pathWithoutLocale.startsWith('/de/')) {
    pathWithoutLocale = pathWithoutLocale.slice(3);
  }

  if (!pathWithoutLocale.startsWith('/')) {
    pathWithoutLocale = `/${pathWithoutLocale}`;
  }

  const localizedPath =
    targetLocale === 'sr' ? pathWithoutLocale : `/${targetLocale}${pathWithoutLocale}`;

  return `${localizedPath}${search}${hash}`;
}

function ensureLanguageSwitcher(controlsRow, sidebar) {
  let switcher = controlsRow.querySelector('.mobile-language-switcher');
  if (!(switcher instanceof HTMLElement)) {
    switcher = document.createElement('div');
    switcher.className = 'mobile-language-switcher';
    controlsRow.appendChild(switcher);
  }

  let trigger = switcher.querySelector('.mobile-language-trigger');
  if (!(trigger instanceof HTMLButtonElement)) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'mobile-language-trigger clean-btn';
    switcher.appendChild(trigger);
  }

  let popup = switcher.querySelector('.mobile-language-popup');
  if (!(popup instanceof HTMLElement)) {
    popup = document.createElement('div');
    popup.className = 'mobile-language-popup';
    switcher.appendChild(popup);
  }

  const currentLocale = getCurrentLocale();
  const existingLocaleLinks = getExistingLocaleLinks(sidebar);
  trigger.replaceChildren();
  const icon = document.createElement('span');
  icon.className = 'mobile-language-icon';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'mobile-language-label';
  label.textContent = getLocaleLabel(currentLocale);
  trigger.title = getLocaleTitle(currentLocale);
  trigger.append(icon, label);

  popup.replaceChildren();
  ['sr', 'en', 'de'].forEach((locale) => {
    const link = document.createElement('a');
    link.href = existingLocaleLinks[locale] || buildLocalePath(locale);
    link.textContent = getLocaleLabel(locale);
    link.title = getLocaleTitle(locale);
    link.className = 'mobile-language-option';
    if (locale === currentLocale) {
      link.setAttribute('aria-current', 'true');
    }
    popup.appendChild(link);
  });

  if (!switcher.dataset.bound) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      switcher.classList.toggle('is-open');
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!switcher.contains(target)) {
        switcher.classList.remove('is-open');
      }
    });

    switcher.dataset.bound = 'true';
  }
}

function moveMobileControlsBelowLogo() {
  const isMobile = window.matchMedia('(max-width: 996px)').matches;
  if (!isMobile) return;

  const sidebar = document.querySelector('.navbar-sidebar');
  const brand = sidebar?.querySelector('.navbar-sidebar__brand');
  if (!(sidebar instanceof HTMLElement) || !(brand instanceof HTMLElement)) return;

  let controlsRow = sidebar.querySelector('.mobile-sidebar-controls');
  if (!(controlsRow instanceof HTMLElement)) {
    controlsRow = document.createElement('div');
    controlsRow.className = 'mobile-sidebar-controls';
    brand.insertAdjacentElement('afterend', controlsRow);
  }

  const darkModeToggle =
    brand.querySelector('.colorModeToggle_DEke, [class*="colorModeToggle"]') ||
    brand.querySelector(
      [
        'button[aria-label*="dark and light mode" i]',
        'button[title*="dark and light mode" i]',
        'button[aria-label*="tamnog i svetlog moda" i]',
        'button[title*="tamnog i svetlog moda" i]',
      ].join(', '),
    )?.closest('div');

  if (darkModeToggle instanceof HTMLElement && darkModeToggle.parentElement !== controlsRow) {
    controlsRow.appendChild(darkModeToggle);
  }

  const fullscreenButton = document.getElementById('vt-navbar-fullscreen-btn');
  if (fullscreenButton instanceof HTMLElement && fullscreenButton.parentElement !== controlsRow) {
    controlsRow.appendChild(fullscreenButton);
  }

  const languageListItem = Array.from(sidebar.querySelectorAll('li')).find((li) => {
    const text = (li.textContent || '').toLowerCase();
    return (
      text.includes('languages') ||
      text.includes('language') ||
      text.includes('jezik') ||
      text.includes('језик') ||
      text.includes('sprache')
    );
  });

  if (languageListItem instanceof HTMLElement) {
    languageListItem.remove();
  }

  ensureLanguageSwitcher(controlsRow, sidebar);
}

function normalizeMobileNavbarPanelWithRetry(retries = 4) {
  // normalizeMobileNavbarPanel();
  ensureNavbarFullscreenButton();
  moveMobileControlsBelowLogo();
  if (retries <= 0) return;
  setTimeout(() => normalizeMobileNavbarPanelWithRetry(retries - 1), 80);
}

function initMobileNavbarFix() {
  const nav = document.querySelector('.navbar');
  if (!nav) {
    setTimeout(initMobileNavbarFix, 120);
    return;
  }

  let normalizeTimeout = null;
  const scheduleNormalize = (delay = 0) => {
    if (normalizeTimeout) {
      clearTimeout(normalizeTimeout);
    }
    normalizeTimeout = setTimeout(() => {
      normalizeMobileNavbarPanelWithRetry();
    }, delay);
  };

  const observer = new MutationObserver(() => {
    // Wait one tick so Docusaurus finishes sidebar panel transition state updates.
    scheduleNormalize(0);
  });

  observer.observe(nav, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const toggle = target.closest('.navbar__toggle');
    if (!toggle) return;
    scheduleNormalize(0);
  });

  // Re-attach controls after in-app route changes and dynamic page transitions.
  const appRoot = document.querySelector('#__docusaurus') || document.body;
  const routeObserver = new MutationObserver(() => {
    scheduleNormalize(30);
  });
  routeObserver.observe(appRoot, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!link) return;
    scheduleNormalize(120);
  });

  window.addEventListener('resize', () => {
    scheduleNormalize(0);
  });

  window.addEventListener('popstate', () => {
    scheduleNormalize(30);
  });

  // Defensive pass for first sidebar open after hydration.
  scheduleNormalize(300);

  document.addEventListener('fullscreenchange', updateFullscreenButtonState);
}


function isTypingTarget(target) {
  if (!(target instanceof Element)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  if (target.getAttribute('contenteditable') === 'true') return true;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function handleArrowPagination(event) {
  if (event.defaultPrevented) return;
  if (event.repeat) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  if (isTypingTarget(event.target)) return;

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const topLevelPageLinks = Array.from(
    document.querySelectorAll('.theme-doc-sidebar-menu > li > a.menu__link[href]'),
  )
    .map((link) => {
      if (!(link instanceof HTMLAnchorElement)) return null;
      const url = new URL(link.href, window.location.origin);
      if (url.hash) return null;
      if (!url.pathname.includes('/uputstvo')) return null;
      return {
        href: `${url.pathname}${url.search}`,
        path: url.pathname.replace(/\/$/, '') || '/',
      };
    })
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex((x) => x.path === item.path) === index);

  const currentIndex = topLevelPageLinks.findIndex((item) => item.path === currentPath);
  const targetIndex =
    event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;

  if (currentIndex >= 0 && targetIndex >= 0 && targetIndex < topLevelPageLinks.length) {
    event.preventDefault();
    window.location.assign(topLevelPageLinks[targetIndex].href);
    return;
  }

  // Fallback when sidebar is unavailable (e.g., non-doc pages).
  const selector = event.key === 'ArrowRight' ? '.pagination-nav__link--next' : '.pagination-nav__link--prev';
  const fallbackLink = document.querySelector(selector);
  if (fallbackLink instanceof HTMLAnchorElement) {
    event.preventDefault();
    fallbackLink.click();
  }
}

function initArrowPaginationNavigation() {
  if (window.__arrowPaginationNavigationLoaded) return;
  window.__arrowPaginationNavigationLoaded = true;
  document.addEventListener('keydown', handleArrowPagination);
}

if (typeof window !== 'undefined') {
  window.__mobileNavbarFixLoaded = true;
  window.__vtToggleFullscreen = toggleFullscreenMode;
  initArrowPaginationNavigation();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavbarFix, {
      once: true,
    });
  } else {
    initMobileNavbarFix();
  }
}
