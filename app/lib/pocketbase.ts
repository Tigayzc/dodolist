import PocketBase from 'pocketbase';

// initialize PocketBase client
const client = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

export default client;
