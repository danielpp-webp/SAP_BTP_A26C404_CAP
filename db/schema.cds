namespace entities;

using {
    cuid,
    managed,
    sap.common.CodeList
} from '@sap/cds/common';

entity Orders : cuid, managed {
    orderID            : String(36);
    email              : String(30);
    firstName          : String(30);
    lastName           : String(30);
    country            : Association to Country_VH;
    createdOn          : Date;
    deliveryDate       : DateTime;
    orderStatus        : Association to OrderStatus_VH;
    imageURL           : String;
    virtual imageThumb : String; // Virtual element
    toItems            : Composition of many Items
                             on toItems.orderUUID = $self;
}

entity Items : cuid {
    itemID           : String(36);
    orderUUID        : Association to Orders;
    name             : String(40);
    description      : String(40);
    releaseDate      : Date;
    discontinuedDate : Date;
    price            : Decimal(12, 2);
    height           : Decimal(15, 3);
    width            : Decimal(13, 3);
    depth            : Decimal(12, 2);
    quantity         : Decimal(16, 2);
    unitOfMeasure    : Association to UnitOfMeasure_VH;
}

entity Country_VH : CodeList {
    key countryTwoLetterISOCode   : String(3);
        countryThreeLetterISOCode : String(3);
        countryThreeDigitISOCode  : String(3);
}

entity OrderStatus_VH : CodeList {
    key code : UInt8;
}

entity UnitOfMeasure_VH : CodeList {
    key unitCode    : String(3);
        dimensionID : String(7);
        dimension   : String(20);
        unitISOCode : String(3);
}
