const {Router} = require('express');
const axios = require('axios')
const router = Router();
const hubspot = require('../lib/hubSpot')
const FormData = require('form-data');
router.post('/', async (req, res) => {
    console.log(req.body)
    const item= req.body
    let phonePass
    let emailPass

    try {
        console.log(item.phone)
        const idForm =  req.body.idForm
        const email = req.body.email
        const phone = req.body.phone
        const form = new FormData();
        
        for ( var key in item ) {
            form.append(key, item[key]);
        }

        const verifyPhone = async phone => {
            if (phone === "" || !phone ) {
                phonePass = "Phone is not required"
            return phonePass
            } else {
                console.log(phone)
                phonePass = await axios.post(`http://apilayer.net/api/validate?access_key=${process.env.PHONE_KEY}&number=${phone}&country_code=MX&format=1`)
                return phonePass.data.valid
            }
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
            if (data.valid === false) {
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
                    url:`https://forms.hsforms.com/submissions/v3/public/submit/formsnext/multipart/6028632/${idForm}`,
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
            }
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