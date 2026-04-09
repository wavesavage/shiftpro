import { useEffect } from 'react';

export default function Timesheet() {
  useEffect(() => {
    window.location.href = '/timesheet.html';
  }, []);
  return null;
}
