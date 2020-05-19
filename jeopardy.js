// 18,414 categories - Math.floor(Math.random() * 18409) to get a random number between 0 and 18408
// the max number for offset you can have that will still get you 6 category results

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  const res = await axios.get('https://jservice.io/api/categories', { params: { count: 100, offset: Math.floor(Math.random() * 18315) } });
  const categoryIds = res.data.map(category => category.id);
  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get('https://jservice.io/api/category', { params: { id: catId } });
  const filteredClues = res.data.clues.filter(clue => clue.question); //Some clues have blank questions (''), so we have to filter out those empty questions
  let cluesArr = [];
  for (let clue of filteredClues) {
    cluesArr.push({ question: clue.question, answer: clue.answer, showing: null });
  }
  return { title: res.data.title, clues: cluesArr };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
  $('#header-row').empty();
  $('tbody').empty();
  $('tbody').on('click', 'td', handleClick);

  for (let category of categories) {
    $('#header-row').append(`<th>${category.title}</th>`);
  }

  for (let y = 0; y < 5; y++) {
    let $row = $('<tr>');

    for (let x = 0; x < 6; x++) {
      $row.append(`<td id="${x}-${y}">?</td>`); // put this when clicked on 1st time - ${categories[x].clues[y].question}, put this when clicked 2nd time - ${categories[x].clues[y].answer}
    }

    $('tbody').append($row);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  evt.stopImmediatePropagation(); //without this, the click event fires twice because it is nested inside tbody

  const x = evt.target.id[0];
  const y = evt.target.id[2];
  const cluesObj = categories[x].clues[y];

  if (!cluesObj.showing) {
    evt.target.innerHTML = cluesObj.question;
    cluesObj.showing = 'question';
  } else if (cluesObj.showing === 'question') {
    evt.target.innerHTML = cluesObj.answer;
    cluesObj.showing = 'answer';
  } else if (cluesObj.showing === 'answer') {
    return;
  }
}

// Shuffling the categories so we don't always have one right after the other

function shuffleAndReduceIds(idArr) {
  let i = idArr.length - 1;
  if (i === 0) {
    return;
  }
  while (i >= 0) {
    let j = Math.floor(Math.random() * i);
    let tempi = idArr[i];
    let tempj = idArr[j];
    idArr[i] = tempj;
    idArr[j] = tempi;
    i--;
  }
  return idArr.slice(0, 6);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  categories = [];
  const categoryIds = await getCategoryIds();
  const finalArray = shuffleAndReduceIds(categoryIds);
  for (let id of finalArray) {
    categories.push(await getCategory(id));
  }
  fillTable();
}

/** On click of restart button, restart game. */

// TODO
$('#restart').on('click', setupAndStart);

/** On page load, setup and start & add event handler for clicking clues */

// TODO
setupAndStart();