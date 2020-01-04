export interface Person {
    doc: string;
    name: string;
    div: string;
    old: string;
}

export type QueryResult = Person[];

export function query(searchTerm: string): Promise<QueryResult> {

    const final = searchTerm.replace("\s+", "+")

    return fetch(`https://sapi.volpe.com.py/find?query=${final}`)
        .then(result => result.json());

}
