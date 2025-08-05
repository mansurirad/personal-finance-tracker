// 🚀 Personal Finance Tracker - ES6+ JavaScript
console.log('💰 Personal Finance Tracker loaded!');

// ES6+ Class for Finance Management
class FinanceTracker {
    constructor() {
        this.transactions = [];
        this.categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education'];
        this.chart = null; // Store chart instance
        this.loadFromStorage(); // Load saved data first
        this.init();
    }

    // Arrow function for initialization
    init = () => {
        console.log('🎯 Initializing Finance Tracker...');
        this.renderDashboard();
        this.bindEvents();
    }

    // Save data to localStorage
    saveToStorage = () => {
        localStorage.setItem('financeTrackerData', JSON.stringify(this.transactions));
        console.log('💾 Data saved to localStorage');
    }

    // Load data from localStorage
    loadFromStorage = () => {
        const savedData = localStorage.getItem('financeTrackerData');
        if (savedData) {
            this.transactions = JSON.parse(savedData);
            console.log('📂 Data loaded from localStorage');
        }
    }

    // Template literals for dynamic HTML - WITH CHART GENERATION
    renderDashboard = () => {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard">
                <div class="stats-row">
                    ${this.renderStatsCards()}
                </div>
                
                <div class="charts-section">
                    <div class="chart-container">
                        <h3>📊 Expenses by Category</h3>
                        <canvas id="categoryChart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <div class="main-content">
                    <div class="add-transaction">
                        <h2>💸 Add Transaction</h2>
                        ${this.renderTransactionForm()}
                    </div>
                    
                    <div class="transaction-list">
                        <h2>📋 Recent Transactions</h2>
                        <div id="transactions-container">
                            ${this.renderTransactions()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Generate chart after DOM is updated
        setTimeout(() => this.generateChart(), 100);
    }

    // Arrow function with template literals
    renderStatsCards = () => {
        const totalIncome = this.calculateTotal('income');
        const totalExpense = this.calculateTotal('expense');
        const balance = totalIncome - totalExpense;

        return `
            <div class="stat-card income">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <h3>Total Income</h3>
                    <p class="amount">$${totalIncome.toLocaleString()}</p>
                </div>
            </div>
            
            <div class="stat-card expense">
                <div class="stat-icon">💸</div>
                <div class="stat-info">
                    <h3>Total Expenses</h3>
                    <p class="amount">$${totalExpense.toLocaleString()}</p>
                </div>
            </div>
            
            <div class="stat-card balance ${balance >= 0 ? 'positive' : 'negative'}">
                <div class="stat-icon">${balance >= 0 ? '📈' : '📉'}</div>
                <div class="stat-info">
                    <h3>Balance</h3>
                    <p class="amount">$${balance.toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    renderTransactionForm = () => `
        <form id="transaction-form" class="transaction-form">
            <div class="form-row">
                <div class="input-group">
                    <label for="type">Type</label>
                    <select id="type" required>
                        <option value="income">💰 Income</option>
                        <option value="expense">💸 Expense</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="amount">Amount</label>
                    <input type="number" id="amount" placeholder="0.00" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="input-group">
                    <label for="category">Category</label>
                    <select id="category" required>
                        ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="description">Description</label>
                    <input type="text" id="description" placeholder="Transaction description">
                </div>
            </div>
            
            <button type="submit" class="add-btn">➕ Add Transaction</button>
        </form>
    `

    // ES6+ Array methods with arrow functions
    calculateTotal = (type) => {
        return this.transactions
            .filter(transaction => transaction.type === type)
            .reduce((total, transaction) => total + transaction.amount, 0);
    }

    renderTransactions = () => {
        if (this.transactions.length === 0) {
            return '<p class="no-transactions">No transactions yet. Add your first one!</p>';
        }

        return this.transactions
            .map(transaction => this.renderTransaction(transaction))
            .join('');
    }

    renderTransaction = (transaction) => {
        const { type, amount, category, description, date, id } = transaction;
        const icon = type === 'income' ? '💰' : '💸';
        const sign = type === 'income' ? '+' : '-';
        
        return `
            <div class="transaction-item ${type}" data-id="${id}">
                <div class="transaction-icon">${icon}</div>
                <div class="transaction-details">
                    <h4>${description || category}</h4>
                    <p class="transaction-category">${category}</p>
                    <small class="transaction-date">${this.formatDate(date)}</small>
                </div>
                <div class="transaction-amount ${type}">
                    ${sign}$${amount.toLocaleString()}
                </div>
                <button class="delete-btn" onclick="financeTracker.deleteTransaction('${id}')">🗑️</button>
            </div>
        `;
    }

    // Calculate category data for chart
    getCategoryData = () => {
        const expenses = this.transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};
        
        // Initialize categories
        this.categories.forEach(cat => {
            categoryTotals[cat] = 0;
        });
        
        // Calculate totals
        expenses.forEach(expense => {
            categoryTotals[expense.category] += expense.amount;
        });
        
        return categoryTotals;
    }

    // Generate Chart.js chart
    // Generate Chart.js chart
generateChart = () => {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    // Set canvas size explicitly
    canvas.width = 400;
    canvas.height = 300;
    
    const categoryData = this.getCategoryData();
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    
    // Only show categories with data
    const filteredData = labels.reduce((acc, label, index) => {
        if (data[index] > 0) {
            acc.labels.push(label);
            acc.data.push(data[index]);
        }
        return acc;
    }, { labels: [], data: [] });
    
    // If no expense data, show message
    if (filteredData.data.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data yet!', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    if (this.chart) {
        this.chart.destroy(); // Destroy existing chart
    }
    
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredData.labels,
            datasets: [{
                data: filteredData.data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB', 
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6B6B'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            width: 400,
            height: 300,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': $' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            }
        }
    });
}

    // ES6+ Destructuring in action - WITH localStorage
    addTransaction = (transactionData) => {
        const { type, amount, category, description } = transactionData;
        
        const newTransaction = {
            id: Date.now().toString(),
            type,
            amount: parseFloat(amount),
            category,
            description: description || category,
            date: new Date()
        };

        this.transactions.unshift(newTransaction);
        this.saveToStorage(); // Save to localStorage
        this.updateDashboard();
        console.log(`✅ Added ${type}: $${amount} for ${category}`);
    }

    deleteTransaction = (id) => {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToStorage(); // Save to localStorage
        this.updateDashboard();
        console.log(`🗑️ Deleted transaction: ${id}`);
    }

    // Updated updateDashboard with chart generation
    updateDashboard = () => {
        const statsRow = document.querySelector('.stats-row');
        const transactionsContainer = document.getElementById('transactions-container');
        
        if (statsRow) {
            statsRow.innerHTML = this.renderStatsCards();
        }
        if (transactionsContainer) {
            transactionsContainer.innerHTML = this.renderTransactions();
        }
        
        // Update chart
        setTimeout(() => this.generateChart(), 100);
    }

    formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    bindEvents = () => {
        const form = document.getElementById('transaction-form');
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const transactionData = {
                type: formData.get('type') || document.getElementById('type').value,
                amount: formData.get('amount') || document.getElementById('amount').value,
                category: formData.get('category') || document.getElementById('category').value,
                description: formData.get('description') || document.getElementById('description').value
            };

            this.addTransaction(transactionData);
            form.reset();
        });
    }
}

// Initialize app
let financeTracker;

document.addEventListener('DOMContentLoaded', () => {
    financeTracker = new FinanceTracker();
    console.log('🎯 Finance Tracker initialized with ES6+ features!');
});