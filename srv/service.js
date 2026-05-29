const { ApplicationService } = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

const setInitOrderData = async (Orders, req) => {
    if (!Orders || !req?.data) return;

    // Get max orderID from persisted and draft tables
    const [persisted, draft] = await Promise.all([
        SELECT.one.
            from(Orders).
            columns('max(orderID) as maxID'),
        SELECT.one.
            from(Orders.drafts).
            columns('max(orderID) as maxID')
    ]);

    // Get the next ID -> Largest value between persisted and draft tables + 1
    const nextID = Math.max(persisted?.maxID, draft?.maxID) + 1;

    req.data.orderID = String(nextID); // Set next ID
    req.data.createdOn = new Date(); // Set creation date to today
    req.data.orderStatus_code = 0; // Set orderstatus code to 0 -> Open
};

const setInitItemData = async (Items, req) => {
    if (!Items || !req?.data?.orderUUID_ID) return;

    // Get max itemID from persisted and draft tables
    const [persisted, draft] = await Promise.all([
        SELECT.one.
            from(Items).
            columns('max(itemID) as maxID').
            where({ orderUUID_ID: req.data.orderUUID_ID }),
        SELECT.one.
            from(Items.drafts).
            columns('max(itemID) as maxID').
            where({ orderUUID_ID: req.data.orderUUID_ID })
    ]);

    // Get the next ID -> Largest value between persisted and draft tables + 1
    const nextID = Math.max(persisted?.maxID, draft?.maxID) + 1;

    req.data.itemID = String(nextID); // Set next ID
};

const setEmailToLowerCase = (req) => {
    if (!req?.data?.email) return;
    req.data.email = req.data.email.toLowerCase(); // Set email to lower case
}

const validateOrder = async (Orders, req) => {
    // Validate orderID
    await validateOrderID(Orders, req);

    // Validate email
    await validateEmail(Orders, req);

    // Validate delivery date
    await validateDeliveryDate(Orders, req);

    // Validate itemsID
    validateItemsID(req);
}

const validateOrderID = async (Orders, req) => {
    if (!Orders || req?.data?.orderID === undefined || !req?.data?.ID) return;

    if (req.data.orderID === null) {
        // Throw an error
        req.error({
            code: 400,
            message: 'Please enter an ID',
            target: 'orderID'
        });
        return;
    }

    // Check if an order with this ID already exists
    const Order = await
        SELECT.one.
            from(Orders).
            where(`orderID = '${req.data.orderID}'`).
            and({ ID: { '!=': req.data.ID } }); // Exclude self
    if (Order) {
        // Throw an error
        req.error({
            code: 400,
            message: `ID ${req.data.orderID} already exists`,
            target: 'orderID'
        });
    }
};

const validateEmail = async (Orders, req) => {
    if (!Orders || req?.data?.email === undefined || !req?.data?.ID) return;

    if (req.data.email === null) {
        // Throw an error
        req.error({
            code: 400,
            message: 'Please enter an email address',
            target: 'email'
        });
        return;
    }

    // Check if an order with this email already exists
    const email = req.data.email.toLowerCase();
    const Order = await
        SELECT.one.
            from(Orders).
            where(`LOWER(email) = '${email}'`).
            and({ ID: { '!=': req.data.ID } });
    if (Order) {
        // Throw an error
        req.error({
            code: 400,
            message: `Email ${email} already exists`,
            target: 'email'
        });
        return;
    }

    // Check email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
        // Throw an error
        req.error({
            code: 400,
            message: `Invalid email format: ${email}\nPlease use the following (e.g., name@example.com)`,
            target: 'email'
        });
    }
};

const validateDeliveryDate = async (Orders, req) => {
    if (!Orders || !req?.data?.deliveryDate || (!req?.data?.createdOn && !req?.data?.ID)) return;

    const delivery = new Date(req.data.deliveryDate);
    let created;

    if (!req.data.createdOn) {
        // Fetch the createdOn value
        const Order = await
            SELECT.one.
                from(Orders.drafts).
                columns('createdOn').
                where({ ID: req.data.ID });
        created = new Date(Order.createdOn);
    } else {
        created = new Date(req.data.createdOn);
    }

    // Validate delivery date doesn't precede creation date
    if (delivery < created) {
        // Throw an error
        req.error({
            code: 400,
            message: 'Delivery date cannot be before creation date',
            target: 'deliveryDate'
        });
    }
};

const validateItemsID = (req) => {
    if (!req?.data?.toItems) return;

    const itemsID = req.data.toItems.map(item => item.itemID);
    const seen = new Set();

    for (const [index, itemID] of itemsID.entries()) {
        if (itemID === null) {
            // Throw an error
            req.error({
                code: 400,
                message: 'Please enter an ID',
                target: `toItems(ID=${req.data.toItems[index].ID})/itemID`
            });
            return;
        }
        if (seen.has(itemID)) {
            // Throw an error
            req.error({
                code: 400,
                message: `Item ID ${itemID} already exist`,
                target: `toItems(ID=${req.data.toItems[index].ID})/itemID`
            });
            return;
        }
        seen.add(itemID);
    }
};

const validateItem = async (Items, req) => {
    // Validate itemID
    await validateItemID(Items, req);

    // Validate discontinuedDate
    await validateDiscontinuedDate(Items, req);
};

const validateItemID = async (Items, req) => {
    if (!req?.data?.orderUUID_ID || req?.data?.itemID === undefined || !req?.data?.ID ) return;

    if (req.data.itemID === null) {
        // Throw an error
        req.error({
            code: 400,
            message: 'Please enter an ID',
            target: 'itemID'
        });
        return;
    }

    // Check if an item with this ID already exists
    const Item = await
        SELECT.one.
            from(Items.drafts).
            where({ itemID: req.data.itemID }).
                and({ orderUUID_ID: req.data.orderUUID_ID }).
                and({ ID: { '!=': req.data.ID } }); // Exclude self
    if (Item) {
        // Throw an error
        req.error({
            code: 400,
            message: `Item ID ${req.data.itemID} already exist`,
            target: 'itemID'
        });
        return;
    }
};

const validateDiscontinuedDate = async (Items, req) => {
    if (!Items || (!req?.data?.releaseDate && !req?.data?.discontinuedDate)) return;

    let Item, release, discontinued;
    if (!req.data.releaseDate) {
        // Fetch the releaseDate value
        Item = await
            SELECT.one.
                from(Items.drafts).
                columns('releaseDate').
                where({ ID: req.data.ID });
        release = new Date(Item.releaseDate);
    } else {
        release = new Date(req.data.releaseDate);
    }
    if (!req.data.discontinuedDate) {
        // Fetch the discontinuedDate value
        Item = await
            SELECT.one.
                from(Items.drafts).
                columns('discontinuedDate').
                where({ ID: req.data.ID });
        if (!Item.discontinuedDate){
            return;
        }        
        discontinued = new Date(Item.discontinuedDate);
    } else {
        discontinued = new Date(req.data.discontinuedDate);
    }

    // Validate discontinued date doesn't precede release date
    if (discontinued < release) {
        // Throw an error
        req.error({
            code: 400,
            message: 'Discontinued date cannot be before release date',
            target: 'discontinuedDate'
        });
    }
};

module.exports = class SalesOrders extends ApplicationService {
    init() {
        const { Orders } = this.entities;
        const { Items } = this.entities;

        // Before reading a list of orders
        this.after('READ', Orders, async (orders) => {
            orders.forEach((order) => {
                // Set value of image URL to imageThumb
                order.imageThumb = order.imageURL;
            });
        });

        // Before creating a new order (draft)
        this.before('NEW', Orders.drafts, async (req) => {
            await setInitOrderData(Orders, req);
        });

        // Before creating a new order
        this.before('CREATE', Orders, async (req) => {
            console.log(req.data);
            // Set email to lower case
            setEmailToLowerCase(req);

            // Validate order
            validateOrder(Orders, req);
        });

        // Before updating an existing order (draft)
        this.before('UPDATE', Orders.drafts, async (req) => {
            console.log(req.data);
            // Set email to lower case
            setEmailToLowerCase(req);

            // Validate order
            validateOrder(Orders, req);
        });

        // Before updating an existing order
        this.before('UPDATE', Orders, async (req) => {
            // Set email to lower case
            setEmailToLowerCase(req);

            // Validate order
            validateOrder(Orders, req);
        });

        // Before creating an item
        this.before('NEW', Items.drafts, async (req) => {
            await setInitItemData(Items, req);
        });

        this.before('UPDATE', Items.drafts, async (req) => {
            console.log(req.data);
            // Validate item
            validateItem(Items, req);
        });

        return super.init();
    }
}