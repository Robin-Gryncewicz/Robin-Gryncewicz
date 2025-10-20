import { SecretsManager } from 'aws-sdk';
import * as ipaddr from 'ipaddr.js';

/**
 * AuthService - A TypeScript implementation of FTP/SFTP authentication services
 * Based on the Python authorizer implementation
 */
export interface AuthResponse {
    Role?: string;
    Policy?: string;
    HomeDirectoryDetails?: string;
    HomeDirectoryType?: string;
    HomeDirectory?: string;
    PublicKeys?: string[];
}

export interface SecretData {
    Role?: string;
    Policy?: string;
    HomeDirectoryDetails?: string;
    HomeDirectory?: string;
    Password?: string;
    SFTPPassword?: string;
    FTPPassword?: string;
    FTPSPassword?: string;
    PublicKey?: string;
    SFTPPublicKey?: string;
    AcceptedIpNetwork?: string;
    SFTPAcceptedIpNetwork?: string;
    FTPAcceptedIpNetwork?: string;
    FTPSAcceptedIpNetwork?: string;
    [key: string]: any;
}

export enum AuthenticationType {
    PASSWORD = 'PASSWORD',
    SSH = 'SSH',
}

export class AuthService {
    private readonly secretsManager: SecretsManager;
    private readonly region: string;

    constructor(region: string = process.env.AWS_REGION || 'eu-west-1') {
        this.region = region;
        this.secretsManager = new SecretsManager({ region: this.region });
    }

    /**
     * Authenticate a user against the FTP/SFTP service
     * @param serverId The Transfer Family server ID
     * @param username The username attempting to authenticate
     * @param protocol The protocol being used (SFTP, FTP, FTPS)
     * @param sourceIp The source IP of the connection
     * @param password The password provided (if any)
     * @returns An authentication response object or empty object if authentication fails
     */
    public async authenticateUser(
        serverId: string,
        username: string,
        protocol: string,
        sourceIp: string,
        password?: string
    ): Promise<AuthResponse> {
        console.log(`ServerId: ${serverId}, Username: ${username}, Protocol: ${protocol}, SourceIp: ${sourceIp}`);

        // Determine authentication type
        console.log('Start User Authentication Flow');
        let authenticationType: AuthenticationType;

        if (password) {
            console.log('Using PASSWORD authentication');
            authenticationType = AuthenticationType.PASSWORD;
        } else {
            if (protocol === 'FTP' || protocol === 'FTPS') {
                console.log('Empty password not allowed for FTP/S');
                return {};
            }
            console.log('Using SSH authentication');
            authenticationType = AuthenticationType.SSH;
        }

        // Get user secret
        const secretName = `ftpSecret/${serverId}/${username}`;
        const secretData = await this.getSecret(secretName);

        if (!secretData) {
            console.log('Secrets Manager exception thrown - Returning empty response');
            return {};
        }

        // Verify user credentials
        const userAuthenticated = this.verifyAuthentication(
            authenticationType,
            secretData,
            password || '',
            protocol
        );

        // Check IP restrictions
        const ipMatch = this.checkSourceIp(secretData, sourceIp, protocol);

        if (userAuthenticated && ipMatch) {
            console.log(`User authenticated, building response with: ${authenticationType}`);
            return this.buildAuthResponse(secretData, authenticationType, protocol);
        } else {
            console.log('User failed authentication return empty response');
            return {};
        }
    }

    /**
     * Verify the user's authentication credentials
     */
    private verifyAuthentication(
        authType: AuthenticationType,
        secretData: SecretData,
        password: string,
        protocol: string
    ): boolean {
        if (authType === AuthenticationType.SSH) {
            // Additional SSH checks could be added in the future
            console.log('Skip password check as SSH login request');
            return true;
        } else {
            // Get the protocol-specific password if it exists, otherwise fall back to generic password
            const storedPassword = this.lookupValue(secretData, 'Password', protocol);

            if (!storedPassword) {
                console.log('Unable to authenticate user - No field match in Secret for password');
                return false;
            }

            if (password === storedPassword) {
                return true;
            } else {
                console.log('Unable to authenticate user - Incoming password does not match stored');
                return false;
            }
        }
    }

    /**
     * Check if the source IP is within the allowed IP ranges
     */
    private checkSourceIp(secretData: SecretData, sourceIp: string, protocol: string): boolean {
        const acceptedIpNetwork = this.lookupValue(secretData, 'AcceptedIpNetwork', protocol);

        if (!acceptedIpNetwork) {
            // No IP restrictions specified
            console.log('No IP range provided - Skip IP check');
            return true;
        }

        try {
            // Check if the source IP is within the allowed CIDR range
            const ipRange = ipaddr.parseCIDR(acceptedIpNetwork);
            const addr = ipaddr.parse(sourceIp);

            if (addr.kind() === ipRange[0].kind()) {
                return addr.match(ipRange);
            }

            console.log('Source IP address not in range');
            return false;
        } catch (error) {
            console.error('Error checking IP address:', error);
            // If there's an error parsing the IP, fail closed for security
            return false;
        }
    }

    /**
     * Build the authentication response object
     */
    private buildAuthResponse(
        secretData: SecretData,
        authType: AuthenticationType,
        protocol: string
    ): AuthResponse {
        const response: AuthResponse = {};

        // Role is required
        const role = this.lookupValue(secretData, 'Role', protocol);
        if (role) {
            response.Role = role;
        } else {
            console.log('No field match for role - Set empty string in response');
            response.Role = '';
        }

        // Policy is optional
        const policy = this.lookupValue(secretData, 'Policy', protocol);
        if (policy) {
            response.Policy = policy;
        }

        // HomeDirectoryDetails takes precedence over HomeDirectory
        const homeDirectoryDetails = this.lookupValue(secretData, 'HomeDirectoryDetails', protocol);
        if (homeDirectoryDetails) {
            console.log('HomeDirectoryDetails found - Applying setting for virtual folders');
            response.HomeDirectoryDetails = homeDirectoryDetails;
            // If we have virtual folders, we need to set the HomeDirectoryType
            console.log('Setting HomeDirectoryType to LOGICAL');
            response.HomeDirectoryType = 'LOGICAL';
        } else {
            // Check for regular home directory
            const homeDirectory = this.lookupValue(secretData, 'HomeDirectory', protocol);
            if (homeDirectory) {
                console.log('HomeDirectory found');
                response.HomeDirectory = homeDirectory;
            }
        }

        // For SSH authentication, public key is required
        if (authType === AuthenticationType.SSH) {
            const publicKey = this.lookupValue(secretData, 'PublicKey', protocol);
            if (publicKey) {
                response.PublicKeys = [publicKey];
            } else {
                // SSH authentication requires public keys
                console.log('Unable to authenticate user - No public keys found');
                return {};
            }
        }

        return response;
    }

    /**
     * Look up a value in the secret data, checking for protocol-specific overrides first
     */
    private lookupValue(secretData: SecretData, key: string, protocol: string): string | undefined {
        const protocolKey = `${protocol}${key}`;

        if (protocolKey in secretData) {
            console.log(`Found protocol-specified ${key}`);
            return secretData[protocolKey];
        } else {
            return secretData[key];
        }
    }

    /**
     * Retrieve a secret from AWS Secrets Manager
     */
    private async getSecret(secretId: string): Promise<SecretData | null> {
        console.log(`Secrets Manager Region: ${this.region}`);
        console.log(`Secret Name: ${secretId}`);

        try {
            const response = await this.secretsManager.getSecretValue({ SecretId: secretId }).promise();

            if (response.SecretString) {
                console.log('Found Secret String');
                return JSON.parse(response.SecretString);
            } else if (response.SecretBinary) {
                console.log('Found Binary Secret');
                // Convert binary secret to string and parse
                const buff = Buffer.from(response.SecretBinary as string, 'base64');
                return JSON.parse(buff.toString('ascii'));
            }

            return null;
        } catch (error) {
            console.error('Error retrieving secret:', error);
            return null;
        }
    }
}
