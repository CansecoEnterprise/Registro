
/*============================
          FIREBASE
==============================*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where, deleteDoc, doc , updateDoc, orderBy} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";




// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDgrnlNotesiBoHVG1bBYRwN153ycPC8wo",
  authDomain: "registro-clientes-4459b.firebaseapp.com",
  projectId: "registro-clientes-4459b",
  storageBucket: "registro-clientes-4459b.firebasestorage.app",
  messagingSenderId: "248935152171",
  appId: "1:248935152171:web:498aa8fad28001a973c86e"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//Globally accessible
window.showSuccess = function(message) {
  document.getElementById('successMessage').innerText = message;
  document.getElementById('successCard').classList.remove('d-none');
  document.getElementById('cardOverlay').classList.remove('d-none');
};

window.showError = function(message) {
  document.getElementById('errorMessage').innerText = message;
  document.getElementById('errorCard').classList.remove('d-none');
  document.getElementById('cardOverlay').classList.remove('d-none');
};

window.hideCard = function(cardId) {
  document.getElementById(cardId).classList.add('d-none');
  document.getElementById('cardOverlay').classList.add('d-none');
};





// Wait for DOM Content Loader 
document.addEventListener("DOMContentLoaded", () => {

  /*============================
            login.html
  ==============================*/

const wasLoggedOut = sessionStorage.getItem("loggedOut");

if(wasLoggedOut){
alert("You've been loggged out successfully");
sessionStorage.removeItem("loggedOut"); //clean up
}

  const loginForm = document.querySelector("form#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const spinner = document.getElementById("spinner");
      if (spinner) spinner.classList.remove("d-none");

      const email = document.getElementById("exampleInputEmail").value.trim();
      const password = document.getElementById("exampleInputPassword").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        alert(`Login failed: ${error.message}`);
        console.error("Login error:", error);
      } finally {
        if (spinner) spinner.classList.add("d-none");
      }
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "clients.html";
      }
    });
  }

  /*============================
          register.html
  ==============================*/
  const registerForm = document.getElementById("registerForm");

if (registerForm) {

  // Validation functions
  function validateFirstName() {
    const name = document.getElementById("firstName");
    const nameError = document.getElementById('firstNameError');
    const checkmarkIcon = document.querySelector("#firstNameGroup .checkmark-icon");

    if (name.value.trim().length < 2) {
      nameError.textContent = "Name must be at least 2 characters.";
      checkmarkIcon.classList.remove("visible");
      return false;
    } else {
      nameError.textContent = "";
      checkmarkIcon.classList.add("visible");
      return true;
    }
  }

  function validateLastName() {
    const lastName = document.getElementById('lastName');
    const lastError = document.getElementById('lastNameError');
    const lastNameCheck = document.getElementById("lastNameCheck");

    if (lastName.value.trim().length < 2) {
      lastError.textContent = "Last Name must be at least 2 characters.";
      lastNameCheck.classList.remove("visible");
      return false;
    } else {
      lastError.textContent = "";
      lastNameCheck.classList.add("visible");
      return true;
    }
  }

  function validateEmail() {
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const emailCheck = document.getElementById("emailCheck");

    if (!email.validity.valid) {
      emailError.textContent = "Enter a valid email address.";
      emailCheck.classList.remove("visible");
      return false;
    } else {
      emailError.textContent = "";
      emailCheck.classList.add("visible");
      return true;
    }
  }

  function validatePhone() {
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phoneCheck = document.getElementById("phoneCheck");
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone.value)) {
      phoneError.textContent = "Phone must be 10 digits.";
      phoneCheck.classList.remove("visible");
      return false;
    } else {
      phoneError.textContent = "";
      phoneCheck.classList.add("visible");
      return true;
    }
  }

  // Attach blur event listeners
  document.getElementById("firstName").addEventListener("blur", validateFirstName);
  document.getElementById("lastName").addEventListener("blur", validateLastName);
  document.getElementById("email").addEventListener("blur", validateEmail);
  document.getElementById("phone").addEventListener("blur", validatePhone);

  
  function showFormErrorBanner(){
    const banner = document.getElementById("formErrorBanner");


    banner.style.display = "block";
    banner.scrollIntoView({behavior: "smooth"});

    setTimeout(() =>{
      banner.style.display = "none";
    }, 5000);
  }
  
// Checkmark references 
const checkmarkIcon = document.querySelector("#firstNameGroup .checkmark-icon");
const lastNameCheck = document.getElementById("lastNameCheck");
const emailCheck = document.getElementById("emailCheck");
const phoneCheck = document.getElementById("phoneCheck");

function resetCheckmark() {
    checkmarkIcon.classList.remove("visible");
    lastNameCheck.classList.remove("visible");
    emailCheck.classList.remove("visible");
    phoneCheck.classList.remove("visible");
}

// Check if user already exists
async function checkIfUserExists(email, phone) {
  const usersRef = collection(db, "clients");

  try {
    // Check if online before querying
    if (!navigator.onLine) {
      alert("You're offline. Cannot verify user details.");
      resetCheckmark();
      registerForm.reset();
      return true; // Block registration as a safety fallback
    }

    // Query by email
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnap = await getDocs(emailQuery);

    if (!emailSnap.empty) {
      // alert("User already registered with that email.");
      showError("User already registered with that email.");
      resetCheckmark();   
      registerForm.reset();
      return true;
    }

    // Check again if internet is still online before second query
    if (!navigator.onLine) {
      alert("You're offline. Could not complete verification.");
      resetCheckmark();
      registerForm.reset();        
      return true;
    }

    // Query by phone
    const phoneQuery = query(usersRef, where("phone", "==", phone));
    const phoneSnap = await getDocs(phoneQuery);

    if (!phoneSnap.empty) {
      // alert("User already registered with that phone number.");
      showError("User already registered with that phone number.");
      resetCheckmark();
      registerForm.reset();
      return true;
    }

    // No existing user found
    return false;

  } catch (error) {
    console.error("Error checking if user exists:", error.code, error.message);

    if (!navigator.onLine || error.code === 'unavailable') {
      alert("Network issue. Please check your internet connection.");
    } else {
      alert("An error occurred while checking registration. Please try again.");
    }
    resetCheckmark();
    registerForm.reset();
    return true; // Block registration to avoid duplicates
  }
}

const submitBtn = document.getElementById("submitBtn");

 
 // Firebase submission function
async function submitToFirebase() {
  const firstname = document.getElementById("firstName").value.trim();
  const lastname = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const spinner = document.getElementById("spinner");

  if (!navigator.onLine) {
    alert("You are offline. Please check your connection before submitting.");
    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.classList.add("d-none");
    return;
  }

  try {
    if (spinner) spinner.classList.remove("d-none");

    const userExists = await checkIfUserExists(email, phone);
    
    // If the check failed due to network issues, treat as block
    if (userExists) {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.classList.add("d-none");
      return;
    }

    // Double-check internet before final submission
    if (!navigator.onLine) {
      alert("Internet connection lost. Please reconnect and try again.");
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.classList.add("d-none");
      return;
    }

    await addDoc(collection(db, "clients"), {
      firstname,
      lastname,
      email,
      phone,
      datetime: serverTimestamp()
    });

    // alert("Thank you for registering!");
    showSuccess("Thank you for registering!");
    registerForm.reset();  // Ensure your form has id="registerForm"
    if (spinner) spinner.classList.add("d-none");
  
setTimeout(() => {
  window.location.href = "index.html";
}, 2000);


  } catch (error) {
    console.error("Error submitting form: ", error);

    if (!navigator.onLine) {
      alert("You're offline. Please try again when you reconnect.");
    } else {
      // alert("Registration failed. Please try again.");
      showError("Registration failed. Please try again.");
    }

    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.classList.add("d-none");
  }
}


  //Action when submit button is pressed
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();


    if (submitBtn) submitBtn.disabled = true; // 🔒 Disable button right away

    const valid =
      validateFirstName() &&
      validateLastName() &&
      validateEmail() &&
      validatePhone();
  

      //If everything validated submit data to firestore DB
    if (valid) {
      submitToFirebase();
    } else {

      //Banner display if user still hasnt fixed issues
  showFormErrorBanner()

  if(submitBtn){
 submitBtn.disabled = false; // 🔓 Re-enable if validation failed
  } 
    }
  });

}

/*============================
      clients.html
==============================*/
if (window.location.pathname.includes("clients.html")) {
  




  window.addEventListener("pageshow", (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
      location.reload(); // Force reload when returning via back/forward
    }
  });
  

  const rowsPerPage = 8;
  let clientsData = [];
  let currentPage = 1;
   let isLoggingOut = false;

  //If user isnt loged in dont display table data
onAuthStateChanged(auth,(user) =>{


if(user){
loadClients();
}else{

  if(!isLoggingOut){
    alert("Please Login to view this page.");
    window.location.href = "login.html";
  }

  
}

});

//Generic toast toggle
function showToast(message, status = "success") {
  const toastEl = document.getElementById("genericToast");
  const toastBody = document.getElementById("toastBody");
  const toastIcon = document.getElementById("toastIcon");
  const toastInner = document.getElementById("toastInner");

  // Set message
  toastBody.textContent = message;

  // Reset background and icon classes
  toastInner.classList.remove("bg-success", "bg-danger");
  toastIcon.className = "bi fs-4"; // Reset icon

  // Set styles based on status
  if (status === "success") {
    toastInner.classList.add("bg-success");
    toastIcon.classList.add("bi-check-circle-fill");
  } else if (status === "error") {
    toastInner.classList.add("bg-danger");
    toastIcon.classList.add("bi-x-circle-fill");
  }

  // Show toast
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
    delay: 2000,
    autohide: true,
  });

  toast.show();
}




//Log out the user
document.getElementById("logoutBtn").addEventListener("click", () => {
  const spinnerOverlay = document.getElementById("logoutSpinnerContainer");
isLoggingOut = true;
  // Show spinner
  spinnerOverlay.classList.remove("d-none");

  signOut(auth)
    .then(() => {
      sessionStorage.setItem("loggedOut", "true");

      // ⏱️ Delay redirect by 1.5 seconds to show spinner
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000); // Adjust milliseconds as needed (1000 = 1 second)
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Failed to logout: " + error.message);

      // Hide spinner on failure
      spinnerOverlay.classList.add("d-none");
    });
});

//Load Database clients to view recent added outside of webpage refresh the page
  async function loadClients() {



    const q = await query(collection(db, "clients"), orderBy("datetime","desc"));

    const querySnapshot = await getDocs(q);


    clientsData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.datetime?.toDate?.().toLocaleString?.() || "";
      clientsData.push({
        id: doc.id, // Add the Firestore document ID
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        email: data.email || "",
        phone: data.phone || "",
        date: date
      });
    });
//Total Clients Number
    document.getElementById("totalClients").textContent = `Total Sign-ins: ${clientsData.length}`;

    //Load data for the first time 
    renderTable();
    renderPagination();


  }

//search Field
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    let debounceTimeout;
  
    searchInput.addEventListener("input", () => {

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        // console.log("Search Input: ",searchInput.value);
        currentPage = 1;
        renderTable();
        renderPagination();
        
      }, 300); // 300ms debounce
    });
  }
  




  function getFilteredData() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    return clientsData.filter(client =>
      client.firstname.toLowerCase().includes(searchTerm) ||
      client.lastname.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.toLowerCase().includes(searchTerm)
    );
  }

//Format phone number function 
function formatPhoneNumber(phone) {
  if (!phone || phone.length !== 10) return phone;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
}



  function renderTable() {
    const tableBody = document.getElementById("clientTableBody");
    tableBody.innerHTML = "";

    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const rowsToShow = filtered.slice(startIndex, endIndex);

    if (rowsToShow.length === 0) {
      const searchTerm = document.getElementById("searchInput").value.trim();
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4"><i class="bi bi-search me-2"></i>
            No results found for "<strong>${searchTerm}</strong>"
          </td>
        </tr>`;
      return;
    }

    rowsToShow.forEach(data => {


const formattedPhone = formatPhoneNumber(data.phone);


      const row = `
        <tr>
        <td>
        <span class="custom-checkbox">
        <input type="checkbox" id="checkbox1" name="options[]" value="1">
        <label for="checkbox1"></label>
        </span>
        </td>
          <td>${data.firstname} ${data.lastname}</td>
          <td>${data.email}</td>
          <td>${formattedPhone}</td>
          <td>${new Date(data.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          })}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary edit-icon" data-id="${data.id}" title="Edit"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger delete-icon" data-id="${data.id}" title="Delete"> <i class="bi bi-trash"></i></button>
         </td>
        </tr>`;
      tableBody.innerHTML += row;
    });
  }

  function renderPagination() {
    const pagination = document.getElementById("paginationControls");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = `btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable();
        renderPagination();
      });
      pagination.appendChild(btn);
    }
  }
// ------------------------------  CRUD OPERATIONS ON FIRESTORE DB ------------------------------









//CREATE 

const addStudentForm = document.getElementById("addStudentForm");

addStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const saveBtn = document.getElementById("saveStudentBtn");
  const spinner = document.getElementById("addSpinner");
  const btnText = document.getElementById("addBtnText");

  // Show loading spinner and change button text
  spinner.classList.remove("d-none");
  btnText.textContent = "Saving...";
  saveBtn.disabled = true;

  const newStudent = {
    firstname: document.getElementById("newFirstName").value.trim(),
    lastname: document.getElementById("newLastName").value.trim(),
    email: document.getElementById("newEmail").value.trim(),
    phone: document.getElementById("newPhone").value.trim(),
    datetime: new Date(), // Optional: Add timestamp if needed
  };

  try {
    await addDoc(collection(db, "clients"), newStudent);

    // Success toast
    showToast("Student added successfully.", "success");

    // Reload or refresh data
    loadClients();

    // Reset form
    addStudentForm.reset();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("addStudentModal"));
    modal.hide();
  } catch (err) {
    console.error("Failed to add student:", err);
    showToast("Failed to add student.", "error");
  } finally {
    // Reset UI
    spinner.classList.add("d-none");
    btnText.textContent = "Save Student";
    saveBtn.disabled = false;
  }
});







//READ BY Query

function toggleFilterModal() {
  const modal = document.getElementById("filterModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

async function searchFirestore() {
  const field = document.getElementById('searchField').value;
  const value = document.getElementById('searchValue').value.trim();
  const dateInput = document.getElementById('searchDate').value;

  const db = firebase.firestore(); // or getFirestore() if using modular SDK

  let q;
  const ref = db.collection("clients");

  if (dateInput) {
    const start = new Date(dateInput);
    const end = new Date(dateInput);
    end.setHours(23, 59, 59, 999);

    q = ref
      .where("dateRegistered", ">=", start)
      .where("dateRegistered", "<=", end)
      .orderBy(field)
      .startAt(value)
      .endAt(value + "\uf8ff");
  } else {
    q = ref
      .orderBy(field)
      .startAt(value)
      .endAt(value + "\uf8ff");
  }

  try {
    const snapshot = await q.get();
    const results = snapshot.docs.map(doc => doc.data());

    renderTable(results); // Replace with your table rendering logic
    toggleFilterModal();  // Close modal after search
  } catch (err) {
    console.error("Search error:", err);
  }
}






//UPDATE BY ID
// Populate edit modal on click
let currentEditId = null;
document.addEventListener("click", async (e) => {
  if (e.target.closest(".edit-icon")) {
    const btn = e.target.closest(".edit-icon");
    currentEditId = btn.getAttribute("data-id");

    // Find data from table row (you can also fetch from Firestore if needed)
    const row = btn.closest("tr");
    const fullName = row.children[1].textContent.trim().split(" ");
    const email = row.children[2].textContent.trim();
    const phone = row.children[3].textContent.trim();

    // Prefill modal fields
    document.getElementById("editFirstName").value = fullName[0] || "";
    document.getElementById("editLastName").value = fullName[1] || "";
    document.getElementById("editEmail").value = email;
    document.getElementById("editPhone").value = phone;

    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
  }
});

// Handle save changes
const editForm = document.getElementById("editForm");
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentEditId) return;


//Refrence button, and spinner elements
const editBtn = document.getElementById("confirmEditBtn");
const spinner = document.getElementById("editSpinner");
const btnText = document.getElementById("editBtnText");


//Show spinner, change text, and disable button 
spinner.classList.remove("d-none");
btnText.textContent = "Updating...";
editBtn.disabled = true;





  const updatedData = {
    firstname: document.getElementById("editFirstName").value.trim(),
    lastname: document.getElementById("editLastName").value.trim(),
    email: document.getElementById("editEmail").value.trim(),
    phone: document.getElementById("editPhone").value.trim(),
  };

  try {
    await updateDoc(doc(db, "clients", currentEditId), updatedData);

    // Refresh table data
    loadClients();

    // Close modal
    const modalEl = document.getElementById("editModal");
    const editModalInstance = bootstrap.Modal.getInstance(modalEl);
    editModalInstance.hide();

    // alert("Entry updated successfully.");
    showToast("Successfully updated student.","success");
  } catch (err) {
    console.error("Update failed:", err);
    // alert("Failed to update record.");
    showToast("Failed to update record.");
  }finally{
//Reset UI state 
spinner.classList.add("d-none");
btnText.textContent = "Save Changes";
editBtn.disabled = false;


  }
});








// DELETE BY ID
let idToDelete = null;

document.addEventListener("click", (e) => {
  if (e.target.closest(".delete-icon")) {
    const button = e.target.closest(".delete-icon");
    idToDelete = button.getAttribute("data-id");

    const deleteModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
    deleteModal.show();
  }
});

// Confirm delete logic
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {



  if (idToDelete) {

//Refrence button, spinner, and text elements
const deleteBtn = document.getElementById("confirmDeleteBtn");
const spinner = document.getElementById("deleteSpinner");
const btnText = document.getElementById("deleteBtnText");

//Show spinner and change button text
spinner.classList.remove("d-none");
btnText.textContent = "Deleting...";
deleteBtn.disabled = true;



    try {
      await deleteDoc(doc(db, "clients", idToDelete));
      //alert("Succesfully deleted student.");

// Success (green)
showToast("Successfully deleted student.", "success");


      // Reload or re-render table
      loadClients();
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Error deleting record.");
    }finally{
//Reset button
spinner.classList.add("d-none");
btnText.textContent = "Delete";
deleteBtn.disabled = false;


    // Close modal
    const deleteModalEl = document.getElementById("deleteConfirmModal");
    const modal = bootstrap.Modal.getInstance(deleteModalEl);
    modal.hide();

      
    }


  }
});









}


});


