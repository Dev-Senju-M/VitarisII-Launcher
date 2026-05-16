jest.mock('got')
jest.mock('electron', () => ({ app: { getPath: () => '/tmp/vitaris-test' } }), { virtual: true })
jest.mock('../app/assets/js/configmanager', () => ({
    getLauncherDirectory: () => '/tmp/vitaris-test'
}), { virtual: true })

const got = require('got')
const fs = require('fs')
const path = require('path')

const CACHE = path.join('/tmp/vitaris-test', 'whitelist.json')

beforeEach(() => {
    jest.clearAllMocks()
    if (fs.existsSync(CACHE)) fs.unlinkSync(CACHE)
})

describe('isWhitelisted', () => {
    it('devuelve true cuando el username está en la whitelist (case-insensitive)', async () => {
        got.mockResolvedValue({
            body: [
                { username: 'Senju', uuid: 'abc', type: 'microsoft', addedAt: '2026-05-15' }
            ]
        })
        const { isWhitelisted } = require('../app/assets/js/whitelistmanager')
        const result = await isWhitelisted('senju')
        expect(result).toBe(true)
    })

    it('devuelve false cuando el username NO está en la whitelist', async () => {
        got.mockResolvedValue({ body: [] })
        const { isWhitelisted } = require('../app/assets/js/whitelistmanager')
        const result = await isWhitelisted('intruso')
        expect(result).toBe(false)
    })

    it('usa caché local si la red falla', async () => {
        fs.mkdirSync('/tmp/vitaris-test', { recursive: true })
        fs.writeFileSync(CACHE, JSON.stringify([
            { username: 'Cached_User', uuid: 'xyz', type: 'offline', addedAt: '2026-05-15' }
        ]))
        got.mockRejectedValue(new Error('network error'))
        const { isWhitelisted } = require('../app/assets/js/whitelistmanager')
        const result = await isWhitelisted('cached_user')
        expect(result).toBe(true)
    })
})
