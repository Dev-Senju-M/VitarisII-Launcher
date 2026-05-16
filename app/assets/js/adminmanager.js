const got           = require('got')
const ConfigManager = require('./configmanager')

const GITHUB_OWNER   = 'Dev-Senju-M'
const GITHUB_REPO    = 'VitarisII-Launcher'
const WHITELIST_PATH = 'data/whitelist.json'
const API_BASE       = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${WHITELIST_PATH}`

function getToken() {
    const stored = ConfigManager.getAdminToken()
    if (!stored) return null
    return Buffer.from(stored, 'base64').toString('utf8')
}
exports.getToken = getToken

function setToken(token) {
    const encoded = Buffer.from(token, 'utf8').toString('base64')
    ConfigManager.setAdminToken(encoded)
}
exports.setToken = setToken

async function getFileSha(token) {
    const res = await got(API_BASE, {
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'VitarisLauncher'
        },
        responseType: 'json'
    })
    return res.body.sha
}

async function pushWhitelist(entries, token) {
    const sha     = await getFileSha(token)
    const content = Buffer.from(JSON.stringify(entries, null, 2)).toString('base64')
    const account = ConfigManager.getSelectedAccount()
    await got.put(API_BASE, {
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'VitarisLauncher'
        },
        json: {
            message: `whitelist: actualización por ${account ? account.displayName : 'admin'}`,
            content,
            sha
        }
    })
}
exports.pushWhitelist = pushWhitelist

async function addUser(currentList, username, uuid, type, token) {
    const today   = new Date().toISOString().split('T')[0]
    const newList = [...currentList, { username, uuid, type, addedAt: today }]
    await pushWhitelist(newList, token)
    return newList
}
exports.addUser = addUser

async function removeUser(currentList, username, token) {
    const newList = currentList.filter(
        e => e.username.toLowerCase() !== username.toLowerCase()
    )
    await pushWhitelist(newList, token)
    return newList
}
exports.removeUser = removeUser
