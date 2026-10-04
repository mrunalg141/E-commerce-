import { Link } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '../hooks/useAuth'

export default function Account() {
	const { user, isLoading, authNotice, setAuthNotice, createAccount, login, logout } = useAuth()
	const [mode, setMode] = useState('signin')
	const [notice, setNotice] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const isRegistering = mode === 'register'

	const changeMode = (nextMode) => {
		setMode(nextMode)
		setNotice('')
		setAuthNotice('')
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setNotice('')
		setAuthNotice('')
		setIsSubmitting(true)
		const formValues = new FormData(event.currentTarget)
		const credentials = {
			email,
			password,
		}

		try {
			if (isRegistering) {
				await createAccount({ ...credentials, name: formValues.get('name') })
				setMode('signin')
				setPassword('')
				setNotice('Account created successfully. Please sign in.')
			} else {
				await login(credentials)
			}
		} catch (error) {
			setNotice(error.response?.data?.message || 'Could not connect to the account service. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) return <div className="page account-page"><p className="account-loading" role="status">Checking your account...</p></div>

	if (user) return <div className="page account-page">
		<section className="account-layout" aria-labelledby="account-heading">
			<div className="account-main">
				<p className="eyebrow">Your Atelier account</p>
				<h1 id="account-heading">Welcome,<br /><em>{user.name || 'back'}.</em></h1>
				<p className="account-intro">You are signed in to your Atelier account.</p>
				<h2 className="account-profile-title">Account details</h2>
				<dl className="account-profile">
					<div className="account-profile-row"><dt>Name</dt><dd>{user.name || '—'}</dd></div>
					<div className="account-profile-row"><dt>Email</dt><dd>{user.email}</dd></div>
					<div className="account-profile-row"><dt>Account type</dt><dd className="account-role">{user.role}</dd></div>
				</dl>
				<div className="account-session-actions">
					<button type="button" className="button button-dark" onClick={logout}>Sign out</button>
					<Link to="/shop" className="account-back-link account-shopping-link">Continue shopping <span aria-hidden="true">↗</span></Link>
				</div>
			</div>
			<aside className="account-aside" aria-label="Atelier Commerce">
				<span className="account-aside-index">A / 01</span>
				<div className="account-aside-mark">A</div>
				<p className="account-aside-quote">Good things<br />take their time.</p>
				<span className="account-aside-caption">ATELIER COMMERCE / EVERYDAY, CONSIDERED</span>
			</aside>
		</section>
	</div>

	return <div className="page account-page">
		<section className="account-layout" aria-labelledby="account-heading">
			<div className="account-main">
				<p className="eyebrow">Your Atelier account</p>
				<h1 id="account-heading">A little space<br />for <em>you.</em></h1>
				<p className="account-intro">Sign in or create an account to keep your details together.</p>

				<div className="account-tabs" role="group" aria-label="Account access">
					<button type="button" aria-pressed={!isRegistering} className={!isRegistering ? 'active' : ''} onClick={() => changeMode('signin')}>Sign in</button>
					<button type="button" aria-pressed={isRegistering} className={isRegistering ? 'active' : ''} onClick={() => changeMode('register')}>Create account</button>
				</div>

				<form className="account-form" onSubmit={handleSubmit}>
					{isRegistering && <label className="account-field">Full name<input type="text" name="name" autoComplete="name" placeholder="Your name" required /></label>}
					<label className="account-field">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
					<label className="account-field">Password<input type="password" name="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isRegistering ? 8 : undefined} required /></label>
					<button type="submit" className="button button-dark account-submit" disabled={isSubmitting}>{isSubmitting ? 'Connecting...' : isRegistering ? 'Create account' : 'Sign in'} <span aria-hidden="true">↗</span></button>
					<p className="account-note" aria-live="polite">{notice || authNotice || 'Your account is protected with a secure sign-in session.'}</p>
				</form>
				<Link to="/shop" className="account-back-link">Continue browsing <span aria-hidden="true">↗</span></Link>
			</div>

			<aside className="account-aside" aria-label="Atelier Commerce">
				<span className="account-aside-index">A / 01</span>
				<div className="account-aside-mark">A</div>
				<p className="account-aside-quote">Good things<br />take their time.</p>
				<span className="account-aside-caption">ATELIER COMMERCE / EVERYDAY, CONSIDERED</span>
			</aside>
		</section>
	</div>
}
