// Modules
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './styles/index.css';

// Components
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Option1 from './components/Option1';

// Actions
import useToken from './actions/useToken';

export default function App() {
    const { token, setToken } = useToken();
    const [refresh, setRefresh] = useState();

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
                <Header setToken={setToken} token={token} refresh={refresh} setRefresh={setRefresh}/>
                <Routes>
                    <Route path="/option-1" element={
                        <Option1 token={token} refresh={refresh} setRefresh={setRefresh}/>
                    }>
                    </Route>
                    <Route path="/*" element={
                        <Option1 token={token} refresh={refresh} setRefresh={setRefresh}/>
                    }>
                    </Route>
                </Routes>
            </BrowserRouter>
        );
    }
}

/*
Option 0 - Hosted surfaces
           Pros: very little front-end code needed
           Cons: can only pay one invoice at a time, cannot save payment methods, heavy lift to sync invoices, clunky UX

Option 1 - Portal that shows invoices from a separate system, multiple invoices can be paid at once
           Pros: multiple invoices can be paid at once, invoice PDFs can be those from User's system
           Cons: engineering lift
           
*/

