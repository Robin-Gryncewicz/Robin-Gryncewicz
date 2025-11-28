import { AuthService, SecretData } from '../src/auth/AuthService';

const getSecretValueMock = jest.fn();

jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn(() => ({
    getSecretValue: getSecretValueMock
  }))
}));

describe('AuthService', () => {
  beforeEach(() => {
    getSecretValueMock.mockReset();
  });

  it('returns empty response when secret is missing', async () => {
    getSecretValueMock.mockReturnValue({
      promise: () => Promise.reject(new Error('not found'))
    });

    const service = new AuthService('eu-west-1');
    const result = await service.authenticateUser('s-123', 'user1', 'SFTP', '10.0.0.1', 'pwd');

    expect(result).toEqual({});
  });

  it('authenticates user with password when secret matches', async () => {
    const secret: SecretData = {
      Password: 'pwd',
      Role: 'role-arn',
      HomeDirectory: '/home/user1'
    };

    getSecretValueMock.mockReturnValue({
      promise: () => Promise.resolve({ SecretString: JSON.stringify(secret) })
    });

    const service = new AuthService('eu-west-1');
    const result = await service.authenticateUser('s-123', 'user1', 'SFTP', '10.0.0.1', 'pwd');

    expect(result.Role).toBe('role-arn');
    expect(result.HomeDirectory).toBe('/home/user1');
  });

  it('rejects authentication when password does not match', async () => {
    const secret: SecretData = {
      Password: 'correct',
      Role: 'role-arn'
    };

    getSecretValueMock.mockReturnValue({
      promise: () => Promise.resolve({ SecretString: JSON.stringify(secret) })
    });

    const service = new AuthService('eu-west-1');
    const result = await service.authenticateUser('s-123', 'user1', 'SFTP', '10.0.0.1', 'wrong');

    expect(result).toEqual({});
  });
});
