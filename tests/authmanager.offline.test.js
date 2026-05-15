jest.mock('../app/assets/js/configmanager', () => ({
    getLauncherDirectory: () => '/tmp',
    getAbstractConfigValue: jest.fn(() => ({})),
    setAbstractConfigValue: jest.fn(),
    save: jest.fn(),
    getSelectedAccount: () => null,
    addOfflineAuthAccount: jest.fn((uuid, username) => ({
        type: 'offline',
        accessToken: '0',
        username: username,
        uuid: uuid,
        displayName: username
    }))
}), { virtual: true })

beforeEach(() => {
    jest.resetModules()
})

describe('generateOfflineUUID', () => {
    it('genera el mismo UUID para el mismo username', () => {
        const { generateOfflineUUID } = require('../app/assets/js/authmanager')
        const uuid1 = generateOfflineUUID('TestPlayer')
        const uuid2 = generateOfflineUUID('TestPlayer')
        expect(uuid1).toBe(uuid2)
    })

    it('genera UUIDs distintos para usernames distintos', () => {
        const { generateOfflineUUID } = require('../app/assets/js/authmanager')
        expect(generateOfflineUUID('PlayerA')).not.toBe(generateOfflineUUID('PlayerB'))
    })

    it('tiene el formato UUID (8-4-4-4-12 hex)', () => {
        const { generateOfflineUUID } = require('../app/assets/js/authmanager')
        const uuid = generateOfflineUUID('SomePlayer')
        expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
})

describe('addOfflineAccount', () => {
    it('retorna un objeto account con type offline y accessToken "0"', () => {
        const { addOfflineAccount } = require('../app/assets/js/authmanager')
        const account = addOfflineAccount('NuevoJugador')
        expect(account.type).toBe('offline')
        expect(account.accessToken).toBe('0')
        expect(account.displayName).toBe('NuevoJugador')
        expect(account.username).toBe('NuevoJugador')
        expect(account.uuid).toMatch(/^[0-9a-f-]{36}$/)
    })
})
