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
    const querySnapshot = await getDocs(collection(db, "links"));
    const linksTable = document.getElementById('linksTable');
    linksTable.innerHTML = '';
    
    // Convert querySnapshot to array and sort by name
    const links = [];
    querySnapshot.forEach((doc) => {
        links.push({ ...doc.data(), id: doc.id });
    });
    
    links.sort((a, b) => a.name.localeCompare(b.name));

    links.forEach((link) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" value="${link.name}" data-id="${link.id}" class="link-name" /></td>
            <td><input type="text" value="${link.url}" data-id="${link.id}" class="link-url" /></td>
            <td>
                <button class="edit-btn" data-id="${link.id}">Edit</button>
                <button class="delete-btn" data-id="${link.id}">Delete</button>
            </td>
        `;
        linksTable.appendChild(tr);
    });

    // Attach event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            updateLink(button.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            deleteLink(button.getAttribute('data-id'));
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
