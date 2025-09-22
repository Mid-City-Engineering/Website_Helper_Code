// Test script to render an H2 heading
(function () {
    // Create the H2 element
    const heading = document.createElement('h2');
    heading.textContent = `This is the title of a test script located in Mid City's GitHub repository`;

    // Add some basic styling
    heading.style.color = '#333';
    heading.style.fontFamily = 'Arial, sans-serif';
    heading.style.margin = '20px 0';

    // Append to the body (or you could target a specific container)
    document.body.appendChild(heading);

    // Optional: Log to console for debugging
    console.log('Test script loaded successfully!');
})();
