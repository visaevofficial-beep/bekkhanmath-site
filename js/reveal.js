/* Анимация появления элементов: при первой загрузке и при прокрутке.
   Элементы, у которых в HTML есть атрибут data-reveal, плавно выезжают снизу. */
(function () {
    var root = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) return; // без анимации — всё просто видно

    root.classList.add("js");

    // Шапка плавно появляется только при первом заходе за сессию, а не на каждой странице
    try {
        if (!sessionStorage.getItem("bm-seen")) {
            root.classList.add("first-visit");
            sessionStorage.setItem("bm-seen", "1");
        }
    } catch (e) {}

    function start() {
        try {
            var items = document.querySelectorAll("[data-reveal]");
            if (!items.length) return;

            var observer = new IntersectionObserver(function (entries) {
                var visible = entries
                    .filter(function (e) { return e.isIntersecting; })
                    .sort(function (a, b) {
                        var ra = a.boundingClientRect, rb = b.boundingClientRect;
                        return (ra.top - rb.top) || (ra.left - rb.left);
                    });

                visible.forEach(function (entry, i) {
                    var el = entry.target;
                    observer.unobserve(el);
                    // лёгкая «лесенка» для элементов, появляющихся одновременно
                    el.style.setProperty("--reveal-delay", Math.min(i * 0.09, 0.54) + "s");
                    el.classList.add("is-visible");
                    el.addEventListener("animationend", function () {
                        el.classList.add("reveal-done");
                    }, { once: true });
                });

                // элементы, оставшиеся выше экрана (переход по якорю) — показываем сразу, без анимации
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
                        observer.unobserve(entry.target);
                        entry.target.classList.add("is-visible", "reveal-done");
                    }
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

            items.forEach(function (el) { observer.observe(el); });
        } catch (e) {
            root.classList.remove("js"); // на случай ошибки ничего не прячем
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
