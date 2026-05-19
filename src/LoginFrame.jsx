import React, { useEffect, useState, useRef } from 'react';

export default function LoginFrame({ onSuccess }) {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function onMessage(e) {
      if (!e?.data) return;
      if (e.data.type === 'NMDC_LOGIN_SUCCESS') {
        onSuccess?.();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onSuccess]);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <iframe
        ref={iframeRef}
        title="NMDC Login"
        src="/nmdc_login.html"
        style={{ border: 0, width: '100%', height: '100%' }}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div style={{position:'absolute',left:0,top:0,right:0,bottom:0,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading…</div>
      )}
    </div>
  );
}
