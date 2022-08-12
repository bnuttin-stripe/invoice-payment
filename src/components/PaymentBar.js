import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import * as Utils from '../actions/utilities';

import TestCards from './TestCards';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from "@stripe/react-stripe-js";

import Modal from 'react-bootstrap/Modal';
import SetupWrapper from './SetupWrapper';

import Amex from '../img/pms/amex.png';
import Diners from '../img/pms/diners.png';
import Discover from '../img/pms/discover.png';
import JCB from '../img/pms/jcb.png';
import Mastercard from '../img/pms/mastercard.png';
import UnionPay from '../img/pms/unionpay.png';
import Visa from '../img/pms/visa.png';
import '../styles/pms.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes, faPlus, faCircleCheck, faDollarSign } from '@fortawesome/free-solid-svg-icons';

export default function PaymentBar(props) {
    // Data
    const [isLoaded, setIsLoaded] = useState(false);
    const [pms, setPms] = useState([{ id: 'new' }]);
    const [selectedPM, setSelectedPM] = useState();
    const [newlyCreatedPM, setNewlyCreatedPM] = useState();
    const [refresh, setRefresh] = useState();
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentIntent, setPaymentIntent] = useState({});

    // Modal
    const [show, setShow] = useState(false);
    const hideModal = () => {
        setShow(false);
    }
    const showModal = () => setShow(true);

    // Retrieve saved credit cards
    useEffect(() => {
        setPaymentIntent({});
        setIsLoaded(false);
        fetch('/payment-methods/' + props.customer + '/cards')
            .then(res => res.json())
            .then(data => {
                data.push({
                    id: 'new'
                })
                setPms(data);
                setIsLoaded(true);
            });
    }, [refresh]);

    // If a PM was just created, we select it by default
    useEffect(() => {
        setSelectedPM(pms.find(x => x.id === newlyCreatedPM));
    }, [pms, newlyCreatedPM]);

    // Action when customer has selected a card
    const handlePMChange = (e) => {
        if (e.id === 'new') {
            setSelectedPM(null);
            showModal()
        }
        else {
            setSelectedPM(e);
        }
    }

    // Stripe
    const [elementOptions, setElementsOptions] = useState({});
    const [stripePromise, setStripePromise] = useState(false);

    // Load Stripe on component load
    useEffect(() => {
        setStripePromise(
            loadStripe(process.env.REACT_APP_PK)
        );
    }, []);

    // Create setupIntent upon loading the modal
    useEffect(() => {
        if (show) {
            fetch('/setup-intents', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: props.customer
                })
            })
                .then(res => res.json())
                .then(data => {
                    setElementsOptions({ clientSecret: data.clientSecret });
                });
        }
    }, [show]);

    const sleeper = (ms) => {
        return function (x) {
            return new Promise(resolve => setTimeout(() => resolve(x), ms));
        };
    }


    const pay = () => {
        setPaymentProcessing(true);
        fetch('/payment-intents', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer: props.customer,
                pm: selectedPM.id,
                amount: props.total,
                metadata: { invoices: props.metadata.join(', ') }
            })
        })
            .then(res => res.json())
            .then(data => {
                setPaymentIntent(data);
                setPaymentProcessing(false);
            })
    }

    const resetAndRefresh = () => {
        setPaymentIntent({});
        props.setRefreshInvoices(Math.random())
    }

    return (
        <>
            <div className="row mb-3">
                <div className="col d-flex flex-row-reverse mr-5">
                    {paymentIntent?.status !== 'succeeded' && 
                    <button className="btn btn-primary" disabled={isLoaded && (props.total == 0 || selectedPM?.id === undefined || selectedPM?.id === 'new')} onClick={pay}>
                        {paymentProcessing && <FontAwesomeIcon icon={faSpinner} className="spinner"/>}
                        {!paymentProcessing && <FontAwesomeIcon icon={faDollarSign} />}
                        <span style={{paddingLeft:10}}>Pay {Utils.displayPrice(props.total, 'usd')}</span>
                    </button>}

                    {paymentIntent?.status === 'succeeded' &&
                        <>
                            <button className="btn btn-secondary" onClick={resetAndRefresh}>
                                <FontAwesomeIcon icon={faCircleCheck} />
                                <span style={{paddingLeft:10}}>Payment Successful</span>
                            </button>
                        </>
                    }

                    {paymentIntent?.status !== 'succeeded' && <Select
                        placeholder={!isLoaded ? "Retrieving saved cards..." : "Select card"}
                        isDisabled={!isLoaded}
                        className='pm-select'
                        value={selectedPM}
                        onChange={handlePMChange}
                        options={pms}
                        getOptionValue={pm => pm.id}
                        formatOptionLabel={pm => {
                            if (pm.id != 'new') {
                                return (
                                    <div >
                                        {pm.card.brand === 'amex' && <img src={Amex} alt="logo" />}
                                        {pm.card.brand === 'diners' && <img src={Diners} alt="logo" />}
                                        {pm.card.brand === 'discover' && <img src={Discover} alt="logo" />}
                                        {pm.card.brand === 'jcb' && <img src={JCB} alt="logo" />}
                                        {pm.card.brand === 'mastercard' && <img src={Mastercard} alt="logo" />}
                                        {pm.card.brand === 'unionpay' && <img src={UnionPay} alt="logo" />}
                                        {pm.card.brand === 'visa' && <img src={Visa} alt="logo" />}
                                        <span style={{ paddingLeft: 20 }}>Exp. {pm.card.exp_month}/{pm.card.exp_year} ending in {pm.card.last4}</span>
                                    </div>
                                )
                            }
                            if (pm.id == 'new') {
                                return (
                                    <div >
                                        <FontAwesomeIcon icon={faPlus} style={{ paddingLeft: 5, paddingRight: 5 }} />
                                        <span style={{ paddingLeft: 24 }}>Add a card</span>
                                    </div>
                                )
                            }

                        }}
                    />}



                    {!isLoaded && <FontAwesomeIcon icon={faSpinner} className="spinner" style={{ padding: 10 }} />}
                </div>
            </div>

            <Modal show={show} centered onHide={hideModal} >
                <Modal.Header  >
                    <h4>Add a payment method</h4>
                    <FontAwesomeIcon icon={faTimes} style={{ cursor: 'pointer' }} onClick={hideModal} />
                </Modal.Header>
                <Modal.Body>
                    {elementOptions.clientSecret &&
                        <Elements stripe={stripePromise} options={elementOptions} >
                            <SetupWrapper return_url={process.env.REACT_APP_BASE_URL} setNewlyCreatedPM={setNewlyCreatedPM} setRefresh={setRefresh} hideModal={hideModal} />
                        </Elements>
                    }
                    <TestCards />
                </Modal.Body>
            </Modal>
        </>
    );
}
