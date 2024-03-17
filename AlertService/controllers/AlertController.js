const dataSource = require("../config/config");
const alertRepo = dataSource.getRepository("Alert");

const getAllAlerts = async (req, res) => {
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
        const newAlert = await alertRepo.save(req.body);
        const updatedAlerts = await getAllAlerts({ 
            query: { 
                userId: req.body.userId,
                runningStatus: true
            }
        }, res );
        res.status(200).json(updatedAlerts);
        
    } 
    
    catch (error) {
        console.log("\nError adding alert:", error);
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

            const updatedAlerts = await getAllAlerts({ 
                query: { 
                    userId: req.body.userId,
                    runningStatus: req.query.runningStatus
                }
            }, res );

            res.status(200).json(updatedAlerts);
        }
    } 
    
    catch (error) {
        console.log("\nError edting alert:", error);
        res.status(500).json({message: error.message});
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

            const updatedAlerts = await getAllAlerts({ 
                query: { 
                    userId: req.query.userId,
                    runningStatus: req.query.runningStatus
                }
            }, res );

            res.status(200).json(updatedAlerts);
        }
    } 
    
    catch (error) {
        console.log("\nError deleting alert:", error);
        res.status(500).json({message: error.message});
    }
};


module.exports = {
    getAllAlerts,
    addAlert,
    editAlert,
    deleteAlert
};