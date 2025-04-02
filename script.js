document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const contentSections = document.querySelectorAll('.content-section[id]');
    const navLinks = document.querySelectorAll('.table-of-contents a');
    const animatedElements = document.querySelectorAll('.content-section, blockquote, .cta-banner-text'); // 애니메이션 대상 요소들

    // --- 1. Active Sidebar Link Logic ---
    if (contentSections.length > 0 && navLinks.length > 0) {
        const activeLinkObserverOptions = {
            root: null,
            rootMargin: '0px 0px -60% 0px', // 화면 상단 40% 영역 기준으로 활성 링크 판단
            threshold: 0
        };
        let lastActiveLink = null;
        const activeLinkCallback = (entries, observer) => {
            let currentActiveSectionId = null;
            const intersectingEntries = entries.filter(entry => entry.isIntersecting);

            if (intersectingEntries.length > 0) {
                intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                currentActiveSectionId = intersectingEntries[0].target.getAttribute('id');
            } else {
                 let closestSectionAbove = null;
                 let minDistanceAbove = Infinity;
                 contentSections.forEach(section => {
                     const rect = section.getBoundingClientRect();
                     const topBoundary = window.innerHeight * 0.40;
                     if (rect.bottom > 0 && rect.top < topBoundary) {
                         const distance = topBoundary - rect.top;
                         if (distance < minDistanceAbove) {
                             minDistanceAbove = distance;
                             closestSectionAbove = section;
                         }
                     }
                 });
                 if(closestSectionAbove) {
                    currentActiveSectionId = closestSectionAbove.getAttribute('id');
                 }
            }

            if (currentActiveSectionId) {
                const activeLink = document.querySelector(`.table-of-contents a[href="#${currentActiveSectionId}"]`);
                if (activeLink && activeLink !== lastActiveLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    activeLink.classList.add('active');
                    lastActiveLink = activeLink;
                }
            }
        };
        const activeLinkObserver = new IntersectionObserver(activeLinkCallback, activeLinkObserverOptions);
        contentSections.forEach(section => activeLinkObserver.observe(section));

        const currentHash = window.location.hash;
        let linkToActivate = navLinks.length > 0 ? navLinks[0] : null;
        if (currentHash) {
            const targetLink = document.querySelector(`.table-of-contents a[href="${currentHash}"]`);
            if (targetLink) linkToActivate = targetLink;
        }
        navLinks.forEach(link => link.classList.remove('active'));
        if (linkToActivate) {
            linkToActivate.classList.add('active');
            lastActiveLink = linkToActivate;
        }
    } else {
        console.warn("Content sections with IDs or navigation links not found for active link highlighting.");
    }

    // --- 2. Scroll Animation Logic ---
    if ('IntersectionObserver' in window) {
        const animationObserverOptions = {
            root: null,
            rootMargin: '0px',
            // ★★★ Threshold 값을 매우 낮춤 (예: 0.01 또는 0) ★★★
            // 요소의 1%만 보여도 (또는 1픽셀만 보여도) 트리거
            threshold: 0.01
        };

        const animationCallback = (entries, observer) => {
            entries.forEach(entry => {
                // isIntersecting이 true가 되는지 콘솔에서 확인해보세요.
                // console.log(entry.target, entry.isIntersecting);
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // 애니메이션은 한 번만 실행
                }
            });
        };

        const animationObserver = new IntersectionObserver(animationCallback, animationObserverOptions);

        animatedElements.forEach(el => {
            // 각 요소가 관찰 대상으로 등록되는지 확인
            // console.log("Observing for animation:", el);
            animationObserver.observe(el);
        });

    } else {
        console.warn("IntersectionObserver not supported, scroll animations disabled.");
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }
});