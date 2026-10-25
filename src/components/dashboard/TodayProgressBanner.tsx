export default function TodayProgressBanner({ done, total, next }: { done: number; total: number; next: string }) {
  return (
    <div className="card progress">
      <b>Today's Progress</b>
      <p>{done}/{total} completed</p>
      <div className="bar"><i style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
      <p className="status" style={{ color: '#fff' }}>{done >= total ? 'All habits done, lovely.' : `Next: ${next}`}</p>
    </div>
  );
}
