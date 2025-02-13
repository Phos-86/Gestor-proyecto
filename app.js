let totalExpenses = 0;

function addExpense() {
    let description = document.getElementById("expenseDescription").value;
    let amount = parseFloat(document.getElementById("expenseAmount").value);
    let category = document.getElementById("expenseCategory").value;

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
        return;
    }

    let expense = { id: Date.now(), description, amount, category };
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(savedExpenses));

    console.log("Expenses after adding:", JSON.parse(localStorage.getItem("expenses")));

    addExpenseToDOM(expense);
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
}

function removeExpenseFromStorage(id) {
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let filteredExpenses = savedExpenses.filter(expense => expense.id !== id);
    localStorage.setItem("expenses", JSON.stringify(filteredExpenses));

    console.log("Expenses after removing:", JSON.parse(localStorage.getItem("expenses")));

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

    // Load expenses from localStorage
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    savedExpenses.forEach(expense => addExpenseToDOM(expense));
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar(); // Ensure the progress bar is updated after loading expenses
}

function addExpenseToDOM(expense) {
    let expensesList = document.getElementById(`expenses${expense.category}`);
    if (!expensesList) {
        console.error(`Element with ID 'expenses${expense.category}' not found.`);
        return;
    }
    let listItem = document.createElement("li");
    listItem.textContent = `${expense.description}: $${expense.amount.toFixed(2)}`;

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = function () {
        expensesList.removeChild(listItem);
        removeExpenseFromStorage(expense.id);
        updateTotalExpenses();
        updateRemainingBudget();
        updateProgressBar();
    };

    listItem.appendChild(deleteBtn);
    expensesList.appendChild(listItem);
}

function removeExpenseFromStorage(id) {
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let filteredExpenses = savedExpenses.filter(expense => expense.id !== id);
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
    localStorage.setItem("lastResetDate", new Date().toISOString()); // Update the last reset date
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
    checkAndResetMonthlyData(); // Check and reset monthly data if necessary

    // Load the monthly budget from localStorage
    let savedBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;
    if (savedBudget > 0) {
        document.getElementById("monthlyBudgetInput").value = savedBudget;
    }

    // Load the savings goal from localStorage
    let savedGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;
    if (savedGoal > 0) {
        document.getElementById("savingsGoalInput").value = savedGoal;
        document.getElementById("savingsGoal").textContent = `$${savedGoal.toFixed(2)}`;
    }

    // Load expenses and goals
    loadExpenses();
    goals.forEach(goal => addGoalToDOM(goal));

    // Update the UI with the correct values
    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
});

function updateProgressBar() {
    let budget = parseFloat(localStorage.getItem("monthlyBudget")) || 0;
    let total = parseFloat(document.getElementById("totalExpenses").textContent.replace("$", "")) || 0;
    let savingsGoal = parseFloat(localStorage.getItem("savingsGoal")) || 0;

    if (budget <= 0 || savingsGoal <= 0) {
        document.getElementById("progress").style.width = "0%";
        document.getElementById("progress").style.background = "red";
        return;
    }

    let unusedBudget = budget - total;
    let progress = (unusedBudget / savingsGoal) * 100;
    if (progress > 100) progress = 100;

    document.getElementById("progress").style.width = `${progress}%`;

    let red = 255;
    let green = 0;
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
    let budget = parseFloat(document.getElementById("monthlyBudgetInput").value);
    if (isNaN(budget) || budget <= 0) {
        alert("Ingresa un presupuesto válido.");
        return;
    }
    localStorage.setItem("monthlyBudget", budget);
    localStorage.setItem("lastResetDate", new Date().toISOString()); // Update the last reset date
    updateRemainingBudget();
    updateProgressBar();
    updateTotalExpenses();
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
            localStorage.removeItem("monthlyBudget");
            localStorage.removeItem("savingsGoal");
            localStorage.removeItem("expenses");
            localStorage.removeItem("goals");

            localStorage.setItem("lastResetDate", currentDate.toISOString());

            document.getElementById("totalExpenses").textContent = "$0";
            document.getElementById("savingsGoal").textContent = "$0";
            document.getElementById("remainingBudget").textContent = "$0";
            document.getElementById("progress").style.width = "0%";
            document.getElementById("progress").style.background = "red";

            const categories = ["Food", "Rent", "Entertainment", "Transport", "Other"];
            categories.forEach(category => {
                document.getElementById(`expenses${category}`).innerHTML = "";
            });

            document.getElementById("goalsList").innerHTML = "";

            // Update the progress bar and remaining budget after resetting data
            updateProgressBar();
            updateRemainingBudget();
        }
    } else {
        localStorage.setItem("lastResetDate", currentDate.toISOString());
    }
}
let goals = JSON.parse(localStorage.getItem("goals")) || [];

function addGoal() {
    let description = document.getElementById("goalDescription").value;
    let amount = parseFloat(document.getElementById("goalAmount").value);

    if (description === "" || isNaN(amount) || amount <= 0) {
        alert("Por favor, ingresa una descripción válida y un monto mayor a 0.");
        return;
    }

    let goal = { id: Date.now(), description, amount, currentAmount: 0 };
    goals.push(goal);
    localStorage.setItem("goals", JSON.stringify(goals));

    addGoalToDOM(goal);
}

function addGoalToDOM(goal) {
    let goalsList = document.getElementById("goalsList");
    let goalItem = document.createElement("div");
    goalItem.className = "goal-item";

    // Calculate the progress percentage
    let progressPercentage = (goal.currentAmount / goal.amount) * 100;

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
    let amountToAdd = parseFloat(document.getElementById(`addToGoal${goalId}`).value);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    let goal = goals.find(g => g.id === goalId);
    if (goal.currentAmount + amountToAdd > goal.amount) {
        alert("No puedes añadir más de lo necesario para alcanzar la meta.");
        return;
    }

    goal.currentAmount += amountToAdd;
    localStorage.setItem("goals", JSON.stringify(goals));

    // Update the DOM
    let goalItem = document.querySelector(`#goalsList .goal-item:nth-child(${goals.findIndex(g => g.id === goalId) + 1})`);
if (goalItem) {
    let savedAmountText = goalItem.querySelector("p:nth-child(2)");
    savedAmountText.textContent = `Ahorrado: $${goal.currentAmount.toFixed(2)}`;

    let progressBar = goalItem.querySelector(".goal-progress");
    let progressPercentage = (goal.currentAmount / goal.amount) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

    // Add the amount to total expenses
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expense = { id: Date.now(), description: `Ahorro para ${goal.description}`, amount: amountToAdd, category: "Savings" };
    savedExpenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(savedExpenses));

    updateTotalExpenses();
    updateRemainingBudget();
    updateProgressBar();
}

function removeGoal(goalId) {
    // Find the goal to get its description
    let goal = goals.find(g => g.id === goalId);
    if (!goal) {
        console.error("Goal not found.");
        return;
    }

    // Remove the goal from the goals array
    goals = goals.filter(g => g.id !== goalId);
    localStorage.setItem("goals", JSON.stringify(goals));

    // Remove the goal from the DOM
    let goalItem = document.querySelector(`#goalsList .goal-item`);
    if (goalItem) {
        goalItem.remove();
    }

    // Remove all related savings expenses from localStorage and the DOM
    let savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let filteredExpenses = savedExpenses.filter(expense => {
        // Check if the expense is related to the goal
        if (expense.category === "Savings" && expense.description.includes(goal.description)) {
            // Remove the expense from the DOM
            let expenseItem = document.querySelector(`#expensesSavings li[data-id="${expense.id}"]`);
            if (expenseItem) {
                expenseItem.remove();
            }
            return false; // Exclude this expense from the filtered list
        }
        return true; // Keep this expense in the filtered list
    });

    // Update localStorage with the filtered expenses
    localStorage.setItem("expenses", JSON.stringify(filteredExpenses));

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
