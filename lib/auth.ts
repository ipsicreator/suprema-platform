import pb from './pocketbase';

/**
 * 수프리마 표준 권한 체크 로직
 * 규칙: licenses에서 academy_id + active=true만 판정
 */
export async function checkLicense(academyId: string): Promise<boolean> {
  try {
    const license = await pb.collection('licenses').getFirstListItem(
      `academy_id="${academyId}" && active=true`
    );
    return !!license;
  } catch (error) {
    console.error('License Check Failed:', error);
    return false;
  }
}

/**
 * 역할별 접근 제어
 * 역할: master, director, student
 */
export async function getUserProfile(userId: string) {
  try {
    return await pb.collection('profiles').getFirstListItem(`user="${userId}"`);
  } catch (error) {
    console.error('Profile Fetch Failed:', error);
    return null;
  }
}
