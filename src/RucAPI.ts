export interface Person {
    doc: string;
    name: string;
    div: string;
    old?: string;
}

interface SetPortalPerson {
    ruc: string;
    name: string;
    dv: string;
    old: string;
    state: string;
}

export type QueryResult = Person[];

export function query(searchTerm: string): Promise<QueryResult> {

    const final = searchTerm.replace(" +", "+");

    return fetch(`https://sapi.volpe.com.py/api/data?query=${final}`)
        .then(result => result.json())
        .then((result: SetPortalPerson[]) => result.map(r => ({
            doc: r.ruc,
            div: r.dv,
            old: r.old,
            name: r.name
        })));
}
