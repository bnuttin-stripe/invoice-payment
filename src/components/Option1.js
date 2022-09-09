import React, { useState } from 'react';
import Payments from './Payments';
import Items from './Items';
import Team from './Team';
import Products from './Products';

export default function Option1(props) {

    return (
        <>
            <div className="row m-4">
                <div className="col-4">
                    <h4 className="mb-4">Your Morningstar team</h4>
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
                        <Items token={props.token} />
                    </div>
                    <div className="row">
                        <Payments token={props.token} />
                    </div>
                </div>
            </div>
        </>
    );
}