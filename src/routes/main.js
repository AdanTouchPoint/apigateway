const {Router} = require('express');
const axios = require('axios')
const router = Router();
const hubspot = require('../lib/hubSpot')
const FormData = require('form-data');
router.post('/', async (req, res) => {
    console.log(req.body)

    let phonePass
    let emailPass

    try {
        const email = req.body.email
        const phone = req.body.phone
        const company = req.body.company
        const firstname = req.body.firstname
        const lastname = req.body.lastname
        const numemployees = req.body.numemployees
        const role = req.body.role
        const medio_de_contacto_de_preferencia = req.body.medio_de_contacto_de_preferencia
        const hs_context = req.body.hs_context
        // const {email, phone, company, firstname, lastname,numemployees,role,medio_de_contacto_de_preferencia} = req.body

        const form = new FormData();
        form.append("company", company)
        form.append("email", email)
        form.append("firstname", firstname)
        form.append("lastname", lastname)
        form.append("phone", phone)
        form.append("numemployees", numemployees)
        form.append("role", role)
        form.append("medio_de_contacto_de_preferencia", medio_de_contacto_de_preferencia)
        form.append('hs_context', hs_context)

        //const simplePublicObjectInput = {properties}
        const verifyPhone = async phone => {
            console.log(phone)
            phonePass = await axios.post(`http://apilayer.net/api/validate?access_key=${process.env.PHONE_KEY}&number=${phone}&country_code=MX&format=1`)
            return phonePass.data.valid
        }
        const verifyEmail = async email => {
            console.log(email)
            emailPass = await axios.post(`https://api.emailable.com/v1/verify?email=${email}&api_key=${process.env.EMAIL_KEY}`)
            return emailPass.data.score
        }
        const verify = async (phone, email) => {
            let valid = await verifyPhone(phone).catch(e => console.error(e))
            let score = await verifyEmail(email).catch(e => console.error(e))
            console.log(score)
            console.log(valid)
            return {valid, score}
        }
        verify(phone, email).then(async (data) => {
            console.log(data.score)
            console.log(data.valid)
            if (data.valid !== true) {
                res.status(208);
                res.json({
                    success: false,
                    message: 'Telefono invalido , introduzca otro numero'
                });
                return
            }
            if (data.score >= 50) {
                console.log(`${data.score} Muy Bueno`)
                const options = {
                    method: 'POST',
                    url: ' https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/6028632/4cc82d56-97c6-4383-b43d-5336eea76cb0',
                    //
                    headers: {
                        ...form.getHeaders()
                    },
                    data: form
                };

                axios.request(options).then(function (response) {
                    console.log(response.data);
                    res.json({
                        success: true,
                        message: 'contacto creado'
                    });
                }).catch(function (error) {
                    console.error(error);
                });

                // hubspot.sendToHubSpot(simplePublicObjectInput).then(() => {
                //     console.log('herecreate1')
                //     res.json({
                //         success: true,
                //         message: 'contacto creado'
                //     });
                // }).catch(err => {
                //     let userId = err.response.body.message
                //     if (err.statusCode === 409) {
                //         let regex = /(\d+)/g;
                //         const contactId = Math.floor(userId.match(regex))
                //         hubspot.updateToHubspot(contactId, simplePublicObjectInput).then(() => {
                //             console.log('hereupdate1')
                //             return res.json({
                //                 success: true,
                //                 message: 'contacto actualizado'
                //             });
                //         }).catch(e => console.error(e))
                //     }
                // })
            }
            // else if (data.score >= 50) {
            //     hubspot.sendToHubSpot(simplePublicObjectInput).then(() => {
            //         console.log('herecreate2')
            //         res.json({
            //             success: true,
            //             message: 'contacto creado'
            //         });
            //     }).catch(err => {
            //         let userId = err.response.body.message
            //         if (err.statusCode === 409) {
            //             let regex = /(\d+)/g;
            //             const contactId = Math.floor(userId.match(regex))
            //             hubspot.updateToHubspot(contactId, simplePublicObjectInput).then(() => {
            //                 console.log('hereupdate2')
            //                 res.json({
            //                     success: true,
            //                     message: 'contacto actualizado'
            //                 });
            //             }).catch(e => console.error(e))
            //         }
            //     })
            //     console.log('50-74 Bueno')
            // }
            else if (data.score >= 25) {
                console.log('25 -49 regular ')
                res.status(206);
                res.json({
                    success: false,
                    message: 'intenta con otr  correo'
                });
            } else if (data.score >= 0) {
                console.log('0-24 mal')
                res.status(206)
                res.json({
                    success: false,
                    message: 'intenta con otr  correo'
                });
                // res.statusText("Intenta con otro email");
            }
        })
    } catch (error) {
        res.status(400)
        res.json({
            success: false,
            message: error.message
        })
    }
})

module.exports = router