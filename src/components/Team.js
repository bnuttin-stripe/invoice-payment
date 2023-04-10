import React from 'react';
import Image from 'react-bootstrap/Image';
import StephaniePike from '../img/StephaniePike.png';
import JohnSmith from '../img/JohnSmith.png';

export default function Items(props) {
    return (
        <>
            <div className='col shadowTable p-4'>
                <div className="row">
                    <div className="col-3">
                        <Image src={StephaniePike} style={{border: '2px solid silver'}} roundedCircle fluid />
                    </div>
                    <div className="col-9">
                        <h5>Stephanie Pike</h5>
                        <h6>Account Executive</h6>
                        <div>stephanie.pike@example.com</div>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col-3">
                        <Image src={JohnSmith} style={{border: '2px solid silver'}} roundedCircle fluid />
                    </div>
                    <div className="col-9">
                        <h5>John Smith</h5>
                        <h6>Technical Account Manager</h6>
                        <div>john.smith@example.com</div>
                    </div>
                </div>
            </div>

        </>
    )
}