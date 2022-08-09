import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';
import Logo from '../img/Logo.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faShoppingCart, faSpinner, faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function Header(props) {
    const logout = () => {
        props.setToken('');
        props.resetCart();
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
                    <Link className="profile" to='/checkout'>
                        <FontAwesomeIcon icon={faShoppingCart} className="faIcon" />
                    </Link>
                    <span style={{ marginLeft: 10 }}>{props.cart.length}</span>
                    <Link className="profile noStyle" to='/profile'>
                        <FontAwesomeIcon icon={faUserCircle} className="faIcon" />
                        <span style={{ marginLeft: 10 }}>{props.token.email}</span>
                    </Link>
                    <FontAwesomeIcon icon={faSignOutAlt} onClick={logout} className="faIcon" />
                </div>}
            </div>
        </>
    )
}


