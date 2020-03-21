export default class DigitGenerator {

    getDigitoVerificadorBase11(ruc: string) {
        return this.getDigitoVerificador(ruc, 11);
    }

    getDigitoVerificador(ruc: string, base: number) {

        let k = 2;
        let total = 0;
        let valueOfZero = "0".charCodeAt(0);

        let alRevez = DigitGenerator.invertirCadena(DigitGenerator.eliminarNoDigitos(ruc));

        for (let i = 0; i < alRevez.length; i++) {
            let numero = alRevez.charCodeAt(i);
            total += (numero - valueOfZero) * k++;
            if (k > base) k = 2;
        }

        let resto = total % base;

        if (resto > 1) return base - resto;
        else return 0;
    }

    private static invertirCadena(cadena: string) {
        return cadena.split("").reverse().join("");
    }

    private static eliminarNoDigitos(ruc: string) {
        let toRet = "";
        for (let i = 0; i < ruc.length; i++) {
            // si no es caracter, lo converitmos a su valor numérico
            if (isNaN(parseInt(ruc[i], 10))) {
                toRet += ruc.charCodeAt(i);
            } else {
                toRet += ruc[i];
            }
        }
        return toRet;
    }
}
