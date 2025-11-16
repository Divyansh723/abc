# Day Selector Fix - Custom Frequency

## Issue
When creating a habit with "Custom" frequency, the day selector was not appearing.

## Root Cause
The HabitForm component was using `react-hook-form` but:
1. DaySelector component wasn't imported
2. customFrequency field wasn't in the form's defaultValues
3. customFrequency wasn't in the Habit type definition
4. customFrequency validation wasn't in the habitSchema

## Fix Applied

### 1. Updated HabitForm.tsx
- ✅ Imported DaySelector component
- ✅ Added customFrequency to defaultValues
- ✅ Added conditional rendering of DaySelector when frequency === 'custom'
- ✅ Wired up onChange handler to update form state

### 2. Updated validationUtils.ts
- ✅ Added customFrequency field to habitSchema
- ✅ Added validation rule: custom frequency must have at least one day selected
- ✅ Validation shows error message if no days selected

### 3. Updated habit.ts types
- ✅ Added customFrequency field to Habit interface
- ✅ Defined structure: { daysOfWeek: number[], timesPerWeek?: number }

## How It Works Now

1. **Select "Custom" frequency** in the habit creation form
2. **Day selector appears** below the frequency dropdown
3. **Click days** to select/deselect (Sun-Sat)
4. **Visual feedback** shows selected days
5. **Validation** prevents saving without at least one day selected
6. **Error message** appears if you try to save with no days

## Testing

### Test Steps:
1. Open habit creation form
2. Select "Custom" from Frequency dropdown
3. Verify day selector appears
4. Click on days to select them (e.g., Mon, Wed, Fri)
5. Verify selected days are highlighted
6. Try to save without selecting days (should show error)
7. Select at least one day and save (should work)

### Expected Behavior:
- ✅ Day selector visible when Custom is selected
- ✅ Days can be toggled on/off
- ✅ Visual feedback for selected days
- ✅ Selection summary shows count and day names
- ✅ Form validation prevents saving with no days
- ✅ Mobile responsive (grid layout on small screens)

## Files Modified

1. `src/components/habit/HabitForm.tsx`
   - Added DaySelector import
   - Added customFrequency to form state
   - Added conditional rendering

2. `src/utils/validationUtils.ts`
   - Added customFrequency to schema
   - Added validation rule

3. `src/types/habit.ts`
   - Added customFrequency to Habit interface

## Status
✅ **FIXED** - Day selector now appears and works correctly when Custom frequency is selected.
