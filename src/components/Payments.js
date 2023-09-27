import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import PMSimple from './PaymentMethod';
import * as Utils from '../actions/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faReceipt } from '@fortawesome/free-solid-svg-icons';

export default function Payments(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setIsLoaded(false);
    fetch('/payments/' + props.token.id)
      .then(res => res.json())
      .then(obj => {
        console.log(obj)
        setPayments(obj);
        setIsLoaded(true);
      });
  }, [props.refresh]);

  return (
    <>
      <div className="row">
        <h4 className="mb-4">Your payments</h4>
      </div>
      <div className="row">
        <div className="shadowTable">
          <Table borderless >
            <thead >
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Total</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td>
                <FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;
                Loading
              </td></tr>}
              {isLoaded && payments.length === 0 && <tr><td>
                No data
              </td></tr>}
              {isLoaded && payments.map((payment, key) => (
                <tr key={key}>
                  <td>{Utils.displayDate(payment.created)}</td>
                  <td>For invoices {payment.metadata?.invoices}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {
                    payment.latest_charge.payment_method_details && <PMSimple pm={payment.latest_charge.payment_method_details} />
              }
                  </td>
                  <td>
                    {payment.status === 'canceled' && <span className="badge badge-silver">Canceled</span>}
                    {payment.status === 'processing' && <span className="badge badge-blue">Processing</span>}
                    {payment.status === 'succeeded' && <span className="badge badge-green">Succeeded</span>}
                    {payment.status === 'requires_payment_method' && <span className="badge badge-red">Requires Payment Method</span>}
                    {payment.status === 'requires_confirmation' && <span className="badge badge-red">Requires Confirmation</span>}
                    {payment.status === 'requires_action' && <span className="badge badge-red">Requires Action</span>}
                  </td>
                  <td >{Utils.displayPrice(payment.amount / 100, 'usd')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <a href={payment.latest_charge?.receipt_url} target='_blank' rel="noreferrer">
                      <FontAwesomeIcon icon={faReceipt} />
                    </a>
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );

}



