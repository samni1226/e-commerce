export default function Loader({ label = 'Loading catalog…' }: { label?: string }) {
  return (
    <div style={{ padding: '80px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-soft)' }}>
      {label}
    </div>
  );
}
