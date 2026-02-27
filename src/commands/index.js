import * as setup from './setup.js';
import * as register from './register.js';
import * as unregister from './unregister.js';
import * as setReminderDays from './setReminderDays.js';
import * as setReminderChannel from './setReminderChannel.js';
import * as setReportChannel from './setReportChannel.js';
import * as setReminderTime from './setReminderTime.js';
import * as setMemberReminder from './setMemberReminder.js';
import * as setPracticeRole from './setPracticeRole.js';
import * as checkInactive from './checkInactive.js';
import * as stats from './stats.js';

export const commands = [
  setup,
  register,
  unregister,
  setReminderDays,
  setReminderChannel,
  setReportChannel,
  setReminderTime,
  setMemberReminder,
  setPracticeRole,
  checkInactive,
  stats,
];
