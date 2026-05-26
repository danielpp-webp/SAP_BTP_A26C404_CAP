const { ApplicationService } = require('@sap/cds');
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

const toNum = (numString) => {
    // Convert string to number
    const num = parseInt(numString, 10);
    return Number.isFinite(num) ? num : 0;
}

const setInitOrderData = async (Orders, req) => {
    if (!Orders || !req) return;

    // Get max orderID from persisted and draft tables
    const [persisted, draft] = await Promise.all([
        SELECT.one.from(Orders).columns('max(orderID) as maxID'),
        SELECT.one.from(Orders.drafts).columns('max(orderID) as maxID')
    ]);

    // Get the next ID -> Largest value between persisted and draft tables + 1
    const nextID = Math.max(toNum(persisted?.maxID), toNum(draft?.maxID)) + 1;

    req.data.orderID = String(nextID); // Set next ID
    req.data.createdOn = new Date(); // Set creation date to today
    req.data.orderStatus_code = 0; // Set orderstatus code to 0 -> Open
};

const setInitItemData = async (Items, req) => {
    if (!Items || !req) return;

    // Get max itemID from persisted and draft tables
    const [persisted, draft] = await Promise.all([
        SELECT.one.from(Items).columns('max(itemID) as maxID').where({ orderUUID_ID: req.data.orderUUID_ID }),
        SELECT.one.from(Items.drafts).columns('max(itemID) as maxID').where({ orderUUID_ID: req.data.orderUUID_ID })
    ]);

    console.log(req.data.orderUUID_ID);
    console.log(persisted);
    console.log(draft);

    // Get the next ID -> Largest value between persisted and draft tables + 1
    const nextID = Math.max(toNum(persisted?.maxID), toNum(draft?.maxID)) + 1;

    console.log(nextID);
    req.data.itemID = String(nextID); // Set next ID
};

const setEmailToLowerCase = (req) => {
    if (req.data.email) req.data.email = req.data.email.toLowerCase();
}

const validateOrder = async (Orders, req) => {
    // Validate orderID
    await validateOrderID(Orders, req);

    // Validate email
    await validateEmail(req);

    // Validate delivery date
    validateDeliveryDate(req);

    // Validate itemsID
    validateItemsID(req);
}

const validateOrderID = async (Orders, req) => {
    if (!Orders || !req) return;

    // Check if an order with this ID already exists
    const orderID = req.data.orderID.toUpperCase();

    let orderIDExist;
    if (req.event === 'CREATE') {
        orderIDExist = await SELECT.one.from(Orders).where(`UPPER(orderID) = '${orderID}'`);
    } else if (req.event === 'UPDATE') {
        orderIDExist = await SELECT.one.from(Orders).where(`UPPER(orderID) = '${orderID}'`).and({ ID: { '!=': req.data.ID } });
    }
    if (orderIDExist) {
        // Throw an error
        req.error(400, `ID ${orderID} already exists`);
    }
};

const validateEmail = async (Orders, req) => {
    if (!Orders || !req) return;

    // Check if email already exists
    const email = req.data.email.toLowerCase();

    let emailExist;
    if (req.event === 'CREATE') {
        emailExist = await SELECT.one.from(Orders).where(`LOWER(email) = '${email}'`);
    } else if (req.event === 'UPDATE') {
        emailExist = await SELECT.one.from(Orders).where(`LOWER(email) = '${email}'`).and({ ID: { '!=': req.data.ID } });
    }
    if (emailExist) {
        // Throw an error
        req.error(400, `Email ${email} already exists`);
        return;
    }

    // Check email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
        // Throw an error
        req.error(400, `Invalid email format: ${email}\nPlease use the following (e.g., name@example.com)`);
        // return;
    }
};

const validateDeliveryDate = (req) => {
    // Validate only if was filled
    if (req.data.deliveryDate) {
        const created = new Date(req.data.createdOn);
        const delivery = new Date(req.data.deliveryDate);
        if (delivery < created) {
            // Throw an error
            req.error(400, 'Delivery date cannot be before creation date');
        }
    }
};

const validateItemsID = (req) => {
  if (!req) return;

  const itemsID = req.data.toItems.map(item => item.itemID?.toUpperCase());
  const seen = new Set();

  console.log(itemsID);

  for (const id of itemsID) {
    if (seen.has(id)) {
      req.error(400, `Duplicate Item ID found: ${id}`);
      return;
    }
    seen.add(id);
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

        return super.init();
    }
}