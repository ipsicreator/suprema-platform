export default function AppFooter() {
  return (
    <div className="rounded-[24px] bg-[#111827] px-6 py-6 text-[#d1d5db]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 text-left">
          <div className="text-lg font-black text-white">수프리마 입시&코칭센터</div>
          <div className="text-sm font-semibold leading-7 text-[#cbd5e1]">
            대표: 김기형 대표 컨설턴트 | 연락처: 010-2370-1077(문자전용)
            <br />
            주소 : 서울시 강남구 테헤란로 326 B1F
          </div>
        </div>
        <div className="text-right text-xs font-bold tracking-[0.2em] text-[#94a3b8]">
          PREMIUM DIAGNOSIS
        </div>
      </div>
    </div>
  );
}
