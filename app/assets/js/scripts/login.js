// login.js — VitarisLauncher
// Flujo de autenticación dual: Microsoft OAuth2 + offline no-premium

const { MSFT_OPCODE, MSFT_REPLY_TYPE, MSFT_ERROR } = require('./assets/js/ipcconstants')
const AuthManager  = require('./assets/js/authmanager')
const WhitelistMgr = require('./assets/js/whitelistmanager')
const { LoggerUtil } = require('helios-core')

const msftLoginLogger = LoggerUtil.getLogger('Login-Microsoft')

// === State variables (consumed by loginOptions.js) ============
let loginViewOnSuccess = VIEWS.landing
let loginViewOnCancel  = VIEWS.settings
let loginViewCancelHandler

// === Elementos DOM ============================================
const loginOfflineUsername = document.getElementById('loginOfflineUsername')
const loginOfflineButton   = document.getElementById('loginOfflineButton')
const loginOfflineError    = document.getElementById('loginOfflineUsernameError')

// === Validación username offline ==============================
const USERNAME_REGEX = /^[a-zA-Z0-9_]{1,16}$/

function validateOfflineUsername() {
    const val = loginOfflineUsername.value.trim()
    if (!USERNAME_REGEX.test(val)) {
        loginOfflineError.textContent = Lang.queryJS('login.error.invalidValue')
        loginOfflineButton.disabled = true
        return false
    }
    loginOfflineError.textContent = ''
    loginOfflineButton.disabled = false
    return true
}

loginOfflineUsername.addEventListener('input', validateOfflineUsername)
loginOfflineUsername.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !loginOfflineButton.disabled) loginOffline()
})

// === Login con Microsoft ======================================
function loginWithMicrosoft() {
    loginFormDisabled(true)
    switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
        ipcRenderer.send(
            MSFT_OPCODE.OPEN_LOGIN,
            loginViewOnSuccess,
            loginViewOnCancel
        )
    })
}

// Handle Microsoft auth reply (SUCCESS path — auth code received)
ipcRenderer.on(MSFT_OPCODE.REPLY_LOGIN, async (_, ...args) => {
    // Only handle replies that originated from the login view context.
    // settings.js also listens to this event for its own Microsoft add-account flow.
    // The viewOnClose argument tells us where to go on close.
    if (args[0] === MSFT_REPLY_TYPE.ERROR) {
        const viewOnClose = args[2]
        switchView(getCurrentView(), viewOnClose, 500, 500, () => {
            loginFormDisabled(false)
            if (args[1] === MSFT_ERROR.NOT_FINISHED) {
                msftLoginLogger.info('Microsoft login cancelled by user.')
                return
            }
            setOverlayContent(
                Lang.queryJS('settings.msftLogin.errorTitle'),
                Lang.queryJS('settings.msftLogin.errorMessage'),
                Lang.queryJS('login.tryAgain')
            )
            setOverlayHandler(() => { toggleOverlay(false) })
            toggleOverlay(true)
        })
    } else if (args[0] === MSFT_REPLY_TYPE.SUCCESS) {
        const queryMap  = args[1]
        const viewOnClose = args[2]

        if (Object.prototype.hasOwnProperty.call(queryMap, 'error')) {
            switchView(getCurrentView(), viewOnClose, 500, 500, () => {
                loginFormDisabled(false)
                setOverlayContent(
                    queryMap.error,
                    queryMap.error_description,
                    Lang.queryJS('login.tryAgain')
                )
                setOverlayHandler(() => { toggleOverlay(false) })
                toggleOverlay(true)
            })
            return
        }

        msftLoginLogger.info('Acquired authCode, proceeding with authentication.')
        try {
            const account = await AuthManager.addMicrosoftAccount(queryMap.code)
            await handlePostAuth(account, viewOnClose)
        } catch (displayableError) {
            const actualError = isDisplayableError(displayableError)
                ? displayableError
                : { title: Lang.queryJS('login.error.unknown.title'), desc: Lang.queryJS('login.error.unknown.desc') }
            switchView(getCurrentView(), viewOnClose, 500, 500, () => {
                loginFormDisabled(false)
                setOverlayContent(actualError.title, actualError.desc, Lang.queryJS('login.tryAgain'))
                setOverlayHandler(() => { toggleOverlay(false) })
                toggleOverlay(true)
            })
        }
    }
})

// === Login offline / no-premium ==============================
async function loginOffline() {
    if (!validateOfflineUsername()) return

    loginFormDisabled(true)

    try {
        const account = AuthManager.addOfflineAccount(loginOfflineUsername.value.trim())
        await handlePostAuth(account, loginViewOnSuccess)
    } catch (err) {
        loginFormDisabled(false)
        loginOfflineError.textContent = Lang.queryJS('login.error.invalidValue')
    }
}

// === Post-autenticación: verificar whitelist ==================
async function handlePostAuth(account, viewOnSuccess) {
    const allowed = await WhitelistMgr.isWhitelisted(account.username)

    if (!allowed) {
        if (account.type === 'offline') {
            // Remove from config — use ConfigManager directly (no async needed for offline)
            const ConfigManager = require('./assets/js/configmanager')
            ConfigManager.removeAuthAccount(account.uuid)
            ConfigManager.save()
        }
        loginFormDisabled(false)
        setOverlayContent(
            'No estás en la whitelist',
            'Tu nombre de usuario no está en la whitelist del servidor. Contacta a un administrador.',
            Lang.queryJS('login.tryAgain')
        )
        setOverlayHandler(() => { toggleOverlay(false) })
        toggleOverlay(true)
        return
    }

    updateSelectedAccount(account)
    loginCancelEnabled(false)
    loginViewCancelHandler = null
    loginOfflineUsername.value = ''
    loginOfflineError.textContent = ''
    loginOfflineButton.disabled = true
    loginFormDisabled(false)
    switchView(getCurrentView(), viewOnSuccess || VIEWS.landing)
}

// === Helpers UI ==============================================
function loginFormDisabled(val) {
    loginOfflineUsername.disabled = val
    loginOfflineButton.disabled   = val
    document.getElementById('loginMicrosoftButton').disabled = val
}

function loginCancelEnabled(val) {
    const el = document.getElementById('loginCancelContainer')
    if (!el) return
    if (val) {
        $(el).show()
    } else {
        $(el).hide()
    }
}

// Cancel button wiring
document.getElementById('loginCancelButton').onclick = () => {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
        loginOfflineUsername.value = ''
        loginOfflineError.textContent = ''
        loginOfflineButton.disabled = true
        loginFormDisabled(false)
        loginCancelEnabled(false)
        if (loginViewCancelHandler != null) {
            loginViewCancelHandler()
            loginViewCancelHandler = null
        }
    })
}
