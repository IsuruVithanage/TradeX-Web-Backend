const dataSource = require("../config/config");
const alertRepo = dataSource.getRepository("Alert");
const sendPushNotification = require("../SendNotification/Push");
const sendEmailNotification = require("../SendNotification/Email");



const getAllRunningAlerts = async () => {
    try {
        const alerts = await alertRepo
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.deviceToken", "t", "a.userId = t.userId")
        .select([
            `a.alertId AS "alertId"`,
            `a.userId AS "userId"`,
            `a.coin AS "coin"`,
            `a.condition AS "condition"`,
            `a.price AS "price"`,
            `a.emailActiveStatus AS "emailActiveStatus"`,
            `a.runningStatus AS "runningStatus"`,
            `t.deviceToken AS "deviceToken"`,
        ])
        .where("a.runningStatus = true")
        .orderBy({
            "a.coin": "ASC",
            "a.userId": "ASC",
            "a.condition": "ASC",
        })
        .getRawMany();

        return alerts;
    }

    catch (error) {
        console.log("\nError fetching All alerts:", error); 
        return [];
    }
};



const getAlerts = async (req, res) => {
    try {
        if(!req.query.userId){
            res.status(404).json({message: 'Alerts not found'});
        }

        else{
            const alerts = await alertRepo.find({
                where: {
                    userId: req.query.userId,
                    runningStatus: req.query.runningStatus === undefined ? true : req.query.runningStatus,
                },
                order: {
                    coin: 'ASC',
                    condition: 'ASC'
                }
            });
            

            res.status(200).json(alerts);
        }
    } 
    
    catch (error) {
        console.log("\nError fetching alerts:", error);
        res.status(500).json({ message: error.message });
    }
};



const addAlert = async (req, res) => {
    try {
        await alertRepo.save(req.body);
        await getAlerts({ query: { userId: req.body.userId, runningStatus: true}}, res ); 
    } 
    
    catch (error) {
        console.log("\nError adding alert:", error);
        error.message.includes('violates foreign key constraint') ? 
        res.status(500).json({message: 'Allow Notifications in your browser settings to Add alerts..!'}) :
        res.status(500).json({message: error.message});
    }
};



const editAlert = async (req, res) => {
    try {
        const alertToUpdate = await alertRepo.findOne({
            where: {
                alertId: req.query.alertId,
            },
        })

        if (!alertToUpdate) {
            res.status(404).json({message: 'Alert not found'});
        } 
        
        else {
            alertRepo.merge(alertToUpdate, req.body);
            await alertRepo.save(alertToUpdate);

            if(!res){
                return true;
            }
            else{
                await getAlerts({ query: { 
                    userId: req.body.userId, 
                    runningStatus: req.query.runningStatus
                }}, res );
            }
        }
    } 
    
    catch (error) {
        console.log("\nError Editing alert:", error);
        if(!res){
            return false;
        }
        else{
            res.status(500).json({message: error.message});
        }
    }
};



const deleteAlert = async (req, res) => {
    try {
        const alertToDelete = await alertRepo.findOne({
            where: {
                alertId: req.query.alertId,
            },
        })

        if (!alertToDelete) {
            res.status(404).json({message: 'Alert not found'});
        } 
        
        else {
            await alertRepo.remove(alertToDelete);

            await getAlerts({ 
                query: { 
                    userId: req.query.userId,
                    runningStatus: req.query.runningStatus
                }
            }, res );
        }
    } 
    
    catch (error) {
        console.log("\nError deleting alert:", error);
        res.status(500).json({message: error.message});
    }
};



const saveDeviceToken = async (req, res) => {
    try {        
        await dataSource.getRepository("DeviceToken").save(req.body);
        res.status(200).json({message: 'Device token saved successfully'});    
    } 
    
    catch (error) {
        console.log("\nError saving device token:", error);
        res.status(500).json({message: error.message});
    }
}




const sendNotification = async (req, res) => {
    try {
        const { userId, title, body, onClick, emailHeader, emailBody, attachments } = req.body;
        let { deviceToken, receiverEmail } = req.body;
        const type = req.params.type;


        if(( type !== 'push' && !emailBody ) || !title ){
            throw Object.assign(new Error('invalid request'), { status: 400 });
        }


        if(type !== 'email'){
            if(!deviceToken){
                if(!userId){
                    throw Object.assign(new Error('User ID not found'), { status: 404 });
                }

                const user = await dataSource
                    .getRepository("DeviceToken")
                    .findOne({where: {userId: userId} });

                deviceToken = !user ? null : user.deviceToken;
            }

            if(!deviceToken){
                throw Object.assign(new Error('Device Token not found'), { status: 404 });
            } else {
                sendPushNotification(deviceToken, title, body, onClick);
            }
        }


        if(type !== 'push'){
            if(!receiverEmail){
                if(!userId){
                    throw Object.assign(new Error('User ID not found'), { status: 404 });
                }

                receiverEmail = 'ashansalinda5@gmail.com'
            }

            if(!receiverEmail){
                throw Object.assign(new Error('Receiver Email Address not found'), { status: 404 });
            } else {
                sendEmailNotification(title, emailHeader, emailBody, receiverEmail, attachments);
            }
        }


        if(!res){
            return true;
        } else {
            res.status(200).json({message: 'Notification sent successfully'});
        }
        
    }

    catch (error) {
        console.log("Error sending notification:", error);

        if (!res) {
            throw error;
        } else {
            res.status(error.status || 500).json({message: error.message});
        }
    }
}




module.exports = {
    getAllRunningAlerts,
    getAlerts,
    addAlert,
    editAlert,
    deleteAlert,
    saveDeviceToken,
    sendNotification
};