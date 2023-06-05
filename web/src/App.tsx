import React from 'react';
import './App.css';
import {MainPage} from './pages/MainPage';
import {configure} from 'react-hotkeys';
import {App} from 'antd';

configure({
    logLevel: 'warn',

});
const MiscoApp: React.FC = () => {
    return <App>
        <MainPage/>
    </App>;
};

export default MiscoApp;
