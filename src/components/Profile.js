import React, { useState } from 'react';
import Wallet from './Wallet';
//import Payments from './Payments';
import Items from './Items';
//import Subscriptions from './Subscriptions';

export default function Profile(props) {
    const [selectedPM, setSelectedPM] = useState('');

    return (
        <>
            <div className="row m-4">
                <div className="col-4">
                    <h4 className="mb-4">Your wallet</h4>
                    <div className="wallet row">
                        <Wallet
                            token={props.token}
                            canAdd={true}
                            selectable={false}
                            selectedPM={selectedPM}
                            setSelectedPM={setSelectedPM}
                        />
                    </div>
                </div>
                <div className="col-8" style={{ paddingLeft: 50 }}>
                    <div className="row">
                        <Items token={props.token} />
                    </div>
                    <div className="row" style={{ marginTop: 20 }}>
                        
                    </div>
                    <div className="row" style={{ marginTop: 20 }}>
                        
                    </div>
                    
                </div>
            </div>
        </>
    );
}