export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'America/New_York', label: 'New York, USA', offset: 'UTC-5/-4' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, USA', offset: 'UTC-8/-7' },
  { value: 'America/Chicago', label: 'Chicago, USA', offset: 'UTC-6/-5' },
  { value: 'Europe/London', label: 'London, UK', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Paris, France', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Berlin, Germany', offset: 'UTC+1/+2' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Japan', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai, China', offset: 'UTC+8' },
  { value: 'Asia/Kolkata', label: 'Mumbai, India', offset: 'UTC+5:30' },
  { value: 'Asia/Dubai', label: 'Dubai, UAE', offset: 'UTC+4' },
  { value: 'Australia/Sydney', label: 'Sydney, Australia', offset: 'UTC+10/+11' },
  { value: 'Pacific/Auckland', label: 'Auckland, New Zealand', offset: 'UTC+12/+13' },
];

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getTimezoneOffset = (timezone: string): string => {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
  const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
  
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.round((Math.abs(offset) - hours) * 60);
  
  return `UTC${sign}${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''}`;
};