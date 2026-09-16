$content = @'
import { KeysetCursor } from '../types/feed.types';

export class KeysetCursorUtil {
  static encode(tier: number | undefined, createdAt: Date, id: string): string {
    const parts = [tier ?? '', createdAt.toISOString(), id].filter(p => p !== '');
    return Buffer.from(parts.join('_')).toString('base64');
  }

  static decode(cursor: string): KeysetCursor | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('ascii');
      const parts = decoded.split('_');
      if (parts.length === 3) {
        return {
          tier: parseInt(parts[0], 10),
          createdAt: new Date(parts[1]),
          id: parts[2],
        };
      } else if (parts.length === 2) {
        return {
          createdAt: new Date(parts[0]),
          id: parts[1],
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
'@
Set-Content -Path "src/core/utils/keyset-cursor.util.ts" -Value $content -Encoding UTF8
Write-Host "Created Keyset Cursor Utility"
