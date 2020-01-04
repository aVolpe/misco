export interface InvoiceDetails {
    quantity: number;
    description: string;

    total: number;

    // TODO extract this in a more generic way
    fee10: number;
    fee5: number;
}

export interface Invoice {
    /**
     * format XX-XX-XXXXXX
     */
    number: string;

    ruc: string;
    name: string;

    address?: string;

    /**
     * Format yyyy-MM-dd
     */
    date: string;

    details?: InvoiceDetails[];

}

export type NetworkResource<T, E = NetworkError> = {
    state: 'NO_REQUESTED'
} | {
    state: 'FETCHING'
} | {
    state: 'LOADED',
    data: T
} | {
    state: 'ERROR',
    error: E
}

export const NRHelper = {
    noRequested: () => ({state: 'NO_REQUESTED' as const}),
    fetching: () => ({state: 'FETCHING' as const}),
    loaded: <T>(data: T) => ({state: 'LOADED' as const, data}),
    error: <E>(error: E) => ({state: 'ERROR' as const, error}),
};

export class NRWrapper<T, E> {

    static of<T, E>(base: NetworkResource<T, E>) {
        return new NRWrapper(base);
    }

    constructor(private nr: NetworkResource<T, E>) {
    }

    orElse(def: T): T {
        if (this.nr.state === 'LOADED') return this.nr.data;
        return def;
    }

    map<K>(op: (toMap: T) => K): NRWrapper<K, E> {
        let toRet: NetworkResource<K, E>;
        switch (this.nr.state) {
            case 'ERROR':
                toRet = NRHelper.error(this.nr.error);
                break;
            case 'FETCHING':
                toRet = NRHelper.fetching();
                break;
            case 'LOADED':
                const mapped: K = op(this.nr.data);
                toRet = NRHelper.loaded<K>(mapped);
                break;
            case 'NO_REQUESTED':
            default:
                toRet = NRHelper.noRequested();
                break;

        }
        return new NRWrapper<K, E>(toRet);
    }

}

export interface NetworkError {
    code: number;
}
