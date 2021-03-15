package py.com.volpe.misco.backend.model.v2021;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @author Arturo Volpe
 * @since 2021-02-09
 */
public class Expense {

    private String tipoIdentificacion;
    private String identificacion;
    private String nombre;
    private String tipoComprobante;
    private String numero;
    private String timbrado;
    private String condicion;
    private LocalDate fecha;
    private BigDecimal importe;
    private BigDecimal importeIRP;

    public String getTipoIdentificacion() {
        return tipoIdentificacion;
    }

    public void setTipoIdentificacion(String tipoIdentificacion) {
        this.tipoIdentificacion = tipoIdentificacion;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipoComprobante() {
        return tipoComprobante;
    }

    public void setTipoComprobante(String tipoComprobante) {
        this.tipoComprobante = tipoComprobante;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getTimbrado() {
        return timbrado;
    }

    public void setTimbrado(String timbrado) {
        this.timbrado = timbrado;
    }

    public String getCondicion() {
        return condicion;
    }

    public void setCondicion(String condicion) {
        this.condicion = condicion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getImporte() {
        return importe;
    }

    public void setImporte(BigDecimal importe) {
        this.importe = importe;
    }

    public BigDecimal getImporteIRP() {
        return importeIRP;
    }

    public void setImporteIRP(BigDecimal importeIRP) {
        this.importeIRP = importeIRP;
    }
}
