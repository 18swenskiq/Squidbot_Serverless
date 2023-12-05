export abstract class TimeUtils {
    static getOffset = (timeZone: any) => {
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
    };
}
