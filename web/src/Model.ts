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

export type Async<T, E = NetworkError> = {
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

    or: function <T, E>(nr: Async<T, E>, def: T) {
        if (nr.state === 'LOADED') return nr.data;
        return def;
    },

    map: function <T, E, K>(nr: Async<T, E>, mapper: (toMap: T) => K): Async<K, E> {
        return NRWrapper.of(nr).map(mapper).unwrap();
    }
};

export class NRWrapper<T, E> {

    static of<T, E>(base: Async<T, E>) {
        return new NRWrapper(base);
    }

    constructor(private nr: Async<T, E>) {
    }

    orElse(def: T): T {
        if (this.nr.state === 'LOADED') return this.nr.data || def;
        return def;
    }

    map<K>(op: (toMap: T) => K): NRWrapper<K, E> {
        let toRet: Async<K, E>;
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

    unwrap(): Async<T, E> {
        return this.nr;
    }
}

export interface NetworkError {
    code: number;
}
