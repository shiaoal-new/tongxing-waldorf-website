/**
 * Format helpers for session date and time
 */

export const formatSessionDate = (sessionDate: any): string => {
    if (!sessionDate) return "未知日期";
    // Handle Firestore Timestamp or Date object/string
    let d: Date;
    if (sessionDate && typeof sessionDate === 'object' && sessionDate._seconds) {
        d = new Date(sessionDate._seconds * 1000);
    } else {
        d = new Date(sessionDate);
    }

    if (isNaN(d.getTime())) return "日期格式錯誤";

    const days = ["日", "一", "二", "三", "四", "五", "六"];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayOfWeek = days[d.getDay()];

    return `${year}-${month}-${day} (${dayOfWeek})`;
};

export const formatSessionTime = (startTime: string | null | undefined, duration?: number): string => {
    if (!startTime) return "---";
    if (!duration) return startTime;

    // Parse start time (HH:mm)
    const parts = startTime.split(':');
    if (parts.length !== 2) return startTime;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);

    // Add duration (minutes)
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const endHours = String(endDate.getHours()).padStart(2, '0');
    const endMinutes = String(endDate.getMinutes()).padStart(2, '0');

    return `${startTime} - ${endHours}:${endMinutes}`;
};
