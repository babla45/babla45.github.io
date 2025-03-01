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

// Global variable to store all links
let allLinks = [];

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

// Replace default password prompt with custom modal
document.querySelector('a[href="admin.html"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
    
    // Create modal content
    backdrop.innerHTML = `
        <div class="bg-gradient-to-r from-green-800/95 to-red-800/95 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <h2 class="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
            <input type="password" id="adminPasswordInput" placeholder="Enter password" 
                   class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
                   autocomplete="off">
            <div class="flex gap-3">
                <button id="submitPassword" class="flex-1 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors">
                    Login
                </button>
                <button id="cancelLogin" class="flex-1 bg-transparent border border-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(backdrop);
    
    // Focus input
    const input = backdrop.querySelector('#adminPasswordInput');
    input.focus();
    
    // Handle input enter key
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handlePassword(input.value);
        }
    });
    
    // Handle submit button
    backdrop.querySelector('#submitPassword').addEventListener('click', () => {
        handlePassword(input.value);
    });
    
    // Handle cancel button
    backdrop.querySelector('#cancelLogin').addEventListener('click', () => {
        document.body.removeChild(backdrop);
    });
    
    // Handle password check
    function handlePassword(password) {
        if (password === 'bib') {
            localStorage.setItem('adminAuthenticated', 'true');
            window.location.href = 'admin.html';
        } else {
            showFlashMessage('Incorrect password!');
            input.value = '';
            input.focus();
        }
    }
});

// Function to load links from Firestore
async function loadLinks() {
    const querySnapshot = await getDocs(collection(db, "links"));
    const container = document.querySelector('.grid');
    container.innerHTML = '';
    
    // Convert querySnapshot to array and sort by name
    allLinks = [];
    querySnapshot.forEach((doc) => {
        allLinks.push({ ...doc.data(), id: doc.id });
    });
    
    allLinks.sort((a, b) => a.name.localeCompare(b.name));

    // Display all links initially
    displayLinks(allLinks);

    // Re-attach click event listeners to the new elements
    const boxes = document.querySelectorAll('.grid a');
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            resultMsg.textContent = box.textContent;
        });
    });
}

// Function to display links
function displayLinks(links) {
    const container = document.querySelector('.grid');
    container.innerHTML = '';
    
    if (links.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'col-span-full text-center py-8 text-gray-500 dark:text-gray-400';
        noResults.textContent = 'No matching projects found';
        container.appendChild(noResults);
        return;
    }
    
    links.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;
        a.className = 'transform hover:scale-105 transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl flex items-center justify-center text-lg font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 min-h-[100px] hover:bg-white/90 dark:hover:bg-gray-800/90';
        container.appendChild(a);
    });
}

// Function to check if a string is a subsequence of another
function isSubsequence(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    let i = 0, j = 0;
    while (i < query.length && j < text.length) {
        if (query[i] === text[j]) {
            i++;
        }
        j++;
    }
    return i === query.length;
}

// Function to handle search
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const query = searchInput.value.trim();
    
    if (query === '') {
        displayLinks(allLinks);
        return;
    }
    
    let filteredLinks;
    
    if (searchType === 'substring') {
        // Substring search (case-insensitive)
        filteredLinks = allLinks.filter(link => 
            link.name.toLowerCase().includes(query.toLowerCase())
        );
    } else {
        // Subsequence search
        filteredLinks = allLinks.filter(link => 
            isSubsequence(query, link.name)
        );
    }
    
    displayLinks(filteredLinks);
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    const searchTypeRadios = document.querySelectorAll('input[name="searchType"]');
    
    // Add event listeners
    searchInput.addEventListener('input', handleSearch);
    
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        displayLinks(allLinks);
    });
    
    searchTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleSearch);
    });
}

// Updated flash message function
function showFlashMessage(message) {
    const flashMessage = document.createElement('div');
    flashMessage.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-8 py-4 rounded-lg shadow-2xl z-50 backdrop-blur-sm text-lg font-medium';
    flashMessage.textContent = message;
    document.body.appendChild(flashMessage);
    setTimeout(() => {
        flashMessage.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => document.body.removeChild(flashMessage), 300);
    }, 2000);
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

// Modify the admin panel event listeners to check authentication and show flash message on error
document.getElementById('addLinkBtn')?.addEventListener('click', () => {
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
        showFlashMessage('Unauthorized access!');
        window.location.href = 'index.html';
        return;
    }
    const name = document.getElementById('linkName').value;
    const url = document.getElementById('linkUrl').value;
    addLink(name, url);
});

document.getElementById('deleteLinkBtn')?.addEventListener('click', () => {
    if (localStorage.getItem('adminAuthenticated') !== 'true') {
        showFlashMessage('Unauthorized access!');
        window.location.href = 'index.html';
        return;
    }
    const name = document.getElementById('linkName').value;
    deleteLink(name);
});

// Make sure dark mode and search are initialized after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    loadLinks();
    initializeSearch();
});