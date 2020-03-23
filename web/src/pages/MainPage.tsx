import React from 'react';
import {useLocalStorage} from '@rehooks/local-storage';
import {Informante} from '../set/ArandukaModel';
import {Dashboard} from './Dashboard';
import {Onboarding} from './Onboarding';

export function MainPage() {

    const [informer, setInformer] = useLocalStorage<Informante>('informante');

    return informer ? <Dashboard/> : <Onboarding/>
}
