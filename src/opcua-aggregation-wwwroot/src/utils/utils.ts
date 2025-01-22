export const utils = {
  formatTimestamp: (timestamp: string | number | Date): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  },

  formatStatusCode: (statusCode: number): 'Good' | 'Bad' =>
    statusCode === 0 ? 'Good' : 'Bad',
};
