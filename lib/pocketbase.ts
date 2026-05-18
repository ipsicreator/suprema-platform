import PocketBase from 'pocketbase';

// 수프리마 플랫폼 공용 PocketBase 인스턴스
// 로컬: http://127.0.0.1:8090 | 클라우드(Fly.io): https://suprima-platform-pb.fly.dev
const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090');

export default pb;

