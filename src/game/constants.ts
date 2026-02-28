export const RARITY_NAMES = ['未取得', '緑 (Common)', '青 (Rare)', '紫 (Epic)', '金 (Legendary)', 'クリスタル (Mythic)'];
export const RARITY_COLORS = ['#aaaaaa', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4'];

export function getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.hypot(x2 - x1, y2 - y1);
}
