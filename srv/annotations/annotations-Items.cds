using {SalesOrders.Items as Items} from '../service';

annotate Items with @UI.PresentationVariant: {
    Visualizations: ['@UI.LineItem'],
    SortOrder     : [{
        $Type     : 'Common.SortOrderType',
        Property  : itemID,
        Descending: false
    }]
};

annotate Items with {
    itemID           @title: 'ID'               @Common.FieldControl: #Mandatory;
    name             @title: 'Name';
    description      @title: 'Description';
    releaseDate      @title: 'Release date';
    discontinuedDate @title: 'Discontinued date';
    price            @title: 'Price';
    height           @title: 'Height'           @Measures.Unit      : unitOfMeasure_unitCode;
    width            @title: 'Width'            @Measures.Unit      : unitOfMeasure_unitCode;
    depth            @title: 'Depth';
    quantity         @title: 'Quantity';
    unitOfMeasure    @title: 'Unit of measure'  @Common.IsUnit;
};

annotate Items with {
    unitOfMeasure @Common: {ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'UnitOfMeasure_VH',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: unitOfMeasure_unitCode,
                ValueListProperty: 'unitCode'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'unitISOCode'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'dimensionID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'dimension'
            }
        ]
    }};
};

annotate Items with @(UI.HeaderInfo: {
    $Type         : 'UI.HeaderInfoType',
    TypeName      : 'Item',
    TypeNamePlural: 'Items',
    Title         : {
        $Type: 'UI.DataField',
        Value: itemID,
    },
});

annotate Items with @(UI.Facets: [{
    $Type : 'UI.ReferenceFacet',
    Target: @UI.FieldGroup #FG_Body,
    Label : 'Item'
}]);

annotate Items with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: itemID,
    },
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: description,
    },
    {
        $Type: 'UI.DataField',
        Value: releaseDate,
    },
    {
        $Type: 'UI.DataField',
        Value: discontinuedDate,
    },
    {
        $Type: 'UI.DataField',
        Value: price,
    },
    {
        $Type: 'UI.DataField',
        Value: height,
    },
    {
        $Type: 'UI.DataField',
        Value: width,
    },
    {
        $Type: 'UI.DataField',
        Value: depth,
    },
    {
        $Type: 'UI.DataField',
        Value: quantity,
    }
]);

annotate Items with @(UI.FieldGroup #FG_Body: {
    $Type: 'UI.FieldGroupType',
    Data : [
        {
            $Type: 'UI.DataField',
            Value: itemID,
        },
        {
            $Type: 'UI.DataField',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Value: description,
        },
        {
            $Type: 'UI.DataField',
            Value: releaseDate,
        },
        {
            $Type: 'UI.DataField',
            Value: discontinuedDate,
        },
        {
            $Type: 'UI.DataField',
            Value: price,
        },
        {
            $Type: 'UI.DataField',
            Value: height,
        },
        {
            $Type: 'UI.DataField',
            Value: width,
        },
        {
            $Type: 'UI.DataField',
            Value: depth,
        },
        {
            $Type: 'UI.DataField',
            Value: quantity,
        }
    ]
});
