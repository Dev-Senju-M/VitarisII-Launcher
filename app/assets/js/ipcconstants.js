// TODO: Replace with your Azure App Registration Application (client) ID.
// Steps: https://github.com/dscalzi/HeliosLauncher/blob/master/docs/MicrosoftAuth.md
// 1. portal.azure.com → Entra ID → App registrations → New registration
// 2. Supported accounts: Personal Microsoft accounts only
// 3. Redirect URI: Mobile/desktop → https://login.microsoftonline.com/common/oauth2/nativeclient
// 4. Authentication → Allow public client flows: Yes
// 5. API permissions → Xbox Live → XboxLive.signin (delegated)
exports.AZURE_CLIENT_ID = '796686f9-ac69-4280-9bbc-bf575f42bed7'


// Opcodes
exports.MSFT_OPCODE = {
    OPEN_LOGIN: 'MSFT_AUTH_OPEN_LOGIN',
    OPEN_LOGOUT: 'MSFT_AUTH_OPEN_LOGOUT',
    REPLY_LOGIN: 'MSFT_AUTH_REPLY_LOGIN',
    REPLY_LOGOUT: 'MSFT_AUTH_REPLY_LOGOUT'
}
// Reply types for REPLY opcode.
exports.MSFT_REPLY_TYPE = {
    SUCCESS: 'MSFT_AUTH_REPLY_SUCCESS',
    ERROR: 'MSFT_AUTH_REPLY_ERROR'
}
// Error types for ERROR reply.
exports.MSFT_ERROR = {
    ALREADY_OPEN: 'MSFT_AUTH_ERR_ALREADY_OPEN',
    NOT_FINISHED: 'MSFT_AUTH_ERR_NOT_FINISHED'
}

exports.SHELL_OPCODE = {
    TRASH_ITEM: 'TRASH_ITEM'
}