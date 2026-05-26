export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div className="spinner" style={{ width: '56px', height: '56px', borderWidth: '5px', borderColor: 'rgba(251, 191, 36, 0.3)', borderTopColor: '#fbbf24', marginBottom: '24px' }}></div>
      <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '20px', letterSpacing: '4px', animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        LOADING...
      </div>
    </div>
  )
}
