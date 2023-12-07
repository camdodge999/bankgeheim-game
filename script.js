// show the information for new players
const infoDisplay = () => {
    $('.user-button, .text, .user-number, .wiring:nth-child(n+2), .after, .after-btn, .game-settings ,.result').hide();
    $('.result,.user-number').children().remove();
    $('.game-info, .result:last-child,.user-number:first-child').show();
    $('.timer').html(`<span class='green'>IN</span> : <span class='green'>FO</span> . ~`);
    ['green', 'yellow', 'red'].forEach((color, index) => {
        createNElements('.result', `${2 * index}${2 * index + 1}`, color, 1);
    });
    ['green', 'yellow', 'red'].forEach((color, index) => {
        createNElements('.user-number', `${2 * index}${2 * index + 1}`, 'white', 1);
    });
}

// Time calculations for minutes, seconds and tenths of a second
const timeCalculation = (time) => {
    const minutes = (Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const seconds = (Math.floor((time % (1000 * 60)) / 1000)).toLocaleString('en-US', { minimumIntegerDigits: 2 });
    const onePerTenSeconds = Math.floor((time % (1000)) / 100);
    return {minutes,seconds,onePerTenSeconds};
}

// Set up a countdown timer with optional initial time
const countDownTimer = (timer = 30) => {

    // Set the absolute destination time for the timer to simulate a timeout, with 0.1s delay in the setInterval for display.
    const timerAbsolute = new Date().getTime() + 1000 * (timer + 0.1);
    var x = setInterval(function () {

        // Get current date time
        var now = new Date().getTime();

        // Calculate the remaining time until the timer reaches its destination
        var countDown = timerAbsolute - now;

        var {minutes,seconds,onePerTenSeconds} = timeCalculation(countDown);
        // when user joins info page or settings page.
        if (!isInfoSettings) {
            $('.timer').html(`<span class=green>${minutes} : ${seconds} . ${onePerTenSeconds} </span>`);
        } else { clearInterval(x) }


        // Trigger game events, such as timeout or when all digits are correct
        if (countDown <= 0 || countCorrect === 'ALL') {
            isTimeout = true;
            clearInterval(x);
            $('.after, .after-btn').show();
            $('.user-button, .left.set-button>#continue').hide();
            $('.user-number').children().remove();
            $('.text').find('h4:last').text(`${countCorrect} DIGITS`)

            // Game timeout
            if (countDown < 0) {
                createNElements('.user-number', 'GMOVER', 'red', 1)
                $('.timer').html(`<span class='red blink_me'>00 : 00 . 0</span>`);
                $('body').addClass('lose');
                $('.reveal').show();

            // User get all correct digits
            } else if (countCorrect === 'ALL') {
                if (isPureGuess) $('.result>span').addClass('green').removeClass('white');
                createNElements('.user-number', 'WINNER', 'green', 1);
                $('.timer').html(`<span class='blink_me green'>${minutes} : ${seconds} . ${onePerTenSeconds} </span>`);
                $('body').addClass('win');
                $("#retry, #reveal").hide();
            }
        }
    }, 100);
}

// show the setting page and retriving configuration into local machine
const gameSettings = () => {
    $('.user-button, .text, .user-number, .result, .wiring:nth-child(n+2), .after, .after-btn,.game-info').hide();
    $('.game-settings').show();
    $('.timer').html(`<span class='green'>SE</span> : <span class='green'>TU</span> . <span class='green'>P</span>`);
    $('form').on('submit', function (event) {
        const minutes = $("#minutes").val() ? parseInt($("#minutes").val()) : 0;
        const seconds = $("#seconds").val() ? parseInt($("#seconds").val()) : 0;
        localStorage.setItem('storeSettings', JSON.stringify({
            timer: minutes * 60 + seconds,
            assistingDigits: $("#assist-digits").val() ? parseInt($("#assist-digits").val()) : 0,
            isDuplicate: $("#duplicate-number:checked").length,
            isPureGuess: $("#pure-guess:checked").length
        }));

        alert('SETTING COMPLETED!');
    })
}

// Handles user interactions when clicking or pressing a number button
const ClickOrPress = (element, functionCallBack) => {
    const activeClass = 'is-pressed';

    // Keyboard event and numpad button animation
    $('body').on('keydown', function (event) {
        // Set button for resetting user input number
        if (['Backspace', '-', 'Delete'].includes(event.key)) event.key = 'Backspace';
        try {
            // Use animation and sends value into main game.
            $(`${element}#${event.key}`).addClass(activeClass);
            functionCallBack(event.key);
        } catch (e) {
            // Pass
        }
    }).on('keyup', function (event) {
        if (event.key === '-' || event.key === 'Delete') event.key = 'Backspace';
        try {
            // Remove animation button
            $(`${element}#${event.key}`).removeClass(activeClass);
        } catch (e) {
            // Pass
        }
    });

    // Mouse event and numpad button animation
    $(element).on('mousedown', function (event) {
        // Use animation and sends value into main game.
        $(this).addClass(activeClass);
        functionCallBack($(this).attr('id'));

    }).on('mouseup', function () {
        // Remove animation button
        $(this).removeClass(activeClass);
    });
}

// swapping between ~ array and number array
const reArrangeArray = (arrayInput) => {
    for (let index = 0; index < arrayInput.length; index++) {
        if (arrayInput[index] !== '~') {
            return ([...arrayInput.slice(index), ...arrayInput.slice(0, index)])
        }
    }
}

const checkAllNumber = (arrayInput) => {
    return arrayInput.every((digit) => Number.isInteger(parseInt(digit)))
}

// create span element from parent, which create digit of number on webpage
const createNElements = (elements, text, className = '', amountOfElements = 6) => {
    $(elements).append(Array(amountOfElements).fill(`<span class='${className}'>${text}</span>`).join(""));
}

// create random digit from random array
const gameStarter = (isDuplicate = false) => {
    // create new array 0 to 9 for pickup
    const number = new Array(10).fill('').map((_, index) => (index).toString());
    const arrayWinner = new Array(6).fill('0');
    arrayWinner.map((_, index) => {

        // pick up a random number from number array
        const indexRandom = Math.floor(Math.random() * number.length);
        arrayWinner[index] = number[indexRandom].toString();

        // If duplicate numbers are not allowed in the game settings,
        // remove the randomly selected number from the array.
        if (!isDuplicate) {
            number.splice(indexRandom, 1);
        }
    });
    console.log(arrayWinner);
    return arrayWinner;
}


// Evaluate and update the game logic based on the user's input digit.
// - For pure guessing mode, create a result element and return true if the digit matches the answer.
// - For standard mode, create a result element with color-coded feedback (green for correct position and digit,
//   yellow for correct digit but wrong position, red for incorrect digit), and return true if the digit is in the correct position.
const gameLogic = (digit, indexOfAnswer, arrayWinner) => {
    if (isPureGuess) {
        const color = 'white';
        createNElements('.result', digit, color, 1);
        return digit === arrayWinner[indexOfAnswer];
    }
    const color = (digit === arrayWinner[indexOfAnswer]) ? 'green' : (arrayWinner.includes(digit) ? 'yellow' : 'red');
    createNElements('.result', digit, color, 1);
    return color === 'green';
}


// reset all number and digits on webpage
const setBackSpace = (arrayInput) => {
    $('.user-number').children().remove();
    createNElements(".user-number", "~");
    arrayInput.map((digit, index) => {
        arrayInput[index] = '~';
    });
}

// Check if the user has joined the game for the first time and set default game settings in the local storage
if (!localStorage.getItem('storeSettings')) {
    infoDisplay();
    localStorage.setItem('storeSettings', JSON.stringify({
        timer: 30,
        assistingDigits: 0,
        isDuplicate: false,
        isPureGuess: false,
    }));
}

let { timer, assistingDigits, isDuplicate, isPureGuess } = JSON.parse(localStorage.getItem('storeSettings'));

// Initialize global variables for game state and user settings
let isTimeout = false; // Tracks whether the game has timed out
let countCorrect = 0; // Tracks the number of correct digits
let isInfoSettings = false;

// Set the corresponding values in the UI based on the retrieved settings
$("#seconds").val(timer % 60);
$("#minutes").val(Math.floor(timer / 60));
$("#assist-digits").val(assistingDigits);
$("#duplicate-number").prop('checked', isDuplicate);
$("#pure-guess").prop('checked', isPureGuess);


$('document').ready(function () {
    // Generate the winning array based on game settings
    const arrayWinner = gameStarter(isDuplicate);

    // Create an array containing the first 'assistingDigits' elements from the winning array
    const arrayAssist = arrayWinner.slice(0, assistingDigits);

    // Generate the final answer array with the remaining digits filled by '~'
    const arrayAnswer = (new Array(6 - assistingDigits).fill('~')).concat(arrayAssist);

    // Trigger flag for timer
    let trigger = false;

    if (assistingDigits) {
        arrayAnswer.forEach((digit, index) => {
            if (digit !== '~') $('.user-number').find(`span:nth-last-of-type(${12 - index - assistingDigits})`).html(`<span class="green">${digit}</span>`);
        });
    };

    // hide the endgame event
    $('.after, .after-btn').hide();

    $('.timer').html(`<span class=green>${Math.floor(timer/60).toLocaleString('en-US', { minimumIntegerDigits: 2 })} 
    : ${(timer%60).toLocaleString('en-US', { minimumIntegerDigits: 2 })} . ${0} </span>`);

    // let user find winner number after time out.
    $('.after-btn#retry').on('click', function () {
        isTimeout = false;
        setBackSpace(arrayAnswer);
        $('.after').hide();
        $('.left.set-button>#continue, .user-button').show();
    });

    // reveal the winner number after user cannot solve in time.
    $('#reveal').on('click', function () {
        $('.result').children().remove();
        createNElements('.result', arrayWinner.join(''), 'green', 1)
    });

    // goto settings page.
    $('#settings').on('click', function () {
        isInfoSettings = true;
        gameSettings();
    });

    // goto info page.
    $('#info').on('click', function () {
        isInfoSettings = true;
        infoDisplay();
    });

    //catching on press button or click button.
    ClickOrPress('button', (value) => {
        if (!isTimeout) {
            switch (value) {
                // clear all number which user input.
                case 'Backspace':
                    setBackSpace(arrayAnswer);
                    break;

                // sending answer and shows result. 
                case 'Enter':
                    if (checkAllNumber(arrayAnswer)) {
                        $('.result').children().remove();

                        countCorrect = 0;
                        arrayAnswer.map((digit, index) => {
                            countCorrect += gameLogic(digit, index, arrayWinner);
                        });
                        countCorrect = (countCorrect === arrayWinner.length) ? 'ALL' : countCorrect;
                    }
                    break;

                default:
                    // check input as a number and preventing overflow of digit 
                    if (/^[0-9]/.test(value) && !checkAllNumber(arrayAnswer)) {

                        // timer start when user input numbers
                        if (!trigger) {
                            trigger = true;
                            countDownTimer(timer);
                        }

                        // swapped position
                        arrayAnswer.push(value);
                        arrayAnswer.shift();
                        const newArrangeArray = reArrangeArray(arrayAnswer);

                        // inserting numbers into webpage
                        newArrangeArray.map((digit, index) => {
                            if (digit !== '~') $('.user-number').find(`span:nth-of-type(${index + 1})`).html(`<span class="white">${digit}</span>`);
                        });
                    };
            };
        };
    });
});
