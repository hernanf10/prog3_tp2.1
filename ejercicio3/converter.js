class Currency {
    constructor(code, name) {
        this.code = code;		
        this.name = name;	
    }
}
class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;		
        this.currencies = [];		
    }
    async getCurrencies() {
        try {
            const response = await fetch(`${this.apiUrl}/currencies`);	
            const data = await response.json();
            for (const code in data) {
                this.currencies.push(new Currency(code, data[code]));			
            }
        } catch (error) {	
            console.error("No se pudo obtener resultados", error);	
        }
    }
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency.code === toCurrency.code) {
            return amount;
        }
        try {
            const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);//
            const data = await response.json();
            return data.rates[toCurrency.code] * amount;
        } catch (error) {
            console.error("No se pudo realizar la conversion:", error);//
            return null;
        }
    }

}
document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");//
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");//
    const toCurrencySelect = document.getElementById("to-currency");
    const converter = new CurrencyConverter("https://api.frankfurter.app");//
    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value			
        );
        if (fromCurrency.code === toCurrency.code) {
            resultDiv.textContent = `El monto ingresado es: ${amount} ${fromCurrency.code}`;//
        } else {
            const convertedAmount = await converter.convertCurrency(
                amount,
                fromCurrency,
                toCurrency
            );
            if (convertedAmount !== null) {
                if (!isNaN(convertedAmount)) {
                    resultDiv.textContent = `${amount} ${fromCurrency.code} son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;//
                } else {
                    resultDiv.textContent = "Erro en tipo de dato.";
                }
            } else {
                resultDiv.textContent = "Error al realizar la conversión.";//
            }
        }
    });
    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");			
                option.value = currency.code;   
                option.textContent = `${currency.code} - ${currency.name}`;//
                selectElement.appendChild(option);
            });
        }
    }
});
