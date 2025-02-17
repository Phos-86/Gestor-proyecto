let totalExpenses = 0;
let hasShownLowBudgetWarning = false;
let hasShownBudgetDepletedWarning = false;
let hasShownSavingsMessage = false; // Track if savings message has been shown

function addExpense() {
    const description = document.getElementById("expenseDescription").value;
    const amount = parseFloat(document.getElementById("expenseAmount").value);
    const category = document.getElementById("expenseCategory").value;

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
        return;
    }

    const expense = { id: Date.now(), description, amount, category };
    const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    savedExpenses.push(expense);
    localStorage.setItem(getUserKey('expenses'), JSON.stringify(savedExpenses));

    addExpenseToDOM(expense);
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
    document.getElementById("expenseDescription").value = "";
    document.getElementById("expenseAmount").value = "";
}
function removeExpenseFromStorage(id) {
    const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    const filteredExpenses = savedExpenses.filter(expense => expense.id !== id);
    localStorage.setItem(getUserKey('expenses'), JSON.stringify(filteredExpenses));

    // Update the UI
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
}
document.addEventListener("DOMContentLoaded", loadExpenses);

function loadExpenses() {
    // Clear existing expenses from the DOM
    const categories = ["Food", "Rent", "Entertainment", "Transport", "Other"];
    categories.forEach(category => {
        document.getElementById(`expenses${category}`).innerHTML = "";
    });

    // Load expenses from localStorage for the current user
    const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    savedExpenses.forEach(expense => addExpenseToDOM(expense));

    // Update the UI
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
}


function addExpenseToDOM(expense) {
    const expensesList = document.getElementById(`expenses${expense.category}`);
    if (!expensesList) {
        console.error(`Element with ID 'expenses${expense.category}' not found.`);
        return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = `${expense.description}: $${expense.amount.toFixed(2)}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = function () {
        expensesList.removeChild(listItem); // Remove from DOM
        removeExpenseFromStorage(expense.id); // Remove from localStorage
    };

    listItem.appendChild(deleteBtn);
    expensesList.appendChild(listItem);
}


function updateTotalExpenses() {
    const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    const total = savedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("totalExpenses").textContent = `$${total.toFixed(2)}`;
}
function setSavingsGoal() {
    const goal = parseFloat(document.getElementById("savingsGoalInput").value);
    if (isNaN(goal) || goal <= 0) {
        alert("Ingresa una meta válida.");
        return;
    }
    localStorage.setItem(getUserKey('savingsGoal'), goal);
    localStorage.setItem("lastResetDate", new Date().toISOString()); // Update the last reset date

    document.getElementById("savingsGoal").textContent = `$${goal}`;
    updateProgressBar(); // Ensure the progress bar is updated
}


function checkGoal() {
    let goal = parseFloat(localStorage.getItem("savingsGoal")) || 0;
    let total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;

    if (total >= goal) {
        alert("¡Has alcanzado tu meta de ahorro!");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    checkAndNotifyMonthlyReset(); // Ensure this is called
    checkAndResetMonthlyData();

    // Load the monthly budget from localStorage
    const savedBudget = parseFloat(localStorage.getItem(getUserKey('monthlyBudget'))) || 0;
    if (savedBudget > 0) {
        document.getElementById("monthlyBudgetInput").value = savedBudget;
    }

    // Load the savings goal from localStorage
    const savedGoal = parseFloat(localStorage.getItem(getUserKey('savingsGoal'))) || 0;
    if (savedGoal > 0) {
        document.getElementById("savingsGoalInput").value = savedGoal;
        document.getElementById("savingsGoal").textContent = `$${savedGoal.toFixed(2)}`;
    }

    // Load expenses and goals
    loadExpenses();
    const goals = JSON.parse(localStorage.getItem(getUserKey('goals'))) || [];
    goals.forEach(goal => addGoalToDOM(goal));

    // Update the UI with the correct values
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
});


function updateProgressBar() {
    const savingsGoal = parseFloat(localStorage.getItem(getUserKey('savingsGoal'))) || 0;
    const totalExpenses = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
    const budget = parseFloat(localStorage.getItem(getUserKey('monthlyBudget'))) || 0;
    
    if (savingsGoal <= 0 || budget <= 0) {
        document.getElementById("progress").style.width = "0%";
        document.getElementById("progress").style.background = "red";
        return;
    }

    const savings = budget - totalExpenses; // How much you've saved
    let progress = (savings / savingsGoal) * 100;
    if (progress > 100) progress = 100;
    if (progress < 0) progress = 0; // Prevent negative values

    document.getElementById("progress").style.width = `${progress}%`;

    // Adjust color based on progress
    let red = 255, green = 0;
    if (progress <= 50) {
        green = Math.floor((progress / 50) * 255);
    } else {
        red = Math.floor(((100 - progress) / 50) * 255);
        green = 255;
    }

    document.getElementById("progress").style.background = `rgb(${red}, ${green}, 0)`;
}
// Call this function whenever you update expenses or savings goal
updateProgressBar();
function setMonthlyBudget() {
    const budget = parseFloat(document.getElementById("monthlyBudgetInput").value);
    if (isNaN(budget) || budget <= 0) {
        alert("Ingresa un presupuesto válido.");
        return;
    }
    localStorage.setItem(getUserKey('monthlyBudget'), budget);
     localStorage.setItem("lastResetDate", new Date().toISOString()); // Update the last reset date

    updateRemainingBudget();
    updateProgressBar();
    updateTotalExpenses();
}

function updateRemainingBudget() {
    const budget = parseFloat(localStorage.getItem(getUserKey('monthlyBudget'))) || 0;
    const total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
    const remaining = budget - total;

    // Update the remaining budget display
    document.getElementById("remainingBudget").textContent = `$${remaining.toFixed(2)}`;

    // Check if the budget is set before showing any warnings
    if (budget > 0) {
        // Check if the budget is low (e.g., less than 20% of the budget)
        const lowBudgetThreshold = budget * 0.2; // 20% of the budget
        if (remaining > 0 && remaining <= lowBudgetThreshold) {
            if (!hasShownLowBudgetWarning) {
                alert("¡Advertencia! Tu presupuesto está bajo. Te quedan $" + remaining.toFixed(2) + ".");
                hasShownLowBudgetWarning = true; // Set the flag to true to prevent repeated warnings
            }
        } else {
            // Reset the flag if the remaining budget is above the threshold
            hasShownLowBudgetWarning = false;
        }

        // Check if the budget has run out
        if (remaining <= 0) {
            if (!hasShownBudgetDepletedWarning) {
                alert("¡Advertencia! Tu presupuesto se ha agotado.");
                hasShownBudgetDepletedWarning = true; // Set the flag to true to prevent repeated warnings
            }
        } else {
            // Reset the flag if the remaining budget is above zero
            hasShownBudgetDepletedWarning = false;
        }
    }
}

// Call this function whenever you update expenses
updateRemainingBudget();

function toggleCategory(category) {
    // Get the list element for the category
    let list = document.getElementById(`expenses${category}`);
    // Get the header element for the category
    let header = list.previousElementSibling;

    // Toggle the collapsed class on the list
    list.classList.toggle("collapsed");

    // Update the header text to show ▼ or ▲
    if (list.classList.contains("collapsed")) {
        header.innerHTML = `${header.textContent.replace("▲", "▼")}`;
    } else {
        header.innerHTML = `${header.textContent.replace("▼", "▲")}`;
    }
}

function checkAndNotifyMonthlyReset() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const lastResetDate = localStorage.getItem("lastResetDate");

    if (lastResetDate) function checkAndNotifyMonthlyReset() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastResetDate = localStorage.getItem("lastResetDate");

    if (lastResetDate) {
        const lastReset = new Date(lastResetDate);
        const lastResetMonth = lastReset.getMonth();
        const lastResetYear = lastReset.getFullYear();

        if (currentMonth !== lastResetMonth || currentYear !== lastResetYear) {
            // Retrieve data BEFORE reset
            const previousGoal = parseFloat(localStorage.getItem(getUserKey('savingsGoal'))) || 0;
            const previousTotal = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;

            // Reset data and UI
            localStorage.removeItem(getUserKey('monthlyBudget'));
            localStorage.removeItem(getUserKey('savingsGoal'));
            localStorage.removeItem(getUserKey('expenses'));
            localStorage.removeItem(getUserKey('goals'));
            localStorage.setItem("lastResetDate", currentDate.toISOString());

            // Clear UI
            document.getElementById("totalExpenses").textContent = "$0";
            document.getElementById("savingsGoal").textContent = "$0";
            document.getElementById("remainingBudget").textContent = "$0";
            ["Food", "Rent", "Entertainment", "Transport", "Other"].forEach(category => {
                document.getElementById(`expenses${category}`).innerHTML = "";
            });
            document.getElementById("goalsList").innerHTML = "";

            // Refresh UI
            loadExpenses();
            updateTotalExpenses();
            updateRemainingBudget();
            updateProgressBar();

            // Check savings goal with previous data
            checkSavingsGoalAfterReset(previousGoal, previousTotal); // Pass parameters here
        }
    } else {
        localStorage.setItem("lastResetDate", currentDate.toISOString());
    }
}

// Function to notify the user
function notifyUser(title, message) {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications. Please enable them in your browser settings.");
        return;
    }

    // Check if the user has granted permission to show notifications
    if (Notification.permission === "granted") {
        // If permission is granted, show the notification
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        // If permission is not granted, request permission only once
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}

function checkAndResetMonthlyData() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const lastResetDate = localStorage.getItem("lastResetDate");

    if (lastResetDate) {
        const lastReset = new Date(lastResetDate);
        const lastResetMonth = lastReset.getMonth();
        const lastResetYear = lastReset.getFullYear();

        if (currentMonth !== lastResetMonth || currentYear !== lastResetYear) {
            // Reset all data
            localStorage.removeItem(getUserKey('monthlyBudget'));
            localStorage.removeItem(getUserKey('savingsGoal'));
            localStorage.removeItem(getUserKey('expenses'));
            localStorage.removeItem(getUserKey('goals'));

            // Update reset date
            localStorage.setItem("lastResetDate", currentDate.toISOString());

            // Reset UI values
            document.getElementById("totalExpenses").textContent = "$0";
            document.getElementById("savingsGoal").textContent = "$0";
            document.getElementById("remainingBudget").textContent = "$0";
            document.getElementById("progress").style.width = "0%";
            document.getElementById("progress").style.background = "red";

            // Clear expenses from categories
            ["Food", "Rent", "Entertainment", "Transport", "Other"].forEach(category => {
                document.getElementById(`expenses${category}`).innerHTML = "";
            });

            document.getElementById("goalsList").innerHTML = "";

            // Ensure UI is refreshed
            loadExpenses();
            updateTotalExpenses();
            updateRemainingBudget();
            updateProgressBar();
        }
    } else {
        localStorage.setItem("lastResetDate", currentDate.toISOString());
    }
}
let goals = JSON.parse(localStorage.getItem("goals")) || [];

function addGoal() {
    const description = document.getElementById("goalDescription").value;
    const amount = parseFloat(document.getElementById("goalAmount").value);

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
        return;
    }

    const goal = { id: Date.now(), description, amount, currentAmount: 0 };
    const goals = JSON.parse(localStorage.getItem(getUserKey('goals'))) || [];
    goals.push(goal);
    localStorage.setItem(getUserKey('goals'), JSON.stringify(goals));

    addGoalToDOM(goal);
    document.getElementById("goalDescription").value = "";
    document.getElementById("goalAmount").value = "";
}

function addGoalToDOM(goal) {
    const goalsList = document.getElementById("goalsList");
    const goalItem = document.createElement("div");
    goalItem.className = "goal-item";

    // Calculate the progress percentage
    const progressPercentage = (goal.currentAmount / goal.amount) * 100;

    goalItem.innerHTML = `
        <p>${goal.description}: $${goal.amount.toFixed(2)}</p>
        <p>Ahorrado: $${goal.currentAmount.toFixed(2)}</p>
        <div class="goal-progress-bar">
            <div class="goal-progress" style="width: ${progressPercentage}%;"></div>
        </div>
        <input type="number" id="addToGoal${goal.id}" placeholder="Añadir a meta">
        <button onclick="addToGoal(${goal.id})">Añadir</button>
        <button onclick="removeGoal(${goal.id})">Eliminar</button>
    `;
    goalsList.appendChild(goalItem);
}
function addToGoal(goalId) {
    const amountToAdd = parseFloat(document.getElementById(`addToGoal${goalId}`).value);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    const goals = JSON.parse(localStorage.getItem(getUserKey('goals'))) || [];
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
        alert("Meta no encontrada.");
        return;
    }

    if (goal.currentAmount + amountToAdd > goal.amount) {
        alert("No puedes añadir más de lo necesario para alcanzar la meta.");
        return;
    }

    goal.currentAmount += amountToAdd;
    localStorage.setItem(getUserKey('goals'), JSON.stringify(goals));

    // Update the DOM
    const goalItem = document.querySelector(`#goalsList .goal-item:nth-child(${goals.findIndex(g => g.id === goalId) + 1})`);
    if (goalItem) {
        const savedAmountText = goalItem.querySelector("p:nth-child(2)");
        savedAmountText.textContent = `Ahorrado: $${goal.currentAmount.toFixed(2)}`;

        const progressBar = goalItem.querySelector(".goal-progress");
        const progressPercentage = (goal.currentAmount / goal.amount) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    // Add the amount to total expenses
    const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    const expense = { id: Date.now(), description: `Ahorro para ${goal.description}`, amount: amountToAdd, category: "Savings" };
    savedExpenses.push(expense);
    localStorage.setItem(getUserKey('expenses'), JSON.stringify(savedExpenses));

    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();

    // Check if the goal is reached
    if (goal.currentAmount >= goal.amount) {
        alert(`¡Felicidades! Has alcanzado tu meta de ${goal.description}.`);
        removeGoal(goalId, true); // Remove the goal after completion
    }
}

function removeGoal(goalId, keepSavings = false) {
    // Find the goal to get its description
    const goals = JSON.parse(localStorage.getItem(getUserKey('goals'))) || [];
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
        console.error("Goal not found.");
        return;
    }

    // Remove the goal from the goals array
    const updatedGoals = goals.filter(g => g.id !== goalId);
    localStorage.setItem(getUserKey('goals'), JSON.stringify(updatedGoals));

    // Remove the goal from the DOM
    const goalItem = document.querySelector(`#goalsList .goal-item`);
    if (goalItem) {
        goalItem.remove();
    }

    // Only remove savings expenses if keepSavings is false
    if (!keepSavings) {
        const savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
        const filteredExpenses = savedExpenses.filter(expense => {
            // Check if the expense is related to the goal
            if (expense.category === "Savings" && expense.description.includes(goal.description)) {
                // Remove the expense from the DOM
                const expenseItem = document.querySelector(`#expensesSavings li[data-id="${expense.id}"]`);
                if (expenseItem) {
                    expenseItem.remove();
                }
                return false; // Exclude this expense from the filtered list
            }
            return true; // Keep this expense in the filtered list
        });

        // Update localStorage with the filtered expenses
        localStorage.setItem(getUserKey('expenses'), JSON.stringify(filteredExpenses));
    }

    // Update the total expenses and remaining budget
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
}

// Get the button
let backToTopBtn = document.getElementById("backToTopBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.addEventListener("scroll", function() {
    console.log("Scroll event triggered");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

// When the user clicks on the button, scroll to the top of the document
backToTopBtn.onclick = function() {
    console.log("Button clicked"); // Debugging line
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
};
if (!backToTopBtn) {
    console.error("Error: #backToTopBtn not found in the DOM.");
}


function simulateMonthlyReset() {
    console.log("Simulate Monthly Reset button clicked!");
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setMonth(currentDate.getMonth() - 1);
    localStorage.setItem("lastResetDate", lastMonthDate.toISOString());

    checkAndResetMonthlyData(); // Reset data
    checkAndNotifyMonthlyReset(); // Add this line to trigger savings check
    alert("Reinicio mensual simulado. Los datos se han restablecido.");
}


function signup() {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (!username || !password) {
        alert("Por favor ingrese un nombre de usuario y contraseña.");
        return;
    }

    // Check if the user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        alert("Nombre de usuario ya existente. Por favor eliga un nombre diferente.");
        return;
    }

    // Save the new user
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert("Cuenta creada correctamente! Por favor inicie sesión.");
}

// Function to log in an existing user
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert("Por favor ingrese un nombre de usuario y contraseña.");
        return;
    }

    // Check if the user exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        alert("Sesión inciada correctamente!");
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

        // Save the current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        alert("Nombre de usuario o contraseña invalidos.");
    }
}

// Function to check if a user is logged in
function checkLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        closeModal();
        document.getElementById('dashboard').style.display = 'block';

        // Clear existing data from the DOM
        const categories = ["Food", "Rent", "Entertainment", "Transport", "Other"];
        categories.forEach(category => {
            document.getElementById(`expenses${category}`).innerHTML = "";
        });
        document.getElementById("goalsList").innerHTML = "";

        // Reload all user-specific data
        loadExpenses();
        const goals = JSON.parse(localStorage.getItem(getUserKey('goals'))) || [];
        goals.forEach(goal => addGoalToDOM(goal));
        updateTotalExpenses();
        updateRemainingBudget();
        updateProgressBar();
    } else {
        openModal();
        document.getElementById('dashboard').style.display = 'none';
    }
}

// Check login status when the page loads
document.addEventListener("DOMContentLoaded", checkLogin);

function getUserKey(key) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser ? `${currentUser.username}_${key}` : key;
}
// Example usage
const expenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
localStorage.setItem(getUserKey('expenses'), JSON.stringify(expenses));

function logout() {
    localStorage.removeItem('currentUser');
    alert("Sesión cerrada correctamente!");
    checkLogin(); // Show the modal again

    // Clear the existing data from the DOM
    const categories = ["Food", "Rent", "Entertainment", "Transport", "Other"];
    categories.forEach(category => {
        document.getElementById(`expenses${category}`).innerHTML = "";
    });
    document.getElementById("goalsList").innerHTML = "";

    // Reset the UI
    document.getElementById("totalExpenses").textContent = "$0";
    document.getElementById("savingsGoal").textContent = "$0";
    document.getElementById("remainingBudget").textContent = "$0";
    document.getElementById("progress").style.width = "0%";
    document.getElementById("progress").style.background = "red";
}

function signup() {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (!username || !password) {
        alert("Por favor ingrese un nombre de usuario y contraseña.");
        return;
    }

    // Hash the password using CryptoJS
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // Save the new user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        alert("Nombre de usuario ya existente. Por favor eliga un nombre diferente.");
        return;
    }

    users.push({ username, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));

    alert("usuario creado correctamente! Por favor inicie sesión.");
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert("Por favor ingrese un nombre de usuario y contraseña.");
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    const hashedPassword = CryptoJS.SHA256(password).toString();

    if (user && user.password === hashedPassword) {
        alert("Sesión inciada correctamente!");
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkLogin(); // Force reload of user-specific data
    } else {
        alert("Nombre de usuario o contraseña invalidos.");
    }
}





function openModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.body.classList.add('modal-open'); // Add class to disable main content
}

// Function to close the modal
function closeModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove('modal-open'); // Remove class to enable main content
}

// Function to check login status

// Check login status when the page loads
document.addEventListener("DOMContentLoaded", checkLogin);

// Example login function (using CryptoJS)
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert("Por favor ingrese un nombre de usuario y contraseña.");
        return;
    }

    // Check if the user exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username);

    // Hash the input password and compare
    const hashedPassword = CryptoJS.SHA256(password).toString();

    if (user && user.password === hashedPassword) {
        alert("Sesión inciada correctamente!");
        localStorage.setItem('currentUser', JSON.stringify(user));
        checkLogin(); // Update the UI
    } else {
        alert("Nombre de usuario o contraseña invalidos.");
    }
}


function removeUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert("No existen usuarios conectados.");
        return;
    }

    const confirmDelete = confirm("Estas seguro que quieres eliminar esta cuenta? Esta acción es ABSOLUTA no puede ser deshecha.");
    if (!confirmDelete) return;

    // Remove user-specific data
    localStorage.removeItem(getUserKey('expenses'));
    localStorage.removeItem(getUserKey('monthlyBudget'));
    localStorage.removeItem(getUserKey('savingsGoal'));

    // Remove the user from the users list
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(user => user.username !== currentUser.username);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Clear the current user and reset the UI
    localStorage.removeItem('currentUser');
    alert("Cuenta eliminada correctamente.");
    checkLogin();
}

console.log("Current User Key:", getUserKey('expenses'));
console.log("Expenses in localStorage:", JSON.parse(localStorage.getItem(getUserKey('expenses'))));

function checkSavingsGoalAfterReset(previousGoal, previousTotal) {
    if (previousGoal === 0) {
        console.log("No savings goal set last month.");
        return; // Skip if no goal
    }

    if (previousTotal >= previousGoal) {
        alert("¡Has alcanzado tu meta de ahorro del mes anterior!");
    } else {
        const progress = (previousTotal / previousGoal) * 100;
        if (progress >= 75) {
            alert("¡Casi llegaste a tu meta de ahorro el mes pasado!");
        } else if (progress >= 25) {
            alert("Vas por buen camino, pero aún te faltó el mes pasado.");
        } else if (progress > 0) {
            alert("Muy pocos ahorros realizados el mes pasado.");
        } else {
            alert("No se realizaron ahorros el mes pasado.");
        }
    }
}



console.log("Before reset - Savings Goal:", previousGoal);
console.log("Before reset - Total Expenses:", previousTotal);