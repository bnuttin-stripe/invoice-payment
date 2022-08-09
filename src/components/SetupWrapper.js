
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function SetupWrapper(props) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async () => {
        setProcessing(true);
        const { setupIntent, error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: props.return_url
            },
            redirect: 'if_required'
        });
        
        if (error) {
            console.log(error);
        } else {
            setProcessing(false);
            props.hideModal();
            props.setRefresh(Math.random());
        }
    }

    return (
        <div>
            <PaymentElement />
            <button className="btn btn-primary" disabled={processing} style={{marginTop: 20}} onClick={handleSubmit}>
                {processing ? "Adding Payment Method..." : "Add Payment Method"}
            </button>
        </div>
    );
}

