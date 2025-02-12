let totalExpenses = 0;

function addExpense() {
    let description = document.getElementById("expenseDescription").value;
    let amount = parseFloat(document.getElementById("expenseAmount").value);
    let category = document.getElementById("expenseCategory").value;

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
        return;
    }

    // Add a unique ID to the expense
    let expense = { id: Date.now(), description, amount, category };

    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(savedExpenses));

    addExpenseToDOM(expense); // Pass the entire expense object
    updateProgressBar();
    updateTotalExpenses();
}

document.addEventListener("DOMContentLoaded", loadExpenses);

function loadExpenses() {
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.forEach(expense => addExpenseToDOM(expense)); // Pass the entire expense object
    updateTotalExpenses();
}

function addExpenseToDOM(expense) {
    let expensesList = document.getElementById(`expenses${expense.category}`);
    let listItem = document.createElement("li");
    listItem.textContent = `${expense.description}: $${expense.amount.toFixed(2)}`;

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = function () {
        expensesList.removeChild(listItem); // Remove from DOM
        removeExpenseFromStorage(expense.id); // Remove from localStorage using the unique ID
        updateTotalExpenses();
        updateRemainingBudget();
        updateProgressBar();
    };

    listItem.appendChild(deleteBtn);
    expensesList.appendChild(listItem);
}

function removeExpenseFromStorage(id) {
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let filteredExpenses = savedExpenses.filter(expense => expense.id !== id); // Filter by ID
    localStorage.setItem("expenses", JSON.stringify(filteredExpenses));
    updateTotalExpenses();
}


function updateTotalExpenses() {
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let total = savedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    document.getElementById("totalExpenses").textContent = `$${total.toFixed(2)}`;
}
function setSavingsGoal() {
    let goal = parseFloat(document.getElementById("savingsGoalInput").value);
    if (isNaN(goal) || goal <= 0) {
        alert("Ingresa una meta válida.");
        return;
    }
    localStorage.setItem("savingsGoal", goal);
    document.getElementById("savingsGoal").textContent = `$${goal}`;
    checkGoal();
}

function checkGoal() {
    let goal = parseFloat(localStorage.getItem("savingsGoal")) || 0;
    let total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;

    if (total >= goal) {
        alert("¡Has alcanzado tu meta de ahorro!");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let savedGoal = localStorage.getItem("savingsGoal");
    if (savedGoal) {
        document.getElementById("savingsGoal").textContent = `$${savedGoal}`;
    }
});

function updateProgressBar() {
    let budget = parseFloat(localStorage.getItem("monthlyBudget")) || 0; // Get the monthly budget
    let total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0; // Get total expenses
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0; // Get the savings goal

    if (budget <= 0 || savingsGoal <= 0) {
        // If no budget or savings goal is set, set progress to 0%
        document.getElementById("progress").style.width = "0%";
        document.getElementById("progress").style.background = "red"; // Default to red
        return;
    }

    // Calculate the unused portion of the budget
    let unusedBudget = budget - total;

    // Calculate the progress based on how much of the unused budget contributes to the savings goal
    let progress = (unusedBudget / savingsGoal) * 100;

    // Cap the progress at 100% if the unused budget exceeds the savings goal
    if (progress > 100) progress = 100;

    // Update the progress bar width
    document.getElementById("progress").style.width = `${progress}%`;

    // Dynamically calculate the gradient based on the progress percentage
    let red = 255;
    let green = 0;
    if (progress <= 50) {
        // Transition from red to yellow (0% to 50%)
        green = Math.floor((progress / 50) * 255);
    } else {
        // Transition from yellow to green (50% to 100%)
        red = Math.floor(((100 - progress) / 50) * 255);
        green = 255;
    }

    // Set the background color using the calculated RGB values
    document.getElementById("progress").style.background = `rgb(${red}, ${green}, 0)`;
}

// Call this function whenever you update expenses or savings goal
updateProgressBar();

function setMonthlyBudget() {
    let budget = parseFloat(document.getElementById("monthlyBudgetInput").value);
    if (isNaN(budget) || budget <= 0) {
        alert("Ingresa un presupuesto válido.");
        return;
    }
    localStorage.setItem("monthlyBudget", budget);
    updateRemainingBudget();
    updateProgressBar();
    updateTotalExpenses(); // Update progress bar after setting budget
}

function updateRemainingBudget() {
    let budget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;
    let total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
    let remaining = budget - total;
    document.getElementById("remainingBudget").textContent = `$${remaining.toFixed(2)}`;
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
