// Prayer times for Oslo, as published by Rabita.
//
// Source: the table on rabita.no/bonnetider, captured 2026-08-21. These are
// Rabita's OWN published times, not a calculation — the mosque's convention
// governs (at Oslo's latitude fajr and isha depend heavily on which
// high-latitude rule is applied, which is why fajr sits flat through the
// summer). Do not regenerate these astronomically; they would disagree with
// the board inside the building.
//
// Covers 2026-08-01 to 2026-12-31 (153 days). OUTSIDE THAT RANGE
// there is no data and the UI must say so rather than guess.
//
// TODO(rabita): replace with the sync from the prayer screen in the mosque
// (agreed in the strategy meeting). That feed is also the only place
// jama'ah times can come from — they are not published anywhere today,
// including on the current live site.

export type PrayerDay = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export const PRAYER_DAYS: readonly PrayerDay[] = [
  { date: '2026-08-01', fajr: '03:17', sunrise: '04:58', dhuhr: '13:33', asr: '17:44', maghrib: '21:53', isha: '22:45' },
  { date: '2026-08-02', fajr: '03:17', sunrise: '05:00', dhuhr: '13:33', asr: '17:43', maghrib: '21:50', isha: '22:44' },
  { date: '2026-08-03', fajr: '03:17', sunrise: '05:03', dhuhr: '13:33', asr: '17:42', maghrib: '21:48', isha: '22:43' },
  { date: '2026-08-04', fajr: '03:17', sunrise: '05:05', dhuhr: '13:33', asr: '17:41', maghrib: '21:45', isha: '22:42' },
  { date: '2026-08-05', fajr: '03:17', sunrise: '05:07', dhuhr: '13:32', asr: '17:40', maghrib: '21:43', isha: '22:41' },
  { date: '2026-08-06', fajr: '03:17', sunrise: '05:10', dhuhr: '13:32', asr: '17:39', maghrib: '21:40', isha: '22:39' },
  { date: '2026-08-07', fajr: '03:17', sunrise: '05:12', dhuhr: '13:32', asr: '17:37', maghrib: '21:37', isha: '22:38' },
  { date: '2026-08-08', fajr: '03:17', sunrise: '05:14', dhuhr: '13:32', asr: '17:36', maghrib: '21:35', isha: '22:37' },
  { date: '2026-08-09', fajr: '03:17', sunrise: '05:17', dhuhr: '13:32', asr: '17:35', maghrib: '21:32', isha: '22:36' },
  { date: '2026-08-10', fajr: '03:17', sunrise: '05:19', dhuhr: '13:32', asr: '17:34', maghrib: '21:29', isha: '22:35' },
  { date: '2026-08-11', fajr: '03:17', sunrise: '05:22', dhuhr: '13:32', asr: '17:32', maghrib: '21:27', isha: '22:34' },
  { date: '2026-08-12', fajr: '03:17', sunrise: '05:24', dhuhr: '13:31', asr: '17:31', maghrib: '21:24', isha: '22:33' },
  { date: '2026-08-13', fajr: '03:17', sunrise: '05:26', dhuhr: '13:31', asr: '17:30', maghrib: '21:21', isha: '22:32' },
  { date: '2026-08-14', fajr: '03:17', sunrise: '05:29', dhuhr: '13:31', asr: '17:28', maghrib: '21:18', isha: '22:31' },
  { date: '2026-08-15', fajr: '03:17', sunrise: '05:31', dhuhr: '13:31', asr: '17:27', maghrib: '21:16', isha: '22:30' },
  { date: '2026-08-16', fajr: '03:17', sunrise: '05:34', dhuhr: '13:31', asr: '17:25', maghrib: '21:13', isha: '22:29' },
  { date: '2026-08-17', fajr: '03:17', sunrise: '05:36', dhuhr: '13:31', asr: '17:24', maghrib: '21:10', isha: '22:28' },
  { date: '2026-08-18', fajr: '03:17', sunrise: '05:38', dhuhr: '13:30', asr: '17:22', maghrib: '21:07', isha: '22:27' },
  { date: '2026-08-19', fajr: '03:17', sunrise: '05:41', dhuhr: '13:30', asr: '17:21', maghrib: '21:04', isha: '22:25' },
  { date: '2026-08-20', fajr: '03:17', sunrise: '05:43', dhuhr: '13:30', asr: '17:19', maghrib: '21:01', isha: '22:24' },
  { date: '2026-08-21', fajr: '03:17', sunrise: '05:46', dhuhr: '13:30', asr: '17:18', maghrib: '20:59', isha: '22:23' },
  { date: '2026-08-22', fajr: '03:17', sunrise: '05:48', dhuhr: '13:29', asr: '17:16', maghrib: '20:56', isha: '22:22' },
  { date: '2026-08-23', fajr: '03:17', sunrise: '05:50', dhuhr: '13:29', asr: '17:15', maghrib: '20:53', isha: '22:21' },
  { date: '2026-08-24', fajr: '03:17', sunrise: '05:53', dhuhr: '13:29', asr: '17:13', maghrib: '20:50', isha: '22:20' },
  { date: '2026-08-25', fajr: '03:17', sunrise: '05:55', dhuhr: '13:29', asr: '17:11', maghrib: '20:47', isha: '22:19' },
  { date: '2026-08-26', fajr: '03:17', sunrise: '05:58', dhuhr: '13:28', asr: '17:10', maghrib: '20:44', isha: '22:18' },
  { date: '2026-08-27', fajr: '03:17', sunrise: '06:00', dhuhr: '13:28', asr: '17:08', maghrib: '20:41', isha: '22:17' },
  { date: '2026-08-28', fajr: '03:22', sunrise: '06:02', dhuhr: '13:28', asr: '17:06', maghrib: '20:38', isha: '22:16' },
  { date: '2026-08-29', fajr: '03:27', sunrise: '06:05', dhuhr: '13:27', asr: '17:04', maghrib: '20:35', isha: '22:15' },
  { date: '2026-08-30', fajr: '03:31', sunrise: '06:07', dhuhr: '13:27', asr: '17:03', maghrib: '20:32', isha: '22:14' },
  { date: '2026-08-31', fajr: '03:36', sunrise: '06:09', dhuhr: '13:27', asr: '17:01', maghrib: '20:29', isha: '22:13' },
  { date: '2026-09-01', fajr: '03:40', sunrise: '06:12', dhuhr: '13:26', asr: '16:59', maghrib: '20:26', isha: '22:11' },
  { date: '2026-09-02', fajr: '03:44', sunrise: '06:14', dhuhr: '13:26', asr: '16:57', maghrib: '20:23', isha: '22:10' },
  { date: '2026-09-03', fajr: '03:48', sunrise: '06:16', dhuhr: '13:26', asr: '16:55', maghrib: '20:20', isha: '22:09' },
  { date: '2026-09-04', fajr: '03:52', sunrise: '06:19', dhuhr: '13:25', asr: '16:53', maghrib: '20:17', isha: '22:08' },
  { date: '2026-09-05', fajr: '03:56', sunrise: '06:21', dhuhr: '13:25', asr: '16:51', maghrib: '20:14', isha: '22:07' },
  { date: '2026-09-06', fajr: '04:00', sunrise: '06:24', dhuhr: '13:25', asr: '16:49', maghrib: '20:11', isha: '22:06' },
  { date: '2026-09-07', fajr: '04:04', sunrise: '06:26', dhuhr: '13:24', asr: '16:48', maghrib: '20:08', isha: '22:05' },
  { date: '2026-09-08', fajr: '04:08', sunrise: '06:28', dhuhr: '13:24', asr: '16:46', maghrib: '20:05', isha: '22:04' },
  { date: '2026-09-09', fajr: '04:11', sunrise: '06:31', dhuhr: '13:24', asr: '16:44', maghrib: '20:02', isha: '22:03' },
  { date: '2026-09-10', fajr: '04:15', sunrise: '06:33', dhuhr: '13:23', asr: '16:42', maghrib: '19:59', isha: '21:59' },
  { date: '2026-09-11', fajr: '04:18', sunrise: '06:35', dhuhr: '13:23', asr: '16:40', maghrib: '19:56', isha: '21:55' },
  { date: '2026-09-12', fajr: '04:21', sunrise: '06:38', dhuhr: '13:23', asr: '16:38', maghrib: '19:53', isha: '21:51' },
  { date: '2026-09-13', fajr: '04:25', sunrise: '06:40', dhuhr: '13:22', asr: '16:36', maghrib: '19:50', isha: '21:47' },
  { date: '2026-09-14', fajr: '04:28', sunrise: '06:42', dhuhr: '13:22', asr: '16:33', maghrib: '19:47', isha: '21:43' },
  { date: '2026-09-15', fajr: '04:31', sunrise: '06:45', dhuhr: '13:22', asr: '16:31', maghrib: '19:44', isha: '21:40' },
  { date: '2026-09-16', fajr: '04:34', sunrise: '06:47', dhuhr: '13:21', asr: '16:29', maghrib: '19:41', isha: '21:36' },
  { date: '2026-09-17', fajr: '04:38', sunrise: '06:49', dhuhr: '13:21', asr: '16:27', maghrib: '19:38', isha: '21:32' },
  { date: '2026-09-18', fajr: '04:41', sunrise: '06:52', dhuhr: '13:21', asr: '16:25', maghrib: '19:35', isha: '21:29' },
  { date: '2026-09-19', fajr: '04:44', sunrise: '06:54', dhuhr: '13:20', asr: '16:23', maghrib: '19:32', isha: '21:25' },
  { date: '2026-09-20', fajr: '04:47', sunrise: '06:56', dhuhr: '13:20', asr: '16:21', maghrib: '19:29', isha: '21:21' },
  { date: '2026-09-21', fajr: '04:50', sunrise: '06:59', dhuhr: '13:15', asr: '16:19', maghrib: '19:25', isha: '21:18' },
  { date: '2026-09-22', fajr: '04:53', sunrise: '07:01', dhuhr: '13:14', asr: '16:17', maghrib: '19:22', isha: '21:14' },
  { date: '2026-09-23', fajr: '04:56', sunrise: '07:03', dhuhr: '13:14', asr: '16:14', maghrib: '19:19', isha: '21:11' },
  { date: '2026-09-24', fajr: '04:58', sunrise: '07:06', dhuhr: '13:13', asr: '16:12', maghrib: '19:16', isha: '21:07' },
  { date: '2026-09-25', fajr: '05:01', sunrise: '07:08', dhuhr: '13:13', asr: '16:10', maghrib: '19:13', isha: '21:04' },
  { date: '2026-09-26', fajr: '05:04', sunrise: '07:10', dhuhr: '13:13', asr: '16:08', maghrib: '19:10', isha: '21:01' },
  { date: '2026-09-27', fajr: '05:07', sunrise: '07:13', dhuhr: '13:12', asr: '16:06', maghrib: '19:07', isha: '20:57' },
  { date: '2026-09-28', fajr: '05:10', sunrise: '07:15', dhuhr: '13:12', asr: '16:03', maghrib: '19:04', isha: '20:54' },
  { date: '2026-09-29', fajr: '05:12', sunrise: '07:17', dhuhr: '13:12', asr: '16:01', maghrib: '19:01', isha: '20:51' },
  { date: '2026-09-30', fajr: '05:15', sunrise: '07:20', dhuhr: '13:11', asr: '15:59', maghrib: '18:58', isha: '20:47' },
  { date: '2026-10-01', fajr: '05:18', sunrise: '07:22', dhuhr: '13:11', asr: '15:57', maghrib: '18:55', isha: '20:44' },
  { date: '2026-10-02', fajr: '05:20', sunrise: '07:24', dhuhr: '13:11', asr: '15:55', maghrib: '18:52', isha: '20:41' },
  { date: '2026-10-03', fajr: '05:23', sunrise: '07:27', dhuhr: '13:10', asr: '15:52', maghrib: '18:49', isha: '20:38' },
  { date: '2026-10-04', fajr: '05:25', sunrise: '07:29', dhuhr: '13:10', asr: '15:50', maghrib: '18:46', isha: '20:35' },
  { date: '2026-10-05', fajr: '05:28', sunrise: '07:32', dhuhr: '13:10', asr: '15:48', maghrib: '18:43', isha: '20:32' },
  { date: '2026-10-06', fajr: '05:31', sunrise: '07:34', dhuhr: '13:10', asr: '15:46', maghrib: '18:40', isha: '20:28' },
  { date: '2026-10-07', fajr: '05:33', sunrise: '07:36', dhuhr: '13:09', asr: '15:44', maghrib: '18:37', isha: '20:25' },
  { date: '2026-10-08', fajr: '05:36', sunrise: '07:39', dhuhr: '13:09', asr: '15:41', maghrib: '18:34', isha: '20:22' },
  { date: '2026-10-09', fajr: '05:38', sunrise: '07:41', dhuhr: '13:09', asr: '15:39', maghrib: '18:31', isha: '20:19' },
  { date: '2026-10-10', fajr: '05:41', sunrise: '07:44', dhuhr: '13:08', asr: '15:37', maghrib: '18:28', isha: '20:16' },
  { date: '2026-10-11', fajr: '05:43', sunrise: '07:46', dhuhr: '13:08', asr: '15:35', maghrib: '18:25', isha: '20:13' },
  { date: '2026-10-12', fajr: '05:45', sunrise: '07:49', dhuhr: '13:08', asr: '15:32', maghrib: '18:22', isha: '20:11' },
  { date: '2026-10-13', fajr: '05:48', sunrise: '07:51', dhuhr: '13:08', asr: '15:30', maghrib: '18:19', isha: '20:08' },
  { date: '2026-10-14', fajr: '05:50', sunrise: '07:53', dhuhr: '13:07', asr: '15:28', maghrib: '18:16', isha: '20:05' },
  { date: '2026-10-15', fajr: '05:53', sunrise: '07:56', dhuhr: '13:07', asr: '15:26', maghrib: '18:13', isha: '20:02' },
  { date: '2026-10-16', fajr: '05:55', sunrise: '07:58', dhuhr: '13:07', asr: '15:24', maghrib: '18:11', isha: '19:59' },
  { date: '2026-10-17', fajr: '05:57', sunrise: '08:01', dhuhr: '13:07', asr: '15:21', maghrib: '18:08', isha: '19:56' },
  { date: '2026-10-18', fajr: '06:00', sunrise: '08:03', dhuhr: '13:07', asr: '15:19', maghrib: '18:05', isha: '19:54' },
  { date: '2026-10-19', fajr: '06:02', sunrise: '08:06', dhuhr: '13:06', asr: '15:17', maghrib: '18:02', isha: '19:51' },
  { date: '2026-10-20', fajr: '06:05', sunrise: '08:08', dhuhr: '13:06', asr: '15:15', maghrib: '17:59', isha: '19:48' },
  { date: '2026-10-21', fajr: '06:07', sunrise: '08:11', dhuhr: '13:06', asr: '15:13', maghrib: '17:56', isha: '19:46' },
  { date: '2026-10-22', fajr: '06:09', sunrise: '08:13', dhuhr: '13:06', asr: '15:11', maghrib: '17:53', isha: '19:43' },
  { date: '2026-10-23', fajr: '06:11', sunrise: '08:16', dhuhr: '13:06', asr: '15:09', maghrib: '17:51', isha: '19:41' },
  { date: '2026-10-24', fajr: '06:14', sunrise: '08:18', dhuhr: '13:06', asr: '15:07', maghrib: '17:48', isha: '19:38' },
  { date: '2026-10-25', fajr: '05:16', sunrise: '07:21', dhuhr: '12:05', asr: '14:40', maghrib: '16:45', isha: '18:36' },
  { date: '2026-10-26', fajr: '05:18', sunrise: '07:23', dhuhr: '12:05', asr: '14:38', maghrib: '16:42', isha: '18:33' },
  { date: '2026-10-27', fajr: '05:20', sunrise: '07:26', dhuhr: '12:05', asr: '14:35', maghrib: '16:40', isha: '18:31' },
  { date: '2026-10-28', fajr: '05:23', sunrise: '07:28', dhuhr: '12:05', asr: '14:33', maghrib: '16:37', isha: '18:28' },
  { date: '2026-10-29', fajr: '05:25', sunrise: '07:31', dhuhr: '12:05', asr: '14:30', maghrib: '16:34', isha: '18:26' },
  { date: '2026-10-30', fajr: '05:27', sunrise: '07:34', dhuhr: '12:05', asr: '14:28', maghrib: '16:31', isha: '18:24' },
  { date: '2026-10-31', fajr: '05:29', sunrise: '07:36', dhuhr: '12:05', asr: '14:26', maghrib: '16:29', isha: '18:21' },
  { date: '2026-11-01', fajr: '05:31', sunrise: '07:39', dhuhr: '12:05', asr: '14:23', maghrib: '16:26', isha: '18:19' },
  { date: '2026-11-02', fajr: '05:34', sunrise: '07:41', dhuhr: '12:05', asr: '14:21', maghrib: '16:24', isha: '18:17' },
  { date: '2026-11-03', fajr: '05:36', sunrise: '07:44', dhuhr: '12:05', asr: '14:19', maghrib: '16:21', isha: '18:15' },
  { date: '2026-11-04', fajr: '05:38', sunrise: '07:46', dhuhr: '12:05', asr: '14:16', maghrib: '16:18', isha: '18:13' },
  { date: '2026-11-05', fajr: '05:40', sunrise: '07:49', dhuhr: '12:05', asr: '14:14', maghrib: '16:16', isha: '18:11' },
  { date: '2026-11-06', fajr: '05:42', sunrise: '07:51', dhuhr: '12:05', asr: '14:12', maghrib: '16:13', isha: '18:09' },
  { date: '2026-11-07', fajr: '05:44', sunrise: '07:54', dhuhr: '12:05', asr: '14:10', maghrib: '16:11', isha: '18:07' },
  { date: '2026-11-08', fajr: '05:46', sunrise: '07:57', dhuhr: '12:05', asr: '14:08', maghrib: '16:09', isha: '18:05' },
  { date: '2026-11-09', fajr: '05:48', sunrise: '07:59', dhuhr: '12:05', asr: '14:06', maghrib: '16:06', isha: '18:03' },
  { date: '2026-11-10', fajr: '05:50', sunrise: '08:02', dhuhr: '12:05', asr: '14:03', maghrib: '16:04', isha: '18:01' },
  { date: '2026-11-11', fajr: '05:52', sunrise: '08:04', dhuhr: '12:05', asr: '14:01', maghrib: '16:01', isha: '17:59' },
  { date: '2026-11-12', fajr: '05:54', sunrise: '08:07', dhuhr: '12:05', asr: '13:59', maghrib: '15:59', isha: '17:58' },
  { date: '2026-11-13', fajr: '05:56', sunrise: '08:09', dhuhr: '12:06', asr: '13:57', maghrib: '15:57', isha: '17:56' },
  { date: '2026-11-14', fajr: '05:58', sunrise: '08:12', dhuhr: '12:06', asr: '13:55', maghrib: '15:55', isha: '17:54' },
  { date: '2026-11-15', fajr: '06:00', sunrise: '08:14', dhuhr: '12:06', asr: '13:54', maghrib: '15:53', isha: '17:53' },
  { date: '2026-11-16', fajr: '06:02', sunrise: '08:17', dhuhr: '12:06', asr: '13:52', maghrib: '15:50', isha: '17:51' },
  { date: '2026-11-17', fajr: '06:04', sunrise: '08:19', dhuhr: '12:06', asr: '13:50', maghrib: '15:48', isha: '17:49' },
  { date: '2026-11-18', fajr: '06:06', sunrise: '08:22', dhuhr: '12:07', asr: '13:48', maghrib: '15:46', isha: '17:48' },
  { date: '2026-11-19', fajr: '06:08', sunrise: '08:24', dhuhr: '12:07', asr: '13:46', maghrib: '15:44', isha: '17:47' },
  { date: '2026-11-20', fajr: '06:10', sunrise: '08:27', dhuhr: '12:07', asr: '13:45', maghrib: '15:42', isha: '17:45' },
  { date: '2026-11-21', fajr: '06:12', sunrise: '08:29', dhuhr: '12:07', asr: '13:43', maghrib: '15:40', isha: '17:44' },
  { date: '2026-11-22', fajr: '06:13', sunrise: '08:31', dhuhr: '12:07', asr: '13:42', maghrib: '15:39', isha: '17:43' },
  { date: '2026-11-23', fajr: '06:15', sunrise: '08:34', dhuhr: '12:08', asr: '13:40', maghrib: '15:37', isha: '17:41' },
  { date: '2026-11-24', fajr: '06:17', sunrise: '08:36', dhuhr: '12:08', asr: '13:39', maghrib: '15:35', isha: '17:40' },
  { date: '2026-11-25', fajr: '06:19', sunrise: '08:38', dhuhr: '12:08', asr: '13:37', maghrib: '15:33', isha: '17:39' },
  { date: '2026-11-26', fajr: '06:20', sunrise: '08:41', dhuhr: '12:09', asr: '13:36', maghrib: '15:32', isha: '17:38' },
  { date: '2026-11-27', fajr: '06:22', sunrise: '08:43', dhuhr: '12:09', asr: '13:35', maghrib: '15:30', isha: '17:37' },
  { date: '2026-11-28', fajr: '06:23', sunrise: '08:45', dhuhr: '12:09', asr: '13:33', maghrib: '15:29', isha: '17:36' },
  { date: '2026-11-29', fajr: '06:25', sunrise: '08:47', dhuhr: '12:10', asr: '13:32', maghrib: '15:27', isha: '17:35' },
  { date: '2026-11-30', fajr: '06:27', sunrise: '08:49', dhuhr: '12:10', asr: '13:31', maghrib: '15:26', isha: '17:35' },
  { date: '2026-12-01', fajr: '06:28', sunrise: '08:51', dhuhr: '12:10', asr: '13:30', maghrib: '15:25', isha: '17:34' },
  { date: '2026-12-02', fajr: '06:30', sunrise: '08:53', dhuhr: '12:11', asr: '13:29', maghrib: '15:23', isha: '17:33' },
  { date: '2026-12-03', fajr: '06:31', sunrise: '08:55', dhuhr: '12:11', asr: '13:28', maghrib: '15:22', isha: '17:33' },
  { date: '2026-12-04', fajr: '06:32', sunrise: '08:57', dhuhr: '12:12', asr: '13:27', maghrib: '15:21', isha: '17:32' },
  { date: '2026-12-05', fajr: '06:34', sunrise: '08:59', dhuhr: '12:12', asr: '13:27', maghrib: '15:20', isha: '17:31' },
  { date: '2026-12-06', fajr: '06:35', sunrise: '09:01', dhuhr: '12:12', asr: '13:26', maghrib: '15:19', isha: '17:31' },
  { date: '2026-12-07', fajr: '06:36', sunrise: '09:02', dhuhr: '12:13', asr: '13:25', maghrib: '15:18', isha: '17:31' },
  { date: '2026-12-08', fajr: '06:38', sunrise: '09:04', dhuhr: '12:13', asr: '13:25', maghrib: '15:18', isha: '17:30' },
  { date: '2026-12-09', fajr: '06:39', sunrise: '09:06', dhuhr: '12:14', asr: '13:24', maghrib: '15:17', isha: '17:30' },
  { date: '2026-12-10', fajr: '06:40', sunrise: '09:07', dhuhr: '12:14', asr: '13:24', maghrib: '15:16', isha: '17:30' },
  { date: '2026-12-11', fajr: '06:41', sunrise: '09:08', dhuhr: '12:15', asr: '13:24', maghrib: '15:16', isha: '17:30' },
  { date: '2026-12-12', fajr: '06:42', sunrise: '09:10', dhuhr: '12:15', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-13', fajr: '06:43', sunrise: '09:11', dhuhr: '12:16', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-14', fajr: '06:44', sunrise: '09:12', dhuhr: '12:16', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-15', fajr: '06:45', sunrise: '09:13', dhuhr: '12:17', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-16', fajr: '06:46', sunrise: '09:14', dhuhr: '12:17', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-17', fajr: '06:46', sunrise: '09:15', dhuhr: '12:17', asr: '13:23', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-18', fajr: '06:47', sunrise: '09:16', dhuhr: '12:18', asr: '13:24', maghrib: '15:15', isha: '17:30' },
  { date: '2026-12-19', fajr: '06:48', sunrise: '09:17', dhuhr: '12:18', asr: '13:24', maghrib: '15:15', isha: '17:31' },
  { date: '2026-12-20', fajr: '06:48', sunrise: '09:18', dhuhr: '12:19', asr: '13:24', maghrib: '15:15', isha: '17:31' },
  { date: '2026-12-21', fajr: '06:49', sunrise: '09:18', dhuhr: '12:19', asr: '13:25', maghrib: '15:16', isha: '17:32' },
  { date: '2026-12-22', fajr: '06:49', sunrise: '09:19', dhuhr: '12:20', asr: '13:25', maghrib: '15:16', isha: '17:32' },
  { date: '2026-12-23', fajr: '06:50', sunrise: '09:19', dhuhr: '12:20', asr: '13:26', maghrib: '15:17', isha: '17:33' },
  { date: '2026-12-24', fajr: '06:50', sunrise: '09:19', dhuhr: '12:21', asr: '13:26', maghrib: '15:18', isha: '17:33' },
  { date: '2026-12-25', fajr: '06:51', sunrise: '09:20', dhuhr: '12:21', asr: '13:27', maghrib: '15:18', isha: '17:34' },
  { date: '2026-12-26', fajr: '06:51', sunrise: '09:20', dhuhr: '12:22', asr: '13:28', maghrib: '15:19', isha: '17:35' },
  { date: '2026-12-27', fajr: '06:51', sunrise: '09:20', dhuhr: '12:22', asr: '13:29', maghrib: '15:20', isha: '17:35' },
  { date: '2026-12-28', fajr: '06:51', sunrise: '09:20', dhuhr: '12:23', asr: '13:30', maghrib: '15:21', isha: '17:36' },
  { date: '2026-12-29', fajr: '06:51', sunrise: '09:19', dhuhr: '12:23', asr: '13:31', maghrib: '15:22', isha: '17:37' },
  { date: '2026-12-30', fajr: '06:51', sunrise: '09:19', dhuhr: '12:24', asr: '13:32', maghrib: '15:24', isha: '17:38' },
  { date: '2026-12-31', fajr: '06:51', sunrise: '09:19', dhuhr: '12:24', asr: '13:33', maghrib: '15:25', isha: '17:39' },
];

const BY_DATE = new Map(PRAYER_DAYS.map((d) => [d.date, d]));

/** Local-time ISO date. Never use toISOString() — that shifts to UTC and
  * hands back yesterday for anyone in Oslo before 01:00/02:00. */
export function isoDate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** That day's times, or null when the date falls outside the published range. */
export function prayerTimesFor(d: Date): PrayerDay | null {
  return BY_DATE.get(isoDate(d)) ?? null;
}

/** `count` days starting at `start`, stopping early at the end of the data. */
export function prayerDaysFrom(start: Date, count: number): PrayerDay[] {
  const out: PrayerDay[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const row = BY_DATE.get(isoDate(d));
    if (row) out.push(row);
  }
  return out;
}

/** Every published day in the same calendar month as `d`. */
export function prayerDaysInMonth(d: Date): PrayerDay[] {
  const prefix = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`;
  return PRAYER_DAYS.filter((row) => row.date.startsWith(prefix));
}
