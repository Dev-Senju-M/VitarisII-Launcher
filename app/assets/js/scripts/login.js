// login.js — VitarisLauncher
// Flujo de autenticación dual: Microsoft OAuth2 + offline no-premium
//
// Envuelto en IIFE para que sus const locales no colisionen con las
// declaradas por uicore.js (LoggerUtil, ipcRenderer...) y uibinder.js
// (AuthManager, ConfigManager...) en el scope global compartido.
;(function () {

    const { MSFT_OPCODE, MSFT_REPLY_TYPE, MSFT_ERROR } = require('./assets/js/ipcconstants')
    const WhitelistMgr = require('./assets/js/whitelistmanager')
    const loginLogger  = LoggerUtil.getLogger('Login-Microsoft')

    // === State global (loginOptions.js lo lee/escribe por nombre en window) =
    window.loginViewOnSuccess     = VIEWS.landing
    window.loginViewOnCancel      = VIEWS.login
    window.loginViewCancelHandler = null

    window.loginMsftLoginPending = false

    // === Elementos DOM =====================================================
    const loginOfflineUsername = document.getElementById('loginOfflineUsername')
    const loginOfflineButton   = document.getElementById('loginOfflineButton')
    const loginOfflineError    = document.getElementById('loginOfflineUsernameError')

    // === Validación username offline =======================================
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

    // === Login con Microsoft ===============================================
    function loginWithMicrosoft() {
        loginFormDisabled(true)
        switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
            ipcRenderer.send(
                MSFT_OPCODE.OPEN_LOGIN,
                window.loginViewOnSuccess,
                window.loginViewOnCancel
            )
        })
    }

    // Handle Microsoft auth reply — solo para el flujo de login.
    // args[2] en SUCCESS = viewOnSuccess enviado en OPEN_LOGIN = VIEWS.landing
    // args[2] en ERROR   = viewOnClose enviado en OPEN_LOGIN   = VIEWS.login
    // Cuando settings.js inicia el flujo, args[2] = VIEWS.settings → ignorar.
    ipcRenderer.on(MSFT_OPCODE.REPLY_LOGIN, async (_, ...args) => {
        if (args[2] === VIEWS.settings) return

        if (args[0] === MSFT_REPLY_TYPE.ERROR) {
            const viewOnClose = args[2]
            switchView(getCurrentView(), viewOnClose, 500, 500, () => {
                loginFormDisabled(false)
                if (args[1] === MSFT_ERROR.NOT_FINISHED) {
                    loginLogger.info('Microsoft login cancelled by user.')
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
            const queryMap    = args[1]
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

            loginLogger.info('Acquired authCode, proceeding with authentication.')
            try {
                const account = await AuthManager.addMicrosoftAccount(queryMap.code)
                await handlePostAuth(account, viewOnClose)
            } catch (err) {
                console.error('[VitarisLauncher] Microsoft auth error:', err)
                const actualError = isDisplayableError(err)
                    ? err
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

    // === Login offline / no-premium ========================================
    async function loginOffline() {
        if (!validateOfflineUsername()) return
        loginFormDisabled(true)
        try {
            const account = AuthManager.addOfflineAccount(loginOfflineUsername.value.trim())
            await handlePostAuth(account, window.loginViewOnSuccess)
        } catch (err) {
            loginFormDisabled(false)
            loginOfflineError.textContent = Lang.queryJS('login.error.invalidValue')
        }
    }

    // === Post-autenticación: verificar whitelist ===========================
    async function handlePostAuth(account, viewOnSuccess) {
        const allowed = await WhitelistMgr.isWhitelisted(account.username)

        if (!allowed) {
            if (account.type === 'offline') {
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
        window.loginViewCancelHandler = null
        loginOfflineUsername.value = ''
        loginOfflineError.textContent = ''
        loginOfflineButton.disabled = true
        loginFormDisabled(false)
        switchView(getCurrentView(), viewOnSuccess || VIEWS.landing, 500, 500, () => {}, () => {
            if (typeof checkAdminRole === 'function') checkAdminRole()
        })
    }

    // === Helpers UI ========================================================
    function loginFormDisabled(val) {
        loginOfflineUsername.disabled = val
        loginOfflineButton.disabled   = val
        document.getElementById('loginMicrosoftButton').disabled = val
    }

    function loginCancelEnabled(val) {
        const el = document.getElementById('loginCancelContainer')
        if (!el) return
        if (val) { $(el).show() } else { $(el).hide() }
    }

    // Cancel button
    document.getElementById('loginCancelButton').onclick = () => {
        switchView(getCurrentView(), window.loginViewOnCancel, 500, 500, () => {
            loginOfflineUsername.value = ''
            loginOfflineError.textContent = ''
            loginOfflineButton.disabled = true
            loginFormDisabled(false)
            loginCancelEnabled(false)
            if (window.loginViewCancelHandler != null) {
                window.loginViewCancelHandler()
                window.loginViewCancelHandler = null
            }
        })
    }

    // === Exponer globals (onclick en HTML y loginOptions.js) ===============
    window.loginWithMicrosoft  = loginWithMicrosoft
    window.loginOffline        = loginOffline
    window.loginCancelEnabled  = loginCancelEnabled
    window.loginFormDisabled   = loginFormDisabled

})()
