import PocketBase from 'pocketbase';

// 로컬 PocketBase 서버 주소
const pb = new PocketBase('http://127.0.0.1:8090');

export { pb };
