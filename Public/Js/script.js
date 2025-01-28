// script.js

// Smooth scrolling for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        document.getElementById(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Simple form validation
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for reaching out! I will get back to you soon.');
});

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const aboutSection = document.querySelector(".about-section");
    const aboutTitle = document.querySelector(".about-title");
    const aboutDescription = document.querySelector(".about-description");

    const handleScroll = () => {
        const sectionTop = aboutSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Trigger animation when the section comes into view
        if (sectionTop < windowHeight - 100) {
            aboutTitle.classList.add("animate");
            aboutDescription.classList.add("animate");
        }
    };

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll);
});


document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    let currentFocus = 0;

    const changeFocus = () => {
        // Remove focus from the current item
        portfolioItems[currentFocus].classList.remove("focused");

        // Move to the next item (loop back if at the end)
        currentFocus = (currentFocus + 1) % portfolioItems.length;

        // Add focus to the new item
        portfolioItems[currentFocus].classList.add("focused");
    };

    // Change focus every 5 seconds
    setInterval(changeFocus, 5000);
});


// JavaScript to add the "fade" class when the element comes into view
document.addEventListener("DOMContentLoaded", function () {
    const aboutSection = document.querySelector('#about');
    const aboutTitle = document.querySelector('.about-title');
    const aboutDesc = document.querySelector('.about-description');
    const missionTitle = document.querySelector('.mission-title');
    const missionDesc = document.querySelector('.mission-description');
    const valuesTitle = document.querySelector('.values-title');
    const valuesDesc = document.querySelector('.values-description');

    // Function to check if the section is in view
    function checkVisibility() {
        const windowHeight = window.innerHeight;
        const elementTop = aboutSection.getBoundingClientRect().top;
        const elementBottom = aboutSection.getBoundingClientRect().bottom;

        if (elementTop < windowHeight && elementBottom >= 0) {
            aboutTitle.classList.add('visible');
            aboutDesc.classList.add('visible');
            missionTitle.classList.add('visible');
            missionDesc.classList.add('visible');
            valuesTitle.classList.add('visible');
            valuesDesc.classList.add('visible');
        }
    }

    // Check visibility on scroll
    window.addEventListener('scroll', checkVisibility);

    // Initial check when the page loads
    checkVisibility();
});
