/* ============================================
   Car Order Management System - Application Logic
   ============================================ */

(function () {
  'use strict';

  // ---- Constants ----
  const STATUS_LIST = ['保留中', '確認済み', '出荷済み', '配送済み', '承認済み'];
  const PAYMENT_METHODS = ['クレジットカード', '銀行振込', '発注書'];
  const DELIVERY_METHODS = ['標準', 'エクスプレス', '貨物'];
  const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback'];

  const ROLE_LABELS = {
    admin: '管理者',
    sales: '営業担当者',
    inventory: 'インベントリマネージャー',
    supplier: 'サプライヤー'
  };

  // ---- State ----
  let currentUser = null;
  let db = loadDatabase();

  // ---- Database (localStorage) ----
  function loadDatabase() {
    const saved = localStorage.getItem('oms_database');
    if (saved) return JSON.parse(saved);
    return initSampleData();
  }

  function saveDatabase() {
    localStorage.setItem('oms_database', JSON.stringify(db));
  }

  function generateId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // ---- Sample Data ----
  function initSampleData() {
    const data = {
      suppliers: [
        {
          id: 'SUP-001', companyName: 'Volvo', address: 'Gothenburg, Sweden',
          contactName: 'Erik Johansson', contactEmail: 'erik@volvo.com', contactPhone: '+46-31-123-4567'
        },
        {
          id: 'SUP-002', companyName: 'Volkswagen', address: 'Wolfsburg, Germany',
          contactName: 'Hans Mueller', contactEmail: 'hans@vw.com', contactPhone: '+49-5361-9-0'
        },
        {
          id: 'SUP-003', companyName: 'Toyota', address: 'Toyota City, Aichi, Japan',
          contactName: '田中太郎', contactEmail: 'tanaka@toyota.co.jp', contactPhone: '+81-565-28-2121'
        },
        {
          id: 'SUP-004', companyName: 'BMW', address: 'Munich, Germany',
          contactName: 'Anna Schmidt', contactEmail: 'anna@bmw.com', contactPhone: '+49-89-382-0'
        }
      ],
      customers: [
        {
          id: 'CUS-001', companyName: '東京モーターズ株式会社', address: '東京都港区六本木1-1-1',
          contactName: '佐藤一郎', contactEmail: 'sato@tokyomotors.co.jp', contactPhone: '03-1234-5678',
          registrationDate: '2024-01-15', accountStatus: 'アクティブ'
        },
        {
          id: 'CUS-002', companyName: '大阪カーディーラー', address: '大阪府大阪市中央区本町2-2-2',
          contactName: '鈴木花子', contactEmail: 'suzuki@osakacars.co.jp', contactPhone: '06-2345-6789',
          registrationDate: '2024-03-20', accountStatus: 'アクティブ'
        },
        {
          id: 'CUS-003', companyName: '名古屋オートセンター', address: '愛知県名古屋市中区栄3-3-3',
          contactName: '高橋健一', contactEmail: 'takahashi@nagoyaauto.co.jp', contactPhone: '052-3456-7890',
          registrationDate: '2024-06-10', accountStatus: 'アクティブ'
        },
        {
          id: 'CUS-004', companyName: '福岡カーズ', address: '福岡県福岡市博多区博多駅前4-4-4',
          contactName: '渡辺美咲', contactEmail: 'watanabe@fukuokacars.co.jp', contactPhone: '092-4567-8901',
          registrationDate: '2025-01-05', accountStatus: '非アクティブ'
        }
      ],
      products: [
        {
          id: 'PRD-001', name: 'Volvo S60', description: 'スカンジナビアの多機能セダン。安全性と快適性を兼ね備えた高品質車両。',
          barcode: 'VOL-S60-2025', price: 5500000, category: 'Sedan', stockQuantity: 12, supplierId: 'SUP-001'
        },
        {
          id: 'PRD-002', name: 'Volvo XC90', description: 'プレミアムSUV。7人乗りで家族向けの広々とした室内空間。',
          barcode: 'VOL-XC90-2025', price: 8900000, category: 'SUV', stockQuantity: 5, supplierId: 'SUP-001'
        },
        {
          id: 'PRD-003', name: 'VW Golf', description: 'コンパクトハッチバックの定番。燃費効率と走行性能のバランスに優れる。',
          barcode: 'VW-GOLF-2025', price: 3200000, category: 'Hatchback', stockQuantity: 20, supplierId: 'SUP-002'
        },
        {
          id: 'PRD-004', name: 'VW Tiguan', description: 'ファミリー向けコンパクトSUV。都市部でも扱いやすいサイズ感。',
          barcode: 'VW-TIG-2025', price: 4800000, category: 'SUV', stockQuantity: 8, supplierId: 'SUP-002'
        },
        {
          id: 'PRD-005', name: 'Toyota Camry', description: '信頼性の高いミッドサイズセダン。ハイブリッドシステム搭載で低燃費。',
          barcode: 'TOY-CAM-2025', price: 3800000, category: 'Sedan', stockQuantity: 25, supplierId: 'SUP-003'
        },
        {
          id: 'PRD-006', name: 'Toyota RAV4', description: '人気のクロスオーバーSUV。アウトドアにも街乗りにも最適。',
          barcode: 'TOY-RAV4-2025', price: 4200000, category: 'SUV', stockQuantity: 3, supplierId: 'SUP-003'
        },
        {
          id: 'PRD-007', name: 'BMW 3 Series', description: 'スポーティなプレミアムセダン。ドライビングプレジャーを追求。',
          barcode: 'BMW-3S-2025', price: 6200000, category: 'Sedan', stockQuantity: 7, supplierId: 'SUP-004'
        },
        {
          id: 'PRD-008', name: 'BMW X5', description: 'ラグジュアリーSUV。パワフルな走りと最先端テクノロジー。',
          barcode: 'BMW-X5-2025', price: 9800000, category: 'SUV', stockQuantity: 2, supplierId: 'SUP-004'
        }
      ],
      optionPackages: [
        { id: 'OPT-001', productId: 'PRD-001', name: 'XL パッケージ', description: 'アダプティブ クルーズ コントロールやレーン アシストなど、すべてのオプションを含む' },
        { id: 'OPT-002', productId: 'PRD-001', name: 'セーフティパッケージ', description: '衝突回避システム、ブラインドスポットモニター搭載' },
        { id: 'OPT-003', productId: 'PRD-002', name: 'プレミアムパッケージ', description: '本革シート、Bowers & Wilkins オーディオシステム' },
        { id: 'OPT-004', productId: 'PRD-003', name: 'R-Line パッケージ', description: 'スポーティなエクステリア、専用アルミホイール' },
        { id: 'OPT-005', productId: 'PRD-005', name: 'ナビパッケージ', description: '大画面ナビゲーション、360度カメラシステム' },
        { id: 'OPT-006', productId: 'PRD-007', name: 'M Sport パッケージ', description: 'Mスポーツサスペンション、専用エアロダイナミクス' },
        { id: 'OPT-007', productId: 'PRD-008', name: 'ラグジュアリーパッケージ', description: 'マッサージシート、パノラマサンルーフ、ヘッドアップディスプレイ' },
        { id: 'OPT-008', productId: 'PRD-006', name: 'アドベンチャーパッケージ', description: 'オフロードサスペンション、ルーフラック、アンダーガード' }
      ],
      orders: [
        {
          id: 'ORD-001', customerId: 'CUS-001', orderDate: '2025-04-10', status: '確認済み',
          totalAmount: 6000000, paymentMethod: 'クレジットカード', deliveryMethod: '標準',
          deliveryAddress: '東京都港区六本木1-1-1',
          items: [
            { id: 'ITM-001', quantity: 1, productId: 'PRD-001', optionPackageId: 'OPT-001' }
          ]
        },
        {
          id: 'ORD-002', customerId: 'CUS-002', orderDate: '2025-04-15', status: '保留中',
          totalAmount: 8000000, paymentMethod: '銀行振込', deliveryMethod: 'エクスプレス',
          deliveryAddress: '大阪府大阪市中央区本町2-2-2',
          items: [
            { id: 'ITM-002', quantity: 1, productId: 'PRD-005', optionPackageId: 'OPT-005' },
            { id: 'ITM-003', quantity: 1, productId: 'PRD-006', optionPackageId: 'OPT-008' }
          ]
        },
        {
          id: 'ORD-003', customerId: 'CUS-003', orderDate: '2025-04-20', status: '出荷済み',
          totalAmount: 9800000, paymentMethod: '発注書', deliveryMethod: '貨物',
          deliveryAddress: '愛知県名古屋市中区栄3-3-3',
          items: [
            { id: 'ITM-004', quantity: 1, productId: 'PRD-008', optionPackageId: 'OPT-007' }
          ]
        },
        {
          id: 'ORD-004', customerId: 'CUS-001', orderDate: '2025-04-25', status: '配送済み',
          totalAmount: 3200000, paymentMethod: 'クレジットカード', deliveryMethod: '標準',
          deliveryAddress: '東京都港区六本木1-1-1',
          items: [
            { id: 'ITM-005', quantity: 1, productId: 'PRD-003', optionPackageId: 'OPT-004' }
          ]
        },
        {
          id: 'ORD-005', customerId: 'CUS-002', orderDate: '2025-04-28', status: '承認済み',
          totalAmount: 6200000, paymentMethod: '銀行振込', deliveryMethod: 'エクスプレス',
          deliveryAddress: '大阪府大阪市中央区本町2-2-2',
          items: [
            { id: 'ITM-006', quantity: 1, productId: 'PRD-007', optionPackageId: 'OPT-006' }
          ]
        }
      ]
    };
    localStorage.setItem('oms_database', JSON.stringify(data));
    return data;
  }

  // ---- Utility Functions ----
  function formatCurrency(amount) {
    return '¥' + Number(amount).toLocaleString('ja-JP');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
  }

  function getStatusBadgeClass(status) {
    const map = {
      '保留中': 'badge-pending',
      '確認済み': 'badge-confirmed',
      '出荷済み': 'badge-shipped',
      '配送済み': 'badge-delivered',
      '承認済み': 'badge-approved'
    };
    return map[status] || '';
  }

  function getAccountBadgeClass(status) {
    return status === 'アクティブ' ? 'badge-active' : 'badge-inactive';
  }

  function getCustomerName(customerId) {
    const c = db.customers.find(function (x) { return x.id === customerId; });
    return c ? c.companyName : '不明';
  }

  function getProductName(productId) {
    const p = db.products.find(function (x) { return x.id === productId; });
    return p ? p.name : '不明';
  }

  function getSupplierName(supplierId) {
    const s = db.suppliers.find(function (x) { return x.id === supplierId; });
    return s ? s.companyName : '不明';
  }

  function getOptionName(optionId) {
    if (!optionId) return '-';
    const o = db.optionPackages.find(function (x) { return x.id === optionId; });
    return o ? o.name : '-';
  }

  function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    var icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    toast.innerHTML = '<i class="fas fa-' + icon + '"></i> ' + message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ---- Role Access Control ----
  function hasAccess(roles) {
    if (!roles) return true;
    return roles.split(',').indexOf(currentUser.role) !== -1;
  }

  function applyRoleAccess() {
    document.querySelectorAll('[data-roles]').forEach(function (el) {
      if (hasAccess(el.getAttribute('data-roles'))) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  // ---- Navigation ----
  function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });

    var page = document.getElementById('page-' + pageName);
    if (page) page.classList.add('active');

    var navItem = document.querySelector('.nav-item[data-page="' + pageName + '"]');
    if (navItem) navItem.classList.add('active');

    var titles = {
      dashboard: 'ダッシュボード',
      orders: '注文管理',
      products: '製品管理',
      customers: '顧客管理',
      suppliers: 'サプライヤー管理'
    };
    document.getElementById('page-title').textContent = titles[pageName] || pageName;

    // Refresh page data
    switch (pageName) {
      case 'dashboard': renderDashboard(); break;
      case 'orders': renderOrders(); break;
      case 'products': renderProducts(); break;
      case 'customers': renderCustomers(); break;
      case 'suppliers': renderSuppliers(); break;
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
  }

  // ---- Dashboard ----
  function renderDashboard() {
    var orders = getVisibleOrders();
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-confirmed').textContent = orders.filter(function (o) { return o.status === '確認済み'; }).length;
    document.getElementById('stat-pending').textContent = orders.filter(function (o) { return o.status === '保留中'; }).length;

    var visibleProducts = getVisibleProducts();
    document.getElementById('stat-products').textContent = visibleProducts.length;

    // Recent orders
    var tbody = document.getElementById('recent-orders-body');
    var recent = orders.slice().sort(function (a, b) { return b.orderDate.localeCompare(a.orderDate); }).slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>注文データがありません</p></td></tr>';
    } else {
      tbody.innerHTML = recent.map(function (o) {
        return '<tr>' +
          '<td><strong>' + o.id + '</strong></td>' +
          '<td>' + getCustomerName(o.customerId) + '</td>' +
          '<td>' + formatDate(o.orderDate) + '</td>' +
          '<td><span class="badge ' + getStatusBadgeClass(o.status) + '">' + o.status + '</span></td>' +
          '<td>' + formatCurrency(o.totalAmount) + '</td>' +
          '</tr>';
      }).join('');
    }

    // Stock alerts
    var alertsDiv = document.getElementById('stock-alerts');
    var lowStock = visibleProducts.filter(function (p) { return p.stockQuantity <= 5; });
    if (lowStock.length === 0) {
      alertsDiv.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>在庫アラートはありません</p></div>';
    } else {
      alertsDiv.innerHTML = lowStock.map(function (p) {
        var color = p.stockQuantity <= 2 ? 'bg-orange' : 'bg-purple';
        return '<div class="stock-alert-item">' +
          '<div class="stock-alert-icon ' + color + '"><i class="fas fa-exclamation-triangle"></i></div>' +
          '<div class="stock-alert-info"><h4>' + p.name + '</h4><p>在庫数: ' + p.stockQuantity + '台</p></div>' +
          '</div>';
      }).join('');
    }
  }

  function getVisibleOrders() {
    if (currentUser.role === 'supplier') {
      var supplierProductIds = db.products
        .filter(function (p) { return p.supplierId === currentUser.supplierId; })
        .map(function (p) { return p.id; });
      return db.orders.filter(function (o) {
        return o.items.some(function (item) { return supplierProductIds.indexOf(item.productId) !== -1; });
      });
    }
    return db.orders;
  }

  function getVisibleProducts() {
    if (currentUser.role === 'supplier') {
      return db.products.filter(function (p) { return p.supplierId === currentUser.supplierId; });
    }
    return db.products;
  }

  // ---- Orders ----
  function renderOrders() {
    var search = document.getElementById('order-search').value.toLowerCase();
    var statusFilter = document.getElementById('order-status-filter').value;
    var orders = getVisibleOrders();

    if (search) {
      orders = orders.filter(function (o) {
        return o.id.toLowerCase().indexOf(search) !== -1 ||
          getCustomerName(o.customerId).toLowerCase().indexOf(search) !== -1;
      });
    }
    if (statusFilter) {
      orders = orders.filter(function (o) { return o.status === statusFilter; });
    }

    orders.sort(function (a, b) { return b.orderDate.localeCompare(a.orderDate); });

    var tbody = document.getElementById('orders-table-body');
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-file-invoice"></i><p>注文が見つかりません</p></td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(function (o) {
      var canEdit = (currentUser.role === 'admin' || currentUser.role === 'sales') && (o.status === '保留中' || o.status === '確認済み');
      var canDelete = currentUser.role === 'admin';
      var canChangeStatus = currentUser.role === 'admin' || currentUser.role === 'sales' || currentUser.role === 'inventory';

      return '<tr>' +
        '<td><strong>' + o.id + '</strong></td>' +
        '<td>' + getCustomerName(o.customerId) + '</td>' +
        '<td>' + formatDate(o.orderDate) + '</td>' +
        '<td><span class="badge ' + getStatusBadgeClass(o.status) + '">' + o.status + '</span></td>' +
        '<td>' + o.paymentMethod + '</td>' +
        '<td>' + o.deliveryMethod + '</td>' +
        '<td><strong>' + formatCurrency(o.totalAmount) + '</strong></td>' +
        '<td><div class="action-btns">' +
        '<button class="btn btn-icon btn-outline" onclick="App.viewOrder(\'' + o.id + '\')" title="詳細"><i class="fas fa-eye"></i></button>' +
        (canEdit ? '<button class="btn btn-icon btn-outline" onclick="App.editOrder(\'' + o.id + '\')" title="編集"><i class="fas fa-edit"></i></button>' : '') +
        (canChangeStatus ? '<button class="btn btn-icon btn-outline" onclick="App.changeOrderStatus(\'' + o.id + '\')" title="ステータス変更"><i class="fas fa-exchange-alt"></i></button>' : '') +
        (canDelete ? '<button class="btn btn-icon btn-outline" onclick="App.deleteOrder(\'' + o.id + '\')" title="削除"><i class="fas fa-trash"></i></button>' : '') +
        '</div></td></tr>';
    }).join('');
  }

  function viewOrder(orderId) {
    var order = db.orders.find(function (o) { return o.id === orderId; });
    if (!order) return;

    var html = '<div class="order-detail-grid">' +
      '<div class="detail-item"><span class="detail-label">注文ID</span><span class="detail-value">' + order.id + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">顧客</span><span class="detail-value">' + getCustomerName(order.customerId) + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">注文日</span><span class="detail-value">' + formatDate(order.orderDate) + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">ステータス</span><span class="detail-value"><span class="badge ' + getStatusBadgeClass(order.status) + '">' + order.status + '</span></span></div>' +
      '<div class="detail-item"><span class="detail-label">支払い方法</span><span class="detail-value">' + order.paymentMethod + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">配送方法</span><span class="detail-value">' + order.deliveryMethod + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">合計金額</span><span class="detail-value"><strong>' + formatCurrency(order.totalAmount) + '</strong></span></div>' +
      '<div class="detail-item"><span class="detail-label">配送先住所</span><span class="detail-value">' + order.deliveryAddress + '</span></div>' +
      '</div>';

    html += '<h4 style="margin-bottom:12px;font-size:15px;">注文品目</h4>';
    html += '<table class="table"><thead><tr><th>製品</th><th>オプション</th><th>数量</th></tr></thead><tbody>';
    order.items.forEach(function (item) {
      html += '<tr><td>' + getProductName(item.productId) + '</td>' +
        '<td>' + getOptionName(item.optionPackageId) + '</td>' +
        '<td>' + item.quantity + '</td></tr>';
    });
    html += '</tbody></table>';

    openModal('注文詳細: ' + order.id, html, '<button class="btn btn-outline" onclick="App.closeModal()">閉じる</button>');
  }

  function createOrderForm(order) {
    var isEdit = !!order;
    var title = isEdit ? '注文編集: ' + order.id : '新規注文作成';

    var html = '<form id="order-form">';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label>顧客</label><select id="form-customer" required>' +
      '<option value="">顧客を選択</option>' +
      db.customers.filter(function (c) { return c.accountStatus === 'アクティブ'; }).map(function (c) {
        var selected = isEdit && order.customerId === c.id ? ' selected' : '';
        return '<option value="' + c.id + '"' + selected + '>' + c.companyName + '</option>';
      }).join('') + '</select></div>';
    html += '<div class="form-group"><label>注文日</label><input type="date" id="form-order-date" value="' + (isEdit ? order.orderDate : new Date().toISOString().split('T')[0]) + '" required></div>';
    html += '</div>';

    html += '<div class="form-row">';
    html += '<div class="form-group"><label>支払い方法</label><select id="form-payment" required>' +
      PAYMENT_METHODS.map(function (m) {
        var selected = isEdit && order.paymentMethod === m ? ' selected' : '';
        return '<option value="' + m + '"' + selected + '>' + m + '</option>';
      }).join('') + '</select></div>';
    html += '<div class="form-group"><label>配送方法</label><select id="form-delivery" required>' +
      DELIVERY_METHODS.map(function (m) {
        var selected = isEdit && order.deliveryMethod === m ? ' selected' : '';
        return '<option value="' + m + '"' + selected + '>' + m + '</option>';
      }).join('') + '</select></div>';
    html += '</div>';

    html += '<div class="form-group"><label>配送先住所</label><input type="text" id="form-delivery-address" value="' + (isEdit ? order.deliveryAddress : '') + '" placeholder="例: 214 N Bond St, Karnes City, Texas(TX), 78118" required></div>';

    // Order items
    html += '<div class="order-items-section"><h4>注文品目</h4><div id="order-items-list">';
    if (isEdit && order.items) {
      order.items.forEach(function (item, idx) {
        html += buildOrderItemRow(idx, item);
      });
    } else {
      html += buildOrderItemRow(0, null);
    }
    html += '</div><button type="button" class="add-item-btn" onclick="App.addOrderItem()"><i class="fas fa-plus"></i> 品目を追加</button></div>';
    html += '</form>';

    var footer = '<button class="btn btn-outline" onclick="App.closeModal()">キャンセル</button>' +
      '<button class="btn btn-primary" onclick="App.saveOrder(\'' + (isEdit ? order.id : '') + '\')">' + (isEdit ? '更新' : '作成') + '</button>';

    openModal(title, html, footer);
  }

  function buildOrderItemRow(index, item) {
    var productOptions = db.products.map(function (p) {
      var selected = item && item.productId === p.id ? ' selected' : '';
      return '<option value="' + p.id + '"' + selected + '>' + p.name + ' (' + formatCurrency(p.price) + ')</option>';
    }).join('');

    var allOptions = db.optionPackages.map(function (o) {
      var selected = item && item.optionPackageId === o.id ? ' selected' : '';
      return '<option value="' + o.id + '"' + selected + ' data-product="' + o.productId + '">' + o.name + '</option>';
    }).join('');

    return '<div class="order-item-row" data-index="' + index + '">' +
      '<select class="item-product" onchange="App.onProductChange(this)"><option value="">製品を選択</option>' + productOptions + '</select>' +
      '<select class="item-option"><option value="">オプションなし</option>' + allOptions + '</select>' +
      '<input type="number" class="item-quantity" min="1" value="' + (item ? item.quantity : 1) + '" placeholder="数量">' +
      '<button type="button" class="remove-item-btn" onclick="App.removeOrderItem(this)"><i class="fas fa-times"></i></button>' +
      '</div>';
  }

  function addOrderItem() {
    var list = document.getElementById('order-items-list');
    var index = list.children.length;
    var div = document.createElement('div');
    div.innerHTML = buildOrderItemRow(index, null);
    list.appendChild(div.firstChild);
  }

  function removeOrderItem(btn) {
    var row = btn.closest('.order-item-row');
    var list = document.getElementById('order-items-list');
    if (list.children.length > 1) {
      row.remove();
    } else {
      showToast('最低1つの品目が必要です', 'error');
    }
  }

  function onProductChange(select) {
    var row = select.closest('.order-item-row');
    var optionSelect = row.querySelector('.item-option');
    var selectedProductId = select.value;

    Array.from(optionSelect.options).forEach(function (opt) {
      if (opt.value === '') {
        opt.style.display = '';
        return;
      }
      opt.style.display = opt.getAttribute('data-product') === selectedProductId ? '' : 'none';
    });
    optionSelect.value = '';
  }

  function saveOrder(orderId) {
    var customerId = document.getElementById('form-customer').value;
    var orderDate = document.getElementById('form-order-date').value;
    var paymentMethod = document.getElementById('form-payment').value;
    var deliveryMethod = document.getElementById('form-delivery').value;
    var deliveryAddress = document.getElementById('form-delivery-address').value;

    if (!customerId || !orderDate || !deliveryAddress) {
      showToast('すべての必須フィールドを入力してください', 'error');
      return;
    }

    var items = [];
    var totalAmount = 0;
    var rows = document.querySelectorAll('.order-item-row');
    var valid = true;

    rows.forEach(function (row) {
      var productId = row.querySelector('.item-product').value;
      var optionId = row.querySelector('.item-option').value;
      var quantity = parseInt(row.querySelector('.item-quantity').value) || 0;

      if (!productId || quantity < 1) {
        valid = false;
        return;
      }

      var product = db.products.find(function (p) { return p.id === productId; });
      if (product) totalAmount += product.price * quantity;

      items.push({
        id: generateId('ITM'),
        quantity: quantity,
        productId: productId,
        optionPackageId: optionId || null
      });
    });

    if (!valid || items.length === 0) {
      showToast('品目情報を正しく入力してください', 'error');
      return;
    }

    if (orderId) {
      var idx = db.orders.findIndex(function (o) { return o.id === orderId; });
      if (idx !== -1) {
        db.orders[idx].customerId = customerId;
        db.orders[idx].orderDate = orderDate;
        db.orders[idx].paymentMethod = paymentMethod;
        db.orders[idx].deliveryMethod = deliveryMethod;
        db.orders[idx].deliveryAddress = deliveryAddress;
        db.orders[idx].items = items;
        db.orders[idx].totalAmount = totalAmount;
      }
      showToast('注文を更新しました');
    } else {
      db.orders.push({
        id: 'ORD-' + String(db.orders.length + 1).padStart(3, '0') + '-' + Date.now().toString(36).slice(-3),
        customerId: customerId,
        orderDate: orderDate,
        status: '保留中',
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        deliveryAddress: deliveryAddress,
        items: items
      });
      showToast('注文を作成しました');
    }

    saveDatabase();
    closeModal();
    renderOrders();
  }

  function changeOrderStatus(orderId) {
    var order = db.orders.find(function (o) { return o.id === orderId; });
    if (!order) return;

    var html = '<div class="form-group"><label>現在のステータス</label>' +
      '<p><span class="badge ' + getStatusBadgeClass(order.status) + '">' + order.status + '</span></p></div>';
    html += '<div class="form-group"><label>新しいステータス</label><select id="form-new-status">' +
      STATUS_LIST.map(function (s) {
        var selected = s === order.status ? ' selected' : '';
        return '<option value="' + s + '"' + selected + '>' + s + '</option>';
      }).join('') + '</select></div>';

    var footer = '<button class="btn btn-outline" onclick="App.closeModal()">キャンセル</button>' +
      '<button class="btn btn-primary" onclick="App.saveOrderStatus(\'' + orderId + '\')">変更</button>';

    openModal('ステータス変更: ' + orderId, html, footer);
  }

  function saveOrderStatus(orderId) {
    var newStatus = document.getElementById('form-new-status').value;
    var idx = db.orders.findIndex(function (o) { return o.id === orderId; });
    if (idx !== -1) {
      db.orders[idx].status = newStatus;
      saveDatabase();
      showToast('ステータスを更新しました');
      closeModal();
      renderOrders();
    }
  }

  function editOrder(orderId) {
    var order = db.orders.find(function (o) { return o.id === orderId; });
    if (order) createOrderForm(order);
  }

  function deleteOrder(orderId) {
    if (!confirm('注文 ' + orderId + ' を削除しますか？')) return;
    db.orders = db.orders.filter(function (o) { return o.id !== orderId; });
    saveDatabase();
    showToast('注文を削除しました');
    renderOrders();
  }

  // ---- Products ----
  function renderProducts() {
    var search = document.getElementById('product-search').value.toLowerCase();
    var categoryFilter = document.getElementById('product-category-filter').value;
    var products = getVisibleProducts();

    if (search) {
      products = products.filter(function (p) {
        return p.name.toLowerCase().indexOf(search) !== -1 ||
          p.description.toLowerCase().indexOf(search) !== -1;
      });
    }
    if (categoryFilter) {
      products = products.filter(function (p) { return p.category === categoryFilter; });
    }

    var grid = document.getElementById('products-grid');
    if (products.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-car-side"></i><p>製品が見つかりません</p></div>';
      return;
    }

    grid.innerHTML = products.map(function (p) {
      var options = db.optionPackages.filter(function (o) { return o.productId === p.id; });
      var stockClass = p.stockQuantity <= 5 ? ' low' : '';
      var canEdit = currentUser.role === 'admin' || currentUser.role === 'inventory' || currentUser.role === 'supplier';
      var canDelete = currentUser.role === 'admin';

      return '<div class="product-card">' +
        '<div class="product-image"><i class="fas fa-car"></i></div>' +
        '<div class="product-info">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="product-desc">' + p.description + '</p>' +
        '<span class="product-category">' + p.category + '</span>' +
        '<div class="product-meta">' +
        '<span class="product-price">' + formatCurrency(p.price) + '</span>' +
        '<span class="product-stock' + stockClass + '">在庫: ' + p.stockQuantity + '台</span>' +
        '</div>' +
        (options.length > 0 ? '<div class="options-list">' + options.map(function (o) {
          return '<span class="option-tag">' + o.name + '</span>';
        }).join('') + '</div>' : '') +
        '<div class="product-actions">' +
        '<button class="btn btn-sm btn-outline" onclick="App.viewProduct(\'' + p.id + '\')"><i class="fas fa-eye"></i> 詳細</button>' +
        (canEdit ? '<button class="btn btn-sm btn-outline" onclick="App.editProduct(\'' + p.id + '\')"><i class="fas fa-edit"></i> 編集</button>' : '') +
        (canDelete ? '<button class="btn btn-sm btn-outline" onclick="App.deleteProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i></button>' : '') +
        '</div></div></div>';
    }).join('');
  }

  function viewProduct(productId) {
    var p = db.products.find(function (x) { return x.id === productId; });
    if (!p) return;
    var options = db.optionPackages.filter(function (o) { return o.productId === p.id; });

    var html = '<div class="order-detail-grid">' +
      '<div class="detail-item"><span class="detail-label">製品ID</span><span class="detail-value">' + p.id + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">名前</span><span class="detail-value">' + p.name + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">カテゴリー</span><span class="detail-value">' + p.category + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">価格</span><span class="detail-value"><strong>' + formatCurrency(p.price) + '</strong></span></div>' +
      '<div class="detail-item"><span class="detail-label">バーコード</span><span class="detail-value">' + p.barcode + '</span></div>' +
      '<div class="detail-item"><span class="detail-label">在庫数</span><span class="detail-value">' + p.stockQuantity + '台</span></div>' +
      '<div class="detail-item"><span class="detail-label">サプライヤー</span><span class="detail-value">' + getSupplierName(p.supplierId) + '</span></div>' +
      '</div>';
    html += '<div class="detail-item" style="margin-top:8px"><span class="detail-label">説明</span><span class="detail-value">' + p.description + '</span></div>';

    if (options.length > 0) {
      html += '<h4 style="margin:16px 0 8px;font-size:15px;">オプションパッケージ</h4>';
      html += '<table class="table"><thead><tr><th>名前</th><th>説明</th></tr></thead><tbody>';
      options.forEach(function (o) {
        html += '<tr><td><strong>' + o.name + '</strong></td><td>' + o.description + '</td></tr>';
      });
      html += '</tbody></table>';
    }

    openModal('製品詳細: ' + p.name, html, '<button class="btn btn-outline" onclick="App.closeModal()">閉じる</button>');
  }

  function createProductForm(product) {
    var isEdit = !!product;
    var title = isEdit ? '製品編集: ' + product.name : '新規製品登録';

    var html = '<form id="product-form">';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label>製品名</label><input type="text" id="form-product-name" value="' + (isEdit ? product.name : '') + '" placeholder="例: Volvo S60" required></div>';
    html += '<div class="form-group"><label>カテゴリー</label><select id="form-product-category" required>' +
      CATEGORIES.map(function (c) {
        var selected = isEdit && product.category === c ? ' selected' : '';
        return '<option value="' + c + '"' + selected + '>' + c + '</option>';
      }).join('') + '</select></div>';
    html += '</div>';

    html += '<div class="form-group"><label>説明</label><textarea id="form-product-desc" placeholder="製品の詳細説明">' + (isEdit ? product.description : '') + '</textarea></div>';

    html += '<div class="form-row">';
    html += '<div class="form-group"><label>価格 (円)</label><input type="number" id="form-product-price" value="' + (isEdit ? product.price : '') + '" placeholder="5500000" required></div>';
    html += '<div class="form-group"><label>在庫数</label><input type="number" id="form-product-stock" value="' + (isEdit ? product.stockQuantity : '') + '" placeholder="10" required></div>';
    html += '</div>';

    html += '<div class="form-row">';
    html += '<div class="form-group"><label>バーコード</label><input type="text" id="form-product-barcode" value="' + (isEdit ? product.barcode : '') + '" placeholder="VOL-S60-2025"></div>';
    html += '<div class="form-group"><label>サプライヤー</label><select id="form-product-supplier" required>' +
      db.suppliers.map(function (s) {
        var selected = isEdit && product.supplierId === s.id ? ' selected' : '';
        return '<option value="' + s.id + '"' + selected + '>' + s.companyName + '</option>';
      }).join('') + '</select></div>';
    html += '</div>';
    html += '</form>';

    var footer = '<button class="btn btn-outline" onclick="App.closeModal()">キャンセル</button>' +
      '<button class="btn btn-primary" onclick="App.saveProduct(\'' + (isEdit ? product.id : '') + '\')">' + (isEdit ? '更新' : '登録') + '</button>';

    openModal(title, html, footer);
  }

  function saveProduct(productId) {
    var name = document.getElementById('form-product-name').value;
    var category = document.getElementById('form-product-category').value;
    var description = document.getElementById('form-product-desc').value;
    var price = parseInt(document.getElementById('form-product-price').value) || 0;
    var stock = parseInt(document.getElementById('form-product-stock').value) || 0;
    var barcode = document.getElementById('form-product-barcode').value;
    var supplierId = document.getElementById('form-product-supplier').value;

    if (!name || !price) {
      showToast('必須フィールドを入力してください', 'error');
      return;
    }

    if (productId) {
      var idx = db.products.findIndex(function (p) { return p.id === productId; });
      if (idx !== -1) {
        db.products[idx].name = name;
        db.products[idx].category = category;
        db.products[idx].description = description;
        db.products[idx].price = price;
        db.products[idx].stockQuantity = stock;
        db.products[idx].barcode = barcode;
        db.products[idx].supplierId = supplierId;
      }
      showToast('製品を更新しました');
    } else {
      db.products.push({
        id: 'PRD-' + String(db.products.length + 1).padStart(3, '0') + '-' + Date.now().toString(36).slice(-3),
        name: name, category: category, description: description,
        price: price, stockQuantity: stock, barcode: barcode, supplierId: supplierId
      });
      showToast('製品を登録しました');
    }

    saveDatabase();
    closeModal();
    renderProducts();
  }

  function editProduct(productId) {
    var product = db.products.find(function (p) { return p.id === productId; });
    if (product) createProductForm(product);
  }

  function deleteProduct(productId) {
    if (!confirm('この製品を削除しますか？')) return;
    db.products = db.products.filter(function (p) { return p.id !== productId; });
    db.optionPackages = db.optionPackages.filter(function (o) { return o.productId !== productId; });
    saveDatabase();
    showToast('製品を削除しました');
    renderProducts();
  }

  // ---- Customers ----
  function renderCustomers() {
    var search = document.getElementById('customer-search').value.toLowerCase();
    var customers = db.customers;

    if (search) {
      customers = customers.filter(function (c) {
        return c.companyName.toLowerCase().indexOf(search) !== -1 ||
          c.contactName.toLowerCase().indexOf(search) !== -1 ||
          c.contactEmail.toLowerCase().indexOf(search) !== -1;
      });
    }

    var tbody = document.getElementById('customers-table-body');
    if (customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-users"></i><p>顧客が見つかりません</p></td></tr>';
      return;
    }

    tbody.innerHTML = customers.map(function (c) {
      var canEdit = currentUser.role === 'admin' || currentUser.role === 'sales';
      var canDelete = currentUser.role === 'admin';

      return '<tr>' +
        '<td><strong>' + c.id + '</strong></td>' +
        '<td>' + c.companyName + '</td>' +
        '<td>' + c.address + '</td>' +
        '<td>' + c.contactName + '</td>' +
        '<td>' + c.contactEmail + '</td>' +
        '<td>' + c.contactPhone + '</td>' +
        '<td><span class="badge ' + getAccountBadgeClass(c.accountStatus) + '">' + c.accountStatus + '</span></td>' +
        '<td><div class="action-btns">' +
        (canEdit ? '<button class="btn btn-icon btn-outline" onclick="App.editCustomer(\'' + c.id + '\')" title="編集"><i class="fas fa-edit"></i></button>' : '') +
        (canDelete ? '<button class="btn btn-icon btn-outline" onclick="App.deleteCustomer(\'' + c.id + '\')" title="削除"><i class="fas fa-trash"></i></button>' : '') +
        '</div></td></tr>';
    }).join('');
  }

  function createCustomerForm(customer) {
    var isEdit = !!customer;
    var title = isEdit ? '顧客編集: ' + customer.companyName : '新規顧客登録';

    var html = '<form id="customer-form">';
    html += '<div class="form-group"><label>会社名</label><input type="text" id="form-cust-company" value="' + (isEdit ? customer.companyName : '') + '" required></div>';
    html += '<div class="form-group"><label>住所</label><input type="text" id="form-cust-address" value="' + (isEdit ? customer.address : '') + '" required></div>';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label>連絡先名</label><input type="text" id="form-cust-contact" value="' + (isEdit ? customer.contactName : '') + '" required></div>';
    html += '<div class="form-group"><label>メールアドレス</label><input type="email" id="form-cust-email" value="' + (isEdit ? customer.contactEmail : '') + '" required></div>';
    html += '</div>';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label>電話番号</label><input type="text" id="form-cust-phone" value="' + (isEdit ? customer.contactPhone : '') + '" required></div>';
    html += '<div class="form-group"><label>アカウントステータス</label><select id="form-cust-status">' +
      '<option value="アクティブ"' + (isEdit && customer.accountStatus === 'アクティブ' ? ' selected' : '') + '>アクティブ</option>' +
      '<option value="非アクティブ"' + (isEdit && customer.accountStatus === '非アクティブ' ? ' selected' : '') + '>非アクティブ</option>' +
      '</select></div>';
    html += '</div>';
    html += '</form>';

    var footer = '<button class="btn btn-outline" onclick="App.closeModal()">キャンセル</button>' +
      '<button class="btn btn-primary" onclick="App.saveCustomer(\'' + (isEdit ? customer.id : '') + '\')">' + (isEdit ? '更新' : '登録') + '</button>';

    openModal(title, html, footer);
  }

  function saveCustomer(customerId) {
    var companyName = document.getElementById('form-cust-company').value;
    var address = document.getElementById('form-cust-address').value;
    var contactName = document.getElementById('form-cust-contact').value;
    var contactEmail = document.getElementById('form-cust-email').value;
    var contactPhone = document.getElementById('form-cust-phone').value;
    var accountStatus = document.getElementById('form-cust-status').value;

    if (!companyName || !contactName || !contactEmail) {
      showToast('必須フィールドを入力してください', 'error');
      return;
    }

    if (customerId) {
      var idx = db.customers.findIndex(function (c) { return c.id === customerId; });
      if (idx !== -1) {
        db.customers[idx].companyName = companyName;
        db.customers[idx].address = address;
        db.customers[idx].contactName = contactName;
        db.customers[idx].contactEmail = contactEmail;
        db.customers[idx].contactPhone = contactPhone;
        db.customers[idx].accountStatus = accountStatus;
      }
      showToast('顧客を更新しました');
    } else {
      db.customers.push({
        id: 'CUS-' + String(db.customers.length + 1).padStart(3, '0') + '-' + Date.now().toString(36).slice(-3),
        companyName: companyName, address: address,
        contactName: contactName, contactEmail: contactEmail, contactPhone: contactPhone,
        registrationDate: new Date().toISOString().split('T')[0],
        accountStatus: accountStatus
      });
      showToast('顧客を登録しました');
    }

    saveDatabase();
    closeModal();
    renderCustomers();
  }

  function editCustomer(customerId) {
    var customer = db.customers.find(function (c) { return c.id === customerId; });
    if (customer) createCustomerForm(customer);
  }

  function deleteCustomer(customerId) {
    if (!confirm('この顧客を削除しますか？')) return;
    db.customers = db.customers.filter(function (c) { return c.id !== customerId; });
    saveDatabase();
    showToast('顧客を削除しました');
    renderCustomers();
  }

  // ---- Suppliers ----
  function renderSuppliers() {
    var search = document.getElementById('supplier-search').value.toLowerCase();
    var suppliers = db.suppliers;

    if (search) {
      suppliers = suppliers.filter(function (s) {
        return s.companyName.toLowerCase().indexOf(search) !== -1 ||
          s.contactName.toLowerCase().indexOf(search) !== -1;
      });
    }

    var tbody = document.getElementById('suppliers-table-body');
    if (suppliers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-truck"></i><p>サプライヤーが見つかりません</p></td></tr>';
      return;
    }

    tbody.innerHTML = suppliers.map(function (s) {
      var canEdit = currentUser.role === 'admin';
      var canDelete = currentUser.role === 'admin';

      return '<tr>' +
        '<td><strong>' + s.id + '</strong></td>' +
        '<td>' + s.companyName + '</td>' +
        '<td>' + s.address + '</td>' +
        '<td>' + s.contactName + '</td>' +
        '<td>' + s.contactEmail + '</td>' +
        '<td>' + s.contactPhone + '</td>' +
        '<td><div class="action-btns">' +
        (canEdit ? '<button class="btn btn-icon btn-outline" onclick="App.editSupplier(\'' + s.id + '\')" title="編集"><i class="fas fa-edit"></i></button>' : '') +
        (canDelete ? '<button class="btn btn-icon btn-outline" onclick="App.deleteSupplier(\'' + s.id + '\')" title="削除"><i class="fas fa-trash"></i></button>' : '') +
        '</div></td></tr>';
    }).join('');
  }

  function createSupplierForm(supplier) {
    var isEdit = !!supplier;
    var title = isEdit ? 'サプライヤー編集: ' + supplier.companyName : '新規サプライヤー登録';

    var html = '<form id="supplier-form">';
    html += '<div class="form-group"><label>会社名</label><input type="text" id="form-sup-company" value="' + (isEdit ? supplier.companyName : '') + '" required></div>';
    html += '<div class="form-group"><label>住所</label><input type="text" id="form-sup-address" value="' + (isEdit ? supplier.address : '') + '" required></div>';
    html += '<div class="form-row">';
    html += '<div class="form-group"><label>連絡先名</label><input type="text" id="form-sup-contact" value="' + (isEdit ? supplier.contactName : '') + '" required></div>';
    html += '<div class="form-group"><label>メールアドレス</label><input type="email" id="form-sup-email" value="' + (isEdit ? supplier.contactEmail : '') + '" required></div>';
    html += '</div>';
    html += '<div class="form-group"><label>電話番号</label><input type="text" id="form-sup-phone" value="' + (isEdit ? supplier.contactPhone : '') + '" required></div>';
    html += '</form>';

    var footer = '<button class="btn btn-outline" onclick="App.closeModal()">キャンセル</button>' +
      '<button class="btn btn-primary" onclick="App.saveSupplier(\'' + (isEdit ? supplier.id : '') + '\')">' + (isEdit ? '更新' : '登録') + '</button>';

    openModal(title, html, footer);
  }

  function saveSupplier(supplierId) {
    var companyName = document.getElementById('form-sup-company').value;
    var address = document.getElementById('form-sup-address').value;
    var contactName = document.getElementById('form-sup-contact').value;
    var contactEmail = document.getElementById('form-sup-email').value;
    var contactPhone = document.getElementById('form-sup-phone').value;

    if (!companyName || !contactName || !contactEmail) {
      showToast('必須フィールドを入力してください', 'error');
      return;
    }

    if (supplierId) {
      var idx = db.suppliers.findIndex(function (s) { return s.id === supplierId; });
      if (idx !== -1) {
        db.suppliers[idx].companyName = companyName;
        db.suppliers[idx].address = address;
        db.suppliers[idx].contactName = contactName;
        db.suppliers[idx].contactEmail = contactEmail;
        db.suppliers[idx].contactPhone = contactPhone;
      }
      showToast('サプライヤーを更新しました');
    } else {
      db.suppliers.push({
        id: 'SUP-' + String(db.suppliers.length + 1).padStart(3, '0') + '-' + Date.now().toString(36).slice(-3),
        companyName: companyName, address: address,
        contactName: contactName, contactEmail: contactEmail, contactPhone: contactPhone
      });
      showToast('サプライヤーを登録しました');
    }

    saveDatabase();
    closeModal();
    renderSuppliers();
  }

  function editSupplier(supplierId) {
    var supplier = db.suppliers.find(function (s) { return s.id === supplierId; });
    if (supplier) createSupplierForm(supplier);
  }

  function deleteSupplier(supplierId) {
    if (!confirm('このサプライヤーを削除しますか？')) return;
    db.suppliers = db.suppliers.filter(function (s) { return s.id !== supplierId; });
    saveDatabase();
    showToast('サプライヤーを削除しました');
    renderSuppliers();
  }

  // ---- Modal ----
  function openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml || '';
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  // ---- Initialization ----
  function init() {
    // Date display
    var now = new Date();
    document.getElementById('current-date').textContent =
      now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日';

    // Login
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var username = document.getElementById('login-username').value.trim();
      var role = document.getElementById('login-role').value;
      if (!username || !role) return;

      currentUser = {
        name: username,
        role: role,
        supplierId: role === 'supplier' ? 'SUP-001' : null
      };

      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      document.getElementById('user-display-name').textContent = username;
      document.getElementById('user-display-role').textContent = ROLE_LABELS[role];

      applyRoleAccess();
      navigateTo('dashboard');
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function () {
      currentUser = null;
      document.getElementById('app').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('login-username').value = '';
      document.getElementById('login-role').value = '';
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var page = this.getAttribute('data-page');
        if (page) navigateTo(page);
      });
    });

    // Sidebar toggle (mobile)
    document.getElementById('sidebar-toggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    // Create buttons
    document.getElementById('create-order-btn').addEventListener('click', function () {
      createOrderForm(null);
    });
    document.getElementById('create-product-btn').addEventListener('click', function () {
      createProductForm(null);
    });
    document.getElementById('create-customer-btn').addEventListener('click', function () {
      createCustomerForm(null);
    });
    document.getElementById('create-supplier-btn').addEventListener('click', function () {
      createSupplierForm(null);
    });

    // Search & filter listeners
    document.getElementById('order-search').addEventListener('input', renderOrders);
    document.getElementById('order-status-filter').addEventListener('change', renderOrders);
    document.getElementById('product-search').addEventListener('input', renderProducts);
    document.getElementById('product-category-filter').addEventListener('change', renderProducts);
    document.getElementById('customer-search').addEventListener('input', renderCustomers);
    document.getElementById('supplier-search').addEventListener('input', renderSuppliers);
  }

  // ---- Public API (for inline event handlers) ----
  window.App = {
    viewOrder: viewOrder,
    editOrder: editOrder,
    deleteOrder: deleteOrder,
    saveOrder: saveOrder,
    changeOrderStatus: changeOrderStatus,
    saveOrderStatus: saveOrderStatus,
    addOrderItem: addOrderItem,
    removeOrderItem: removeOrderItem,
    onProductChange: onProductChange,
    viewProduct: viewProduct,
    editProduct: editProduct,
    deleteProduct: deleteProduct,
    saveProduct: saveProduct,
    editCustomer: editCustomer,
    deleteCustomer: deleteCustomer,
    saveCustomer: saveCustomer,
    editSupplier: editSupplier,
    deleteSupplier: deleteSupplier,
    saveSupplier: saveSupplier,
    closeModal: closeModal
  };

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
