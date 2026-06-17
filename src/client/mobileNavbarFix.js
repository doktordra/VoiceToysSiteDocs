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

function ensureLanguageSwitcher(controlsRow) {
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
    link.href = buildLocalePath(locale);
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

  const darkModeBtn = brand.querySelector(
    'button[aria-label*="dark and light mode"], button[title*="dark and light mode"]',
  );
  if (darkModeBtn instanceof HTMLElement && darkModeBtn.parentElement !== controlsRow) {
    controlsRow.appendChild(darkModeBtn);
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

  ensureLanguageSwitcher(controlsRow);
}

function normalizeMobileNavbarPanelWithRetry(retries = 4) {
  normalizeMobileNavbarPanel();
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

  const observer = new MutationObserver(() => {
    // Wait one tick so Docusaurus finishes sidebar panel transition state updates.
    setTimeout(() => normalizeMobileNavbarPanelWithRetry(), 0);
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
    setTimeout(() => normalizeMobileNavbarPanelWithRetry(), 0);
  });

  // Defensive pass for first sidebar open after hydration.
  setTimeout(() => normalizeMobileNavbarPanelWithRetry(), 300);
}

if (typeof window !== 'undefined') {
  window.__mobileNavbarFixLoaded = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavbarFix, {
      once: true,
    });
  } else {
    initMobileNavbarFix();
  }
}
