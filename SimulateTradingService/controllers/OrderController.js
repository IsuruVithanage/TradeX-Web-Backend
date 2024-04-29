const dataSource = require("../config/config");

const getAllOrders = async (req, res) => {
    const orderRepo = dataSource.getRepository("Order");
    try {
        const orders = await orderRepo.find();
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const saveOrder = async (req, res) => {
    const orderRepo = dataSource.getRepository("Order");
    try {
        const orderSave = await orderRepo.save(req.body);
        res.json(orderSave);
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteOrder = async (req, res) => {
    const orderRepo = dataSource.getRepository("Order");
    const orderId = req.params.id;

    try {
        const orderToDelete = await orderRepo.findOne({
            where: {
                orderId: orderId,
            },
        });

        if (!orderToDelete) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await orderRepo.remove(orderToDelete);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllOrders,
    saveOrder,
    deleteOrder
};
