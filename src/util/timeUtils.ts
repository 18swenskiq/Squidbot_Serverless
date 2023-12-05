export abstract class TimeUtils {
    public static GetOffset(timeZone: any): number {
        const timeZoneFormat = Intl.DateTimeFormat('ia', {
            timeZoneName: 'short',
            timeZone,
        });
        const timeZoneParts = timeZoneFormat.formatToParts();
        const timeZoneName = timeZoneParts.find((i) => i.type === 'timeZoneName')!.value;
        const offset = timeZoneName.slice(3);
        if (!offset) return 0;

        const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
        if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;

        const [, sign, hour, minute] = matchData;
        let result = parseInt(hour) * 60;
        if (sign === '+') result *= -1;
        if (minute) result += parseInt(minute);

        return result;
    }

    public static GetDiscordTimestampFromDate(date: Date): string {
        return `<t:${date.getTime() / 1000}:f>`;
    }

    public static GetNewDateFromAddMinutes(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60000);
    }

    // This expects date to be formatted as MM/DD/YYYY and time to be formatted as HH:MM
    public static ComposeDateFromStringComponents(date: string, time: string): Date {
        const mmddyyyy = date.split('/');
        const hhmm = time.split(':');

        return new Date(
            Number(mmddyyyy[2]),
            Number(mmddyyyy[0]) - 1,
            Number(mmddyyyy[1]),
            Number(hhmm[0]),
            Number(hhmm[1])
        );
    }

    public static GetDBFriendlyDateString(date: Date): string {
        return `${date.getMonth() + 1}/${date.getDate().toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        })}/${date.getFullYear()}`;
    }

    public static GetDBFriendlyTimeString(date: Date): string {
        return `${date.getHours().toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
        })}:${date.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
    }
}
