# How to Add Events to the Events Tab

## Quick Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run the Events Setup (if not done already)**
   - If you haven't set up the events table yet, run `SUPABASE_EVENTS_SETUP.sql` first
   - If you have the old schema, run `SUPABASE_EVENTS_MIGRATION.sql` first

3. **Insert the Events**
   - Copy the entire contents of `INSERT_FBLA_EVENTS.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Events Were Added**
   - The script includes a verification query at the end
   - You should see all 10 events listed

## Event Categories Used

- **adviser_webinar**: "Power Up Your Teaching with Design Thinking" (for teachers/advisers)
- **celebration**: "National Career & Technical Education Month", "FBLA Week"
- **conferences**: "Collegiate Officer Leadership Summit"
- **member_webinar**: All Industry Connect webinars, Career Lab, Accounting webinars, Career Readiness

## Event Divisions Used

- **collegiate**: "Collegiate Officer Leadership Summit"
- **high_school**: Most webinars and events (default for high school members)
- **NULL**: Events open to all divisions (celebrations, adviser webinars)

## Adding More Events Later

To add more events, use this template:

```sql
INSERT INTO fbla_events (
  name,
  event_category,
  event_division,
  description,
  start_date,
  end_date,
  location,
  location_type,
  status
) VALUES (
  'Event Name Here',
  'member_webinar',  -- or 'adviser_webinar', 'celebration', 'conferences'
  'high_school',     -- or 'collegiate', 'middle_school', or NULL for all
  'Event description here...',
  '2026-01-01 18:00:00-05:00',  -- Start date/time (use your timezone)
  '2026-01-01 19:00:00-05:00',  -- End date/time
  'Virtual',                    -- or physical location
  'virtual',                    -- or 'physical', 'hybrid'
  'upcoming'                    -- or 'ongoing', 'completed', 'cancelled'
);
```

## Date Format

- Use format: `'YYYY-MM-DD HH:MM:SS-TZ'`
- Example: `'2026-01-21 18:00:00-05:00'` (January 21, 2026 at 6:00 PM EST)
- For all-day events, use: `'2026-02-01 00:00:00-05:00'` to `'2026-02-28 23:59:59-05:00'`

## Timezone Notes

- All times in the SQL file use `-05:00` (Eastern Time)
- Adjust the timezone offset based on your location:
  - EST: `-05:00`
  - EDT: `-04:00`
  - PST: `-08:00`
  - etc.

## Troubleshooting

### "Column does not exist" error
- Make sure you've run `SUPABASE_EVENTS_SETUP.sql` or `SUPABASE_EVENTS_MIGRATION.sql` first
- The table needs `event_category` and `event_division` columns

### "Invalid input syntax" error
- Check that dates are in the correct format
- Make sure event_category values match: 'adviser_webinar', 'celebration', 'conferences', 'member_webinar'
- Make sure event_division values match: 'collegiate', 'high_school', 'middle_school', or NULL

### Events not showing in app
- Check that events have `status = 'upcoming'`
- Verify dates are in the future
- Make sure you're authenticated in the app
- Try pull-to-refresh in the Events tab
