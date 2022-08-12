import React from 'react';

export default function Products(props) {
    return (
        <>
            <div className='col shadowTable p-4'>
                <div className="row">
                    <h5>Data Feeds</h5>
                    <hr />
                    <ul>
                        <li>NYSE Integrated Feed</li>
                        <li>Nasdaq Data Link</li>
                        <li>LSE Market Data</li>
                    </ul>
                </div>
                <div className="row mt-4">
                    <h5>Financial Intelligence</h5>
                    <hr />
                    <ul>
                        <li>World Economy Newsletter</li>
                        <li>Federal Reserve Newsletter</li>
                    </ul>
                </div>
            </div>

        </>
    )
}