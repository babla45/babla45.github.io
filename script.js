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

// Add these at the top of the file, after existing imports
let isOnline = navigator.onLine;
const offlineIndicator = document.createElement('div');
const connectionIndicator = document.createElement('div');
let lastPerformanceCheck = 0;
let isAdmin = localStorage.getItem('adminAuthenticated') === 'true';

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

// Setup offline/online indicator
function setupConnectivityIndicators() {
    offlineIndicator.className = 'fixed bottom-4 left-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg z-50 transform transition-all';
    offlineIndicator.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.07m-3.535 3.536a1 1 0 110-1.415"></path>
            </svg>
            <span>You are offline</span>
        </div>
    `;
    document.body.appendChild(offlineIndicator);
    
    // Connection quality indicator (new)
    connectionIndicator.className = 'fixed bottom-4 left-4 ml-36 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-lg z-50 transition-all opacity-0';
    connectionIndicator.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>Slow connection</span>
        </div>
    `;
    document.body.appendChild(connectionIndicator);
    
    // Admin mode indicator (new)
    if (isAdmin) {
        const adminIndicator = document.createElement('div');
        adminIndicator.className = 'fixed top-4 left-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg z-50';
        adminIndicator.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
                <span>Admin Mode</span>
            </div>
        `;
        document.body.appendChild(adminIndicator);
    }
    
    if (isOnline) {
        offlineIndicator.classList.add('hidden');
    }
    
    window.addEventListener('online', () => {
        isOnline = true;
        offlineIndicator.classList.add('hidden');
        showFlashMessage('You are back online');
        loadLinks();
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        offlineIndicator.classList.remove('hidden');
        connectionIndicator.classList.add('opacity-0');
        showFlashMessage('You are offline');
    });
    
    // Check connection speed periodically
    setInterval(checkConnectionSpeed, 30000);
}

// Function to check connection speed
function checkConnectionSpeed() {
    if (!isOnline) return;
    
    const now = Date.now();
    if (now - lastPerformanceCheck < 10000) return; // Don't check too frequently
    
    lastPerformanceCheck = now;
    
    const start = Date.now();
    fetch('https://www.gstatic.com/generate_204', { 
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors'
    })
    .then(() => {
        const duration = Date.now() - start;
        if (duration > 1000) {
            // Show slow connection indicator
            connectionIndicator.classList.remove('opacity-0');
            connectionIndicator.style.opacity = '1';
            setTimeout(() => {
                connectionIndicator.style.opacity = '0';
            }, 5000);
        }
    })
    .catch(() => {
        // Connection check failed, do nothing
    });
}

// Modified loadLinks function with loading indicator and error handling
async function loadLinks() {
    const container = document.querySelector('.grid');
    
    // Show loading indicator
    container.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </div>
    `;
    
    try {
        if (!isOnline) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 flex flex-col items-center">
                    <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.07m-3.535 3.536a1 1 0 110-1.415"></path>
                    </svg>
                    <p class="text-xl font-medium text-gray-500 dark:text-gray-400">No internet connection</p>
                    <p class="text-gray-500 dark:text-gray-500 mt-1">Please check your connection and try again</p>
                    <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Retry
                    </button>
                </div>
            `;
            return;
        }
        
        // Check connection speed before fetching data
        const start = Date.now();
        
        const querySnapshot = await getDocs(collection(db, "links"));
        
        // Check if fetch was slow
        const fetchTime = Date.now() - start;
        if (fetchTime > 1500) {
            connectionIndicator.classList.remove('opacity-0');
            connectionIndicator.style.opacity = '1';
            setTimeout(() => {
                connectionIndicator.style.opacity = '0';
            }, 5000);
        }
        
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
        
    } catch (error) {
        console.error("Error loading links:", error);
        
        // Different error indicators based on error type
        let errorMessage = 'Failed to load projects';
        let errorDescription = 'Please try again later';
        
        if (error.code === 'permission-denied') {
            errorMessage = 'Access denied';
            errorDescription = 'You don\'t have permission to view these projects';
        } else if (error.code === 'unavailable') {
            errorMessage = 'Service unavailable';
            errorDescription = 'The database is currently not responding';
        } else if (error.code === 'not-found') {
            errorMessage = 'No projects found';
            errorDescription = 'The project collection doesn\'t exist';
        }
        
        container.innerHTML = `
            <div class="col-span-full text-center py-12 flex flex-col items-center">
                <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <p class="text-xl font-medium text-red-500">${errorMessage}</p>
                <p class="text-gray-600 dark:text-gray-400 mt-1">${errorDescription}</p>
                <button onclick="loadLinks()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Retry
                </button>
            </div>
        `;
    }
}

// Function to display links
function displayLinks(links) {
    const container = document.querySelector('.grid');
    const resultsIndicator = document.createElement('div');
    resultsIndicator.className = 'col-span-full mb-4 text-gray-600 dark:text-gray-400 text-sm';
    
    container.innerHTML = '';
    
    // Show results count if searching
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        resultsIndicator.textContent = `Found ${links.length} result${links.length !== 1 ? 's' : ''}`;
        container.appendChild(resultsIndicator);
    }
    
    if (links.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'col-span-full text-center py-12 flex flex-col items-center';
        noResults.innerHTML = `
            <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-xl font-medium text-gray-500 dark:text-gray-400">No matching projects found</p>
            <p class="text-gray-500 dark:text-gray-500 mt-1">Try a different search term or check your internet connection</p>
        `;
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
    
    // Add new content indicator if applicable
    links.forEach(link => {
        if (link.timestamp && isNewContent(link.timestamp)) {
            const newBadge = document.createElement('span');
            newBadge.className = 'absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full';
            newBadge.textContent = 'NEW';
            container.querySelector(`a[href="${link.url}"]`)?.appendChild(newBadge);
        }
    });
}

// Helper function to check if content is new (within last 24 hours)
function isNewContent(timestamp) {
    if (!timestamp) return false;
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const now = new Date();
    const hoursDiff = (now - date) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
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

// Enhanced addLink function with error handling
async function addLink(name, url) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-6 rounded-lg shadow-lg z-50 flex items-center';
    loadingIndicator.innerHTML = `
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
        <span>Adding link...</span>
    `;
    document.body.appendChild(loadingIndicator);
    
    try {
        if (!isOnline) {
            document.body.removeChild(loadingIndicator);
            showFlashMessage('Cannot add link: You are offline');
            return;
        }
        
        await addDoc(collection(db, "links"), { name, url, timestamp: new Date() });
        document.getElementById('linkName').value = '';
        document.getElementById('linkUrl').value = '';
        loadLinks();
        showFlashMessage('Link added successfully');
    } catch (error) {
        console.error("Error adding link:", error);
        showFlashMessage('Failed to add link: ' + error.message);
    } finally {
        document.body.removeChild(loadingIndicator);
    }
}

// Enhanced deleteLink function with error handling
async function deleteLink(name) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-6 rounded-lg shadow-lg z-50 flex items-center';
    loadingIndicator.innerHTML = `
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
        <span>Deleting link...</span>
    `;
    document.body.appendChild(loadingIndicator);
    
    try {
        if (!isOnline) {
            document.body.removeChild(loadingIndicator);
            showFlashMessage('Cannot delete link: You are offline');
            return;
        }
        
        const querySnapshot = await getDocs(collection(db, "links"));
        let foundDocument = false;
        
        for (const doc of querySnapshot.docs) {
            if (doc.data().name === name) {
                await deleteDoc(doc.ref);
                foundDocument = true;
                break;
            }
        }
        
        if (foundDocument) {
            loadLinks();
            showFlashMessage('Link deleted successfully');
        } else {
            showFlashMessage('Link not found');
        }
    } catch (error) {
        console.error("Error deleting link:", error);
        showFlashMessage('Failed to delete link: ' + error.message);
    } finally {
        document.body.removeChild(loadingIndicator);
    }
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

// Update the DOMContentLoaded event to initialize connectivity indicators
document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    setupConnectivityIndicators();
    loadLinks();
    initializeSearch();
});