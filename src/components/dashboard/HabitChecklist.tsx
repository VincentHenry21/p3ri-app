export const HABITS = ['Drink water', 'Gentle stretch / workout', 'Take iron / magnesium', 'Write cycle journal', 'Sleep 8 hours'];

export default function HabitChecklist({ completed, onToggle }: { completed: string[]; onToggle: (habit: string, done: boolean) => void }) {
  return (
    <div className="card">
      <b>Today's Habits</b>
      {HABITS.map((h) => (
        <label key={h} className="habit">
          <input type="checkbox" style={{ width: 'auto' }} checked={completed.includes(h)} onChange={(e) => onToggle(h, e.target.checked)} />
          <span>{h}</span>
        </label>
      ))}
    </div>
  );
}
