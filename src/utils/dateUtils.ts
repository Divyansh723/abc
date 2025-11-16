import { format, isToday, isYesterday, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

/**
 * Format a date for display
 */
export const formatDate = (date: Date, formatString: string = 'MMM dd, yyyy'): string => {
  return format(date, formatString);
};

/**
 * Format a date in the user's timezone
 */
export const formatDateInTimezone = (utcDate: Date, timezone: string, formatString: string = 'MMM dd, yyyy'): string => {
  const zonedDate = utcToZonedTime(utcDate, timezone);
  return format(zonedDate, formatString);
};

/**
 * Check if a UTC date is today in the user's timezone
 */
export const isTodayInTimezone = (utcDate: Date, timezone: string): boolean => {
  const zonedDate = utcToZonedTime(utcDate, timezone);
  const now = utcToZonedTime(new Date(), timezone);
  return isSameDay(zonedDate, now);
};

/**
 * Check if a date is today (legacy - uses local timezone)
 */
export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Check if a date is yesterday (legacy - uses local timezone)
 */
export const isDateYesterday = (date: Date): boolean => {
  return isYesterday(date);
};

/**
 * Get the start of day in UTC for a given timezone
 * This is crucial for habit completion tracking
 */
export const getStartOfDayUTC = (date: Date, timezone: string): Date => {
  const zonedDate = utcToZonedTime(date, timezone);
  const startOfDayZoned = startOfDay(zonedDate);
  return zonedTimeToUtc(startOfDayZoned, timezone);
};

/**
 * Get the end of day in UTC for a given timezone
 */
export const getEndOfDayUTC = (date: Date, timezone: string): Date => {
  const zonedDate = utcToZonedTime(date, timezone);
  const endOfDayZoned = endOfDay(zonedDate);
  return zonedTimeToUtc(endOfDayZoned, timezone);
};

/**
 * Legacy function - kept for backwards compatibility
 */
export const getStartOfDay = (date: Date, timezone: string): Date => {
  return getStartOfDayUTC(date, timezone);
};

/**
 * Legacy function - kept for backwards compatibility
 */
export const getEndOfDay = (date: Date, timezone: string): Date => {
  return getEndOfDayUTC(date, timezone);
};

/**
 * Get current date/time in a specific timezone
 */
export const getCurrentDateInTimezone = (timezone: string): Date => {
  return utcToZonedTime(new Date(), timezone);
};

/**
 * Convert UTC date to user's timezone for display
 */
export const convertToUserTimezone = (utcDate: Date, timezone: string): Date => {
  return utcToZonedTime(utcDate, timezone);
};

/**
 * Convert a date from user's timezone to UTC for storage
 * This ensures all dates are stored consistently in UTC
 */
export const convertToUTC = (localDate: Date, timezone: string): Date => {
  return zonedTimeToUtc(localDate, timezone);
};

/**
 * Get the current UTC date/time
 */
export const getCurrentUTC = (): Date => {
  return new Date(); // JavaScript Date objects are always in UTC internally
};

/**
 * Check if two UTC dates are the same day in a given timezone
 */
export const isSameDayInTimezone = (utcDate1: Date, utcDate2: Date, timezone: string): boolean => {
  const zoned1 = utcToZonedTime(utcDate1, timezone);
  const zoned2 = utcToZonedTime(utcDate2, timezone);
  return isSameDay(zoned1, zoned2);
};

/**
 * Get today's date at midnight in UTC for a given timezone
 * Useful for querying today's completions
 */
export const getTodayStartUTC = (timezone: string): Date => {
  const now = new Date();
  return getStartOfDayUTC(now, timezone);
};

/**
 * Get today's date at 23:59:59 in UTC for a given timezone
 */
export const getTodayEndUTC = (timezone: string): Date => {
  const now = new Date();
  return getEndOfDayUTC(now, timezone);
};

/**
 * Format a UTC timestamp for display in user's timezone
 */
export const formatUTCForDisplay = (
  utcDate: Date | string, 
  timezone: string, 
  formatString: string = 'MMM dd, yyyy HH:mm'
): string => {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return formatDateInTimezone(date, timezone, formatString);
};