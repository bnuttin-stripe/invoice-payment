import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [loginValid, setLoginValid] = useState(true);
    const [processing, setProcessing] = useState(false);

    const styles = {
        loginError: {
            color: 'tomato',
            display: 'block',
            padding: '5px 10px'
        },
        topPadding: {
            paddingTop: 100
        }
    }

    const login = async e => {
        setProcessing(true);
        e.preventDefault();
        fetch('/customers/' + email)
            .then(res => res.json())
            .then(data => {
                if (data.id !== "") {
                    props.setToken({
                        id: data.id,
                        email: email
                    });
                }
                setLoginValid(data.id !== "");
                setProcessing(false);
            })
    }

    useEffect(() => {
        setFormValid(email !== '')
    }, [email]);

    return (
        <div className="row justify-content-center align-items-center" style={styles.topPadding}>
            <form className="col-4" onSubmit={login}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="text" required className="form-control" id="email" onChange={e => setEmail(e.target.value)} />
                    {!loginValid && <small className="form-text" style={styles.loginError}>Email not found; please click the Register button to register a new account.</small>}
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" id="password" disabled className="form-control" placeholder="Not functional in demo app" />
                </div>
                <div className="mb-3">
                    <br />
                    <button disabled={!formValid || processing} className="form-control btn btn-primary" type="submit">Login</button>
                </div>
                <div className="mb-3">
                    <Link to={'/register/' + email}><button className="form-control btn btn-secondary" >Register</button></Link>
                </div>
            </form>
        </div>
    )
}
