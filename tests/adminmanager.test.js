jest.mock('got')
jest.mock('../app/assets/js/configmanager', () => ({
    getAdminToken: jest.fn(() => null),
    setAdminToken: jest.fn(),
    getSelectedAccount: () => ({ displayName: 'AdminUser' })
}), { virtual: true })

beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
})

describe('setToken / getToken', () => {
    it('codifica y decodifica el token correctamente', () => {
        const ConfigManager = require('../app/assets/js/configmanager')
        ConfigManager.getAdminToken.mockReturnValue(
            Buffer.from('ghp_test123').toString('base64')
        )
        const { setToken, getToken } = require('../app/assets/js/adminmanager')
        setToken('ghp_test123')
        expect(ConfigManager.setAdminToken).toHaveBeenCalled()
        const token = getToken()
        expect(token).toBe('ghp_test123')
    })
})

describe('addUser', () => {
    it('agrega usuario a la lista y llama a pushWhitelist', async () => {
        const got = require('got')
        // mock getFileSha
        got.mockResolvedValue({ body: { sha: 'abc123' } })
        got.put = jest.fn().mockResolvedValue({})

        const { addUser } = require('../app/assets/js/adminmanager')
        const current = [{ username: 'Existing', uuid: 'e1', type: 'microsoft', addedAt: '2026-01-01' }]
        const result = await addUser(current, 'NewUser', 'nu1', 'offline', 'ghp_token')

        expect(result).toHaveLength(2)
        expect(result[1].username).toBe('NewUser')
        expect(result[1].type).toBe('offline')
        expect(got.put).toHaveBeenCalledWith(
            expect.stringContaining('vitaris-distro'),
            expect.objectContaining({ json: expect.objectContaining({ sha: 'abc123' }) })
        )
    })
})

describe('removeUser', () => {
    it('elimina usuario de la lista y llama a pushWhitelist', async () => {
        const got = require('got')
        got.mockResolvedValue({ body: { sha: 'def456' } })
        got.put = jest.fn().mockResolvedValue({})

        const { removeUser } = require('../app/assets/js/adminmanager')
        const current = [
            { username: 'UserA', uuid: 'a1', type: 'microsoft', addedAt: '2026-01-01' },
            { username: 'UserB', uuid: 'b1', type: 'offline', addedAt: '2026-01-01' }
        ]
        const result = await removeUser(current, 'usera', 'ghp_token')

        expect(result).toHaveLength(1)
        expect(result[0].username).toBe('UserB')
        expect(got.put).toHaveBeenCalled()
    })
})
