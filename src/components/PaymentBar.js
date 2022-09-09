import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import * as Utils from '../actions/utilities';

import Card from './Card';
import TestCards from './TestCards';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from "@stripe/react-stripe-js";

import Modal from 'react-bootstrap/Modal';
import SetupWrapper from './SetupWrapper';

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
                        <button className="btn btn-primary" style={{marginLeft:30}} disabled={isLoaded && (props.total == 0 || selectedPM?.id === undefined || selectedPM?.id === 'new')} onClick={pay}>
                            {paymentProcessing && <FontAwesomeIcon icon={faSpinner} className="spinner" />}
                            {!paymentProcessing && <FontAwesomeIcon icon={faDollarSign} />}
                            <span style={{ paddingLeft: 10 }}>Pay {Utils.displayPrice(props.total, 'usd')}</span>
                        </button>}

                    {paymentIntent?.status === 'succeeded' &&
                        <>
                            <button className="btn btn-secondary" onClick={resetAndRefresh}>
                                <FontAwesomeIcon icon={faCircleCheck} />
                                <span style={{ paddingLeft: 10 }}>Payment Successful</span>
                            </button>
                        </>
                    }

                    {paymentIntent?.status !== 'succeeded' && <Select
                        placeholder={!isLoaded ? "Retrieving saved cards..." : <div style={{width:220}}>Select card</div>}
                        isDisabled={!isLoaded}
                        value={selectedPM}
                        onChange={handlePMChange}
                        options={pms}
                        getOptionValue={pm => pm.id}
                        formatOptionLabel={pm => {
                            if (pm.id != 'new') {
                                return (
                                    <Card card={pm.card} />
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
