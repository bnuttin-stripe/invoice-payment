import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';
import Logo from '../img/Logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

export default function Header(props) {
    const logout = () => {
        props.setToken('');
    }

    const refreshTestData = (e) => {
        if (window.confirm("Refresh all test data?")) {
            fetch('/test/refresh', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(obj => {
                    props.setRefresh(Math.random);
                });
        }

    }

    return (
        <>
            <div className='row align-items-end header m-4'>
                <div className="col-6">
                    <Link to='/'>
                        <img src={Logo} className="logo" alt="icon" />
                    </Link>
                </div>

                {typeof props.setToken === 'function' && <div className="col-6" style={{ textAlign: 'right' }}>
                    <FontAwesomeIcon icon={faArrowsRotate} onClick={refreshTestData} className="faIcon" />
                    <FontAwesomeIcon icon={faSignOutAlt} onClick={logout} className="faIcon" />
                </div>}
            </div>
        </>
    )
}


