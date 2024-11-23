import PocketBase from 'pocketbase';

// Environment variables
const dbHost = process.env.EXPO_PUBLIC_DB_HOST ?? '';
const dbUser = process.env.EXPO_PUBLIC_DB_USER ?? '';
const dbPass = process.env.EXPO_PUBLIC_DB_PASS ?? '';

// Validasi environment variables
if (!dbHost || !dbUser || !dbPass) {
    throw new Error(
        'Environment variables EXPO_PUBLIC_DB_HOST, EXPO_PUBLIC_DB_USER, and EXPO_PUBLIC_DB_PASS must be defined.'
    );
}

// Initialize PocketBase
const pb = new PocketBase(dbHost);

class AuthManager {
    private static instance: AuthManager | null = null;
    private email: string;
    private password: string;

    private constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    public static getInstance(): AuthManager {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager(dbUser, dbPass);
        }
        return AuthManager.instance;
    }

    /**
     * Ensure the user is authenticated.
     * If already authenticated, skip re-authentication.
     */
    private async ensureAuthenticated(): Promise<void> {
        if (!pb.authStore.isValid) {
            try {
                await pb.admins.authWithPassword(this.email, this.password);
                console.log('[AuthManager] Authenticated successfully');
            } catch (error: any) {
                console.error('[AuthManager] Authentication failed:', error.message || error);
                throw new Error('Authentication failed. Please check your credentials.');
            }
        }
    }

    /**
     * Fetch all records from a collection with optional query parameters.
     * @param collectionName - The name of the PocketBase collection.
     * @param queryOptions - Optional query parameters such as filter, sort, etc.
     */
    public async fetchCollection(collectionName: string, queryOptions: Record<string, any> = {}): Promise<any[]> {
        await this.ensureAuthenticated();
        try {
            const records = await pb.collection(collectionName).getFullList(200, queryOptions);
            console.log(`[AuthManager] Fetched ${records.length} records from ${collectionName}`);
            return records;
        } catch (error: any) {
            console.error(`[AuthManager] Failed to fetch data from ${collectionName}:`, error.message || error);
            throw new Error(`Failed to fetch data from ${collectionName}.`);
        }
    }

    /**
     * Fetch a single record by ID from a collection.
     * @param collectionName - The name of the PocketBase collection.
     * @param id - The ID of the record.
     * @param expand - Optionally expand relational fields.
     */
    public async fetchRecord(collectionName: string, id: string, expand: string = ''): Promise<any> {
        await this.ensureAuthenticated();
        try {
            const record = await pb.collection(collectionName).getOne(id, { expand });
            console.log(`[AuthManager] Fetched record from ${collectionName} with ID ${id}`);
            return record;
        } catch (error: any) {
            console.error(
                `[AuthManager] Failed to fetch record from ${collectionName} with ID ${id}:`,
                error.message || error
            );
            throw new Error(`Failed to fetch record with ID ${id} from ${collectionName}.`);
        }
    }

    /**
     * Logout the current user and clear the session.
     */
    public logout(): void {
        pb.authStore.clear();
        console.warn('[AuthManager] Logged out successfully');
    }
}

export default AuthManager.getInstance();
