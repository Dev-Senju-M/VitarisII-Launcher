const got = require('got')
const path = require('path')
const fs = require('fs')
const ConfigManager = require('./configmanager')

const WHITELIST_URL = 'https://raw.githubusercontent.com/Vitaris/vitaris-distro/main/whitelist.json'

function getCachePath() {
    return path.join(ConfigManager.getLauncherDirectory(), 'whitelist.json')
}

async function fetchWhitelist() {
    const response = await got(WHITELIST_URL, { responseType: 'json' })
    const cachePath = getCachePath()
    fs.mkdirSync(path.dirname(cachePath), { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(response.body, null, 2), 'utf8')
    return response.body
}

function loadCachedWhitelist() {
    const cachePath = getCachePath()
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    }
    return []
}

async function isWhitelisted(username) {
    let whitelist
    try {
        whitelist = await fetchWhitelist()
    } catch (_) {
        whitelist = loadCachedWhitelist()
    }
    return whitelist.some(
        entry => entry.username.toLowerCase() === username.toLowerCase()
    )
}

module.exports = { fetchWhitelist, loadCachedWhitelist, isWhitelisted }
