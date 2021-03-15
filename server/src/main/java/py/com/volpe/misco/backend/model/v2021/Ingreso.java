package py.com.volpe.misco.backend.model.v2021;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @author Arturo Volpe
 * @since 2021-02-09
 */
public class Income {

    private String tipoIdentificacion;
    private String identificacion;
    private String nombre;
    private String tipoComprobante;
    private String numero;
    private LocalDate fecha;
    private BigDecimal montoTotal;
    private BigDecimal montoIRP;

}
