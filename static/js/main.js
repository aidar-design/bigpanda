(function () {
    'use strict';

    const scrollSpeed = 1.8;
    const smoothness = 0.18;
    const stopThreshold = 0.5;

    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    let isScrolling = false;

    function clampScroll() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.max(0, Math.min(maxScroll, targetScroll));
    }

    function animate() {
        if (!isScrolling) return;
        currentScroll += (targetScroll - currentScroll) * smoothness;

        if (Math.abs(targetScroll - currentScroll) < stopThreshold) {
            currentScroll = targetScroll;
            isScrolling = false;
        }

        window.scrollTo(0, currentScroll);

        if (isScrolling) {
            requestAnimationFrame(animate);
        }
    }

    window.addEventListener('wheel', function (e) {
        const lightbox = document.getElementById('lightbox');
        if (lightbox && lightbox.classList.contains('open')) {
            return;
        }
        const mobileMenu = document.getElementById('heroMobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            return;
        }
        e.preventDefault();
        targetScroll += e.deltaY * scrollSpeed;
        targetScroll = clampScroll();

        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(animate);
        }
    }, { passive: false });

    function sync() {
        const current = window.scrollY;
        currentScroll = current;
        targetScroll = current;
        isScrolling = false;
    }

    window.addEventListener('scroll', sync);
}());

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const targetId = link.getAttribute('href');
            if (targetId.length <= 1) return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const heroBurger = document.querySelector('.hero__burger');
    const heroMobileMenu = document.getElementById('heroMobileMenu');

    if (heroBurger && heroMobileMenu) {
        const heroMobileClose = heroMobileMenu.querySelector('.hero__mobile-close');

        function openMobileMenu() {
            heroMobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileMenu() {
            heroMobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        }

        heroBurger.addEventListener('click', openMobileMenu);

        if (heroMobileClose) {
            heroMobileClose.addEventListener('click', closeMobileMenu);
        }

        heroMobileMenu.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(function (button) {
        button.addEventListener('click', function () {
            const accordionItem = button.parentElement;
            const isActive = accordionItem.classList.contains('active');

            document.querySelectorAll('.accordion-item').forEach(function (item) {
                item.classList.remove('active');
            });

            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (sliderTrack && slides.length) {
        let currentIndex = 0;

        slides.forEach(function (slide) {
            slide.style.backgroundColor = slide.dataset.bg;
        });

        function updateSlider() {
            sliderTrack.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === currentIndex);
            });

            indicators.forEach(function (indicator, i) {
                indicator.classList.toggle('active', i === currentIndex);
            });
        }

        nextBtn.addEventListener('click', function () {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlider();
        });

        prevBtn.addEventListener('click', function () {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlider();
        });

        indicators.forEach(function (indicator, i) {
            indicator.addEventListener('click', function () {
                currentIndex = i;
                updateSlider();
            });
        });

        /* Свайп пальцем: переключаем слайд по горизонтальному жесту */
        let touchStartX = 0;
        let touchStartY = 0;

        sliderTrack.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        sliderTrack.addEventListener('touchmove', function (e) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
                e.preventDefault();
            }
        }, { passive: false });

        sliderTrack.addEventListener('touchend', function (e) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx < -50) {
                currentIndex = (currentIndex + 1) % slides.length;
                updateSlider();
            } else if (dx > 50) {
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                updateSlider();
            }
        }, { passive: true });
    }

    const zoomables = document.querySelectorAll('.zoomable');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (zoomables.length && lightbox && lightboxImg) {
        zoomables.forEach(function (img) {
            img.addEventListener('click', function () {
                lightboxImg.src = img.src;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
                lightbox.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                lightbox.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryPrevBtn = document.querySelector('.gallery-controls .prev');
    const galleryNextBtn = document.querySelector('.gallery-controls .next');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const modalImage = document.querySelector('.modal-image');
    const modalClose = document.querySelector('.modal-close');
    const modalPrevBtn = document.querySelector('.modal-controls .prev');
    const modalNextBtn = document.querySelector('.modal-controls .next');

    if (galleryItems.length && fullscreenModal) {
        let currentIndex = 1;
        const totalDocs = galleryItems.length;

        function updateGallery() {
            galleryItems.forEach(function (item, index) {
                item.classList.toggle('active', index === currentIndex);
            });
        }

        function currentSrc() {
            return galleryItems[currentIndex].querySelector('img').src;
        }

        function nextDoc() {
            currentIndex = (currentIndex + 1) % totalDocs;
            updateGallery();
        }

        function prevDoc() {
            currentIndex = (currentIndex - 1 + totalDocs) % totalDocs;
            updateGallery();
        }

        function openFullscreen() {
            modalImage.src = currentSrc();
            fullscreenModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeFullscreen() {
            fullscreenModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        galleryNextBtn.addEventListener('click', nextDoc);
        galleryPrevBtn.addEventListener('click', prevDoc);

        galleryItems.forEach(function (item, index) {
            item.addEventListener('click', function () {
                currentIndex = index;
                updateGallery();
                openFullscreen();
            });
        });

        modalClose.addEventListener('click', closeFullscreen);

        fullscreenModal.addEventListener('click', function (e) {
            if (e.target === fullscreenModal) {
                closeFullscreen();
            }
        });

        modalNextBtn.addEventListener('click', function () {
            nextDoc();
            modalImage.src = currentSrc();
        });

        modalPrevBtn.addEventListener('click', function () {
            prevDoc();
            modalImage.src = currentSrc();
        });

        document.addEventListener('keydown', function (e) {
            if (!fullscreenModal.classList.contains('active')) return;
            if (e.key === 'ArrowRight') {
                modalNextBtn.click();
            } else if (e.key === 'ArrowLeft') {
                modalPrevBtn.click();
            } else if (e.key === 'Escape') {
                closeFullscreen();
            }
        });

        updateGallery();
    }

    const newsSlides = document.querySelectorAll('.news-slide');
    const newsSlider = document.querySelector('.news-slider');

    if (newsSlides.length && newsSlider) {
        let newsIndex = 0;

        function updateNewsSlider() {
            newsSlides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === newsIndex);
            });
        }

        newsSlides.forEach(function (slide) {
            const toggle = slide.querySelector('.news-toggle');
            if (toggle) {
                toggle.addEventListener('click', function () {
                    slide.classList.toggle('open');
                });
            }
        });

        newsSlider.addEventListener('click', function (e) {
            const btn = e.target.closest('.news-btn');
            if (!btn) return;
            if (btn.classList.contains('prev')) {
                newsIndex = (newsIndex - 1 + newsSlides.length) % newsSlides.length;
            } else if (btn.classList.contains('next')) {
                newsIndex = (newsIndex + 1) % newsSlides.length;
            }
            updateNewsSlider();
        });

        updateNewsSlider();
    }

    /* --- Параллакс декоративных изображений в секции "Контакты" --- */
    const contactSection = document.querySelector('.contact-section');
    const parallaxImages = document.querySelectorAll('.parallax-image');

    if (contactSection && parallaxImages.length) {
        contactSection.addEventListener('mousemove', function (e) {
            const rect = contactSection.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const deltaX = (mouseX - centerX) / centerX;
            const deltaY = (mouseY - centerY) / centerY;

            parallaxImages.forEach(function (img) {
                let moveX, moveY;

                if (img.classList.contains('parallax-tl')) {
                    moveX = deltaX * 20;
                    moveY = deltaY * 20;
                } else if (img.classList.contains('parallax-tr')) {
                    moveX = deltaX * -20;
                    moveY = deltaY * 20;
                } else if (img.classList.contains('parallax-bl')) {
                    moveX = deltaX * 20;
                    moveY = deltaY * -20;
                } else if (img.classList.contains('parallax-br')) {
                    moveX = deltaX * -20;
                    moveY = deltaY * -20;
                } else {
                    return;
                }

                img.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
            });
        });

        contactSection.addEventListener('mouseleave', function () {
            parallaxImages.forEach(function (img) {
                img.style.transform = 'translate(0, 0)';
            });
        });
    }
});