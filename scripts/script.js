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

const isLg = window.matchMedia("(min-width: 1024px)").matches;

if (isLg && !prefersReducedMotion) {
	document.querySelectorAll("[data-word-reveal]").forEach((el) => {
		const words = el.textContent.trim().split(/\s+/);
		el.innerHTML = words
			.map((word, i) => `<span class="word-reveal-word" style="--word-index-delay:${i * 55}ms">${word}</span>`)
			.join(" ");

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				el.querySelectorAll(".word-reveal-word").forEach((span) => {
					span.classList.add("is-visible");
				});
			});
		});
	});
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
	const submitButton = contactForm.querySelector("[data-submit-button]");
	const feedbackEl = contactForm.querySelector("[data-form-feedback]");
	const defaultButtonLabel = submitButton ? submitButton.textContent.trim() : "Verstuur";

	const setFeedback = (state, message) => {
		if (!feedbackEl) {
			return;
		}

		feedbackEl.classList.remove("is-success", "is-error", "is-loading");

		if (state) {
			feedbackEl.classList.add(`is-${state}`);
		}

		feedbackEl.textContent = message || "";
	};

	contactForm.addEventListener("input", () => {
		if (feedbackEl?.classList.contains("is-error")) {
			setFeedback("", "");
		}
	});

	contactForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		if (!contactForm.checkValidity()) {
			contactForm.reportValidity();
			setFeedback("error", "Controleer je gegevens en vul de verplichte velden in.");
			return;
		}

		if (submitButton) {
			submitButton.disabled = true;
			submitButton.classList.add("is-loading");
			submitButton.textContent = "Versturen...";
		}

		contactForm.setAttribute("aria-busy", "true");
		setFeedback("loading", "Bericht wordt verstuurd...");

		try {
			const formData = new FormData(contactForm);
			const endpoint = contactForm.action.includes("/ajax/")
				? contactForm.action
				: contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

			const response = await fetch(endpoint, {
				method: "POST",
				body: formData,
				headers: {
					Accept: "application/json"
				}
			});

			if (!response.ok) {
				throw new Error("Form submit request failed");
			}

			setFeedback("success", "Bedankt! Je bericht is verstuurd. Ik neem snel contact met je op.");
			contactForm.reset();
		} catch (error) {
			setFeedback("error", "Er ging iets mis met versturen. Probeer het opnieuw of mail direct naar info@solutionbase.nl.");
		} finally {
			contactForm.setAttribute("aria-busy", "false");

			if (submitButton) {
				submitButton.disabled = false;
				submitButton.classList.remove("is-loading");
				submitButton.textContent = defaultButtonLabel;
			}
		}
	});
}
