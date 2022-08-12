import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import PM from './PM';
import * as Utils from '../actions/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function Invoices(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    setIsLoaded(false);
    fetch('/invoices/' + props.token.id)
      .then(res => res.json())
      .then(obj => {
        setInvoices(obj);
        setIsLoaded(true);
      });
  }, []);

  return (
    <>
      <div className="row">
        <h4 className="mb-4">Your invoices</h4>
      </div>
      <div className="row">
        <div className="shadowTable">
          <Table borderless >
            <thead >
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Description</th>
                <th>Total</th>
                <th>Date</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td>
                <FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;
                Loading
              </td></tr>}
              {isLoaded && invoices.length === 0 && <tr><td>
                No data
              </td></tr>}
              {isLoaded && invoices.map((invoice, key) => (
                <tr key={key}>
                  <td style={{ whiteSpace: 'nowrap' }}>{invoice.number}</td>
                  <td>
                    {invoice.status === 'draft' && <span className="badge badge-silver">Draft</span>}
                    {invoice.status === 'open' && <span className="badge badge-blue">Open</span>}
                    {invoice.status === 'paid' && <span className="badge badge-green">Paid</span>}
                    {invoice.status === 'uncollectible' && <span className="badge badge-red">Uncollectible</span>}
                    {invoice.status === 'void' && <span className="badge badge-silver">Void</span>}
                  </td>
                  <td><ul>{invoice.lines.data.map((line, key) => (
                    <li key={key}>{line.description}</li>
                  ))}</ul>
                  </td>
                  <td>{Utils.displayPrice(invoice.total, 'usd')}</td>
                  <td>{Utils.displayDate(invoice.created)}</td>
                  <td>
                    {invoice.collection_method === 'charge_automatically' && invoice.payment_intent && invoice.payment_intent.payment_method &&
                      <PM pm={invoice.payment_intent.payment_method} mode='mini' />}
                    {invoice.collection_method === 'charge_automatically' && (invoice.payment_intent?.status === 'requires_action' || invoice.payment_intent?.status === 'requires_payment_method') &&
                      <span style={{ backgroundColor: 'orange' }} className="badge">Requires Action</span>
                    }
                    {invoice.collection_method === 'send_invoice' && invoice.status === 'open' && 
                      <a href={invoice.hosted_invoice_url} target='_blank' rel="noreferrer">
                        <span className="badge badge-blue">Pay Now</span>
                      </a>
                    }
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



