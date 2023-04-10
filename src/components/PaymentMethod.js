import React from 'react';

import Amex from '../img/pms/amex.png';
import Diners from '../img/pms/diners.png';
import Discover from '../img/pms/discover.png';
import JCB from '../img/pms/jcb.png';
import Mastercard from '../img/pms/mastercard.png';
import UnionPay from '../img/pms/unionpay.png';
import Visa from '../img/pms/visa.png';
import Bank from '../img/pms/bank.png';

export default function PaymentMethod(props) {
    const styles = {
        wrapper: {
            height: 22,
            minWidth: 240,
        },
        logo: {
            maxWidth: 28,
            maxHeight: 28
        }
    }

    return (
        <>
            {props.pm.type === 'card' && <div style={styles.wrapper}>
                <div style={{ float: 'left' }}>
                    {props.pm.card.brand === 'amex' && <img style={styles.logo} src={Amex} alt="logo" />}
                    {props.pm.card.brand === 'diners' && <img style={styles.logo} src={Diners} alt="logo" />}
                    {props.pm.card.brand === 'discover' && <img style={styles.logo} src={Discover} alt="logo" />}
                    {props.pm.card.brand === 'jcb' && <img style={styles.logo} src={JCB} alt="logo" />}
                    {props.pm.card.brand === 'mastercard' && <img style={styles.logo} src={Mastercard} alt="logo" />}
                    {props.pm.card.brand === 'unionpay' && <img style={styles.logo} src={UnionPay} alt="logo" />}
                    {props.pm.card.brand === 'visa' && <img style={styles.logo} src={Visa} alt="logo" />}
                </div>
                <div style={{ float: 'left', paddingLeft: 10 }}>**** {props.pm.card.last4}</div>
                <div style={{ float: 'left', paddingLeft: 10 }}>exp. {props.pm.card.exp_month.toString().padStart(2, '0')}/{props.pm.card.exp_year}</div>
            </div>}
            {props.pm.type === 'us_bank_account' && <div style={styles.wrapper}>
                <div style={{ float: 'left' }}>
                    <img style={styles.logo} src={Bank} alt="logo" />
                </div>
                <div style={{ float: 'left', paddingLeft: 10 }}>**** {props.pm.us_bank_account.last4}</div>
            </div>}
        </>
    )
}