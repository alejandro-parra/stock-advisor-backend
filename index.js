// run locally  mail=qdrwshctkvojeexp mailUser=alexparra07@gmail.com key=ab12n23j3423DSA3 node index.js
const mongo = require('mongodb').MongoClient
const express = require('express');
const helmet = require('helmet') //protege de ataques con URL
const bodyParser= require('body-parser') //parsear JSONs para enviarlos al front
const cors = require('cors') //dominios permitidos 
const bcrypt = require('bcrypt'); //encripta
const crypto = require('crypto'); //random string generator (no es muy bueno para encriptar)
const nodemailer = require('nodemailer');
const Ddos = require('ddos')
const jwt = require('jsonwebtoken'); //autenticar usuarios con tokens
const fs = require('fs'); //filesystem del servidor
var ObjectId = require('mongodb').ObjectID;
const ddos = new Ddos({burst:10, limit:15})
const saltRounds = 10;
const url = "mongodb+srv://stockmaster:kycpaco_280198@db.s775v.mongodb.net/StockAdvisor?retryWrites=true&w=majority";
const key = process.env.key;



var sanitize = require('mongo-sanitize'); //eliminar codigo de los fields que manda el front
const { check, validationResult } = require('express-validator'); //checar tipos de datos

const app = express();
app.use(bodyParser.urlencoded({limit: '10mb',extended: true}))
app.use(bodyParser.json({limit: '10mb', extended: true}));
const protectedRoutes = express.Router(); //middleware para verificar si el usuario está loggeado

protectedRoutes.use((req, res, next) => {
    let token = sanitize(req.headers['access-token']);
    let userId = sanitize(req.body.userId);
    if (token) {
        jwt.verify(token, app.get('key'), (err, decoded) => {      
            if (err) {
                res.status(500).send("Logout");      
            } else {
                if(decoded.id == userId){
                    next();
                }else{
                    res.status(500).send("Logout"); 
                }  
            }
        });
    } else {
        res.status(500).send("Logout"); 
    }
});

app.set('key', process.env.key);

app.use(ddos.express);
app.use(helmet())
const whitelist = ['http://localhost:4200'] //dominios que pueden entrar y hacer llamadas al back
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
//app.use(cors({origin: '*', optionsSuccessStatus: 200}))

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.mailUser, // user for sending email
      pass: process.env.mail, // password for the user used
  }
});


mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 10}, (err, client) => {


    //DATABASE VARIABLES
    const db = client.db('StockAdvisor')
    const usersCollection = db.collection('Users');

    //AUXILIARY FUNCTIONS
    function sendEmail(from,to,subject,html){
      return new Promise((resolve,reject)=>{
          let mailOptions = {
              from: from,
              to: to,
              subject: subject,
              html:html
          };
          transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                  reject(error)
              } else {
                  resolve('success')
              }
          }); 
      });
    }


    //ENDPOINTS
    /**
        * @desc Verify that the user token is not expired
        * @param {Object} req.headers[access-token] - The user token he wants to validate
    */
    app.post('/validate-token', function(req, res) {
        var token = req.headers['access-token'];
        if (token) {
            jwt.verify(token, app.get('key'), (err, decoded) => {      
                if (err) {
                    return res.status(500).send("Se cerró la sesión debido a un error");
                          
                } else {
                    return res.status(200).send("Success");  
                    
                }
            });
        } else {
            return res.status(500).send("Se cerró la sesión debido a un error"); 
        }
    })

    app.post('/register-user',[
        check('name').not().isEmpty(),
        check('lastName').not().isEmpty(),
        check('email').isEmail(),
        check('password').not().isEmpty()
      ], function(req, res) {
        console.log(req.body);
        var password = sanitize(req.body.password);
        var email = sanitize(req.body.email);
        var name = sanitize(req.body.name);
        var lastName = sanitize(req.body.lastName);

        bcrypt.hash(password, saltRounds, function (err, hash) {
            usersCollection.find({email:email}).toArray().then((results)=>{
                if(results.length>0){
                    return res.status(400).send("El correo ya existe para una cuenta."); 
                } else{
                    let user = {
                        name:name,
                        email:email,
                        password:hash,
                        lastName:lastName,
                        operations: []
                    };
                    usersCollection.insertOne(user).then((response)=>{
                        let payload = {
                            email: email,
                            id:response.insertedId
                        }
                        let token = jwt.sign(payload, app.get('key'), {
                            expiresIn: 604800
                        });
                        user.password = null;
                        user.token = token;
                        user.insertedId = response.insertedId;
                        return res.status(200).send(user); 
                    }).catch((err)=>{
                        console.log('insertion error')
                        console.log(err);
                        return res.status(500).send("Error interno del sistema");  
                    })
                }
            }).catch((err)=>{
                res.status(500).send("Error interno del sistema");  
                console.log(err);
            })
        });
    })

    app.post('/login-user',[
        check('email').isEmail(),
        check('password').not().isEmpty()
      ], function(req, res) {
        console.log(req.body);
        if(req.body.email !== undefined && req.body.password !== undefined){
            let password = sanitize(req.body.password);
            let email = sanitize(req.body.email);
            usersCollection.find({email:email}).toArray().then((results)=>{
                if(results.length === 1){
                    let user = results[0];
                    if (! bcrypt.compareSync(password, user.password)){
                        return res.status(400).send("Contraseña incorrecta"); 
                    } else{
                        let payload = {
                            email: user.email,
                            id: user._id
                        }
                        let token = jwt.sign(payload, app.get('key'), {
                            expiresIn: 604800
                        });
                        user.password = null;
                        user.token = token;
                        return res.status(200).send(user); 
                    }
                }else{
                    return res.status(404).send("Usuario no encontrado en la base de datos."); 
                }
            }).catch((err)=>{
                console.log('Error finding user');
                return res.status(500).send("Error interno del sistema"); 
            }) 
        }else{
            return res.status(406).send('Datos no aceptables'); 
        } 
    })

    app.post('/reset-user-password', function(req, res) {
        if(req.body.token != null && req.body.token != '' && req.body.password != null && req.body.password != ''){
            console.log(req.body)
            var token = sanitize(req.body.token);
            var password = sanitize(req.body.password);
            usersCollection.find({token:token}).toArray().then((result)=>{
                var difference  = Date.now() - result[0].tokenTime 
                if(result.length === 1 && difference < 86400000){
                    bcrypt.hash(password, saltRounds, function (err,hash) {
                      usersCollection.updateOne({token:token},{$set:{password:hash},$unset:{token:"",tokenTime:""}}).then((result)=>{
                            return res.status(200).send(result);  
                        }).catch((err)=>{
                            return res.status(404).send("Usuario no encontrado en la base de datos.");  
                            console.log(err);
                        }); 
                    });
                }else{
                    return res.status(404).send("Token no válido"); 
                }
            }).catch((err)=>{
                console.log(err);
                return res.status(500).send("Error interno del sistema");  
            }); 
        }else{
            return res.status(500).send("Error interno del sistema");  
        }
    })

    app.post('/send-recovery-token',[
        check('email').isEmail(),
      ], function(req, res) {
        let randomToken = crypto.randomBytes(1024).toString('hex');
        if(req.body.email != null && req.body.email != ''){
            let email = sanitize(req.body.email);
            let resetPasswordTemplate = 
            `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>Nuevo correo electrónico</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>
            96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">
            #outlook a {	padding:0;}.ExternalClass {	width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {	line-height:100%;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}.es-button-border:hover {	background:#ffffff!important;	border-style:solid solid solid solid!important;	border-color:#3d5ca3 #3d5ca3 #3d5ca3 #3d5ca3!important;}@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:20px!important; text-align:center; line-height:120%!important } h2 { 
            font-size:16px!important; text-align:left; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:20px!important } h2 a { font-size:16px!important; text-align:left } h3 a { font-size:20px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:10px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { 
            text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden 
            { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } a.es-button, button.es-button { font-size:14px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } }</style></head><body style="width:100%;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#FAFAFA"> <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#fafafa"></v:fill> </v:background><![endif]--><table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td valign="top" style="padding:0;Margin:0"><table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td class="es-adaptive" align="center" style="padding:0;Margin:0">
            <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#3D5CA3;width:580px" cellspacing="0" cellpadding="0" bgcolor="#3d5ca3" align="center"><tr style="border-collapse:collapse"><td style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px;background-color:#3D5CA3" bgcolor="#3d5ca3" align="left"><table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;width:540px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0px">
            <img src="https://" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="183" title="Logo"></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;background-color:#FAFAFA" bgcolor="#fafafa" align="center"><table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:580px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"><tr style="border-collapse:collapse">
            <td style="padding:0;Margin:0;padding-left:20px;padding-right:20px;padding-top:40px;background-color:transparent;background-position:left top" bgcolor="transparent" align="left"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:540px"><table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:left top" width="100%" cellspacing="0" cellpadding="0" role="presentation"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px;font-size:0">
            <img src="https://uhihl.stripocdn.email/content/guids/CABINET_700b09c1bbcfd8798294646332a9e885/images/23891556799905703.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="175" height="208"></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px"><h1 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#333333"><b>Restablecer contraseña</b></h1></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-right:35px;padding-left:40px">
            <p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666">Buen día hemos detectado que se solicitó el restablecimiento de tu contraseña en caso de no haberlo solicitado, ignore este correo.<br></p></td></tr><tr style="border-collapse:collapse"><td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:40px;padding-bottom:40px"><span class="es-button-border" style="border-style:solid;border-color:#3D5CA3;background:#FFFFFF;border-width:2px;display:inline-block;border-radius:10px;width:auto">
            <a href="http://localhost:4200/login?recoveryToken=`+randomToken+`&email=`+email+`" class="boton-de-contraseña es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:14px;color:#3D5CA3;border-style:solid;border-color:#FFFFFF;border-width:15px 20px 15px 20px;display:inline-block;background:#FFFFFF;border-radius:10px;font-weight:bold;font-style:normal;line-height:17px;width:auto;text-align:center">Restablecer contraseña</a></span></td></tr></table></td></tr></table></td></tr><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;padding-left:10px;padding-right:10px;padding-top:20px;background-position:center center" align="left"> <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:189px" valign="top"><![endif]-->
            <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;width:189px"><table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center center" width="100%" cellspacing="0" cellpadding="0" role="presentation"><tr style="border-collapse:collapse"><td class="es-m-txt-c" align="right" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:24px;color:#666666"><strong>Siguenos en:</strong></p></td></tr></table></td></tr></table> <!--[if mso]></td><td style="width:20px"></td>
            <td style="width:351px" valign="top"><![endif]--><table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;width:351px"><table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center center" width="100%" cellspacing="0" cellpadding="0" role="presentation"><tr style="border-collapse:collapse"><td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:10px;font-size:0"><table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse">
            <td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img src="https://uhihl.stripocdn.email/content/assets/img/social-icons/rounded-gray/facebook-rounded-gray.png" alt="Fb" title="Facebook" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img src="https://uhihl.stripocdn.email/content/assets/img/social-icons/rounded-gray/twitter-rounded-gray.png" alt="Tw" title="Twitter" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px">
            <img src="https://uhihl.stripocdn.email/content/assets/img/social-icons/rounded-gray/instagram-rounded-gray.png" alt="Ig" title="Instagram" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img src="https://uhihl.stripocdn.email/content/assets/img/social-icons/rounded-gray/youtube-rounded-gray.png" alt="Yt" title="Youtube" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td><td valign="top" align="center" style="padding:0;Margin:0;padding-right:10px"><img src="https://uhihl.stripocdn.email/content/assets/img/social-icons/rounded-gray/linkedin-rounded-gray.png" alt="In" title="Linkedin" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td></tr>
            </table></td></tr></table></td></tr></table> <!--[if mso]></td></tr></table><![endif]--></td></tr></table></td></tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;background-color:#FAFAFA" bgcolor="#fafafa" align="center"><table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:580px"><tr style="border-collapse:collapse">
            <td style="Margin:0;padding-top:10px;padding-left:20px;padding-right:20px;padding-bottom:30px;background-color:#0B5394;background-position:left top" bgcolor="#0b5394" align="left"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:540px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px"><h2 style="Margin:0;line-height:19px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:16px;font-style:normal;font-weight:normal;color:#FFFFFF"><strong>¿Tiene alguna pregunta?</strong>
            </h2></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-bottom:5px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;line-height:21px;color:#FFFFFF">No dude en contactarnos</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body>
            </html>
            `
            sendEmail("alexparra07@gmail.com",email,'Restablecer contraseña StockAdvisor',resetPasswordTemplate).then((response)=>{
                if(response == 'success'){
                    usersCollection.updateOne({email:email},{$set:{token:randomToken, tokenTime:Date.now()}}).then((result)=>{
                        res.status(200).send('success'); 
                    }).catch((err)=>{
                        res.status(500).send("Error interno del sistema");  
                        console.log(err);
                    });
                }
            },(error)=>{
                res.status(500).send("Error interno del sistema");  
                console.log(error);
            })
        }else{
            res.status(406).send("Datos inválidos");  
        }
    })

    app.post('/delete-user', protectedRoutes, function(req, res) {
        if(req.body.id != null && req.body.id != ''){
            var id = sanitize(req.body.id);
            usersCollection.deleteOne({_id:new ObjectId(id)}).then((items)=>{
                res.status(200).send('Success');  
            }).catch((err)=>{
                console.log(err);
                res.status(500).send("Error interno del sistema");  
            })
        }else{
            res.status(406).send("Datos inválidos");  
        }
    })
     
    app.listen(3000, function() {
        console.log('listening on 3000')
    })

  if (err) {
    console.error(err)
    return
  }
})

