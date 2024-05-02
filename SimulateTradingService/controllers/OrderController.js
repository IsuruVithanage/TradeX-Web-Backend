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

const getAllOrdersByType = async (type, orderStatus) => {
    try {
        const OrderRepo = dataSource.getRepository("Order");
        const orders = await OrderRepo.find({ where: { type: type, orderStatus: orderStatus } });
        return orders;
    } catch (error) {
        console.error(`Error fetching ${type} orders with status ${orderStatus}:`, error);
        throw error;
    }
};

const getAllLimitOrdersByCoin = async (req, res) => {
    try {
        const coin = req.params.coin;
        const userId = req.params.userId;
        const OrderRepo = dataSource.getRepository("Order");
        const orders=await OrderRepo.find({where: {coin: coin, userId: userId, type: 'Limit', orderStatus: 'Pending'}});
        res.json(orders);
    } catch (error) {
        console.error(`Error fetching orders:`, error);
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

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const OrderRepo = dataSource.getRepository("Order");
        const order= await OrderRepo.findOne({
            where: {
                orderId: orderId,
            },
        });

        if (!order) {
            console.error(`Order with ID ${orderId} not found.`);
            return;
        }

        order.orderStatus = newStatus;
        await OrderRepo.save(order);
        console.log(`Order ${orderId} status updated to '${newStatus}'`);
    } catch (error) {
        console.error(`Error updating order status for order ${orderId}:`, error);
        throw error;
    }
};


const deleteOrder = async (req, res) => {
    const orderRepo = dataSource.getRepository("Order");
    const orderId = req.params.orderId;

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
    deleteOrder,
    getAllOrdersByType,
    updateOrderStatus,
    getAllLimitOrdersByCoin
};
