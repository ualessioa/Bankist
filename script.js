"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// const account1 = {
//   owner: "Jonas Schmedtmann",
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: "Jessica Davis",
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: "Steven Thomas Williams",
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: "Sarah Smith",
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2023-02-10T17:01:17.194Z",
    "2023-02-12T23:36:17.929Z",
    "2023-02-13T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//functions
function startLogOutTimer() {
  let time = 300;

  function tick() {
    let min = String(Math.trunc(time / 60)).padStart(2, "0");
    let sec = String(time % 60).padStart(2, "0");
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  }

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

function formatMovementDate(date, locale) {
  let retStr = "";
  const deltaDays = Math.round(
    Math.abs(new Date() - date) / (1000 * 60 * 60 * 24)
  );

  if (deltaDays === 0) {
    retStr = `Today`;
  } else if (deltaDays === 1) {
    retStr = `Yesterday`;
  } else if (deltaDays <= 7) {
    retStr = `${deltaDays} days ago`;
  } else {
    retStr = new Intl.DateTimeFormat(locale).format(date);
  }

  return retStr;
}

function formatCurr(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

//update ui
function updateUI() {
  displayMovements(currentAccount);
  calcDisplaySummary(currentAccount);
  calcDisplayBalance(currentAccount);
}

// display movements
// remember not to call functions with global data

function displayMovements(account, sort = false) {
  containerMovements.innerHTML = "";
  // slice to have a shallow copy to be sorted
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach((movement, index) => {
    const movDate = new Date(account.movementsDates[index]);
    const moveType = movement > 0 ? `deposit` : `withdrawal`;
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${moveType}">${
      index + 1
    } ${moveType}</div>
    <div class="movements__date">${formatMovementDate(
      movDate,
      account.locale
    )}</div>
    <div class="movements__value">${formatCurr(
      movement,
      account.locale,
      account.currency
    )}</div>
  </div>`;

    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
}

// generate username
// map because we want a new string without modifying the original one
function createUsernames(account) {
  account.username = account.owner
    .toLowerCase()
    .split(" ")
    .map((word) => word[0])
    .join("");
}

//foreach with callbackfn because we want to mutate accounts
accounts.forEach(createUsernames);
// console.log(accounts);

// calc and print balance

function calcDisplayBalance(account) {
  account.balance = account.movements.reduce(
    (acc, movement) => (acc += movement),
    0
  );
  labelBalance.textContent = formatCurr(
    account.balance,
    account.locale,
    account.currency
  );
}

// calc and display summary

function calcDisplaySummary(account) {
  const incomes = account.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => (acc += mov), 0);
  labelSumIn.textContent = formatCurr(
    incomes,
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => (acc += mov), 0);
  labelSumOut.textContent = formatCurr(
    Math.abs(out),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((mov) => mov * (account.interestRate / 100))
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => (acc += int), 0)
    .toFixed(2);
  labelSumInterest.textContent = formatCurr(
    interest,
    account.locale,
    account.currency
  );
}

// event handler
// defining a variable in the global scope so that i can have access to it in other cases

let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  // prevents form button to sumbit
  e.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  //optional chaining to check if currentAccount is undefined
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display ui and welcome msg
    // calc and display balance. summary and movements

    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }!`;

    containerApp.style.opacity = "1";

    let now = new Date();

    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    setInterval(function () {
      let now = new Date();
      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);
    }, 60000);

    // const day = String(now.getDate()).padStart(2, "0");
    // const month = String(now.getMonth() + 1).padStart(2, "0");
    // const year = String(now.getFullYear());
    // const hour = String(now.getHours()).padStart(2, "0");
    // const min = String(now.getMinutes()).padStart(2, "0");

    //clear input fields
    inputLoginPin.value = inputLoginUsername.value = "";
    //take away focus
    inputLoginPin.blur();

    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();
    updateUI();
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const recAcc = accounts.find((acc) => acc.username === inputTransferTo.value);
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferAmount.blur();
  inputTransferTo.blur();

  if (
    amount > 0 &&
    recAcc &&
    currentAccount.balance >= amount &&
    recAcc.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    recAcc.movements.push(amount);
    recAcc.movementsDates.push(new Date().toISOString());

    clearInterval(timer);
    timer = startLogOutTimer();

    updateUI();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.ceil(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    inputLoanAmount.value = "";
    inputLoanAmount.blur();
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      clearInterval(timer);
      timer = startLogOutTimer();
      updateUI();
    }, 2500);
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    accounts.splice(
      accounts.findIndex((acc) => acc.username === currentAccount.username),
      1
    );
    containerApp.style.opacity = "0";
  }
  inputCloseUsername.value = inputClosePin.value = "";
  inputCloseUsername.blur();
  inputClosePin.blur();
});

let isSorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !isSorted);
  isSorted = !isSorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ["USD", "United States dollar"],
//   ["EUR", "Euro"],
//   ["GBP", "Pound sterling"],
// ]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

//chiamando il metodo slice su di un array posso crearne una shallow copy
// tecnica di shallow copy buona perche' permette il concatenare di altri metodi consecutivamente

// let arr1 = [`c`, `i`, `a`, `o`];

// let arr2 = arr1.slice();

// console.log(arr1 === arr2);
//false! perche' una copia

//splice molto simile a slice ma modifica la variabile originale, non crea copie
// si usa per eliminare elementi piu' comunemente l'ultimo elemento

// es2022 aggiunge metodo at, sostituisce la bracket notation [] ed in piu' e' compatibile con indici negativi per partire dalla fine dell'array
// metodo funzionante anche con stringhe
// const arr = [23, 11, 58];

// console.log(arr.at(-1));

///forEach metodo che permette di loopare array ed altri iterabili
// un grande vantaggio e' che fornisce l'indice nativamente che puo' essere utilizzato come contatore
// continue e break NON FUNZIONANO
// diversi dati ottenibili dai vari iterabili
// (movement, index, array) array
// (value, key, map) map
// (value, key, set) set   value === key

// movements.forEach(function (movement, index, array) {
//   console.log(movement);
//   console.log(index);
//   console.log(array);
// });

// Coding Challenge #1
// Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). For now, they are just interested in knowing whether a dog is an adult or a puppy.
// A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.
// Your tasks:
// Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:
// 1. Juliafoundoutthattheownersofthefirstandthelasttwodogsactuallyhave cats, not dogs! So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
// 2. CreateanarraywithbothJulia's(corrected)andKate'sdata
// 3. Foreachremainingdog,logtotheconsolewhetherit'sanadult("Dognumber1
// is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy   ")
// 4. Runthefunctionforbothtestdatasets
// Test data:
// § Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3] § Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]
// Hints: Use tools from all lectures in this section so far 😉 GOOD LUCK 😀

// function checkDogs(dogsJulia, dogsKate) {
//1 shallow copy with elements removed
// let onlyDogsJulia = dogsJulia.slice(1, -2);

//2 merge 2 arrays in 1
// let dogs = [...onlyDogsJulia, ...dogsKate];

//3
//   dogs.forEach((dog, index) => {
//     console.log(
//       `Dog number ${index + 1} ` +
//         `${
//           dog >= 3 ? `is an adult, and is ${dog} years old` : `is still a puppy`
//         }`
//     );
//   });
// }

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
// checkDogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);

//lecture 150

// map methods loop over each element of an array, applies a callback fn and adds the results of every function call to a new array that at the end returns
// can access element, index, array

// const euroToUsd = 1.1;

// const converted = movements.map((movement) =>
//   (movement * euroToUsd).toFixed(2)
// );

// console.log(converted);

//lecture 152
// filter methods loop over each element of an array, check the result of a callback fn and if the condition is met adds the the value to a new array that at the end returns
// so we return a boolean in the callback
// can access element, index, array
// const deposits = movements.filter(function (movement, index, array) {
// return movement > 0;
// });

//with arrow function
// const withdrawals = movements.filter((movement) => movement < 0);

// console.log(deposits);
// console.log(withdrawals);

// lecture 153
// reduce methods loop over each element of an array and using a function reduces all of the values of the array to one value then this gets returned
// can access  to currentValue, currentIndex, array

// const total = movements.reduce(function (acc, movement) {
//   return (acc += movement);
// }, 0);

// console.log(total);

// max value with reduce

// const max = movements.reduce((acc, movement) => {
//   if (movement > acc) {
//     acc = movement;
//   }
//   return acc;
// }, movements[0]);

// console.log(max);

// Coding Challenge #2
// Let's go back to Julia and Kate's study about dogs. This time, they want to convert dog ages to human ages and calculate the average age of the dogs in their study.
// Your tasks:
// Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:
// 1. Calculatethedogageinhumanyearsusingthefollowingformula:ifthedogis <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old, humanAge = 16 + dogAge * 4
// 2. Excludealldogsthatarelessthan18humanyearsold(whichisthesameas keeping dogs that are at least 18 years old)
// 3. Calculatetheaveragehumanageofalladultdogs(youshouldalreadyknow from other challenges how we calculate averages 😉)
// 4. Runthefunctionforbothtestdatasets
// Test data:
// § Data1:[5,2,4,1,15,8,3] § Data2:[16,6,10,5,6,1,4]
// GOOD LUCK 😀

// function calcAverageHumanAge(ages) {
//   1;
//   let humanAges = ages.map((age) => (age > 2 ? 16 + age * 4 : age * 2));

//   //2
//   let adultDogs = humanAges.filter((age) => age >= 18);

//   3;
//   let avgAge = (
//     adultDogs.reduce((acc, age) => (acc += age), 0) / adultDogs.length
//   ).toFixed(2);
//   console.log(avgAge);
// }

// calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
// calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// lecture 155
// nel caso di chaining di methods come strumento di debugging possiamo usare la possibilita' di vedere l'array di ingresso nei metodi map, filter e reduce

// const totalDepositsUsd = movements
//   .filter((mov) => mov > 0)
//   .map((mov, i, arr) => {
//     console.log(arr); //per eventuali errori faccio check array durante la chain
//     return mov * euroToUsd;
//   })
// .map((mov) => mov * euroToUsd)
//   .reduce((acc, mov) => (acc += mov), 0)
//   .toFixed(2);

// console.log(totalDepositsUsd);

// Coding Challenge #3
// Rewrite the 'calcAverageHumanAge' function from Challenge #2, but this time as an arrow function, and using chaining!
// Test data:
// § Data1:[5,2,4,1,15,8,3] § Data2:[16,6,10,5,6,1,4]

// const calcAverageHumanAge = (ages) => {
//   return ages
//     .map((age, i, arr) => (age > 2 ? 16 + age * 4 : age * 2))
//     .filter((age) => age >= 18)
//     .reduce((acc, age, i) => (acc = (acc + age) / (i + 1)), 0)
//     .toFixed(2);
// };

// console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
// console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));

// lecture 157
// similar to filter needs a boolean for the condition but doesn't return a new array, instead it returns the first element that satisfies the condition

// const firstWithdrawal = movements.find((mov) => mov < 0);
// console.log(movements, firstWithdrawal);

// lecture 161
// some method similar to includes but works with a logic condition

// const anyDep = movements.some((mov) => mov > 5000);
// console.log(anyDep);

// every method similar to some but every checks every element

// lecture 166
// const deposited = accounts
//   .map((account) => account.movements)
//   .flat()
//   .filter((transaction, i, array) => transaction > 0)
//   .reduce((acc, curr) => (acc += curr), 0);

// console.log(deposited);

// // const thousand = accounts
// //   .flatMap((account) => account.movements)
// //   .filter((transaction, i, array) => transaction >= 1000).length;

// const thousand = accounts
//   .flatMap((account) => account.movements)
//   .reduce((acc, curr) => {
//     curr >= 1000 ? acc++ : "";
//     return acc;
//   }, 0);
// console.log(thousand);

// const { deposits, withdrawals } = accounts
//   .flatMap((account) => account.movements)
//   .reduce(
//     (acc, cur) => {
//       cur > 0 ? (acc.deposits += cur) : (acc.withdrawals += cur);
//       return acc;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// function convertTitleCase(string) {
//   const exceptions = ["a", "an", "the", "but", "or", "in", "with"];
//   const capitalize = function (str) {
//     return (str = str[0].toUpperCase() + str.slice(1));
//   };

//   let retStr = string
//     .toLowerCase()
//     .split(" ")
//     .map((word) => {
//       if (!exceptions.includes(word)) {
//         return capitalize(word);
//       }
//       return word;
//     })
//     .join(" ");
//   return capitalize(retStr);
// }
// console.log(convertTitleCase(`this is a nice title`));
// console.log(convertTitleCase(`this is a LONG title but not too long`));
// console.log(convertTitleCase(`and here is another title with an EXAMPLE`));

// Coding Challenge #4
// Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
// Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
// Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).
// Your tasks:
// 1. Loopoverthe'dogs'arraycontainingdogobjects,andforeachdog,calculate the recommended food portion and add it to the object as a new property. Do not create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
// 2. FindSarah'sdogandlogtotheconsolewhetherit'seatingtoomuchortoo little. Hint: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
// 3. Createanarraycontainingallownersofdogswhoeattoomuch ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
// 4. Logastringtotheconsoleforeacharraycreatedin3.,likethis:"Matildaand Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
// 5. Logtotheconsolewhetherthereisanydogeatingexactlytheamountoffood that is recommended (just true or false)
// 6. Logtotheconsolewhetherthereisanydogeatinganokayamountoffood (just true or false)
// 7. Createanarraycontainingthedogsthatareeatinganokayamountoffood(try to reuse the condition used in 6.)
// 8. Createashallowcopyofthe'dogs'arrayandsortitbyrecommendedfood portion in an ascending order (keep in mind that the portions are inside the array's objects 😉)

// const dogs = [
//   { weight: 22, curFood: 250, owners: ["Alice", "Bob"] },
//   { weight: 8, curFood: 200, owners: ["Matilda"] },
//   { weight: 13, curFood: 275, owners: ["Sarah", "John"] },
//   { weight: 32, curFood: 340, owners: ["Michael"] },
// ];

// let ownersEatTooMuch = [];
// let ownersEatTooLittle = [];

// //1
// dogs.forEach((dog) => {
//   dog.recommendedFood = (dog.weight ** 0.75 * 28).toFixed(2);
//   //2
//   if (dog.owners.includes(`Sarah`)) {
//     console.log(
//       `Sarah's dog ${
//         dog.curFood > dog.recommendedFood * 1.1
//           ? `eats too much!`
//           : `doesn't eat too much`
//       }`
//     );
//   }
//   //3

//   if (dog.curFood > dog.recommendedFood * 1.1) {
//     ownersEatTooMuch.push(dog.owners);
//   } else if (dog.curFood < dog.recommendedFood * 0.9) {
//     ownersEatTooLittle.push(dog.owners);
//   }
// });

// //2 versione b

// const sarahsDog = dogs
//   .filter((dog) => dog.owners.includes(`Sarah`))
//   .map((el) => {
//     console.log(
//       `Sarah's dog ${
//         el.curFood > el.recommendedFood * 1.1
//           ? `eats too much!`
//           : `doesn't eat too much`
//       }`
//     );
//   });

// //3 versione b

// //filtering + map + flat

// //4
// function createString(arr, word) {
//   return arr.flat().join(" and ") + ` dogs eat too ${word}!`;
// }
// console.log(createString(ownersEatTooMuch, `much`));
// console.log(createString(ownersEatTooLittle, `little`));

// //5

// console.log(dogs.some((dog) => dog.curFood === dog.recommendedFood));

// //6

// console.log(
//   dogs.some(
//     (dog) =>
//       dog.curFood <= dog.recommendedFood * 1.1 &&
//       dog.curFood >= dog.recommendedFood * 0.9
//   )
// );

// // 7

// const eatingOkay = dogs.filter(
//   (dog) =>
//     dog.curFood <= dog.recommendedFood * 1.1 &&
//     dog.curFood >= dog.recommendedFood * 0.9
// );

// console.log(eatingOkay);

// // 8

// const dogsCopy = [...dogs].sort(
//   (a, b) => a.recommendedFood - b.recommendedFood
// );
// console.log(dogsCopy);

// posso convertire un numero con il + oppure parse (ma la stringa deve iniziare con un numero)

// console.log(+`23`);
// console.log(Number.parseInt(`300px`));

// operatore resto % resto di un'operazione di divisione
// console.log(5 % 2);
