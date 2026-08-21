import { install } from 'react-native-quick-crypto';

// Login and signup generate this device's E2EE keys before contacting the API.
// This module must execute before the application imports those crypto helpers.
install();
