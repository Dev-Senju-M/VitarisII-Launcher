// admin.js — VitarisLauncher
// Controller del panel de administración de whitelist

// Paths relativos a app/ (directorio de la página HTML en el renderer de Electron)
// Prefijo Admin_ para evitar conflicto de scope con las mismas const en login.js
const AdminWhitelistMgr = require('./assets/js/whitelistmanager')
const AdminMgr          = require('./assets/js/adminmanager')
const AdminAuthMgr      = AuthManager  // ya declarado globalmente por uibinder.js

let _whitelist = []
let _token     = null

async function adminInit() {
    _token = AdminMgr.getToken()

    if (!_token) {
        const input = prompt('Ingresa tu GitHub Personal Access Token (permisos: repo):')
        if (!input) { adminBack(); return }
        AdminMgr.setToken(input)
        _token = input
    }

    await adminRefresh()
}

async function adminRefresh() {
    try {
        _whitelist = await AdminWhitelistMgr.fetchWhitelist()
        adminRenderList(_whitelist)
        adminUpdateFooter()
        document.getElementById('adminSyncStatus').textContent =
            'Sincronizado: ' + new Date().toLocaleTimeString()
    } catch (err) {
        document.getElementById('adminSyncStatus').textContent = 'Error de sincronización'
    }
}

function adminRenderList(list) {
    const container = document.getElementById('adminUserList')
    container.innerHTML = ''
    list.forEach(entry => {
        const row = document.createElement('div')
        row.className = 'adminRow'
        row.dataset.username = entry.username.toLowerCase()
        const typeLabel = entry.type === 'microsoft' ? 'Microsoft' : 'No-premium'
        row.innerHTML = `
            <span class="adminRowUsername">${entry.username}</span>
            <span class="adminRowType-${entry.type}">● ${typeLabel}</span>
            <span class="adminRowDate">${entry.addedAt || '—'}</span>
            <button class="adminRemoveBtn" onclick="adminRemoveUser('${entry.username}')">Quitar</button>
        `
        container.appendChild(row)
    })
}

function adminUpdateFooter() {
    const count = _whitelist.length
    document.getElementById('adminUserCount').textContent =
        `${count} usuario${count !== 1 ? 's' : ''} en whitelist`
    document.getElementById('adminLastSync').textContent =
        'Última sync: ' + new Date().toLocaleTimeString()
}

function adminFilterUsers() {
    const q = document.getElementById('adminSearch').value.toLowerCase()
    document.querySelectorAll('.adminRow').forEach(row => {
        row.style.display = row.dataset.username.includes(q) ? '' : 'none'
    })
}

function adminShowAddModal() {
    document.getElementById('adminAddModal').style.display = 'flex'
    document.getElementById('adminAddUsername').value = ''
    document.getElementById('adminAddError').textContent = ''
    document.getElementById('adminAddUsername').focus()
}

function adminCancelAdd() {
    document.getElementById('adminAddModal').style.display = 'none'
}

async function adminConfirmAddUser() {
    const username = document.getElementById('adminAddUsername').value.trim()
    const type     = document.getElementById('adminAddType').value
    const errEl    = document.getElementById('adminAddError')

    if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
        errEl.textContent = 'Username inválido (1-16 chars, alfanumérico + _)'
        return
    }
    if (_whitelist.some(e => e.username.toLowerCase() === username.toLowerCase())) {
        errEl.textContent = 'Este usuario ya está en la whitelist'
        return
    }

    document.getElementById('adminConfirmAdd').disabled = true
    errEl.textContent = ''

    try {
        const uuid = type === 'offline'
            ? AdminAuthMgr.generateOfflineUUID(username)
            : 'microsoft-' + username.toLowerCase()
        _whitelist = await AdminMgr.addUser(_whitelist, username, uuid, type, _token)
        adminRenderList(_whitelist)
        adminUpdateFooter()
        adminCancelAdd()
    } catch (err) {
        errEl.textContent = 'Error al guardar: ' + (err.message || 'desconocido')
    } finally {
        document.getElementById('adminConfirmAdd').disabled = false
    }
}

async function adminRemoveUser(username) {
    if (!confirm(`¿Quitar a "${username}" de la whitelist?`)) return
    try {
        _whitelist = await AdminMgr.removeUser(_whitelist, username, _token)
        adminRenderList(_whitelist)
        adminUpdateFooter()
    } catch (err) {
        alert('Error al quitar usuario: ' + (err.message || 'desconocido'))
    }
}

function adminBack() {
    switchView(getCurrentView(), VIEWS.landing)
}
