// 5부제 규칙: 날짜(일)의 끝자리와 차량번호 끝자리가 같은 조(1·6, 2·7, 3·8, 4·9, 5·0)이면 운행 제한일입니다.

/** 차량번호 끝자리 → 운행 제한되는 날짜 끝자리 두 개 (예: 3 → [3, 8]) */
export function restrictedDigits(plateDigit) {
  const a = plateDigit % 5;
  return a === 0 ? [5, 0] : [a, a + 5];
}

/** 해당 날짜가 내 차의 5부제 날인지 */
export function isRestricted(date, plateDigit, { skipWeekends = true } = {}) {
  const dow = date.getDay();
  if (skipWeekends && (dow === 0 || dow === 6)) return false;
  return restrictedDigits(plateDigit).includes(date.getDate() % 10);
}

/** from(포함)부터 days일 동안의 5부제 날짜 목록 */
export function upcoming(from, plateDigit, days, opts) {
  const out = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < days; i++) {
    if (isRestricted(d, plateDigit, opts)) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/**
 * 5부제 날짜를 하루 종일 일정으로 담은 .ics 캘린더 파일 내용.
 * 휴대폰 캘린더에 가져오면 앱을 열지 않아도 정해진 시각에 알림이 옵니다.
 * eveningHour: 전날 저녁 알림 시각(null이면 없음), morningHour: 당일 아침 알림 시각(null이면 없음)
 */
export function buildIcs(dates, plateDigit, { eveningHour = 21, morningHour = 7, now = new Date() } = {}) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//obuje//5bujae-alarm//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:5부제 알림',
  ];
  for (const d of dates) {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:obuje-${plateDigit}-${ymd(d)}@5bujae`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(d)}`,
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:🚫 5부제 (끝번호 ${restrictedDigits(plateDigit).join('·')}) - 차 두고 출근`,
      'TRANSP:TRANSPARENT',
    );
    // 하루 종일 일정의 알림은 그날 00:00 기준 상대 시간으로 지정합니다.
    if (eveningHour != null) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:내일은 5부제! 차를 두고 출근하세요',
        `TRIGGER:-PT${24 - eveningHour}H`, 'END:VALARM');
    }
    if (morningHour != null) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:오늘은 5부제! 차를 두고 출근하세요',
        `TRIGGER:PT${morningHour}H`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
