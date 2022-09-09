const express = require('express');
const app = express();
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

const cors = require('cors');
app.use(cors());
require('dotenv').config();

const STRIPE_KEY = process.env.REACT_APP_SK;
const PORT = process.env.REACT_APP_PORT;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const stripe = require('stripe')(STRIPE_KEY);

const data = require('./src/data/data.js');

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

/* ------ USER DATA ------ */
// Get customer data
app.get('/customers/:email', async (req, res) => {
    var output = {
        id: ''
    };
    const email = req.params.email;
    const customer = await stripe.customers.list({
        email: email
    });
    if (customer.data.length > 0) {
        output = {
            id: customer.data[0].id,
            name: customer.data[0].name,
            email: customer.data[0].email,
        };
    }
    res.send(output);
});


// Create customer
const createCustomer = async (email, name, state, postal_code) => {
    const existingCustomer = await stripe.customers.list({
        email: email
    });

    if (existingCustomer.data.length > 0) return false;

    const newCustomer = await stripe.customers.create({
        name: name,
        email: email,
        address: {
            line1: '515 N. State Street',
            city: 'Chicago',
            state: 'IL',
            country: 'US',
            postal_code: '60654'
        }
    });

    return ({
        alreadyRegistered: false,
        id: newCustomer.id,
        name: name,
        email: email,
        postal_code: postal_code,
        state: state
    });
}

// Create customer
app.post("/customers", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    const state = req.body.state;
    const postal_code = req.body.postal_code;

    const customer = await createCustomer(email, name, state, postal_code);
    res.send(customer);
});

/* ------ PRODUCT DATA ------ */
// Get all invoices for the customer
app.get('/invoices-imported', async (req, res) => {
    const db = await open({
        filename: 'invoices.db',
        driver: sqlite3.Database
    })
    const sql = `select * from invoices`;
    const invoices = await db.all(sql);
    res.send(invoices);
});



/* ------ PAYMENT METHODS ------ */
// Get saved cards for a given customer
app.get('/payment-methods/:customer/cards', async (req, res) => {
    //await sleep(1000);
    const customer = req.params.customer;
    const pms = await stripe.paymentMethods.list({
        customer: customer,
        type: 'card'
    });
    res.send(pms.data);
});

// Get saved bank accounts for a given customer
app.get('/payment-methods/:customer/bankaccounts', async (req, res) => {
    const customer = req.params.customer;
    const pms = await stripe.paymentMethods.list({
        customer: customer,
        type: 'us_bank_account'
    });
    res.send(pms.data);
});

// Create a setup intent and return its secret
app.post('/setup-intents', async (req, res) => {
    const customer = req.body.customer;
    const intent = await stripe.setupIntents.create({
        customer: customer,
        payment_method_types: ['card', 'us_bank_account']
    });
    res.send({
        clientSecret: intent.client_secret
    });
})

/* ------ PAYMENTS ------ */
// Create payment intent for specific amount
app.post('/payment-intents', async (req, res) => {
    const customer = req.body.customer;
    const amount = req.body.amount;
    const pm = req.body.pm;
    const metadata = req.body.metadata;
    const intent = await stripe.paymentIntents.create({
        customer: customer,
        amount: amount * 100,
        payment_method: pm,
        confirm: true,
        metadata: metadata,
        currency: 'usd'
    })
    res.send(intent);
});

/* ------ REPORTING ------ */
// Get all payments for the customer
app.get('/payments/:customer', async (req, res) => {
    const customer = req.params.customer;
    const payments = await stripe.paymentIntents.list({
        customer: customer,
        expand: ['data.payment_method', 'data.invoice']
    });
    res.send(payments.data);
});

// Get all invoices for the customer
app.get('/invoices-imported', async (req, res) => {
    const db = await open({
        filename: 'invoices.db',
        driver: sqlite3.Database
    })
    const sql = `select * from invoices`;
    const invoices = await db.all(sql);
    await db.close();
    res.send(invoices);
});

// Get all invoices for the customer
app.get('/invoices/:customer', async (req, res) => {
    const customer = req.params.customer;
    const invoices = await stripe.invoices.list({
        customer: customer,
        expand: ['data.charge', 'data.payment_intent', 'data.payment_intent.payment_method']
    });
    res.send(invoices.data);
});

// Get past payments for the customer
app.get('/payments/:customer', async (req, res) => {
    const customer = req.params.customer;
    const paymentIntents = await stripe.paymentIntents.list({
        customer: customer,
        //expand: ['data.charge', 'data.payment_intent', 'data.payment_intent.payment_method']
    });
    res.send(paymentIntents.data);
});

/* ------ STRIPE-HOSTED PAGES ------ */
// Retrieving a session or a PI to display details on redirect from hosted checkout or from UPE
app.get('/session/:id', async (req, res) => {
    const id = req.params.id;
    let pi;
    if (id.indexOf('cs_') > -1) {
        const session = await stripe.checkout.sessions.retrieve(id);
        pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    }
    else {
        pi = await stripe.paymentIntents.retrieve(id);
    }

    res.send({
        pi: pi
    });
});

// Hosted customer portal
app.post('/portal', async (req, res) => {
    const customer = req.body.customer;

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer,
        return_url: BASE_URL,
    });
    console.log(portalSession);
    res.send({
        url: portalSession.url,
    });
})

// Webhook
app.post('/webhooks', async (req, res) => {
    const event = req.body;
    const obj = event.data.object;

    switch (event.type) {
        case 'payment_intent.succeeded':
            res.sendStatus(200);
            const invoices = obj.metadata.invoices.split(", ");
            const db = await open({
                filename: 'invoices.db',
                driver: sqlite3.Database
            })
            const sql = `update invoices set status = 'paid' where number in ('` + invoices.join("','") + `')`;
            console.log(sql);
            await db.run(sql);
            await db.close();
            break;

        default:
            res.sendStatus(200);
            break;
    }
});

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);
