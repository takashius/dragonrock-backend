export default (titulo, mensaje) => {
  const body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Demystifying Email Design</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>

    <body style="margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border:1px solid #f0f0f0;">
            <tr>
                <td align="center" bgcolor="#0271B8" style="padding: 40px 0 30px 0;">
                    <img src="https://res.cloudinary.com/erdesarrollo/image/upload/v1667538090/logo_cai_zhia5m.png" width="200" style="display: block;" />
                </td>
            </tr>
            <tr>
                <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
                                <b>${titulo}</b>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 0 30px 0;" style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                ${mensaje}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td bgcolor="#00AFE6" style="padding: 30px 30px 30px 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td align="center" style="color: #FFFFFF; font-family: Arial, sans-serif; font-size: 14px;">
                                <h2>Contactos</h2><br/>
                                <a style="color: #FFFFFF;" href="tel:+584125557916">+58 0412-5557916</a><br/>
                                <a style="color: #FFFFFF;" href="mailto:c.a.i.yocreoenti@gmail.com">c.a.i.yocreoenti@gmail.com</a><br/>
                                &copy; Copyright & Design erDesarrollo.com.ve<br/>
                                <h3>Descarga la App</h3><br/>
                                <center>
                                  <a href="https://play.google.com/store/apps/details?id=com.erdesarrollo.cai" target="_blank">
                                    <img src="https://res.cloudinary.com/erdesarrollo/image/upload/v1669776216/playstore_Icon_h2lera.png" alt="Descargar APP" width="55" height="55">
                                  </a>
                                </center><br/>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
  return body;
};
