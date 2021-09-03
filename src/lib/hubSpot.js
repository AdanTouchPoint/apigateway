
const hubspot = require('@hubspot/api-client');

const hubspotClient = new hubspot.Client({"apiKey":process.env.HUBSPOT_KEY});


 const sendToHubSpot = async (simplePublicObjectInput) => {

     const apiResponse = await hubspotClient.crm.contacts.basicApi.create(simplePublicObjectInput);
     return apiResponse
 };

const updateToHubspot = async (contactId,idProperty,simplePublicObjectInput)=> {
    const apiResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, idProperty, simplePublicObjectInput);
    return apiResponse
}


module.exports= {sendToHubSpot,updateToHubspot}