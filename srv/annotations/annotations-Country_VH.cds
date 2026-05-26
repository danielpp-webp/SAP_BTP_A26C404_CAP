using {SalesOrders.Country_VH as Country_VH} from '../service';

annotate Country_VH with {
    countryTwoLetterISOCode   @title: 'Two letter ISO code';
    name                      @title: 'Country';
    countryThreeLetterISOCode @title: 'Three letter ISO code';
    countryThreeDigitISOCode  @title: 'Three digit ISO code';
}
