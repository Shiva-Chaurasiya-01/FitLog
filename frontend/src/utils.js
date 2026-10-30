import { Alert, Platform } from 'react-native';

// Date as "YYYY-MM-DD" (the format the backend uses)
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function today() {
  return formatDate(new Date());
}

export function addDays(dateString, days) {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// "2026-10-23" -> "23 Oct 2026"
export function prettyDate(dateString) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateString.split('-');
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

// Simple message popup that also works on web
export function showMessage(title, message) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

// Asks "are you sure?" and runs onYes if the user agrees
export function confirmAction(title, message, onYes) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Yes', style: 'destructive', onPress: onYes },
  ]);
}
