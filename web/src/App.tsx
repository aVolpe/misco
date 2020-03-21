import React from 'react';
import './App.css';
import {MainPage} from './pages/MainPage';
import {configure} from 'react-hotkeys';

configure({
    logLevel: 'warn',

});
const App: React.FC = () => {
    return <MainPage/>;
};

export default App;
