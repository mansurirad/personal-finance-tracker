// Advanced Personal Finance Tracker - Complete JavaScript

class PersonalFinanceTracker {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.chart = null;
        this.loadFromLocalStorage();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('transaction-form');
        form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filter functionality
        const searchInput = document.getElementById('search-input');
        const filterType = document.getElementById('filter-type');
        const filterCategory = document.getElementById('filter-category');
        const exportBtn = document.getElementById('export-btn');
        const clearAllBtn = document.getElementById('clear-all-btn');

        searchInput?.addEventListener('input', () => this.applyFilters());
        filterType?.addEventListener('change', () => this.applyFilters());
        filterCategory?.addEventListener('change', () => this.applyFilters());
        exportBtn?.addEventListener('click', () => this.exportToCSV());
        clearAllBtn?.addEventListener('click', () => this.clearAllTransactions());
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const type = document.getElementById('type').value;

        if (!description || !amount || !category || !type) {
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }

    clearAllTransactions() {
        if (this.transactions.length === 0) {
            this.showNotification('No transactions to clear!', 'warning');
            return;
        }

        if (confirm('Are you sure you want to delete ALL transactions? This action cannot be undone!')) {
            this.transactions = [];
            this.filteredTransactions = [];
            this.saveToLocalStorage();
            this.updateDisplay();
            this.resetFilters();
            this.showNotification('All transactions cleared!', 'success');
        }
    }

    exportToCSV() {
        if (this.transactions.length === 0) {
            this.showNotification('No transactions to export!', 'warning');
            return;
        }

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...this.transactions.map(transaction => [
                this.formatDate(transaction.date, false),
                `"${transaction.description.replace(/"/g, '""')}"`,
                transaction.category,
                transaction.type,
                transaction.amount.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.href = url;
        link.download = `personal-finance-tracker-${timestamp}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    resetForm() {
        const form = document.getElementById('transaction-form');
        if (form) {
            form.reset();
            // Focus on first input for better UX
            const firstInput = form.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    resetFilters() {
        const searchInput = document.getElementById('search-input');
        const filterType = document.getElementById('filter-type');
        const filterCategory = document.getElementById('filter-category');

        if (searchInput) searchInput.value = '';
        if (filterType) filterType.value = 'all';
        if (filterCategory) filterCategory.value = 'all';
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('financeTrackerData', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showNotification('Error saving data!', 'error');
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('financeTrackerData');
            if (savedData) {
                this.transactions = JSON.parse(savedData);
                // Validate and clean data
                this.transactions = this.transactions.filter(t => 
                    t.id && t.description && typeof t.amount === 'number' && t.category && t.type && t.date
                );
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.transactions = [];
            this.showNotification('Error loading saved data!', 'error');
        }
    }

    formatDate(dateString, includeTime = true) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };

        const color = colors[type] || colors.info;
        
        notification.querySelector('.notification-content').style.cssText = `
            background: ${color.bg};
            border: 1px solid ${color.border};
            color: ${color.text};
            padding: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: ${color.text};
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // Statistical methods
    getStatistics() {
        if (this.transactions.length === 0) return null;

        const income = this.transactions.filter(t => t.type === 'income');
        const expenses = this.transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
        
        const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
        const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
        
        const categoryStats = {};
        expenses.forEach(expense => {
            const category = expense.category;
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, count: 0, avg: 0 };
            }
            categoryStats[category].total += Math.abs(expense.amount);
            categoryStats[category].count += 1;
            categoryStats[category].avg = categoryStats[category].total / categoryStats[category].count;
        });

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            avgIncome,
            avgExpense,
            transactionCount: this.transactions.length,
            incomeCount: income.length,
            expenseCount: expenses.length,
            categoryStats
        };
    }

    // Import functionality (bonus feature)
    importFromCSV(csvContent) {
        try {
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            const imported = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = this.parseCSVLine(line);
                if (values.length !== headers.length) continue;

                const transaction = {
                    id: Date.now() + Math.random(),
                    date: new Date(values[0]).toISOString(),
                    description: values[1].replace(/^"|"$/g, ''),
                    category: values[2],
                    type: values[3],
                    amount: parseFloat(values[4])
                };

                if (transaction.description && !isNaN(transaction.amount) && 
                    transaction.category && transaction.type) {
                    imported.push(transaction);
                }
            }

            this.transactions.push(...imported);
            this.saveToLocalStorage();
            this.updateDisplay();
            this.showNotification(`Imported ${imported.length} transactions successfully!`, 'success');
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Error importing CSV file!', 'error');
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
}

// Initialize the finance tracker
let financeTracker;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    financeTracker = new PersonalFinanceTracker();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + E for export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            financeTracker.exportToCSV();
        }
        
        // Ctrl/Cmd + N for new transaction (focus on description field)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('description')?.focus();
        }
    });

    // Add drag and drop for CSV import
    const dropZone = document.body;
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = 'rgba(33, 150, 243, 0.1)';
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                financeTracker.importFromCSV(event.target.result);
            };
            reader.readAsText(files[0]);
        }
    });

    console.log('Personal Finance Tracker initialized successfully! 💰');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + E: Export to CSV');
    console.log('- Ctrl/Cmd + N: New transaction');
    console.log('- Drag & drop CSV files to import');
});Please fill in all fields!', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category,
            type,
            date: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.resetForm();
        this.showNotification(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    }

    applyFilters() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('filter-type')?.value || 'all';
        const categoryFilter = document.getElementById('filter-category')?.value || 'all';

        this.filteredTransactions = this.transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                transaction.category.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
            const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

            return matchesSearch && matchesType && matchesCategory;
        });

        this.displayTransactions();
        this.updateChart();
    }

    updateDisplay() {
        this.filteredTransactions = [...this.transactions];
        this.updateSummary();
        this.displayTransactions();
        this.updateChart();
    }

    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = Math.abs(this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0));

        const balance = totalIncome - totalExpense;

        // Update DOM elements
        const totalIncomeEl = document.getElementById('total-income');
        const totalExpenseEl = document.getElementById('total-expense');
        const balanceEl = document.getElementById('balance');

        if (totalIncomeEl) {
            totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
            totalIncomeEl.style.color = totalIncome >= 0 ? '#4CAF50' : '#f44336';
        }

        if (totalExpenseEl) {
            totalExpenseEl.textContent = `$${totalExpense.toFixed(2)}`;
            totalExpenseEl.style.color = '#f44336';
        }

        if (balanceEl) {
            balanceEl.textContent = `$${balance.toFixed(2)}`;
            balanceEl.style.color = balance >= 0 ? '#4CAF50' : '#f44336';
            
            // Add animation for balance updates
            balanceEl.style.transform = 'scale(1.1)';
            setTimeout(() => {
                balanceEl.style.transform = 'scale(1)';
            }, 200);
        }
    }

    displayTransactions() {
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return;

        if (this.filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<div class="no-transactions">No transactions found. Add some transactions to get started!</div>';
            return;
        }

        // Sort by date (newest first) and show last 20 transactions
        const sortedTransactions = [...this.filteredTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20);

        transactionsList.innerHTML = sortedTransactions.map(transaction => `
            <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-info">
                    <h4>${this.escapeHtml(transaction.description)}</h4>
                    <p>
                        <span class="category">${transaction.category}</span> • 
                        <span class="date">${this.formatDate(transaction.date)}</span>
                    </p>
                </div>
                <div class="transaction-actions">
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <button class="delete-btn" onclick="financeTracker.deleteTransaction(${transaction.id})" title="Delete transaction">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        // Add fade-in animation
        const items = transactionsList.querySelectorAll('.transaction-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    updateChart() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;

        // Get expense data for chart
        const expenses = this.filteredTransactions.filter(t => t.type === 'expense');
        const categoryData = {};

        expenses.forEach(expense => {
            const category = expense.category;
            categoryData[category] = (categoryData[category] || 0) + Math.abs(expense.amount);
        });

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);

        if (categories.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.font = '16px Arial';
            context.fillStyle = '#666';
            context.textAlign = 'center';
            context.fillText('No expense data available', ctx.width / 2, ctx.height / 2);
            return;
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
                    ],
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    deleteTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        if (confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateDisplay();
            this.showNotification('
