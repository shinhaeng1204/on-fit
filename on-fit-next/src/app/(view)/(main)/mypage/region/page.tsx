import { updateRegionFromMyPage } from '../actions';
import RegionSetupClient from './RegionSetupClient';

export default function RegionSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <RegionSetupClient saveRegion={updateRegionFromMyPage} />
    </div>
  );
}
