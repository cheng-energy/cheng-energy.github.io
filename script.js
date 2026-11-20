/* ================================================================
   script.js
   规范 B7: motion curve + duration · IntersectionObserver for
   scroll reveal · B11 tagline word-by-word reveal on scroll ·
   B7 nav staggered entrance · hamburger menu · year auto-update
   ================================================================ */

(function () {
    "use strict";

    /* ---- 元素引用 ---- */
    var hamburger  = document.getElementById("hamburger");
    var navPanel   = document.getElementById("navPanel");
    var navLinks   = document.querySelectorAll(".nav-link");
    var currentYearSpan = document.getElementById("currentYear");

    /* ---- 0. 页脚年份 ---- */
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    /* ================================================================
       1. 汉堡菜单 (B7)
       ================================================================ */
    function closeMenu() {
        if (!navPanel || !hamburger) return;
        navPanel.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    function openMenu() {
        if (!navPanel || !hamburger) return;
        navPanel.classList.add("is-open");
        hamburger.classList.add("is-open");
        hamburger.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden"; // 禁止背景滚动

        /* B7: staggered entrance animation for nav links */
        var links = navPanel.querySelectorAll(".nav-link");
        links.forEach(function (link, i) {
            link.style.animationDelay = (i * 60) + "ms";
        });
    }

    if (hamburger && navPanel) {
        hamburger.addEventListener("click", function () {
            if (navPanel.classList.contains("is-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    /* ---- 导航链接点击：关菜单 + 平滑滚动 ---- */
    navLinks.forEach(function (link) {
        link.addEventListener("click", function (e) {
            closeMenu();

            var href = link.getAttribute("href");
            if (href && href.startsWith("#")) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var header = document.getElementById("header");
                    var offset = header ? header.offsetHeight + 16 : 72;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: "smooth" });
                }
            }
        });
    });

    /* ---- ESC 关闭菜单 ---- */
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && navPanel && navPanel.classList.contains("is-open")) {
            closeMenu();
        }
    });

    /* ---- 点击面板外部关闭（点击背景遮罩） ---- */
    if (navPanel) {
        navPanel.addEventListener("click", function (e) {
            if (e.target === navPanel) {
                closeMenu();
            }
        });
    }

    /* ================================================================
       2. Scroll reveal — sections entering viewport (B7)
       规范: 每 section 进入时从 translateY(32px) + opacity 0
       ～ opacity 1, 600-800ms, base curve. 只触发一次.
       ================================================================ */
    var revealSections = document.querySelectorAll(
        "#about, #projects, #skills, #learning, #contact, #tagline, .hero"
    );

    revealSections.forEach(function (section) {
        section.classList.add("reveal-section");
    });

    if ("IntersectionObserver" in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        });

        revealSections.forEach(function (section) {
            revealObserver.observe(section);
        });
    } else {
        // Fallback: 无 IntersectionObserver 时直接全部显示
        revealSections.forEach(function (section) {
            section.classList.add("visible");
        });
    }

    /* ================================================================
       3. Tagline reveal — word-by-word on scroll (B11)
       规范: 每个 word 从 muted (0.25-0.35 opacity of text)
       过渡到 full color, 在滚动中逐词激活.
       实现: 把 tagline text 拆成 span.tw, 每个用 IntersectionObserver.
       每个词单独 observe, threshold 设在 80% 左右让词在接近视线中央时亮起.
       ================================================================ */
    var taglineEl = document.getElementById("taglineText");
    if (taglineEl) {
        var rawText = taglineEl.textContent.trim();
        // 用正则拆分：中文单字/英文词/标点
        var tokens = rawText.match(/[\u4e00-\u9fff]|[a-zA-Z0-9]+|[^\s\u4e00-\u9fffa-zA-Z0-9]+|\s+/g) || [];
        taglineEl.innerHTML = "";

        tokens.forEach(function (token) {
            if (token.trim() === "") {
                // 保留空白
                taglineEl.appendChild(document.createTextNode(token));
            } else {
                var span = document.createElement("span");
                span.className = "tw";
                span.textContent = token;
                taglineEl.appendChild(span);
            }
        });

        if ("IntersectionObserver" in window) {
            var twSpans = taglineEl.querySelectorAll(".tw");
            var twObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        twObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.6,
                rootMargin: "0px 0px -40px 0px"
            });

            twSpans.forEach(function (span) {
                twObserver.observe(span);
            });
        } else {
            // Fallback
            var allTw = taglineEl.querySelectorAll(".tw");
            allTw.forEach(function (span) { span.classList.add("revealed"); });
        }
    }

})();