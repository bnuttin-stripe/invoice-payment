import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import * as Utils from '../actions/utilities';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import PaymentBar from './PaymentBar';

export default function Items(props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Load one-time items
  useEffect(() => {
    setIsLoaded(false);
    fetch('/invoices-imported')
      .then(res => res.json())
      .then(data => {
        data.map(item => {
          item.selected = false;
        })
        setItems(data);
        setIsLoaded(true);
      });
  }, []);

  // Calculate total amount due based on selected items
  useEffect(() => {
    var total = 0;
    items.map(item => {
      if (item.selected) total += item.total;
    })
    setTotal(total);
  }, [items]);

  const handleItemChange = (e) => {
    const index = items.findIndex(x => x.number === e.target.id);
    const item = items[index];
    item.selected = e.target.checked;
    setItems(prevState => {
      return [
        ...prevState.slice(0, index),
        item,
        ...prevState.slice(index + 1, items.length)
      ]
    })
  }

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
                <th style={{ textAlign: 'center' }}>Select</th>
                <th>Number</th>
                <th>Status</th>
                <th>Description</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!isLoaded && <tr><td>
                <FontAwesomeIcon icon={faSpinner} className='spinner' />&nbsp;
                Loading
              </td></tr>}
              {isLoaded && items.length === 0 && <tr><td>
                No data
              </td></tr>}
              {isLoaded && items.map((item, key) => (
                <tr key={key}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      id={item.number}
                      value={false}
                      onChange={handleItemChange}
                    />
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><a href={item.url} target='_blank' rel="noreferrer">{item.number}</a></td>
                  <td>
                    {item.status === 'draft' && <span className="badge badge-silver">Draft</span>}
                    {item.status === 'open' && <span className="badge badge-blue">Open</span>}
                    {item.status === 'paid' && <span className="badge badge-green">Paid</span>}
                    {item.status === 'uncollectible' && <span className="badge badge-red">Uncollectible</span>}
                    {item.status === 'void' && <span className="badge badge-silver">Void</span>}
                  </td>
                  <td>{item.description}</td>
                  <td>{Utils.displayDate(item.created)}</td>
                  <td style={{ textAlign: 'right' }}>{Utils.displayPrice(item.total, 'usd')}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <PaymentBar
            customer={props.token.id}
            total={total}
          />

        </div>
      </div>
    </>
  );
}



