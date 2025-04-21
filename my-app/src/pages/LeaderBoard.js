{/* Users by Event Count */}
<section>
<h3>📊 Users by Event Count</h3>
<button onClick={fetchUsersByEventCount}>View</button>
<ul>
  {Array.isArray(usersByCount) && usersByCount.map((u) => (
    <li key={u.user_id}>
      {u.username} — {u.event_count} events
    </li>
  ))}
</ul>
</section>