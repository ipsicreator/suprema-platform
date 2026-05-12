import PocketBase from 'pocketbase';

// 수프리마 플랫폼 공용 PocketBase 인스턴스
// 로컬 서버 주소: http://127.0.0.1:8090
const pb = new PocketBase('http://127.0.0.1:8090');

export default pb;
