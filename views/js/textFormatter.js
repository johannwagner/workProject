/**
 * Created by johann on 22.06.17.
 */

/*
 This Module should reformat IBAN, BIC, Times and Sums on type.
 */

let formatListener = function (name, spacingLetterIndex, spacingLetterArray, spacingLetter) {
    $("#" + name).focusout(function () {
        let modStringArray = document.getElementById(name).value.split('');
        let newString = "";

        //console.log(modStringArray.length);

        let counter = 0;
        for (let index in modStringArray) {
            let char = modStringArray[index];
            if (char === ' ' || char === spacingLetter) {
                continue;
            }

            //console.log(char);

            counter++;

            if ((spacingLetterIndex && counter % spacingLetterIndex === 0) || spacingLetterArray && spacingLetterArray.includes(counter)) {
                newString += char + spacingLetter;
            } else {
                newString += char;
            }
        }


        document.getElementById(name).value = newString;

    });
};

formatListener('ibanInput', 4, null, ' ');
formatListener('taxNumberInput', null, ' ');
formatListener('timeInput1', null, [2], ':');