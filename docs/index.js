// GLOBAL WEBSITE DATA ENGINE
let cmsData = null;
let currentLanguage = 'de'; // Swiss band defaults to German
let activeMobileTab = 'home';
let currentSlideIndex = 0;

// FALLBACK DEFAULT DATA (if content_data.json is missing or offline)
const fallbackDefaultData = {
  "youtubeVideo": "https://www.srf.ch/play/tv/schweiz-aktuell/video/rocknroll-am-essc---schafft-es-special-guest?urn=urn:srf:video:f061f122-6b3b-483b-9a86-d2426998b3c9",
  "socials": {
    "instagram": "https://www.instagram.com/fraeuleinluisee/",
    "spotify": "https://open.spotify.com/artist/4JVmmu4WsDKd7tob8aZhCK",
    "youtube": "https://www.youtube.com/c/SRFUnterhaltung"
  },
  "biography": {
    "de": "Wir sind Salome (Gitarre), Atlas (Gesang), Yannick (Gitarre), Leon (Drums) und Samuel (Bass) - zusammen Special Guest. Wir haben grosse Leidenschaft für Rockmusik und wollen gute Vibes auf die Bühne bringen.\n\nAuch ohne eigene Releases durften wir bereits viele Erfolge feiern und beim ESSC wertvolle Erfahrungen vor Jury und Publikum sammeln. Der Gewinn bedeutet uns viel und gibt uns Motivation und Confidence für die Zukunft.\n\nAls Nächstes freuen wir uns auf unsere Auftritte am 13. Juni im Treibhaus und am 27. Juni am Stadtfest Luzern.",
    "en": "We are Salome (guitar), Atlas (vocals), Yannick (guitar), Leon (drums), and Samuel (bass) - together we are Special Guest. We share a great passion for rock music and want to bring good vibes to the stage.\n\nEven without our own releases, we have already celebrated many achievements and gathered valuable experience in front of the jury and audience at the ESSC. Winning means a lot to us and gives us motivation and confidence for the future.\n\nNext up, we are looking forward to our performances on June 13th at Treibhaus and on June 27th at Stadtfest Luzern."
  },
  "tourDates": [
    { "date": "2026-06-13", "venue": "Treibhaus, Luzern", "link": "https://www.treibhausluzern.ch" },
    { "date": "2026-06-27", "venue": "Stadtfest Luzern", "link": "https://stadtfestluzern.ch" }
  ],
  "carouselImages": [
    "assets/foto_collage.png",
    "assets/gallery2.jpg",
    "assets/gallery3.jpg"
  ]
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  loadWebsiteData();
  
  // Set up clocks
  updateClock();
  setInterval(updateClock, 60000);
  
  // Setup Scroll spy
  initScrollSpy();
});

// DATE HELPER FUNCTIONS
function formatGigDate(dateStr, lang) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  if (lang === 'de') {
    const monthsDe = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return `${date.getDate()}. ${monthsDe[date.getMonth()]} ${date.getFullYear()}`;
  } else {
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthsEn[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

function isShowPast(dateStr) {
  const showDate = new Date(dateStr);
  showDate.setHours(0,0,0,0);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // difference in milliseconds converted to calendar days
  const diffTime = today - showDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Hides event 1 day after the show date has fully elapsed
  // e.g. June 13 gig is visible on June 14, but hidden starting June 15 (diffDays = 2)
  return diffDays > 1;
}

// LOAD DATA PROCESS
async function loadWebsiteData() {
  // Load from local JSON file
  try {
    const res = await fetch('content_data.json');
    if (res.ok) {
      cmsData = await res.json();
    } else {
      throw new Error("JSON file response failed");
    }
  } catch(err) {
    console.warn("Could not load content_data.json, using static fallback", err);
    cmsData = fallbackDefaultData;
  }

  renderPageDynamicElements();
}

// RENDER ENGINE
function renderPageDynamicElements() {
  if (!cmsData) return;

  // Set Language state
  setLanguage(currentLanguage);

  // 1. RENDER BIOGRAPHY (DE & EN combined)
  const bioContainer = document.getElementById('dynamic-bio-text');
  if (bioContainer) {
    const activeText = currentLanguage === 'de' ? cmsData.biography.de : cmsData.biography.en;
    // Format paragraph breaks
    const formattedBio = activeText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    bioContainer.innerHTML = formattedBio;
  }

  // 2. RENDER TOUR GIGS
  const tourListContainer = document.getElementById('dynamic-tour-list');
  if (tourListContainer) {
    tourListContainer.innerHTML = ''; // clear
    
    // Filter out past events (gigs show up to 1 day after show date has passed)
    const upcomingGigs = cmsData.tourDates.filter(gig => !isShowPast(gig.date));
    
    // Sort upcoming gigs chronologically ascending (soonest show at the top)
    upcomingGigs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Render Gigs list from array
    upcomingGigs.forEach(gig => {
      const gigRow = document.createElement('div');
      gigRow.className = 'tour-item';
      
      const btnText = currentLanguage === 'de' ? 'Zum Event' : 'Tickets';
      const cleanLink = gig.link.startsWith('http') ? gig.link : `https://${gig.link}`;
      
      gigRow.innerHTML = `
        <div class="tour-info">
          <span class="tour-date">${formatGigDate(gig.date, currentLanguage)}</span>
          <span class="tour-venue">${gig.venue}</span>
        </div>
        <a href="${cleanLink}" target="_blank" rel="noopener" class="tour-action-btn">${btnText}</a>
      `;
      tourListContainer.appendChild(gigRow);
    });

    // Add static Booking CTA at bottom of gigs
    const ctaRow = document.createElement('div');
    ctaRow.className = 'tour-item booking-row';
    const ctaDateText = currentLanguage === 'de' ? 'Dein Event hier...' : 'Your Event Here...';
    const ctaVenueText = currentLanguage === 'de' ? 'Buche Special Guest' : 'Book Special Guest';
    
    ctaRow.innerHTML = `
      <div class="tour-info">
        <span class="tour-date">${ctaDateText}</span>
        <span class="tour-venue">${ctaVenueText}</span>
      </div>
      <button onclick="navigateToTab('booking')" class="tour-action-btn booking-btn">Book Us!</button>
    `;
    tourListContainer.appendChild(ctaRow);
  }

  // 3. RENDER CAROUSEL IMAGES
  const carouselTrack = document.getElementById('dynamic-carousel-track');
  const dotsContainer = document.getElementById('dynamic-slider-dots');
  if (carouselTrack && dotsContainer) {
    carouselTrack.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    cmsData.carouselImages.forEach((imgSrc, idx) => {
      // Add slide item
      const slide = document.createElement('div');
      slide.className = 'carousel-slide-item';
      slide.innerHTML = `<img src="${imgSrc}" class="carousel-slide-img" alt="Special Guest Concert">`;
      carouselTrack.appendChild(slide);

      // Add dot indicator
      const dot = document.createElement('span');
      dot.className = `dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('onclick', `scrollCollageTo(${idx})`);
      dotsContainer.appendChild(dot);
    });
    
    // Reinitialize scroll listener on Mobile view slider container
    const scrollContainer = document.getElementById('collage-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', syncMobileCarouselDots);
    }
  }

  // 4. RENDER MEDIA & SOCIAL LINK HREF ATTRIBUTES
  const ytPlayLink = document.getElementById('youtube-play-link');
  const ytChanLink = document.getElementById('youtube-channel-link');
  const cardThumb = document.getElementById('video-card-thumbnail');
  
  if (ytPlayLink) ytPlayLink.setAttribute('href', cmsData.youtubeVideo);
  if (ytChanLink) ytChanLink.setAttribute('href', cmsData.socials.youtube);
  if (cardThumb && cmsData.carouselImages.length > 1) {
    // Populate background from second image in CMS
    cardThumb.style.backgroundImage = `url('${cmsData.carouselImages[1]}')`;
  }

  // Update Social Icons Grid
  const igLink = document.getElementById('social-link-instagram');
  const spLink = document.getElementById('social-link-spotify');
  const ytLink = document.getElementById('social-link-youtube');
  
  if (igLink) igLink.setAttribute('href', cmsData.socials.instagram);
  if (spLink) spLink.setAttribute('href', cmsData.socials.spotify);
  if (ytLink) ytLink.setAttribute('href', cmsData.socials.youtube);

  // Update Footer Links
  const footIg = document.getElementById('footer-link-instagram');
  const footSp = document.getElementById('footer-link-spotify');
  const footYt = document.getElementById('footer-link-youtube');
  
  if (footIg) footIg.setAttribute('href', cmsData.socials.instagram);
  if (footSp) footSp.setAttribute('href', cmsData.socials.spotify);
  if (footYt) footYt.setAttribute('href', cmsData.socials.youtube);
}

// LANGUAGE SWAP LOGIC
function setLanguage(lang) {
  currentLanguage = lang;
  document.getElementById('html').setAttribute('lang', lang);
  
  // Header Switch toggles
  const btnDe = document.getElementById('lang-btn-de');
  const btnEn = document.getElementById('lang-btn-en');
  if (btnDe && btnEn) {
    if (lang === 'de') {
      btnDe.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnDe.classList.remove('active');
    }
  }

  // Mobile Switch toggles
  const mobToggle = document.getElementById('mobile-lang-toggle');
  if (mobToggle) {
    mobToggle.textContent = lang === 'de' ? 'EN' : 'DE';
  }

  // Force re-renders of static elements containing text variables
  const bioContainer = document.getElementById('dynamic-bio-text');
  if (bioContainer && cmsData) {
    const activeText = lang === 'de' ? cmsData.biography.de : cmsData.biography.en;
    bioContainer.innerHTML = activeText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }
}

// TOGGLE LANGUAGE MOBILE
function toggleLanguage() {
  const nextLang = currentLanguage === 'de' ? 'en' : 'de';
  setLanguage(nextLang);
}

// NAVIGATION STATE SYSTEM
function navigateToTab(tabId) {
  // Both mobile and desktop now scroll to the section
  const section = document.getElementById(tabId);
  if (section) {
    // On mobile, account for the fixed bottom nav bar
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 0 : 80; // desktop has header offset
    const topPos = section.offsetTop - offset;
    
    window.scrollTo({
      top: topPos,
      behavior: 'smooth'
    });
    
    // Update active nav button on mobile
    if (isMobile) {
      updateMobileNavActive(tabId);
    }
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerHeight = 80;
    const topOffset = section.offsetTop - headerHeight;
    window.scrollTo({
      top: topOffset,
      behavior: 'smooth'
    });
  }
}

// Update mobile bottom nav active state
function updateMobileNavActive(tabId) {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach(btn => {
    const btnTabId = btn.getAttribute('id').replace('nav-btn-', '');
    const targetId = btnTabId === 'book' ? 'booking' : btnTabId;
    
    if (targetId === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// SCROLL SPY (Desktop header + Mobile bottom nav)
function initScrollSpy() {
  const sections = document.querySelectorAll('.app-section');
  const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
  
  window.addEventListener('scroll', () => {
    let currentSectionId = 'home';
    const scrollPosition = window.scrollY + 150; // offset for sticky header
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    // Update desktop nav
    if (window.innerWidth >= 768) {
      desktopNavLinks.forEach(link => {
        const targetHref = link.getAttribute('href').substring(1);
        if (targetHref === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
    
    // Update mobile bottom nav
    if (window.innerWidth < 768) {
      updateMobileNavActive(currentSectionId);
    }
  });
}

// MOBILE COLLAGE CAROUSEL SYNC
function syncMobileCarouselDots() {
  if (window.innerWidth < 768) {
    const scrollContainer = document.getElementById('collage-scroll');
    const dots = document.querySelectorAll('#dynamic-slider-dots .dot');
    
    if (scrollContainer && dots.length > 0) {
      const scrollLeft = scrollContainer.scrollLeft;
      const index = Math.min(dots.length - 1, Math.max(0, Math.round(scrollLeft / 336))); // 320 card + 16 gap
      
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }
}

// Dot selector click function
function scrollCollageTo(index) {
  const scrollContainer = document.getElementById('collage-scroll');
  if (scrollContainer) {
    const slideOffset = index * 336; // 320 width + 16 gap
    scrollContainer.scrollTo({
      left: slideOffset,
      behavior: 'smooth'
    });
  }
}

// Desktop Carousel Arrow buttons slider
function slideCarousel(direction) {
  const scrollContainer = document.getElementById('collage-scroll');
  if (scrollContainer && cmsData) {
    const trackWidth = scrollContainer.clientWidth;
    const scrollLimit = scrollContainer.scrollWidth - trackWidth;
    
    let newScrollLeft = scrollContainer.scrollLeft + (direction * 336);
    if (newScrollLeft < 0) newScrollLeft = 0;
    if (newScrollLeft > scrollLimit) newScrollLeft = scrollLimit;
    
    scrollContainer.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }
}

// STATUS BAR CLOCK
function updateClock() {
  const clockEl = document.getElementById('status-time');
  if (clockEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;
  }
}
