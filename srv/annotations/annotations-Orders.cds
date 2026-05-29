using {SalesOrders.Orders as Orders} from '../service';
using from './annotations-Items';

annotate Orders with @odata.draft.enabled;

annotate Orders with @UI.PresentationVariant: {
    Visualizations: ['@UI.LineItem'],
    RequestAtLeast: ['imageURL'],
    SortOrder     : [{
        $Type     : 'Common.SortOrderType',
        Property  : orderID,
        Descending: false
    }]
};

annotate Orders with {
    orderID      @title: 'ID'            @Common.FieldControl: {$edmJson: {$If: [
        {$Eq: [
            {$Path: 'HasActiveEntity'},
            false
        ]},
        7, // Mandatory
        1  // Read-only
    ]}};
    email        @title: 'Email'         @Common.FieldControl: #Mandatory;
    firstName    @title: 'First name';
    lastName     @title: 'Last name';
    country      @title: 'Country';
    createdOn    @title: 'Created on'    @Common.FieldControl: #ReadOnly;
    deliveryDate @title: 'Delivery date';
    orderStatus  @title: 'Order status'  @Common.FieldControl: {$edmJson: {$If: [
        {$Eq: [
            {$Path: 'HasActiveEntity'},
            false
        ]},
        1, // Read-only
        3  // Optional
    ]}};
    imageURL     @title: 'Image'         @Common.FieldControl: {$edmJson: {$If: [
        {$Eq: [
            {$Path: 'HasActiveEntity'},
            false
        ]},
        3, // Optional
        1  // Read-only
    ]}};
    imageThumb   @title: 'Image'         @UI.IsImageURL;
};

annotate Orders with {
    country     @Common: {
        Text     : country.name,
        ValueList: {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Country_VH',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: country_countryTwoLetterISOCode,
                    ValueListProperty: 'countryTwoLetterISOCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'countryThreeLetterISOCode'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'countryThreeDigitISOCode'
                }
            ]
        }
    };
    orderStatus @Common: {
        Text           : orderStatus.name,
        TextArrangement: #TextOnly,
        ValueList      : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'OrderStatus_VH',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: orderStatus_code,
                    ValueListProperty: 'code'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                }
            ]
        }
    };
};

annotate Orders with @UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Order',
    TypeNamePlural: 'Orders',
    Title         : {
        $Type: 'UI.DataField',
        Value: orderID
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: orderStatus_code
    },
    ImageUrl      : imageURL
};

annotate Orders with @UI.Facets: [
    {
        $Type : 'UI.ReferenceFacet',
        Target: @UI.FieldGroup #FG_Body,
        Label : 'Order'
    },
    {
        $Type : 'UI.ReferenceFacet',
        Target: 'toItems/@UI.LineItem',
        Label : 'Items'
    }
];

annotate Orders with @UI.LineItem: [
    {
        $Type         : 'UI.DataField',
        Value         : orderID,
        @UI.Importance: #High
    },
    {
        $Type         : 'UI.DataField',
        Value         : email,
        @UI.Importance: #High
    },
    {
        $Type         : 'UI.DataField',
        Value         : firstName,
        @UI.Importance: #High
    },
    {
        $Type         : 'UI.DataField',
        Value         : lastName,
        @UI.Importance: #High
    },
    {
        $Type         : 'UI.DataField',
        Value         : country_countryTwoLetterISOCode,
        @UI.Importance: #Medium
    },
    {
        $Type         : 'UI.DataField',
        Value         : createdOn,
        @UI.Importance: #Medium
    },
    {
        $Type         : 'UI.DataField',
        Value         : deliveryDate,
        @UI.Importance: #Medium
    },
    {
        $Type         : 'UI.DataField',
        Value         : orderStatus_code,
        @UI.Importance: #High
    },
    {
        $Type: 'UI.DataField',
        Value: imageURL,
        @UI.Hidden
    },
    {
        $Type         : 'UI.DataField',
        Value         : imageThumb,
        @UI.Importance: #High
    }
];

annotate Orders with @UI.FieldGroup #FG_Body: {
    $Type: 'UI.FieldGroupType',
    Data : [
        {
            $Type: 'UI.DataField',
            Value: orderID
        },
        {
            $Type: 'UI.DataField',
            Value: email
        },
        {
            $Type: 'UI.DataField',
            Value: firstName
        },
        {
            $Type: 'UI.DataField',
            Value: lastName
        },
        {
            $Type: 'UI.DataField',
            Value: country_countryTwoLetterISOCode
        },
        {
            $Type: 'UI.DataField',
            Value: createdOn
        },
        {
            $Type: 'UI.DataField',
            Value: deliveryDate
        },
        {
            $Type: 'UI.DataField',
            Value: orderStatus_code
        },
        {
            $Type: 'UI.DataField',
            Value: imageURL
        }
    ]
};
