import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from "@stripe/react-stripe-js";
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import SetupWrapper from './SetupWrapper';
import PM from './PM';
import TestCards from './TestCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTimes, faTrash, faUniversity } from '@fortawesome/free-solid-svg-icons';

export default function Wallet(props) {
    // Data
    const [isLoaded, setIsLoaded] = useState(false);
    const [pms, setPMs] = useState([]);
    const [pmCards, setPMCards] = useState([]);
    const [pmAccounts, setPMAccounts] = useState([]);
    const [refresh, setRefresh] = useState();

    // Modal
    const [show, setShow] = useState(false);
    const hideModal = () => {
        setShow(false);
        setRefresh(Math.random());
    }
    const showModal = () => setShow(true);

    // Stripe
    const [elementOptions, setElementsOptions] = useState({});
    const [stripePromise, setStripePromise] = useState(false);

    // Load PMs at first page load
    useEffect(() => {
        setIsLoaded(false);
        const urls = ['/payment-methods/' + props.token.id + '/cards', '/payment-methods/' + props.token.id + '/bankaccounts'];
        const requests = urls.map(url => fetch(url));
        Promise.all(requests)
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(responses => {
                setPMs([].concat(responses[0], responses[1]));
                setPMCards(responses[0]);
                setPMAccounts(responses[1]);
                setIsLoaded(true);
            });
    }, [refresh]);

    // Load Stripe on component load
    useEffect(() => {
        setStripePromise(
            //loadStripe(process.env.REACT_APP_PK, { apiVersion: '2020-08-27;us_bank_account_beta=v2' })
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
                    customer: props.token.id
                })
            })
                .then(res => res.json())
                .then(data => {
                    setElementsOptions({ clientSecret: data.clientSecret });
                });
        }
    }, [show]);

    return (
        <>
            <div>
                {(!isLoaded || pms === undefined) && <>
                    <FontAwesomeIcon icon={faSpinner} className='spinner' style={{ marginRight: 10 }} />&nbsp;
                    Loading
                </>}
                {isLoaded && pms !== undefined && pms.length === 0 && <div>No saved payment methods</div>}
                {isLoaded && pmCards !== undefined && <>
                    <Table borderless>
                        <thead><tr><th>Cards</th></tr></thead>
                        <tbody>
                            {pmCards.length === 0 && <tr><td>No data</td></tr>}
                            {pmCards.map((pm, key) => (
                                <tr key={key}><td><PM
                                    pm={pm}
                                    selectable={props.selectable}
                                    setSelectedPM={props.setSelectedPM}
                                    selectedPM={props.selectedPM}
                                    readOnly={pm.id === props.cantSelect}
                                /></td></tr>))}
                        </tbody>
                    </Table>
                </>}
                {isLoaded && pmAccounts !== undefined && <>
                    <Table borderless>
                        <thead><tr><th>Bank Accounts</th></tr></thead>
                        <tbody>
                            {pmAccounts.length === 0 && <tr><td>No data</td></tr>}
                            {pmAccounts.map((pm, key) => (
                                <tr key={key}><td><PM
                                    pm={pm}
                                    selectable={props.selectable}
                                    setSelectedPM={props.setSelectedPM}
                                    selectedPM={props.selectedPM}
                                    readOnly={pm.id === props.cantSelect}
                                /></td></tr>))}
                        </tbody>
                    </Table>
                </>}
            </div>
            {props.canAdd && <button className="btn btn-primary mt-4" onClick={showModal}>Add a payment method</button>}

            <Modal show={show} centered onHide={hideModal} >
                <Modal.Header  >
                    <h4>Add a payment method</h4>
                    <FontAwesomeIcon icon={faTimes} style={{ cursor: 'pointer' }} onClick={hideModal} />
                </Modal.Header>
                <Modal.Body>
                    {elementOptions.clientSecret &&
                        <Elements stripe={stripePromise} options={elementOptions} >
                            <SetupWrapper return_url={process.env.REACT_APP_BASE_URL + '/profile'} hideModal={hideModal} />
                        </Elements>
                    }
                    <TestCards />
                </Modal.Body>
            </Modal>
        </>
    );
}