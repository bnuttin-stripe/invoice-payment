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

// Get all products
app.get('/products', async (req, res) => {
    let output = [];

    const products = await stripe.products.list({
        limit: 30,
        active: true
    });

    const prices = await stripe.prices.list({
        limit: 30,
        active: true
    });

    products.data.forEach(product => {
        product.prices = [];
        prices.data.forEach(price => {
            if (price.product === product.id) product.prices.push(price);
        })
        product.is_subscription = product.prices.findIndex(x => x.recurring !== null) > -1;
        output.push(product);
    });

    res.send(output);
});

// Get details and prices on a specific product
app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await stripe.products.retrieve(id);
    const prices = await stripe.prices.list({
        product: req.params.id,
        active: true,
    });
    product.prices = prices.data;
    product.is_subscription = product.prices.findIndex(x => x.recurring !== null) > -1;
    res.send({
        product
    });
});

/* ------ PAYMENT METHODS ------ */
// Get saved cards for a given customer
app.get('/payment-methods/:customer/cards', async (req, res) => {
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
// Calculate the total amount server side to prevent fraud, and we collate a lit of products being bought, to put into the metadata
const summarizeCart = async (cart) => {
    const prices = await stripe.prices.list({
        limit: 100
    });
    let hasSubs = false;
    let total = 0;
    let summary = '';
    cart.forEach(item => {
        if (item.selectedPrice.recurring !== null) hasSubs = true;
        const price = prices.data.find(x => x.id === item.selectedPrice.id) || 0;
        total += price.unit_amount;
        summary += item.id + '  [' + item.name + "] "
    });
    return {
        total: total,
        summary: summary,
        hasSubs: hasSubs
    }
}

// Process the cart - depending on the contents, we might be starting a subscription, or a setting up a PI
// The cart will only ever have ONE subscription product in it, at least for now, for simplicity
// (adding multiple products at the same time is only possible if they are on the same recurring cycle)
app.post("/process-cart", async (req, res) => {
    const cart = req.body.cart;
    const customer = req.body.customer;
    const pm = req.body.pm || false;
    const cartInfo = await summarizeCart(cart);
    let payload = {};

    if (cartInfo.hasSubs) {
        const subPrice = cart.find(x => x.is_subscription).selectedPrice.id;
        const items = cart.filter(x => !x.is_subscription).map(x => {
            return { price: x.selectedPrice.id }
        });
        payload = {
            customer: customer,
            items: [
                { price: subPrice }
            ],
            add_invoice_items: items,
            automatic_tax: {
                enabled: true
            }
        }
        if (pm) {
            payload.default_payment_method = pm
        }
        else {
            payload.payment_behavior = 'default_incomplete',
                payload.expand = ['latest_invoice.payment_intent']
        }
        const subscription = await stripe.subscriptions.create(payload);
        res.send({
            next_step: 'profile',
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || false
        });
        // to do
    }
    else {
        payload = {
            amount: cartInfo.total,
            currency: 'usd',
            metadata: {
                summary: cartInfo.summary
            },
            customer: customer,
            payment_method_types: ['card', 'us_bank_account', 'alipay']
        };
        if (pm) {
            payload.confirm = true;
            payload.payment_method = pm;
        }

        const paymentIntent = await stripe.paymentIntents.create(payload);

        res.send({
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status,
            last_payment_error: paymentIntent.last_payment_error,
            id: paymentIntent.id
        });
    }
});

// Update the PM on a sub
app.post('/subscription-update/', async (req, res) => {
    const id = req.body.subscription;
    const pm = req.body.pm;
    const subscription = await stripe.subscriptions.update(
        id,
        { default_payment_method: pm }
    )
    res.send(subscription);
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

// Get all subs for the customer
app.get('/subscriptions/:customer', async (req, res) => {
    const customer = req.params.customer;
    const subscriptions = await stripe.subscriptions.list({
        customer: customer,
        status: 'all',
        expand: ['data.default_payment_method', 'data.plan.product']
    });
    res.send(subscriptions.data);
});

// Get all invoices for the customer
app.get('/invoices-imported', async (req, res) => {
    res.send(data.invoices);
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

/* ------ STRIPE-HOSTED PAGES ------ */
// Checkout
app.post('/create-checkout-session', async (req, res) => {
    const customer = req.body.customer;
    const price = req.body.price;
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customer,
        payment_method_types: ['card', 'klarna'],
        billing_address_collection: 'auto',
        line_items: [
            {
                price: price,
                quantity: 1
            }
        ],
        automatic_tax: {
            enabled: true
        },
        success_url: BASE_URL + '/profile',
        cancel_url: BASE_URL,
    });

    res.send({
        sessionId: session.id,
    });

});

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
        case 'invoice.payment_succeeded':
            res.sendStatus(200);
            if (obj.billing_reason === 'subscription_create') {
                const paymentIntentId = obj.payment_intent;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                const sub = await stripe.subscriptions.update(
                    obj.subscription,
                    { default_payment_method: paymentIntent.payment_method }
                )
            }
            break;

        default:
            res.sendStatus(200);
            break;
    }
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT);
