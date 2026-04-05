import { getDatabase } from '../lib/db';

/**
 * Migration: Add enabled_sources column to user_profile table
 */
function addEnabledSourcesColumn() {
  const db = getDatabase();

  try {
    // Check if column already exists
    const tableInfo = db.prepare('PRAGMA table_info(user_profile)').all() as any[];
    const hasColumn = tableInfo.some((col: any) => col.name === 'enabled_sources');

    if (!hasColumn) {
      console.log('Adding enabled_sources column to user_profile table...');

      // Add the column with a default value (all sources enabled)
      db.exec(`
        ALTER TABLE user_profile
        ADD COLUMN enabled_sources TEXT DEFAULT '["linkedin","indeed","remoteok","hackernews"]'
      `);

      console.log('✅ Migration complete!');
    } else {
      console.log('Column enabled_sources already exists');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

addEnabledSourcesColumn();
