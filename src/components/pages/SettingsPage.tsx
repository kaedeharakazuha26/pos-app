import type { AppData } from "../../types";
type Props = {
  appData: AppData;
  setAppData: (value: AppData) => void;
  onExport: () => void;
  onImport: (file: File) => void;
};
export function SettingsPage({
  appData,
  setAppData,
  onExport,
  onImport,
}: Props) {
  const update = (field: keyof AppData["settings"], value: string) =>
    setAppData({
      ...appData,
      settings: { ...appData.settings, [field]: value },
    });
  return (
    <div className="settings-grid">
      <div className="panel">
        <div className="panel-header">
          <h3>Business Settings</h3>
        </div>
        <div className="form-grid">
          <div className="field-group">
            <label>Business Name</label>
            <input
              value={appData.settings.businessName}
              onChange={(event) => update("businessName", event.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Phone</label>
            <input
              value={appData.settings.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </div>
          <div className="field-group span-2">
            <label>Address</label>
            <input
              value={appData.settings.address}
              onChange={(event) => update("address", event.target.value)}
            />
          </div>
          <div className="field-group span-2">
            <label>Receipt Footer</label>
            <input
              value={appData.settings.receiptFooter}
              onChange={(event) => update("receiptFooter", event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Backup & Restore</h3>
        </div>
        <div className="toggle-stack">
          <button type="button" className="primary-button" onClick={onExport}>
            Export JSON Backup
          </button>
          <label className="secondary-button">
            Restore JSON Backup
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImport(file);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
