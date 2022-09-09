import React from 'react';

import Amex from '../img/pms/amex.png';
import Diners from '../img/pms/diners.png';
import Discover from '../img/pms/discover.png';
import JCB from '../img/pms/jcb.png';
import Mastercard from '../img/pms/mastercard.png';
import UnionPay from '../img/pms/unionpay.png';
import Visa from '../img/pms/visa.png';

export default function Card(props) {
    const styles = {
        wrapper: {
            height: 22,
            minWidth: 200,
        },
        logo: {
            maxWidth: 28,
            maxHeight: 28
        }
    }

    return (
        <div style={styles.wrapper}>
            <div style={{ float: 'left' }}>
                {props.card.brand === 'amex' && <img style={styles.logo} src={Amex} alt="logo" />}
                {props.card.brand === 'diners' && <img style={styles.logo} src={Diners} alt="logo" />}
                {props.card.brand === 'discover' && <img style={styles.logo} src={Discover} alt="logo" />}
                {props.card.brand === 'jcb' && <img style={styles.logo} src={JCB} alt="logo" />}
                {props.card.brand === 'mastercard' && <img style={styles.logo} src={Mastercard} alt="logo" />}
                {props.card.brand === 'unionpay' && <img style={styles.logo} src={UnionPay} alt="logo" />}
                {props.card.brand === 'visa' && <img style={styles.logo} src={Visa} alt="logo" />}
            </div>
            <div style={{ float: 'left', paddingLeft: 10 }}>**** {props.card.last4}</div>
            <div style={{ float: 'left', paddingLeft: 10 }}>exp. {props.card.exp_month.toString().padStart(2, '0')}/{props.card.exp_year}</div>
        </div>
    )
}