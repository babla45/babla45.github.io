// JavaScript to handle click event on box elements
const boxes = document.querySelectorAll('.box');
const resultMsg = document.getElementById('msg');

boxes.forEach(box => {
    box.addEventListener('click', () => {
        // Set the text of p tag to the content of the clicked box
        resultMsg.textContent = box.textContent;
    });
});