const {Router} = require('express');
const axios = require('axios')
const router = Router();

router.post('/', async (req, res) => {
    console.log(req.body)
    const item= req.body
    let phonePass
    let emailPass

    try {
        console.log(item.phone)
 
        const email = req.body.email
        const phone = req.body.phone
       
        
        const verifyPhone = async phone => {
            if (phone === "" || !phone ) {
                phonePass = "Falta numero de telefono"
            return phonePass
            } else {
                console.log(phone)
                phonePass = await axios.post(`http://apilayer.net/api/validate?access_key=${process.env.PHONE_KEY_KENTTA}&number=${phone}&country_code=MX&format=1`)
                return phonePass.data.valid
            }
        }
        const verifyEmail = async email => {
            console.log(email)
            emailPass = await axios.post(`https://api.emailable.com/v1/verify?email=${email}&api_key=${process.env.EMAIL_KEY_KENTTA}`)
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
            else if (data.valid === true){
                res.json({
                    success: true,
                    message: 'Numero de telefono  valido'
                });
            }
            if (data.score >= 50) {
                console.log(`${data.score} Muy Bueno`)
                res.json({
                    success: false,
                    message: 'Correo Valido'
                });
            }
             else if (data.score >= 25) {
                console.log(`${data.score}  Regular`)
                res.status(206);
                res.json({
                    success: false,
                    message: 'intenta con otro  correo'
                });
            } else if (data.score >= 0) {
                console.log(`${data.score}  Mal`)
                res.status(206)
                res.json({
                    success: false,
                    message: 'intenta con otro  correo'
                });
                
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