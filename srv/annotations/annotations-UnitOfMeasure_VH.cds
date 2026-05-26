using {SalesOrders.UnitOfMeasure_VH as UnitOfMeasure_VH} from '../service';

annotate UnitOfMeasure_VH with {
    unitCode    @title: 'Unit code';
    name        @title: 'Unit';
    unitISOCode @title: 'Unit ISO code';
    dimensionID @title: 'Dimension ID';
    dimension   @title: 'Dimension';
}
