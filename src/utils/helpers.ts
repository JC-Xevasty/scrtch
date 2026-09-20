const MILLISECONDS = 1000;
const SECOND = 1 * MILLISECONDS;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const DateFormat = {
    relativeDate: (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffInMilliseconds = Math.max(0, now.getTime() - date.getTime());

        // Less than a minute
        if (diffInMilliseconds < MINUTE) {
            return "Just now"
        }

        // Less than an hour
        if (diffInMilliseconds < HOUR) {
            const diffInMinutes = Math.floor(diffInMilliseconds / MINUTE);
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
        }

        // Less than a day
        if (diffInMilliseconds < DAY) {
            const diffInHours = Math.floor(diffInMilliseconds / HOUR);
            return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
        }

        // Less than a week
        if (diffInMilliseconds < WEEK) {
            const diffInDays = Math.floor(diffInMilliseconds / DAY);
            return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
        }

        // More than a week
        return DateFormat.localString(dateString, "en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
    },
    localString: (dateString: string, locale: Intl.LocalesArgument = "en-US", options: Intl.DateTimeFormatOptions = {}) => {
        const date = new Date(dateString);
        return date.toLocaleString(locale, options);
    }
}
