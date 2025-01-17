// JavaScript to handle click event on box elements
const resultMsg = document.getElementById('msg');

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuA0lX-CwTNQ94fT8r-Wfte_1BgT0wZOc",
    authDomain: "finance-tracker-web-app-4e0e9.firebaseapp.com",
    projectId: "finance-tracker-web-app-4e0e9",
    storageBucket: "finance-tracker-web-app-4e0e9.firebasestorage.app",
    messagingSenderId: "312129644648",
    appId: "1:312129644648:web:dc796f9d79c11fd04a33dd",
    measurementId: "G-QWMVZMMR2P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dark mode functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;
    const darkIcon = document.getElementById('darkIcon');
    const lightIcon = document.getElementById('lightIcon');

    // Check saved preference
    if (localStorage.getItem('darkMode') === 'true') {
        html.classList.add('dark');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    }

    darkModeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');
        localStorage.setItem('darkMode', html.classList.contains('dark'));
    });
}

// Admin password protection
document.querySelector('a[href="admin.html"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    const password = prompt('Please enter admin password:');
    if (password === 'bib') {
        localStorage.setItem('adminAuthenticated', 'true');
        window.location.href = 'admin.html';
    } else {
        alert('Incorrect password!');
    }
});

// Function to load links from Firestore
async function loadLinks() {
    const querySnapshot = await getDocs(collection(db, "links"));
    const container = document.querySelector('.grid');
    container.innerHTML = '';
    
    // Convert querySnapshot to array and sort by name
    const links = [];
    querySnapshot.forEach((doc) => {
        links.push({ ...doc.data(), id: doc.id });
    });
    
    links.sort((a, b) => a.name.localeCompare(b.name));

    links.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;
        a.className = 'transform hover:scale-105 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl flex items-center justify-center text-lg font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 min-h-[100px] hover:bg-white/90 dark:hover:bg-gray-800/90';
        container.appendChild(a);
    });

    // Re-attach click event listeners to the new elements
    const boxes = document.querySelectorAll('.grid a');
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            resultMsg.textContent = box.textContent;
        });
    });
}

// Function to show flash message
function showFlashMessage(message) {
    const flashMessage = document.createElement('div');
    flashMessage.className = 'flash-message';
    flashMessage.textContent = message;
    document.body.appendChild(flashMessage);
    flashMessage.style.display = 'block';
    setTimeout(() => {
        flashMessage.style.display = 'none';
        document.body.removeChild(flashMessage);
    }, 3000);
}

// Function to add a new link
async function addLink(name, url) {
    await addDoc(collection(db, "links"), { name, url, timestamp: new Date() });
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    loadLinks();
    showFlashMessage('Link added successfully');
}

// Function to delete a link
async function deleteLink(name) {
    const querySnapshot = await getDocs(collection(db, "links"));
    querySnapshot.forEach(async (doc) => {
        if (doc.data().name === name) {
            await deleteDoc(doc.ref);
            loadLinks();
            showFlashMessage('Link deleted successfully');
        }
    });
}

// Modify the admin panel event listeners to check authentication
document.getElementById('addLinkBtn')?.addEventListener('click', () => {
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
        alert('Unauthorized access!');
        window.location.href = 'index.html';
        return;
    }
    const name = document.getElementById('linkName').value;
    const url = document.getElementById('linkUrl').value;
    addLink(name, url);
});

document.getElementById('deleteLinkBtn')?.addEventListener('click', () => {
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
        alert('Unauthorized access!');
        window.location.href = 'index.html';
        return;
    }
    const name = document.getElementById('linkName').value;
    deleteLink(name);
});

// Make sure dark mode is initialized after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    loadLinks();
});