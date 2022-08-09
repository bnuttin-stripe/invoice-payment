import React from 'react';
import Amex from '../img/pms/amex.png';
import Diners from '../img/pms/diners.png';
import Discover from '../img/pms/discover.png';
import JCB from '../img/pms/jcb.png';
import Mastercard from '../img/pms/mastercard.png';
import UnionPay from '../img/pms/unionpay.png';
import Visa from '../img/pms/visa.png';
import Bank from '../img/pms/bank.png';
import '../styles/pms.css';

export default function PM(props) {
    const toggleCard = (e) => {
        if (props.selectable === true)
            props.setSelectedPM(props.selectedPM === e.currentTarget.id ? '' : e.currentTarget.id);
    }

    return (
        <>

            <div className={props.mode === 'mini' ? 'pmmini align-items-center' : 'pm align-items-center'}>
                {props.selectable &&
                    <div><input type='radio' checked={props.selectedPM === props.pm.id} disabled={props.readOnly} onChange={toggleCard} id={props.pm.id} /></div>
                }
                {props.pm.type === 'card' &&
                    <>
                        <div className="icon">
                            {props.pm.card.brand === 'amex' && <img src={Amex} alt="logo" />}
                            {props.pm.card.brand === 'diners' && <img src={Diners} alt="logo" />}
                            {props.pm.card.brand === 'discover' && <img src={Discover} alt="logo" />}
                            {props.pm.card.brand === 'jcb' && <img src={JCB} alt="logo" />}
                            {props.pm.card.brand === 'mastercard' && <img src={Mastercard} alt="logo" />}
                            {props.pm.card.brand === 'unionpay' && <img src={UnionPay} alt="logo" />}
                            {props.pm.card.brand === 'visa' && <img src={Visa} alt="logo" />}
                        </div>
                        {props.mode === 'mini' && <div><code>{props.pm.card.exp_month}/{props.pm.card.exp_year} - {props.pm.card.last4}</code></div>}
                        {props.mode !== 'mini' && <>
                            <div>
                                Expiration: <code>{props.pm.card.exp_month}/{props.pm.card.exp_year}</code>
                            </div>
                            <div>
                                Last 4: <code>{props.pm.card.last4}</code>
                            </div>
                        </>}
                    </>
                }
                {props.pm.type === 'us_bank_account' &&
                    <>
                        <div className="icon">
                            <img src={Bank} alt="logo" />
                        </div>
                        {props.mode === 'mini' && <div>Acct <code>{props.pm.us_bank_account.last4}</code></div>}
                        {props.mode !== 'mini' && <>
                        <div>
                            {props.pm.us_bank_account.bank_name}
                        </div>
                        <div>
                            ending with: <code>{props.pm.us_bank_account.last4}</code>
                        </div>
                        </>}
                    </>
                }

            </div>
        </>

    )

}