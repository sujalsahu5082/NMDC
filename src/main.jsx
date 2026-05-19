import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './NMDC_Dashboard.jsx'
import Login from './Login'

function Root() {
	const [loggedIn, setLoggedIn] = useState(false);
	if (!loggedIn) return <Login onSuccess={() => setLoggedIn(true)} />;
	return <App />;
}

const root = createRoot(document.getElementById('root'))
root.render(<Root />)
