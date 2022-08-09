// Modules
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/index.css';

// Components
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

// Actions
import useToken from './actions/useToken';

export default function App() {
    const { token, setToken } = useToken();
    const [cart, setCart] = useState([]);

    const addToCart = (product, price) => {
        const newItem = product;
        newItem.selectedPrice = price;
        setCart([...cart, newItem]);
    }

    const resetCart = () => {
        setCart([]);
    }

    if (!token) {
        return (
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/register/:attemptedEmail" element={
                        <Register setToken={setToken} />
                    }>
                    </Route>
                    <Route path="/register" element={
                        <Register setToken={setToken} />
                    }>
                    </Route>
                    <Route path="/" element={
                        <Login setToken={setToken} />
                    }>
                    </Route>
                </Routes>
            </BrowserRouter>
        )
    }
    else {
        return (
            <BrowserRouter>
                <Header setToken={setToken} token={token} cart={cart} resetCart={resetCart} />
                <Routes>
                    {/*
                    <Route path="/checkout">
                        <Checkout token={token} cart={cart} resetCart={resetCart} />
                    </Route>
                    <Route path="/receipt">
                        <Receipt token={token} />
                    </Route>
                    */}
                    <Route path="/profile">

                    </Route>
                    {/*
                    <Route path="/product/:id">
                        <ProductPage token={token} addToCart={addToCart} cart={cart} />
                    </Route>
                    */}
                    <Route path="/" element={
                        <Profile token={token} />
                    }>
                    </Route>
                </Routes>
            </BrowserRouter>
        );
    }
}
