// Convert a date to IST (India Standard Time)
export const toIST = (date: Date): Date => {
    const offset = 330; // IST is UTC+5:30 (330 minutes)
    return new Date(date.getTime() + offset * 60 * 1000);
  };
  
  // Format a date as YYYY-MM-DD in IST
  export const formatISTDate = (date: Date): string => {
    return toIST(date).toISOString().split("T")[0];
  };
  
  // Parse a date string in IST
  export const parseISTDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return toIST(date);
  };