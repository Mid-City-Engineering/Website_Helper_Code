// Simple test widget to verify CDN loading works
console.log('Simple test script loaded successfully');

// Create and inject H2 element
document.addEventListener('DOMContentLoaded', function () {
    // Create the H2 element
    const heading = document.createElement('h2');
    heading.textContent = 'CDN Test Successful - This H2 was loaded via JavaScript!';
    heading.style.color = '#007bff';
    heading.style.textAlign = 'center';
    heading.style.margin = '20px 0';
    heading.style.padding = '15px';
    heading.style.border = '2px solid #007bff';
    heading.style.borderRadius = '8px';
    heading.style.backgroundColor = '#f8f9fa';

    // Try to find a container, or append to body
    const container = document.getElementById('simple-test-container');
    if (container) {
        container.appendChild(heading);
    } else {
        // If no specific container, append to the first available parent element
        const scriptTags = document.querySelectorAll('script');
        const lastScript = scriptTags[scriptTags.length - 1];
        if (lastScript && lastScript.parentNode) {
            lastScript.parentNode.insertBefore(heading, lastScript.nextSibling);
        } else {
            document.body.appendChild(heading);
        }
    }

    console.log('H2 heading injected into page');
});

// Also try immediate execution in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded');
} else {
    console.log('DOM already loaded, executing immediately');
    const heading = document.createElement('h2');
    heading.textContent = 'CDN Test Successful - Immediate Load!';
    heading.style.color = '#28a745';
    heading.style.textAlign = 'center';
    heading.style.margin = '20px 0';
    heading.style.padding = '15px';
    heading.style.border = '2px solid #28a745';
    heading.style.borderRadius = '8px';
    heading.style.backgroundColor = '#f8f9fa';

    const container = document.getElementById('simple-test-container');
    if (container) {
        container.appendChild(heading);
    } else {
        document.body.appendChild(heading);
    }
}
