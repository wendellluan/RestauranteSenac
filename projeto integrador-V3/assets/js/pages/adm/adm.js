// Sistema Administrativo de Cozinha
class KitchenAdmin {
    constructor() {
        this.tables = JSON.parse(localStorage.getItem('tables')) || [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        this.history = JSON.parse(localStorage.getItem('history')) || [];
        this.adminAccounts = JSON.parse(localStorage.getItem('adminAccounts')) || [
            { id: 1, email: 'admin@kitchen.com', password: 'admin123', role: 'Administrador Principal' }
        ];
        
        this.currentEditingTable = null;
        this.currentEditingMenuItem = null;
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupEventListeners();
        this.renderTables();
        this.renderOrders();
        this.renderMenuItems();
        this.renderHistory();
        this.renderAdminAccounts();
        this.updateOrdersStats();
    }

    // Navegação
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    showSection(sectionName) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Modais
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modals.forEach(modal => modal.classList.remove('active'));
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Botões principais
        document.getElementById('add-table-btn').addEventListener('click', () => this.openTableModal());
        document.getElementById('add-menu-item-btn').addEventListener('click', () => this.openMenuModal());
        document.getElementById('add-admin-btn').addEventListener('click', () => this.openAdminModal());
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());

        // Formulários
        document.getElementById('table-form').addEventListener('submit', (e) => this.handleTableSubmit(e));
        document.getElementById('menu-form').addEventListener('submit', (e) => this.handleMenuSubmit(e));
        document.getElementById('admin-form').addEventListener('submit', (e) => this.handleAdminSubmit(e));

        // Botões de cancelar
        document.getElementById('cancel-table').addEventListener('click', () => this.closeTableModal());
        document.getElementById('cancel-menu').addEventListener('click', () => this.closeMenuModal());
        document.getElementById('cancel-admin').addEventListener('click', () => this.closeAdminModal());

        // Botões de excluir
        document.getElementById('delete-table').addEventListener('click', () => this.deleteTable());
        document.getElementById('delete-menu-item').addEventListener('click', () => this.deleteMenuItem());

        // Preview de imagem
        document.getElementById('dish-image').addEventListener('change', (e) => this.previewImage(e));

        // Fechar modais
        document.getElementById('close-table-modal').addEventListener('click', () => this.closeTableModal());
        document.getElementById('close-menu-modal').addEventListener('click', () => this.closeMenuModal());
        document.getElementById('close-admin-modal').addEventListener('click', () => this.closeAdminModal());
        document.getElementById('close-order-modal').addEventListener('click', () => this.closeOrderModal());
    }

    // Gerenciamento de Mesas
    openTableModal(table = null) {
        this.currentEditingTable = table;
        const modal = document.getElementById('table-modal');
        const title = document.getElementById('table-modal-title');
        const deleteBtn = document.getElementById('delete-table');
        
        if (table) {
            title.textContent = 'Editar Mesa';
            document.getElementById('table-number').value = table.number;
            document.getElementById('customer-name').value = table.customerName || '';
            document.getElementById('people-count').value = table.peopleCount || 0;
            document.getElementById('table-status').value = table.status;
            deleteBtn.style.display = 'block';
        } else {
            title.textContent = 'Nova Mesa';
            document.getElementById('table-form').reset();
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
    }

    closeTableModal() {
        document.getElementById('table-modal').classList.remove('active');
        this.currentEditingTable = null;
    }

    handleTableSubmit(e) {
        e.preventDefault();
        
        const tableData = {
            number: parseInt(document.getElementById('table-number').value),
            customerName: document.getElementById('customer-name').value,
            peopleCount: parseInt(document.getElementById('people-count').value) || 0,
            status: document.getElementById('table-status').value,
            orderStatus: 'pendente',
            paymentStatus: 'pendente'
        };

        if (this.currentEditingTable) {
            // Editar mesa existente
            const index = this.tables.findIndex(t => t.id === this.currentEditingTable.id);
            if (index !== -1) {
                this.tables[index] = { ...this.currentEditingTable, ...tableData };
            }
        } else {
            // Nova mesa
            const newTable = {
                id: Date.now(),
                ...tableData,
                createdAt: new Date().toISOString()
            };
            this.tables.push(newTable);
        }

        this.saveData();
        this.renderTables();
        this.closeTableModal();
    }

    deleteTable() {
        if (this.currentEditingTable && confirm('Tem certeza que deseja excluir esta mesa?')) {
            this.tables = this.tables.filter(t => t.id !== this.currentEditingTable.id);
            this.saveData();
            this.renderTables();
            this.closeTableModal();
        }
    }

    renderTables() {
        const grid = document.getElementById('tables-grid');
        
        if (this.tables.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-table"></i>
                    <h3>Nenhuma mesa cadastrada</h3>
                    <p>Clique em "Nova Mesa" para começar</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.tables.map(table => `
            <div class="card table-card ${table.status}">
                <div class="table-header">
                    <span class="table-number">Mesa ${table.number}</span>
                    <span class="table-status ${table.status}">${table.status}</span>
                </div>
                <div class="table-info">
                    <p><strong>Cliente:</strong> ${table.customerName || 'Não informado'}</p>
                    <p><strong>Pessoas:</strong> ${table.peopleCount}</p>
                </div>
                <div class="table-statuses">
                    <span class="status-badge ${table.orderStatus}">Pedido: ${table.orderStatus}</span>
                    <span class="status-badge ${table.paymentStatus}">Pagamento: ${table.paymentStatus}</span>
                </div>
                <div class="table-actions">
                    <button class="btn btn-primary" onclick="kitchenAdmin.editTable(${table.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-info" onclick="kitchenAdmin.addOrderToTable(${table.id})">
                        <i class="fas fa-plus"></i> Pedido
                    </button>
                </div>
            </div>
        `).join('');
    }

    editTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            this.openTableModal(table);
        }
    }

    addOrderToTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            // Simular adição de pedido
            const orderItems = [
                'Hambúrguer Clássico - R$ 25,00',
                'Batata Frita - R$ 12,00',
                'Refrigerante - R$ 8,00'
            ];

            const newOrder = {
                id: Date.now(),
                tableId: table.id,
                tableNumber: table.number,
                customerName: table.customerName || 'Cliente',
                items: orderItems,
                status: 'pendente',
                total: 45.00,
                createdAt: new Date().toISOString()
            };

            this.orders.push(newOrder);
            
            // Atualizar status da mesa
            table.orderStatus = 'pendente';
            
            this.saveData();
            this.renderOrders();
            this.renderTables();
            this.updateOrdersStats();
            
            alert('Pedido adicionado com sucesso!');
        }
    }

    // Gerenciamento de Pedidos
    renderOrders() {
        const grid = document.getElementById('orders-grid');
        const activeOrders = this.orders.filter(order => order.status !== 'pronto');
        
        if (activeOrders.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Nenhum pedido ativo</h3>
                    <p>Os pedidos aparecerão aqui quando forem realizados</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = activeOrders.map(order => `
            <div class="card order-card ${order.status}">
                <div class="order-header">
                    <span class="order-table">Mesa ${order.tableNumber}</span>
                    <span class="order-status status-badge ${order.status}">${order.status}</span>
                </div>
                <div class="order-customer">
                    <strong>Cliente:</strong> ${order.customerName}
                </div>
                <div class="order-items">
                    <h4>Itens do Pedido:</h4>
                    <ul>
                        ${order.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="order-actions">
                    ${this.getOrderActionButtons(order)}
                </div>
            </div>
        `).join('');
    }

    getOrderActionButtons(order) {
        switch (order.status) {
            case 'pendente':
                return `<button class="btn btn-warning" onclick="kitchenAdmin.updateOrderStatus(${order.id}, 'em-preparo')">
                    <i class="fas fa-play"></i> Iniciar Preparo
                </button>`;
            case 'em-preparo':
                return `<button class="btn btn-success" onclick="kitchenAdmin.updateOrderStatus(${order.id}, 'pronto')">
                    <i class="fas fa-check"></i> Marcar como Pronto
                </button>`;
            default:
                return '';
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            
            // Atualizar status da mesa correspondente
            const table = this.tables.find(t => t.id === order.tableId);
            if (table) {
                table.orderStatus = newStatus;
                
                // Se o pedido ficou pronto, remover da área de pedidos
                if (newStatus === 'pronto') {
                    // Remover da lista de pedidos ativos
                    this.orders = this.orders.filter(o => o.id !== orderId);
                }
            }
            
            this.saveData();
            this.renderOrders();
            this.renderTables();
            this.updateOrdersStats();
        }
    }

    updateOrdersStats() {
        const pendingCount = this.orders.filter(o => o.status === 'pendente').length;
        const preparingCount = this.orders.filter(o => o.status === 'em-preparo').length;
        
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('preparing-count').textContent = preparingCount;
    }

    // Gerenciamento de Cardápio
    openMenuModal(menuItem = null) {
        this.currentEditingMenuItem = menuItem;
        const modal = document.getElementById('menu-modal');
        const title = document.getElementById('menu-modal-title');
        const deleteBtn = document.getElementById('delete-menu-item');
        
        if (menuItem) {
            title.textContent = 'Editar Prato';
            document.getElementById('dish-name').value = menuItem.name;
            document.getElementById('dish-description').value = menuItem.description || '';
            document.getElementById('dish-price').value = menuItem.price;
            
            if (menuItem.image) {
                document.getElementById('image-preview').innerHTML = `
                    <img src="${menuItem.image}" alt="${menuItem.name}">
                `;
            }
            
            deleteBtn.style.display = 'block';
        } else {
            title.textContent = 'Novo Prato';
            document.getElementById('menu-form').reset();
            document.getElementById('image-preview').innerHTML = '';
            deleteBtn.style.display = 'none';
        }
        
        modal.classList.add('active');
    }

    closeMenuModal() {
        document.getElementById('menu-modal').classList.remove('active');
        this.currentEditingMenuItem = null;
    }

    previewImage(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('image-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    handleMenuSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('dish-name').value;
        const description = document.getElementById('dish-description').value;
        const price = parseFloat(document.getElementById('dish-price').value);
        const imageFile = document.getElementById('dish-image').files[0];
        
        const menuItemData = {
            name,
            description,
            price
        };

        // Handle image
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                menuItemData.image = e.target.result;
                this.saveMenuItem(menuItemData);
            };
            reader.readAsDataURL(imageFile);
        } else if (this.currentEditingMenuItem && this.currentEditingMenuItem.image) {
            menuItemData.image = this.currentEditingMenuItem.image;
            this.saveMenuItem(menuItemData);
        } else {
            this.saveMenuItem(menuItemData);
        }
    }

    saveMenuItem(menuItemData) {
        if (this.currentEditingMenuItem) {
            // Editar item existente
            const index = this.menuItems.findIndex(item => item.id === this.currentEditingMenuItem.id);
            if (index !== -1) {
                this.menuItems[index] = { ...this.currentEditingMenuItem, ...menuItemData };
            }
        } else {
            // Novo item
            const newMenuItem = {
                id: Date.now(),
                ...menuItemData,
                createdAt: new Date().toISOString()
            };
            this.menuItems.push(newMenuItem);
        }

        this.saveData();
        this.renderMenuItems();
        this.closeMenuModal();
    }

    deleteMenuItem() {
        if (this.currentEditingMenuItem && confirm('Tem certeza que deseja excluir este prato?')) {
            this.menuItems = this.menuItems.filter(item => item.id !== this.currentEditingMenuItem.id);
            this.saveData();
            this.renderMenuItems();
            this.closeMenuModal();
        }
    }

    renderMenuItems() {
        const grid = document.getElementById('menu-grid');
        
        if (this.menuItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>Nenhum prato cadastrado</h3>
                    <p>Clique em "Novo Prato" para começar</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.menuItems.map(item => `
            <div class="card menu-card">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" class="menu-image">` :
                    `<div class="menu-image placeholder"><i class="fas fa-image"></i></div>`
                }
                <h3 class="menu-title">${item.name}</h3>
                <p class="menu-description">${item.description || 'Sem descrição'}</p>
                <div class="menu-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                <div class="menu-actions">
                    <button class="btn btn-primary" onclick="kitchenAdmin.editMenuItem(${item.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `).join('');
    }

    editMenuItem(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (item) {
            this.openMenuModal(item);
        }
    }

    // Histórico
    renderHistory() {
        const list = document.getElementById('history-list');
        const totalAmount = document.getElementById('total-amount');
        
        if (this.history.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Nenhum histórico encontrado</h3>
                    <p>Os pagamentos finalizados aparecerão aqui</p>
                </div>
            `;
            totalAmount.textContent = '0,00';
            return;
        }

        const total = this.history.reduce((sum, item) => sum + item.amount, 0);
        totalAmount.textContent = total.toFixed(2).replace('.', ',');

        list.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-table">Mesa ${item.tableNumber}</div>
                    <div class="history-customer">${item.customerName}</div>
                    <div class="history-date">${new Date(item.date).toLocaleString('pt-BR')}</div>
                </div>
                <div class="history-amount">R$ ${item.amount.toFixed(2).replace('.', ',')}</div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            this.history = [];
            this.saveData();
            this.renderHistory();
        }
    }

    // Gerenciamento de Contas Admin
    openAdminModal() {
        const modal = document.getElementById('admin-modal');
        document.getElementById('admin-form').reset();
        modal.classList.add('active');
    }

    closeAdminModal() {
        document.getElementById('admin-modal').classList.remove('active');
    }

    handleAdminSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        
        if (this.adminAccounts.some(account => account.email === email)) {
            alert('Este email já está cadastrado!');
            return;
        }
        
        const newAccount = {
            id: Date.now(),
            email,
            password,
            role: 'Administrador',
            createdAt: new Date().toISOString()
        };
        
        this.adminAccounts.push(newAccount);
        this.saveData();
        this.renderAdminAccounts();
        this.closeAdminModal();
    }

    deleteAdminAccount(accountId) {
        if (this.adminAccounts.length <= 1) {
            alert('Não é possível excluir a última conta administrativa!');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir esta conta?')) {
            this.adminAccounts = this.adminAccounts.filter(account => account.id !== accountId);
            this.saveData();
            this.renderAdminAccounts();
        }
    }

    renderAdminAccounts() {
        const list = document.getElementById('admin-list');
        
        list.innerHTML = this.adminAccounts.map(account => `
            <div class="admin-item">
                <div class="admin-info">
                    <div class="admin-email">${account.email}</div>
                    <div class="admin-role">${account.password}</div>
                    <div class="admin-role">${account.role}</div>
                </div>
                <button class="btn btn-danger" onclick="kitchenAdmin.deleteAdminAccount(${account.id})" 
                        ${this.adminAccounts.length <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `).join('');
    }

    closeOrderModal() {
        document.getElementById('order-detail-modal').classList.remove('active');
    }

    // Finalizar pagamento (simular)
    finalizePayment(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table && confirm('Finalizar pagamento desta mesa?')) {
            // Adicionar ao histórico
            const historyItem = {
                id: Date.now(),
                tableNumber: table.number,
                customerName: table.customerName || 'Cliente',
                amount: Math.random() * 100 + 20, // Valor simulado
                date: new Date().toISOString()
            };
            
            this.history.push(historyItem);
            
            // Resetar mesa
            table.customerName = '';
            table.peopleCount = 0;
            table.status = 'livre';
            table.orderStatus = 'pendente';
            table.paymentStatus = 'pendente';
            
            this.saveData();
            this.renderTables();
            this.renderHistory();
        }
    }

    // Salvar dados no localStorage
    saveData() {
        localStorage.setItem('tables', JSON.stringify(this.tables));
        localStorage.setItem('orders', JSON.stringify(this.orders));
        localStorage.setItem('menuItems', JSON.stringify(this.menuItems));
        localStorage.setItem('history', JSON.stringify(this.history));
        localStorage.setItem('adminAccounts', JSON.stringify(this.adminAccounts));
    }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    window.kitchenAdmin = new KitchenAdmin();
    console.log('Sistema Administrativo de Cozinha carregado com sucesso!');
});