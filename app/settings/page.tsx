import { getUserProfile } from '@/lib/db';
import { SettingsClient } from '@/components/SettingsClient';

export default function SettingsPage() {
  const userProfile = getUserProfile();

  return <SettingsClient initialProfile={userProfile} />;
}
