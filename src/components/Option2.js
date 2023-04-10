import React, { useState } from 'react';
import Payments from './Payments';
import Items from './Items';
import Team from './Team';
import Products from './Products';

export default function Option1(props) {
    const [refresh, setRefresh] = useState();

    return (
        <>
            <div className="row m-4">
                <div className="col-4">
                    <h4 className="mb-4">Your Client team</h4>
                    <div className="row">
                        <Team />
                    </div>
                    <h4 className="mb-4" style={{ marginTop: 20 }}>Your Products</h4>
                    <div className="row">
                        <Products />
                    </div>
                </div>
                <div className="col-8" style={{ paddingLeft: 50 }}>
                    <div className="row">
                        <Items token={props.token} refresh={refresh} setRefresh={setRefresh} />
                    </div>
                    <div className="row">
                        <Payments token={props.token} refresh={refresh} setRefresh={setRefresh} />
                    </div>
                </div>
            </div>
        </>
    );
}