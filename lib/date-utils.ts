/**
 * Format date in Pakistan/Lahore timezone (short format: "15 Jan 2024")
 * 
 * Note: Database stores timestamps as TIMESTAMP WITHOUT TIME ZONE (intended as Pakistan time).
 * When Prisma returns them, JavaScript Date objects represent them as UTC.
 * We format the UTC components directly, treating them as Pakistan time values.
 */
export function formatDatePakistan(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  // Format UTC components directly as Pakistan time (no conversion)
  const day = dateObj.getUTCDate();
  const month = dateObj.toLocaleDateString("en-us", {
    month: "short",
    timeZone: "UTC",
  });
  const year = dateObj.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date in Pakistan/Lahore timezone (long format: "15 January 2024")
 * 
 * Note: Database stores timestamps as TIMESTAMP WITHOUT TIME ZONE (intended as Pakistan time).
 * When Prisma returns them, JavaScript Date objects represent them as UTC.
 * We format the UTC components directly, treating them as Pakistan time values.
 */
export function formatDateLongPakistan(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  // Format UTC components directly as Pakistan time (no conversion)
  const day = dateObj.getUTCDate();
  const month = dateObj.toLocaleDateString("en-us", {
    month: "long",
    timeZone: "UTC",
  });
  const year = dateObj.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date and time in Pakistan/Lahore timezone (format: "15 Jan 2024, 2:30 PM")
 * 
 * Note: Database stores timestamps as TIMESTAMP WITHOUT TIME ZONE (intended as Pakistan time).
 * When Prisma returns them, JavaScript Date objects represent them as UTC.
 * We format the UTC components directly, treating them as Pakistan time values.
 */
export function formatDateTimePakistan(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";

  // Format date as "15 Jan 2024" using UTC components directly
  const day = dateObj.getUTCDate();
  const month = dateObj.toLocaleDateString("en-us", {
    month: "short",
    timeZone: "UTC",
  });
  const year = dateObj.getUTCFullYear();
  
  // Format time using UTC methods directly (treating as Pakistan time)
  let hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes.toString().padStart(2, "0");
  
  return `${day} ${month} ${year}, ${hours}:${minutesStr} ${ampm}`;
}
