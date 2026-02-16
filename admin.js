import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

// Function to load links from Firestore
async function loadLinks() {
    const linksTable = document.getElementById('linksTable');
    const linksCards = document.getElementById('linksCards');
    
    // Show loading indicator
    const loadingHTML = `
        <div class="col-span-full flex flex-col justify-center items-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <p class="mt-3 text-gray-600 dark:text-gray-400">Loading links...</p>
        </div>
    `;
    linksTable.innerHTML = `<tr><td colspan="3">${loadingHTML}</td></tr>`;
    linksCards.innerHTML = loadingHTML;
    
    const querySnapshot = await getDocs(collection(db, "links"));
    linksTable.innerHTML = '';
    linksCards.innerHTML = '';
    
    // Convert querySnapshot to array and sort by name
    const links = [];
    querySnapshot.forEach((doc) => {
        links.push({ ...doc.data(), id: doc.id });
    });
    
    links.sort((a, b) => a.name.localeCompare(b.name));

    links.forEach((link) => {
        // Desktop table row
        const tr = document.createElement('tr');
        tr.className = 'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-4">
                <input type="text" value="${link.name}" data-id="${link.id}" 
                    class="link-name w-full px-2 py-1 rounded border dark:border-gray-600 bg-transparent 
                    text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </td>
            <td class="py-3 px-4">
                <input type="text" value="${link.url}" data-id="${link.id}" 
                    class="link-url w-full px-2 py-1 rounded border dark:border-gray-600 bg-transparent 
                    text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </td>
            <td class="py-3 px-4">
                <button class="edit-btn px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 transition-colors" 
                    data-id="${link.id}">Edit</button>
                <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" 
                    data-id="${link.id}">Delete</button>
            </td>
        `;
        linksTable.appendChild(tr);

        // Mobile card
        const card = document.createElement('div');
        card.className = 'bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3';
        card.innerHTML = `
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</label>
                <input type="text" value="${link.name}" data-id="${link.id}" 
                    class="link-name w-full mt-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 
                    text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">URL</label>
                <input type="text" value="${link.url}" data-id="${link.id}" 
                    class="link-url w-full mt-1 px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 
                    text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div class="flex gap-2">
                <button class="edit-btn flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm" 
                    data-id="${link.id}">Edit</button>
                <button class="delete-btn flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm" 
                    data-id="${link.id}">Delete</button>
            </div>
        `;
        linksCards.appendChild(card);
    });

    // Attach event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            updateLink(button.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            showDeleteConfirmation(button.getAttribute('data-id'));
        });
    });
}

// Function to show delete confirmation modal
function showDeleteConfirmation(id) {
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center';
    backdrop.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">Delete Link</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this link? This action cannot be undone.</p>
            <div class="flex gap-3">
                <button id="confirmDelete" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                    Delete
                </button>
                <button id="cancelDelete" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium">
                    Cancel
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(backdrop);

    backdrop.querySelector('#confirmDelete').addEventListener('click', () => {
        document.body.removeChild(backdrop);
        deleteLink(id);
    });

    backdrop.querySelector('#cancelDelete').addEventListener('click', () => {
        document.body.removeChild(backdrop);
    });

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) document.body.removeChild(backdrop);
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

// Function to handle logout
function handleLogout() {
    window.location.href = 'index.html';
}

// Event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

// Function to add a new link
async function addLink(name, url) {
    await addDoc(collection(db, "links"), { name, url });
    document.getElementById('newLinkName').value = '';
    document.getElementById('newLinkUrl').value = '';
    loadLinks();
    showFlashMessage('Link added successfully');
}

// Function to delete a link
async function deleteLink(id) {
    await deleteDoc(doc(db, "links", id));
    loadLinks();
    showFlashMessage('Link deleted successfully');
}

// Function to update a link
async function updateLink(id) {
    const name = document.querySelector(`.link-name[data-id="${id}"]`).value;
    const url = document.querySelector(`.link-url[data-id="${id}"]`).value;
    await updateDoc(doc(db, "links", id), { name, url });
    loadLinks();
    showFlashMessage('Link updated successfully');
}

// Event listener for adding a new link
document.getElementById('addNewLinkBtn').addEventListener('click', () => {
    const name = document.getElementById('newLinkName').value;
    const url = document.getElementById('newLinkUrl').value;
    addLink(name, url);
});

// Load links on page load
loadLinks();
