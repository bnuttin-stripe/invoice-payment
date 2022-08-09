import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as Utils from '../actions/utilities';

export default function Register(props) {
    const { attemptedEmail } = useParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState(attemptedEmail);
    const [stateProv, setStateProv] = useState('IL');
    const [postalCode, setPostalCode] = useState('60605');

    const [custId, setCustId] = useState('');
    const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [processing, setProcessing] = useState(false);

    const styles = {
        emailError: {
            color: 'red'
        },
        topPadding: {
            paddingTop: 100
        }
    }

    const validEmail = (email) => {
        if (email === undefined) return false;
        return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    }

    // Check if email is already registered to another user
    useEffect(() => {
        if (email === undefined || !validEmail(email)) return;
        setEmailAlreadyRegistered(false);
        fetch('/customers/' + email)
            .then(res => res.json())
            .then(obj => {
                if (obj.id !== '') setEmailAlreadyRegistered(true);
            });
    }, [email]);

    // Create the customer and then set our login token and customer atom
    const createCustomer = (e) => {
        e.preventDefault();
        setProcessing(true);
        fetch("/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                state: stateProv,
                postal_code: postalCode
            })
        })
            .then(res => res.json())
            .then(data => {
                setProcessing(false);
                setCustId(data.id);
                props.setToken({
                    id: data.id,
                    email: email,
                    test_clock: data.test_clock
                });
                window.history.pushState('', '', '/');
            });
    }

    useEffect(() => {
        setFormValid(name !== '' && email !== '' && validEmail(email) && !emailAlreadyRegistered)
    }, [name, email, emailAlreadyRegistered]);

    return (
        <div className="row justify-content-center align-items-center" style={styles.topPadding}>
            <form className="col-6" onSubmit={createCustomer}>
                <div className="row mb-3">
                    <div className="col-6">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-control" onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-6">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" defaultValue={attemptedEmail} onChange={e => setEmail(e.target.value)} />
                        {emailAlreadyRegistered && <small className="form-text" style={styles.emailError}>This email is already registered</small>}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label className="form-label">State/Province</label>
                        <input type="text" className="form-control" onChange={e => setStateProv(e.target.value)} defaultValue='IL' />
                    </div>
                    <div className="col-6">
                        <label className="form-label">Postal Code</label>
                        <input type="text" className="form-control" onChange={e => setPostalCode(e.target.value)} defaultValue='60605' />
                    </div>
                </div>

                <div className="mb-3">
                    <br />
                    <button className="form-control btn btn-primary" disabled={!formValid || custId !== '' || processing} type="submit">
                        <span id="button-text">
                            {processing ? "Registering..." : "Register"}
                        </span>
                    </button>
                </div>

            </form>
        </div>

    )
}
