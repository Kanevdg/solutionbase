const menuButton = document.getElementById("hamburger-menu");
const navMenu = document.getElementById("nav-menu");
const siteHeader = document.querySelector("header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (siteHeader) {
	const setHeaderTheme = () => {
		const probeY = Math.min(siteHeader.offsetHeight + 8, window.innerHeight - 1);
		const probeX = Math.floor(window.innerWidth / 2);
		const elementAtProbe = document.elementFromPoint(probeX, probeY);
		const themeHost = elementAtProbe?.closest("[data-header-theme]");
		const theme = themeHost?.getAttribute("data-header-theme") || "dark";

		siteHeader.classList.toggle("theme-light", theme === "light");
		siteHeader.classList.toggle("theme-dark", theme !== "light");
	};

	const setHeaderScrollState = () => {
		siteHeader.classList.toggle("scrolled", window.scrollY > 8);
		setHeaderTheme();
	};

	setHeaderScrollState();
	window.addEventListener("scroll", setHeaderScrollState, { passive: true });
	window.addEventListener("resize", setHeaderScrollState);
}

const heroGlow = document.querySelector("[data-hero-glow]");

if (heroGlow) {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;

	if (!reducedMotion && finePointer) {
		const updateGlow = (event) => {
			const rect = heroGlow.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				return;
			}

			const x = ((event.clientX - rect.left) / rect.width) * 100;
			const y = ((event.clientY - rect.top) / rect.height) * 100;
			const clampedX = Math.max(0, Math.min(100, x));
			const clampedY = Math.max(0, Math.min(100, y));

			heroGlow.style.setProperty("--hero-glow-x", `${clampedX}%`);
			heroGlow.style.setProperty("--hero-glow-y", `${clampedY}%`);
		};

		heroGlow.addEventListener("pointermove", updateGlow);
		heroGlow.addEventListener("pointerleave", () => {
			heroGlow.style.setProperty("--hero-glow-x", "50%");
			heroGlow.style.setProperty("--hero-glow-y", "28%");
		});
	}
}

const sectionsGlow = document.querySelectorAll("[data-sections-glow]");

sectionsGlow.forEach((glowElement) => {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const finePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;

	if (!reducedMotion && finePointer) {
		const updateGlow = (event) => {
			const rect = glowElement.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				return;
			}

			const x = ((event.clientX - rect.left) / rect.width) * 100;
			const y = ((event.clientY - rect.top) / rect.height) * 100;
			const clampedX = Math.max(0, Math.min(100, x));
			const clampedY = Math.max(0, Math.min(100, y));

			glowElement.style.setProperty("--sections-glow-x", `${clampedX}%`);
			glowElement.style.setProperty("--sections-glow-y", `${clampedY}%`);
			glowElement.style.setProperty("--sections-glow-opacity", "0.65");
		};

		const leaveGlow = () => {
			glowElement.style.setProperty("--sections-glow-opacity", "0");
		};

		glowElement.addEventListener("pointerenter", () => {
			glowElement.style.setProperty("--sections-glow-opacity", "0.65");
		});
		glowElement.addEventListener("pointermove", updateGlow);
		glowElement.addEventListener("pointerleave", leaveGlow);
	}
});

const staggerGroups = document.querySelectorAll("[data-stagger]");

staggerGroups.forEach((group) => {
	Array.from(group.children).forEach((item, itemIndex) => {
		item.style.setProperty("--stagger-index", String(itemIndex));
	});
});

const portfolioSliders = document.querySelectorAll("[data-slider]");

portfolioSliders.forEach((slider) => {
	const track = slider.querySelector("[data-slider-track]");
	const slides = track ? Array.from(track.children) : [];
	const prevButton = slider.querySelector("[data-slider-prev]");
	const nextButton = slider.querySelector("[data-slider-next]");
	const dotsContainer = slider.querySelector("[data-slider-dots]");

	if (!track || slides.length === 0) {
		return;
	}

	let index = 0;
	let autoTimer = null;
	let pauseRequests = 0;
	const AUTOPLAY_DELAY = 5000;

	const goTo = (nextIndex) => {
		const slideCount = slides.length;
		index = (nextIndex + slideCount) % slideCount;

		slides.forEach((slide, slideIndex) => {
			slide.classList.toggle("is-active", slideIndex === index);
		});

		track.style.transform = `translateX(-${index * 100}%)`;

		if (dotsContainer) {
			dotsContainer.querySelectorAll(".slider-dot").forEach((dot, dotIndex) => {
				dot.classList.toggle("is-active", dotIndex === index);
			});
		}
	};

	if (dotsContainer) {
		slides.forEach((_, dotIndex) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "slider-dot";
			dot.setAttribute("aria-label", `Ga naar slide ${dotIndex + 1}`);
			dot.addEventListener("click", () => {
				goTo(dotIndex);
				resetAutoplay();
			});
			dotsContainer.appendChild(dot);
		});
	}

	if (prevButton) {
		prevButton.addEventListener("click", () => {
			goTo(index - 1);
			resetAutoplay();
		});
	}

	if (nextButton) {
		nextButton.addEventListener("click", () => {
			goTo(index + 1);
			resetAutoplay();
		});
	}

	const startAutoplay = () => {
		if (autoTimer || pauseRequests > 0) {
			return;
		}

		autoTimer = window.setInterval(() => {
			goTo(index + 1);
		}, AUTOPLAY_DELAY);
	};

	const stopAutoplay = () => {
		if (autoTimer) {
			window.clearInterval(autoTimer);
			autoTimer = null;
		}
	};

	function resetAutoplay() {
		stopAutoplay();
		startAutoplay();
	}

	const requestAutoplayPause = () => {
		pauseRequests += 1;
		stopAutoplay();
	};

	const releaseAutoplayPause = () => {
		pauseRequests = Math.max(0, pauseRequests - 1);
		if (pauseRequests === 0) {
			startAutoplay();
		}
	};

	[prevButton, nextButton].forEach((button) => {
		if (!button) {
			return;
		}

		button.addEventListener("mouseenter", requestAutoplayPause);
		button.addEventListener("mouseleave", releaseAutoplayPause);
		button.addEventListener("focus", requestAutoplayPause);
		button.addEventListener("blur", releaseAutoplayPause);
	});

	goTo(0);
	startAutoplay();
});

if (menuButton && navMenu) {
	const closeMenu = () => {
		menuButton.classList.remove("is-open");
		navMenu.classList.remove("is-open");
		document.body.classList.remove("menu-open");
		menuButton.setAttribute("aria-expanded", "false");
	};

	const openMenu = () => {
		menuButton.classList.add("is-open");
		navMenu.classList.add("is-open");
		document.body.classList.add("menu-open");
		menuButton.setAttribute("aria-expanded", "true");
	};

	menuButton.addEventListener("click", () => {
		const isOpen = menuButton.getAttribute("aria-expanded") === "true";
		if (isOpen) {
			closeMenu();
			return;
		}
		openMenu();
	});

	navMenu.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", closeMenu);
	});

	window.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			closeMenu();
		}
	});

	window.addEventListener("resize", () => {
		if (window.innerWidth > 768) {
			closeMenu();
		}
	});
}

const revealBlocks = document.querySelectorAll(".reveal-block");

if (revealBlocks.length > 0) {
	if (prefersReducedMotion) {
		revealBlocks.forEach((block) => block.classList.add("is-visible"));
	} else {
		document.body.classList.add("reveal-ready");

		const revealObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						return;
					}

					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				});
			},
			{
				threshold: 0.14,
				rootMargin: "0px 0px -4% 0px"
			}
		);

		revealBlocks.forEach((block) => revealObserver.observe(block));
	}
}

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress-bar";
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
	const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrolled = (window.scrollY / documentHeight) * 100;
	progressBar.style.width = scrolled + "%";
});

// ===== MAGNETIC BUTTONS =====
const magneticBtns = document.querySelectorAll(".magnetic-btn");
if (!prefersReducedMotion) {
	magneticBtns.forEach((btn) => {
		btn.addEventListener("mousemove", function(e) {
			const rect = this.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			const distance = Math.sqrt(x * x + y * y);
			
			if (distance < 100) {
				this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
			}
		});

		btn.addEventListener("mouseleave", function() {
			this.style.transform = "translate(0, 0)";
		});
	});
}

// ===== COUNTER ANIMATIONS =====
function animateCounter(element, target, duration = 2000) {
	let current = 0;
	const increment = target / (duration / 16);
	const counter = setInterval(() => {
		current += increment;
		if (current >= target) {
			current = target;
			clearInterval(counter);
		}
		element.textContent = Math.floor(current);
	}, 16);
}

const counters = document.querySelectorAll(".counter");
if (counters.length > 0) {
	const counterObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting && !entry.target.dataset.animated) {
				const target = parseInt(entry.target.dataset.countTo) || 0;
				animateCounter(entry.target, target);
				entry.target.dataset.animated = "true";
				counterObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.5 });

	counters.forEach((counter) => counterObserver.observe(counter));
}

// ===== BEFORE/AFTER SLIDER =====
const beforeAfterContainers = document.querySelectorAll(".before-after-container");
beforeAfterContainers.forEach((container) => {
	const resizer = container.querySelector(".before-after-resize");
	const handle = container.querySelector(".before-after-handle");
	if (!resizer || !handle) return;

	let isActive = false;

	const updatePosition = (e) => {
		if (!isActive) return;
		const rect = container.getBoundingClientRect();
		let x = e.clientX - rect.left;
		if (e.touches) x = e.touches[0].clientX - rect.left;

		x = Math.max(0, Math.min(x, rect.width));
		const percentage = (x / rect.width) * 100;

		resizer.style.width = percentage + "%";
		handle.style.left = percentage + "%";
	};

	handle.addEventListener("mousedown", () => { isActive = true; });
	handle.addEventListener("touchstart", () => { isActive = true; });
	document.addEventListener("mouseup", () => { isActive = false; });
	document.addEventListener("touchend", () => { isActive = false; });
	document.addEventListener("mousemove", updatePosition);
	document.addEventListener("touchmove", updatePosition);
});

// ===== TESTIMONIAL CAROUSEL =====
const testimonialSliders = document.querySelectorAll("[data-testimonial-slider]");
testimonialSliders.forEach((slider) => {
	const cards = slider.querySelectorAll(".testimonial-card");
	const prevBtn = slider.querySelector("[data-testimonial-prev]");
	const nextBtn = slider.querySelector("[data-testimonial-next]");
	const dotsContainer = slider.querySelector("[data-testimonial-dots]");

	if (cards.length === 0) return;

	let index = 0;

	const goTo = (newIndex) => {
		const cardCount = cards.length;
		index = (newIndex + cardCount) % cardCount;

		cards.forEach((card, i) => {
			card.classList.toggle("is-active", i === index);
		});

		if (dotsContainer) {
			dotsContainer.querySelectorAll("button").forEach((dot, i) => {
				dot.classList.toggle("is-active", i === index);
			});
		}
	};

	if (dotsContainer) {
		cards.forEach((_, i) => {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "w-3 h-3 rounded-full border border-slate-300 transition";
			dot.addEventListener("click", () => goTo(i));
			if (i === 0) dot.classList.add("is-active");
			dotsContainer.appendChild(dot);
		});
	}

	if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
	if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));

	goTo(0);
});

// ===== SKILL FILTER =====
const skillTags = document.querySelectorAll(".skill-tag");
const portfolioItems = document.querySelectorAll("[data-skills]");

skillTags.forEach((tag) => {
	tag.addEventListener("click", function() {
		const skill = this.dataset.skill;
		const isActive = this.classList.toggle("is-active");

		const activeTags = Array.from(skillTags).filter((t) => t.classList.contains("is-active")).map((t) => t.dataset.skill);

		portfolioItems.forEach((item) => {
			const itemSkills = item.dataset.skills.split(",").map((s) => s.trim());
			const matches = activeTags.length === 0 || activeTags.some((skill) => itemSkills.includes(skill));
			item.style.display = matches ? "block" : "none";
			if (matches) {
				setTimeout(() => item.style.opacity = "1", 10);
				item.style.transition = "opacity 0.3s ease";
			} else {
				item.style.opacity = "0";
			}
		});
	});
});

// ===== STAGGERED TEXT REVEAL =====
const heroTexts = document.querySelectorAll(".hero-text-reveal");
heroTexts.forEach((textEl) => {
	const text = textEl.textContent;
	const words = text.split(" ");
	textEl.innerHTML = words.map((word, i) => {
		const delay = i * 0.1;
		return `<span style="animation-delay: ${delay}s">${word}</span>`;
	}).join(" ");
});

// ===== TIMELINE REVEALS =====
const timelineItems = document.querySelectorAll(".timeline-item");
if (timelineItems.length > 0) {
	const timelineObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				timelineObserver.unobserve(entry.target);
			}
		});
	}, { threshold: 0.5 });

	timelineItems.forEach((item) => timelineObserver.observe(item));
}
