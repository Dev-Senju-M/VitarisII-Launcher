// admin.js — VitarisLauncher
;(function () {

const AdminWhitelistMgr = require('./assets/js/whitelistmanager')
const AdminMgr          = require('./assets/js/adminmanager')
const AdminAuthMgr      = AuthManager  // global from uibinder.js

let _whitelist = []
let _token     = null

// === Token modal (replaces prompt()) ===================================
function adminPromptToken() {
    return new Promise(resolve => {
        const modal      = document.getElementById('adminTokenModal')
        const input      = document.getElementById('adminTokenInput')
        const confirmBtn = document.getElementById('adminTokenConfirmBtn')
        const cancelBtn  = document.getElementById('adminTokenCancelBtn')

        input.value = ''
        modal.style.display = 'flex'
        setTimeout(() => input.focus(), 50)

        function done(val) {
            modal.style.display = 'none'
            confirmBtn.removeEventListener('click', onConfirm)
            cancelBtn.removeEventListener('click', onCancel)
            input.removeEventListener('keydown', onKey)
            resolve(val || null)
        }
        function onConfirm() { done(input.value.trim()) }
        function onCancel()  { done(null) }
        function onKey(e)    { if (e.key === 'Enter') onConfirm() }

        confirmBtn.addEventListener('click', onConfirm)
        cancelBtn.addEventListener('click', onCancel)
        input.addEventListener('keydown', onKey)
    })
}

// === Confirm modal (replaces confirm()) ================================
function adminConfirmAction(message) {
    return new Promise(resolve => {
        const modal      = document.getElementById('adminConfirmModal')
        const msgEl      = document.getElementById('adminConfirmMessage')
        const confirmBtn = document.getElementById('adminConfirmOk')
        const cancelBtn  = document.getElementById('adminConfirmModalCancel')

        msgEl.textContent = message
        modal.style.display = 'flex'

        function done(val) {
            modal.style.display = 'none'
            confirmBtn.removeEventListener('click', onYes)
            cancelBtn.removeEventListener('click', onNo)
            resolve(val)
        }
        function onYes() { done(true) }
        function onNo()  { done(false) }

        confirmBtn.addEventListener('click', onYes)
        cancelBtn.addEventListener('click', onNo)
    })
}

// === Init ==============================================================
async function adminInit() {
    _token = AdminMgr.getToken()

    if (!_token) {
        const input = await adminPromptToken()
        if (!input) { adminBack(); return }
        AdminMgr.setToken(input)
        _token = input
    }

    await adminRefresh()
}

async function adminRefresh() {
    const statusEl = document.getElementById('adminSyncStatus')
    try {
        _whitelist = await AdminWhitelistMgr.fetchWhitelist()
        statusEl.textContent = 'Sincronizado: ' + new Date().toLocaleTimeString()
    } catch (err) {
        const cached = AdminWhitelistMgr.loadCachedWhitelist()
        if (cached.length > 0) {
            _whitelist = cached
            statusEl.textContent = 'Sin conexión — mostrando caché local'
        } else {
            statusEl.textContent = 'Error de sincronización: ' + (err.message || 'sin conexión')
        }
    }
    adminRenderList(_whitelist)
    adminUpdateFooter()
}

// === List render =======================================================
function adminRenderList(list) {
    const container = document.getElementById('adminUserList')
    container.innerHTML = ''
    list.forEach(entry => {
        const row = document.createElement('div')
        row.className = 'adminRow'
        row.dataset.username = entry.username.toLowerCase()

        const usernameSpan = document.createElement('span')
        usernameSpan.className = 'adminRowUsername'
        usernameSpan.textContent = entry.username

        const typeSpan = document.createElement('span')
        typeSpan.className = `adminRowType-${entry.type}`
        typeSpan.textContent = `● ${entry.type === 'microsoft' ? 'Microsoft' : 'No-premium'}`

        const dateSpan = document.createElement('span')
        dateSpan.className = 'adminRowDate'
        dateSpan.textContent = entry.addedAt || '—'

        const removeBtn = document.createElement('button')
        removeBtn.className = 'adminRemoveBtn'
        removeBtn.textContent = 'Quitar'
        removeBtn.addEventListener('click', () => adminRemoveUser(entry.username))

        row.appendChild(usernameSpan)
        row.appendChild(typeSpan)
        row.appendChild(dateSpan)
        row.appendChild(removeBtn)
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

// === Search filter =====================================================
function adminFilterUsers() {
    const q = document.getElementById('adminSearch').value.toLowerCase()
    document.querySelectorAll('.adminRow').forEach(row => {
        row.style.display = row.dataset.username.includes(q) ? '' : 'none'
    })
}

// === Add modal =========================================================
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
        const msg = err.response ? `HTTP ${err.response.statusCode}` : (err.message || 'desconocido')
        errEl.textContent = 'Error al guardar: ' + msg
    } finally {
        document.getElementById('adminConfirmAdd').disabled = false
    }
}

// === Remove user =======================================================
async function adminRemoveUser(username) {
    const ok = await adminConfirmAction(`¿Quitar a "${username}" de la whitelist?`)
    if (!ok) return
    try {
        _whitelist = await AdminMgr.removeUser(_whitelist, username, _token)
        adminRenderList(_whitelist)
        adminUpdateFooter()
    } catch (err) {
        document.getElementById('adminSyncStatus').textContent =
            'Error al quitar: ' + (err.message || 'desconocido')
    }
}

// === Navigation ========================================================
function adminBack() {
    switchView(getCurrentView(), VIEWS.landing)
}

// === Event listeners ===================================================
document.getElementById('adminBackButton').addEventListener('click', adminBack)
document.getElementById('adminSearch').addEventListener('input', adminFilterUsers)
document.getElementById('adminAddButton').addEventListener('click', adminShowAddModal)
document.getElementById('adminAddCancelBtn').addEventListener('click', adminCancelAdd)
document.getElementById('adminConfirmAdd').addEventListener('click', adminConfirmAddUser)
document.getElementById('adminAddUsername').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminConfirmAddUser()
})

// === Expose globals (called from landing.js and uibinder.js) ===========
window.adminInit = adminInit
window.adminBack = adminBack

})()
