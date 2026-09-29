import { defineConfig } from '@capawesome/capacitor-electron/config';
import { dialog } from 'electron';

type BluetoothSelectionEvent = {
  preventDefault: () => void;
};

type BluetoothSelectionDevice = {
  deviceId: string;
  deviceName?: string;
};

type UsbSelectionEvent = {
  preventDefault: () => void;
};

type UsbSelectionDevice = {
  deviceId: string;
  deviceName?: string;
  vendorId?: number;
  productId?: number;
};

type UsbSelectionDetails = {
  deviceList: UsbSelectionDevice[];
};

type DeviceSelectableWebContents = {
  on: (
    event: 'select-usb-device',
    listener: (
      event: UsbSelectionEvent,
      details: UsbSelectionDetails,
      callback: (deviceId: string) => void,
    ) => void,
  ) => void;
};

export default defineConfig({
  window: {
    width: 1200,
    height: 800,
  },
  hooks: {
    beforeReady: (app) => {
      app.commandLine.appendSwitch('enable-experimental-web-platform-features');
    },
    onWindowCreated: async (window) => {
      const webContents = window.webContents as typeof window.webContents & DeviceSelectableWebContents;
      window.webContents.session.setDevicePermissionHandler((details) => details.deviceType === 'usb');
      window.webContents.session.setPermissionCheckHandler((_webContents, permission) => permission === 'usb');
      window.webContents.on(
        'select-bluetooth-device',
        (
          event: BluetoothSelectionEvent,
          devices: BluetoothSelectionDevice[],
          callback: (deviceId: string) => void,
        ) => {
          event.preventDefault();
          if (devices.length === 0) {
            callback('');
            return;
          }
          void dialog.showMessageBox(window, {
            type: 'question',
            title: 'Select Bluetooth Printer',
            message: 'Choose a Bluetooth device for Joyce POS.',
            buttons: [...devices.map((device) => device.deviceName || device.deviceId), 'Cancel'],
            cancelId: devices.length,
          }).then((result) => {
            callback(devices[result.response]?.deviceId || '');
          });
        },
      );
      webContents.on(
        'select-usb-device',
        (
          event: UsbSelectionEvent,
          details: UsbSelectionDetails,
          callback: (deviceId: string) => void,
        ) => {
          event.preventDefault();
          if (details.deviceList.length === 0) {
            callback('');
            return;
          }
          void dialog.showMessageBox(window, {
            type: 'question',
            title: 'Select USB Printer',
            message: 'Choose a USB device for Joyce POS.',
            buttons: [...details.deviceList.map((device) => device.deviceName || `${device.vendorId || 0}:${device.productId || 0}`), 'Cancel'],
            cancelId: details.deviceList.length,
          }).then((result) => {
            callback(details.deviceList[result.response]?.deviceId || '');
          });
        },
      );
    },
  },
  // A splash screen is shown automatically while the app boots when a splash
  // file exists (`assets/splash.html` or `assets/splash.png`). Uncomment to
  // customize it:
  // splashScreen: {
  //   path: 'assets/splash.html',
  //   width: 400,
  //   height: 300,
  //   backgroundColor: '#ffffff',
  //   minimumDurationMs: 0,
  // },
  // Per-plugin config overrides. Merged over the `plugins` section of the
  // Capacitor config (this section wins per key) — the Electron equivalent of
  // Android string resources / iOS Info.plist plugin settings. Being
  // TypeScript, values can be computed, e.g. a live-update channel derived
  // from the app version (`import packageJson from './package.json'`):
  // plugins: {
  //   LiveUpdate: {
  //     defaultChannel: `production-${packageJson.version}`,
  //   },
  // },
});
